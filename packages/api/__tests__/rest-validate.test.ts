/**
 * REST validate 测试
 */
import { describe, it, expect, vi } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import { createRestApiPlugin } from '../src/plugins/rest'

describe('REST validate', () => {
  it('list validate 不通过时抛错', async () => {
    const api = createApiEngine({ cache: { enabled: false }, debounce: { enabled: false }, deduplication: { enabled: false } })

    await api.use(createRestApiPlugin({
      resource: 'u',
      basePath: '/u',
      transform: { list: (resp) => resp.data },
      validate: { list: (data) => Array.isArray(data) }
    }))

    vi.spyOn(api.httpClient, 'request').mockResolvedValue({
      data: { notArray: true }, status: 200, statusText: 'OK', headers: {}, config: {}
    })

    await expect(api.call('u.list')).rejects.toThrow(/Data validation failed/)
  })
})

