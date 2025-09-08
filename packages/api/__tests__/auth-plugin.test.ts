/**
 * 认证插件集成测试：401 -> refresh -> 重放成功
 */
import { describe, it, expect, vi } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import { authMiddlewaresPlugin } from '../src/plugins/auth'
import { systemApiPlugin } from '../src/plugins/systemApi'

// 简单的 localStorage 环境已由 vitest jsdom 提供

describe('Auth Middlewares Plugin', () => {
  it('401 后刷新令牌并重放原请求成功', async () => {
    const api = createApiEngine({
      debug: false,
      cache: { enabled: false },
      debounce: { enabled: false },
      deduplication: { enabled: false },
    })

    await api.use(authMiddlewaresPlugin)
    await api.use(systemApiPlugin)

    // 注册一个需要鉴权的自定义方法
    api.register('secureData', {
      name: 'secureData',
      config: { method: 'GET', url: '/secure' },
    })

    // 第一次对 /secure 抛 401；随后 refresh 成功；第二次 /secure 成功
    let callCount = 0
    let refreshCalled = false
    const requestSpy = vi.spyOn(api.httpClient, 'request').mockImplementation(async (config: any) => {
      // 刷新接口
      if (config.url === '/auth/refresh') {
        refreshCalled = true
        return {
          data: { accessToken: 'new_access', refreshToken: 'new_refresh' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }

      // 受保护接口
      if (config.url === '/secure') {
        callCount++
        if (callCount === 1) {
          const e: any = new Error('unauthorized')
          e.status = 401
          throw e
        }
        // 第二次应当成功（验证已重放），token 已刷新
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }

      return {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    })

    const out = await api.call('secureData')
    expect(out).toEqual({ ok: true })
    expect(requestSpy).toHaveBeenCalled()
    // 验证已重试且触发了刷新
    expect(callCount).toBe(2)
    expect(refreshCalled).toBe(true)
  })
})
