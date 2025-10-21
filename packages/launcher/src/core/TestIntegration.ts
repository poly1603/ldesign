/**
 * 测试集成模块
 * 
 * 提供测试框架集成、自动化测试、覆盖率报告等功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import { spawn, ChildProcess } from 'child_process'
import { Logger } from '../utils/logger'
import { FileSystem } from '../utils/file-system'
import { PathUtils } from '../utils/path-utils'
import chalk from 'chalk'

export type TestFramework = 'vitest' | 'jest' | 'mocha' | 'cypress' | 'playwright'

export interface TestConfig {
  /** 测试框架 */
  framework: TestFramework
  /** 测试文件匹配模式 */
  testMatch?: string[]
  /** 排除的文件模式 */
  exclude?: string[]
  /** 覆盖率阈值 */
  coverageThreshold?: {
    branches?: number
    functions?: number
    lines?: number
    statements?: number
  }
  /** 启用监听模式 */
  watch?: boolean
  /** 启用覆盖率报告 */
  coverage?: boolean
  /** 启用并行测试 */
  parallel?: boolean
  /** 测试超时时间 (ms) */
  timeout?: number
  /** 自定义配置文件路径 */
  configFile?: string
  /** 环境变量 */
  env?: Record<string, string>
}

export interface TestResult {
  /** 是否通过 */
  passed: boolean
  /** 总测试数 */
  total: number
  /** 通过的测试数 */
  passed_count: number
  /** 失败的测试数 */
  failed: number
  /** 跳过的测试数 */
  skipped: number
  /** 测试时长 (ms) */
  duration: number
  /** 覆盖率信息 */
  coverage?: {
    lines: number
    branches: number
    functions: number
    statements: number
  }
  /** 错误信息 */
  errors?: string[]
}

/**
 * 测试集成类
 */
export class TestIntegration extends EventEmitter {
  private logger: Logger
  private config: TestConfig
  private testProcess?: ChildProcess
  private isRunning: boolean = false
  private lastResult?: TestResult

  constructor(config: TestConfig) {
    super()
    
    this.logger = new Logger('TestIntegration')
    this.config = {
      testMatch: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      watch: false,
      coverage: false,
      parallel: true,
      timeout: 5000,
      ...config
    }
  }

  /**
   * 运行测试
   */
  async runTests(): Promise<TestResult> {
    if (this.isRunning) {
      throw new Error('测试正在运行中')
    }

    this.isRunning = true
    this.emit('start')

    try {
      const result = await this.executeTests()
      this.lastResult = result
      this.emit('complete', result)
      return result
    } catch (error) {
      const errorResult: TestResult = {
        passed: false,
        total: 0,
        passed_count: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        errors: [(error as Error).message]
      }
      this.emit('error', error)
      return errorResult
    } finally {
      this.isRunning = false
    }
  }

  /**
   * 执行测试
   */
  private async executeTests(): Promise<TestResult> {
    const startTime = Date.now()
    
    switch (this.config.framework) {
      case 'vitest':
        return this.runVitest(startTime)
      case 'jest':
        return this.runJest(startTime)
      case 'cypress':
        return this.runCypress(startTime)
      case 'playwright':
        return this.runPlaywright(startTime)
      case 'mocha':
        return this.runMocha(startTime)
      default:
        throw new Error(`不支持的测试框架: ${this.config.framework}`)
    }
  }

  /**
   * 运行 Vitest
   */
  private runVitest(startTime: number): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const args = ['vitest', 'run']
      
      if (this.config.coverage) {
        args.push('--coverage')
      }
      
      if (this.config.parallel) {
        args.push('--threads')
      }
      
      if (this.config.configFile) {
        args.push('--config', this.config.configFile)
      }

      this.logger.info('运行 Vitest 测试...')
      
      this.testProcess = spawn('npx', args, {
        cwd: process.cwd(),
        env: { ...process.env, ...this.config.env },
        shell: true
      })

      let output = ''
      
      this.testProcess.stdout?.on('data', (data) => {
        const str = data.toString()
        output += str
        process.stdout.write(chalk.gray(str))
      })

      this.testProcess.stderr?.on('data', (data) => {
        const str = data.toString()
        output += str
        process.stderr.write(chalk.red(str))
      })

      this.testProcess.on('close', (code) => {
        const duration = Date.now() - startTime
        const result = this.parseVitestOutput(output, code || 0, duration)
        
        if (code === 0) {
          this.logger.success('测试完成')
          resolve(result)
        } else {
          this.logger.error('测试失败')
          resolve(result)
        }
      })

      this.testProcess.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * 运行 Jest
   */
  private runJest(startTime: number): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const args = ['jest']
      
      if (this.config.coverage) {
        args.push('--coverage')
      }
      
      if (this.config.parallel !== false) {
        args.push('--maxWorkers=50%')
      }
      
      if (this.config.configFile) {
        args.push('--config', this.config.configFile)
      }

      args.push('--json')

      this.logger.info('运行 Jest 测试...')
      
