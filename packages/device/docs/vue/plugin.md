# Vue 插件

@ldesign/device 提供了完整的 Vue 3 集成支持，包括插件安装、全局属性注入、依赖注入等功能。

## 🚀 插件安装

### 基础安装

```typescript
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)

// 使用默认配置安装插件
app.use(DevicePlugin)

app.mount('#app')
```

### 自定义配置

```typescript
import { createApp } from 'vue'
import { DevicePlugin } from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)

// 使用自定义配置
app.use(DevicePlugin, {
  // 全局属性名称（默认为 '$device'）
  globalPropertyName: '$device',
  
  // 启用窗口大小变化监听
  enableResize: true,
  
  // 启用屏幕方向变化监听
  enableOrientation: true,
  
  // 要加载的扩展模块
  modules: ['network', 'battery', 'geolocation'],
  
  // 自定义设备类型断点
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  
  // 事件防抖时间（毫秒）
  debounceTime: 100
})

app.mount('#app')
```

## 🔧 配置选项

### DevicePluginOptions

```typescript
interface DevicePluginOptions extends DeviceDetectorOptions {
  /** 全局属性名称，默认为 '$device' */
  globalPropertyName?: string
}
```

### DeviceDetectorOptions

```typescript
interface DeviceDetectorOptions {
  /** 是否启用窗口大小变化监听，默认 true */
  enableResize?: boolean
  
  /** 是否启用屏幕方向变化监听，默认 true */
  enableOrientation?: boolean
  
  /** 要加载的扩展模块列表 */
  modules?: string[]
  
  /** 自定义设备类型断点 */
  breakpoints?: {
    mobile: number
    tablet: number
    desktop: number
  }
  
  /** 事件防抖时间（毫秒），默认 100ms */
  debounceTime?: number
}
```

## 🌐 全局属性

安装插件后，可以在任何组件中通过全局属性访问设备检测器：

### 选项式 API

```vue
<template>
  <div>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕宽度: {{ screenWidth }}px</p>
    <p>是否移动设备: {{ isMobile ? '是' : '否' }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      deviceType: '',
      screenWidth: 0,
      isMobile: false
    }
  },
  
  mounted() {
    // 获取初始设备信息
    this.updateDeviceInfo()
    
    // 监听设备变化
    this.$device.on('deviceChange', this.handleDeviceChange)
  },
  
  beforeUnmount() {
    // 清理事件监听器
    this.$device.off('deviceChange', this.handleDeviceChange)
  },
  
  methods: {
    updateDeviceInfo() {
      const deviceInfo = this.$device.getDeviceInfo()
      this.deviceType = deviceInfo.type
      this.screenWidth = deviceInfo.screen.width
      this.isMobile = deviceInfo.type === 'mobile'
    },
    
    handleDeviceChange(deviceInfo) {
      this.deviceType = deviceInfo.type
      this.screenWidth = deviceInfo.screen.width
      this.isMobile = deviceInfo.type === 'mobile'
    }
  }
}
</script>
```

### 组合式 API

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const device = instance?.appContext.config.globalProperties.$device

const deviceType = ref('')
const screenWidth = ref(0)
const isMobile = ref(false)

function updateDeviceInfo() {
  const deviceInfo = device.getDeviceInfo()
  deviceType.value = deviceInfo.type
  screenWidth.value = deviceInfo.screen.width
  isMobile.value = deviceInfo.type === 'mobile'
}

function handleDeviceChange(deviceInfo) {
  deviceType.value = deviceInfo.type
  screenWidth.value = deviceInfo.screen.width
  isMobile.value = deviceInfo.type === 'mobile'
}

onMounted(() => {
  updateDeviceInfo()
  device.on('deviceChange', handleDeviceChange)
})

onUnmounted(() => {
  device.off('deviceChange', handleDeviceChange)
})
</script>

