# 扩展性设计

## 🎯 设计理念

LDesign Engine 演示应用的扩展性设计基于"开放封闭原则"，即对扩展开放，对修改封闭。通过插件化架构、组
件化设计和配置化管理，确保应用能够灵活地扩展新功能，而无需修改核心代码。

## 🔌 插件开发指南

### 插件架构

```typescript
interface Plugin {
  name: string
  version: string
  install: (engine: Engine) => void | Promise<void>
  uninstall?: (engine: Engine) => void | Promise<void>
  dependencies?: string[]
  config?: Record<string, any>
}
```

### 创建自定义插件

1. **基础插件结构**

```typescript
// src/plugins/MyCustomPlugin.ts
import type { Engine, Plugin } from '@ldesign/engine'

export const MyCustomPlugin: Plugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',

  install(engine: Engine) {
    // 插件安装逻辑
    console.log('MyCustomPlugin installed')

    // 注册自定义方法
    engine.customMethod = () => {
      console.log('Custom method called')
    }

    // 监听事件
    engine.events.on('app:ready', () => {
      console.log('App is ready, plugin activated')
    })
  },

  uninstall(engine: Engine) {
    // 插件卸载逻辑
    console.log('MyCustomPlugin uninstalled')

    // 清理自定义方法
    delete (engine as any).customMethod

    // 移除事件监听
    engine.events.off('app:ready')
  },
}
```

2. **高级插件功能**

```typescript
// src/plugins/AdvancedPlugin.ts
export const AdvancedPlugin: Plugin = {
  name: 'advanced-plugin',
  version: '2.0.0',
  dependencies: ['my-custom-plugin'], // 依赖其他插件

  config: {
    enableFeatureA: true,
    maxRetries: 3,
    timeout: 5000,
  },

  async install(engine: Engine) {
    // 异步安装
    await this.initializeDatabase()

    // 注册中间件
    engine.middleware.use(async (context, next) => {
      console.log('Advanced plugin middleware')
      await next()
    })

    // 注册状态
    engine.state.set('advancedPlugin', {
      initialized: true,
      config: this.config,
    })
  },

  async initializeDatabase() {
    // 模拟数据库初始化
    return new Promise(resolve => setTimeout(resolve, 1000))
  },
}
```

### 插件注册和使用

```typescript
// src/main.ts
import { MyCustomPlugin, AdvancedPlugin } from './plugins'

async function bootstrap() {
  const engine = createEngine()

  // 注册插件
  await engine.use(MyCustomPlugin)
  await engine.use(AdvancedPlugin)

  // 启动应用
  const app = createApp(App)
  engine.install(app)
  app.mount('#app')
}
```

## 🧩 组件扩展

### 自定义演示组件

1. **创建新的演示组件**

```typescript
// src/components/demos/CustomDemo.tsx
import { defineComponent, ref, getCurrentInstance } from 'vue'
import type { Engine } from '@ldesign/engine'

export default defineComponent({
  name: 'CustomDemo',
  setup() {
    const instance = getCurrentInstance()
    const engine = instance?.appContext.config.globalProperties.$engine as Engine

    const customData = ref('')

    const handleCustomAction = () => {
      // 自定义逻辑
      engine?.logger.info('Custom action executed', { data: customData.value })
    }

    return () => (
      <div class='demo-page'>
        <div class='demo-header'>
          <h1 class='demo-title'>
            <span class='demo-icon'>🎨</span>
            自定义功能演示
          </h1>
          <p class='demo-description'>这是一个自定义的演示组件，展示如何扩展应用功能。</p>
        </div>

        <div class='demo-section'>
          <h2 class='section-title'>自定义操作</h2>
          <div class='section-content'>
            <div class='demo-card'>
              <div class='card-body'>
                <div class='form-group'>
                  <label>输入数据</label>
                  <input
                    type='text'
                    class='form-control'
                    v-model={customData.value}
                    placeholder='输入自定义数据...'
                  />
                </div>
              </div>
              <div class='card-footer'>
                <button class='btn btn-primary' onClick={handleCustomAction}>
                  执行自定义操作
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
})
```

2. **注册到应用**

```typescript
// src/components/MainContent.tsx
import CustomDemo from './demos/CustomDemo'

const demoComponents = {
  // 现有组件...
  custom: CustomDemo,
}
```

3. **添加到导航**

