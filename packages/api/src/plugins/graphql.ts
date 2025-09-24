/**
 * GraphQL 插件
 * - 批量注册 GraphQL 操作（query/mutation）为方法名
 */
import type { ApiMethodConfig, ApiPlugin } from '../types'

export interface GraphQLOperation {
  /** GraphQL 文本 */
  query: string
  /** query | mutation */
  type?: 'query' | 'mutation'
  /** 可选：对响应结果进行转换 */
  transform?: (response: any) => any
  /** 可选：数据校验 */
  validate?: (data: any) => boolean
  /** 方法级缓存配置 */
  cache?: ApiMethodConfig['cache']
}

export interface GraphQLPluginOptions {
  /** GraphQL 端点地址 */
  endpoint: string
  /** 统一 headers，支持函数值延迟求值 */
  headers?: Record<string, string | (() => string) | ((vars?: unknown) => string)>
  /** 批量操作定义：方法名 -> 操作 */
  operations: Record<string, GraphQLOperation>
  /** 变量映射器（可选） */
  mapVariables?: (variables?: Record<string, unknown>) => Record<string, unknown> | undefined
}

/** 模板字符串语法糖 */
export function gql(chunks: TemplateStringsArray, ...exprs: any[]): string {
  let out = ''
  chunks.forEach((c, i) => { out += c + (i < exprs.length ? String(exprs[i]) : '') })
  return out
}

export function createGraphqlApiPlugin(options: GraphQLPluginOptions): ApiPlugin {
  const { endpoint, headers = {}, operations, mapVariables } = options

  const makeHeaders = (vars?: unknown) => {
    const h: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(headers)) {
      try {
        h[k] = typeof v === 'function' ? (v as any)(vars) : v
      }
      catch {
        // ignore
      }
    }
    return h
  }

  const apis: Record<string, ApiMethodConfig> = {}
  for (const [name, op] of Object.entries(operations)) {
    apis[name] = {
      name,
      config: (variables?: Record<string, unknown>) => ({
        method: 'POST',
        url: endpoint,
        headers: { 'Content-Type': 'application/json', ...makeHeaders(variables) },
        data: {
          query: op.query,
          variables: mapVariables ? mapVariables(variables) : variables,
        },
      }),
      transform: (resp) => {
        const out = op.transform ? op.transform(resp) : (resp?.data?.data ?? resp?.data)
        return out
      },
      validate: op.validate,
      cache: op.cache,
    }
  }

  return {
    name: 'graphql-apis',
    version: '1.0.0',
    apis,
  }
}
