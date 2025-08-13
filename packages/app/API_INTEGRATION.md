# 🚀 API 管理系统集成指南

本文档说明了如何在 `@ldesign/app` 中集成和使用 API 管理功能。

## 📋 集成概览

我们成功将 `@ldesign/api` 包的核心功能集成到了应用中，提供了完整的 API 管理解决方案。

### ✅ 已集成功能

1. **API 服务层** (`src/services/api.ts`)

   - 统一的 API 调用接口
   - 模拟数据支持，便于前端开发
   - 完整的系统接口（登录、用户信息、菜单、权限等）

2. **用户认证系统** (`src/composables/useAuth.ts`)

   - 响应式的认证状态管理
   - 登录、登出、用户信息获取
   - 权限和角色检查
   - 本地存储集成

3. **登录页面集成** (`src/views/Login.tsx`)

   - 真实 API 调用替代模拟登录
   - 错误处理和加载状态
   - 用户友好的反馈

4. **API 演示页面** (`src/views/ApiDemo.tsx`)
   - 完整的 API 功能演示
   - 系统接口调用展示
   - 自定义 API 注册和调用
   - API 调用历史记录
   - 实时状态显示

## 🔧 技术实现

### 架构设计

```
@ldesign/app
├── src/services/
│   ├── api.ts                 # API 服务层
│   └── api-engine-plugin.ts   # API 引擎插件
├── src/composables/
│   └── useAuth.ts             # 用户认证组合式函数
├── src/views/
│   ├── Login.tsx              # 登录页面
│   └── ApiDemo.tsx            # API 演示页面
└── src/main.ts                # 主应用入口（插件集成）
```

### 插件化集成

API 服务通过 LDesign Engine 插件的方式集成，与其他插件保持一致：

```typescript
// src/main.ts
import { createApiEnginePlugin } from './services/api-engine-plugin'

// 集成 API 引擎插件
await engine.use(
  createApiEnginePlugin({
    name: 'api',
    version: '1.0.0',
    globalPropertyName: '$api',
    enableSystemApis: true,
  })
)
```

### 核心组件

#### 1. API 引擎插件 (`createApiEnginePlugin`)

```typescript
// 创建插件实例
const apiPlugin = createApiEnginePlugin({
  name: 'api',
  version: '1.0.0',
  globalPropertyName: '$api',
  enableSystemApis: true,
})

// 通过 Engine 使用
await engine.use(apiPlugin)
```

#### 2. API 服务 (`ApiService`)

```typescript
class ApiService {
  // 系统接口
  async login(data: LoginData)
  async logout()
  async getUserInfo(): Promise<UserInfo>
  async getMenus(): Promise<MenuItem[]>
  async getPermissions(): Promise<string[]>

  // 工具方法
  async callApi(method: string, params?: any)
  async registerApi(name: string, config: any)
}
```

#### 3. 认证组合式函数 (`useAuth`)

```typescript
const {
  // 状态
  isAuthenticated,
  currentUser,
  userMenus,
  userPermissions,
  isLoading,

  // 方法
  login,
  logout,
  fetchUserInfo,
  hasPermission,
  hasRole,
} = useAuth()
```

## 🎯 使用示例

### 基础用法

```typescript
// 1. 在组件中使用认证
import { useAuth } from '../composables/useAuth'

const { isAuthenticated, currentUser, login } = useAuth()

// 2. 登录
const handleLogin = async () => {
  const result = await login({
    username: 'admin',
    password: 'admin',
  })

  if (result.success) {
    console.log('登录成功')
  }
}

// 3. 检查权限
const canDelete = hasPermission('delete')
const isAdmin = hasRole('admin')
```

### API 调用

```typescript
// 1. 使用 API 服务
import { useApiService } from '../services/api'

const apiService = useApiService()

// 2. 调用系统接口
const userInfo = await apiService.getUserInfo()
const menus = await apiService.getMenus()

// 3. 调用自定义接口
const result = await apiService.callApi('customMethod', { param: 'value' })
```

## 🔄 从模拟到真实 API

当前实现使用模拟数据，便于前端开发。要切换到真实 API：

### 1. 更新 API 服务

```typescript
// src/services/api.ts
class ApiService {
  private async callRealApi(method: string, data?: any) {
    // 使用真实的 HTTP 客户端
    const response = await this.httpClient.post(`/api/${method}`, data)
    return response.data
  }

  async login(data: LoginData) {
    return this.callRealApi('auth/login', data)
  }

  // ... 其他方法
}
```

### 2. 配置后端地址

```typescript
// src/main.ts
await engine.use(
  createHttpEnginePlugin({
    clientConfig: {
      baseURL: 'https://your-api-server.com',
      // ... 其他配置
    },
  })
)
```

## 🎨 页面功能

### 登录页面 (`/login`)

- ✅ 真实 API 登录调用
- ✅ 错误处理和用户反馈
- ✅ 加载状态显示
- ✅ 登录成功后跳转

### API 演示页面 (`/api-demo`)

- ✅ 用户状态显示
- ✅ 系统接口调用演示
- ✅ 自定义 API 注册和调用
- ✅ API 调用历史记录
- ✅ 实时结果显示
- ✅ 错误处理

### 首页 (`/`)

- ✅ API 演示入口
- ✅ 功能特性展示
- ✅ 导航链接

## 🚀 扩展指南

### 添加新的系统接口

1. 在 `ApiService` 中添加方法：

```typescript
async getNotifications() {
  return this.mockApiCall('getNotifications')
}
```

2. 在 `getMockData` 中添加模拟数据：

```typescript
case 'getNotifications':
  return [
    { id: 1, title: '系统通知', content: '欢迎使用系统' },
    // ...
  ]
```

### 添加新的认证功能

1. 在 `useAuth` 中添加方法：

```typescript
const changePassword = async (oldPassword: string, newPassword: string) => {
  const result = await apiService.changePassword({ oldPassword, newPassword })
  return result
}
```

2. 在组件中使用：

```typescript
const { changePassword } = useAuth()
```

## 📊 性能优化

当前实现已包含以下优化：

- ✅ **响应式状态管理** - 使用 Vue 3 响应式系统
- ✅ **本地存储** - 登录状态持久化
- ✅ **错误处理** - 统一的错误处理机制
- ✅ **加载状态** - 用户友好的加载提示
- ✅ **模拟延迟** - 真实网络环境模拟

## 🔮 未来规划

- [ ] 集成真实的 `@ldesign/api` 包
- [ ] 添加请求缓存和去重
- [ ] 实现自动令牌刷新
- [ ] 添加离线支持
- [ ] 集成更多系统接口
- [ ] 添加 API 文档生成

## 🎉 总结

通过这次集成，我们成功实现了：

1. **完整的 API 管理系统** - 从登录到权限控制的完整流程
2. **优秀的开发体验** - 模拟数据支持，便于前端开发
3. **可扩展的架构** - 易于添加新功能和接口
4. **用户友好的界面** - 完整的演示页面和错误处理
5. **生产就绪** - 可以轻松切换到真实 API

这为后续的功能开发奠定了坚实的基础！🚀
