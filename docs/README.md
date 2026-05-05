# ApexResume — Technical Documentation Hub

> **Version**: 0.1.0 · **Framework**: Next.js 15 (App Router) · **License**: MIT

---

## What is ApexResume?

ApexResume is a **production-grade, AI-powered resume builder** built with Next.js 15, Supabase, and dual AI engines (OpenAI GPT-4o / Google Gemini 2.0). It enables users to create, edit, analyze, and export professional resumes — all from a single, beautifully designed interface.

### Core Value Propositions

| Pillar | Description |
|--------|-------------|
| **AI-Assisted Writing** | Generate summaries, experience bullets, and project descriptions with one click using GPT-4o-mini |
| **Comprehensive Analysis** | Get an AI-driven score on your resume with skill breakdowns, job match percentages, and actionable feedback |
| **ATS Optimization** | Ensure your resume passes Applicant Tracking Systems with targeted keyword analysis |
| **Cover Letter Generation** | Auto-generate tailored cover letters from your resume + a job description |
| **Multi-Template Export** | Choose from 5+ professional templates and export pixel-perfect PDFs |
| **Credits Economy** | Fair usage system with free tier (10 credits), Pro ($9.99/mo), and Premium ($19.99/mo) tiers |

---

## Documentation Index

### 🏗️ Architecture & Design
- **[System Architecture](./ARCHITECTURE.md)** — Layered design, provider tree, component hierarchy, and key design decisions
- **[Folder Structure](./FOLDER_STRUCTURE.md)** — Complete annotated directory tree for the entire project
- **[Data Flow & Sequences](./DATA_FLOW.md)** — Mermaid diagrams for every major user flow (resume editing, AI, PDF, auth, credits)

### 🗄️ Data & Backend
- **[Database Schema](./DATABASE.md)** — All 7+ tables, every column, RLS policies, stored procedures, triggers, and storage buckets
- **[API Reference](./API_REFERENCE.md)** — Complete REST API docs for all `/api/*` endpoints with request/response examples

### 🤖 AI & Credits
- **[AI Credits System](./AI-CREDITS-SYSTEM.md)** — Credit costs, subscription tiers, packages, Stripe integration guide, and SDK usage

### 🎨 Frontend
- **[Component Reference](./COMPONENTS.md)** — Every major component: props, behavior, and source paths
- **[Template System](./TEMPLATES.md)** — How resume templates work, how to add new ones, and PDF rendering pipeline
- **[Custom Hooks](./HOOKS.md)** — All 9 custom React hooks with signatures, return values, and usage examples

### 🔒 Security & Performance
- **[Security Deep Dive](./SECURITY.md)** — Middleware, CSP, rate limiting, sanitization, CSRF, session security, and audit logging
- **[Performance Guide](./PERFORMANCE.md)** — Caching, circuit breakers, request queues, DB optimization, monitoring, and health checks

### 🚀 Operations
- **[Setup & Configuration](./SETUP.md)** — Local dev setup, environment variables, database initialization, and troubleshooting
- **[Deployment Guide](./DEPLOYMENT.md)** — Vercel deployment, CI/CD, function timeouts, CORS, and production checklist
- **[Testing Strategy](./TESTING.md)** — Test files, security validation scripts, and manual QA procedures

---

## Tech Stack at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                         │
│  Next.js 15 (App Router) · React 19 · Tailwind CSS 3   │
│  Framer Motion · GSAP · Radix UI · Shadcn/ui · Recharts│
│  Lucide Icons · Font Awesome · Montserrat Font          │
├─────────────────────────────────────────────────────────┤
│                   APPLICATION LOGIC                     │
│  9 Custom Hooks · Zod Validation · React Hook Form      │
│  @dnd-kit (Drag & Drop) · html2canvas · jsPDF           │
│  next-themes · next-mdx-remote (Blog)                   │
├─────────────────────────────────────────────────────────┤
│                  SERVICES & AI                          │
│  OpenAI GPT-4o-mini · Google Gemini 2.0 Flash           │
│  CreditsService · ResumeService · AnalysisService       │
│  ProfileService · CoverLetterService · PDFGenerator     │
├─────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE                         │
│  Supabase (Auth + PostgreSQL + Storage)                 │
│  Vercel (Hosting + Edge Functions)                      │
│  Stripe (Payment Integration Ready)                     │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd ResumeBuilder

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# Fill in Supabase + AI keys

# 4. Run
npm run dev
# → http://localhost:3000
```

See **[Setup & Configuration](./SETUP.md)** for the full walkthrough.

---

## Key Features Summary

### Resume Builder
- Real-time live preview with template switching
- Drag-and-drop section reordering via `@dnd-kit`
- Auto-save with debounced writes to Supabase
- Custom sections support (text, list, table types)
- Resume duplication and bulk management

### AI Features (10 different tools)
- Professional summary generation (1 credit)
- Experience bullet point generation (1 credit)
- Project description generation (1 credit)
- Comprehensive resume analysis with radar charts (3 credits)
- ATS compatibility scoring (2 credits)
- Full cover letter generation (5 credits)
- Cover letter improvement (3 credits)
- Full resume content rewrite (5 credits)
- Job match analysis (3 credits)
- Interview preparation content (4 credits)

### User Experience
- Light/dark theme toggle with `next-themes`
- Onboarding flow for first-time users
- User profile with avatar upload (Supabase Storage)
- Notification preferences management
- Security settings dashboard with session tracking
- Blog system powered by MDX (8 articles)

### Export & Sharing
- Client-side PDF generation (html2canvas + jsPDF)
- A4/Letter page format with high-DPI rendering
- ATS-optimized plain-text export
- Multiple PDF generation strategies for reliability

---

## Project Metrics

| Metric | Value |
|--------|-------|
| **Total Dependencies** | 52 (prod) + 8 (dev) |
| **App Routes** | 16+ pages |
| **API Endpoints** | 12+ routes |
| **UI Components** | 59 Shadcn/ui primitives |
| **Custom Hooks** | 9 |
| **Service Classes** | 6 |
| **Resume Templates** | 5 (Classic, Modern, Creative, Minimal, Photo) |
| **Database Tables** | 7+ |
| **SQL Scripts** | 11 |
| **Blog Posts** | 8 MDX articles |
| **Test Files** | 5 |
