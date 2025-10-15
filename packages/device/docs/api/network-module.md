# NetworkModule

网络信息模块，用于检测和监听网络连接状态、类型和性能指标。

## 类概述

`NetworkModule` 继承自 `EventEmitter`，实现了 `DeviceModule` 接口，提供网络连接状态检测和实时监听功能。

## 导入

```typescript
import { NetworkModule } from '@ldesign/device'
```

## 构造函数

### `constructor()`

创建一个新的网络模块实例。

```typescript
const networkModule = new NetworkModule()
```

构造函数会自动初始化并检测当前的网络信息。

## 属性

### `name`

- **类型**: `string`
- **值**: `'network'`
- **描述**: 模块名称

## 方法

### `init()`

初始化模块，设置网络状态监听器。

- **返回值**: `Promise<void>`

```typescript
await networkModule.init()
```

该方法会：
- 获取浏览器的网络连接对象
- 设置在线/离线事件监听器
- 设置网络连接变化监听器
- 执行初始网络信息检测

### `destroy()`

销毁模块，移除所有事件监听器。

- **返回值**: `Promise<void>`

```typescript
await networkModule.destroy()
```

### `getData()`

获取当前网络信息。

- **返回值**: `NetworkInfo`

```typescript
const networkInfo = networkModule.getData()
console.log(networkInfo)
// {
//   status: 'online',
//   type: 'wifi',
//   online: true,
//   effectiveType: '4g',
//   downlink: 10,
//   rtt: 50,
//   saveData: false,
//   supported: true
// }
```

### `getNetworkInfo()`

获取实时网络信息（别名方法）。

- **返回值**: `NetworkInfo`

```typescript
const info = networkModule.getNetworkInfo()
```

此方法会动态读取当前连接信息，确保返回最新的网络状态。

### `getStatus()`

获取网络连接状态。

- **返回值**: `NetworkStatus` (`'online'` | `'offline'`)

```typescript
const status = networkModule.getStatus()
console.log(status) // 'online'
```

### `getConnectionType()`

获取网络连接类型。

- **返回值**: `NetworkType` (`'wifi'` | `'cellular'` | `'ethernet'` | `'bluetooth'` | `'unknown'`)

```typescript
const type = networkModule.getConnectionType()
console.log(type) // 'wifi'
```

### `getDownlink()`

获取下载速度（Mbps）。

- **返回值**: `number | undefined`

```typescript
const downlink = networkModule.getDownlink()
console.log(downlink) // 10
```

### `getRTT()`

获取往返时间（毫秒）。

- **返回值**: `number | undefined`

```typescript
const rtt = networkModule.getRTT()
console.log(rtt) // 50
```

### `isSaveData()`

检查是否为计量连接（省流量模式）。

- **返回值**: `boolean | undefined`

```typescript
const isSaveData = networkModule.isSaveData()
console.log(isSaveData) // false
```

### `isOnline()`

检查是否在线。

- **返回值**: `boolean`

```typescript
if (networkModule.isOnline()) {
  console.log('设备已连接到网络')
}
```

### `isOffline()`

检查是否离线。

- **返回值**: `boolean`

```typescript
if (networkModule.isOffline()) {
  console.log('设备已断开网络连接')
}
```

## 事件

### `networkChange`

当网络状态发生变化时触发。

- **事件数据**: `NetworkInfo`

```typescript
networkModule.on('networkChange', (info) => {
  console.log('网络状态已变化:', info)
  console.log('连接类型:', info.type)
  console.log('在线状态:', info.online)
})
```

事件在以下情况下触发：
- 网络连接/断开（online/offline）
- 连接类型变化（wifi/cellular等）
- 网络性能指标变化（downlink/rtt等）

## 类型定义

### `NetworkInfo`

```typescript
interface NetworkInfo {
  status: NetworkStatus           // 网络状态
  type: NetworkType              // 连接类型
  online?: boolean               // 是否在线
  effectiveType?: string         // 有效连接类型
  downlink?: number              // 下载速度（Mbps）
  rtt?: number                   // 往返时间（毫秒）
  saveData?: boolean             // 是否为计量连接
  supported?: boolean            // 是否支持网络连接API
}
```

### `NetworkStatus`

```typescript
type NetworkStatus = 'online' | 'offline'
```

### `NetworkType`

