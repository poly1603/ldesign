# 基础用法示例

本示例展示了 @ldesign/http 的基础用法。

## 创建客户端

```typescript
import { createHttpClient } from '@ldesign/http'

// 创建客户端实例
const client = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## GET 请求

```typescript
// 定义类型
interface User {
  id: number
  name: string
  email: string
  phone: string
}

// 获取用户列表
async function getUsers() {
  try {
    const response = await client.get<User[]>('/users')
    console.log('用户列表:', response.data)
    return response.data
  } catch (error) {
    console.error('获取失败:', error)
    throw error
  }
}

// 获取单个用户
async function getUser(id: number) {
  try {
    const response = await client.get<User>(`/users/${id}`)
    console.log('用户详情:', response.data)
    return response.data
  } catch (error) {
    console.error('获取失败:', error)
    throw error
  }
}

// 带查询参数
async function getUsersWithParams() {
  try {
    const response = await client.get<User[]>('/users', {
      params: {
        _page: 1,
        _limit: 10
      }
    })
    return response.data
  } catch (error) {
    console.error('获取失败:', error)
    throw error
  }
}
```

## POST 请求

```typescript
interface CreateUserRequest {
  name: string
  email: string
  phone: string
}

async function createUser(userData: CreateUserRequest) {
  try {
    const response = await client.post<User>('/users', userData)
    console.log('创建成功:', response.data)
    return response.data
  } catch (error) {
    console.error('创建失败:', error)
    throw error
  }
}

// 使用示例
createUser({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7890'
})
```

## PUT 请求

```typescript
async function updateUser(id: number, userData: Partial<User>) {
  try {
    const response = await client.put<User>(`/users/${id}`, userData)
    console.log('更新成功:', response.data)
    return response.data
  } catch (error) {
    console.error('更新失败:', error)
    throw error
  }
}

// 使用示例
updateUser(1, {
  name: 'Jane Doe',
  email: 'jane@example.com'
})
```

## PATCH 请求

```typescript
async function patchUser(id: number, userData: Partial<User>) {
  try {
    const response = await client.patch<User>(`/users/${id}`, userData)
    console.log('部分更新成功:', response.data)
    return response.data
  } catch (error) {
    console.error('更新失败:', error)
    throw error
  }
}

// 使用示例
patchUser(1, {
  name: 'Jane Smith'
})
```

## DELETE 请求

```typescript
async function deleteUser(id: number) {
  try {
    await client.delete(`/users/${id}`)
    console.log('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    throw error
  }
}

// 使用示例
deleteUser(1)
```

## 错误处理

```typescript
import { isHttpError } from '@ldesign/http'

async function fetchDataWithErrorHandling() {
  try {
    const response = await client.get('/users/999')
    return response.data
  } catch (error) {
    if (isHttpError(error)) {
      // HTTP 错误
      console.error('HTTP 错误:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data
      })

      // 根据状态码处理
      switch (error.response?.status) {
        case 404:
          console.log('资源不存在')
          break
        case 500:
          console.log('服务器错误')
          break
        default:
          console.log('请求失败')
      }
    } else {
      // 网络错误或其他错误
      console.error('网络错误:', error)
    }
    throw error
  }
}
```

## 并发请求

```typescript
async function fetchMultipleResources() {
  try {
    // 并发请求多个资源
    const [users, posts, comments] = await Promise.all([
      client.get('/users'),
      client.get('/posts'),
      client.get('/comments')
    ])

    console.log('用户:', users.data.length)
    console.log('文章:', posts.data.length)
    console.log('评论:', comments.data.length)

    return {
      users: users.data,
      posts: posts.data,
      comments: comments.data
    }
  } catch (error) {
    console.error('获取失败:', error)
    throw error
  }
}
```

## 请求取消

```typescript
async function fetchWithCancellation() {
  // 创建 AbortController
  const controller = new AbortController()

  // 5秒后自动取消
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 5000)

  try {
    const response = await client.get('/users', {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response.data
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.log('请求已取消')
    } else {
      console.error('请求失败:', error)
    }
    throw error
  }
}

// 手动取消示例
const controller = new AbortController()

// 开始请求
const promise = client.get('/users', {
  signal: controller.signal
})

// 在某个时刻取消请求
controller.abort()
```

## 完整示例

```typescript
import { createHttpClient, isHttpError } from '@ldesign/http'

// 类型定义
interface User {
  id: number
  name: string
  email: string
  phone: string
}

interface CreateUserRequest {
  name: string
  email: string
  phone: string
}

// 创建客户端
const client = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 用户管理类
class UserService {
  // 获取所有用户
  async getAll(): Promise<User[]> {
    try {
      const response = await client.get<User[]>('/users')
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // 获取单个用户
  async getById(id: number): Promise<User> {
    try {
      const response = await client.get<User>(`/users/${id}`)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // 创建用户
  async create(data: CreateUserRequest): Promise<User> {
    try {
      const response = await client.post<User>('/users', data)
      console.log('用户创建成功:', response.data)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // 更新用户
  async update(id: number, data: Partial<User>): Promise<User> {
    try {
      const response = await client.put<User>(`/users/${id}`, data)
      console.log('用户更新成功:', response.data)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // 删除用户
  async delete(id: number): Promise<void> {
    try {
      await client.delete(`/users/${id}`)
      console.log('用户删除成功')
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  // 错误处理
  private handleError(error: unknown): void {
    if (isHttpError(error)) {
      console.error('HTTP 错误:', {
        status: error.response?.status,
        message: error.message
      })
    } else {
      console.error('未知错误:', error)
    }
  }
}

// 使用示例
async function main() {
  const userService = new UserService()

  try {
    // 获取所有用户
    const users = await userService.getAll()
    console.log('所有用户:', users)

    // 获取特定用户
    const user = await userService.getById(1)
    console.log('用户详情:', user)

    // 创建新用户
    const newUser = await userService.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890'
    })

    // 更新用户
    const updatedUser = await userService.update(newUser.id, {
      name: 'Jane Doe'
    })

    // 删除用户
    await userService.delete(newUser.id)
  } catch (error) {
    console.error('操作失败:', error)
  }
}

main()
```

## 相关示例

- [认证](/examples/authentication) - 添加认证
- [文件上传](/examples/file-upload) - 上传文件
- [Vue 应用](/examples/vue-app) - Vue 3 集成
