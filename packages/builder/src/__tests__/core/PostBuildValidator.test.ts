/**
 * PostBuildValidator 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs-extra'
import * as path from 'path'
import { PostBuildValidator } from '../../core/PostBuildValidator'
import { TestRunner } from '../../core/TestRunner'
import { ValidationReporter } from '../../core/ValidationReporter'
import { TemporaryEnvironment } from '../../core/TemporaryEnvironment'
import type { ValidationContext, PostBuildValidationConfig } from '../../types/validation'
import { Logger } from '../../utils/logger'

// Mock 依赖
vi.mock('../../core/TestRunner')
vi.mock('../../core/ValidationReporter')
vi.mock('../../core/TemporaryEnvironment')
vi.mock('fs-extra')

describe('PostBuildValidator', () => {
  let validator: PostBuildValidator
  let mockLogger: Logger
  let mockTestRunner: TestRunner
  let mockReporter: ValidationReporter
  let mockTempEnvironment: TemporaryEnvironment

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
      outputs: [
        { path: '/test/project/dist/index.js', format: 'esm', size: 1024 },
        { path: '/test/project/dist/index.cjs', format: 'cjs', size: 1200 }
      ],
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
      timeout: 30000,
      failOnError: true
    },
    tempDir: '/tmp/validation-test',
    startTime: Date.now(),
    validationId: 'validation-test-123',
    projectRoot: '/test/project',
    outputDir: 'dist'
  }

  beforeEach(() => {
    // 创建 mock logger
    mockLogger = {
      info: vi.fn(),
      success: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    } as any

    // 创建 validator 实例
    validator = new PostBuildValidator({}, { logger: mockLogger })

    // 获取 mock 实例
    mockTestRunner = (validator as any).testRunner
    mockReporter = (validator as any).reporter
    mockTempEnvironment = (validator as any).tempEnvironment
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化验证器', () => {
      expect(validator).toBeInstanceOf(PostBuildValidator)
      expect(mockLogger.info).toHaveBeenCalledWith('PostBuildValidator 初始化完成')
    })

    it('应该使用默认配置', () => {
      const config = validator.getConfig()
      expect(config.enabled).toBe(true)
      expect(config.testFramework).toBe('auto')
      expect(config.timeout).toBe(60000)
    })

    it('应该合并自定义配置', () => {
      const customConfig: PostBuildValidationConfig = {
        enabled: false,
        timeout: 30000,
        testFramework: 'jest'
      }

      const customValidator = new PostBuildValidator(customConfig, { logger: mockLogger })
      const config = customValidator.getConfig()

      expect(config.enabled).toBe(false)
      expect(config.timeout).toBe(30000)
      expect(config.testFramework).toBe('jest')
    })
  })

  describe('validate', () => {
    it('应该成功执行验证流程', async () => {
      // Mock 成功的测试结果
      const mockTestResult = {
        success: true,
        totalTests: 10,
        passedTests: 10,
        failedTests: 0,
        skippedTests: 0,
        duration: 2000,
        output: 'All tests passed',
        errors: [],
        performance: {
          setupTime: 100,
          executionTime: 1800,
          teardownTime: 100,
          peakMemoryUsage: 50,
          cpuUsage: 25
        }
      }

      // 设置 mock 返回值
      vi.mocked(mockTempEnvironment.create).mockResolvedValue(undefined)
      vi.mocked(mockTempEnvironment.copyBuildOutputs).mockResolvedValue(undefined)
      vi.mocked(mockTestRunner.runTests).mockResolvedValue(mockTestResult)
      vi.mocked(mockTempEnvironment.cleanup).mockResolvedValue(undefined)

      const result = await validator.validate(mockValidationContext)

      expect(result.success).toBe(true)
      expect(result.testResult).toEqual(mockTestResult)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)

      // 验证调用顺序
      expect(mockTempEnvironment.create).toHaveBeenCalledWith(mockValidationContext)
      expect(mockTempEnvironment.copyBuildOutputs).toHaveBeenCalledWith(mockValidationContext)
      expect(mockTestRunner.runTests).toHaveBeenCalledWith(mockValidationContext)
      expect(mockTempEnvironment.cleanup).toHaveBeenCalledWith(mockValidationContext)
    })

    it('应该处理测试失败的情况', async () => {
      const mockTestResult = {
        success: false,
        totalTests: 10,
        passedTests: 8,
        failedTests: 2,
        skippedTests: 0,
        duration: 2000,
        output: '2 tests failed',
        errors: [
          {
            message: 'Test failed: expected true but got false',
            type: 'assertion' as const,
            file: 'test/example.test.ts',
            line: 15
          }
        ],
        performance: {
          setupTime: 100,
          executionTime: 1800,
          teardownTime: 100,
          peakMemoryUsage: 50,
          cpuUsage: 25
        }
      }

      vi.mocked(mockTempEnvironment.create).mockResolvedValue(undefined)
      vi.mocked(mockTempEnvironment.copyBuildOutputs).mockResolvedValue(undefined)
      vi.mocked(mockTestRunner.runTests).mockResolvedValue(mockTestResult)
      vi.mocked(mockTempEnvironment.cleanup).mockResolvedValue(undefined)

      const result = await validator.validate(mockValidationContext)

      expect(result.success).toBe(false)
      expect(result.testResult.failedTests).toBe(2)
      expect(result.testResult.errors).toHaveLength(1)
    })

    it('应该处理验证过程中的错误', async () => {
      const error = new Error('环境创建失败')
      vi.mocked(mockTempEnvironment.create).mockRejectedValue(error)

      await expect(validator.validate(mockValidationContext)).rejects.toThrow('验证过程失败')

      // 确保清理被调用
      expect(mockTempEnvironment.cleanup).toHaveBeenCalledWith(mockValidationContext)
    })

    it('应该执行验证钩子', async () => {
      const beforeValidation = vi.fn()
      const afterEnvironmentSetup = vi.fn()
      const beforeTestRun = vi.fn()
      const afterTestRun = vi.fn()
      const afterValidation = vi.fn()

      const configWithHooks: PostBuildValidationConfig = {
        enabled: true,
        hooks: {
          beforeValidation,
          afterEnvironmentSetup,
          beforeTestRun,
          afterTestRun,
          afterValidation
        }
      }

      validator.setConfig(configWithHooks)

      const mockTestResult = {
        success: true,
        totalTests: 5,
        passedTests: 5,
        failedTests: 0,
        skippedTests: 0,
        duration: 1000,
        output: 'All tests passed',
        errors: [],
        performance: {
          setupTime: 50,
          executionTime: 900,
          teardownTime: 50,
          peakMemoryUsage: 30,
          cpuUsage: 20
        }
      }

      vi.mocked(mockTempEnvironment.create).mockResolvedValue(undefined)
      vi.mocked(mockTempEnvironment.copyBuildOutputs).mockResolvedValue(undefined)
      vi.mocked(mockTestRunner.runTests).mockResolvedValue(mockTestResult)
      vi.mocked(mockTempEnvironment.cleanup).mockResolvedValue(undefined)

      await validator.validate(mockValidationContext)

      expect(beforeValidation).toHaveBeenCalledWith(mockValidationContext)
      expect(afterEnvironmentSetup).toHaveBeenCalledWith(mockValidationContext)
      expect(beforeTestRun).toHaveBeenCalledWith(mockValidationContext)
      expect(afterTestRun).toHaveBeenCalledWith(mockValidationContext, mockTestResult)
      expect(afterValidation).toHaveBeenCalledWith(mockValidationContext, expect.any(Object))
    })
  })

  describe('setConfig', () => {
    it('应该更新配置', () => {
      const newConfig: PostBuildValidationConfig = {
        enabled: false,
        timeout: 45000,
        testFramework: 'jest'
      }

      validator.setConfig(newConfig)
      const config = validator.getConfig()

      expect(config.enabled).toBe(false)
      expect(config.timeout).toBe(45000)
      expect(config.testFramework).toBe('jest')
      expect(mockLogger.info).toHaveBeenCalledWith('验证配置已更新')
    })

    it('应该合并配置而不是替换', () => {
      const initialConfig = validator.getConfig()
      const partialConfig: PostBuildValidationConfig = {
        timeout: 45000
      }

      validator.setConfig(partialConfig)
      const updatedConfig = validator.getConfig()

      expect(updatedConfig.timeout).toBe(45000)
      expect(updatedConfig.enabled).toBe(initialConfig.enabled) // 保持原值
      expect(updatedConfig.testFramework).toBe(initialConfig.testFramework) // 保持原值
    })
  })

  describe('dispose', () => {
    it('应该清理所有资源', async () => {
      vi.mocked(mockTestRunner.dispose).mockResolvedValue(undefined)
      vi.mocked(mockTempEnvironment.dispose).mockResolvedValue(undefined)

      await validator.dispose()

      expect(mockTestRunner.dispose).toHaveBeenCalled()
      expect(mockTempEnvironment.dispose).toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith('PostBuildValidator 资源清理完成')
    })
  })

  describe('事件发射', () => {
    it('应该发射验证开始事件', async () => {
      const eventSpy = vi.fn()
      validator.on('validation:start', eventSpy)

      vi.mocked(mockTempEnvironment.create).mockResolvedValue(undefined)
      vi.mocked(mockTempEnvironment.copyBuildOutputs).mockResolvedValue(undefined)
      vi.mocked(mockTestRunner.runTests).mockResolvedValue({
        success: true,
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        skippedTests: 0,
        duration: 100,
        output: 'Test passed',
        errors: [],
        performance: {
          setupTime: 10,
          executionTime: 80,
          teardownTime: 10,
          peakMemoryUsage: 10,
          cpuUsage: 5
        }
      })
      vi.mocked(mockTempEnvironment.cleanup).mockResolvedValue(undefined)

      await validator.validate(mockValidationContext)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          context: mockValidationContext,
          validationId: expect.any(String),
          startTime: expect.any(Number)
        })
      )
    })

    it('应该发射验证完成事件', async () => {
      const eventSpy = vi.fn()
      validator.on('validation:complete', eventSpy)

      vi.mocked(mockTempEnvironment.create).mockResolvedValue(undefined)
      vi.mocked(mockTempEnvironment.copyBuildOutputs).mockResolvedValue(undefined)
      vi.mocked(mockTestRunner.runTests).mockResolvedValue({
        success: true,
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        skippedTests: 0,
        duration: 100,
        output: 'Test passed',
        errors: [],
        performance: {
          setupTime: 10,
          executionTime: 80,
          teardownTime: 10,
          peakMemoryUsage: 10,
          cpuUsage: 5
        }
      })
      vi.mocked(mockTempEnvironment.cleanup).mockResolvedValue(undefined)

      await validator.validate(mockValidationContext)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          context: mockValidationContext,
          result: expect.any(Object)
        })
      )
    })

    it('应该发射验证错误事件', async () => {
      const eventSpy = vi.fn()
      validator.on('validation:error', eventSpy)

      const error = new Error('测试错误')
      vi.mocked(mockTempEnvironment.create).mockRejectedValue(error)

      await expect(validator.validate(mockValidationContext)).rejects.toThrow()

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          context: mockValidationContext,
          error: expect.any(Error),
          validationId: expect.any(String)
        })
      )
    })
  })
})
