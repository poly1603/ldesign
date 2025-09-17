# 设备适配功能

LDesign Router 提供了强大的设备适配功能，让您可以轻松地为不同设备类型提供定制化的路由体验。

## 🌟 功能特性

- 🎯 **设备检测集成** - 自动检测用户设备类型（mobile、tablet、desktop）
- 🛡️ **设备访问控制** - 限制特定路由只能在指定设备上访问
- 🧩 **设备特定组件** - 为不同设备配置不同的页面组件

- 🔄 **智能回退机制** - 当目标设备没有组件时自动使用回退组件
- 📱 **响应式监听** - 实时监听设备变化并自动适配

## 📦 安装和配置

### 1. 安装依赖

```bash
pnpm add @ldesign/router @ldesign/device
```

### 2. 基础配置

```typescript
import { createDeviceRouterPlugin, createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      // 设备特定组件配置
      deviceComponents: {
        mobile: () => import('@/views/mobile/Home.vue'),
        tablet: () => import('@/views/tablet/Home.vue'),
        desktop: () => import('@/views/desktop/Home.vue'),
      },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/Admin.vue'),
      meta: {
        // 限制只能在桌面设备访问
        supportedDevices: ['desktop'],
        unsupportedMessage: '管理后台仅支持桌面设备访问',
      },
    },
  ],
})

// 安装设备路由插件
const devicePlugin = createDeviceRouterPlugin({
  enableDeviceDetection: true,
  enableDeviceGuard: true,

})

devicePlugin.install(router)
```

## 🎯 设备访问控制

### 限制设备访问

```typescript
const routes = [
  {
    path: '/mobile-only',
    component: MobileOnlyPage,
    meta: {
      supportedDevices: ['mobile'],
      unsupportedMessage: '此页面仅支持移动设备访问',
      unsupportedRedirect: '/mobile-guide',
    },
  },
  {
    path: '/desktop-admin',
    component: AdminPanel,
    meta: {
      supportedDevices: ['desktop'],
      unsupportedMessage: '管理面板需要在桌面设备上使用',
    },
  },
]
```

### 自定义设备检查逻辑

```typescript
const devicePlugin = createDeviceRouterPlugin({
  guardOptions: {
    checkSupportedDevices: (supportedDevices, currentDevice, route) => {
      // 自定义设备支持检查逻辑
      if (route.path.startsWith('/admin')) {
        return currentDevice === 'desktop'
      }
      return supportedDevices.includes(currentDevice)
    },
    onUnsupportedDevice: (currentDevice, route) => {
      // 自定义不支持设备的处理逻辑
      return {
        path: '/device-not-supported',
        query: {
          device: currentDevice,
          target: route.path,
        },
      }
    },
  },
})
```

## 🧩 设备特定组件

### 基础用法

```typescript
const routes = [
  {
    path: '/product/:id',
    name: 'Product',
    // 为不同设备配置不同组件
    deviceComponents: {
      mobile: () => import('@/views/mobile/Product.vue'),
      tablet: () => import('@/views/tablet/Product.vue'),
      desktop: () => import('@/views/desktop/Product.vue'),
    },
  },
]
```

### 组件回退策略

当某个设备没有专门的组件时，系统会按以下顺序回退：

1. 当前设备的组件
2. desktop 组件
3. tablet 组件
4. mobile 组件
5. 常规 component 配置

```typescript
const routes = [
  {
    path: '/news',
    // 常规组件作为回退
    component: () => import('@/views/News.vue'),
    deviceComponents: {
      // 只为移动设备提供专门组件
      mobile: () => import('@/views/mobile/News.vue'),
      // tablet 和 desktop 会使用常规组件
    },
  },
]
```



## 🪝 Composition API

### useDeviceRoute

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
onDeviceChange(device => {
  console.log(`设备切换到: ${device}`)
})
</script>

<template>
  <div>
    <p>当前设备: {{ currentDeviceName }}</p>
    <p>路由支持状态: {{ isCurrentRouteSupported ? '支持' : '不支持' }}</p>
    <p>支持的设备: {{ supportedDevices.join(', ') }}</p>

    <button v-if="!isCurrentRouteSupported" @click="goToUnsupportedPage()">查看不支持说明</button>
  </div>
