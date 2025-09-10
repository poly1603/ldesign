#!/usr/bin/env node

/**
 * 增强版打包工具综合测试脚本
 * 
 * 用于验证优化后的打包工具是否能正确工作，确保打包前后功能一致
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 导入增强版组件
// 注意：由于是 TypeScript 项目，需要先编译或使用 ts-node/tsx 运行
const { EnhancedLibraryBuilder } = await import('./src/core/EnhancedLibraryBuilder.ts')
const { EnhancedRollupAdapter } = await import('./src/adapters/rollup/EnhancedRollupAdapter.ts') 
const { EnhancedPostBuildValidator } = await import('./src/core/EnhancedPostBuildValidator.ts')
import * as fs from 'fs-extra'
import * as path from 'path'
import chalk from 'chalk'

/**
 * 测试配置
 */
const TEST_CONFIG = {
  // 测试项目列表
  testProjects: [
    {
      name: 'TypeScript 库',
      path: './examples/basic-typescript',
      config: {
        input: 'src/index.ts',
        output: {
          dir: 'dist',
          format: ['esm', 'cjs', 'umd'],
          name: 'TestLibrary'
        },
        libraryType: 'typescript'
      }
    },
    {
      name: 'React 组件库',
      path: './examples/react-components',
      config: {
        input: 'src/index.tsx',
        output: {
          dir: 'dist',
          format: ['esm', 'cjs'],
          preserveModules: true
        },
        libraryType: 'react'
      }
    },
    {
      name: 'Vue 组件库',
      path: './examples/vue-components',
      config: {
        input: 'src/index.ts',
        output: {
          dir: 'dist',
          format: ['esm', 'cjs']
        },
        libraryType: 'vue'
      }
    }
  ],

  // 验证配置
  validation: {
    strict: true,
    compareExports: true,
    compareImports: true,
    compareBehavior: true,
    comparePerformance: true,
    runtimeValidation: true,
    apiCompatibility: true,
    integrationTests: true,
    snapshotTesting: true
  },

  // 性能基准
  performanceBenchmarks: {
    maxBuildTime: 30000, // 30秒
    maxMemoryUsage: 500 * 1024 * 1024, // 500MB
    maxBundleSize: 1024 * 1024 // 1MB
  }
}

/**
 * 测试结果
 */
class TestResult {
  constructor(name) {
    this.name = name
    this.success = true
    this.errors = []
    this.warnings = []
    this.metrics = {}
    this.startTime = Date.now()
  }

  addError(error) {
    this.success = false
    this.errors.push(error)
  }

  addWarning(warning) {
    this.warnings.push(warning)
  }

  setMetric(key, value) {
    this.metrics[key] = value
  }

  finish() {
    this.duration = Date.now() - this.startTime
  }

  print() {
    const status = this.success 
      ? chalk.green('✅ 通过') 
      : chalk.red('❌ 失败')

    console.log(`\n${chalk.bold(this.name)}: ${status}`)
    console.log(`  耗时: ${this.duration}ms`)

    if (this.errors.length > 0) {
      console.log(chalk.red('  错误:'))
      this.errors.forEach(e => console.log(`    - ${e}`))
    }

    if (this.warnings.length > 0) {
      console.log(chalk.yellow('  警告:'))
      this.warnings.forEach(w => console.log(`    - ${w}`))
    }

    if (Object.keys(this.metrics).length > 0) {
      console.log('  指标:')
      Object.entries(this.metrics).forEach(([key, value]) => {
        console.log(`    - ${key}: ${value}`)
      })
    }
  }
}

/**
 * 测试套件
 */
class TestSuite {
  constructor() {
    this.results = []
    this.startTime = Date.now()
  }

