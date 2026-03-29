'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { EASE_SMOOTH } from '@/lib/motion/constants';

export function MotionReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-48px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.5, ease: EASE_SMOOTH }}
    >
      {children}
    </motion.div>
  );
}
