"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface Platform {
  name: string;
  logo: string;
}

interface VelocityScrollProps {
  platforms: Platform[];
  default_velocity?: number;
  className?: string;
}

interface ParallaxProps {
  platforms: Platform[];
  baseVelocity: number;
  className?: string;
}

export const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export const VelocityScroll: React.FC<VelocityScrollProps> = ({
  platforms,
  default_velocity = 5,
  className,
}) => {
  const ParallaxText: React.FC<ParallaxProps> = ({
    platforms,
    baseVelocity = 100,
    className,
  }) => {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: 50,
      stiffness: 400,
    });

    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
      clamp: false,
    });

    const [repetitions, setRepetitions] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const calculateRepetitions = () => {
        if (containerRef.current && contentRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const contentWidth = contentRef.current.offsetWidth;
          const newRepetitions = Math.ceil(containerWidth / contentWidth) + 2;
          setRepetitions(newRepetitions);
        }
      };

      calculateRepetitions();

      window.addEventListener("resize", calculateRepetitions);
      return () => window.removeEventListener("resize", calculateRepetitions);
    }, [platforms]);

    const x = useTransform(baseX, (v) => `${wrap(-100 / repetitions, 0, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
      let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

      // Change direction based on scroll direction
      if (velocityFactor.get() < 0) {
        directionFactor.current = 1; // Scroll up -> left to right
      } else if (velocityFactor.get() > 0) {
        directionFactor.current = -1; // Scroll down -> right to left
      }

      moveBy += directionFactor.current * moveBy * velocityFactor.get();

      baseX.set(baseX.get() + moveBy);
    });

    return (
      <div
        className="w-full overflow-hidden whitespace-nowrap"
        ref={containerRef}
      >
        <motion.div
          className={cn("inline-flex items-center gap-12", className)}
          style={{ x }}
        >
          {Array.from({ length: repetitions }).map((_, i) => (
            <div
              key={i}
              ref={i === 0 ? contentRef : null}
              className="inline-flex items-center gap-12"
            >
              {platforms.map((platform, platformIndex) => (
                <div
                  key={`${i}-${platformIndex}`}
                  className="flex-shrink-0 w-40 h-14 flex items-center justify-center"
                >
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    className="max-h-32 max-w-full w-auto h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <section className="relative w-full">
      {/* Gradient overlays */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--background)), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
        style={{
          background:
            "linear-gradient(to left, hsl(var(--background)), transparent)",
        }}
      />
      <ParallaxText
        baseVelocity={default_velocity}
        className={className}
        platforms={platforms}
      ></ParallaxText>
    </section>
  );
};