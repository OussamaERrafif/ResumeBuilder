import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CreditsService, AI_FEATURE_COSTS, AIFeature } from '@/lib/credits-service'

// Create admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/credits
 * Get current user's credit balance and usage stats
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from session
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

    // Get credit balance
    const balance = await CreditsService.getCreditBalance(user.id)
    
    if (!balance) {
      return NextResponse.json(
        { error: 'Failed to get credit balance' },
        { status: 500 }
      )
    }

    // Get monthly stats
    const stats = await CreditsService.getMonthlyStats(user.id)

    return NextResponse.json({
      balance,
      stats,
      featureCosts: AI_FEATURE_COSTS,
    })
  } catch (error) {
    console.error('Error getting credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/credits
 * Use credits for an AI feature
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
    const { feature, description } = body

    // Validate feature
    if (!feature || !(feature in AI_FEATURE_COSTS)) {
      return NextResponse.json(
        { error: 'Invalid feature' },
        { status: 400 }
      )
    }

    // Check credits first
    const check = await CreditsService.checkCredits(user.id, feature as AIFeature)
    
    if (!check.allowed) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          required: check.required,
          current: check.currentBalance,
          shortfall: check.shortfall,
        },
        { status: 402 } // Payment Required
      )
    }

    // Consume credits
    const result = await CreditsService.consumeCredits(user.id, feature as AIFeature, description)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      creditsUsed: AI_FEATURE_COSTS[feature as AIFeature],
    })
  } catch (error) {
    console.error('Error using credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
