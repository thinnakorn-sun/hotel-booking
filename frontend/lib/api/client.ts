import { getApiBaseUrl } from '@/lib/env/public-env';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

function parseApiErrorBody(
  text: string,
  fallback: string,
): string {
  if (!text.trim()) return fallback;
  try {
    const j = JSON.parse(text) as { message?: string | string[] };
    if (typeof j.message === 'string') return j.message;
    if (Array.isArray(j.message)) return j.message.join(', ');
  } catch {
    return text.length > 200 ? `${text.slice(0, 200)}…` : text;
  }
  return fallback;
}

export async function apiRequestJson<T>(
  path: string,
  errorMessage: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    cache: 'no-store',
    ...init,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseApiErrorBody(text, errorMessage));
  }
  if (!text.trim()) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

/** Attaches Supabase access_token when the user is signed in (admin / staff flows). */
export async function apiRequestJsonWithAuth<T>(
  path: string,
  errorMessage: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  return apiRequestJson<T>(path, errorMessage, { ...init, headers });
}
