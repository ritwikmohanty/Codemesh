import React, { useState, useEffect } from 'react';
import { AppSidebar } from '../components/sidebar/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { 
  User, 
  Share2, 
  Link as LinkIcon, 
  Lock, 
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Edit2,
  X,
  Check,
  ShieldCheck,
  ExternalLink,
  Copy
} from 'lucide-react';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatarUrl: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Socials state
  const [socialsData, setSocialsData] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    website: ''
  });
  const [socialsLoading, setSocialsLoading] = useState(false);
  const [socialsMessage, setSocialsMessage] = useState({ type: '', text: '' });

  // Linked platforms state
  const [linkedPlatforms, setLinkedPlatforms] = useState([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);

  // Extract username from full URL for display
  const extractUsername = (url, prefix) => {
    if (!url) return '';
    if (url.startsWith(prefix)) {
      return url.slice(prefix.length);
    }
    // If it's just a username without the prefix
    if (!url.includes('http')) {
      return url;
    }
    return url;
  };

  // Social prefixes
  const socialPrefixes = {
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    twitter: 'https://twitter.com/',
    website: ''
  };

  // Platform sync state
  const [platformData, setPlatformData] = useState({
    platform: '',
    handle: ''
  });
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformMessage, setPlatformMessage] = useState({ type: '', text: '' });
  const [isEditingPlatform, setIsEditingPlatform] = useState(null);
  const [editHandle, setEditHandle] = useState('');

  // Verification state
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    platform: '',
    handle: '',
    code: '',
    instructions: null,
    isVerified: false
  });
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
      // Extract usernames from full URLs
      setSocialsData({
        github: extractUsername(user.socials?.github || '', socialPrefixes.github),
        linkedin: extractUsername(user.socials?.linkedin || '', socialPrefixes.linkedin),
        twitter: extractUsername(user.socials?.twitter || '', socialPrefixes.twitter),
        website: user.socials?.website || ''
      });
    }
  }, [user]);

  // Fetch linked platforms
  useEffect(() => {
    const fetchLinkedPlatforms = async () => {
      setPlatformsLoading(true);
      try {
        const response = await api.users.getLinkedPlatforms();
        if (response.success) {
          setLinkedPlatforms(response.data);
        }
      } catch (error) {
        console.error('Error fetching linked platforms:', error);
      } finally {
        setPlatformsLoading(false);
      }
    };

    if (user) {
      fetchLinkedPlatforms();
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const response = await api.users.updateProfile(profileData);
      if (response.success) {
        updateUser(response.user);
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle socials update
  const handleSocialsUpdate = async (e) => {
    e.preventDefault();
    setSocialsLoading(true);
    setSocialsMessage({ type: '', text: '' });

    try {
      // Build full URLs from usernames
      const fullSocials = {
        github: socialsData.github ? socialPrefixes.github + socialsData.github : '',
        linkedin: socialsData.linkedin ? socialPrefixes.linkedin + socialsData.linkedin : '',
        twitter: socialsData.twitter ? socialPrefixes.twitter + socialsData.twitter : '',
        website: socialsData.website
      };

      const response = await api.users.updateSocials(fullSocials);
      if (response.success) {
        updateUser(response.user);
        setSocialsMessage({ type: 'success', text: 'Social links updated successfully!' });
        setTimeout(() => setSocialsMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setSocialsMessage({ type: 'error', text: error.message || 'Failed to update social links' });
    } finally {
      setSocialsLoading(false);
    }
  };

    // Handle platform sync
  const handlePlatformSync = async (e) => {
    e.preventDefault();
    setPlatformLoading(true);
    setPlatformMessage({ type: '', text: '' });

    if (!platformData.platform || !platformData.handle) {
      setPlatformMessage({ type: 'error', text: 'Please select a platform and enter your handle' });
      setPlatformLoading(false);
      return;
    }

    try {
      const response = await api.platform.sync(platformData);
      if (response.success) {
        setPlatformMessage({ type: 'success', text: `Successfully synced ${platformData.platform}!` });
        setPlatformData({ platform: '', handle: '' });
        
        // Refresh linked platforms
        const platformsResponse = await api.users.getLinkedPlatforms();
        if (platformsResponse.success) {
          setLinkedPlatforms(platformsResponse.data);
        }
        
        setTimeout(() => setPlatformMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setPlatformMessage({ type: 'error', text: error.message || 'Failed to sync platform' });
    } finally {
      setPlatformLoading(false);
    }
  };

  // Handle platform edit
  const handleEditPlatform = (platform, handle) => {
    setIsEditingPlatform(platform);
    setEditHandle(handle);
  };

  // Handle save edited platform
  const handleSaveEditedPlatform = async (platform) => {
    if (!editHandle.trim()) {
      setPlatformMessage({ type: 'error', text: 'Handle cannot be empty' });
      return;
    }

    setPlatformLoading(true);
    setPlatformMessage({ type: '', text: '' });

    try {
      const response = await api.platform.sync({ platform, handle: editHandle });
      if (response.success) {
        setPlatformMessage({ type: 'success', text: `Successfully updated ${platform} handle!` });
        
        // Refresh linked platforms
        const platformsResponse = await api.users.getLinkedPlatforms();
        if (platformsResponse.success) {
          setLinkedPlatforms(platformsResponse.data);
        }
        
        setIsEditingPlatform(null);
        setEditHandle('');
        setTimeout(() => setPlatformMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setPlatformMessage({ type: 'error', text: error.message || 'Failed to update platform handle' });
    } finally {
      setPlatformLoading(false);
    }
  };

  // Add dark mode detection state and effect
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  // Get synced platforms - now from state
  const getSyncedPlatforms = () => {
    return linkedPlatforms;
  };

  // Handle opening verification modal
  const handleOpenVerification = async (platform, handle, isVerified) => {
    // If already verified, just show status
    if (isVerified) {
      setVerificationModal({
        isOpen: true,
        platform,
        handle,
        code: '',
        instructions: null,
        isVerified: true
      });
      return;
    }

    // Generate verification code
    setVerificationLoading(true);
    try {
      const response = await api.platform.generateVerificationCode(platform);
      if (response.success) {
        setVerificationModal({
          isOpen: true,
          platform: response.data.platform,
          handle: response.data.handle,
          code: response.data.verificationCode,
          instructions: response.data.instructions,
          isVerified: false
        });
      }
    } catch (error) {
      setPlatformMessage({ type: 'error', text: error.message || 'Failed to generate verification code' });
    } finally {
      setVerificationLoading(false);
    }
  };

  // Handle verifying platform
  const handleVerifyPlatform = async () => {
    setVerificationLoading(true);
    try {
      const response = await api.platform.verify(verificationModal.platform);
      if (response.success) {
        setVerificationModal(prev => ({ ...prev, isVerified: true }));
        setPlatformMessage({ type: 'success', text: `Successfully verified ${verificationModal.platform} account!` });
        
        // Update linkedPlatforms to reflect verification
        setLinkedPlatforms(prev => prev.map(p => 
          p.platform === verificationModal.platform 
            ? { ...p, isVerified: true, verifiedAt: new Date() }
            : p
        ));
        
        setTimeout(() => setPlatformMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setPlatformMessage({ type: 'error', text: error.message || 'Verification failed. Please make sure you added the code to your profile.' });
    } finally {
      setVerificationLoading(false);
    }
  };

  // Copy verification code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationModal.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Close verification modal
  const handleCloseVerificationModal = () => {
    setVerificationModal({
      isOpen: false,
      platform: '',
      handle: '',
      code: '',
      instructions: null,
      isVerified: false
    });
    setCodeCopied(false);
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await api.users.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const MessageDisplay = ({ message }) => {
    if (!message.text) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-2 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}
      >
        {message.type === 'success' ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">{message.text}</span>
      </motion.div>
    );
  };

  return (
  <AppSidebar variant="inset">

        <div className="flex-1 overflow-y-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container max-w-5xl mx-auto p-6 space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="socials" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Socials</span>
                </TabsTrigger>
                <TabsTrigger value="platforms" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Platforms</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile information and how others see you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <MessageDisplay message={profileMessage} />
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          maxLength={50}
                        />
                        <p className="text-xs text-muted-foreground">
                          {profileData.name.length}/50 characters
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-muted-foreground">Username</Label>
                          <div className="relative">
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                              <span className="font-medium">{user?.username || '—'}</span>
                            </div>
                            <div className="absolute right-3 top-2.5">
                              <Badge variant="outline" className="text-xs font-normal">
                                Fixed
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                          <div className="relative">
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                              <span className="font-medium truncate">{user?.email || '—'}</span>
                            </div>
                            <div className="absolute right-3 top-2.5">
                              <Badge variant="outline" className="text-xs font-normal">
                                Fixed
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          maxLength={500}
                          rows={4}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {profileData.bio.length}/500 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Avatar URL</Label>
                        <Input
                          id="avatarUrl"
                          placeholder="https://example.com/avatar.jpg"
                          value={profileData.avatarUrl}
                          onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter a URL to your profile picture
                        </p>
                      </div>

                      <Button type="submit" disabled={profileLoading} className="w-full sm:w-auto">
                        {profileLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Socials Tab */}
              <TabsContent value="socials" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>
                      Connect your social media profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSocialsUpdate} className="space-y-6">
                      <MessageDisplay message={socialsMessage} />
                      
                      <div className="space-y-2">
                        <Label htmlFor="github" className="flex items-center gap-2">
                          <Github className="h-4 w-4" />
                          GitHub
                        </Label>
                        <div className="flex items-center rounded-md border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                          <span className="flex items-center px-3 py-2 bg-muted text-muted-foreground text-sm border-r select-none">
                            https://github.com/
                          </span>
                          <input
                            id="github"
                            type="text"
                            placeholder="username"
                            value={socialsData.github}
                            onChange={(e) => setSocialsData({ ...socialsData, github: e.target.value })}
                            className="flex-1 px-3 py-2 text-sm bg-background outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </Label>
                        <div className="flex items-center rounded-md border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                          <span className="flex items-center px-3 py-2 bg-muted text-muted-foreground text-sm border-r select-none">
                            https://linkedin.com/in/
                          </span>
                          <input
                            id="linkedin"
                            type="text"
                            placeholder="username"
                            value={socialsData.linkedin}
                            onChange={(e) => setSocialsData({ ...socialsData, linkedin: e.target.value })}
                            className="flex-1 px-3 py-2 text-sm bg-background outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </Label>
                        <div className="flex items-center rounded-md border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                          <span className="flex items-center px-3 py-2 bg-muted text-muted-foreground text-sm border-r select-none">
                            https://twitter.com/
                          </span>
                          <input
                            id="twitter"
                            type="text"
                            placeholder="username"
                            value={socialsData.twitter}
                            onChange={(e) => setSocialsData({ ...socialsData, twitter: e.target.value })}
                            className="flex-1 px-3 py-2 text-sm bg-background outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Website
                        </Label>
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={socialsData.website}
                          onChange={(e) => setSocialsData({ ...socialsData, website: e.target.value })}
                        />
                      </div>

                      <Button type="submit" disabled={socialsLoading} className="w-full sm:w-auto">
                        {socialsLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Social Links
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Platforms Tab */}
              <TabsContent value="platforms" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Connected Platforms</CardTitle>
                    <CardDescription>
                      View and manage your synced coding platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <MessageDisplay message={platformMessage} />
                    
                    {platformsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : getSyncedPlatforms().length > 0 ? (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Your Platforms</Label>
                        <div className="space-y-2">
                          {getSyncedPlatforms().map(({ platform, handle, rating, maxRating, totalSolved, lastSynced, isVerified }) => (
                            <motion.div
                              key={platform}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <img
                                  src={`/small_logos/${platform}${isDark ? '_dark' : ''}.png`}
                                  alt={platform}
                                  className="w-12 h-12 rounded-lg object-contain"
                                  onError={(e) => {
                                    // Fallback to text if image fails to load
                                    e.target.style.display = 'none';
                                    const fallbackDiv = document.createElement('div');
                                    fallbackDiv.className = `w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300`;
                                    fallbackDiv.textContent = platform.slice(0, 2).toUpperCase();
                                    e.target.parentNode.appendChild(fallbackDiv);
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="capitalize">
                                      {platform}
                                    </Badge>
                                    {isVerified ? (
                                      <IconRosetteDiscountCheckFilled className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" title="Verified" />
                                    ) : (
                                      <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                                        Unverified
                                      </Badge>
                                    )}
                                  </div>
                                  {isEditingPlatform === platform ? (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Input
                                        value={editHandle}
                                        onChange={(e) => setEditHandle(e.target.value)}
                                        placeholder="Enter handle"
                                        className="h-8 text-sm"
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSaveEditedPlatform(platform)}
                                        disabled={platformLoading}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Check className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setIsEditingPlatform(null);
                                          setEditHandle('');
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <X className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm font-medium truncate">{handle}</p>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        {rating > 0 && (
                                          <span>Rating: {rating} {maxRating > 0 && `(Max: ${maxRating})`}</span>
                                        )}
                                        {totalSolved > 0 && (
                                          <span>• Solved: {totalSolved}</span>
                                        )}
                                        {lastSynced && (
                                          <span>• Last synced: {new Date(lastSynced).toLocaleDateString()}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {isEditingPlatform !== platform && (
                                <div className="flex items-center gap-2">
                                  {/* Verify Button - only show for supported platforms */}
                                  {['codeforces', 'leetcode'].includes(platform) && (
                                    <Button
                                      size="sm"
                                      variant={isVerified ? "ghost" : "outline"}
                                      onClick={() => handleOpenVerification(platform, handle, isVerified)}
                                      disabled={verificationLoading}
                                      className={`h-8 px-3 ${isVerified ? 'text-green-600 dark:text-green-500' : 'text-amber-600 dark:text-amber-400'}`}
                                    >
                                      {verificationLoading && verificationModal.platform === platform ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <>
                                          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                                          <span className="text-xs">{isVerified ? 'Verified' : 'Verify'}</span>
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditPlatform(platform, handle)}
                                    className="h-8 px-3"
                                  >
                                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                                    <span className="text-xs">Edit</span>
                                  </Button>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No platforms connected yet</p>
                        <p className="text-sm mt-1">Add a platform below to get started</p>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Add New Platform</Label>
                      <form onSubmit={handlePlatformSync} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="platform">Platform</Label>
                          <select
                            id="platform"
                            value={platformData.platform}
                            onChange={(e) => setPlatformData({ ...platformData, platform: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a platform</option>
                            <option value="codeforces">Codeforces</option>
                            <option value="leetcode">LeetCode</option>
                            <option value="codechef">CodeChef</option>
                            <option value="hackerrank">HackerRank</option>
                            <option value="atcoder">AtCoder</option>
                            <option value="geeksforgeeks">GeeksforGeeks</option>
                            <option value="code360">Code360</option>
                            <option value="hackerearth">HackerEarth</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="handle">Handle/Username</Label>
                          <Input
                            id="handle"
                            placeholder="Your username on the platform"
                            value={platformData.handle}
                            onChange={(e) => setPlatformData({ ...platformData, handle: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter your username as it appears on the platform
                          </p>
                        </div>

                        <Button type="submit" disabled={platformLoading} className="w-full sm:w-auto">
                          {platformLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Sync Platform
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user?.authProvider === 'google' ? (
                      <div className="p-4 rounded-lg border bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          You are signed in with Google. Password changes are not available for OAuth accounts.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        <MessageDisplay message={passwordMessage} />
                        
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="Enter your current password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter your new password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Must be at least 6 characters long
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </div>

                        <Button type="submit" disabled={passwordLoading} className="w-full sm:w-auto">
                          {passwordLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Verification Modal */}
        <Dialog open={verificationModal.isOpen} onOpenChange={handleCloseVerificationModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                {verificationModal.isVerified ? 'Platform Verified' : 'Verify Profile'}
              </DialogTitle>
              <DialogDescription>
                {verificationModal.isVerified 
                  ? `Your ${verificationModal.platform} account (${verificationModal.handle}) is verified.`
                  : `Verify that you own the ${verificationModal.platform} account: ${verificationModal.handle}`
                }
              </DialogDescription>
            </DialogHeader>

            {verificationModal.isVerified ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <IconRosetteDiscountCheckFilled className="h-10 w-10 text-green-600 dark:text-green-500" />
                </div>
                <p className="text-center text-muted-foreground">
                  This account has been verified as belonging to you.
                </p>
              </div>
            ) : verificationModal.instructions ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {verificationModal.instructions.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm text-muted-foreground pt-0.5">
                        {step.includes(verificationModal.code) ? (
                          <>
                            {step.split(verificationModal.code)[0]}
                            <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs font-semibold text-foreground">
                              {verificationModal.code}
                            </code>
                            {step.split(verificationModal.code)[1]}
                          </>
                        ) : (
                          step
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <code className="flex-1 font-mono text-sm font-semibold">{verificationModal.code}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCode}
                    className="h-8 px-2"
                  >
                    {codeCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {verificationModal.instructions.note && (
                  <p className="text-xs text-muted-foreground italic">
                    Note: {verificationModal.instructions.note}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(verificationModal.instructions.profileUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Profile
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleVerifyPlatform}
                    disabled={verificationLoading}
                  >
                    {verificationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Verify Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={handleCloseVerificationModal}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  </AppSidebar>
  );
};

export default Settings;