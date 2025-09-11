/**
 * Vue 组合式 API
 * 提供 Vue 3 组合式 API 钩子函数
 */

import type { ComputedRef, Ref } from 'vue'
import type {
  ApiCallOptions,
  ApiEngine,
  LoginResult,
  MenuItem,
  UserInfo,
} from '../types'
import { computed, getCurrentInstance, inject, onUnmounted, ref, watch } from 'vue'
import { SYSTEM_API_METHODS } from '../types'
import { API_ENGINE_INJECTION_KEY } from './plugin'

/**
 * API 调用状态
 */
export interface ApiCallState<T = unknown> {
  /** 响应数据 */
  data: Ref<T | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 执行函数 */
  execute: (params?: unknown, options?: ApiCallOptions) => Promise<T>
  /** 重置状态 */
  reset: () => void
  /** 是否已完成 */
  isFinished: ComputedRef<boolean>
  /** 是否成功 */
  isSuccess: ComputedRef<boolean>
  /** 是否失败 */
  isError: ComputedRef<boolean>
}

/**
 * 变更类钩子：useMutation
 * - 封装创建/更新/删除等需要提交的操作
 * - 支持 onMutate（可返回回滚函数）、onSuccess/onError/onFinally
 */
export function useMutation<TResult = unknown, TVars = unknown>(
  methodName: string,
  options: UseApiCallOptions & {
    onMutate?: (variables: TVars) => void | (() => void)
    onSuccess?: (data: TResult, variables: TVars) => void
    onError?: (error: Error, variables: TVars, rollback?: () => void) => void
    optimistic?: {
      /** 直接应用变更，返回回滚函数 */
      apply?: (variables: TVars) => void | (() => void)
      /** 生成快照 */
      snapshot?: () => unknown
      /** 从快照还原 */
      restore?: (snapshot: unknown) => void
      /** 出错时是否回滚（默认 true） */
      rollbackOnError?: boolean
      /** 内置快照策略：'shallow' | 'deep'（当未提供 snapshot/restore 且提供 target 时生效） */
      snapshotStrategy?: 'shallow' | 'deep'
      /** 目标读写器（与 snapshotStrategy 配合使用） */
      target?: { get: () => unknown; set: (v: unknown) => void }
    }
    /** 是否在进行中时拒绝新的 mutate 调用（默认 false） */
    lockWhilePending?: boolean
  } = {},
) {
  const api = useApi()
  const data = ref<TResult | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const isFinished = computed(() => !loading.value)
  const isSuccess = computed(() => !loading.value && !error.value && data.value !== null)
  const isError = computed(() => !loading.value && error.value !== null)

  let rollbackFn: (() => void) | undefined

  const mutate = async (variables: TVars, callOptions?: UseApiCallOptions) => {
    if (options.lockWhilePending && loading.value) {
      return Promise.reject(new Error('Mutation is pending'))
    }
    loading.value = true
    error.value = null
    rollbackFn = undefined

    try {
      const rollbacks: Array<() => void> = []

      // onMutate 回滚
      const maybeRollback = options.onMutate?.(variables)
      if (typeof maybeRollback === 'function') rollbacks.push(maybeRollback)

      // snapshot/restore 回滚（显式）
      if (options.optimistic?.snapshot && options.optimistic?.restore) {
        const snap = options.optimistic.snapshot()
        rollbacks.push(() => {
          try { options.optimistic!.restore!(snap) } catch {}
        })
      }
      // snapshotStrategy + target（内置）
      else if (options.optimistic?.target && options.optimistic?.snapshotStrategy) {
        const clone = (val: unknown) => {
          if (options.optimistic!.snapshotStrategy === 'shallow') {
            if (Array.isArray(val)) return (val as unknown[]).slice()
            if (val && typeof val === 'object') return { ...(val as Record<string, unknown>) }
            return val
          }
          // deep
          try {
            // @ts-ignore structuredClone may not exist in some env
            if (typeof structuredClone === 'function') return structuredClone(val)
          } catch {}
          try {
            return JSON.parse(JSON.stringify(val))
          } catch {
            return val
          }
        }
        const snap = clone(options.optimistic.target.get())
        rollbacks.push(() => {
          try { options.optimistic!.target!.set(snap) } catch {}
        })
      }

      // apply 回滚
      const optimisticRollback = options.optimistic?.apply?.(variables)
      if (typeof optimisticRollback === 'function') rollbacks.push(optimisticRollback)

      if (rollbacks.length > 0) {
        rollbackFn = () => {
          // 逆序回滚
          for (let i = rollbacks.length - 1; i >= 0; i--) {
            try { rollbacks[i]() } catch {}
          }
        }
      }

      const result = await api.call<TResult>(methodName, variables as unknown as any, {
        ...options,
        ...callOptions,
      })
      data.value = result

      options.onSuccess?.(result, variables)
      return result
    }
    catch (err) {
      const e = err instanceof Error ? err : new Error(String(err))
      error.value = e
      options.onError?.(e, variables, rollbackFn)
      if (rollbackFn && (options.optimistic?.rollbackOnError ?? true)) {
        try { rollbackFn() } catch {}
      }
      throw e
    }
    finally {
      loading.value = false
      options.onFinally?.()
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
    rollbackFn = undefined
  }

  return { data: data as Ref<TResult | null>, loading, error, isFinished, isSuccess, isError, mutate, reset }
}

/**
 * API 调用选项
 */
export interface UseApiCallOptions extends ApiCallOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 成功回调 */
  onSuccess?: (data: unknown) => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 完成回调 */
  onFinally?: () => void
}

