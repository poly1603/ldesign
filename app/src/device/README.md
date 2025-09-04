# Device 插件集成

这个目录包含了 Device 检测插件的集成配置，为应用提供完整的设备检测功能。

## 📋 功能特性

### 🚀 核心功能
- **设备类型检测**: 自动识别桌面、平板、手机设备
- **屏幕方向监控**: 实时监听屏幕方向变化
- **网络状态检测**: 监控网络连接状态和类型
- **电池状态监控**: 获取电池电量和充电状态
- **地理位置检测**: 获取用户地理位置信息
- **窗口大小监听**: 响应窗口大小变化事件

### 🎯 配置特性
- **标准化插件**: 使用 `createDeviceEnginePlugin` 标准插件创建函数
- **类型安全**: 完整的 TypeScript 类型支持
- **性能优化**: 智能事件监听和资源管理
- **开发友好**: 详细的日志和调试信息
- **生产就绪**: 优化的生产环境配置

## 🔄 重构说明

### 标准化插件创建

本次重构将 Device 功能集成到 LDesign Engine 中，使用 `@ldesign/device` 包提供的标准 `createDeviceEnginePlugin` 函数：

**插件配置:**
```typescript
export const devicePlugin = createDeviceEnginePlugin({
  // 插件基础信息
  name: 'device',
  version: '1.0.0',
  
  // 功能开关
  enableResize: true,
  enableOrientation: true,
  
  // 模块配置
  modules: ['network', 'battery', 'geolocation'],
  
  // Vue 集成配置
  globalPropertyName: '$device',
  autoInstall: true,
  
  // 开发配置
  debug: false,
  enablePerformanceMonitoring: false,
})
```

## 📖 使用指南

### 在组件中使用

#### 1. 使用 Composition API

```vue
<template>
  <div>
    <h2>设备信息</h2>
    <p>设备类型: {{ deviceInfo.type }}</p>
    <p>屏幕宽度: {{ deviceInfo.screen.width }}px</p>
    <p>屏幕高度: {{ deviceInfo.screen.height }}px</p>
    <p>是否移动设备: {{ isMobile ? '是' : '否' }}</p>
    <p>是否桌面设备: {{ isDesktop ? '是' : '否' }}</p>
    <p>网络状态: {{ networkInfo.online ? '在线' : '离线' }}</p>
    <p>网络类型: {{ networkInfo.type }}</p>
  </div>
</template>

<script setup lang="ts">
import { useDevice, useNetwork } from '@ldesign/device/vue'

// 获取设备信息
const { deviceInfo, isMobile, isDesktop, isTablet } = useDevice()

// 获取网络信息
const { networkInfo } = useNetwork()
</script>
```

#### 2. 使用全局属性

```vue
<template>
  <div>
    <p>当前设备: {{ $device.getDeviceInfo().type }}</p>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const device = instance?.appContext.config.globalProperties.$device

// 监听设备变化
device?.on('deviceChange', (info) => {
  console.log('设备信息更新:', info)
})
</script>
```

#### 3. 使用指令

```vue
<template>
  <!-- 只在移动设备上显示 -->
  <div v-device-mobile>
    这是移动设备专用内容
  </div>
  
  <!-- 只在桌面设备上显示 -->
  <div v-device-desktop>
    这是桌面设备专用内容
  </div>
  
  <!-- 只在平板设备上显示 -->
  <div v-device-tablet>
    这是平板设备专用内容
  </div>
</template>
```

### 高级用法

#### 1. 电池状态监控

```vue
<script setup lang="ts">
import { useBattery } from '@ldesign/device/vue'

const { batteryInfo, isCharging, batteryLevel } = useBattery()

// 监听电池状态变化
watch(batteryLevel, (level) => {
  if (level < 0.2) {
    console.warn('电池电量低于 20%')
  }
})
</script>
```

#### 2. 地理位置检测

```vue
<script setup lang="ts">
import { useGeolocation } from '@ldesign/device/vue'

const { position, error, isLoading } = useGeolocation()

watch(position, (pos) => {
  if (pos) {
    console.log('当前位置:', pos.coords.latitude, pos.coords.longitude)
  }
})
</script>
```

#### 3. 屏幕方向监控

```vue
<script setup lang="ts">
import { useOrientation } from '@ldesign/device/vue'

const { orientation, isPortrait, isLandscape } = useOrientation()

watch(orientation, (newOrientation) => {
  console.log('屏幕方向变化:', newOrientation)
})
</script>
```

## 🔧 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `name` | `string` | `'device'` | 插件名称 |
| `version` | `string` | `'1.0.0'` | 插件版本 |
| `enableResize` | `boolean` | `true` | 启用窗口大小变化监听 |
| `enableOrientation` | `boolean` | `true` | 启用屏幕方向变化监听 |
| `modules` | `string[]` | `['network', 'battery', 'geolocation']` | 启用的模块列表 |
| `globalPropertyName` | `string` | `'$device'` | 全局属性名 |
| `autoInstall` | `boolean` | `true` | 自动安装 Vue 插件 |
| `debug` | `boolean` | `false` | 调试模式 |
| `enablePerformanceMonitoring` | `boolean` | `false` | 性能监控 |

## 🚀 最佳实践

1. **响应式设计**: 使用设备检测来优化不同设备的用户体验
2. **性能优化**: 根据设备性能调整功能复杂度
3. **网络适配**: 根据网络状态调整数据加载策略
4. **电池优化**: 在低电量时减少后台任务
5. **位置服务**: 合理使用地理位置功能，注意隐私保护

## 🔍 调试

启用调试模式可以查看详细的设备检测日志：

```typescript
const devicePlugin = createDeviceEnginePlugin({
  debug: true,
  enablePerformanceMonitoring: true,
})
```

## 📚 相关文档

- [Device 包文档](../../../packages/device/README.md)
- [LDesign Engine 文档](../../../packages/engine/README.md)
- [Vue 集成指南](../../../packages/device/docs/vue/index.md)
