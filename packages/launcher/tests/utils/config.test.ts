/**
 * 配置工具函数测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  findConfigFile,
  loadConfigFile,
  saveConfigFile,
  mergeConfigs,
  validateConfig,
  normalizeConfigPaths,
  getDefaultConfigPath,
  isTypeScriptConfig,
  getConfigWatchOptions
} from '../../src/utils/config'
import type { ViteLauncherConfig } from '../../src/types'

// Mock @ldesign/kit 模块
vi.mock('@ldesign/kit', () => ({
  FileSystem: {
    exists: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn()
  },
  PathUtils: {
    resolve: vi.fn((path) => path),
    join: vi.fn((...paths) => paths.join('/')),
    isAbsolute: vi.fn().mockReturnValue(false),
    extname: vi.fn((path) => {
      const parts = path.split('.')
      return parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
    })
  }
}))

describe('配置工具函数', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('findConfigFile', () => {
    it('应该找到指定的配置文件', async () => {
      vi.mocked(FileSystem.exists).mockResolvedValue(true)

      const result = await findConfigFile('/test/project', 'custom.config.js')

      expect(result).toBe('custom.config.js')
      expect(FileSystem.exists).toHaveBeenCalledWith('custom.config.js')
    })

    it('应该在指定文件不存在时抛出错误', async () => {
      vi.mocked(FileSystem.exists).mockResolvedValue(false)

      await expect(findConfigFile('/test/project', 'nonexistent.config.js'))
        .rejects.toThrow('指定的配置文件不存在')
    })

    it('应该自动查找默认配置文件', async () => {
      const { FileSystem } = require('@ldesign/kit')

      // 模拟第一个文件不存在，第二个存在
      FileSystem.exists
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)

      const result = await findConfigFile('/test/project')

      expect(result).toBeDefined()
      expect(FileSystem.exists).toHaveBeenCalledTimes(2)
    })

    it('应该在找不到任何配置文件时返回 null', async () => {
      const { FileSystem } = require('@ldesign/kit')
      FileSystem.exists.mockResolvedValue(false)
      
      const result = await findConfigFile('/test/project')
      
      expect(result).toBeNull()
    })
  })
  
  describe('loadConfigFile', () => {
    it('应该加载 JSON 配置文件', async () => {
      const mockConfig = { server: { port: 3000 } }

      vi.mocked(FileSystem.exists).mockResolvedValue(true)
      vi.mocked(FileSystem.readFile).mockResolvedValue(JSON.stringify(mockConfig))

      const result = await loadConfigFile('/test/config.json')

      expect(result).toEqual(mockConfig)
    })

    it('应该加载 JavaScript 配置文件', async () => {
      vi.mocked(FileSystem.exists).mockResolvedValue(true)

      // Mock 动态导入
      const mockConfig = { server: { port: 3000 } }
      vi.doMock('/test/config.js', () => ({ default: mockConfig }), { virtual: true })

      const result = await loadConfigFile('/test/config.js')

      expect(result).toEqual(mockConfig)
    })

    it('应该处理不支持的文件格式', async () => {
      vi.mocked(FileSystem.exists).mockResolvedValue(true)

      await expect(loadConfigFile('/test/config.yaml'))
        .rejects.toThrow('不支持的配置文件格式')
    })

    it('应该处理文件不存在的情况', async () => {
      vi.mocked(FileSystem.exists).mockResolvedValue(false)

      await expect(loadConfigFile('/test/config.js'))
        .rejects.toThrow('配置文件不存在')
    })
  })
  
  describe('saveConfigFile', () => {
    it('应该保存 JSON 配置文件', async () => {
      const { FileSystem } = require('@ldesign/kit')
      const mockConfig: ViteLauncherConfig = { server: { port: 3000 } }

      await saveConfigFile('/test/config.json', mockConfig)

      expect(FileSystem.writeFile).toHaveBeenCalledWith(
        '/test/config.json',
        JSON.stringify(mockConfig, null, 2),
        { encoding: 'utf-8' }
      )
    })

    it('应该保存 JavaScript 配置文件', async () => {
      const { FileSystem } = require('@ldesign/kit')
      const mockConfig: ViteLauncherConfig = { server: { port: 3000 } }

      await saveConfigFile('/test/config.js', mockConfig)

      expect(FileSystem.writeFile).toHaveBeenCalledWith(
        '/test/config.js',
        expect.stringContaining('export default'),
        { encoding: 'utf-8' }
      )
    })

    it('应该保存 TypeScript 配置文件', async () => {
      const { FileSystem } = require('@ldesign/kit')
      const mockConfig: ViteLauncherConfig = { server: { port: 3000 } }

      await saveConfigFile('/test/config.ts', mockConfig)

      expect(FileSystem.writeFile).toHaveBeenCalledWith(
        '/test/config.ts',
        expect.stringContaining('import type { ViteLauncherConfig }'),
        { encoding: 'utf-8' }
      )
    })
  })
  
  describe('mergeConfigs', () => {
    it('应该正确合并配置对象', () => {
      const baseConfig: ViteLauncherConfig = {
        server: {
          port: 3000,
          host: 'localhost'
        }
      }
      
      const overrideConfig: ViteLauncherConfig = {
        server: {
          port: 8080
        },
        build: {
          outDir: 'dist'
        }
      }
      
      const result = mergeConfigs(baseConfig, overrideConfig)
      
      expect(result.server?.port).toBe(8080)
      expect(result.server?.host).toBe('localhost')
      expect(result.build?.outDir).toBe('dist')
    })
    
    it('应该在深度合并失败时回退到简单合并', () => {
      // Mock ObjectUtils.deepMerge 抛出错误
      vi.doMock('@ldesign/kit', () => {
        throw new Error('Module not found')
      })

      const baseConfig: ViteLauncherConfig = { server: { port: 3000 } }
      const overrideConfig: ViteLauncherConfig = { server: { host: 'localhost' } }

      const result = mergeConfigs(baseConfig, overrideConfig)

      // 应该使用简单合并的结果（server对象被完全替换）
      expect(result).toEqual({ server: { host: 'localhost' } })
    })
  })
  
  describe('validateConfig', () => {
    it('应该验证有效配置', () => {
      const validConfig: ViteLauncherConfig = {
        server: {
          port: 3000,
          host: 'localhost'
        },
        build: {
          outDir: 'dist',
          target: 'modules'
        }
      }
      
      const result = validateConfig(validConfig)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    
    it('应该检测无效的端口号', () => {
      const invalidConfig: ViteLauncherConfig = {
        server: {
          port: 99999
        }
      }
      
      const result = validateConfig(invalidConfig)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('服务器端口必须是 1-65535 之间的数字')
    })
    
    it('应该检测无效的主机地址类型', () => {
      const invalidConfig: ViteLauncherConfig = {
        server: {
          host: 123 as any
        }
      }
      
      const result = validateConfig(invalidConfig)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('服务器主机地址必须是字符串')
    })
    
    it('应该检测无效的构建目标', () => {
      const invalidConfig: ViteLauncherConfig = {
        build: {
          target: 123 as any
        }
      }
      
      const result = validateConfig(invalidConfig)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('构建目标必须是字符串或字符串数组')
    })
    
    it('应该处理非对象配置', () => {
      const result = validateConfig(null as any)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('配置必须是一个对象')
    })
  })
  
  describe('normalizeConfigPaths', () => {
    it('应该规范化相对路径', () => {
      const { PathUtils } = require('@ldesign/kit')

      PathUtils.isAbsolute.mockReturnValue(false)
      PathUtils.resolve.mockImplementation((base, path) => `${base}/${path}`)

      const config: ViteLauncherConfig = {
        root: 'src',
        build: {
          outDir: 'dist'
        },
        publicDir: 'public'
      }

      const result = normalizeConfigPaths(config, '/project')

      expect(result.root).toBe('/project/src')
      expect(result.build?.outDir).toBe('/project/dist')
      expect(result.publicDir).toBe('/project/public')
    })

    it('应该保持绝对路径不变', () => {
      const { PathUtils } = require('@ldesign/kit')

      PathUtils.isAbsolute.mockReturnValue(true)

      const config: ViteLauncherConfig = {
        root: '/absolute/src',
        build: {
          outDir: '/absolute/dist'
        }
      }

      const result = normalizeConfigPaths(config, '/project')

      expect(result.root).toBe('/absolute/src')
      expect(result.build?.outDir).toBe('/absolute/dist')
    })
  })
  
  describe('getDefaultConfigPath', () => {
    it('应该返回 TypeScript 配置路径（默认）', () => {
      const { PathUtils } = require('@ldesign/kit')

      PathUtils.resolve.mockImplementation((cwd, file) => `${cwd}/${file}`)

      const result = getDefaultConfigPath('/project')

      expect(result).toBe('/project/launcher.config.ts')
    })

    it('应该返回 JavaScript 配置路径', () => {
      const { PathUtils } = require('@ldesign/kit')

      PathUtils.resolve.mockImplementation((cwd, file) => `${cwd}/${file}`)

      const result = getDefaultConfigPath('/project', false)

      expect(result).toBe('/project/launcher.config.js')
    })
  })
  
  describe('isTypeScriptConfig', () => {
    it('应该识别 TypeScript 配置文件', () => {
      expect(isTypeScriptConfig('/path/config.ts')).toBe(true)
      expect(isTypeScriptConfig('/path/config.js')).toBe(false)
      expect(isTypeScriptConfig('/path/config.json')).toBe(false)
    })
  })
  
  describe('getConfigWatchOptions', () => {
    it('应该返回正确的监听选项', () => {
      const options = getConfigWatchOptions('/path/config.ts')
      
      expect(options).toHaveProperty('ignored')
      expect(options).toHaveProperty('ignoreInitial', true)
      expect(options).toHaveProperty('persistent', true)
      expect(options.ignored).toContain('**/node_modules/**')
      expect(options.ignored).toContain('**/.git/**')
    })
  })
})
