import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IconArrowLeft, IconLink, IconCode, IconBrandLeetcode, IconAlertCircle } from '@tabler/icons-react';
import { joinBattle, getBattleByJoinToken } from '@/services/battleService';
import { toast } from 'sonner';

const JoinBattlePage = () => {
  const { isAuthenticated, user, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinToken: urlToken } = useParams();
  
  const [joinToken, setJoinToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingBattle, setIsCheckingBattle] = useState(false);
  const [error, setError] = useState('');
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  const [battleInfo, setBattleInfo] = useState(null);
  const [missingPlatforms, setMissingPlatforms] = useState([]);

  // Check for verified handles
  const hasCodeforcesHandle = user?.verifiedPlatforms?.some(
    p => p.platform === 'codeforces'
  );
  
  const hasLeetcodeHandle = user?.verifiedPlatforms?.some(
    p => p.platform === 'leetcode'
  );
  
  const codeforcesHandle = user?.verifiedPlatforms?.find(
    p => p.platform === 'codeforces'
  )?.handle;
  
  const leetcodeHandle = user?.verifiedPlatforms?.find(
    p => p.platform === 'leetcode'
  )?.handle;

  // Refresh profile to ensure verifiedPlatforms are up-to-date
  useEffect(() => {
    if (isAuthenticated && !authLoading && refreshProfile) {
      refreshProfile();
    }
  }, [isAuthenticated, authLoading]);

  // Check for token in URL params or path - set immediately
  useEffect(() => {
    const tokenFromQuery = searchParams.get('token');
    if (urlToken) {
      setJoinToken(urlToken);
    } else if (tokenFromQuery) {
      setJoinToken(tokenFromQuery);
    }
  }, [searchParams, urlToken]);

  // Check battle platforms when token is available
  useEffect(() => {
    if (urlToken && isAuthenticated && !authLoading && !isCheckingBattle && !battleInfo) {
      checkBattlePlatforms(urlToken);
    }
  }, [urlToken, isAuthenticated, authLoading, battleInfo]);

  const checkBattlePlatforms = async (token) => {
    setIsCheckingBattle(true);
    try {
      const response = await getBattleByJoinToken(token);
      setBattleInfo(response.data);
      
      const platforms = response.data.platforms || ['codeforces'];
      const missing = [];
      
      if (platforms.includes('codeforces') && !hasCodeforcesHandle) {
        missing.push('codeforces');
      }
      if (platforms.includes('leetcode') && !hasLeetcodeHandle) {
        missing.push('leetcode');
      }
      
      setMissingPlatforms(missing);
      
      // If no missing platforms, auto-join
      if (missing.length === 0 && !autoJoinAttempted) {
        setAutoJoinAttempted(true);
        handleAutoJoin(token);
      }
    } catch (err) {
      console.error('Error checking battle:', err);
      setError(err.response?.data?.message || 'Failed to get battle info');
    } finally {
      setIsCheckingBattle(false);
    }
  };

  const handleAutoJoin = async (token) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await joinBattle(token);
      if (response.data.alreadyJoined) {
        toast.info('You are already in this battle');
      } else {
        toast.success('Successfully joined the battle!');
      }
      navigate(`/battle/${response.data.battleId}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to join battle';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!joinToken.trim()) {
      setError('Please enter a join token');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // First check battle info if not already checked
      if (!battleInfo) {
        const infoResponse = await getBattleByJoinToken(joinToken.trim());
        const platforms = infoResponse.data.platforms || ['codeforces'];
        const missing = [];
        
        if (platforms.includes('codeforces') && !hasCodeforcesHandle) {
          missing.push('Codeforces');
        }
        if (platforms.includes('leetcode') && !hasLeetcodeHandle) {
          missing.push('LeetCode');
        }
        
        if (missing.length > 0) {
          setError(`This battle requires ${missing.join(' and ')} verification. Please verify your ${missing.join(' and ')} account${missing.length > 1 ? 's' : ''} in Settings.`);
          setIsSubmitting(false);
          return;
        }
      }
      
      const response = await joinBattle(joinToken.trim());
      if (response.data.alreadyJoined) {
        toast.info('You are already in this battle');
      } else {
        toast.success('Successfully joined the battle!');
      }
      navigate(`/battle/${response.data.battleId}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to join battle';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleJoin();
  };
  
  // Check if user has any verified platform
  const hasAnyVerifiedPlatform = hasCodeforcesHandle || hasLeetcodeHandle;

  // Show loading state during checking or auto-join
  if ((urlToken && isCheckingBattle) || (urlToken && isSubmitting && !error)) {
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-muted-foreground mb-2">
              {isCheckingBattle ? 'Checking battle requirements...' : 'Joining battle...'}
            </div>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </div>
        </div>
      </AppSidebar>
    );
  }

  if (authLoading) {
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
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
                Please sign in to join a battle.
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

  // Show missing platforms error for URL token
  if (urlToken && missingPlatforms.length > 0) {
    const platformNames = missingPlatforms.map(p => p === 'codeforces' ? 'Codeforces' : 'LeetCode');
    
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-amber-500/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <IconAlertCircle className="h-12 w-12 text-amber-500" />
              </div>
              <CardTitle>Platform Verification Required</CardTitle>
              <CardDescription className="mt-2">
                This battle requires {platformNames.join(' and ')} verification. 
                Please link and verify your {platformNames.join(' and ')} account{platformNames.length > 1 ? 's' : ''} before joining.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {battleInfo && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium">{battleInfo.title}</p>
                  <div className="flex gap-2 mt-2">
                    {battleInfo.platforms?.map(p => (
                      <Badge 
                        key={p} 
                        variant="outline"
                        className={missingPlatforms.includes(p) ? 'border-amber-500 text-amber-600' : ''}
                      >
                        {p === 'codeforces' && <IconCode className="h-3 w-3 mr-1" />}
                        {p === 'leetcode' && <IconBrandLeetcode className="h-3 w-3 mr-1" />}
                        {p === 'leetcode' ? 'LeetCode' : 'Codeforces'}
                        {missingPlatforms.includes(p) && ' (Not verified)'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {missingPlatforms.includes('leetcode') && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">LeetCode Extension Required</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    This battle includes LeetCode problems. You'll need to sync your LeetCode submissions using the CP Focus extension before joining.
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-3 items-center pt-4">
                <Button onClick={() => navigate('/settings')} className="w-full">
                  Go to Settings to Verify
                </Button>
                <Button variant="ghost" onClick={() => navigate('/battles')}>
                  <IconArrowLeft className="h-4 w-4 mr-2" />
                  Back to Battles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppSidebar>
    );
  }

  return (
    <AppSidebar variant="inset">
      <div className="flex-1 flex items-center justify-center overflow-auto p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/battles')}
              className="mb-4"
            >
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Battles
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Join Battle</h1>
            <p className="text-muted-foreground mt-1">
              Enter the invite code to join a battle
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconLink className="h-5 w-5" />
                Enter Join Code
              </CardTitle>
              <CardDescription>
                Paste the battle invite code shared by the battle creator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinToken">Join Code</Label>
                  <Input
                    id="joinToken"
                    placeholder="e.g., abc123xyz456"
                    value={joinToken}
                    onChange={(e) => {
                      setJoinToken(e.target.value);
                      setError('');
                    }}
                    className={error ? 'border-destructive' : ''}
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !joinToken.trim()}
                >
                  {isSubmitting ? 'Joining...' : 'Join Battle'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">How to get a join code?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ask the battle creator to share the invite link or code</li>
                <li>• The code is shown on the battle page after creation</li>
                <li>• You can also join via the share link directly</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebar>
  );
};

export default JoinBattlePage;
