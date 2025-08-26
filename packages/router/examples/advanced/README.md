# @ldesign/router 高级示例

这是一个展示 @ldesign/router 高级功能的示例应用，包含复杂的路由配置、状态管理集成、性能优化等。

## 功能特性

- ✅ 复杂嵌套路由
- ✅ 路由懒加载
- ✅ 路由守卫系统
- ✅ 状态管理集成 (Pinia)
- ✅ 路由元信息
- ✅ 动态路由添加
- ✅ 路由过渡动画
- ✅ 错误边界处理
- ✅ SEO优化
- ✅ 性能监控

## 项目结构

```
advanced/
├── src/
│   ├── components/        # 通用组件
│   ├── layouts/          # 布局组件
│   ├── views/            # 页面组件
│   ├── stores/           # Pinia状态管理
│   ├── router/           # 路由配置
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript类型
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── public/               # 静态资源
├── index.html            # HTML模板
├── vite.config.ts        # Vite配置
├── tsconfig.json         # TypeScript配置
└── package.json          # 项目配置
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

应用将在 http://localhost:3002 启动。

### 构建生产版本

```bash
pnpm run build
```

### 预览生产版本

```bash
pnpm run preview
```

## 核心功能演示

### 1. 复杂嵌套路由

```typescript
const _routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        component: () => import('./views/admin/Dashboard.vue'),
        meta: { title: '管理仪表板' }
      },
      {
        path: 'users',
        component: () => import('./views/admin/Users.vue'),
        children: [
          {
            path: ':id',
            component: () => import('./views/admin/UserDetail.vue')
          }
        ]
      }
    ]
  }
]
```

### 2. 路由守卫系统

```typescript
// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 权限检查
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
    return
  }

  // 角色检查
  if (to.meta.roles && !hasRequiredRole(to.meta.roles)) {
    next('/403')
    return
  }

  next()
})
```

### 3. 状态管理集成

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    permissions: []
  }),

  actions: {
    async login(_credentials) {
      // 登录逻辑
    },

    async fetchPermissions() {
      // 获取权限
    }
  }
})
```

### 4. 动态路由

```typescript
// 动态添加路由
function _addDynamicRoutes(userPermissions) {
  const dynamicRoutes = generateRoutesFromPermissions(userPermissions)
  dynamicRoutes.forEach((route) => {
    router.addRoute(route)
  })
}
```

## 技术栈

- Vue 3 + Composition API
- TypeScript
- Pinia (状态管理)
- Vite (构建工具)
- @ldesign/router (路由管理)

## 学习资源

- [官方文档](../../docs)
- [API参考](../../docs/api)
- [基础示例](../basic)
- [企业级示例](../enterprise)
