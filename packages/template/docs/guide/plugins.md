# 插件系统

LDesign Template 提供了灵活的插件系统，允许开发者扩展和自定义模板管理功能。

## 插件概念

插件是一个包含 `install` 方法的对象，用于扩展模板管理器的功能：

```typescript
interface Plugin {
  name: string
  version?: string
  install: (manager: TemplateManager, options?: any) => void
}
```

## 创建插件

### 基础插件

```typescript
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  install(manager, options = {}) {
    // 扩展管理器功能
    manager.addMethod('customMethod', () => {
      console.log('自定义方法被调用')
    })

    // 监听事件
    manager.on('template:load', event => {
      console.log('插件监听到模板加载:', event.template)
    })

    // 添加自定义配置
    manager.setConfig('myPlugin', options)
  },
}
```

### 高级插件

```typescript
class AdvancedPlugin {
  name = 'advanced-plugin'
  version = '2.0.0'

  private manager: TemplateManager
  private options: any

  install(manager: TemplateManager, options: any = {}) {
    this.manager = manager
    this.options = options

    // 添加自定义加载器
    this.addCustomLoader()

    // 添加中间件
    this.addMiddleware()

    // 注册自定义指令
    this.registerDirectives()
  }

  private addCustomLoader() {
    this.manager.addLoader('remote', async (category, device, template) => {
      const url = `${this.options.baseUrl}/${category}/${device}/${template}.js`
      const response = await fetch(url)
      return await response.text()
    })
  }

  private addMiddleware() {
    this.manager.use('beforeLoad', async (context, next) => {
      console.log('加载前中间件:', context)
      await next()
    })

    this.manager.use('afterLoad', async (context, next) => {
      console.log('加载后中间件:', context)
      await next()
    })
  }

  private registerDirectives() {
    // 注册自定义指令
    this.manager.directive('my-template', {
      mounted(el, binding) {
        // 自定义指令逻辑
      },
    })
  }
}
```

## 使用插件

### 注册插件

```typescript
import { TemplateManager } from '@ldesign/template'
import myPlugin from './plugins/my-plugin'

const manager = new TemplateManager()

// 注册插件
manager.use(myPlugin, {
  // 插件选项
  option1: 'value1',
  option2: 'value2',
})
```

### Vue 插件集成

```typescript
import TemplatePlugin from '@ldesign/template'
// 在 Vue 应用中使用
import { createApp } from 'vue'
import myPlugin from './plugins/my-plugin'

const app = createApp(App)

app.use(TemplatePlugin, {
  plugins: [[myPlugin, { option: 'value' }]],
})
```

## 内置插件

### 1. 缓存插件

```typescript
const cachePlugin = {
  name: 'cache-plugin',

  install(manager, options = {}) {
    const { maxSize = 100, ttl = 30 * 60 * 1000, strategy = 'lru' } = options

    // 创建缓存实例
    const cache = new LRUCache(maxSize, ttl)

    // 拦截模板加载
    manager.interceptor('load', async (context, next) => {
      const key = `${context.category}:${context.device}:${context.template}`

      // 检查缓存
      const cached = cache.get(key)
      if (cached) {
        context.result = cached
        context.fromCache = true
        return
      }

      // 执行原始加载
      await next()

      // 缓存结果
      if (context.result) {
        cache.set(key, context.result)
      }
    })
  },
}
```

### 2. 日志插件

```typescript
const loggerPlugin = {
  name: 'logger-plugin',

  install(manager, options = {}) {
    const { level = 'info', format = 'json' } = options

    const logger = createLogger({ level, format })

    // 监听所有事件
    manager.on('*', event => {
      logger.log(event.type, event.data)
    })

    // 添加日志方法
    manager.addMethod('log', (message, level = 'info') => {
      logger.log(level, message)
    })
  },
}
```

### 3. 性能监控插件

```typescript
const performancePlugin = {
  name: 'performance-plugin',

  install(manager, options = {}) {
    const metrics = new Map()

    // 监控模板加载时间
    manager.on('template:beforeLoad', event => {
      metrics.set(event.id, Date.now())
    })

    manager.on('template:afterLoad', event => {
      const startTime = metrics.get(event.id)
      if (startTime) {
        const loadTime = Date.now() - startTime

        // 记录性能指标
        this.recordMetric('template-load-time', loadTime)

        // 慢加载警告
        if (loadTime > 1000) {
          console.warn(`模板 ${event.template} 加载较慢: ${loadTime}ms`)
        }

        metrics.delete(event.id)
      }
    })

    // 添加性能报告方法
    manager.addMethod('getPerformanceReport', () => {
      return this.generateReport()
    })
  },

  recordMetric(name, value) {
    // 记录性能指标的实现
  },

  generateReport() {
    // 生成性能报告的实现
  },
}
```

## 插件开发指南

### 1. 插件结构

```typescript
// plugins/my-plugin/index.ts
export interface MyPluginOptions {
  apiUrl?: string
  timeout?: number
  retries?: number
}

export class MyPlugin {
  name = 'my-plugin'
  version = '1.0.0'

  install(manager: TemplateManager, options: MyPluginOptions = {}) {
    // 插件逻辑
  }
}

export default new MyPlugin()
```

