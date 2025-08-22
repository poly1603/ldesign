# 测试指南

LDesign Engine 提供了完整的测试工具和最佳实践，帮助你构建可靠的应用。

## 测试环境配置

### 安装测试依赖

```bash
# 安装测试框架
pnpm add -D vitest @vue/test-utils jsdom

# 安装 LDesign Engine 测试工具
pnpm add -D @ldesign/engine-testing

# 安装类型定义
pnpm add -D @types/jsdom
```

### Vitest 配置

```typescript
import vue from '@vitejs/plugin-vue'
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

### 测试环境设置

```typescript
import { createTestEngine } from '@ldesign/engine/testing'
import { config } from '@vue/test-utils'
// tests/setup.ts
import { vi } from 'vitest'

// 全局测试引擎
const testEngine = createTestEngine({
  config: {
    debug: false,
    logLevel: 'error',
  },
})

// 配置 Vue Test Utils
config.global.plugins = [testEngine]

// 模拟浏览器 API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)
```

## 单元测试

### 引擎测试

```typescript
import type { Engine } from '@ldesign/engine'
import { createEngine } from '@ldesign/engine'
// tests/engine.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('Engine', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createEngine({
      config: {
        debug: false,
        appName: 'Test App',
      },
    })
  })

  afterEach(() => {
    engine.destroy()
  })

  it('should create engine with config', () => {
    expect(engine.config.appName).toBe('Test App')
    expect(engine.config.debug).toBe(false)
  })

  it('should have all managers', () => {
    expect(engine.state).toBeDefined()
    expect(engine.events).toBeDefined()
    expect(engine.plugins).toBeDefined()
    expect(engine.middleware).toBeDefined()
    expect(engine.logger).toBeDefined()
    expect(engine.notifications).toBeDefined()
    expect(engine.security).toBeDefined()
    expect(engine.performance).toBeDefined()
    expect(engine.cache).toBeDefined()
    expect(engine.directives).toBeDefined()
    expect(engine.errors).toBeDefined()
  })
})
```

### 状态管理测试

```typescript
import { createTestEngine } from '@ldesign/engine/testing'
// tests/state.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('State Manager', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createTestEngine()
  })

  it('should set and get state', () => {
    const userData = { id: 1, name: 'John' }

    engine.state.set('user', userData)

    expect(engine.state.get('user')).toEqual(userData)
  })

  it('should handle nested state', () => {
    engine.state.set('user.profile.name', 'John')
    engine.state.set('user.profile.age', 30)

    expect(engine.state.get('user.profile.name')).toBe('John')
    expect(engine.state.get('user.profile.age')).toBe(30)
    expect(engine.state.get('user.profile')).toEqual({
      name: 'John',
      age: 30,
    })
  })

  it('should notify subscribers', () => {
    const callback = vi.fn()

    engine.state.subscribe('user', callback)
    engine.state.set('user', { name: 'John' })

    expect(callback).toHaveBeenCalledWith({ name: 'John' }, undefined)
  })

  it('should handle state persistence', () => {
    const engine = createTestEngine({
      state: {
        persistence: {
          enabled: true,
          storage: 'localStorage',
          keys: ['user'],
        },
      },
    })

    engine.state.set('user', { name: 'John' })

    // 模拟页面刷新
    const newEngine = createTestEngine({
      state: {
        persistence: {
          enabled: true,
          storage: 'localStorage',
          keys: ['user'],
        },
      },
    })

    expect(newEngine.state.get('user')).toEqual({ name: 'John' })
  })
})
```

### 事件系统测试

```typescript
import { createTestEngine } from '@ldesign/engine/testing'
// tests/events.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Event Manager', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createTestEngine()
  })

  it('should emit and handle events', () => {
    const handler = vi.fn()

    engine.events.on('test:event', handler)
    engine.events.emit('test:event', { data: 'test' })

    expect(handler).toHaveBeenCalledWith({ data: 'test' })
  })

  it('should handle event priority', () => {
    const order: number[] = []

    engine.events.on('priority:test', () => order.push(1), 1)
    engine.events.on('priority:test', () => order.push(2), 2)
    engine.events.on('priority:test', () => order.push(3), 3)

    engine.events.emit('priority:test')

    expect(order).toEqual([3, 2, 1])
  })

  it('should handle once listeners', () => {
    const handler = vi.fn()

    engine.events.once('once:event', handler)

    engine.events.emit('once:event', 'first')
    engine.events.emit('once:event', 'second')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('first')
  })

  it('should remove listeners', () => {
    const handler = vi.fn()

    const unsubscribe = engine.events.on('remove:test', handler)

    engine.events.emit('remove:test', 'before')
    unsubscribe()
    engine.events.emit('remove:test', 'after')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('before')
  })
})
```

### 插件测试

```typescript
import { createTestEngine } from '@ldesign/engine/testing'
// tests/plugins.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Plugin Manager', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createTestEngine()
  })

  it('should register and install plugin', async () => {
    const installSpy = vi.fn()

    const testPlugin = {
      name: 'test-plugin',
      install: installSpy,
    }

    await engine.plugins.register(testPlugin)

    expect(installSpy).toHaveBeenCalledWith(engine)
    expect(engine.plugins.isRegistered('test-plugin')).toBe(true)
  })

  it('should handle plugin dependencies', async () => {
    const basePlugin = {
      name: 'base-plugin',
      install: vi.fn(),
    }

    const dependentPlugin = {
      name: 'dependent-plugin',
      dependencies: ['base-plugin'],
      install: vi.fn(),
    }

    await engine.plugins.register(basePlugin)
    await engine.plugins.register(dependentPlugin)

    expect(engine.plugins.isRegistered('base-plugin')).toBe(true)
    expect(engine.plugins.isRegistered('dependent-plugin')).toBe(true)
  })

  it('should fail when dependencies are missing', async () => {
    const dependentPlugin = {
      name: 'dependent-plugin',
      dependencies: ['missing-plugin'],
      install: vi.fn(),
    }

    await expect(engine.plugins.register(dependentPlugin)).rejects.toThrow('missing-plugin')
  })

  it('should unregister plugin', async () => {
    const uninstallSpy = vi.fn()

    const testPlugin = {
      name: 'test-plugin',
      install: vi.fn(),
      uninstall: uninstallSpy,
    }

    await engine.plugins.register(testPlugin)
    await engine.plugins.unregister('test-plugin')

    expect(uninstallSpy).toHaveBeenCalledWith(engine)
    expect(engine.plugins.isRegistered('test-plugin')).toBe(false)
  })
})
```

## 集成测试

### 组件测试

```typescript
import { createTestEngine } from '@ldesign/engine/testing'
import { mount } from '@vue/test-utils'
// tests/components/UserProfile.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile Component', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createTestEngine({
      state: {
        initialState: {
          user: {
            profile: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        },
      },
    })
  })

  it('should display user information', () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [engine],
      },
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('should handle user update', async () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [engine],
      },
    })

    // 更新用户信息
    engine.state.set('user.profile.name', 'Jane Doe')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Jane Doe')
  })

  it('should emit events on actions', async () => {
    const eventSpy = vi.fn()
    engine.events.on('user:profile:edit', eventSpy)

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [engine],
      },
    })

    await wrapper.find('[data-test="edit-button"]').trigger('click')

    expect(eventSpy).toHaveBeenCalled()
  })
})
```

### 路由测试

```typescript
import { createTestEngine } from '@ldesign/engine/testing'
// tests/router.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

