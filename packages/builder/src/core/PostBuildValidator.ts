/**
 * 打包后验证器
 * 
 * 负责在构建完成后验证打包产物的正确性
 * 通过运行测试用例确保打包前后功能一致性
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import type {
  IPostBuildValidator,
  PostBuildValidationConfig,
  ValidationContext,
  ValidationResult,
  ValidationReport,
  ValidationStats,
  ValidationSummary,
  ValidationDetails
} from '../types/validation'
import { TestRunner } from './TestRunner'
import { ValidationReporter } from './ValidationReporter'
import { TemporaryEnvironment } from './TemporaryEnvironment'
import { Logger } from '../utils/logger'
import { ErrorHandler } from '../utils/error-handler'
import { ErrorCode } from '../constants/errors'

/**
 * 默认验证配置
 */
const DEFAULT_VALIDATION_CONFIG: Required<PostBuildValidationConfig> = {
  enabled: true,
  testFramework: 'auto',
  testPattern: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
  timeout: 60000,
  failOnError: true,
  environment: {
    tempDir: '.validation-temp',
    keepTempFiles: false,
    env: {},
    nodeVersion: process.version,
    packageManager: 'auto',
    installDependencies: true,
    installTimeout: 300000
  },
  reporting: {
    format: 'console',
    outputPath: 'validation-report',
    verbose: false,
    logLevel: 'info',
    includePerformance: true,
    includeCoverage: false
  },
  hooks: {},
  scope: {
    formats: ['esm', 'cjs'],
    fileTypes: ['js', 'ts', 'dts'],
    exclude: ['**/*.d.ts', '**/node_modules/**'],
    include: ['**/*'],
    validateTypes: true,
    validateStyles: false,
    validateSourceMaps: false
  }
}

/**
 * 打包后验证器实现
 */
export class PostBuildValidator extends EventEmitter implements IPostBuildValidator {
  /** 验证配置 */
  private config: PostBuildValidationConfig

  /** 测试运行器 */
  private testRunner: TestRunner

  /** 验证报告生成器 */
  private reporter: ValidationReporter

  /** 临时环境管理器 */
  private tempEnvironment: TemporaryEnvironment

  /** 日志记录器 */
  private logger: Logger

  /** 错误处理器 */
  private errorHandler: ErrorHandler

  /**
   * 构造函数
   */
  constructor(
    config: PostBuildValidationConfig = {},
    options: {
      logger?: Logger
      errorHandler?: ErrorHandler
    } = {}
  ) {
    super()

    // 合并配置
    this.config = this.mergeConfig(DEFAULT_VALIDATION_CONFIG, config)

    // 初始化依赖
    this.logger = options.logger || new Logger({ level: 'info', prefix: 'PostBuildValidator' })
    this.errorHandler = options.errorHandler || new ErrorHandler({ logger: this.logger })

    // 初始化组件
    this.testRunner = new TestRunner({
      logger: this.logger,
      errorHandler: this.errorHandler
    })

    this.reporter = new ValidationReporter({
      logger: this.logger
    })

    this.tempEnvironment = new TemporaryEnvironment({
      logger: this.logger,
      errorHandler: this.errorHandler
    })

    this.logger.info('PostBuildValidator 初始化完成')
  }

  /**
   * 执行验证
   */
  async validate(context: ValidationContext): Promise<ValidationResult> {
    const validationId = randomUUID()
    const startTime = Date.now()

    this.logger.info(`开始打包后验证 (ID: ${validationId})`)

    // 发出验证开始事件
    this.emit('validation:start', { context, validationId, startTime })

    try {
      // 执行验证前钩子
      if (this.config?.hooks?.beforeValidation) {
        await this.config?.hooks.beforeValidation(context)
      }

      // 创建验证统计对象
      const stats: ValidationStats = {
        startTime,
        endTime: 0,
        totalDuration: 0,
        setupDuration: 0,
        testDuration: 0,
        reportDuration: 0,
        cleanupDuration: 0,
        totalFiles: 0,
        totalTests: 0,
        peakMemoryUsage: 0
      }

      // 1. 准备验证环境
      const setupStartTime = Date.now()
      await this.setupValidationEnvironment(context)
      stats.setupDuration = Date.now() - setupStartTime

      // 执行环境准备后钩子
      if (this.config?.hooks?.afterEnvironmentSetup) {
        await this.config?.hooks.afterEnvironmentSetup(context)
      }

      // 2. 运行测试
      const testStartTime = Date.now()
      const testResult = await this.runValidationTests(context)
      stats.testDuration = Date.now() - testStartTime
      stats.totalTests = testResult.totalTests

      // 3. 生成验证结果
      const endTime = Date.now()
      stats.endTime = endTime
      stats.totalDuration = endTime - startTime

      const validationResult: ValidationResult = {
        success: testResult.success,
        duration: stats.totalDuration,
        testResult,
        report: await this.generateValidationReport(context, testResult, stats),
        errors: [],
        warnings: [],
        stats,
        timestamp: endTime,
        validationId
      }

      // 4. 生成报告
      const reportStartTime = Date.now()
      await this.outputValidationReport(validationResult)
      stats.reportDuration = Date.now() - reportStartTime

      // 5. 清理环境
      const cleanupStartTime = Date.now()
      await this.cleanupValidationEnvironment(context)
      stats.cleanupDuration = Date.now() - cleanupStartTime

      // 执行验证完成后钩子
      if (this.config?.hooks?.afterValidation) {
        await this.config?.hooks.afterValidation(context, validationResult)
      }

      // 发出验证完成事件
      this.emit('validation:complete', { context, result: validationResult })

      this.logger.success(`验证完成 (ID: ${validationId}), 耗时: ${stats.totalDuration}ms`)

      return validationResult

    } catch (error) {
      const validationError = this.errorHandler.createError(
        ErrorCode.BUILD_FAILED,
        '验证过程失败',
        { cause: error as Error }
      )

      // 执行验证失败钩子
      if (this.config?.hooks?.onValidationError) {
        await this.config?.hooks.onValidationError(context, validationError)
      }

      // 发出验证失败事件
      this.emit('validation:error', { context, error: validationError, validationId })

      // 清理环境
      try {
        await this.cleanupValidationEnvironment(context)
      } catch (cleanupError) {
        this.logger.warn('清理验证环境时出错:', cleanupError)
      }

      throw validationError
    }
  }