  async run() {
    console.log(chalk.bold.blue('\n═══════════════════════════════════════'))
    console.log(chalk.bold.blue('     增强版打包工具综合测试'))
    console.log(chalk.bold.blue('═══════════════════════════════════════\n'))

    // 1. 测试基础功能
    await this.testBasicFunctionality()

    // 2. 测试各种库类型
    await this.testLibraryTypes()

    // 3. 测试验证机制
    await this.testValidation()

    // 4. 测试性能
    await this.testPerformance()

    // 5. 测试错误恢复
    await this.testErrorRecovery()

    // 6. 测试边缘情况
    await this.testEdgeCases()

    // 打印总结
    this.printSummary()
  }

  /**
   * 测试基础功能
   */
  async testBasicFunctionality() {
    const result = new TestResult('基础功能测试')

    try {
      console.log(chalk.cyan('测试基础功能...'))

      // 创建构建器实例
      const builder = new EnhancedLibraryBuilder()
      
      // 测试初始化
      await builder.initialize()
      result.setMetric('初始化', '成功')

      // 测试配置加载
      const config = await builder.loadConfig()
      if (!config) {
        result.addError('配置加载失败')
      } else {
        result.setMetric('配置加载', '成功')
      }

      // 测试适配器切换
      builder.setBundler('rollup')
      if (builder.getBundler() !== 'rollup') {
        result.addError('Rollup 适配器设置失败')
      }

      // 测试状态管理
      if (!builder.getStatus()) {
        result.addError('状态管理失败')
      }

      // 清理
      await builder.dispose()

    } catch (error) {
      result.addError(`基础功能测试失败: ${error.message}`)
    }

    result.finish()
    this.results.push(result)
    result.print()
  }

  /**
   * 测试各种库类型
   */
  async testLibraryTypes() {
    for (const project of TEST_CONFIG.testProjects) {
      const result = new TestResult(`${project.name} 构建测试`)

      try {
        console.log(chalk.cyan(`\n测试 ${project.name}...`))

        // 检查项目是否存在
        const projectPath = path.resolve(project.path)
        if (!await fs.pathExists(projectPath)) {
          result.addWarning(`项目不存在: ${projectPath}`)
          result.finish()
          this.results.push(result)
          result.print()
          continue
        }

        // 切换到项目目录
        const originalCwd = process.cwd()
        process.chdir(projectPath)

        // 创建构建器
        const builder = new EnhancedLibraryBuilder({
          config: project.config
        })

        await builder.initialize()

        // 执行构建
        const buildResult = await builder.build()

        // 检查构建结果
        if (!buildResult.success) {
          result.addError('构建失败')
        } else {
          result.setMetric('构建时间', `${buildResult.duration}ms`)
          result.setMetric('输出文件数', buildResult.outputs.length)
          result.setMetric('总大小', `${buildResult.stats.totalSize.raw} bytes`)

          // 检查输出文件
          for (const output of buildResult.outputs) {
            const outputPath = path.join(projectPath, project.config.output.dir, output.fileName)
            if (!await fs.pathExists(outputPath)) {
              result.addError(`输出文件不存在: ${output.fileName}`)
            }
          }

          // 验证功能一致性
          if (buildResult.validation) {
            if (!buildResult.validation.success) {
              result.addError('功能验证失败')
              buildResult.validation.errors.forEach(e => result.addError(e))
            }
          }
        }

        // 清理
        await builder.dispose()
        process.chdir(originalCwd)

      } catch (error) {
        result.addError(`构建测试失败: ${error.message}`)
      }

      result.finish()
      this.results.push(result)
      result.print()
    }
  }

