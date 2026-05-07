const ACCESS_TOKEN_COOKIE = "accessToken";
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const isClient = () => typeof window !== "undefined";

export const setAccessTokenCookie = (
  token: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS
) => {
  if (!isClient()) return;
  const encoded = encodeURIComponent(token);
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
};

export const getAccessTokenCookie = (): string | null => {
  if (!isClient()) return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const row = cookies.find((c) => c.startsWith(`${ACCESS_TOKEN_COOKIE}=`));
  if (!row) return null;

  // Keep full JWT (may include '=' padding) by joining the remainder.
  const encodedValue = row.split("=").slice(1).join("=");
  return encodedValue ? decodeURIComponent(encodedValue) : null;
};

export const clearAccessTokenCookie = () => {
  if (!isClient()) return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
};

