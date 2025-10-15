# 网络模块

网络模块提供网络状态检测和监控功能，帮助你根据网络状况优化应用体验。

## 加载模块

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()
const networkModule = await detector.loadModule('network')
```

## 获取网络信息

```typescript
const networkInfo = networkModule.getData()

console.log(networkInfo)
// {
//  status: 'online',      // 连接状态
//  type: 'wifi',        // 连接类型
//  online: true,        // 是否在线
//  effectiveType: '4g',    // 有效连接类型
//  downlink: 10,        // 下载速度 (Mbps)
//  rtt: 50,           // 往返时间 (ms)
//  saveData: false,      // 省流量模式
//  supported: true       // 是否支持 Network API
// }
```

## NetworkInfo 接口

| 属性 | 类型 | 说明 |
|--------|--------|--------|
| `status` | `'online' \| 'offline'` | 连接状态 |
| `type` | `NetworkType` | 连接类型 |
| `online` | `boolean` | 是否在线 |
| `effectiveType` | `string` | 有效连接类型（'slow-2g', '2g', '3g', '4g', '5g'） |
| `downlink` | `number` | 估计的下载速度（Mbps） |
| `rtt` | `number` | 估计的往返时间（毫秒） |
| `saveData` | `boolean` | 是否启用省流量模式 |
| `supported` | `boolean` | 浏览器是否支持 Network Information API |

## NetworkType 类型

- `wifi` - WiFi 网络
- `cellular` - 蜂窝网络（2G/3G/4G/5G）
- `ethernet` - 有线网络
- `bluetooth` - 蓝牙
- `unknown` - 未知类型

## API 方法

### getData()

获取完整的网络信息对象。

```typescript
const networkInfo = networkModule.getData()
```

### getStatus()

获取连接状态。

```typescript
const status = networkModule.getStatus()
console.log(status) // 'online' 或 'offline'
```

### getConnectionType()

获取连接类型。

```typescript
const type = networkModule.getConnectionType()
console.log(type) // 'wifi', 'cellular', 'ethernet' 等
```

### isOnline()

检查是否在线。

```typescript
if (networkModule.isOnline()) {
 console.log('网络已连接')
 loadOnlineContent()
}
```

### isOffline()

检查是否离线。

```typescript
if (networkModule.isOffline()) {
 console.log('网络已断开')
 showOfflineMessage()
}
```

### getDownlink()

获取估计的下载速度（Mbps）。

```typescript
const downlink = networkModule.getDownlink()
console.log('下载速度:', downlink, 'Mbps')
```

### getRTT()

获取估计的往返时间（毫秒）。

```typescript
const rtt = networkModule.getRTT()
console.log('往返时间:', rtt, 'ms')
```

### isSaveData()

检查是否启用省流量模式。

```typescript
if (networkModule.isSaveData()) {
 console.log('用户启用了省流量模式')
 loadLowQualityImages()
}
```

## 监听网络变化

```typescript
detector.on('networkChange', (networkInfo) => {
 console.log('网络状态变化:', networkInfo)

 if (networkInfo.status === 'offline') {
  showOfflineNotification()
 } else if (networkInfo.status === 'online') {
  hideOfflineNotification()
  syncData()
 }
})
```

## 实际应用场景

### 自适应媒体加载

根据网络状况加载不同质量的媒体资源：

```typescript
const networkModule = await detector.loadModule('network')

function getMediaQuality() {
 const networkInfo = networkModule.getData()

 // 离线状态
 if (networkInfo.status === 'offline') {
  return 'cached'
 }

 // 省流量模式
 if (networkInfo.saveData) {
  return 'low'
 }

 // 根据网络类型
 switch (networkInfo.effectiveType) {
  case 'slow-2g':
  case '2g':
   return 'low'
  case '3g':
   return 'medium'
  case '4g':
  case '5g':
   return networkInfo.downlink > 5 ? 'high' : 'medium'
  default:
   return 'medium'
 }
}

// 应用媒体质量
const quality = getMediaQuality()
imageLoader.setQuality(quality)
videoPlayer.setQuality(quality === 'high' ? '1080p' : quality === 'medium' ? '720p' : '360p')
```

### 离线模式

在离线时自动切换到离线模式：

```typescript
const networkModule = await detector.loadModule('network')

// 初始状态检查
if (networkModule.isOffline()) {
 app.enableOfflineMode()
}

// 监听网络变化
detector.on('networkChange', (info) => {
 if (info.status === 'offline') {
  // 切换到离线模式
  app.enableOfflineMode()
  app.showNotification('已离线，部分功能不可用')

  // 暂停后台同步
  app.pauseBackgroundSync()
 } else {
  // 恢复在线模式
  app.disableOfflineMode()
  app.showNotification('网络已恢复')

  // 恢复后台同步
  app.resumeBackgroundSync()

  // 同步离线数据
  app.syncOfflineData()
 }
})
```

### 智能预加载

根据网络速度决定是否预加载：

```typescript
const networkModule = await detector.loadModule('network')

function shouldPreload() {
 const info = networkModule.getData()

 // 离线或省流量模式：不预加载
 if (info.status === 'offline' || info.saveData) {
  return false
 }

 // 低速网络：不预加载
 if (['slow-2g', '2g'].includes(info.effectiveType)) {
  return false
 }

 // 中速网络：适度预加载
 if (info.effectiveType === '3g') {
  return 'moderate'
 }

 // 高速网络：积极预加载
 return 'aggressive'
}

// 应用预加载策略
const preloadStrategy = shouldPreload()
if (preloadStrategy === 'aggressive') {
 preloadNextPage()
 preloadImages()
 preloadFonts()
} else if (preloadStrategy === 'moderate') {
 preloadCriticalResources()
}
```

### 自动重连

网络恢复时自动重连：

```typescript
const networkModule = await detector.loadModule('network')
let reconnectTimer = null

