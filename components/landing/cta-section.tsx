import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">Ready to Build Your Resume?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start building today with our free plan. No credit card required, no hidden fees. 
            Upgrade to Pro when you need advanced features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Building Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}