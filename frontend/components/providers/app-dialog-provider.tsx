'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils/cn';
import { MotionButton } from '@/components/ui/motion-button';

const easeOut = [0.22, 1, 0.36, 1] as const;

export type AlertOptions = {
  title?: string;
  message: string;
  okLabel?: string;
};

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
};

type DialogState =
  | {
      kind: 'alert';
      title?: string;
      message: string;
      okLabel: string;
      onClose: () => void;
    }
  | {
      kind: 'confirm';
      title?: string;
      message: string;
      confirmLabel: string;
      cancelLabel: string;
      variant: 'danger' | 'default';
      onResult: (ok: boolean) => void;
    };

type DialogContextValue = {
  alert: (input: string | AlertOptions) => Promise<void>;
  confirm: (input: ConfirmOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function useAppDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useAppDialog must be used within AppDialogProvider');
  }
  return ctx;
}

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dialog.kind === 'alert') dialog.onClose();
        else dialog.onResult(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  const alertFn = useCallback((input: string | AlertOptions) => {
    return new Promise<void>((resolve) => {
      const message = typeof input === 'string' ? input : input.message;
      const title = typeof input === 'string' ? undefined : input.title;
      const okLabel = typeof input === 'string' ? 'ตกลง' : (input.okLabel ?? 'ตกลง');
      setDialog({
        kind: 'alert',
        title,
        message,
        okLabel,
        onClose: () => {
          setDialog(null);
          resolve();
        },
      });
    });
  }, []);

  const confirmFn = useCallback((input: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        kind: 'confirm',
        title: input.title,
        message: input.message,
        confirmLabel: input.confirmLabel ?? 'ยืนยัน',
        cancelLabel: input.cancelLabel ?? 'ยกเลิก',
        variant: input.variant ?? 'default',
        onResult: (ok) => {
          setDialog(null);
          resolve(ok);
        },
      });
    });
  }, []);

  const dismiss = () => {
    if (!dialog) return;
    if (dialog.kind === 'alert') dialog.onClose();
    else dialog.onResult(false);
  };

  return (
    <DialogContext.Provider value={{ alert: alertFn, confirm: confirmFn }}>
      {children}
      <AnimatePresence>
        {dialog ? (
          <motion.div
            key="app-dialog-shell"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <button
              type="button"
              aria-label="ปิด"
              className="absolute inset-0 bg-deep-obsidian/55 backdrop-blur-[6px]"
              onClick={dismiss}
            />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={dialog.title ? 'app-dialog-title' : undefined}
              aria-describedby="app-dialog-desc"
              className={cn(
                'relative w-full max-w-[min(100%,420px)] rounded-2xl border border-outline-variant/25 bg-surface shadow-[0_24px_64px_-12px_rgba(4,22,39,0.35)] overflow-hidden font-body',
              )}
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.28, ease: easeOut }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-2">
                {dialog.title ? (
                  <h2
                    id="app-dialog-title"
                    className="font-headline text-lg font-semibold text-on-surface mb-2"
                  >
                    {dialog.title}
                  </h2>
                ) : null}
                <p
                  id="app-dialog-desc"
                  className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap"
                >
                  {dialog.message}
                </p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end px-6 py-5 bg-surface-container-low/60 border-t border-outline-variant/15">
                {dialog.kind === 'confirm' ? (
                  <>
                    <MotionButton
                      variant="secondary"
                      size="md"
                      type="button"
                      className="w-full sm:w-auto min-w-[100px]"
                      onClick={() => dialog.onResult(false)}
                    >
                      {dialog.cancelLabel}
                    </MotionButton>
                    <MotionButton
                      variant={dialog.variant === 'danger' ? 'danger' : 'primary'}
                      size="md"
                      type="button"
                      className="w-full sm:w-auto min-w-[100px]"
                      onClick={() => dialog.onResult(true)}
                    >
                      {dialog.confirmLabel}
                    </MotionButton>
                  </>
                ) : (
                  <MotionButton
                    variant="primary"
                    size="md"
                    type="button"
                    className="w-full sm:w-auto min-w-[100px] sm:ml-auto"
                    onClick={() => dialog.onClose()}
                  >
                    {dialog.okLabel}
                  </MotionButton>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}
