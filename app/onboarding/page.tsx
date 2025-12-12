"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowRight, CheckCircle2, Check, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useProfile } from "@/hooks/use-profile"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Schema for Step 1: Personal Info
const step1Schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  job_title: z.string().min(2, "Job title must be at least 2 characters"),
  experience_level: z.string({
    required_error: "Please select your experience level",
  }),
  industry: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

// Schema for Step 2: Referral Source
const step2Schema = z.object({
  referral_source: z.string({
    required_error: "Please tell us how you found us",
  }),
})

// Schema for Step 3: Plan Selection
const step3Schema = z.object({
  subscription_tier: z.enum(["free", "pro", "premium"], {
    required_error: "Please select a plan",
  }),
})

// Combined Schema (for form initialization, though we validate per step)
const onboardingSchema = step1Schema.merge(step2Schema).merge(step3Schema)

type OnboardingFormValues = z.infer<typeof onboardingSchema>

const STEPS = [
  { id: 1, title: "Profile", description: "Basic Information" },
  { id: 2, title: "Source", description: "How you found us" },
  { id: 3, title: "Plan", description: "Choose your tier" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { profile, updateProfile, loading: profileLoading } = useProfile()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: "",
      job_title: "",
      experience_level: "",
      industry: "",
      bio: "",
      referral_source: "",
      subscription_tier: "free",
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (profile) {
      if (profile.is_onboarded) {
        router.replace("/dashboard")
      } else {
        // Pre-fill form if data exists (e.g. user refreshed page)
        form.reset({
          full_name: profile.full_name || "",
          job_title: profile.job_title || "",
          bio: profile.bio || "",
          referral_source: profile.referral_source || "",
          subscription_tier: profile.subscription_tier || "free",
          experience_level: form.getValues("experience_level"), // Keep existing or empty
          industry: form.getValues("industry"), // Keep existing or empty
        })
      }
    }
  }, [profile, router, form])

  const validateStep = async (step: number) => {
    let isValid = false
    if (step === 1) {
      isValid = await form.trigger(["full_name", "job_title", "experience_level", "industry", "bio"])
    } else if (step === 2) {
      isValid = await form.trigger("referral_source")
    } else if (step === 3) {
      isValid = await form.trigger("subscription_tier")
    }
    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsSubmitting(true)
    try {
      const success = await updateProfile({
        full_name: data.full_name,
        job_title: data.job_title,
        bio: data.bio,
        referral_source: data.referral_source,
        subscription_tier: data.subscription_tier,
        is_onboarded: true,
      })

      if (success) {
        toast({
          title: "Welcome aboard!",
          description: "Your profile has been set up successfully.",
        })
        router.replace("/dashboard")
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-2xl border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Welcome to ResumeBuilder</CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].description}
            </CardDescription>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200",
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2 transition-colors duration-200",
                      currentStep > step.id ? "bg-primary/50" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="job_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experience_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="intern">Intern / Student</SelectItem>
                                <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                                <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                                <SelectItem value="senior">Senior (5+ years)</SelectItem>
                                <SelectItem value="lead">Lead / Manager</SelectItem>
                                <SelectItem value="executive">Executive</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Technology, Healthcare, Finance" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a bit about your professional background..."
                              className="resize-none min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="referral_source"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Where did you find us?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              {[
                                "Search Engine (Google, Bing)",
                                "Social Media (LinkedIn, Twitter)",
                                "Friend or Colleague",
                                "Advertisement",
                                "Blog or Article",
                                "Other",
                              ].map((option) => (
                                <FormItem
                                  key={option}
                                  className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={option} />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer w-full">
                                    {option}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="subscription_tier"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-lg font-semibold text-center block mb-6">
                            Choose your plan
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                              {/* Free Tier Card */}
                              <FormItem className={cn(
                                "relative flex flex-col space-y-2 rounded-xl border-2 p-6 cursor-pointer transition-all hover:bg-muted/50",
                                field.value === "free" ? "border-primary bg-primary/5" : "border-border"
                              )}>
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <h3 className="font-bold text-xl">Free</h3>
                                    <p className="text-sm text-muted-foreground">For getting started</p>
                                  </div>
                                  <FormControl>
                                    <RadioGroupItem value="free" className="mt-1" />
                                  </FormControl>
                                </div>
                                <div className="text-2xl font-bold mt-4">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                <ul className="text-sm space-y-2 mt-4 text-muted-foreground">
                                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> 1 Resume</li>
                                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Basic Templates</li>
                                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> 10 AI Credits/mo</li>
                                </ul>
                              </FormItem>

                              {/* Pro Tier Card */}
                              <FormItem className={cn(
                                "relative flex flex-col space-y-2 rounded-xl border-2 p-6 cursor-pointer transition-all hover:bg-muted/50",
                                field.value === "pro" ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border"
                              )}>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                  RECOMMENDED
                                </div>
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <h3 className="font-bold text-xl text-primary">Pro</h3>
                                    <p className="text-sm text-muted-foreground">For serious job seekers</p>
                                  </div>
                                  <FormControl>
                                    <RadioGroupItem value="pro" className="mt-1" />
                                  </FormControl>
                                </div>
                                <div className="text-2xl font-bold mt-4">$9.99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                <ul className="text-sm space-y-2 mt-4 text-muted-foreground">
                                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Unlimited Resumes</li>
                                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> All Premium Templates</li>
                                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> 100 AI Credits/mo</li>
                                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Cover Letter Generator</li>
                                </ul>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className={currentStep === 1 ? "invisible" : ""}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center border-t bg-muted/20 py-4">
          <p className="text-xs text-muted-foreground text-center">
            You can manage your subscription and settings anytime from your dashboard.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
