import { useState, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'

export function GlobalLoader() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = router.subscribe('onBeforeNavigate', () => {
      setIsLoading(true)
    })

    const unsubscribeResolved = router.subscribe('onResolved', () => {
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
      unsubscribeResolved()
    }
  }, [router])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <div className="h-full w-full bg-feldora-surface overflow-hidden">
        <div className="h-full bg-gradient-to-r from-feldora-accent to-feldora-accent-secondary animate-loading-bar" />
      </div>
    </div>
  )
}
