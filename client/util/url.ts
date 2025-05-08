export function getBaseUrl() {
  // if (typeof window !== "undefined") return window.location.origin;
  // if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? process.env.EXPO_PUBLIC_PORT ?? 8081}`;
}

export function getApiUrl() {
  return `${getBaseUrl()}`;
}
