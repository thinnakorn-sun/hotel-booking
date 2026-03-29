import { ENV_DEFAULTS } from './env-defaults';

export default () => ({
  port: parseInt(
    process.env.PORT ?? String(ENV_DEFAULTS.PORT),
    10,
  ),
  corsOrigin: process.env.CORS_ORIGIN ?? ENV_DEFAULTS.CORS_ORIGIN,
  supabase: {
    url:
      process.env.SUPABASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
      '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '',
  },
});
