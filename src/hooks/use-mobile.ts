import { useState, useEffect } from 'react'

// Hook to detect mobile devices
export function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        const isWindowMobile = window.innerWidth <= breakpoint
        setIsMobile(isWindowMobile)
      }
    }

    // Initial check
    checkIsMobile()

    // Add resize listener
    window.addEventListener('resize', checkIsMobile)

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [breakpoint])

  return isMobile
}