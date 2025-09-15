# React Query 集成

通过 @ldesign/api 提供的 buildQueryFn/buildInfiniteQueryFn/buildMutationFn，无需耦合即可集成 @tanstack/react-query。

```tsx
import { ApiProvider } from '@ldesign/api/react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { buildQueryFn } from '@ldesign/api/react'

const qc = new QueryClient()

function Profile() {
  const api = useApi() // 来自 ApiProvider
  const { data, isLoading, error } = useQuery({
    queryKey: ['getUserInfo', { id: 1 }],
    queryFn: buildQueryFn(api, 'getUserInfo'),
  })
  // ...
}

export default function App() {
  return (
    <ApiProvider config={{ http: { baseURL: '/api' } }}>
      <QueryClientProvider client={qc}>
        <Profile />
      </QueryClientProvider>
    </ApiProvider>
  )
}
```