/**
 * 获取 API 引擎实例
 *
 * @returns API 引擎实例
 *
 * @example
 * ```typescript
 * import { useApi } from '@ldesign/api/vue'
 *
 * const apiEngine = useApi()
 * const result = await apiEngine.call('getUserInfo')
 * ```
 */
export function useApi(): ApiEngine {
  // 尝试从依赖注入获取
  const injectedEngine = inject<ApiEngine>(API_ENGINE_INJECTION_KEY)
  if (injectedEngine) {
    return injectedEngine
  }

  // 尝试从全局属性获取
  const instance = getCurrentInstance()
  if (instance?.appContext.app.config.globalProperties.$api) {
    return instance.appContext.app.config.globalProperties.$api
  }

  throw new Error('API Engine not found. Please install ApiVuePlugin first.')
}

/**
 * API 调用钩子
 *
 * @param methodName API 方法名称
 * @param options 调用选项
 * @returns API 调用状态
 *
 * @example
 * ```typescript
 * import { useApiCall } from '@ldesign/api/vue'
 *
 * const { data, loading, error, execute } = useApiCall('getUserInfo', {
 *   immediate: true,
 *   onSuccess: (data) => console.log('Success:', data),
 *   onError: (error) => console.error('Error:', error),
 * })
 * ```
 */
export function useApiCall<T = unknown>(
  methodName: string,
  options: UseApiCallOptions = {},
): ApiCallState<T> {
  const apiEngine = useApi()

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const isFinished = computed(() => !loading.value)
  const isSuccess = computed(
    () => !loading.value && !error.value && data.value !== null,
  )
  const isError = computed(() => !loading.value && error.value !== null)

  const execute = async (
    params?: unknown,
    executeOptions?: ApiCallOptions,
  ): Promise<T> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiEngine.call<T>(methodName, params, {
        ...options,
        ...executeOptions,
      })

      data.value = result

      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result
    }
    catch (err) {
      const apiError = err instanceof Error ? err : new Error(String(err))
      error.value = apiError

      if (options.onError) {
        options.onError(apiError)
      }

      throw apiError
    }
    finally {
      loading.value = false

      if (options.onFinally) {
        options.onFinally()
      }
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  // 立即执行
  if (options.immediate) {
    // 避免未处理的 Promise 拒绝
    execute().catch(() => {})
  }

  return {
    data: data as unknown as Ref<T | null>,
    loading,
    error,
    execute,
    reset,
    isFinished,
    isSuccess,
    isError,
  }
}

