/**
 * @fileoverview Performance monitoring and optimization hooks
 * Production-ready performance utilities for React components
 */

"use client"

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react"

/**
 * Hook for tracking component render performance
 * @param componentName - Name of the component for logging
 * @param enabled - Whether performance tracking is enabled
 */
export function useRenderPerformance(componentName: string, enabled: boolean = process.env.NODE_ENV === 'development') {
  const renderStartTime = useRef<number | undefined>(undefined)
  const renderCount = useRef(0)
  const mountTime = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!enabled) return
    
    mountTime.current = performance.now()
    
    return () => {
      if (mountTime.current) {
        const totalLifetime = performance.now() - mountTime.current
        console.log(`🔧 Component ${componentName} lifetime: ${totalLifetime.toFixed(2)}ms, renders: ${renderCount.current}`)
      }
    }
  }, [componentName, enabled])

  if (enabled) {
    renderStartTime.current = performance.now()
    renderCount.current++
    
    // Log slow renders
    const checkRenderTime = () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current
        if (renderTime > 16) { // Slower than 60fps
          console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`)
        }
      }
    }
    
    // Use setTimeout to check render time after DOM updates
    setTimeout(checkRenderTime, 0)
  }
}

/**
 * Hook for debouncing values with performance optimization
 * @param value - Value to debounce
 * @param delay - Debounce delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for throttling function calls
 * @param callback - Function to throttle
 * @param delay - Throttle delay in milliseconds
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttleRef = useRef<number | null>(null)
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (throttleRef.current) return
      
      throttleRef.current = setTimeout(() => {
        throttleRef.current = null
      }, delay)
      
      return callback(...args)
    }) as T,
    [callback, delay]
  )
}

/**
 * Hook for measuring and optimizing expensive calculations
 * @param factory - Function that performs expensive calculation
 * @param deps - Dependencies array
 * @param name - Name for performance logging
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  name?: string
): T {
  const startTime = useRef<number | undefined>(undefined)
  
  return useMemo(() => {
    if (process.env.NODE_ENV === 'development' && name) {
      startTime.current = performance.now()
    }
    
    const result = factory()
    
    if (process.env.NODE_ENV === 'development' && name && startTime.current) {
      const executionTime = performance.now() - startTime.current
      if (executionTime > 10) { // Log slow calculations
        console.warn(`🐌 Slow calculation in ${name}: ${executionTime.toFixed(2)}ms`)
      }
    }
    
    return result
  }, deps)
}

/**
 * Hook for monitoring component re-renders
 * @param componentName - Name of the component
 * @param props - Props object to track changes
 */
export function useWhyDidYouUpdate(componentName: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any> | undefined>(undefined)
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      const changedProps: Record<string, { from: any; to: any }> = {}
      
      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          }
        }
      })
      
      if (Object.keys(changedProps).length) {
        console.log(`🔄 ${componentName} re-rendered due to:`, changedProps)
      }
    }
    
    previousProps.current = props
  })
}

/**
 * Hook for lazy loading heavy components
 * @param importFunc - Dynamic import function
 * @param fallback - Fallback component while loading
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = () => null
) {
  const [Component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponent = useCallback(async () => {
    if (Component || loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const module = await importFunc()
      setComponent(() => module.default)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [Component, loading, importFunc])

  return {
    Component: Component || fallback,
    loading,
    error,
    loadComponent
  }
}

/**
 * Hook for intersection observer with performance optimizations
 * @param options - Intersection observer options
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState<Element | null>(null)

  const ref = useCallback((node: Element | null) => {
    setElement(node)
  }, [])

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [element, options])

  return [ref, isIntersecting]
}

/**
 * Hook for prefetching resources
 * @param urls - Array of URLs to prefetch
 * @param priority - Prefetch priority
 */
export function usePrefetch(urls: string[], priority: 'high' | 'low' = 'low') {
  useEffect(() => {
    if (typeof window === 'undefined') return

    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      if (priority === 'high') {
        link.setAttribute('as', 'fetch')
        link.setAttribute('crossorigin', 'anonymous')
      }
      document.head.appendChild(link)
    })

    return () => {
      // Cleanup prefetch links
      urls.forEach(url => {
        const existingLink = document.querySelector(`link[rel="prefetch"][href="${url}"]`)
        if (existingLink) {
          document.head.removeChild(existingLink)
        }
      })
    }
  }, [urls, priority])
}
