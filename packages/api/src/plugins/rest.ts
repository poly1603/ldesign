/**
 * REST 快速构建插件
 * 统一 CRUD 方法命名与缓存失效策略
 */
import type { ApiEngine, ApiMethodConfig, ApiPlugin } from '../types'

export interface RestPluginOptions<_TList = unknown, TItem = unknown, _TCreate = unknown, _TUpdate = Partial<TItem>> {
  /** 资源名（用于方法命名前缀，如 'user' => user.list/get/create/update/remove） */
  resource: string
  /** 基础路径，如 '/users'，支持 ':id' 或 '{id}' 模板 */
  basePath: string
  /** id 参数名（默认 'id'） */
  idParam?: string
  /** 是否注册各方法 */
  methods?: { list?: boolean, get?: boolean, create?: boolean, update?: boolean, remove?: boolean }
  /** 列表缓存 TTL（毫秒），默认 5 分钟 */
  listCacheTtl?: number
  /** 是否给列表启用缓存，默认启用 */
  enableListCache?: boolean
  /** 可选：成功后回调（比如埋点） */
  onSuccess?: (method: string, data: unknown, engine: ApiEngine) => void
  /** 提供路径模板参数，支持多段占位符（如 /users/:uid/posts/{pid}） */
  pathParams?: (src: Record<string, unknown> | undefined) => Record<string, unknown> | undefined
  map?: {
    listParams?: (params?: Record<string, unknown>) => Record<string, unknown> | undefined
    getParams?: (params: Record<string, unknown>) => Record<string, unknown> | undefined
    createData?: (data?: Record<string, unknown>) => Record<string, unknown> | undefined
    updateData?: (data: Record<string, unknown>) => Record<string, unknown> | undefined
    removeData?: (data: Record<string, unknown>) => Record<string, unknown> | undefined
  }
  transform?: {
    list?: (response: any) => any
    get?: (response: any) => any
    create?: (response: any) => any
    update?: (response: any) => any
    remove?: (response: any) => any
  }
  validate?: {
    list?: (data: any) => boolean
    get?: (data: any) => boolean
    create?: (data: any) => boolean
    update?: (data: any) => boolean
    remove?: (data: any) => boolean
  }
}

export function createRestApiPlugin(options: RestPluginOptions): ApiPlugin {
  const {
    resource,
    basePath,
    idParam = 'id',
    methods = { list: true, get: true, create: true, update: true, remove: true },
    listCacheTtl = 5 * 60 * 1000,
    enableListCache = true,
    onSuccess,
  } = options

  const names = {
    list: `${resource}.list`,
    get: `${resource}.get`,
    create: `${resource}.create`,
    update: `${resource}.update`,
    remove: `${resource}.remove`,
  }

  // 路径解析：支持 /path/:id 或 /path/{id}，否则附加 /id
  const resolvePath = (tpl: string, src: Record<string, unknown> | undefined): string => {
    let result = tpl
    const mapping = options.pathParams?.(src)
    if (mapping && typeof mapping === 'object') {
      for (const [k, v] of Object.entries(mapping)) {
        const enc = encodeURIComponent(String(v))
        result = result.replace(new RegExp(`:${k}(?=$|[\\/\\?&#])`, 'g'), enc)
        result = result.replace(new RegExp(`{${k}}`, 'g'), enc)
      }
    }
    // 兼容 idParam 回退
    const val = src?.[idParam]
    if (typeof val !== 'undefined' && val !== null && val !== '') {
      const enc = encodeURIComponent(String(val))
      const withColon = result.replace(new RegExp(`:${idParam}(?=$|[\\/\\?&#])`, 'g'), enc)
      const withBraces = withColon.replace(new RegExp(`{${idParam}}`, 'g'), enc)
      if (withBraces !== result)
        return withBraces
      return `${result}/${enc}`
    }
    return result
  }

  // 从 params 中去除 id 字段，避免重复出现在 query 中
  const stripIdFromParams = (params: Record<string, unknown> | undefined): Record<string, unknown> | undefined => {
    if (!params)
      return params
    const clone: Record<string, unknown> = { ...params }
    delete clone[idParam]
    return clone
  }

  const apis: Record<string, ApiMethodConfig> = {}

  if (methods.list) {
    apis[names.list] = {
      name: names.list,
      config: (params?: Record<string, unknown>) => ({ method: 'GET', url: basePath, params: options.map?.listParams ? options.map.listParams(params) : params }),
      transform: options.transform?.list,
      validate: options.validate?.list,
      cache: enableListCache ? { enabled: true, ttl: listCacheTtl } : { enabled: false },
    }
  }

  if (methods.get) {
    apis[names.get] = {
      name: names.get,
      config: (params: Record<string, unknown> & { [k: string]: unknown }) => ({
        method: 'GET',
        url: resolvePath(basePath, params),
        params: options.map?.getParams ? options.map.getParams(stripIdFromParams(params) || {}) : stripIdFromParams(params),
      }),
      transform: options.transform?.get,
      validate: options.validate?.get,
      cache: { enabled: true, ttl: listCacheTtl },
    }
  }

  if (methods.create) {
    apis[names.create] = {
      name: names.create,
      config: (data?: Record<string, unknown>) => ({ method: 'POST', url: basePath, data: options.map?.createData ? options.map.createData(data) : data }),
      transform: options.transform?.create,
      validate: options.validate?.create,
      // onSuccess 将在 install 中统一包装，以便拿到 engine 实例并清理缓存
      cache: { enabled: false },
    }
  }

  if (methods.update) {
    apis[names.update] = {
      name: names.update,
      config: (data: Record<string, unknown>) => ({ method: 'PUT', url: resolvePath(basePath, data), data: options.map?.updateData ? options.map.updateData(data) : data }),
      transform: options.transform?.update,
      validate: options.validate?.update,
      // onSuccess 将在 install 中统一包装
      cache: { enabled: false },
    }
  }

  if (methods.remove) {
    apis[names.remove] = {
      name: names.remove,
      config: (data: Record<string, unknown>) => ({ method: 'DELETE', url: resolvePath(basePath, data), data: options.map?.removeData ? options.map.removeData(data) : data }),
      transform: options.transform?.remove,
      validate: options.validate?.remove,
      // onSuccess 将在 install 中统一包装
      cache: { enabled: false },
    }
  }

  return {
    name: `rest-${resource}`,
    version: '1.0.0',
    apis,
    install(engine) {
      // 增强 onSuccess：对 create/update/remove 成功时，清理列表与 get 缓存
      const clearList = () => engine.clearCache?.(names.list)
      const clearGet = () => engine.clearCache?.(names.get)

      const wrap = (methodName: string, cfg: ApiMethodConfig) => ({
        ...cfg,
        onSuccess: (data: unknown) => {
          try { cfg.onSuccess?.(data) }
          catch {}
          if (methodName === names.create || methodName === names.update || methodName === names.remove) {
            // 变更类操作成功后清理相关缓存
            clearList()
            clearGet()
          }
          try { onSuccess?.(methodName, data, engine) }
          catch {}
        },
      })

      for (const k of Object.keys(apis)) {
        const cfg = engine.methods.get(k) || apis[k]
        engine.register(k, wrap(k, cfg))
      }
    },
  }
}
