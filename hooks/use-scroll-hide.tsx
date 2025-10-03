"use client"

import { useState, useEffect, useCallback } from "react"

interface UseScrollHideOptions {
  /**
   * The distance in pixels to scroll before triggering hide/show
   * @default 50
   */
  threshold?: number
  /**
   * Whether the navbar should be hidden initially
   * @default false
   */
  initiallyHidden?: boolean
}

export function useScrollHide(options: UseScrollHideOptions = {}) {
  const { threshold = 50, initiallyHidden = false } = options
  // State representing whether the navbar is visible; initial value is true
  const [isVisible, setIsVisible] = useState(true)
  const [prevScrollY, setPrevScrollY] = useState(0)

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY

    // Keep navbar always visible - just track scroll position
    setIsVisible(true)
    setPrevScrollY(currentScrollY)
  }, [prevScrollY, threshold])

  useEffect(() => {
    // Add scroll event listener with throttling
    let timeoutId: NodeJS.Timeout

    const throttledHandleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 10) // Throttle to 100fps max
    }

    window.addEventListener("scroll", throttledHandleScroll, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [handleScroll])

  return { isVisible, currentScrollY: prevScrollY }
}