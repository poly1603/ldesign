# Vue 集成

@ldesign/device 为 Vue 3 提供了完整的集成方案，包括 Composition API、插件、指令和组件。

## 安装

```bash
npm install @ldesign/device
```

## 基础使用

### Composition API

#### useDevice

获取设备信息的响应式数据。

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const {
  deviceType, // 设备类型
  orientation, // 屏幕方向
  deviceInfo, // 完整设备信息
  isMobile, // 是否移动设备
  isTablet, // 是否平板设备
  isDesktop, // 是否桌面设备
  isTouchDevice, // 是否触摸设备
  refresh, // 刷新设备信息
  detector, // 检测器实例
} = useDevice()
</script>

<template>
  <div>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕方向: {{ orientation }}</p>
    <p>屏幕尺寸: {{ deviceInfo.width }} × {{ deviceInfo.height }}</p>
    <button @click="refresh">
      刷新信息
    </button>
  </div>
</template>
```

#### useNetwork

获取网络状态的响应式数据。

```vue
<script setup>
import { useNetwork } from '@ldesign/device/vue'

const {
  networkInfo, // 网络信息
  isOnline, // 是否在线
  connectionType, // 连接类型
  downlink, // 下载速度
  rtt, // 往返时间
  saveData, // 数据节省模式
} = useNetwork()
</script>

<template>
  <div>
    <p>网络状态: {{ isOnline ? '在线' : '离线' }}</p>
    <p>连接类型: {{ connectionType }}</p>
    <p>下载速度: {{ downlink }}Mbps</p>
    <p>延迟: {{ rtt }}ms</p>
  </div>
</template>
```

#### useBattery

获取电池状态的响应式数据。

```vue
<script setup>
import { useBattery } from '@ldesign/device/vue'

const {
  batteryInfo, // 电池信息
  level, // 电池电量
  isCharging, // 是否充电
  chargingTime, // 充电时间
  dischargingTime, // 放电时间
  batteryStatus, // 电池状态
} = useBattery()
</script>

<template>
  <div>
    <p>电池电量: {{ Math.round(level * 100) }}%</p>
    <p>充电状态: {{ isCharging ? '充电中' : '未充电' }}</p>
    <div class="battery-bar">
      <div class="battery-level" :style="{ width: `${level * 100}%` }" />
    </div>
  </div>
</template>
```

#### useGeolocation

获取地理位置的响应式数据。

```vue
<script setup>
import { useGeolocation } from '@ldesign/device/vue'

const {
  position, // 位置信息
  isSupported, // 是否支持
  error, // 错误信息
  latitude, // 纬度
  longitude, // 经度
  accuracy, // 精度
  getCurrentPosition, // 获取当前位置
  startWatching, // 开始监听
  stopWatching, // 停止监听
  isWatching, // 是否正在监听
} = useGeolocation()
</script>

<template>
  <div>
    <div v-if="isSupported">
      <p v-if="position">
        位置: {{ latitude.toFixed(6) }}, {{ longitude.toFixed(6) }}
      </p>
      <p v-if="position">
        精度: {{ accuracy }}米
      </p>
      <button @click="getCurrentPosition">
        获取位置
      </button>
      <button :disabled="isWatching" @click="startWatching">
        开始监听
      </button>
      <button :disabled="!isWatching" @click="stopWatching">
        停止监听
      </button>
    </div>
    <p v-else>
      不支持地理位置功能
    </p>
    <p v-if="error" class="error">
      {{ error }}
    </p>
  </div>
</template>
```

## 插件使用

### 全局安装

```typescript
import { DevicePlugin } from '@ldesign/device/vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(DevicePlugin, {
  enableResize: true,
  enableOrientation: true,
  debounceDelay: 300,
})

app.mount('#app')
```

### 全局访问

安装插件后，可以在任何组件中通过 `$device` 访问检测器实例：

```vue
<script setup>
import { getCurrentInstance, inject } from 'vue'

const instance = getCurrentInstance()
const device = instance?.appContext.config.globalProperties.$device

// 或者使用 inject
const deviceFromInject = inject('device')
</script>
```

## 指令使用

### v-device

根据设备类型控制元素显示/隐藏。

```vue
<template>
  <!-- 只在移动设备显示 -->
  <div v-device-mobile>
    移动设备专用内容
  </div>

  <!-- 只在平板设备显示 -->
  <div v-device-tablet>
    平板设备专用内容
  </div>

  <!-- 只在桌面设备显示 -->
  <div v-device-desktop>
    桌面设备专用内容
  </div>

  <!-- 只在触摸设备显示 -->
  <div v-device-touch>
    触摸设备专用内容
  </div>

  <!-- 只在非触摸设备显示 -->
  <div v-device-no-touch>
    非触摸设备专用内容
  </div>