detector.on('networkChange', (info) => {
 if (info.status === 'online') {
  // 清除重连定时器
  if (reconnectTimer) {
   clearTimeout(reconnectTimer)
   reconnectTimer = null
  }

  // 立即尝试重连
  websocket.reconnect()
 } else {
  // 离线时设置重连定时器
  reconnectTimer = setTimeout(() => {
   if (networkModule.isOnline()) {
    websocket.reconnect()
   }
  }, 5000)
 }
})
```

## Vue 3 集成

### 使用 useNetwork Composable

```vue
<script setup>
import { useNetwork } from '@ldesign/device/vue'
import { computed, onMounted } from 'vue'

const {
 networkInfo,
 isOnline,
 connectionType,
 isLoaded,
 loadModule
} = useNetwork()

// 加载网络模块
onMounted(() => {
 loadModule()
})

// 计算网络质量
const networkQuality = computed(() => {
 if (!isLoaded.value || !networkInfo.value) return 'unknown'

 const info = networkInfo.value
 if (info.effectiveType === '4g' || info.effectiveType === '5g') {
  return 'excellent'
 } else if (info.effectiveType === '3g') {
  return 'good'
 } else {
  return 'poor'
 }
})

// 显示速度
const speedDisplay = computed(() => {
 if (!networkInfo.value || !networkInfo.value.downlink) return '-'
 return `${networkInfo.value.downlink.toFixed(1)} Mbps`
})
</script>

<template>
 <div class="network-status">
  <!-- 在线状态 -->
  <div :class="['status-indicator', isOnline ? 'online' : 'offline']">
   {{ isOnline ? '在线' : '离线' }}
  </div>

  <!-- 网络信息 -->
  <div v-if="isLoaded && isOnline">
   <p>连接类型: {{ connectionType }}</p>
   <p>网络质量: {{ networkQuality }}</p>
   <p>下载速度: {{ speedDisplay }}</p>

   <!-- 省流量模式提示 -->
   <div v-if="networkInfo.saveData" class="save-data-notice">
    <span>⚠️</span>
    <span>省流量模式已启用</span>
   </div>
  </div>

  <!-- 离线提示 -->
  <div v-else-if="!isOnline" class="offline-notice">
   <p>网络连接已断开</p>
   <p>部分功能可能不可用</p>
  </div>
 </div>
</template>

<style scoped>
.status-indicator {
 display: inline-block;
 padding: 4px 12px;
 border-radius: 4px;
 font-weight: bold;
}

.status-indicator.online {
 background: #4caf50;
 color: white;
}

.status-indicator.offline {
 background: #f44336;
 color: white;
}

.save-data-notice {
 display: flex;
 align-items: center;
 gap: 8px;
 padding: 8px;
 background: #fff3cd;
 border-radius: 4px;
 margin-top: 8px;
}

.offline-notice {
 padding: 16px;
 background: #ffebee;
 border-radius: 4px;
 color: #c62828;
}
</style>
```

### 网络状态组件

创建一个可复用的网络状态组件：

```vue
<!-- NetworkStatusBanner.vue -->
<script setup>
import { useNetwork } from '@ldesign/device/vue'
import { onMounted } from 'vue'

const { isOnline, networkInfo, loadModule } = useNetwork()

onMounted(() => {
 loadModule()
})
</script>

<template>
 <!-- 离线横幅 -->
 <div v-if="!isOnline" class="network-banner offline">
  <span>🔌</span>
  <span>网络连接已断开</span>
 </div>

 <!-- 慢速网络提示 -->
 <div
  v-else-if="networkInfo && ['slow-2g', '2g'].includes(networkInfo.effectiveType)"
  class="network-banner slow"
 >
  <span>🐌</span>
  <span>网络速度较慢，建议切换到 WiFi</span>
 </div>

 <!-- 省流量模式提示 -->
 <div
  v-else-if="networkInfo && networkInfo.saveData"
  class="network-banner save-data"
 >
  <span>💾</span>
  <span>省流量模式已启用</span>
 </div>
</template>

<style scoped>
.network-banner {
 display: flex;
 align-items: center;
 gap: 8px;
 padding: 12px;
 font-size: 14px;
}

.network-banner.offline {
 background: #ffebee;
 color: #c62828;
}

.network-banner.slow {
 background: #fff3cd;
 color: #856404;
}

.network-banner.save-data {
 background: #e3f2fd;
 color: #1565c0;
}
</style>
```

## 浏览器兼容性

| 浏览器 | 版本 | 支持程度 |
|----------|--------|------------|
| Chrome | 61+ | 完全支持 |
| Firefox | 31+ | 部分支持（无 downlink/rtt） |
| Safari | 17+ | 部分支持 |
| Edge | 79+ | 完全支持 |

对于不支持 Network Information API 的浏览器，模块会提供基础的在线/离线检测。

```typescript
const networkInfo = networkModule.getData()

if (!networkInfo.supported) {
 console.log('浏览器不支持 Network Information API')
 // 只有基础的 online/offline 状态
}
```

## 最佳实践

1. **优雅降级**：始终检查 API 支持情况
2. **节流处理**：避免过于频繁地检查网络状态
3. **用户体验**：及时提示用户网络状态变化
4. **资源优化**：根据网络状况调整资源加载策略
5. **离线支持**：为离线场景提供基本功能

## 下一步

- [电池模块](./battery-module.md) - 了解电池监控功能
- [地理位置模块](./geolocation-module.md) - 了解定位功能
- [最佳实践](./best-practices.md) - 学习最佳实践
