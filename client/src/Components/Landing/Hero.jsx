import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GradientHero() {
  const navigate = useNavigate();

  return (
    <div className="bg-background relative w-full overflow-hidden">
      {/* Background gradient and grid */}
      <div className="absolute inset-0 z-0">
        <div className="from-primary/20 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="bg-primary/5 absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:16px_16px] opacity-15"></div>

      <div className="relative z-10 container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex justify-center"
          >
            <div className="border-border bg-background/80 inline-flex items-center rounded-full border px-3 py-1 text-sm backdrop-blur-sm">
              <span className="bg-primary mr-2 rounded-full px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                Introducing
              </span>
              <span className="text-muted-foreground">
                CodeMesh – One Platform. All Your Competitive Programming Insights.
              </span>
              {/* <ChevronRight className="text-muted-foreground ml-1 h-4 w-4" /> */}
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="from-primary/10 via-foreground/85 to-foreground/50 bg-gradient-to-tl bg-clip-text pb-2 text-center text-4xl font-bold tracking-tighter text-balance text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Track. Compete. Improve.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg"
          >
            All your contests, performance stats, and personalized practice—unified. CodeMesh aggregates calendars, ratings, and analytics from platforms like Codeforces, LeetCode, and AtCoder to help you train smarter and compete better.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => navigate('/leaderboard')}
              className="group bg-primary text-primary-foreground hover:shadow-primary/30 relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full px-6 font-medium shadow-lg transition-all duration-300"
            >
              <span className="relative z-10 flex items-center">
                Explore Leaderboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="from-primary via-primary/90 to-primary/80 absolute inset-0 z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </button>

            <button
              className="border-border bg-background/50 hover:bg-accent hover:text-accent-foreground inline-flex h-11 items-center justify-center gap-2 rounded-full border px-6 font-medium backdrop-blur-sm transition-colors"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </button>
          </motion.div>

          {/* Feature Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              type: 'spring',
              stiffness: 50,
            }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="border-border/40 bg-background/50 overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm">
              <div className="border-border/40 bg-muted/50 flex h-10 items-center border-b px-4">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-background/50 text-muted-foreground mx-auto flex items-center rounded-md px-3 py-1 text-xs">
                  codemesh.app
                </div>
              </div>
              <div className="relative">
                {/* Show dashboard_light.png for light mode, dashboard.png for dark mode */}
                <img
                  src="/dashboard.png"
                  alt="CodeMesh Dashboard Preview"
                  className="w-full dark:block hidden"
                />
                <img
                  src="/dashboard_light.png"
                  alt="CodeMesh Dashboard Preview (Light)"
                  className="w-full dark:hidden block"
                />
                <div className="from-background absolute inset-0 bg-gradient-to-t to-transparent opacity-0"></div>
              </div>
            </div>

            {/* Floating elements for visual interest */}
            <div className="border-border/40 bg-background/80 absolute -top-6 -right-6 h-12 w-12 rounded-lg border p-3 shadow-lg backdrop-blur-md">
              <div className="bg-primary/20 h-full w-full rounded-md"></div>
            </div>
            <div className="border-border/40 bg-background/80 absolute -bottom-4 -left-4 h-8 w-8 rounded-full border shadow-lg backdrop-blur-md"></div>
            <div className="border-border/40 bg-background/80 absolute right-12 -bottom-6 h-10 w-10 rounded-lg border p-2 shadow-lg backdrop-blur-md">
              <div className="h-full w-full rounded-md bg-green-500/20"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
