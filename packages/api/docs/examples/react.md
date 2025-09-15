# React 示例

```tsx
import React from 'react'
import { ApiProvider } from '@ldesign/api/react'
import { useApiCall } from '@ldesign/api/react'

function User() {
  const { data, loading, error } = useApiCall('getUserInfo', { immediate: true })
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>{data?.username}</div>
}

export default function App() {
  return (
    <ApiProvider config={{ http: { baseURL: '/api' } }}>
      <User />
    </ApiProvider>
  )
}
```