```typescript
// src/components/Sidebar.tsx
const demoGroups = [
  // 现有分组...
  {
    title: '扩展功能',
    items: [
      {
        key: 'custom',
        title: '自定义演示',
        icon: '🎨',
        description: '展示自定义功能的实现',
      },
    ],
  },
]
```

### 可复用组件

1. **创建通用组件**

```typescript
// src/components/common/CodeEditor.tsx
import { defineComponent, ref, watch } from 'vue'

interface Props {
  modelValue: string
  language?: string
  readonly?: boolean
}

export default defineComponent({
  name: 'CodeEditor',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'javascript',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props: Props, { emit }) {
    const editorRef = ref<HTMLTextAreaElement>()

    const updateValue = (value: string) => {
      emit('update:modelValue', value)
    }

    return () => (
      <div class='code-editor'>
        <div class='editor-header'>
          <span class='language-label'>{props.language}</span>
        </div>
        <textarea
          ref={editorRef}
          class='editor-content'
          value={props.modelValue}
          readonly={props.readonly}
          onInput={e => updateValue((e.target as HTMLTextAreaElement).value)}
        />
      </div>
    )
  },
})
```

2. **使用通用组件**

```typescript
// 在其他组件中使用
import CodeEditor from '@/components/common/CodeEditor'

// 在模板中
;<CodeEditor v-model={code.value} language='typescript' readonly={false} />
```

## 🎨 主题定制

### 主题系统架构

```typescript
// src/types/theme.ts
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    background: string
    surface: string
    text: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      xxl: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
  }
}
```

### 创建自定义主题

1. **定义主题**

```typescript
// src/themes/darkTheme.ts
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#646cff',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#ffffff',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
}
```

2. **主题管理器**

```typescript
// src/utils/themeManager.ts
export class ThemeManager {
  private currentTheme: Theme
  private themes: Map<string, Theme> = new Map()

  constructor() {
    this.registerTheme(lightTheme)
    this.registerTheme(darkTheme)
    this.currentTheme = lightTheme
  }

  registerTheme(theme: Theme) {
    this.themes.set(theme.name, theme)
  }

  setTheme(themeName: string) {
    const theme = this.themes.get(themeName)
    if (theme) {
      this.currentTheme = theme
      this.applyTheme(theme)
    }
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement

    // 应用颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // 应用字体变量
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value)
    })

    // 应用间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value)
    })
  }
}
```

### 主题切换组件

```typescript
// src/components/ThemeToggle.tsx
import { defineComponent, ref } from 'vue'
import { themeManager } from '@/utils/themeManager'

export default defineComponent({
  name: 'ThemeToggle',
  setup() {
    const currentTheme = ref('light')

    const toggleTheme = () => {
      const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
      currentTheme.value = newTheme
      themeManager.setTheme(newTheme)
    }

    return () => (
      <button class='theme-toggle' onClick={toggleTheme}>
        {currentTheme.value === 'light' ? '🌙' : '☀️'}
      </button>
    )
  },
})
```

## 🔧 API 扩展

### 自定义 API 接口

1. **扩展 Engine 接口**

```typescript
// src/types/engine-extensions.ts
declare module '@ldesign/engine' {
  interface Engine {
    customAPI: {
      getData: (id: string) => Promise<any>
      saveData: (data: any) => Promise<void>
      deleteData: (id: string) => Promise<void>
    }
  }
}
```

2. **实现自定义 API**

```typescript
// src/plugins/APIExtensionPlugin.ts
export const APIExtensionPlugin: Plugin = {
  name: 'api-extension',
  version: '1.0.0',

  install(engine: Engine) {
    // 扩展 API
    ;(engine as any).customAPI = {
      async getData(id: string) {
        // 模拟 API 调用
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ id, data: `Data for ${id}` })
          }, 1000)
        })
      },

      async saveData(data: any) {
        // 模拟保存数据
        console.log('Saving data:', data)
        return new Promise(resolve => {
          setTimeout(resolve, 500)
        })
      },

      async deleteData(id: string) {
        // 模拟删除数据
        console.log('Deleting data:', id)
        return new Promise(resolve => {
          setTimeout(resolve, 300)
        })
      },
    }
  },
}
```

### 中间件扩展

```typescript
// src/middleware/LoggingMiddleware.ts
export const loggingMiddleware = async (context: any, next: () => Promise<void>) => {
  const start = Date.now()

  console.log(`[${new Date().toISOString()}] Request started`)

  try {
    await next()
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] Request completed in ${duration}ms`)
  } catch (error) {
    const duration = Date.now() - start
    console.error(`[${new Date().toISOString()}] Request failed in ${duration}ms:`, error)
    throw error
  }
}