/**
 * 轮询式 API 调用钩子
 * 定时按间隔调用某个 API 方法，适合状态刷新、心跳等场景
 */
export function useApiPolling<T = unknown>(
  methodName: string,
  options: UseApiCallOptions & { interval: number; params?: unknown; autoStart?: boolean } = { interval: 30000 },
) {
  const state = useApiCall<T>(methodName, { ...options, immediate: false })
  let timer: ReturnType<typeof setInterval> | null = null

  const start = () => {
    if (timer) return
    // 立即执行一次
    state.execute(options.params, options).catch(() => {})
    timer = globalThis.setInterval(() => {
      state.execute(options.params, options).catch(() => {})
    }, options.interval)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  if (options.autoStart) {
    start()
  }

  onUnmounted(() => {
    stop()
  })

  return {
    ...state,
    start,
    stop,
    isActive: computed(() => timer !== null),
  }
}

/**
 * 批量 API 调用钩子
 *
 * @param calls API 调用配置数组
 * @param options 调用选项
 * @returns 批量调用状态
 *
 * @example
 * ```typescript
 * import { useBatchApiCall } from '@ldesign/api/vue'
 *
 * const { data, loading, errors, execute } = useBatchApiCall([
 *   { methodName: 'getUserInfo' },
 *   { methodName: 'getMenus' },
 *   { methodName: 'getPermissions' },
 * ])
 * ```
 */
export function useInfiniteApi<T = unknown>(
  methodName: string,
  options: UseApiCallOptions & {
    page?: number
    pageSize?: number
    extract?: (result: any) => { items: T[]; total: number }
    query?: Record<string, unknown>
    auto?: boolean
    target?: Ref<Element | null>
    root?: Element | null
    rootMargin?: string
    threshold?: number
  } = {},
) {
  const page = ref(options.page ?? 1)
  const pageSize = ref(options.pageSize ?? 10)
  const total = ref(0)
  const items = ref<T[]>([])

  const extract = options.extract ?? ((res: any) => {
    if (res && typeof res === 'object') {
      if (Array.isArray(res.items) && typeof res.total === 'number') return { items: res.items as T[], total: res.total as number }
      if (Array.isArray(res.list) && typeof res.total === 'number') return { items: res.list as T[], total: res.total as number }
      if (Array.isArray(res.data) && typeof res.total === 'number') return { items: res.data as T[], total: res.total as number }
    }
    return { items: Array.isArray(res) ? res as T[] : [], total: 0 }
  })

  const { loading, error, execute } = useApiCall<{ items: T[]; total: number }>(methodName, { ...options, immediate: false })

  const loadMore = async () => {
    const params = { page: page.value, pageSize: pageSize.value, ...(options.query || {}) }
    const res = await execute(params, options)
    const { items: its, total: tot } = extract(res)
    total.value = tot
    items.value = [...items.value, ...its] as T[]
    page.value += 1
    return its
  }

  const reset = () => {
    page.value = options.page ?? 1
    pageSize.value = options.pageSize ?? 10
    total.value = 0
    items.value = []
  }

  const hasMore = computed(() => items.value.length < total.value)

  if (options.immediate) {
    loadMore().catch(() => {})
  }

  let observer: IntersectionObserver | null = null
  if (options.auto && options.target) {
    const root = options.root ?? null
    const rootMargin = options.rootMargin ?? '0px'
    const threshold = options.threshold ?? 0

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          loadMore().catch(() => {})
        }
      }
    }, { root, rootMargin, threshold })

    const stopWatch = () => {
      const el = options.target!.value
      if (el) observer!.observe(el)
    }

    // 初次尝试
    stopWatch()

    // 当目标变化时重新观察
    const stop = watch(options.target, () => {
      observer!.disconnect()
      stopWatch()
    })

    onUnmounted(() => {
      observer?.disconnect()
      stop()
    })
  }

  return { items: items as Ref<T[]>, total, page, pageSize, loading, error, loadMore, reset, hasMore }
}

