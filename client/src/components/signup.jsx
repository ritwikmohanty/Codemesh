import { useId, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LogoLight from '/Logof.png';
import LogoDark from '/Logod.png';

export default function SignUp({ children, isDialogOpen, onOpenChange, stayOnCurrentPage = false }) {
  const id = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const { signup, signInWithGoogle, loading, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) clearError()
  }
  
  // const handleSignUpClick = () => {
  //   if (location.pathname === '/') {
  //     onOpenChange?.(true)
  //   } else {
  //     navigate('/signup')
  //   }
  // }

  const handleSignUpClick = () => {
  onOpenChange?.(true)
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signup(formData)
      onOpenChange?.(false)
      
      // Only navigate if not staying on current page
      if (!stayOnCurrentPage) {
        // Optionally navigate to dashboard or show success message
      }
    } catch (err) {
      // Error is handled by context
      console.error('Sign up failed:', err.message)
    }
  }

  const handleGoogleSignUp = () => {
    signInWithGoogle(stayOnCurrentPage);
  }

  // Custom hook to detect theme changes
  const useTheme = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
      // Initial theme check
      const checkTheme = () => {
        if (typeof window !== "undefined") {
          const isDarkMode = document.documentElement.classList.contains('dark');
          setIsDark(isDarkMode);
        }
      };

      // Check theme immediately
      checkTheme();

      // Create a MutationObserver to watch for class changes on the document element
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            checkTheme();
          }
        });
      });

      // Observe the document element for class changes
      if (typeof window !== "undefined") {
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class']
        });
      }

      // Cleanup observer on unmount
      return () => observer.disconnect();
    }, []);

    return isDark;
  };

  const isDarkTheme = useTheme();

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild onClick={handleSignUpClick}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center border"
            aria-hidden="true"
          >
            <img
              src={isDarkTheme ? LogoDark : LogoLight}
              alt="CodeMesh"
              className="h-full w-auto object-contain rounded"
            />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Sign Up
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              We just need a few details to get you started.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )} */}
          
          <div className="space-y-4">
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-name`}>Full name</Label>
              <Input
                id={`${id}-name`}
                name="name"
                placeholder="Matt Welsh"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-email`}>Email</Label>
              <Input
                id={`${id}-email`}
                name="email"
                placeholder="hi@yourcompany.com"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="*:not-first:mt-2">
              <Label htmlFor={`${id}-password`}>Password</Label>
              <Input
                id={`${id}-password`}
                name="password"
                placeholder="Enter your password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
          <span className="text-muted-foreground text-xs">Or</span>
        </div>

        <Button 
          variant="outline" 
          disabled={loading}
          onClick={handleGoogleSignUp}
          type="button"
        >
          Continue with Google
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          By signing up you agree to our{" "}
          <a className="underline hover:no-underline" href="#">
            Terms
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  )
}
