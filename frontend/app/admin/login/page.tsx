import { Suspense } from 'react';
import { AdminLoginForm } from './login-form';

function LoginFallback() {
  return (
    <div className="min-h-screen bg-deep-obsidian flex items-center justify-center font-body">
      <div className="w-10 h-10 border-2 border-primary-fixed/30 border-t-primary-fixed rounded-full animate-spin" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
