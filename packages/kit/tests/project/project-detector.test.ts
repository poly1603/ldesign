/**
 * 项目类型检测器测试
 *
 * 测试项目类型检测、框架识别、配置文件扫描等功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */


import { vi } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BuildTool,
  createProjectDetector,
  detectProjectType,
  PackageManager,
  ProjectDetector,
  ProjectType,
} from '../../src/project/project-detector'

// 模拟文件系统
vi.mock('node:fs')
vi.mock('glob')

const mockExistsSync = vi.mocked(existsSync)
const mockReadFileSync = vi.mocked(readFileSync)

describe('projectDetector', () => {
  let detector: ProjectDetector

  beforeEach(() => {
    detector = new ProjectDetector({ projectRoot: '/test/project' })
    // 重置所有模�?    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('构造函�?, () => {
    it('应该使用默认选项创建检测器', () => {
      const defaultDetector = new ProjectDetector()
      expect(defaultDetector).toBeInstanceOf(ProjectDetector)
    })

    it('应该使用自定义选项创建检测器', () => {
      const customDetector = new ProjectDetector({
        projectRoot: '/custom/path',
        deepAnalyzeDependencies: false,
      })
      expect(customDetector).toBeInstanceOf(ProjectDetector)
    })
  })

  describe('vue.js 项目检�?, () => {
    it('应该检测到 Vue 3.x 项目', async () => {
      // 模拟 package.json
      const mockPackageJson = {
        dependencies: {
          vue: '^3.3.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^4.0.0',
        },
      }

      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('package.json'))
          return true
        if (path.includes('pnpm-lock.yaml'))
          return true
        return false
      })

      mockReadFileSync.mockImplementation((path: string) => {
        if (path.includes('package.json')) {
          return JSON.stringify(mockPackageJson)
        }
        return ''
      })

      const result = await detector.detectProject()

      expect(result.projectType).toBe(ProjectType.VUE3)
      expect(result.framework).toBe('Vue.js')
      expect(result.frameworkVersion).toBe('^3.3.0')
      expect(result.packageManager).toBe(PackageManager.PNPM)
      expect(result.hasTypeScript).toBe(false)
    })

    it('应该检测到 Vue 2.x 项目', async () => {
      const mockPackageJson = {
        dependencies: {
          vue: '^2.6.14',
        },
        devDependencies: {
          'vue-template-compiler': '^2.6.14',
        },
      }

      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('package.json'))
          return true
        if (path.includes('yarn.lock'))
          return true
        return false
      })

      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.projectType).toBe(ProjectType.VUE2)
      expect(result.framework).toBe('Vue.js')
      expect(result.frameworkVersion).toBe('^2.6.14')
      expect(result.packageManager).toBe(PackageManager.YARN)
    })

    it('应该检测到 Nuxt.js 项目', async () => {
      const mockPackageJson = {
        dependencies: {
          nuxt: '^3.8.0',
          vue: '^3.3.0',
        },
      }

      mockExistsSync.mockImplementation((path: string) => {
        return path.includes('package.json')
      })

      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.projectType).toBe(ProjectType.NUXTJS)
      expect(result.framework).toBe('Nuxt.js')
      expect(result.frameworkVersion).toBe('^3.8.0')
    })
  })

  describe('react 项目检�?, () => {
    it('应该检测到 React 项目', async () => {
      const mockPackageJson = {
        dependencies: {
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
        },
        devDependencies: {
          '@types/react': '^18.0.0',
        },
      }

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.projectType).toBe(ProjectType.REACT)
      expect(result.framework).toBe('React')
      expect(result.frameworkVersion).toBe('^18.0.0')
    })

    it('应该检测到 Next.js 项目', async () => {
      const mockPackageJson = {
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
        },
      }

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.projectType).toBe(ProjectType.NEXTJS)
      expect(result.framework).toBe('Next.js')
      expect(result.frameworkVersion).toBe('^14.0.0')
    })
  })

  describe('angular 项目检�?, () => {
    it('应该检测到 Angular 项目', async () => {
      const mockPackageJson = {
        dependencies: {
          '@angular/core': '^17.0.0',
          '@angular/common': '^17.0.0',
        },
        devDependencies: {
          '@angular/cli': '^17.0.0',
        },
      }

      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('package.json'))
          return true
        if (path.includes('angular.json'))
          return true
        return false
      })

      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.projectType).toBe(ProjectType.ANGULAR)
      expect(result.framework).toBe('Angular')
      expect(result.frameworkVersion).toBe('^17.0.0')
    })
  })

  describe('typeScript 检�?, () => {
    it('应该检测到 TypeScript 支持（通过 tsconfig.json�?, async () => {
      const mockPackageJson = {
        dependencies: {
          react: '^18.0.0',
        },
      }

      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('package.json'))
          return true
        if (path.includes('tsconfig.json'))
          return true
        return false
      })

      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.hasTypeScript).toBe(true)
    })

    it('应该检测到 TypeScript 支持（通过依赖�?, async () => {
      const mockPackageJson = {
        dependencies: {
          react: '^18.0.0',
        },
        devDependencies: {
          'typescript': '^5.0.0',
          '@types/node': '^20.0.0',
        },
      }

      mockExistsSync.mockImplementation((path: string) => {
        return path.includes('package.json')
      })

      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.hasTypeScript).toBe(true)
    })
  })

  describe('包管理器检�?, () => {
    it('应该检测到 pnpm', async () => {
      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('package.json'))
          return true
        if (path.includes('pnpm-lock.yaml'))
          return true
        return false
      })

      mockReadFileSync.mockReturnValue('{}')

      const result = await detector.detectProject()

      expect(result.packageManager).toBe(PackageManager.PNPM)
    })

    it('应该检测到 yarn', async () => {
      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('package.json'))
          return true
        if (path.includes('yarn.lock'))
          return true
        return false
      })

      mockReadFileSync.mockReturnValue('{}')

      const result = await detector.detectProject()

      expect(result.packageManager).toBe(PackageManager.YARN)
    })

    it('应该默认�?npm', async () => {
      mockExistsSync.mockImplementation((path: string) => {
        return path.includes('package.json')
      })

      mockReadFileSync.mockReturnValue('{}')

      const result = await detector.detectProject()

      expect(result.packageManager).toBe(PackageManager.NPM)
    })
  })

  describe('构建工具检�?, () => {
    it('应该检测到 Vite', async () => {
      const mockPackageJson = {
        devDependencies: {
          'vite': '^5.0.0',
          '@vitejs/plugin-vue': '^4.0.0',
        },
      }

      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('package.json'))
          return true
        if (path.includes('vite.config.ts'))
          return true
        return false
      })

      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.buildTools).toContain(BuildTool.VITE)
    })

    it('应该检测到 Webpack', async () => {
      const mockPackageJson = {
        devDependencies: {
          'webpack': '^5.0.0',
          'webpack-cli': '^5.0.0',
        },
      }

      mockExistsSync.mockImplementation((path: string) => {
        if (path.includes('package.json'))
          return true
        if (path.includes('webpack.config.js'))
          return true
        return false
      })

      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await detector.detectProject()

      expect(result.buildTools).toContain(BuildTool.WEBPACK)
    })
  })

  describe('项目统计', () => {
    it('应该生成项目统计信息', async () => {
      // 模拟 glob 模块
      const { glob } = await import('glob')
      const mockGlob = vi.mocked(glob)

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('{}')

      // 模拟文件列表
      mockGlob.sync = vi.fn().mockImplementation((pattern: string) => {
        if (pattern === '**/*') {
          return ['src/index.ts', 'src/utils.ts', 'package.json', 'README.md']
        }
        if (pattern.includes('.ts')) {
          return ['src/index.ts', 'src/utils.ts']
        }
        return []
      })

      const statistics = await detector.getProjectStatistics()

      expect(statistics.totalFiles).toBeGreaterThan(0)
      expect(statistics.codeFiles).toBeGreaterThan(0)
    })
  })

  describe('自定义检测规�?, () => {
    it('应该支持自定义检测规�?, async () => {
      const customDetector = new ProjectDetector({
        customDetectionRules: [
          {
            name: 'Custom Electron + Vue',
            projectType: ProjectType.ELECTRON,
            weight: 100,
            conditions: [
              { type: 'dependency', target: 'electron', mode: 'exists' },
              { type: 'dependency', target: 'vue', mode: 'exists' },
            ],
          },
        ],
      })

      const mockPackageJson = {
        dependencies: {
          vue: '^3.0.0',
          electron: '^28.0.0',
        },
      }

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson))

      const result = await customDetector.detectProject()

      expect(result.projectType).toBe(ProjectType.ELECTRON)
    })
  })

  describe('错误处理', () => {
    it('应该处理缺失�?package.json', async () => {
      mockExistsSync.mockReturnValue(false)

      const result = await detector.detectProject()

      expect(result.projectType).toBe(ProjectType.STATIC)
      expect(result.confidence).toBe(50)
    })

    it('应该处理损坏�?package.json', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('invalid json')

      const result = await detector.detectProject()

      expect(result.projectType).toBe(ProjectType.STATIC)
    })
  })
})

describe('工厂函数', () => {
  it('createProjectDetector 应该创建检测器实例', () => {
    const detector = createProjectDetector()
    expect(detector).toBeInstanceOf(ProjectDetector)
  })

  it('detectProjectType 应该执行快速检�?, async () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        dependencies: { vue: '^3.0.0' },
      }),
    )

    const result = await detectProjectType()

    expect(result.projectType).toBe(ProjectType.VUE3)
  })
})