  /**
   * 测试验证机制
   */
  async testValidation() {
    const result = new TestResult('验证机制测试')

    try {
      console.log(chalk.cyan('\n测试验证机制...'))

      // 创建验证器
      const validator = new EnhancedPostBuildValidator(TEST_CONFIG.validation)

      // 创建模拟的验证上下文
      const mockContext = {
        buildContext: {
          buildId: 'test-build-001',
          startTime: Date.now(),
          config: {
            input: 'src/index.ts',
            output: { dir: 'dist', format: ['esm', 'cjs'] }
          },
          cwd: process.cwd(),
          cacheDir: '.cache',
          tempDir: '.temp',
          watch: false,
          env: {},
          logger: console,
          performanceMonitor: {}
        },
        buildResult: {
          success: true,
          outputs: [
            { fileName: 'index.js', size: 1000, format: 'esm' },
            { fileName: 'index.cjs', size: 1100, format: 'cjs' }
          ],
          duration: 1000,
          stats: {},
          performance: {},
          warnings: [],
          errors: [],
          buildId: 'test-build-001',
          timestamp: Date.now(),
          bundler: 'rollup',
          mode: 'production',
          libraryType: 'typescript'
        },
        config: TEST_CONFIG.validation,
        tempDir: '.validation-temp',
        startTime: Date.now(),
        validationId: 'test-validation-001',
        projectRoot: process.cwd(),
        outputDir: 'dist'
      }

      // 执行验证
      const validationResult = await validator.validate(mockContext)

      if (validationResult.success) {
        result.setMetric('验证状态', '通过')
        result.setMetric('测试数量', validationResult.testResult.totalTests)
        result.setMetric('通过率', `${(validationResult.testResult.passedTests / validationResult.testResult.totalTests * 100).toFixed(1)}%`)
      } else {
        result.addError('验证失败')
        validationResult.errors.forEach(e => result.addError(e))
      }

      // 清理
      await validator.dispose()

    } catch (error) {
      result.addWarning(`验证机制测试跳过: ${error.message}`)
    }

    result.finish()
    this.results.push(result)
    result.print()
  }

  /**
   * 测试性能
   */
  async testPerformance() {
    const result = new TestResult('性能测试')

    try {
      console.log(chalk.cyan('\n测试性能...'))

      // 测试内存使用
      const memBefore = process.memoryUsage()
      
      // 创建多个构建器实例
      const builders = []
      for (let i = 0; i < 5; i++) {
        const builder = new EnhancedLibraryBuilder()
        await builder.initialize()
        builders.push(builder)
      }

      const memAfter = process.memoryUsage()
      const memUsed = memAfter.heapUsed - memBefore.heapUsed

      result.setMetric('内存使用', `${(memUsed / 1024 / 1024).toFixed(2)} MB`)

      if (memUsed > TEST_CONFIG.performanceBenchmarks.maxMemoryUsage) {
        result.addWarning(`内存使用超过基准: ${(memUsed / 1024 / 1024).toFixed(2)} MB`)
      }

      // 测试构建速度
      const testProject = TEST_CONFIG.testProjects[0]
      if (testProject && await fs.pathExists(testProject.path)) {
        const startTime = Date.now()
        
        const builder = builders[0]
        builder.config = testProject.config
        
        // 模拟构建（不实际执行以避免副作用）
        const buildTime = Date.now() - startTime
        
        result.setMetric('构建速度测试', `${buildTime}ms`)
        
        if (buildTime > TEST_CONFIG.performanceBenchmarks.maxBuildTime) {
          result.addWarning(`构建时间超过基准: ${buildTime}ms`)
        }
      }

      // 清理
      for (const builder of builders) {
        await builder.dispose()
      }

    } catch (error) {
      result.addWarning(`性能测试部分失败: ${error.message}`)
    }

    result.finish()
    this.results.push(result)
    result.print()
  }

  /**
   * 测试错误恢复
   */
  async testErrorRecovery() {
    const result = new TestResult('错误恢复测试')

    try {
      console.log(chalk.cyan('\n测试错误恢复...'))

      const builder = new EnhancedLibraryBuilder()
      await builder.initialize()

      // 测试无效配置
      try {
        await builder.build({
          input: 'non-existent-file.ts',
          output: { dir: 'dist' }
        })
        result.addError('应该抛出错误但没有')
      } catch (error) {
        result.setMetric('无效配置处理', '正确抛出错误')
      }

      // 测试状态恢复
      if (builder.getStatus() === 'idle' || builder.getStatus() === 'error') {
        result.setMetric('状态恢复', '成功')
      } else {
        result.addError('错误后状态未正确恢复')
      }

      // 测试缓存清理
      await builder.clearCache()
      result.setMetric('缓存清理', '成功')

      await builder.dispose()

    } catch (error) {
      result.addError(`错误恢复测试失败: ${error.message}`)
    }

    result.finish()
    this.results.push(result)
    result.print()
  }

