import type { HttpClientConfig } from './types'
import { createAdapter } from './adapters'
import { HttpClientImpl } from './client'

/**
 * 创建 HTTP 客户端实例
 * 这个函数被单独提取出来，避免循环依赖问题
 */
export function createHttpClient(
  config: HttpClientConfig = {},
): HttpClientImpl {
  const adapter = createAdapter(config.adapter)
  return new HttpClientImpl(config, adapter)
}