### 2. 类型定义

```typescript
// plugins/my-plugin/types.ts
export interface PluginContext {
  category: string
  device: DeviceType
  template: string
  options?: any
}

export interface PluginHooks {
  beforeLoad?: (context: PluginContext) => void | Promise<void>
  afterLoad?: (context: PluginContext) => void | Promise<void>
  onError?: (error: Error, context: PluginContext) => void
}
```

### 3. 插件配置

```typescript
// plugins/my-plugin/config.ts
export const defaultConfig = {
  enabled: true,
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
  cache: {
    enabled: true,
    maxSize: 50,
    ttl: 10 * 60 * 1000,
  },
}

export function validateConfig(config: any) {
  // 配置验证逻辑
  const errors: string[] = []

  if (config.timeout && config.timeout < 0) {
    errors.push('timeout 必须大于 0')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

## 插件生态

### 官方插件

1. **@ldesign/template-plugin-cache** - 高级缓存功能
2. **@ldesign/template-plugin-logger** - 日志记录
3. **@ldesign/template-plugin-analytics** - 使用分析
4. **@ldesign/template-plugin-dev-tools** - 开发工具

### 社区插件

1. **template-plugin-remote** - 远程模板加载
2. **template-plugin-i18n** - 国际化支持
3. **template-plugin-theme** - 主题切换
4. **template-plugin-auth** - 权限控制

### 插件安装

```bash
# 安装官方插件
pnpm add @ldesign/template-plugin-cache

# 安装社区插件
pnpm add template-plugin-remote
```

```typescript
// 使用插件
import cachePlugin from '@ldesign/template-plugin-cache'
import remotePlugin from 'template-plugin-remote'

const manager = new TemplateManager()

manager.use(cachePlugin, {
  maxSize: 200,
  ttl: 60 * 60 * 1000, // 1小时
})

manager.use(remotePlugin, {
  baseUrl: 'https://templates.example.com',
  timeout: 10000,
})
```

## 插件通信

### 事件系统

```typescript
// 插件A
const pluginA = {
  name: 'plugin-a',
  install(manager) {
    manager.on('custom:event', data => {
      console.log('插件A收到事件:', data)
    })
  },
}

// 插件B
const pluginB = {
  name: 'plugin-b',
  install(manager) {
    // 触发自定义事件
    manager.emit('custom:event', { message: 'Hello from Plugin B' })
  },
}
```

### 共享状态

```typescript
// 创建共享状态
const sharedState = {
  name: 'shared-state',
  install(manager) {
    const state = reactive({
      user: null,
      theme: 'light',
      language: 'zh-CN',
    })

    // 将状态注入到管理器
    manager.provide('sharedState', state)
  },
}

// 在其他插件中使用
const consumerPlugin = {
  name: 'consumer-plugin',
  install(manager) {
    const state = manager.inject('sharedState')

    // 监听状态变化
    watch(
      () => state.theme,
      newTheme => {
        console.log('主题变化:', newTheme)
      }
    )
  },
}
```

## 插件测试

### 单元测试

```typescript
import { TemplateManager } from '@ldesign/template'
// tests/plugins/my-plugin.test.ts
import { describe, expect, it, vi } from 'vitest'
import myPlugin from '../src/plugins/my-plugin'

describe('MyPlugin', () => {
  it('应该正确安装插件', () => {
    const manager = new TemplateManager()
    const spy = vi.spyOn(manager, 'addMethod')

    manager.use(myPlugin)

    expect(spy).toHaveBeenCalledWith('customMethod', expect.any(Function))
  })

  it('应该监听模板加载事件', () => {
    const manager = new TemplateManager()
    const spy = vi.spyOn(console, 'log')

    manager.use(myPlugin)
    manager.emit('template:load', { template: 'test' })

    expect(spy).toHaveBeenCalledWith('插件监听到模板加载:', 'test')
  })
})
```

### 集成测试

```typescript
import TemplatePlugin from '@ldesign/template'
// tests/integration/plugin-integration.test.ts
import { describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import myPlugin from '../src/plugins/my-plugin'

describe('插件集成测试', () => {
  it('应该在 Vue 应用中正常工作', async () => {
    const app = createApp({})

    app.use(TemplatePlugin, {
      plugins: [[myPlugin, { option: 'test' }]],
    })

    // 测试插件功能
    const manager = app.config.globalProperties.$templateManager
    expect(manager.customMethod).toBeDefined()
  })
})
```

## 最佳实践

1. **命名规范**: 使用 `template-plugin-` 前缀
2. **版本管理**: 遵循语义化版本规范
3. **文档完整**: 提供详细的使用文档
4. **类型支持**: 提供 TypeScript 类型定义
5. **测试覆盖**: 编写完整的单元测试和集成测试
6. **错误处理**: 优雅处理错误情况
7. **性能考虑**: 避免影响核心功能性能
8. **向后兼容**: 保持 API 的向后兼容性
