# 使用指南与最佳实践

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装核心包
pnpm add @ldesign/router @ldesign/device

# 或者只安装路由包（设备包为可选依赖）
pnpm add @ldesign/router
```

### 2. 基础配置

```typescript
import { createDeviceRouterPlugin, createRouter, createWebHistory } from '@ldesign/router'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
  ],
})

// 安装设备路由插件
const devicePlugin = createDeviceRouterPlugin({
  enableDeviceDetection: true,
  enableDeviceGuard: true,
})

devicePlugin.install(router)

// 创建应用
const app = createApp(App)
app.use(router)
app.mount('#app')
```

### 3. 第一个设备适配路由

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    name: 'Home',
    // 为不同设备配置不同组件
    deviceComponents: {
      mobile: () => import('@/views/mobile/Home.vue'),
      tablet: () => import('@/views/tablet/Home.vue'),
      desktop: () => import('@/views/desktop/Home.vue'),
    },
  },
]
```

## 📱 设备特定组件

### 1. 基础用法

```typescript
// 完整的设备组件配置
{
  path: '/dashboard',
  name: 'Dashboard',
  deviceComponents: {
    mobile: () => import('@/views/mobile/Dashboard.vue'),
    tablet: () => import('@/views/tablet/Dashboard.vue'),
    desktop: () => import('@/views/desktop/Dashboard.vue')
  }
}
```

### 2. 部分设备组件

```typescript
// 只为移动端提供专用组件，其他设备使用通用组件
{
  path: '/news',
  component: () => import('@/views/News.vue'), // 通用组件
  deviceComponents: {
    mobile: () => import('@/views/mobile/News.vue') // 移动端专用
  }
}
```

### 3. 命名视图支持

```typescript
{
  path: '/layout',
  components: {
    default: () => import('@/views/Layout.vue'),
    sidebar: () => import('@/components/Sidebar.vue')
  },
  deviceComponents: {
    mobile: {
      default: () => import('@/views/mobile/Layout.vue'),
      sidebar: () => import('@/components/mobile/Sidebar.vue')
    }
  }
}
```

## 🛡️ 设备访问控制

### 1. 基础限制

```typescript
// 限制管理后台只能在桌面端访问
{
  path: '/admin',
  component: () => import('@/views/Admin.vue'),
  meta: {
    supportedDevices: ['desktop'],
    unsupportedMessage: '管理后台仅支持桌面设备访问'
  }
}
```

### 2. 多设备支持

```typescript
// 支持桌面端和平板端
{
  path: '/editor',
  component: () => import('@/views/Editor.vue'),
  meta: {
    supportedDevices: ['desktop', 'tablet'],
    unsupportedMessage: '编辑器需要较大的屏幕空间'
  }
}
```

### 3. 自定义重定向

```typescript
// 不支持时重定向到自定义页面
{
  path: '/premium',
  component: () => import('@/views/Premium.vue'),
  meta: {
    supportedDevices: ['desktop'],
    unsupportedRedirect: '/mobile-guide',
    unsupportedMessage: '高级功能需要在桌面端使用'
  }
}
```



## 🪝 Composition API 使用

### 1. useDeviceRoute

```vue
<script setup lang="ts">
import { useDeviceRoute } from '@ldesign/router'

const {
  currentDevice,
  currentDeviceName,
  isCurrentRouteSupported,
  supportedDevices,
  isRouteSupported,
  goToUnsupportedPage,
} = useDeviceRoute()

// 检查特定路由是否支持
const canAccessAdmin = isRouteSupported('/admin')

// 监听设备变化
const unwatch = onDeviceChange(device => {
  console.log(`设备切换到: ${device}`)
})

onUnmounted(() => {
  unwatch()
})
</script>

<template>
  <div>
    <p>当前设备: {{ currentDeviceName }}</p>
    <p>路由支持: {{ isCurrentRouteSupported ? '✅' : '❌' }}</p>

    <div v-if="!isCurrentRouteSupported">
      <p>当前路由不支持您的设备</p>
      <button @click="goToUnsupportedPage()">查看详情</button>
    </div>

    <nav>
      <router-link v-if="canAccessAdmin" to="/admin"> 管理后台 </router-link>
    </nav>
  </div>
</template>
```

### 2. useDeviceComponent

```vue
<script setup lang="ts">
import { useDeviceComponent } from '@ldesign/router'

const { resolvedComponent, resolution, loading, error, hasDeviceComponent } = useDeviceComponent()

// 检查是否有移动端专用组件
const hasMobileComponent = hasDeviceComponent('mobile')
</script>

<template>
  <div>
    <div v-if="loading">组件加载中...</div>
    <div v-else-if="error">加载失败: {{ error.message }}</div>
    <component :is="resolvedComponent" v-else-if="resolvedComponent" />

    <div v-if="resolution" class="component-info">
      <span>来源: {{ resolution.source }}</span>
      <span>设备: {{ resolution.deviceType }}</span>
      <span v-if="resolution.isFallback">（回退组件）</span>
    </div>
  </div>
</template>
```

## 🎪 设备不支持页面

### 1. 使用内置组件

```vue
<!-- DeviceUnsupported.vue -->
<script setup lang="ts">
import { DeviceUnsupported } from '@ldesign/router'
</script>

<template>
  <DeviceUnsupported
    :device="$route.query.device"
    :from="$route.query.from"
    :message="$route.query.message"
    :supported-devices="['desktop']"
    :show-back-button="true"
    :show-refresh-button="true"
  />
</template>
```

### 2. 自定义不支持页面

