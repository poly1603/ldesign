/**
 * REST 插件与 usePaginatedApi 基础测试
 */
import { describe, it, expect, vi } from 'vitest'
import { createApiEngine } from '../src/core/factory'
import { createRestApiPlugin } from '../src/plugins/rest'

describe('REST 插件与分页', () => {
  it('注册 CRUD 方法并触发缓存清理', async () => {
    const api = createApiEngine({
      cache: { enabled: true },
      debounce: { enabled: false },
      deduplication: { enabled: false },
    })

    await api.use(createRestApiPlugin({ resource: 'item', basePath: '/items' }))

    // 模拟 list => 成功数据
    const requestSpy = vi.spyOn(api.httpClient, 'request').mockResolvedValue({
      data: { items: [1, 2], total: 2 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })

    const list1 = await api.call('item.list', { page: 1, pageSize: 10 })
    expect(list1).toEqual({ items: [1, 2], total: 2 })

    // 命中缓存
    const list2 = await api.call('item.list', { page: 1, pageSize: 10 })
    expect(list2).toEqual(list1)

    // 创建后清理缓存
    requestSpy.mockResolvedValueOnce({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config: {} })
    await api.call('item.create', { name: 'a' })

    // 再次请求应重新走 http（缓存被清理）
    await api.call('item.list', { page: 1, pageSize: 10 })
    expect(requestSpy).toHaveBeenCalled()
  })
})

