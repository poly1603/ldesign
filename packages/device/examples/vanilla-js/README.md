# Vanilla JavaScript Example

这是一个使用原生 JavaScript 的 `@ldesign/device` 示例项目。

## 功能特性

- 📱 实时设备信息检测（类型、方向、尺寸等）
- 💻 系统信息显示（操作系统、浏览器）
- 🌐 网络状态监控（连接状态、类型、速度）
- 🔋 电池信息监控（电量、充电状态）
- 📍 地理位置获取
- 📋 实时事件日志
- 🎨 响应式设计

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
vanilla-js/
├── index.html          # 主页面
├── main.js            # 主要逻辑
├── package.json       # 项目配置
└── README.md         # 说明文档
```

## 主要功能

### 设备检测

```javascript
import { DeviceDetector } from '@ldesign/device'

// 创建检测器实例
const detector = new DeviceDetector({
  enableResize: true,
  enableOrientation: true,
  debounceDelay: 300
})

// 获取设备信息
const deviceInfo = detector.getDeviceInfo()
console.log(deviceInfo.type) // 'mobile' | 'tablet' | 'desktop'
```

### 事件监听

```javascript
// 监听设备变化
detector.on('deviceChange', (deviceInfo) => {
  console.log('设备信息变化:', deviceInfo)
})

// 监听方向变化
detector.on('orientationChange', (orientation) => {
  console.log('屏幕方向变化:', orientation)
})

// 监听窗口大小变化
detector.on('resize', ({ width, height }) => {
  console.log('窗口大小变化:', width, height)
})
```

### 模块加载

```javascript
// 加载网络模块
const networkModule = await detector.loadModule('network')
const networkInfo = networkModule.getData()

// 加载电池模块
const batteryModule = await detector.loadModule('battery')
const batteryInfo = batteryModule.getData()

// 加载地理位置模块
const geolocationModule = await detector.loadModule('geolocation')
const position = geolocationModule.getData()
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

1. **HTTPS 要求**: 某些功能（如地理位置、电池信息）需要在 HTTPS 环境下才能正常工作
2. **权限请求**: 地理位置功能需要用户授权
3. **API 支持**: 不同浏览器对某些 API 的支持程度不同

## 相关链接

- [项目主页](../../README.md)
- [API 文档](../../docs/)
- [Vue 示例](../vue-example/)