# 地理位置模块

地理位置模块提供设备位置获取和监控功能，帮助你构建位置感知的应用。

## 加载模块

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()
const geoModule = await detector.loadModule('geolocation')
```

## 检查支持情况

```typescript
if (geoModule.isSupported()) {
 console.log('设备支持地理位置 API')
} else {
 console.log('设备不支持地理位置 API')
}
```

## 获取当前位置

```typescript
try {
 const position = await geoModule.getCurrentPosition({
  // 可选配置
  enableHighAccuracy: true,  // 高精度模式
  timeout: 10000,       // 超时时间（毫秒）
  maximumAge: 0        // 缓存时间（毫秒）
 })

 console.log(position)
 // {
 //  latitude: 39.9042,    // 纬度
 //  longitude: 116.4074,   // 经度
 //  accuracy: 10,       // 精度（米）
 //  altitude: 50,       // 海拔（米，可能为 null）
 //  altitudeAccuracy: 5,   // 海拔精度（米，可能为 null）
 //  heading: 180,       // 方向（度，可能为 null）
 //  speed: 0,         // 速度（米/秒，可能为 null）
 //  timestamp: 1634567890123 // 时间戳
 // }
} catch (error) {
 console.error('获取位置失败:', error)
}
```

## GeolocationPosition 接口

| 属性 | 类型 | 说明 |
|--------|--------|--------|
| `latitude` | `number` | 纬度，范围 -90 到 90 |
| `longitude` | `number` | 经度，范围 -180 到 180 |
| `accuracy` | `number` | 精度（米），数值越小越精确 |
| `altitude` | `number \| null` | 海拔高度（米），可能不可用 |
| `altitudeAccuracy` | `number \| null` | 海拔精度（米），可能不可用 |
| `heading` | `number \| null` | 移动方向（度，0-360），可能不可用 |
| `speed` | `number \| null` | 移动速度（米/秒），可能不可用 |
| `timestamp` | `number` | 位置获取时的时间戳 |

## API 方法

### isSupported()

检查浏览器是否支持地理位置 API。

```typescript
if (geoModule.isSupported()) {
 // 支持地理位置
}
```

### getCurrentPosition()

获取当前位置（单次）。

```typescript
const position = await geoModule.getCurrentPosition(options)
```

**选项参数**:

| 选项 | 类型 | 默认值 | 说明 |
|--------|--------|----------|--------|
| `enableHighAccuracy` | `boolean` | `false` | 是否启用高精度模式 |
| `timeout` | `number` | `10000` | 超时时间（毫秒） |
| `maximumAge` | `number` | `0` | 允许使用缓存的时间（毫秒） |

### startWatching()

开始监听位置变化。

```typescript
const watchId = await geoModule.startWatching(options)

// 监听位置变化事件
detector.on('positionChange', (position) => {
 console.log('位置更新:', position)
})
```

返回 watch ID，用于后续停止监听。

### stopWatching()

停止监听位置变化。

```typescript
await geoModule.stopWatching(watchId)

// 或者停止所有监听
await geoModule.stopWatching()
```

### clearWatch()

清除指定的 watch（别名方法）。

```typescript
geoModule.clearWatch(watchId)
```

## 监听位置变化

```typescript
// 开始监听
const watchId = await geoModule.startWatching({
 enableHighAccuracy: true,
 maximumAge: 5000 // 5秒内的缓存可用
})

// 监听事件
detector.on('positionChange', (position) => {
 console.log('位置更新:', position)
 updateMap(position.latitude, position.longitude)
})

// 停止监听
// await geoModule.stopWatching(watchId)
```

## 错误处理

```typescript
try {
 const position = await geoModule.getCurrentPosition()
} catch (error) {
 switch (error.code) {
  case 1: // PERMISSION_DENIED
   console.error('用户拒绝了位置权限')
   break
  case 2: // POSITION_UNAVAILABLE
   console.error('位置信息不可用')
   break
  case 3: // TIMEOUT
   console.error('获取位置超时')
   break
  default:
   console.error('未知错误:', error.message)
 }
}
```

## 实际应用场景

### 地图定位

在地图上显示用户位置：

```typescript
const geoModule = await detector.loadModule('geolocation')

