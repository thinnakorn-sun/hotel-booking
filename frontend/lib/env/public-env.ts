function requirePublicEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`${name} is required`);
  }
  return trimmed;
}

export function getApiBaseUrl(): string {
  const raw = requirePublicEnv(
    'NEXT_PUBLIC_API_URL',
    process.env.NEXT_PUBLIC_API_URL,
  );
  return raw.replace(/\/$/, '');
}

export function getSuiteImageFallbackUrl(): string {
  return requirePublicEnv(
    'NEXT_PUBLIC_SUITE_IMAGE_FALLBACK_URL',
    process.env.NEXT_PUBLIC_SUITE_IMAGE_FALLBACK_URL,
  );
}