</template>
```

### useDeviceComponent

```vue
<script setup lang="ts">
import { useDeviceComponent } from '@ldesign/router'

const { resolvedComponent, resolution, loading, error, hasDeviceComponent } = useDeviceComponent()

// 检查是否有移动端专用组件
const hasMobileComponent = hasDeviceComponent('mobile')
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">加载失败: {{ error.message }}</div>
    <component :is="resolvedComponent" v-else-if="resolvedComponent" />

    <div v-if="resolution">
      <p>组件来源: {{ resolution.source }}</p>
      <p>设备类型: {{ resolution.deviceType }}</p>
      <p>是否回退: {{ resolution.isFallback ? '是' : '否' }}</p>
    </div>
  </div>
</template>
```

## 🎪 设备不支持页面

### 使用内置组件

```vue
<script setup lang="ts">
import { DeviceUnsupported, useDeviceRoute } from '@ldesign/router'

const { currentDevice } = useDeviceRoute()
</script>

<template>
  <DeviceUnsupported
    :device="currentDevice"
    :from="$route.query.from"
    :message="$route.query.message"
    :supported-devices="['desktop']"
    :show-back-button="true"
    :show-refresh-button="true"
  />
</template>
```

### 自定义不支持页面

```typescript
const routes = [
  {
    path: '/device-unsupported',
    name: 'DeviceUnsupported',
    component: () => import('@/views/DeviceUnsupported.vue'),
  },
]
```

## 📱 响应式监听

### 监听设备变化

```typescript
import { useDeviceRoute } from '@ldesign/router'

const { onDeviceChange } = useDeviceRoute()

// 监听设备变化
const unwatch = onDeviceChange(device => {
  console.log(`设备变化: ${device}`)

  // 根据设备变化执行相应逻辑
  if (device === 'mobile') {
    // 移动端特定逻辑
  }
})

// 组件卸载时取消监听
onUnmounted(() => {
  unwatch()
})
```

## 🔧 高级配置

### 完整配置示例

```typescript
const devicePlugin = createDeviceRouterPlugin({
  // 基础配置
  defaultSupportedDevices: ['mobile', 'tablet', 'desktop'],
  defaultUnsupportedMessage: '当前系统不支持在此设备上查看',
  defaultUnsupportedRedirect: '/device-unsupported',

  // 功能开关
  enableDeviceDetection: true,
  enableDeviceGuard: true,


  // 守卫配置
  guardOptions: {
    checkSupportedDevices: (supported, current, route) => {
      return supported.includes(current)
    },
    onUnsupportedDevice: (device, route) => {
      return `/device-unsupported?device=${device}&from=${route.path}`
    },
  },


})
```

## 🎯 最佳实践

### 1. 渐进式增强

```typescript
// 先提供基础组件，再为特定设备优化
const routes = [
  {
    path: '/product',
    component: ProductPage, // 基础组件
    deviceComponents: {
      mobile: MobileProductPage, // 移动端优化
    },
  },
]
```

### 2. 合理的设备限制

```typescript
// 只对真正需要的页面进行设备限制
const routes = [
  {
    path: '/admin',
    component: AdminPage,
    meta: {
      supportedDevices: ['desktop'], // 管理后台限制桌面端
      unsupportedMessage: '管理功能需要在电脑上使用',
    },
  },
]
```

### 3. 友好的错误处理

```typescript
// 提供清晰的错误信息和解决方案
const devicePlugin = createDeviceRouterPlugin({
  guardOptions: {
    onUnsupportedDevice: (device, route) => ({
      path: '/device-guide',
      query: {
        device,
        target: route.path,
        suggestion: device === 'mobile' ? 'use-desktop' : 'contact-support',
      },
    }),
  },
})
```

## 🚀 下一步

- 查看 [API 参考](./device-api-reference.md) 了解详细的 API 文档
- 查看 [示例项目](../examples/) 了解完整的使用示例
- 查看 [最佳实践](./best-practices.md) 了解更多优化建议
