/**
 * BuilderFactory 单元测试
 */

import type { PresetConfig } from '../../src/builder/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BuilderFactory, BuiltinPresets } from '../../src/builder/builder-factory'
import { RollupBuilder } from '../../src/builder/rollup-builder'
import { ViteBuilder } from '../../src/builder/vite-builder'

// Mock 构建器类
vi.mock('../../src/builder/vite-builder')
vi.mock('../../src/builder/rollup-builder')

describe('builderFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 清除所有预�?    BuilderFactory.getPresetNames().forEach((name) => {
      BuilderFactory.removePreset(name)
    })
    // 重新注册内置预设
    Object.values(BuiltinPresets).forEach((preset) => {
      BuilderFactory.registerPreset(preset)
    })
  })

  describe('创建构建�?, () => {
    it('应该能够创建 ViteBuilder', () => {
      const config = { entry: 'src/index.ts' }
      const builder = BuilderFactory.createViteBuilder(config)

      expect(ViteBuilder).toHaveBeenCalledWith(config)
      expect(builder).toBeInstanceOf(ViteBuilder)
    })

    it('应该能够创建 RollupBuilder', () => {
      const config = {
        input: 'src/index.ts',
        output: { file: 'dist/index.js', format: 'es' as const },
      }
      const builder = BuilderFactory.createRollupBuilder(config)

      expect(RollupBuilder).toHaveBeenCalledWith(config)
      expect(builder).toBeInstanceOf(RollupBuilder)
    })

    it('应该能够使用默认配置创建 ViteBuilder', () => {
      const builder = BuilderFactory.createViteBuilder()

      expect(ViteBuilder).toHaveBeenCalledWith({})
      expect(builder).toBeInstanceOf(ViteBuilder)
    })
  })

  describe('预设管理', () => {
    it('应该能够注册预设', () => {
      const preset: PresetConfig = {
        name: 'test-preset',
        description: '测试预设',
        config: {
          entry: 'src/test.ts',
          outDir: 'test-dist',
        },
      }

      BuilderFactory.registerPreset(preset)

      const retrievedPreset = BuilderFactory.getPreset('test-preset')
      expect(retrievedPreset).toEqual(preset)
    })

    it('应该能够获取预设', () => {
      const preset = BuilderFactory.getPreset('vue-app')
      expect(preset).toBeDefined()
      expect(preset.name).toBe('vue-app')
    })

    it('应该在预设不存在时抛出错�?, () => {
      expect(() => {
        BuilderFactory.getPreset('non-existent')
      }).toThrow('Preset "non-existent" not found')
    })

    it('应该能够获取所有预设名�?, () => {
      const names = BuilderFactory.getPresetNames()
      expect(names).toContain('vue-app')
      expect(names).toContain('react-app')
      expect(names).toContain('library')
    })

    it('应该能够移除预设', () => {
      BuilderFactory.removePreset('vue-app')

      expect(() => {
        BuilderFactory.getPreset('vue-app')
      }).toThrow('Preset "vue-app" not found')
    })
  })

  describe('使用预设创建构建�?, () => {
    it('应该能够使用预设创建 ViteBuilder', () => {
      const builder = BuilderFactory.createViteBuilderWithPreset('vue-app')

      expect(ViteBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: 'src/main.ts',
          outDir: 'dist',
        }),
      )
      expect(builder).toBeInstanceOf(ViteBuilder)
    })

    it('应该能够使用预设创建 RollupBuilder', () => {
      const builder = BuilderFactory.createRollupBuilderWithPreset('rollup-library')

      expect(RollupBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'src/index.ts',
          output: expect.arrayContaining([
            expect.objectContaining({ format: 'es' }),
            expect.objectContaining({ format: 'cjs' }),
          ]),
        }),
      )
      expect(builder).toBeInstanceOf(RollupBuilder)
    })

    it('应该能够覆盖预设配置', () => {
      const overrides = {
        entry: 'src/custom.ts',
        outDir: 'custom-dist',
      }

      const builder = BuilderFactory.createViteBuilderWithPreset('vue-app', overrides)

      expect(ViteBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: 'src/custom.ts',
          outDir: 'custom-dist',
        }),
      )
    })

    it('应该正确合并嵌套配置', () => {
      const overrides = {
        server: {
          port: 8080,
        },
      }

      const builder = BuilderFactory.createViteBuilderWithPreset('vue-app', overrides)

      expect(ViteBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            port: 8080,
            open: true, // 来自预设的默认�?          }),
        }),
      )
    })
  })

  describe('内置预设', () => {
    it('应该包含 Vue 应用预设', () => {
      const preset = BuilderFactory.getPreset('vue-app')
      expect(preset.name).toBe('vue-app')
      expect(preset.config).toMatchObject({
        entry: 'src/main.ts',
        outDir: 'dist',
      })
    })

    it('应该包含 React 应用预设', () => {
      const preset = BuilderFactory.getPreset('react-app')
      expect(preset.name).toBe('react-app')
      expect(preset.config).toMatchObject({
        entry: 'src/index.tsx',
        outDir: 'build',
      })
    })

    it('应该包含库开发预�?, () => {
      const preset = BuilderFactory.getPreset('library')
      expect(preset.name).toBe('library')
      expect(preset.config).toMatchObject({
        lib: {
          entry: 'src/index.ts',
          formats: ['es', 'cjs'],
        },
      })
    })

    it('应该包含 TypeScript 库预�?, () => {
      const preset = BuilderFactory.getPreset('ts-library')
      expect(preset.name).toBe('ts-library')
      expect(preset.config).toMatchObject({
        lib: {
          entry: 'src/index.ts',
          formats: ['es', 'cjs'],
        },
        sourcemap: true,
      })
    })

    it('应该包含 Node.js 应用预设', () => {
      const preset = BuilderFactory.getPreset('node-app')
      expect(preset.name).toBe('node-app')
      expect(preset.config).toMatchObject({
        entry: 'src/index.ts',
        target: 'node16',
        external: ['node:*'],
      })
    })

    it('应该包含 Rollup 库预�?, () => {
      const preset = BuilderFactory.getPreset('rollup-library')
      expect(preset.name).toBe('rollup-library')
      expect(preset.config).toMatchObject({
        input: 'src/index.ts',
        output: expect.arrayContaining([
          expect.objectContaining({ format: 'es' }),
          expect.objectContaining({ format: 'cjs' }),
        ]),
      })
    })

    it('应该包含 UMD 库预�?, () => {
      const preset = BuilderFactory.getPreset('umd-library')
      expect(preset.name).toBe('umd-library')
      expect(preset.config).toMatchObject({
        input: 'src/index.ts',
        output: expect.objectContaining({
          format: 'umd',
          name: 'MyLibrary',
        }),
      })
    })
  })

  describe('配置合并', () => {
    it('应该正确合并简单配�?, () => {
      const preset: PresetConfig = {
        name: 'test',
        config: {
          entry: 'src/index.ts',
          outDir: 'dist',
        },
      }

      BuilderFactory.registerPreset(preset)

      const builder = BuilderFactory.createViteBuilderWithPreset('test', {
        outDir: 'build',
        minify: false,
      })

      expect(ViteBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: 'src/index.ts',
          outDir: 'build',
          minify: false,
        }),
      )
    })

    it('应该正确处理数组配置', () => {
      const preset: PresetConfig = {
        name: 'test-array',
        config: {
          external: ['react', 'react-dom'],
        },
      }

      BuilderFactory.registerPreset(preset)

      const builder = BuilderFactory.createViteBuilderWithPreset('test-array', {
        external: ['lodash'],
      })

      expect(ViteBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          external: ['lodash'], // 数组应该被完全替�?        }),
      )
    })

    it('应该正确处理 undefined �?, () => {
      const preset: PresetConfig = {
        name: 'test-undefined',
        config: {
          entry: 'src/index.ts',
          minify: true,
        },
      }

      BuilderFactory.registerPreset(preset)

      const builder = BuilderFactory.createViteBuilderWithPreset('test-undefined', {
        outDir: 'build',
        minify: undefined,
      })

      expect(ViteBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          entry: 'src/index.ts',
          outDir: 'build',
          minify: true, // undefined 值不应该覆盖预设�?        }),
      )
    })
  })
})


