import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
    const navigate = useNavigate();

    return (
        <section className="pb-20 px-4 md:px-6 lg:pb-24 bg-background relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-auto md:h-[480px] rounded-lg overflow-hidden bg-primary flex flex-col items-center justify-center text-center p-8 md:p-12 shadow-2xl z-0"
                >
                    {/* 
                        Aurora Gradient Overlay 
                        - Base is bg-primary
                        - Overlay is a radial gradient starting from top center
                        - It transitions from the page background color to transparent, revealing the primary color at the bottom
                        - Works for both light and dark modes
                    */}
                    <div className="absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_0%,_hsl(var(--background))_50%,_transparent_100%)] pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex items-center gap-3 bg-foreground/10 dark:bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full"
                        >
                            <Zap className="h-4 w-4 text-foreground dark:text-primary-foreground" />
                            <span className="text-sm font-medium text-foreground dark:text-primary-foreground">
                                Ready to level up?
                            </span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                        >
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground dark:text-primary-foreground leading-tight">
                                Unify Your Competitive <br />
                                Programming Journey
                            </h2>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-lg text-foreground/80 dark:text-primary-foreground/90 max-w-2xl font-medium"
                        >
                            Stop juggling multiple platforms. Get all your contests, ratings, analytics, and AI-powered recommendations in one unified dashboard.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.35, duration: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 pt-4"
                        >
                            <button
                                onClick={() => navigate('/signin')}
                                className="group relative px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Get Started Free
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </button>

                            <button
                                onClick={() => navigate('/leaderboard')}
                                className="group relative px-8 py-3 border-2 border-foreground dark:border-primary-foreground text-foreground dark:text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:bg-foreground/10 dark:hover:bg-primary-foreground/10 hover:-translate-y-0.5"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Explore Leaderboard
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;
