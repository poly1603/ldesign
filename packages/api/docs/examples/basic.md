# 基础示例

```ts
import { createApiEngine, systemApiPlugin } from '@ldesign/api'

const api = createApiEngine({ http: { baseURL: '/api' } })
await api.use(systemApiPlugin)

const user = await api.call('getUserInfo')
console.log(user)
```

