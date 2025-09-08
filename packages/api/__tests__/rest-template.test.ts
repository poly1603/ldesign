/**
 * REST 插件路径模板测试
 */
import { describe, it, expect, vi } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import { createRestApiPlugin } from '../src/plugins/rest'

describe('REST 路径模板', () => {
  it('支持 basePath 含 :id 或 {id}', async () => {
    const api = createApiEngine({ debounce: { enabled: false }, deduplication: { enabled: false } })

    await api.use(createRestApiPlugin({ resource: 'item', basePath: '/items/:id' }))

    const spy = vi.spyOn(api.httpClient, 'request').mockResolvedValue({
      data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config: {}
    })

    await api.call('item.get', { id: 42 })
    expect(spy).toHaveBeenCalled()
    const callCfg = spy.mock.calls[0][0]
    expect(callCfg.url).toBe('/items/42')

    spy.mockResolvedValueOnce({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config: {} })
    await api.call('item.update', { id: 7, name: 'x' })
    const callCfg2 = spy.mock.calls[1][0]
    expect(callCfg2.url).toBe('/items/7')
  })
})

