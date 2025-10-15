# GeolocationModule

地理位置模块，用于获取和监听设备的地理位置信息。

## 类概述

`GeolocationModule` 继承自 `EventEmitter`，实现了 `DeviceModule` 接口，提供地理位置获取和实时追踪功能。

## 导入

```typescript
import { GeolocationModule } from '@ldesign/device'
```

## 构造函数

### `constructor(options?)`

创建一个新的地理位置模块实例。

- **参数**:
  - `options`: `PositionOptions` - 可选的位置选项配置

```typescript
const geolocationModule = new GeolocationModule({
  enableHighAccuracy: true,  // 启用高精度
  timeout: 10000,            // 超时时间（毫秒）
  maximumAge: 300000         // 最大缓存时间（毫秒）
})
```

### 默认选项

```typescript
{
  enableHighAccuracy: true,   // 启用高精度定位
  timeout: 10000,             // 10秒超时
  maximumAge: 300000          // 5分钟缓存
}
```

## 属性

### `name`

- **类型**: `string`
- **值**: `'geolocation'`
- **描述**: 模块名称

## 方法

### `init()`

初始化模块，获取初始位置。

- **返回值**: `Promise<void>`

```typescript
await geolocationModule.init()
```

### `destroy()`

销毁模块，停止位置监听。

- **返回值**: `Promise<void>`

```typescript
await geolocationModule.destroy()
```

### `getData()`

获取当前缓存的地理位置信息。

- **返回值**: `GeolocationInfo | null`

```typescript
const location = geolocationModule.getData()
if (location) {
  console.log('纬度:', location.latitude)
  console.log('经度:', location.longitude)
}
```

### `isSupported()`

检查浏览器是否支持地理位置API。

- **返回值**: `boolean`

```typescript
if (geolocationModule.isSupported()) {
  console.log('浏览器支持地理位置API')
} else {
  console.log('浏览器不支持地理位置API')
}
```

### `getCurrentPosition()`

获取当前位置（一次性）。

- **参数**:
  - `options`: `PositionOptions` - 可选的位置选项
- **返回值**: `Promise<GeolocationInfo>`

```typescript
try {
  const position = await geolocationModule.getCurrentPosition()
  console.log('当前位置:', position)
  console.log('纬度:', position.latitude)
  console.log('经度:', position.longitude)
  console.log('精度:', position.accuracy, '米')
} catch (error) {
  console.error('获取位置失败:', error)
}

// 使用自定义选项
const position = await geolocationModule.getCurrentPosition({
  enableHighAccuracy: false,  // 使用低精度（更快）
  timeout: 5000               // 5秒超时
})
```

### `startWatching()`

开始监听位置变化。

- **参数**:
  - `callback`: `(position: GeolocationInfo) => void` - 可选的回调函数

```typescript
// 使用回调
geolocationModule.startWatching((position) => {
  console.log('位置已更新:', position)
})

// 使用事件监听
geolocationModule.on('positionChange', (position) => {
  console.log('位置已更新:', position)
})

geolocationModule.startWatching()
```

### `stopWatching()`

停止监听位置变化。

```typescript
geolocationModule.stopWatching()
```

### `watchPosition()`

监听位置变化（别名方法）。

- **参数**:
  - `callback`: `(position: GeolocationInfo) => void` - 回调函数
- **返回值**: `number | null` - 监听ID

```typescript
const watchId = geolocationModule.watchPosition((position) => {
  console.log('位置更新:', position)
})

// 停止监听
if (watchId !== null) {
  geolocationModule.clearWatch(watchId)
}
```

### `clearWatch()`

清除位置监听（别名方法）。

- **参数**:
  - `watchId`: `number` - 监听ID

```typescript
const watchId = geolocationModule.watchPosition(callback)
geolocationModule.clearWatch(watchId)
```

### `getLatitude()`

获取纬度。

- **返回值**: `number | null`

```typescript
const lat = geolocationModule.getLatitude()
console.log('纬度:', lat)
```

