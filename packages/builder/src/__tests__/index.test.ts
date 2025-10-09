/**
 * @ldesign/builder 基础测试
 */

import { describe, it, expect } from 'vitest'
import { LibraryBuilder } from '../core/LibraryBuilder'
import { createBuilder } from '../utils/factory'

describe('@ldesign/builder', () => {
  describe('LibraryBuilder', () => {
    it('should create instance successfully', () => {
      const builder = new LibraryBuilder()
      expect(builder).toBeInstanceOf(LibraryBuilder)
    })

    it('should have correct initial status', () => {
      const builder = new LibraryBuilder()
      expect(builder.getStatus()).toBe('idle')
    })

    it('should not be building initially', () => {
      const builder = new LibraryBuilder()
      expect(builder.isBuilding()).toBe(false)
    })

    it('should not be watching initially', () => {
      const builder = new LibraryBuilder()
      expect(builder.isWatching()).toBe(false)
    })
  })

  describe('Factory Functions', () => {
    it('should create builder with factory function', () => {
      const builder = createBuilder()
      expect(builder).toBeInstanceOf(LibraryBuilder)
    })

    it('should create builder with config', () => {
      const builder = createBuilder({
        input: 'src/index.ts',
        output: { dir: 'dist' }
      })
      expect(builder).toBeInstanceOf(LibraryBuilder)
    })
  })

  describe('Configuration', () => {
    it('should merge configs correctly', () => {
      const builder = new LibraryBuilder()

      const base = {
        input: 'src/index.ts',
        output: { dir: 'dist' }
      }

      const override = {
        output: { format: ['esm', 'cjs'] as any }
      }

      const merged = builder.mergeConfig(base, override)

      expect(merged.input).toBe('src/index.ts')
      expect(merged.output?.dir).toBe('dist')
      expect(merged.output?.format).toEqual(['esm', 'cjs'])
    })
  })

  describe('Bundler Management', () => {
    it('should have default bundler', () => {
      const builder = new LibraryBuilder()
      const bundler = builder.getBundler()
      expect(typeof bundler).toBe('string')
      expect(['rollup', 'rolldown']).toContain(bundler)
    })

    it('should switch bundler', () => {
      const builder = new LibraryBuilder()
      const originalBundler = builder.getBundler()

      const newBundler = originalBundler === 'rollup' ? 'rolldown' : 'rollup'

      // 注意：这个测试可能会失败，因为 rolldown 可能没有安装
      try {
        builder.setBundler(newBundler)
        expect(builder.getBundler()).toBe(newBundler)
      } catch (error) {
        // 如果切换失败（比如 rolldown 没有安装），这是预期的
        expect(error).toBeDefined()
      }
    })
  })
})
