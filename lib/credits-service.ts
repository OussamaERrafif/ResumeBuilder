import { supabase } from './supabase'
import { supabaseAdmin } from './supabase-admin'
import { ProfileService, AICreditsUsage } from './profile-service'

/**
 * AI Feature Credit Costs
 * Defines how many credits each AI feature consumes
 */
export const AI_FEATURE_COSTS = {
  // Resume generation features
  'resume_summary': 1,
  'resume_experience': 1,
  'resume_project': 1,

  // Analysis features
  'resume_analysis': 3,
  'ats_score': 2,

  // Cover letter features
  'cover_letter_generation': 5,
  'cover_letter_improvement': 3,

  // Advanced features
  'resume_rewrite': 5,
  'job_match_analysis': 3,
  'interview_prep': 4,
} as const

export type AIFeature = keyof typeof AI_FEATURE_COSTS

/**
 * Subscription Tier Limits
 * Defines the monthly credit allocation and limits per tier
 */
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    monthlyCredits: 10,
    maxCredits: 10,
    price: 0,
    features: [
      'Basic resume templates',
      'Up to 3 resumes',
      '10 AI credits/month',
      'Basic export options',
    ],
  },
  pro: {
    name: 'Pro',
    monthlyCredits: 100,
    maxCredits: 200,
    price: 9.99,
    features: [
      'All resume templates',
      'Unlimited resumes',
      '100 AI credits/month',
      'Priority support',
      'Cover letters',
      'ATS optimization',
    ],
  },
  premium: {
    name: 'Premium',
    monthlyCredits: 500,
    maxCredits: 1000,
    price: 19.99,
    features: [
      'Everything in Pro',
      '500 AI credits/month',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Dedicated support',
    ],
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

/**
 * Credit Packages for Purchase
 * One-time credit packages users can buy
 */
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    credits: 10,
    price: 2.99,
    popular: false,
    savings: null,
  },
  {
    id: 'credits_50',
    credits: 50,
    price: 9.99,
    popular: true,
    savings: '33% off',
  },
  {
    id: 'credits_100',
    credits: 100,
    price: 14.99,
    popular: false,
    savings: '50% off',
  },
  {
    id: 'credits_250',
    credits: 250,
    price: 29.99,
    popular: false,
    savings: '60% off',
  },
] as const

export type CreditPackage = typeof CREDIT_PACKAGES[number]

/**
 * Credit Transaction Types
 */
export type CreditTransactionType = 'usage' | 'purchase' | 'refund' | 'subscription' | 'bonus'

export interface CreditTransaction {
  id: string
  user_id: string
  type: CreditTransactionType
  amount: number // positive for credits added, negative for credits used
  feature?: AIFeature
  description: string
  balance_after: number
  created_at: string
}

export interface CreditBalance {
  current: number
  used_this_month: number
  monthly_limit: number
  subscription_tier: SubscriptionTier
  reset_date: string | null
}

export interface CreditCheckResult {
  allowed: boolean
  currentBalance: number
  required: number
  shortfall: number
}

/**
 * CreditsService - Manages AI credit operations
 */
export class CreditsService {
  /**
   * Helper to get the correct client (Admin if on server, Standard if on client)
   */
  private static getClient() {
    return supabaseAdmin || supabase
  }

  /**
   * Check if user has enough credits for a feature
   */
  static async checkCredits(userId: string, feature: AIFeature): Promise<CreditCheckResult> {
    const required = AI_FEATURE_COSTS[feature]
    let currentBalance = 0

    // Use admin client if available to bypass RLS on server
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('user_profiles')
        .select('ai_credits')
        .eq('user_id', userId)
        .single()

      if (data) {
        currentBalance = data.ai_credits
      }
    } else {
      // Client-side fallback to ProfileService
      const profile = await ProfileService.getUserProfile(userId)
      if (profile) {
        currentBalance = profile.ai_credits
      }
    }

