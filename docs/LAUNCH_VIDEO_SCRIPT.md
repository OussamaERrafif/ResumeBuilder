# 🎬 ResumeBuilder — Official Launch Video Script

> **Video Title:** *"Building Your Dream Resume — Introducing ResumeBuilder v2.0"*
> **Duration:** 90–120 seconds (ideal for social media, Product Hunt, landing page)
> **Aspect Ratios:** 16:9 (YouTube / Website) + 9:16 cut (TikTok / Reels / Shorts)
> **Tone:** Premium, confident, empowering — think Apple product launch + indie dev authenticity
> **Music:** Upbeat electronic / lo-fi tech — builds energy, drops at CTA

---

## 🎨 Brand Kit Reference

| Element            | Value                                              |
|--------------------|----------------------------------------------------|
| **Primary Color**  | `hsl(var(--primary))` — Indigo / Deep Blue         |
| **Accent**         | Gradient `from-primary to-purple-600`              |
| **Background**     | Dark mode `#0a0a0f` with subtle grid overlay       |
| **Typography**     | Inter / System Font — Bold headlines, Regular body |
| **Icon Style**     | Lucide React icons — thin stroke, rounded           |
| **Motion Style**   | Smooth ease-out, staggered reveals, subtle scale   |

---

## 📋 Scene-by-Scene Breakdown

---

### 🎬 SCENE 1 — The Hook (0:00 – 0:05)

#### 🎙️ Voiceover
> *"Your resume is the first impression you make. Make it count."*

#### 🎨 Graphic Design Direction
- **Background:** Pure black `#000000` to deep navy `#0a0a1a` gradient
- **Typography:** Large serif or bold sans-serif, centered text
  - Line 1: `"Your resume is"` — fades in from bottom, white `#ffffff`
  - Line 2: `"the first impression"` — fades in 0.3s after, white
  - Line 3: `"you make."` — pops in with primary gradient text glow `from-primary to-purple-600`
