import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  IconArrowLeft, 
  IconClock, 
  IconUsers,
  IconTrophy,
  IconCopy,
  IconCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconExternalLink,
  IconX,
  IconLink
} from '@tabler/icons-react';
import { 
  getBattle, 
  getBattleParticipants,
  getBattleProblems,
  getBattleStandings,
  startBattle,
  endBattle,
  cancelBattle,
  refreshSubmissions
} from '@/services/battleService';
import { toast } from 'sonner';

const BattlePage = () => {
  const { battleId } = useParams();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [battle, setBattle] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [problems, setProblems] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Action states
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  
  // Countdown state
  const [timeRemaining, setTimeRemaining] = useState(null);

  const fetchBattleData = useCallback(async () => {
    try {
      setLoading(true);
      const battleResponse = await getBattle(battleId);
      setBattle(battleResponse.data);
      
      // Fetch participants
      const participantsResponse = await getBattleParticipants(battleId);
      setParticipants(participantsResponse.data || []);
      
      // Fetch problems and standings if battle has started
      if (battleResponse.data.status !== 'pending') {
        try {
          const problemsResponse = await getBattleProblems(battleId);
          setProblems(problemsResponse.data || []);
        } catch (e) {
          console.error('Failed to fetch problems:', e);
        }
        
        try {
          const standingsResponse = await getBattleStandings(battleId);
          setStandings(standingsResponse.data || []);
        } catch (e) {
          console.error('Failed to fetch standings:', e);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch battle');
      toast.error('Failed to load battle');
    } finally {
      setLoading(false);
    }
  }, [battleId]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBattleData();
    }
  }, [authLoading, isAuthenticated, fetchBattleData]);

  // Update countdown timer
  useEffect(() => {
    if (!battle) return;
    
    const updateTimer = () => {
      const now = new Date();
      const startTime = new Date(battle.startTime);
      const endTime = new Date(startTime.getTime() + battle.durationMinutes * 60 * 1000);
      
      if (battle.status === 'pending') {
        const diff = startTime - now;
        if (diff <= 0) {
          fetchBattleData(); // Refresh when battle should start
        } else {
          setTimeRemaining(diff);
        }
      } else if (battle.status === 'in_progress') {
        const diff = endTime - now;
        if (diff <= 0) {
          fetchBattleData(); // Refresh when battle should end
        } else {
          setTimeRemaining(diff);
        }
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [battle, fetchBattleData]);

  // Refresh cooldown timer
  useEffect(() => {
    if (refreshCooldown > 0) {
      const timer = setTimeout(() => setRefreshCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshCooldown]);

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00:00';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const copyJoinLink = async () => {
    const link = `${window.location.origin}/battles/join/${battle.joinToken}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startBattle(battleId);
      toast.success('Battle started!');
      fetchBattleData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start battle');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEnd = async () => {
    setIsEnding(true);
    try {
      await endBattle(battleId);
      toast.success('Battle ended!');
      fetchBattleData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end battle');
    } finally {
      setIsEnding(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelBattle(battleId);
      toast.success('Battle cancelled');
      navigate('/battles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel battle');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubmissions(battleId);
      await fetchBattleData();
      toast.success('Submissions refreshed!');
      setRefreshCooldown(10);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to refresh submissions');
    } finally {
      setIsRefreshing(false);
    }
  };

  const isCreator = battle?.createdBy?._id === user?._id;

  if (authLoading || loading) {
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </AppSidebar>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle>Sign in Required</CardTitle>
              <CardDescription>Please sign in to view this battle.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/')}>Go to Home</Button>
            </CardContent>
          </Card>
        </div>
      </AppSidebar>
    );
  }

  if (error) {
    return (
      <AppSidebar  variant="inset">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader className="text-center">
              <CardTitle>Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/battles')}>
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Battles
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppSidebar>
    );
  }

  if (!battle) {
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle>Battle Not Found</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/battles')}>
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Battles
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppSidebar>
    );
  }

  const getStatusBadge = () => {
    switch (battle.status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Upcoming</Badge>;
      case 'in_progress':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Completed</Badge>;
      default:
        return <Badge variant="outline">{battle.status}</Badge>;
    }
  };

  return (
    <AppSidebar variant="inset">
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/battles')}
              className="mb-4"
            >
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Battles
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{battle.title}</h1>
                  {getStatusBadge()}
                </div>
                <p className="text-muted-foreground mt-1">
                  Created by {battle.createdBy?.username || 'Unknown'}
                </p>
              </div>
              
              {/* Timer */}
              {battle.status !== 'completed' && timeRemaining !== null && (
                <Card className="px-6 py-3 bg-muted/50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {battle.status === 'pending' ? 'Starts In' : 'Time Remaining'}
                    </p>
                    <p className="text-2xl font-mono font-bold">{formatTime(timeRemaining)}</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Battle Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <IconClock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{battle.durationMinutes} min</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <IconTrophy className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Problems</p>
                <p className="font-semibold">{battle.numProblems}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <IconUsers className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="font-semibold">{participants.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Rating Range</p>
                <p className="font-semibold">{battle.minRating} - {battle.maxRating}</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {battle.status === 'pending' && (
              <Button onClick={copyJoinLink} variant="outline">
                {copied ? <IconCheck className="h-4 w-4 mr-2" /> : <IconCopy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Invite Link'}
              </Button>
            )}
            
            {isCreator && battle.status === 'pending' && (
              <>
                <Button onClick={handleStart} disabled={isStarting}>
                  <IconPlayerPlay className="h-4 w-4 mr-2" />
                  {isStarting ? 'Starting...' : 'Start Now'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isCancelling}>
                      <IconX className="h-4 w-4 mr-2" />
                      Cancel Battle
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Battle?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The battle will be cancelled and all participants will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Battle</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancel}>
                        Cancel Battle
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            
            {battle.status === 'in_progress' && (
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={isRefreshing || refreshCooldown > 0}
              >
                <IconRefresh className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {refreshCooldown > 0 ? `Wait ${refreshCooldown}s` : 'Refresh Submissions'}
              </Button>
            )}
            
            {isCreator && battle.status === 'in_progress' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" disabled={isEnding}>
                    <IconPlayerStop className="h-4 w-4 mr-2" />
                    End Battle
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>End Battle?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will end the battle immediately. Final standings will be calculated.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Battle</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEnd}>
                      End Battle
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Invite Code Section (for pending battles) */}
          {battle.status === 'pending' && (
            <Card className="mb-8 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconLink className="h-5 w-5" />
                  Invite Friends
                </CardTitle>
                <CardDescription>Share this code or link to invite others to join</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Join Code</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-muted px-4 py-2 rounded-md font-mono text-lg tracking-wider">
                        {battle.joinToken}
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          await navigator.clipboard.writeText(battle.joinToken);
                          toast.success('Join code copied!');
                        }}
                      >
                        <IconCopy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Invite Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-muted px-4 py-2 rounded-md text-sm truncate">
                        {`${window.location.origin}/battles/join/${battle.joinToken}`}
                      </code>
                      <Button onClick={copyJoinLink} variant="outline" size="sm">
                        {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participants (for pending battles) */}
          {battle.status === 'pending' && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>Players who have joined this battle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {participants.map((p) => (
                    <Badge key={p.user?._id || p._id} variant="secondary" className="px-3 py-1">
                      {p.user?.username || p.codeforcesHandle}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Problems (for started battles) */}
          {battle.status !== 'pending' && problems.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Problems</CardTitle>
                <CardDescription>Solve these problems on Codeforces</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Problem</TableHead>
                      <TableHead className="w-24">Rating</TableHead>
                      <TableHead className="w-24">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems.map((problem, index) => (
                      <TableRow key={`${problem.contestId}${problem.index}`}>
                        <TableCell className="font-medium">{String.fromCharCode(65 + index)}</TableCell>
                        <TableCell>{problem.name || `${problem.contestId}${problem.index}`}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{problem.rating}</Badge>
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            Solve <IconExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Standings (for started battles) */}
          {battle.status !== 'pending' && standings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Standings</CardTitle>
                <CardDescription>
                  {battle.status === 'in_progress' ? 'Live standings' : 'Final standings'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead className="w-24 text-center">Solved</TableHead>
                      <TableHead className="w-24 text-center">Penalty</TableHead>
                      {problems.map((_, index) => (
                        <TableHead key={index} className="w-20 text-center">
                          {String.fromCharCode(65 + index)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((entry, rank) => (
                      <TableRow key={entry.user?._id || rank}>
                        <TableCell className="font-bold">
                          {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : rank + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{entry.user?.username || entry.codeforcesHandle}</span>
                            <span className="text-xs text-muted-foreground">({entry.codeforcesHandle})</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{entry.solved}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{entry.penalty}</TableCell>
                        {problems.map((problem) => {
                          const key = `${problem.contestId}${problem.index}`;
                          const data = entry.problemData?.[key];
                          return (
                            <TableCell key={key} className="text-center">
                              {data?.solved ? (
                                <span className="text-green-600 font-medium">
                                  +{data.wrongSubmissions > 0 ? data.wrongSubmissions : ''}
                                </span>
                              ) : data?.wrongSubmissions > 0 ? (
                                <span className="text-red-500">-{data.wrongSubmissions}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppSidebar>
  );
};

export default BattlePage;
