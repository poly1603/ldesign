# 增强的路由组件

本文档介绍如何使用增强版的 RouterLink 和 RouterView 组件，它们提供了比标准 Vue Router 组件更丰富的功
能。

## 🚀 快速开始

### 自动启用（推荐）

增强组件默认会自动替换标准的 RouterLink 和 RouterView 组件：

```typescript
import { createApp } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/router'

const engine = createApp(App)

await engine.use(
  routerPlugin({
    routes,
    mode: 'hash',
    // 增强组件默认启用，无需额外配置
  })
)
```

### 手动配置

如果需要自定义增强组件的行为：

```typescript
await engine.use(
  routerPlugin({
    routes,
    mode: 'hash',
    enhancedComponents: {
      enabled: true,
      options: {
        replaceRouterLink: true,
        replaceRouterView: true,
        keepOriginal: false, // 是否保留原始组件
        enhancementConfig: {
          // 自定义权限检查器
          permissionChecker: permission => {
            return checkUserPermission(permission)
          },
          // 自定义事件追踪器
          eventTracker: (event, data) => {
            analytics.track(event, data)
          },
          // 自定义确认对话框
          confirmDialog: async (message, title) => {
            return await showCustomDialog(message, title)
          },
        },
      },
    },
  })
)
```

## 📖 RouterLink 增强功能

### 基础用法

```vue
<template>
  <!-- 基础链接 -->
  <RouterLink to="/home"> 首页 </RouterLink>

  <!-- 按钮样式 -->
  <RouterLink to="/products" variant="button" size="large"> 产品列表 </RouterLink>

  <!-- 标签页样式 -->
  <RouterLink to="/about" variant="tab"> 关于我们 </RouterLink>
</template>
```

### 预加载功能

```vue
<template>
  <!-- 鼠标悬停时预加载 -->
  <RouterLink to="/heavy-page" preload="hover" preload-delay="300"> 重型页面 </RouterLink>

  <!-- 组件可见时预加载 -->
  <RouterLink to="/lazy-page" preload="visible"> 懒加载页面 </RouterLink>

  <!-- 立即预加载 -->
  <RouterLink to="/important-page" preload="immediate"> 重要页面 </RouterLink>
</template>
```

### 权限控制

```vue
<template>
  <!-- 需要权限的链接 -->
  <RouterLink to="/admin" permission="admin" fallback-to="/login"> 管理后台 </RouterLink>

  <!-- 多权限检查 -->
  <RouterLink to="/settings" :permission="['user', 'settings']"> 设置 </RouterLink>
</template>
```

### 图标和徽章

```vue
<template>
  <!-- 带图标的链接 -->
  <RouterLink to="/messages" icon="icon-message" icon-position="left"> 消息 </RouterLink>

  <!-- 带徽章的链接 -->
  <RouterLink to="/notifications" badge="5" badge-color="#ff4757" badge-variant="count">
    通知
  </RouterLink>

  <!-- 状态指示 -->
  <RouterLink to="/live" pulse badge-variant="dot" badge-color="#2ed573"> 直播 </RouterLink>
</template>
```

### 确认对话框

```vue
<template>
  <!-- 需要确认的操作 -->
  <RouterLink
    to="/logout"
    confirm-message="确定要退出登录吗？"
    confirm-title="退出确认"
    variant="button"
  >
    退出登录
  </RouterLink>
</template>
```

### 外部链接

```vue
<template>
  <!-- 外部链接 -->
  <RouterLink to="https://example.com" external target="_blank" icon="icon-external">
    外部链接
  </RouterLink>
</template>
```

### 事件追踪

```vue
<template>
  <!-- 追踪用户行为 -->
  <RouterLink
    to="/product/123"
    track-event="product_view"
    :track-data="{ productId: '123', category: 'electronics' }"
  >
    查看产品
  </RouterLink>
</template>
```

### 加载状态

```vue
<template>
  <!-- 显示加载状态 -->
  <RouterLink to="/submit" :loading="isSubmitting" :disabled="isSubmitting" variant="button">
    提交表单
  </RouterLink>
</template>
```

## 📖 RouterView 增强功能

### 基础用法

```vue
<template>
  <!-- 基础路由视图 -->
  <RouterView />

  <!-- 带过渡动画 -->
  <RouterView transition="fade" transition-mode="out-in" />
</template>
```

