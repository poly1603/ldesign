# 设备路由

@ldesign/router 提供了强大的设备适配功能，允许你根据不同的设备类型（手机、平板、桌面）提供不同的路由
和组件。

## 🎯 核心概念

设备路由系统基于以下核心概念：

- **设备检测**: 自动检测用户的设备类型
- **设备组件**: 为不同设备提供专门的组件
- **设备守卫**: 控制特定设备对路由的访问


## 🚀 快速开始

### 安装设备路由插件

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
import { createDeviceRouterPlugin } from '@ldesign/router/device'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 你的路由配置
  ],
})

// 创建设备路由插件
const devicePlugin = createDeviceRouterPlugin({
  // 启用设备检测
  enableDeviceDetection: true,

  // 启用设备访问控制
  enableDeviceGuard: true,



  // 设备守卫配置
  guardOptions: {
    onUnsupportedDevice: (device, route) => {
      return `/unsupported?device=${device}`
    },
  },
})

// 安装插件
router.use(devicePlugin)
```

## 📱 设备组件配置

### 基础设备组件

为不同设备提供专门的组件：

```typescript
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    // 默认组件（桌面端）
    component: () => import('./views/Dashboard.vue'),

    // 设备特定组件
    deviceComponents: {
      mobile: () => import('./views/mobile/Dashboard.vue'),
      tablet: () => import('./views/tablet/Dashboard.vue'),
      desktop: () => import('./views/desktop/Dashboard.vue'),
    },

    // 支持的设备类型
    meta: {
      supportedDevices: ['mobile', 'tablet', 'desktop'],
    },
  },
]
```

### 使用组合式 API

```vue
<script setup>
import { useDeviceRoute, useDeviceComponent } from '@ldesign/router'

// 获取设备路由信息
const { currentDevice, currentDeviceName, isCurrentRouteSupported, supportedDevices } =
  useDeviceRoute()

// 获取设备特定组件
const { currentComponent, loading, error } = useDeviceComponent()

console.log('当前设备:', currentDevice.value) // 'mobile' | 'tablet' | 'desktop'
console.log('设备名称:', currentDeviceName.value) // '手机' | '平板' | '桌面'
console.log('路由支持:', isCurrentRouteSupported.value) // boolean
</script>

<template>
  <div class="device-aware-component">
    <div class="device-info">
      <p>当前设备: {{ currentDeviceName }}</p>
      <p>路由支持: {{ isCurrentRouteSupported ? '是' : '否' }}</p>
    </div>

    <component v-if="currentComponent && !loading" :is="currentComponent" />

    <div v-else-if="loading" class="loading">正在加载设备组件...</div>

    <div v-else-if="error" class="error">
      {{ error.message }}
    </div>
  </div>
</template>
```

## 🛡️ 设备访问控制

### 路由级别的设备限制

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminPanel,
    meta: {
      // 只允许桌面端访问
      supportedDevices: ['desktop'],
      title: '管理面板',
    },
  },
  {
    path: '/mobile-app',
    component: MobileApp,
    meta: {
      // 只允许移动端访问
      supportedDevices: ['mobile'],
      title: '移动应用',
    },
  },
  {
    path: '/responsive',
    component: ResponsiveView,
    meta: {
      // 支持所有设备
      supportedDevices: ['mobile', 'tablet', 'desktop'],
      title: '响应式页面',
    },
  },
]
```

### 自定义设备守卫

```typescript
const devicePlugin = createDeviceRouterPlugin({
  enableDeviceGuard: true,
  guardOptions: {
    // 自定义设备支持检查
    checkSupportedDevices: (supportedDevices, currentDevice, route) => {
      // 特殊逻辑：管理员在任何设备都可以访问
      if (route.path.startsWith('/admin') && isAdmin()) {
        return true
      }

      return supportedDevices.includes(currentDevice)
    },

    // 设备不支持时的处理
    onUnsupportedDevice: (currentDevice, route) => {
      // 记录访问日志
      console.log(`设备 ${currentDevice} 尝试访问不支持的路由: ${route.path}`)

      // 重定向到设备特定页面
      if (currentDevice === 'mobile') {
        return '/mobile-download'
      } else if (currentDevice === 'tablet') {
        return '/tablet-notice'
      } else {
        return '/desktop-required'
      }
    },
  },
})
```


```

## 📊 设备信息获取

### 获取详细设备信息

```vue
<script setup>
import { useDeviceRoute } from '@ldesign/router'
import { computed } from 'vue'

const { getDeviceInfo } = useDeviceRoute()

const deviceInfo = computed(() => {
  const info = getDeviceInfo()
  return info
    ? {
        type: info.type,
        userAgent: info.userAgent,
        screenWidth: info.screen.width,
        screenHeight: info.screen.height,
        orientation: info.orientation,
        touchSupport: info.features.touch,
        retina: info.features.retina,
      }
    : null
})
</script>

<template>
  <div class="device-info" v-if="deviceInfo">
    <h3>设备信息</h3>
    <ul>
      <li>设备类型: {{ deviceInfo.type }}</li>
      <li>屏幕尺寸: {{ deviceInfo.screenWidth }} x {{ deviceInfo.screenHeight }}</li>
      <li>屏幕方向: {{ deviceInfo.orientation }}</li>
      <li>触摸支持: {{ deviceInfo.touchSupport ? '是' : '否' }}</li>
      <li>高分辨率: {{ deviceInfo.retina ? '是' : '否' }}</li>
    </ul>
  </div>
