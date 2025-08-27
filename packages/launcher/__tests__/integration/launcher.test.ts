import type { BuildOptions, DevOptions, ProjectType } from '../../src/types'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildProject, createProject, startDev, startPreview, ViteLauncher } from '../../src/index'

// Mock all external dependencies
vi.mock('vite', () => ({
  createServer: vi.fn(),
  build: vi.fn(),
  preview: vi.fn(),
  mergeConfig: vi.fn((config1, config2) => ({ ...config1, ...config2 })),
}))

vi.mock('node:fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    writeFile: vi.fn(),
    rm: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(),
  },
  mkdir: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
  rm: vi.fn(),
  readFile: vi.fn(),
  access: vi.fn(),
}))

describe('viteLauncher Integration', () => {
  let tempDir: string
  let mockFs: any

  beforeEach(async () => {
    tempDir = path.join(process.cwd(), 'temp-integration-test')
    const fs = await import('node:fs/promises')
    mockFs = vi.mocked(fs)

    // Setup default mocks
    mockFs.mkdir.mockResolvedValue(undefined)
    mockFs.readdir.mockResolvedValue([])
    mockFs.writeFile.mockResolvedValue(undefined)
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      dependencies: { vue: '^3.0.0' },
    }))
    mockFs.access.mockResolvedValue(undefined)
    mockFs.stat.mockResolvedValue({
      isDirectory: () => true,
      isFile: () => true,
    })
  })

  afterEach(async () => {
    // Clean up temp directory
    try {
      await mockFs.rm(tempDir, { recursive: true, force: true })
    }
    catch {
      // Ignore cleanup errors
    }
  })

  describe('完整工作流程', () => {
    it('应该完成完整的项目创建到构建流程', async () => {
      const { createServer, build, preview } = await import('vite')

      // Mock server
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
      vi.mocked(build).mockResolvedValue(undefined)
      vi.mocked(preview).mockResolvedValue(mockServer as any)

      const launcher = new ViteLauncher({ logLevel: 'silent' })
      const projectPath = path.join(tempDir, 'test-project')
      const projectType: ProjectType = 'vue3'

      // 1. 创建项目
      await expect(launcher.create(projectPath, projectType)).resolves.toBeUndefined()

      // 2. 启动开发服务器
      const devServer = await launcher.dev(projectPath)
      expect(devServer).toBe(mockServer)
      expect(mockServer.listen).toHaveBeenCalled()

      // 3. 构建项目
      const buildResult = await launcher.build(projectPath)
      expect(buildResult.success).toBe(true)
      expect(build).toHaveBeenCalled()

      // 4. 启动预览服务器
      const previewServer = await launcher.preview(projectPath)
      expect(previewServer).toBe(mockServer)

      // 5. 停止服务器
      await launcher.stop()
      expect(mockServer.close).toHaveBeenCalled()

      // 6. 销毁实例
      await launcher.destroy()
    })
  })

  describe('便捷函数', () => {
    it('应该使用便捷函数创建项目', async () => {
      const projectPath = path.join(tempDir, 'convenience-project')
      const projectType: ProjectType = 'react'

      await expect(createProject(projectPath, projectType)).resolves.toBeUndefined()
    })

    it('应该使用便捷函数启动开发服务器', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn().mockResolvedValue(undefined),
        config: {
          server: {
            port: 3000,
            host: 'localhost',
          },
        },
      }
      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const options: DevOptions = {
        port: 3000,
        host: 'localhost',
      }

      const server = await startDev(process.cwd(), options)
      expect(server).toBe(mockServer)
    })

    it('应该使用便捷函数构建项目', async () => {
      const { build } = await import('vite')
      vi.mocked(build).mockResolvedValue(undefined)

      const options: BuildOptions = {
        outDir: 'build',
        minify: false,
      }

      const result = await buildProject(process.cwd(), options)
      expect(result.success).toBe(true)
    })

    it('应该使用便捷函数启动预览服务器', async () => {
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

      const server = await startPreview(process.cwd())
      expect(server).toBe(mockServer)
    })
  })

  describe('错误处理', () => {
    it('应该处理项目创建失败', async () => {
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'))

      const launcher = new ViteLauncher({ logLevel: 'silent' })
      const projectPath = path.join(tempDir, 'error-project')
      const projectType: ProjectType = 'vanilla'

      await expect(launcher.create(projectPath, projectType)).rejects.toThrow()
    })

    it('应该处理开发服务器启动失败', async () => {
      const { createServer } = await import('vite')
      vi.mocked(createServer).mockRejectedValue(new Error('Port already in use'))

      const launcher = new ViteLauncher({ logLevel: 'silent' })

      await expect(launcher.dev()).rejects.toThrow()
    })

    it('应该处理构建失败', async () => {
      const { build } = await import('vite')
      vi.mocked(build).mockRejectedValue(new Error('Build failed'))

      const launcher = new ViteLauncher({ logLevel: 'silent' })

      const result = await launcher.build()
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })

  describe('配置管理', () => {
    it('应该正确合并配置', () => {
      const launcher = new ViteLauncher({ logLevel: 'silent' })

      const baseConfig = {
        server: {
          port: 3000,
        },
      }

      const overrideConfig = {
        server: {
          port: 4000,
          host: '0.0.0.0',
        },
      }

      launcher.configure(baseConfig)
      launcher.configure(overrideConfig)

      const finalConfig = launcher.getConfig()
      expect(finalConfig.server?.port).toBe(4000)
      expect(finalConfig.server?.host).toBe('0.0.0.0')
    })
  })

  describe('实例生命周期', () => {
    it('应该正确处理实例销毁', async () => {
      const launcher = new ViteLauncher({ logLevel: 'silent' })

      // 销毁实例
      await launcher.destroy()

      // 尝试执行操作应该失败
      await expect(launcher.dev()).rejects.toThrow('ViteLauncher 实例已销毁')
      await expect(launcher.build()).rejects.toThrow('ViteLauncher 实例已销毁')
      await expect(launcher.create('test', 'vanilla')).rejects.toThrow('ViteLauncher 实例已销毁')
    })

    it('应该支持多次销毁调用', async () => {
      const launcher = new ViteLauncher({ logLevel: 'silent' })

      await launcher.destroy()
      await expect(launcher.destroy()).resolves.toBeUndefined()
    })
  })
})
