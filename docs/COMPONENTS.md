# Component & UI Reference

Complete reference for every major component in the ApexResume application — with props, behaviors, state management patterns, and source paths.

---

## Table of Contents

1. [Core Application Components](#1-core-application-components)
2. [Landing Page Components](#2-landing-page-components)
3. [Profile Components](#3-profile-components)
4. [Credits Components](#4-credits-components)
5. [Auth Components](#5-auth-components)
6. [SEO Components](#6-seo-components)
7. [Utility Components](#7-utility-components)
8. [UI Primitives (Shadcn/ui)](#8-ui-primitives)
9. [Styling Strategy](#9-styling-strategy)

---

## 1. Core Application Components

### `ResumeBuilder` — The Centerpiece

**File:** `app/components/resume-builder.tsx` (75KB)
**Role:** The primary state container and editor for the resume.

| Feature | Detail |
|---------|--------|
| **State Management** | Centralized `resumeData` state using React `useState`. Updates via custom `updateSection` handler ensuring immutable deep updates |
| **Form Sections** | Dynamic forms for PersonalInfo, Experience[], Education[], Skills, Projects[], References[], CustomSections[] |
| **Live Preview** | Real-time template rendering from local state (no DB round-trip) |
| **Auto-Save** | `useDebouncedCallback` (1s debounce) triggers `ResumeService.updateResume()` |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` for reordering experience and project entries |
| **Template Switching** | Template selector panel that updates `template_id` and re-renders preview |
| **AI Integration** | Triggers `AIModal` for content generation with current section context |
| **Section Management** | Add/remove/reorder sections, custom section support |

**State Shape:**
```typescript
const [resumeData, setResumeData] = useState<ResumeData>({
  personalInfo: { name: '', title: '', email: '', ... },
  experience: [],
  education: [],
  skills: { languages: '', frameworks: '', tools: '', other: '' },
  projects: [],
  references: [],
  customSections: [],
})
```

---

### `AIModal` — AI Interaction Interface

**File:** `app/components/ai-modal.tsx` (8KB)
**Role:** Unified modal for all AI feature interactions.

| Feature | Detail |
|---------|--------|
| **Loading States** | Skeleton loaders and progress indicators during AI generation |
| **Prompt Injection** | Dynamically injects current resume context into AI prompts |
| **Credit Validation** | Checks `useCredits` hook before allowing requests |
| **Error Handling** | Graceful fallback messages for API failures |
| **Result Actions** | Copy to clipboard, apply to resume, regenerate |

**Supported AI Actions:**
- Generate professional summary
- Generate experience bullet points
- Generate project description
- Full resume analysis (opens ResumeAnalysis view)

---

### `ResumeAnalysis` — Analysis Visualization

**File:** `app/components/resume-analysis.tsx` (20KB)
**Role:** Visualizes AI-generated resume feedback with charts and actionable insights.

| Feature | Detail |
|---------|--------|
| **Radar/Bar Charts** | `recharts` library for skill proficiency visualization |
| **Overall Score** | 0-100 score with color-coded ring indicator |
| **Job Matches** | Cards showing matching roles with percentages and reasoning |
| **Categorized Feedback** | Tabs for "Strengths" and "Improvements" |
| **ATS Score** | Dedicated ATS compatibility breakdown |
| **Save/Load** | Persists analysis via `AnalysisService` for offline viewing |

**Data consumed:**
```typescript
interface ResumeAnalysis {
  skillsAnalysis: SkillAnalysis[]  // { name, proficiency (0-100), category }
  jobMatches: JobMatch[]           // { title, matchPercentage, reasoning, salaryRange }
  summary: string                  // AI-generated analysis summary
}
```

---

## 2. Landing Page Components

Located in `components/landing/` — 13 modular sections composing the public homepage.

| Component | File | Size | Purpose |
|-----------|------|------|---------|
| `Navigation` | `navigation.tsx` | 9.2KB | Responsive nav with auth state, mobile menu, scroll behavior |
| `HeroSection` | `hero-section.tsx` | 4.8KB | Above-the-fold hero with headline, subtext, CTA buttons |
| `HeroDashboardPreview` | `hero-dashboard-preview.tsx` | 16.1KB | Animated interactive dashboard preview (GSAP) |
| `FeaturesSection` | `features-section.tsx` | 3.2KB | Feature grid with icons and descriptions |
| `ValuePropsSection` | `value-props-section.tsx` | 10.1KB | Detailed value propositions with illustrations |
| `TemplatesSection` | `templates-section.tsx` | 6.4KB | Template carousel/showcase |
| `TemplatePreview` | `template-preview.tsx` | 4.7KB | Individual template preview card |
| `PricingSection` | `pricing-section.tsx` | 4.9KB | 3-tier pricing cards (Free, Pro, Premium) |
| `CommunitySection` | `community-section.tsx` | 5.7KB | Social proof, testimonials, community stats |
| `CTASection` | `cta-section.tsx` | 2.4KB | Final call-to-action banner |
| `Footer` | `footer.tsx` | 8.3KB | Footer with links, social icons, newsletter |
| `LandingContent` | `landing-content.tsx` | 2.8KB | Content composition wrapper |
| `index.ts` | `index.ts` | 533B | Barrel exports for all landing components |

### Animation Stack

| Library | Usage | Components |
|---------|-------|-----------|
| **GSAP** | Scroll-triggered animations, timeline sequences | HeroDashboardPreview, ValuePropsSection |
| **Framer Motion** | Page transitions, hover effects, entrance animations | Navigation, FeaturesSection, PricingSection |
| **CSS Transitions** | Hover states, color transitions | All interactive elements |

---

## 3. Profile Components

Located in `components/profile/` — 7 components forming the profile/settings page.

| Component | Purpose |
|-----------|---------|
| **ProfileTab** | Edit personal info (name, email, bio, location, links, avatar upload) |
| **NotificationsTab** | Toggle email/marketing/feature/security notification preferences |
| **SecurityTab** | View login sessions, 2FA toggle, password change, session management |
| **PreferencesTab** | Set language, timezone, theme, date format, currency |
| **BillingTab** | View current plan, credit balance, purchase credits, usage history |
| **DangerZoneTab** | Account deletion with confirmation dialog |
| **ProfileComponents** | Shared UI elements for profile tabs |

**Profile page uses tabs** (Radix UI `Tabs`) to switch between sections:
```
Profile | Notifications | Security | Preferences | Billing | Danger Zone
```

---

## 4. Credits Components

Located in `components/credits/`.

| Component | Purpose |
|-----------|---------|
| `CreditBalance` | Compact credit balance display (for header/sidebar) |
| `CreditPurchaseModal` | Full purchase modal with package selection and Stripe integration |
| `CreditUsageHistory` | Paginated list of credit transactions |

**Usage pattern:**
```tsx
import { CreditBalance, CreditPurchaseModal } from '@/components/credits'

<CreditBalance compact onBuyClick={() => setShowModal(true)} />
<CreditPurchaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
```

---

## 5. Auth Components

Located in `components/auth/`.

| Component | Purpose |
|-----------|---------|
| `LoginForm` | Email/password login with validation, error handling, social login buttons |
| `SignupForm` | Registration form with password strength indicator, terms acceptance |

**Features:**
- Form validation with `react-hook-form` + `zod`
- Password strength meter
- Social login (Google, GitHub) via Supabase Auth
- Loading states and error messages
- Redirect handling (back to original page after login)

---

## 6. SEO Components

Located in `components/seo/`.

| Component | Purpose |
|-----------|---------|
| `StructuredData` | Renders JSON-LD schema markup (Organization, WebApp, SoftwareApp) |
| `MetaTags` | Dynamic meta tag generation for pages |

**Structured Data schemas generated:**
```typescript
generateOrganizationSchema()        // Organization JSON-LD
generateWebApplicationSchema()      // WebApplication JSON-LD
generateSoftwareApplicationSchema() // SoftwareApplication JSON-LD
```

These are injected in the root `layout.tsx` for site-wide SEO.

---

## 7. Utility Components

| Component | File | Purpose |
|-----------|------|---------|
| `DashboardNav` | `dashboard-nav.tsx` (7.5KB) | Sidebar navigation for authenticated pages |
| `DuplicateResumeModal` | `duplicate-resume-modal.tsx` (7KB) | Dialog for duplicating resumes with name customization |
| `ResumeUploadModal` | `resume-upload-modal.tsx` (9.4KB) | PDF upload with drag-and-drop, validation, progress |
| `ErrorBoundary` | `error-boundary.tsx` (9.1KB) | React error boundary with fallback UI and error reporting |
| `Loading` | `loading.tsx` (9.2KB) | Collection of skeleton loaders, spinners, and placeholder UIs |
| `SecurityDashboard` | `security-dashboard.tsx` (10.7KB) | Real-time security event visualization, IP tracking |
| `ThemeProvider` | `theme-provider.tsx` (303B) | next-themes provider wrapper |
| `ThemeToggle` | `theme-toggle.tsx` (780B) | Sun/moon toggle button for light/dark mode |
| `TutorialOverlay` | `tutorial/tutorial-overlay.tsx` | In-app guided tutorial system |

---

## 8. UI Primitives

Located in `components/ui/` — **59 components** based on Shadcn/ui + Radix UI.

### Core Interactive Components

| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Button` | Primary action button with variants (default, destructive, outline, ghost) | — |
| `Input` | Text input with label and error state | — |
| `Textarea` | Multi-line text input | — |
| `Select` | Dropdown selection | `@radix-ui/react-select` |
| `Checkbox` | Checkbox with label | `@radix-ui/react-checkbox` |
| `Switch` | Toggle switch | `@radix-ui/react-switch` |
| `Slider` | Range slider | `@radix-ui/react-slider` |
| `RadioGroup` | Radio button group | `@radix-ui/react-radio-group` |

### Layout & Display

| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Card` | Container card (Header, Content, Footer, Title, Description) | — |
| `Tabs` | Tab navigation | `@radix-ui/react-tabs` |
| `Accordion` | Expandable sections | `@radix-ui/react-accordion` |
| `Separator` | Visual divider | `@radix-ui/react-separator` |
| `Badge` | Status/label badges | — |
| `Avatar` | User avatar with fallback | `@radix-ui/react-avatar` |
| `Progress` | Progress bar | `@radix-ui/react-progress` |
| `Skeleton` | Loading placeholder | — |
| `ScrollArea` | Custom scrollbar container | `@radix-ui/react-scroll-area` |

### Overlay & Feedback

| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `Dialog` | Modal dialog | `@radix-ui/react-dialog` |
| `AlertDialog` | Confirmation dialog | `@radix-ui/react-alert-dialog` |
| `DropdownMenu` | Dropdown menu | `@radix-ui/react-dropdown-menu` |
| `ContextMenu` | Right-click menu | `@radix-ui/react-context-menu` |
| `Tooltip` | Hover tooltip | `@radix-ui/react-tooltip` |
| `Popover` | Popover content | `@radix-ui/react-popover` |
| `HoverCard` | Hover card | `@radix-ui/react-hover-card` |
| `Toast` / `Toaster` | Toast notifications | `@radix-ui/react-toast` + `sonner` |

### Navigation

| Component | Description | Radix Primitive |
|-----------|-------------|-----------------|
| `NavigationMenu` | Desktop navigation | `@radix-ui/react-navigation-menu` |
| `Menubar` | Menu bar | `@radix-ui/react-menubar` |
| `Command` | Command palette (⌘K) | `cmdk` |
| `Collapsible` | Collapsible section | `@radix-ui/react-collapsible` |

### Form Helpers

| Component | Description |
|-----------|-------------|
| `Label` | Form label (Radix) |
| `Form` | React Hook Form integration |
| `InputOTP` | One-time password input |
| `Calendar` | Date picker (`react-day-picker`) |
| `DatePicker` | Date picker wrapper |

### Data Display

| Component | Description |
|-----------|-------------|
| `Table` | Data table |
| `Carousel` | Image/content carousel (`embla-carousel-react`) |
| `AspectRatio` | Aspect ratio container |
| `ResizablePanels` | Resizable split panels (`react-resizable-panels`) |
| `Drawer` | Bottom drawer (`vaul`) |

---

## 9. Styling Strategy

### Design System

| Token | Value |
|-------|-------|
| **Primary Color** | `#8B5CF6` (Violet) |
| **Font** | Montserrat (300-900 weights) |
| **Border Radius** | `0.5rem` (default), `0.75rem` (large) |
| **Animation** | `transition-all duration-200 ease-in-out` |

### Libraries Used

| Library | Purpose | Components |
|---------|---------|-----------|
| **Tailwind CSS 3** | Utility-first styling | All components |
| **Framer Motion** | Smooth transitions, page animations | Dashboard, landing, modals |
| **GSAP** | High-performance scroll animations | Landing page hero |
| **Lucide React** | Primary icon library (450+ icons) | All icons |
| **Font Awesome** | Secondary icon library | Landing page, footer |
| **Tailwind Animate** | CSS animation classes | Loading states, entrances |
| **class-variance-authority** | Component variants | Buttons, badges, inputs |
| **tailwind-merge** | Class conflict resolution | `cn()` utility |

### The `cn()` Utility

Located in `lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Used everywhere for merging Tailwind classes without conflicts:

```tsx
<div className={cn("p-4 bg-white", isActive && "bg-blue-50", className)}>
```