      this.testProcess = spawn('npx', args, {
        cwd: process.cwd(),
        env: { ...process.env, ...this.config.env },
        shell: true
      })

      let output = ''
      
      this.testProcess.stdout?.on('data', (data) => {
        output += data.toString()
      })

      this.testProcess.stderr?.on('data', (data) => {
        process.stderr.write(chalk.red(data.toString()))
      })

      this.testProcess.on('close', (code) => {
        const duration = Date.now() - startTime
        
        try {
          const jsonResult = JSON.parse(output)
          const result: TestResult = {
            passed: jsonResult.success,
            total: jsonResult.numTotalTests,
            passed_count: jsonResult.numPassedTests,
            failed: jsonResult.numFailedTests,
            skipped: jsonResult.numPendingTests,
            duration,
            coverage: jsonResult.coverageMap ? {
              lines: jsonResult.coverageMap.lines?.pct || 0,
              branches: jsonResult.coverageMap.branches?.pct || 0,
              functions: jsonResult.coverageMap.functions?.pct || 0,
              statements: jsonResult.coverageMap.statements?.pct || 0
            } : undefined
          }
          
          if (code === 0) {
            this.logger.success('测试完成')
          } else {
            this.logger.error('测试失败')
          }
          
          resolve(result)
        } catch (error) {
          reject(new Error('解析 Jest 输出失败'))
        }
      })

      this.testProcess.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * 运行 Cypress
   */
  private runCypress(startTime: number): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const args = ['cypress', 'run']
      
      if (this.config.configFile) {
        args.push('--config-file', this.config.configFile)
      }

      this.logger.info('运行 Cypress E2E 测试...')
      
      this.testProcess = spawn('npx', args, {
        cwd: process.cwd(),
        env: { ...process.env, ...this.config.env },
        shell: true
      })

      let output = ''
      
      this.testProcess.stdout?.on('data', (data) => {
        const str = data.toString()
        output += str
        process.stdout.write(chalk.cyan(str))
      })

      this.testProcess.stderr?.on('data', (data) => {
        process.stderr.write(chalk.red(data.toString()))
      })

      this.testProcess.on('close', (code) => {
        const duration = Date.now() - startTime
        const result = this.parseCypressOutput(output, code || 0, duration)
        
        if (code === 0) {
          this.logger.success('E2E 测试完成')
          resolve(result)
        } else {
          this.logger.error('E2E 测试失败')
          resolve(result)
        }
      })

      this.testProcess.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * 运行 Playwright
   */
  private runPlaywright(startTime: number): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const args = ['playwright', 'test']
      
      if (this.config.configFile) {
        args.push('--config', this.config.configFile)
      }

      if (this.config.parallel) {
        args.push('--workers=50%')
      }

      this.logger.info('运行 Playwright E2E 测试...')
      
      this.testProcess = spawn('npx', args, {
        cwd: process.cwd(),
        env: { ...process.env, ...this.config.env },
        shell: true
      })

      let output = ''
      
      this.testProcess.stdout?.on('data', (data) => {
        const str = data.toString()
        output += str
        process.stdout.write(chalk.magenta(str))
      })

      this.testProcess.stderr?.on('data', (data) => {
        process.stderr.write(chalk.red(data.toString()))
      })

      this.testProcess.on('close', (code) => {
        const duration = Date.now() - startTime
        const result = this.parsePlaywrightOutput(output, code || 0, duration)
        
        if (code === 0) {
          this.logger.success('E2E 测试完成')
          resolve(result)
        } else {
          this.logger.error('E2E 测试失败')
          resolve(result)
        }
      })

      this.testProcess.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * 运行 Mocha
   */
  private runMocha(startTime: number): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const args = ['mocha']
      
      // 添加测试文件模式
      this.config.testMatch?.forEach(pattern => {
        args.push(pattern)
      })
      
      if (this.config.parallel) {
        args.push('--parallel')
      }

      if (this.config.timeout) {
        args.push('--timeout', this.config.timeout.toString())
      }

      this.logger.info('运行 Mocha 测试...')
      
      this.testProcess = spawn('npx', args, {
        cwd: process.cwd(),
        env: { ...process.env, ...this.config.env },
        shell: true
      })

      let output = ''
      
      this.testProcess.stdout?.on('data', (data) => {
        const str = data.toString()
        output += str
        process.stdout.write(chalk.green(str))
      })

      this.testProcess.stderr?.on('data', (data) => {
        process.stderr.write(chalk.red(data.toString()))
      })

      this.testProcess.on('close', (code) => {
        const duration = Date.now() - startTime
        const result = this.parseMochaOutput(output, code || 0, duration)
        
        if (code === 0) {
          this.logger.success('测试完成')
          resolve(result)
        } else {
          this.logger.error('测试失败')
          resolve(result)
        }
      })

