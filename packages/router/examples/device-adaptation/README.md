# 设备适配示例

这个示例展示了如何使用 LDesign Router 的设备适配功能。

## 🚀 运行示例

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 📁 项目结构

```
examples/device-adaptation/
├── src/
│   ├── components/
│   │   ├── DeviceInfo.vue          # 设备信息显示组件
│   │   └── NavigationMenu.vue      # 导航菜单组件
│   ├── views/
│   │   ├── desktop/                # 桌面端专用页面
│   │   │   ├── Home.vue
│   │   │   ├── Dashboard.vue
│   │   │   └── Admin.vue
│   │   ├── tablet/                 # 平板端专用页面
│   │   │   ├── Home.vue
│   │   │   └── Dashboard.vue
│   │   ├── mobile/                 # 移动端专用页面
│   │   │   ├── Home.vue
│   │   │   └── Profile.vue
│   │   ├── shared/                 # 共享页面
│   │   │   ├── About.vue
│   │   │   └── Contact.vue
│   │   └── DeviceUnsupported.vue   # 设备不支持页面
│   ├── router/
│   │   └── index.ts                # 路由配置
│   ├── App.vue                     # 根组件
│   └── main.ts                     # 应用入口
├── package.json
└── README.md
```

## 🎯 功能演示

### 1. 设备特定组件

不同设备访问相同路由时会显示不同的组件：

- **桌面端**: 功能完整的管理界面
- **平板端**: 适配触摸操作的界面
- **移动端**: 简化的移动友好界面

### 2. 设备访问控制

某些页面限制特定设备访问：

- `/admin` - 仅桌面端可访问
- `/mobile-profile` - 仅移动端可访问
- `/tablet-dashboard` - 仅平板端可访问

### 3. 模板路由

使用模板系统快速创建页面：

- `/template-login` - 使用登录模板
- `/template-dashboard` - 使用仪表板模板

### 4. 智能回退

当设备没有专用组件时自动回退：

- 移动端 → 平板端 → 桌面端 → 通用组件

## 🔧 配置说明

### 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, createDeviceRouterPlugin } from '@ldesign/router'

const routes = [
  {
    path: '/',
    name: 'Home',
    // 设备特定组件
    deviceComponents: {
      mobile: () => import('@/views/mobile/Home.vue'),
      tablet: () => import('@/views/tablet/Home.vue'),
      desktop: () => import('@/views/desktop/Home.vue')
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/desktop/Admin.vue'),
    meta: {
      // 限制只能在桌面设备访问
      supportedDevices: ['desktop'],
      unsupportedMessage: '管理后台仅支持桌面设备访问'
    }
  },
  {
    path: '/template-login',
    name: 'TemplateLogin',
    // 使用模板
    template: 'login',
    templateCategory: 'auth'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 安装设备路由插件
const devicePlugin = createDeviceRouterPlugin({
  enableDeviceDetection: true,
  enableDeviceGuard: true,
  enableTemplateRoutes: true,
  guardOptions: {
    onUnsupportedDevice: (device, route) => ({
      path: '/device-unsupported',
      query: {
        device,
        from: route.path,
        message: route.meta.unsupportedMessage
      }
    })
  }
})

devicePlugin.install(router)
```

### 组件使用

```vue
<!-- src/components/DeviceInfo.vue -->
<template>
  <div class="device-info">
    <h3>设备信息</h3>
    <p>当前设备: {{ currentDeviceName }}</p>
    <p>路由支持: {{ isCurrentRouteSupported ? '✅ 支持' : '❌ 不支持' }}</p>
    <p>支持的设备: {{ supportedDevices.join(', ') }}</p>
    
    <div class="route-tests">
      <h4>路由测试</h4>
      <p>/admin 支持: {{ isRouteSupported('/admin') ? '✅' : '❌' }}</p>
      <p>/mobile-profile 支持: {{ isRouteSupported('/mobile-profile') ? '✅' : '❌' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDeviceRoute } from '@ldesign/router'

const {
  currentDeviceName,
  isCurrentRouteSupported,
  supportedDevices,
  isRouteSupported
} = useDeviceRoute()
</script>
```

## 🎪 交互功能

### 设备模拟器

示例包含一个设备模拟器，可以模拟不同设备类型：

```vue
<!-- src/components/DeviceSimulator.vue -->
<template>
  <div class="device-simulator">
    <h3>设备模拟器</h3>
    <div class="device-buttons">
      <button @click="simulateDevice('mobile')">📱 移动端</button>
      <button @click="simulateDevice('tablet')">📱 平板端</button>
      <button @click="simulateDevice('desktop')">🖥️ 桌面端</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDeviceRoute } from '@ldesign/router'

const { onDeviceChange } = useDeviceRoute()

const simulateDevice = (device: DeviceType) => {
  // 模拟设备切换
  window.dispatchEvent(new CustomEvent('device-change', { detail: device }))
}
</script>
```

## 📱 响应式测试

### 窗口大小变化

调整浏览器窗口大小来测试响应式设备检测：

- 宽度 < 768px: 移动端
- 768px ≤ 宽度 < 1024px: 平板端  
- 宽度 ≥ 1024px: 桌面端

### 用户代理检测

在开发者工具中切换设备模拟来测试用户代理检测。

## 🧪 测试场景

### 1. 基础设备适配

1. 访问首页 `/`
2. 调整窗口大小或切换设备模拟
3. 观察页面组件的变化

### 2. 设备访问控制

1. 在移动端访问 `/admin`
2. 应该被重定向到设备不支持页面
3. 切换到桌面端后可以正常访问

### 3. 模板路由

1. 访问 `/template-login`
2. 观察模板系统如何根据设备类型渲染不同的登录界面

### 4. 智能回退

1. 访问只有移动端组件的页面
2. 在桌面端观察是否正确回退到通用组件

## 🔍 调试技巧

### 1. 控制台日志

示例启用了详细的控制台日志，可以观察：

- 设备检测结果
- 组件解析过程
- 路由守卫执行
- 模板加载状态

### 2. Vue DevTools

使用 Vue DevTools 查看：

- 当前路由状态
- 组件解析结果
- 响应式数据变化

### 3. 网络面板

观察模板和组件的懒加载过程。

## 🚀 扩展示例

基于这个示例，你可以：

1. 添加更多设备类型支持
2. 实现自定义设备检测逻辑
3. 创建更复杂的模板系统
4. 添加设备特定的样式和交互
