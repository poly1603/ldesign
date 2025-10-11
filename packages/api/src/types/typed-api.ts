/**
 * TypedApiEngine - 类型安全的 API 引擎
 * 提供完整的类型推导和类型安全保证
 */

import type {
  ApiCallOptions,
  ApiEngine,
  ApiMethodConfig,
  ApiPlugin,
} from './index'

/**
 * API 方法映射类型
 * 用于定义 API 方法的类型结构
 */
export type ApiMethodMap = Record<string, ApiMethodDefinition<any, any>>

/**
 * API 方法定义
 * @template TParams - 请求参数类型
 * @template TResult - 返回结果类型
 */
export interface ApiMethodDefinition<TParams = any, TResult = any> {
  /** 方法配置 */
  config: ApiMethodConfig
  /** 参数类型（用于类型推导） */
  __params?: TParams
  /** 返回类型（用于类型推导） */
  __result?: TResult
}

/**
 * 类型安全的插件定义
 * @template TMethods - 插件提供的 API 方法映射
 */
export interface TypedApiPlugin<TMethods extends ApiMethodMap = ApiMethodMap> extends Omit<ApiPlugin, 'apis'> {
  /** API 方法定义 */
  apis?: TMethods
}

/**
 * 从方法定义中提取参数类型
 */
export type ExtractParams<T> = T extends ApiMethodDefinition<infer P, any> ? P : never

/**
 * 从方法定义中提取返回类型
 */
export type ExtractResult<T> = T extends ApiMethodDefinition<any, infer R> ? R : never

/**
 * 类型安全的 API 引擎接口
 * @template TMethods - API 方法映射类型
 */
export interface TypedApiEngine<TMethods extends ApiMethodMap = ApiMethodMap> extends Omit<ApiEngine, 'call' | 'callBatch' | 'register' | 'registerBatch' | 'use'> {
  /**
   * 类型安全的 API 调用
   * @param methodName - API 方法名
   * @param params - 请求参数（类型自动推导）
   * @param options - 调用选项
   * @returns 返回结果（类型自动推导）
   */
  call<K extends keyof TMethods>(
    methodName: K,
    params?: ExtractParams<TMethods[K]>,
    options?: ApiCallOptions
  ): Promise<ExtractResult<TMethods[K]>>

  /**
   * 类型安全的批量调用
   * @param calls - 调用列表
   * @returns 返回结果数组
   */
  callBatch<K extends keyof TMethods>(
    calls: Array<{
      methodName: K
      params?: ExtractParams<TMethods[K]>
      options?: ApiCallOptions
    }>
  ): Promise<Array<ExtractResult<TMethods[K]>>>

  /**
   * 注册类型安全的 API 方法
   * @param methodName - 方法名
   * @param definition - 方法定义
   */
  register<K extends keyof TMethods>(
    methodName: K,
    definition: TMethods[K]
  ): void

  /**
   * 批量注册类型安全的 API 方法
   * @param methods - 方法映射
   */
  registerBatch(methods: Partial<TMethods>): void

  /**
   * 注册类型安全的插件
   * @param plugin - 插件定义
   */
  use<T extends ApiMethodMap>(plugin: TypedApiPlugin<T>): Promise<void>
}

/**
 * 创建 API 方法定义的辅助函数
 * @template TParams - 参数类型
 * @template TResult - 返回类型
 * @param config - 方法配置
 * @returns 类型安全的方法定义
 */
export function defineApiMethod<TParams = void, TResult = unknown>(
  config: ApiMethodConfig,
): ApiMethodDefinition<TParams, TResult> {
  return {
    config,
  }
}

/**
 * 创建 API 方法映射的辅助函数
 * @template T - 方法映射类型
 * @param methods - 方法定义对象
 * @returns 类型安全的方法映射
 */
export function defineApiMethods<T extends ApiMethodMap>(methods: T): T {
  return methods
}

/**
 * 创建类型安全插件的辅助函数
 * @template TMethods - 方法映射类型
 * @param plugin - 插件配置
 * @returns 类型安全的插件
 */
export function definePlugin<TMethods extends ApiMethodMap>(
  plugin: TypedApiPlugin<TMethods>,
): TypedApiPlugin<TMethods> {
  return plugin
}

/**
 * 将 TypedApiEngine 转换为标准 ApiEngine（用于兼容性）
 */
export function toApiEngine<TMethods extends ApiMethodMap>(
  engine: TypedApiEngine<TMethods>,
): ApiEngine {
  return engine as unknown as ApiEngine
}

/**
 * 将标准 ApiEngine 转换为 TypedApiEngine（需要提供类型信息）
 * @template TMethods - 方法映射类型
 */
export function toTypedApiEngine<TMethods extends ApiMethodMap>(
  engine: ApiEngine,
): TypedApiEngine<TMethods> {
  return engine as unknown as TypedApiEngine<TMethods>
}

/**
 * 合并多个 API 方法映射
 * @template T1, T2, ... - 要合并的方法映射类型
 */
export type MergeApiMethods<T1 extends ApiMethodMap, T2 extends ApiMethodMap> = T1 & T2

/**
 * 从插件中提取方法映射类型
 */
export type ExtractPluginMethods<T> = T extends TypedApiPlugin<infer M> ? M : never

/**
 * 条件类型：检查参数是否为 void
 */
export type IsVoid<T> = T extends void ? true : false

/**
 * 优化的 call 方法重载（当参数为 void 时可以省略）
 */
export interface OptimizedTypedApiEngine<TMethods extends ApiMethodMap = ApiMethodMap> extends TypedApiEngine<TMethods> {
  call<K extends keyof TMethods>(
    methodName: K,
    ...args: IsVoid<ExtractParams<TMethods[K]>> extends true
      ? [params?: undefined, options?: ApiCallOptions]
      : [params: ExtractParams<TMethods[K]>, options?: ApiCallOptions]
  ): Promise<ExtractResult<TMethods[K]>>
}
