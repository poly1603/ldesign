# 模块系统

@ldesign/device 采用模块化设计，核心功能保持轻量，扩展功能按需加载。这种设计确保了你只为实际使用的功能付出性能成本。

## 可用模块

| 模块名 | 功能 | 大小 | 浏览器支持 |
|----------|--------|--------|--------------|
| `network` | 网络状态检测 | ~2KB | Chrome 60+, Firefox 55+ |
| `battery` | 电池信息监控 | ~1.5KB | Chrome 38+, Firefox 43+(部分) |
| `geolocation` | 地理位置获取 | ~2KB | All modern browsers |

## 加载模块

使用 `loadModule` 方法动态加载模块：

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()

// 加载单个模块
const networkModule = await detector.loadModule('network')
const batteryModule = await detector.loadModule('battery')
const geoModule = await detector.loadModule('geolocation')

// 批量加载多个模块
const [network, battery, geo] = await Promise.all([
 detector.loadModule('network'),
 detector.loadModule('battery'),
 detector.loadModule('geolocation')
])
```

## 检查模块状态

```typescript
// 检查模块是否已加载
if (detector.isModuleLoaded('network')) {
 console.log('网络模块已加载')
}

// 获取已加载的模块列表
const loadedModules = detector.getLoadedModules()
console.log('已加载的模块:', loadedModules) // ['network', 'battery']
```

## 卸载模块

不再需要时可以卸载模块以释放资源：

```typescript
// 卸载单个模块
await detector.unloadModule('network')

// 卸载所有模块
await detector.destroy() // 会自动卸载所有模块
```

## 模块使用示例

### 网络模块

```typescript
// 加载网络模块
const networkModule = await detector.loadModule('network')

// 获取网络信息
const networkInfo = networkModule.getData()
console.log('网络状态:', networkInfo)
// {
//  status: 'online',
//  type: 'wifi',
//  online: true,
//  effectiveType: '4g',
//  downlink: 10,   // 下载速度 (Mbps)
//  rtt: 50,      // 往返时间 (ms)
//  saveData: false  // 省流量模式
// }

// 快捷方法
console.log('是否在线:', networkModule.isOnline())
console.log('连接类型:', networkModule.getConnectionType())
console.log('下载速度:', networkModule.getDownlink(), 'Mbps')

// 监听网络变化
detector.on('networkChange', (info) => {
 console.log('网络状态变化:', info)
})
```

更多信息请参考 [网络模块详解](./network-module.md)。

### 电池模块

```typescript
// 加载电池模块
const batteryModule = await detector.loadModule('battery')

// 获取电池信息
const batteryInfo = batteryModule.getData()
console.log('电池信息:', batteryInfo)
// {
//  level: 0.8,          // 电量 0-1
//  charging: false,        // 是否充电
//  chargingTime: Infinity,    // 充电时间 (秒)
//  dischargingTime: 7200     // 放电时间 (秒)
// }

// 快捷方法
console.log('电池电量:', batteryModule.getLevelPercentage(), '%')
console.log('是否充电:', batteryModule.isCharging())
console.log('电池状态:', batteryModule.getBatteryStatus()) // 'low' | 'normal' | 'high' | 'charging'

// 监听电池变化
detector.on('batteryChange', (info) => {
 console.log('电池状态变化:', info)
})
```

更多信息请参考 [电池模块详解](./battery-module.md)。

### 地理位置模块

```typescript
// 加载地理位置模块
const geoModule = await detector.loadModule('geolocation')

// 检查支持情况
if (geoModule.isSupported()) {
 // 获取当前位置
 const position = await geoModule.getCurrentPosition()
 console.log('当前位置:', position)
 // {
 //  latitude: 39.9042,
 //  longitude: 116.4074,
 //  accuracy: 10,
 //  altitude: null,
 //  heading: null,
 //  speed: null,
 //  timestamp: 1634567890123
 // }

 // 监听位置变化
 const watchId = await geoModule.startWatching()
 detector.on('positionChange', (position) => {
  console.log('位置更新:', position)
 })

 // 停止监听
 await geoModule.stopWatching()
}
```

更多信息请参考 [地理位置模块详解](./geolocation-module.md)。

## 错误处理

模块加载可能会失败（例如浏览器不支持），建议添加错误处理：

```typescript
try {
 const batteryModule = await detector.loadModule('battery')
 // 使用电池模块
} catch (error) {
 console.warn('电池模块不可用:', error.message)
 // 提供降级方案
 showBatteryNotSupported()
}
```

## 条件加载

根据需要条件加载模块：

```typescript
// 只在移动设备加载电池模块
if (detector.isMobile()) {
 const batteryModule = await detector.loadModule('battery')
}

// 只在需要时加载地理位置模块
if (needsLocation) {
 const geoModule = await detector.loadModule('geolocation')
}
```

## Vue 3 集成

在 Vue 组件中使用模块：

### 使用 Composables

```vue
<script setup>
import { useNetwork, useBattery, useGeolocation } from '@ldesign/device/vue'
import { onMounted } from 'vue'

// 网络模块
const {
 networkInfo,
 isOnline,
 connectionType,
 isLoaded: networkLoaded,
 loadModule: loadNetwork
} = useNetwork()

// 电池模块
const {
 batteryInfo,
 batteryLevel,
 isCharging,
 isLoaded: batteryLoaded,
 loadModule: loadBattery
} = useBattery()

