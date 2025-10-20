import { useCallback, useRef, useState } from 'react'
import { useApi } from '../provider'

export function useMutation<TResult = unknown, TVars = unknown>(
  methodName: string,
  options: {
    onMutate?: (variables: TVars) => void | (() => void)
    onSuccess?: (data: TResult, variables: TVars) => void
    onError?: (error: Error, variables: TVars, rollback?: () => void) => void
    onFinally?: () => void
    optimistic?: {
      apply?: (variables: TVars) => void | (() => void)
      snapshot?: () => unknown
      restore?: (snapshot: unknown) => void
      rollbackOnError?: boolean
      snapshotStrategy?: 'shallow' | 'deep'
      target?: { get: () => unknown, set: (v: unknown) => void }
    }
    lockWhilePending?: boolean
  } = {},
) {
  const api = useApi()
  const [data, setData] = useState<TResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const rollbackRef = useRef<(() => void) | undefined>(undefined)

  const clone = (val: unknown, deep: boolean) => {
    if (!deep) {
      if (Array.isArray(val))
        return (val as unknown[]).slice()
      if (val && typeof val === 'object')
        return { ...(val as Record<string, unknown>) }
      return val
    }
    try {
      if (typeof structuredClone === 'function')
        return structuredClone(val)
    }
    catch {}
    try { return JSON.parse(JSON.stringify(val)) }
    catch { return val }
  }

  const mutate = useCallback(async (variables: TVars, callOptions?: Parameters<typeof api.call>[2]) => {
    if (options.lockWhilePending && loading)
      return Promise.reject(new Error('Mutation is pending'))
    setLoading(true); setError(null); rollbackRef.current = undefined

    try {
      const rollbacks: Array<() => void> = []
      const maybeRollback = options.onMutate?.(variables)
      if (typeof maybeRollback === 'function')
        rollbacks.push(maybeRollback)

      if (options.optimistic?.snapshot && options.optimistic?.restore) {
        const snap = options.optimistic.snapshot()
        rollbacks.push(() => {
          try { options.optimistic!.restore!(snap) }
          catch {}
        })
      }
      else if (options.optimistic?.target && options.optimistic?.snapshotStrategy) {
        const snap = clone(options.optimistic.target.get(), options.optimistic.snapshotStrategy === 'deep')
        rollbacks.push(() => {
          try { options.optimistic!.target!.set(snap) }
          catch {}
        })
      }

      const optimisticRollback = options.optimistic?.apply?.(variables)
      if (typeof optimisticRollback === 'function')
        rollbacks.push(optimisticRollback)

      if (rollbacks.length > 0) {
        rollbackRef.current = () => {
          for (let i = rollbacks.length - 1; i >= 0; i--) {
            try { rollbacks[i]() }
            catch {}
          }
        }
      }

      const result = await api.call<TResult>(methodName, variables as unknown as any, callOptions as any)
      setData(result)
      options.onSuccess?.(result, variables)
      return result
    }
    catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      options.onError?.(err, variables, rollbackRef.current)
      if (rollbackRef.current && (options.optimistic?.rollbackOnError ?? true)) {
        try { rollbackRef.current() }
        catch {}
      }
      throw err
    }
    finally {
      setLoading(false)
      options.onFinally?.()
    }
  }, [api, methodName, options, loading])

  const reset = () => { setData(null); setLoading(false); setError(null); rollbackRef.current = undefined }

  return { data, loading, error, mutate, reset, isFinished: !loading, isSuccess: !loading && !error && data !== null, isError: !loading && !!error }
}
