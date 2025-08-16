# 常见问题

## 基础问题

### Q: @ldesign/device 支持哪些浏览器？

A: @ldesign/device 支持所有现代浏览器：

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **移动端浏览器** (iOS Safari, Chrome Mobile, Samsung Internet 等)

对于不支持的浏览器，库会提供基础的降级功能。

### Q: 库的体积有多大？

A: @ldesign/device 经过优化，体积非常小：

- **核心库**: ~8KB (gzipped)
- **Vue 集成**: +2KB (gzipped)
- **扩展模块**: 按需加载，每个模块约 1-2KB

支持 Tree Shaking，只打包使用的功能。

### Q: 是否支持服务端渲染 (SSR)？

A: 是的，@ldesign/device 完全支持 SSR：

```typescript
// 在服务端环境下会返回安全的默认值
const detector = new DeviceDetector()
const deviceInfo = detector.getDeviceInfo()
// 服务端: { type: 'desktop', orientation: 'landscape', ... }
```

在客户端激活后，会自动检测真实的设备信息。

### Q: 如何在 TypeScript 项目中使用？

A: @ldesign/device 提供完整的 TypeScript 支持：

```typescript
import { DeviceDetector, DeviceInfo, DeviceType } from '@ldesign/device'

const detector = new DeviceDetector()
const deviceInfo: DeviceInfo = detector.getDeviceInfo()
const deviceType: DeviceType = deviceInfo.type
```

所有 API 都有完整的类型定义，享受完整的类型检查和智能提示。

## 功能问题

### Q: 为什么某些 API 在我的浏览器中不工作？

A: 某些 Web API 有特定的要求：

1. **地理位置 API**: 需要 HTTPS 环境和用户授权
2. **电池 API**: 部分浏览器已移除支持
3. **网络信息 API**: 主要在移动设备上支持

库会自动检测 API 支持情况并提供降级方案：

```typescript
try {
  const geolocationModule = await detector.loadModule('geolocation')
  if (geolocationModule.isSupported()) {
    // 使用地理位置功能
  } else {
    // 提供替代方案
  }
} catch (error) {
  console.warn('地理位置不支持:', error)
}
```

### Q: 如何自定义设备类型的断点？

A: 可以在初始化时自定义断点：

```typescript
const detector = new DeviceDetector({
  breakpoints: {
    mobile: 480, // 0-480px 为移动设备
    tablet: 1024, // 481-1024px 为平板设备
    desktop: 1025, // 1025px+ 为桌面设备
  },
})
```

### Q: 如何处理设备方向变化的延迟？

A: 可以调整防抖延迟或使用立即模式：

```typescript
// 方法1: 调整防抖延迟
const detector = new DeviceDetector({
  debounceDelay: 100, // 减少延迟
})

// 方法2: 监听原生事件获得更快响应
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    detector.refresh()
  }, 100)
})
```

### Q: 为什么电池信息显示为 null？

A: 电池 API 的支持情况：

1. **Chrome**: 已在桌面版本中移除支持
2. **Firefox**: 默认禁用，需要手动启用
3. **Safari**: 不支持
4. **移动浏览器**: 部分支持

这是正常现象，库会在不支持时返回 null：

```typescript
const batteryModule = await detector.loadModule('battery')
const batteryInfo = batteryModule.getData()

if (batteryInfo) {
  // 电池信息可用
  console.log('电量:', batteryInfo.level)
} else {
  // 电池信息不可用
  console.log('电池信息不支持')
}
```

## Vue 集成问题

### Q: 在 Vue 3 中如何全局使用？

A: 安装插件后即可全局使用：

```typescript
import { DevicePlugin } from '@ldesign/device/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(DevicePlugin)
app.mount('#app')
```

```vue
<!-- 任意组件中 -->
<script setup>
import { inject } from 'vue'
const device = inject('device')
</script>

<template>
  <div v-device-mobile>移动端内容</div>
</template>
```

### Q: 为什么 v-device 指令不工作？

A: 确保已正确安装插件：

```typescript
// ✅ 正确安装
app.use(DevicePlugin)

// ❌ 忘记安装插件
// 指令不会注册
```

或者手动注册指令：

```typescript
import { vDevice } from '@ldesign/device/vue'

app.directive('device', vDevice)
```

### Q: 如何在 Composition API 中监听设备变化？

A: 使用 watch 监听响应式数据：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { watch } from 'vue'

const { deviceType, orientation } = useDevice()

watch(deviceType, (newType, oldType) => {
  console.log(`设备类型变化: ${oldType} -> ${newType}`)
})

watch(orientation, newOrientation => {
  console.log('屏幕方向变化:', newOrientation)
})
</script>
```

## 性能问题

### Q: 如何优化检测性能？

A: 几个优化建议：

1. **调整防抖延迟**:

```typescript
const detector = new DeviceDetector({
  debounceDelay: 300, // 根据需求调整
})
```

2. **按需加载模块**:

```typescript
// ✅ 只在需要时加载
if (needNetworkInfo) {
  await detector.loadModule('network')
}

