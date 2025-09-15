/**
 * React Query 适配辅助（无直接依赖）
 * - 提供构建 queryFn/mutationFn 的工具
 * - 实际项目需自行安装 @tanstack/react-query
 */
import type { ApiEngine, ApiCallOptions } from '../types'

export function buildQueryFn<T = unknown>(engine: ApiEngine, methodName: string, baseOptions?: ApiCallOptions) {
  // 用于 React Query: queryFn: ({ queryKey }) => Promise<T>
  return async (ctx: { queryKey: unknown[] }) => {
    const [, params] = ctx.queryKey as [string, unknown]
    return engine.call<T>(methodName, params, baseOptions)
  }
}

export function buildInfiniteQueryFn<T = unknown>(engine: ApiEngine, methodName: string, baseParams?: Record<string, unknown>, baseOptions?: ApiCallOptions) {
  // 用于 React Query: queryFn: ({ pageParam }) => Promise<T>
  return async (ctx: { pageParam?: unknown }) => {
    const pageParam = ctx.pageParam as Record<string, unknown> | undefined
    const params = { ...(baseParams || {}), ...(pageParam || {}) }
    return engine.call<T>(methodName, params, baseOptions)
  }
}

export function buildMutationFn<TOut = unknown, TVars = unknown>(engine: ApiEngine, methodName: string, baseOptions?: ApiCallOptions) {
  // 用于 React Query: mutationFn: (vars) => Promise<TOut>
  return async (vars: TVars) => {
    return engine.call<TOut>(methodName, vars as unknown as any, baseOptions)
  }
}