### `getLongitude()`

获取经度。

- **返回值**: `number | null`

```typescript
const lon = geolocationModule.getLongitude()
console.log('经度:', lon)
```

### `getAccuracy()`

获取位置精度（米）。

- **返回值**: `number | null`

```typescript
const accuracy = geolocationModule.getAccuracy()
console.log('精度:', accuracy, '米')
```

### `getAltitude()`

获取海拔高度（米）。

- **返回值**: `number | null`

```typescript
const altitude = geolocationModule.getAltitude()
if (altitude !== null) {
  console.log('海拔:', altitude, '米')
}
```

### `getAltitudeAccuracy()`

获取海拔精度（米）。

- **返回值**: `number | null`

```typescript
const altitudeAccuracy = geolocationModule.getAltitudeAccuracy()
if (altitudeAccuracy !== null) {
  console.log('海拔精度:', altitudeAccuracy, '米')
}
```

### `getHeading()`

获取移动方向（度，0-360）。

- **返回值**: `number | null`
- **说明**: 0表示正北，90表示正东，180表示正南，270表示正西

```typescript
const heading = geolocationModule.getHeading()
if (heading !== null) {
  console.log('方向:', heading, '度')
}
```

### `getSpeed()`

获取移动速度（米/秒）。

- **返回值**: `number | null`

```typescript
const speed = geolocationModule.getSpeed()
if (speed !== null) {
  console.log('速度:', speed, '米/秒')
  console.log('时速:', (speed * 3.6).toFixed(2), '公里/小时')
}
```

### `calculateDistance()`

计算两个坐标之间的距离（米）。

- **参数**:
  - `lat1`: `number` - 起点纬度
  - `lon1`: `number` - 起点经度
  - `lat2`: `number` - 终点纬度
  - `lon2`: `number` - 终点经度
- **返回值**: `number` - 距离（米）

```typescript
const distance = geolocationModule.calculateDistance(
  39.9042, 116.4074,  // 北京天安门
  31.2304, 121.4737   // 上海东方明珠
)
console.log('距离:', (distance / 1000).toFixed(2), '公里')
```

### `getDistanceFromCurrent()`

计算指定坐标与当前位置的距离。

- **参数**:
  - `latitude`: `number` - 目标纬度
  - `longitude`: `number` - 目标经度
- **返回值**: `number | null` - 距离（米），如果当前位置未知则返回null

```typescript
const distance = geolocationModule.getDistanceFromCurrent(
  39.9042, 116.4074  // 北京天安门
)
if (distance !== null) {
  console.log('距离天安门:', (distance / 1000).toFixed(2), '公里')
}
```

## 事件

### `positionChange`

当位置发生变化时触发。

- **事件数据**: `GeolocationInfo`

```typescript
geolocationModule.on('positionChange', (position) => {
  console.log('位置已更新:')
  console.log('纬度:', position.latitude)
  console.log('经度:', position.longitude)
  console.log('精度:', position.accuracy, '米')

  if (position.altitude !== null) {
    console.log('海拔:', position.altitude, '米')
  }

  if (position.speed !== null) {
    console.log('速度:', position.speed, '米/秒')
  }

  if (position.heading !== null) {
    console.log('方向:', position.heading, '度')
  }
})
```

## 类型定义

### `GeolocationInfo`

```typescript
interface GeolocationInfo {
  latitude: number              // 纬度
  longitude: number             // 经度
  accuracy: number              // 位置精度（米）
  altitude: number | null       // 海拔（米）
  altitudeAccuracy: number | null  // 海拔精度（米）
  heading: number | null        // 方向（度，0-360）
  speed: number | null          // 速度（米/秒）
  timestamp?: number            // 时间戳（毫秒）
}
```

### `PositionOptions`

```typescript
interface PositionOptions {
  enableHighAccuracy?: boolean  // 启用高精度定位
  timeout?: number              // 超时时间（毫秒）
  maximumAge?: number           // 最大缓存时间（毫秒）
}
```

## 完整示例