### 过渡动画

```vue
<template>
  <!-- 自定义过渡 -->
  <RouterView
    :transition="{
      name: 'slide',
      mode: 'out-in',
      duration: 300,
    }"
  />

  <!-- 根据路由元信息选择过渡 -->
  <RouterView :transition="route.meta.transition || 'fade'" />
</template>
```

### 缓存控制

```vue
<template>
  <!-- 启用缓存 -->
  <RouterView
    keep-alive
    :keep-alive-include="['Home', 'Products']"
    :keep-alive-exclude="/Admin.*/"
    :keep-alive-max="10"
  />
</template>
```

### 加载和错误处理

```vue
<template>
  <!-- 加载状态和错误处理 -->
  <RouterView
    :loading-component="LoadingSpinner"
    :error-component="ErrorPage"
    :empty-component="EmptyState"
    error-boundary
    @error="handleError"
  />
</template>
```

### 权限控制

```vue
<template>
  <!-- 需要认证的路由 -->
  <RouterView require-auth :fallback-component="LoginPage" />
</template>
```

### 布局系统

```vue
<template>
  <!-- 使用布局 -->
  <RouterView layout="admin" :layout-props="{ sidebar: true, theme: 'dark' }" />
</template>
```

### 性能监控

```vue
<script setup>
function handlePerformance(data) {
  console.log('Route performance:', data)
  // { route: '/home', duration: 150, component: 'Home' }
}
</script>

<template>
  <!-- 性能监控 -->
  <RouterView track-performance @performance="handlePerformance" />
</template>
```

### 滚动行为

```vue
<template>
  <!-- 自动滚动到顶部 -->
  <RouterView scroll-to-top scroll-behavior="smooth" />
</template>
```

### 页面元信息

```vue
<template>
  <!-- 自动更新页面标题 -->
  <RouterView update-title update-meta />
</template>
```

## 🎨 样式定制

### CSS 变量

```css
:root {
  --color-primary: #007bff;
  --color-primary-dark: #0056b3;
  --color-danger: #dc3545;
  --color-text-primary: #212529;
  --color-text-secondary: #6c757d;
  --color-text-muted: #adb5bd;
  --color-background: #fff;
  --color-border: #dee2e6;
}
```

### 自定义样式

```less
// 自定义按钮样式
.enhanced-router-link--button {
  &.my-custom-button {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 25px;

    &:hover {
      transform: scale(1.05);
    }
  }
}

// 自定义过渡动画
.my-custom-transition-enter-active,
.my-custom-transition-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.my-custom-transition-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.my-custom-transition-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.1);
}
```

## 🔧 高级配置

### 自定义权限检查器

```typescript
import { createEnhancementConfig } from '@ldesign/router'

const enhancementConfig = createEnhancementConfig({
  permissionChecker: async permission => {
    const user = await getCurrentUser()

    if (Array.isArray(permission)) {
      return permission.some(p => user.permissions.includes(p))
    }

    return user.permissions.includes(permission)
  },
})
```

### 自定义事件追踪器

```typescript
const enhancementConfig = createEnhancementConfig({
  eventTracker: (event, data) => {
    // Google Analytics
    gtag('event', event, data)

    // 百度统计
    _hmt.push(['_trackEvent', event, JSON.stringify(data)])

    // 自定义分析
    analytics.track(event, data)
  },
})
```

### 自定义确认对话框

```typescript
import { ElMessageBox } from 'element-plus'

const enhancementConfig = createEnhancementConfig({
  confirmDialog: async (message, title = '确认') => {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      return true
    } catch {
      return false
    }
  },
})
```

### 自定义布局解析器

```typescript
const enhancementConfig = createEnhancementConfig({
  layoutResolver: layout => {
    const layouts = {
      admin: () => import('@/layouts/AdminLayout.vue'),
      user: () => import('@/layouts/UserLayout.vue'),
      empty: () => import('@/layouts/EmptyLayout.vue'),
    }

    return layouts[layout] || layouts.empty
  },
})
```

## 📚 API 参考

详细的 API 文档请参考类型定义文件：

- `EnhancedRouterLinkProps` - RouterLink 组件属性
- `EnhancedRouterViewProps` - RouterView 组件属性
- `ComponentEnhancementConfig` - 增强配置选项
- `EnhancedComponentsPluginOptions` - 插件配置选项

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这些组件！