    return {
      allowed: currentBalance >= required,
      currentBalance,
      required,
      shortfall: Math.max(0, required - currentBalance),
    }
  }

  /**
   * Consume credits for an AI feature
   * Returns true if successful, false if insufficient credits
   */
  static async consumeCredits(
    userId: string,
    feature: AIFeature,
    description?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const check = await this.checkCredits(userId, feature)

    if (!check.allowed) {
      return {
        success: false,
        newBalance: check.currentBalance,
        error: `Insufficient credits. You need ${check.required} credits but only have ${check.currentBalance}.`,
      }
    }

    const creditsUsed = AI_FEATURE_COSTS[feature]
    const featureDescription = description || this.getFeatureDescription(feature)
    const newBalance = Math.max(0, check.currentBalance - creditsUsed)

    // db operation
    const client = this.getClient()

    // 1. Record usage
    const { error: usageError } = await client
      .from('ai_credits_usage')
      .insert({
        user_id: userId,
        feature,
        credits_used: creditsUsed,
        description: featureDescription,
        created_at: new Date().toISOString(),
      })

    if (usageError) {
      console.error('Error recording credit usage:', usageError)
      return {
        success: false,
        newBalance: check.currentBalance,
        error: 'Failed to record credit usage. Please try again.',
      }
    }

    // 2. Update user's credit balance
    const { error: updateError } = await client
      .from('user_profiles')
      .update({
        ai_credits: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating credit balance:', updateError)
      return {
        success: true,
        newBalance: check.currentBalance,
        error: 'Failed to update wallet balance.',
      }
    }

    return {
      success: true,
      newBalance,
    }
  }

  /**
   * Add credits to user's balance (for purchases, refunds, bonuses)
   */
  static async addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionType,
    description: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
      const client = this.getClient()

      // Get current profile for limits
      const { data: profile } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!profile) {
        return {
          success: false,
          newBalance: 0,
          error: 'User profile not found.',
        }
      }

      const tier = SUBSCRIPTION_TIERS[profile.subscription_tier as SubscriptionTier]
      const newBalance = Math.min(profile.ai_credits + amount, tier.maxCredits)

      // Update credits balance
      const { error: updateError } = await client
        .from('user_profiles')
        .update({
          ai_credits: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (updateError) {
        return {
          success: false,
          newBalance: profile.ai_credits,
          error: 'Failed to update credit balance.',
        }
      }

      // Record the transaction
      await client.from('ai_credits_usage').insert({
        user_id: userId,
        feature: type,
        credits_used: -amount, // Negative to indicate credits added
        description,
        created_at: new Date().toISOString(),
      })

      return {
        success: true,
        newBalance,
      }
    } catch (error) {
      console.error('Error adding credits:', error)
      return {
        success: false,
        newBalance: 0,
        error: 'An unexpected error occurred.',
      }
    }
  }

  /**
   * Get user's credit balance and usage info
   */
  static async getCreditBalance(userId: string): Promise<CreditBalance | null> {
    try {
      const client = this.getClient()

      const { data: profile } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!profile) {
        return null
      }

      // Get usage for current month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: usageData } = await client
        .from('ai_credits_usage')
        .select('credits_used')
        .eq('user_id', userId)
        .gt('credits_used', 0) // Only actual usage, not additions
        .gte('created_at', startOfMonth.toISOString())

      const usedThisMonth = usageData?.reduce((sum, u) => sum + u.credits_used, 0) || 0
      const tier = SUBSCRIPTION_TIERS[profile.subscription_tier as SubscriptionTier]

      // Calculate next reset date (first of next month)
      const resetDate = new Date()
      resetDate.setMonth(resetDate.getMonth() + 1)
      resetDate.setDate(1)
      resetDate.setHours(0, 0, 0, 0)

      return {
        current: profile.ai_credits,
        used_this_month: usedThisMonth,
        monthly_limit: tier.monthlyCredits,
        subscription_tier: profile.subscription_tier as SubscriptionTier,
        reset_date: resetDate.toISOString(),
      }
    } catch (error) {
      console.error('Error getting credit balance:', error)
      return null
    }
  }

  /**
   * Get credit usage history
   */
  static async getCreditHistory(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<AICreditsUsage[]> {
    const client = this.getClient()
    const { data, error } = await client
      .from('ai_credits_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching AI credits usage:', error)
      return []
    }
    return data || []
  }

  /**
   * Get usage statistics for the current month
   */
  static async getMonthlyStats(userId: string): Promise<{
    totalUsed: number
    byFeature: Record<string, number>
    transactions: number
  }> {
    try {
      const client = this.getClient()
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data } = await client
        .from('ai_credits_usage')
        .select('feature, credits_used')
        .eq('user_id', userId)
        .gt('credits_used', 0)
        .gte('created_at', startOfMonth.toISOString())

      if (!data) {
        return { totalUsed: 0, byFeature: {}, transactions: 0 }
      }

      const byFeature: Record<string, number> = {}
      let totalUsed = 0

      data.forEach((usage) => {
        totalUsed += usage.credits_used
        byFeature[usage.feature] = (byFeature[usage.feature] || 0) + usage.credits_used
      })

      return {
        totalUsed,
        byFeature,
        transactions: data.length,
      }
    } catch (error) {
      console.error('Error getting monthly stats:', error)
      return { totalUsed: 0, byFeature: {}, transactions: 0 }
    }
  }

  /**
   * Reset monthly credits for subscription tiers
   * This should be called by a scheduled job
   */
  static async resetMonthlyCredits(userId: string): Promise<boolean> {
    try {
      const client = this.getClient()
      const { data: profile } = await client
        .from('user_profiles')
        .select('subscription_tier, ai_credits')
        .eq('user_id', userId)
        .single()

      if (!profile) {
        return false
      }

      const tier = SUBSCRIPTION_TIERS[profile.subscription_tier as SubscriptionTier]

      return this.addCredits(
        userId,
        tier.monthlyCredits,
        'subscription',
        `Monthly credit reset for ${tier.name} plan`
      ).then((result) => result.success)
    } catch (error) {
      console.error('Error resetting monthly credits:', error)
      return false
    }
  }

  /**
   * Get feature description for display
   */
  static getFeatureDescription(feature: AIFeature): string {
    const descriptions: Record<AIFeature, string> = {
      resume_summary: 'Generated professional summary',
      resume_experience: 'Generated experience bullet points',
      resume_project: 'Generated project description',
      resume_analysis: 'Analyzed resume for improvements',
      ats_score: 'Calculated ATS compatibility score',
      cover_letter_generation: 'Generated cover letter',
      cover_letter_improvement: 'Improved cover letter',
      resume_rewrite: 'Rewrote resume content',
      job_match_analysis: 'Analyzed job match compatibility',
      interview_prep: 'Generated interview preparation content',
    }
    return descriptions[feature]
  }

  /**
   * Get human-readable feature name
   */
  static getFeatureName(feature: AIFeature): string {
    const names: Record<AIFeature, string> = {
      resume_summary: 'Summary Generation',
      resume_experience: 'Experience Generation',
      resume_project: 'Project Description',
      resume_analysis: 'Resume Analysis',
      ats_score: 'ATS Score',
      cover_letter_generation: 'Cover Letter',
      cover_letter_improvement: 'Cover Letter Improvement',
      resume_rewrite: 'Resume Rewrite',
      job_match_analysis: 'Job Match Analysis',
      interview_prep: 'Interview Prep',
    }
    return names[feature]
  }
}

