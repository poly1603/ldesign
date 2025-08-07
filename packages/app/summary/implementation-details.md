# 实现细节

## 🏗️ 核心架构实现

### 应用启动流程

```typescript
// src/main.ts - 应用启动的核心流程
async function bootstrap() {
  try {
    // 1. 创建引擎实例
    const engine = createEngine({
      ...presets.development(),
      config: {
        debug: true,
        appName: 'LDesign Engine Demo',
        version: '0.1.0',
      },
    })

    // 2. 创建 Vue 应用
    const app = createApp(App)

    // 3. 安装引擎到 Vue 应用
    engine.install(app)

    // 4. 全局属性注入
    app.config.globalProperties.$engine = engine

    // 5. 全局错误处理
    app.config.errorHandler = (err, instance, info) => {
      engine.errors.captureError(err as Error, instance?.$?.type, info)
    }

    // 6. 挂载应用
    app.mount('#app')

    // 7. 发送启动完成事件
    engine.events.emit('app:mounted', {
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    })
  } catch (error) {
    // 错误处理和用户友好的错误页面
    handleBootstrapError(error)
  }
}
```

### 组件通信机制

```typescript
// 使用 Engine 的事件系统实现组件间通信
export default defineComponent({
  setup() {
    const engine = getCurrentInstance()?.appContext.config.globalProperties.$engine

    // 监听全局事件
    onMounted(() => {
      engine?.events.on('demo:navigate', ({ demo }) => {
        // 处理导航事件
        currentDemo.value = demo
      })
    })

    // 发送事件
    const handleFeatureClick = (demo: string) => {
      engine?.events.emit('demo:navigate', { demo })
    }

    return { handleFeatureClick }
  },
})
```

## 🎨 UI 组件实现

### 响应式布局系统

```typescript
// src/components/Layout.tsx - 核心布局实现
export default defineComponent({
  setup() {
    const sidebarCollapsed = ref(false)
    const currentDemo = ref('overview')

    // 响应式类名计算
    const layoutClass = computed(() => ({
      layout: true,
      'layout-sidebar-collapsed': sidebarCollapsed.value,
    }))

    // 侧边栏切换逻辑
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value

      // 记录用户操作
      engine?.logger.debug('侧边栏状态切换', {
        collapsed: sidebarCollapsed.value,
        timestamp: new Date().toISOString(),
      })
    }

    return () => (
      <div class={layoutClass.value}>
        <Header sidebarCollapsed={sidebarCollapsed.value} onToggleSidebar={toggleSidebar} />
        <div class='layout-body'>
          <Sidebar collapsed={sidebarCollapsed.value} />
          <MainContent sidebarCollapsed={sidebarCollapsed.value} />
        </div>
      </div>
    )
  },
})
```

### 动态组件加载

```typescript
// src/components/MainContent.tsx - 动态组件系统
export default defineComponent({
  setup(props) {
    // 组件映射表
    const demoComponents = {
      overview: OverviewDemo,
      plugin: PluginDemo,
      middleware: MiddlewareDemo,
      state: StateDemo,
      event: EventDemo,
      logger: LoggerDemo,
      notification: NotificationDemo,
      directive: DirectiveDemo,
      cache: CacheDemo,
      performance: PerformanceDemo,
      security: SecurityDemo,
    }

    // 动态计算当前组件
    const currentComponent = computed(() => {
      return demoComponents[props.currentDemo as keyof typeof demoComponents] || OverviewDemo
    })

    return () => (
      <main class='main-content'>
        <div class='demo-container'>
          {/* 动态渲染组件 */}
          <currentComponent.value />
        </div>
      </main>
    )
  },
})
```

## 🔧 状态管理实现

### 本地状态管理

```typescript
// 使用 Vue 3 的响应式系统管理本地状态
export default defineComponent({
  setup() {
    // 响应式状态
    const state = reactive({
      loading: false,
      error: null as string | null,
      data: [] as any[],
    })

    // 计算属性
    const hasData = computed(() => state.data.length > 0)
    const isReady = computed(() => !state.loading && !state.error)

    // 状态更新方法
    const updateState = (updates: Partial<typeof state>) => {
      Object.assign(state, updates)
    }

    // 异步操作
    const fetchData = async () => {
      updateState({ loading: true, error: null })

      try {
        const data = await api.getData()
        updateState({ data, loading: false })
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : '未知错误',
          loading: false,
        })
      }
    }

    return {
      state: readonly(state),
      hasData,
      isReady,
      fetchData,
    }
  },
})
```

