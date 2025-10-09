/**
 * 测试运行器
 * 
 * 负责检测测试框架、安装依赖和运行测试用例
 * 支持多种测试框架的自动检测和运行
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { spawn } from 'child_process'
import type {
  ITestRunner,
  ValidationContext,
  TestRunResult,
  TestError,
  TestPerformanceMetrics
} from '../types/validation'
import { Logger } from '../utils/logger'
import { ErrorHandler } from '../utils/error-handler'
import { ErrorCode } from '../constants/errors'

/**
 * 支持的测试框架配置
 */
const TEST_FRAMEWORKS = {
  vitest: {
    configFiles: ['vitest.config.ts', 'vitest.config.js', 'vite.config.ts', 'vite.config.js'],
    command: 'vitest',
    args: ['run', '--reporter=json'],
    dependencies: ['vitest']
  },
  jest: {
    configFiles: ['jest.config.js', 'jest.config.ts', 'jest.config.json'],
    command: 'jest',
    args: ['--json', '--coverage=false'],
    dependencies: ['jest']
  },
  mocha: {
    configFiles: ['.mocharc.json', '.mocharc.js', '.mocharc.yaml'],
    command: 'mocha',
    args: ['--reporter', 'json'],
    dependencies: ['mocha']
  }
}

/**
 * 包管理器配置
 */
const PACKAGE_MANAGERS = {
  npm: {
    installCommand: 'npm',
    installArgs: ['install'],
    runCommand: 'npx'
  },
  yarn: {
    installCommand: 'yarn',
    installArgs: ['install'],
    runCommand: 'yarn'
  },
  pnpm: {
    installCommand: 'pnpm',
    installArgs: ['install'],
    runCommand: 'pnpm'
  }
}

/**
 * 测试运行器实现
 */
export class TestRunner implements ITestRunner {
  /** 日志记录器 */
  private logger: Logger

  /** 错误处理器 */
  private errorHandler: ErrorHandler

  /** 活跃的子进程列表 */
  private activeProcesses: Set<any> = new Set()

  /**
   * 构造函数
   */
  constructor(options: {
    logger?: Logger
    errorHandler?: ErrorHandler
  } = {}) {
    this.logger = options.logger || new Logger({ level: 'info', prefix: 'TestRunner' })
    this.errorHandler = options.errorHandler || new ErrorHandler({ logger: this.logger })
  }

  /**
   * 运行测试
   */
  async runTests(context: ValidationContext): Promise<TestRunResult> {
    const startTime = Date.now()
    this.logger.info('开始运行测试...')

    try {
      // 检测测试框架
      const framework = await this.detectFramework(context.projectRoot)
      this.logger.info(`检测到测试框架: ${framework}`)

      // 获取框架配置
      const frameworkConfig = TEST_FRAMEWORKS[framework as keyof typeof TEST_FRAMEWORKS]
      if (!frameworkConfig) {
        throw new Error(`不支持的测试框架: ${framework}`)
      }

      // 构建测试命令
      const packageManager = await this.detectPackageManager(context.projectRoot)
      const runCommand = PACKAGE_MANAGERS[packageManager as keyof typeof PACKAGE_MANAGERS].runCommand

      // 运行测试
      const testOutput = await this.executeTests(
        context.tempDir,
        runCommand,
        frameworkConfig.command,
        frameworkConfig.args,
        context.config.timeout || 60000
      )

      // 解析测试结果
      const result = await this.parseTestOutput(testOutput, framework)

      // 计算性能指标
      const duration = Date.now() - startTime
      const performance: TestPerformanceMetrics = {
        setupTime: 0,
        executionTime: duration,
        teardownTime: 0,
        peakMemoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: 0
      }

      const testResult: TestRunResult = {
        success: result.success ?? false,
        totalTests: result.totalTests ?? 0,
        passedTests: result.passedTests ?? 0,
        failedTests: result.failedTests ?? 0,
        skippedTests: result.skippedTests ?? 0,
        output: result.output ?? '',
        errors: result.errors ?? [],
        duration,
        performance
      }

      this.logger.success(`测试运行完成: ${testResult.passedTests}/${testResult.totalTests} 通过`)

      return testResult

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const testError = this.errorHandler.createError(
        ErrorCode.BUILD_FAILED,
        errorMessage,
        { cause: error as Error }
      )

      // 返回失败结果
      return {
        success: false,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        duration: Date.now() - startTime,
        output: errorMessage,
        errors: [{
          message: errorMessage,
          stack: testError.stack,
          type: 'runtime'
        }],
        performance: {
          setupTime: 0,
          executionTime: Date.now() - startTime,
          teardownTime: 0,
          peakMemoryUsage: 0,
          cpuUsage: 0
        }
      }
    }
  }

