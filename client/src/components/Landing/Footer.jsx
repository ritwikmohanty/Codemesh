import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, ArrowRight, Heart } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import LogoLight from '/Logof.png';
import LogoDark from '/Logod.png';


// --- Animation Variants ---
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const BrandingFooter = () => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <footer className="relative bg-background pt-16 overflow-hidden border-t border-border">
      <motion.div
        className="container mx-auto px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 ">
          {/* Brand Column */}
          <motion.div className="md:col-span-5 space-y-6" variants={itemVariants}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {isMounted && (
                  <img 
                    src={theme === 'dark' ? LogoDark : LogoLight} 
                    alt="CodeMesh Logo"
                    className="h-6 w-6 object-contain"
                  />
                )}
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">CodeMesh</span>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed text-sm md:text-base">
              The ultimate platform for competitive programmers. Track your progress, compete with friends, and climb the global leaderboards.
            </p>
            
            {/* Newsletter */}
            <div className="flex gap-2 max-w-sm mt-4 w-full">
              <Input 
                placeholder="Enter your email" 
                className="bg-background h-10" 
              />
              <Button size="icon" className="shrink-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Links Columns - Responsive Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <motion.div variants={itemVariants}>
              <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contests</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Problems</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Statistics</a></li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="font-semibold mb-4 text-foreground">Community</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Massive Branding */}
      <div className="relative w-full flex justify-center overflow-hidden pb-2 -mt-2 mb-4">
        <div className="absolute top-12 left-0 right-0 z-40 w-full h-[200px] bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" />
        
        <motion.h1
          className="text-muted-foreground/10 text-[clamp(4rem,18vw,16rem)] font-black tracking-[-0.03em] select-none normal-case leading-none mt-8 -mb-10 text-center"
          variants={itemVariants}
          custom={1}
        >
          CodeMesh
        </motion.h1>
      </div>

      {/* Bottom Bar - Below Branding with Separator */}
      <div className="border-t border-border bg-background/50 backdrop-blur-sm relative z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-center">
              <span>© {year} CodeMesh</span>
              <span className="hidden sm:inline text-border">•</span>
              <span>TY IT B1</span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1">Built in India <span className="grayscale hover:grayscale-0 transition-all">🇮🇳</span></span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex gap-4">
                <a href="#" className="hover:text-foreground transition-colors"><Github className="w-4 h-4" /></a>
                <a href="#" className="hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="hover:text-foreground transition-colors"><Linkedin className="w-4 h-4" /></a>
              </div>
              <div className="flex items-center gap-1 pl-0 sm:pl-6 sm:border-l border-border/50">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                <span>by Ritwik, Shashank & Rishi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BrandingFooter;
