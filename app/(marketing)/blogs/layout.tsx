import type React from "react"
import { Navigation } from "@/components/landing/navigation"
import { Footer } from "@/components/landing/footer"

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navigation />
            <main className="flex-1 pt-24 pb-12">
                {children}
            </main>
            <Footer />
        </div>
    )
}
