import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PaymentService, CREDIT_PACKAGES, SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/credits-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/credits/purchase
 * Get available credit packages and subscription tiers
 */
export async function GET() {
  return NextResponse.json({
    packages: CREDIT_PACKAGES,
    tiers: SUBSCRIPTION_TIERS,
  })
}

/**
 * POST /api/credits/purchase
 * Create a checkout session for credit purchase or subscription
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, packageId, tier } = body

    if (type === 'credits') {
      // Validate package
      const validPackage = CREDIT_PACKAGES.find((p) => p.id === packageId)
      if (!validPackage) {
        return NextResponse.json(
          { error: 'Invalid credit package' },
          { status: 400 }
        )
      }

      const result = await PaymentService.createCreditPurchaseSession(user.id, packageId)
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json({
        sessionUrl: result.sessionUrl,
      })
    }

    if (type === 'subscription') {
      // Validate tier
      if (!tier || !(tier in SUBSCRIPTION_TIERS) || tier === 'free') {
        return NextResponse.json(
          { error: 'Invalid subscription tier' },
          { status: 400 }
        )
      }

      const result = await PaymentService.createSubscriptionSession(user.id, tier as SubscriptionTier)
      
      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json({
        sessionUrl: result.sessionUrl,
      })
    }

    return NextResponse.json(
      { error: 'Invalid purchase type. Must be "credits" or "subscription"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error creating purchase session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
