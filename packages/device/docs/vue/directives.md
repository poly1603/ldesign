# 指令详解（Vue）

本文介绍 @ldesign/device 提供的 Vue 指令用法与最佳实践。

## v-device

根据设备类型控制元素显示/隐藏。

- 绑定值类型：`DeviceDirectiveValue`
  - `'mobile' | 'tablet' | 'desktop'`
  - `DeviceType[]`
  - `{ type: DeviceType | DeviceType[]; inverse?: boolean }`

示例：
```vue
<template>
  <!-- 只在移动端显示 -->
  <div v-device="'mobile'">
    移动端专属内容
  </div>

  <!-- 平板或桌面显示 -->
  <div v-device="['tablet', 'desktop']">
    宽屏布局
  </div>

  <!-- 反向匹配：非移动设备显示 -->
  <aside v-device="{ type: 'mobile', inverse: true }">
    侧边栏（非移动）
  </aside>
</template>
```

## v-network

根据网络状态显示/隐藏，可选回调用于响应网络变化。

- 绑定值类型：`NetworkStatus | NetworkStatus[] | { status: NetworkStatus | NetworkStatus[]; inverse?: boolean; callback?: (info: NetworkInfo) => void }`

示例：
```vue
<template>
  <div v-network="'online'">当前在线</div>
  <div v-network="'offline'">已离线，请检查网络</div>

  <div v-network="{ status: 'online', callback: (info) => console.log(info) }">
    在线时执行回调
  </div>
</template>
```

## v-battery

根据电池状态（charging/low/critical/full）显示/隐藏，支持阈值与回调。

- 绑定值类型：`'charging' | 'low' | 'critical' | 'full' | { condition: BatteryCondition | BatteryCondition[]; threshold?: number; inverse?: boolean; callback?: (battery: BatteryInfo) => void }`

示例：
```vue
<template>
  <div v-battery="'charging'">充电中</div>
  <div v-battery="'low'">电量不足（<=20%）</div>
  <div v-battery="{ condition: 'low', threshold: 0.3 }">低于 30%</div>
  <div v-battery="{ condition: 'critical', callback: (b) => notify(b) }">严重低电量</div>
</template>
```

说明：
- 低电量默认阈值为 0.2（20%）。
- 由于 Battery API 兼容性有限，在不支持的浏览器中不会触发变化事件。

## v-orientation

根据屏幕方向（portrait/landscape）显示/隐藏，支持回调。

- 绑定值类型：`Orientation | Orientation[] | { orientation: Orientation | Orientation[]; inverse?: boolean; callback?: (o: Orientation) => void }`

示例：
```vue
<template>
  <div v-orientation="'portrait'">竖屏布局</div>
  <div v-orientation="'landscape'">横屏布局</div>

  <div v-orientation="{ orientation: 'portrait', callback: (o) => console.log(o) }">
    竖屏回调
  </div>
</template>
```

## SSR 与性能注意

- 指令内部已做 SSR 保护，服务端渲染时不会访问 window/navigator。
- 指令内部使用批量调度与 requestAnimationFrame 减少重复更新。
- 网络与电池指令依赖相应模块按需加载；首次使用会触发模块加载与一次初始更新。

## 常见问题

- 在 iOS Safari 等环境，Battery API 不可用，v-battery 的判定将基于默认值。
- v-network 的变化依赖浏览器对 Network Information API 的支持；在不支持的浏览器中，仍可通过 online/offline 事件感知在线状态。

