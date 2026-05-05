import { createClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client with Service Role access.
 * BYPASSES RLS POLICIES. USE WITH CAUTION.
 * 
 * Only available properly in server environments (API routes, Server Components).
 */
export const supabaseAdmin = (() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        if (typeof window === 'undefined') {
            // Only warn on server side to avoid noise in browser console where this is expected to fail
            console.warn('[Supabase Admin] Missing Service Role Key. Admin operations will fail.')
        }
        return null
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
})()