describe('Router Integration', () => {
  let engine: Engine
  let router: Router

  beforeEach(() => {
    engine = createTestEngine()
    router = createRouter({
      history: createWebHistory(),
      routes,
    })
  })

  it('should navigate to protected route when authenticated', async () => {
    // 设置认证状态
    engine.state.set('user.isAuthenticated', true)

    await router.push('/profile')

    expect(router.currentRoute.value.path).toBe('/profile')
  })

  it('should redirect to login when not authenticated', async () => {
    // 设置未认证状态
    engine.state.set('user.isAuthenticated', false)

    await router.push('/profile')

    expect(router.currentRoute.value.path).toBe('/login')
  })
})
```

## 端到端测试

### Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E 测试示例

```typescript
// e2e/user-flow.spec.ts
import { expect, test } from '@playwright/test'

test.describe('User Flow', () => {
  test('should complete user registration and login', async ({ page }) => {
    // 访问注册页面
    await page.goto('/register')

    // 填写注册表单
    await page.fill('[data-test="username"]', 'testuser')
    await page.fill('[data-test="email"]', 'test@example.com')
    await page.fill('[data-test="password"]', 'password123')

    // 提交注册
    await page.click('[data-test="register-button"]')

    // 验证注册成功
    await expect(page.locator('[data-test="success-message"]')).toBeVisible()

    // 跳转到登录页面
    await page.click('[data-test="login-link"]')

    // 填写登录表单
    await page.fill('[data-test="username"]', 'testuser')
    await page.fill('[data-test="password"]', 'password123')

    // 提交登录
    await page.click('[data-test="login-button"]')

    // 验证登录成功
    await expect(page.locator('[data-test="user-menu"]')).toBeVisible()
    await expect(page.locator('[data-test="username-display"]')).toHaveText('testuser')
  })

  test('should handle form validation', async ({ page }) => {
    await page.goto('/register')

    // 提交空表单
    await page.click('[data-test="register-button"]')

    // 验证错误消息
    await expect(page.locator('[data-test="username-error"]')).toBeVisible()
    await expect(page.locator('[data-test="email-error"]')).toBeVisible()
    await expect(page.locator('[data-test="password-error"]')).toBeVisible()
  })
})
```

## 测试工具

### 测试辅助函数

```typescript
import type { Engine } from '@ldesign/engine'
// tests/helpers/test-utils.ts
import { createTestEngine } from '@ldesign/engine/testing'

