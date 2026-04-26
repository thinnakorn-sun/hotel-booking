"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { setAdminAuthHint } from "@/lib/admin-session-hint";
import {
  clearDemoAdminSession,
  readDemoAdminSession,
  writeDemoAdminSession,
} from "@/lib/demo-auth";
import {
  getDemoAdminEmail,
  getDemoAdminName,
  getDemoAdminPassword,
  isDemoModeEnabled,
} from "@/lib/env/public-env";
import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";
import { MotionButton } from "@/components/ui/motion-button";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function AdminLoginForm() {
  const existingDemoSession = readDemoAdminSession();
  const demoMode =
    isDemoModeEnabled() ||
    existingDemoSession != null ||
    !isSupabaseBrowserConfigured();
  const demoEmail = getDemoAdminEmail();
  const demoPassword = getDemoAdminPassword();
  const demoName = getDemoAdminName();
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  /** false = ไม่ต้องรอ session (ไม่ได้ตั้งค่า / ไม่มี client); true = กำลังรอ getSession */
  const [checkingSession, setCheckingSession] = useState(() => {
    if (demoMode) return false;
    if (!isSupabaseBrowserConfigured()) return false;
    return getSupabaseBrowserClient() != null;
  });

  useEffect(() => {
    if (demoMode) {
      const activeDemoSession = existingDemoSession ?? readDemoAdminSession();
      if (activeDemoSession) {
        setAdminAuthHint();
        routerRef.current.replace("/admin");
      } else {
        Promise.resolve().then(() => {
          setCheckingSession(false);
        });
      }
      return;
    }
    if (!isSupabaseBrowserConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        setAdminAuthHint();
        routerRef.current.replace("/admin");
        return;
      }
      setCheckingSession(false);
    });
    return () => {
      cancelled = true;
    };
  }, [demoMode, existingDemoSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    const isDemoCredentialMatch =
      normalizedEmail === demoEmail && password === demoPassword;

    if (demoMode || isDemoCredentialMatch) {
      if (!isDemoCredentialMatch) {
        setError("อีเมลหรือรหัสผ่านเดโมไม่ถูกต้อง");
        return;
      }
      writeDemoAdminSession({
        email: demoEmail,
        name: demoName,
        role: "ADMIN",
      });
      setAdminAuthHint();
      router.replace("/admin");
      router.refresh();
      return;
    }
    if (!isSupabaseBrowserConfigured()) {
      setError("ยังไม่ได้ตั้งค่า Supabase");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("เชื่อมต่อไม่สำเร็จ");
      return;
    }
    setLoading(true);
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    setAdminAuthHint();
    router.replace("/admin");
    router.refresh();
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-deep-obsidian flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body flex items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-deep-obsidian">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute top-[-20%] left-1/2 h-[min(70vw,480px)] w-[min(70vw,480px)] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] h-[min(60vw,400px)] w-[min(60vw,400px)] rounded-full bg-primary-fixed/15 blur-[100px]" />

      <motion.div
        className="relative w-full max-w-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        <div className="text-center mb-10">
          <h1 className="font-headline text-3xl sm:text-[2rem] font-semibold text-white tracking-tight">
            Sunshine Hotel
          </h1>
          <p className="mt-2 font-label text-[11px] uppercase tracking-[0.35em] text-primary-fixed/90">
            Admin
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.97] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.45)] backdrop-blur-sm px-8 py-9 sm:px-10 sm:py-10">
          {reason === "config" && (
            <div
              className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-center text-xs text-amber-950"
              role="alert"
            >
              ยังไม่ได้ตั้งค่า Supabase
            </div>
          )}
          {demoMode && (
            <div
              className="mb-6 rounded-xl border border-blue-200/80 bg-blue-50/90 px-3 py-2.5 text-xs text-blue-900 space-y-1"
              role="status"
            >
              <p className="font-semibold">Demo mode enabled</p>
              <p>Email: {demoEmail}</p>
              <p>Password: {demoPassword}</p>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.4, ease: easeOut }}
            >
              <label
                htmlFor="admin-email"
                className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-2"
              >
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-outline/80 group-focus-within:text-primary transition-colors" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-[15px] placeholder:text-outline/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: easeOut }}
            >
              <label
                htmlFor="admin-password"
                className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant block mb-2"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-outline/80 group-focus-within:text-primary transition-colors" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-[15px] placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-outline hover:text-on-surface hover:bg-surface-container-high/80 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </motion.div>

            {error && (
              <p
                className="text-sm text-error font-body text-center"
                role="alert"
              >
                {error}
              </p>
            )}

            {demoMode && (
              <button
                type="button"
                onClick={() => {
                  setEmail(demoEmail);
                  setPassword(demoPassword);
                  clearDemoAdminSession();
                }}
                className="w-full text-xs text-primary font-label uppercase tracking-widest hover:underline"
              >
                Use demo credentials
              </button>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.4, ease: easeOut }}
            >
              <MotionButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full rounded-xl tracking-[0.22em] text-[11px] min-h-[48px] gap-2"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  "Sign in"
                )}
              </MotionButton>
            </motion.div>
          </form>
        </div>

        <p className="text-center mt-10">
          <Link
            href="/"
            className="font-label text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-primary-fixed transition-colors"
          >
            Back
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
