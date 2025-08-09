# LDesign Router 与 Engine 集成方案

## 🎯 集成目标

本文档详细介绍了将 `@ldesign/router` 路由器库集成到 `@ldesign/engine` 中的完整方案，实现了高度解耦、
类型安全、功能丰富的路由管理系统。

## 🏗️ 架构设计

### 1. 集成架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Vue 应用层                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Login     │  │    Home     │  │  Dashboard  │  ...    │
│  │   页面      │  │    页面     │  │    页面     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                  路由适配器层                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           LDesignRouterAdapter                          │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐  │ │
│  │  │  RouterAdapter  │  │     扩展功能                │  │ │
│  │  │     接口        │  │  • 预加载                   │  │ │
│  │  │  • push()       │  │  • 缓存管理                 │  │ │
│  │  │  • replace()    │  │  • 路由守卫                 │  │ │
│  │  │  • go()         │  │  • 事件集成                 │  │ │
│  │  │  • back()       │  │  • 状态同步                 │  │ │
│  │  │  • forward()    │  │                             │  │ │
│  │  └─────────────────┘  └─────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   LDesign Engine                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   状态管理   │  │   事件系统   │  │   日志系统   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   插件系统   │  │   通知系统   │  │   错误管理   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                  @ldesign/router                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Router 核心                              │ │
│  │  • 路由匹配    • 导航守卫    • 组件缓存                │ │
│  │  • 历史管理    • 懒加载      • 性能监控                │ │
│  │  • 插件系统    • 事件系统    • 错误处理                │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. 核心组件

#### 2.1 LDesignRouterAdapter

- **职责**: 包装 @ldesign/router，实现 RouterAdapter 接口
- **特点**:
  - 完全兼容 Engine 的 RouterAdapter 接口
  - 扩展了高级功能（预加载、缓存管理等）
  - 深度集成 Engine 的各个系统

#### 2.2 路由配置系统

- **路由定义**: 集中式路由配置，支持懒加载
- **元信息**: 扩展的路由元信息，支持权限控制
- **类型安全**: 完整的 TypeScript 类型支持

#### 2.3 集成系统

- **状态同步**: 路由状态自动同步到 Engine 状态管理
- **事件集成**: 路由变化触发 Engine 事件
- **错误处理**: 路由错误集成到 Engine 错误管理

## 🔧 实现细节

### 1. 依赖管理策略

```json
{
  "dependencies": {
    "@ldesign/router": "workspace:*",
    "@ldesign/engine": "workspace:*"
  }
}
```

**优势**:

- 使用 workspace 协议，确保版本一致性
- 开发时自动链接本地包
- 支持热重载和实时更新

### 2. 生命周期集成

```typescript
// 1. 创建适配器
const routerAdapter = createLDesignRouterAdapter(routes)

// 2. 创建 Engine，传入路由器
const engine = createEngine({
  router: routerAdapter,
  // ... 其他配置
})

// 3. 安装到 Vue 应用
engine.install(app)

// 4. 设置路由守卫
setupRouterGuards(engine)
```

**关键时机**:

- **适配器创建**: 在 Engine 创建前
- **路由器安装**: 在 Vue 应用创建后
- **守卫设置**: 在 Engine 安装后

### 3. 状态同步机制

```typescript
// 路由变化时自动更新 Engine 状态
private updateEngineState(): void {
  const currentRoute = this.router.currentRoute.value
  this.engine.state.set('router:currentRoute', currentRoute)
  this.engine.state.set('router:path', currentRoute.path)
  this.engine.state.set('router:name', currentRoute.name)
  this.engine.state.set('router:params', currentRoute.params)
  this.engine.state.set('router:query', currentRoute.query)
}
```

**同步内容**:

- 当前路由对象
- 路由路径
- 路由名称
- 路由参数
- 查询参数

### 4. 事件集成系统

```typescript
// 路由变化事件
this.engine.events.emit('router:beforeEach', { to, from })
this.engine.events.emit('router:afterEach', { to, from })
this.engine.events.emit('router:error', error)
```

**事件类型**:

- `router:beforeEach`: 路由变化前
- `router:afterEach`: 路由变化后
- `router:error`: 路由错误

## 🚀 功能特性

