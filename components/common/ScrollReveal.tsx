/**
 * ScrollReveal — a composable scroll-triggered animation wrapper.
 *
 * Usage:
 *   <ScrollReveal direction="up" delay={0.1}>
 *     <MyCard />
 *   </ScrollReveal>
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  fadeSlideUp,
  fadeSlideIn,
  fadeSlideRight,
  fadeSlideDown,
  scaleReveal,
  clipRevealUp,
} from '../../animations';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'clip';

const VARIANT_MAP: Record<Direction, Variants> = {
  up:    fadeSlideUp,
  down:  fadeSlideDown,
  left:  fadeSlideIn,
  right: fadeSlideRight,
  scale: scaleReveal,
  clip:  clipRevealUp,
};

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Direction text/components slide in from */
  direction?: Direction;
  /** Additional animation delay in seconds */
  delay?: number;
  /** Viewport margin before trigger (negative = trigger earlier) */
  margin?: string;
  /** Override variant entirely */
  variants?: Variants;
  className?: string;
  /** Trigger once or every time element re-enters viewport */
  once?: boolean;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  margin = '-80px',
  variants,
  className,
  once = true,
}: ScrollRevealProps) {
  const reducedMotion = !!useReducedMotion();

  const baseVariants = variants ?? VARIANT_MAP[direction];

  // Respect reduced-motion by returning children with no animation
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Inject delay into the visible transition
  const finalVariants: Variants = {
    hidden: baseVariants.hidden,
    visible: {
      ...(baseVariants.visible as object),
      transition: {
        ...((baseVariants.visible as any)?.transition ?? {}),
        delay: ((baseVariants.visible as any)?.transition?.delay ?? 0) + delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={finalVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
    >
      {children}
    </motion.div>
  );
}
