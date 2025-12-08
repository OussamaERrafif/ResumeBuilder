# AI Credits System & Payment Integration Guide

This document describes the AI credits system implementation and how to integrate payment providers for purchasing credits and subscriptions.

## Overview

The AI credits system provides:
- **Credit-based AI Feature Usage**: Each AI feature costs a specific number of credits
- **Subscription Tiers**: Free, Pro, and Premium tiers with different credit allocations
- **Credit Packages**: One-time purchase options for additional credits
- **Usage Tracking**: Full history of credit usage and transactions
- **Payment Integration Ready**: Prepared hooks for Stripe integration

## Credit Costs

| Feature | Credits | Description |
|---------|---------|-------------|
| `resume_summary` | 1 | Generate professional summary |
| `resume_experience` | 1 | Generate experience bullet points |
| `resume_project` | 1 | Generate project description |
| `resume_analysis` | 3 | Comprehensive resume analysis |
| `ats_score` | 2 | ATS compatibility check |
| `cover_letter_generation` | 5 | Generate full cover letter |
| `cover_letter_improvement` | 3 | Improve existing cover letter |
| `resume_rewrite` | 5 | Full resume content rewrite |
| `job_match_analysis` | 3 | Analyze job match fit |
| `interview_prep` | 4 | Interview preparation content |

## Subscription Tiers

| Tier | Monthly Credits | Max Credits | Price |
|------|-----------------|-------------|-------|
| Free | 10 | 10 | $0 |
| Pro | 100 | 200 | $9.99/mo |
| Premium | 500 | 1000 | $19.99/mo |

## Credit Packages

| Package | Credits | Price | Savings |
|---------|---------|-------|---------|
| `credits_10` | 10 | $2.99 | - |
| `credits_50` | 50 | $9.99 | 33% off |
| `credits_100` | 100 | $14.99 | 50% off |
| `credits_250` | 250 | $29.99 | 60% off |

## File Structure

```
lib/
  credits-service.ts        # Core credit service and payment service
hooks/
  use-credits.tsx           # React hook for credit management
components/
  credits/
    credits-components.tsx  # UI components (balance, purchase modal, history)
    index.ts               # Exports
app/
  api/
    credits/
      route.ts             # Get balance, use credits
      history/
        route.ts           # Get usage history
      purchase/
        route.ts           # Create purchase session
      webhook/
        route.ts           # Handle payment webhooks
scripts/
  create-ai-credits-usage-table.sql  # Database setup
```

## Usage

### Using Credits in Components

```tsx
import { useCredits, useAIFeature } from "@/hooks/use-credits"

// Simple hook for single feature
function MyComponent() {
  const aiFeature = useAIFeature('resume_summary')
  
  const handleGenerate = async () => {
    if (!aiFeature.canUse) {
      // Show purchase modal
      return
    }
    
    const result = await aiFeature.execute(async () => {
      // Your AI generation code
      return await generateContent()
    })
    
    if (result.success) {
      // Handle result.result
    } else {
      // Handle result.error
    }
  }
  
  return (
    <button disabled={!aiFeature.canUse}>
      Generate ({aiFeature.cost} credits)
    </button>
  )
}

// Full credits hook
function SettingsPage() {
  const { balance, purchaseCredits, tiers, packages } = useCredits()
  
  return (
    <div>
      <p>Credits: {balance?.current}</p>
    </div>
  )
}
```

### Display Credit Balance

```tsx
import { CreditBalance, CreditPurchaseModal } from "@/components/credits"

function Header() {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <>
      <CreditBalance compact onBuyClick={() => setShowModal(true)} />
      <CreditPurchaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
```

### Server-Side Credit Check

```typescript
import { CreditsService } from "@/lib/credits-service"

// In API route
const check = await CreditsService.checkCredits(userId, 'resume_analysis')

if (!check.allowed) {
  return Response.json({ 
    error: 'Insufficient credits',
    required: check.required,
    current: check.currentBalance 
  }, { status: 402 })
}

// Use credits
const result = await CreditsService.consumeCredits(userId, 'resume_analysis', 'Analyzed resume')
```

## Payment Integration (Stripe)

### 1. Install Stripe

```bash
pnpm add stripe @stripe/stripe-js
```

### 2. Environment Variables

Add to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs from Stripe Dashboard
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...
```

### 3. Update PaymentService

In `lib/credits-service.ts`, uncomment and modify the Stripe integration code:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export class PaymentService {
  static async createCreditPurchaseSession(userId: string, packageId: string) {
    const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId)
    if (!creditPackage) return { sessionUrl: null, error: 'Invalid package' }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${creditPackage.credits} AI Credits`,
          },
          unit_amount: Math.round(creditPackage.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?tab=billing&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?tab=billing`,
      metadata: { userId, packageId, credits: creditPackage.credits.toString(), type: 'credit_purchase' },
    })

    return { sessionUrl: session.url }
  }
}
```

### 4. Webhook Handler

Update `app/api/credits/webhook/route.ts`:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, type, credits } = session.metadata!
      
      if (type === 'credit_purchase') {
        await CreditsService.addCredits(userId, parseInt(credits), 'purchase', 'Credit purchase')
      }
      break
  }

  return Response.json({ received: true })
}
```

### 5. Configure Stripe Webhook

In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/credits/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`

## Database Setup

Run the SQL script in your Supabase SQL editor:

```sql
-- See scripts/create-ai-credits-usage-table.sql
```

This creates:
- `ai_credits_usage` table with indexes
- Row Level Security policies
- `get_monthly_credit_usage()` function
- `deduct_credits()` function (atomic operation)
- `add_credits()` function

## Testing

### Manual Credit Addition (Development)

```typescript
// In a test script or admin API
await CreditsService.addCredits(userId, 100, 'bonus', 'Testing credits')
```

### Simulate Purchase Success

```bash
curl -X POST http://localhost:3000/api/credits/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment.success",
    "userId": "user-uuid",
    "metadata": {
      "type": "credit_purchase",
      "credits": "50"
    }
  }'
```

## API Endpoints

### GET /api/credits
Returns current balance and monthly stats.

### POST /api/credits
Use credits for a feature.
```json
{
  "feature": "resume_summary",
  "description": "Optional description"
}
```

### GET /api/credits/history
Returns credit usage history.

### POST /api/credits/purchase
Create purchase session.
```json
{
  "type": "credits",
  "packageId": "credits_50"
}
```
or
```json
{
  "type": "subscription",
  "tier": "pro"
}
```

### POST /api/credits/webhook
Handle payment provider webhooks.

## Error Codes

| Status | Meaning |
|--------|---------|
| 402 | Insufficient credits |
| 401 | Unauthorized |
| 400 | Invalid request |
| 500 | Server error |

## Security Considerations

1. **Always check credits server-side** before making AI calls
2. **Use webhook signatures** to verify payment events
3. **RLS policies** ensure users can only see their own data
4. **Service role** required for adding credits
5. **Atomic transactions** prevent race conditions

## Monitoring

Track these metrics:
- Credits used per feature
- Purchase conversion rates
- Subscription churn
- Credit exhaustion rates

Use the `get_monthly_credit_usage()` SQL function for analytics queries.
