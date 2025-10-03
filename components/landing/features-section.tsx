"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FEATURES } from "@/constants/landing"

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative overflow-hidden bg-muted/30">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-20"
        >
          <Badge variant="secondary" className="mb-6 border-border/50 bg-secondary/50 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
            <span className="text-foreground/90">Powerful Features</span>
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight text-balance">
            Everything you need to land your dream job.
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
            Professional tools designed for modern job seekers. No bloat, no gimmicks—just features that work.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50 border border-border/50 mb-20">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              viewport={{ once: true }}
              className="group relative bg-background hover:bg-card transition-colors duration-300"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-8 h-full flex flex-col">
                {/* Icon */}
                <motion.div className="mb-6 relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-colors duration-300">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Featured badge for first item */}
                  {index === 0 && (
                    <Badge
                      variant="outline"
                      className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 border-primary/30 bg-primary/10 text-primary"
                    >
                      Popular
                    </Badge>
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="mr-1">Learn more</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground tabular-nums">100+</span>
              <span className="text-sm text-muted-foreground">resumes created and counting</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
