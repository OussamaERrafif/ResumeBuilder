/**
 * @fileoverview Optimized loading components with Suspense boundaries
 * Provides skeleton loaders and lazy loading utilities for heavy components
 */

"use client"

import React, { Suspense, ComponentType, memo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// ============================================================================
// Skeleton Components
// ============================================================================

/**
 * Resume card skeleton
 */
export const ResumeCardSkeleton = memo(function ResumeCardSkeleton() {
  return (
    <Card className="h-full min-h-[400px]">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )
})

/**
 * Resume list skeleton
 */
export const ResumeListSkeleton = memo(function ResumeListSkeleton({ 
  count = 3 
}: { 
  count?: number 
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ResumeCardSkeleton key={i} />
      ))}
    </div>
  )
})

/**
 * Dashboard skeleton
 */
export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Resume list */}
      <ResumeListSkeleton count={6} />
    </div>
  )
})

/**
 * Profile skeleton
 */
export const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
})

/**
 * Form skeleton
 */
export const FormSkeleton = memo(function FormSkeleton({ 
  fields = 4 
}: { 
  fields?: number 
}) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-28" />
    </div>
  )
})

/**
 * Table skeleton
 */
export const TableSkeleton = memo(function TableSkeleton({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number
  columns?: number 
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
})

// ============================================================================
// Lazy Loading Utilities
// ============================================================================

/**
 * Create a lazy-loaded component with fallback
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  FallbackComponent: React.ReactNode = <LoadingSpinner />
): React.LazyExoticComponent<T> {
  const LazyComponent = React.lazy(importFn)
  
  // Preload on idle
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => importFn())
  }
  
  return LazyComponent
}

/**
 * Wrapper for lazy components with Suspense
 */
export function LazyLoad<P extends object>({
  component: Component,
  fallback = <LoadingSpinner />,
  ...props
}: {
  component: React.LazyExoticComponent<ComponentType<P>>
  fallback?: React.ReactNode
} & P) {
  return (
    <Suspense fallback={fallback}>
      <Component {...(props as P)} />
    </Suspense>
  )
}

// ============================================================================
// Loading Components
// ============================================================================

/**
 * Loading spinner
 */
export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = "default",
  className = ""
}: { 
  size?: "sm" | "default" | "lg"
  className?: string 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12"
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`}
      />
    </div>
  )
})

/**
 * Loading overlay
 */
export const LoadingOverlay = memo(function LoadingOverlay({ 
  message = "Loading..." 
}: { 
  message?: string 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
})

/**
 * Page loading component
 */
export const PageLoading = memo(function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
})

// ============================================================================
// Error Boundary with Loading State
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class LoadingErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center">
          <p className="text-destructive">Failed to load component</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================================================
// Intersection Observer for Lazy Loading
// ============================================================================

/**
 * Component that only renders children when visible
 */
export function LazyVisible({ 
  children, 
  fallback = <Skeleton className="h-40 w-full" />,
  rootMargin = "200px"
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}
