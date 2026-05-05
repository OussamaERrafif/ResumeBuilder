# Data Flow & Sequence Diagrams

This document provides visual and textual explanations for how data flows through ApexResume for every major feature. Each flow includes a Mermaid sequence diagram and step-by-step textual breakdown.

---

## Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Resume CRUD Flow](#2-resume-crud-flow)
3. [Resume Editing (Auto-Save)](#3-resume-editing-auto-save)
4. [AI Content Generation](#4-ai-content-generation)
5. [Resume Analysis Flow](#5-resume-analysis-flow)
6. [Cover Letter Generation](#6-cover-letter-generation)
7. [PDF Export Flow](#7-pdf-export-flow)
8. [Credit Consumption Flow](#8-credit-consumption-flow)
9. [Credit Purchase Flow (Stripe)](#9-credit-purchase-flow)
10. [Profile & Avatar Upload](#10-profile--avatar-upload)
11. [Onboarding Flow](#11-onboarding-flow)
12. [Resume File Upload (Parse)](#12-resume-file-upload--parse)

---

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant P as Login Page
    participant Auth as AuthProvider (Hook)
    participant SB as Supabase Auth
    participant DB as Supabase DB
    participant T as Trigger: handle_new_user

    U->>P: Enter email + password
    P->>Auth: signUp(email, password)
    Auth->>SB: supabase.auth.signUp()
    SB-->>DB: INSERT into auth.users
    DB->>T: AFTER INSERT trigger fires
    T->>DB: INSERT into user_profiles (10 credits)
    SB-->>Auth: Session + User object
    Auth-->>P: Redirect to /onboarding

    Note over U,P: Returning user flow:
    U->>P: Enter email + password
    P->>Auth: signIn(email, password)
    Auth->>SB: supabase.auth.signInWithPassword()
    SB-->>Auth: Session + User object
    Auth-->>P: Redirect to /dashboard
```

**Key details:**
- New users are auto-redirected to `/onboarding` (checked via `is_onboarded` flag)
- The `handle_new_user` trigger automatically creates a `user_profiles` row with 10 free credits
- Sessions are managed by Supabase Auth (JWT-based)
- `AuthProvider` hook exposes: `user`, `session`, `loading`, `signIn()`, `signOut()`, `signUp()`

---

## 2. Resume CRUD Flow

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant RS as ResumeService
    participant C as LRU Cache
    participant DB as Supabase DB

    Note over U, DB: CREATE
    U->>D: Click "New Resume"
    D->>RS: createResume({ user_id, name, template_id })
    RS->>DB: INSERT into resumes
    DB-->>RS: New resume row
    RS->>C: Invalidate user's resume list cache
    RS-->>D: Return new resume
    D-->>U: Redirect to /dashboard/[id]

    Note over U, DB: READ (List)
    U->>D: Navigate to /dashboard
    D->>RS: getUserResumes(userId)
    RS->>C: Check cache for key "resumes:userId"
    alt Cache HIT
        C-->>RS: Return cached data
    else Cache MISS
        RS->>DB: SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC
        DB-->>RS: Resume rows
        RS->>C: Store in cache (TTL: 5 min)
    end
    RS-->>D: Resume list
    D-->>U: Render resume cards

    Note over U, DB: DELETE
    U->>D: Click delete on resume card
    D->>RS: deleteResume(id, userId)
    RS->>DB: DELETE FROM resumes WHERE id = ? AND user_id = ?
    RS->>C: Invalidate single + list caches
    RS-->>D: Success
    D-->>U: Remove card from UI
```

---

## 3. Resume Editing (Auto-Save)

```mermaid
sequenceDiagram
    participant U as User
    participant RB as ResumeBuilder Component
    participant D as useDebouncedCallback
    participant RS as ResumeService
    participant C as LRU Cache
    participant DB as Supabase DB
    participant LP as Live Preview

    U->>RB: Types in "Job Title" field
    RB->>RB: Update local React state (immutably)
    RB->>LP: Re-render preview with new data
    RB->>D: Schedule save (debounce: 1000ms)
    
    Note over D: User keeps typing...
    U->>RB: Types more text
    RB->>RB: Update React state again
    RB->>D: Reset debounce timer

    Note over D: 1000ms passes without input
    D->>RS: updateResume(id, { data: resumeData })
    RS->>DB: UPDATE resumes SET data = $jsonb, updated_at = NOW()
    DB-->>RS: Updated row
    RS->>C: Invalidate caches
    RS-->>RB: Sync complete (silent)
```

**Key details:**
- The `ResumeBuilder` component (75KB) is the centerpiece — manages the full `ResumeData` state
- `updateSection` handler ensures immutable updates for deeply nested JSON objects
- Debounce interval: 1000ms — prevents excessive database writes
- Live preview re-renders instantly from local state (no DB round-trip)
- Drag & drop via `@dnd-kit` triggers the same save pipeline

---

## 4. AI Content Generation

```mermaid
sequenceDiagram
    participant U as User
    participant AI as AI Modal
    participant Hook as useCredits
    participant API as /api/ai/generate
    participant RL as Rate Limiter
    participant CS as CreditsService
    participant OpenAI as OpenAI GPT-4o-mini
    participant DB as Supabase DB

    U->>AI: Types description + clicks "Generate"
    AI->>Hook: Check canUse (credits >= cost)
    
    alt Insufficient Credits
        Hook-->>AI: canUse = false
        AI-->>U: Show "Buy Credits" modal
    else Has Credits
        Hook-->>AI: canUse = true
        AI->>API: POST { type: "summary|experience|project", query: "..." }
        API->>RL: Check rate limit (15 req/min for /api/ai)
        
        alt Rate Limited
            RL-->>API: Blocked
            API-->>AI: 429 Too Many Requests
        else Allowed
            API->>CS: checkCredits(userId, feature)
            CS->>DB: SELECT ai_credits FROM user_profiles (FOR UPDATE)
            DB-->>CS: Credit balance
            CS-->>API: { allowed: true }
            
            API->>CS: consumeCredits(userId, feature)
            CS->>DB: CALL deduct_credits(userId, feature, cost)
            DB-->>CS: { success: true, new_balance }
            
            API->>OpenAI: Chat completion request
            OpenAI-->>API: Generated text
            API-->>AI: { content: "..." }
            AI->>Hook: Refresh credit balance
            AI-->>U: Display generated content
        end
    end
```

**Supported generation types:**
| Type | Prompt Strategy | Output |
|------|----------------|--------|
| `summary` | 2-3 sentence professional summary | Paragraph |
| `experience` | 3-4 action-verb bullet points | `•` formatted list |
| `project` | 2-3 sentence project description | Paragraph |

---

## 5. Resume Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant RA as ResumeAnalysis Component
    participant API as /api/ai/analyze
    participant CB as Circuit Breaker
    participant RQ as Request Queue
    participant OpenAI as OpenAI GPT-4o
    participant AS as AnalysisService
    participant DB as Supabase DB

    U->>RA: Click "Analyze Resume"
    RA->>API: POST { resumeData, analysisType: "full_analysis" }
    API->>CB: Check circuit state
    
    alt Circuit OPEN
        CB-->>API: Reject (service unavailable)
        API-->>RA: Return fallback/cached analysis
    else Circuit CLOSED/HALF-OPEN
        API->>RQ: Enqueue request (max 3 concurrent)
        RQ->>OpenAI: Send resume data with analysis prompt
        OpenAI-->>RQ: Analysis JSON
        RQ-->>API: Parsed analysis result
        API->>AS: saveAnalysis({ resume_id, analysis_data, overall_score })
        AS->>DB: UPSERT into resume_analyses
        API-->>RA: Full analysis result
    end

    RA-->>U: Render radar charts + skill bars + job matches
```

**Analysis output includes:**
- **Skill proficiency scores** (0-100 per skill, by category)
- **Job match percentages** (top matching roles with reasoning)
- **Overall resume score** (0-100)
- **Actionable improvements** (categorized as Strengths / Improvements)

---

## 6. Cover Letter Generation

```mermaid
sequenceDiagram
    participant U as User
    participant CL as Cover Letter Page
    participant API as /api/ai/generate-cover-letter
    participant CS as CreditsService
    participant OpenAI as OpenAI GPT-4o
    participant DB as Supabase DB

    U->>CL: Paste job description + select resume
    CL->>API: POST { resumeData, jobDescription, jobTitle, companyName }
    API->>CS: consumeCredits(userId, 'cover_letter_generation', 5)
    CS->>DB: CALL deduct_credits()
    DB-->>CS: { success: true }
    API->>OpenAI: Generate cover letter (resume + job context)
    OpenAI-->>API: { coverLetter, resumeOptimizationSuggestions[] }
    API->>DB: INSERT into cover_letters
    API-->>CL: Generated cover letter + suggestions
    CL-->>U: Display editable cover letter
```

**Cost: 5 credits** for generation, **3 credits** for improvement of existing letter.

---

## 7. PDF Export Flow

```mermaid
sequenceDiagram
    participant U as User
    participant RB as ResumeBuilder
    participant PDF as PDFGenerator
    participant H2C as html2canvas
    participant JP as jsPDF
    participant DL as Browser Download

    U->>RB: Click "Export PDF"
    RB->>PDF: generatePDF(resumeData, templateId)
    
    Note over PDF: Rendering Pipeline
    PDF->>PDF: Create hidden high-fidelity HTML container
    PDF->>PDF: Apply template styles (isolated CSS)
    PDF->>PDF: Set container to print dimensions (A4/Letter)
    
    PDF->>H2C: Capture container at 2x DPI
    H2C-->>PDF: High-resolution canvas image
    
    PDF->>JP: Create PDF document (A4)
    
    loop For each page
        PDF->>JP: Calculate page boundaries
        PDF->>JP: Add page image (scaled to fit)
        PDF->>JP: Handle page breaks (avoid splitting sections)
    end
    
    JP-->>PDF: Complete PDF blob
    PDF->>DL: Trigger file download
    DL-->>U: "Resume.pdf" downloaded
```

**Key details:**
- **Entirely client-side** — no data sent to server
- **High DPI**: Rendered at 2x resolution for print quality
- **Page break handling**: Smart detection to avoid splitting work experience entries
- **Three generator strategies** for reliability:
  1. `pdf-generator.ts` — Primary (html2canvas + jsPDF)
  2. `html-pdf-generator.ts` — HTML-based with exact rendering
  3. `simple-pdf-generator.ts` — Simplified fallback
- **ATS Export**: `ats-resume-exporter/` provides plain-text optimized output

---

## 8. Credit Consumption Flow

```mermaid
sequenceDiagram
    participant Client as Client Hook
    participant API as API Route
    participant CS as CreditsService
    participant DB as PostgreSQL

    Client->>API: POST /api/credits { feature: "resume_analysis" }
    API->>CS: consumeCredits(userId, 'resume_analysis')
    CS->>DB: BEGIN TRANSACTION
    CS->>DB: SELECT ai_credits FROM user_profiles WHERE user_id = ? FOR UPDATE
    
    alt Credits < Required (3)
        DB-->>CS: Insufficient
        CS-->>API: { success: false, error: "Insufficient credits" }
        API-->>Client: 402 Payment Required
    else Credits >= Required
        CS->>DB: UPDATE user_profiles SET ai_credits = ai_credits - 3
        CS->>DB: INSERT INTO ai_credits_usage (feature, credits_used)
        DB-->>CS: COMMIT
        CS-->>API: { success: true, newBalance: 7 }
        API-->>Client: 200 OK
    end
```

**Atomicity guarantee**: The `deduct_credits` PL/pgSQL function uses `FOR UPDATE` row locking, preventing double-spending in concurrent requests.

---

## 9. Credit Purchase Flow

```mermaid
sequenceDiagram
    participant U as User
    participant Modal as CreditPurchaseModal
    participant API as /api/credits/purchase
    participant Stripe as Stripe Checkout
    participant WH as /api/credits/webhook
    participant CS as CreditsService
    participant DB as Supabase DB

    U->>Modal: Select "50 credits ($9.99)"
    Modal->>API: POST { type: "credits", packageId: "credits_50" }
    API->>Stripe: Create Checkout Session
    Stripe-->>API: { sessionUrl }
    API-->>Modal: Redirect URL
    Modal->>Stripe: Redirect to Stripe Checkout

    U->>Stripe: Complete payment
    Stripe->>WH: POST webhook (checkout.session.completed)
    WH->>WH: Verify Stripe signature
    WH->>CS: addCredits(userId, 50, 'purchase')
    CS->>DB: CALL add_credits(userId, 50, 'purchase')
    DB-->>CS: { new_balance }
    WH-->>Stripe: 200 OK

    U->>Modal: Redirected back to /profile?tab=billing&success=true
    Modal->>API: GET /api/credits (refresh balance)
    API-->>Modal: Updated balance
    Modal-->>U: "50 credits added!"
```

---

## 10. Profile & Avatar Upload

```mermaid
sequenceDiagram
    participant U as User
    participant P as Profile Page
    participant PS as ProfileService
    participant SB_S as Supabase Storage
    participant DB as Supabase DB

    Note over U, DB: Avatar Upload
    U->>P: Select image file
    P->>PS: uploadAvatar(userId, file)
    PS->>PS: Validate: JPEG/PNG/GIF/WebP, max 5MB
    PS->>SB_S: Delete old avatar from /avatars/{userId}/
    PS->>SB_S: Upload new file to /avatars/{userId}/{filename}
    SB_S-->>PS: Public URL
    PS->>DB: UPDATE user_profiles SET avatar_url = publicUrl
    PS-->>P: New avatar URL
    P-->>U: Display updated avatar

    Note over U, DB: Profile Update
    U->>P: Edit full_name, bio, location, etc.
    P->>PS: updateUserProfile(userId, { full_name, bio, ... })
    PS->>DB: UPDATE user_profiles SET ... WHERE user_id = ?
    DB-->>PS: Success
    PS-->>P: Profile updated
    P-->>U: Show success toast
```

---

## 11. Onboarding Flow

```mermaid
sequenceDiagram
    participant U as User
    participant Auth as AuthProvider
    participant O as Onboarding Page
    participant PS as ProfileService
    participant DB as Supabase DB

    U->>Auth: First login after signup
    Auth->>DB: Check is_onboarded flag
    DB-->>Auth: is_onboarded = false
    Auth-->>U: Redirect to /onboarding

    U->>O: Fill in profile details
    U->>O: Select referral source
    U->>O: Complete wizard steps
    O->>PS: updateUserProfile(userId, { full_name, referral_source, is_onboarded: true })
    PS->>DB: UPDATE user_profiles
    DB-->>PS: Success
    O-->>U: Redirect to /dashboard
```

---

## 12. Resume File Upload & Parse

```mermaid
sequenceDiagram
    participant U as User
    participant Modal as ResumeUploadModal
    participant API as /api/ai/parse-resume
    participant Parser as pdf-parse library
    participant OpenAI as OpenAI GPT-4o
    participant CS as CreditsService

    U->>Modal: Upload PDF resume file
    Modal->>Modal: Validate file (PDF, max 10MB)
    Modal->>API: POST multipart/form-data { file }
    API->>Parser: Extract text from PDF
    Parser-->>API: Raw text content
    API->>CS: consumeCredits(userId, 'resume_analysis')
    API->>OpenAI: "Parse this resume text into structured JSON"
    OpenAI-->>API: Structured ResumeData JSON
    API-->>Modal: Parsed resume data
    Modal-->>U: Pre-fill resume builder with parsed data
```

**Supported formats:** PDF (via `pdf-parse` library)
