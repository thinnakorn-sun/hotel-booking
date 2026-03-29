'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { EASE_SMOOTH } from '@/lib/motion/constants';

/** Page enter for marketing routes; admin app shell handles its own inner transition. */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const skipInnerTransition =
    pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (skipInnerTransition) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE_SMOOTH }}
    >
      {children}
    </motion.div>
  );
}