  /**
   * 检测测试框架
   */
  async detectFramework(projectRoot: string): Promise<string> {
    this.logger.info('检测测试框架...')

    // 检查 package.json 中的依赖
    const packageJsonPath = path.join(projectRoot, 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      // 按优先级检测
      if (allDeps.vitest) return 'vitest'
      if (allDeps.jest) return 'jest'
      if (allDeps.mocha) return 'mocha'
    }

    // 检查配置文件
    for (const [framework, config] of Object.entries(TEST_FRAMEWORKS)) {
      for (const configFile of config.configFiles) {
        if (await fs.pathExists(path.join(projectRoot, configFile))) {
          return framework
        }
      }
    }

    // 默认返回 vitest
    this.logger.warn('未检测到测试框架，使用默认的 vitest')
    return 'vitest'
  }

  /**
   * 安装依赖
   */
  async installDependencies(context: ValidationContext): Promise<void> {
    this.logger.info('安装依赖...')

    const packageManager = await this.detectPackageManager(context.projectRoot)
    const pmConfig = PACKAGE_MANAGERS[packageManager as keyof typeof PACKAGE_MANAGERS]

    try {
      await this.executeCommand(
        context.tempDir,
        pmConfig.installCommand,
        pmConfig.installArgs,
        context.config.environment?.installTimeout || 300000
      )

      this.logger.success('依赖安装完成')
    } catch (error) {
      throw this.errorHandler.createError(
        ErrorCode.BUILD_FAILED,
        '依赖安装失败',
        { cause: error as Error }
      )
    }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    // 清理所有活跃的子进程
    if (this.activeProcesses.size > 0) {
      this.logger.debug(`清理 ${this.activeProcesses.size} 个活跃子进程...`)

      for (const child of this.activeProcesses) {
        try {
          if (child && !child.killed) {
            child.kill('SIGTERM')

            // 如果 SIGTERM 不起作用,等待 1 秒后强制 SIGKILL
            setTimeout(() => {
              if (!child.killed) {
                child.kill('SIGKILL')
              }
            }, 1000)
          }
        } catch (error) {
          this.logger.debug('清理子进程失败:', error)
        }
      }

      this.activeProcesses.clear()
    }

    this.logger.info('TestRunner 资源清理完成')
  }

  /**
   * 检测包管理器
   */
  private async detectPackageManager(projectRoot: string): Promise<string> {
    // 检查锁文件
    if (await fs.pathExists(path.join(projectRoot, 'pnpm-lock.yaml'))) {
      return 'pnpm'
    }
    if (await fs.pathExists(path.join(projectRoot, 'yarn.lock'))) {
      return 'yarn'
    }
    if (await fs.pathExists(path.join(projectRoot, 'package-lock.json'))) {
      return 'npm'
    }

    // 默认使用 npm
    return 'npm'
  }

