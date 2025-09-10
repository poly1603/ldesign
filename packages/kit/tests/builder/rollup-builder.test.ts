/**
 * RollupBuilder 单元测试
 */


import { vi } from 'vitest'
import type { RollupBuilderConfig } from '../../src/builder/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RollupBuilder } from '../../src/builder/rollup-builder'

// Mock Rollup API
vi.mock('rollup', () => ({
  rollup: vi.fn(),
  watch: vi.fn(),
}))

describe('rollupBuilder', () => {
  let builder: RollupBuilder
  let mockConfig: RollupBuilderConfig

  beforeEach(() => {
    mockConfig = {
      input: 'src/index.ts',
      output: {
        file: 'dist/index.js',
        format: 'es',
      },
      env: 'development',
    }
    builder = new RollupBuilder(mockConfig)
  })

  afterEach(async () => {
    await builder.destroy()
    vi.clearAllMocks()
  })

  describe('构造函�?, () => {
    it('应该正确初始化配�?, () => {
      const config = builder.getConfig()
      expect(config.input).toBe('src/index.ts')
      expect(config.output).toEqual({
        file: 'dist/index.js',
        format: 'es',
      })
      expect(config.env).toBe('development')
    })

    it('应该使用默认配置', () => {
      const defaultBuilder = new RollupBuilder({
        input: 'src/index.ts',
        output: { file: 'dist/index.js', format: 'es' },
      })
      const config = defaultBuilder.getConfig()

      expect(config.env).toBe('production')
      expect(config.sourcemap).toBe(true)
      expect(config.minify).toBe(true)
      expect(config.cleanOutDir).toBe(true)

      defaultBuilder.destroy()
    })

    it('应该正确处理多个输出配置', () => {
      const multiOutputBuilder = new RollupBuilder({
        input: 'src/index.ts',
        output: [
          { file: 'dist/index.js', format: 'es' },
          { file: 'dist/index.cjs', format: 'cjs' },
        ],
      })

      const config = multiOutputBuilder.getConfig()
      expect(Array.isArray(config.output)).toBe(true)
      expect(config.output).toHaveLength(2)

      multiOutputBuilder.destroy()
    })
  })

  describe('配置管理', () => {
    it('应该能够获取配置', () => {
      const config = builder.getConfig()
      expect(config).toEqual(expect.objectContaining(mockConfig))
    })

    it('应该能够设置配置', () => {
      builder.setConfig({
        external: ['lodash'],
        minify: false,
      })

      const config = builder.getConfig()
      expect(config.external).toEqual(['lodash'])
      expect(config.minify).toBe(false)
    })

    it('应该能够获取 Rollup 配置', () => {
      const rollupConfig = builder.getRollupConfig()
      expect(rollupConfig).toHaveProperty('input')
      expect(rollupConfig).toHaveProperty('output')
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
      const { rollup } = await import('rollup')
      const mockBundle = {
        write: vi.fn().mockResolvedValue({
          output: [
            {
              fileName: 'index.js',
              code: 'console.log("test")',
              format: 'es',
            },
          ],
        }),
        close: vi.fn(),
      }

      vi.mocked(rollup).mockResolvedValue(mockBundle as any)

      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(result.outputs).toHaveLength(1)
      expect(result.outputs[0].fileName).toBe('index.js')
      expect(mockBundle.write).toHaveBeenCalled()
      expect(mockBundle.close).toHaveBeenCalled()
    })

    it('应该处理构建错误', async () => {
      const { rollup } = await import('rollup')
      const mockError = new Error('Build failed')

      vi.mocked(rollup).mockRejectedValue(mockError)

      const result = await builder.build()

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Build failed')
    })

    it('应该能够处理多个输出配置', async () => {
      const multiOutputBuilder = new RollupBuilder({
        input: 'src/index.ts',
        output: [
          { file: 'dist/index.js', format: 'es' },
          { file: 'dist/index.cjs', format: 'cjs' },
        ],
      })

      const { rollup } = await import('rollup')
      const mockBundle = {
        write: vi.fn().mockResolvedValue({
          output: [
            {
              fileName: 'index.js',
              code: 'console.log("test")',
              format: 'es',
            },
          ],
        }),
        close: vi.fn(),
      }

      vi.mocked(rollup).mockResolvedValue(mockBundle as any)

      const result = await multiOutputBuilder.build()

      expect(result.success).toBe(true)
      expect(mockBundle.write).toHaveBeenCalledTimes(2)

      multiOutputBuilder.destroy()
    })
  })

  describe('多格式构�?, () => {
    it('应该能够构建多种格式', async () => {
      const { rollup } = await import('rollup')
      const mockBundle = {
        write: vi.fn().mockResolvedValue({
          output: [
            {
              fileName: 'index.js',
              code: 'console.log("test")',
              format: 'es',
            },
          ],
        }),
        close: vi.fn(),
      }

      vi.mocked(rollup).mockResolvedValue(mockBundle as any)

      const results = await builder.buildMultiple(['es', 'cjs', 'umd'])

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
    })

    it('应该处理多格式构建中的错�?, async () => {
      const { rollup } = await import('rollup')
      vi.mocked(rollup).mockRejectedValue(new Error('Build failed'))

      const results = await builder.buildMultiple(['es', 'cjs'])

      expect(results).toHaveLength(2)
      expect(results.every(r => !r.success)).toBe(true)
      expect(results.every(r => r.errors?.includes('Build failed'))).toBe(true)
    })
  })

  describe('监听模式', () => {
    it('应该能够启动监听模式', async () => {
      const { watch } = await import('rollup')
      const mockWatcher = {
        on: vi.fn(),
        close: vi.fn(),
      }

      vi.mocked(watch).mockReturnValue(mockWatcher as any)

      // 启动监听模式（不等待完成，因为它是持续运行的�?      const watchPromise = builder.watch()

      // 等待一小段时间�?watch 开�?      await new Promise(resolve => setTimeout(resolve, 10))

      expect(watch).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'src/index.ts',
        }),
      )
      expect(mockWatcher.on).toHaveBeenCalled()
    })

    it('应该处理监听模式事件', async () => {
      const { watch } = await import('rollup')
      const mockWatcher = {
        on: vi.fn(),
        close: vi.fn(),
      }

      vi.mocked(watch).mockReturnValue(mockWatcher as any)

      const startHandler = vi.fn()
      const endHandler = vi.fn()
      const errorHandler = vi.fn()

      builder.on('build:start', startHandler)
      builder.on('build:end', endHandler)
      builder.on('build:error', errorHandler)

      builder.watch()

      // 模拟事件触发
      const eventHandler = mockWatcher.on.mock.calls[0][1]

      // 模拟 START 事件
      eventHandler({ code: 'START' })
      expect(startHandler).toHaveBeenCalled()

      // 模拟 BUNDLE_END 事件
      const mockResult = { close: vi.fn() }
      eventHandler({ code: 'BUNDLE_END', result: mockResult, duration: 100 })
      expect(endHandler).toHaveBeenCalled()
      expect(mockResult.close).toHaveBeenCalled()

      // 模拟 ERROR 事件
      const mockError = new Error('Watch error')
      eventHandler({ code: 'ERROR', error: mockError })
      expect(errorHandler).toHaveBeenCalledWith({ error: mockError })
    })
  })

  describe('事件系统', () => {
    it('应该触发构建开始事�?, async () => {
      const { rollup } = await import('rollup')
      const mockBundle = {
        write: vi.fn().mockResolvedValue({ output: [] }),
        close: vi.fn(),
      }
      vi.mocked(rollup).mockResolvedValue(mockBundle as any)

      const startHandler = vi.fn()
      builder.on('build:start', startHandler)

      await builder.build()

      expect(startHandler).toHaveBeenCalledWith({
        mode: 'build',
        config: expect.any(Object),
      })
    })

    it('应该触发构建完成事件', async () => {
      const { rollup } = await import('rollup')
      const mockBundle = {
        write: vi.fn().mockResolvedValue({ output: [] }),
        close: vi.fn(),
      }
      vi.mocked(rollup).mockResolvedValue(mockBundle as any)

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
      const { rollup } = await import('rollup')
      const mockError = new Error('Build failed')
      vi.mocked(rollup).mockRejectedValue(mockError)

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
      await expect(builder.build()).rejects.toThrow('RollupBuilder has been destroyed')
    })

    it('应该在销毁时关闭监听�?, async () => {
      const { watch } = await import('rollup')
      const mockWatcher = {
        on: vi.fn(),
        close: vi.fn(),
      }

      vi.mocked(watch).mockReturnValue(mockWatcher as any)

      builder.watch()
      await builder.destroy()

      expect(mockWatcher.close).toHaveBeenCalled()
    })
  })
})



