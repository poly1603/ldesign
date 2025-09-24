import type { ApiEngine, ApiEngineConfig } from '../types'
import { createContext, type ReactNode, useContext, useMemo } from 'react'
import { createApiEngine } from '../core/factory'

/**
 * React 顶层 Provider
 * - 提供 ApiEngine 实例或通过 config 创建
 * - SSR 友好：不在构造阶段访问浏览器专有对象
 */
export const ApiEngineContext = createContext<ApiEngine | null>(null)

export interface ApiProviderProps {
  engine?: ApiEngine
  config?: ApiEngineConfig
  children?: ReactNode
}

export function ApiProvider({ engine, config, children }: ApiProviderProps) {
  const value = useMemo(() => engine ?? createApiEngine(config ?? {}), [engine, config])
  return <ApiEngineContext.Provider value={value}>{children}</ApiEngineContext.Provider>
}

/** 获取 ApiEngine 实例 */
export function useApi(): ApiEngine {
  const ctx = useContext(ApiEngineContext) as ApiEngine | null
  if (!ctx)
    throw new Error('ApiProvider is missing. Please wrap your app with <ApiProvider />')
  return ctx
}
