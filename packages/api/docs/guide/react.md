# React 集成

@ldesign/api 提供了与 Vue 版本一致的 React Hook 套件。

## 安装与引入

```bash
pnpm add @ldesign/api react
```

## 顶层 Provider

```tsx
import { ApiProvider } from '@ldesign/api/react'

export default function App() {
  return (
    <ApiProvider config={{ http: { baseURL: '/api' } }}>
      <YourRoutes />
    </ApiProvider>
  )
}
```

## 基础 Hook：useApiCall

```tsx
import { useApiCall } from '@ldesign/api/react'

export function Profile() {
  const { data, loading, error, execute } = useApiCall('getUserInfo', { immediate: true })
  if (loading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

## 批量/轮询/分页/无限滚动/变更

- useBatchApiCall([ { methodName, params } ])
- useApiPolling(methodName, { interval, autoStart })
- usePaginatedApi(methodName, { page, pageSize, immediate })
- useInfiniteApi(methodName, { page, pageSize, auto, root, rootMargin })
- useMutation(methodName, { optimistic, lockWhilePending })

