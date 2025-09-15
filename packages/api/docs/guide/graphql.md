# GraphQL 插件

@ldesign/api 提供 GraphQL 插件，可将多个 query/mutation 注册为方法名统一调用。

## 快速开始

```ts
import { createApiEngine, createGraphqlApiPlugin, gql } from '@ldesign/api'

const api = createApiEngine({ http: { baseURL: '/' } })
await api.use(createGraphqlApiPlugin({
  endpoint: '/graphql',
  headers: {
    Authorization: () => {
      const tk = localStorage.getItem('access_token')
      return tk ? `Bearer ${tk}` : ''
    }
  },
  operations: {
    'user.profile': { query: gql`query($id: ID!){ user(id:$id){ id username email } }` },
    'user.update':  { query: gql`mutation($input: UserInput!){ updateUser(input:$input){ id username } }` },
  }
}))

const me = await api.call('user.profile', { id: '1' })
```

## options.operations[*]
- query: GraphQL 文本（支持 gql 模板函数）
- type: 'query' | 'mutation'（可选，默认无需指定）
- transform: (response) => any（可选）
- validate: (data) => boolean（可选）
- cache: 方法级缓存配置（可选）