### 全局状态集成

```typescript
// 与 Engine 状态管理器的集成
export function useEngineState<T>(key: string, defaultValue: T) {
  const engine = getCurrentInstance()?.appContext.config.globalProperties.$engine

  const state = ref<T>(engine?.state.get(key) ?? defaultValue)

  // 监听状态变化
  watchEffect(() => {
    if (engine) {
      engine.state.set(key, state.value)
    }
  })

  // 从引擎同步状态
  onMounted(() => {
    if (engine) {
      const engineValue = engine.state.get(key)
      if (engineValue !== undefined) {
        state.value = engineValue
      }
    }
  })

  return state
}
```

## 📝 样式系统实现

### CSS 变量系统

```less
// src/styles/variables.less - 设计令牌系统
:root {
  // 颜色系统
  --color-primary: #646cff;
  --color-primary-hover: #535bf2;
  --color-primary-active: #4338ca;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  // 间距系统
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;

  // 字体系统
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-code: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;

  // 阴影系统
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

### 组件样式架构

```less
// 组件样式的模块化组织
.demo-page {
  // 使用 CSS 变量
  padding: var(--spacing-lg);
  background-color: var(--color-background);

  .demo-header {
    margin-bottom: var(--spacing-xl);

    .demo-title {
      font-size: var(--font-size-xxl);
      color: var(--color-text);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: var(--spacing-md);

    .demo-title {
      font-size: var(--font-size-xl);
    }
  }
}
```

## 🧪 测试实现策略

### 单元测试架构

```typescript
// tests/unit/App.test.tsx - 组件测试实现
describe('App', () => {
  let wrapper: any
  let mockEngine: any

  beforeEach(() => {
    // 创建模拟引擎
    mockEngine = {
      config: { debug: true },
      logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      },
      events: {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
      },
    }
  })

  it('should render without crashing', () => {
    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should emit app:ready event when initialized', async () => {
    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    })

    // 等待组件初始化
    await new Promise(resolve => setTimeout(resolve, 200))

    // 验证事件发送
    expect(mockEngine.events.emit).toHaveBeenCalledWith('app:ready', {
      timestamp: expect.any(String),
    })
  })
})
```

### E2E 测试实现

```typescript
// tests/e2e/app.spec.ts - 端到端测试
test.describe('LDesign Engine Demo App', () => {
  test('should navigate between demos', async ({ page }) => {
    await page.goto('/')

    // 等待应用加载
    await page.waitForSelector('.layout')

    // 点击插件演示
    await page.locator('.nav-item').filter({ hasText: '插件系统' }).click()

    // 验证页面内容
    await expect(page.locator('h1')).toContainText('插件系统演示')

    // 验证 URL 变化（如果有路由）
    // await expect(page).toHaveURL(/.*plugin/)
  })

  test('should handle responsive design', async ({ page }) => {
    // 测试不同视口尺寸
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1200, height: 800 }, // Desktop
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')

      // 验证布局适应性
      await expect(page.locator('.layout')).toBeVisible()

      // 在移动端验证侧边栏行为
      if (viewport.width < 768) {
        const sidebar = page.locator('.sidebar')
        // 验证移动端侧边栏是否正确隐藏/显示
      }
    }
  })
})
```

## ⚡ 性能优化实现

### 代码分割策略

```typescript
// vite.config.ts - 构建优化配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks: {
          // 第三方库分离
          vendor: ['vue'],
          engine: ['@ldesign/engine'],

          // 按功能分割
          demos: [
            './src/components/demos/PluginDemo',
            './src/components/demos/MiddlewareDemo',
            './src/components/demos/StateDemo',
          ],

          // 工具库分离
          utils: ['./src/utils/index'],
        },
      },
    },
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', '@ldesign/engine'],
    exclude: ['@vite/client', '@vite/env'],
  },
})
```

### 组件懒加载

```typescript
// 动态导入实现懒加载
const demoComponents = {
  overview: () => import('./demos/OverviewDemo'),
  plugin: () => import('./demos/PluginDemo'),
  middleware: () => import('./demos/MiddlewareDemo'),
  // ... 其他组件
}