// ❌ 避免预加载所有模块
```

3. **缓存检测结果**:

```typescript
let cachedDeviceInfo: DeviceInfo | null = null

function getDeviceInfo(): DeviceInfo {
  if (!cachedDeviceInfo) {
    cachedDeviceInfo = detector.getDeviceInfo()
  }
  return cachedDeviceInfo
}
```

### Q: 为什么页面加载时有短暂的闪烁？

A: 这通常是因为初始渲染和设备检测的时序问题：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { onMounted, ref } from 'vue'

const { deviceType } = useDevice()
const isReady = ref(false)

onMounted(() => {
  // 确保设备检测完成后再显示内容
  isReady.value = true
})
</script>

<template>
  <div v-if="isReady">
    <div v-device-mobile>移动端内容</div>
    <div v-device-desktop>桌面端内容</div>
  </div>
  <div v-else>
    <!-- 加载状态 -->
    <div class="loading">检测设备中...</div>
  </div>
</template>
```

## 错误处理

### Q: 如何处理模块加载失败？

A: 使用 try-catch 包装模块加载：

```typescript
async function loadModuleSafely<T>(name: string): Promise<T | null> {
  try {
    return await detector.loadModule<T>(name)
  } catch (error) {
    console.warn(`模块 ${name} 加载失败:`, error)
    return null
  }
}

// 使用
const networkModule = await loadModuleSafely<NetworkModule>('network')
if (networkModule) {
  const networkInfo = networkModule.getData()
}
```

### Q: 如何处理权限被拒绝的情况？

A: 针对不同的权限错误提供相应的处理：

```typescript
async function requestLocation() {
  try {
    const geolocationModule = await detector.loadModule('geolocation')
    return await geolocationModule.getCurrentPosition()
  } catch (error) {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        showMessage('需要位置权限才能使用此功能')
        break
      case 2: // POSITION_UNAVAILABLE
        showMessage('无法获取位置信息')
        break
      case 3: // TIMEOUT
        showMessage('获取位置超时，请重试')
        break
      default:
        showMessage('位置获取失败')
    }
    return null
  }
}
```

## 兼容性问题

### Q: 如何在旧版浏览器中使用？

A: 库会自动降级，但你也可以提供 polyfill：

```html
<!-- 为旧版浏览器添加 polyfill -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6,es2017,es2018"></script>
```

```typescript
// 检测功能支持并提供降级
function getDeviceTypeWithFallback(): DeviceType {
  try {
    return detector.getDeviceInfo().type
  } catch (error) {
    // 降级到简单的用户代理检测
    const ua = navigator.userAgent
    if (/Mobile|Android|iPhone|iPad/.test(ua)) {
      return 'mobile'
    }
    return 'desktop'
  }
}
```

### Q: 在 Nuxt.js 中如何使用？

A: 创建插件并正确处理 SSR：

```typescript
// plugins/device.client.ts
import { DevicePlugin } from '@ldesign/device/vue'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(DevicePlugin)
})
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <ClientOnly>
      <div v-device-mobile>移动端内容</div>
      <div v-device-desktop>桌面端内容</div>
      <template #fallback>
        <div>加载中...</div>
      </template>
    </ClientOnly>
  </div>
</template>
```

## 调试问题

### Q: 如何调试设备检测问题？

A: 启用调试模式并查看详细信息：

```typescript
// 开发环境下启用详细日志
const detector = new DeviceDetector()

// 监听所有事件
detector.on('deviceChange', info => {
  console.log('设备变化:', info)
})

detector.on('orientationChange', orientation => {
  console.log('方向变化:', orientation)
})

// 查看当前设备信息
console.table(detector.getDeviceInfo())

// 查看已加载的模块
console.log('已加载模块:', detector.getLoadedModules())
```

### Q: 如何测试不同的设备环境？

A: 使用浏览器开发者工具：

1. **Chrome DevTools**:

   - 打开开发者工具
   - 点击设备模拟按钮
   - 选择不同的设备预设

2. **手动模拟**:

```typescript
// 模拟移动设备
Object.defineProperty(window, 'innerWidth', { value: 375 })
Object.defineProperty(window, 'innerHeight', { value: 667 })
detector.refresh()

// 模拟方向变化
window.dispatchEvent(new Event('orientationchange'))
```

## 获取帮助

如果以上问题没有解决你的疑问，可以通过以下方式获取帮助：

- 📖 查看[完整文档](../api/)
- 🐛 提交 [GitHub Issue](https://github.com/ldesign-org/device/issues)
- 💬 参与 [GitHub Discussions](https://github.com/ldesign-org/device/discussions)
- 📧 发送邮件至 support@ldesign.org

我们会尽快回复并帮助解决问题！
