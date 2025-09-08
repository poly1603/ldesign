/**
 * 重试与中间件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import type { ApiEngine } from '../src/types'

describe('重试与中间件', () => {
  let api: ApiEngine

  beforeEach(() => {
    api = createApiEngine({
      debug: false,
      retry: { enabled: true, retries: 2, delay: 5, backoff: 'fixed' },
      middlewares: {
        request: [
          (cfg) => {
            cfg.headers = { ...(cfg.headers || {}), 'X-Test': '1' }
            return cfg
          },
        ],
      },
      http: { baseURL: 'https://api.test', timeout: 1000 },
      cache: { enabled: false },
      debounce: { enabled: false },
      deduplication: { enabled: false },
    })
  })

  it('应当在失败后进行重试并最终成功', async () => {
    api.register('retryMethod', {
      name: 'retryMethod',
      config: { method: 'GET', url: '/x' },
    })

    let count = 0
    const spy = vi
      .spyOn(api.httpClient, 'request')
      .mockImplementation(async (config: any) => {
        count++
        if (count < 3) {
          throw new Error('fail')
        }
        expect(config.headers?.['X-Test']).toBe('1')
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      })

    const data = await api.call('retryMethod')
    expect(data).toEqual({ ok: true })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('错误中间件可恢复错误并返回合成响应', async () => {
    const engine = createApiEngine({
      debug: false,
      middlewares: {
        error: [
          (err) => {
            if (err && (err as Error).message === 'fail') {
              return {
                data: { recovered: true },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: { method: 'GET', url: '/recover' },
              }
            }
          },
        ],
      },
      cache: { enabled: false },
      debounce: { enabled: false },
      deduplication: { enabled: false },
    })

    engine.register('recoverMethod', {
      name: 'recoverMethod',
      config: { method: 'GET', url: '/recover' },
    })

    vi.spyOn(engine.httpClient, 'request').mockRejectedValue(new Error('fail'))

    const res = await engine.call<{ recovered: boolean }>('recoverMethod')
    expect(res).toEqual({ recovered: true })
  })

  it('响应中间件在transform前生效', async () => {
    const engine = createApiEngine({
      debug: false,
      middlewares: {
        response: [
          (response) => {
            response.data = { wrapped: response.data }
            return response
          },
        ],
      },
      cache: { enabled: false },
      debounce: { enabled: false },
      deduplication: { enabled: false },
    })

    engine.register('transformReadsResponseChange', {
      name: 'transformReadsResponseChange',
      config: { method: 'GET', url: '/wrap' },
      transform: (resp) => resp.data.wrapped,
    })

    vi.spyOn(engine.httpClient, 'request').mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { method: 'GET', url: '/wrap' },
    })

    const out = await engine.call('transformReadsResponseChange')
    expect(out).toEqual({ ok: true })
  })
})

