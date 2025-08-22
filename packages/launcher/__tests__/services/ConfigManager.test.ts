/**
 * @fileoverview ConfigManager 单元测试
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ConfigManager } from '../../src/services/ConfigManager'
import { ERROR_CODES } from '../../src/types'
import type { UserConfig, InlineConfig } from 'vite'
import type { ProjectType } from '../../src/types'

// Mock文件系统
vi.mock('node:fs', () => ({
  promises: {
    access: vi.fn(),
  },
}))

// Mock动态导入
const mockImport = vi.fn()
vi.stubGlobal('import', mockImport)

describe('ConfigManager', () => {
  let configManager: ConfigManager

  beforeEach(() => {
    configManager = new ConfigManager()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    it('应该正确初始化', () => {
      expect(configManager).toBeInstanceOf(ConfigManager)
    })

    it('应该预加载所有预设配置', async () => {
      const presets = await configManager.getAllPresets()
      expect(presets.length).toBeGreaterThan(0)
      
      const projectTypes: ProjectType[] = ['vue2', 'vue3', 'react', 'vanilla', 'vanilla-ts']
      for (const type of projectTypes) {
        const preset = configManager.getPresetConfig(type)
        expect(preset).toBeDefined()
        expect(preset.framework).toBe(type)
      }
    })
  })

  describe('getPresetConfig', () => {
    it('应该返回Vue3预设配置', () => {
      const preset = configManager.getPresetConfig('vue3')
      
      expect(preset.name).toBe('Vue 3项目')
      expect(preset.framework).toBe('vue3')
      expect(preset.config.server?.port).toBe(5173)
      expect(preset.config.build?.outDir).toBe('dist')
      expect(preset.config.resolve?.alias).toBeDefined()
    })

    it('应该返回React预设配置', () => {
      const preset = configManager.getPresetConfig('react')
      
      expect(preset.name).toBe('React项目')
      expect(preset.framework).toBe('react')
      expect(preset.config.esbuild?.jsxInject).toContain('React')
    })

    it('应该对不支持的项目类型抛出错误', () => {
      expect(() => {
        configManager.getPresetConfig('unsupported' as ProjectType)
      }).toThrow()
    })

    it('应该返回深拷贝的配置对象', () => {
      const preset1 = configManager.getPresetConfig('vue3')
      const preset2 = configManager.getPresetConfig('vue3')
      
      expect(preset1).not.toBe(preset2) // 不是同一个对象引用
      expect(preset1).toEqual(preset2) // 但内容相同
      
      // 修改一个不应该影响另一个
      preset1.config.server!.port = 9999
      expect(preset2.config.server?.port).toBe(5173)
    })
  })

  describe('loadProjectConfig', () => {
    it('应该加载TypeScript配置文件', async () => {
      const mockConfig = {
        server: { port: 3000 },
        build: { outDir: 'build' },
      }
      
      // Mock文件存在
      vi.mocked(fs.access).mockResolvedValue(undefined)
      
      // Mock动态导入
      mockImport.mockResolvedValue({
        default: mockConfig,
      })

      const config = await configManager.loadProjectConfig('/test/project')
      
      expect(config).toEqual(mockConfig)
      expect(fs.access).toHaveBeenCalledWith('/test/project/vite.config.ts')
    })

    it('应该加载JavaScript配置文件', async () => {
      const mockConfig = {
        server: { port: 4000 },
      }
      
      // TypeScript文件不存在，JavaScript文件存在
      vi.mocked(fs.access)
        .mockRejectedValueOnce(new Error('File not found'))
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce(undefined)
      
      mockImport.mockResolvedValue({
        default: mockConfig,
      })

      const config = await configManager.loadProjectConfig('/test/project')
      
      expect(config).toEqual(mockConfig)
      expect(fs.access).toHaveBeenCalledWith('/test/project/vite.config.js')
    })

    it('应该处理函数式配置', async () => {
      const mockConfigFactory = vi.fn().mockReturnValue({
        server: { port: 5000 },
      })
      
      vi.mocked(fs.access).mockResolvedValue(undefined)
      mockImport.mockResolvedValue({
        default: mockConfigFactory,
      })

      const config = await configManager.loadProjectConfig('/test/project')
      
      expect(mockConfigFactory).toHaveBeenCalledWith({
        command: 'serve',
        mode: 'development',
        ssrBuild: false,
      })
      expect(config.server?.port).toBe(5000)
    })

    it('应该在没有配置文件时返回空配置', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'))

      const config = await configManager.loadProjectConfig('/test/project')
      
      expect(config).toEqual({})
    })

    it('应该缓存配置结果', async () => {
      const mockConfig = { server: { port: 3000 } }
      
      vi.mocked(fs.access).mockResolvedValue(undefined)
      mockImport.mockResolvedValue({ default: mockConfig })

      // 第一次加载
      const config1 = await configManager.loadProjectConfig('/test/project')
      
      // 第二次加载应该使用缓存
      const config2 = await configManager.loadProjectConfig('/test/project')
      
      expect(config1).toBe(config2) // 应该是同一个对象引用（缓存）
      expect(fs.access).toHaveBeenCalledTimes(1) // 只调用一次文件系统
    })
  })

  describe('mergeConfigs', () => {
    it('应该合并基础配置和用户配置', () => {
      const baseConfig: UserConfig = {
        server: { port: 5173, host: 'localhost' },
        build: { outDir: 'dist' },
      }
      
      const userConfig: UserConfig = {
        server: { port: 3000 },
        resolve: { alias: { '@': '/src' } },
      }

      const merged = configManager.mergeConfigs(baseConfig, userConfig)
      
      expect(merged.server?.port).toBe(3000) // 用户配置优先
      expect(merged.server?.host).toBe('localhost') // 保留基础配置
      expect(merged.build?.outDir).toBe('dist') // 保留基础配置
      expect(merged.resolve?.alias).toEqual({ '@': '/src' }) // 添加用户配置
    })

    it('应该处理数组合并', () => {
      const baseConfig: UserConfig = {
        plugins: ['plugin1', 'plugin2'],
        build: { target: 'es2015' },
      }
      
      const userConfig: UserConfig = {
        plugins: ['plugin3'],
        build: { target: ['es2020', 'chrome91'] },
      }

      const merged = configManager.mergeConfigs(baseConfig, userConfig, {
        overrideArrays: true,
      })
      
      expect(merged.plugins).toEqual(['plugin1', 'plugin2', 'plugin3'])
      expect(merged.build?.target).toEqual(['es2015', 'es2020', 'chrome91'])
    })

    it('应该处理自定义合并函数', () => {
      const baseConfig: UserConfig = {
        server: { port: 5173 },
        define: { BASE_API: '"base"' },
      }
      
      const userConfig: UserConfig = {
        server: { host: 'localhost' },
        define: { USER_API: '"user"' },
      }

      const customMerger = (target: any, source: any, key: string) => {
        if (key === 'define') {
          return { ...target, ...source }
        }
        return source
      }

      const merged = configManager.mergeConfigs(baseConfig, userConfig, {
        customMerger,
      })
      
      expect(merged.define).toEqual({
        BASE_API: '"base"',
        USER_API: '"user"',
      })
    })

    it('应该处理合并错误', () => {
      const baseConfig = { server: { port: 5173 } }
      const userConfig = null as any

      expect(() => {
        configManager.mergeConfigs(baseConfig, userConfig)
      }).toThrow()
    })
  })

  describe('validateConfig', () => {
    it('应该验证有效配置', async () => {
      const validConfig: InlineConfig = {
        server: { port: 3000, host: 'localhost' },
        build: { outDir: 'dist', minify: 'esbuild' },
        plugins: [],
        resolve: { alias: { '@': '/src' } },
      }

      const isValid = await configManager.validateConfig(validConfig)
      expect(isValid).toBe(true)
    })

    it('应该拒绝无效的服务器端口', async () => {
      const invalidConfig: InlineConfig = {
        server: { port: 70000 }, // 超出有效范围
      }

      const isValid = await configManager.validateConfig(invalidConfig)
      expect(isValid).toBe(false)
    })

    it('应该拒绝无效的插件配置', async () => {
      const invalidConfig: InlineConfig = {
        plugins: 'not-an-array' as any,
      }

      const isValid = await configManager.validateConfig(invalidConfig)
      expect(isValid).toBe(false)
    })

    it('应该拒绝非对象配置', async () => {
      const invalidConfig = 'not-an-object' as any

      const isValid = await configManager.validateConfig(invalidConfig)
      expect(isValid).toBe(false)
    })

    it('应该拒绝无效的输出目录', async () => {
      const invalidConfig: InlineConfig = {
        build: { outDir: 123 as any },
      }

      const isValid = await configManager.validateConfig(invalidConfig)
      expect(isValid).toBe(false)
    })
  })

  describe('generateConfigFile', () => {
    it('应该生成TypeScript配置文件', () => {
      const configContent = configManager.generateConfigFile('vue3', {
        typescript: true,
        plugins: ['@vitejs/plugin-vue'],
      })

      expect(configContent).toContain('import vue from \'@vitejs/plugin-vue\'')
      expect(configContent).toContain('import { defineConfig } from \'vite\'')
      expect(configContent).toContain('export default defineConfig({')
      expect(configContent).toContain('plugins: [\n    vue()\n  ]')
      expect(configContent).toContain('port: 5173')
    })

    it('应该生成JavaScript配置文件', () => {
      const configContent = configManager.generateConfigFile('react', {
        typescript: false,
        plugins: ['@vitejs/plugin-react'],
      })

      expect(configContent).toContain('import react from \'@vitejs/plugin-react\'')
      expect(configContent).toContain('export default defineConfig({')
    })

    it('应该处理无插件情况', () => {
      const configContent = configManager.generateConfigFile('vanilla')

      expect(configContent).toContain('plugins: []')
      expect(configContent).not.toContain('import')
    })

    it('应该包含预设配置', () => {
      const configContent = configManager.generateConfigFile('vue3')

      expect(configContent).toContain('port: 5173')
      expect(configContent).toContain('outDir: \'dist\'')
    })
  })

  describe('loadPreset 兼容性方法', () => {
    it('应该返回预设配置', async () => {
      const preset = await configManager.loadPreset('vue3')
      
      expect(preset.framework).toBe('vue3')
      expect(preset.name).toBe('Vue 3项目')
    })
  })

  describe('mergeConfig 兼容性方法', () => {
    it('应该合并配置', () => {
      const base: InlineConfig = { server: { port: 5173 } }
      const override = { server: { host: 'localhost' } }

      const merged = configManager.mergeConfig(base, override)
      
      expect(merged.server?.port).toBe(5173)
      expect(merged.server?.host).toBe('localhost')
    })
  })

  describe('getAllPresets', () => {
    it('应该返回所有预设配置', async () => {
      const presets = await configManager.getAllPresets()
      
      expect(presets.length).toBeGreaterThan(0)
      expect(presets.some(p => p.framework === 'vue3')).toBe(true)
      expect(presets.some(p => p.framework === 'react')).toBe(true)
      expect(presets.some(p => p.framework === 'vanilla')).toBe(true)
    })

    it('返回的预设应该是只读的', async () => {
      const presets = await configManager.getAllPresets()
      
      // 应该无法修改返回的数组
      expect(() => {
        (presets as any).push({ test: 'test' })
      }).toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理空项目路径', async () => {
      const config = await configManager.loadProjectConfig('')
      expect(config).toEqual({})
    })

    it('应该处理配置文件导入错误', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined)
      mockImport.mockRejectedValue(new Error('Import failed'))

      await expect(
        configManager.loadProjectConfig('/test/project'),
      ).rejects.toThrow()
    })

    it('应该处理复杂的配置合并', () => {
      const baseConfig: UserConfig = {
        server: {
          port: 5173,
          proxy: {
            '/api': 'http://localhost:3000',
          },
        },
        resolve: {
          alias: {
            '@': '/src',
            '#': '/types',
          },
        },
      }
      
      const userConfig: UserConfig = {
        server: {
          host: 'localhost',
          proxy: {
            '/auth': 'http://localhost:4000',
          },
        },
        resolve: {
          alias: {
            '~': '/assets',
          },
        },
      }

      const merged = configManager.mergeConfigs(baseConfig, userConfig)
      
      // 验证深度合并
      expect(merged.server?.port).toBe(5173)
      expect(merged.server?.host).toBe('localhost')
      expect(merged.server?.proxy).toEqual({
        '/api': 'http://localhost:3000',
        '/auth': 'http://localhost:4000',
      })
      expect(merged.resolve?.alias).toEqual({
        '@': '/src',
        '#': '/types',
        '~': '/assets',
      })
    })
  })
})