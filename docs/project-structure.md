# Project Structure: Pethuk Jodoh

> **Pethuk Jodoh** — A modern Islamic Ta'aruf (matchmaking) platform built with Next.js 16, Better Auth, Drizzle ORM, PostgreSQL, Tailwind CSS v4, and shadcn/ui components.

```
pethuk-jodoh/
```

---

## Top-Level Files

| File | Description |
| :--- | :--- |
| `.env` | Environment variables (DATABASE_URL, auth secrets, Resend API key, etc.) |
| `.gitignore` | Git ignore rules for node_modules, .next, .env, etc. |
| `.prettierignore` | Files/directories excluded from Prettier formatting |
| `.prettierrc` | Prettier configuration (code formatting rules) |
| `.versionrc` | Standard-version config for automated changelog & semantic versioning |
| `AGENTS.md` | Agent instructions (Next.js rules for AI coding assistants) |
| `bun.lock` | Bun package manager lockfile |
| `bunfig.toml` | Bun runtime configuration |
| `CLAUDE.md` | Claude AI assistant instructions/context |
| `commitlint.config.js` | Commit message linting (extends @commitlint/config-conventional) |
| `components.json` | shadcn/ui configuration (style, aliases, Tailwind setup) |
| `drizzle.config.ts` | Drizzle ORM config (PostgreSQL dialect, schema path, migration output) |
| `eslint.config.mjs` | ESLint flat config with Next.js plugin |
| `next-env.d.ts` | TypeScript declarations for Next.js types |
| `next.config.ts` | Next.js 16 config (enables React Compiler) |
| `opencode.jsonc` | OpenCode configuration for the editor |
| `package.json` | Project manifest: dependencies, scripts (dev, build, test, db:*, release, etc.) |
| `postcss.config.mjs` | PostCSS config (uses @tailwindcss/postcss v4) |
| `README.md` | Project README |
| `skills-lock.json` | Skills/agent capability lockfile |
| `tsconfig.json` | TypeScript config (ES2017 target, strict mode, @/\* path alias) |

---

## Directories Overview

| Directory | Description |
| :--- | :--- |
| `.next/` | Next.js build output (generated) |
| `.agents/` | AI agent skills & configurations |
| `.husky/` | Git hooks (pre-commit, commit-msg) |
| `docs/` | Project documentation |
| `drizzle/` | Database migration files & metadata |
| `public/` | Static assets served at the root |
| `src/` | Application source code |

---

## `src/` — Application Source Code

```
src/
  proxy.ts
  routes.ts
  app/
  components/
  config/
  db/
  hooks/
  lib/
  __tests__/
  tests/
```

| File/Directory | Description |
| :--- | :--- |
| `proxy.ts` | Next.js 16 Edge Proxy: session-based auth routing, public/private route protection, username setup flow |
| `routes.ts` | Route definitions: publicRoutes, authRoutes, apiAuthPrefix, DEFAULT_LOGIN_REDIRECT |
| `app/` | Next.js App Router (pages, layouts, API routes) |
| `components/` | Reusable React components |
| `config/` | Application configuration constants |
| `db/` | Database layer (Drizzle ORM client & schema) |
| `hooks/` | Custom React hooks |
| `lib/` | Shared utilities, auth setup, validations, constants |
| `__tests__/` | Unit/integration tests (Bun test runner) |
| `tests/` | Test setup & configuration |

---

### `src/app/` — Next.js App Router

```
src/app/
  layout.tsx
  page.tsx
  globals.css
  favicon.ico
  (auth)/
    signin/page.tsx
    signup/page.tsx
    setup-username/page.tsx
    onboard-username/
  (dashboard)/
    layout.tsx
    dashboard/page.tsx
  actions/
  api/
    auth/[...all]/route.ts
```

| File/Directory | Description |
| :--- | :--- |
| `layout.tsx` | Root layout: Geist fonts, ThemeProvider, NextTopLoader, TooltipProvider, Sonner Toaster |
| `page.tsx` | Landing page (placeholder) |
| `globals.css` | Global CSS with Tailwind directives and CSS variables |
| `(auth)/` | Auth route group (parenthesized = no URL segment) |
| `(auth)/signin/page.tsx` | Sign-in page |
| `(auth)/signup/page.tsx` | Sign-up page |
| `(auth)/setup-username/page.tsx` | Username setup page (post-Google signup flow) |
| `(auth)/onboard-username/` | Empty directory (placeholder for onboarding flow) |
| `(dashboard)/layout.tsx` | Dashboard layout wrapper with sidebar |
| `(dashboard)/dashboard/page.tsx` | Dashboard home page |
| `actions/` | Server actions directory (empty) |
| `api/auth/[...all]/route.ts` | Catch-all Better Auth API handler |

---

### `src/components/` — React Components

```
src/components/
  app-sidebar.tsx
  brand-logo.tsx
  theme-provider.tsx
  navbar.tsx
  nav-main.tsx
  nav-user.tsx
  auth/
  layout/
  ui/
```

| File | Description |
| :--- | :--- |
| `app-sidebar.tsx` | Application sidebar component (may duplicate layout/app-sidebar.tsx) |
| `brand-logo.tsx` | Brand logo component |
| `theme-provider.tsx` | Theme provider wrapper (next-themes: system default, class-based) |
| `navbar.tsx` | Top navigation bar component |
| `nav-main.tsx` | Main navigation links component |
| `nav-user.tsx` | User menu/navigation component |

#### `src/components/auth/`

| File | Description |
| :--- | :--- |
| `setup-username-form.tsx` | Form for setting up a username after registration |
| `user-auth-form.tsx` | Sign-in form component |
| `user-sign-up-form.tsx` | Sign-up form component |
| `username-input.tsx` | Reusable username input field with availability checking |