- **Motion:** Subtle particle/grid pattern in background (matching the app's `GridPattern` component)
- **Timing:** Each word group appears sequentially with a soft fade + slide-up (200ms stagger)
- **Sound:** Deep bass hit on "Make it count" — the music starts building from here

#### 📐 Storyboard Sketch
```
┌──────────────────────────────────────────────┐
│                                              │
│              (dark background)               │
│                                              │
│         Your resume is                       │
│         the first impression                 │
│         ✨ you make. ✨                       │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 🎬 SCENE 2 — The Problem (0:05 – 0:12)

#### 🎙️ Voiceover
> *"But between clunky editors, ugly templates, and tools that cost a fortune… building a great resume shouldn't be this hard."*

#### 🎨 Graphic Design Direction
- **Style:** Quick-cut montage of "bad" resume experiences (stylized, not real competitors)
- **Frame 1 (0:05–0:07):** A generic Word doc with misaligned text, Comic Sans, red underlines — text overlay: `"Clunky Editors"` with a red ✕ stamp
- **Frame 2 (0:07–0:09):** A garish colorful resume template with too many colors, clip art — text overlay: `"Ugly Templates"` with a red ✕ stamp
- **Frame 3 (0:09–0:12):** A paywall popup showing `$29.99/month` with fine print — text overlay: `"Expensive Tools"` with a red ✕ stamp
- **Motion:** Each frame smashes in from the right and gets "crushed" / slides away as the next appears
- **Color:** Desaturated / muted tones — feels frustrating, intentionally ugly
- **Transition:** Final frame shatters → reveals clean dark background

#### 📐 Storyboard Sketch
```
Frame 1                  Frame 2                  Frame 3
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  ╳ Clunky    │  →→→   │  ╳ Ugly      │  →→→   │  ╳ $29.99/mo │
│   Editors    │        │   Templates  │        │   Paywall    │
│  [bad doc]   │        │  [ugly cv]   │        │  [$ popup]   │
└──────────────┘        └──────────────┘        └──────────────┘
                        ALL SHATTER → clean dark reveal
```

---

### 🎬 SCENE 3 — The Reveal (0:12 – 0:18)

#### 🎙️ Voiceover
> *"Introducing ResumeBuilder — the free, open-source resume builder designed for developers and professionals."*

#### 🎨 Graphic Design Direction
- **Background:** Smooth transition to the app's dark theme `bg-background`
- **Logo / Wordmark:** "ResumeBuilder" appears center-screen
  - First the icon/logo animates in (scale 0 → 1 with bounce)
  - Then the wordmark types out letter-by-letter
  - Gradient text effect: `bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground`
- **Badge:** Below the logo: `✨ v2.0 Now Available` badge fades in (matching the hero section badge from the app)
- **Particles / Glow:** A soft indigo glow pulse behind the logo `bg-primary/20 blur-[120px]`
- **Music:** Beat drop — energy lifts here

#### 📸 App Reference — Hero Badge
> From `hero-section.tsx`: The `v2.0 Now Available` badge with Sparkles icon, rounded-full, `border-primary/20 bg-primary/5`

#### 📐 Storyboard Sketch
```
┌──────────────────────────────────────────────┐
│                                              │
│            ◉ (logo bounces in)               │
│                                              │
│         R e s u m e B u i l d e r            │
│           (types out, gradient)              │
│                                              │
│         ┌─────────────────────────┐          │
│         │ ✨ v2.0 Now Available   │          │
│         └─────────────────────────┘          │
│                                              │
│          (soft indigo glow behind)           │
└──────────────────────────────────────────────┘
```

---

### 🎬 SCENE 4 — Landing Page Fly-Through (0:18 – 0:28)

#### 🎙️ Voiceover
> *"A beautiful interface. Built with modern tools. Designed to get you hired."*

#### 🎨 Graphic Design Direction
- **Content:** Screen recording (or high-res capture) of the landing page scrolling
- **Start:** Hero section with headline `"Building Your Dream Resume"`
- **Scroll through:**
  1. Hero section with the HeroDashboardPreview mockup (the faux resume builder UI)
  2. Trust indicators: `No Sign Up Required` · `PDF Export` · `Privacy First`
  3. Features grid with the 6 feature cards
  4. Templates carousel scrolling
- **Post-processing:** Add a subtle browser window chrome frame, 3D perspective tilt (like the hero section's `perspective-1000`)
- **Motion:** Smooth scroll at 2× speed, with slow-downs at key moments
- **Overlay:** Floating annotation callouts appear at key features

#### 📸 App References to Capture

**Hero Section** (from `hero-section.tsx`):
```
Headline:     "Building Your Dream Resume"
Subheadline:  "The free, open-source resume builder designed for
               developers and professionals. ATS-friendly,
               privacy-focused, and 100% free forever."
CTA Buttons:  [Start Building Free →]  [⭐ Star on GitHub]
Trust:        ✓ No Sign Up Required  ✓ PDF Export  ✓ Privacy First
```

**Features Grid** (from `constants/landing.ts`):
```
┌─────────────────────┬────────────────────────┬──────────────────────┐
│ 🧠 AI-Powered       │ 🎨 Professional        │ ⚡ Lightning Fast     │
│    Content           │    Templates           │                      │
├─────────────────────┼────────────────────────┼──────────────────────┤
│ 🛡️ ATS-Optimized    │ 🕐 Real-time Preview   │ 📥 Multiple Formats  │
│                      │                        │                      │
└─────────────────────┴────────────────────────┴──────────────────────┘
```

**Social Proof Banner:**
```
🟢 100+ Resumes Created This Week
```

---

### 🎬 SCENE 5 — Templates Showcase (0:28 – 0:38)

#### 🎙️ Voiceover
> *"Choose from five professionally designed templates — Classic, Creative, Minimal, Modern, and the premium LuxSleek sidebar layout. All ATS-optimized."*

#### 🎨 Graphic Design Direction
- **Layout:** Template cards fan out from center in a 3D carousel or horizontal scroll
- **Each card:** Shows the template preview with the card design from `templates-section.tsx`
  - Template name, description, color dots, category badge
  - "Use Template" button fades in on hover/focus
- **Highlight sequence:** Each template briefly enlarges (1.05× scale) as it's named in the voiceover
- **Color coding:** Each template's accent colors pulse subtly:
  - Classic: `#1f2937` (dark gray)
  - Creative: `#e85d04` (flame orange)
  - Minimal: `#000000` (pure black)
  - Modern: `#3b82f6` (blue)
  - LuxSleek: `#304263` (navy)
- **Pro Badge:** On Creative and LuxSleek, the amber "Pro" badge pulses with `Award` icon

#### 📸 Templates Data (from `app/types/templates.ts`):
```
1. Classic Professional  — "Clean single-column layout"       — [Single column, Centered header, ATS-optimized]
2. Creative MaltaCV ⭐   — "Colorful design with bio section" — [Colorful accents, Bio section, Awards] (PRO)
3. Minimal Clean         — "Ultra-clean with dash bullets"    — [Dash bullets, Tabular layout, Max readability]
4. Modern Developer      — "Tech-focused layout"              — [Skills alignment, Project highlights, Tech-focused]
5. LuxSleek Sidebar ⭐   — "Two-column with dark navy"        — [Photo sidebar, Dark accent, Professional] (PRO)
```

#### 📐 Storyboard Sketch
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────┐  ┌──────┐  ┌────────┐  ┌──────┐  ┌──────┐          │
│  │      │  │      │  │ ▲      │  │      │  │      │          │
│  │Class │  │Creat │  │ Modern │  │Minim │  │LuxS  │          │
│  │  ic  │  │ ive  │  │  Dev   │  │ al   │  │ leek │          │
│  │      │  │  ⭐  │  │        │  │      │  │  ⭐  │          │
│  └──────┘  └──────┘  └────────┘  └──────┘  └──────┘          │
│                       (enlarged)                               │
│                                                                │
│            "Designed to get you hired."                         │
└────────────────────────────────────────────────────────────────┘
```

---

### 🎬 SCENE 6 — Dashboard & Resume Builder Demo (0:38 – 0:58)

#### 🎙️ Voiceover
> *"Create your account, jump into the dashboard, and start building in seconds. Search, duplicate, and manage all your resumes from one place."*

*(pause)*

> *"Fill in your details — personal info, experience, education, skills, and projects. See your resume update in real-time with our live preview."*

#### 🎨 Graphic Design Direction
- **Part A — Dashboard (0:38–0:45):**
  - Screen recording of the dashboard page
  - Show the hero section: `"Create Professional Resumes"` with gradient accent
  - Click `"Create New Resume"` button (the `+` card with dashed border)
  - Briefly show the search bar, total resumes count card
  - Show an existing resume card with template preview, badges (`Classic`, `Active`), and action buttons (Edit, Copy, Review, Delete)

- **Part B — Resume Builder (0:45–0:58):**
  - Show the section sidebar navigation with icons:
    ```
    👤 Personal Info    📎 Links
    🎓 Education        💼 Experience
    🛠️ Skills           📁 Projects
    📜 Certifications   👥 References
    🎯 Skill Match      👁️ Review
    ```
  - Demonstrate typing in the Personal Info section — name, title, email, summary
  - Show the live preview panel updating in real-time on the right side
  - Quick zoom into the template preview rendering

- **Motion:** Smooth cursor movements, subtle click animations, UI elements responding
- **Annotations:** Floating labels pointing at key UI elements:
  - `"One-click create"` → pointing at the + card
  - `"Live preview"` → pointing at the resume preview panel
  - `"Drag & drop sections"` → pointing at the section navigation

#### 📸 App References

**Dashboard Hero** (from `dashboard/page.tsx`):
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│            Create Professional                           │
│              ✨ Resumes ✨                                │
│                                                          │
│  Build professional resumes with AI assistance,          │
│  clean templates, and seamless export options.           │
│                                                          │
│  [ + Create New Resume ]   [ ⬆ Upload & Analyze ]       │
│                                                          │
│       ✨ 15 AI Credits  |  1 credit = summary •          │
│                           5 credits = cover letter       │
└──────────────────────────────────────────────────────────┘
```

**Resume Cards Grid:**
```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ ┌────────┐ │  │  📄        │  │  📄        │  │  📄        │
│ │ + Add  │ │  │ John's CV  │  │ Design CV  │  │ Tech CV    │
│ │  New   │ │  │ Classic    │  │ Creative ⭐│  │ Modern     │
│ │ Resume │ │  │ ● Active   │  │ ● Active   │  │ ● Active   │
│ └────────┘ │  │ [preview]  │  │ [preview]  │  │ [preview]  │
│            │  │ Edit Copy  │  │ Edit Copy  │  │ Edit Copy  │
│            │  │ Review Del │  │ Review Del │  │ Review Del │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

**Resume Builder Sections:**
```
Section Navigation (Sidebar):
┌─────────────────┐    ┌──────────────────────────────────────┐
│ 👤 Personal Info │    │                                      │
│ 📎 Links         │    │     [ LIVE RESUME PREVIEW ]          │
│ 🎓 Education     │    │                                      │
│ 💼 Experience    │    │     Updates in real-time as you       │
│ 🛠️ Skills        │    │     fill in your information          │
│ 📁 Projects      │    │                                      │
│ 📜 Certifications│    │     ┌──────────────────────────┐     │
│ 👥 References    │    │     │ [Scaled template render]  │     │
│ 🎯 Skill Match   │    │     │                           │     │
│ 👁️ Review        │    │     │                           │     │
└─────────────────┘    │     └──────────────────────────┘     │
                       └──────────────────────────────────────┘
```

---

### 🎬 SCENE 7 — AI Features Deep Dive (0:58 – 1:12)

#### 🎙️ Voiceover
> *"Need help writing? Our AI assistant generates compelling summaries, rewrites your experience with stronger verbs, and even analyzes your resume with a professional score."*

*(pause)*

> *"Upload an existing resume — we'll parse it, analyze it, and give you actionable feedback."*

#### 🎨 Graphic Design Direction

**Part A — AI Content Generation (0:58–1:05):**
- Show the AI modal (`ai-modal.tsx`) opening with a sparkle animation
- Demonstrate:
  1. Clicking the `✨ Sparkles` AI button next to the Summary field
  2. AI modal appears with input prompt
  3. Generated text streams in (simulated typing effect)
  4. User clicks "Apply" and the summary field updates
- **Visual flair:** The AI chat bubble UI from `value-props-section.tsx`:
  ```
  🤖: "I noticed you used 'Managed' three times. Try these stronger alternatives:"
       [Orchestrated] [Spearheaded]
  👤: "Update it!"
  ```

**Part B — Resume Analysis (1:05–1:12):**
- Show the Resume Analysis modal opening
- Display the scoring dashboard:
  - Overall Score: circular progress (e.g., `78/100`)
  - Section scores: Personal Info, Summary, Experience, Education, Skills
  - ATS Compatibility score
  - Industry Fit detection
  - Actionable suggestions list
- **Color coding:** Green (80+), Yellow (60-79), Red (<60) score rings
- **Motion:** Score numbers count up from 0 with satisfying animation

**Part C — Upload & Analyze (quick flash, 1:10–1:12):**
- Show the Upload modal (`resume-upload-modal.tsx`) with drag-and-drop zone
- PDF icon appears, progress bar fills, then auto-creates resume from parsed data

#### 📸 App References

**AI Chat Bubble (from `value-props-section.tsx`):**
```
┌──────────────────────────────────────┐
│  ● ● ●                 ai-helper.ts │
│──────────────────────────────────────│
│  🤖  "I noticed you used 'Managed'  │
│       three times. Try these         │
│       stronger alternatives:"        │
│       [Orchestrated] [Spearheaded]   │
│                                      │
│                    "Update it!" 👤   │
└──────────────────────────────────────┘
```

**Resume Analysis Scores:**
```
┌──────────────────────────────────────────────────┐
│                Resume Analysis                    │
│                                                   │
│         ┌──────┐                                  │
│         │  78  │  Overall Score                   │
│         └──────┘                                  │
│                                                   │
│  Personal Info  ████████░░  82%                   │
│  Summary        ██████░░░░  65%                   │
│  Experience     █████████░  90%                   │
│  Education      ████████░░  80%                   │
│  Skills         ███████░░░  72%                   │
│                                                   │
│  ATS Score:     ████████░░  85%  ✓ Compatible     │
│  Industry:      Technology       ★★★★☆           │
│                                                   │
│  💡 Suggestions:                                  │
│  • Add quantifiable achievements                  │
│  • Include 2-3 more technical skills              │
│  • Strengthen your professional summary           │
└──────────────────────────────────────────────────┘
```

---

### 🎬 SCENE 8 — Cover Letters (1:12 – 1:22)

#### 🎙️ Voiceover
> *"And when you're ready to apply — generate tailored cover letters with AI. Just paste the job description, select your resume, and let the magic happen."*

#### 🎨 Graphic Design Direction
- **Screen recording** of the Cover Letters page (`cover-letters/page.tsx`)
- Show:
  1. The Cover Letters list view with header `"Cover Letters"` and `"Create Cover Letter"` button
  2. Click "Create Cover Letter"
  3. Fill in Job Title (`Software Engineer`), Company Name (`Google`)
  4. Paste job description into the textarea
  5. Select a resume from the dropdown
  6. Click `"✨ Generate with AI"` button
  7. Cover letter text streams in on the preview panel
  8. Credits badge updates: `15 credits → 10 credits` (shows `5/letter` cost)
- **Split screen:** Left side = form inputs, Right side = live preview of generated letter
- **Annotation:** Floating badge: `"5 credits per generation"`

#### 📸 App References

**Cover Letter Form (from `cover-letters/page.tsx`):**
```
┌──────────────────────────────┬───────────────────────────────┐
│  💼 Job Information          │  📝 Preview & Edit            │
│                              │                               │
│  Cover Letter Name *         │  Dear Hiring Manager,         │
│  [Software Engineer - Google]│                               │
│                              │  I am writing to express      │
│  Job Title     Company       │  my enthusiastic interest     │
│  [Software En] [Google    ]  │  in the Software Engineer     │
│                              │  position at Google...        │
│  Select Resume *             │                               │
│  [▾ John's Technical CV   ]  │  With 5+ years of experience  │
│                              │  in full-stack development... │
│  Job Description *           │                               │
│  [Paste job description...]  │  ── Generated by AI ──        │
│                              │                               │
│  [✨ Generate with AI]       │  [💾 Save]  [📋 Copy]  [📥]  │
└──────────────────────────────┴───────────────────────────────┘
```

---

### 🎬 SCENE 9 — Value Props Bento Grid (1:22 – 1:32)

#### 🎙️ Voiceover
> *"Privacy first — your data stays in your browser. Lightning fast — no server lag, instant rendering. And one-click PDF export — ready for any employer."*

#### 🎨 Graphic Design Direction
- **Recreate** or screen-capture the Bento Grid from `value-props-section.tsx`
- **Layout:** The 4-card bento grid with:
  1. **AI-Powered Assistant** (2-col wide) — with the chat bubble UI mockup
  2. **Privacy First** (tall, 2-row) — Shield icon with `localStorage.resume_data ● Encrypted` terminal badge
  3. **Instant** — Speed score circle: `100` with yellow ring
  4. **One-Click PDF** — PDF badge with download mockup
- **Motion:** Cards appear with staggered reveal (0.1s delay each)
- **Highlight:** As each is mentioned in VO, the corresponding card gets a primary border glow

#### 📸 App References

**Bento Grid Layout:**
```
┌───────────────────────────────────┬──────────────────┐
│  🤖 AI-Powered Assistant          │  🛡️ Privacy First │
│  Real-time suggestions to improve │                  │
│  your grammar, tone, and impact.  │  Zero data       │
│                                   │  tracking. Your  │
│  [Grammar Fix] [Stronger Verbs]   │  resume data     │
│                                   │  lives in your   │
│  ┌─── Chat UI Mockup ──────────┐ │  browser.        │
│  │ 🤖 "Try: Orchestrated,      │ │                  │
│  │     Spearheaded"             │ │  ┌──────────┐   │
│  │           "Update it!" 👤   │ │  │ 🛡️ ✓     │   │
│  └──────────────────────────────┘ │  │ Encrypted │   │
├─────────────────┬─────────────────│  └──────────┘   │
│  ⚡ Instant      │ 📥 One-Click   │                  │
│  No server lag. │    PDF          │                  │
│  Real-time      │ ┌──────────┐   │                  │
│  rendering.     │ │ PDF ▒▒▒ ↓│   │                  │
│  Score: ◯ 100   │ └──────────┘   │                  │
└─────────────────┴─────────────────┴──────────────────┘
```

---

### 🎬 SCENE 10 — Pricing & Open Source (1:32 – 1:42)

#### 🎙️ Voiceover
> *"Start free — forever. No credit card required. Upgrade to Pro for unlimited AI assistance and all premium templates. And yes, we're fully open source on GitHub."*

#### 🎨 Graphic Design Direction
- **Part A — Pricing Cards (1:32–1:38):**
  - Show the 3 pricing cards from `pricing-section.tsx`
  - Cards animate in with stagger
  - The "Pro" card has `ring-2 ring-primary` highlight and "Most Popular" badge
  - **Important:** Emphasize `$0/forever` on the Free plan — make it glow

- **Part B — Open Source (1:38–1:42):**
  - GitHub logo appears, then the repo URL: `github.com/OussamaERrafif/ResumeBuilder`
  - Stars counter animation (if applicable)
  - Community cards flash in: `Open Source` · `Product Hunt Featured` · `Community Driven`

#### 📸 App References

**Pricing Plans (from `constants/landing.ts`):**
```
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│     Free     │  │   ⭐ Pro ⭐       │  │  Enterprise  │
│              │  │  Most Popular     │  │              │
│   $0/forever │  │  $9.99/month      │  │ $29.99/month │
│              │  │                   │  │              │
│ • 1 template │  │ • All 6 templates │  │ • Everything │
│ • Basic AI   │  │ • Unlimited AI    │  │   in Pro     │
│ • PDF export │  │ • Custom colors   │  │ • Team collab│
│ • Email      │  │ • Cover letters   │  │ • Analytics  │
│   support    │  │ • LinkedIn opt.   │  │ • Custom     │
│              │  │ • Priority support│  │   integrations│
│ [Get Started │  │ [Start 7-Day     ]│  │ [Contact    ]│
│      Free  ] │  │  Free Trial      ]│  │   Sales     ]│
└──────────────┘  └──────────────────┘  └──────────────┘
```

---

### 🎬 SCENE 11 — Tutorial / Onboarding (1:42 – 1:50)

#### 🎙️ Voiceover
> *"New here? Our guided tutorial walks you through everything — step by step. From creating your first resume to exporting it as a pixel-perfect PDF."*

#### 🎨 Graphic Design Direction
- Show the onboarding flow from `onboarding/page.tsx`:
  - Step indicators: `(1) Profile → (2) Source → (3) Plan`
  - Quick montage of each step:
    1. Personal info form with name, job title, experience level
    2. Referral source selection (radio buttons)
    3. Plan selection with Free vs Pro cards
  - Then transition into the Tutorial Overlay on the dashboard:
    - Spotlight effect on `"Create New Resume"` button
    - Tooltip: `"Start Building — Create a new resume from scratch using our professional templates."`
    - Next spotlight on `"Upload & Analyze"` button
    - Tooltip: `"Smart Import — Upload your resume and let AI analyze it."`
- **Motion:** Smooth spotlight transitions, pulsing highlight rings around targeted elements

#### 📸 App References

**Onboarding Steps:**
```
     ①── ── ──②── ── ──③
  Profile     Source      Plan

