# @ldesign/router 企业级示例

这是一个完整的企业级应用示例，展示了 @ldesign/router 在大型项目中的最佳实践和高级用法。

## 功能特性

### 🏗️ 架构特性
- ✅ 模块化路由设计
- ✅ 微前端架构支持
- ✅ 多租户路由隔离
- ✅ 动态权限路由
- ✅ 路由级别的代码分割
- ✅ 智能预加载策略

### 🔐 安全特性
- ✅ 基于角色的访问控制 (RBAC)
- ✅ 路由级权限验证
- ✅ JWT Token 管理
- ✅ 会话超时处理
- ✅ 安全审计日志

### 🌐 国际化
- ✅ 多语言路由支持
- ✅ 动态语言切换
- ✅ 路由元信息国际化
- ✅ SEO友好的多语言URL

### 📊 监控与分析
- ✅ 路由性能监控
- ✅ 用户行为分析
- ✅ 错误追踪与报告
- ✅ 实时性能指标

### 🎨 用户体验
- ✅ 渐进式加载
- ✅ 骨架屏占位
- ✅ 智能缓存策略
- ✅ 离线支持

## 项目结构

```
enterprise/
├── src/
│   ├── modules/              # 业务模块
│   │   ├── auth/            # 认证模块
│   │   ├── dashboard/       # 仪表板模块
│   │   ├── user-management/ # 用户管理模块
│   │   ├── system/          # 系统管理模块
│   │   └── reports/         # 报表模块
│   ├── shared/              # 共享资源
│   │   ├── components/      # 通用组件
│   │   ├── layouts/         # 布局组件
│   │   ├── services/        # API服务
│   │   ├── utils/           # 工具函数
│   │   ├── guards/          # 路由守卫
│   │   ├── plugins/         # 插件
│   │   └── types/           # TypeScript类型
│   ├── router/              # 路由配置
│   │   ├── index.ts         # 主路由配置
│   │   ├── guards.ts        # 全局守卫
│   │   ├── modules.ts       # 模块路由
│   │   └── dynamic.ts       # 动态路由
│   ├── stores/              # 状态管理
│   │   ├── auth.ts          # 认证状态
│   │   ├── user.ts          # 用户状态
│   │   ├── permission.ts    # 权限状态
│   │   └── app.ts           # 应用状态
│   ├── locales/             # 国际化资源
│   │   ├── zh-CN.json       # 中文
│   │   ├── en-US.json       # 英文
│   │   └── ja-JP.json       # 日文
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── tests/                   # 测试文件
│   ├── unit/               # 单元测试
│   ├── integration/        # 集成测试
│   └── e2e/                # 端到端测试
├── docs/                   # 项目文档
├── public/                 # 静态资源
├── index.html              # HTML模板
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
├── eslint.config.js        # ESLint配置
├── playwright.config.ts    # Playwright配置
└── package.json            # 项目配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

应用将在 http://localhost:3003 启动。

### 构建生产版本

```bash
pnpm run build
```

### 运行测试

```bash
# 单元测试
pnpm run test

# 端到端测试
pnpm run test:e2e

# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint
```

## 核心架构

### 1. 模块化路由设计

```typescript
// router/modules.ts
export const moduleRoutes = {
  auth: () => import('../modules/auth/routes'),
  dashboard: () => import('../modules/dashboard/routes'),
  userManagement: () => import('../modules/user-management/routes'),
  system: () => import('../modules/system/routes'),
  reports: () => import('../modules/reports/routes')
}

// 动态加载模块路由
async function _loadModuleRoutes(modules: string[]) {
  const routes = await Promise.all(
    modules.map(module => moduleRoutes[module]())
  )
  return routes.flat()
}
```

### 2. 权限路由系统

```typescript
// guards/permission.ts
export async function permissionGuard(to: RouteLocationNormalized) {
  const _userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 检查用户权限
  const hasPermission = await permissionStore.checkRoutePermission(to)

  if (!hasPermission) {
    throw new Error('Insufficient permissions')
  }

  return true
}
```

### 3. 多租户支持

```typescript
// router/tenant.ts
export function createTenantRouter(tenantId: string) {
  const baseRoutes = getBaseRoutes()
  const tenantRoutes = getTenantRoutes(tenantId)

  return createRouter({
    history: createWebHistory(`/${tenantId}`),
    routes: [...baseRoutes, ...tenantRoutes]
  })
}
```

### 4. 性能监控

```typescript
// plugins/performance.ts
export const performancePlugin = {
  install(app: App, router: Router) {
    router.beforeEach((to, _from) => {
      performance.mark(`route-start-${to.path}`)
    })

    router.afterEach((to, _from) => {
      performance.mark(`route-end-${to.path}`)
      performance.measure(
        `route-${to.path}`,
        `route-start-${to.path}`,
        `route-end-${to.path}`
      )
    })
  }
}
```

## 部署指南

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 3003
CMD ["pnpm", "run", "preview"]
```

### Kubernetes 部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: router-enterprise-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: router-enterprise-app
  template:
    metadata:
      labels:
        app: router-enterprise-app
    spec:
      containers:
        - name: app
          image: router-enterprise-app:latest
          ports:
            - containerPort: 3003
```

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **类型系统**: TypeScript 5.9+
- **路由管理**: @ldesign/router
- **状态管理**: Pinia
- **国际化**: Vue I18n
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **测试框架**: Vitest + Playwright
- **代码规范**: ESLint + Prettier

## 最佳实践

### 1. 路由组织
- 按业务模块组织路由
- 使用懒加载提升性能
- 合理设置路由元信息

### 2. 权限控制
- 实现细粒度权限控制
- 使用路由守卫进行权限验证
- 动态生成权限路由

### 3. 性能优化
- 实施代码分割策略
- 使用智能预加载
- 优化路由切换动画

### 4. 错误处理
- 实现全局错误捕获
- 提供友好的错误页面
- 记录详细的错误日志

## 学习资源

- [官方文档](../../docs)
- [API参考](../../docs/api)
- [基础示例](../basic)
- [高级示例](../advanced)
