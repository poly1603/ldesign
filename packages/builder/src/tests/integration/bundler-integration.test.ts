/**
 * 打包工具集成测试
 * 
 * 测试 Rollup 和 Rolldown 的功能完整性和一致性
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { LibraryBuilder } from '../../core/LibraryBuilder'
import { BuildManifestGenerator } from '../../core/BuildManifestGenerator'
import { ConfigValidator } from '../../core/ConfigValidator'
import { BannerGenerator } from '../../utils/banner-generator'
import { resetGlobalMemoryManager } from '../../utils/memory-manager'
import type { BuilderConfig } from '../../types/config'

describe('打包工具集成测试', () => {
  const testDir = path.join(__dirname, '../../../test-output')
  const fixturesDir = path.join(__dirname, '../fixtures')

  beforeEach(() => {
    // 重置全局内存管理器
    resetGlobalMemoryManager()

    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }

    // 重置全局内存管理器
    resetGlobalMemoryManager()
  })

  describe('基础功能测试', () => {
    it('应该能够使用 Rollup 构建简单的 TypeScript 项目', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'simple-ts/index.ts'),
        output: {
          dir: path.join(testDir, 'rollup-simple'),
          format: ['esm', 'cjs'],
          sourcemap: true
        },
        bundler: 'rollup',
        minify: false
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'rollup-simple/index.js'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'rollup-simple/index.cjs'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'rollup-simple/index.js.map'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'rollup-simple/index.cjs.map'))).toBe(true)
    }, 60000) // 增加超时时间到60秒

    it('应该能够使用 Rolldown 构建简单的 TypeScript 项目', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'simple-ts/index.ts'),
        output: {
          dir: path.join(testDir, 'rolldown-simple'),
          format: ['esm', 'cjs'],
          sourcemap: true
        },
        bundler: 'rolldown',
        minify: false
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'rolldown-simple/index.js'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'rolldown-simple/index.cjs'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'rolldown-simple/index.js.map'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'rolldown-simple/index.cjs.map'))).toBe(true)
    }, 60000) // 增加超时时间到60秒
  })

  describe('多入口测试', () => {
    it('应该支持多入口构建', async () => {
      const config: BuilderConfig = {
        input: {
          main: path.join(fixturesDir, 'multi-entry/main.ts'),
          utils: path.join(fixturesDir, 'multi-entry/utils.ts')
        },
        output: {
          dir: path.join(testDir, 'multi-entry'),
          format: 'esm',
          sourcemap: true
        },
        bundler: 'rollup',
        minify: false
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'multi-entry/main.js'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'multi-entry/utils.js'))).toBe(true)
    })
  })

  describe('多格式输出测试', () => {
    it('应该支持所有输出格式', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'simple-ts/index.ts'),
        output: {
          dir: path.join(testDir, 'multi-format'),
          format: ['esm', 'cjs', 'umd', 'iife'],
          name: 'TestLib',
          sourcemap: true
        },
        bundler: 'rollup',
        minify: false
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'multi-format/index.js'))).toBe(true) // ESM
      expect(fs.existsSync(path.join(testDir, 'multi-format/index.cjs'))).toBe(true) // CJS
      expect(fs.existsSync(path.join(testDir, 'multi-format/index.umd.js'))).toBe(true) // UMD
      expect(fs.existsSync(path.join(testDir, 'multi-format/index.iife.js'))).toBe(true) // IIFE
    })
  })

  describe('压缩功能测试', () => {
    it('应该支持不同级别的压缩', async () => {
      const levels = ['none', 'whitespace', 'basic', 'advanced'] as const

      for (const level of levels) {
        const config: BuilderConfig = {
          input: path.join(fixturesDir, 'simple-ts/index.ts'),
          output: {
            dir: path.join(testDir, `minify-${level}`),
            format: 'esm',
            sourcemap: true
          },
          bundler: 'rollup',
          minify: {
            level,
            js: true
          }
        }

        const builder = new LibraryBuilder(config)
        const result = await builder.build()

        expect(result.success).toBe(true)
        expect(fs.existsSync(path.join(testDir, `minify-${level}/index.js`))).toBe(true)

        // 检查文件内容是否符合压缩级别
        const content = fs.readFileSync(path.join(testDir, `minify-${level}/index.js`), 'utf-8')
        
        if (level === 'none') {
          expect(content).toMatch(/\s+/) // 应该包含空格
        } else if (level === 'advanced') {
          expect(content.length).toBeLessThan(1000) // 应该被大幅压缩
        }
      }
    })
  })

  describe('Banner 功能测试', () => {
    it('应该在输出文件中包含 Banner', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'simple-ts/index.ts'),
        output: {
          dir: path.join(testDir, 'banner-test'),
          format: 'esm',
          sourcemap: true
        },
        bundler: 'rollup',
        minify: false,
        banner: {
          enabled: true,
          style: 'default'
        }
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(true)

      const content = fs.readFileSync(path.join(testDir, 'banner-test/index.js'), 'utf-8')
      expect(content).toMatch(/^\/\*!/) // 应该以 banner 开头
      expect(content).toMatch(/Built with/) // 应该包含构建信息
    })
  })

  describe('构建清单测试', () => {
    it('应该生成构建清单', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'simple-ts/index.ts'),
        output: {
          dir: path.join(testDir, 'manifest-test'),
          format: ['esm', 'cjs'],
          sourcemap: true
        },
        bundler: 'rollup',
        minify: false,
        manifest: {
          enabled: true,
          formats: ['json', 'markdown', 'html']
        }
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'manifest-test/build-manifest.json'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'manifest-test/build-manifest.md'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'manifest-test/build-manifest.html'))).toBe(true)

      // 验证清单内容
      const manifest = JSON.parse(fs.readFileSync(path.join(testDir, 'manifest-test/build-manifest.json'), 'utf-8'))
      expect(manifest.build).toBeDefined()
      expect(manifest.files).toBeDefined()
      expect(manifest.stats).toBeDefined()
      expect(manifest.files.length).toBeGreaterThan(0)
    })
  })

  describe('TypeScript 兼容性测试', () => {
    it('应该正确处理 TypeScript 类型声明', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'typescript-complex/index.ts'),
        output: {
          dir: path.join(testDir, 'typescript-test'),
          format: ['esm', 'cjs'],
          sourcemap: true
        },
        bundler: 'rollup',
        typescript: {
          declaration: true,
          declarationDir: path.join(testDir, 'typescript-test')
        },
        minify: false
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'typescript-test/index.d.ts'))).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'typescript-test/index.d.cts'))).toBe(true)

      // 验证类型声明文件内容
      const dtsContent = fs.readFileSync(path.join(testDir, 'typescript-test/index.d.ts'), 'utf-8')
      expect(dtsContent).toMatch(/export/) // 应该包含导出声明
    })
  })

  describe('外部依赖处理测试', () => {
    it('应该正确处理外部依赖', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'with-externals/index.ts'),
        output: {
          dir: path.join(testDir, 'externals-test'),
          format: 'esm',
          sourcemap: true
        },
        bundler: 'rollup',
        external: ['lodash', 'react'],
        minify: false
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(true)

      const content = fs.readFileSync(path.join(testDir, 'externals-test/index.js'), 'utf-8')
      expect(content).toMatch(/import.*from.*['"]lodash['"]/) // 应该保留外部依赖的导入
      expect(content).not.toMatch(/lodash.*=.*function/) // 不应该包含 lodash 的实现
    })
  })

  describe('错误处理测试', () => {
    it('应该正确处理构建错误', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'invalid-syntax/index.ts'), // 不存在的文件
        output: {
          dir: path.join(testDir, 'error-test'),
          format: 'esm'
        },
        bundler: 'rollup',
        minify: false
      }

      const builder = new LibraryBuilder(config)
      const result = await builder.build()

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内完成构建', async () => {
      const config: BuilderConfig = {
        input: path.join(fixturesDir, 'large-project/index.ts'),
        output: {
          dir: path.join(testDir, 'performance-test'),
          format: ['esm', 'cjs'],
          sourcemap: true
        },
        bundler: 'rollup',
        minify: true
      }

      const startTime = Date.now()
      const builder = new LibraryBuilder(config)
      const result = await builder.build()
      const endTime = Date.now()

      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(30000) // 应该在 30 秒内完成
    })
  })

  describe('一致性测试', () => {
    it('Rollup 和 Rolldown 应该产生相似的输出', async () => {
      const baseConfig = {
        input: path.join(fixturesDir, 'simple-ts/index.ts'),
        output: {
          format: 'esm' as const,
          sourcemap: true
        },
        minify: false
      }

      // Rollup 构建
      const rollupConfig: BuilderConfig = {
        ...baseConfig,
        output: {
          ...baseConfig.output,
          dir: path.join(testDir, 'consistency-rollup')
        },
        bundler: 'rollup'
      }

      // Rolldown 构建
      const rolldownConfig: BuilderConfig = {
        ...baseConfig,
        output: {
          ...baseConfig.output,
          dir: path.join(testDir, 'consistency-rolldown')
        },
        bundler: 'rolldown'
      }

      const rollupBuilder = new LibraryBuilder(rollupConfig)
      const rolldownBuilder = new LibraryBuilder(rolldownConfig)

      const [rollupResult, rolldownResult] = await Promise.all([
        rollupBuilder.build(),
        rolldownBuilder.build()
      ])

      expect(rollupResult.success).toBe(true)
      expect(rolldownResult.success).toBe(true)

      // 比较输出文件
      const rollupContent = fs.readFileSync(path.join(testDir, 'consistency-rollup/index.js'), 'utf-8')
      const rolldownContent = fs.readFileSync(path.join(testDir, 'consistency-rolldown/index.js'), 'utf-8')

      // 移除 banner 和空白字符后比较核心功能
      const normalizeContent = (content: string) => 
        content.replace(/\/\*![\s\S]*?\*\/\s*/, '').replace(/\s+/g, ' ').trim()

      const normalizedRollup = normalizeContent(rollupContent)
      const normalizedRolldown = normalizeContent(rolldownContent)

      // 内容应该基本相似（允许一些差异）
      expect(normalizedRollup.length).toBeCloseTo(normalizedRolldown.length, -1)
    })
  })
})
