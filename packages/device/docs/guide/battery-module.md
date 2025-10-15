# 电池模块

电池模块提供设备电池状态监控功能，帮助你根据电量情况优化应用性能和用户体验。

## 加载模块

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()
const batteryModule = await detector.loadModule('battery')
```

## 获取电池信息

```typescript
const batteryInfo = batteryModule.getData()

console.log(batteryInfo)
// {
//  level: 0.8,           // 电量 (0-1)
//  charging: false,        // 是否充电
//  chargingTime: Infinity,    // 充电时间 (秒)
//  dischargingTime: 7200     // 放电时间 (秒)
// }
```

## BatteryInfo 接口

| 属性 | 类型 | 说明 |
|--------|--------|--------|
| `level` | `number` | 电池电量，范围 0-1（0% - 100%） |
| `charging` | `boolean` | 是否正在充电 |
| `chargingTime` | `number` | 充满电需要的时间（秒），充电时有效 |
| `dischargingTime` | `number` | 耗尽电量需要的时间（秒），放电时有效 |

注意：`chargingTime` 和 `dischargingTime` 在无法估算时为 `Infinity`。

## API 方法

### getData()

获取完整的电池信息对象。

```typescript
const batteryInfo = batteryModule.getData()
```

### getLevel()

获取电池电量（0-1）。

```typescript
const level = batteryModule.getLevel()
console.log('电池电量:', level) // 0.8
```

### getLevelPercentage()

获取电池电量百分比（0-100）。

```typescript
const percentage = batteryModule.getLevelPercentage()
console.log('电池电量:', percentage + '%') // 80%
```

### isCharging()

检查是否正在充电。

```typescript
if (batteryModule.isCharging()) {
 console.log('设备正在充电')
}
```

### getChargingTime()

获取充电时间（秒）。

```typescript
const chargingTime = batteryModule.getChargingTime()
console.log('充满电需要:', chargingTime, '秒')
```

### getDischargingTime()

获取放电时间（秒）。

```typescript
const dischargingTime = batteryModule.getDischargingTime()
console.log('耗尽电量需要:', dischargingTime, '秒')
```

### getChargingTimeFormatted()

获取格式化的充电时间。

```typescript
const timeStr = batteryModule.getChargingTimeFormatted()
console.log('充电时间:', timeStr) // '2小时30分钟' 或 '未知'
```

### getDischargingTimeFormatted()

获取格式化的放电时间。

```typescript
const timeStr = batteryModule.getDischargingTimeFormatted()
console.log('续航时间:', timeStr) // '5小时20分钟' 或 '未知'
```

### isLowBattery()

检查电池是否电量低（默认阈值 20%）。

```typescript
if (batteryModule.isLowBattery()) {
 console.log('电量不足，请充电')
}

// 自定义阈值
if (batteryModule.isLowBattery(0.3)) {
 console.log('电量低于 30%')
}
```

### isHighBattery()

检查电池是否电量充足（默认阈值 80%）。

```typescript
if (batteryModule.isHighBattery()) {
 console.log('电量充足')
}

// 自定义阈值
if (batteryModule.isHighBattery(0.9)) {
 console.log('电量高于 90%')
}
```

### getBatteryStatus()

获取电池状态描述。

```typescript
const status = batteryModule.getBatteryStatus()
console.log('电池状态:', status)
// 'charging' - 充电中
// 'low'   - 电量低
// 'high'   - 电量高
// 'normal'  - 正常
```

## 监听电池变化

```typescript
detector.on('batteryChange', (batteryInfo) => {
 console.log('电池状态变化:', batteryInfo)

 const level = Math.round(batteryInfo.level * 100)

 if (batteryInfo.charging) {
  console.log(`充电中: ${level}%`)
 } else if (level < 20) {
  console.log(`电量不足: ${level}%`)
  enablePowerSavingMode()
 }
})
```

## 实际应用场景

### 省电模式

根据电池状态自动启用省电模式：

```typescript
const batteryModule = await detector.loadModule('battery')

function checkPowerSaving() {
 const level = batteryModule.getLevel()
 const charging = batteryModule.isCharging()

 if (charging) {
  // 充电中，关闭省电模式
  app.disablePowerSavingMode()
 } else if (level < 0.1) {
  // 电量极低（<10%），激进省电
  app.enableAggressivePowerSaving()
  app.showNotification('电量极低，已启用超级省电模式')
 } else if (level < 0.2) {
  // 电量低（<20%），适度省电
  app.enablePowerSavingMode()
  app.showNotification('电量不足，已启用省电模式')
 } else {
  // 电量充足，正常模式
  app.disablePowerSavingMode()
 }
}

