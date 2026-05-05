# Folder Structure — Complete Annotated Tree

This document provides a fully annotated directory structure for the ApexResume project.

```
ResumeBuilder/
│
├── .env.example                    # Template for environment variables
├── .env.local                      # Local environment variables (NOT committed)
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore rules
├── CONTRIBUTING.md                 # Contribution guidelines
├── LICENSE                         # MIT License
├── README.md                       # Project README (root)
├── SECURITY.md                     # Security features documentation
├── components.json                 # Shadcn/ui configuration
├── middleware.ts                   # Next.js security middleware (rate limiting, CSP, headers)
├── next-env.d.ts                   # Next.js TypeScript declarations
├── next.config.mjs                 # Next.js configuration (optimizations, headers, caching)
├── package.json                    # Dependencies & scripts
├── postcss.config.mjs              # PostCSS configuration
├── tailwind.config.ts              # Tailwind CSS theme configuration
├── tempalte.ltx                    # LaTeX template reference
├── tsconfig.json                   # TypeScript configuration
├── vercel.json                     # Vercel deployment configuration
│
├── app/                            # ═══ NEXT.JS APP ROUTER ═══
│   ├── globals.css                 # Global styles, CSS custom properties, animations
│   ├── layout.tsx                  # Root layout (Provider tree, fonts, metadata, SEO)
│   ├── page.tsx                    # Landing page (public homepage)
│   ├── loading.tsx                 # Global loading skeleton
│   ├── error.tsx                   # Global error boundary
│   ├── global-error.tsx            # Root error boundary (catches layout errors)
│   ├── not-found.tsx               # Custom 404 page
│   ├── robots.ts                   # robots.txt generator
│   ├── sitemap.ts                  # Dynamic sitemap.xml generator
│   │
│   ├── admin/                      # Admin panel
│   │   └── page.tsx                # Security dashboard page
│   │
│   ├── api/                        # ═══ API ROUTES ═══
│   │   ├── ai/                     # AI-related endpoints
│   │   │   ├── analyze/route.ts    # POST: Comprehensive resume analysis
│   │   │   ├── analysis/route.ts   # GET/POST: Saved analysis CRUD
│   │   │   ├── generate/route.ts   # POST: Content generation (summary/experience/project)
│   │   │   ├── generate-cover-letter/route.ts  # POST: Cover letter generation
│   │   │   ├── parse-resume/route.ts           # POST: PDF resume parsing
│   │   │   ├── skill-job-match/route.ts        # POST: Skill-to-job matching
│   │   │   └── diagnostic/route.ts             # GET: AI configuration check
│   │   │
│   │   ├── auth/                   # Authentication
│   │   │   └── callback/route.ts   # GET: Supabase OAuth callback handler
│   │   │
│   │   ├── credits/                # Credit system
│   │   │   ├── route.ts            # GET: Balance, POST: Use credits
│   │   │   ├── history/route.ts    # GET: Usage history
│   │   │   ├── purchase/route.ts   # POST: Create Stripe session
│   │   │   └── webhook/route.ts    # POST: Stripe webhook handler
│   │   │
│   │   ├── health/                 # System health
│   │   │   └── route.ts            # GET: Health check endpoint
│   │   │
│   │   └── security-example/       # Security API example
│   │       └── route.ts            # Example secured route
│   │
│   ├── blogs/                      # Blog system
│   │   ├── page.tsx                # Blog index page
│   │   ├── [slug]/page.tsx         # Individual blog post
│   │   └── layout.tsx              # Blog layout
│   │
│   ├── components/                 # ═══ CORE APP COMPONENTS ═══
│   │   ├── resume-builder.tsx      # [75KB] Main resume editor (state, forms, preview)
│   │   ├── ai-modal.tsx            # AI interaction modal (generate, analyze)
│   │   ├── resume-analysis.tsx     # [20KB] Analysis visualization (charts, scores)
│   │   └── templates/              # Resume template system
│   │       ├── index.tsx           # Template exports
│   │       ├── preview/            # Template preview components
│   │       │   ├── index.tsx       # Preview registry
│   │       │   ├── classic.tsx     # Classic template
│   │       │   ├── modern.tsx      # Modern template
│   │       │   ├── creative.tsx    # Creative template
│   │       │   ├── minimal.tsx     # Minimal template
│   │       │   ├── photo.tsx       # Photo template
│   │       │   └── types.ts       # Template type definitions
│   │       └── selector/           # Template selection UI
│   │           ├── index.tsx       # Selector component
│   │           └── ...             # Template thumbnails
│   │
│   ├── cover-letters/              # Cover letter pages
│   │   └── page.tsx                # Cover letter management
│   │
│   ├── dashboard/                  # Authenticated dashboard
│   │   ├── page.tsx                # Resume list & management
│   │   └── [id]/page.tsx           # Resume builder page (dynamic route)
│   │
│   ├── faq/                        # FAQ section
│   │   ├── page.tsx                # FAQ page
│   │   ├── layout.tsx              # FAQ layout
│   │   └── faq-content.tsx         # FAQ data/content
│   │
│   ├── maintenance/                # Maintenance mode
│   │   └── page.tsx                # Maintenance landing
│   │
│   ├── onboarding/                 # First-time user setup
│   │   └── page.tsx                # Onboarding wizard
│   │
│   ├── privacy/                    # Legal
│   │   └── page.tsx                # Privacy policy
│   │
│   ├── profile/                    # User profile & settings
│   │   ├── page.tsx                # Profile page with tabs
│   │   └── layout.tsx              # Profile layout
│   │
│   ├── reset-password/             # Password reset
│   │   └── page.tsx                # Password reset form
│   │
│   ├── setup/                      # Initial setup
│   │   └── page.tsx                # Setup wizard
│   │
│   ├── terms/                      # Legal
│   │   └── page.tsx                # Terms of service
│   │
│   ├── types/                      # App-level types
│   │   └── template.ts             # Template-specific types
│   │
│   └── unauthorized/               # Error pages
│       └── page.tsx                # 401 unauthorized
│
├── components/                     # ═══ SHARED COMPONENTS ═══
│   ├── auth/                       # Auth components
│   │   ├── login-form.tsx          # Login form
│   │   └── signup-form.tsx         # Signup form
│   │
│   ├── credits/                    # Credits UI
│   │   ├── credits-components.tsx  # Balance, purchase modal, history
│   │   └── index.ts               # Exports
│   │
│   ├── landing/                    # Landing page sections (13 components)
│   │   ├── index.ts               # Barrel exports
│   │   ├── navigation.tsx         # Main navigation bar
│   │   ├── hero-section.tsx       # Hero banner with CTA
│   │   ├── hero-dashboard-preview.tsx  # [16KB] Animated dashboard preview
│   │   ├── features-section.tsx   # Feature highlights
│   │   ├── value-props-section.tsx # [10KB] Value propositions
│   │   ├── templates-section.tsx  # Template showcase
│   │   ├── template-preview.tsx   # Individual template preview
│   │   ├── pricing-section.tsx    # Pricing tiers
│   │   ├── community-section.tsx  # Community / social proof
│   │   ├── cta-section.tsx        # Call-to-action banner
│   │   ├── footer.tsx             # [8KB] Site footer
│   │   └── landing-content.tsx    # Content wrapper
│   │
│   ├── profile/                    # Profile components (7)
│   │   ├── profile-tab.tsx        # Profile information tab
│   │   ├── notifications-tab.tsx  # Notification settings
│   │   ├── security-tab.tsx       # Security settings
│   │   ├── preferences-tab.tsx    # App preferences
│   │   ├── billing-tab.tsx        # Billing & credits
│   │   ├── danger-zone-tab.tsx    # Account deletion
│   │   └── ...                    # Additional profile UI
│   │
│   ├── resume/                     # Resume-specific components
│   │   └── resume-card.tsx        # Dashboard resume card
│   │
│   ├── seo/                        # SEO components
│   │   ├── structured-data.tsx    # JSON-LD structured data
│   │   ├── meta-tags.tsx          # Dynamic meta tags
│   │   └── ...                    # SEO utilities
│   │
│   ├── tutorial/                   # Tutorial system
│   │   └── tutorial-overlay.tsx   # In-app tutorial
│   │
│   ├── ui/                         # ═══ SHADCN/UI PRIMITIVES (59 components) ═══
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── tooltip.tsx
│   │   └── ... (59 total)
│   │
│   ├── dashboard-nav.tsx           # Dashboard navigation sidebar
│   ├── duplicate-resume-modal.tsx  # Resume duplication dialog
│   ├── error-boundary.tsx          # React error boundary
│   ├── loading.tsx                 # Loading skeletons & spinners
│   ├── profile-components.tsx      # Shared profile UI
│   ├── resume-upload-modal.tsx     # PDF upload dialog
│   ├── security-dashboard.tsx      # [11KB] Security monitoring UI
│   ├── theme-provider.tsx          # next-themes provider wrapper
│   └── theme-toggle.tsx            # Dark/light mode toggle
│
├── constants/                      # ═══ CONSTANTS ═══
│   └── index.ts                    # App-wide constants
│
├── content/                        # ═══ CONTENT (MDX Blog) ═══
│   └── blogs/
│       ├── welcome.mdx
│       ├── best-resume-builders-2025.mdx
│       ├── mastering-ats-optimization.mdx
│       ├── resume-tips-and-trends-2025.mdx
│       ├── top-resume-templates-2025.mdx
│       ├── student-resume-guide.mdx
│       ├── remote-jobs-and-linkedin.mdx
│       └── free-resume-resources.mdx
│
├── hooks/                          # ═══ CUSTOM REACT HOOKS (9) ═══
│   ├── use-auth.tsx                # Supabase Auth (user, session, signIn/Out)
│   ├── use-credits.tsx             # AI credits (balance, consume, purchase)
│   ├── use-debounced-callback.ts   # Debounce utility for auto-save
│   ├── use-mobile.tsx              # Responsive breakpoint detection
│   ├── use-performance.tsx         # Client-side performance monitoring
│   ├── use-preferences.tsx         # User preferences (theme, lang, tz)
│   ├── use-profile.tsx             # User profile data
│   ├── use-scroll-hide.tsx         # Auto-hide nav on scroll
│   └── use-toast.ts               # Toast notification hook
│
├── lib/                            # ═══ SERVICES & UTILITIES ═══
│   ├── ai-config.ts               # AI provider config & prompts
│   ├── analysis-service.ts        # Resume analysis CRUD
│   ├── api-security.ts            # [11KB] API middleware & validation
│   ├── auth.ts                    # Auth helper utilities
│   ├── blog.ts                    # MDX blog utilities
│   ├── cache.ts                   # [8.5KB] LRU cache with TTL
│   ├── config.ts                  # [6.4KB] App configuration
│   ├── constants.ts               # Lib-level constants
│   ├── cover-letter-service.ts    # Cover letter AI service
│   ├── credits-service.ts         # [18KB] Credit economy engine
│   ├── db-optimized.ts            # [12KB] Connection pooling & retry
│   ├── db-setup.ts                # Database initialization
│   ├── exact-html-generator.ts    # [36KB] Pixel-perfect HTML renderer
│   ├── format-utils.ts            # [7.7KB] Date/number formatters
│   ├── html-pdf-generator.ts      # [34KB] HTML→PDF pipeline
│   ├── monitoring.ts              # [13KB] Metrics & logging
│   ├── pdf-generator.ts           # [26KB] Primary PDF generator
│   ├── profile-service.ts         # [33KB] User profile management
│   ├── rate-limiter.ts            # [13KB] Sliding window rate limiter
│   ├── request-queue.ts           # [10KB] Queue + circuit breaker
│   ├── resume-service.ts          # [7KB] Resume CRUD with caching
│   ├── security.ts                # [19KB] Sanitization + security classes
│   ├── seo-utils.ts               # SEO metadata helpers
│   ├── simple-pdf-generator.ts    # [31KB] Fallback PDF generator
│   ├── structured-data.ts         # JSON-LD schema generators
│   ├── supabase-admin.ts          # Supabase admin client (bypasses RLS)
│   ├── supabase.ts                # [8KB] Supabase client + DB types
│   ├── template-configs.ts        # Template metadata & settings
│   ├── test-utils.tsx             # Test utilities
│   ├── utils.ts                   # General utilities (cn helper)
│   ├── validation.ts              # [12KB] Comprehensive validation rules
│   │
│   ├── ats-resume-exporter/       # ATS-optimized export module
│   │   ├── index.ts               # Module entry
│   │   └── ...                    # Export strategies (7 files)
│   │
│   ├── hooks/                     # Lib-level hooks
│   │   └── ...                    # (3 files)
│   │
│   └── utils/                     # Utility modules
│       └── ...                    # (3 files)
│
├── public/                         # ═══ STATIC ASSETS ═══
│   ├── favicon.ico                # Browser favicon
│   ├── icon.png                   # App icon (192x192)
│   ├── manifest.json              # PWA manifest
│   ├── og-image.jpg               # OpenGraph image (1200x630)
│   └── robots.txt                 # Robots file
│
├── scripts/                        # ═══ DATABASE SCRIPTS (11 SQL files) ═══
│   ├── complete-database-schema.sql  # Master schema (all tables)
│   ├── create-user-profiles-table.sql
│   ├── create-resumes-table.sql
│   ├── create-cover-letters-table.sql
│   ├── create-ai-credits-usage-table.sql
│   ├── create-user-preferences-table.sql
│   ├── create-security-settings-table.sql
│   ├── create-avatar-storage.sql
│   ├── add-is-onboarded-column.sql
│   ├── add-referral-source-column.sql
│   └── update-user-profiles-table.sql
│
├── tests/                          # ═══ TESTS ═══
│   ├── security-validation.js     # Security function tests
│   ├── security-test.ts           # Security integration tests
│   ├── csp-test.js                # CSP header validation
│   ├── date-formatting-demo.ts    # Date utility tests
│   └── delete-account-test.ts     # Account deletion test
│
├── types/                          # ═══ TYPE DEFINITIONS ═══
│   └── resume.ts                  # All TypeScript interfaces (ResumeData, etc.)
│
├── docs/                           # ═══ DOCUMENTATION ═══
│   ├── README.md                  # Documentation hub & index
│   ├── ARCHITECTURE.md            # System architecture deep dive
│   ├── DATABASE.md                # Complete database schema
│   ├── DATA_FLOW.md               # Data flow sequence diagrams
│   ├── COMPONENTS.md              # Component reference
│   ├── SETUP.md                   # Setup & deployment
│   ├── AI-CREDITS-SYSTEM.md       # AI credits & billing
│   ├── PERFORMANCE.md             # Performance optimization
│   ├── SECURITY.md                # Security deep dive
│   ├── FOLDER_STRUCTURE.md        # This file
│   ├── API_REFERENCE.md           # API endpoint documentation
│   ├── TEMPLATES.md               # Template system guide
│   ├── HOOKS.md                   # Custom hooks reference
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── TESTING.md                 # Testing strategy
│   └── LAUNCH_VIDEO_SCRIPT.md     # Launch video script
│
└── .github/                        # GitHub configuration
    └── ...                        # CI/CD, issue templates
```