// 在组件中使用
const currentComponent = computed(() => {
  const componentLoader = demoComponents[props.currentDemo]
  return defineAsyncComponent({
    loader: componentLoader,
    loadingComponent: LoadingSpinner,
    errorComponent: ErrorComponent,
    delay: 200,
    timeout: 3000,
  })
})
```

### 内存管理

```typescript
// 组件卸载时的清理工作
export default defineComponent({
  setup() {
    const engine = getCurrentInstance()?.appContext.config.globalProperties.$engine
    const timers: number[] = []
    const listeners: Array<() => void> = []

    // 添加定时器
    const addTimer = (timer: number) => {
      timers.push(timer)
    }

    // 添加事件监听器
    const addListener = (event: string, handler: Function) => {
      engine?.events.on(event, handler)
      listeners.push(() => engine?.events.off(event, handler))
    }

    // 组件卸载时清理
    onUnmounted(() => {
      // 清理定时器
      timers.forEach(timer => clearTimeout(timer))

      // 清理事件监听器
      listeners.forEach(cleanup => cleanup())

      // 清理其他资源
      // ...
    })

    return {
      addTimer,
      addListener,
    }
  },
})
```

## 🔒 安全实现

### XSS 防护

```typescript
// src/utils/security.ts - 安全工具函数
export function sanitizeHTML(input: string): string {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

export function escapeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// 在组件中使用
export default defineComponent({
  setup() {
    const userInput = ref('')
    const sanitizedOutput = computed(() => {
      return escapeHTML(userInput.value)
    })

    return { userInput, sanitizedOutput }
  },
})
```

### 类型安全

```typescript
// 严格的类型定义确保运行时安全
interface DemoConfig {
  readonly name: string
  readonly version: string
  readonly features: readonly string[]
}

// 使用类型守卫
function isDemoConfig(obj: any): obj is DemoConfig {
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.version === 'string' &&
    Array.isArray(obj.features) &&
    obj.features.every((f: any) => typeof f === 'string')
  )
}

// 安全的数据处理
function processConfig(config: unknown): DemoConfig | null {
  if (isDemoConfig(config)) {
    return config
  }
  console.warn('Invalid config provided:', config)
  return null
}
```

## 📊 监控和调试

### 开发工具集成

```typescript
// src/utils/devtools.ts - 开发工具支持
export function setupDevtools(engine: Engine) {
  if (import.meta.env.DEV) {
    // 暴露到全局对象
    ;(window as any).__LDESIGN_ENGINE__ = engine
    ;(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = true

    // 添加调试信息
    console.log('🚀 LDesign Engine 开发模式已启用')
    console.log('引擎实例:', engine)
    console.log('可用命令:')
    console.log('  __LDESIGN_ENGINE__.state.getAll() - 查看所有状态')
    console.log('  __LDESIGN_ENGINE__.plugins.getAll() - 查看所有插件')
  }
}
```

### 错误边界实现

```typescript
// src/components/ErrorBoundary.tsx - 错误边界组件
export default defineComponent({
  name: 'ErrorBoundary',
  setup(_, { slots }) {
    const hasError = ref(false)
    const error = ref<Error | null>(null)

    const resetError = () => {
      hasError.value = false
      error.value = null
    }

    // 捕获子组件错误
    onErrorCaptured((err: Error) => {
      hasError.value = true
      error.value = err

      // 记录错误
      console.error('ErrorBoundary caught an error:', err)

      // 阻止错误继续传播
      return false
    })

    return () => {
      if (hasError.value) {
        return (
          <div class='error-boundary'>
            <h2>出现了一个错误</h2>
            <p>{error.value?.message}</p>
            <button onClick={resetError}>重试</button>
          </div>
        )
      }

      return slots.default?.()
    }
  },
})
```

---

这些实现细节展示了 LDesign Engine 演示应用的核心技术实现，为开发者提供了深入理解项目架构和实现方式的
参考。
