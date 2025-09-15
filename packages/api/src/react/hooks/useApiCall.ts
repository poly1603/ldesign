import { useCallback, useEffect, useState } from 'react'
import type { ApiCallOptions } from '../../types'
import { useApi } from '../provider'

/**
 * useApiCall（React 版）
 * 与 Vue 版行为保持一致：data/loading/error/execute/reset + immediate
 */
export function useApiCall<T = unknown>(
  methodName: string,
  options: ApiCallOptions & { immediate?: boolean; onSuccess?: (d: T) => void; onError?: (e: Error) => void; onFinally?: () => void } = {},
) {
  const api = useApi()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (params?: unknown, callOpts?: ApiCallOptions) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.call<T>(methodName, params, { ...options, ...callOpts })
      setData(res)
      options.onSuccess?.(res)
      return res
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      options.onError?.(err)
      throw err
    } finally {
      setLoading(false)
      options.onFinally?.()
    }
  }, [api, methodName, options])

  useEffect(() => {
    if (options.immediate) void execute().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  const isFinished = !loading
  const isSuccess = !loading && !error && data !== null
  const isError = !loading && !!error

  return { data, loading, error, execute, reset, isFinished, isSuccess, isError }
}

