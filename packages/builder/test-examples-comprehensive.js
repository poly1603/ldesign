/**
 * 示例项目全面构建测试
 * 
 * 对 8 个示例项目分别使用 Rollup 和 Rolldown 进行构建测试
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { performance } from 'perf_hooks'

// 测试项目列表
const TEST_PROJECTS = [
  'basic-typescript',
  'complex-library',
  'mixed-library',
  'multi-module-typescript',
  'react-components',
  'style-library',
  'typescript-utils',
  'vue3-components'
]

// 打包工具配置
const BUNDLERS = [
  { name: 'rollup', command: 'pnpm run build', configModification: { bundler: 'rollup' } },
  { name: 'rolldown', command: 'pnpm run build', configModification: { bundler: 'rolldown' } }
]

class ExampleProjectTester {
  constructor() {
    this.results = {
      summary: {
        totalProjects: TEST_PROJECTS.length,
        totalTests: TEST_PROJECTS.length * BUNDLERS.length,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      projects: {},
      comparison: {},
      recommendations: []
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始示例项目全面构建测试')
    console.log(`📋 测试项目: ${TEST_PROJECTS.length} 个`)
    console.log(`🔧 打包工具: ${BUNDLERS.length} 个`)
    console.log(`📊 总测试数: ${this.results.summary.totalTests} 个`)
    console.log('=' .repeat(60))

    for (const projectName of TEST_PROJECTS) {
      console.log(`\n📦 测试项目: ${projectName}`)
      console.log('-' .repeat(40))
      
      const projectPath = path.join('examples', projectName)
      
      // 检查项目是否存在
      if (!fs.existsSync(projectPath)) {
        console.error(`❌ 项目不存在: ${projectPath}`)
        continue
      }

      this.results.projects[projectName] = {
        path: projectPath,
        bundlers: {},
        comparison: {},
        issues: []
      }

      // 分析项目配置
      await this.analyzeProject(projectName, projectPath)

      // 测试每个打包工具
      for (const bundler of BUNDLERS) {
        console.log(`\n  🔧 测试 ${bundler.name.toUpperCase()}...`)
        await this.testProjectWithBundler(projectName, projectPath, bundler)
      }

      // 对比分析
      this.compareProjectResults(projectName)
    }

    // 生成总结报告
    this.generateSummaryReport()
    this.generateDetailedReport()
    
    console.log('\n🎉 所有测试完成!')
    this.printSummary()
  }

  /**
   * 分析项目配置
   */
  async analyzeProject(projectName, projectPath) {
    const project = this.results.projects[projectName]
    
    try {
      // 读取 package.json
      const packageJsonPath = path.join(projectPath, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        project.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      }

      // 读取 ldesign.config.ts
      const configPath = path.join(projectPath, 'ldesign.config.ts')
      if (fs.existsSync(configPath)) {
        project.hasConfig = true
        project.configContent = fs.readFileSync(configPath, 'utf-8')
      }

      // 读取 tsconfig.json
      const tsconfigPath = path.join(projectPath, 'tsconfig.json')
      if (fs.existsSync(tsconfigPath)) {
        project.tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
      }

      // 分析项目类型
      project.type = this.detectProjectType(projectName, project)
      
      console.log(`    📋 项目类型: ${project.type}`)
      console.log(`    📄 配置文件: ${project.hasConfig ? '✅' : '❌'}`)
      
    } catch (error) {
      project.issues.push(`配置分析失败: ${error.message}`)
      console.error(`    ❌ 配置分析失败: ${error.message}`)
    }
  }

  /**
   * 检测项目类型
   */
  detectProjectType(projectName, project) {
    if (projectName.includes('react')) return 'React Components'
    if (projectName.includes('vue')) return 'Vue3 Components'
    if (projectName.includes('style')) return 'Style Library'
    if (projectName.includes('multi-module')) return 'Multi-Module'
    if (projectName.includes('complex')) return 'Complex Library'
    if (projectName.includes('mixed')) return 'Mixed Library'
    if (projectName.includes('utils')) return 'TypeScript Utils'
    if (projectName.includes('basic')) return 'Basic TypeScript'
    return 'Unknown'
  }

  /**
   * 使用指定打包工具测试项目
   */
  async testProjectWithBundler(projectName, projectPath, bundler) {
    const project = this.results.projects[projectName]
    const bundlerResult = {
      name: bundler.name,
      success: false,
      buildTime: 0,
      errors: [],
      warnings: [],
      outputs: [],
      fileStats: {},
      quality: {}
    }

    project.bundlers[bundler.name] = bundlerResult

    try {
      // 清理之前的构建产物
      await this.cleanProject(projectPath)

      // 修改配置文件以使用指定的打包工具
      await this.modifyConfigForBundler(projectPath, bundler)

      // 执行构建
      const startTime = performance.now()

      console.log(`    🔨 执行构建命令: ${bundler.command} (使用 ${bundler.name})`)

      const output = execSync(bundler.command, {
        cwd: projectPath,
        encoding: 'utf-8',
        stdio: 'pipe'
      })

      const endTime = performance.now()
      bundlerResult.buildTime = Math.round(endTime - startTime)
      bundlerResult.buildOutput = output

      console.log(`    ✅ 构建成功 (${bundlerResult.buildTime}ms)`)

      // 分析构建产物
      await this.analyzeOutputs(projectPath, bundlerResult)

      // 验证产物质量
      await this.validateOutputQuality(projectPath, bundlerResult)

      bundlerResult.success = true
      this.results.summary.passed++

    } catch (error) {
      bundlerResult.success = false
      bundlerResult.error = error.message
      bundlerResult.buildOutput = error.stdout || error.stderr || error.message

      console.error(`    ❌ 构建失败: ${error.message}`)

      // 解析错误和警告
      this.parseErrorsAndWarnings(bundlerResult.buildOutput, bundlerResult)

      this.results.summary.failed++
      project.issues.push(`${bundler.name} 构建失败: ${error.message}`)
    } finally {
      // 恢复原始配置文件
      await this.restoreOriginalConfig(projectPath)
    }
  }

  /**
   * 清理项目构建产物
   */
  async cleanProject(projectPath) {
    const dirsToClean = ['dist', 'es', 'lib']

    for (const dir of dirsToClean) {
      const dirPath = path.join(projectPath, dir)
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  }

  /**
   * 修改配置文件以使用指定的打包工具
   */
  async modifyConfigForBundler(projectPath, bundler) {
    const configPath = path.join(projectPath, 'ldesign.config.ts')
    const backupPath = path.join(projectPath, 'ldesign.config.ts.backup')

    if (fs.existsSync(configPath)) {
      // 备份原始配置
      fs.copyFileSync(configPath, backupPath)

      // 读取配置内容
      let configContent = fs.readFileSync(configPath, 'utf-8')

      // 修改 bundler 配置
      if (configContent.includes('bundler:')) {
        configContent = configContent.replace(/bundler:\s*['"`][^'"`]*['"`]/, `bundler: '${bundler.name}'`)
      } else {
        // 如果没有 bundler 配置，添加一个
        configContent = configContent.replace(
          /export default defineConfig\(\{/,
          `export default defineConfig({\n  bundler: '${bundler.name}',`
        )
      }

      // 写回修改后的配置
      fs.writeFileSync(configPath, configContent)
    }
  }

  /**
   * 恢复原始配置文件
   */
  async restoreOriginalConfig(projectPath) {
    const configPath = path.join(projectPath, 'ldesign.config.ts')
    const backupPath = path.join(projectPath, 'ldesign.config.ts.backup')

    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, configPath)
      fs.unlinkSync(backupPath)
    }
  }

  /**
   * 分析构建产物
   */
  async analyzeOutputs(projectPath, bundlerResult) {
    const outputDirs = ['dist', 'es', 'lib']
    
    for (const dir of outputDirs) {
      const dirPath = path.join(projectPath, dir)
      if (fs.existsSync(dirPath)) {
        const files = this.scanDirectory(dirPath)
        bundlerResult.outputs.push({
          directory: dir,
          files: files.map(file => ({
            path: file,
            size: fs.statSync(path.join(dirPath, file)).size,
            type: this.getFileType(file)
          }))
        })
      }
    }

    // 计算总文件数和大小
    let totalFiles = 0
    let totalSize = 0
    
    bundlerResult.outputs.forEach(output => {
      totalFiles += output.files.length
      totalSize += output.files.reduce((sum, file) => sum + file.size, 0)
    })

    bundlerResult.fileStats = {
      totalFiles,
      totalSize,
      formattedSize: this.formatBytes(totalSize)
    }

    console.log(`    📁 生成文件: ${totalFiles} 个`)
    console.log(`    📊 总大小: ${bundlerResult.fileStats.formattedSize}`)
  }

  /**
   * 验证产物质量
   */
  async validateOutputQuality(projectPath, bundlerResult) {
    const quality = {
      hasESM: false,
      hasCJS: false,
      hasUMD: false,
      hasTypes: false,
      hasSourceMaps: false,
      hasCSS: false,
      functionalityScore: 0,
      issues: []
    }

    // 检查不同格式的文件
    bundlerResult.outputs.forEach(output => {
      output.files.forEach(file => {
        if (file.path.endsWith('.js') && !file.path.includes('.cjs') && !file.path.includes('.umd')) {
          quality.hasESM = true
        }
        if (file.path.endsWith('.cjs')) {
          quality.hasCJS = true
        }
        if (file.path.includes('.umd.')) {
          quality.hasUMD = true
        }
        if (file.path.endsWith('.d.ts')) {
          quality.hasTypes = true
        }
        if (file.path.endsWith('.map')) {
          quality.hasSourceMaps = true
        }
        if (file.path.endsWith('.css')) {
          quality.hasCSS = true
        }
      })
    })

    // 计算功能性评分
    let score = 0
    if (quality.hasESM) score += 20
    if (quality.hasCJS) score += 20
    if (quality.hasTypes) score += 25
    if (quality.hasSourceMaps) score += 20
    if (bundlerResult.outputs.length > 0) score += 15

    quality.functionalityScore = score

    // 验证文件内容
    await this.validateFileContents(projectPath, bundlerResult, quality)

    bundlerResult.quality = quality

    console.log(`    🎯 质量评分: ${quality.functionalityScore}/100`)
    console.log(`    📋 格式支持: ESM:${quality.hasESM ? '✅' : '❌'} CJS:${quality.hasCJS ? '✅' : '❌'} Types:${quality.hasTypes ? '✅' : '❌'}`)
  }

  /**
   * 验证文件内容
   */
  async validateFileContents(projectPath, bundlerResult, quality) {
    try {
      // 查找主要的 JS 文件
      const mainJSFiles = []
      bundlerResult.outputs.forEach(output => {
        output.files.forEach(file => {
          if ((file.path.endsWith('.js') || file.path.endsWith('.cjs')) && 
              (file.path.includes('index') || file.path.includes('main'))) {
            mainJSFiles.push(path.join(projectPath, output.directory, file.path))
          }
        })
      })

      // 检查主要文件的内容
      for (const filePath of mainJSFiles) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8')
          
          // 检查是否有导出
          if (content.includes('export') || content.includes('module.exports')) {
            quality.functionalityScore += 5
          } else {
            quality.issues.push(`${path.basename(filePath)} 缺少导出语句`)
          }

          // 检查是否有明显的构建错误
          if (content.includes('undefined') && content.includes('Cannot resolve')) {
            quality.issues.push(`${path.basename(filePath)} 可能存在未解析的依赖`)
            quality.functionalityScore -= 10
          }
        }
      }

      // 尝试动态导入验证（仅对 ESM 文件）
      const esmFiles = mainJSFiles.filter(f => f.endsWith('.js') && !f.includes('.cjs'))
      for (const esmFile of esmFiles) {
        try {
          const module = await import(`file://${path.resolve(esmFile)}`)
          if (module && typeof module === 'object' && Object.keys(module).length > 0) {
            quality.functionalityScore += 10
            console.log(`    ✅ ESM 模块可正常导入`)
          }
        } catch (error) {
          quality.issues.push(`ESM 模块导入失败: ${error.message}`)
          console.log(`    ⚠️ ESM 模块导入测试失败`)
        }
      }

    } catch (error) {
      quality.issues.push(`文件内容验证失败: ${error.message}`)
    }
  }

  /**
   * 对比项目结果
   */
  compareProjectResults(projectName) {
    const project = this.results.projects[projectName]
    const rollupResult = project.bundlers.rollup
    const rolldownResult = project.bundlers.rolldown

    if (!rollupResult || !rolldownResult) {
      return
    }

    const comparison = {
      buildTime: {
        rollup: rollupResult.buildTime,
        rolldown: rolldownResult.buildTime,
        winner: rollupResult.buildTime < rolldownResult.buildTime ? 'rollup' : 'rolldown',
        difference: Math.abs(rollupResult.buildTime - rolldownResult.buildTime),
        percentageDiff: Math.round(Math.abs(rollupResult.buildTime - rolldownResult.buildTime) / Math.max(rollupResult.buildTime, rolldownResult.buildTime) * 100)
      },
      fileSize: {
        rollup: rollupResult.fileStats.totalSize,
        rolldown: rolldownResult.fileStats.totalSize,
        winner: rollupResult.fileStats.totalSize < rolldownResult.fileStats.totalSize ? 'rollup' : 'rolldown',
        difference: Math.abs(rollupResult.fileStats.totalSize - rolldownResult.fileStats.totalSize),
        percentageDiff: Math.round(Math.abs(rollupResult.fileStats.totalSize - rolldownResult.fileStats.totalSize) / Math.max(rollupResult.fileStats.totalSize, rolldownResult.fileStats.totalSize) * 100)
      },
      quality: {
        rollup: rollupResult.quality.functionalityScore,
        rolldown: rolldownResult.quality.functionalityScore,
        winner: rollupResult.quality.functionalityScore > rolldownResult.quality.functionalityScore ? 'rollup' : 'rolldown'
      },
      success: {
        rollup: rollupResult.success,
        rolldown: rolldownResult.success,
        both: rollupResult.success && rolldownResult.success
      }
    }

    project.comparison = comparison

    console.log(`\n  📊 对比结果:`)
    console.log(`    ⏱️  构建时间: Rollup ${rollupResult.buildTime}ms vs Rolldown ${rolldownResult.buildTime}ms (${comparison.buildTime.winner} 获胜)`)
    console.log(`    📦 文件大小: Rollup ${this.formatBytes(rollupResult.fileStats.totalSize)} vs Rolldown ${this.formatBytes(rolldownResult.fileStats.totalSize)} (${comparison.fileSize.winner} 获胜)`)
    console.log(`    🎯 质量评分: Rollup ${rollupResult.quality.functionalityScore}/100 vs Rolldown ${rolldownResult.quality.functionalityScore}/100 (${comparison.quality.winner} 获胜)`)
    console.log(`    ✅ 构建成功: ${comparison.success.both ? '两者都成功' : '存在失败'}`)
  }

  /**
   * 解析错误和警告
   */
  parseErrorsAndWarnings(output, bundlerResult) {
    const lines = output.split('\n')
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('error')) {
        bundlerResult.errors.push(line.trim())
      } else if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('warn')) {
        bundlerResult.warnings.push(line.trim())
        this.results.summary.warnings++
      }
    })
  }

  /**
   * 扫描目录
   */
  scanDirectory(dirPath, relativePath = '') {
    const files = []
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        const relPath = path.join(relativePath, entry.name)
        
        if (entry.isDirectory()) {
          files.push(...this.scanDirectory(fullPath, relPath))
        } else {
          files.push(relPath)
        }
      }
    } catch (error) {
      // 忽略扫描错误
    }
    
    return files
  }

  /**
   * 获取文件类型
   */
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase()
    if (['.js', '.mjs'].includes(ext)) return 'javascript'
    if (ext === '.cjs') return 'commonjs'
    if (ext === '.ts') return 'typescript'
    if (ext === '.d.ts') return 'declaration'
    if (ext === '.map') return 'sourcemap'
    if (['.css', '.scss', '.sass', '.less'].includes(ext)) return 'stylesheet'
    if (['.json'].includes(ext)) return 'json'
    return 'other'
  }

  /**
   * 格式化字节大小
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 生成总结报告
   */
  generateSummaryReport() {
    // 计算总体统计
    let totalBuildTime = { rollup: 0, rolldown: 0 }
    let totalFileSize = { rollup: 0, rolldown: 0 }
    let successCount = { rollup: 0, rolldown: 0 }
    let qualityScores = { rollup: [], rolldown: [] }

    Object.values(this.results.projects).forEach(project => {
      if (project.bundlers.rollup) {
        totalBuildTime.rollup += project.bundlers.rollup.buildTime
        totalFileSize.rollup += project.bundlers.rollup.fileStats.totalSize
        if (project.bundlers.rollup.success) successCount.rollup++
        qualityScores.rollup.push(project.bundlers.rollup.quality.functionalityScore)
      }
      
      if (project.bundlers.rolldown) {
        totalBuildTime.rolldown += project.bundlers.rolldown.buildTime
        totalFileSize.rolldown += project.bundlers.rolldown.fileStats.totalSize
        if (project.bundlers.rolldown.success) successCount.rolldown++
        qualityScores.rolldown.push(project.bundlers.rolldown.quality.functionalityScore)
      }
    })

    this.results.comparison = {
      buildTime: totalBuildTime,
      fileSize: totalFileSize,
      successRate: {
        rollup: (successCount.rollup / TEST_PROJECTS.length * 100).toFixed(1),
        rolldown: (successCount.rolldown / TEST_PROJECTS.length * 100).toFixed(1)
      },
      averageQuality: {
        rollup: qualityScores.rollup.length > 0 ? Math.round(qualityScores.rollup.reduce((a, b) => a + b, 0) / qualityScores.rollup.length) : 0,
        rolldown: qualityScores.rolldown.length > 0 ? Math.round(qualityScores.rolldown.reduce((a, b) => a + b, 0) / qualityScores.rolldown.length) : 0
      }
    }
  }

  /**
   * 生成详细报告
   */
  generateDetailedReport() {
    const reportLines = [
      '# 示例项目构建测试报告',
      '',
      `**测试时间**: ${new Date().toISOString()}`,
      `**测试项目数**: ${TEST_PROJECTS.length}`,
      `**总测试数**: ${this.results.summary.totalTests}`,
      '',
      '## 📊 总体统计',
      '',
      `- **通过测试**: ${this.results.summary.passed}/${this.results.summary.totalTests}`,
      `- **失败测试**: ${this.results.summary.failed}/${this.results.summary.totalTests}`,
      `- **警告数量**: ${this.results.summary.warnings}`,
      '',
      '## 🏆 打包工具对比',
      '',
      '| 指标 | Rollup | Rolldown | 获胜者 |',
      '|------|--------|----------|--------|',
      `| 总构建时间 | ${this.results.comparison.buildTime.rollup}ms | ${this.results.comparison.buildTime.rolldown}ms | ${this.results.comparison.buildTime.rollup < this.results.comparison.buildTime.rolldown ? 'Rollup' : 'Rolldown'} |`,
      `| 总文件大小 | ${this.formatBytes(this.results.comparison.fileSize.rollup)} | ${this.formatBytes(this.results.comparison.fileSize.rolldown)} | ${this.results.comparison.fileSize.rollup < this.results.comparison.fileSize.rolldown ? 'Rollup' : 'Rolldown'} |`,
      `| 成功率 | ${this.results.comparison.successRate.rollup}% | ${this.results.comparison.successRate.rolldown}% | ${parseFloat(this.results.comparison.successRate.rollup) > parseFloat(this.results.comparison.successRate.rolldown) ? 'Rollup' : 'Rolldown'} |`,
      `| 平均质量评分 | ${this.results.comparison.averageQuality.rollup}/100 | ${this.results.comparison.averageQuality.rolldown}/100 | ${this.results.comparison.averageQuality.rollup > this.results.comparison.averageQuality.rolldown ? 'Rollup' : 'Rolldown'} |`,
      '',
      '## 📋 项目详细结果',
      ''
    ]

    // 添加每个项目的详细结果
    Object.entries(this.results.projects).forEach(([projectName, project]) => {
      reportLines.push(`### ${projectName}`)
      reportLines.push('')
      reportLines.push(`**项目类型**: ${project.type}`)
      reportLines.push(`**配置文件**: ${project.hasConfig ? '✅' : '❌'}`)
      reportLines.push('')

      if (project.bundlers.rollup && project.bundlers.rolldown) {
        reportLines.push('| 指标 | Rollup | Rolldown |')
        reportLines.push('|------|--------|----------|')
        reportLines.push(`| 构建状态 | ${project.bundlers.rollup.success ? '✅' : '❌'} | ${project.bundlers.rolldown.success ? '✅' : '❌'} |`)
        reportLines.push(`| 构建时间 | ${project.bundlers.rollup.buildTime}ms | ${project.bundlers.rolldown.buildTime}ms |`)
        reportLines.push(`| 文件数量 | ${project.bundlers.rollup.fileStats.totalFiles} | ${project.bundlers.rolldown.fileStats.totalFiles} |`)
        reportLines.push(`| 文件大小 | ${project.bundlers.rollup.fileStats.formattedSize} | ${project.bundlers.rolldown.fileStats.formattedSize} |`)
        reportLines.push(`| 质量评分 | ${project.bundlers.rollup.quality.functionalityScore}/100 | ${project.bundlers.rolldown.quality.functionalityScore}/100 |`)
      }

      if (project.issues.length > 0) {
        reportLines.push('')
        reportLines.push('**问题列表**:')
        project.issues.forEach(issue => {
          reportLines.push(`- ${issue}`)
        })
      }

      reportLines.push('')
    })

    // 保存报告
    fs.writeFileSync('examples-build-test-report.md', reportLines.join('\n'))
    
    // 保存 JSON 数据
    fs.writeFileSync('examples-build-test-results.json', JSON.stringify(this.results, null, 2))
  }

  /**
   * 打印总结
   */
  printSummary() {
    console.log('\n📊 测试总结')
    console.log('=' .repeat(60))
    console.log(`✅ 通过: ${this.results.summary.passed}/${this.results.summary.totalTests}`)
    console.log(`❌ 失败: ${this.results.summary.failed}/${this.results.summary.totalTests}`)
    console.log(`⚠️  警告: ${this.results.summary.warnings}`)
    console.log('')
    console.log('🏆 打包工具对比:')
    console.log(`  Rollup   - 成功率: ${this.results.comparison.successRate.rollup}%, 平均质量: ${this.results.comparison.averageQuality.rollup}/100`)
    console.log(`  Rolldown - 成功率: ${this.results.comparison.successRate.rolldown}%, 平均质量: ${this.results.comparison.averageQuality.rolldown}/100`)
    console.log('')
    console.log('📄 详细报告已保存到:')
    console.log('  - examples-build-test-report.md')
    console.log('  - examples-build-test-results.json')
  }
}

// 运行测试
const tester = new ExampleProjectTester()
tester.runAllTests().catch(console.error)
