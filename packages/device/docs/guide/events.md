# 事件系统

@ldesign/device 提供了完善的事件系统，让你可以实时响应设备状态的变化。

## 事件类型

DeviceDetector 支持以下事件类型：

| 事件名 | 触发时机 | 事件数据 |
|--------|----------|----------|
| `deviceChange` | 设备类型发生变化 | `DeviceInfo` |
| `orientationChange` | 屏幕方向发生变化 | `Orientation` |
| `resize` | 窗口大小发生变化 | `{ width, height }` |
| `networkChange` | 网络状态发生变化 | `NetworkInfo` |
| `batteryChange` | 电池状态发生变化 | `BatteryInfo` |
| `positionChange` | 地理位置发生变化 | `GeolocationInfo` |

## 监听事件

使用 `on` 方法添加事件监听器：

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()

// 监听设备变化
detector.on('deviceChange', (deviceInfo) => {
 console.log('设备类型变化:', deviceInfo.type)
 console.log('完整设备信息:', deviceInfo)
})

// 监听屏幕方向变化
detector.on('orientationChange', (orientation) => {
 console.log('屏幕方向变化:', orientation) // 'portrait' 或 'landscape'
})

// 监听窗口大小变化
detector.on('resize', ({ width, height }) => {
 console.log('窗口大小变化:', width, 'x', height)
})
```

## 移除事件监听

使用 `off` 方法移除事件监听器：

```typescript
// 定义处理函数
const handleDeviceChange = (deviceInfo) => {
 console.log('设备变化:', deviceInfo.type)
}

// 添加监听
detector.on('deviceChange', handleDeviceChange)

// 移除监听
detector.off('deviceChange', handleDeviceChange)
```

注意：必须传入相同的函数引用才能正确移除监听器。

```typescript
// 错误示例：无法移除
detector.on('deviceChange', (info) => console.log(info))
detector.off('deviceChange', (info) => console.log(info)) // 无效，因为是不同的函数

// 正确示例：可以移除
const handler = (info) => console.log(info)
detector.on('deviceChange', handler)
detector.off('deviceChange', handler) // 有效
```

## 一次性监听

使用 `once` 方法添加只触发一次的监听器：

```typescript
// 只在首次设备变化时触发
detector.once('deviceChange', (deviceInfo) => {
 console.log('首次设备变化:', deviceInfo.type)
})
```

## 移除所有监听

```typescript
// 移除特定事件的所有监听器
detector.off('deviceChange')

// 移除所有事件的所有监听器
detector.removeAllListeners()
```

## 事件详解

### deviceChange 事件

当设备类型发生变化时触发，例如：
- 窗口从 1000px 缩小到 700px（桌面 → 移动）
- 窗口从 800px 放大到 1200px（平板 → 桌面）

```typescript
detector.on('deviceChange', (deviceInfo) => {
 console.log('新的设备类型:', deviceInfo.type)
 console.log('屏幕尺寸:', deviceInfo.width, 'x', deviceInfo.height)

 // 根据设备类型执行不同逻辑
 switch (deviceInfo.type) {
  case 'mobile':
   loadMobileResources()
   break
  case 'tablet':
   loadTabletResources()
   break
  case 'desktop':
   loadDesktopResources()
   break
 }
})
```

### orientationChange 事件

当屏幕方向发生变化时触发：

```typescript
detector.on('orientationChange', (orientation) => {
 console.log('新的屏幕方向:', orientation)

 if (orientation === 'landscape') {
  // 横屏模式
  enableLandscapeLayout()
  showFullScreenVideo()
 } else {
  // 竖屏模式
  enablePortraitLayout()
  exitFullScreen()
 }
})
```

### resize 事件

当窗口大小发生变化时触发：

```typescript
detector.on('resize', ({ width, height }) => {
 console.log('窗口大小:', width, 'x', height)

 // 根据窗口大小调整布局
 if (width < 768) {
  setColumns(1)
 } else if (width < 1024) {
  setColumns(2)
 } else {
  setColumns(3)
 }

 // 调整字体大小
 const fontSize = Math.max(12, Math.min(18, width / 60))
 document.body.style.fontSize = `${fontSize}px`
})
```

### networkChange 事件

当网络状态发生变化时触发（需要加载 network 模块）：

```typescript
// 加载网络模块
const networkModule = await detector.loadModule('network')

detector.on('networkChange', (networkInfo) => {
 console.log('网络状态:', networkInfo.status) // 'online' 或 'offline'
 console.log('连接类型:', networkInfo.type)  // 'wifi', 'cellular' 等

 if (networkInfo.status === 'offline') {
  // 离线模式
  showOfflineNotification()
  enableOfflineMode()
 } else if (networkInfo.type === 'cellular' && networkInfo.saveData) {
  // 移动网络且启用了省流量模式
  loadLowQualityImages()
  disableAutoPlay()
 } else {
  // 在线模式，正常加载
  loadHighQualityImages()
  enableAutoPlay()
 }
})
```

### batteryChange 事件

当电池状态发生变化时触发（需要加载 battery 模块）：

```typescript
// 加载电池模块
const batteryModule = await detector.loadModule('battery')

detector.on('batteryChange', (batteryInfo) => {
 console.log('电池电量:', Math.round(batteryInfo.level * 100) + '%')
 console.log('充电状态:', batteryInfo.charging)

 // 低电量且未充电时启用省电模式
 if (batteryInfo.level < 0.2 && !batteryInfo.charging) {
  enablePowerSavingMode()
  showLowBatteryWarning()
 }

 // 充电中且电量充足时恢复正常模式
 if (batteryInfo.charging && batteryInfo.level > 0.8) {
  disablePowerSavingMode()
 }
})
```

### positionChange 事件

当地理位置发生变化时触发（需要加载 geolocation 模块）：

```typescript
// 加载地理位置模块
const geoModule = await detector.loadModule('geolocation')

