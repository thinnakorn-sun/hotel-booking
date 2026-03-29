/** Tab-local hint: user recently passed admin login (avoids full-screen gate on client navigations). */
export const ADMIN_AUTH_HINT_KEY = 'majestic_reserve_admin_auth_hint';

export function setAdminAuthHint(): void {
  try {
    sessionStorage.setItem(ADMIN_AUTH_HINT_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearAdminAuthHint(): void {
  try {
    sessionStorage.removeItem(ADMIN_AUTH_HINT_KEY);
  } catch {
    /* ignore */
  }
}

export function readAdminAuthHint(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(ADMIN_AUTH_HINT_KEY) === '1';
  } catch {
    return false;
  }
}
