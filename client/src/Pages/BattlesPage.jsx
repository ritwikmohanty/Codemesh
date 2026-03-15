import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  IconPlus, 
  IconUsers, 
  IconClock, 
  IconTrophy,
  IconPlayerPlay,
  IconCheck,
  IconLink
} from '@tabler/icons-react';
import { getUserBattles } from '@/services/battleService';
import { toast } from 'sonner';

const BattlesPage = () => {
  const { isAuthenticated, user, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Refresh profile to ensure verifiedPlatforms are up-to-date
      if (refreshProfile) {
        refreshProfile();
      }
      fetchBattles();
    }
  }, [authLoading, isAuthenticated]);

  const fetchBattles = async () => {
    try {
      setLoading(true);
      const response = await getUserBattles();
      setBattles(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch battles');
      toast.error('Failed to load battles');
    } finally {
      setLoading(false);
    }
  };

  const ongoingBattles = battles.filter(b => b.status === 'in_progress');
  const upcomingBattles = battles.filter(b => b.status === 'pending');
  const completedBattles = battles.filter(b => b.status === 'completed');

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Upcoming</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const BattleCard = ({ battle }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/battle/${battle._id}`)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold truncate">{battle.title}</CardTitle>
          {getStatusBadge(battle.status)}
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          <IconClock className="h-4 w-4" />
          {formatDate(battle.startTime)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <IconUsers className="h-4 w-4 text-muted-foreground" />
            <span>{battle.participants?.length || 0} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <IconTrophy className="h-4 w-4 text-muted-foreground" />
            <span>{battle.numProblems} problems</span>
          </div>
          <div className="col-span-2 flex flex-wrap gap-1">
            {(battle.platforms || ['codeforces']).map(p => (
              <Badge 
                key={p} 
                variant="outline" 
                className={`text-xs ${p === 'leetcode' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20'}`}
              >
                {p === 'leetcode' ? 'LeetCode' : 'Codeforces'}
              </Badge>
            ))}
          </div>
          <div className="col-span-2 text-muted-foreground">
            {battle.durationMinutes} min
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <IconUsers className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No battles yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create a battle to compete with friends on Codeforces and LeetCode problems, or join an existing battle using a link.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate('/battles/create')}>
          <IconPlus className="h-4 w-4 mr-2" />
          Create Battle
        </Button>
        <Button variant="outline" onClick={() => navigate('/battles/join')}>
          <IconLink className="h-4 w-4 mr-2" />
          Join Battle
        </Button>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (authLoading) {
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 p-6">
          <LoadingSkeleton />
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
              <CardDescription>
                Please sign in to access the battle arena and compete with others.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppSidebar>
    );
  }

  return (
    <AppSidebar variant="inset">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Battle Arena</h1>
              <p className="text-muted-foreground mt-1">
                Compete with friends on Codeforces problems
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/battles/join')}>
                <IconLink className="h-4 w-4 mr-2" />
                Join Battle
              </Button>
              <Button onClick={() => navigate('/battles/create')}>
                <IconPlus className="h-4 w-4 mr-2" />
                Create Battle
              </Button>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="py-8 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={fetchBattles} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : battles.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              {/* Ongoing Battles */}
              {ongoingBattles.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <IconPlayerPlay className="h-5 w-5 text-green-500" />
                    <h2 className="text-xl font-semibold">Ongoing Battles</h2>
                    <Badge variant="secondary">{ongoingBattles.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ongoingBattles.map((battle) => (
                      <BattleCard key={battle._id} battle={battle} />
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Battles */}
              {upcomingBattles.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <IconClock className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-semibold">Upcoming Battles</h2>
                    <Badge variant="secondary">{upcomingBattles.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingBattles.map((battle) => (
                      <BattleCard key={battle._id} battle={battle} />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Battles */}
              {completedBattles.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <IconCheck className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold">Completed Battles</h2>
                    <Badge variant="secondary">{completedBattles.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedBattles.map((battle) => (
                      <BattleCard key={battle._id} battle={battle} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </AppSidebar>
  );
};

export default BattlesPage;
