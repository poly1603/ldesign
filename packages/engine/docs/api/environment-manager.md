# 环境管理器 (EnvironmentManager)

环境管理器负责检测和适配运行环境，提供智能的环境检测、特性检测和自动适配功能。

## 概述

EnvironmentManager 是 LDesign Engine 的核心管理器之一，它能够：

- 🔍 **智能环境检测** - 自动识别运行平台、浏览器、设备类型
- 🎯 **精确特性检测** - 检测 Web API 和浏览器特性支持情况
- ⚙️ **自动环境适配** - 根据环境自动调整配置和优化策略
- 📊 **性能监控** - 监控环境性能指标和变化
- 🔄 **动态适配** - 支持运行时环境变化的动态适配

## 基础用法

### 获取环境信息

```typescript
import { createEngine } from '@ldesign/engine'

const engine = createEngine()

// 检测当前环境
const envInfo = engine.environment.detect()

console.log('环境信息:', {
  platform: envInfo.platform, // 'browser' | 'node' | 'webworker' | 'electron'
  environment: envInfo.environment, // 'development' | 'production' | 'test'
  browser: envInfo.browser, // { name: string, version: string }
  device: envInfo.device, // { type: string, isMobile: boolean }
  features: envInfo.features // Record<string, boolean>
})
```

### 特性检测

```typescript
// 检测特定特性
const hasWebGL = engine.environment.hasFeature('hasWebGL')
const hasLocalStorage = engine.environment.hasFeature('hasLocalStorage')
const hasServiceWorker = engine.environment.hasFeature('hasServiceWorker')

// 获取所有特性
const allFeatures = engine.environment.getFeatures()
console.log('支持的特性:', allFeatures)

// 检查兼容性
const isCompatible = engine.environment.checkCompatibility({
  webgl: true,
  localStorage: true,
  es6: true
})
```

### 环境适配

```typescript
// 获取当前适配配置
const adaptation = engine.environment.getAdaptation()

// 设置自定义适配
engine.environment.setAdaptation({
  performance: {
    enableAnimations: !envInfo.device.isMobile,
    cacheSize: envInfo.device.isMobile ? 50 : 100
  },
  ui: {
    density: envInfo.device.isMobile ? 'compact' : 'comfortable'
  }
})

// 为特定环境适配
const mobileAdaptation = engine.environment.adaptForEnvironment({
  device: { isMobile: true, type: 'mobile' }
})
```

## API 参考

### 接口定义

```typescript
interface EnvironmentManager {
  // 环境检测
  detect: () => EnvironmentInfo
  getEnvironment: () => string
  getPlatform: () => string
  getBrowser: () => { name: string, version: string }
  getDevice: () => { type: string, isMobile: boolean }

  // 特性检测
  hasFeature: (feature: string) => boolean
  getFeatures: () => Record<string, boolean>
  checkCompatibility: (requirements: Record<string, any>) => boolean

  // 环境适配
  getAdaptation: () => any
  setAdaptation: (adaptation: any) => void
  adaptForEnvironment: (env: any) => any

  // 性能监控
  getPerformanceInfo: () => any
  monitorPerformance: (callback: (info: any) => void) => void

  // 事件监听
  onEnvironmentChange: (callback: (info: any) => void) => () => void
  onFeatureChange: (feature: string, callback: (available: boolean) => void) => () => void
}
```

### 类型定义

```typescript
// 环境类型
type Environment = 'development' | 'production' | 'test'
type Platform = 'browser' | 'node' | 'webworker' | 'electron' | 'unknown'
type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie' | 'opera' | 'unknown'
type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'

// 环境信息
interface EnvironmentInfo {
  environment: Environment
  platform: Platform
  browser: { name: Browser, version: string, userAgent: string }
  device: { type: DeviceType, isMobile: boolean, isTablet: boolean }
  features: Record<string, boolean>
  performance: any
  screen: any
  timezone: any
}

// 特性检测结果
interface FeatureDetection {
  // 存储特性
  hasLocalStorage: boolean
  hasSessionStorage: boolean
  hasIndexedDB: boolean

  // 网络特性
  hasServiceWorker: boolean
  hasWebSocket: boolean
  hasFetch: boolean

  // 图形特性
  hasWebGL: boolean
  hasWebGL2: boolean
  hasCanvas: boolean

  // 媒体特性
  hasWebRTC: boolean
  hasMediaDevices: boolean
  hasAudioContext: boolean

  // 设备特性
  hasTouchSupport: boolean
  hasGeolocation: boolean
  hasDeviceMotion: boolean

  // 现代特性
  hasES6: boolean
  hasModules: boolean
  hasWebAssembly: boolean
  hasWebWorker: boolean
}
```

## 详细功能

### 环境检测

环境管理器能够准确检测各种运行环境：

```typescript
// 平台检测
const platform = engine.environment.getPlatform()
switch (platform) {
  case 'browser':
    console.log('运行在浏览器中')
    break
  case 'node':
    console.log('运行在 Node.js 中')
    break
  case 'webworker':
    console.log('运行在 Web Worker 中')
    break
  case 'electron':
    console.log('运行在 Electron 中')
    break
}

// 浏览器检测
const browser = engine.environment.getBrowser()
console.log(`浏览器: ${browser.name} ${browser.version}`)

// 设备检测
const device = engine.environment.getDevice()
if (device.isMobile) {
  console.log('移动设备')
}
else {
  console.log('桌面设备')
}
```

### 特性检测

支持检测各种 Web API 和浏览器特性：

