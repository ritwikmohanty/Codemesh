import React from 'react';
import { motion } from 'framer-motion';


// --- Animation Variants for Framer Motion ---
// Controls the parent container to orchestrate the animation of its children
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2, // Adds a small delay between each child's animation
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (customOpacity = 1) => ({ // Accepts a custom final opacity
    y: 0,
    opacity: customOpacity,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const BrandingFooter = () => {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      // Use background from your theme
      className="relative flex flex-col items-center justify-center bg-background overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible" // Triggers the animation when the component scrolls into view
      viewport={{ once: true, amount: 0.5 }} // Animation runs only once
    >
      {/* Top signature bar (moved ABOVE the branding) */}
      <motion.div
        className="pointer-events-auto absolute inset-x-0 top-0 z-50"
        variants={itemVariants}
        custom={1}
      >
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-3 border-t border-border/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-s text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>© {year} CodeMesh</span>
              <span className="hidden sm:inline">•</span>
              <span>TY IT B1</span>
              <span className="hidden sm:inline">•</span>
              <span>Built in India 🇮🇳</span>
            </div>
            <div className="text-s">
              Made with <span className="text-primary" aria-label="love">♥</span> by Ritwik Mohanty, Shashank Sathish, Rishi Desai
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gradient overlay from top to bottom (kept as-is) */}
      <div className="absolute top-12 left-0 right-0 z-40 w-full h-[200px] bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" />

      {/* --- Element: "CodeMesh" (unchanged) --- */}
      <motion.h1
        // Use muted-foreground with low opacity from your theme
        className="text-muted-foreground/10 text-[clamp(4rem,18vw,16rem)] font-black tracking-[-0.03em] select-none normal-case leading-none mt-8 -mb-10"
        variants={itemVariants}
        custom={1} // Default opacity of 1
      >
        CodeMesh
      </motion.h1>
    </motion.footer>
  )
};

export default BrandingFooter;