export function useBatchApiCall<T = unknown>(
  calls: Array<{ methodName: string, params?: unknown, options?: ApiCallOptions }>,
  options: Omit<UseApiCallOptions, 'onSuccess' | 'onError'> & {
    onSuccess?: (results: T[]) => void
    onError?: (errors: (Error | null)[]) => void
  } = {},
): {
    data: Ref<T[]>
    loading: Ref<boolean>
    errors: Ref<(Error | null)[]>
    execute: () => Promise<T[]>
    reset: () => void
    isFinished: ComputedRef<boolean>
    isSuccess: ComputedRef<boolean>
    hasErrors: ComputedRef<boolean>
  } {
  const apiEngine = useApi()

  const data = ref<T[]>([])
  const loading = ref(false)
  const errors = ref<(Error | null)[]>([])

  const isFinished = computed(() => !loading.value)
  const isSuccess = computed(
    () => !loading.value && errors.value.every(err => err === null),
  )
  const hasErrors = computed(() => errors.value.some(err => err !== null))

  const execute = async (): Promise<T[]> => {
    loading.value = true
    errors.value = []
    data.value = []

    try {
      const results = await Promise.allSettled(
        calls.map(({ methodName, params, options: callOptions }) =>
          apiEngine.call<T>(methodName, params, { ...options, ...callOptions }),
        ),
      )

      const successResults: T[] = []
      const errorResults: (Error | null)[] = []

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          successResults.push(result.value)
          errorResults.push(null)
        }
        else {
          successResults.push(null as unknown as T)
          errorResults.push(
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason)),
          )
        }
      })

      data.value = successResults
      errors.value = errorResults

      if (options.onSuccess) {
        options.onSuccess(successResults)
      }

      return successResults
    }
    catch (err) {
      const apiError = err instanceof Error ? err : new Error(String(err))

      if (options.onError) {
        options.onError([apiError])
      }

      throw apiError
    }
    finally {
      loading.value = false

      if (options.onFinally) {
        options.onFinally()
      }
    }
  }

  const reset = () => {
    data.value = []
    loading.value = false
    errors.value = []
  }

  // 立即执行
  if (options.immediate) {
    execute()
  }

  return {
    data: data as unknown as Ref<T[]>,
    loading,
    errors,
    execute,
    reset,
    isFinished,
    isSuccess,
    hasErrors,
  }
}

/**
 * 系统 API 钩子
 *
 * @returns 系统 API 方法对象
 *
 * @example
 * ```typescript
 * import { useSystemApi } from '@ldesign/api/vue'
 *
 * const systemApi = useSystemApi()
 *
 * const { data: userInfo, loading, execute: fetchUserInfo } = systemApi.getUserInfo({
 *   immediate: true,
 * })
 *
 * const { execute: login } = systemApi.login({
 *   onSuccess: (result) => console.log('登录成功:', result),
 * })
 * ```
 */
export function useSystemApi() {
  return {
    /**
     * 获取验证码
     */
    getCaptcha: (options: UseApiCallOptions = {}) =>
      useApiCall<import('../types').CaptchaInfo>(
        SYSTEM_API_METHODS.GET_CAPTCHA,
      options,
      ),

    /**
     * 用户登录
     */
    login: (options: UseApiCallOptions = {}) =>
      useApiCall<LoginResult>(SYSTEM_API_METHODS.LOGIN, options),

    /**
     * 用户登出
     */
    logout: (options: UseApiCallOptions = {}) =>
      useApiCall<void>(SYSTEM_API_METHODS.LOGOUT, options),

    /**
     * 获取用户信息
     */
    getUserInfo: (options: UseApiCallOptions = {}) =>
      useApiCall<UserInfo>(SYSTEM_API_METHODS.GET_USER_INFO, options),

    /**
     * 更新用户信息
     */
    updateUserInfo: (options: UseApiCallOptions = {}) =>
      useApiCall<UserInfo>(SYSTEM_API_METHODS.UPDATE_USER_INFO, options),

    /**
     * 获取系统菜单
     */
    getMenus: (options: UseApiCallOptions = {}) =>
      useApiCall<MenuItem[]>(SYSTEM_API_METHODS.GET_MENUS, options),

    /**
     * 获取用户权限
     */
    getPermissions: (options: UseApiCallOptions = {}) =>
      useApiCall<string[]>(SYSTEM_API_METHODS.GET_PERMISSIONS, options),

    /**
     * 刷新令牌
     */
    refreshToken: (options: UseApiCallOptions = {}) =>
      useApiCall<LoginResult>(SYSTEM_API_METHODS.REFRESH_TOKEN, options),

    /**
     * 修改密码
     */
    changePassword: (options: UseApiCallOptions = {}) =>
      useApiCall<void>(SYSTEM_API_METHODS.CHANGE_PASSWORD, options),

    /**
     * 获取系统配置
     */
    getSystemConfig: (options: UseApiCallOptions = {}) =>
      useApiCall<unknown>(SYSTEM_API_METHODS.GET_SYSTEM_CONFIG, options),
  }
}