┌────────────────────────────────────┐
│     Welcome to ResumeBuilder       │
│     Step 1 of 3: Basic Info        │
│                                    │
│  Full Name:  [________________]    │
│  Job Title:  [________________]    │
│  Experience: [▾ Select level   ]   │
│  Industry:   [________________]    │
│  Bio:        [________________]    │
│              [________________]    │
│                                    │
│              [Back]     [Next →]   │
└────────────────────────────────────┘
```

**Tutorial Overlay:**
```
┌──────────────────────────────────────────────┐
│                                              │
│     ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐       │
│     │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │       │
│     │ ┌──────────────────────────┐   │       │
│     │ │ ✨ Start Building        │ ◄─┼─ ─ ─ ┐
│     │ │  Create a new resume     │   │      │
│     │ │  from our templates.     │   │  Tooltip
│     │ └──────────────────────────┘   │      │
│     └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  ─ ─ ┘
│              (spotlight effect)              │
│                                              │
│            [Skip]  •  [1/4]  •  [Next]       │
└──────────────────────────────────────────────┘
```

---

### 🎬 SCENE 12 — The Close / CTA (1:50 – 2:00)

#### 🎙️ Voiceover
> *"Your dream job starts with a dream resume. Start building — for free — today."*

#### 🎨 Graphic Design Direction
- **Background:** Return to the clean dark background with the subtle grid pattern
- **Text animation:**
  - `"Your dream job starts with"` — slides in from left, white
  - `"a dream resume."` — slides in from right, gradient primary text, **bold**
- **CTA Buttons:** Two large buttons appear (matching the app's CTA section):
  - Primary: `[Start Building Now →]` — with `shadow-lg shadow-primary/25`, pulse glow
  - Secondary: `[⭐ Star on GitHub]` — outline style
- **Below buttons:** The URL `resumebuilder.app` (or your domain) fades in
- **Final frame:** Hold for 3 seconds — logo + buttons + URL
- **Music:** Final beat drop, resolves to a satisfying chord

#### 📐 Storyboard Sketch
```
┌──────────────────────────────────────────────┐
│                                              │
│        Your dream job starts with            │
│         ✨ a dream resume. ✨                 │
│                                              │
│                                              │
│   ┌─────────────────────┐  ┌──────────────┐ │
│   │ Start Building Now →│  │⭐ Star on    │ │
│   │    (primary glow)   │  │   GitHub     │ │
│   └─────────────────────┘  └──────────────┘ │
│                                              │
│          resumebuilder.app                   │
│                                              │
│     Built with ❤️ by OussamaERrafif           │
└──────────────────────────────────────────────┘
```

---

## 🎵 Music & Sound Design Guide

| Timestamp  | Music Cue                                   | SFX                              |
|------------|---------------------------------------------|----------------------------------|
| 0:00–0:05  | Ambient pad, low and mysterious              | Deep bass hit on "Make it count" |
| 0:05–0:12  | Tension build — minor key, distorted         | Stamp/crash on each ✕            |
| 0:12–0:18  | **Beat drop** — main theme begins            | Whoosh on logo reveal            |
| 0:18–0:38  | Upbeat electronic, steady rhythm             | Soft UI clicks, scroll sounds    |
| 0:38–0:58  | Continue building — add layers               | Keyboard typing, click sounds    |
| 0:58–1:12  | Melody peak — AI section feels magical       | Sparkle/shimmer on AI features   |
| 1:12–1:22  | Continue energy, slight variation            | Typing, generation stream sound  |
| 1:22–1:32  | Confident, steady — feature showcase         | Subtle pop on each card          |
| 1:32–1:42  | Warm resolution — pricing feels inviting     | Coin/register sound on "$0"      |
| 1:42–1:50  | Gentle, guiding — tutorial section           | Soft spotlight woosh             |
| 1:50–2:00  | **Final resolution** — triumphant, warm      | Satisfying chord resolve         |

### Recommended Music Style
- **Genre:** Electronic / Lo-fi Tech / Corporate Modern
- **Mood:** Confident, empowering, forward-looking
- **Suggestions:**
  - [Epidemic Sound](https://www.epidemicsound.com/) — Search: "tech product launch"
  - [Artlist](https://artlist.io/) — Search: "innovation", "startup"
  - [Uppbeat](https://uppbeat.io/) — Free for YouTube

---

## 🛠️ Production Checklist

### Pre-Production
- [ ] Record screen captures of all app sections at 4K (3840×2160) or at minimum 1920×1080
- [ ] Prepare the app with realistic demo data:
  - Resume: "Alex Johnson", Software Engineer, 5 years experience
  - Include filled education, experience, skills, and projects sections
  - Have at least 3 saved resumes with different templates
  - Have 1-2 saved cover letters
- [ ] Set the app to **dark mode** for all recordings (the entire app uses dark theme)
- [ ] Ensure the browser window is clean (no bookmarks bar, extensions visible)
- [ ] Export template preview screenshots for each of the 5 templates

### Production
- [ ] Record voiceover in a treated room (or use professional AI voice: ElevenLabs, Murf.ai)
- [ ] Screen recordings: Use OBS Studio or Loom at 60fps
- [ ] Animated graphics: After Effects, Rive, or Framer Motion export
- [ ] Text animations: Kinetic typography (After Effects or DaVinci Resolve)

### Post-Production
- [ ] Edit in Premiere Pro / DaVinci Resolve / CapCut Pro
- [ ] Add motion blur to transitions
- [ ] Color grade all screen recordings to match the app's dark theme
- [ ] Add subtle vignette to frame edges
- [ ] Export at 1080p minimum, 4K preferred
- [ ] Create 9:16 vertical cut (TikTok/Reels/Shorts)
- [ ] Create 1:1 square cut (Instagram feed)
- [ ] Add captions/subtitles for accessibility

---

## 📱 Social Media Cuts

| Platform       | Aspect Ratio | Duration    | Key Focus                                  |
|----------------|-------------|-------------|---------------------------------------------|
| YouTube        | 16:9        | Full 2 min  | Complete showcase                           |
| Product Hunt   | 16:9        | 60–90 sec   | Cut scenes 1-3, 5, 7, 12                   |
| TikTok/Reels   | 9:16        | 30–45 sec   | Hook + Templates + AI + CTA                |
| Twitter/X      | 16:9        | 30 sec      | Hook + Dashboard demo + CTA                |
| LinkedIn       | 16:9        | 60 sec      | Professional angle — templates + AI + CTA   |
| Instagram Feed | 1:1         | 30 sec      | Templates carousel + CTA                    |

---

## 📝 Full Voiceover Script (Clean Copy)

```
Your resume is the first impression you make. Make it count.

