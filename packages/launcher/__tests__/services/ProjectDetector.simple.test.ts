import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectDetector } from '../../src/services/ProjectDetector'

// Mock fs operations
vi.mock('node:fs', () => ({
  promises: {
    readdir: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn(),
    access: vi.fn(),
  },
}))

// Mock ErrorHandler
vi.mock('../../src/services/ErrorHandler', () => ({
  ErrorHandler: vi.fn().mockImplementation(() => ({
    handleError: vi.fn().mockReturnValue({ message: 'Mock error', code: 'E001' }),
  })),
}))

describe('projectDetector 简化测试', () => {
  let detector: ProjectDetector
  let mockFs: any

  beforeEach(async () => {
    detector = new ProjectDetector()
    const fs = await import('node:fs')
    mockFs = vi.mocked(fs.promises)

    // Reset all mocks
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该创建ProjectDetector实例', () => {
      expect(detector).toBeInstanceOf(ProjectDetector)
    })

    it('应该处理目录不存在的情况', async () => {
      const projectPath = '/non-existent-path'

      // Mock directory doesn't exist
      mockFs.stat.mockRejectedValue(new Error('ENOENT'))

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('unknown')
      expect(result.confidence).toBe(0)
      expect(result.error).toBeDefined()
    })

    it('应该处理package.json读取失败的情况', async () => {
      const projectPath = '/test-project'

      // Mock directory exists but package.json doesn't
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockRejectedValue(new Error('ENOENT'))

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('unknown')
      expect(result.confidence).toBe(0)
      expect(result.error).toBeDefined()
    })
  })

  describe('vue项目检测', () => {
    it('应该检测Vue3项目', async () => {
      const projectPath = '/test/vue3-project'

      // Mock successful file operations
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          vue: '^3.0.0',
        },
      }))
      mockFs.access.mockResolvedValue(undefined) // Files exist

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('vue3')
      expect(result.framework).toBe('vue3')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('应该检测Vue2项目', async () => {
      const projectPath = '/test/vue2-project'

      // Mock successful file operations
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          vue: '^2.7.0',
        },
      }))
      mockFs.access.mockResolvedValue(undefined) // Files exist

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('vue2')
      expect(result.framework).toBe('vue2')
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })

  describe('react项目检测', () => {
    it('应该检测React项目', async () => {
      const projectPath = '/test/react-project'

      // Mock successful file operations
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
        },
      }))
      // Mock specific files exist/don't exist
      mockFs.access.mockImplementation((filePath: string) => {
        if (filePath.includes('next.config')) {
          return Promise.reject(new Error('ENOENT'))
        }
        return Promise.resolve()
      })

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('react')
      expect(result.framework).toBe('react')
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })

  describe('vanilla项目检测', () => {
    it('应该检测Vanilla项目', async () => {
      const projectPath = '/test/vanilla-project'

      // Mock successful file operations
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {},
        devDependencies: {
          vite: '^5.0.0',
        },
      }))
      // Mock no TypeScript files exist
      mockFs.access.mockImplementation((filePath: string) => {
        if (filePath.includes('tsconfig.json') || filePath.includes('typescript')) {
          return Promise.reject(new Error('ENOENT'))
        }
        return Promise.resolve()
      })

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('vanilla')
      expect(result.framework).toBe('vanilla')
      expect(result.confidence).toBeGreaterThan(0.6)
    })
  })

  describe('typeScript项目检测', () => {
    it('应该检测TypeScript项目', async () => {
      const projectPath = '/test/ts-project'

      // Mock successful file operations
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          typescript: '^5.0.0',
        },
      }))
      mockFs.access.mockResolvedValue(undefined) // Files exist

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('vanilla-ts')
      expect(result.framework).toBe('vanilla')
      expect(result.confidence).toBeGreaterThan(0.3)
    })
  })
})
