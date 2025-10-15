# BatteryModule

电池信息模块，用于检测和监听设备电池状态、电量和充电信息。

## 类概述

`BatteryModule` 实现了 `DeviceModule` 接口，提供电池状态检测和实时监听功能。

## 导入

```typescript
import { BatteryModule } from '@ldesign/device'
```

## 构造函数

### `constructor()`

创建一个新的电池模块实例。

```typescript
const batteryModule = new BatteryModule()
```

构造函数会自动初始化默认的电池信息。

## 属性

### `name`

- **类型**: `string`
- **值**: `'battery'`
- **描述**: 模块名称

## 方法

### `init()`

初始化模块，获取电池API并设置监听器。

- **返回值**: `Promise<void>`

```typescript
await batteryModule.init()
```

该方法会：
- 尝试获取浏览器的电池管理API
- 更新电池信息
- 设置电池状态变化监听器

### `destroy()`

销毁模块，移除所有事件监听器。

- **返回值**: `Promise<void>`

```typescript
await batteryModule.destroy()
```

### `getData()`

获取当前电池信息。

- **返回值**: `BatteryInfo`

```typescript
const batteryInfo = batteryModule.getData()
console.log(batteryInfo)
// {
//   level: 0.75,
//   charging: false,
//   chargingTime: Infinity,
//   dischargingTime: 7200
// }
```

### `getLevel()`

获取电池电量（0-1）。

- **返回值**: `number`

```typescript
const level = batteryModule.getLevel()
console.log(level) // 0.75
```

### `getLevelPercentage()`

获取电池电量百分比（0-100）。

- **返回值**: `number`

```typescript
const percentage = batteryModule.getLevelPercentage()
console.log(`电量: ${percentage}%`) // 电量: 75%
```

### `isCharging()`

检查是否正在充电。

- **返回值**: `boolean`

```typescript
if (batteryModule.isCharging()) {
  console.log('设备正在充电')
}
```

### `getChargingTime()`

获取充满电所需时间（秒）。

- **返回值**: `number`
- **说明**: 如果未在充电或时间未知，返回 `Infinity`

```typescript
const chargingTime = batteryModule.getChargingTime()
if (isFinite(chargingTime)) {
  console.log(`充满还需 ${chargingTime} 秒`)
}
```

### `getDischargingTime()`

获取放电剩余时间（秒）。

- **返回值**: `number`
- **说明**: 如果正在充电或时间未知，返回 `Infinity`

```typescript
const dischargingTime = batteryModule.getDischargingTime()
if (isFinite(dischargingTime)) {
  console.log(`还可使用 ${dischargingTime} 秒`)
}
```

### `getChargingTimeFormatted()`

获取充电时间（格式化为易读字符串）。

- **返回值**: `string`

```typescript
const timeStr = batteryModule.getChargingTimeFormatted()
console.log(timeStr) // "1小时30分钟" 或 "未知"
```

### `getDischargingTimeFormatted()`

获取放电时间（格式化为易读字符串）。

- **返回值**: `string`

```typescript
const timeStr = batteryModule.getDischargingTimeFormatted()
console.log(timeStr) // "2小时0分钟" 或 "未知"
```

### `isLowBattery()`

检查电池是否电量低。

- **参数**:
  - `threshold`: `number` - 低电量阈值，默认 `0.2` (20%)
- **返回值**: `boolean`

```typescript
if (batteryModule.isLowBattery()) {
  console.log('电量低于20%')
}

if (batteryModule.isLowBattery(0.1)) {
  console.log('电量低于10%')
}
```

### `isHighBattery()`

检查电池是否电量充足。

- **参数**:
  - `threshold`: `number` - 充足电量阈值，默认 `0.8` (80%)
- **返回值**: `boolean`

```typescript
if (batteryModule.isHighBattery()) {
  console.log('电量高于80%')
}
```

### `getBatteryStatus()`

获取电池状态描述。

- **返回值**: `string` (`'charging'` | `'low'` | `'high'` | `'normal'`)

```typescript
const status = batteryModule.getBatteryStatus()
switch (status) {
  case 'charging':
    console.log('正在充电')
    break
  case 'low':
    console.log('电量低')
    break
  case 'high':
    console.log('电量充足')
    break
  case 'normal':
    console.log('电量正常')
    break
}
```

### `on()`

添加自定义事件监听器。

- **参数**:
  - `event`: `string` - 事件名称
  - `handler`: `(data: any) => void` - 事件处理函数

```typescript
batteryModule.on('batteryChange', (info) => {
  console.log('电池状态变化:', info)
})
```

### `off()`

移除自定义事件监听器。

- **参数**:
  - `event`: `string` - 事件名称
  - `handler`: `(data: any) => void` - 事件处理函数

```typescript
const handler = (info) => console.log(info)
batteryModule.on('batteryChange', handler)
// ... 稍后
batteryModule.off('batteryChange', handler)
```

## 事件

### `batteryChange`

当电池状态发生变化时触发。

- **事件数据**: `BatteryInfo`

```typescript
batteryModule.on('batteryChange', (info) => {
  console.log('电池电量:', info.level)
  console.log('充电状态:', info.charging)
  console.log('充电时间:', info.chargingTime)
  console.log('放电时间:', info.dischargingTime)
})
```

事件在以下情况下触发：
- 电池电量变化（`levelchange`）
- 充电状态变化（`chargingchange`）
- 充电时间变化（`chargingtimechange`）
- 放电时间变化（`dischargingtimechange`）

## 类型定义

### `BatteryInfo`

```typescript
interface BatteryInfo {
  level: number              // 电池电量（0-1）
  charging: boolean          // 是否正在充电
  chargingTime: number       // 充电时间（秒）
  dischargingTime: number    // 放电时间（秒）
}
```

