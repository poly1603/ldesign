/**
 * @fileoverview ProjectDetector 单元测试 - 重构版本
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ProjectDetector } from '../../src/services/ProjectDetector.new'
import type { ProjectType, FrameworkType } from '../../src/types'

// Mock 文件系统
vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn(),
    access: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
  },
}))

// Mock fast-glob
vi.mock('fast-glob', () => ({
  default: vi.fn(),
}))

describe('ProjectDetector', () => {
  let projectDetector: ProjectDetector

  beforeEach(() => {
    projectDetector = new ProjectDetector()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    it('应该正确初始化', () => {
      expect(projectDetector).toBeInstanceOf(ProjectDetector)
    })
  })

  describe('detect', () => {
    it('应该检测Vue3项目', async () => {
      const mockPackageJson = {
        dependencies: { vue: '^3.3.0' },
        devDependencies: { '@vitejs/plugin-vue': '^5.0.0' },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await projectDetector.detect('/test/vue3-project')

      expect(result.projectType).toBe('vue3')
      expect(result.framework).toBe('vue3')
      expect(result.confidence).toBeGreaterThan(0.7)
      expect(result.report.dependencies).toEqual(mockPackageJson.dependencies)
    })

    it('应该检测Vue2项目', async () => {
      const mockPackageJson = {
        dependencies: { vue: '^2.7.0' },
        devDependencies: { '@vitejs/plugin-vue2': '^2.3.0' },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await projectDetector.detect('/test/vue2-project')

      expect(result.projectType).toBe('vue2')
      expect(result.framework).toBe('vue2')
      expect(result.confidence).toBeGreaterThan(0.7)
    })

    it('应该检测React项目', async () => {
      const mockPackageJson = {
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.0.0',
        },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await projectDetector.detect('/test/react-project')

      expect(result.projectType).toBe('react')
      expect(result.framework).toBe('react')
      expect(result.confidence).toBeGreaterThan(0.7)
    })

    it('应该检测Vanilla TypeScript项目', async () => {
      const mockPackageJson = {
        devDependencies: {
          typescript: '^5.0.0',
          vite: '^5.0.0',
        },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // package.json
        .mockResolvedValueOnce(undefined) // tsconfig.json
        .mockRejectedValue(new Error('Not found')) // 其他文件

      const result = await projectDetector.detect('/test/vanilla-ts-project')

      expect(result.projectType).toBe('vanilla-ts')
      expect(result.framework).toBe('vanilla-ts')
    })

    it('应该检测Vanilla JavaScript项目', async () => {
      const mockPackageJson = {
        devDependencies: {
          vite: '^5.0.0',
        },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access)
        .mockResolvedValueOnce(undefined) // package.json
        .mockRejectedValue(new Error('Not found')) // 其他文件

      const result = await projectDetector.detect('/test/vanilla-project')

      expect(result.projectType).toBe('vanilla')
      expect(result.framework).toBe('vanilla')
    })

    it('应该处理未知项目类型', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'))
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'))

      const result = await projectDetector.detect('/test/unknown-project')

      expect(result.projectType).toBe('unknown')
      expect(result.confidence).toBe(0)
    })

    it('应该处理错误情况', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Permission denied'))

      const result = await projectDetector.detect('/test/error-project')

      expect(result.error).toBeDefined()
      expect(result.projectType).toBe('unknown')
    })
  })

  describe('detectFramework', () => {
    it('应该检测框架类型', async () => {
      const mockPackageJson = {
        dependencies: { vue: '^3.3.0' },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const framework = await projectDetector.detectFramework('/test/project')

      expect(framework).toBe('vue3')
    })
  })

  describe('detectTypeScript', () => {
    it('应该检测TypeScript支持', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const hasTypeScript = await projectDetector.detectTypeScript('/test/project')

      expect(hasTypeScript).toBe(true)
      expect(fs.access).toHaveBeenCalledWith('/test/project/tsconfig.json')
    })

    it('应该在没有TypeScript时返回false', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'))

      const hasTypeScript = await projectDetector.detectTypeScript('/test/project')

      expect(hasTypeScript).toBe(false)
    })
  })

  describe('detectCSSPreprocessor', () => {
    it('应该检测Sass预处理器', async () => {
      const mockPackageJson = {
        devDependencies: { sass: '^1.0.0' },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const preprocessor = await projectDetector.detectCSSPreprocessor('/test/project')

      expect(preprocessor).toBe('sass')
    })

    it('应该检测Less预处理器', async () => {
      const mockPackageJson = {
        devDependencies: { less: '^4.0.0' },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const preprocessor = await projectDetector.detectCSSPreprocessor('/test/project')

      expect(preprocessor).toBe('less')
    })

    it('应该检测Stylus预处理器', async () => {
      const mockPackageJson = {
        devDependencies: { stylus: '^0.60.0' },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const preprocessor = await projectDetector.detectCSSPreprocessor('/test/project')

      expect(preprocessor).toBe('stylus')
    })

    it('应该在没有预处理器时返回undefined', async () => {
      const mockPackageJson = {
        devDependencies: { vite: '^5.0.0' },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const preprocessor = await projectDetector.detectCSSPreprocessor('/test/project')

      expect(preprocessor).toBeUndefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理空项目路径', async () => {
      const result = await projectDetector.detect('')
      expect(result.projectType).toBe('unknown')
    })

    it('应该处理无效的package.json', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('invalid json')
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await projectDetector.detect('/test/project')
      expect(result.projectType).toBe('unknown')
    })

    it('应该处理缺少dependencies的package.json', async () => {
      const mockPackageJson = {
        name: 'test-project',
        version: '1.0.0',
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await projectDetector.detect('/test/project')
      expect(result.projectType).toBe('vanilla')
    })

    it('应该处理多个框架的混合项目', async () => {
      const mockPackageJson = {
        dependencies: {
          vue: '^3.3.0',
          react: '^18.2.0',
        },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const result = await projectDetector.detect('/test/project')
      
      // 应该选择置信度最高的框架
      expect(['vue3', 'react']).toContain(result.projectType)
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内完成检测', async () => {
      const mockPackageJson = {
        dependencies: { vue: '^3.3.0' },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
      vi.mocked(fs.access).mockResolvedValue(undefined)

      const startTime = Date.now()
      const result = await projectDetector.detect('/test/project')
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成
      expect(result.report.duration).toBeGreaterThan(0)
    })
  })
})