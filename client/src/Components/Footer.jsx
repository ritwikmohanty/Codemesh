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

// Controls the animation for each text element (fading in and sliding up)
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


/**
 * A branding footer component generated from a JSON structure.
 * It features a dark background with two animated text elements.
 */
const BrandingFooter = () => {
  return (
    <motion.footer
      // Use background from your theme
      className="relative flex flex-col items-center justify-center bg-background overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible" // Triggers the animation when the component scrolls into view
      viewport={{ once: true, amount: 0.5 }} // Animation runs only once
    >
      {/* Gradient overlay from top to bottom */}
      <div className="absolute top-0 left-0 right-0 z-40 w-full h-[200px] bg-gradient-to-b from-background/90 via-background/90 to-transparent pointer-events-none" />
      
      {/* --- Element 2: "Codemesh" --- */}
      <motion.h1
        // Use muted-foreground with low opacity from your theme
        className="text-muted-foreground/10 text-[clamp(4rem,18vw,16rem)] font-black tracking-[-0.03em] select-none normal-case leading-none"
        variants={itemVariants}
        custom={1} // Default opacity of 1
      >
        CodeMesh
      </motion.h1>
    </motion.footer>
  );
};

export default BrandingFooter;