// 初始检查
checkPowerSaving()

// 监听变化
detector.on('batteryChange', () => {
 checkPowerSaving()
})
```

### 性能调节

根据电池状态动态调整应用性能：

```typescript
const batteryModule = await detector.loadModule('battery')

detector.on('batteryChange', (info) => {
 const level = info.level

 if (info.charging) {
  // 充电时：启用所有功能
  app.setPerformanceMode('high')
  app.enableAnimations()
  app.setRefreshRate(60)
 } else if (level < 0.1) {
  // 电量极低：最小化功能
  app.setPerformanceMode('minimal')
  app.disableAnimations()
  app.setRefreshRate(30)
  app.pauseBackgroundTasks()
 } else if (level < 0.2) {
  // 电量低：减少功能
  app.setPerformanceMode('low')
  app.simplifyAnimations()
  app.setRefreshRate(30)
  app.reduceBackgroundTasks()
 } else {
  // 正常模式
  app.setPerformanceMode('normal')
  app.enableAnimations()
  app.setRefreshRate(60)
 }
})
```

### 充电提醒

提醒用户充电和拔掉充电器：

```typescript
const batteryModule = await detector.loadModule('battery')

let lastNotificationTime = 0
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000 // 5分钟冷却

detector.on('batteryChange', (info) => {
 const now = Date.now()

 // 避免频繁通知
 if (now - lastNotificationTime < NOTIFICATION_COOLDOWN) {
  return
 }

 // 低电量未充电提醒
 if (info.level < 0.2 && !info.charging) {
  app.showNotification({
   title: '电量不足',
   message: `当前电量 ${Math.round(info.level * 100)}%，请及时充电`,
   type: 'warning'
  })
  lastNotificationTime = now
 }

 // 充满电提醒
 if (info.level >= 0.95 && info.charging) {
  app.showNotification({
   title: '电量充足',
   message: '电池已充满，可以拔掉充电器',
   type: 'info'
  })
  lastNotificationTime = now
 }
})
```

### 电量显示

实时显示电池状态：

```typescript
const batteryModule = await detector.loadModule('battery')

function updateBatteryDisplay() {
 const info = batteryModule.getData()
 const percentage = Math.round(info.level * 100)

 // 更新电量图标
 const icon = getBatteryIcon(percentage, info.charging)
 document.querySelector('#battery-icon').textContent = icon

 // 更新电量文本
 document.querySelector('#battery-level').textContent = `${percentage}%`

 // 更新充电状态
 if (info.charging) {
  const time = batteryModule.getChargingTimeFormatted()
  document.querySelector('#battery-status').textContent = `充电中（${time}）`
 } else {
  const time = batteryModule.getDischargingTimeFormatted()
  document.querySelector('#battery-status').textContent = `续航：${time}`
 }
}

function getBatteryIcon(level, charging) {
 if (charging) return '🔌'
 if (level > 80) return '🔋'
 if (level > 50) return '🔋'
 if (level > 20) return '🪫'
 return '🪫'
}

// 初始显示
updateBatteryDisplay()

// 监听变化
detector.on('batteryChange', updateBatteryDisplay)
```

## Vue 3 集成

### 使用 useBattery Composable

```vue
<script setup>
import { useBattery } from '@ldesign/device/vue'
import { computed, onMounted } from 'vue'

const {
 batteryInfo,
 batteryLevel,
 isCharging,
 isLoaded,
 loadModule
} = useBattery()

// 加载电池模块
onMounted(async () => {
 try {
  await loadModule()
 } catch (error) {
  console.warn('电池 API 不可用')
 }
})

// 电量百分比
const levelPercentage = computed(() => {
 return Math.round(batteryLevel.value * 100)
})

// 电池状态
const batteryStatus = computed(() => {
 if (isCharging.value) return 'charging'
 if (levelPercentage.value < 20) return 'low'
 if (levelPercentage.value > 80) return 'high'
 return 'normal'
})

