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

describe('projectDetector', () => {
  let detector: ProjectDetector
  let mockFs: any

  beforeEach(async () => {
    detector = new ProjectDetector()
    const fs = await import('node:fs')
    mockFs = vi.mocked(fs.promises)
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

      // Mock access to ensure no Next.js files exist
      mockFs.access.mockImplementation((filePath: string) => {
        if (filePath.includes('next.config')) {
          return Promise.reject(new Error('ENOENT'))
        }
        return Promise.resolve()
      })

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

      // Mock access to ensure no TypeScript files exist
      mockFs.access.mockImplementation((filePath: string) => {
        if (filePath.includes('tsconfig.json') || filePath.includes('typescript')) {
          return Promise.reject(new Error('ENOENT'))
        }
        return Promise.resolve()
      })

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

      // Mock access to ensure tsconfig.json exists
      mockFs.access.mockImplementation((filePath: string) => {
        if (filePath.includes('tsconfig.json')) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('ENOENT'))
      })

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
      const projectPath = '/test/vue-project'

      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          'vue': '^3.0.0',
          '@vitejs/plugin-vue': '^4.0.0',
        },
      }))
      mockFs.access.mockResolvedValue(undefined)

      const framework = await detector.detectFramework(projectPath)

      expect(framework).toBe('vue3')
    })

    it('应该检测React框架', async () => {
      const projectPath = '/test/react-project'

      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          '@vitejs/plugin-react': '^4.0.0',
        },
      }))
      mockFs.access.mockImplementation((filePath: string) => {
        if (filePath.includes('next.config')) {
          return Promise.reject(new Error('ENOENT'))
        }
        return Promise.resolve()
      })

      const framework = await detector.detectFramework(projectPath)

      expect(framework).toBe('react')
    })

    it('应该检测Vanilla框架', async () => {
      const projectPath = '/test/vanilla-project'

      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any)
      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {},
        devDependencies: {
          vite: '^5.0.0',
        },
      }))
      mockFs.access.mockImplementation((filePath: string) => {
        if (filePath.includes('tsconfig.json') || filePath.includes('typescript')) {
          return Promise.reject(new Error('ENOENT'))
        }
        return Promise.resolve()
      })

      const framework = await detector.detectFramework(projectPath)

      expect(framework).toBe('vanilla')
    })
  })

  describe('detectTypeScript', () => {
    it('应该检测TypeScript项目', async () => {
      const projectPath = '/test/ts-project'

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {
          typescript: '^5.0.0',
        },
      }))
      mockFs.access.mockResolvedValue(undefined) // tsconfig.json exists

      const hasTypeScript = await detector.detectTypeScript(projectPath)

      expect(hasTypeScript).toBe(true)
    })

    it('应该检测非TypeScript项目', async () => {
      const projectPath = '/test/js-project'

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {},
      }))
      mockFs.access.mockRejectedValue(new Error('ENOENT')) // tsconfig.json doesn't exist

      const hasTypeScript = await detector.detectTypeScript(projectPath)

      expect(hasTypeScript).toBe(false)
    })
  })

  describe('detectCSSPreprocessor', () => {
    it('应该检测Sass预处理器', async () => {
      const projectPath = '/test/sass-project'

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        devDependencies: {
          sass: '^1.60.0',
        },
      }))

      const preprocessor = await detector.detectCSSPreprocessor(projectPath)

      expect(preprocessor).toBe('sass')
    })

    it('应该检测Less预处理器', async () => {
      const projectPath = '/test/less-project'

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        devDependencies: {
          less: '^4.1.0',
        },
      }))

      const preprocessor = await detector.detectCSSPreprocessor(projectPath)

      expect(preprocessor).toBe('less')
    })

    it('应该检测Stylus预处理器', async () => {
      const projectPath = '/test/stylus-project'

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        devDependencies: {
          stylus: '^0.59.0',
        },
      }))

      const preprocessor = await detector.detectCSSPreprocessor(projectPath)

      expect(preprocessor).toBe('stylus')
    })

    it('应该返回undefined当没有预处理器时', async () => {
      const projectPath = '/test/no-preprocessor-project'

      mockFs.readFile.mockResolvedValue(JSON.stringify({
        dependencies: {},
        devDependencies: {},
      }))

      const preprocessor = await detector.detectCSSPreprocessor(projectPath)

      expect(preprocessor).toBeUndefined()
    })
  })
})