```vue
<!-- CustomUnsupported.vue -->
<script setup lang="ts">
import { useDeviceRoute } from '@ldesign/router'

const route = useRoute()
const { currentDeviceName } = useDeviceRoute()

const message = route.query.message || '当前功能不支持您的设备'
const supportedDevices = route.query.supportedDevices?.split(',') || ['desktop']

const supportedDeviceNames = supportedDevices.map(device => {
  const names = { mobile: '移动设备', tablet: '平板设备', desktop: '桌面设备' }
  return names[device] || device
})

function goBack() {
  window.history.back()
}

function contactSupport() {
  // 联系客服逻辑
}
</script>

<template>
  <div class="custom-unsupported">
    <h1>设备不兼容</h1>
    <p>{{ message }}</p>

    <div class="device-info">
      <p>当前设备: {{ deviceName }}</p>
      <p>支持的设备: {{ supportedDeviceNames.join('、') }}</p>
    </div>

    <div class="actions">
      <button @click="goBack">返回</button>
      <button @click="contactSupport">联系客服</button>
    </div>
  </div>
</template>
```

## ⚙️ 高级配置

### 1. 自定义设备检查逻辑

```typescript
const devicePlugin = createDeviceRouterPlugin({
  guardOptions: {
    checkSupportedDevices: (supportedDevices, currentDevice, route) => {
      // 自定义检查逻辑
      if (route.path.startsWith('/admin')) {
        // 管理后台需要更严格的检查
        return currentDevice === 'desktop' && window.innerWidth >= 1200
      }

      return supportedDevices.includes(currentDevice)
    },

    onUnsupportedDevice: (currentDevice, route) => {
      // 自定义处理逻辑
      if (route.path.startsWith('/mobile-only')) {
        return {
          path: '/download-app',
          query: { from: route.path },
        }
      }

      return {
        path: '/device-unsupported',
        query: {
          device: currentDevice,
          from: route.path,
          message: route.meta.unsupportedMessage,
        },
      }
    },
  },
})
```

### 2. 动态路由配置

```typescript
// 根据用户权限动态配置设备支持
function createDynamicRoute(userRole: string) {
  const baseRoute = {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
  }

  if (userRole === 'admin') {
    // 管理员可以在所有设备上访问
    return baseRoute
  } else {
    // 普通用户只能在桌面端访问
    return {
      ...baseRoute,
      meta: {
        supportedDevices: ['desktop'],
        unsupportedMessage: '此功能需要管理员权限或桌面设备',
      },
    }
  }
}
```

### 3. 条件性设备组件

```typescript
// 根据功能特性动态选择组件
{
  path: '/camera',
  deviceComponents: {
    mobile: () => import('@/views/mobile/Camera.vue'), // 支持相机
    tablet: () => import('@/views/tablet/Camera.vue'),  // 支持相机
    desktop: () => import('@/views/desktop/CameraFallback.vue') // 不支持相机
  },
  meta: {
    // 只有支持相机的设备才能访问完整功能
    supportedDevices: ['mobile', 'tablet']
  }
}
```

## 🎯 最佳实践

### 1. 渐进式增强

```typescript
// 先提供基础功能，再为特定设备优化
{
  path: '/product/:id',
  component: () => import('@/views/Product.vue'), // 基础组件
  deviceComponents: {
    mobile: () => import('@/views/mobile/Product.vue') // 移动端优化
  }
}
```

### 2. 性能优化

```typescript
// 使用懒加载减少初始包大小
deviceComponents: {
  mobile: () => import(
    /* webpackChunkName: "mobile-home" */
    '@/views/mobile/Home.vue'
  ),
  desktop: () => import(
    /* webpackChunkName: "desktop-home" */
    '@/views/desktop/Home.vue'
  )
}
```

### 3. 错误处理

```typescript
// 提供友好的错误处理
{
  path: '/complex-feature',
  meta: {
    supportedDevices: ['desktop'],
    unsupportedMessage: '此功能需要较大的屏幕和键盘操作，请在电脑上使用',
    unsupportedRedirect: '/feature-guide'
  }
}
```

### 4. 测试友好

```vue
<!-- 添加测试标识 -->
<script setup lang="ts">
import { useDeviceRoute } from '@ldesign/router'

const { currentDevice } = useDeviceRoute()
const title = computed(() => {
  const titles = {
    mobile: '移动端首页',
    tablet: '平板端首页',
    desktop: '桌面端首页',
  }
  return titles[currentDevice.value]
})
</script>

<template>
  <div class="home-page" :data-testid="`home-${currentDevice}`" :data-device="currentDevice">
    <h1>{{ title }}</h1>
  </div>
</template>
```

## 🔍 调试技巧

### 1. 开发工具

```typescript
// 开发环境下启用详细日志
const devicePlugin = createDeviceRouterPlugin({
  enableDeviceDetection: true,
  enableDeviceGuard: true,
  // 开发环境配置
  ...(process.env.NODE_ENV === 'development' && {
    guardOptions: {
      onUnsupportedDevice: (device, route) => {
        console.log('Device not supported:', { device, route: route.path })
        return { path: '/device-unsupported', query: { device, from: route.path } }
      },
    },
  }),
})
```

### 2. 设备模拟

```typescript
// 在开发环境中模拟不同设备
if (process.env.NODE_ENV === 'development') {
  window.simulateDevice = (deviceType: DeviceType) => {
    // 触发设备变化事件
    window.dispatchEvent(
      new CustomEvent('device-change', {
        detail: { type: deviceType },
      })
    )
  }
}
```

通过这些使用指南和最佳实践，开发者可以充分利用设备适配功能，创建出色的多设备用户体验。
