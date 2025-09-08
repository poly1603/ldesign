# REST 插件与分页组合式

## REST 快速构建插件

```ts
import { createApiEngine, createRestApiPlugin } from '@ldesign/api'

const api = createApiEngine({
  cache: { enabled: true },
})

// 生成 user 的 CRUD 方法：user.list/get/create/update/remove
await api.use(createRestApiPlugin({
  resource: 'user',
  basePath: '/users',
  idParam: 'id',
  enableListCache: true,
  listCacheTtl: 300_000,
}))

// 列表（支持缓存）
const users = await api.call('user.list', { page: 1, pageSize: 20 })
// 详情（支持缓存）
const u = await api.call('user.get', { id: 1 })
// 新建（会自动清理 user.list 与 user.get 缓存）
await api.call('user.create', { name: 'Tom' })
// 更新（会自动清理 user.list 与 user.get 缓存）
await api.call('user.update', { id: 1, name: 'Tom+' })
// 删除（会自动清理 user.list 与 user.get 缓存）
await api.call('user.remove', { id: 1 })
```

## usePaginatedApi（分页列表）

### 参数映射、响应转换与校验（进阶）

```ts
await api.use(createRestApiPlugin({
  resource: 'order',
  basePath: '/orders',
  map: {
    listParams: (p) => ({ ...p, pageNo: p?.page, pageSize: p?.pageSize }),
  },
transform: {
    list: (resp) => ({ items: resp.data.records, total: resp.data.total }),
  },
  validate: {
    list: (data) => Array.isArray(data.items) && typeof data.total === 'number',
  }
}))

// 字段重命名（可用工具函数）
// const normalized = renameKeysDeep(resp, { user_name: 'username' })

// 最终调用依然统一
const { items, total } = await api.call('order.list', { page: 1, pageSize: 20 })
```

```ts
import { usePaginatedApi } from '@ldesign/api/vue'

const {
  items, total, page, pageSize, loading, error,
  run, setPage, setPageSize, nextPage, prevPage, hasMore,
} = usePaginatedApi('user.list', {
  page: 1,
  pageSize: 10,
  immediate: true,
  // 若返回结构为 { items, total } 或 { list, total } 会自动识别；
  // 也可自定义提取器：
  // extract: (res) => ({ items: res.records, total: res.total })
})
```

