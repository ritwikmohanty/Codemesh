import React, { useState, useEffect } from 'react';
import LogoLight from '/codemesh.png';
import LogoDark from '/codemeshdark.png';

const SunIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const MenuIcon = () => (
     <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);


const Navbar = () => {

    const [theme, setTheme] = useState('light');

    const [isScrolled, setIsScrolled] = useState(false);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Effect for handling theme changes and persistence
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };


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
            ? 'fixed top-4 inset-x-0 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-full bg-card/90 backdrop-blur-xl shadow-lg border border-border px-4 py-1 animate-slide-down-fade' 
            : 'static px-5 py-2'
        }
    `;

    return (
        <nav id="main-nav" className={navClasses}>
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center space-x-2">
                    <img
                        src={theme === 'dark' ? LogoDark : LogoLight}
                        alt="CodeMesh"
                        className="h-8 w-auto object-contain"
                    />
                    <span className="font-bold text-lg text-foreground">CodeMesh</span>
                </a>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-2">
                    <ul className="flex items-center space-x-2">
                        <li><a href="#" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Home</a></li>
                        <li><a href="#" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Portfolio</a></li>
                        <li><a href="#" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Leaderboard</a></li>
                        <li><a href="#" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary">Calendar</a></li>
                    </ul>
                </div>

                {/* Action Buttons & Theme Toggle */}
                <div className="hidden md:flex items-center space-x-2">
                    <a href="#" className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted bg-transparent text-foreground">Sign In</a>
                    <a href="#" className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-primary text-primary-foreground">Get Started</a>
                    <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-full transition-colors border border-border text-foreground bg-transparent">
                        {theme === 'light' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    </button>
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
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Home</a>
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Portfolio</a>
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Leaderboard</a>
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:bg-muted">Calendar</a>
                    </div>
                    <div className="pt-4 pb-3 border-t border-border">
                        <div className="flex items-center px-4 space-x-2">
                            <a href="#" className="w-full text-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted bg-transparent text-foreground">Sign In</a>
                            <a href="#" className="w-full text-center px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-primary text-primary-foreground">Get Started</a>
                        </div>
                        <div className="mt-3 px-4">
                            <button onClick={toggleTheme} className="w-full py-2 flex items-center justify-center rounded-md transition-colors border border-border text-foreground bg-transparent">
                                <span className="mr-2">Toggle Theme</span>
                                {theme === 'light' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
export default Navbar;