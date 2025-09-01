import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify the request comes from an authenticated user
    // Get the session from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get the user
    const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token)
    
    if (verifyError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Ensure the user can only delete their own account
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot delete another user\'s account' },
        { status: 403 }
      )
    }

    // Delete the user from Supabase Auth using admin privileges
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user from authentication system' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'User deleted successfully from authentication system' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in delete-user API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
