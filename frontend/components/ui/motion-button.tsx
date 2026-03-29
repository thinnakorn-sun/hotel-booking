'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { transitionSpring } from '@/lib/motion/constants';

const variantClass: Record<string, string> = {
  primary:
    'bg-primary text-on-primary shadow-md shadow-primary/15 hover:opacity-[0.96] disabled:opacity-45',
  secondary:
    'bg-surface-container-high text-on-surface border border-outline-variant/40 hover:bg-surface-container disabled:opacity-45',
  outline:
    'border border-outline-variant/50 bg-transparent text-on-surface hover:bg-surface-container-low disabled:opacity-45',
  ghost:
    'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/80 disabled:opacity-45',
  danger:
    'bg-error text-on-error shadow-sm hover:opacity-95 disabled:opacity-45',
  nav:
    'bg-primary text-white shadow-sm hover:opacity-90 disabled:opacity-45',
};

const sizeClass: Record<string, string> = {
  sm: 'px-3 py-1.5 text-[10px] gap-1.5',
  md: 'px-5 py-2.5 text-xs gap-2',
  lg: 'px-8 py-3 md:py-3.5 text-xs md:text-sm gap-2',
  icon: 'p-2',
  xl: 'px-10 py-4 text-xs gap-2',
};

export type MotionButtonVariant = keyof typeof variantClass;
export type MotionButtonSize = keyof typeof sizeClass;

export type MotionButtonProps = HTMLMotionProps<'button'> & {
  variant?: MotionButtonVariant;
  size?: MotionButtonSize;
};

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  function MotionButton(
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        transition={transitionSpring}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-label font-bold uppercase tracking-widest transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed',
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