## 完整示例

### 基础使用

```typescript
import { BatteryModule } from '@ldesign/device'

// 创建模块实例
const batteryModule = new BatteryModule()

// 初始化模块
await batteryModule.init()

// 获取电池信息
const info = batteryModule.getData()
console.log('电量:', batteryModule.getLevelPercentage() + '%')
console.log('充电状态:', batteryModule.isCharging() ? '充电中' : '未充电')
console.log('电池状态:', batteryModule.getBatteryStatus())

// 监听电池变化
batteryModule.on('batteryChange', (info) => {
  console.log('电池状态已变化:', info)
})

// 清理
await batteryModule.destroy()
```

### 电量监控与提示

```typescript
import { BatteryModule } from '@ldesign/device'

const batteryModule = new BatteryModule()
await batteryModule.init()

// 显示电池状态
function updateBatteryDisplay() {
  const percentage = batteryModule.getLevelPercentage()
  const charging = batteryModule.isCharging()

  const batteryElement = document.getElementById('battery')
  batteryElement.textContent = `${percentage}%`

  if (charging) {
    batteryElement.classList.add('charging')
  } else {
    batteryElement.classList.remove('charging')
  }

  // 低电量警告
  if (batteryModule.isLowBattery(0.15) && !charging) {
    showLowBatteryWarning()
  }
}

updateBatteryDisplay()

// 监听电池变化
batteryModule.on('batteryChange', () => {
  updateBatteryDisplay()
})
```

### 根据电量优化应用行为

```typescript
import { BatteryModule } from '@ldesign/device'

const batteryModule = new BatteryModule()
await batteryModule.init()

// 根据电量调整应用行为
function optimizePerformance() {
  const status = batteryModule.getBatteryStatus()
  const charging = batteryModule.isCharging()

  if (status === 'low' && !charging) {
    // 低电量模式
    console.log('启用省电模式')
    // 降低刷新率
    reduceRefreshRate()
    // 减少动画效果
    disableAnimations()
    // 暂停后台任务
    pauseBackgroundTasks()
  } else if (status === 'high' || charging) {
    // 正常/高电量模式
    console.log('正常模式')
    // 恢复正常设置
    restoreNormalSettings()
  }
}

optimizePerformance()

// 监听电池状态变化
batteryModule.on('batteryChange', () => {
  optimizePerformance()
})
```

### 充电提醒

```typescript
import { BatteryModule } from '@ldesign/device'

const batteryModule = new BatteryModule()
await batteryModule.init()

let hasShownChargingNotification = false
let hasShownFullNotification = false

batteryModule.on('batteryChange', (info) => {
  // 开始充电提醒
  if (info.charging && !hasShownChargingNotification) {
    const timeStr = batteryModule.getChargingTimeFormatted()
    showNotification(`正在充电，预计 ${timeStr} 充满`)
    hasShownChargingNotification = true
    hasShownFullNotification = false
  }

  // 充满电提醒
  if (info.charging && info.level >= 0.95 && !hasShownFullNotification) {
    showNotification('电池已充满，请拔下充电器')
    hasShownFullNotification = true
  }

  // 停止充电重置标志
  if (!info.charging) {
    hasShownChargingNotification = false
    hasShownFullNotification = false
  }

  // 低电量提醒
  if (!info.charging && batteryModule.isLowBattery(0.2)) {
    const timeStr = batteryModule.getDischargingTimeFormatted()
    showNotification(`电量低于20%，还可使用约 ${timeStr}`)
  }
})
```

### 电池健康统计

```typescript
import { BatteryModule } from '@ldesign/device'

const batteryModule = new BatteryModule()
await batteryModule.init()

// 记录电池使用数据
const batteryStats = {
  samples: [],
  addSample() {
    const info = batteryModule.getData()
    this.samples.push({
      level: info.level,
      charging: info.charging,
      timestamp: Date.now()
    })

    // 只保留最近100个样本
    if (this.samples.length > 100) {
      this.samples.shift()
    }
  },

  getAverageLevel() {
    if (this.samples.length === 0) return 0
    const sum = this.samples.reduce((acc, s) => acc + s.level, 0)
    return sum / this.samples.length
  },

  getChargingFrequency() {
    if (this.samples.length < 2) return 0
    let chargingCount = 0
    for (let i = 1; i < this.samples.length; i++) {
      if (this.samples[i].charging && !this.samples[i - 1].charging) {
        chargingCount++
      }
    }
    return chargingCount
  }
}

// 每分钟采样一次
setInterval(() => {
  batteryStats.addSample()
  console.log('平均电量:', (batteryStats.getAverageLevel() * 100).toFixed(2) + '%')
  console.log('充电次数:', batteryStats.getChargingFrequency())
}, 60000)

// 监听电池变化
batteryModule.on('batteryChange', () => {
  batteryStats.addSample()
})
```

## 浏览器兼容性

- **Battery Status API**: 部分浏览器支持
  - Chrome 38+
  - Edge 79+
  - Opera 25+
  - Firefox: 已移除支持（出于隐私考虑）
  - Safari: 不支持

在不支持 Battery Status API 的浏览器中，模块会返回默认值（电量100%，未充电）。

## 注意事项

1. **权限**: 无需特殊权限
2. **隐私**: Firefox 已移除此API，因为它可能被用于设备指纹识别
3. **准确性**: 电池信息由操作系统提供，准确性可能因设备而异
4. **跨平台**: 在桌面设备上，某些信息（如充电时间）可能不准确或不可用
5. **移动设备**: 在移动设备上，此API的支持情况更好
6. **时间估算**: 充电/放电时间是估算值，实际时间可能因使用情况而变化
