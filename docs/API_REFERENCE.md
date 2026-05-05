# API Reference — Complete Endpoint Documentation

All API routes are located under `app/api/` and follow the Next.js 15 App Router convention. Every endpoint requires authentication via Supabase session unless otherwise noted.

---

## Table of Contents

1. [AI Endpoints](#1-ai-endpoints)
2. [Credits Endpoints](#2-credits-endpoints)
3. [Auth Endpoints](#3-auth-endpoints)
4. [Health Endpoint](#4-health-endpoint)
5. [Error Codes](#5-error-codes)
6. [Rate Limits](#6-rate-limits)
7. [Authentication](#7-authentication)

---

## 1. AI Endpoints

All AI endpoints are rate-limited to **15 requests/minute** per IP and have a **60-second function timeout** on Vercel.

---

### `POST /api/ai/generate`

Generate AI-powered content for resume sections.

**Request:**
```json
{
  "type": "summary" | "experience" | "project",
  "query": "Describe your role/project in detail...",
  "userId": "uuid (optional, for credit tracking)"
}
```

**Validation:**
- `type` must be one of: `summary`, `experience`, `project`
- `query` must be 5–500 characters

**Response (200):**
```json
{
  "content": "Generated professional content...",
  "type": "summary",
  "model": "gpt-4o-mini",
  "creditsUsed": 1
}
```

**Credit Cost:** 1 credit per generation

**Errors:**
| Status | Meaning |
|--------|---------|
| 400 | Invalid type or query too short/long |
| 401 | Not authenticated |
| 402 | Insufficient credits |
| 429 | Rate limited |
| 500 | AI provider error |

---

### `POST /api/ai/analyze`

Run a comprehensive AI analysis on a complete resume.

**Request:**
```json
{
  "resumeData": { /* Full ResumeData object */ },
  "resumeId": "uuid",
  "analysisType": "full_analysis" | "skill_job_match"
}
```

**Response (200):**
```json
{
  "analysis": {
    "skillsAnalysis": [
      { "name": "React", "proficiency": 90, "category": "Frontend" },
      { "name": "Node.js", "proficiency": 85, "category": "Backend" }
    ],
    "jobMatches": [
      {
        "title": "Senior Frontend Engineer",
        "matchPercentage": 92,
        "reasoning": "Strong React/TypeScript background...",
        "salaryRange": "$130K-$180K"
      }
    ],
    "summary": "Strong technical profile with excellent frontend skills...",
    "overallScore": 85,
    "strengths": ["Clear quantified achievements", "Strong technical depth"],
    "improvements": ["Add more leadership examples", "Include certifications"]
  },
  "saved": true,
  "creditsUsed": 3
}
```

**Credit Cost:** 3 credits

---

### `POST /api/ai/generate-cover-letter`

Generate a tailored cover letter from resume data and a job description.

**Request:**
```json
{
  "resumeData": { /* Full ResumeData object */ },
  "jobDescription": "Full job posting text...",
  "jobTitle": "Senior Software Engineer",
  "companyName": "TechCorp",
  "specialInstructions": "Emphasize leadership experience (optional)"
}
```

**Response (200):**
```json
{
  "coverLetter": "Dear Hiring Manager,\n\nI am writing to express...",
  "resumeOptimizationSuggestions": [
    "Add Docker to your skills section",
    "Quantify your team leadership experience"
  ],
  "creditsUsed": 5
}
```

**Credit Cost:** 5 credits (generation) / 3 credits (improvement)

---

### `POST /api/ai/parse-resume`

Upload and parse a PDF resume into structured data.

**Request:** `multipart/form-data`
- `file`: PDF file (max 10MB)

**Response (200):**
```json
{
  "resumeData": {
    "personalInfo": { "name": "...", "email": "..." },
    "experience": [...],
    "education": [...],
    "skills": { ... },
    "projects": [...]
  },
  "rawText": "Extracted plain text from PDF...",
  "confidence": 0.85
}
```

---

### `POST /api/ai/skill-job-match`

Analyze how well a resume's skills match a specific job.

**Request:**
```json
{
  "resumeData": { /* Full ResumeData object */ },
  "jobDescription": "Full job posting text...",
  "jobTitle": "Data Scientist"
}
```

**Response (200):**
```json
{
  "matchPercentage": 78,
  "matchedSkills": ["Python", "Machine Learning", "SQL"],
  "missingSkills": ["Spark", "Airflow"],
  "recommendations": ["Add big data experience", "Highlight ML projects"],
  "creditsUsed": 3
}
```

**Credit Cost:** 3 credits

---

### `GET /api/ai/analysis`

Retrieve a saved analysis for a specific resume.

**Query Parameters:**
- `resumeId` (required): UUID of the resume
- `analysisType` (optional): `full_analysis` (default) or `skill_job_match`

**Response (200):**
```json
{
  "analysis": { /* ResumeAnalysisRow */ },
  "exists": true
}
```

---

### `GET /api/ai/diagnostic`

Check AI provider configuration status. Useful for debugging.

**Response (200):**
```json
{
  "provider": "OpenAI",
  "configured": true,
  "model": "gpt-4o-mini",
  "message": "AI features enabled with OpenAI"
}
```

---

## 2. Credits Endpoints

Credits endpoints have a **30-second function timeout** on Vercel.

---

### `GET /api/credits`

Get the current user's credit balance and monthly usage.

**Response (200):**
```json
{
  "balance": {
    "current": 7,
    "used_this_month": 13,
    "monthly_limit": 10,
    "subscription_tier": "free",
    "reset_date": "2024-03-01T00:00:00Z"
  }
}
```

---

### `POST /api/credits`

Consume credits for an AI feature.

**Request:**
```json
{
  "feature": "resume_summary",
  "description": "Generated summary for Software Engineer resume"
}
```

**Response (200):**
```json
{
  "success": true,
  "newBalance": 6,
  "creditsUsed": 1
}
```

**Response (402 — Insufficient Credits):**
```json
{
  "error": "Insufficient credits",
  "required": 3,
  "current": 1,
  "purchaseUrl": "/profile?tab=billing"
}
```

---

### `GET /api/credits/history`

Get credit usage history for the authenticated user.

**Query Parameters:**
- `limit` (optional, default 50): Max results
- `offset` (optional, default 0): Pagination offset

**Response (200):**
```json
{
  "history": [
    {
      "id": "uuid",
      "feature": "resume_analysis",
      "credits_used": 3,
      "description": "Analyzed resume: Software Engineer",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "feature": "purchase",
      "credits_used": -50,
      "description": "Credit purchase: 50 credits",
      "created_at": "2024-01-14T08:00:00Z"
    }
  ],
  "total": 25
}
```

---

### `POST /api/credits/purchase`

Create a Stripe checkout session for credit purchase or subscription upgrade.

**Request (Credit Package):**
```json
{
  "type": "credits",
  "packageId": "credits_50"
}
```

**Request (Subscription):**
```json
{
  "type": "subscription",
  "tier": "pro"
}
```

**Available Packages:**
| Package ID | Credits | Price |
|-----------|---------|-------|
| `credits_10` | 10 | $2.99 |
| `credits_50` | 50 | $9.99 |
| `credits_100` | 100 | $14.99 |
| `credits_250` | 250 | $29.99 |

**Response (200):**
```json
{
  "sessionUrl": "https://checkout.stripe.com/c/pay/..."
}
```

---

### `POST /api/credits/webhook`

Stripe webhook handler. **Not authenticated by user session** — uses Stripe webhook signature verification.

**Headers Required:**
- `stripe-signature`: Stripe webhook signature

**Handled Events:**
- `checkout.session.completed` — Add credits or activate subscription
- `customer.subscription.updated` — Tier changes
- `customer.subscription.deleted` — Downgrade to free

---

## 3. Auth Endpoints

---

### `GET /api/auth/callback`

Handles Supabase OAuth callback after social login (Google, GitHub, etc.).

**Flow:**
1. User clicks "Sign in with Google"
2. Redirected to Supabase Auth → Google OAuth
3. Google redirects back to `/api/auth/callback?code=...`
4. Server exchanges code for session
5. Redirects to `/dashboard` (or `/onboarding` for new users)

---

## 4. Health Endpoint

---

### `GET /api/health`

System health check. **No authentication required** for basic check. Verbose mode requires `HEALTH_CHECK_TOKEN`.

**Basic Response (200):**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Verbose Response (with `Authorization: Bearer <HEALTH_CHECK_TOKEN>`):**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00Z",
  "memory": {
    "heapUsed": "45MB",
    "heapTotal": "80MB",
    "rss": "120MB"
  },
  "requests": {
    "total": 15000,
    "active": 3,
    "avgResponseTime": "320ms"
  },
  "cache": {
    "resumeCache": { "size": 150, "hitRate": "85%" },
    "userCache": { "size": 300, "hitRate": "92%" },
    "aiCache": { "size": 50, "hitRate": "60%" }
  },
  "rateLimit": {
    "activeKeys": 45,
    "blockedCount": 2
  },
  "aiQueue": {
    "pending": 1,
    "active": 2,
    "circuitState": "closed"
  }
}
```

**Status Values:**
| Status | Meaning |
|--------|---------|
| `healthy` | All systems normal |
| `degraded` | Some issues detected (high memory, slow responses) |
| `unhealthy` | Critical issues (service down, circuit breaker open) |

---

## 5. Error Codes

All API errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE (optional)"
}
```

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | `INVALID_REQUEST` | Malformed request or validation failure |
| 401 | `UNAUTHORIZED` | No valid session |
| 402 | `INSUFFICIENT_CREDITS` | Not enough AI credits |
| 403 | `FORBIDDEN` | Access denied |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server-side error |
| 503 | `SERVICE_UNAVAILABLE` | AI provider down (circuit breaker open) |

---

## 6. Rate Limits

All rate limits are enforced by the middleware on every request:

| Endpoint Pattern | Requests/Minute | Burst Limit (5s) |
|-----------------|-----------------|-------------------|
| General pages | 120 | 20 |
| `/api/*` | 60 | 20 |
| `/api/ai/*` | 15 | 20 |
| `/api/auth/*` | 20 | 20 |

**Rate Limit Response Headers:**
```
X-RateLimit-Limit: 15
X-RateLimit-Remaining: 12
X-RateLimit-Reset: 1705312260
Retry-After: 45
```

---

## 7. Authentication

All API routes (except `/api/health` and `/api/credits/webhook`) require authentication.

**How it works:**
1. Client includes Supabase session cookies automatically
2. API route calls `supabase.auth.getUser()` to verify session
3. If no valid session → 401 Unauthorized

**Server-side auth check pattern:**
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // user.id is the authenticated user's UUID
}
```