// 电池图标
const batteryIcon = computed(() => {
 if (isCharging.value) return '🔌'
 if (levelPercentage.value > 80) return '🔋'
 if (levelPercentage.value > 50) return '🔋'
 if (levelPercentage.value > 20) return '🪫'
 return '🪫'
})
</script>

<template>
 <div v-if="isLoaded" class="battery-widget">
  <!-- 电池图标 -->
  <div class="battery-icon">{{ batteryIcon }}</div>

  <!-- 电量显示 -->
  <div class="battery-info">
   <div class="battery-level">
    {{ levelPercentage }}%
   </div>

   <!-- 充电状态 -->
   <div v-if="isCharging" class="battery-status charging">
    充电中
   </div>

   <!-- 低电量警告 -->
   <div v-else-if="batteryStatus === 'low'" class="battery-status low">
    电量不足
   </div>
  </div>

  <!-- 电量条 -->
  <div class="battery-bar">
   <div
    class="battery-bar-fill"
    :style="{ width: `${levelPercentage}%` }"
    :class="batteryStatus"
   />
  </div>

  <!-- 详细信息 -->
  <details v-if="batteryInfo">
   <summary>详细信息</summary>
   <dl>
    <dt>充电状态</dt>
    <dd>{{ isCharging ? '充电中' : '未充电' }}</dd>

    <dt>充电时间</dt>
    <dd v-if="isCharging">
     {{
      Number.isFinite(batteryInfo.chargingTime)
       ? `${Math.round(batteryInfo.chargingTime / 60)} 分钟`
       : '未知'
     }}
    </dd>

    <dt>续航时间</dt>
    <dd v-if="!isCharging">
     {{
      Number.isFinite(batteryInfo.dischargingTime)
       ? `${Math.round(batteryInfo.dischargingTime / 60)} 分钟`
       : '未知'
     }}
    </dd>
   </dl>
  </details>
 </div>

 <div v-else-if="isLoaded === false" class="battery-unavailable">
  <p>电池信息不可用</p>
 </div>
</template>

<style scoped>
.battery-widget {
 padding: 16px;
 border-radius: 8px;
 background: #f5f5f5;
}

.battery-icon {
 font-size: 48px;
 text-align: center;
 margin-bottom: 8px;
}

.battery-info {
 text-align: center;
 margin-bottom: 12px;
}

.battery-level {
 font-size: 24px;
 font-weight: bold;
}

.battery-status {
 font-size: 14px;
 margin-top: 4px;
}

.battery-status.charging {
 color: #4caf50;
}

.battery-status.low {
 color: #f44336;
}

.battery-bar {
 height: 8px;
 background: #ddd;
 border-radius: 4px;
 overflow: hidden;
}

.battery-bar-fill {
 height: 100%;
 transition: width 0.3s, background-color 0.3s;
}

.battery-bar-fill.low {
 background: #f44336;
}

.battery-bar-fill.normal {
 background: #ffc107;
}

.battery-bar-fill.high {
 background: #4caf50;
}

.battery-bar-fill.charging {
 background: #2196f3;
}

details {
 margin-top: 16px;
}

dt {
 font-weight: bold;
 margin-top: 8px;
}

dd {
 margin: 4px 0 0 16px;
}
</style>
```

## 浏览器兼容性

| 浏览器 | 版本 | 支持程度 |
|----------|--------|------------|
| Chrome | 38+ | 完全支持 |
| Firefox | 43+ | 部分支持（桌面版无 chargingTime/dischargingTime） |
| Safari | 不支持 | 不支持 |
| Edge | 79+ | 完全支持 |

对于不支持 Battery Status API 的浏览器，加载模块时会抛出错误，建议使用 try-catch 处理：

```typescript
try {
 const batteryModule = await detector.loadModule('battery')
 // 使用电池模块
} catch (error) {
 console.warn('电池 API 不可用')
 // 提供降级方案
}
```

## 最佳实践

1. **检查支持情况**：始终使用 try-catch 处理加载失败
2. **避免频繁通知**：设置通知冷却时间
3. **用户体验**：低电量时自动优化性能
4. **隐私考虑**：部分浏览器可能因隐私原因限制 API
5. **优雅降级**：为不支持的浏览器提供基本功能

## 下一步

- [网络模块](./network-module.md) - 了解网络监控功能
- [地理位置模块](./geolocation-module.md) - 了解定位功能
- [最佳实践](./best-practices.md) - 学习最佳实践
