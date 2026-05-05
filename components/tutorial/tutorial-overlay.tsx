"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Check, Sparkles, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Step {
    targetId: string
    title: string
    description: string
    position?: "top" | "bottom" | "left" | "right"
}

export interface TutorialOverlayProps {
    steps: Step[]
    isOpen: boolean
    onClose: () => void  // Usually just closes the modal
    onComplete: () => void // Marks as complete
    onSkip?: () => void  // Explicit skip action
}

export function TutorialOverlay({ steps, isOpen, onClose, onComplete, onSkip }: TutorialOverlayProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [isReady, setIsReady] = useState(false)

    const currentStep = steps[currentStepIndex]

    // Scroll to element function - separate from rect update
    const scrollToTarget = useCallback(() => {
        if (!currentStep) return

        const element = document.getElementById(currentStep.targetId)
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
        }
    }, [currentStep])

    // Update rect function - purely operational
    const updateRect = useCallback(() => {
        if (!currentStep) return

        const element = document.getElementById(currentStep.targetId)
        if (element) {
            const rect = element.getBoundingClientRect()

            // Only update if actually changed to avoid re-renders? 
            // Actually React state updates are cheap if value is same-ish, but let's just set it.
            // We need to account for the fact that we might be checking before the scroll finishes.
            setTargetRect(rect)
            setIsReady(true)
        }
    }, [currentStep])

    // Effect to handle step changes: Scroll then wait then measure
    useEffect(() => {
        if (isOpen && currentStep) {
            setIsReady(false)
            scrollToTarget()

            // Check immediately
            updateRect()

            // And check a few times as scroll happens
            const timers = [
                setTimeout(updateRect, 100),
                setTimeout(updateRect, 300),
                setTimeout(updateRect, 500), // Ensure we catch it after smooth scroll
                setTimeout(updateRect, 800)
            ]

            return () => timers.forEach(clearTimeout)
        }
    }, [isOpen, currentStep, scrollToTarget, updateRect])

    // Effect to handle resize and scroll events efficiently
    useEffect(() => {
        if (!isOpen) return

        const handleResizeOrScroll = () => {
            // Debounce or requestAnimationFrame could be used here, but for now direct call 
            // is usually fine if we don't do heavy logic.
            // However, we strictly do NOT call scrollToTarget here.
            updateRect()
        }

        // Capture is true to get scroll events from all elements, not just window
        window.addEventListener("resize", handleResizeOrScroll, true)
        window.addEventListener("scroll", handleResizeOrScroll, true)

        return () => {
            window.removeEventListener("resize", handleResizeOrScroll, true)
            window.removeEventListener("scroll", handleResizeOrScroll, true)
        }
    }, [isOpen, updateRect])


    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex((prev) => prev + 1)
        } else {
            onComplete()
        }
    }

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1)
        }
    }

    const handleSkip = () => {
        if (onSkip) {
            onSkip()
        } else {
            onComplete()
        }
    }

    if (!isOpen || !currentStep) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] overflow-hidden"
                >
                    {/* Backdrop with Spotlight Effect */}
                    {/* We use a different technique for better "squares" (spotlight). 
              Instead of a transparent box, we can use a massive path with a hole, 
              or just 4 divs. A massive box shadow is the easiest trick. */}

                    <div className="absolute inset-0 pointer-events-none transition-colors duration-500">
                        {/* The dark overlay is actually the shadow of the spotlight div */}
                    </div>

                    {targetRect && isReady && (
                        <motion.div
                            layoutId="spotlight"
                            className="absolute bg-transparent rounded-xl ring-2 ring-primary/50 pointer-events-none"
                            initial={false}
                            animate={{
                                top: targetRect.top - 4,
                                left: targetRect.left - 4,
                                width: targetRect.width + 8,
                                height: targetRect.height + 8,
                                // Using a massive shadow to create the dimming effect around the spotlight
                                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)"
                            }}
                            transition={{ type: "spring", stiffness: 60, damping: 20, mass: 0.5 }}
                        />
                    )}

                    {/* Tooltip */}
                    {targetRect && isReady && (
                        <motion.div
                            key={currentStepIndex}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ delay: 0.1 }}
                            className="absolute pointer-events-auto w-80 md:w-96 bg-card/95 backdrop-blur-md border border-primary/20 rounded-xl shadow-2xl p-5"
                            style={{
                                top: currentStep.position === "top"
                                    ? targetRect.top - 20
                                    : currentStep.position === "bottom"
                                        ? targetRect.bottom + 20
                                        : targetRect.top + targetRect.height / 2,
                                left: currentStep.position === "left"
                                    ? targetRect.left - 20
                                    : currentStep.position === "right"
                                        ? targetRect.right + 20
                                        : targetRect.left + targetRect.width / 2,
                                transform: `translate(${currentStep.position === "left"
                                        ? "-100%, -50%"
                                        : currentStep.position === "right"
                                            ? "0, -50%"
                                            : "-50%, " + (currentStep.position === "top" ? "-100%" : "0")
                                    })`,
                            }}
                        >
                            {/* Tooltip Arrow (Visual only) */}
                            <div
                                className={cn(
                                    "absolute w-3 h-3 bg-card border-l border-t border-primary/20 rotate-45 transform",
                                    currentStep.position === "top"
                                        ? "bottom-[-7px] left-1/2 -translate-x-1/2 rotate-[225deg]"
                                        : currentStep.position === "bottom"
                                            ? "top-[-7px] left-1/2 -translate-x-1/2 rotate-45"
                                            : currentStep.position === "left"
                                                ? "right-[-7px] top-1/2 -translate-y-1/2 rotate-[135deg]"
                                                : "left-[-7px] top-1/2 -translate-y-1/2 rotate-[-45deg]"
                                )}
                            />

                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs ring-1 ring-primary/40">
                                            {currentStepIndex + 1}
                                        </div>
                                        <h3 className="font-semibold text-lg leading-tight">{currentStep.title}</h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-muted-foreground hover:text-foreground text-xs"
                                        onClick={handleSkip}
                                    >
                                        Skip
                                    </Button>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {currentStep.description}
                                </p>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-1.5">
                                        {steps.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "w-2 h-2 rounded-full transition-all duration-300",
                                                    idx === currentStepIndex
                                                        ? "bg-primary w-4"
                                                        : "bg-muted hover:bg-muted-foreground/50"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePrev}
                                            disabled={currentStepIndex === 0}
                                            className="h-8 w-8 p-0 rounded-lg hidden sm:flex"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleNext}
                                            className="h-8 px-4 rounded-lg shadow-lg hover:shadow-primary/25 bg-primary text-primary-foreground"
                                        >
                                            {currentStepIndex === steps.length - 1 ? (
                                                <>
                                                    Finish <Check className="h-3.5 w-3.5 ml-1.5" />
                                                </>
                                            ) : (
                                                <>
                                                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
