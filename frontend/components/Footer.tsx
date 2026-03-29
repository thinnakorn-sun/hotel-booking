'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { transitionSpringSoft } from '@/lib/motion/constants';

const linkTap = {
  whileTap: { scale: 0.97 },
  transition: transitionSpringSoft,
} as const;

export function Footer() {
  return (
    <footer className="bg-surface-container-low dark:bg-slate-950 w-full py-16 border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-12 flex flex-col items-center gap-8 text-center">
        <div className="font-headline text-lg tracking-widest text-on-surface uppercase font-bold">
          MAJESTIC RESERVE
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {(
            [
              ['Privacy', '/'],
              ['Terms', '/'],
              ['Social', '/'],
              ['Contact', '/'],
            ] as const
          ).map(([label, href]) => (
            <motion.span key={label} className="inline-flex" {...linkTap}>
              <Link
                href={href}
                className="font-headline italic text-base text-on-surface-variant/70 hover:text-amber-800 underline-offset-4 transition-colors duration-300"
              >
                {label}
              </Link>
            </motion.span>
          ))}
        </div>
        <div className="pt-8 border-t border-outline-variant/10 w-full text-on-surface-variant/40 font-label text-xs tracking-widest uppercase">
          © 2024 Majestic Reserve. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
