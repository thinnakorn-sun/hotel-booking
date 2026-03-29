'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Shield,
  Settings,
  User,
  Bell,
  CalendarCheck,
  LogOut,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_SMOOTH } from '@/lib/motion/constants';
import type { Session } from '@supabase/supabase-js';
import { fetchAdminNotifications } from '@/lib/api/admin';
import type { AdminNotificationsDto } from '@/lib/types/dashboard';
import { getSupabaseBrowserClient, isSupabaseBrowserConfigured } from '@/lib/supabase/browser-client';
import { useAppDialog } from '@/components/providers/app-dialog-provider';
import {
  clearAdminAuthHint,
  readAdminAuthHint,
  setAdminAuthHint,
} from '@/lib/admin-session-hint';

const NOTIF_READ_KEY = 'majestic_admin_notif_read_at';

function roleLabel(role: string): string {
  const u = role.toUpperCase();
  if (u === 'ADMIN') return 'Admin';
  if (u === 'MANAGER') return 'Manager';
  if (u === 'STAFF') return 'Staff';
  return role;
}

function formatTimeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function displayNameFromSession(session: Session | null): string | null {
  if (!session?.user) return null;
  const meta = session.user.user_metadata as Record<string, unknown> | undefined;
  const full =
    typeof meta?.full_name === 'string'
      ? meta.full_name
      : typeof meta?.name === 'string'
        ? meta.name
        : null;
  return full?.trim() || session.user.email || null;
}

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const { alert, confirm: confirmDialog } = useAppDialog();
  const [session, setSession] = useState<Session | null>(null);
  /** Session verified with Supabase for this mount. */
  const [authVerified, setAuthVerified] = useState(false);
  /** Recent login in this tab — show shell + pages immediately while verify runs. */
  const [sessionHint] = useState(() => readAdminAuthHint());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifData, setNotifData] = useState<AdminNotificationsDto | null>(null);

  const loadNotifs = useCallback(async () => {
    try {
      const readAt =
        typeof window !== 'undefined'
          ? localStorage.getItem(NOTIF_READ_KEY)
          : null;
      const data = await fetchAdminNotifications(readAt);
      setNotifData(data);
    } catch {
      setNotifData(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      clearAdminAuthHint();
      routerRef.current.replace('/admin/login?reason=config');
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      clearAdminAuthHint();
      routerRef.current.replace('/admin/login?reason=config');
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (cancelled) return;
      if (!s) {
        clearAdminAuthHint();
        routerRef.current.replace('/admin/login');
        return;
      }
      setSession(s);
      setAdminAuthHint();
      setAuthVerified(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (cancelled) return;
      if (!s) {
        clearAdminAuthHint();
        setSession(null);
        setAuthVerified(false);
        routerRef.current.replace('/admin/login');
        return;
      }
      setSession(s);
      setAdminAuthHint();
      setAuthVerified(true);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authVerified) return;
    // Defer calling loadNotifs to the next microtask to avoid setState during render
    Promise.resolve().then(() => { 
      loadNotifs();
    });
  }, [authVerified, loadNotifs]);

  useEffect(() => {
    if (showNotifications) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadNotifs();
    }
  }, [showNotifications, loadNotifs]);

  const signOut = async () => {
    const ok = await confirmDialog({
      title: 'ออกจากระบบ',
      message: 'ต้องการออกจากระบบแอดมินหรือไม่?',
      confirmLabel: 'ออกจากระบบ',
      cancelLabel: 'ยกเลิก',
      variant: 'danger',
    });
    if (!ok) return;
    const supabase = getSupabaseBrowserClient();
    clearAdminAuthHint();
    await supabase?.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const unreadCount = notifData?.unreadCount ?? 0;
  const markAllRead = () => {
    localStorage.setItem(NOTIF_READ_KEY, new Date().toISOString());
    loadNotifs();
  };

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Bookings & payments', icon: CalendarCheck },
    { href: '/admin/inventory', label: 'Inventory & Suites', icon: Package },
    { href: '/admin/ledger', label: 'Ledger', icon: Receipt },
    { href: '/admin/permissions', label: 'Permissions', icon: Shield },
  ];

  const profile = notifData?.profile;
  const sessionEmail = session?.user?.email?.toLowerCase() ?? '';
  const profileMatchesStaff =
    profile != null &&
    typeof profile.email === 'string' &&
    profile.email.toLowerCase() === sessionEmail &&
    sessionEmail.length > 0;

  /** ชื่อในแถบหัว: มาจาก Supabase ก่อน — ไม่ดึงชื่อแอดมินคนอื่นจาก DB มาแสดง */
  const headerName =
    displayNameFromSession(session) ??
    session?.user?.email ??
    (profileMatchesStaff ? profile.name : null) ??
    'Signed in';

  const headerRole = profileMatchesStaff
    ? roleLabel(profile.role)
    : sessionEmail
      ? 'Supabase'
      : '—';

  const showFullScreenGate = !authVerified && !sessionHint;

  if (showFullScreenGate) {
    return (
      <div className="min-h-screen bg-deep-obsidian flex items-center justify-center font-body">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin mx-auto" />
          <p className="font-label text-xs uppercase tracking-widest text-white/60">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex font-body">
      <aside className="w-64 bg-deep-obsidian text-white fixed h-full flex flex-col z-20">
        <div className="p-6 border-b border-white/10">
          <Link
            href="/"
            className="font-headline text-lg font-bold tracking-widest uppercase block mb-1"
          >
            MAJESTIC RESERVE
          </Link>
          <span className="font-label text-[10px] text-primary-fixed uppercase tracking-widest">
            Management Portal
          </span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <motion.div
                key={link.href}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-primary-fixed' : ''}`}
                  />
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 space-y-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 480, damping: 32 }}
            onClick={() =>
              void alert({
                title: 'ตั้งค่าระบบ',
                message: 'โมดูลตั้งค่าจะเปิดใช้งานในเวอร์ชันถัดไป',
              })
            }
            className="flex items-center gap-3 text-white/70 hover:text-white font-label text-sm font-medium transition-colors w-full text-left rounded-lg px-2 py-1 -mx-2 hover:bg-white/5"
          >
            <Settings className="w-5 h-5" />
            System Settings
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 480, damping: 32 }}
            onClick={() => void signOut()}
            className="flex items-center gap-3 text-white/70 hover:text-red-200 font-label text-sm font-medium transition-colors w-full text-left rounded-lg px-2 py-1 -mx-2 hover:bg-white/5"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            ออกจากระบบ
          </motion.button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-surface border-b border-outline-variant/20 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-headline text-xl font-semibold text-on-surface">
            {navLinks.find((link) => link.href === pathname)?.label ||
              'Dashboard'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-on-surface-variant hover:text-primary transition-colors"
                aria-expanded={showNotifications}
                aria-haspopup="true"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[8px] h-2 px-0.5 bg-error rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications ? (
                  <motion.div
                    key="admin-notif-panel"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: EASE_SMOOTH }}
                    className="absolute right-0 mt-4 w-80 bg-surface rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-50"
                  >
                  <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low flex justify-between items-center">
                    <h4 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-error">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {!notifData?.items?.length ? (
                      <p className="p-4 text-sm text-on-surface-variant">
                        No recent activity.
                      </p>
                    ) : (
                      notifData.items.map((item) => (
                        <Link
                          key={item.id}
                          href="/admin/bookings"
                          onClick={() => setShowNotifications(false)}
                          className="block p-4 border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors"
                        >
                          <p className="font-body text-sm text-on-surface mb-1">
                            {item.message}
                          </p>
                          <span className="font-label text-[10px] text-on-surface-variant uppercase">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="p-3 text-center bg-surface-container-lowest border-t border-outline-variant/10">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="font-label text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/30">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col max-w-[200px] min-w-0">
                <span className="font-label text-xs font-bold text-on-surface truncate">
                  {headerName}
                </span>
                <span className="font-label text-[10px] text-on-surface-variant uppercase truncate">
                  {headerRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-x-hidden">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: EASE_SMOOTH }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