```typescript
// 存储特性
if (engine.environment.hasFeature('hasLocalStorage')) {
  // 使用 localStorage
  localStorage.setItem('key', 'value')
}

// 图形特性
if (engine.environment.hasFeature('hasWebGL')) {
  // 启用 WebGL 渲染
  initWebGLRenderer()
}

// 网络特性
if (engine.environment.hasFeature('hasServiceWorker')) {
  // 注册 Service Worker
  navigator.serviceWorker.register('/sw.js')
}

// 设备特性
if (engine.environment.hasFeature('hasTouchSupport')) {
  // 启用触摸交互
  enableTouchGestures()
}
```

### 兼容性检查

检查应用的兼容性要求：

```typescript
const requirements = {
  webgl: true,
  localStorage: true,
  es6: true,
  serviceWorker: false // 可选特性
}

const isCompatible = engine.environment.checkCompatibility(requirements)

if (!isCompatible) {
  // 显示兼容性警告或降级方案
  showCompatibilityWarning()
}
```

### 性能监控

监控环境性能指标：

```typescript
// 获取性能信息
const perfInfo = engine.environment.getPerformanceInfo()
console.log('性能信息:', {
  memory: perfInfo.memory,
  timing: perfInfo.timing,
  connection: perfInfo.connection
})

// 监控性能变化
engine.environment.monitorPerformance((info) => {
  console.log('性能更新:', info)

  // 根据性能调整配置
  if (info.memory.usedJSHeapSize > 50 * 1024 * 1024) {
    // 内存使用过高，启用优化模式
    enableOptimizationMode()
  }
})
```

### 动态适配

根据环境变化动态调整配置：

```typescript
// 监听环境变化
engine.environment.onEnvironmentChange((envInfo) => {
  console.log('环境发生变化:', envInfo)

  // 重新适配配置
  const newAdaptation = engine.environment.adaptForEnvironment(envInfo)
  engine.environment.setAdaptation(newAdaptation)
})

// 监听特定特性变化
engine.environment.onFeatureChange('hasServiceWorker', (available) => {
  if (available) {
    // Service Worker 可用，启用离线功能
    enableOfflineMode()
  }
  else {
    // Service Worker 不可用，禁用离线功能
    disableOfflineMode()
  }
})
```

## 最佳实践

### 1. 渐进式增强

```typescript
// 基础功能始终可用
function initBasicFeatures() {
  // 核心功能实现
}

// 根据特性支持情况启用增强功能
function initEnhancedFeatures() {
  if (engine.environment.hasFeature('hasWebGL')) {
    initWebGLFeatures()
  }

  if (engine.environment.hasFeature('hasServiceWorker')) {
    initOfflineFeatures()
  }

  if (engine.environment.hasFeature('hasWebRTC')) {
    initRealTimeFeatures()
  }
}
```

### 2. 响应式适配

```typescript
// 根据设备类型调整界面
const device = engine.environment.getDevice()

if (device.isMobile) {
  // 移动端优化
  engine.config.set('ui.density', 'compact')
  engine.config.set('animation.duration', 200)
  engine.config.set('cache.maxSize', 50)
}
else {
  // 桌面端配置
  engine.config.set('ui.density', 'comfortable')
  engine.config.set('animation.duration', 300)
  engine.config.set('cache.maxSize', 200)
}
```

### 3. 性能优化

```typescript
// 根据性能情况调整配置
const perfInfo = engine.environment.getPerformanceInfo()

if (perfInfo.memory.jsHeapSizeLimit < 100 * 1024 * 1024) {
  // 低内存设备优化
  engine.config.set('performance.enableLazyLoading', true)
  engine.config.set('performance.maxConcurrentRequests', 2)
}
else {
  // 高性能设备配置
  engine.config.set('performance.enableLazyLoading', false)
  engine.config.set('performance.maxConcurrentRequests', 6)
}
```

### 4. 错误处理

```typescript
try {
  const envInfo = engine.environment.detect()

  // 检查关键特性
  const criticalFeatures = ['hasLocalStorage', 'hasES6']
  const missingFeatures = criticalFeatures.filter(
    feature => !engine.environment.hasFeature(feature)
  )

  if (missingFeatures.length > 0) {
    throw new Error(`缺少关键特性: ${missingFeatures.join(', ')}`)
  }
}
catch (error) {
  console.error('环境检测失败:', error)
  // 显示兼容性错误页面
  showCompatibilityError(error.message)
}
```

## 常见问题

### Q: 如何检测特定的浏览器版本？

```typescript
const browser = engine.environment.getBrowser()
const version = Number.parseFloat(browser.version)

if (browser.name === 'chrome' && version >= 90) {
  // Chrome 90+ 特性
}
else if (browser.name === 'firefox' && version >= 88) {
  // Firefox 88+ 特性
}
```

### Q: 如何处理环境检测失败？

```typescript
try {
  const envInfo = engine.environment.detect()
}
catch (error) {
  // 使用默认环境配置
  const fallbackEnv = {
    platform: 'browser',
    environment: 'production',
    browser: { name: 'unknown', version: '0' },
    device: { type: 'desktop', isMobile: false }
  }

  engine.environment.setAdaptation(
    engine.environment.adaptForEnvironment(fallbackEnv)
  )
}
```

### Q: 如何自定义特性检测？

```typescript
// 扩展特性检测
const customFeatures = {
  hasCustomAPI: () => typeof window.customAPI !== 'undefined',
  hasAdvancedFeature: () => {
    try {
      return window.navigator.userAgent.includes('Advanced')
    }
    catch {
      return false
    }
  }
}

// 注册自定义特性（如果支持的话）
Object.entries(customFeatures).forEach(([name, detector]) => {
  if (detector()) {
    console.log(`支持特性: ${name}`)
  }
})
```

## 相关链接

- [配置管理器](./config-manager.md)
- [性能管理器](./performance-manager.md)
- [安全管理器](./security-manager.md)
- [环境适配指南](../guide/environment.md)
