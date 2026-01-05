import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconArrowLeft, IconSwords } from '@tabler/icons-react';
import { createBattle } from '@/services/battleService';
import { toast } from 'sonner';

const CreateBattlePage = () => {
  const { isAuthenticated, user, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    startTime: getDefaultStartTime(),
    durationMinutes: 60,
    minRating: 800,
    maxRating: 1400,
    numProblems: 3,
  });

  const [errors, setErrors] = useState({});

  // Refresh profile to ensure verifiedPlatforms are up-to-date
  useEffect(() => {
    if (isAuthenticated && !authLoading && refreshProfile) {
      refreshProfile();
    }
  }, [isAuthenticated, authLoading]);

  function getDefaultStartTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    const startTime = new Date(formData.startTime);
    if (startTime <= new Date()) {
      newErrors.startTime = 'Start time must be in the future';
    }
    
    if (formData.durationMinutes < 10 || formData.durationMinutes > 300) {
      newErrors.durationMinutes = 'Duration must be between 10 and 300 minutes';
    }
    
    if (formData.minRating < 800 || formData.minRating > 3500) {
      newErrors.minRating = 'Min rating must be between 800 and 3500';
    }
    
    if (formData.maxRating < 800 || formData.maxRating > 3500) {
      newErrors.maxRating = 'Max rating must be between 800 and 3500';
    }
    
    if (formData.minRating > formData.maxRating) {
      newErrors.maxRating = 'Max rating must be greater than min rating';
    }
    
    if (formData.numProblems < 1 || formData.numProblems > 10) {
      newErrors.numProblems = 'Number of problems must be between 1 and 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await createBattle({
        title: formData.title.trim(),
        startTime: new Date(formData.startTime).toISOString(),
        durationMinutes: parseInt(formData.durationMinutes),
        minRating: parseInt(formData.minRating),
        maxRating: parseInt(formData.maxRating),
        numProblems: parseInt(formData.numProblems),
      });
      
      toast.success('Battle created successfully!');
      navigate(`/battle/${response.data.battleId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create battle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Check for verified Codeforces handle
  const hasCodeforcesHandle = user?.verifiedPlatforms?.some(
    p => p.platform === 'codeforces'
  );
  
  const codeforcesHandle = user?.verifiedPlatforms?.find(
    p => p.platform === 'codeforces'
  )?.handle;

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
                Please sign in to create a battle.
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
                You need to link and verify your Codeforces account before creating a battle.
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
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/battles')}
              className="mb-4"
            >
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Battles
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Create Battle</h1>
            <p className="text-muted-foreground mt-1">
              Set up a new competitive programming battle
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSwords className="h-5 w-5" />
                Battle Configuration
              </CardTitle>
              <CardDescription>
                Configure the settings for your battle. Problems will be randomly selected from Codeforces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Battle Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Friday Night Battle"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Start Time & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className={errors.startTime ? 'border-destructive' : ''}
                    />
                    {errors.startTime && (
                      <p className="text-sm text-destructive">{errors.startTime}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                    <Select
                      value={formData.durationMinutes.toString()}
                      onValueChange={(value) => handleChange('durationMinutes', parseInt(value))}
                    >
                      <SelectTrigger className={errors.durationMinutes ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.durationMinutes && (
                      <p className="text-sm text-destructive">{errors.durationMinutes}</p>
                    )}
                  </div>
                </div>

                {/* Rating Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minRating">Minimum Rating</Label>
                    <Select
                      value={formData.minRating.toString()}
                      onValueChange={(value) => handleChange('minRating', parseInt(value))}
                    >
                      <SelectTrigger className={errors.minRating ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select min rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {[800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.minRating && (
                      <p className="text-sm text-destructive">{errors.minRating}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxRating">Maximum Rating</Label>
                    <Select
                      value={formData.maxRating.toString()}
                      onValueChange={(value) => handleChange('maxRating', parseInt(value))}
                    >
                      <SelectTrigger className={errors.maxRating ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select max rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>{rating}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.maxRating && (
                      <p className="text-sm text-destructive">{errors.maxRating}</p>
                    )}
                  </div>
                </div>

                {/* Number of Problems */}
                <div className="space-y-2">
                  <Label htmlFor="numProblems">Number of Problems</Label>
                  <Select
                    value={formData.numProblems.toString()}
                    onValueChange={(value) => handleChange('numProblems', parseInt(value))}
                  >
                    <SelectTrigger className={errors.numProblems ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select number of problems" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} problem{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.numProblems && (
                    <p className="text-sm text-destructive">{errors.numProblems}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Battle...' : 'Create Battle'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppSidebar>
  );
};

export default CreateBattlePage;