/**
 * 分页列表钩子：usePaginatedApi
 * - 管理 page/pageSize/total/items 等状态
 * - 内置翻页与修改 pageSize 操作
 * - 通过 extract 适配不同返回结构
 */
export function usePaginatedApi<T = unknown>(
  methodName: string,
  options: UseApiCallOptions & {
    /** 初始页码（从 1 开始） */
    page?: number
    /** 每页条数 */
    pageSize?: number
    /** 提取器，将接口返回值提取为 { items, total } */
    extract?: (result: any) => { items: T[]; total: number }
    /** 额外的查询参数（除 page/pageSize 外） */
    query?: Record<string, unknown>
  } = {},
) {
  const page = ref(options.page ?? 1)
  const pageSize = ref(options.pageSize ?? 10)
  const total = ref(0)
  const items = ref<T[]>([])

  const extract = options.extract ?? ((res: any) => {
    if (res && typeof res === 'object') {
      if (Array.isArray(res.items) && typeof res.total === 'number') return { items: res.items as T[], total: res.total as number }
      if (Array.isArray(res.list) && typeof res.total === 'number') return { items: res.list as T[], total: res.total as number }
      if (Array.isArray(res.data) && typeof res.total === 'number') return { items: res.data as T[], total: res.total as number }
    }
    return { items: Array.isArray(res) ? res as T[] : [], total: 0 }
  })

  const { loading, error, execute } = useApiCall<{ items: T[]; total: number }>(methodName, {
    ...options,
    immediate: false,
    onSuccess: (res) => {
      const { items: its, total: tot } = extract(res)
      items.value = its
      total.value = tot
      options.onSuccess?.(res)
    },
    onError: (e) => options.onError?.(e),
    onFinally: () => options.onFinally?.(),
  })

  const run = async () => {
    const params = { page: page.value, pageSize: pageSize.value, ...(options.query || {}) }
    // 忽略返回值，onSuccess 中处理
    await execute(params, options)
  }

  const setPage = (p: number) => {
    page.value = Math.max(1, p)
    run().catch(() => {})
  }
  const setPageSize = (s: number) => {
    pageSize.value = Math.max(1, s)
    page.value = 1
    run().catch(() => {})
  }
  const nextPage = () => setPage(page.value + 1)
  const prevPage = () => setPage(Math.max(1, page.value - 1))

  if (options.immediate) run().catch(() => {})

  return {
    page,
    pageSize,
    total,
    items: items as unknown as Ref<T[]>,
    loading,
    error,
    run,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    isFinished: computed(() => !loading.value),
    hasMore: computed(() => items.value.length < total.value),
  }
}

/**
 * 清理钩子，在组件卸载时自动清理资源
 */
export function useApiCleanup(): void {
  // 这里可以按需获取引擎进行清理：const api = useApi()
  onUnmounted(() => {
    // 可以在这里添加清理逻辑
    // 例如：取消正在进行的请求、清理缓存等
  })
}
