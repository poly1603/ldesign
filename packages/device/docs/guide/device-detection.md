# 设备检测

本章介绍如何使用 DeviceDetector 进行设备检测与监听。

## 获取设备信息

```ts
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector()
const info = detector.getDeviceInfo()
console.log(info.type, info.orientation, info.screen.width)
```

## 监听变化

```ts
// 设备综合变化
detector.on('deviceChange', (info) => {
  // 根据设备类型调整布局
})

// 屏幕方向变化
detector.on('orientationChange', (orientation) => {
  // portrait | landscape
})

// 视口尺寸变化
detector.on('resize', ({ width, height }) => {
  // 做一些尺寸相关的更新
})
```

## 自定义断点

```ts
const detector = new DeviceDetector({
  breakpoints: { mobile: 600, tablet: 1024 },
})
```

