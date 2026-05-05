# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (next lint)
npm run start        # Start production server
npm run build:analyze  # Bundle analysis (ANALYZE=true)
```

There is no test runner configured in this project.

## Architecture Overview

**ApexResume** is a Next.js 15 (App Router) AI-powered resume builder. The stack is TypeScript, React 19, Supabase (auth + PostgreSQL), OpenAI (`gpt-4o-mini`), Shadcn/UI + Tailwind CSS, and Framer Motion/GSAP for animation.

### Request flow for AI features

All AI routes (`/api/ai/*`) follow this pipeline before calling OpenAI:
1. Rate limiting (`lib/rate-limiter.ts` — `aiLimiter`)
2. Auth verification via Supabase service role key
3. Credit deduction (`lib/credits-service.ts` — `CreditsService.deductCredits`)
4. Request deduplication + circuit breaker (`lib/request-queue.ts`)
5. In-memory cache check (`lib/cache.ts` — `aiCache`)

AI features are credit-gated. Each feature type maps to an `AIFeature` enum in `credits-service.ts`. Don't add AI API calls outside this pipeline.

### Service layer (`/lib`)

Business logic lives in static-method service classes:
- `resume-service.ts` — CRUD for resumes, uses in-memory cache (5 min list / 10 min single)
- `credits-service.ts` — credit ledger, deduction, and feature access
- `profile-service.ts` — user profile reads/writes
- `analysis-service.ts` — resume scoring/analysis
- `cover-letter-service.ts` — cover letter generation

All Supabase queries go through services, never directly from components or route handlers.

### Global state (Context API)

Four providers wrap the root layout in `app/layout.tsx`:
- `AuthProvider` (`hooks/use-auth.tsx`) — Supabase session, user object
- `CreditsProvider` (`hooks/use-credits.tsx`) — credit balance
- `PreferencesProvider` (`hooks/use-preferences.tsx`) — user settings
- `ProfileProvider` (`hooks/use-profile.tsx`) — profile data

Use the corresponding hooks (`useAuth`, `useCredits`, etc.) to consume these — never access Supabase auth directly from components.

### Export pipeline (`/lib/ats-resume-exporter/`)

PDF/DOCX/LaTeX/Markdown export is handled by dedicated generators in this directory. PDF uses jsPDF + html2canvas with LaTeX alignment support. These are dynamically imported to avoid bloating the initial bundle.

### Route protection

Protected pages use the `ProtectedRoute` component, which checks `useAuth` and redirects to login. The Next.js middleware (`middleware.ts`) handles rate limiting and security headers (CSP, X-Frame-Options, etc.) at the edge.

## Key Conventions

- **Supabase clients**: Use `lib/supabase.ts` for client-side, `lib/supabase-admin.ts` (service role) for server-side/API routes only.
- **AI config**: Model and key live in `lib/ai-config.ts`. The active provider is OpenAI; the Gemini import (`@google/generative-ai`) is a dead dependency — ignore it.
- **Path alias**: `@/` maps to the project root (set in `tsconfig.json`).
- **Component library**: shadcn/ui components are in `components/ui/`. Add new shadcn components with `npx shadcn@latest add <component>`.
- **Templates**: Resume template configs live in `lib/template-configs.ts`. There are five categories: classic, creative, minimal, modern, photo.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

Copy `.env.example` to `.env.local` to get started. `OPENAI_API_KEY` is optional — the app degrades gracefully with AI features disabled.