// 地理位置模块
const {
 position,
 latitude,
 longitude,
 getCurrentPosition,
 startWatching,
 stopWatching
} = useGeolocation()

// 组件挂载时加载模块
onMounted(async () => {
 // 加载网络模块
 await loadNetwork()

 // 加载电池模块
 try {
  await loadBattery()
 } catch (error) {
  console.warn('电池模块不可用')
 }

 // 获取位置
 try {
  await getCurrentPosition()
 } catch (error) {
  console.warn('无法获取位置')
 }
})
</script>

<template>
 <div>
  <!-- 网络状态 -->
  <div v-if="networkLoaded">
   <p>网络状态: {{ isOnline ? '在线' : '离线' }}</p>
   <p>连接类型: {{ connectionType }}</p>
  </div>

  <!-- 电池状态 -->
  <div v-if="batteryLoaded">
   <p>电池电量: {{ Math.round(batteryLevel * 100) }}%</p>
   <p>充电状态: {{ isCharging ? '充电中' : '未充电' }}</p>
  </div>

  <!-- 位置信息 -->
  <div v-if="position">
   <p>纬度: {{ latitude.toFixed(6) }}</p>
   <p>经度: {{ longitude.toFixed(6) }}</p>
  </div>
 </div>
</template>
```

### 手动加载

```vue
<script setup>
import { ref } from 'vue'
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()
const networkInfo = ref(null)

const loadNetworkModule = async () => {
 try {
  const module = await detector.loadModule('network')
  networkInfo.value = module.getData()
 } catch (error) {
  console.error('加载失败:', error)
 }
}
</script>

<template>
 <div>
  <button @click="loadNetworkModule">加载网络模块</button>
  <div v-if="networkInfo">
   <p>网络信息: {{ networkInfo }}</p>
  </div>
 </div>
</template>
```

## 性能考虑

### 懒加载

只在需要时加载模块：

```typescript
// 不要在初始化时加载所有模块
// ❌ 不推荐
const detector = new DeviceDetector()
await detector.loadModule('network')
await detector.loadModule('battery')
await detector.loadModule('geolocation')

// ✅ 推荐：按需加载
const detector = new DeviceDetector()

// 只在需要时加载
document.getElementById('showNetworkBtn').addEventListener('click', async () => {
 const networkModule = await detector.loadModule('network')
 // 使用网络模块
})
```

### 缓存模块实例

避免重复加载：

```typescript
let networkModule = null

async function getNetworkModule() {
 if (!networkModule) {
  networkModule = await detector.loadModule('network')
 }
 return networkModule
}

// 使用缓存的模块
const module = await getNetworkModule()
```

### 及时卸载

不再使用时卸载模块：

```typescript
// 使用完毕后卸载
const geoModule = await detector.loadModule('geolocation')
const position = await geoModule.getCurrentPosition()
await detector.unloadModule('geolocation') // 释放资源
```

## 模块生命周期

```typescript
// 1. 加载模块
const networkModule = await detector.loadModule('network')

// 2. 初始化（自动完成）
// 模块加载时会自动调用 init() 方法

// 3. 使用模块
const info = networkModule.getData()

// 4. 卸载模块
await detector.unloadModule('network')
// 会自动调用 destroy() 方法清理资源
```

## 实际应用场景

### 自适应媒体质量

根据网络状态自动调整媒体质量：

```typescript
const networkModule = await detector.loadModule('network')

detector.on('networkChange', (info) => {
 if (info.type === 'cellular' || info.saveData) {
  // 移动网络或省流量模式：使用低质量
  videoPlayer.setQuality('360p')
  imageLoader.setQuality('low')
 } else if (info.downlink > 5) {
  // 高速网络：使用高质量
  videoPlayer.setQuality('1080p')
  imageLoader.setQuality('high')
 } else {
  // 中速网络：使用中等质量
  videoPlayer.setQuality('720p')
  imageLoader.setQuality('medium')
 }
})
```

### 智能省电模式

根据电池状态自动调整性能：

```typescript
const batteryModule = await detector.loadModule('battery')

detector.on('batteryChange', (info) => {
 if (info.level < 0.2 && !info.charging) {
  // 启用激进省电模式
  app.disableAnimations()
  app.reduceBackgroundActivity()
  app.lowerFrameRate()
 } else if (info.level < 0.5 && !info.charging) {
  // 启用适度省电模式
  app.simplifyAnimations()
  app.pauseBackgroundSync()
 } else {
  // 正常模式
  app.enableAllFeatures()
 }
})
```

### 位置服务

基于地理位置提供个性化内容：

```typescript
const geoModule = await detector.loadModule('geolocation')

const position = await geoModule.getCurrentPosition()

// 根据位置显示本地内容
const localContent = await api.getLocalContent(
 position.latitude,
 position.longitude
)

// 持续跟踪位置
await geoModule.startWatching()
detector.on('positionChange', (position) => {
 updateMap(position)
 checkNearbyPOI(position)
})
```

## 下一步

深入了解各个模块的详细用法：

- [网络模块](./network-module.md) - 网络状态检测详解
- [电池模块](./battery-module.md) - 电池信息监控详解
- [地理位置模块](./geolocation-module.md) - 地理位置获取详解
- [最佳实践](./best-practices.md) - 模块使用最佳实践
