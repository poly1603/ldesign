# 最佳实践

本指南提供了使用 @ldesign/device 的最佳实践和常见模式，帮助你构建高性能、可维护的应用。

## 性能优化

### 1. 按需加载模块

只加载应用实际需要的模块，避免不必要的资源消耗：

```typescript
// ✅ 推荐：按需加载
const detector = new DeviceDetector()

// 只在需要时加载网络模块
if (needNetworkInfo) {
  const networkModule = await detector.loadModule('network')
}

// ❌ 避免：一次性加载所有模块
await Promise.all([
  detector.loadModule('network'),
  detector.loadModule('battery'),
  detector.loadModule('geolocation'),
])
```

### 2. 合理使用防抖

根据应用需求调整防抖延迟：

```typescript
// 对于实时性要求高的应用
const detector = new DeviceDetector({
  debounceDelay: 100,
})

// 对于性能敏感的应用
const detector = new DeviceDetector({
  debounceDelay: 500,
})
```

### 3. 避免频繁检测

缓存检测结果，避免重复计算：

```typescript
class DeviceManager {
  private cachedInfo: DeviceInfo | null = null
  private lastUpdate = 0
  private readonly CACHE_DURATION = 5000 // 5秒缓存

  getDeviceInfo(): DeviceInfo {
    const now = Date.now()

    if (this.cachedInfo && now - this.lastUpdate < this.CACHE_DURATION) {
      return this.cachedInfo
    }

    this.cachedInfo = this.detector.getDeviceInfo()
    this.lastUpdate = now
    return this.cachedInfo
  }
}
```

### 4. 优化事件监听

及时清理事件监听器，避免内存泄漏：

```typescript
class ComponentManager {
  private detector: DeviceDetector
  private handlers = new Map()

  constructor() {
    this.detector = new DeviceDetector()
    this.setupEventListeners()
  }

  private setupEventListeners() {
    const deviceChangeHandler = (info: DeviceInfo) => {
      this.handleDeviceChange(info)
    }

    this.detector.on('deviceChange', deviceChangeHandler)
    this.handlers.set('deviceChange', deviceChangeHandler)
  }

  destroy() {
    // 清理所有事件监听器
    this.handlers.forEach((handler, event) => {
      this.detector.off(event, handler)
    })
    this.handlers.clear()

    // 销毁检测器
    this.detector.destroy()
  }
}
```

## 响应式设计

### 1. 设备类型适配

根据设备类型提供不同的用户体验：

```typescript
function adaptLayout(deviceType: DeviceType) {
  switch (deviceType) {
    case 'mobile':
      return {
        columns: 1,
        spacing: 8,
        fontSize: 14,
      }
    case 'tablet':
      return {
        columns: 2,
        spacing: 12,
        fontSize: 16,
      }
    case 'desktop':
      return {
        columns: 3,
        spacing: 16,
        fontSize: 18,
      }
  }
}
```

### 2. 屏幕方向处理

优雅处理屏幕方向变化：

```typescript
class OrientationManager {
  private currentOrientation: Orientation = 'portrait'

  constructor(private detector: DeviceDetector) {
    this.detector.on('orientationChange', this.handleOrientationChange.bind(this))
  }

  private handleOrientationChange(orientation: Orientation) {
    // 添加过渡动画
    document.body.classList.add('orientation-changing')

    setTimeout(() => {
      this.currentOrientation = orientation
      this.updateLayout()
      document.body.classList.remove('orientation-changing')
    }, 300)
  }

  private updateLayout() {
    if (this.currentOrientation === 'landscape') {
      // 横屏布局
      this.enableLandscapeMode()
    }
    else {
      // 竖屏布局
      this.enablePortraitMode()
    }
  }
}
```

### 3. 自定义断点

根据设计需求定义合适的断点：

```typescript
// 针对内容密集型应用
const contentAppBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
}

// 针对数据可视化应用
const dashboardBreakpoints = {
  mobile: 600,
  tablet: 1200,
  desktop: 1600,
}

const detector = new DeviceDetector({
  breakpoints: contentAppBreakpoints,
})
```

## 网络优化

### 1. 根据网络状态优化资源加载

```typescript
class ResourceManager {
  constructor(private detector: DeviceDetector) {
    this.setupNetworkOptimization()
  }

  private async setupNetworkOptimization() {
    const networkModule = await this.detector.loadModule('network')
    const networkInfo = networkModule.getData()

    this.detector.on('networkChange', (info) => {
      this.adaptToNetworkCondition(info)
    })

    this.adaptToNetworkCondition(networkInfo)
  }

  private adaptToNetworkCondition(networkInfo: NetworkInfo) {
    if (networkInfo.type === '2g' || networkInfo.saveData) {
      // 低速网络：加载低质量资源
      this.loadLowQualityAssets()
    }
    else if (networkInfo.type === '4g' || networkInfo.type === '5g') {
      // 高速网络：加载高质量资源
      this.loadHighQualityAssets()
    }
  }

  private loadLowQualityAssets() {
    // 加载压缩图片、减少动画等
  }

  private loadHighQualityAssets() {
    // 加载高清图片、启用动画等
  }
}
```