### 基础使用

```typescript
import { GeolocationModule } from '@ldesign/device'

// 创建模块实例
const geolocationModule = new GeolocationModule()

// 初始化模块
await geolocationModule.init()

// 检查是否支持
if (!geolocationModule.isSupported()) {
  console.log('浏览器不支持地理位置API')
  return
}

// 获取当前位置
try {
  const position = await geolocationModule.getCurrentPosition()
  console.log('当前位置:')
  console.log('纬度:', position.latitude)
  console.log('经度:', position.longitude)
  console.log('精度:', position.accuracy, '米')
} catch (error) {
  console.error('获取位置失败:', error)
}

// 清理
await geolocationModule.destroy()
```

### 实时位置追踪

```typescript
import { GeolocationModule } from '@ldesign/device'

const geolocationModule = new GeolocationModule({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0  // 不使用缓存，始终获取最新位置
})

await geolocationModule.init()

// 开始追踪
geolocationModule.startWatching()

// 监听位置变化
geolocationModule.on('positionChange', (position) => {
  // 更新地图标记
  updateMapMarker(position.latitude, position.longitude)

  // 显示精度圆
  showAccuracyCircle(position.latitude, position.longitude, position.accuracy)

  // 显示速度
  if (position.speed !== null && position.speed > 0) {
    const speedKmh = (position.speed * 3.6).toFixed(2)
    console.log(`当前速度: ${speedKmh} km/h`)
  }

  // 显示方向
  if (position.heading !== null) {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
    const index = Math.round(position.heading / 45) % 8
    console.log(`移动方向: ${directions[index]}`)
  }
})

// 停止追踪
// geolocationModule.stopWatching()
```

### 计算距离和导航

```typescript
import { GeolocationModule } from '@ldesign/device'

const geolocationModule = new GeolocationModule()
await geolocationModule.init()

// 目标位置（例如：某个商店）
const targetLocation = {
  name: '目的地',
  latitude: 39.9042,
  longitude: 116.4074
}

// 获取当前位置并计算距离
async function checkDistance() {
  try {
    const position = await geolocationModule.getCurrentPosition()

    const distance = geolocationModule.calculateDistance(
      position.latitude,
      position.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    )

    const distanceKm = (distance / 1000).toFixed(2)
    console.log(`距离${targetLocation.name}: ${distanceKm} 公里`)

    // 如果距离小于100米，提示已到达
    if (distance < 100) {
      alert(`已到达${targetLocation.name}附近`)
    }
  } catch (error) {
    console.error('获取位置失败:', error)
  }
}

// 持续监控距离
geolocationModule.startWatching()
geolocationModule.on('positionChange', () => {
  const distance = geolocationModule.getDistanceFromCurrent(
    targetLocation.latitude,
    targetLocation.longitude
  )

  if (distance !== null) {
    const distanceKm = (distance / 1000).toFixed(2)
    console.log(`距离目的地: ${distanceKm} 公里`)
  }
})
```

### 地理围栏（Geofencing）

```typescript
import { GeolocationModule } from '@ldesign/device'

const geolocationModule = new GeolocationModule()
await geolocationModule.init()

// 定义地理围栏
const geofences = [
  {
    id: 'home',
    name: '家',
    latitude: 39.9042,
    longitude: 116.4074,
    radius: 200  // 200米半径
  },
  {
    id: 'office',
    name: '办公室',
    latitude: 39.9100,
    longitude: 116.4100,
    radius: 100
  }
]

let insideGeofences = new Set()

// 检查是否在地理围栏内
function checkGeofences(position) {
  geofences.forEach(fence => {
    const distance = geolocationModule.calculateDistance(
      position.latitude,
      position.longitude,
      fence.latitude,
      fence.longitude
    )

    const isInside = distance <= fence.radius
    const wasInside = insideGeofences.has(fence.id)

    if (isInside && !wasInside) {
      // 进入地理围栏
      console.log(`进入${fence.name}`)
      insideGeofences.add(fence.id)
      onEnterGeofence(fence)
    } else if (!isInside && wasInside) {
      // 离开地理围栏
      console.log(`离开${fence.name}`)
      insideGeofences.delete(fence.id)
      onExitGeofence(fence)
    }
  })
}

// 开始监控
geolocationModule.startWatching()
geolocationModule.on('positionChange', checkGeofences)

function onEnterGeofence(fence) {
  showNotification(`您已到达${fence.name}`)
}

function onExitGeofence(fence) {
  showNotification(`您已离开${fence.name}`)
}
```

