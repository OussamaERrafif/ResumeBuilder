import { NextResponse } from 'next/server'

/**
 * Diagnostic endpoint to check AI configuration status
 * This helps identify if environment variables are properly loaded
 * without exposing sensitive API keys
 */
export async function GET() {
    const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY)
    const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const hasSupabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Get key length without exposing the actual key
    const openAIKeyLength = process.env.OPENAI_API_KEY?.length || 0
    const openAIKeyPrefix = process.env.OPENAI_API_KEY?.substring(0, 7) || 'not-set'

    return NextResponse.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        aiConfiguration: {
            openai: {
                configured: hasOpenAIKey,
                keyLength: openAIKeyLength,
                keyPrefix: openAIKeyPrefix, // Shows 'sk-proj' or similar without exposing full key
            },
            supabase: {
                urlConfigured: hasSupabaseUrl,
                serviceKeyConfigured: hasSupabaseKey,
            }
        },
        buildInfo: {
            nextVersion: process.env.npm_package_version || 'unknown',
            nodeVersion: process.version,
        },
        message: hasOpenAIKey
            ? 'AI features should be working. If not, try rebuilding the application.'
            : 'OpenAI API key is not configured. Add OPENAI_API_KEY to your .env.local file and rebuild.',
    })
}
