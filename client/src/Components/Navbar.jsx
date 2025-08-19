import React, { useState, useEffect, useId } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoLight from '/codemesh.png';
import LogoDark from '/codemeshdark.png';
import { MoonIcon, SunIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignIn from './signin';
import SignUp from './signup';

const MenuIcon = () => (
     <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

const ThemeSwitch = () => {
    const id = useId();
    const getDefaultChecked = () => {
        if (typeof window === "undefined") return true;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    const [checked, setChecked] = useState(getDefaultChecked);

    useEffect(() => {
        if (checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [checked]);

    return (
        <div>
            <div className="relative inline-grid h-8 grid-cols-[1fr_1fr] items-center text-sm font-medium">
                <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={setChecked}
                    className="peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full [&_span]:data-[state=checked]:rtl:-translate-x-full"
                />
                <span className="pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full peer-data-[state=unchecked]:rtl:-translate-x-full">
                    <MoonIcon size={16} aria-hidden="true" />
                </span>
                <span className="peer-data-[state=checked]:text-primary-foreground pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full">
                    <SunIcon size={16} aria-hidden="true" />
                </span>
            </div>
            <Label htmlFor={id} className="sr-only">
                Labeled switch
            </Label>
        </div>
    );
};

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
    const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        // Cleanup function to remove the event listener
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const navClasses = `
        transition-transform transition-opacity duration-300 ease-out w-full z-50
        ${isScrolled 
            ? 'fixed top-4 inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-full bg-card/90 backdrop-blur-xl shadow-lg border border-border px-4 py-1 animate-slide-down-fade opacity-40' 
            : 'static px-5 py-2'
        }
    `;

    const getDefaultAvatar = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

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
                        src={
                            typeof window !== "undefined" && document.documentElement.classList.contains('dark')
                                ? LogoDark
                                : LogoLight
                        }
                        alt="CodeMesh"
                        className="h-8 w-auto object-contain"
                    />
                    <span className="font-bold text-lg text-foreground">CodeMesh</span>
                </a>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-2">
                    <ul className="flex items-center space-x-2">
                        <li><a href="/" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Home</a></li>
                        <li><a href="#" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Portfolio</a></li>
                        <li><a href="#" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Leaderboard</a></li>
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
                                            <AvatarFallback>
                                                {getDefaultAvatar(user.name)}
                                            </AvatarFallback>
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
                            <ThemeSwitch />
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
                                <button className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-primary text-primary-foreground">
                                    Get Started
                                </button>
                            </SignUp>
                            <ThemeSwitch />
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
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Leaderboard</a>
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
                                        <AvatarFallback>
                                            {getDefaultAvatar(user.name)}
                                        </AvatarFallback>
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
                                    <ThemeSwitch />
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
                                        <button className="w-full text-center px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-primary text-primary-foreground">
                                            Get Started
                                        </button>
                                    </SignUp>
                                </div>
                                <div className="mt-3 px-4">
                                    <ThemeSwitch />
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