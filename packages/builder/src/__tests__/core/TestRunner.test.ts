/**
 * TestRunner 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs-extra'
import * as path from 'path'
import { spawn } from 'child_process'
import { TestRunner } from '../../core/TestRunner'
import type { ValidationContext } from '../../types/validation'
import { Logger } from '../../utils/logger'

// Mock 依赖
vi.mock('fs-extra', () => ({
  pathExists: vi.fn(),
  readJson: vi.fn(),
  writeJson: vi.fn(),
  ensureDir: vi.fn(),
  copy: vi.fn(),
  remove: vi.fn()
}))
vi.mock('child_process', () => ({
  spawn: vi.fn()
}))

describe('TestRunner', () => {
  let testRunner: TestRunner
  let mockLogger: Logger

  const mockValidationContext: ValidationContext = {
    buildContext: {
      buildId: 'test-build-123',
      startTime: Date.now(),
      config: {
        input: 'src/index.ts',
        output: { dir: 'dist' }
      },
      projectRoot: '/test/project',
      outputDir: 'dist',
      mode: 'production',
      libraryType: 'typescript',
      bundler: 'rollup'
    },
    buildResult: {
      success: true,
      outputs: [],
      duration: 5000,
      stats: { totalSize: 2224, files: 2 },
      performance: { buildTime: 5000, bundleTime: 4000 },
      warnings: [],
      errors: [],
      buildId: 'test-build-123',
      timestamp: Date.now(),
      bundler: 'rollup',
      mode: 'production'
    },
    config: {
      enabled: true,
      testFramework: 'vitest',
      testPattern: ['**/*.test.ts'],
      timeout: 30000
    },
    tempDir: '/tmp/validation-test',
    startTime: Date.now(),
    validationId: 'validation-test-123',
    projectRoot: '/test/project',
    outputDir: 'dist'
  }

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      success: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    } as any

    testRunner = new TestRunner({ logger: mockLogger })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('detectFramework', () => {
    it('应该从 package.json 检测 vitest', async () => {
      const mockPackageJson = {
        devDependencies: {
          vitest: '^0.34.0'
        }
      }

      vi.mocked(fs.pathExists).mockResolvedValue(true)
      vi.mocked(fs.readJson).mockResolvedValue(mockPackageJson)

      const framework = await testRunner.detectFramework('/test/project')

      expect(framework).toBe('vitest')
      expect(fs.pathExists).toHaveBeenCalledWith(path.join('/test/project', 'package.json'))
      expect(fs.readJson).toHaveBeenCalledWith(path.join('/test/project', 'package.json'))
    })

    it('应该从 package.json 检测 jest', async () => {
      const mockPackageJson = {
        devDependencies: {
          jest: '^29.0.0'
        }
      }

      vi.mocked(fs.pathExists).mockResolvedValue(true)
      vi.mocked(fs.readJson).mockResolvedValue(mockPackageJson)

      const framework = await testRunner.detectFramework('/test/project')

      expect(framework).toBe('jest')
    })

    it('应该从配置文件检测框架', async () => {
      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(false) // package.json 不存在
        .mockResolvedValueOnce(true)  // vitest.config.ts 存在

      const framework = await testRunner.detectFramework('/test/project')

      expect(framework).toBe('vitest')
      expect(fs.pathExists).toHaveBeenCalledWith(path.join('/test/project', 'vitest.config.ts'))
    })

    it('应该返回默认框架 vitest', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false)
      vi.mocked(fs.readJson).mockResolvedValue({})

      const framework = await testRunner.detectFramework('/test/project')

      expect(framework).toBe('vitest')
      expect(mockLogger.warn).toHaveBeenCalledWith('未检测到测试框架，使用默认的 vitest')
    })
  })

  describe('runTests', () => {
    it('应该成功运行 vitest 测试', async () => {
      const mockSpawn = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === 'data') {
              callback(JSON.stringify({
                success: true,
                numTotalTests: 10,
                numPassedTests: 10,
                numFailedTests: 0,
                numPendingTests: 0
              }))
            }
          })
        },
        stderr: {
          on: vi.fn()
        },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0) // 成功退出码
          }
        })
      }

      vi.mocked(spawn).mockReturnValue(mockSpawn as any)
      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true)  // package.json 存在
        .mockResolvedValueOnce(true)  // pnpm-lock.yaml 存在

      vi.mocked(fs.readJson).mockResolvedValue({
        devDependencies: { vitest: '^0.34.0' }
      })

      const result = await testRunner.runTests(mockValidationContext)

      expect(result.success).toBe(true)
      expect(result.totalTests).toBe(10)
      expect(result.passedTests).toBe(10)
      expect(result.failedTests).toBe(0)
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(mockLogger.success).toHaveBeenCalledWith(
        expect.stringContaining('测试运行完成: 10/10 通过')
      )
    })

    it('应该处理测试失败', async () => {
      const mockSpawn = {
        stdout: {
          on: vi.fn((event, callback) => {
            if (event === 'data') {
              callback(JSON.stringify({
                success: false,
                numTotalTests: 10,
                numPassedTests: 8,
                numFailedTests: 2,
                numPendingTests: 0,
                testResults: [{
                  assertionResults: [{
                    status: 'failed',
                    failureMessages: ['Expected true but got false']
                  }],
                  name: 'test/example.test.ts'
                }]
              }))
            }
          })
        },
        stderr: {
          on: vi.fn()
        },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        })
      }

      vi.mocked(spawn).mockReturnValue(mockSpawn as any)
      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      vi.mocked(fs.readJson).mockResolvedValue({
        devDependencies: { vitest: '^0.34.0' }
      })

      const result = await testRunner.runTests(mockValidationContext)

      expect(result.success).toBe(false)
      expect(result.totalTests).toBe(10)
      expect(result.passedTests).toBe(8)
      expect(result.failedTests).toBe(2)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toBe('Expected true but got false')
    })

    it('应该处理测试超时', async () => {
      const mockSpawn = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn(),
        kill: vi.fn()
      }

      vi.mocked(spawn).mockReturnValue(mockSpawn as any)
      vi.mocked(fs.pathExists).mockResolvedValue(true)
      vi.mocked(fs.readJson).mockResolvedValue({
        devDependencies: { vitest: '^0.34.0' }
      })

      // 模拟超时
      const contextWithShortTimeout = {
        ...mockValidationContext,
        config: {
          ...mockValidationContext.config,
          timeout: 100 // 100ms 超时
        }
      }

      const result = await testRunner.runTests(contextWithShortTimeout)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('测试超时')
    })

    it('应该处理命令执行错误', async () => {
      const mockSpawn = {
        stdout: { on: vi.fn() },
        stderr: {
          on: vi.fn((event, callback) => {
            if (event === 'data') {
              callback('Command not found: vitest')
            }
          })
        },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(1) // 错误退出码
          }
        })
      }

      vi.mocked(spawn).mockReturnValue(mockSpawn as any)
      vi.mocked(fs.pathExists).mockResolvedValue(true)
      vi.mocked(fs.readJson).mockResolvedValue({
        devDependencies: { vitest: '^0.34.0' }
      })

      const result = await testRunner.runTests(mockValidationContext)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('测试失败')
    })
  })

  describe('installDependencies', () => {
    it('应该使用 pnpm 安装依赖', async () => {
      const mockSpawn = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        })
      }

      vi.mocked(spawn).mockReturnValue(mockSpawn as any)
      vi.mocked(fs.pathExists)
        .mockResolvedValueOnce(true) // pnpm-lock.yaml 存在

      await testRunner.installDependencies(mockValidationContext)

      expect(spawn).toHaveBeenCalledWith(
        'pnpm',
        ['install'],
        expect.objectContaining({
          cwd: mockValidationContext.tempDir,
          stdio: 'pipe',
          shell: true
        })
      )
      expect(mockLogger.success).toHaveBeenCalledWith('依赖安装完成')
    })

    it('应该使用 yarn 安装依赖', async () => {
      const mockSpawn = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        })
      }

      vi.mocked(spawn).mockReturnValue(mockSpawn as any)

      // Mock pathExists 调用顺序：pnpm-lock.yaml, yarn.lock, package-lock.json
      vi.mocked(fs.pathExists)
        .mockImplementation(async (filePath: string) => {
          if (filePath.includes('pnpm-lock.yaml')) return false
          if (filePath.includes('yarn.lock')) return true
          if (filePath.includes('package-lock.json')) return false
          return false
        })

      await testRunner.installDependencies(mockValidationContext)

      expect(spawn).toHaveBeenCalledWith(
        'yarn',
        ['install'],
        expect.objectContaining({
          cwd: mockValidationContext.tempDir
        })
      )
    })

    it('应该默认使用 npm 安装依赖', async () => {
      const mockSpawn = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        })
      }

      vi.mocked(spawn).mockReturnValue(mockSpawn as any)

      // Mock pathExists 调用：所有锁文件都不存在，默认使用npm
      vi.mocked(fs.pathExists)
        .mockImplementation(async (filePath: string) => {
          if (filePath.includes('pnpm-lock.yaml')) return false
          if (filePath.includes('yarn.lock')) return false
          if (filePath.includes('package-lock.json')) return false
          return false
        })

      await testRunner.installDependencies(mockValidationContext)

      expect(spawn).toHaveBeenCalledWith(
        'npm',
        ['install'],
        expect.objectContaining({
          cwd: mockValidationContext.tempDir
        })
      )
    })

    it('应该处理依赖安装失败', async () => {
      const mockSpawn = {
        stdout: { on: vi.fn() },
        stderr: {
          on: vi.fn((event, callback) => {
            if (event === 'data') {
              callback('Installation failed')
            }
          })
        },
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(1) // 错误退出码
          }
        })
      }

      vi.mocked(spawn).mockReturnValue(mockSpawn as any)
      vi.mocked(fs.pathExists).mockResolvedValue(false)

      await expect(testRunner.installDependencies(mockValidationContext))
        .rejects.toThrow('依赖安装失败')
    })
  })

  describe('dispose', () => {
    it('应该清理资源', async () => {
      await testRunner.dispose()
      expect(mockLogger.info).toHaveBeenCalledWith('TestRunner 资源清理完成')
    })
  })
})
