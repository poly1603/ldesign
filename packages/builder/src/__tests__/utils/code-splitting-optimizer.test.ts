/**
 * 代码分割优化器测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CodeSplittingOptimizer } from '../../utils/code-splitting-optimizer'
import type { OptimizationOptions, OptimizationResult } from '../../utils/code-splitting-optimizer'
import * as fs from 'fs-extra'
import * as path from 'node:path'
import { tmpdir } from 'node:os'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  readFile: vi.fn()
}))
const mockFs = vi.mocked(fs)

describe('CodeSplittingOptimizer', () => {
  let optimizer: CodeSplittingOptimizer
  let tempDir: string

  beforeEach(() => {
    optimizer = new CodeSplittingOptimizer()
    tempDir = path.join(tmpdir(), `ldesign-builder-test-${Date.now()}`)
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create instance successfully', () => {
      expect(optimizer).toBeInstanceOf(CodeSplittingOptimizer)
    })
  })

  describe('optimize', () => {
    it('should optimize code splitting successfully', async () => {
      // Mock file system
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue(['index.ts', 'utils.ts', 'components'] as any)
      mockFs.stat.mockImplementation((filePath: string) => {
        if (filePath.includes('components')) {
          return Promise.resolve({ isDirectory: () => true } as any)
        }
        return Promise.resolve({ isDirectory: () => false, size: 1024 } as any)
      })
      
      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('index.ts')) {
          return Promise.resolve(`
            import { Button } from './components/Button'
            import { Modal } from './components/Modal'
            import { utils } from './utils'
          `)
        }
        return Promise.resolve('export const test = "test"')
      })

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts', 'src/main.ts'],
        strategy: 'frequency-based',
        minChunkSize: 1000,
        maxChunks: 10
      }

      const result = await optimizer.optimize(options)

      expect(result).toBeDefined()
      expect(result.strategy).toBe('frequency-based')
      expect(result.chunks).toBeDefined()
      expect(Array.isArray(result.chunks)).toBe(true)
      expect(result.recommendations).toBeDefined()
    })

    it('should handle different optimization strategies', async () => {
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue(['index.ts'] as any)
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)
      mockFs.readFile.mockResolvedValue('export const test = "test"')

      const strategies = ['frequency-based', 'feature-based', 'hybrid'] as const

      for (const strategy of strategies) {
        const options: OptimizationOptions = {
          rootDir: tempDir,
          entries: ['src/index.ts'],
          strategy
        }

        const result = await optimizer.optimize(options)

        expect(result.strategy).toBe(strategy)
        expect(result.chunks).toBeDefined()
      }
    })

    it('should respect chunk size constraints', async () => {
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue(['large.ts', 'small.ts'] as any)
      mockFs.stat.mockImplementation((filePath: string) => {
        if (filePath.includes('large.ts')) {
          return Promise.resolve({ isDirectory: () => false, size: 5000 } as any)
        }
        return Promise.resolve({ isDirectory: () => false, size: 500 } as any)
      })
      mockFs.readFile.mockResolvedValue('export const test = "test"')

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'frequency-based',
        minChunkSize: 1000,
        maxChunkSize: 4000
      }

      const result = await optimizer.optimize(options)

      // Should respect size constraints
      result.chunks.forEach(chunk => {
        if (chunk.estimatedSize) {
          expect(chunk.estimatedSize).toBeGreaterThanOrEqual(options.minChunkSize!)
          expect(chunk.estimatedSize).toBeLessThanOrEqual(options.maxChunkSize!)
        }
      })
    })

    it('should limit number of chunks', async () => {
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue([
        'file1.ts', 'file2.ts', 'file3.ts', 'file4.ts', 'file5.ts'
      ] as any)
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)
      mockFs.readFile.mockResolvedValue('export const test = "test"')

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'frequency-based',
        maxChunks: 3
      }

      const result = await optimizer.optimize(options)

      expect(result.chunks.length).toBeLessThanOrEqual(3)
    })

    it('should analyze import dependencies', async () => {
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue(['main.ts', 'utils.ts', 'components.ts'] as any)
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)
      
      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('main.ts')) {
          return Promise.resolve(`
            import { helper } from './utils'
            import { Button } from './components'
          `)
        } else if (filePath.includes('utils.ts')) {
          return Promise.resolve('export const helper = () => {}')
        } else if (filePath.includes('components.ts')) {
          return Promise.resolve(`
            import { helper } from './utils'
            export const Button = () => {}
          `)
        }
        return Promise.resolve('')
      })

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'feature-based',
        analyzeDependencies: true
      }

      const result = await optimizer.optimize(options)

      expect(result.dependencyGraph).toBeDefined()
      expect(result.dependencyGraph?.nodes).toBeDefined()
      expect(result.dependencyGraph?.edges).toBeDefined()
    })
  })

  describe('Optimization Strategies', () => {
    beforeEach(() => {
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)
    })

    it('should implement frequency-based strategy', async () => {
      mockFs.readdir.mockResolvedValue(['common.ts', 'rare.ts'] as any)
      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('common.ts')) {
          return Promise.resolve('// Frequently used utility')
        }
        return Promise.resolve('// Rarely used feature')
      })

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'frequency-based'
      }

      const result = await optimizer.optimize(options)

      expect(result.strategy).toBe('frequency-based')
      expect(result.chunks.some(chunk => chunk.name.includes('common'))).toBe(true)
    })

    it('should implement feature-based strategy', async () => {
      mockFs.readdir.mockResolvedValue(['auth.ts', 'dashboard.ts', 'settings.ts'] as any)
      mockFs.readFile.mockResolvedValue('export const feature = "test"')

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'feature-based'
      }

      const result = await optimizer.optimize(options)

      expect(result.strategy).toBe('feature-based')
      // Should group by feature
      expect(result.chunks.length).toBeGreaterThan(0)
    })

    it('should implement hybrid strategy', async () => {
      mockFs.readdir.mockResolvedValue(['core.ts', 'feature1.ts', 'feature2.ts'] as any)
      mockFs.readFile.mockResolvedValue('export const module = "test"')

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'hybrid'
      }

      const result = await optimizer.optimize(options)

      expect(result.strategy).toBe('hybrid')
      // Should combine frequency and feature-based approaches
      expect(result.chunks.length).toBeGreaterThan(0)
    })
  })

  describe('Recommendations', () => {
    it('should provide optimization recommendations', async () => {
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue(['large-file.ts', 'small-file.ts'] as any)
      mockFs.stat.mockImplementation((filePath: string) => {
        if (filePath.includes('large-file.ts')) {
          return Promise.resolve({ isDirectory: () => false, size: 10000 } as any)
        }
        return Promise.resolve({ isDirectory: () => false, size: 100 } as any)
      })
      mockFs.readFile.mockResolvedValue('export const test = "test"')

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'frequency-based'
      }

      const result = await optimizer.optimize(options)

      expect(result.recommendations).toBeDefined()
      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('should suggest lazy loading for large chunks', async () => {
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue(['huge-component.ts'] as any)
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 50000 } as any)
      mockFs.readFile.mockResolvedValue('export const HugeComponent = () => {}')

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'frequency-based'
      }

      const result = await optimizer.optimize(options)

      const hasLazyLoadingRecommendation = result.recommendations.some(
        rec => rec.toLowerCase().includes('lazy')
      )
      expect(hasLazyLoadingRecommendation).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing directory', async () => {
      mockFs.pathExists.mockResolvedValue(false)

      const options: OptimizationOptions = {
        rootDir: '/non-existent-path',
        entries: ['src/index.ts'],
        strategy: 'frequency-based'
      }

      await expect(optimizer.optimize(options)).rejects.toThrow()
    })

    it('should handle file read errors', async () => {
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue(['test.ts'] as any)
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'))

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'frequency-based'
      }

      // Should handle gracefully and continue with available files
      const result = await optimizer.optimize(options)
      expect(result).toBeDefined()
    })
  })

  describe('Performance', () => {
    it('should complete optimization within reasonable time', async () => {
      // Mock a moderate-sized project
      const files = Array.from({ length: 50 }, (_, i) => `file${i}.ts`)
      
      mockFs.pathExists.mockResolvedValue(true)
      mockFs.readdir.mockResolvedValue(files as any)
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)
      mockFs.readFile.mockResolvedValue('export const test = "test"')

      const options: OptimizationOptions = {
        rootDir: tempDir,
        entries: ['src/index.ts'],
        strategy: 'hybrid'
      }

      const startTime = Date.now()
      const result = await optimizer.optimize(options)
      const endTime = Date.now()

      expect(result).toBeDefined()
      expect(endTime - startTime).toBeLessThan(3000) // Should complete within 3 seconds
    })
  })
})
