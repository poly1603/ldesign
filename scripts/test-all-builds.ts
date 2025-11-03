/**
 * 批量测试所有 packages 的构建
 * 
 * 此脚本会尝试构建每个包并记录结果
 */

import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')

interface BuildResult {
  name: string
  success: boolean
  duration: number
  error?: string
  output?: string
}

async function getPackageDirs(): Promise<string[]> {
  const dirs = await fs.readdir(packagesDir)
  const packages: string[] = []
  
  for (const dir of dirs) {
    const fullPath = path.join(packagesDir, dir)
    const stat = await fs.stat(fullPath)
    const pkgJsonPath = path.join(fullPath, 'package.json')
    
    if (stat.isDirectory() && await fs.pathExists(pkgJsonPath)) {
      packages.push(dir)
    }
  }
  
  return packages.sort()
}

async function buildPackage(pkgName: string): Promise<BuildResult> {
  const startTime = Date.now()
  const result: BuildResult = {
    name: pkgName,
    success: false,
    duration: 0
  }

  try {
    console.log(`\n🔨 构建 ${pkgName}...`)
    
    const pkgPath = path.join(packagesDir, pkgName)
    const output = execSync('pnpm build', {
      cwd: pkgPath,
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 120000 // 2分钟超时
    })
    
    result.success = true
    result.output = output
    console.log(`✅ ${pkgName} 构建成功`)
  } catch (error: any) {
    result.success = false
    result.error = error.message
    result.output = error.stdout || error.stderr
    console.log(`❌ ${pkgName} 构建失败`)
  } finally {
    result.duration = Date.now() - startTime
  }

  return result
}

async function buildAll(options: { parallel?: boolean, continueOnError?: boolean } = {}) {
  const { parallel = false, continueOnError = true } = options
  
  console.log('🚀 开始批量构建测试...\n')
  console.log('=' .repeat(80))
  
  const packages = await getPackageDirs()
  const results: BuildResult[] = []
  
  console.log(`📦 发现 ${packages.length} 个包`)
  console.log(`⚙️  模式: ${parallel ? '并行' : '串行'}`)
  console.log(`🔄 失败后: ${continueOnError ? '继续' : '停止'}`)
  console.log('=' .repeat(80))

  if (parallel) {
    // 并行构建（风险：可能消耗大量资源）
    const promises = packages.map(pkg => buildPackage(pkg))
    results.push(...await Promise.all(promises))
  } else {
    // 串行构建（稳定）
    for (const pkg of packages) {
      const result = await buildPackage(pkg)
      results.push(result)
      
      if (!result.success && !continueOnError) {
        console.log('\n⚠️  检测到构建失败，停止后续构建')
        break
      }
    }
  }

  return results
}

function printSummary(results: BuildResult[]) {
  console.log('\n\n')
  console.log('=' .repeat(80))
  console.log('📊 构建结果汇总')
  console.log('=' .repeat(80))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

  console.log(`\n总计: ${results.length} 个包`)
  console.log(`✅ 成功: ${successful.length} 个`)
  console.log(`❌ 失败: ${failed.length} 个`)
  console.log(`⏱️  总耗时: ${(totalDuration / 1000).toFixed(2)}s`)
  console.log(`⏱️  平均耗时: ${(totalDuration / results.length / 1000).toFixed(2)}s`)

  if (successful.length > 0) {
    console.log('\n✅ 构建成功的包:')
    console.log('-' .repeat(80))
    successful.forEach(r => {
      console.log(`  ✓ ${r.name.padEnd(20)} (${(r.duration / 1000).toFixed(2)}s)`)
    })
  }

  if (failed.length > 0) {
    console.log('\n❌ 构建失败的包:')
    console.log('-' .repeat(80))
    failed.forEach(r => {
      console.log(`  ✗ ${r.name}`)
      if (r.error) {
        const errorLines = r.error.split('\n').slice(0, 3)
        errorLines.forEach(line => {
          console.log(`    ${line}`)
        })
      }
      console.log('')
    })
  }

  // 保存详细报告
  const reportPath = path.join(rootDir, 'build-test-report.json')
  fs.writeJSONSync(reportPath, {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      totalDuration,
      averageDuration: totalDuration / results.length
    },
    results
  }, { spaces: 2 })
  
  console.log(`\n📄 详细报告已保存到: ${reportPath}`)
}

function printRecommendations(results: BuildResult[]) {
  const failed = results.filter(r => !r.success)
  
  if (failed.length === 0) {
    console.log('\n🎉 所有包都构建成功！')
    return
  }

  console.log('\n💡 修复建议:')
  console.log('=' .repeat(80))
  
  failed.forEach(r => {
    console.log(`\n📦 ${r.name}`)
    console.log('-' .repeat(80))
    
    if (r.error?.includes('UMD 入口文件不存在')) {
      console.log('  问题: UMD 配置错误')
      console.log('  解决方案:')
      console.log('    1. 在 builder.config.ts 的 umd 配置中添加 entry 字段')
      console.log('    2. 或者禁用 UMD: umd: { enabled: false }')
    } else if (r.error?.includes('Cannot find module')) {
      console.log('  问题: 缺少依赖')
      console.log('  解决方案: 运行 pnpm install')
    } else if (r.error?.includes('Type error')) {
      console.log('  问题: TypeScript 类型错误')
      console.log('  解决方案: 检查并修复类型错误')
    } else {
      console.log('  建议: 查看完整错误日志进行排查')
      console.log(`  命令: cd packages/${r.name} && pnpm build`)
    }
  })
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  const parallel = args.includes('--parallel')
  const stopOnError = args.includes('--stop-on-error')
  const continueOnError = !stopOnError

  try {
    const results = await buildAll({ parallel, continueOnError })
    printSummary(results)
    printRecommendations(results)
    
    // 如果有失败的包，退出码为 1
    const hasFailures = results.some(r => !r.success)
    if (hasFailures) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 构建测试过程出错:', error)
    process.exit(1)
  }
}

// 显示帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
使用方法:
  pnpm tsx scripts/test-all-builds.ts [选项]

选项:
  --parallel          并行构建所有包（更快但消耗更多资源）
  --stop-on-error     遇到错误时停止（默认继续）
  --help, -h          显示此帮助信息

示例:
  pnpm tsx scripts/test-all-builds.ts
  pnpm tsx scripts/test-all-builds.ts --parallel
  pnpm tsx scripts/test-all-builds.ts --stop-on-error
  `)
  process.exit(0)
}

main()
