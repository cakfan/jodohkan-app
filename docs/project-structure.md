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
| `next.config.ts` | Next.js 16 config (React Compiler + Supabase Storage image remote pattern) |
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
    signin/
    signup/
    setup-username/
    forgot-password/
    reset-password/
    onboard-username/           (empty — placeholder)
  (dashboard)/
    layout.tsx                  (dashboard layout with sidebar)
    dashboard/page.tsx          (/dashboard)
    cv/edit/                    (/cv/edit)
    temukan/                    (/temukan)
    taaruf/                     (/taaruf)
    admin/review/               (/admin/review — admin only)
  cv/
    [username]/                 (/cv/[username] — public)
  onboarding/
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
| `(auth)/forgot-password/page.tsx` | Forgot password page with spam timer protection |
| `(auth)/reset-password/page.tsx` | Reset password page with token validation |
| `(auth)/onboard-username/` | Empty directory (placeholder for onboarding flow) |
| `onboarding/page.tsx` | Onboarding page (redirects if no session or already completed) |
| `onboarding/layout.tsx` | Onboarding layout wrapper |
| `onboarding/onboarding-form.tsx` | Onboarding form (edukasi adab ta'aruf & pernyataan komitmen) |
| `(dashboard)/layout.tsx` | Dashboard layout wrapper with sidebar; admin skips onboarding check |
| `(dashboard)/dashboard/page.tsx` | Dashboard home page with status overview → `/dashboard` |
| `(dashboard)/cv/edit/page.tsx` | CV Editor server component → `/cv/edit` |
| `(dashboard)/cv/edit/cv-editor-form.tsx` | CV Editor multi-step form (client, 5 steps, Zod validation, partner criteria slider, locked card when published, strips cvStatus from form data) |
| `(dashboard)/temukan/page.tsx` | Temukan Kandidat server component → `/temukan` |
| `(dashboard)/temukan/temukan-client.tsx` | Temukan client (useSearchParams filter, sticky sidebar) |
| `(dashboard)/taaruf/page.tsx` | Ta'aruf request page → `/taaruf` |
| `(dashboard)/taaruf/taaruf-client.tsx` | Ta'aruf client: tabs (Diterima/Dikirim), accept/decline actions, expiry countdown |
| `(dashboard)/admin/review/page.tsx` | Admin review panel → `/admin/review` |
| `(dashboard)/admin/review/review-client.tsx` | Admin review client (approve/reject actions) |
| `cv/[username]/page.tsx` | Public CV detail → `/cv/[username]` |
| `cv/[username]/candidate-detail-client.tsx` | Public CV detail client (tabs, privacy logic via `showFullProfile` — owner/admin lihat info lengkap; tombol "Ajak Ta'aruf" dengan sheet untuk mengirim permintaan) |
| `actions/` | Server actions |
| `actions/profile.ts` | Profile CRUD: `saveProfile()` (guard: block self-approval, reset to pending on edit), `getProfile()`, `reviewCv()`, `togglePublished()` (reset cvStatus to pending on unpublish) |
| `actions/photo.ts` | Photo upload/delete (Supabase Storage + sharp blur) |
| `actions/ktp.ts` | KTP upload/delete |
| `actions/candidates.ts` | Candidate listing: `getCandidates(filters)`, `getPendingReviews()`, `getCandidateByUsername()` (admin bypasses status/gender filter; strips photoUrl/ktpUrl for public) |
| `actions/onboarding.ts` | Onboarding: `completeOnboarding()` — creates wallet with initial balance |
| `actions/taaruf.ts` | Ta'aruf requests: `sendTaarufRequest()` (validates published CV, 24h expiry), `respondToTaarufRequest()` (accept/decline), `getMySentRequests()`, `getMyIncomingRequests()`, `getTaarufRequestCounts()` |
| `api/auth/[...all]/route.ts` | Catch-all Better Auth API handler |

---

### `src/components/` — React Components

```
src/components/
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
| `brand-logo.tsx` | Brand logo component |
| `theme-provider.tsx` | Theme provider wrapper (next-themes: system default, class-based) |
| `navbar.tsx` | Top navigation bar component |
| `nav-main.tsx` | Main navigation links component |
| `nav-user.tsx` | User menu/navigation component |
| `photo-upload.tsx` | Photo upload component with preview, upload/delete (server-side blurred version auto-generated via sharp) |
| `blurred-photo.tsx` | Blurred photo display component (uses server-side blurred image, optional toggle to original) |
| `ktp-upload.tsx` | KTP upload component with OCR extraction (tesseract.js) and auto-fill to CV form |

#### `src/components/auth/`

| File | Description |
| :--- | :--- |
| `setup-username-form.tsx` | Form for setting up a username after registration |
| `user-auth-form.tsx` | Sign-in form component |
| `user-sign-up-form.tsx` | Sign-up form component |
| `forgot-password-form.tsx` | Forgot password form with 5-minute cooldown timer |
| `reset-password-form.tsx` | Reset password form with password confirmation |
| `username-input.tsx` | Reusable username input field with availability checking |

#### `src/components/layout/`

| File | Description |
| :--- | :--- |
| `app-sidebar.tsx` | Sidebar with navigation — candidate nav (`/dashboard`, `/cv/edit`, `/temukan`, `/taaruf`, `/messages`, `/settings`, `/notifications`) vs admin nav (Dashboard, Panel Admin `/admin/review`, Pesan, Pengaturan) |
| `nav-main.tsx` | Main sidebar navigation items |
| `nav-user.tsx` | User section in the sidebar |
| `navbar.tsx` | Top navbar for authenticated layouts — shows CV status pill badge with colored dot |
| `navbar-page-title.tsx` | Client — `usePathname()` maps path to title+description in navbar |
| `sidebar-header.tsx` | Sidebar logo/brand header with Pethuk Jodoh branding |
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
| `select.tsx` | Select dropdown component (base-ui) |
| `separator.tsx` | Visual separator/divider |
| `sheet.tsx` | Sheet/slide-over panel component |
| `sidebar.tsx` | Sidebar container component |
| `skeleton.tsx` | Loading skeleton placeholder |
| `slider.tsx` | Range slider component (base-ui) — range mode with two thumbs for partner age |
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
| `selects.ts` | Shared select objects: `candidateFullSelect` (46 cols), `candidateListSelect` (25 cols) — eliminates duplicate .select() blocks |
| `seed.ts` | Seed script: 10 dummy users (5 male, 5 female), all with approved CVs |
| `seed-admin.ts` | Standalone admin seeder — tries Better Auth API `signUpEmail()` first, falls back to direct DB insert |
| `schema/` | Database schema directory |
| `schema/index.ts` | Re-exports all schema tables |
| `schema/auth-schema.ts` | Better Auth tables: user, session, account, verification, rate_limit |
| `schema/profiles-schema.ts` | Profile table: gender, birthDate, height, weight, skinColor, maritalStatus, photoUrl, photoBlurredUrl, photoBlurred, etc. (RLS enabled) |
| `schema/mediators-schema.ts` | Mediator table |
| `schema/wallets-schema.ts` | Wallet & token_transaction tables |
| `schema/taaruf-schema.ts` | Ta'aruf requests table: sender, recipient, status, message, 24h expiry |

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
  utils-cv-detail.ts
  auth.ts
  auth-client.ts
  email-templates.ts
  get-server-session.ts
  types.ts
  constants/
    auth.ts
    profile.ts
    upload.ts
  validations/
    auth.ts
    profile.ts
```

| File | Description |
| :--- | :--- |
| `utils.ts` | `cn()`, `computeAge(birthDate)`, `computeAgeDateBoundary(age, type)` — age boundary date computation for candidate filters |
| `ktp-ocr.ts` | KTP OCR pipeline: tesseract.js text extraction, `parseKtpText()`, `healNik()`, `nikDateMatches()`, `normalizeNik()`, `mapStartsWith()`, `validateKtpImage()` |
| `supabase-admin.ts` | Supabase admin client (lazy init) for Storage operations: bucket mgmt, upload, delete, public URL. Also exports `extractStoragePath()`, `buildFilePath()` |
| `image-blur.ts` | Server-side image blur utility using sharp (resize 200×200 + blur 50 + JPEG quality 60) |
| `auth.ts` | Server-side Better Auth configuration (Drizzle adapter, email/password, Google OAuth, username & admin plugins, password reset, rate limiting) |
| `auth-client.ts` | Client-side Better Auth client: exports useSession, signIn, signUp, signOut |
| `email-templates.ts` | HTML email templates for verification & password reset emails |
| `get-server-session.ts` | Helpers: `getServerSession()` — wraps `auth.api.getSession()` with headers; `requireAuth()` — returns session or null |
| `utils-cv-detail.ts` | `getDisplayName()` — name formatting (initials + username for public, full name for owner/admin) |
| `constants/auth.ts` | Role constants: CANDIDATE, MEDIATOR, ADMIN |
| `constants/profile.ts` | Shared labels: `CV_STATUS_LABELS`, `MARITAL_LABELS`, `getMaritalLabel()` |
| `constants/upload.ts` | Shared file validation: `validateImageFile()`, `ALLOWED_IMAGE_TYPES`, `MAX_FILE_SIZE` |
| `types.ts` | Shared types: `InferProfileData` — derived from Drizzle schema (`typeof profile.$inferSelect`), re-exported as `ProfileData` in profile.ts |
| `validations/auth.ts` | Zod schemas for auth forms (signInSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema) and TypeScript types |
| `validations/profile.ts` | Zod schemas per step for CV Editor (step1Schema–step5Schema). step1Schema includes optional photoUrl, photoBlurredUrl, photoBlurred. |

---

### `src/__tests__/` — Test Files

| File | Description |
| :--- | :--- |
| `auth.test.ts` | Authentication tests (signIn, signUp, forgotPassword, resetPassword schemas) |
| `candidates.test.ts` | Candidate filter tests (computeAgeDateBoundary with all boundary cases) |
| `cv-editor.test.ts` | CV Editor Zod validation tests (all 5 step schemas, partner fields), auth guard tests |
| `ktp-ocr.test.ts` | KTP OCR pipeline tests (normalizeNik, nikDateMatches, healNik, parseKtpText, extractField, mapStartsWith, validateKtpImage) |
| `onboarding.test.ts` | Onboarding flow tests (adab text, commit state, photo blurring concept) |
| `utils.test.ts` | Utility function tests (cn(), computeAge()) |
| `email-templates.test.ts` | Email template generation tests (verification & password reset) |
| `photo.test.ts` | Photo server action tests (file validation, auth guard) |
| `blurred-photo.test.tsx` | BlurredPhoto component tests (blurredSrc/originalSrc switching, size variants, file type validation) |

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
| `tutorial-supabase-dashboard-2026.md` | Tutorial navigasi dashboard Supabase (API keys, Storage, CORS, RLS policies) |

---

## `drizzle/` — Database Migrations

| File | Description |
| :--- | :--- |
| `0000_secret_felicia_hardy.sql` | Migration 0000: initial auth + profile schema (+ gender) |
| `0001_confused_iron_lad.sql` | Migration 0001: add `smoking_status` to profile |
| `0002_add_rejection_reason.sql` | Migration 0002: add `rejection_reason` to profile |
| `0003_wealthy_living_tribunal.sql` | Migration 0003: create `taaruf_request` table (sender, recipient, status, message, 24h expiry) |
| `meta/_journal.json` | Drizzle migration journal (tracks applied migrations) |
| `meta/0000_snapshot.json` — `meta/0003_snapshot.json` | Schema snapshots for each migration |

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
| **Validation** | Zod (standalone, per-step validation in CV Editor; react-hook-form in auth forms) |
| **Image Processing** | sharp (server-side blur: resize 200×200 + blur 50 + JPEG quality 60) |
| **Icons** | Lucide React + HugeIcons |
| **Code Quality** | ESLint 9, Prettier, commitlint, lint-staged, Husky |
| **Versioning** | standard-version (semantic versioning with emoji changelog) |
| **Fonts** | Geist (sans) + Geist Mono |
