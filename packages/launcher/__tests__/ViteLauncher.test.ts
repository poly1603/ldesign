import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ViteLauncher } from '../src/core/ViteLauncher'
import type { LauncherOptions, ProjectType, DevOptions, BuildOptions } from '../src/types'
import path from 'path'
import fs from 'fs/promises'

// Mock dependencies
vi.mock('vite', () => ({
  createServer: vi.fn(),
  build: vi.fn(),
  preview: vi.fn(),
  mergeConfig: vi.fn((config1, config2) => ({ ...config1, ...config2 })),
}))

// Mock service classes
vi.mock('../src/services/ErrorHandler', () => ({
  ErrorHandler: vi.fn().mockImplementation(() => ({
    handleError: vi.fn().mockReturnValue({ message: 'Mock error', code: 'E001' }),
    createError: vi.fn().mockReturnValue({ message: 'Mock error', code: 'E001' }),
  })),
}))

vi.mock('../src/services/ProjectDetector', () => ({
  ProjectDetector: vi.fn().mockImplementation(() => ({
    detectProjectType: vi.fn().mockResolvedValue({
      projectType: 'vue3',
      framework: 'vue3',
      confidence: 0.9,
      report: {
        detectedFiles: ['index.html', 'main.js'],
        dependencies: { vue: '^3.0.0' },
      },
    }),
  })),
}))

vi.mock('../src/services/ConfigManager', () => ({
  ConfigManager: vi.fn().mockImplementation(() => ({
    mergeConfig: vi.fn().mockImplementation((base, override) => ({ ...base, ...override })),
    loadPreset: vi.fn().mockResolvedValue({ config: {} }),
    loadProjectConfig: vi.fn().mockResolvedValue({}),
  })),
}))

vi.mock('../src/services/PluginManager', () => ({
  PluginManager: vi.fn().mockImplementation(() => ({
    createPluginsForProject: vi.fn().mockResolvedValue([]),
  })),
}))

vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    writeFile: vi.fn(),
    rm: vi.fn(),
  },
  mkdir: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
  rm: vi.fn(),
}))

vi.mock('../src/services/ErrorHandler')
vi.mock('../src/services/ProjectDetector')
vi.mock('../src/services/ConfigManager')
vi.mock('../src/services/PluginManager')

