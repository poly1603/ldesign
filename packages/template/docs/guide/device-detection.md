# 设备检测

LDesign Template 提供了强大的设备检测功能，能够自动识别用户的设备类型并选择合适的模板。

## 设备类型

系统支持三种设备类型：

- **desktop**: 桌面端（>= 1024px）
- **tablet**: 平板端（768px - 1023px）
- **mobile**: 移动端（< 768px）

## 检测方式

### 1. 视口检测（默认）

基于浏览器视口宽度进行检测，这是最准确的方式：

```typescript
import { detectDeviceByViewport } from '@ldesign/template'

const device = detectDeviceByViewport()
console.log('当前设备:', device)
```

### 2. User Agent 检测

基于浏览器 User Agent 字符串进行检测：

```typescript
import { detectDeviceByUserAgent } from '@ldesign/template'

const device = detectDeviceByUserAgent()
console.log('检测到的设备:', device)
```

### 3. 综合检测

结合视口和 User Agent 进行检测：

```typescript
import { detectDevice } from '@ldesign/template'

const device = detectDevice()
console.log('设备类型:', device)
```

## 自动检测配置

在模板管理器中启用自动设备检测：

```typescript
const manager = new TemplateManager({
  autoDetectDevice: true,
  deviceBreakpoints: {
    mobile: 767,
    tablet: 1023
  }
})
```

## 设备变化监听

监听设备类型变化（如屏幕旋转、窗口缩放）：

```typescript
import { createDeviceWatcher } from '@ldesign/template'

const cleanup = createDeviceWatcher((newDevice, oldDevice) => {
  console.log(`设备从 ${oldDevice} 切换到 ${newDevice}`)

  // 可以在这里重新加载模板
  templateManager.setDevice(newDevice)
})

// 在组件卸载时清理
onUnmounted(() => {
  cleanup()
})
```

## 自定义断点

可以自定义设备检测的断点：

```typescript
const customBreakpoints = {
  mobile: 600, // 移动端最大宽度
  tablet: 900 // 平板端最大宽度
}

const manager = new TemplateManager({
  deviceBreakpoints: customBreakpoints
})
```

## 手动设备设置

也可以手动设置设备类型：

```typescript
// 设置设备类型
manager.setDevice('mobile')

// 获取当前设备类型
const currentDevice = manager.getCurrentDevice()
```

## 在组件中使用

```vue
<script setup lang="ts">
import { createDeviceWatcher, detectDevice } from '@ldesign/template'
import { onMounted, onUnmounted, ref } from 'vue'

const currentDevice = ref(detectDevice())

let deviceWatcher: (() => void) | null = null

onMounted(() => {
  deviceWatcher = createDeviceWatcher((newDevice) => {
    currentDevice.value = newDevice
  })
})

onUnmounted(() => {
  deviceWatcher?.()
})

const dashboardProps = {
  title: '响应式仪表板'
}
</script>

<template>
  <div class="responsive-container">
    <div class="device-info">
      当前设备: {{ currentDevice }}
    </div>

    <!-- 根据设备自动选择模板 -->
    <LTemplateRenderer
      category="dashboard"
      template="admin"
      :template-props="dashboardProps"
    />
  </div>
</template>
```

## 最佳实践

1. **优先使用视口检测**：比 User Agent 更准确
2. **监听设备变化**：提供更好的用户体验
3. **合理设置断点**：根据应用需求调整
4. **提供备用方案**：确保在检测失败时有默认行为
