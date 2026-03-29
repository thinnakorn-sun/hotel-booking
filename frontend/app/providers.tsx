'use client';

import { AppDialogProvider } from '@/components/providers/app-dialog-provider';
import { RouteTransition } from '@/components/ui/route-transition';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppDialogProvider>
      <RouteTransition>{children}</RouteTransition>
    </AppDialogProvider>
  );
}
