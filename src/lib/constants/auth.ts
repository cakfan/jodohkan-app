export const ROLES = {
  CANDIDATE: "candidate",
  MEDIATOR: "mediator",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
