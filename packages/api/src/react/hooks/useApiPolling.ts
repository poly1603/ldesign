import type { ApiCallOptions } from '../../types'
import { useEffect, useRef } from 'react'
import { useApiCall } from './useApiCall'

/** 定时轮询（React 版） */
export function useApiPolling<T = unknown>(
  methodName: string,
  options: ApiCallOptions & { interval: number, params?: unknown, autoStart?: boolean, immediate?: boolean, onSuccess?: (d: T) => void, onError?: (e: Error) => void, onFinally?: () => void } = { interval: 30000 },
) {
  const state = useApiCall<T>(methodName, { ...options, immediate: false })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    if (timerRef.current)
      return
    void state.execute(options.params, options).catch(() => {})
    timerRef.current = setInterval(() => {
      void state.execute(options.params, options).catch(() => {})
    }, options.interval)
  }

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    if (options.autoStart)
      start()
    return () => stop()
  }, [])

  return { ...state, start, stop, isActive: !!timerRef.current }
}
