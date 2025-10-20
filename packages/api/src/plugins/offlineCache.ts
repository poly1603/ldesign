/**
 * 离线缓存插件（持久化）
 * - 成功响应写入持久化存储（IndexedDB 优先，降级到 localStorage）
 * - 请求报错时（或离线）尝试返回持久化的旧数据，实现降级
 */
import type { ApiPlugin } from '../types'

export interface OfflineCachePluginOptions {
  /** 启用与否（默认启用） */
  enabled?: boolean
  /** 生成缓存键（默认 methodName + JSON.stringify(params)） */
  keyGenerator?: (methodName: string, params?: unknown) => string
  /** 缓存过期时间（毫秒，默认 10 分钟），<=0 表示不过期 */
  ttl?: number
  /** 仅在这些方法上启用（缺省表示全部方法） */
  include?: string[]
  /** 在这些方法上禁用 */
  exclude?: string[]
  /** 仅当网络错误时才读取离线缓存（默认 true） */
  onlyOnNetworkError?: boolean
}

export function createOfflineCachePlugin(options: OfflineCachePluginOptions = {}): ApiPlugin {
  const cfg: Required<OfflineCachePluginOptions> = {
    enabled: options.enabled ?? true,
    keyGenerator: options.keyGenerator ?? ((name, params) => `${name}:${JSON.stringify(params ?? {})}`),
    ttl: options.ttl ?? 10 * 60 * 1000,
    include: options.include ?? [],
    exclude: options.exclude ?? [],
    onlyOnNetworkError: options.onlyOnNetworkError ?? true,
  }

  function shouldApply(methodName: string) {
    if (!cfg.enabled)
      return false
    if (cfg.include.length > 0 && !cfg.include.includes(methodName))
      return false
    if (cfg.exclude.length > 0 && cfg.exclude.includes(methodName))
      return false
    return true
  }

  interface Stored { data: unknown, t: number, exp: number }

  const idb = typeof indexedDB !== 'undefined' ? indexedDB : undefined
  const dbName = 'ldesign_api_offline'
  const storeName = 'kv'
  let dbPromise: Promise<IDBDatabase> | null = null

  function openDB(): Promise<IDBDatabase> {
    if (!idb)
      return Promise.reject(new Error('indexedDB not available'))
    if (dbPromise)
      return dbPromise
    dbPromise = new Promise((resolve, reject) => {
      const req = idb.open(dbName, 1)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(storeName))
          db.createObjectStore(storeName)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    return dbPromise
  }

  async function idbGet(key: string): Promise<Stored | null> {
    try {
      const db = await openDB()
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)
        const r = store.get(key)
        r.onsuccess = () => resolve((r.result as Stored) ?? null)
        r.onerror = () => reject(r.error)
      })
    }
    catch {
      return null
    }
  }

  async function idbSet(key: string, value: Stored): Promise<void> {
    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        const r = store.put(value, key)
        r.onsuccess = () => resolve()
        r.onerror = () => reject(r.error)
      })
    }
    catch {
      // ignore
    }
  }

  async function idbDelete(key: string): Promise<void> {
    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        const r = store.delete(key)
        r.onsuccess = () => resolve()
        r.onerror = () => reject(r.error)
      })
    }
    catch {
      // ignore
    }
  }

  function lsGet(key: string): Stored | null {
    try { const s = localStorage.getItem(`ldesign_offline_${key}`); return s ? JSON.parse(s) : null }
    catch { return null }
  }
  function lsSet(key: string, v: Stored): void {
    try { localStorage.setItem(`ldesign_offline_${key}`, JSON.stringify(v)) }
    catch {}
  }
  function lsDel(key: string): void {
    try { localStorage.removeItem(`ldesign_offline_${key}`) }
    catch {}
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  const _isOnline = () => typeof navigator === 'undefined' ? true : navigator.onLine
  const now = () => Date.now()

  async function readCache(key: string): Promise<Stored | null> {
    if (idb)
      return await idbGet(key)
    return lsGet(key)
  }
  async function writeCache(key: string, data: unknown): Promise<void> {
    const v: Stored = { data, t: now(), exp: cfg.ttl > 0 ? now() + cfg.ttl : Number.MAX_SAFE_INTEGER }
    if (idb)
      return await idbSet(key, v)
    return lsSet(key, v)
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  async function _deleteCache(key: string): Promise<void> {
    if (idb)
      return await idbDelete(key)
    return lsDel(key)
  }

  return {
    name: 'offline-cache',
    version: '1.0.0',
    install(engine) {
      engine.config.middlewares ||= {}
      engine.config.middlewares.response ||= []
      engine.config.middlewares.error ||= []

      // 写缓存：响应成功后存储数据
      const resMw = async (response: any, ctx: any) => {
        const methodName = ctx.methodName
        if (!shouldApply(methodName))
          return response
        try {
          const key = cfg.keyGenerator(methodName, ctx.params)
          // response.data 是服务器返回数据（ApiEngine.transform 之前执行）
          const data = response?.data?.data ?? response?.data
          await writeCache(key, data)
        }
        catch {}
        return response
      }

      // 错误恢复：从缓存兜底
      const errMw = async (err: any, ctx: any) => {
        const methodName = ctx.methodName
        if (!shouldApply(methodName))
          return

        // 仅在网络错误时启用（默认）
        const isNetworkError = !('response' in (err || {})) || (err?.response?.status === 0)
        if (cfg.onlyOnNetworkError && !isNetworkError)
          return

        try {
          const key = cfg.keyGenerator(methodName, ctx.params)
          const cached = await readCache(key)
          if (cached && (cfg.ttl <= 0 || now() <= cached.exp)) {
            // 返回一个 ResponseData 以恢复流程
            return { data: cached.data, status: 200, headers: {}, config: {} }
          }
        }
        catch {}
      }

      engine.config.middlewares.response.push(resMw as any)
      engine.config.middlewares.error.push(errMw as any)
    },
  }
}
