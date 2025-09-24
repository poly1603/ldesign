/**
 * 可选强类型注册表辅助
 */
import type { ApiCallOptions, ApiEngine } from '.'

export interface TypedApiEngine<Registry extends Record<string, any>> extends ApiEngine {
  /** 通过方法名得到强类型返回值 */
  call: <K extends keyof Registry & string>(methodName: K, params?: any, options?: ApiCallOptions) => Promise<Registry[K]>
  /** 批量调用（返回值按传入顺序） */
  callBatch: <K extends keyof Registry & string>(calls: Array<{ methodName: K, params?: any, options?: ApiCallOptions }>) => Promise<Registry[K][]>
}

/**
 * 将现有引擎“标注”为带注册表的强类型引擎（仅类型层，运行时零成本）
 */
export function withTypedApi<Registry extends Record<string, any>>(engine: ApiEngine): TypedApiEngine<Registry> {
  return engine as unknown as TypedApiEngine<Registry>
}