<template>
  <div>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕宽度: {{ screenWidth }}px</p>
    <p>是否移动设备: {{ isMobile ? '是' : '否' }}</p>
  </div>
</template>
```

## 💉 依赖注入

插件还提供了依赖注入支持，可以通过 `useDeviceDetector` 函数获取设备检测器实例：

```vue
<script setup>
import { useDeviceDetector } from '@ldesign/device/vue'
import { onMounted, ref } from 'vue'

// 获取设备检测器实例
const detector = useDeviceDetector()

const deviceInfo = ref(null)

onMounted(() => {
  // 获取设备信息
  deviceInfo.value = detector.getDeviceInfo()
  
  // 监听设备变化
  detector.on('deviceChange', (info) => {
    deviceInfo.value = info
  })
})
</script>

<template>
  <div v-if="deviceInfo">
    <h3>设备信息</h3>
    <p>类型: {{ deviceInfo.type }}</p>
    <p>屏幕: {{ deviceInfo.screen.width }}×{{ deviceInfo.screen.height }}</p>
    <p>浏览器: {{ deviceInfo.browser.name }} {{ deviceInfo.browser.version }}</p>
    <p>系统: {{ deviceInfo.os.name }} {{ deviceInfo.os.version }}</p>
  </div>
</template>
```

## 🎯 自定义指令注册

插件会自动注册以下自定义指令：

- `v-device` - 设备类型指令
- `v-device-mobile` - 移动设备指令
- `v-device-tablet` - 平板设备指令
- `v-device-desktop` - 桌面设备指令

```vue
<template>
  <div>
    <!-- 只在移动设备上显示 -->
    <div v-device-mobile>
      <h3>移动端内容</h3>
    </div>
    
    <!-- 只在平板和桌面设备上显示 -->
    <div v-device="['tablet', 'desktop']">
      <h3>大屏设备内容</h3>
    </div>
  </div>
</template>
```

## 🔄 工厂函数

如果需要创建多个不同配置的插件实例，可以使用工厂函数：

```typescript
import { createApp } from 'vue'
import { createDevicePlugin } from '@ldesign/device/vue'

const app = createApp(App)

// 创建自定义配置的插件
const devicePlugin = createDevicePlugin({
  enableResize: true,
  modules: ['network'],
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024
  }
})

app.use(devicePlugin)
app.mount('#app')
```

## 🧹 资源清理

插件会自动处理资源清理。当应用卸载时，设备检测器实例会被自动销毁，所有事件监听器会被移除。

如果需要手动清理，可以调用：

```typescript
// 获取设备检测器实例
const detector = useDeviceDetector()

// 手动销毁
await detector.destroy()
```

## 🚨 错误处理

插件提供了完善的错误处理机制：

```vue
<script setup>
import { useDeviceDetector } from '@ldesign/device/vue'
import { onMounted, ref } from 'vue'

const detector = useDeviceDetector()
const error = ref(null)

onMounted(async () => {
  try {
    // 加载模块可能失败
    const networkModule = await detector.loadModule('network')
    console.log('网络模块加载成功')
  } catch (err) {
    error.value = err.message
    console.error('模块加载失败:', err)
  }
})
</script>

<template>
  <div>
    <div v-if="error" class="error">
      错误: {{ error }}
    </div>
  </div>
</template>
```

## 📝 TypeScript 支持

插件提供了完整的 TypeScript 类型定义：

```typescript
import type { DevicePluginOptions } from '@ldesign/device/vue'

// 插件配置类型
const options: DevicePluginOptions = {
  globalPropertyName: '$device',
  enableResize: true,
  modules: ['network']
}

// 全局属性类型扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $device: DeviceDetector
  }
}
```

## 🔗 相关链接

- [组合式 API](./composables.md) - 使用组合式 API
- [自定义指令](./directives.md) - 使用自定义指令
- [Vue 组件](./components.md) - 使用预制组件
- [API 参考](../api/reference.md) - 完整的 API 文档
