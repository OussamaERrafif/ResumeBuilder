# Deployment Guide

Complete guide for deploying ApexResume to production, with Vercel as the primary platform.

---

## Table of Contents

1. [Vercel Deployment](#1-vercel-deployment)
2. [Vercel Configuration](#2-vercel-configuration)
3. [Environment Variables (Production)](#3-environment-variables-production)
4. [Domain Setup](#4-domain-setup)
5. [Stripe Webhook Configuration](#5-stripe-webhook-configuration)
6. [Supabase Production Setup](#6-supabase-production-setup)
7. [Pre-Deployment Checklist](#7-pre-deployment-checklist)
8. [Post-Deployment Verification](#8-post-deployment-verification)
9. [Monitoring Production](#9-monitoring-production)
10. [Scaling Considerations](#10-scaling-considerations)

---

## 1. Vercel Deployment

### One-Click Deploy

1. Push your code to **GitHub**
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel auto-detects Next.js — confirm settings
5. Add environment variables (see section 3)
6. Click **Deploy**

### CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (production)
vercel --prod
```

### Automatic Deployments

Once connected to GitHub:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

---

## 2. Vercel Configuration

The `vercel.json` file contains production-specific settings:

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "regions": ["iad1"]
}
```

### Function Timeouts

| Endpoint Pattern | Max Duration | Reason |
|-----------------|-------------|--------|
| `app/api/ai/**/*.ts` | 60 seconds | AI API calls can be slow |
| `app/api/credits/**/*.ts` | 30 seconds | Stripe + DB operations |
| `app/api/health/**/*.ts` | 10 seconds | Quick health check |

### CORS Headers

Applied to all `/api/*` routes:

```json
{
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, ..."
}
```

> **Note**: In production, restrict `Allow-Origin` to your specific domain instead of `*`.

---

## 3. Environment Variables (Production)

In **Vercel Dashboard** → **Project Settings** → **Environment Variables**:

### Required

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | ⚠️ Do NOT make this public |
| `OPENAI_API_KEY` | Server Only | OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | All | Your production URL (e.g., `https://apexresume.com`) |

### Optional

| Variable | Scope | Notes |
|----------|-------|-------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Server Only | Gemini API key |
| `STRIPE_SECRET_KEY` | Server Only | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Server Only | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Server Only | Stripe webhook secret |
| `HEALTH_CHECK_TOKEN` | Server Only | Token for verbose health checks |
| `LOG_LEVEL` | Server Only | Set to `info` for production |

> **Important**: Use Vercel's "Production" scope for production-only values and "Preview" for staging values.

---

## 4. Domain Setup

1. In **Vercel Dashboard** → **Project** → **Domains**
2. Add your custom domain (e.g., `apexresume.com`)
3. Configure DNS:
   - **A Record**: `76.76.21.21` (Vercel)
   - **CNAME**: `cname.vercel-dns.com` (for `www` subdomain)
4. SSL is automatically provisioned by Vercel

### Update Configuration

After setting up your domain, update:
- `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`
- Supabase Auth → **Site URL** to `https://yourdomain.com`
- Supabase Auth → **Redirect URLs** to `https://yourdomain.com/api/auth/callback`
- Stripe webhook URL to `https://yourdomain.com/api/credits/webhook`
- `app/layout.tsx` → `metadataBase` to `new URL("https://yourdomain.com")`

---

## 5. Stripe Webhook Configuration

For production payment processing:

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**: `https://yourdomain.com/api/credits/webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing Secret** → add as `STRIPE_WEBHOOK_SECRET` in Vercel

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
# Windows: scoop install stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/credits/webhook

# This gives you a local webhook secret (whsec_...)
# Use it as STRIPE_WEBHOOK_SECRET in .env.local
```

---

## 6. Supabase Production Setup

### 6.1 Upgrade Plan

For production, consider upgrading from Supabase Free to Pro:
- Free: 500MB DB, 1GB storage, 2GB bandwidth
- Pro: 8GB DB, 100GB storage, 50GB bandwidth

### 6.2 Connection Pooling

Enable connection pooling in Supabase for better performance:
- Go to **Settings** → **Database** → **Connection Pooling**
- Enable **Transaction mode** for serverless

### 6.3 Backup Configuration

- Enable **Point-in-Time Recovery** for production databases
- Set up daily backups (automatic on Pro plan)

### 6.4 Production RLS Verification

Verify all tables have RLS enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

---

## 7. Pre-Deployment Checklist

### Code Quality
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run lint` passes
- [ ] All TypeScript errors resolved
- [ ] No `console.log` in production code (use `logger` from monitoring)

### Environment
- [ ] All required env vars set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] Stripe keys are production keys (not test keys)

### Database
- [ ] All migrations applied
- [ ] RLS enabled on all tables
- [ ] Trigger `on_auth_user_created` is active
- [ ] Storage bucket `avatars` exists with correct policies

### Security
- [ ] CSP headers configured for production domains
- [ ] Rate limiting is active
- [ ] CORS `Allow-Origin` restricted to your domain
- [ ] Stripe webhook secret is set

### SEO
- [ ] `robots.ts` allows indexing
- [ ] `sitemap.ts` generates correctly
- [ ] OpenGraph image exists at `/og-image.jpg`
- [ ] Meta descriptions are set for all pages
- [ ] Structured data schemas are valid

---

## 8. Post-Deployment Verification

After deploying, verify these endpoints work:

```bash
# Health check
curl https://yourdomain.com/api/health

# AI diagnostic
curl https://yourdomain.com/api/ai/diagnostic

# Landing page loads
curl -o /dev/null -s -w "HTTP %{http_code}" https://yourdomain.com

# Security headers present
curl -I https://yourdomain.com | findstr /i "X-Frame-Options"
```

### Manual Testing

1. **Sign up** with a new account → verify profile creation
2. **Create a resume** → verify editor loads and auto-saves
3. **Use AI feature** → verify credits deduct correctly
4. **Export PDF** → verify download works
5. **Switch templates** → verify live preview updates
6. **Upload avatar** → verify image appears
7. **Test on mobile** → verify responsive layout

---

## 9. Monitoring Production

### Health Endpoint

Set up monitoring to ping `/api/health` every 5 minutes:

```bash
curl -H "Authorization: Bearer $HEALTH_CHECK_TOKEN" \
  "https://yourdomain.com/api/health?verbose=true"
```

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response time (avg) | < 500ms | > 2000ms |
| Error rate | < 1% | > 5% |
| Cache hit rate | > 80% | < 50% |
| Memory usage | < 70% | > 90% |
| AI queue length | < 5 | > 20 |
| Circuit breaker state | `closed` | `open` |

### Vercel Analytics

Enable in **Vercel Dashboard** → **Analytics**:
- Web Vitals (LCP, FID, CLS)
- Real user monitoring
- Edge function performance

---

## 10. Scaling Considerations

### Current Architecture Limits

| Component | Current Limit | Bottleneck |
|-----------|--------------|------------|
| Rate limiting | In-memory (per instance) | Not shared across serverless instances |
| Caching | In-memory LRU | Not shared across instances |
| AI queue | 3 concurrent | Per instance |
| DB connections | 5 pooled | Per instance |

### Scaling Recommendations

**For 1K-10K users:** Current architecture works well on Vercel.

**For 10K-100K users:**
- Move rate limiting to **Redis** (Upstash)
- Move caching to **Redis** for shared cache
- Add **database indexes** for common query patterns
- Enable Supabase **read replicas**

**For 100K+ users:**
- Add **CDN** for static assets
- Move AI processing to **dedicated queue** (BullMQ / Inngest)
- Consider **edge functions** for frequently accessed data
- Implement **database sharding** or read replicas
