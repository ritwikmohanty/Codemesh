import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconArrowLeft, IconLink } from '@tabler/icons-react';
import { joinBattle } from '@/services/battleService';
import { toast } from 'sonner';

const JoinBattlePage = () => {
  const { isAuthenticated, user, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinToken: urlToken } = useParams();
  
  const [joinToken, setJoinToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);

  // Check for verified Codeforces handle - define early for use in effects
  const hasCodeforcesHandle = user?.verifiedPlatforms?.some(
    p => p.platform === 'codeforces'
  );
  
  const codeforcesHandle = user?.verifiedPlatforms?.find(
    p => p.platform === 'codeforces'
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

  // Auto-join if token is present in URL and user is authenticated with verified CF handle
  useEffect(() => {
    // Only auto-join if we have a URL token (not manually entered)
    if (urlToken && isAuthenticated && !authLoading && hasCodeforcesHandle && !autoJoinAttempted && !isSubmitting) {
      setAutoJoinAttempted(true);
      handleAutoJoin(urlToken);
    }
  }, [urlToken, isAuthenticated, authLoading, hasCodeforcesHandle, autoJoinAttempted, isSubmitting]);

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

  // Show loading state during auto-join
  if (urlToken && isSubmitting) {
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse text-muted-foreground mb-2">Joining battle...</div>
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

  if (!hasCodeforcesHandle) {
    return (
      <AppSidebar variant="inset">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle>Verified Codeforces Account Required</CardTitle>
              <CardDescription>
                You need to link and verify your Codeforces account before joining a battle.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 items-center">
              <Button onClick={() => navigate('/settings')}>
                Go to Settings to Verify
              </Button>
              <Button variant="ghost" onClick={() => navigate('/battles')}>
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Battles
              </Button>
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