### 2. 离线状态处理

```typescript
class OfflineManager {
  private isOnline = true

  constructor(private detector: DeviceDetector) {
    this.setupOfflineHandling()
  }

  private async setupOfflineHandling() {
    const networkModule = await this.detector.loadModule('network')

    this.detector.on('networkChange', (info) => {
      const wasOnline = this.isOnline
      this.isOnline = info.status === 'online'

      if (!wasOnline && this.isOnline) {
        // 从离线恢复到在线
        this.handleBackOnline()
      }
      else if (wasOnline && !this.isOnline) {
        // 从在线变为离线
        this.handleGoOffline()
      }
    })
  }

  private handleBackOnline() {
    // 同步离线期间的数据
    this.syncOfflineData()
    // 显示恢复连接提示
    this.showConnectionRestoredMessage()
  }

  private handleGoOffline() {
    // 启用离线模式
    this.enableOfflineMode()
    // 显示离线提示
    this.showOfflineMessage()
  }
}
```

## 电池优化

### 1. 根据电池状态调整功能

```typescript
class PowerManager {
  constructor(private detector: DeviceDetector) {
    this.setupPowerOptimization()
  }

  private async setupPowerOptimization() {
    try {
      const batteryModule = await this.detector.loadModule('battery')

      this.detector.on('batteryChange', (info) => {
        this.adaptToBatteryLevel(info)
      })

      // 初始检查
      const batteryInfo = batteryModule.getData()
      this.adaptToBatteryLevel(batteryInfo)
    }
    catch (error) {
      console.warn('电池 API 不支持，跳过电池优化')
    }
  }

  private adaptToBatteryLevel(batteryInfo: BatteryInfo) {
    if (batteryInfo.level < 0.2 && !batteryInfo.charging) {
      // 低电量且未充电：启用省电模式
      this.enablePowerSavingMode()
    }
    else if (batteryInfo.level > 0.8 || batteryInfo.charging) {
      // 高电量或正在充电：启用完整功能
      this.enableFullFeatures()
    }
  }

  private enablePowerSavingMode() {
    // 减少动画
    document.body.classList.add('power-saving')
    // 降低刷新频率
    this.reduceUpdateFrequency()
    // 暂停非关键功能
    this.pauseNonEssentialFeatures()
  }

  private enableFullFeatures() {
    document.body.classList.remove('power-saving')
    this.restoreUpdateFrequency()
    this.resumeAllFeatures()
  }
}
```

## 地理位置最佳实践

### 1. 权限处理

```typescript
class LocationManager {
  private watchId: number | null = null

  async requestLocation(): Promise<GeolocationInfo | null> {
    try {
      const geolocationModule = await this.detector.loadModule('geolocation')

      if (!geolocationModule.isSupported()) {
        throw new Error('地理位置不支持')
      }

      return await geolocationModule.getCurrentPosition()
    }
    catch (error) {
      this.handleLocationError(error)
      return null
    }
  }

  private handleLocationError(error: any) {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        this.showPermissionDeniedMessage()
        break
      case 2: // POSITION_UNAVAILABLE
        this.showPositionUnavailableMessage()
        break
      case 3: // TIMEOUT
        this.showTimeoutMessage()
        break
      default:
        this.showGenericErrorMessage()
    }
  }

  async startLocationWatching(callback: (position: GeolocationInfo) => void) {
    try {
      const geolocationModule = await this.detector.loadModule('geolocation')
      this.watchId = await geolocationModule.startWatching(callback)
    }
    catch (error) {
      this.handleLocationError(error)
    }
  }

  stopLocationWatching() {
    if (this.watchId !== null) {
      const geolocationModule = this.detector.getModule('geolocation')
      geolocationModule?.stopWatching(this.watchId)
      this.watchId = null
    }
  }
}
```

## Vue 集成最佳实践

### 1. 组合式 API 使用

