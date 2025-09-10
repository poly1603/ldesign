/**
 * ViteBuilder 单元测试
 */


import { vi } from 'vitest'
import type { ViteBuilderConfig } from '../../src/builder/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ViteBuilder } from '../../src/builder/vite-builder'

// Mock Vite API
vi.mock('vite', () => ({
  build: vi.fn(),
  createServer: vi.fn(),
  preview: vi.fn(),
  resolveConfig: vi.fn(),
}))

describe('viteBuilder', () => {
  let builder: ViteBuilder
  let mockConfig: ViteBuilderConfig

  beforeEach(() => {
    mockConfig = {
      root: '/test/project',
      entry: 'src/index.ts',
      outDir: 'dist',
      env: 'development',
    }
    builder = new ViteBuilder(mockConfig)
  })

  afterEach(async () => {
    await builder.destroy()
    vi.clearAllMocks()
  })

  describe('构造函�?, () => {
    it('应该正确初始化配�?, () => {
      const config = builder.getConfig()
      expect(config.root).toBe('/test/project')
      expect(config.entry).toBe('src/index.ts')
      expect(config.outDir).toBe('dist')
      expect(config.env).toBe('development')
    })

    it('应该使用默认配置', () => {
      const defaultBuilder = new ViteBuilder()
      const config = defaultBuilder.getConfig()

      expect(config.env).toBe('production')
      expect(config.sourcemap).toBe(true)
      expect(config.minify).toBe(true)
      expect(config.cleanOutDir).toBe(true)

      defaultBuilder.destroy()
    })

    it('应该正确合并服务器配�?, () => {
      const builderWithServer = new ViteBuilder({
        server: {
          port: 8080,
          host: 'localhost',
        },
      })

      const config = builderWithServer.getConfig()
      expect(config.server?.port).toBe(8080)
      expect(config.server?.host).toBe('localhost')
      expect(config.server?.cors).toBe(true) // 默认�?
      builderWithServer.destroy()
    })
  })

  describe('配置管理', () => {
    it('应该能够获取配置', () => {
      const config = builder.getConfig()
      expect(config).toEqual(expect.objectContaining(mockConfig))
    })

    it('应该能够设置配置', () => {
      builder.setConfig({
        outDir: 'build',
        minify: false,
      })

      const config = builder.getConfig()
      expect(config.outDir).toBe('build')
      expect(config.minify).toBe(false)
    })

    it('应该能够获取 Vite 配置', () => {
      const viteConfig = builder.getViteConfig()
      expect(viteConfig).toHaveProperty('root')
      expect(viteConfig).toHaveProperty('build')
    })
  })

  describe('插件管理', () => {
    it('应该能够添加插件', () => {
      const mockPlugin = { name: 'test-plugin' }
      builder.addPlugin(mockPlugin)

      const config = builder.getConfig()
      expect(config.plugins).toContain(mockPlugin)
    })

    it('应该能够移除插件', () => {
      const mockPlugin = { name: 'test-plugin' }
      builder.addPlugin(mockPlugin)
      builder.removePlugin('test-plugin')

      const config = builder.getConfig()
      expect(config.plugins).not.toContain(mockPlugin)
    })
  })

  describe('构建功能', () => {
    it('应该能够执行构建', async () => {
      const { build } = await import('vite')
      const mockBuildResult = {
        output: [
          {
            fileName: 'index.js',
            code: 'console.log("test")',
            format: 'es',
          },
        ],
      }

      vi.mocked(build).mockResolvedValue(mockBuildResult)

      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].fileName).toBe('index.js')
      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          root: '/test/project',
        }),
      )
    })

    it('应该处理构建错误', async () => {
      const { build } = await import('vite')
      const mockError = new Error('Build failed')

      vi.mocked(build).mockRejectedValue(mockError)

      const result = await builder.build()

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Build failed')
    })

    it('应该能够构建�?, async () => {
      const libBuilder = new ViteBuilder({
        lib: {
          entry: 'src/index.ts',
          name: 'MyLib',
          formats: ['es', 'cjs'],
        },
      })

      const { build } = await import('vite')
      vi.mocked(build).mockResolvedValue({ output: [] })

      const result = await libBuilder.buildLib()
      expect(result.success).toBe(true)

      libBuilder.destroy()
    })

    it('应该在没有库配置时抛出错�?, async () => {
      await expect(builder.buildLib()).rejects.toThrow(
        'Library configuration is required for buildLib()',
      )
    })
  })

  describe('开发服务器', () => {
    it('应该能够启动开发服务器', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn(),
        close: vi.fn(),
        config: {
          server: {
            port: 3000,
            host: true,
            https: false,
          },
        },
      }

      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const result = await builder.dev()

      expect(result.url).toBe('http://localhost:3000')
      expect(result.port).toBe(3000)
      expect(result.https).toBe(false)
      expect(mockServer.listen).toHaveBeenCalled()
    })

    it('应该能够关闭开发服务器', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn(),
        close: vi.fn(),
        config: {
          server: {
            port: 3000,
            host: true,
            https: false,
          },
        },
      }

      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const result = await builder.dev()
      await result.close()

      expect(mockServer.close).toHaveBeenCalled()
    })
  })

  describe('预览服务�?, () => {
    it('应该能够启动预览服务�?, async () => {
      const { preview } = await import('vite')
      const mockPreviewServer = {
        close: vi.fn(),
        config: {
          preview: {
            port: 4173,
            host: true,
            https: false,
          },
        },
      }

      vi.mocked(preview).mockResolvedValue(mockPreviewServer as any)

      const result = await builder.preview()

      expect(result.url).toBe('http://localhost:4173')
      expect(result.port).toBe(4173)
      expect(result.https).toBe(false)
    })
  })

  describe('监听模式', () => {
    it('应该能够启动监听模式', async () => {
      const { build } = await import('vite')
      vi.mocked(build).mockResolvedValue({ output: [] })

      // 由于 watch 是一个持续运行的过程，我们只测试它是否正确调用了 build
      const watchPromise = builder.watch()

      // 等待一小段时间�?watch 开�?      await new Promise(resolve => setTimeout(resolve, 10))

      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          build: expect.objectContaining({
            watch: {},
          }),
        }),
      )
    })
  })

  describe('事件系统', () => {
    it('应该触发构建开始事�?, async () => {
      const { build } = await import('vite')
      vi.mocked(build).mockResolvedValue({ output: [] })

      const startHandler = vi.fn()
      builder.on('build:start', startHandler)

      await builder.build()

      expect(startHandler).toHaveBeenCalledWith({
        mode: 'build',
        config: expect.any(Object),
      })
    })

    it('应该触发构建完成事件', async () => {
      const { build } = await import('vite')
      vi.mocked(build).mockResolvedValue({ output: [] })

      const endHandler = vi.fn()
      builder.on('build:end', endHandler)

      await builder.build()

      expect(endHandler).toHaveBeenCalledWith({
        result: expect.objectContaining({
          success: true,
        }),
      })
    })

    it('应该触发构建错误事件', async () => {
      const { build } = await import('vite')
      const mockError = new Error('Build failed')
      vi.mocked(build).mockRejectedValue(mockError)

      const errorHandler = vi.fn()
      builder.on('build:error', errorHandler)

      await builder.build()

      expect(errorHandler).toHaveBeenCalledWith({
        error: mockError,
      })
    })
  })

  describe('销毁功�?, () => {
    it('应该能够正确销�?, async () => {
      await builder.destroy()

      // 销毁后应该无法执行操作
      await expect(builder.build()).rejects.toThrow('ViteBuilder has been destroyed')
    })

    it('应该在销毁时关闭服务�?, async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn(),
        close: vi.fn(),
        config: {
          server: {
            port: 3000,
            host: true,
            https: false,
          },
        },
      }

      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      await builder.dev()
      await builder.destroy()

      expect(mockServer.close).toHaveBeenCalled()
    })
  })
})