</template>
```

### v-orientation

根据屏幕方向控制元素显示/隐藏。

```vue
<template>
  <!-- 只在竖屏显示 -->
  <div v-orientation-portrait>
    竖屏专用内容
  </div>

  <!-- 只在横屏显示 -->
  <div v-orientation-landscape>
    横屏专用内容
  </div>
</template>
```

### 自定义指令值

```vue
<template>
  <!-- 使用对象配置 -->
  <div v-device="{ type: 'mobile', orientation: 'portrait' }">
    移动设备竖屏时显示
  </div>

  <!-- 使用数组配置 -->
  <div v-device="['mobile', 'tablet']">
    移动设备或平板设备时显示
  </div>
</template>
```

## 组件使用

### DeviceInfo

显示设备信息的组件。

```vue
<script setup>
import { DeviceInfo } from '@ldesign/device/vue'

function handleRefresh() {
  console.log('设备信息已刷新')
}
</script>

<template>
  <DeviceInfo
    :show-system="true"
    :show-network="true"
    :show-battery="true"
    @refresh="handleRefresh"
  />
</template>
```

## 高级用法

### 自定义配置

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const { detector } = useDevice({
  enableResize: true,
  enableOrientation: true,
  debounceDelay: 500,
  breakpoints: {
    mobile: 480,
    tablet: 1024,
    desktop: 1200,
  },
})
</script>
```

### 事件监听

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { onMounted, onUnmounted } from 'vue'

const { detector } = useDevice()

function handleDeviceChange(deviceInfo) {
  console.log('设备信息变化:', deviceInfo)
}

function handleOrientationChange(orientation) {
  console.log('屏幕方向变化:', orientation)
}

onMounted(() => {
  detector.on('deviceChange', handleDeviceChange)
  detector.on('orientationChange', handleOrientationChange)
})

onUnmounted(() => {
  detector.off('deviceChange', handleDeviceChange)
  detector.off('orientationChange', handleOrientationChange)
})
</script>
```

### 模块加载

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { onMounted, ref } from 'vue'

const { detector } = useDevice()
const networkInfo = ref(null)
const batteryInfo = ref(null)

onMounted(async () => {
  try {
    // 加载网络模块
    const networkModule = await detector.loadModule('network')
    networkInfo.value = networkModule.getData()

    // 加载电池模块
    const batteryModule = await detector.loadModule('battery')
    batteryInfo.value = batteryModule.getData()
  }
  catch (error) {
    console.error('模块加载失败:', error)
  }
})
</script>
```

## TypeScript 支持

所有 Vue 集成都提供完整的 TypeScript 类型支持：

```typescript
import type {
  BatteryInfo,
  DeviceInfo,
  DevicePluginOptions,
  GeolocationInfo,
  NetworkInfo,
  UseDeviceReturn,
} from '@ldesign/device/vue'

// 类型安全的 composable 使用
const device: UseDeviceReturn = useDevice()
```

## 最佳实践

### 1. 按需使用

只导入需要的 composables：

```typescript
// ✅ 推荐
import { useDevice } from '@ldesign/device/vue'

// ❌ 不推荐
import * as Device from '@ldesign/device/vue'
```

### 2. 合理使用指令

指令适合简单的显示/隐藏逻辑：

```vue
<!-- ✅ 适合使用指令 -->
<div v-device-mobile>
移动端菜单
</div>

<!-- ❌ 复杂逻辑建议使用 computed -->
<div v-if="isMobile && isPortrait && hasTouch">
  复杂条件内容
</div>
```

### 3. 性能优化

避免在模板中直接调用方法：

```vue
<template>
  <!-- ✅ 使用响应式数据 -->
  <div>{{ deviceType }}</div>

  <!-- ❌ 避免在模板中调用方法 -->
  <div>{{ detector.getDeviceInfo().type }}</div>
</template>
```

### 4. 错误处理

始终处理可能的错误：

```vue
<script setup>
import { useGeolocation } from '@ldesign/device/vue'

const { getCurrentPosition, error } = useGeolocation()

async function getLocation() {
  try {
    await getCurrentPosition()
  }
  catch (err) {
    console.error('获取位置失败:', err)
  }
}
</script>
```
