"use client"

import React, { useMemo, useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

export interface AnimationConfig {
  /** Animation intensity (1-100, higher = more distortion) */
  scale: number
  /** Animation speed (1-100, higher = faster movement) */
  speed: number
}

export interface NoiseConfig {
  /** Texture visibility (0-1) */
  opacity: number
  /** Texture density multiplier */
  scale: number
}

export interface EtherealShadowProps {
  /** Shadow color in RGBA format */
  color?: string
  /** How the shadow mask fills the container */
  sizing?: "fill" | "stretch"
  /** Animation intensity and speed settings */
  animation?: AnimationConfig
  /** Noise texture overlay configuration */
  noise?: NoiseConfig
  /** Additional CSS classes */
  className?: string
  /** Content to display above the shadow effect */
  children?: React.ReactNode
}

export function EtherealShadow({
  color = "rgba(128, 128, 128, 1)",
  sizing = "fill",
  animation = { scale: 100, speed: 30 },
  noise = { opacity: 0.3, scale: 2 },
  className = "",
  children,
}: EtherealShadowProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(true)

  // Pause animations when tab is not visible (saves CPU)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Memoize parsed color to prevent recalculation
  const { r, g, b, a } = useMemo(() => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/)
    if (match) {
      const [, r, g, b, a = "1"] = match
      return { r, g, b, a }
    }
    return { r: "128", g: "128", b: "128", a: "1" }
  }, [color])

  const animationDuration = Math.max(5, 100 - animation.speed) / 10
  const scaleIntensity = 1 + (animation.scale / 100)

  // Skip animations for reduced motion preference or when not visible
  const shouldAnimate = !prefersReducedMotion && isVisible

  // Static gradient styles (memoized)
  const gradientStyles = useMemo(() => ({
    main: {
      background: `radial-gradient(circle at 50% 50%, rgba(${r}, ${g}, ${b}, ${a}) 0%, rgba(${r}, ${g}, ${b}, ${parseFloat(a) * 0.6}) 25%, transparent 60%)`,
      opacity: 0.7,
      willChange: shouldAnimate ? "transform, opacity" : "auto",
    },
    secondary: {
      background: `radial-gradient(circle at 30% 30%, rgba(${r}, ${g}, ${b}, ${parseFloat(a) * 0.9}) 0%, rgba(${r}, ${g}, ${b}, ${parseFloat(a) * 0.4}) 20%, transparent 45%)`,
      opacity: 0.6,
      willChange: shouldAnimate ? "transform, opacity" : "auto",
    },
    tertiary: {
      background: `radial-gradient(circle at 70% 70%, rgba(${r}, ${g}, ${b}, ${parseFloat(a) * 0.85}) 0%, rgba(${r}, ${g}, ${b}, ${parseFloat(a) * 0.35}) 20%, transparent 50%)`,
      opacity: 0.6,
      willChange: shouldAnimate ? "transform, opacity" : "auto",
    },
  }), [r, g, b, a, shouldAnimate])

  return (
    <div className={`relative overflow-hidden min-h-screen ${className}`}>
      {/* Background base */}
      <div className="absolute inset-0 bg-black" style={{ zIndex: 0 }} />
      
      {/* Ethereal shadow container */}
      <div
        className={sizing === "fill" ? "absolute inset-0" : "absolute inset-0 w-screen h-screen"}
        style={{ zIndex: 1 }}
      >
        {/* Main pulsing gradient blob - simplified animation */}
        <motion.div
          className="absolute inset-0"
          style={gradientStyles.main}
          animate={shouldAnimate ? {
            scale: [1, scaleIntensity * 1.1, 1],
            opacity: [0.6, 0.75, 0.6],
          } : undefined}
          transition={{
            duration: animationDuration * 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Secondary floating blob - reduced complexity */}
        <motion.div
          className="absolute inset-0"
          style={gradientStyles.secondary}
          animate={shouldAnimate ? {
            x: [0, animation.scale * 0.4, 0],
            y: [0, -animation.scale * 0.3, 0],
            opacity: [0.5, 0.65, 0.5],
          } : undefined}
          transition={{
            duration: animationDuration * 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Tertiary floating blob - reduced complexity */}
        <motion.div
          className="absolute inset-0"
          style={gradientStyles.tertiary}
          animate={shouldAnimate ? {
            x: [0, -animation.scale * 0.3, 0],
            y: [0, animation.scale * 0.4, 0],
            opacity: [0.5, 0.6, 0.5],
          } : undefined}
          transition={{
            duration: animationDuration * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Noise overlay - static, no animation needed */}
        {noise.opacity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: noise.opacity,
              mixBlendMode: "overlay",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${noise.scale * 0.65}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />
        )}
      </div>
      
      {/* Content layer */}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  )
}

// Demo component
export default function Demo() {
  return (
    <div className="w-full h-screen">
      <EtherealShadow
        color="rgba(139, 92, 246, 1)"
        animation={{ scale: 80, speed: 40 }}
        noise={{ opacity: 0.2, scale: 1.5 }}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">
              Ethereal Shadow
            </h1>
            <p className="text-xl text-white/80">
              Animated gradient background effect
            </p>
          </div>
        </div>
      </EtherealShadow>
    </div>
  )
}