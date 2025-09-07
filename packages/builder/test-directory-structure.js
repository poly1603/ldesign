/**
 * 验证示例项目的标准目录结构
 * 
 * 确保所有项目都能生成：
 * - es/ 目录 - ESM 格式
 * - lib/ 目录 - CJS 格式  
 * - dist/ 目录 - UMD 格式
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

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

// 期望的目录结构
const EXPECTED_DIRECTORIES = {
  es: {
    name: 'es',
    description: 'ESM 格式文件',
    required: true,
    expectedFiles: ['index.js', 'index.js.map']
  },
  lib: {
    name: 'lib', 
    description: 'CJS 格式文件',
    required: true,
    expectedFiles: ['index.cjs', 'index.cjs.map']
  },
  dist: {
    name: 'dist',
    description: 'UMD 格式文件',
    required: false, // 某些项目可能不支持 UMD
    expectedFiles: ['index.umd.js', 'index.umd.js.map']
  }
}

class DirectoryStructureValidator {
  constructor() {
    this.results = {
      summary: {
        totalProjects: TEST_PROJECTS.length,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      projects: {},
      recommendations: []
    }
  }

  /**
   * 运行所有验证
   */
  async runAllValidations() {
    console.log('🏗️  开始验证示例项目目录结构')
    console.log(`📋 测试项目: ${TEST_PROJECTS.length} 个`)
    console.log('=' .repeat(60))

    for (const projectName of TEST_PROJECTS) {
      console.log(`\n📦 验证项目: ${projectName}`)
      console.log('-' .repeat(40))
      
      const projectPath = path.join('examples', projectName)
      
      if (!fs.existsSync(projectPath)) {
        console.error(`❌ 项目不存在: ${projectPath}`)
        continue
      }

      this.results.projects[projectName] = {
        path: projectPath,
        directories: {},
        packageJson: {},
        issues: [],
        score: 0
      }

      // 验证 package.json 配置
      await this.validatePackageJson(projectName, projectPath)

      // 构建项目
      await this.buildProject(projectName, projectPath)

      // 验证目录结构
      await this.validateDirectoryStructure(projectName, projectPath)

      // 计算评分
      this.calculateScore(projectName)
    }

    // 生成报告
    this.generateReport()
    this.printSummary()
  }

  /**
   * 验证 package.json 配置
   */
  async validatePackageJson(projectName, projectPath) {
    const project = this.results.projects[projectName]
    
    try {
      const packageJsonPath = path.join(projectPath, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
        project.packageJson = packageJson

        // 检查入口字段
        const checks = [
          { field: 'main', expected: 'lib/index.cjs', description: 'CJS 入口' },
          { field: 'module', expected: 'es/index.js', description: 'ESM 入口' },
          { field: 'types', expected: 'es/index.d.ts', description: '类型声明' },
          { field: 'unpkg', expected: 'dist/index.umd.js', description: 'UMD 入口' }
        ]

        for (const check of checks) {
          if (packageJson[check.field]) {
            if (packageJson[check.field] === check.expected) {
              console.log(`    ✅ ${check.description}: ${packageJson[check.field]}`)
            } else {
              console.log(`    ⚠️  ${check.description}: ${packageJson[check.field]} (期望: ${check.expected})`)
              project.issues.push(`${check.description} 路径不标准`)
              this.results.summary.warnings++
            }
          } else {
            console.log(`    ❌ 缺少 ${check.description} 字段`)
            project.issues.push(`缺少 ${check.field} 字段`)
          }
        }

        // 检查 files 字段
        if (packageJson.files && Array.isArray(packageJson.files)) {
          const expectedDirs = ['es', 'lib', 'dist']
          const missingDirs = expectedDirs.filter(dir => !packageJson.files.includes(dir))
          if (missingDirs.length === 0) {
            console.log(`    ✅ files 字段包含所有目录`)
          } else {
            console.log(`    ⚠️  files 字段缺少: ${missingDirs.join(', ')}`)
            project.issues.push(`files 字段缺少目录: ${missingDirs.join(', ')}`)
          }
        } else {
          console.log(`    ❌ 缺少 files 字段`)
          project.issues.push('缺少 files 字段')
        }
      }
    } catch (error) {
      project.issues.push(`package.json 解析失败: ${error.message}`)
      console.error(`    ❌ package.json 解析失败: ${error.message}`)
    }
  }

  /**
   * 构建项目
   */
  async buildProject(projectName, projectPath) {
    const project = this.results.projects[projectName]
    
    try {
      console.log(`    🔨 构建项目...`)
      
      // 清理之前的构建产物
      const dirsToClean = ['es', 'lib', 'dist']
      for (const dir of dirsToClean) {
        const dirPath = path.join(projectPath, dir)
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true })
        }
      }

      // 执行构建
      const startTime = Date.now()
      execSync('pnpm run build', {
        cwd: projectPath,
        encoding: 'utf-8',
        stdio: 'pipe'
      })
      const buildTime = Date.now() - startTime

      console.log(`    ✅ 构建成功 (${buildTime}ms)`)
      project.buildTime = buildTime
      project.buildSuccess = true

    } catch (error) {
      console.error(`    ❌ 构建失败: ${error.message}`)
      project.buildSuccess = false
      project.issues.push(`构建失败: ${error.message}`)
      this.results.summary.failed++
    }
  }

  /**
   * 验证目录结构
   */
  async validateDirectoryStructure(projectName, projectPath) {
    const project = this.results.projects[projectName]
    
    if (!project.buildSuccess) {
      console.log(`    ⏭️  跳过目录结构验证（构建失败）`)
      return
    }

    console.log(`    📁 验证目录结构...`)

    for (const [dirKey, dirConfig] of Object.entries(EXPECTED_DIRECTORIES)) {
      const dirPath = path.join(projectPath, dirConfig.name)
      const dirResult = {
        exists: false,
        files: [],
        expectedFiles: [],
        missingFiles: [],
        extraFiles: [],
        score: 0
      }

      if (fs.existsSync(dirPath)) {
        dirResult.exists = true
        
        // 扫描目录中的文件
        const files = this.scanDirectory(dirPath)
        dirResult.files = files

        // 检查期望的文件
        for (const expectedFile of dirConfig.expectedFiles) {
          if (files.some(file => file.endsWith(expectedFile))) {
            dirResult.expectedFiles.push(expectedFile)
            dirResult.score += 20
          } else {
            dirResult.missingFiles.push(expectedFile)
          }
        }

        // 检查类型声明文件
        const typeFiles = files.filter(file => file.endsWith('.d.ts'))
        if (typeFiles.length > 0) {
          dirResult.score += 10
          console.log(`    ✅ ${dirConfig.name}/ 包含类型声明文件`)
        }

        console.log(`    ✅ ${dirConfig.name}/ 目录存在 (${files.length} 个文件)`)
        
        if (dirResult.missingFiles.length > 0) {
          console.log(`    ⚠️  ${dirConfig.name}/ 缺少文件: ${dirResult.missingFiles.join(', ')}`)
          project.issues.push(`${dirConfig.name}/ 缺少文件: ${dirResult.missingFiles.join(', ')}`)
        }

      } else {
        if (dirConfig.required) {
          console.log(`    ❌ ${dirConfig.name}/ 目录不存在`)
          project.issues.push(`缺少必需的 ${dirConfig.name}/ 目录`)
        } else {
          console.log(`    ⚠️  ${dirConfig.name}/ 目录不存在（可选）`)
        }
      }

      project.directories[dirKey] = dirResult
    }
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
   * 计算评分
   */
  calculateScore(projectName) {
    const project = this.results.projects[projectName]
    
    let score = 0
    
    // 构建成功 +30 分
    if (project.buildSuccess) {
      score += 30
    }

    // 目录结构评分
    for (const dirResult of Object.values(project.directories)) {
      score += dirResult.score
    }

    // package.json 配置评分
    if (project.packageJson.main && project.packageJson.module) {
      score += 20
    }

    project.score = Math.min(100, score)

    if (project.score >= 80) {
      console.log(`    🎯 评分: ${project.score}/100 (优秀)`)
      this.results.summary.passed++
    } else if (project.score >= 60) {
      console.log(`    🎯 评分: ${project.score}/100 (良好)`)
      this.results.summary.passed++
    } else {
      console.log(`    🎯 评分: ${project.score}/100 (需要改进)`)
      this.results.summary.failed++
    }
  }

  /**
   * 生成报告
   */
  generateReport() {
    const reportLines = [
      '# 示例项目目录结构验证报告',
      '',
      `**验证时间**: ${new Date().toISOString()}`,
      `**测试项目数**: ${TEST_PROJECTS.length}`,
      '',
      '## 📊 总体统计',
      '',
      `- **通过验证**: ${this.results.summary.passed}/${this.results.summary.totalProjects}`,
      `- **失败验证**: ${this.results.summary.failed}/${this.results.summary.totalProjects}`,
      `- **警告数量**: ${this.results.summary.warnings}`,
      '',
      '## 📋 项目详细结果',
      ''
    ]

    // 添加每个项目的详细结果
    Object.entries(this.results.projects).forEach(([projectName, project]) => {
      reportLines.push(`### ${projectName} (${project.score}/100)`)
      reportLines.push('')
      
      if (project.buildSuccess) {
        reportLines.push(`✅ 构建成功 (${project.buildTime}ms)`)
      } else {
        reportLines.push(`❌ 构建失败`)
      }

      // 目录结构
      reportLines.push('')
      reportLines.push('**目录结构**:')
      Object.entries(project.directories).forEach(([dirKey, dirResult]) => {
        const status = dirResult.exists ? '✅' : '❌'
        reportLines.push(`- ${status} ${EXPECTED_DIRECTORIES[dirKey].name}/ (${dirResult.files.length} 文件)`)
      })

      // 问题列表
      if (project.issues.length > 0) {
        reportLines.push('')
        reportLines.push('**问题**:')
        project.issues.forEach(issue => {
          reportLines.push(`- ${issue}`)
        })
      }

      reportLines.push('')
    })

    // 保存报告
    fs.writeFileSync('directory-structure-report.md', reportLines.join('\n'))
    console.log('\n📄 详细报告已保存到: directory-structure-report.md')
  }

  /**
   * 打印总结
   */
  printSummary() {
    console.log('\n📊 验证总结')
    console.log('=' .repeat(60))
    console.log(`✅ 通过: ${this.results.summary.passed}/${this.results.summary.totalProjects}`)
    console.log(`❌ 失败: ${this.results.summary.failed}/${this.results.summary.totalProjects}`)
    console.log(`⚠️  警告: ${this.results.summary.warnings}`)
    
    const successRate = (this.results.summary.passed / this.results.summary.totalProjects * 100).toFixed(1)
    console.log(`📈 成功率: ${successRate}%`)

    if (this.results.summary.failed > 0) {
      console.log('\n💡 建议:')
      console.log('- 检查失败项目的构建配置')
      console.log('- 确保 package.json 入口字段正确')
      console.log('- 验证打包工具支持所需的输出格式')
    }
  }
}

// 运行验证
const validator = new DirectoryStructureValidator()
validator.runAllValidations().catch(console.error)