// 注册中间件
engine.middleware.use(loggingMiddleware)
```

## 📦 配置扩展

### 配置系统

```typescript
// src/config/AppConfig.ts
export interface AppConfig {
  theme: {
    default: string
    available: string[]
  }
  features: {
    enableCodeEditor: boolean
    enablePerformanceMonitor: boolean
    enableSecurityDemo: boolean
  }
  api: {
    baseURL: string
    timeout: number
    retries: number
  }
  debug: {
    enabled: boolean
    level: 'debug' | 'info' | 'warn' | 'error'
  }
}

export const defaultConfig: AppConfig = {
  theme: {
    default: 'light',
    available: ['light', 'dark'],
  },
  features: {
    enableCodeEditor: true,
    enablePerformanceMonitor: true,
    enableSecurityDemo: true,
  },
  api: {
    baseURL: '/api',
    timeout: 5000,
    retries: 3,
  },
  debug: {
    enabled: import.meta.env.DEV,
    level: 'info',
  },
}
```

### 配置管理器

```typescript
// src/utils/ConfigManager.ts
export class ConfigManager {
  private config: AppConfig

  constructor(initialConfig: AppConfig = defaultConfig) {
    this.config = { ...initialConfig }
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value
    this.notifyChange(key, value)
  }

  update(updates: Partial<AppConfig>): void {
    Object.assign(this.config, updates)
    Object.entries(updates).forEach(([key, value]) => {
      this.notifyChange(key as keyof AppConfig, value)
    })
  }

  private notifyChange<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    // 发送配置变更事件
    window.dispatchEvent(
      new CustomEvent('config:change', {
        detail: { key, value },
      })
    )
  }
}
```

## 🧪 测试扩展

### 自定义测试工具

```typescript
// tests/utils/testHelpers.ts
export function createMockEngine(): Engine {
  return {
    config: defaultConfig,
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    events: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
    plugins: {
      getAll: vi.fn(() => []),
      register: vi.fn(),
      unregister: vi.fn(),
    },
    state: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      keys: vi.fn(() => []),
    },
  } as any
}

export function mountWithEngine(component: any, engine?: Engine) {
  return mount(component, {
    global: {
      config: {
        globalProperties: {
          $engine: engine || createMockEngine(),
        },
      },
    },
  })
}
```

### 插件测试

```typescript
// tests/unit/plugins/MyCustomPlugin.test.ts
import { describe, it, expect, vi } from 'vitest'
import { MyCustomPlugin } from '@/plugins/MyCustomPlugin'
import { createMockEngine } from '@/tests/utils/testHelpers'

describe('MyCustomPlugin', () => {
  it('should install correctly', async () => {
    const engine = createMockEngine()

    await MyCustomPlugin.install(engine)

    expect(engine.customMethod).toBeDefined()
    expect(engine.events.on).toHaveBeenCalledWith('app:ready', expect.any(Function))
  })

  it('should uninstall correctly', async () => {
    const engine = createMockEngine()

    await MyCustomPlugin.install(engine)
    await MyCustomPlugin.uninstall?.(engine)

    expect((engine as any).customMethod).toBeUndefined()
    expect(engine.events.off).toHaveBeenCalledWith('app:ready')
  })
})
```

## 📚 扩展最佳实践

### 1. 插件开发原则

- **单一职责**: 每个插件只负责一个特定功能
- **松耦合**: 插件之间应该尽量减少依赖
- **可配置**: 提供配置选项以适应不同需求
- **错误处理**: 优雅地处理错误和异常情况

### 2. 组件设计原则

- **可复用**: 设计通用的组件以便在多处使用
- **可组合**: 支持组件的组合和嵌套
- **类型安全**: 使用 TypeScript 确保类型安全
- **性能优化**: 避免不必要的重渲染

### 3. API 设计原则

- **一致性**: 保持 API 接口的一致性
- **向后兼容**: 新版本应该向后兼容
- **文档完善**: 提供详细的 API 文档
- **错误处理**: 提供清晰的错误信息

### 4. 测试策略

- **全面覆盖**: 确保测试覆盖所有扩展功能
- **隔离测试**: 每个测试应该独立运行
- **模拟依赖**: 使用 Mock 隔离外部依赖
- **持续集成**: 集成到 CI/CD 流程中

---

通过这些扩展机制，LDesign Engine 演示应用可以灵活地适应各种需求，为开发者提供强大的定制能力。
