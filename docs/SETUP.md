# Setup & Configuration — Complete Guide

Everything you need to get ApexResume running locally, configure external services, and troubleshoot common issues.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [Environment Variables (Complete)](#3-environment-variables)
4. [Database Initialization](#4-database-initialization)
5. [Supabase Configuration](#5-supabase-configuration)
6. [AI Provider Setup](#6-ai-provider-setup)
7. [Running the App](#7-running-the-app)
8. [Scripts Reference](#8-scripts-reference)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | v18.x+ (v20+ recommended) | Check: `node --version` |
| **npm or pnpm** | npm 9+ or pnpm 8+ | pnpm is preferred but npm works |
| **Supabase Account** | — | Free tier works for development |
| **OpenAI API Key** | — | Required for AI features |
| **Git** | v2.x+ | For cloning the repository |

### Optional (for full features)

| Requirement | Purpose |
|-------------|---------|
| **Google Gemini API Key** | Secondary AI provider |
| **Stripe Account** | Payment processing |
| **Vercel Account** | Deployment |

---

## 2. Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd ResumeBuilder

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Create environment file
copy .env.example .env.local
# Then edit .env.local with your actual keys

# 4. Initialize database
# → Copy scripts/complete-database-schema.sql
# → Run in Supabase Dashboard > SQL Editor

# 5. Start development server
npm run dev
# → Open http://localhost:3000
```

---

## 3. Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Required Variables

```env
# ─── Supabase (REQUIRED) ───────────────────────────────────
# Get these from: Supabase Dashboard → Project Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# ─── AI Provider (REQUIRED for AI features) ────────────────
# Get from: https://platform.openai.com/api-keys

OPENAI_API_KEY=sk-...
```

### Optional Variables

```env
# ─── Google Gemini (OPTIONAL — secondary AI) ───────────────
# Get from: https://makersuite.google.com/app/apikey

GOOGLE_GENERATIVE_AI_API_KEY=AIza...
GEMINI_API_KEY=AIza...

# ─── Stripe (OPTIONAL — for payments) ──────────────────────
# Get from: https://dashboard.stripe.com/apikeys

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create in Stripe Dashboard → Products)
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...

# ─── App Configuration (OPTIONAL) ──────────────────────────

NEXT_PUBLIC_APP_URL=http://localhost:3000    # Used for Stripe redirects
NODE_ENV=development

# ─── Performance & Monitoring (OPTIONAL) ────────────────────

LOG_LEVEL=debug                              # debug | info | warn | error
HEALTH_CHECK_TOKEN=your-secure-token         # For verbose /api/health

# ─── Rate Limiting (OPTIONAL — override defaults) ──────────

RATE_LIMIT_WINDOW=60000                      # Window in ms (default: 60s)
RATE_LIMIT_MAX_REQUESTS=120                  # Max requests per window
```

### Variable Reference Table

| Variable | Required | Public | Default | Description |
|----------|----------|--------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Yes | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Yes | — | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | No | — | Supabase service role (bypasses RLS) |
| `OPENAI_API_KEY` | ✅* | No | — | OpenAI API key (*app works without AI) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ❌ | No | — | Gemini API key |
| `STRIPE_SECRET_KEY` | ❌ | No | — | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | ❌ | No | — | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | ❌ | No | — | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | ❌ | Yes | `localhost:3000` | App base URL |
| `LOG_LEVEL` | ❌ | No | `info` | Server log verbosity |
| `HEALTH_CHECK_TOKEN` | ❌ | No | — | Auth token for verbose health check |

> ⚠️ **Important**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in `NEXT_PUBLIC_` variables.

---

## 4. Database Initialization

### Option A: Master Script (Recommended)

Run the complete schema in one go:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy all contents from `scripts/complete-database-schema.sql`
3. Click **Run**

This creates:
- ✅ All 7 tables (`user_profiles`, `resumes`, `cover_letters`, `ai_credits_usage`, `notification_settings`, `user_preferences`, `security_settings`)
- ✅ All indexes (13 indexes across all tables)
- ✅ All RLS policies (28 policies)
- ✅ All stored procedures (`deduct_credits`, `add_credits`, `get_monthly_credit_usage`)
- ✅ The `handle_new_user` trigger (auto-creates profiles on signup)
- ✅ The `avatars` storage bucket with policies

### Option B: Incremental Scripts

Run individual scripts in order:

```
1. scripts/create-user-profiles-table.sql
2. scripts/create-resumes-table.sql
3. scripts/create-cover-letters-table.sql
4. scripts/create-ai-credits-usage-table.sql
5. scripts/create-user-preferences-table.sql
6. scripts/create-security-settings-table.sql
7. scripts/create-avatar-storage.sql
```

Then run migrations if needed:
```
8. scripts/add-is-onboarded-column.sql
9. scripts/add-referral-source-column.sql
```

---

## 5. Supabase Configuration

### 5.1 Authentication Setup

In **Supabase Dashboard** → **Authentication** → **Providers**:

1. **Email**: Enable email/password authentication
2. **Google** (optional): Add OAuth credentials from Google Cloud Console
3. **GitHub** (optional): Add OAuth app from GitHub Developer Settings

**Site URL Configuration:**
- **Site URL**: `http://localhost:3000` (development) or your production URL
- **Redirect URLs**: Add `http://localhost:3000/api/auth/callback`

### 5.2 Storage Setup

The `complete-database-schema.sql` script creates the `avatars` bucket automatically. If you need to do it manually:

1. Go to **Storage** → **New Bucket**
2. Name: `avatars`
3. Public: ✅ Yes
4. File size limit: 5MB
5. Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### 5.3 Database Settings

Ensure Row Level Security (RLS) is enabled on all tables. This should be done by the SQL scripts, but verify in **Table Editor** → click any table → **RLS** tab.

---

## 6. AI Provider Setup

### OpenAI (Primary)

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env.local` as `OPENAI_API_KEY`
4. The app uses `gpt-4o-mini` by default (configurable in `lib/ai-config.ts`)

**Recommended OpenAI settings:**
- Model: `gpt-4o-mini` (best cost/quality ratio)
- For better quality: change to `gpt-4o` in `lib/ai-config.ts`

### Google Gemini (Optional / Fallback)

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local` as `GOOGLE_GENERATIVE_AI_API_KEY`

### Verify AI Configuration

Start the dev server and visit:
```
http://localhost:3000/api/ai/diagnostic
```

Expected response:
```json
{
  "provider": "OpenAI",
  "configured": true,
  "model": "gpt-4o-mini",
  "message": "AI features enabled with OpenAI"
}
```

---

## 7. Running the App

### Development Mode

```bash
npm run dev
# or
pnpm dev
```

Opens at `http://localhost:3000` with:
- Hot Module Replacement (HMR)
- Error overlay
- React strict mode
- Security middleware in dev mode (bypasses rate limiting for localhost)

### Production Build

```bash
# Build
npm run build

# Start production server
npm start

# Or combined:
npm run start:prod
```

### Bundle Analysis

```bash
npm run build:analyze
```

Opens a visual treemap of your production bundle.

### Health Check

```bash
npm run health
# Equivalent to: curl -s http://localhost:3000/api/health | jq
```

---

## 8. Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Create production build |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint |
| `build:analyze` | `ANALYZE=true next build` | Build with bundle analysis |
| `start:prod` | `NODE_ENV=production next start` | Start production with explicit env |
| `health` | `curl ... /api/health` | Quick health check |

---

## 9. Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Cause:** `.env.local` file is missing or not loaded.
**Fix:** Ensure `.env.local` exists in the project root (not in a subdirectory). Restart the dev server after creating it.

### "Invalid API Key" from Supabase

**Cause:** Wrong key type used.
**Fix:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the `anon` (public) key
- `SUPABASE_SERVICE_ROLE_KEY` = the `service_role` key
- Both are found in Supabase Dashboard → Settings → API

### "OpenAI API Error: 401 Unauthorized"

**Cause:** Invalid or expired OpenAI API key.
**Fix:** Generate a new key from [platform.openai.com](https://platform.openai.com/api-keys). Ensure the key starts with `sk-`.

### "RLS Policy violation" / "new row violates row-level security"

**Cause:** The database trigger `handle_new_user` hasn't been created.
**Fix:** Run `scripts/complete-database-schema.sql` again, specifically the trigger section (section 9).

### Build fails with "Module not found"

**Cause:** Missing dependencies after git pull.
**Fix:**
```bash
del /s /q node_modules
del package-lock.json
npm install
```

### "Port 3000 already in use"

**Fix:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Styles not loading / Tailwind classes not applied

**Cause:** Tailwind config not scanning the right paths.
**Fix:** Verify `tailwind.config.ts` includes all component paths:
```typescript
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './lib/**/*.{js,ts,jsx,tsx,mdx}',
]
```

### AI features show "Not configured"

**Fix:** Check `/api/ai/diagnostic`. If it shows `configured: false`, verify your `OPENAI_API_KEY` in `.env.local`.

### PDF Export produces blank page

**Cause:** Template CSS not loading in the hidden render container.
**Fix:** Ensure the template component doesn't rely on external CSS imports. All PDF-relevant styles should be inline or in the template file itself.
