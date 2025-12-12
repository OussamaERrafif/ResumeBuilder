"use client"

import React from "react"
import { Sparkles, CreditCard, Clock, Check, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AICreditsUsage, UserProfile } from "@/lib/profile-service"
import { formatDate } from "@/lib/format-utils"
import { UserPreferences } from "@/lib/profile-service"

interface BillingSettingsProps {
  profile: UserProfile
  creditsUsage: AICreditsUsage[]
  preferences?: UserPreferences
}

export function BillingSettings({ profile, creditsUsage, preferences }: BillingSettingsProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium": return "bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white"
      case "pro": return "bg-gradient-to-r from-blue-600 to-cyan-600 border-none text-white"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  const creditPercentage = Math.min((profile.ai_credits / 100) * 100, 100)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Billing & Usage</h2>
        <p className="text-muted-foreground">
          Manage your subscription plan and monitor your AI credit usage.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Card */}
        <Card className="flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Plan</span>
              <Badge className={getTierColor(profile.subscription_tier)}>
                {profile.subscription_tier.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {profile.subscription_tier === 'free' 
                ? "Upgrade to unlock more features." 
                : "Your subscription is active."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Unlimited PDF Downloads</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Basic AI Resume Analysis</span>
              </div>
              {profile.subscription_tier !== 'free' && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Advanced Cover Letter Generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Priority Support</span>
                  </div>
                </>
              )}
            </div>
            {profile.subscription_expires && (
              <p className="text-xs text-muted-foreground mt-4">
                {profile.subscription_tier !== "free" ? "Renews" : "Expires"} on{" "}
                {formatDate(profile.subscription_expires, preferences)}
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button className="w-full group">
              {profile.subscription_tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
              <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* AI Credits Card */}
        <Card className="flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle>AI Credits</CardTitle>
            <CardDescription>
              Credits are used for generating content and analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-4xl font-bold">{profile.ai_credits}</span>
                <span className="text-sm text-muted-foreground mb-1">Available</span>
              </div>
              <Progress value={creditPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                Refills monthly based on your plan
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
               <div className="bg-muted/50 p-3 rounded-lg text-center">
                 <div className="text-lg font-semibold">5</div>
                 <div className="text-xs text-muted-foreground">Cover Letter</div>
               </div>
               <div className="bg-muted/50 p-3 rounded-lg text-center">
                 <div className="text-lg font-semibold">3</div>
                 <div className="text-xs text-muted-foreground">Resume Analysis</div>
               </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full">Buy More Credits</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Usage History
          </CardTitle>
          <CardDescription>See how you've used your AI credits recently.</CardDescription>
        </CardHeader>
        <CardContent>
          {creditsUsage.length > 0 ? (
            <div className="space-y-4">
              {creditsUsage.map((usage) => (
                <div key={usage.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full mt-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{usage.feature}</p>
                      {usage.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{usage.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(usage.created_at, preferences)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    -{usage.credits_used}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-8 text-muted-foreground">
               <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
               <p>No credit usage recorded yet.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