But between clunky editors, ugly templates, and tools that cost a fortune…
building a great resume shouldn't be this hard.

Introducing ResumeBuilder — the free, open-source resume builder designed
for developers and professionals.

A beautiful interface. Built with modern tools. Designed to get you hired.

Choose from five professionally designed templates — Classic, Creative,
Minimal, Modern, and the premium LuxSleek sidebar layout. All ATS-optimized.

Create your account, jump into the dashboard, and start building in seconds.
Search, duplicate, and manage all your resumes from one place.

Fill in your details — personal info, experience, education, skills, and
projects. See your resume update in real-time with our live preview.

Need help writing? Our AI assistant generates compelling summaries, rewrites
your experience with stronger verbs, and even analyzes your resume with a
professional score.

Upload an existing resume — we'll parse it, analyze it, and give you
actionable feedback.

And when you're ready to apply — generate tailored cover letters with AI. Just
paste the job description, select your resume, and let the magic happen.

Privacy first — your data stays in your browser. Lightning fast — no server
lag, instant rendering. And one-click PDF export — ready for any employer.

Start free — forever. No credit card required. Upgrade to Pro for unlimited AI
assistance and all premium templates. And yes, we're fully open source on
GitHub.

New here? Our guided tutorial walks you through everything — step by step. From
creating your first resume to exporting it as a pixel-perfect PDF.

Your dream job starts with a dream resume.
Start building — for free — today.
```

**Word count:** ~230 words
**Estimated speaking time at 150 wpm:** ~92 seconds ✅

---

## 🎯 Key Messaging Pillars

1. **Free & Open Source** — No hidden costs, transparent development
2. **AI-Powered** — Smart content generation, resume analysis, cover letters
3. **Professional Templates** — 5 ATS-optimized designs for any career level
4. **Privacy First** — Local storage, zero tracking
5. **Beautiful & Fast** — Dark mode UI, real-time preview, instant PDF export
6. **Community Driven** — Built by developers, for everyone

---

*Script prepared by the ResumeBuilder Product & Marketing Team*
*Last updated: February 12, 2026*