### 1. 基础路由功能

- ✅ 编程式导航 (`push`, `replace`, `go`, `back`, `forward`)
- ✅ 声明式导航 (`RouterLink` 组件)
- ✅ 路由视图 (`RouterView` 组件)
- ✅ 动态路由匹配
- ✅ 嵌套路由支持

### 2. 高级功能

- ✅ 路由懒加载
- ✅ 路由预加载
- ✅ 组件缓存管理
- ✅ 路由守卫系统
- ✅ 错误边界处理

### 3. Engine 集成功能

- ✅ 状态管理集成
- ✅ 事件系统集成
- ✅ 日志系统集成
- ✅ 通知系统集成
- ✅ 错误管理集成

### 4. 开发体验

- ✅ 完整的 TypeScript 类型支持
- ✅ 热重载支持
- ✅ 开发工具集成
- ✅ 详细的错误信息

## 📊 性能优化

### 1. 代码分割

```typescript
// 路由级别的代码分割
{
  path: '/dashboard',
  component: () => import('../views/Dashboard'), // 懒加载
}
```

### 2. 预加载策略

```typescript
// 智能预加载
await routerUtils.preloadRoute(engine, '/dashboard')
```

### 3. 缓存管理

```typescript
// 路由缓存控制
engine.router?.clearCache?.()
```

## 🛡️ 类型安全

### 1. 路由元信息类型

```typescript
export interface AppRouteMeta {
  title?: string
  requiresAuth?: boolean
  icon?: string
  hidden?: boolean
  roles?: string[]
}
```

### 2. 适配器类型扩展

```typescript
// 扩展 RouterAdapter 接口
interface ExtendedRouterAdapter extends RouterAdapter {
  getCurrentRoute?: () => any
  getRoutes?: () => any[]
  preloadRoute?: (route: any) => Promise<void>
  clearCache?: () => void
}
```

## 🔍 测试策略

### 1. 单元测试

- 适配器功能测试
- 路由配置测试
- 工具函数测试

### 2. 集成测试

- Engine 集成测试
- 路由导航测试
- 状态同步测试

### 3. E2E 测试

- 用户流程测试
- 路由守卫测试
- 错误处理测试

## 📈 监控和调试

### 1. 日志集成

```typescript
engine.logger.info('路由导航: /login -> /dashboard')
engine.logger.error('路由错误:', error)
```

### 2. 性能监控

```typescript
// 路由性能监控
const startTime = performance.now()
// ... 路由操作
const endTime = performance.now()
engine.logger.info(`路由耗时: ${endTime - startTime}ms`)
```

### 3. 开发工具

- Vue DevTools 支持
- Router DevTools 支持
- Engine DevTools 支持

## 🎯 最佳实践

### 1. 路由设计

- 使用语义化的路由路径
- 合理设置路由元信息
- 避免过深的嵌套路由

### 2. 性能优化

- 合理使用路由懒加载
- 预加载关键路由
- 定期清理路由缓存

### 3. 错误处理

- 设置全局错误边界
- 提供友好的错误页面
- 记录详细的错误日志

### 4. 安全考虑

- 实现路由级别的权限控制
- 验证路由参数
- 防止未授权访问

## 🔮 未来扩展

### 1. 服务端渲染 (SSR)

- 支持 Nuxt.js 集成
- 服务端路由预渲染
- SEO 优化

### 2. 微前端支持

- 子应用路由隔离
- 路由共享机制
- 跨应用导航

### 3. 高级缓存策略

- 智能缓存预测
- 基于用户行为的预加载
- 离线路由支持

## 📝 总结

本集成方案成功实现了 @ldesign/router 与 @ldesign/engine 的深度集成，具有以下优势：

1. **架构清晰**: 采用适配器模式，保持了良好的解耦性
2. **功能完整**: 支持所有路由功能和 Engine 集成功能
3. **类型安全**: 完整的 TypeScript 类型支持
4. **性能优秀**: 多种性能优化策略
5. **易于维护**: 清晰的代码结构和完善的文档
6. **扩展性强**: 为未来功能扩展留下了空间

这个集成方案为构建现代化的 Vue 应用提供了强大的路由管理能力，同时充分利用了 LDesign Engine 的各种系
统功能。