```vue
<script setup>
import { useBattery, useDevice, useNetwork } from '@ldesign/device/vue'
import { computed, watch } from 'vue'

// 基础设备信息
const { deviceType, orientation, isMobile } = useDevice()

// 网络状态
const { isOnline, connectionType } = useNetwork()

// 电池状态
const { level: batteryLevel, isCharging } = useBattery()

// 计算属性：综合状态
const deviceStatus = computed(() => ({
  device: deviceType.value,
  network: isOnline.value ? 'online' : 'offline',
  battery: batteryLevel.value ? `${Math.round(batteryLevel.value * 100)}%` : 'unknown',
}))

// 监听设备变化
watch(deviceType, (newType, oldType) => {
  console.log(`设备类型从 ${oldType} 变为 ${newType}`)
  // 根据设备类型调整布局
  adjustLayoutForDevice(newType)
})

// 监听网络变化
watch(isOnline, (online) => {
  if (online) {
    // 网络恢复，同步数据
    syncData()
  }
  else {
    // 网络断开，启用离线模式
    enableOfflineMode()
  }
})
</script>
```

### 2. 指令使用

```vue
<template>
  <!-- 基础指令使用 -->
  <nav v-device-mobile class="mobile-nav">
    移动端导航
  </nav>

  <nav v-device-desktop class="desktop-nav">
    桌面端导航
  </nav>

  <!-- 组合条件 -->
  <div v-device="{ type: 'mobile', orientation: 'portrait' }">
    移动端竖屏专用内容
  </div>

  <!-- 多设备支持 -->
  <div v-device="['tablet', 'desktop']">
    平板和桌面设备内容
  </div>
</template>
```

## 错误处理

### 1. 优雅降级

```typescript
class DeviceService {
  private detector: DeviceDetector | null = null

  async initialize() {
    try {
      this.detector = new DeviceDetector()
      return true
    }
    catch (error) {
      console.warn('设备检测初始化失败，使用默认配置', error)
      this.setupFallback()
      return false
    }
  }

  private setupFallback() {
    // 提供基础的设备检测功能
    this.detector = {
      getDeviceInfo: () => this.getFallbackDeviceInfo(),
      isMobile: () => this.isMobileUserAgent(),
      // ... 其他基础方法
    } as DeviceDetector
  }

  private getFallbackDeviceInfo(): DeviceInfo {
    return {
      type: this.isMobileUserAgent() ? 'mobile' : 'desktop',
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      isTouchDevice: 'ontouchstart' in window,
      userAgent: navigator.userAgent,
      os: { name: 'unknown', version: 'unknown' },
      browser: { name: 'unknown', version: 'unknown' },
    }
  }
}
```

### 2. 模块加载错误处理

```typescript
class ModuleManager {
  private loadedModules = new Set<string>()

  async safeLoadModule<T>(name: string): Promise<T | null> {
    try {
      if (this.loadedModules.has(name)) {
        return this.detector.getModule(name) as T
      }

      const module = await this.detector.loadModule<T>(name)
      this.loadedModules.add(name)
      return module
    }
    catch (error) {
      console.warn(`模块 ${name} 加载失败:`, error)
      return null
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo | null> {
    const networkModule = await this.safeLoadModule<NetworkModule>('network')
    return networkModule?.getData() || null
  }

  async getBatteryInfo(): Promise<BatteryInfo | null> {
    const batteryModule = await this.safeLoadModule<BatteryModule>('battery')
    return batteryModule?.getData() || null
  }
}
```

## 测试建议

### 1. 单元测试

```typescript
import { DeviceDetector } from '@ldesign/device'

describe('DeviceDetector', () => {
  let detector: DeviceDetector

  beforeEach(() => {
    detector = new DeviceDetector()
  })

  afterEach(async () => {
    await detector.destroy()
  })

  it('应该正确检测设备类型', () => {
    const deviceInfo = detector.getDeviceInfo()
    expect(['mobile', 'tablet', 'desktop']).toContain(deviceInfo.type)
  })

  it('应该正确处理事件监听', (done) => {
    detector.on('deviceChange', (info) => {
      expect(info).toBeDefined()
      done()
    })

    detector.refresh()
  })
})
```

### 2. 集成测试

```typescript
// 模拟不同设备环境
function mockMobileEnvironment() {
  Object.defineProperty(window, 'innerWidth', { value: 375 })
  Object.defineProperty(window, 'innerHeight', { value: 667 })
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  })
}

function mockDesktopEnvironment() {
  Object.defineProperty(window, 'innerWidth', { value: 1920 })
  Object.defineProperty(window, 'innerHeight', { value: 1080 })
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
}
```

## 总结

遵循这些最佳实践可以帮助你：

1. **提升性能** - 通过按需加载、缓存和优化事件处理
2. **改善用户体验** - 根据设备特性提供适配的界面和功能
3. **增强稳定性** - 通过错误处理和优雅降级
4. **便于维护** - 通过清晰的代码结构和测试覆盖

记住，设备检测应该用于增强用户体验，而不是限制功能。始终提供可访问的备选方案，确保所有用户都能正常使
用你的应用。
