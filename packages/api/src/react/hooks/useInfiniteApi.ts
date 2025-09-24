import type { ApiCallOptions } from '../../types'
import { useEffect, useRef, useState } from 'react'
import { useApiCall } from './useApiCall'

/** 无限滚动（React 版） */
export function useInfiniteApi<T = unknown>(
  methodName: string,
  options: ApiCallOptions & {
    page?: number
    pageSize?: number
    extract?: (result: any) => { items: T[], total: number }
    query?: Record<string, unknown>
    auto?: boolean
    root?: Element | null
    rootMargin?: string
    threshold?: number
    immediate?: boolean
  } = {},
) {
  const [page, setPage] = useState(options.page ?? 1)
  const [pageSize] = useState(options.pageSize ?? 10)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<T[]>([])
  const targetRef = useRef<Element | null>(null)
  const extract = options.extract ?? ((res: any) => {
    if (res && typeof res === 'object') {
      if (Array.isArray(res.items) && typeof res.total === 'number')
        return { items: res.items as T[], total: res.total as number }
      if (Array.isArray(res.list) && typeof res.total === 'number')
        return { items: res.list as T[], total: res.total as number }
      if (Array.isArray(res.data) && typeof res.total === 'number')
        return { items: res.data as T[], total: res.total as number }
    }
    return { items: Array.isArray(res) ? (res as T[]) : [], total: 0 }
  })

  const { loading, error, execute } = useApiCall<{ items: T[], total: number }>(methodName, { ...options, immediate: false })

  const loadMore = async () => {
    const params = { page, pageSize, ...(options.query || {}) }
    const res = await execute(params, options)
    const { items: its, total: tot } = extract(res)
    setTotal(tot)
    setItems((prev: T[]) => ([...prev, ...its] as T[]))
    setPage((p: number) => p + 1)
    return its
  }

  const reset = () => {
    setPage(options.page ?? 1)
    setTotal(0)
    setItems([])
  }

  const hasMore = items.length < total

  useEffect(() => {
    if (options.immediate)
      void loadMore().catch(() => {})
  }, [])

  useEffect(() => {
    if (!options.auto)
      return
    if (typeof IntersectionObserver === 'undefined')
      return
    const root = options.root ?? null
    const rootMargin = options.rootMargin ?? '0px'
    const threshold = options.threshold ?? 0
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && hasMore && !loading)
          void loadMore().catch(() => {})
      })
    }, { root, rootMargin, threshold })
    const el = targetRef.current
    if (el)
      obs.observe(el)
    return () => obs.disconnect()
  }, [options.auto, options.root, options.rootMargin, options.threshold, hasMore, loading])

  return { items, total, page, pageSize, loading, error, loadMore, reset, hasMore, targetRef }
}
