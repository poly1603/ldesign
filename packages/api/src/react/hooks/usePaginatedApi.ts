import type { ApiCallOptions } from '../../types'
import { useEffect, useState } from 'react'
import { useApiCall } from './useApiCall'

/** 分页列表（React 版） */
export function usePaginatedApi<T = unknown>(
  methodName: string,
  options: ApiCallOptions & {
    page?: number
    pageSize?: number
    extract?: (result: any) => { items: T[], total: number }
    query?: Record<string, unknown>
    immediate?: boolean
    onSuccess?: (res: any) => void
    onError?: (e: Error) => void
    onFinally?: () => void
  } = {},
) {
  const [page, setPageState] = useState(options.page ?? 1)
  const [pageSize, setPageSizeState] = useState(options.pageSize ?? 10)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<T[]>([])

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

  const { loading, error, execute } = useApiCall<{ items: T[], total: number }>(methodName, {
    ...options,
    immediate: false,
    onSuccess: (res) => {
      const { items: its, total: tot } = extract(res)
      setItems(its)
      setTotal(tot)
      options.onSuccess?.(res)
    },
    onError: e => options.onError?.(e),
    onFinally: () => options.onFinally?.(),
  })

  const run = async () => {
    const params = { page, pageSize, ...(options.query || {}) }
    await execute(params, options)
  }

  const setPage = (p: number) => { setPageState(Math.max(1, p)); void run() }
  const setPageSize = (s: number) => { setPageSizeState(Math.max(1, s)); setPageState(1); void run() }
  const nextPage = () => setPage(page + 1)
  const prevPage = () => setPage(Math.max(1, page - 1))

  useEffect(() => {
    if (options.immediate)
      void run()
  }, [])

  return {
    page,
    pageSize,
    total,
    items,
    loading,
    error,
    run,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    isFinished: !loading,
    hasMore: items.length < total,
  }
}
