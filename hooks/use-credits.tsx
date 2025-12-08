"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "./use-auth"
import { 
  CreditsService, 
  CreditBalance, 
  AIFeature, 
  AI_FEATURE_COSTS,
  SUBSCRIPTION_TIERS,
  CREDIT_PACKAGES,
  PaymentService,
  type SubscriptionTier,
  type CreditPackage,
} from "@/lib/credits-service"
import { AICreditsUsage } from "@/lib/profile-service"

// Timeout for credits initialization
const CREDITS_INIT_TIMEOUT = 5000

interface UseCreditsResult {
  // Balance and state
  balance: CreditBalance | null
  loading: boolean
  error: string | null
  
  // Credit operations
  checkCredits: (feature: AIFeature) => Promise<{ allowed: boolean; required: number; current: number }>
  consumeCredits: (feature: AIFeature, description?: string) => Promise<{ success: boolean; error?: string }>
  refreshBalance: () => Promise<void>
  
  // History and stats
  history: AICreditsUsage[]
  loadingHistory: boolean
  fetchHistory: () => Promise<void>
  monthlyStats: { totalUsed: number; byFeature: Record<string, number>; transactions: number } | null
  fetchMonthlyStats: () => Promise<void>
  
  // Purchase helpers
  purchaseCredits: (packageId: string) => Promise<{ success: boolean; error?: string }>
  upgradeSubscription: (tier: SubscriptionTier) => Promise<{ success: boolean; error?: string }>
  
  // Utilities
  getFeatureCost: (feature: AIFeature) => number
  getFeatureName: (feature: AIFeature) => string
  hasEnoughCredits: (feature: AIFeature) => boolean
  
  // Constants for UI
  tiers: typeof SUBSCRIPTION_TIERS
  packages: typeof CREDIT_PACKAGES
  featureCosts: typeof AI_FEATURE_COSTS
}