// 获取当前位置
const position = await geoModule.getCurrentPosition({
 enableHighAccuracy: true
})

// 初始化地图
const map = initMap({
 center: [position.longitude, position.latitude],
 zoom: 15
})

// 添加用户位置标记
map.addMarker({
 coordinates: [position.longitude, position.latitude],
 icon: 'user-location',
 title: '我的位置'
})
```

### 位置跟踪

实时跟踪用户位置：

```typescript
const geoModule = await detector.loadModule('geolocation')

// 开始跟踪
const watchId = await geoModule.startWatching({
 enableHighAccuracy: true,
 maximumAge: 5000
})

// 记录轨迹
const path = []

detector.on('positionChange', (position) => {
 // 添加到轨迹
 path.push({
  lat: position.latitude,
  lng: position.longitude,
  timestamp: position.timestamp
 })

 // 更新地图
 map.drawPath(path)

 // 计算总距离
 const totalDistance = calculateDistance(path)
 updateUI({ distance: totalDistance })
})
```

### 附近搜索

搜索附近的兴趣点：

```typescript
const geoModule = await detector.loadModule('geolocation')

// 获取当前位置
const position = await geoModule.getCurrentPosition()

// 搜索附近的咖啡店
const nearbyCafes = await searchNearby({
 latitude: position.latitude,
 longitude: position.longitude,
 radius: 1000, // 1公里范围内
 type: 'cafe'
})

// 显示结果
displayResults(nearbyCafes)
```

### 地理围栏

监控用户进出特定区域：

```typescript
const geoModule = await detector.loadModule('geolocation')

// 定义围栏区域
const geofence = {
 center: { lat: 39.9042, lng: 116.4074 },
 radius: 500 // 500米
}

// 开始监听位置
await geoModule.startWatching({
 enableHighAccuracy: true
})

detector.on('positionChange', (position) => {
 const distance = calculateDistance(
  position.latitude,
  position.longitude,
  geofence.center.lat,
  geofence.center.lng
 )

 if (distance <= geofence.radius) {
  // 进入围栏
  onEnterGeofence()
 } else {
  // 离开围栏
  onExitGeofence()
 }
})
```

### 距离计算

计算两个位置之间的距离：

```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
 const R = 6371e3 // 地球半径（米）
 const φ1 = (lat1 * Math.PI) / 180
 const φ2 = (lat2 * Math.PI) / 180
 const Δφ = ((lat2 - lat1) * Math.PI) / 180
 const Δλ = ((lon2 - lon1) * Math.PI) / 180

 const a
  = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
  + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

 return R * c // 返回距离（米）
}
```

## Vue 3 集成

### 使用 useGeolocation Composable

```vue
<script setup>
import { useGeolocation } from '@ldesign/device/vue'
import { computed, ref } from 'vue'

const {
 position,
 latitude,
 longitude,
 accuracy,
 isTracking,
 error,
 getCurrentPosition,
 startWatching,
 stopWatching
} = useGeolocation()

// 加载状态
const loading = ref(false)

// 获取位置
const getLocation = async () => {
 loading.value = true
 try {
  await getCurrentPosition({
   enableHighAccuracy: true,
   timeout: 10000
  })
 } catch (err) {
  console.error('获取位置失败:', err)
 } finally {
  loading.value = false
 }
}

// 开始跟踪
const startTracking = async () => {
 await startWatching({
  enableHighAccuracy: true
 })
}

// 格式化坐标
const formattedCoords = computed(() => {
 if (!position.value) return '-'
 return `${latitude.value.toFixed(6)}, ${longitude.value.toFixed(6)}`
})

// 精度描述
const accuracyText = computed(() => {
 if (!accuracy.value) return '-'
 if (accuracy.value < 10) return '非常精确'
 if (accuracy.value < 50) return '精确'
 if (accuracy.value < 100) return '较精确'
 return '不太精确'
})
</script>

