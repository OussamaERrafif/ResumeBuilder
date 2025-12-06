/**
 * @fileoverview Performance-optimized hooks for reducing re-renders
 * Provides debounced callbacks and memoized state updates
 */

import { useCallback, useRef, useEffect, useState } from "react"

/**
 * Returns a debounced version of the callback that delays invocation
 * until after `delay` milliseconds have elapsed since the last call.
 * 
 * Unlike useMemo-based approaches, this properly handles changing callbacks.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )
}

/**
 * Returns a throttled version of the callback that only invokes
 * at most once per `delay` milliseconds.
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback)
  const lastRunRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastRun = now - lastRunRef.current

      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now
        callbackRef.current(...args)
      } else {
        // Schedule for remaining time
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now()
          callbackRef.current(...args)
        }, delay - timeSinceLastRun)
      }
    }) as T,
    [delay]
  )
}

/**
 * A state hook that batches rapid updates and only triggers
 * re-renders after a debounce period.
 * 
 * Returns [debouncedValue, setValue, immediateValue]
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [immediateValue, setImmediateValue] = useState(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setValue = useCallback((value: T) => {
    setImmediateValue(value)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
  }, [delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [debouncedValue, setValue, immediateValue]
}

/**
 * Hook that tracks if a value has been stable for a given duration.
 * Useful for showing "typing..." indicators or delaying expensive operations.
 */
export function useStableValue<T>(value: T, delay: number = 500): boolean {
  const [isStable, setIsStable] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousValueRef = useRef(value)

  useEffect(() => {
    if (previousValueRef.current !== value) {
      setIsStable(false)
      previousValueRef.current = value

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setIsStable(true)
      }, delay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return isStable
}

/**
 * Returns previous value of a variable.
 * Useful for comparing before/after in effects.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}