/**
 * Payment Service Placeholder
 * Ready for integration with Stripe, PayPal, or other payment providers
 */
export class PaymentService {
  /**
   * Create a checkout session for credit purchase
   * TODO: Integrate with actual payment provider (Stripe recommended)
   */
  static async createCreditPurchaseSession(
    userId: string,
    packageId: string
  ): Promise<{ sessionUrl: string | null; error?: string }> {
    const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId)

    if (!creditPackage) {
      return { sessionUrl: null, error: 'Invalid credit package.' }
    }

    // Placeholder response
    console.log(`[PaymentService] Would create checkout for user ${userId}, package ${packageId}`)
    return {
      sessionUrl: null,
      error: 'Payment system not yet configured. Contact support for manual credit purchase.',
    }
  }

  /**
   * Create a subscription checkout session
   * TODO: Integrate with actual payment provider
   */
  static async createSubscriptionSession(
    userId: string,
    tier: SubscriptionTier
  ): Promise<{ sessionUrl: string | null; error?: string }> {
    if (tier === 'free') {
      return { sessionUrl: null, error: 'Cannot subscribe to free tier.' }
    }

    console.log(`[PaymentService] Would create subscription for user ${userId}, tier ${tier}`)
    return {
      sessionUrl: null,
      error: 'Subscription system not yet configured. Contact support for subscription upgrade.',
    }
  }

  /**
   * Handle successful payment webhook
   * Called by payment provider webhook after successful payment
   * TODO: Implement webhook handler
   */
  static async handlePaymentSuccess(
    userId: string,
    type: 'credit_purchase' | 'subscription',
    metadata: Record<string, string>
  ): Promise<boolean> {
    try {
      if (type === 'credit_purchase') {
        const credits = parseInt(metadata.credits, 10)
        const result = await CreditsService.addCredits(
          userId,
          credits,
          'purchase',
          `Purchased ${credits} AI credits`
        )
        return result.success
      }

      if (type === 'subscription') {
        const tier = metadata.tier as SubscriptionTier
        const tierConfig = SUBSCRIPTION_TIERS[tier]

        // Update user profile with new subscription
        const client = supabaseAdmin || supabase
        const { error } = await client
          .from('user_profiles')
          .update({
            subscription_tier: tier,
            subscription_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            ai_credits: tierConfig.monthlyCredits,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        if (error) {
          console.error('Error updating subscription:', error)
          return false
        }

        // Record credit addition
        await CreditsService.addCredits(
          userId,
          tierConfig.monthlyCredits,
          'subscription',
          `${tierConfig.name} subscription activated`
        )

        return true
      }

      return false
    } catch (error) {
      console.error('Error handling payment success:', error)
      return false
    }
  }

  /**
   * Cancel subscription
   * TODO: Implement with payment provider
   */
  static async cancelSubscription(userId: string): Promise<boolean> {
    // Update to free tier
    const client = supabaseAdmin || supabase
    const { error } = await client
      .from('user_profiles')
      .update({
        subscription_tier: 'free',
        subscription_expires: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    return !error
  }
}
