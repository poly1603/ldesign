import type { ApiCallOptions } from '../../types'
import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../provider'

/**
 * 批量 API 调用（React 版）
 */
export function useBatchApiCall<T = unknown>(
  calls: Array<{ methodName: string, params?: unknown, options?: ApiCallOptions }>,
  options: Omit<ApiCallOptions, 'onSuccess' | 'onError'> & {
    immediate?: boolean
    onSuccess?: (results: T[]) => void
    onError?: (errors: (Error | null)[]) => void
    onFinally?: () => void
  } = {},
) {
  const api = useApi()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<(Error | null)[]>([])

  const execute = useCallback(async () => {
    setLoading(true)
    setData([])
    setErrors([])

    try {
      const results = await Promise.allSettled(
        calls.map(({ methodName, params, options: callOptions }) =>
          api.call<T>(methodName, params, { ...options, ...callOptions }),
        ),
      )

      const success: T[] = []
      const errs: (Error | null)[] = []
      for (const r of results) {
        if (r.status === 'fulfilled') {
          success.push(r.value)
          errs.push(null)
        }
        else {
          success.push(null as unknown as T)
          errs.push(r.reason instanceof Error ? r.reason : new Error(String(r.reason)))
        }
      }
      setData(success)
      setErrors(errs)
      options.onSuccess?.(success)
      return success
    }
    catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      options.onError?.([err])
      throw err
    }
    finally {
      setLoading(false)
      options.onFinally?.()
    }
  }, [api, calls, options])

  useEffect(() => {
    if (options.immediate)
      void execute()
  }, [])

  return {
    data,
    loading,
    errors,
    execute,
    reset: () => { setData([]); setLoading(false); setErrors([]) },
    isFinished: !loading,
    isSuccess: !loading && errors.every((e: Error | null) => e === null),
    hasErrors: errors.some((e: Error | null) => e !== null),
  }
}
