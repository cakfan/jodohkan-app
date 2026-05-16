export const publicRoutes: (string | RegExp)[] = [
  "/",
  "/pricing",
  "/lupa-password",
  "/reset-password",
  /^\/\.well-known\/.+/,
  "/oauth/consent",
  /^\/cv\/[^/]+(?:\/.*)?$/,
  "/api/webhooks/xendit",
];

export const authRoutes: string[] = ["/masuk", "/daftar"];

export const apiAuthPrefix: string = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT: string = "/beranda";
