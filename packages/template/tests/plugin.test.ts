/**
 * 插件系统测试
 */

import type { TemplateSystemConfig } from '../src/types/config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { install, TemplatePlugin, uninstall } from '../src/plugin'

// 模拟Vue应用
function createMockApp() {
  const app = createApp({})
  app.config = {
    globalProperties: {},
  }
  app.provide = vi.fn()
  app.use = vi.fn()
  return app
}

// 模拟文件系统
const mockFs = {
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
}

vi.mock('fs', () => mockFs)
vi.mock('node:fs', () => mockFs)

// 模拟路径操作
const mockPath = {
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => `/${args.join('/')}`),
  dirname: vi.fn(p => p.split('/').slice(0, -1).join('/')),
  basename: vi.fn(p => p.split('/').pop()),
}

vi.mock('path', () => mockPath)
vi.mock('node:path', () => mockPath)

describe('templatePlugin', () => {
  let app: ReturnType<typeof createMockApp>
  let mockConfig: Partial<TemplateSystemConfig>

  beforeEach(() => {
    app = createMockApp()

    mockConfig = {
      templatesDir: 'test/templates',
      autoScan: false, // 禁用自动扫描以避免文件系统调用
      enableHMR: false,
      defaultDevice: 'desktop',
      debug: false,
      scanner: {
        maxDepth: 3,
        includeExtensions: ['.vue'],
        excludePatterns: ['test'],
        enableCache: true,
        watchMode: false,
        debounceDelay: 200,
        batchSize: 5,
      },
      cache: {
        enabled: true,
        strategy: 'lru',
        maxSize: 50,
        ttl: 30 * 60 * 1000,
      },
    }

    // 模拟文件系统
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readdirSync.mockReturnValue([])
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true,
      isFile: () => false,
      mtime: new Date(),
    })

    // 清理之前的安装
    uninstall()
  })

  afterEach(() => {
    uninstall()
    vi.clearAllMocks()
  })

  describe('插件安装', () => {
    it('应该成功安装插件', () => {
      expect(() => {
        app.use(TemplatePlugin, mockConfig)
      }).not.toThrow()
    })

    it('应该使用默认配置安装插件', () => {
      expect(() => {
        app.use(TemplatePlugin)
      }).not.toThrow()
    })

    it('应该设置全局属性', () => {
      app.use(TemplatePlugin, mockConfig)

      expect(app.config.globalProperties.$templateScanner).toBeDefined()
      expect(app.config.globalProperties.$templateConfig).toBeDefined()
      expect(app.config.globalProperties.$templateSystemConfig).toBeDefined()
      expect(app.config.globalProperties.$templateHotReload).toBeDefined()
    })

    it('应该提供依赖注入', () => {
      app.use(TemplatePlugin, mockConfig)

      expect(app.provide).toHaveBeenCalledWith('templateScanner', expect.any(Object))
      expect(app.provide).toHaveBeenCalledWith('templateConfig', expect.any(Object))
      expect(app.provide).toHaveBeenCalledWith('templateSystemConfig', expect.any(Object))
      expect(app.provide).toHaveBeenCalledWith('templateHotReload', expect.any(Object))
    })

    it('应该防止重复安装', () => {
      app.use(TemplatePlugin, mockConfig)

      // 第二次安装应该被忽略
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      app.use(TemplatePlugin, mockConfig)

      expect(consoleSpy).toHaveBeenCalledWith('[TemplatePlugin] Plugin already installed')
      consoleSpy.mockRestore()
    })
  })

  describe('插件配置', () => {
    it('应该合并用户配置与默认配置', () => {
      app.use(TemplatePlugin, mockConfig)

      const globalConfig = app.config.globalProperties.$templateSystemConfig
      expect(globalConfig.templatesDir).toBe('test/templates')
      expect(globalConfig.scanner.maxDepth).toBe(3)
      expect(globalConfig.cache.enabled).toBe(true)
    })

    it('应该处理部分配置', () => {
      const partialConfig = {
        templatesDir: 'partial/templates',
        debug: true,
      }

      app.use(TemplatePlugin, partialConfig)

      const globalConfig = app.config.globalProperties.$templateSystemConfig
      expect(globalConfig.templatesDir).toBe('partial/templates')
      expect(globalConfig.debug).toBe(true)
      expect(globalConfig.autoScan).toBeDefined() // 应该有默认值
    })
  })

  describe('扫描器集成', () => {
    it('应该创建模板扫描器', () => {
      app.use(TemplatePlugin, mockConfig)

      const scanner = app.config.globalProperties.$templateScanner
      expect(scanner).toBeDefined()
      expect(typeof scanner.scan).toBe('function')
      expect(typeof scanner.getTemplates).toBe('function')
    })

    it('应该配置扫描器选项', () => {
      app.use(TemplatePlugin, mockConfig)

      const scanner = app.config.globalProperties.$templateScanner
      const options = scanner.getOptions()

      expect(options.templatesDir).toBe('test/templates')
      expect(options.maxDepth).toBe(3)
      expect(options.enableCache).toBe(true)
    })

    it('应该在启用自动扫描时执行扫描', async () => {
      const configWithAutoScan = {
        ...mockConfig,
        autoScan: true,
      }

      app.use(TemplatePlugin, configWithAutoScan)

      // 等待异步扫描完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证扫描被调用（通过检查文件系统调用）
      expect(mockFs.existsSync).toHaveBeenCalled()
    })
  })

  describe('配置管理器集成', () => {
    it('应该创建配置管理器', () => {
      app.use(TemplatePlugin, mockConfig)

      const configManager = app.config.globalProperties.$templateConfig
      expect(configManager).toBeDefined()
      expect(typeof configManager.get).toBe('function')
      expect(typeof configManager.set).toBe('function')
    })

    it('应该使用系统配置初始化配置管理器', () => {
      app.use(TemplatePlugin, mockConfig)

      const configManager = app.config.globalProperties.$templateConfig
      const config = configManager.getConfig()

      expect(config.templatesDir).toBe('test/templates')
      expect(config.debug).toBe(false)
    })
  })

  describe('热更新集成', () => {
    it('应该在启用HMR时创建热更新管理器', () => {
      const configWithHMR = {
        ...mockConfig,
        enableHMR: true,
      }

      app.use(TemplatePlugin, configWithHMR)

      const hotReloadManager = app.config.globalProperties.$templateHotReload
      expect(hotReloadManager).toBeDefined()
      expect(typeof hotReloadManager.addListener).toBe('function')
    })

    it('应该在禁用HMR时不创建热更新管理器', () => {
      app.use(TemplatePlugin, mockConfig)

      const hotReloadManager = app.config.globalProperties.$templateHotReload
      expect(hotReloadManager).toBeNull()
    })
  })

  describe('文件监听', () => {
    it('应该在启用监听模式时启动文件监听', async () => {
      const configWithWatch = {
        ...mockConfig,
        scanner: {
          ...mockConfig.scanner!,
          watchMode: true,
        },
      }

      app.use(TemplatePlugin, configWithWatch)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      const scanner = app.config.globalProperties.$templateScanner
      expect(scanner.isWatching()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理扫描错误', async () => {
      // 模拟文件系统错误
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('File system error')
      })

      const configWithAutoScan = {
        ...mockConfig,
        autoScan: true,
        errorHandling: {
          enableReporting: true,
        },
      }

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      app.use(TemplatePlugin, configWithAutoScan)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('应该处理配置验证错误', () => {
      const invalidConfig = {
        templatesDir: '', // 无效配置
        scanner: {
          maxDepth: -1, // 无效值
        },
      }

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      app.use(TemplatePlugin, invalidConfig)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('插件卸载', () => {
    it('应该能够卸载插件', () => {
      app.use(TemplatePlugin, mockConfig)

      expect(() => {
        uninstall()
      }).not.toThrow()
    })

    it('应该清理资源', async () => {
      const configWithWatch = {
        ...mockConfig,
        scanner: {
          ...mockConfig.scanner!,
          watchMode: true,
        },
      }

      app.use(TemplatePlugin, configWithWatch)

      // 等待初始化完成
      await new Promise(resolve => setTimeout(resolve, 100))

      const scanner = app.config.globalProperties.$templateScanner
      expect(scanner.isWatching()).toBe(true)

      uninstall()

      // 验证资源被清理
      expect(scanner.isWatching()).toBe(false)
    })
  })
})

describe('独立安装函数', () => {
  let app: ReturnType<typeof createMockApp>

  beforeEach(() => {
    app = createMockApp()
    uninstall()
  })

  afterEach(() => {
    uninstall()
  })

  it('应该通过install函数安装插件', () => {
    expect(() => {
      install(app, {
        templatesDir: 'standalone/templates',
        autoScan: false,
      })
    }).not.toThrow()

    expect(app.config.globalProperties.$templateScanner).toBeDefined()
  })

  it('应该处理无效的应用实例', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    install(null as any, {})

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('hMR集成测试', () => {
  beforeEach(() => {
    // 模拟HMR环境
    Object.defineProperty(globalThis, 'import', {
      value: {
        meta: {
          hot: {
            on: vi.fn(),
            off: vi.fn(),
            send: vi.fn(),
            accept: vi.fn(),
          },
        },
      },
      configurable: true,
    })
  })

  afterEach(() => {
    delete (globalThis as any).import
  })

  it('应该在HMR环境中设置热更新', () => {
    const app = createMockApp()
    const configWithHMR = {
      templatesDir: 'hmr/templates',
      enableHMR: true,
      autoScan: false,
    }

    app.use(TemplatePlugin, configWithHMR)

    expect(import.meta.hot?.on).toHaveBeenCalled()
  })
})