describe('ViteLauncher', () => {
  let launcher: ViteLauncher
  let tempDir: string

  beforeEach(() => {
    tempDir = path.join(process.cwd(), 'temp-test')
    launcher = new ViteLauncher({
      logLevel: 'silent',
      mode: 'development',
    })
  })

  afterEach(async () => {
    await launcher.destroy()
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('constructor', () => {
    it('应该使用默认选项创建实例', () => {
      const defaultLauncher = new ViteLauncher()
      expect(defaultLauncher).toBeInstanceOf(ViteLauncher)
    })

    it('应该使用自定义选项创建实例', () => {
      const options: LauncherOptions = {
        logLevel: 'error',
        mode: 'production',
        autoDetect: false,
      }
      const customLauncher = new ViteLauncher(options)
      expect(customLauncher).toBeInstanceOf(ViteLauncher)
    })
  })

  describe('create', () => {
    it('应该创建新项目', async () => {
      const projectPath = path.join(tempDir, 'test-project')
      const projectType: ProjectType = 'vue3'

      // Mock fs operations - directory doesn't exist initially
      vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.readdir).mockResolvedValue([])
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await expect(launcher.create(projectPath, projectType)).resolves.toBeUndefined()
    })

    it('应该在目录不为空时抛出错误', async () => {
      const projectPath = path.join(tempDir, 'existing-project')
      const projectType: ProjectType = 'react'

      // Mock existing directory with files
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any)
      vi.mocked(fs.readdir).mockResolvedValue(['package.json', 'src'])

      await expect(launcher.create(projectPath, projectType)).rejects.toThrow()
    })

    it('应该强制覆盖现有目录', async () => {
      const projectPath = path.join(tempDir, 'force-project')
      const projectType: ProjectType = 'vanilla'

      // Mock existing directory with files
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any)
      vi.mocked(fs.readdir).mockResolvedValue(['package.json'])
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await expect(
        launcher.create(projectPath, projectType, { force: true }),
      ).resolves.toBeUndefined()
    })
  })

  describe('dev', () => {
    it('应该启动开发服务器', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn().mockResolvedValue(undefined),
        config: {
          server: {
            port: 5173,
            host: 'localhost',
          },
        },
      }
      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const result = await launcher.dev()
      expect(result).toBe(mockServer)
      expect(mockServer.listen).toHaveBeenCalled()
    })

    it('应该使用自定义选项启动开发服务器', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn().mockResolvedValue(undefined),
        config: {
          server: {
            port: 3000,
            host: '0.0.0.0',
          },
        },
      }
      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const options: DevOptions = {
        port: 3000,
        host: '0.0.0.0',
      }

      const result = await launcher.dev(process.cwd(), options)
      expect(result).toBe(mockServer)
    })
  })

  describe('build', () => {
    it('应该构建项目', async () => {
      const { build } = await import('vite')
      vi.mocked(build).mockResolvedValue(undefined)

      // Mock fs operations for build analysis
      vi.mocked(fs.readdir).mockResolvedValue(['index.html', 'assets'])
      vi.mocked(fs.stat).mockResolvedValue({
        isFile: () => true,
        isDirectory: () => false,
      } as any)

      const result = await launcher.build()
      expect(result.success).toBe(true)
      expect(result.duration).toBeGreaterThan(0)
      expect(build).toHaveBeenCalled()
    })

    it('应该使用自定义选项构建项目', async () => {
      const { build } = await import('vite')
      vi.mocked(build).mockResolvedValue(undefined)

      const options: BuildOptions = {
        outDir: 'build',
        minify: false,
        sourcemap: true,
      }

      const result = await launcher.build(process.cwd(), options)
      expect(result.success).toBe(true)
    })

    it('应该在构建失败时返回错误结果', async () => {
      const { build } = await import('vite')
      vi.mocked(build).mockRejectedValue(new Error('Build failed'))

      const result = await launcher.build()
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })

  describe('preview', () => {
    it('应该启动预览服务器', async () => {
      const { preview } = await import('vite')
      const mockServer = {
        config: {
          server: {
            port: 4173,
            host: 'localhost',
          },
        },
      }
      vi.mocked(preview).mockResolvedValue(mockServer as any)

      // Mock directory exists check
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => true,
      } as any)

      const result = await launcher.preview()
      expect(result).toBe(mockServer)
    })

    it('应该在构建输出不存在时抛出错误', async () => {
      // Mock directory does not exist
      vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'))

      await expect(launcher.preview()).rejects.toThrow()
    })
  })

  describe('stop', () => {
    it('应该停止开发服务器', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        config: {
          server: {
            port: 5173,
            host: 'localhost',
          },
        },
      }
      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      await launcher.dev()
      await launcher.stop()

      expect(mockServer.close).toHaveBeenCalled()
    })

    it('应该在服务器未启动时不执行任何操作', async () => {
      await expect(launcher.stop()).resolves.toBeUndefined()
    })
  })

  describe('destroy', () => {
    it('应该销毁实例', async () => {
      await launcher.destroy()

      // 尝试执行操作应该抛出错误
      await expect(launcher.dev()).rejects.toThrow('ViteLauncher 实例已销毁')
    })

    it('应该多次调用destroy不抛出错误', async () => {
      await launcher.destroy()
      await expect(launcher.destroy()).resolves.toBeUndefined()
    })
  })

  describe('getProjectInfo', () => {
    it('应该获取项目信息', async () => {
      const result = await launcher.getProjectInfo()
      expect(result).toHaveProperty('path')
      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('isViteProject')
    })
  })

  describe('configure', () => {
    it('应该更新配置', () => {
      const newConfig = {
        server: {
          port: 3000,
        },
      }

      launcher.configure(newConfig)
      const config = launcher.getConfig()
      expect(config.server?.port).toBe(3000)
    })
  })

  describe('getConfig', () => {
    it('应该返回当前配置', () => {
      const config = launcher.getConfig()
      expect(config).toBeDefined()
    })
  })

  describe('getProjectType', () => {
    it('应该返回项目类型', () => {
      const projectType = launcher.getProjectType()
      expect(projectType).toBeDefined()
    })
  })
})