<template>
 <div class="geolocation-widget">
  <h3>地理位置</h3>

  <!-- 操作按钮 -->
  <div class="actions">
   <button @click="getLocation" :disabled="loading">
    {{ loading ? '定位中...' : '获取位置' }}
   </button>

   <button
    v-if="!isTracking"
    @click="startTracking"
   >
    开始跟踪
   </button>

   <button
    v-else
    @click="stopWatching"
    class="danger"
   >
    停止跟踪
   </button>
  </div>

  <!-- 位置信息 -->
  <div v-if="position" class="location-info">
   <dl>
    <dt>坐标</dt>
    <dd>{{ formattedCoords }}</dd>

    <dt>精度</dt>
    <dd>
     {{ accuracy.toFixed(0) }}米
     <span class="accuracy-badge">{{ accuracyText }}</span>
    </dd>

    <dt v-if="position.altitude">海拔</dt>
    <dd v-if="position.altitude">
     {{ position.altitude.toFixed(0) }}米
    </dd>

    <dt v-if="position.speed">速度</dt>
    <dd v-if="position.speed">
     {{ (position.speed * 3.6).toFixed(1) }} km/h
    </dd>

    <dt v-if="position.heading">方向</dt>
    <dd v-if="position.heading">
     {{ position.heading.toFixed(0) }}°
    </dd>
   </dl>

   <!-- 更新时间 -->
   <p class="timestamp">
    更新于 {{ new Date(position.timestamp).toLocaleTimeString() }}
   </p>
  </div>

  <!-- 错误信息 -->
  <div v-else-if="error" class="error-message">
   <p>{{ error.message }}</p>
  </div>

  <!-- 提示信息 -->
  <div v-else class="hint">
   <p>点击按钮获取您的位置</p>
  </div>
 </div>
</template>

<style scoped>
.geolocation-widget {
 padding: 20px;
 border-radius: 8px;
 background: #f5f5f5;
}

.actions {
 display: flex;
 gap: 8px;
 margin-bottom: 16px;
}

button {
 padding: 8px 16px;
 border: none;
 border-radius: 4px;
 background: #2196f3;
 color: white;
 cursor: pointer;
}

button:hover {
 background: #1976d2;
}

button:disabled {
 background: #ccc;
 cursor: not-allowed;
}

button.danger {
 background: #f44336;
}

.location-info dl {
 display: grid;
 grid-template-columns: auto 1fr;
 gap: 8px 16px;
}

.location-info dt {
 font-weight: bold;
}

.accuracy-badge {
 padding: 2px 8px;
 border-radius: 4px;
 background: #4caf50;
 color: white;
 font-size: 12px;
 margin-left: 8px;
}

.timestamp {
 margin-top: 12px;
 font-size: 12px;
 color: #666;
}

.error-message {
 padding: 12px;
 background: #ffebee;
 color: #c62828;
 border-radius: 4px;
}

.hint {
 color: #666;
 text-align: center;
 padding: 20px;
}
</style>
```

## 隐私和权限

### 请求权限

浏览器会自动提示用户授权，无需手动请求：

```typescript
try {
 const position = await geoModule.getCurrentPosition()
 // 用户已授权
} catch (error) {
 if (error.code === 1) {
  // 用户拒绝授权
  showPermissionDeniedMessage()
 }
}
```

### HTTPS 要求

地理位置 API 在大多数浏览器中要求使用 HTTPS 协议（localhost 除外）：

```typescript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
 console.warn('地理位置 API 需要 HTTPS 协议')
}
```

## 浏览器兼容性

| 浏览器 | 版本 | 支持程度 |
|----------|--------|------------|
| Chrome | 5+ | 完全支持 |
| Firefox | 3.5+ | 完全支持 |
| Safari | 5+ | 完全支持 |
| Edge | 所有版本 | 完全支持 |

所有现代浏览器都支持地理位置 API。

## 最佳实践

1. **权限处理**：优雅处理用户拒绝权限的情况
2. **精度选择**：根据需求选择精度模式（高精度更耗电）
3. **错误处理**：始终添加错误处理逻辑
4. **用户隐私**：明确告知用户位置用途
5. **及时清理**：不使用时停止位置监听
6. **超时设置**：设置合理的超时时间
7. **缓存利用**：适当使用 maximumAge 减少请求

## 下一步

- [网络模块](./network-module.md) - 了解网络监控功能
- [电池模块](./battery-module.md) - 了解电池监控功能
- [最佳实践](./best-practices.md) - 学习最佳实践