  /**
   * 设置配置
   */
  setConfig(config: PostBuildValidationConfig): void {
    this.config = this.mergeConfig(this.config, config)
    this.logger.info('验证配置已更新')
  }

  /**
   * 获取配置
   */
  getConfig(): PostBuildValidationConfig {
    return { ...this.config }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    this.logger.info('正在清理 PostBuildValidator 资源...')

    // 清理组件
    await this.testRunner.dispose()
    await this.tempEnvironment.dispose()

    // 移除所有事件监听器
    this.removeAllListeners()

    this.logger.info('PostBuildValidator 资源清理完成')
  }

  /**
   * 准备验证环境
   */
  private async setupValidationEnvironment(context: ValidationContext): Promise<void> {
    this.logger.info('准备验证环境...')

    // 创建临时目录
    await this.tempEnvironment.create(context)

    // 复制构建产物到临时环境
    await this.tempEnvironment.copyBuildOutputs(context)

    // 安装依赖（如果需要）
    if (this.config?.environment?.installDependencies) {
      await this.testRunner.installDependencies(context)
    }

    this.logger.success('验证环境准备完成')
  }

  /**
   * 运行验证测试
   */
  private async runValidationTests(context: ValidationContext): Promise<any> {
    this.logger.info('运行验证测试...')

    // 执行测试前钩子
    if (this.config?.hooks?.beforeTestRun) {
      await this.config?.hooks.beforeTestRun(context)
    }

    // 运行测试
    const testResult = await this.testRunner.runTests(context)

    // 执行测试后钩子
    if (this.config?.hooks?.afterTestRun) {
      await this.config?.hooks.afterTestRun(context, testResult)
    }

    this.logger.success(`测试运行完成: ${testResult.passedTests}/${testResult.totalTests} 通过`)

    return testResult
  }

  /**
   * 生成验证报告
   */
  private async generateValidationReport(
    context: ValidationContext,
    testResult: any,
    stats: ValidationStats
  ): Promise<ValidationReport> {
    this.logger.info('生成验证报告...')

    const summary: ValidationSummary = {
      status: testResult.success ? 'passed' : 'failed',
      totalFiles: stats.totalFiles,
      passedFiles: stats.totalFiles, // 简化实现
      failedFiles: 0,
      totalTests: testResult.totalTests,
      passedTests: testResult.passedTests,
      failedTests: testResult.failedTests,
      duration: stats.totalDuration
    }

    const details: ValidationDetails = {
      fileResults: [],
      formatResults: [],
      typeResults: [],
      styleResults: []
    }

    const report: ValidationReport = {
      title: `构建验证报告 - ${context.buildContext.buildId}`,
      summary,
      details,
      recommendations: [],
      generatedAt: Date.now(),
      version: '1.0.0'
    }

    return report
  }

  /**
   * 输出验证报告
   */
  private async outputValidationReport(result: ValidationResult): Promise<void> {
    if (this.config?.reporting) {
      await this.reporter.outputReport(result.report, this.config?.reporting)
    }
  }

  /**
   * 清理验证环境
   */
  private async cleanupValidationEnvironment(context: ValidationContext): Promise<void> {
    this.logger.info('清理验证环境...')

    if (!this.config?.environment?.keepTempFiles) {
      await this.tempEnvironment.cleanup(context)
    }

    this.logger.success('验证环境清理完成')
  }

  /**
   * 合并配置
   */
  private mergeConfig(
    base: PostBuildValidationConfig,
    override: PostBuildValidationConfig
  ): PostBuildValidationConfig {
    return {
      ...base,
      ...override,
      environment: {
        ...base.environment,
        ...override.environment
      },
      reporting: {
        ...base.reporting,
        ...override.reporting
      },
      hooks: {
        ...base.hooks,
        ...override.hooks
      },
      scope: {
        ...base.scope,
        ...override.scope
      }
    }
  }
}
