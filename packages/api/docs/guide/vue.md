# Vue 组合式 API 指南

## 组合式清单
- useApi：获取引擎实例
- useApiCall：单次调用状态（data/loading/error/execute/reset）
- useBatchApiCall：批量调用（并行），返回每项状态
- useApiPolling：轮询
- usePaginatedApi（新增）：分页列表

## useApiCall
```ts
import { useApiCall, useMutation } from '@ldesign/api/vue'

const { data, loading, error, execute, reset, isSuccess } = useApiCall('getUserInfo', {
  immediate: true,
  onSuccess: (d) => console.log('ok', d),
})

// 或使用指令：v-intersect（支持 once/delay/options）
// <div v-intersect="{ callback: () => loadMore(), once: true, delay: 100 }" />
// <div v-intersect="() => loadMore()" />

// useMutation 乐观示例
const { mutate } = useMutation('user.update', {
  optimistic: {
    apply: (vars) => {
      // 先本地应用 vars 改动
      return () => { /* 回滚本地改动 */ }
    },
    rollbackOnError: true,
  },
})
```

## useApiPolling
```ts
import { useApiPolling } from '@ldesign/api/vue'

const { data, loading, start, stop, isActive } = useApiPolling('getUserInfo', {
  interval: 30000,
  autoStart: true,
})
```

## useInfiniteApi（新增）
```ts
import { ref } from 'vue'
import { useInfiniteApi } from '@ldesign/api/vue'

const sentinel = ref<HTMLElement | null>(null)

const { items, loadMore, hasMore } = useInfiniteApi('user.list', {
  page: 1, pageSize: 20,
  auto: true,
  target: sentinel,
})
```

## usePaginatedApi
```ts
import { usePaginatedApi } from '@ldesign/api/vue'

const {
  items, total, page, pageSize,
  loading, error,
  run, setPage, setPageSize, nextPage, prevPage, hasMore,
} = usePaginatedApi('user.list', {
  page: 1, pageSize: 10, immediate: true,
  // extract: (res) => ({ items: res.records, total: res.total })
})
```

## useIntersectionObserver（新增）
```ts
import { ref } from 'vue'
import { useIntersectionObserver } from '@ldesign/api/vue'

const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(sentinel, () => {
  // 触发加载更多
})
```

## 最佳实践
- 在 App 初始化时安装 ApiVuePlugin 并提供引擎实例
- 配合中间件/认证插件与重试使用（见 middlewares.md）
- 统一在插件/中间件里做 headers/鉴权/错误处理，组件层只关心数据与状态

