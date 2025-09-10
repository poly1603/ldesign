# UrlUtils - URL处理工具

UrlUtils 是一个专门处理URL的工具类，提供URL构建、解析、验证和操作功能。

## 功能特性

- 🔗 **URL构建**: 智能构建URL和查询参数
- 📝 **查询解析**: 解析和序列化查询字符串
- 🔧 **URL操作**: 规范化、连接、域名提取等
- ✅ **URL验证**: 检查URL格式和类型
- 🌐 **域名处理**: 提取域名、子域名，比较域名
- 🛡️ **安全处理**: 安全的URL处理，防止注入攻击

## 安装使用

```typescript
import { UrlUtils } from '@ldesign/kit'

// 或者单独导入
import { UrlUtils } from '@ldesign/kit/utils'
```

## 基础用法

### URL构建

```typescript
// 基础URL构建
const url1 = UrlUtils.buildUrl('https://api.example.com/users')
console.log(url1) // 'https://api.example.com/users'

// 带查询参数的URL构建
const url2 = UrlUtils.buildUrl('https://api.example.com/users', {
  page: 1,
  limit: 10,
  sort: 'name'
})
console.log(url2) // 'https://api.example.com/users?page=1&limit=10&sort=name'

// 数组参数处理
const url3 = UrlUtils.buildUrl('https://api.example.com/search', {
  tags: ['javascript', 'typescript'],
  category: 'programming'
})
console.log(url3) // 'https://api.example.com/search?tags=javascript&tags=typescript&category=programming'
```

### 查询字符串处理

```typescript
// 解析查询字符串
const params1 = UrlUtils.parseQuery('?name=john&age=25&active=true')
console.log(params1) // { name: 'john', age: '25', active: 'true' }

// 处理数组参数
const params2 = UrlUtils.parseQuery('?tags=js&tags=ts&tags=react')
console.log(params2) // { tags: ['js', 'ts', 'react'] }

// 序列化查询参数
const queryString = UrlUtils.stringifyQuery({
  name: 'john',
  age: 25,
  tags: ['js', 'ts'],
  active: true
})
console.log(queryString) // 'name=john&age=25&tags=js&tags=ts&active=true'
```

### URL操作

```typescript
// URL规范化
const normalized = UrlUtils.normalize('https://example.com//path/../api/')
console.log(normalized) // 'https://example.com/api/'

// URL连接
const joined = UrlUtils.join('https://api.example.com', 'v1', 'users', '123')
console.log(joined) // 'https://api.example.com/v1/users/123'

// 检查绝对路径
const isAbs1 = UrlUtils.isAbsolute('https://example.com')
console.log(isAbs1) // true

const isAbs2 = UrlUtils.isAbsolute('/api/users')
console.log(isAbs2) // false
```

### 域名处理

```typescript
// 提取域名
const domain = UrlUtils.getDomain('https://api.example.com/v1/users')
console.log(domain) // 'example.com'

// 提取子域名
const subdomain = UrlUtils.getSubdomain('https://api.example.com')
console.log(subdomain) // 'api'

// 比较域名
const isSame = UrlUtils.isSameDomain(
  'https://api.example.com',
  'https://www.example.com'
)
console.log(isSame) // true
```

## 高级用法

### API客户端URL构建

```typescript
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // 构建API端点URL
  buildEndpoint(path: string, params?: Record<string, any>): string {
    const fullPath = UrlUtils.join(this.baseUrl, 'api', 'v1', path)
    return UrlUtils.buildUrl(fullPath, params)
  }

  // 用户相关API
  getUsersUrl(filters?: { page?: number; limit?: number; search?: string }) {
    return this.buildEndpoint('users', filters)
  }

  getUserUrl(id: string) {
    return this.buildEndpoint(`users/${id}`)
  }
}

const client = new ApiClient('https://api.example.com')
console.log(client.getUsersUrl({ page: 1, limit: 20, search: 'john' }))
// 'https://api.example.com/api/v1/users?page=1&limit=20&search=john'
```

### 路由参数处理