const CreditsContext = createContext<UseCreditsResult | undefined>(undefined)

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user, isConfigured } = useAuth()
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<AICreditsUsage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [monthlyStats, setMonthlyStats] = useState<{
    totalUsed: number
    byFeature: Record<string, number>
    transactions: number
  } | null>(null)
  const initializingRef = useRef(false)

  // Fetch balance when user changes
  const refreshBalance = useCallback(async () => {
    if (!user) {
      setBalance(null)
      setLoading(false)
      return
    }

    // Skip if Supabase is not configured
    if (!isConfigured) {
      setBalance(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const creditBalance = await CreditsService.getCreditBalance(user.id)
      setBalance(creditBalance)
    } catch (err) {
      console.error("Failed to fetch credit balance:", err)
      setError("Failed to load credits")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured])

  useEffect(() => {
    // Prevent double initialization
    if (initializingRef.current) return
    initializingRef.current = true

    // Set a timeout to prevent endless loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[Credits] Initialization timeout - setting loading to false')
        setLoading(false)
      }
    }, CREDITS_INIT_TIMEOUT)

    refreshBalance()

    return () => {
      clearTimeout(timeoutId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh when user changes (after initial load)
  useEffect(() => {
    if (initializingRef.current) {
      refreshBalance()
    }
  }, [user, refreshBalance])

  // Check if user has enough credits for a feature
  const checkCredits = useCallback(async (feature: AIFeature) => {
    if (!user) {
      return { allowed: false, required: AI_FEATURE_COSTS[feature], current: 0 }
    }
    
    const result = await CreditsService.checkCredits(user.id, feature)
    return {
      allowed: result.allowed,
      required: result.required,
      current: result.currentBalance,
    }
  }, [user])

  // Consume credits for a feature
  const consumeCredits = useCallback(async (feature: AIFeature, description?: string) => {
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const result = await CreditsService.consumeCredits(user.id, feature, description)
    
    if (result.success) {
      // Update local balance
      setBalance((prev) => prev ? { ...prev, current: result.newBalance } : null)
    }

    return { success: result.success, error: result.error }
  }, [user])

  // Fetch usage history
  const fetchHistory = useCallback(async () => {
    if (!user) return

    try {
      setLoadingHistory(true)
      const usageHistory = await CreditsService.getCreditHistory(user.id)
      setHistory(usageHistory)
    } catch (err) {
      console.error("Failed to fetch credit history:", err)
    } finally {
      setLoadingHistory(false)
    }
  }, [user])

  // Fetch monthly statistics
  const fetchMonthlyStats = useCallback(async () => {
    if (!user) return

    try {
      const stats = await CreditsService.getMonthlyStats(user.id)
      setMonthlyStats(stats)
    } catch (err) {
      console.error("Failed to fetch monthly stats:", err)
    }
  }, [user])

  // Purchase credits
  const purchaseCredits = useCallback(async (packageId: string) => {
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const result = await PaymentService.createCreditPurchaseSession(user.id, packageId)
    
    if (result.sessionUrl) {
      // Redirect to payment page
      window.location.href = result.sessionUrl
      return { success: true }
    }

    return { success: false, error: result.error }
  }, [user])

  // Upgrade subscription
  const upgradeSubscription = useCallback(async (tier: SubscriptionTier) => {
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const result = await PaymentService.createSubscriptionSession(user.id, tier)
    
    if (result.sessionUrl) {
      window.location.href = result.sessionUrl
      return { success: true }
    }

    return { success: false, error: result.error }
  }, [user])

  // Utility functions
  const getFeatureCost = useCallback((feature: AIFeature) => {
    return AI_FEATURE_COSTS[feature]
  }, [])

  const getFeatureName = useCallback((feature: AIFeature) => {
    return CreditsService.getFeatureName(feature)
  }, [])

  const hasEnoughCredits = useCallback((feature: AIFeature) => {
    if (!balance) return false
    return balance.current >= AI_FEATURE_COSTS[feature]
  }, [balance])

  const value: UseCreditsResult = {
    balance,
    loading,
    error,
    checkCredits,
    consumeCredits,
    refreshBalance,
    history,
    loadingHistory,
    fetchHistory,
    monthlyStats,
    fetchMonthlyStats,
    purchaseCredits,
    upgradeSubscription,
    getFeatureCost,
    getFeatureName,
    hasEnoughCredits,
    tiers: SUBSCRIPTION_TIERS,
    packages: CREDIT_PACKAGES,
    featureCosts: AI_FEATURE_COSTS,
  }

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits(): UseCreditsResult {
  const context = useContext(CreditsContext)
  
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider")
  }
  
  return context
}

/**
 * Hook for checking credits before AI actions
 * Provides a simple interface for components that use AI features
 */
export function useAIFeature(feature: AIFeature) {
  const credits = useCredits()
  const [isProcessing, setIsProcessing] = useState(false)

  const cost = credits.getFeatureCost(feature)
  const name = credits.getFeatureName(feature)
  const canUse = credits.hasEnoughCredits(feature)
  const currentCredits = credits.balance?.current ?? 0

  const execute = useCallback(async <T,>(
    action: () => Promise<T>,
    description?: string
  ): Promise<{ success: boolean; result?: T; error?: string }> => {
    if (!canUse) {
      return {
        success: false,
        error: `Insufficient credits. You need ${cost} credits but only have ${currentCredits}.`,
      }
    }

    setIsProcessing(true)

    try {
      // First, execute the AI action
      const result = await action()

      // If successful, deduct credits
      const creditResult = await credits.consumeCredits(feature, description)
      
      if (!creditResult.success) {
        // Action succeeded but credit deduction failed - log but don't fail
        console.warn("Credit deduction failed after successful AI action:", creditResult.error)
      }

      return { success: true, result }
    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred"
      return { success: false, error }
    } finally {
      setIsProcessing(false)
    }
  }, [canUse, cost, currentCredits, feature, credits])

  return {
    cost,
    name,
    canUse,
    currentCredits,
    isProcessing,
    execute,
  }
}
