'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { PAGE_SECTION_IDS } from '@/lib/constants/page-sections';
import { useHash } from '@/hooks/use-hash';
import { MotionButton } from '@/components/ui/motion-button';
import { transitionSpringSoft } from '@/lib/motion/constants';

function navTextClass(active: boolean) {
  return active
    ? 'text-amber-700 dark:text-amber-500 font-semibold border-b border-amber-700 font-headline text-sm md:text-lg tracking-tight transition-opacity duration-300 whitespace-nowrap'
    : 'text-on-surface-variant hover:text-amber-700 dark:text-slate-400 font-headline text-sm md:text-lg tracking-tight transition-opacity duration-300 border-b border-transparent whitespace-nowrap';
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const hash = useHash();
  const onHome = pathname === '/';

  const homeActive =
    onHome && (hash === '' || hash === `#${PAGE_SECTION_IDS.hero}`);
  const roomsNavActive =
    (onHome && hash === `#${PAGE_SECTION_IDS.collection}`) ||
    pathname === '/rooms';
  const bookingsActive = pathname === '/bookings';
  const adminActive = pathname.startsWith('/admin');

  const navTap = {
    whileTap: { scale: 0.97 },
    transition: transitionSpringSoft,
  } as const;

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm dark:shadow-none transition-all ease-in-out flex justify-between items-center px-4 md:px-12 h-20 gap-3">
      <motion.span className="inline-flex shrink-0" {...navTap}>
        <Link
          href="/"
          className="font-headline text-lg md:text-2xl font-bold tracking-widest text-on-surface dark:text-white uppercase"
        >
          MAJESTIC RESERVE
        </Link>
      </motion.span>
      <div className="flex flex-1 min-w-0 justify-end md:justify-center items-center gap-4 md:gap-10 overflow-x-auto no-scrollbar py-1">
        {onHome ? (
          <motion.span className="inline-flex shrink-0" {...navTap}>
            <a
              href={`#${PAGE_SECTION_IDS.hero}`}
              className={navTextClass(homeActive)}
            >
              Home
            </a>
          </motion.span>
        ) : (
          <motion.span className="inline-flex shrink-0" {...navTap}>
            <Link href="/" className={navTextClass(false)}>
              Home
            </Link>
          </motion.span>
        )}
        {onHome ? (
          <motion.span className="inline-flex shrink-0" {...navTap}>
            <a
              href={`#${PAGE_SECTION_IDS.collection}`}
              className={navTextClass(roomsNavActive)}
            >
              Rooms
            </a>
          </motion.span>
        ) : (
          <motion.span className="inline-flex shrink-0" {...navTap}>
            <Link href="/rooms" className={navTextClass(roomsNavActive)}>
              Rooms
            </Link>
          </motion.span>
        )}
        <motion.span className="inline-flex shrink-0" {...navTap}>
          <Link
            href="/bookings"
            className={navTextClass(bookingsActive)}
          >
            My Bookings
          </Link>
        </motion.span>
        <motion.span className="inline-flex shrink-0" {...navTap}>
          <Link href="/admin" className={navTextClass(adminActive)}>
            Admin
          </Link>
        </motion.span>
      </div>
      <MotionButton
        type="button"
        variant="nav"
        size="md"
        onClick={() => router.push('/rooms')}
        className="shrink-0 px-4 md:px-8 py-2 md:py-2.5 text-[10px] md:text-sm tracking-wide bloom-effect rounded-lg"
      >
        Book Now
      </MotionButton>
    </nav>
  );
}
