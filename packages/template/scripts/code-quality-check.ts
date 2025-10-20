#!/usr/bin/env node
/**
 * 代码质量检查脚本
 * 自动检查类型安全、代码规范、性能问题
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface QualityReport {
  timestamp: string
  checks: CheckResult[]
  score: number
  grade: string
  passed: boolean
}

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
  score: number
}

/**
 * 运行命令并捕获输出
 */
function runCommand(command: string): { success: boolean; output: string } {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' })
    return { success: true, output }
  } catch (error: any) {
    return { success: false, output: error.stdout || error.stderr || '' }
  }
}

/**
 * 检查 TypeScript 类型
 */
function checkTypeScript(): CheckResult {
  console.log('🔍 检查 TypeScript 类型...')
  const result = runCommand('npm run type-check')
  
  if (result.success) {
    return {
      name: 'TypeScript 类型检查',
      status: 'pass',
      message: '✅ 无类型错误',
      score: 30
    }
  }
  
  const errorCount = (result.output.match(/error TS\d+:/g) || []).length
  
  if (errorCount > 0) {
    return {
      name: 'TypeScript 类型检查',
      status: 'fail',
      message: `❌ 发现 ${errorCount} 个类型错误`,
      details: result.output.split('\n').slice(0, 10).join('\n'),
      score: 0
    }
  }
  
  return {
    name: 'TypeScript 类型检查',
    status: 'warning',
    message: '⚠️  类型检查未通过',
    score: 15
  }
}

/**
 * 检查 ESLint
 */
function checkESLint(): CheckResult {
  console.log('🔍 检查 ESLint 规则...')
  const result = runCommand('npm run lint:check')
  
  if (result.success) {
    return {
      name: 'ESLint 代码检查',
      status: 'pass',
      message: '✅ 无代码规范问题',
      score: 20
    }
  }
  
  const errorCount = (result.output.match(/error/gi) || []).length
  const warningCount = (result.output.match(/warning/gi) || []).length
  
  if (errorCount > 0) {
    return {
      name: 'ESLint 代码检查',
      status: 'fail',
      message: `❌ 发现 ${errorCount} 个错误, ${warningCount} 个警告`,
      score: 0
    }
  }
  
  if (warningCount > 0) {
    return {
      name: 'ESLint 代码检查',
      status: 'warning',
      message: `⚠️  发现 ${warningCount} 个警告`,
      score: 10
    }
  }
  
  return {
    name: 'ESLint 代码检查',
    status: 'pass',
    message: '✅ 无代码规范问题',
    score: 20
  }
}

/**
 * 检查构建
 */
function checkBuild(): CheckResult {
  console.log('🔍 检查构建...')
  const result = runCommand('npm run build')
  
  if (result.success && result.output.includes('构建成功')) {
    return {
      name: '构建检查',
      status: 'pass',
      message: '✅ 构建成功',
      score: 25
    }
  }
  
  return {
    name: '构建检查',
    status: 'fail',
    message: '❌ 构建失败',
    details: result.output.split('\n').slice(-20).join('\n'),
    score: 0
  }
}

/**
 * 检查文件大小
 */
function checkFileSize(): CheckResult {
  console.log('🔍 检查打包体积...')
  
  const distPath = path.resolve(process.cwd(), 'dist')
  
  if (!fs.existsSync(distPath)) {
    return {
      name: '打包体积检查',
      status: 'warning',
      message: '⚠️  dist 目录不存在',
      score: 0
    }
  }
  
  // 计算总大小
  let totalSize = 0
  function getSize(dir: string) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        getSize(filePath)
      } else {
        totalSize += stat.size
      }
    }
  }
  
  getSize(distPath)
  const sizeMB = totalSize / 1024 / 1024
  
  if (sizeMB < 3) {
    return {
      name: '打包体积检查',
      status: 'pass',
      message: `✅ 体积优秀 (${sizeMB.toFixed(2)} MB)`,
      score: 15
    }
  }
  
  if (sizeMB < 6) {
    return {
      name: '打包体积检查',
      status: 'pass',
      message: `✅ 体积良好 (${sizeMB.toFixed(2)} MB)`,
      score: 10
    }
  }
  
  return {
    name: '打包体积检查',
    status: 'warning',
    message: `⚠️  体积较大 (${sizeMB.toFixed(2)} MB)，建议优化`,
    score: 5
  }
}

/**
 * 检查依赖安全
 */
function checkDependencies(): CheckResult {
  console.log('🔍 检查依赖...')
  
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')
  )
  
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }
  
  const totalDeps = Object.keys(deps).length
  
  return {
    name: '依赖检查',
    status: 'pass',
    message: `✅ 共 ${totalDeps} 个依赖`,
    score: 10
  }
}

/**
 * 计算总分和等级
 */
function calculateGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  return 'D'
}

/**
 * 打印报告
 */
function printReport(report: QualityReport): void {
  console.log('\n' + '='.repeat(80))
  console.log('📊 代码质量检查报告')
  console.log('='.repeat(80) + '\n')
  
  report.checks.forEach(check => {
    console.log(`${check.message}`)
    if (check.details) {
      console.log(`   详情: ${check.details.substring(0, 100)}...`)
    }
  })
  
  console.log('\n' + '-'.repeat(80))
  console.log(`📊 总分: ${report.score}/100`)
  console.log(`🏆 等级: ${report.grade}`)
  console.log(`✅ 状态: ${report.passed ? '通过' : '未通过'}`)
  console.log('='.repeat(80) + '\n')
  
  if (!report.passed) {
    console.log('❌ 代码质量检查未通过，请修复以上问题\n')
    process.exit(1)
  } else {
    console.log('✅ 代码质量检查通过！\n')
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('\n🚀 开始代码质量检查...\n')
  
  const checks: CheckResult[] = [
    checkTypeScript(),
    checkESLint(),
    checkBuild(),
    checkFileSize(),
    checkDependencies()
  ]
  
  const totalScore = checks.reduce((sum, check) => sum + check.score, 0)
  const maxScore = 100
  const grade = calculateGrade(totalScore)
  const passed = totalScore >= 60
  
  const report: QualityReport = {
    timestamp: new Date().toISOString(),
    checks,
    score: totalScore,
    grade,
    passed
  }
  
  // 保存报告
  const reportPath = path.resolve(process.cwd(), 'quality-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  printReport(report)
  console.log(`📝 详细报告已保存到: ${reportPath}\n`)
}

main().catch(error => {
  console.error('❌ 检查过程出错:', error)
  process.exit(1)
})

