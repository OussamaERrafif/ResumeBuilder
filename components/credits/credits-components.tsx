"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  CreditCard,
  TrendingUp,
  Clock,
  Check,
  X,
  ChevronRight,
  AlertCircle,
  Zap,
  Crown,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCredits } from "@/hooks/use-credits"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

/**
 * Credit Balance Display Component
 * Shows current credit balance with visual indicator
 */
export function CreditBalance({ 
  compact = false,
  showBuyButton = true,
  onBuyClick,
}: { 
  compact?: boolean
  showBuyButton?: boolean
  onBuyClick?: () => void
}) {
  const { balance, loading, error } = useCredits()

  if (loading) {
    return compact ? (
      <Skeleton className="h-8 w-24" />
    ) : (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (error || !balance) {
    return compact ? (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Error
      </Badge>
    ) : (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-destructive">Failed to load credits</p>
        </CardContent>
      </Card>
    )
  }

  const percentage = Math.min((balance.current / balance.monthly_limit) * 100, 100)
  const isLow = balance.current <= 5

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-2 font-medium",
                isLow && "text-destructive"
              )}
              onClick={onBuyClick}
            >
              <Sparkles className="h-4 w-4" />
              <span>{balance.current}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{balance.current} AI credits remaining</p>
            {isLow && <p className="text-destructive">Low balance! Click to purchase more.</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className={cn(
            "text-3xl font-bold",
            isLow && "text-destructive"
          )}>
            {balance.current}
          </span>
          <span className="text-sm text-muted-foreground">
            / {balance.monthly_limit} monthly
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            isLow && "[&>div]:bg-destructive"
          )} 
        />
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Used this month: {balance.used_this_month}</span>
          {balance.reset_date && (
            <span>
              Resets: {new Date(balance.reset_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {showBuyButton && (
          <Button 
            className="w-full" 
            size="sm"
            onClick={onBuyClick}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Buy More Credits
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Credit Cost Badge
 * Shows how many credits a feature costs
 */
export function CreditCostBadge({ 
  cost, 
  current,
  showWarning = true,
}: { 
  cost: number
  current?: number
  showWarning?: boolean
}) {
  const hasEnough = current === undefined || current >= cost
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={hasEnough ? "secondary" : "destructive"}
            className="gap-1"
          >
            <Sparkles className="h-3 w-3" />
            {cost} {cost === 1 ? 'credit' : 'credits'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {hasEnough ? (
            <p>This action costs {cost} {cost === 1 ? 'credit' : 'credits'}</p>
          ) : (
            <p className="text-destructive">
              Insufficient credits! You need {cost} but have {current}.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Credit Purchase Modal
 * Allows users to buy credit packages or upgrade subscription
 */
export function CreditPurchaseModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { balance, packages, tiers, purchaseCredits, upgradeSubscription } = useCredits()
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState<'credits' | 'subscription'>('credits')
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchaseCredits = async (packageId: string) => {
    setLoading(packageId)
    try {
      const result = await purchaseCredits(packageId)
      if (!result.success) {
        toast({
          title: "Purchase Failed",
          description: result.error || "Unable to process purchase. Please try again.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleUpgradeSubscription = async (tier: string) => {
    if (tier === 'free') return
    
    setLoading(tier)
    try {
      const result = await upgradeSubscription(tier as any)
      if (!result.success) {
        toast({
          title: "Upgrade Failed",
          description: result.error || "Unable to process upgrade. Please try again.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const getTierIcon = (tierKey: string) => {
    switch (tierKey) {
      case 'premium':
        return <Crown className="h-5 w-5 text-purple-500" />
      case 'pro':
        return <Star className="h-5 w-5 text-blue-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Get More AI Credits
          </DialogTitle>
          <DialogDescription>
            Purchase credits or upgrade your subscription for unlimited AI features
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="flex rounded-lg border p-1 mb-4">
          <button
            onClick={() => setSelectedTab('credits')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              selectedTab === 'credits' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
          >
            Buy Credits
          </button>
          <button
            onClick={() => setSelectedTab('subscription')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              selectedTab === 'subscription' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
          >
            Upgrade Plan
          </button>
        </div>

        <AnimatePresence mode="wait">
          {selectedTab === 'credits' ? (
            <motion.div
              key="credits"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                One-time credit packages. Credits never expire and can be used for any AI feature.
              </p>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {packages.map((pkg) => (
                  <Card 
                    key={pkg.id}
                    className={cn(
                      "relative cursor-pointer transition-all hover:border-primary",
                      pkg.popular && "border-primary ring-1 ring-primary"
                    )}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 right-4 bg-primary">
                        Most Popular
                      </Badge>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-2xl font-bold">{pkg.credits}</span>
                        <span className="text-sm text-muted-foreground">credits</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-semibold">${pkg.price}</span>
                        {pkg.savings && (
                          <Badge variant="secondary" className="text-green-600">
                            {pkg.savings}
                          </Badge>
                        )}
                      </div>
                      <Button 
                        className="w-full" 
                        size="sm"
                        disabled={loading === pkg.id}
                        onClick={() => handlePurchaseCredits(pkg.id)}
                      >
                        {loading === pkg.id ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Processing...
                          </span>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Buy Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="subscription"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Monthly subscriptions with recurring credits and premium features.
              </p>
              
              <div className="grid gap-4">
                {Object.entries(tiers).map(([key, tier]) => {
                  const isCurrent = balance?.subscription_tier === key
                  
                  return (
                    <Card 
                      key={key}
                      className={cn(
                        "relative transition-all",
                        key === 'pro' && "border-primary ring-1 ring-primary",
                        isCurrent && "bg-muted/50"
                      )}
                    >
                      {key === 'pro' && (
                        <Badge className="absolute -top-2 right-4 bg-primary">
                          Recommended
                        </Badge>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getTierIcon(key)}
                            <div>
                              <h3 className="font-semibold">{tier.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {tier.monthlyCredits} credits/month
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold">
                              ${tier.price}
                            </span>
                            {tier.price > 0 && (
                              <span className="text-sm text-muted-foreground">/mo</span>
                            )}
                          </div>
                        </div>
                        
                        <ul className="space-y-2 mb-4">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        <Button 
                          className="w-full"
                          variant={isCurrent ? "secondary" : key === 'free' ? "outline" : "default"}
                          disabled={isCurrent || loading === key}
                          onClick={() => handleUpgradeSubscription(key)}
                        >
                          {loading === key ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Processing...
                            </span>
                          ) : isCurrent ? (
                            "Current Plan"
                          ) : key === 'free' ? (
                            "Downgrade"
                          ) : (
                            <>
                              Upgrade to {tier.name}
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator className="my-4" />

        <div className="text-center text-sm text-muted-foreground">
          <p>🔒 Secure payment powered by Stripe</p>
          <p>Cancel anytime • No hidden fees</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Credit Usage History Component
 */
export function CreditUsageHistory() {
  const { history, loadingHistory, fetchHistory } = useCredits()

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (loadingHistory) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No usage history yet</p>
        <p className="text-sm">Your AI credit usage will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
        >
          <div className={cn(
            "flex items-center justify-center h-10 w-10 rounded-full",
            item.credits_used > 0 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
          )}>
            {item.credits_used > 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <CreditCard className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {item.description || item.feature}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString()} at{' '}
              {new Date(item.created_at).toLocaleTimeString()}
            </p>
          </div>
          <Badge variant={item.credits_used > 0 ? "destructive" : "secondary"}>
            {item.credits_used > 0 ? '-' : '+'}{Math.abs(item.credits_used)}
          </Badge>
        </div>
      ))}
    </div>
  )
}

/**
 * Insufficient Credits Warning
 * Shows when user tries to use a feature without enough credits
 */
export function InsufficientCreditsWarning({
  required,
  current,
  feature,
  onBuyCredits,
}: {
  required: number
  current: number
  feature: string
  onBuyCredits: () => void
}) {
  return (
    <Card className="border-destructive bg-destructive/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-destructive">Insufficient Credits</h4>
            <p className="text-sm text-muted-foreground mt-1">
              You need <strong>{required}</strong> credits for {feature}, but only have{' '}
              <strong>{current}</strong>.
            </p>
            <Button 
              size="sm" 
              className="mt-3"
              onClick={onBuyCredits}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Get More Credits
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
