import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import OnboardingModal from '../components/OnboardingModal';

export default function OnboardingWrapper({ children }) {
  const { isAuthenticated, user, updateUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if onboarding is completed
      if (user.onboardingCompleted === false) {
        setShowOnboarding(true);
      }
      setChecking(false);
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Update user state to reflect completed onboarding
    updateUser({ onboardingCompleted: true });
  };

  // Don't render children until we've checked onboarding status
  if (checking) {
    return null;
  }

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => {}} // Prevent closing by clicking outside
          onComplete={handleOnboardingComplete}
          userName={user?.name}
        />
      )}
    </>
  );
}
