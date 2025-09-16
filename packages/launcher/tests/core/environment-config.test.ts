/**
 * 多环境配置系统测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ConfigManager } from '../../src/core/ConfigManager'
import { getEnvironmentConfigFiles, SUPPORTED_ENVIRONMENTS } from '../../src/constants/defaults'
import { FileSystem } from '../../src/utils/file-system'
import { PathUtils } from '../../src/utils/path-utils'
import type { ViteLauncherConfig } from '../../src/types'

// Mock 文件系统
vi.mock('../../src/utils/file-system')
vi.mock('../../src/utils/path-utils')

const mockFileSystem = vi.mocked(FileSystem)
const mockPathUtils = vi.mocked(PathUtils)

describe('Environment Config System', () => {
  let configManager: ConfigManager
  const testCwd = '/test/project'

  beforeEach(() => {
    vi.clearAllMocks()
    configManager = new ConfigManager()
    
    // 设置默认的 mock 行为
    mockPathUtils.resolve.mockImplementation((...paths) => paths.join('/'))
    mockFileSystem.exists.mockResolvedValue(false)
    mockFileSystem.readFile.mockResolvedValue('')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getEnvironmentConfigFiles', () => {
    it('应该返回默认配置文件列表当没有指定环境时', () => {
      const files = getEnvironmentConfigFiles()
      
      expect(files).toContain('.ldesign/launcher.config.ts')
      expect(files).toContain('launcher.config.ts')
      expect(files).toContain('vite.config.ts')
    })

    it('应该返回环境特定配置文件列表', () => {
      const files = getEnvironmentConfigFiles('development')
      
      expect(files).toContain('.ldesign/launcher.development.config.ts')
      expect(files).toContain('launcher.development.config.ts')
      expect(files).toContain('.ldesign/launcher.config.ts') // 回退配置
    })

    it('应该处理无效的环境名称', () => {
      const files = getEnvironmentConfigFiles('invalid-env')
      
      // 应该回退到默认配置文件列表
      expect(files).toContain('.ldesign/launcher.config.ts')
      expect(files).not.toContain('.ldesign/launcher.invalid-env.config.ts')
    })

    it('应该支持所有预定义的环境', () => {
      for (const env of SUPPORTED_ENVIRONMENTS) {
        const files = getEnvironmentConfigFiles(env)
        expect(files).toContain(`.ldesign/launcher.${env}.config.ts`)
        expect(files).toContain(`launcher.${env}.config.ts`)
      }
    })
  })

  describe('ConfigManager.loadEnvironmentConfig', () => {
    it('应该加载基础配置文件', async () => {
      const baseConfig: ViteLauncherConfig = {
        server: { port: 3000 }
      }

      // Mock 基础配置文件存在
      mockFileSystem.exists.mockImplementation((path) => {
        return Promise.resolve(path.includes('launcher.config.ts'))
      })

      // Mock 配置文件内容
      vi.spyOn(configManager as any, 'loadConfig').mockResolvedValue(baseConfig)

      const result = await configManager.loadEnvironmentConfig(testCwd)

      expect(result).toEqual(baseConfig)
    })

    it('应该加载并合并环境特定配置', async () => {
      const baseConfig: ViteLauncherConfig = {
        server: { port: 3000, host: 'localhost' }
      }

      const envConfig: ViteLauncherConfig = {
        server: { port: 8080 }, // 覆盖端口
        build: { minify: false } // 新增配置
      }

      // Mock 文件存在
      mockFileSystem.exists.mockImplementation((path) => {
        return Promise.resolve(
          path.includes('launcher.config.ts') || 
          path.includes('launcher.development.config.ts')
        )
      })

      // Mock 配置加载
      vi.spyOn(configManager as any, 'loadConfig')
        .mockResolvedValueOnce(baseConfig)
        .mockResolvedValueOnce(envConfig)

      vi.spyOn(configManager as any, 'findEnvironmentSpecificConfigFile')
        .mockResolvedValue('/test/project/.ldesign/launcher.development.config.ts')

      const result = await configManager.loadEnvironmentConfig(testCwd, 'development')

      expect(result.server?.port).toBe(8080) // 环境配置覆盖
      expect(result.server?.host).toBe('localhost') // 基础配置保留
      expect(result.build?.minify).toBe(false) // 环境配置新增
    })

    it('应该处理环境配置文件不存在的情况', async () => {
      const baseConfig: ViteLauncherConfig = {
        server: { port: 3000 }
      }

      // 只有基础配置文件存在
      mockFileSystem.exists.mockImplementation((path) => {
        return Promise.resolve(path.includes('launcher.config.ts') && !path.includes('development'))
      })

      vi.spyOn(configManager as any, 'loadConfig').mockResolvedValue(baseConfig)
      vi.spyOn(configManager as any, 'findEnvironmentSpecificConfigFile').mockResolvedValue(null)

      const result = await configManager.loadEnvironmentConfig(testCwd, 'development')

      expect(result).toEqual(baseConfig)
    })

    it('应该处理没有任何配置文件的情况', async () => {
      // 没有配置文件存在
      mockFileSystem.exists.mockResolvedValue(false)
      vi.spyOn(configManager as any, 'findConfigFile').mockResolvedValue(null)

      const result = await configManager.loadEnvironmentConfig(testCwd, 'development')

      expect(result).toEqual({})
    })
  })

  describe('ConfigManager.load with environment', () => {
    it('应该使用环境配置加载', async () => {
      const expectedConfig: ViteLauncherConfig = {
        server: { port: 8080 },
        mode: 'development'
      }

      vi.spyOn(configManager, 'loadEnvironmentConfig').mockResolvedValue(expectedConfig)

      const result = await configManager.load({
        cwd: testCwd,
        environment: 'development'
      })

      expect(configManager.loadEnvironmentConfig).toHaveBeenCalledWith(testCwd, 'development')
      expect(result).toEqual(expectedConfig)
    })

    it('应该处理指定配置文件的情况', async () => {
      const configFile = '/test/project/custom.config.ts'
      const expectedConfig: ViteLauncherConfig = {
        server: { port: 9000 }
      }

      mockFileSystem.exists.mockResolvedValue(true)
      vi.spyOn(configManager, 'loadConfig').mockResolvedValue(expectedConfig)

      const result = await configManager.load({
        configFile,
        environment: 'development' // 应该被忽略
      })

      expect(configManager.loadConfig).toHaveBeenCalledWith(configFile)
      expect(result).toEqual(expectedConfig)
    })
  })

  describe('深度合并测试', () => {
    it('应该正确深度合并嵌套配置', async () => {
      const baseConfig: ViteLauncherConfig = {
        server: {
          port: 3000,
          host: 'localhost',
          proxy: {
            '/api': {
              target: 'http://localhost:8080'
            }
          }
        },
        build: {
          outDir: 'dist',
          minify: true
        }
      }

      const envConfig: ViteLauncherConfig = {
        server: {
          port: 8080, // 覆盖
          proxy: {
            '/api': {
              target: 'http://localhost:9000' // 覆盖
            },
            '/assets': { // 新增
              target: 'http://localhost:9001'
            }
          }
        },
        build: {
          sourcemap: true // 新增
        }
      }

      // Mock 配置加载
      mockFileSystem.exists.mockResolvedValue(true)
      vi.spyOn(configManager as any, 'loadConfig')
        .mockResolvedValueOnce(baseConfig)
        .mockResolvedValueOnce(envConfig)

      vi.spyOn(configManager as any, 'findEnvironmentSpecificConfigFile')
        .mockResolvedValue('/test/project/launcher.development.config.ts')

      const result = await configManager.loadEnvironmentConfig(testCwd, 'development')

      expect(result.server?.port).toBe(8080)
      expect(result.server?.host).toBe('localhost')
      expect(result.server?.proxy?.['/api']?.target).toBe('http://localhost:9000')
      expect(result.server?.proxy?.['/assets']?.target).toBe('http://localhost:9001')
      expect(result.build?.outDir).toBe('dist')
      expect(result.build?.minify).toBe(true)
      expect(result.build?.sourcemap).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理配置文件加载错误', async () => {
      mockFileSystem.exists.mockResolvedValue(true)
      vi.spyOn(configManager as any, 'loadConfig').mockRejectedValue(new Error('配置文件语法错误'))

      const result = await configManager.loadEnvironmentConfig(testCwd, 'development')

      expect(result).toEqual({})
    })

    it('应该处理文件系统错误', async () => {
      mockFileSystem.exists.mockRejectedValue(new Error('文件系统错误'))

      const result = await configManager.loadEnvironmentConfig(testCwd, 'development')

      expect(result).toEqual({})
    })
  })
})
