/**
 * API 测试
 * 测试主要的公共 API 功能
 */

import { build, watch, analyze, init, defineConfig } from '../src/index'
import { ProjectType, FileType } from '../src/types'
import * as fs from 'fs-extra'
import * as path from 'path'

describe('API', () => {
  const testDir = path.join(__dirname, '../dist-test')

  beforeEach(async () => {
    // 清理测试目录
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir)
    }
  })

  afterEach(async () => {
    // 清理测试目录
    if (await fs.pathExists(testDir)) {
      await fs.remove(testDir)
    }
  })

  describe('build', () => {
    it('should build a simple TypeScript project', async () => {
      const result = await build({
        input: 'src/index.ts',
        outDir: testDir,
        formats: ['esm'],
        mode: 'development',
        sourcemap: false,
        clean: false,
      })

      expect(result).toBeTruthy()
      expect(result.success).toBe(true)
      expect(result.outputs).toBeDefined()
      expect(result.outputs.length).toBeGreaterThan(0)
    })

    it('should build with multiple formats', async () => {
      const result = await build({
        input: 'src/index.ts',
        outDir: testDir,
        formats: ['esm', 'cjs'],
        mode: 'production',
        sourcemap: true,
        clean: false,
      })

      expect(result).toBeTruthy()
      expect(result.success).toBe(true)
      expect(result.outputs).toBeDefined()
    })

    it('should handle external dependencies', async () => {
      const result = await build({
        input: 'src/index.ts',
        outDir: testDir,
        formats: ['esm'],
        external: ['rollup', 'typescript'],
        mode: 'development',
        clean: false,
      })

      expect(result).toBeTruthy()
      expect(result.success).toBe(true)
    })

    it('should generate TypeScript declarations', async () => {
      const result = await build({
        input: 'src/index.ts',
        outDir: testDir,
        formats: ['esm'],
        dts: true,
        mode: 'development',
        clean: false,
      })

      expect(result).toBeTruthy()
      expect(result.success).toBe(true)
    })
  })

  describe('analyze', () => {
    it('should analyze current project', async () => {
      const result = await analyze(process.cwd())

      expect(result).toBeTruthy()
      expect(result.projectType).toBeDefined()
      expect(result.files).toBeDefined()
      expect(Array.isArray(result.files)).toBe(true)
      expect(result.entryPoints).toBeDefined()
      expect(Array.isArray(result.entryPoints)).toBe(true)
    })

    it('should detect TypeScript files', async () => {
      const result = await analyze(process.cwd())

      const tsFiles = result.files.filter(f => f.type === 'typescript')
      expect(tsFiles.length).toBeGreaterThan(0)
    })
  })

  describe('defineConfig', () => {
    it('should return the same config object', () => {
      const config = {
        input: 'src/index.ts',
        outDir: 'dist',
        formats: ['esm', 'cjs'] as const,
        dts: true,
      }

      const result = defineConfig(config)
      expect(result).toEqual(config)
    })

    it('should provide type safety', () => {
      // 这个测试主要是为了确保 TypeScript 类型检查正常工作
      const config = defineConfig({
        input: 'src/index.ts',
        outDir: 'dist',
        formats: ['esm', 'cjs'],
        dts: true,
        external: ['vue'],
        globals: { vue: 'Vue' },
        minify: true,
        sourcemap: true,
      })

      expect(config).toBeDefined()
      expect(config.input).toBe('src/index.ts')
      expect(config.formats).toEqual(['esm', 'cjs'])
    })
  })

  describe('init', () => {
    it('should initialize project without throwing', async () => {
      // 注意：这个测试不会真正创建文件，只是确保函数不抛出错误
      await expect(init({
        template: 'vanilla',
        typescript: true,
        output: testDir,
      })).resolves.not.toThrow()
    })
  })
})
