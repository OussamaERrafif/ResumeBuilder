"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)

        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-8 right-8 z-50"
                >
                    <Button
                        size="icon"
                        onClick={scrollToTop}
                        className="rounded-full shadow-lg hover:shadow-xl hover:shadow-primary/20 bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-muted"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
