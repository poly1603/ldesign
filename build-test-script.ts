#!/usr/bin/env tsx

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface BuildResult {
  name: string
  path: string
  success: boolean
  duration: number
  output: string
  errors: string[]
  warnings: string[]
  buildCommand: string
}

interface BuildReport {
  timestamp: string
  totalPackages: number
  successCount: number
  failureCount: number
  totalDuration: number
  results: BuildResult[]
}

const workspaceRoot = process.cwd()

function findPackages(): Array<{
  name: string
  path: string
  buildCommand: string
}> {
  const packages: Array<{ name: string, path: string, buildCommand: string }>
    = []

  // 从之前的检测脚本结果中获取包列表
  const packagePaths = [
    'packages/api',
    'packages/app',
    'packages/cache',
    'packages/color',
    'packages/crypto',
    'packages/device',
    'packages/engine',
    'packages/form',
    'packages/http',
    'packages/i18n',
    'packages/router',
    'packages/size',
    'packages/store',
    'packages/template',
    'packages/theme',
    'packages/watermark',
    'apps/app',
    'docs',
  ]

  for (const packagePath of packagePaths) {
    const fullPath = join(workspaceRoot, packagePath)
    const packageJsonPath = join(fullPath, 'package.json')

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const buildCommand = packageJson.scripts?.build || ''

      if (buildCommand) {
        packages.push({
          name: packageJson.name || packagePath,
          path: packagePath,
          buildCommand,
        })
      }
    }
  }

  return packages
}

function runBuildCommand(
  packagePath: string,
  buildCommand: string,
): Promise<BuildResult> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const fullPath = join(workspaceRoot, packagePath)

    console.log(`\n🔨 构建 ${packagePath}...`)
    console.log(`📁 路径: ${fullPath}`)
    console.log(`⚡ 命令: ${buildCommand}`)

    // 解析命令
    const [command, ...args] = buildCommand.split(' ')

    const child = spawn(command, args, {
      cwd: fullPath,
      stdio: 'pipe',
      shell: true,
    })

    let output = ''
    let errorOutput = ''

    child.stdout?.on('data', (data) => {
      const text = data.toString()
      output += text
      process.stdout.write(text)
    })

    child.stderr?.on('data', (data) => {
      const text = data.toString()
      errorOutput += text
      process.stderr.write(text)
    })

    child.on('close', (code) => {
      const duration = Date.now() - startTime
      const success = code === 0

      // 解析错误和警告
      const errors: string[] = []
      const warnings: string[] = []

      const allOutput = output + errorOutput
      const lines = allOutput.split('\n')

      for (const line of lines) {
        const lowerLine = line.toLowerCase()
        if (lowerLine.includes('error') && !lowerLine.includes('0 errors')) {
          errors.push(line.trim())
        }
        else if (
          lowerLine.includes('warning')
          && !lowerLine.includes('0 warnings')
        ) {
          warnings.push(line.trim())
        }
      }

      const result: BuildResult = {
        name: packagePath,
        path: packagePath,
        success,
        duration,
        output: allOutput,
        errors,
        warnings,
        buildCommand,
      }

      if (success) {
        console.log(`✅ ${packagePath} 构建成功 (${duration}ms)`)
      }
      else {
        console.log(`❌ ${packagePath} 构建失败 (${duration}ms)`)
      }

      resolve(result)
    })

    child.on('error', (error) => {
      const duration = Date.now() - startTime
      console.log(`❌ ${packagePath} 构建出错: ${error.message}`)

      resolve({
        name: packagePath,
        path: packagePath,
        success: false,
        duration,
        output: '',
        errors: [error.message],
        warnings: [],
        buildCommand,
      })
    })
  })
}

async function buildAllPackages(): Promise<BuildReport> {
  const packages = findPackages()
  const startTime = Date.now()

  console.log(`🚀 开始构建 ${packages.length} 个包...`)
  console.log('='.repeat(60))

  const results: BuildResult[] = []

  // 串行构建以避免资源冲突
  for (const pkg of packages) {
    const result = await runBuildCommand(pkg.path, pkg.buildCommand)
    results.push(result)
  }

  const totalDuration = Date.now() - startTime
  const successCount = results.filter(r => r.success).length
  const failureCount = results.length - successCount

  const report: BuildReport = {
    timestamp: new Date().toISOString(),
    totalPackages: packages.length,
    successCount,
    failureCount,
    totalDuration,
    results,
  }

  return report
}

function generateReport(report: BuildReport): void {
  console.log(`\n${'='.repeat(60)}`)
  console.log('🎯 构建测试报告')
  console.log('='.repeat(60))

  console.log(`\n📊 总体统计:`)
  console.log(`总包数: ${report.totalPackages}`)
  console.log(`成功: ${report.successCount}`)
  console.log(`失败: ${report.failureCount}`)
  console.log(`总耗时: ${(report.totalDuration / 1000).toFixed(2)}s`)
  console.log(
    `平均耗时: ${(report.totalDuration / report.totalPackages / 1000).toFixed(
      2,
    )}s`,
  )

  // 成功的包
  const successfulBuilds = report.results.filter(r => r.success)
  if (successfulBuilds.length > 0) {
    console.log(`\n✅ 成功构建的包 (${successfulBuilds.length}):`)
    for (const result of successfulBuilds) {
      console.log(`  ${result.name} - ${(result.duration / 1000).toFixed(2)}s`)
      if (result.warnings.length > 0) {
        console.log(`    ⚠️  警告: ${result.warnings.length} 个`)
      }
    }
  }

  // 失败的包
  const failedBuilds = report.results.filter(r => !r.success)
  if (failedBuilds.length > 0) {
    console.log(`\n❌ 构建失败的包 (${failedBuilds.length}):`)
    for (const result of failedBuilds) {
      console.log(`  ${result.name}:`)
      console.log(`    命令: ${result.buildCommand}`)
      console.log(`    耗时: ${(result.duration / 1000).toFixed(2)}s`)
      if (result.errors.length > 0) {
        console.log(`    错误:`)
        result.errors.slice(0, 3).forEach((error) => {
          console.log(`      - ${error}`)
        })
        if (result.errors.length > 3) {
          console.log(`      ... 还有 ${result.errors.length - 3} 个错误`)
        }
      }
    }
  }

  // 警告汇总
  const allWarnings = report.results.flatMap(r => r.warnings)
  if (allWarnings.length > 0) {
    console.log(`\n⚠️  警告汇总 (${allWarnings.length} 个):`)
    const warningCounts = new Map<string, number>()
    for (const warning of allWarnings) {
      const key = warning.substring(0, 100) // 截取前100字符作为key
      warningCounts.set(key, (warningCounts.get(key) || 0) + 1)
    }

    Array.from(warningCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([warning, count]) => {
        console.log(`  ${count}x: ${warning}`)
      })
  }

  // 保存详细报告到文件
  const reportPath = join(workspaceRoot, 'build-test-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 详细报告已保存到: ${reportPath}`)

  console.log(`\n${'='.repeat(60)}`)
  if (report.failureCount === 0) {
    console.log('🎉 所有包构建成功！')
  }
  else {
    console.log(`⚠️  ${report.failureCount} 个包构建失败，请检查上述错误信息`)
  }
}

// 主函数
async function main() {
  try {
    const report = await buildAllPackages()
    generateReport(report)

    // 返回适当的退出码
    process.exit(report.failureCount > 0 ? 1 : 0)
  }
  catch (error) {
    console.error('构建测试过程中发生错误:', error)
    process.exit(1)
  }
}

main()

export { buildAllPackages, generateReport }
