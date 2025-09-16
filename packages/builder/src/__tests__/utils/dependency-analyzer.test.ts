/**
 * 依赖分析器测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DependencyAnalyzer } from '../../utils/dependency-analyzer'
import type { AnalysisOptions, DependencyAnalysisResult } from '../../utils/dependency-analyzer'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { tmpdir } from 'node:os'

// Mock node:fs/promises
vi.mock('node:fs/promises')
const mockFs = vi.mocked(fs)

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer
  let tempDir: string

  beforeEach(() => {
    analyzer = new DependencyAnalyzer()
    tempDir = path.join(tmpdir(), `ldesign-builder-test-${Date.now()}`)
    
    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create instance successfully', () => {
      expect(analyzer).toBeInstanceOf(DependencyAnalyzer)
    })
  })

  describe('analyze', () => {
    it('should analyze dependencies successfully', async () => {
      // Mock package.json
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          'react': '^18.0.0',
          'lodash': '^4.17.21'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          'vitest': '^1.0.0'
        }
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPackageJson))
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)

      const options: AnalysisOptions = {
        rootDir: tempDir,
        includeDevDependencies: true,
        checkSecurity: false,
        analyzeBundleSize: false
      }

      const result = await analyzer.analyze(options)

      expect(result).toBeDefined()
      expect(result.dependencies).toHaveLength(4) // 2 deps + 2 devDeps
      expect(result.summary.total).toBe(4)
      expect(result.summary.production).toBe(2)
      expect(result.summary.development).toBe(2)
    })

    it('should handle missing package.json', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'))

      const options: AnalysisOptions = {
        rootDir: tempDir
      }

      await expect(analyzer.analyze(options)).rejects.toThrow('未找到 package.json 文件')
    })

    it('should analyze with security check enabled', async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          'vulnerable-package': '^1.0.0'
        }
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPackageJson))
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)

      const options: AnalysisOptions = {
        rootDir: tempDir,
        checkSecurity: true
      }

      const result = await analyzer.analyze(options)

      expect(result.securityIssues).toBeDefined()
      expect(Array.isArray(result.securityIssues)).toBe(true)
    })

    it('should analyze bundle size when enabled', async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          'react': '^18.0.0'
        }
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPackageJson))
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)

      const options: AnalysisOptions = {
        rootDir: tempDir,
        analyzeBundleSize: true
      }

      const result = await analyzer.analyze(options)

      expect(result.bundleSizeAnalysis).toBeDefined()
      expect(result.bundleSizeAnalysis?.totalSize).toBeGreaterThanOrEqual(0)
    })

    it('should detect circular dependencies', async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          'package-a': '^1.0.0'
        }
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPackageJson))
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)

      const options: AnalysisOptions = {
        rootDir: tempDir,
        detectCircular: true
      }

      const result = await analyzer.analyze(options)

      expect(result.circularDependencies).toBeDefined()
      expect(Array.isArray(result.circularDependencies)).toBe(true)
    })

    it('should identify unused dependencies', async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          'used-package': '^1.0.0',
          'unused-package': '^1.0.0'
        }
      }

      mockFs.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('package.json')) {
          return Promise.resolve(JSON.stringify(mockPackageJson))
        }
        if (filePath.includes('index.ts')) {
          return Promise.resolve("import { something } from 'used-package'")
        }
        return Promise.resolve("// No imports")
      })
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)

      // Mock file system for source code analysis
      mockFs.readdir.mockResolvedValue(['index.ts', 'utils.ts'] as any)

      const options: AnalysisOptions = {
        rootDir: tempDir,
        findUnused: true
      }

      const result = await analyzer.analyze(options)

      expect(result.unusedDependencies).toBeDefined()
      expect(Array.isArray(result.unusedDependencies)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockFs.readFile.mockRejectedValue(new Error('Permission denied'))

      const options: AnalysisOptions = {
        rootDir: '/invalid/path'
      }

      await expect(analyzer.analyze(options)).rejects.toThrow()
    })

    it('should handle invalid package.json format', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        // Missing required fields
        invalidField: 'value'
      }))

      const options: AnalysisOptions = {
        rootDir: tempDir
      }

      const result = await analyzer.analyze(options)

      // Should handle gracefully and return empty results
      expect(result.dependencies).toHaveLength(0)
      expect(result.summary.total).toBe(0)
    })
  })

  describe('Performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          'react': '^18.0.0',
          'lodash': '^4.17.21',
          'axios': '^1.0.0'
        }
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockPackageJson))
      mockFs.stat.mockResolvedValue({ isDirectory: () => false, size: 1024 } as any)

      const options: AnalysisOptions = {
        rootDir: tempDir,
        includeDevDependencies: true,
        checkSecurity: true,
        analyzeBundleSize: true,
        detectCircular: true,
        findUnused: true
      }

      const startTime = Date.now()
      const result = await analyzer.analyze(options)
      const endTime = Date.now()

      expect(result).toBeDefined()
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})
