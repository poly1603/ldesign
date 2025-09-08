/**
 * REST transform 映射测试
 */
import { describe, it, expect, vi } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import { createRestApiPlugin } from '../src/plugins/rest'

describe('REST transform', () => {
  it('list transform 将 rows/count 转换为 items/total', async () => {
    const api = createApiEngine({ cache: { enabled: false }, debounce: { enabled: false }, deduplication: { enabled: false } })

    await api.use(createRestApiPlugin({
      resource: 'prod',
      basePath: '/products',
      transform: {
        list: (resp) => ({ items: resp.data.rows, total: resp.data.count })
      }
    }))

    vi.spyOn(api.httpClient, 'request').mockResolvedValue({
      data: { rows: [{ id: 1 }], count: 1 }, status: 200, statusText: 'OK', headers: {}, config: {}
    })

    const out = await api.call('prod.list')
    expect(out).toEqual({ items: [{ id: 1 }], total: 1 })
  })
})

