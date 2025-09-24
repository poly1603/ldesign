import { type RefObject, useEffect } from 'react'

export interface UseIntersectionOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number
}

export function useIntersectionObserver(
  target: RefObject<Element | null>,
  onIntersect: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionOptions = {},
) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined')
      return
    const root = options.root ?? null
    const rootMargin = options.rootMargin ?? '0px'
    const threshold = options.threshold ?? 0

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting && onIntersect(e))
    }, { root, rootMargin, threshold })

    const el = target.current
    if (el)
      obs.observe(el)
    return () => obs.disconnect()
  }, [target, options.root, options.rootMargin, options.threshold, onIntersect])
}
