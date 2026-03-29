import { ENV_DEFAULTS } from '../config/env-defaults';

/**
 * `CORS_ORIGIN` may be a single URL or comma-separated list (production + preview URLs).
 */
export function resolveCorsOrigin(value: string | undefined): string | string[] {
  const raw = value?.trim() || ENV_DEFAULTS.CORS_ORIGIN;
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return ENV_DEFAULTS.CORS_ORIGIN;
  if (parts.length === 1) return parts[0];
  return parts;
}