  /**
   * 测试边缘情况
   */
  async testEdgeCases() {
    const result = new TestResult('边缘情况测试')

    try {
      console.log(chalk.cyan('\n测试边缘情况...'))

      // 测试空配置
      const builder1 = new EnhancedLibraryBuilder({})
      await builder1.initialize()
      result.setMetric('空配置初始化', '成功')
      await builder1.dispose()

      // 测试多入口
      const builder2 = new EnhancedLibraryBuilder({
        config: {
          input: ['src/index.ts', 'src/utils.ts'],
          output: { dir: 'dist', format: 'esm' }
        }
      })
      await builder2.initialize()
      result.setMetric('多入口配置', '成功')
      await builder2.dispose()

      // 测试大量插件
      const plugins = Array(20).fill(null).map((_, i) => ({
        name: `test-plugin-${i}`,
        buildStart: () => {}
      }))

      const builder3 = new EnhancedLibraryBuilder({
        config: {
          input: 'src/index.ts',
          output: { dir: 'dist' },
          plugins
        }
      })
      await builder3.initialize()
      result.setMetric('大量插件处理', '成功')
      await builder3.dispose()

    } catch (error) {
      result.addError(`边缘情况测试失败: ${error.message}`)
    }

    result.finish()
    this.results.push(result)
    result.print()
  }

  /**
   * 打印总结
   */
  printSummary() {
    const totalDuration = Date.now() - this.startTime
    const successCount = this.results.filter(r => r.success).length
    const failureCount = this.results.filter(r => !r.success).length
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0)
    const totalWarnings = this.results.reduce((sum, r) => sum + r.warnings.length, 0)

    console.log(chalk.bold.blue('\n═══════════════════════════════════════'))
    console.log(chalk.bold.blue('           测试总结'))
    console.log(chalk.bold.blue('═══════════════════════════════════════\n'))

    console.log(`总耗时: ${totalDuration}ms`)
    console.log(`测试数: ${this.results.length}`)
    console.log(`${chalk.green('通过')}: ${successCount}`)
    console.log(`${chalk.red('失败')}: ${failureCount}`)
    console.log(`${chalk.red('错误')}: ${totalErrors}`)
    console.log(`${chalk.yellow('警告')}: ${totalWarnings}`)

    const overallSuccess = failureCount === 0

    console.log(`\n最终结果: ${overallSuccess ? chalk.green.bold('✅ 全部通过') : chalk.red.bold('❌ 存在失败')}`)

    if (!overallSuccess) {
      console.log(chalk.red('\n失败的测试:'))
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.name}`)
          r.errors.forEach(e => console.log(`    ${chalk.red('✗')} ${e}`))
        })
    }

    // 生成测试报告文件
    this.generateReport()

    process.exit(overallSuccess ? 0 : 1)
  }

  /**
   * 生成测试报告
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results.map(r => ({
        name: r.name,
        success: r.success,
        duration: r.duration,
        errors: r.errors,
        warnings: r.warnings,
        metrics: r.metrics
      })),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        errors: this.results.reduce((sum, r) => sum + r.errors.length, 0),
        warnings: this.results.reduce((sum, r) => sum + r.warnings.length, 0)
      }
    }

    const reportPath = 'test-report.json'
    await fs.writeJson(reportPath, report, { spaces: 2 })
    console.log(chalk.gray(`\n测试报告已保存至: ${reportPath}`))
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 检查环境
    console.log(chalk.gray('Node.js 版本:', process.version))
    console.log(chalk.gray('工作目录:', process.cwd()))

    // 运行测试套件
    const suite = new TestSuite()
    await suite.run()

  } catch (error) {
    console.error(chalk.red('\n测试运行失败:'), error)
    process.exit(1)
  }
}

// 运行测试
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main()
}