export function createMockEngine(overrides = {}) {
  return createTestEngine({
    config: {
      debug: false,
      logLevel: 'error',
    },
    ...overrides,
  })
}

export function mockApiResponse(data: any, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), delay)
  })
}

export function waitForState(engine: Engine, key: string, value: any, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for state ${key} to be ${value}`))
    }, timeout)

    const unsubscribe = engine.state.subscribe(key, (newValue) => {
      if (newValue === value) {
        clearTimeout(timer)
        unsubscribe()
        resolve(newValue)
      }
    })

    // 检查当前值
    if (engine.state.get(key) === value) {
      clearTimeout(timer)
      unsubscribe()
      resolve(value)
    }
  })
}

export function waitForEvent(engine: Engine, eventName: string, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event ${eventName}`))
    }, timeout)

    const unsubscribe = engine.events.once(eventName, (data) => {
      clearTimeout(timer)
      resolve(data)
    })
  })
}
```

### 模拟数据

```typescript
// tests/mocks/data.ts
export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg',
}

export const mockArticles = [
  {
    id: 1,
    title: 'Test Article 1',
    content: 'This is test content',
    author: mockUser,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Test Article 2',
    content: 'This is another test content',
    author: mockUser,
    createdAt: '2024-01-02T00:00:00Z',
  },
]
```

## 测试最佳实践

### 1. 测试结构

```typescript
describe('Feature Name', () => {
  describe('when condition', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = doSomething(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### 2. 测试隔离

```typescript
describe('Test Suite', () => {
  let engine: Engine

  beforeEach(() => {
    // 每个测试都使用新的引擎实例
    engine = createTestEngine()
  })

  afterEach(() => {
    // 清理资源
    engine.destroy()
  })
})
```

### 3. 异步测试

```typescript
it('should handle async operations', async () => {
  const promise = engine.someAsyncMethod()

  // 等待状态变化
  await waitForState(engine, 'loading', false)

  const result = await promise
  expect(result).toBeDefined()
})
```

### 4. 错误测试

```typescript
it('should handle errors gracefully', async () => {
  const errorSpy = vi.fn()
  engine.events.on('error', errorSpy)

  await expect(engine.someMethodThatThrows()).rejects.toThrow('Expected error')

  expect(errorSpy).toHaveBeenCalled()
})
```

通过完整的测试策略，你可以确保 LDesign Engine 应用的质量和可靠性。
