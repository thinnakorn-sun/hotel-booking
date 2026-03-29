'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { EASE_SMOOTH } from '@/lib/motion/constants';

type MotionModalProps = {
  open: boolean;
  onBackdropClick: () => void;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  /** e.g. id of the modal title heading for screen readers */
  ariaLabelledBy?: string;
};

export function MotionModal({
  open,
  onBackdropClick,
  children,
  className,
  panelClassName,
  ariaLabelledBy,
}: MotionModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="motion-modal-root"
          className={cn(
            'fixed inset-0 z-[100] flex items-center justify-center bg-deep-obsidian/55 backdrop-blur-[6px] p-4',
            className,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_SMOOTH }}
          role="presentation"
          onClick={onBackdropClick}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby={ariaLabelledBy}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.28, ease: EASE_SMOOTH }}
            onClick={(e) => e.stopPropagation()}
            className={cn(panelClassName)}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
