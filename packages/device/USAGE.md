# @ldesign/device 使用指南

## 快速开始

### 1. 安装

```bash
npm install @ldesign/device
# 或
pnpm add @ldesign/device
```

### 2. Vue 3 集成（推荐）

#### 插件方式（全局使用）

```typescript
import { createApp } from 'vue'
import DevicePlugin from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)
app.use(DevicePlugin)
app.mount('#app')
```

#### Composition API（组件内使用）

```vue
<script setup>
import { useDevice, useNetwork, useBattery } from '@ldesign/device/vue'

// 设备信息
const { deviceType, isMobile, isTablet, isDesktop, orientation } = useDevice()

// 网络状态
const { isOnline, networkType, effectiveType } = useNetwork()

// 电池信息（如果支持）
const { level, charging, chargingTime } = useBattery()
</script>

<template>
  <div>
    <h2>设备信息</h2>
    <p>设备类型: {{ deviceType }}</p>
    <p>是否移动设备: {{ isMobile }}</p>
    <p>屏幕方向: {{ orientation }}</p>
    
    <h2>网络状态</h2>
    <p>在线状态: {{ isOnline ? '在线' : '离线' }}</p>
    <p>网络类型: {{ networkType }}</p>
    
    <h2>电池信息</h2>
    <p v-if="level !== null">电量: {{ Math.round(level * 100) }}%</p>
    <p v-if="charging !== null">充电状态: {{ charging ? '充电中' : '未充电' }}</p>
  </div>
</template>
```

#### 指令方式（条件渲染）

```vue
<template>
  <!-- 根据设备类型显示不同内容 -->
  <div v-device-mobile>移动设备专用内容</div>
  <div v-device-tablet>平板设备专用内容</div>
  <div v-device-desktop>桌面设备专用内容</div>
  
  <!-- 通用指令，支持多种条件 -->
  <div v-device="{ mobile: true, tablet: true }">移动设备和平板显示</div>
  <div v-device="{ desktop: true }">仅桌面显示</div>
</template>
```

### 3. 原生 JavaScript 使用

```typescript
import { DeviceDetector } from '@ldesign/device'

// 创建检测器实例
const detector = new DeviceDetector({
  enableResize: true,
  enableOrientation: true,
  modules: ['network', 'battery', 'geolocation']
})

// 初始化
await detector.init()

// 获取设备信息
const deviceInfo = detector.getDeviceInfo()
console.log('设备类型:', deviceInfo.type)
console.log('是否移动设备:', deviceInfo.isMobile)

// 监听设备变化
detector.on('deviceChange', (info) => {
  console.log('设备信息更新:', info)
})

// 监听网络变化
detector.on('networkChange', (networkInfo) => {
  console.log('网络状态:', networkInfo.online ? '在线' : '离线')
})

// 清理资源
detector.destroy()
```

## 高级用法

### 自定义配置

```typescript
import { createDevicePlugin } from '@ldesign/device/vue'

const devicePlugin = createDevicePlugin({
  enableResize: true,
  enableOrientation: true,
  modules: ['network', 'battery'],
  breakpoints: {
    mobile: 768,
    tablet: 1024
  }
})

app.use(devicePlugin)
```

### 响应式断点

```vue
<script setup>
import { useBreakpoints } from '@ldesign/device/vue'

const { current, isMobile, isTablet, isDesktop, width, height } = useBreakpoints({
  mobile: 768,
  tablet: 1024
})
</script>

<template>
  <div>
    <p>当前断点: {{ current }}</p>
    <p>屏幕尺寸: {{ width }} x {{ height }}</p>
  </div>
</template>
```

### 地理位置

```vue
<script setup>
import { useGeolocation } from '@ldesign/device/vue'

const { 
  position, 
  error, 
  loading, 
  supported, 
  getCurrentPosition, 
  watchPosition, 
  clearWatch 
} = useGeolocation()

// 获取当前位置
const getLocation = async () => {
  await getCurrentPosition()
}

// 监听位置变化
const startWatching = () => {
  watchPosition()
}
</script>

<template>
  <div>
    <button @click="getLocation" :disabled="loading">
      {{ loading ? '获取中...' : '获取位置' }}
    </button>
    
    <div v-if="position">
      <p>纬度: {{ position.latitude }}</p>
      <p>经度: {{ position.longitude }}</p>
      <p>精度: {{ position.accuracy }}米</p>
    </div>
    
    <div v-if="error" class="error">
      错误: {{ error.message }}
    </div>
  </div>
</template>
```

## 类型支持

库提供完整的 TypeScript 类型支持：

```typescript
import type { 
  DeviceInfo, 
  DeviceType, 
  NetworkInfo, 
  BatteryInfo,
  UseDeviceReturn 
} from '@ldesign/device/vue'

// 完全类型安全的使用
const { deviceType }: UseDeviceReturn = useDevice()
```

## 最佳实践

1. **性能优化**: 只启用需要的模块和功能
2. **内存管理**: 在组件卸载时自动清理资源
3. **响应式设计**: 结合断点系统实现响应式布局
4. **错误处理**: 始终检查功能支持性和错误状态
5. **类型安全**: 充分利用 TypeScript 类型系统