// 开始监听位置变化
await geoModule.startWatching()

detector.on('positionChange', (position) => {
 console.log('纬度:', position.latitude)
 console.log('经度:', position.longitude)
 console.log('精度:', position.accuracy, '米')

 // 更新地图位置
 updateMapCenter(position.latitude, position.longitude)

 // 检查是否进入特定区域
 if (isInTargetArea(position)) {
  showLocationBasedContent()
 }
})
```

## 事件防抖

为了避免频繁触发事件影响性能，检测器会自动对事件进行防抖处理：

```typescript
const detector = new DeviceDetector({
 debounceDelay: 300 // 300ms 防抖延迟
})

// 在 300ms 内的多次变化只会触发一次事件
detector.on('resize', ({ width, height }) => {
 console.log('防抖后的 resize 事件')
})
```

你可以根据需要调整防抖延迟，详见 [配置选项](./configuration.md#debouncedelay)。

## Vue 3 响应式

在 Vue 组件中，设备信息会自动保持响应式：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { watch } from 'vue'

const { deviceType, orientation, deviceInfo } = useDevice()

// 使用 watch 监听变化
watch(deviceType, (newType, oldType) => {
 console.log('设备类型变化:', oldType, '→', newType)

 // 执行相应操作
 if (newType === 'mobile') {
  loadMobileAssets()
 }
})

watch(orientation, (newOrientation) => {
 console.log('方向变化:', newOrientation)
})

// 监听多个值
watch([deviceType, orientation], ([type, ori]) => {
 console.log('设备状态:', type, ori)
})
</script>

<template>
 <div>
  <!-- 响应式显示设备信息 -->
  <p>设备类型: {{ deviceType }}</p>
  <p>屏幕方向: {{ orientation }}</p>

  <!-- 自动响应变化 -->
  <div :class="`device-${deviceType}`">
   内容会根据设备类型自动应用不同样式
  </div>
 </div>
</template>
```

## 实际应用示例

### 响应式布局切换

```typescript
const detector = new DeviceDetector()

// 监听设备变化，动态调整布局
detector.on('deviceChange', (deviceInfo) => {
 const layouts = {
  mobile: {
   columns: 1,
   spacing: 8,
   fontSize: 14
  },
  tablet: {
   columns: 2,
   spacing: 12,
   fontSize: 16
  },
  desktop: {
   columns: 3,
   spacing: 16,
   fontSize: 18
  }
 }

 const layout = layouts[deviceInfo.type]
 applyLayout(layout)
})
```

### 网络状态自适应

```typescript
const detector = new DeviceDetector()
const networkModule = await detector.loadModule('network')

detector.on('networkChange', (networkInfo) => {
 // 离线时启用缓存模式
 if (networkInfo.status === 'offline') {
  app.enableOfflineMode()
  app.showMessage('当前离线，部分功能受限')
 }

 // 低速网络时降低资源质量
 if (networkInfo.type === 'cellular' || networkInfo.saveData) {
  app.setImageQuality('low')
  app.setVideoQuality('360p')
  app.disableAutoPlay()
 } else {
  app.setImageQuality('high')
  app.setVideoQuality('1080p')
  app.enableAutoPlay()
 }
})
```

### 省电模式

```typescript
const detector = new DeviceDetector()
const batteryModule = await detector.loadModule('battery')

detector.on('batteryChange', (batteryInfo) => {
 const level = batteryInfo.level
 const charging = batteryInfo.charging

 // 低电量未充电：激进省电
 if (level < 0.1 && !charging) {
  app.disableAnimations()
  app.reduceRefreshRate()
  app.suspendBackgroundTasks()
 }
 // 中等电量未充电：适度省电
 else if (level < 0.2 && !charging) {
  app.simplifyAnimations()
  app.pauseBackgroundSync()
 }
 // 充电中或电量充足：正常模式
 else {
  app.enableAnimations()
  app.normalRefreshRate()
  app.resumeBackgroundTasks()
 }
})
```

### 位置感知服务

```typescript
const detector = new DeviceDetector()
const geoModule = await detector.loadModule('geolocation')

// 开始监听位置
await geoModule.startWatching()

detector.on('positionChange', (position) => {
 // 更新用户位置
 app.updateUserLocation(position)

 // 查找附近的商店
 const nearbyStores = app.findNearbyStores(
  position.latitude,
  position.longitude,
  5000 // 5km 范围内
 )

 // 显示附近商店
 if (nearbyStores.length > 0) {
  app.showNearbyStores(nearbyStores)
 }
})
```

## 错误处理

```typescript
// 监听错误事件
detector.on('error', (error) => {
 console.error('设备检测错误:', error)

 // 错误恢复策略
 if (error.count >= 5) {
  // 错误过多，禁用自动检测
  detector.destroy()
  fallbackToStaticDetection()
 }
})
```

## 清理资源

在不需要时记得清理资源：

```typescript
// 移除所有监听器
detector.removeAllListeners()

// 销毁检测器
await detector.destroy()
```

在 Vue 组件中，`useDevice` 会自动处理清理：

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { onUnmounted } from 'vue'

const { deviceType } = useDevice()

// 组件卸载时会自动清理资源
// 无需手动调用 destroy
</script>
```

## 下一步

- [模块系统](./modules.md) - 了解扩展模块的使用
- [最佳实践](./best-practices.md) - 学习最佳实践
- [性能优化](./performance.md) - 优化性能技巧
