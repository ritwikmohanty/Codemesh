import { useId, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

export default function SignIn({ children, isDialogOpen, onOpenChange, stayOnCurrentPage = false }) {
  const id = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const { signin, signInWithGoogle, loading, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) clearError()
  }
  
  // const handleSignInClick = () => {
  //   if (location.pathname === '/') {
  //     onOpenChange?.(true)
  //   } else {
  //     navigate('/signin')
  //   }
  // }

  const handleSignInClick = () => {
  onOpenChange?.(true)
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signin({
        email: formData.email,
        password: formData.password
      })
      onOpenChange?.(false)
      
      // Only navigate if not staying on current page
      if (!stayOnCurrentPage) {
        // Optionally navigate to dashboard or refresh page
      }
    } catch (err) {
      // Error is handled by context
      console.error('Sign in failed:', err.message)
    }
  }

  const handleGoogleSignIn = () => {
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
      <DialogTrigger asChild onClick={handleSignInClick}>
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
            <DialogTitle className="sm:text-center">Welcome back</DialogTitle>
            <DialogDescription className="sm:text-center">
              Enter your credentials to login to your account.
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
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`${id}-remember`}
                name="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, rememberMe: checked }))
                }
                disabled={loading}
              />
              <Label
                htmlFor={`${id}-remember`}
                className="text-muted-foreground font-normal"
              >
                Remember me
              </Label>
            </div>
            <a className="text-sm underline hover:no-underline" href="#">
              Forgot password?
            </a>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
          <span className="text-muted-foreground text-xs">Or</span>
        </div>

        <Button 
          variant="outline" 
          disabled={loading}
          onClick={handleGoogleSignIn}
          type="button"
        >
          Continue with Google
        </Button>
      </DialogContent>
    </Dialog>
  )
}