```typescript
// 解析路由参数
function parseRouteParams(url: string, template: string): Record<string, string> {
  const urlParts = url.split('/')
  const templateParts = template.split('/')
  const params: Record<string, string> = {}

  templateParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1)
      params[paramName] = urlParts[index]
    }
  })

  return params
}

// 构建路由URL
function buildRoute(template: string, params: Record<string, string>): string {
  let route = template
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value)
  })
  return route
}

const userRoute = buildRoute('/users/:id/posts/:postId', {
  id: '123',
  postId: '456'
})
console.log(userRoute) // '/users/123/posts/456'
```

### URL安全处理

```typescript
// 安全的URL构建，防止注入
function buildSecureUrl(baseUrl: string, params: Record<string, any>): string {
  // 验证基础URL
  if (!UrlUtils.isAbsolute(baseUrl)) {
    throw new Error('Base URL must be absolute')
  }

  // 过滤和清理参数
  const cleanParams: Record<string, any> = {}
  Object.entries(params).forEach(([key, value]) => {
    // 只允许安全的参数值
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleanParams[key] = value
    } else if (Array.isArray(value)) {
      cleanParams[key] = value.filter(v => 
        typeof v === 'string' || typeof v === 'number'
      )
    }
  })

  return UrlUtils.buildUrl(baseUrl, cleanParams)
}
```

### 分页URL管理

```typescript
class PaginationUrlManager {
  constructor(
    private baseUrl: string,
    private currentPage: number = 1,
    private pageSize: number = 10
  ) {}

  // 获取当前页URL
  getCurrentPageUrl(additionalParams?: Record<string, any>): string {
    return UrlUtils.buildUrl(this.baseUrl, {
      page: this.currentPage,
      limit: this.pageSize,
      ...additionalParams
    })
  }

  // 获取下一页URL
  getNextPageUrl(additionalParams?: Record<string, any>): string {
    return UrlUtils.buildUrl(this.baseUrl, {
      page: this.currentPage + 1,
      limit: this.pageSize,
      ...additionalParams
    })
  }

  // 获取上一页URL
  getPrevPageUrl(additionalParams?: Record<string, any>): string {
    if (this.currentPage <= 1) return this.getCurrentPageUrl(additionalParams)
    
    return UrlUtils.buildUrl(this.baseUrl, {
      page: this.currentPage - 1,
      limit: this.pageSize,
      ...additionalParams
    })
  }

  // 获取指定页URL
  getPageUrl(page: number, additionalParams?: Record<string, any>): string {
    return UrlUtils.buildUrl(this.baseUrl, {
      page: Math.max(1, page),
      limit: this.pageSize,
      ...additionalParams
    })
  }
}

const pagination = new PaginationUrlManager('https://api.example.com/posts', 2, 20)
console.log(pagination.getNextPageUrl({ category: 'tech' }))
// 'https://api.example.com/posts?page=3&limit=20&category=tech'
```

## API 参考

### 方法列表

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `buildUrl` | 构建URL | `baseUrl: string, params?: Record<string, any>` | `string` |
| `parseQuery` | 解析查询字符串 | `queryString: string` | `Record<string, string \| string[]>` |
| `stringifyQuery` | 序列化查询参数 | `params: Record<string, any>` | `string` |
| `normalize` | 规范化URL | `url: string` | `string` |
| `isAbsolute` | 检查是否为绝对URL | `url: string` | `boolean` |
| `join` | 连接URL片段 | `...parts: string[]` | `string` |
| `getDomain` | 提取域名 | `url: string` | `string` |
| `getSubdomain` | 提取子域名 | `url: string` | `string \| null` |
| `isSameDomain` | 比较域名 | `url1: string, url2: string` | `boolean` |

## 最佳实践

1. **URL验证**: 始终验证用户输入的URL
2. **参数清理**: 对查询参数进行适当的清理和验证
3. **编码处理**: 正确处理URL编码和解码
4. **错误处理**: 对无效URL进行适当的错误处理
5. **性能优化**: 对频繁使用的URL进行缓存

## 注意事项

1. **安全性**: 处理用户输入的URL时要进行安全检查
2. **编码问题**: 注意URL中的特殊字符编码
3. **浏览器兼容性**: 某些URL API可能需要polyfill
4. **IPv6支持**: 正确处理IPv6地址格式

## 相关资源

- [URL标准](https://url.spec.whatwg.org/)
- [RFC 3986 - URI通用语法](https://tools.ietf.org/html/rfc3986)
- [MDN URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)
