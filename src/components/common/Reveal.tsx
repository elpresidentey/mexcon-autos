import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before animating (use for stagger effects). */
  delay?: number;
  /** Vertical offset in px the element rises from. */
  y?: number;
  once?: boolean;
}

/**
 * Scroll-reveal wrapper: fades + rises content into view on first scroll.
 * Respects prefers-reduced-motion and degrades to static rendering there.
 */
export const Reveal = ({ children, className, delay = 0, y = 24, once = true }: RevealProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
