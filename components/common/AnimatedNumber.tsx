import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  precision?: number;
  className?: string;
  suffix?: string;
}

export default function AnimatedNumber({ 
  value, 
  precision = 0, 
  className = '',
  suffix = ''
}: AnimatedNumberProps) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => 
    current.toFixed(precision)
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className={className}>
      {display}
      {suffix}
    </motion.span>
  );
}