#### `src/components/layout/`

| File | Description |
| :--- | :--- |
| `app-sidebar.tsx` | Sidebar with navigation for the app layout |
| `nav-main.tsx` | Main sidebar navigation items |
| `nav-user.tsx` | User section in the sidebar |
| `navbar.tsx` | Top navbar for authenticated layouts |
| `theme-toggle.tsx` | Dark/light theme toggle button |

#### `src/components/ui/` — shadcn/ui Primitives

| File | Description |
| :--- | :--- |
| `avatar.tsx` | Avatar component (Radix UI) |
| `button.tsx` | Button with variants (default, destructive, outline, secondary, ghost, link) |
| `card.tsx` | Card component (card, header, title, description, content, footer) |
| `checkbox.tsx` | Checkbox component |
| `dropdown-menu.tsx` | Dropdown menu component |
| `form.tsx` | Form components (Form, FormField, FormItem, FormLabel, FormControl, FormMessage) |
| `input-group.tsx` | Input group wrapper component |
| `input.tsx` | Text input component |
| `label.tsx` | Label component |
| `separator.tsx` | Visual separator/divider |
| `sheet.tsx` | Sheet/slide-over panel component |
| `sidebar.tsx` | Sidebar container component |
| `skeleton.tsx` | Loading skeleton placeholder |
| `sonner.tsx` | Toast notification provider (Sonner) |
| `textarea.tsx` | Multi-line text input |
| `tooltip.tsx` | Tooltip component |

---

### `src/config/` — Application Configuration

| File | Description |
| :--- | :--- |
| `app.ts` | App config: name, description, version, route map, social provider flags |

---

### `src/db/` — Database Layer (Drizzle ORM)

| File | Description |
| :--- | :--- |
| `index.ts` | Drizzle client setup: PostgreSQL connection via postgres.js, exports `db` and `client` |
| `schema.ts` | Database schema definitions: user, session, account, verification tables |

---

### `src/hooks/` — Custom React Hooks

| File | Description |
| :--- | :--- |
| `use-mobile.ts` | `useIsMobile()` — tracks viewport width against 768px breakpoint |
| `use-username-availability.ts` | `useUsernameAvailability()` — debounced check if a username is available via Better Auth API |

---

### `src/lib/` — Shared Utilities & Libraries

```
src/lib/
  utils.ts
  auth.ts
  auth-client.ts
  email-templates.ts
  constants/
    auth.ts
  validations/
    auth.ts
```

| File | Description |
| :--- | :--- |
| `utils.ts` | `cn()` utility — merges Tailwind classes via clsx + tailwind-merge |
| `auth.ts` | Server-side Better Auth configuration (Drizzle adapter, email/password, Google OAuth, username & admin plugins) |
| `auth-client.ts` | Client-side Better Auth client: exports useSession, signIn, signUp, signOut |
| `email-templates.ts` | HTML email template for verification emails |
| `constants/auth.ts` | Role constants: CANDIDATE, MEDIATOR, ADMIN |
| `validations/auth.ts` | Zod schemas for auth forms (signInSchema, signUpSchema) and TypeScript types |

---

### `src/__tests__/` — Test Files

| File | Description |
| :--- | :--- |
| `auth.test.ts` | Authentication-related tests |
| `utils.test.ts` | Utility function tests (e.g., cn()) |

---

### `src/tests/` — Test Setup

| File | Description |
| :--- | :--- |
| `setup.ts` | Test environment setup (Bun test globals, mocks) |

---

## `docs/` — Documentation

| File | Description |
| :--- | :--- |
| `prd.md` | Product Requirements Document |
| `project-structure.md` | This file — project structure documentation |
| `roadmap.md` | Project development roadmap |
| `taaruf.md` | Ta'aruf (Islamic matchmaking) domain knowledge / guidelines |

---

## `drizzle/` — Database Migrations

| File | Description |
| :--- | :--- |
| `0000_cultured_kitty_pryde.sql` | Migration 0000: initial schema |
| `0001_parallel_molly_hayes.sql` | Migration 0001 |
| `0002_magical_manta.sql` | Migration 0002 |
| `0003_nifty_jackal.sql` | Migration 0003 |
| `0004_opposite_justin_hammer.sql` | Migration 0004 |
| `meta/_journal.json` | Drizzle migration journal (tracks applied migrations) |
| `meta/0000_snapshot.json` — `meta/0004_snapshot.json` | Schema snapshots for each migration |

---

## `.husky/` — Git Hooks

| File | Description |
| :--- | :--- |
| `pre-commit` | Hook: runs lint-staged (Prettier formatting on staged files) |
| `commit-msg` | Hook: validates commit messages via commitlint |

---

## `.agents/` — AI Agent Skills

Contains AI agent skill definitions for specialized tasks (auth, UI, stream, etc.).

---

## `public/` — Static Assets

Default Next.js static assets (SVG icons, logos).

---

## Key Architectural Notes

| Aspect | Details |
| :--- | :--- |
| **Framework** | Next.js 16.2.4 (App Router, React Compiler enabled) |
| **Runtime** | Bun (package manager + test runner) |
| **Language** | TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Database** | PostgreSQL via Drizzle ORM |
| **Auth** | Better Auth (email/password + Google OAuth, username & admin plugins) |
| **Email** | Resend (for email verification) |
| **Validation** | Zod (v4) with react-hook-form |
| **Icons** | Lucide React + HugeIcons |
| **Code Quality** | ESLint 9, Prettier, commitlint, lint-staged, Husky |
| **Versioning** | standard-version (semantic versioning with emoji changelog) |
| **Fonts** | Geist (sans) + Geist Mono |
