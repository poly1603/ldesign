# 事件系统

@ldesign/device 使用 EventEmitter 实现了简洁高效的事件机制。DeviceDetector 本身提供以下事件：

- deviceChange — 设备信息变化
- orientationChange — 屏幕方向变化
- resize — 视口尺寸变化
- networkChange — 来自 network 模块
- batteryChange — 来自 battery 模块
- positionChange — 来自 geolocation 模块
- error — 检测错误累计过多时

```ts
const detector = new DeviceDetector()

const handler = (info: DeviceInfo) => {
  console.log('设备更新', info)
}

detector.on('deviceChange', handler)

// 清理
detector.off('deviceChange', handler)
```

