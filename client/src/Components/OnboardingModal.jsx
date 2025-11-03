import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { IconUserFilled, IconSchool } from '@tabler/icons-react';

// Constants
const STEPS = [
  { id: 'personal', title: 'Personal', icon: IconUserFilled },
  { id: 'education', title: 'Education', icon: IconSchool }
];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
  'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

const DEGREES = [
  { value: 'high-school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'self-taught', label: 'Self-Taught' },
  { value: 'other', label: 'Other' }
];

const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Machine Learning',
  'Electrical Engineering',
  'Electronics and Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Statistics',
  'Business Administration',
  'Other'
];

export default function OnboardingModal({ isOpen, onClose, onComplete, userName }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: userName || '',
    username: '',
    country: '',
    
    // Step 2: Education
    degree: '',
    institution: '',
    branch: '',
    status: 'current',
    graduationYear: ''
  });

  useEffect(() => {
    if (userName) {
      setFormData(prev => ({ ...prev, fullName: userName }));
    }
  }, [userName]);

  // Username availability check with debounce
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setUsernameChecking(true);
      try {
        const response = await api.onboarding.checkUsername(formData.username);
        setUsernameAvailable(response.available);
      } catch (err) {
        console.error('Username check error:', err);
      } finally {
        setUsernameChecking(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = () => {
    const step = STEPS[currentStep];
    
    if (step.id === 'personal') {
      if (!formData.fullName.trim()) {
        setError('Full name is required');
        return false;
      }
      if (!formData.username.trim() || formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }
      if (usernameAvailable === false) {
        setError('Username is already taken');
        return false;
      }
      if (!formData.country) {
        setError('Country is required');
        return false;
      }
    }
    
    if (step.id === 'education') {
      if (!formData.degree) {
        setError('Degree is required');
        return false;
      }
      if (!formData.institution.trim()) {
        setError('Institution is required');
        return false;
      }
      
      // Check if branch is required for this degree
      const degreesRequiringBranch = ['bachelor', 'master', 'phd'];
      if (degreesRequiringBranch.includes(formData.degree) && !formData.branch) {
        setError('Branch is required for this degree');
        return false;
      }
      
      if (!formData.graduationYear) {
        setError('Graduation year is required');
        return false;
      }
      
      const year = parseInt(formData.graduationYear);
      const currentYear = new Date().getFullYear();
      if (year < 1950 || year > currentYear + 10) {
        setError('Please enter a valid graduation year');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        username: formData.username.toLowerCase().trim(),
        country: formData.country,
        degree: formData.degree,
        institution: formData.institution.trim(),
        branch: formData.branch || '',
        status: formData.status,
        graduationYear: parseInt(formData.graduationYear)
      };

      await api.onboarding.complete(submitData);
      onComplete();
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  // Check if branch field should be shown
  const showBranchField = ['bachelor', 'master', 'phd'].includes(formData.degree);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto p-6"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header - Center aligned */}
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl text-center font-semibold tracking-tight">Welcome to CodeMesh</DialogTitle>
          <DialogDescription className="text-sm text-center">
            A quick setup to personalize your experience.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps - Center aligned */}
        <div className="flex items-center justify-center gap-2 mt-2 mb-1 px-2">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={[
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                      isCompleted
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isActive
                        ? 'bg-background text-primary ring-2 ring-primary/30 shadow-md'
                        : 'bg-muted text-muted-foreground'
                    ].join(' ')}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon size={20} stroke={1.5} />}
                  </div>
                  <span
                    className={[
                      'text-xs font-semibold whitespace-nowrap',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    ].join(' ')}
                  >
                    {s.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={[
                      'w-8 h-0.5 rounded-full transition-colors duration-300',
                      index < currentStep ? 'bg-primary/70' : 'bg-muted'
                    ].join(' ')}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error Alert - Center aligned */}
        {error && (
          <Alert variant="destructive" className="mb-4 border-destructive/50">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription className="text-sm ml-2">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content - Center aligned form */}
        <div className="space-y-5">
          {step.id === 'personal' && (
            <>
              <div className="space-y-2.5">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="username" className="text-sm font-medium">Username *</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="johndoe"
                    disabled={loading}
                    className={[
                      'h-10 pr-10',
                      formData.username.length >= 3
                        ? usernameAvailable
                          ? 'border-green-500 focus-visible:ring-green-500/20'
                          : usernameAvailable === false
                          ? 'border-red-500 focus-visible:ring-red-500/20'
                          : ''
                        : ''
                    ].join(' ')}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameChecking && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!usernameChecking && formData.username.length >= 3 && usernameAvailable === true && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {!usernameChecking && formData.username.length >= 3 && usernameAvailable === false && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Only lowercase letters, numbers, and underscores allowed
                </p>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="country" className="text-sm font-medium">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step.id === 'education' && (
            <>
              <div className="space-y-2.5">
                <Label htmlFor="degree" className="text-sm font-medium">Degree *</Label>
                <Select value={formData.degree} onValueChange={(value) => handleInputChange('degree', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select your degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREES.map(degree => (
                      <SelectItem key={degree.value} value={degree.value}>
                        {degree.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="institution" className="text-sm font-medium">Institution *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  placeholder="University of Technology"
                  disabled={loading}
                  className="h-10"
                />
              </div>

              {showBranchField && (
                <div className="space-y-2.5">
                  <Label htmlFor="branch" className="text-sm font-medium">Branch/Major *</Label>
                  <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Currently Pursuing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="graduationYear" className="text-sm font-medium">Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  placeholder={new Date().getFullYear().toString()}
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  disabled={loading}
                  className="h-10"
                />
              </div>
            </>
          )}
        </div>

        {/* Navigation Buttons - Center aligned with proper spacing */}
        <div className="flex items-center justify-center gap-3 mt-8 pt-4 border-t border-border">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              className="min-w-[100px]"
            >
              Back
            </Button>
          )}
          
          {!isLastStep ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading || (formData.username.length >= 3 && usernameAvailable === false)}
              className="min-w-[100px]"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                'Complete'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
