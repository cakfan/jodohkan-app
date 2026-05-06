export const publicRoutes: (string | RegExp)[] = [
  "/",
  "/pricing",
  "/forgot-password",
  "/reset-password",
  /^\/\.well-known\/.+/,
  "/oauth/consent",
  /^\/cv\/[^/]+(?:\/.*)?$/,
];

export const authRoutes: string[] = ["/signin", "/signup"];

export const apiAuthPrefix: string = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT: string = "/";