</template>
```

### 监听设备变化

```vue
<script setup>
import { useDeviceRoute } from '@ldesign/router'
import { onMounted, onUnmounted } from 'vue'

const { onDeviceChange } = useDeviceRoute()

let unwatch = null

onMounted(() => {
  // 监听设备变化（如屏幕旋转）
  unwatch = onDeviceChange(newDevice => {
    console.log('设备类型变化:', newDevice)

    // 可以在这里处理设备变化逻辑
    if (newDevice === 'mobile') {
      // 切换到移动端布局
      document.body.classList.add('mobile-layout')
    } else {
      document.body.classList.remove('mobile-layout')
    }
  })
})

onUnmounted(() => {
  // 清理监听器
  if (unwatch) {
    unwatch()
  }
})
</script>
```

## 🎯 实际应用场景

### 电商网站适配

```typescript
const routes = [
  {
    path: '/products',
    name: 'Products',
    deviceComponents: {
      // 移动端：卡片式布局
      mobile: () => import('./views/mobile/ProductCards.vue'),
      // 平板端：网格布局
      tablet: () => import('./views/tablet/ProductGrid.vue'),
      // 桌面端：表格布局
      desktop: () => import('./views/desktop/ProductTable.vue'),
    },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    deviceComponents: {
      // 移动端：分步骤结账
      mobile: () => import('./views/mobile/StepCheckout.vue'),
      // 桌面端：单页结账
      desktop: () => import('./views/desktop/SinglePageCheckout.vue'),
    },
    meta: {
      // 平板使用桌面端组件
      supportedDevices: ['mobile', 'tablet', 'desktop'],
    },
  },
]
```

### 管理后台适配

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      // 管理后台只支持桌面端
      supportedDevices: ['desktop'],
    },
    children: [
      {
        path: 'dashboard',
        deviceComponents: {
          desktop: () => import('./views/admin/Dashboard.vue'),
        },
      },
      {
        path: 'mobile-preview',
        // 移动端预览功能
        deviceComponents: {
          desktop: () => import('./views/admin/MobilePreview.vue'),
        },
      },
    ],
  },
]
```

## 🔧 高级配置

### 自定义设备检测

```typescript
import { DeviceDetector } from '@ldesign/device'

const customDetector = new DeviceDetector({
  // 自定义断点
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: Infinity,
  },

  // 启用方向检测
  enableOrientation: true,

  // 启用尺寸变化检测
  enableResize: true,

  // 防抖延迟
  debounceDelay: 100,
})

const devicePlugin = createDeviceRouterPlugin({
  // 使用自定义检测器
  detector: customDetector,
})
```

### 性能优化

```typescript
const devicePlugin = createDeviceRouterPlugin({
  // 启用组件预加载
  enablePreload: true,

  // 预加载策略
  preloadStrategy: {
    // 预加载相邻设备的组件
    preloadAdjacent: true,

    // 预加载延迟
    delay: 1000,

    // 最大并发预加载数
    maxConcurrent: 2,
  },

  // 组件缓存
  componentCache: {
    // 启用缓存
    enabled: true,

    // 最大缓存数量
    maxSize: 50,

    // 缓存过期时间
    ttl: 10 * 60 * 1000, // 10分钟
  },
})
```

## 🎨 样式适配

### CSS 媒体查询配合

```vue
<template>
  <div class="responsive-component">
    <h1>响应式组件</h1>
    <div class="content">
      <!-- 内容 -->
    </div>
  </div>
</template>

<style lang="less" scoped>
.responsive-component {
  padding: 20px;

  // 移动端样式
  @media (max-width: 767px) {
    padding: 10px;

    .content {
      font-size: 14px;
    }
  }

  // 平板端样式
  @media (min-width: 768px) and (max-width: 1023px) {
    padding: 15px;

    .content {
      font-size: 16px;
    }
  }

  // 桌面端样式
  @media (min-width: 1024px) {
    padding: 20px;

    .content {
      font-size: 18px;
    }
  }
}
</style>
```

### 动态类名

```vue
<script setup>
import { useDeviceRoute } from '@ldesign/router'
import { computed } from 'vue'

const { currentDevice } = useDeviceRoute()

const containerClass = computed(() => ['container', `container--${currentDevice.value}`])
</script>

<template>
  <div :class="containerClass">
    <h1>设备适配容器</h1>
  </div>
</template>

<style lang="less" scoped>
.container {
  &--mobile {
    max-width: 100%;
    padding: 10px;
  }

  &--tablet {
    max-width: 768px;
    margin: 0 auto;
    padding: 20px;
  }

  &--desktop {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
  }
}
</style>
```

## 📚 相关文档

- [模板系统](./template-system.md) - 深入了解模板系统
- [设备守卫](./device-guards.md) - 学习设备访问控制
- [性能监控](./performance-monitoring.md) - 监控设备路由性能
- [API 参考](../api/device-api.md) - 查看完整的 API 文档
