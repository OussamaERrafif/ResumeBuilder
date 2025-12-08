import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CreditsService } from '@/lib/credits-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/credits/history
 * Get user's credit usage history
 */
export async function GET(request: NextRequest) {
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

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Get history
    const history = await CreditsService.getCreditHistory(user.id, limit, offset)

    // Enhance history with feature names
    const enhancedHistory = history.map((item) => ({
      ...item,
      featureName: CreditsService.getFeatureName(item.feature as any) || item.feature,
    }))

    return NextResponse.json({
      history: enhancedHistory,
      pagination: {
        limit,
        offset,
        hasMore: history.length === limit,
      },
    })
  } catch (error) {
    console.error('Error getting credit history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