```typescript
type NetworkType =
  | 'wifi'          // WiFi连接
  | 'cellular'      // 蜂窝网络（2G/3G/4G/5G）
  | 'ethernet'      // 以太网
  | 'bluetooth'     // 蓝牙
  | 'unknown'       // 未知
```

## 完整示例

### 基础使用

```typescript
import { NetworkModule } from '@ldesign/device'

// 创建模块实例
const networkModule = new NetworkModule()

// 初始化模块
await networkModule.init()

// 获取网络信息
const info = networkModule.getData()
console.log('网络状态:', info.status)
console.log('连接类型:', info.type)
console.log('下载速度:', info.downlink, 'Mbps')
console.log('延迟:', info.rtt, 'ms')

// 监听网络变化
networkModule.on('networkChange', (info) => {
  if (info.status === 'offline') {
    alert('网络已断开，请检查您的网络连接')
  }
})

// 清理
await networkModule.destroy()
```

### 网络质量检测

```typescript
import { NetworkModule } from '@ldesign/device'

const networkModule = new NetworkModule()
await networkModule.init()

// 检测网络质量
function checkNetworkQuality() {
  const info = networkModule.getData()

  if (info.status === 'offline') {
    return '离线'
  }

  const downlink = info.downlink || 0
  const rtt = info.rtt || Infinity

  if (downlink > 5 && rtt < 100) {
    return '优秀'
  } else if (downlink > 2 && rtt < 300) {
    return '良好'
  } else if (downlink > 1) {
    return '一般'
  } else {
    return '较差'
  }
}

console.log('网络质量:', checkNetworkQuality())

// 监听网络质量变化
networkModule.on('networkChange', () => {
  console.log('网络质量已变化:', checkNetworkQuality())
})
```

### 自适应内容加载

```typescript
import { NetworkModule } from '@ldesign/device'

const networkModule = new NetworkModule()
await networkModule.init()

// 根据网络状态加载不同质量的内容
function loadContent() {
  const info = networkModule.getData()

  if (info.type === 'wifi' || (info.downlink && info.downlink > 5)) {
    // 加载高清内容
    loadHighQualityContent()
  } else if (info.type === 'cellular' && info.effectiveType === '4g') {
    // 加载标清内容
    loadStandardQualityContent()
  } else {
    // 加载低清内容
    loadLowQualityContent()
  }

  // 检查省流量模式
  if (info.saveData) {
    console.log('用户已启用省流量模式，减少数据传输')
    disableAutoPlay()
    compressImages()
  }
}

loadContent()

// 监听网络变化，动态调整内容质量
networkModule.on('networkChange', loadContent)
```

### 离线检测与提示

```typescript
import { NetworkModule } from '@ldesign/device'

const networkModule = new NetworkModule()
await networkModule.init()

// 显示网络状态指示器
function updateNetworkIndicator() {
  const indicator = document.getElementById('network-indicator')

  if (networkModule.isOnline()) {
    const type = networkModule.getConnectionType()
    indicator.textContent = `在线 (${type})`
    indicator.className = 'online'
  } else {
    indicator.textContent = '离线'
    indicator.className = 'offline'
  }
}

updateNetworkIndicator()

// 监听网络状态变化
networkModule.on('networkChange', (info) => {
  updateNetworkIndicator()

  if (info.status === 'offline') {
    // 显示离线提示
    showOfflineNotification()
    // 启用离线模式
    enableOfflineMode()
  } else {
    // 隐藏离线提示
    hideOfflineNotification()
    // 同步离线数据
    syncOfflineData()
  }
})
```

## 浏览器兼容性

- **Network Information API**: 部分浏览器支持
  - Chrome 61+
  - Edge 79+
  - Opera 48+
  - Safari: 不支持
  - Firefox: 不支持

- **Online/Offline Events**: 所有现代浏览器支持

在不支持 Network Information API 的浏览器中，模块仍然可以检测在线/离线状态，但无法获取连接类型、下载速度等详细信息。

## 注意事项

1. **权限**: 无需特殊权限
2. **隐私**: 网络信息不涉及用户隐私数据
3. **准确性**: 连接类型和速度信息由浏览器提供，可能不完全准确
4. **跨平台**: 在 Node.js 环境中会返回默认值（在线状态）
5. **事件频率**: 网络状态变化事件可能频繁触发，建议根据需要进行防抖处理
