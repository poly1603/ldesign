/**
 * 认证中间件插件
 */

import type { ApiEngine, ApiPlugin } from '../types'
import { SYSTEM_API_METHODS } from '../types'

export interface AuthMiddlewaresOptions {
  getAccessToken?: () => string | null | undefined
  setAccessToken?: (token: string | null | undefined) => void
  getRefreshToken?: () => string | null | undefined
  setRefreshToken?: (token: string | null | undefined) => void
  headerName?: string
  scheme?: string
  isUnauthorized?: (error: unknown) => boolean
  refresh?: (engine: ApiEngine) => Promise<void>
}

function defaultIsUnauthorized(error: unknown): boolean {
  const anyErr = error as any
  return (
    anyErr?.status === 401
    || anyErr?.statusCode === 401
    || anyErr?.response?.status === 401
  )
}

function defaultGet(key: string): string | null | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : undefined
  }
  catch {
    return undefined
  }
}

function defaultSet(key: string, value: string | null | undefined): void {
  try {
    if (typeof localStorage === 'undefined')
      return
    if (value)
      localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  }
  catch {}
}

export function createAuthMiddlewaresPlugin(options: AuthMiddlewaresOptions = {}): ApiPlugin {
  const headerName = options.headerName ?? 'Authorization'
  const scheme = options.scheme ?? 'Bearer '
  const isUnauthorized = options.isUnauthorized ?? defaultIsUnauthorized

  const getAccessToken = options.getAccessToken ?? (() => defaultGet('access_token'))
  const setAccessToken = options.setAccessToken ?? (v => defaultSet('access_token', v ?? undefined))
  const _getRefreshToken = options.getRefreshToken ?? (() => defaultGet('refresh_token'))
  const setRefreshToken = options.setRefreshToken ?? (v => defaultSet('refresh_token', v ?? undefined))

  return {
    name: 'auth-middlewares',
    version: '1.0.0',

    install(engine) {
      engine.config.middlewares ||= {}
      engine.config.middlewares.request ||= []
      engine.config.middlewares.error ||= []

      const reqMw = (cfg: any) => {
        const token = getAccessToken()
        if (token) {
          cfg.headers = { ...(cfg.headers || {}), [headerName]: `${scheme}${token}` }
        }
        return cfg
      }

      const errMw = async (err: unknown) => {
        if (!isUnauthorized(err))
          return

        if (options.refresh) {
          await options.refresh(engine)
          return
        }

        if (engine.hasMethod?.(SYSTEM_API_METHODS.REFRESH_TOKEN)) {
          try {
            const result: any = await engine.call(SYSTEM_API_METHODS.REFRESH_TOKEN)
            if (result?.accessToken)
              setAccessToken(result.accessToken)
            if (result?.refreshToken)
              setRefreshToken(result.refreshToken)
          }
          catch {
            setAccessToken(null)
            setRefreshToken(null)
          }
        }
      }

      engine.config.middlewares.request.push(reqMw)
      engine.config.middlewares.error.push(errMw)

      engine.config.retry ||= {}
      if (engine.config.retry.enabled === undefined) {
        engine.config.retry.enabled = true
        engine.config.retry.retries = Math.max(1, engine.config.retry.retries || 1)
        engine.config.retry.delay = engine.config.retry.delay || 0
      }

      ;(engine as any).__auth_mw__ = { reqMw, errMw }
    },

    uninstall(engine) {
      const ref = (engine as any).__auth_mw__
      if (!ref)
        return
      const { reqMw, errMw } = ref
      const reqs = engine.config.middlewares?.request || []
      const errs = engine.config.middlewares?.error || []
      engine.config.middlewares!.request = reqs.filter(mw => mw !== reqMw)
      engine.config.middlewares!.error = errs.filter(mw => mw !== errMw)
      delete (engine as any).__auth_mw__
    },
  }
}

export const authMiddlewaresPlugin = createAuthMiddlewaresPlugin()
