# 迁移指南 - v1.0.0-alpha.1

本文档详细说明了从 v0.x 版本迁移到 v1.0.0-alpha.1 的完整步骤和注意事项。

## 目录
- [概述](#概述)
- [破坏性变更](#破坏性变更)
- [迁移步骤](#迁移步骤)
- [代码示例](#代码示例)
- [常见问题](#常见问题)

## 概述

v1.0.0-alpha.1 是一个重大版本更新，专注于：
- 🎯 **性能优化**: 减少内存占用和提升运行速度
- 📦 **包体积优化**: 通过模块化和 tree-shaking 减小打包体积
- 🏗️ **架构改进**: 更清晰的模块边界和更好的可维护性

## 破坏性变更

### 1. 类型安全工具移除

#### 受影响的 API
```typescript
// 已移除
typedEmit(emitter, event, data)
typedOn(emitter, event, handler)
typedOnce(emitter, event, handler)
getTypedConfig(config, key, defaultValue)
setTypedConfig(config, key, value)
```

#### 迁移方案
```typescript
// 使用原生 EventEmitter API
emitter.emit(event, data)
emitter.on(event, handler)
emitter.once(event, handler)

// 使用 ConfigManager 原生方法
config.get(key, defaultValue)
config.set(key, value)
```

### 2. 验证工具类简化

#### 受影响的类
- `InputValidator` - 完全移除
- `ErrorUtil` - 完全移除
- `ValidationRule` - 简化接口

#### 迁移方案
```typescript
// 旧代码
import { InputValidator } from '@ldesign/engine'

// 新代码 - 使用第三方库或自定义验证
import { z } from 'zod'
const validator = new InputValidator()
validator.validate(input, rules) // 推荐使用 zod
const schema = z.object({
  name: z.string().min(1),
  age: z.number().positive()
})
schema.parse(input)
```

### 3. 内存管理工具简化

#### TimerManager 变更
```typescript
// 已移除的方法
timerManager.setTimeout(fn, delay, ...args)
timerManager.setInterval(fn, delay, ...args)
timerManager.clearTimeout(id)
timerManager.clearInterval(id)
timerManager.getActiveTimers()
timerManager.getPendingCount()

// 保留的方法
timerManager.clearAll() // 清理所有定时器
```

#### ListenerManager 变更
```typescript
// 已移除的方法
listenerManager.addEventListener(target, event, listener, options)
listenerManager.removeEventListener(target, event, listener)
listenerManager.getListenerCount()
listenerManager.getListenersByTarget(target)

// 保留的方法
listenerManager.removeAll() // 移除所有监听器
```

### 4. 性能监控简化

#### 已移除的功能
- FPS 监控
- 渲染指标收集
- 网络性能指标
- 自定义性能标记

#### 保留的功能
```typescript
// 基础性能指标
performanceManager.startMonitoring()
performanceManager.stopMonitoring()
performanceManager.getMetrics() // 返回 { memoryUsage, loadTime, domInteractive, domContentLoaded }
```

### 5. 通知系统简化

#### 已移除的配置
```typescript
// 不再支持动画配置
interface NotificationOptions {
  // animation?: 'slide' | 'fade' | 'bounce' ❌ 已移除
  // animationDuration?: number ❌ 已移除
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}
```

## 迁移步骤

### 步骤 1: 更新依赖

```bash
npm install @ldesign/engine@^1.0.0-alpha.1
```

### 步骤 2: 更新导入语句

```typescript
// 旧的导入方式
import Engine from '@ldesign/engine'
import { 
  DialogManager,
  NotificationManager,
  PerformanceManager,
  // ...所有管理器
} from '@ldesign/engine'

// 新的导入方式 - 核心引擎
import Engine from '@ldesign/engine'

import { createDialogManager } from '@ldesign/engine/dialog'
// 按需导入额外模块
import { createNotificationManager } from '@ldesign/engine/notifications'
import { PerformanceAnalyzer } from '@ldesign/engine/performance'
```

### 步骤 3: 更新初始化代码

```typescript
// 旧代码
const engine = new Engine({
  enableNotifications: true,
  enableDialogs: true,
  enablePerformance: true,
  enableAdvancedCache: true,
  performanceConfig: {
    enableFPS: true,
    enableNetworkMetrics: true
  }
})

// 新代码
const engine = new Engine({
  // 基础配置
  debug: false,
  plugins: []
})

// 按需初始化额外功能
async function setupOptionalFeatures() {
  if (needsNotifications) {
    const { createNotificationManager } = await import('@ldesign/engine/notifications')
    engine.notificationManager = createNotificationManager()
  }
  
  if (needsAdvancedPerformance) {
    const { PerformanceAnalyzer } = await import('@ldesign/engine/performance')
    engine.performanceAnalyzer = new PerformanceAnalyzer()
  }
}
```

### 步骤 4: 更新事件处理

```typescript
// 旧代码
import { typedEmit, typedOn } from '@ldesign/engine'

typedOn(engine, 'ready', (data: ReadyEvent) => {
  console.log('Engine ready', data)
})

typedEmit(engine, 'custom:event', { 
  timestamp: Date.now(),
  data: payload 
})

// 新代码
engine.on('ready', (data) => {
  console.log('Engine ready', data)
})

engine.emit('custom:event', {
  timestamp: Date.now(),
  data: payload
})
```

### 步骤 5: 更新测试代码

```typescript
// 旧的测试代码
describe('Engine', () => {
  it('should validate input', () => {
    const validator = new InputValidator()
    expect(validator.validate(input, rules)).toBe(true)
  })
  
  it('should track timers', () => {
    const id = timerManager.setTimeout(() => {}, 1000)
    expect(timerManager.getActiveTimers()).toContain(id)
  })
})

// 新的测试代码
describe('Engine', () => {
  it('should handle basic operations', () => {
    // 直接测试核心功能
    expect(engine.isReady).toBe(true)
  })
  
  it('should clean up resources', () => {
    timerManager.clearAll()
    // 验证清理完成
  })
})
```

## 代码示例

### 完整迁移示例

#### 旧版本代码
```typescript
import Engine, { 
  getTypedConfig, 
  InputValidator,
  typedEmit,
  typedOn 
} from '@ldesign/engine'


class MyApp {
  private engine: Engine
  private validator: InputValidator
  
  constructor() {
    this.engine = new Engine({
      enableNotifications: true,
      enablePerformance: true,
      performanceConfig: {
        enableFPS: true,
        sampleInterval: 100
      }
    })
    
    this.validator = new InputValidator()
    this.setupEventHandlers()
  }
  
  private setupEventHandlers() {
    typedOn(this.engine, 'plugin:loaded', (event) => {
      console.log('Plugin loaded:', event.pluginName)
    })
    
    typedOn(this.engine, 'performance:update', (metrics) => {
      if (metrics.fps < 30) {
        console.warn('Low FPS detected')
      }
    })
  }
  
  public async initialize() {
    await this.engine.initialize()
    
    const config = getTypedConfig(
      this.engine.config, 
      'app.settings',
      { theme: 'dark' }
    )
    
    this.applyConfig(config)
  }
  
  public validateUserInput(data: any) {
    return this.validator.validate(data, {
      name: { required: true, type: 'string' },
      age: { required: true, type: 'number', min: 0 }
    })
  }
  
  public showNotification(message: string) {
    this.engine.notificationManager.show({
      title: 'Info',
      message,
      animation: 'slide-in',
      duration: 3000
    })
  }
}
```

#### 新版本代码
```typescript
import Engine from '@ldesign/engine'

class MyApp {
  private engine: Engine
  private notificationManager?: any
  
  constructor() {
    this.engine = new Engine({
      // 仅基础配置
      debug: process.env.NODE_ENV === 'development'
    })
    
    this.setupEventHandlers()
  }
  
  private setupEventHandlers() {
    this.engine.on('plugin:loaded', (event: any) => {
      console.log('Plugin loaded:', event.pluginName)
    })
    
    // 性能监控改为按需使用
    if (this.needsPerformanceMonitoring()) {
      this.setupPerformanceMonitoring()
    }
  }
  
  private async setupPerformanceMonitoring() {
    const { PerformanceAnalyzer } = await import('@ldesign/engine/performance')
    const analyzer = new PerformanceAnalyzer()
    
    analyzer.on('metrics', (metrics: any) => {
      // 处理简化后的指标
      if (metrics.memoryUsage > 100 * 1024 * 1024) {
        console.warn('High memory usage detected')
      }
    })
  }
  
  public async initialize() {
    await this.engine.initialize()
    
    // 使用原生配置方法
    const config = this.engine.config.get('app.settings', { 
      theme: 'dark' 
    })
    
    this.applyConfig(config)
    
    // 按需加载通知管理器
    if (this.needsNotifications()) {
      await this.setupNotifications()
    }
  }
  
  private async setupNotifications() {
    const { createNotificationManager } = await import('@ldesign/engine/notifications')
    this.notificationManager = createNotificationManager()
  }
  
  public validateUserInput(data: any) {
    // 使用简单的自定义验证或第三方库
    if (!data.name || typeof data.name !== 'string') {
      return false
    }
    if (!data.age || typeof data.age !== 'number' || data.age < 0) {
      return false
    }
    return true
  }
  
  public showNotification(message: string) {
    if (!this.notificationManager) {
      console.log(message) // 降级处理
      return
    }
    
    this.notificationManager.show({
      title: 'Info',
      message,
      duration: 3000
      // 不再有 animation 选项
    })
  }
  
  private needsPerformanceMonitoring(): boolean {
    return process.env.ENABLE_PERFORMANCE === 'true'
  }
  
  private needsNotifications(): boolean {
    return !this.isHeadless()
  }
  
  private isHeadless(): boolean {
    return typeof window === 'undefined'
  }
  
  private applyConfig(config: any) {
    // 应用配置
  }
}

export default MyApp
```

## 常见问题

### Q1: 为什么移除了这么多功能？

**A**: 根据使用分析，很多功能的实际使用率很低，但却增加了包体积和复杂度。我们决定保留核心功能，将其他功能作为可选模块。

### Q2: 如何处理依赖已移除 API 的第三方插件？

**A**: 有几个选择：
1. 联系插件作者更新到新版本
2. 使用兼容层（见下方）
3. Fork 插件并自行修改

```typescript
// 兼容层示例
window.typedEmit = (emitter, event, data) => emitter.emit(event, data)
window.typedOn = (emitter, event, handler) => emitter.on(event, handler)
```

### Q3: 性能监控功能太简单了怎么办？

**A**: 对于需要详细性能监控的场景，我们建议：
1. 使用专业的 APM 工具（如 Sentry, DataDog）
2. 使用浏览器原生的 Performance API
3. 集成第三方性能监控库

### Q4: 如何逐步迁移大型项目？

**A**: 建议分阶段迁移：

1. **第一阶段**: 更新导入语句，使用兼容层
2. **第二阶段**: 逐个模块替换已弃用的 API
3. **第三阶段**: 移除兼容层，优化按需加载
4. **第四阶段**: 更新测试和文档

### Q5: 包体积减小了多少？

**A**: 
- **完整包**: 86.36KB → 83.7KB (Gzip后，-3.1%)
- **最小包**（仅核心）: ~30KB (Gzip后)
- **按需加载收益**: 根据使用的模块，可减少 50-70% 的体积

## 支持和反馈

如果在迁移过程中遇到问题，请：

1. 查看 [GitHub Issues](https://github.com/ldesign/engine/issues)
2. 查看 [完整 API 文档](./api-reference.md)
3. 在 [讨论区](https://github.com/ldesign/engine/discussions) 提问

## 下一步

- 查看 [性能优化详情](./performance-optimization.md) 了解优化细节
- 查看 [模块化架构说明](./modular-architecture.md) 了解新架构
- 查看 [最佳实践](./best-practices.md) 了解推荐用法