### 位置历史记录

```typescript
import { GeolocationModule } from '@ldesign/device'

const geolocationModule = new GeolocationModule()
await geolocationModule.init()

// 位置历史记录
const locationHistory = []

// 记录位置
function recordLocation(position) {
  locationHistory.push({
    latitude: position.latitude,
    longitude: position.longitude,
    timestamp: position.timestamp || Date.now(),
    accuracy: position.accuracy
  })

  // 只保留最近100个位置
  if (locationHistory.length > 100) {
    locationHistory.shift()
  }
}

// 计算总移动距离
function getTotalDistance() {
  if (locationHistory.length < 2) return 0

  let total = 0
  for (let i = 1; i < locationHistory.length; i++) {
    const prev = locationHistory[i - 1]
    const curr = locationHistory[i]

    total += geolocationModule.calculateDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    )
  }

  return total
}

// 获取平均速度
function getAverageSpeed() {
  if (locationHistory.length < 2) return 0

  const first = locationHistory[0]
  const last = locationHistory[locationHistory.length - 1]

  const distance = geolocationModule.calculateDistance(
    first.latitude,
    first.longitude,
    last.latitude,
    last.longitude
  )

  const timeDiff = (last.timestamp - first.timestamp) / 1000  // 秒

  return distance / timeDiff  // 米/秒
}

// 开始追踪
geolocationModule.startWatching()
geolocationModule.on('positionChange', (position) => {
  recordLocation(position)

  const distance = getTotalDistance()
  const speed = getAverageSpeed()

  console.log('总移动距离:', (distance / 1000).toFixed(2), '公里')
  console.log('平均速度:', (speed * 3.6).toFixed(2), '公里/小时')
})
```

## 错误处理

地理位置API可能因各种原因失败，需要正确处理错误：

```typescript
import { GeolocationModule } from '@ldesign/device'

const geolocationModule = new GeolocationModule()
await geolocationModule.init()

try {
  const position = await geolocationModule.getCurrentPosition()
  console.log('位置获取成功:', position)
} catch (error) {
  switch (error.message) {
    case 'Permission denied':
      console.error('用户拒绝了位置权限请求')
      showPermissionDeniedMessage()
      break
    case 'Position unavailable':
      console.error('无法获取位置信息（GPS不可用）')
      showUnavailableMessage()
      break
    case 'Request timeout':
      console.error('获取位置超时')
      showTimeoutMessage()
      break
    case 'Geolocation is not supported':
      console.error('浏览器不支持地理位置API')
      showUnsupportedMessage()
      break
    default:
      console.error('获取位置失败:', error)
  }
}
```

## 浏览器兼容性

- **Geolocation API**: 所有现代浏览器支持
  - Chrome: 支持
  - Firefox: 支持
  - Safari: 支持
  - Edge: 支持
  - Mobile browsers: 支持

## 注意事项

1. **权限**: 需要用户授权才能访问位置信息
2. **HTTPS**: 地理位置API仅在HTTPS网站上可用（localhost除外）
3. **隐私**: 获取位置信息前应告知用户用途
4. **精度**: 位置精度受多种因素影响（GPS信号、WiFi、基站等）
5. **电池消耗**: 高精度定位和持续追踪会消耗更多电池
6. **超时**: 设置合理的超时时间，避免长时间等待
7. **缓存**: 使用`maximumAge`可以减少定位请求，提高性能
8. **移动端**: 在移动设备上效果最佳，可获取方向和速度信息
