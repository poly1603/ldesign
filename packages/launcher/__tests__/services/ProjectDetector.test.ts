import fs from 'node:fs/promises'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectDetector } from '../../src/services/ProjectDetector'

// Mock fs operations
vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn(),
  },
  readdir: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn(),
}))

// Mock ErrorHandler
vi.mock('../../src/services/ErrorHandler', () => ({
  ErrorHandler: vi.fn().mockImplementation(() => ({
    handleError: vi.fn().mockReturnValue({ message: 'Mock error', code: 'E001' }),
  })),
}))

describe('projectDetector', () => {
  let detector: ProjectDetector
  let mockFs: any

  beforeEach(() => {
    detector = new ProjectDetector()
    mockFs = vi.mocked(fs)
  })

  describe('detectProjectType', () => {
    it('应该检测Vue3项目', async () => {
      const projectPath = '/test/vue3-project'

      // Mock directory exists
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readdir.mockResolvedValue([
        'package.json',
        'vite.config.ts',
        'src',
        'index.html',
      ])

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          'vue': '^3.0.0',
          '@vitejs/plugin-vue': '^4.0.0',
        },
      }))

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('vue3')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('应该检测React项目', async () => {
      const projectPath = '/test/react-project'

      // Mock directory exists
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readdir.mockResolvedValue([
        'package.json',
        'vite.config.ts',
        'src',
        'index.html',
      ])

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          '@vitejs/plugin-react': '^4.0.0',
        },
      }))

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('react')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('应该检测Vue2项目', async () => {
      const projectPath = '/test/vue2-project'

      // Mock directory exists
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readdir.mockResolvedValue([
        'package.json',
        'vite.config.ts',
        'src',
        'index.html',
      ])

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          'vue': '^2.7.0',
          '@vitejs/plugin-vue2': '^2.0.0',
        },
      }))

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('vue2')
      expect(result.confidence).toBeGreaterThan(0.8)
    })

    it('应该检测Vanilla项目', async () => {
      const projectPath = '/test/vanilla-project'

      // Mock directory exists
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readdir.mockResolvedValue([
        'package.json',
        'vite.config.ts',
        'index.html',
        'main.js',
      ])

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {},
        devDependencies: {
          vite: '^5.0.0',
        },
      }))

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('vanilla')
      expect(result.confidence).toBeGreaterThan(0.6)
    })

    it('应该检测TypeScript项目', async () => {
      const projectPath = '/test/ts-project'

      // Mock directory exists
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readdir.mockResolvedValue([
        'package.json',
        'vite.config.ts',
        'tsconfig.json',
        'src',
        'index.html',
      ])

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          typescript: '^5.0.0',
        },
      }))

      const result = await detector.detectProjectType(projectPath)

      expect(result.report.detectedFiles).toContain('tsconfig.json')
    })

    it('应该返回未知项目类型当无法检测时', async () => {
      const projectPath = '/test/unknown-project'

      mockFs.readdir.mockResolvedValue([])
      mockFs.readFile.mockRejectedValue(new Error('File not found'))

      const result = await detector.detectProjectType(projectPath)

      expect(result.projectType).toBe('unknown')
      expect(result.confidence).toBe(0)
    })
  })

  describe('detectFramework', () => {
    it('应该检测Vue框架', async () => {
      const dependencies = {
        'vue': '^3.0.0',
        '@vitejs/plugin-vue': '^4.0.0',
      }

      const framework = await detector.detectFramework(dependencies)

      expect(framework).toBe('vue3')
    })

    it('应该检测React框架', async () => {
      const dependencies = {
        'react': '^18.0.0',
        'react-dom': '^18.0.0',
        '@vitejs/plugin-react': '^4.0.0',
      }

      const framework = await detector.detectFramework(dependencies)

      expect(framework).toBe('react')
    })

    it('应该检测Vanilla框架', async () => {
      const dependencies = {}

      const framework = await detector.detectFramework(dependencies)

      expect(framework).toBe('vanilla')
    })
  })

  describe('detectTypeScript', () => {
    it('应该检测TypeScript项目', async () => {
      const projectPath = '/test/ts-project'

      mockFs.readdir.mockResolvedValue([
        'tsconfig.json',
        'main.ts',
        'src/index.ts',
      ])

      const hasTypeScript = await detector.detectTypeScript(projectPath)

      expect(hasTypeScript).toBe(true)
    })

    it('应该检测非TypeScript项目', async () => {
      const projectPath = '/test/js-project'

      mockFs.readdir.mockResolvedValue([
        'main.js',
        'src/index.js',
      ])

      const hasTypeScript = await detector.detectTypeScript(projectPath)

      expect(hasTypeScript).toBe(false)
    })
  })

  describe('detectCSSPreprocessor', () => {
    it('应该检测Sass预处理器', async () => {
      const dependencies = {
        sass: '^1.60.0',
      }

      const preprocessor = await detector.detectCSSPreprocessor(dependencies)

      expect(preprocessor).toBe('sass')
    })

    it('应该检测Less预处理器', async () => {
      const dependencies = {
        less: '^4.1.0',
      }

      const preprocessor = await detector.detectCSSPreprocessor(dependencies)

      expect(preprocessor).toBe('less')
    })

    it('应该检测Stylus预处理器', async () => {
      const dependencies = {
        stylus: '^0.59.0',
      }

      const preprocessor = await detector.detectCSSPreprocessor(dependencies)

      expect(preprocessor).toBe('stylus')
    })

    it('应该返回undefined当没有预处理器时', async () => {
      const dependencies = {}

      const preprocessor = await detector.detectCSSPreprocessor(dependencies)

      expect(preprocessor).toBeUndefined()
    })
  })
})
