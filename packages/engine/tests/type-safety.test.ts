import type {
  ConfigManager,
  Engine,
  EngineEventMap,
  EventManager,
  Plugin,
  PluginContext,
  PluginManager,
  StateManager,
} from '../src/types'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { createEngine } from '../src'

describe('type Safety', () => {
  describe('配置管理器类型安全', () => {
    it('应该提供类型安全的配置访问', () => {
      const engine = createEngine()

      // 基本配置访问
      const debug = engine.getConfig('debug')
      expectTypeOf(debug).toBeUnknown()

      // 嵌套配置访问
      const appName = engine.getConfig('app.name')
      expectTypeOf(appName).toBeUnknown()

      // 配置设置
      engine.setConfig('debug', true)
      engine.setConfig('app.name', 'Test App')

      expect(engine.getConfig('debug')).toBe(true)
      expect(engine.getConfig('app.name')).toBe('Test App')
    })

    it('应该支持严格类型的配置', () => {
      // 这里我们测试类型推断，实际运行时可能需要类型断言
      interface TestConfig {
        app: {
          name: string
          version: string
        }
        debug: boolean
        features: {
          enableCache: boolean
        }
      }

      // 模拟类型安全的配置管理器
      const mockConfigManager = {
        get: vi.fn(),
        set: vi.fn(),
        has: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
        merge: vi.fn(),
        reset: vi.fn(),
      } as unknown as ConfigManager<TestConfig>

      // 这些应该有正确的类型推断（仅测试类型，不执行）
      if (false) {
        expectTypeOf(mockConfigManager.get('app.name')).toEqualTypeOf<string>()
        expectTypeOf(mockConfigManager.get('debug')).toEqualTypeOf<boolean>()
        expectTypeOf(mockConfigManager.get('features.enableCache')).toEqualTypeOf<boolean>()
      }

      // 验证mock对象存在
      expect(mockConfigManager.get).toBeDefined()
    })
  })

  describe('事件系统类型安全', () => {
    it('应该提供类型安全的事件处理', () => {
      const engine = createEngine()

      // 基本事件监听
      engine.events.on('test-event', (data) => {
        expectTypeOf(data).toEqualTypeOf<any>()
      })

      // 触发事件
      engine.events.emit('test-event', { message: 'Hello' })

      // 一次性事件监听
      engine.events.once('one-time-event', (data) => {
        expectTypeOf(data).toEqualTypeOf<any>()
      })
    })

    it('应该支持严格类型的事件映射', () => {
      // 模拟类型安全的事件管理器
      const mockEventManager = {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
        once: vi.fn(),
        eventNames: vi.fn(),
        listenerCount: vi.fn(),
        listeners: vi.fn(),
        removeAllListeners: vi.fn(),
        setMaxListeners: vi.fn(),
        getMaxListeners: vi.fn(),
      } as unknown as EventManager<EngineEventMap>

      // 这些应该有正确的类型推断（仅测试类型，不执行）
      if (false) {
        expectTypeOf(mockEventManager.on).parameter(0).toEqualTypeOf<keyof EngineEventMap | string>()

        // 引擎事件应该有正确的数据类型
        mockEventManager.on('engine:init', (data) => {
          expect(data).toBeDefined()
        })

        mockEventManager.on('plugin:registered', (data) => {
          expect(data).toBeDefined()
        })
      }

      // 验证mock对象存在
      expect(mockEventManager.on).toBeDefined()
    })
  })

  describe('状态管理器类型安全', () => {
    it('应该提供类型安全的状态访问', () => {
      const engine = createEngine()

      // 基本状态操作
      engine.state.set('user', { name: 'John', age: 30 })
      const user = engine.state.get('user')
      expectTypeOf(user).toEqualTypeOf<any>()

      // 嵌套状态操作
      engine.state.set('app.theme', 'dark')
      const theme = engine.state.get('app.theme')
      expectTypeOf(theme).toEqualTypeOf<any>()
    })

    it('应该支持严格类型的状态映射', () => {
      interface TestState {
        user: {
          name: string
          age: number
          profile: {
            email: string
            avatar?: string
          }
        }
        app: {
          theme: 'light' | 'dark'
          language: string
        }
      }

      // 模拟类型安全的状态管理器
      const mockStateManager = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        has: vi.fn(),
        clear: vi.fn(),
        watch: vi.fn(),
        keys: vi.fn(),
        namespace: vi.fn(),
      } as unknown as StateManager<TestState>

      // 这些应该有正确的类型推断（仅测试类型，不执行）
      if (false) {
        expectTypeOf(mockStateManager.get('user.name')).toEqualTypeOf<string | undefined>()
        expectTypeOf(mockStateManager.get('user.age')).toEqualTypeOf<number | undefined>()
        expectTypeOf(mockStateManager.get('app.theme')).toEqualTypeOf<'light' | 'dark' | undefined>()
      }

      // 验证mock对象存在
      expect(mockStateManager.get).toBeDefined()
    })
  })

  describe('插件系统类型安全', () => {
    it('应该提供类型安全的插件接口', () => {
      const _engine = createEngine()

      // 创建类型安全的插件
      const testPlugin: Plugin<Engine> = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        dependencies: ['core'],

        async install(context: PluginContext<Engine>) {
          expectTypeOf(context.engine).toEqualTypeOf<Engine>()
          expectTypeOf(context.logger).toEqualTypeOf<any>({} as any) // Logger类型
          expect(context.config).toBeDefined()
          expect(context.events).toBeDefined()

          // 插件安装逻辑
          context.logger.info('Test plugin installed')
        },

        async uninstall(context: PluginContext<Engine>) {
          context.logger.info('Test plugin uninstalled')
        },

        beforeInstall: async (context) => {
          context.logger.debug('Before install hook')
        },

        afterInstall: async (context) => {
          context.logger.debug('After install hook')
        },
      }

      expect(testPlugin.name).toBe('test-plugin')
      expect(testPlugin.version).toBe('1.0.0')
      expect(testPlugin.dependencies).toEqual(['core'])
    })

    it('应该支持插件元数据类型', () => {
      const plugin: Plugin = {
        name: 'metadata-plugin',
        version: '2.0.0',
        description: 'Plugin with metadata',
        author: 'Test Author',
        dependencies: ['dep1', 'dep2'],
        peerDependencies: ['peer1'],
        optionalDependencies: ['opt1'],

        metadata: {
          name: 'metadata-plugin',
          version: '2.0.0',
          description: 'Plugin with rich metadata',
          author: 'Test Author',
          homepage: 'https://example.com',
          keywords: ['test', 'plugin', 'metadata'],
          dependencies: ['dep1', 'dep2'],
          peerDependencies: ['peer1'],
          optionalDependencies: ['opt1'],
        },

        config: {
          enabled: true,
          options: {
            timeout: 5000,
            retries: 3,
          },
        },

        install: async (_context) => {
          // 安装逻辑
        },
      }

      expect(plugin.metadata?.keywords).toEqual(['test', 'plugin', 'metadata'])
      expect(plugin.config?.enabled).toBe(true)
    })
  })

  describe('引擎类型完整性', () => {
    it('应该有完整的管理器类型定义', () => {
      const engine = createEngine()

      // 验证所有管理器都有正确的类型
      expectTypeOf(engine.config).toEqualTypeOf<ConfigManager>()
      expectTypeOf(engine.events).toEqualTypeOf<EventManager>()
      expectTypeOf(engine.state).toEqualTypeOf<StateManager>()
      expectTypeOf(engine.plugins).toEqualTypeOf<PluginManager>()

      // 懒加载的管理器
      expectTypeOf(engine.cache).toMatchTypeOf<any>()
      expectTypeOf(engine.performance).toMatchTypeOf<any>()
      expectTypeOf(engine.security).toMatchTypeOf<any>()
    })

    it('应该支持引擎方法的类型安全', () => {
      const engine = createEngine()

      // 配置方法
      expectTypeOf(engine.getConfig).toEqualTypeOf<{
        <T = unknown>(path: string, defaultValue?: T): T
      }>()

      expectTypeOf(engine.setConfig).toEqualTypeOf<{
        (path: string, value: unknown): void
      }>()

      expectTypeOf(engine.updateConfig).toEqualTypeOf<{
        (config: Partial<Record<string, unknown>>): void
      }>()
    })
  })

  describe('泛型类型支持', () => {
    it('应该支持自定义引擎类型', () => {
      // 自定义引擎接口
      interface CustomEngine extends Engine {
        customMethod: () => void
        customProperty: string
      }

      // 自定义插件应该能够使用自定义引擎类型
      const customPlugin: Plugin<CustomEngine> = {
        name: 'custom-plugin',
        install: async (context: PluginContext<CustomEngine>) => {
          // 应该能够访问自定义方法和属性
          expectTypeOf(context.engine.customMethod).toEqualTypeOf<() => void>()
          expectTypeOf(context.engine.customProperty).toEqualTypeOf<string>()
        },
      }

      expect(customPlugin.name).toBe('custom-plugin')
    })
  })
})