  /**
   * 执行测试命令
   */
  private async executeTests(
    cwd: string,
    runCommand: string,
    testCommand: string,
    args: string[],
    timeout: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const fullCommand = [testCommand, ...args]
      const child = spawn(runCommand, fullCommand, {
        cwd,
        stdio: 'pipe',
        shell: true
      })

      // 添加到活跃进程列表
      this.activeProcesses.add(child)

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      const timer = setTimeout(() => {
        child.kill('SIGTERM')
        this.activeProcesses.delete(child)
        reject(new Error(`测试超时 (${timeout}ms)`))
      }, timeout)

      child.on('close', (code) => {
        clearTimeout(timer)
        this.activeProcesses.delete(child)
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error(`测试失败 (退出码: ${code})\n${stderr}`))
        }
      })

      child.on('error', (error) => {
        clearTimeout(timer)
        this.activeProcesses.delete(child)
        reject(error)
      })
    })
  }

  /**
   * 执行命令
   */
  private async executeCommand(
    cwd: string,
    command: string,
    args: string[],
    timeout: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: 'pipe',
        shell: true
      })

      // 添加到活跃进程列表
      this.activeProcesses.add(child)

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      const timer = setTimeout(() => {
        child.kill('SIGTERM')
        this.activeProcesses.delete(child)
        reject(new Error(`命令超时 (${timeout}ms)`))
      }, timeout)

      child.on('close', (code) => {
        clearTimeout(timer)
        this.activeProcesses.delete(child)
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error(`命令失败 (退出码: ${code})\n${stderr}`))
        }
      })

      child.on('error', (error) => {
        clearTimeout(timer)
        this.activeProcesses.delete(child)
        reject(error)
      })
    })
  }

  /**
   * 解析测试输出
   */
  private async parseTestOutput(output: string, framework: string): Promise<Partial<TestRunResult>> {
    try {
      // 尝试解析 JSON 输出
      const result = JSON.parse(output)

      // 根据不同框架解析结果
      switch (framework) {
        case 'vitest':
          return this.parseVitestOutput(result)
        case 'jest':
          return this.parseJestOutput(result)
        case 'mocha':
          return this.parseMochaOutput(result)
        default:
          return this.parseGenericOutput(result)
      }
    } catch (error) {
      // 如果无法解析 JSON，返回基本结果
      return {
        success: output.includes('PASS') || output.includes('✓'),
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        output,
        errors: []
      }
    }
  }

  /**
   * 解析 Vitest 输出
   */
  private parseVitestOutput(result: any): Partial<TestRunResult> {
    return {
      success: result.success || false,
      totalTests: result.numTotalTests || 0,
      passedTests: result.numPassedTests || 0,
      failedTests: result.numFailedTests || 0,
      skippedTests: result.numPendingTests || 0,
      output: JSON.stringify(result, null, 2),
      errors: this.extractVitestErrors(result)
    }
  }

  /**
   * 解析 Jest 输出
   */
  private parseJestOutput(result: any): Partial<TestRunResult> {
    return {
      success: result.success || false,
      totalTests: result.numTotalTests || 0,
      passedTests: result.numPassedTests || 0,
      failedTests: result.numFailedTests || 0,
      skippedTests: result.numPendingTests || 0,
      output: JSON.stringify(result, null, 2),
      errors: this.extractJestErrors(result)
    }
  }

  /**
   * 解析 Mocha 输出
   */
  private parseMochaOutput(result: any): Partial<TestRunResult> {
    const tests = result.tests || []
    const passed = tests.filter((t: any) => t.state === 'passed').length
    const failed = tests.filter((t: any) => t.state === 'failed').length
    const pending = tests.filter((t: any) => t.pending).length

    return {
      success: failed === 0,
      totalTests: tests.length,
      passedTests: passed,
      failedTests: failed,
      skippedTests: pending,
      output: JSON.stringify(result, null, 2),
      errors: this.extractMochaErrors(result)
    }
  }

  /**
   * 解析通用输出
   */
  private parseGenericOutput(result: any): Partial<TestRunResult> {
    return {
      success: result.success || false,
      totalTests: result.totalTests || 0,
      passedTests: result.passedTests || 0,
      failedTests: result.failedTests || 0,
      skippedTests: result.skippedTests || 0,
      output: JSON.stringify(result, null, 2),
      errors: []
    }
  }

  /**
   * 提取 Vitest 错误
   */
  private extractVitestErrors(result: any): TestError[] {
    const errors: TestError[] = []
    // 简化实现，实际应该解析具体的错误信息
    if (result.testResults) {
      result.testResults.forEach((testResult: any) => {
        if (testResult.assertionResults) {
          testResult.assertionResults.forEach((assertion: any) => {
            if (assertion.status === 'failed') {
              errors.push({
                message: assertion.failureMessages?.[0] || '测试失败',
                type: 'assertion',
                file: testResult.name
              })
            }
          })
        }
      })
    }
    return errors
  }

  /**
   * 提取 Jest 错误
   */
  private extractJestErrors(result: any): TestError[] {
    const errors: TestError[] = []
    // 简化实现
    if (result.testResults) {
      result.testResults.forEach((testResult: any) => {
        if (testResult.message) {
          errors.push({
            message: testResult.message,
            type: 'assertion',
            file: testResult.name
          })
        }
      })
    }
    return errors
  }

  /**
   * 提取 Mocha 错误
   */
  private extractMochaErrors(result: any): TestError[] {
    const errors: TestError[] = []
    if (result.failures) {
      result.failures.forEach((failure: any) => {
        errors.push({
          message: failure.err?.message || '测试失败',
          stack: failure.err?.stack,
          type: 'assertion',
          file: failure.file
        })
      })
    }
    return errors
  }
}
