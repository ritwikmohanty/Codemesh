import React, { useState, useEffect, useId } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoLight from '/Logof.png';
import LogoDark from '/Logod.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignIn from './signin.jsx';
import SignUp from './signup.jsx';
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { Button } from "@/components/ui/button";

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

const MenuIcon = () => (
     <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);


const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
    const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const isDarkTheme = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsScrolled(scrollTop > 50);
        };

        // Add scroll listener to both window and document
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial check
        handleScroll();
        
        // Cleanup function to remove the event listeners
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navClasses = `
        transition-transform transition-opacity duration-300 ease-out w-full z-50
        ${isScrolled 
            ? 'fixed top-4 inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-full bg-card/95 backdrop-blur-xl shadow-lg border border-border px-4 py-1 animate-slide-down-fade opacity-100' 
            : 'static px-5 py-2'
        }
    `;

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    return (
        <nav id="main-nav" className={navClasses}>
            <div className="container mx-auto flex z-50 items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center space-x-2">
                    <img
                        src={isDarkTheme ? LogoDark : LogoLight}
                        alt="CodeMesh"
                        className="h-7 w-auto object-contain rounded "
                    />
                    <span className="font-bold text-lg text-foreground">CodeMesh</span>
                </a>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-2">
                    <ul className="flex items-center space-x-2">
                        <li><a href="/" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Home</a></li>
                        <li><a href="/portfolio" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Portfolio</a></li>
                        <li><a href="/leaderboard" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Leaderboard</a></li>
                        <li><a href="/calendar" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Calendar</a></li>
                    </ul>
                </div>

                {/* Action Buttons & Theme Toggle */}
                <div className="hidden md:flex items-center space-x-2">
                    {isAuthenticated && user ? (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted transition-colors">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage 
                                                src={user.avatarUrl} 
                                                alt={user.name}
                                            />
                                            <AvatarFallback username={user.username} />
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Settings</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <ThemeToggleButton showLabel variant="circle-blur" start="top-right" />
                        </>
                    ) : (
                        <>
                            <SignIn 
                                isDialogOpen={isSignInDialogOpen} 
                                onOpenChange={setIsSignInDialogOpen}
                            >
                                <button className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted bg-transparent text-foreground">
                                    Sign In
                                </button>
                            </SignIn>
                            <SignUp 
                                isDialogOpen={isSignUpDialogOpen} 
                                onOpenChange={setIsSignUpDialogOpen}
                            >
                                <Button className="px-4 py-2">
                                    Get Started
                                </Button>
                            </SignUp>
                            <ThemeToggleButton showLabel variant="circle-blur" start="top-right" />
                        </>
                    )}
                </div>
                
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted focus:outline-none">
                        <MenuIcon />
                    </button>
                </div>
            </div>

            {/* Mobile Menu (collapsible) */}
            {isMenuOpen && (
                <div className="md:hidden mt-2 rounded-lg shadow-lg bg-background">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Home</a>
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Portfolio</a>
                        <a href="/leaderboard" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Leaderboard</a>
                        <a href="/calendar" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Calendar</a>
                    </div>
                    <div className="pt-4 pb-3 border-t border-border">
                        {isAuthenticated && user ? (
                            <div className="px-4 space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage 
                                            src={user.avatarUrl} 
                                            alt={user.name}
                                        />
                                        <AvatarFallback username={user.username} />
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted">
                                        Profile
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted">
                                        Settings
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted text-red-600"
                                    >
                                        Sign out
                                    </button>
                                </div>
                                <div className="pt-2">
                                    <ThemeToggleButton showLabel variant="circle-blur" start="top-right" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center px-4 space-x-2">
                                    <SignIn 
                                        isDialogOpen={isSignInDialogOpen} 
                                        onOpenChange={setIsSignInDialogOpen}
                                    >
                                        <button className="w-full text-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted bg-transparent text-foreground">
                                            Sign In
                                        </button>
                                    </SignIn>
                                    <SignUp 
                                        isDialogOpen={isSignUpDialogOpen} 
                                        onOpenChange={setIsSignUpDialogOpen}
                                    >
                                        <Button className="w-full text-center">
                                            Get Started
                                        </Button>
                                    </SignUp>
                                </div>
                                <div className="mt-3 px-4">
                                    <ThemeToggleButton showLabel variant="circle-blur" start="top-right" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
export default Navbar;