      this.testProcess.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * 解析 Vitest 输出
   */
  private parseVitestOutput(output: string, exitCode: number, duration: number): TestResult {
    // 简单的输出解析，实际应该更复杂
    const passedMatch = output.match(/(\d+) passed/)
    const failedMatch = output.match(/(\d+) failed/)
    const skippedMatch = output.match(/(\d+) skipped/)
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0
    const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0
    
    return {
      passed: exitCode === 0,
      total: passed + failed + skipped,
      passed_count: passed,
      failed,
      skipped,
      duration
    }
  }

  /**
   * 解析 Cypress 输出
   */
  private parseCypressOutput(output: string, exitCode: number, duration: number): TestResult {
    const passedMatch = output.match(/(\d+) passing/)
    const failedMatch = output.match(/(\d+) failing/)
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0
    
    return {
      passed: exitCode === 0,
      total: passed + failed,
      passed_count: passed,
      failed,
      skipped: 0,
      duration
    }
  }

  /**
   * 解析 Playwright 输出
   */
  private parsePlaywrightOutput(output: string, exitCode: number, duration: number): TestResult {
    const passedMatch = output.match(/(\d+) passed/)
    const failedMatch = output.match(/(\d+) failed/)
    const skippedMatch = output.match(/(\d+) skipped/)
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0
    const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0
    
    return {
      passed: exitCode === 0,
      total: passed + failed + skipped,
      passed_count: passed,
      failed,
      skipped,
      duration
    }
  }

  /**
   * 解析 Mocha 输出
   */
  private parseMochaOutput(output: string, exitCode: number, duration: number): TestResult {
    const passedMatch = output.match(/(\d+) passing/)
    const failedMatch = output.match(/(\d+) failing/)
    const pendingMatch = output.match(/(\d+) pending/)
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0
    const pending = pendingMatch ? parseInt(pendingMatch[1]) : 0
    
    return {
      passed: exitCode === 0,
      total: passed + failed + pending,
      passed_count: passed,
      failed,
      skipped: pending,
      duration
    }
  }

  /**
   * 启动监听模式
   */
  async startWatchMode(): Promise<void> {
    if (!this.config.watch) {
      this.config.watch = true
    }

    this.logger.info('启动测试监听模式...')
    
    // 根据框架启动相应的监听模式
    switch (this.config.framework) {
      case 'vitest':
        await this.startVitestWatch()
        break
      case 'jest':
        await this.startJestWatch()
        break
      default:
        throw new Error(`${this.config.framework} 不支持监听模式`)
    }
  }

  /**
   * 启动 Vitest 监听模式
   */
  private async startVitestWatch(): Promise<void> {
    const args = ['vitest', 'watch']
    
    if (this.config.configFile) {
      args.push('--config', this.config.configFile)
    }

    this.testProcess = spawn('npx', args, {
      cwd: process.cwd(),
      env: { ...process.env, ...this.config.env },
      shell: true,
      stdio: 'inherit'
    })

    this.testProcess.on('error', (error) => {
      this.logger.error('监听模式启动失败:', error)
      this.emit('watch-error', error)
    })
  }

  /**
   * 启动 Jest 监听模式
   */
  private async startJestWatch(): Promise<void> {
    const args = ['jest', '--watch']
    
    if (this.config.configFile) {
      args.push('--config', this.config.configFile)
    }

    this.testProcess = spawn('npx', args, {
      cwd: process.cwd(),
      env: { ...process.env, ...this.config.env },
      shell: true,
      stdio: 'inherit'
    })

    this.testProcess.on('error', (error) => {
      this.logger.error('监听模式启动失败:', error)
      this.emit('watch-error', error)
    })
  }

  /**
   * 停止测试
   */
  stop(): void {
    if (this.testProcess) {
      this.testProcess.kill()
      this.testProcess = undefined
      this.isRunning = false
      this.logger.info('测试已停止')
    }
  }

  /**
   * 获取最后的测试结果
   */
  getLastResult(): TestResult | undefined {
    return this.lastResult
  }

  /**
   * 检查覆盖率是否达标
   */
  checkCoverageThreshold(): boolean {
    if (!this.lastResult?.coverage || !this.config.coverageThreshold) {
      return true
    }

    const coverage = this.lastResult.coverage
    const threshold = this.config.coverageThreshold

    if (threshold.lines && coverage.lines < threshold.lines) {
      this.logger.warn(`行覆盖率不足: ${coverage.lines}% < ${threshold.lines}%`)
      return false
    }

    if (threshold.branches && coverage.branches < threshold.branches) {
      this.logger.warn(`分支覆盖率不足: ${coverage.branches}% < ${threshold.branches}%`)
      return false
    }

    if (threshold.functions && coverage.functions < threshold.functions) {
      this.logger.warn(`函数覆盖率不足: ${coverage.functions}% < ${threshold.functions}%`)
      return false
    }

    if (threshold.statements && coverage.statements < threshold.statements) {
      this.logger.warn(`语句覆盖率不足: ${coverage.statements}% < ${threshold.statements}%`)
      return false
    }

    return true
  }
}

/**
 * 创建测试集成实例
 */
export function createTestIntegration(config: TestConfig): TestIntegration {
  return new TestIntegration(config)
}
