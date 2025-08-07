#!/usr/bin/env tsx

/**
 * 包体积分析器
 * 分析各个包的体积并生成优化建议
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

interface PackageInfo {
  name: string
  path: string
  distSize?: number
  esSize?: number
  dependencies: string[]
  devDependencies: string[]
}

interface OptimizationSuggestion {
  package: string
  issue: string
  suggestion: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * 获取目录大小
 */
function getDirectorySize(dir: string): number {
  if (!existsSync(dir)) return 0

  let size = 0
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = join(dir, file)
    const stats = statSync(filePath)

    if (stats.isDirectory()) {
      size += getDirectorySize(filePath)
    } else {
      size += stats.size
    }
  }

  return size
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, index)).toFixed(2)

  return `${size} ${units[index]}`
}

/**
 * 分析包信息
 */
function analyzePackage(packagePath: string): PackageInfo {
  const packageJsonPath = join(packagePath, 'package.json')

  if (!existsSync(packageJsonPath)) {
    throw new Error(`Package.json not found in ${packagePath}`)
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  const info: PackageInfo = {
    name: packageJson.name,
    path: packagePath,
    dependencies: Object.keys(packageJson.dependencies || {}),
    devDependencies: Object.keys(packageJson.devDependencies || {}),
  }

  // 获取构建产物大小
  const distPath = join(packagePath, 'dist')
  const esPath = join(packagePath, 'es')

  if (existsSync(distPath)) {
    info.distSize = getDirectorySize(distPath)
  }

  if (existsSync(esPath)) {
    info.esSize = getDirectorySize(esPath)
  }

  return info
}

/**
 * 生成优化建议
 */
function generateOptimizationSuggestions(
  packages: PackageInfo[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []

  for (const pkg of packages) {
    // 检查包体积
    if (pkg.distSize && pkg.distSize > 100 * 1024) {
      // 100KB
      suggestions.push({
        package: pkg.name,
        issue: `包体积过大 (${formatSize(pkg.distSize)})`,
        suggestion: '考虑代码分割、tree-shaking或移除不必要的依赖',
        priority: pkg.distSize > 500 * 1024 ? 'high' : 'medium',
      })
    }

    // 检查依赖数量
    if (pkg.dependencies.length > 10) {
      suggestions.push({
        package: pkg.name,
        issue: `生产依赖过多 (${pkg.dependencies.length}个)`,
        suggestion: '检查是否可以减少依赖或使用更轻量的替代品',
        priority: 'medium',
      })
    }

    // 检查是否有大型依赖
    const heavyDeps = ['lodash', 'moment', 'jquery']
    const foundHeavyDeps = pkg.dependencies.filter(dep =>
      heavyDeps.some(heavy => dep.includes(heavy))
    )

    if (foundHeavyDeps.length > 0) {
      suggestions.push({
        package: pkg.name,
        issue: `包含大型依赖: ${foundHeavyDeps.join(', ')}`,
        suggestion: '考虑使用更轻量的替代品或按需导入',
        priority: 'high',
      })
    }

    // 检查是否缺少生产构建
    if (!pkg.distSize && !pkg.esSize) {
      suggestions.push({
        package: pkg.name,
        issue: '缺少构建产物',
        suggestion: '运行构建命令生成产物',
        priority: 'low',
      })
    }
  }

  return suggestions
}

/**
 * 运行包体积分析
 */
async function runBundleAnalysis(packageName?: string) {
  const rootDir = process.cwd()
  const packagesDir = join(rootDir, 'packages')

  // 获取要分析的包
  let packageDirs: string[]

  if (packageName) {
    const packagePath = join(packagesDir, packageName)
    if (!existsSync(packagePath)) {
      console.error(`❌ 包 ${packageName} 不存在`)
      process.exit(1)
    }
    packageDirs = [packagePath]
  } else {
    packageDirs = readdirSync(packagesDir)
      .map(name => join(packagesDir, name))
      .filter(path => statSync(path).isDirectory())
  }

  console.log('📦 开始分析包体积...\n')

  const packages: PackageInfo[] = []

  // 分析每个包
  for (const dir of packageDirs) {
    try {
      const info = analyzePackage(dir)
      packages.push(info)

      console.log(`📊 ${info.name}:`)
      if (info.distSize) {
        console.log(`   dist: ${formatSize(info.distSize)}`)
      }
      if (info.esSize) {
        console.log(`   es: ${formatSize(info.esSize)}`)
      }
      console.log(`   依赖: ${info.dependencies.length}个`)
      console.log('')
    } catch (error) {
      console.error(`❌ 分析 ${dir} 失败:`, error)
    }
  }

  // 生成优化建议
  const suggestions = generateOptimizationSuggestions(packages)

  if (suggestions.length > 0) {
    console.log('\n🎯 优化建议:\n')

    // 按优先级排序
    suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    for (const suggestion of suggestions) {
      const priorityEmoji = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      }[suggestion.priority]

      console.log(
        `${priorityEmoji} [${suggestion.priority.toUpperCase()}] ${
          suggestion.package
        }`
      )
      console.log(`   问题: ${suggestion.issue}`)
      console.log(`   建议: ${suggestion.suggestion}\n`)
    }
  } else {
    console.log('\n✅ 没有发现明显的优化问题')
  }

  // 生成总体统计
  const totalDistSize = packages.reduce(
    (sum, pkg) => sum + (pkg.distSize || 0),
    0
  )
  const totalEsSize = packages.reduce((sum, pkg) => sum + (pkg.esSize || 0), 0)
  const totalDeps = new Set(packages.flatMap(pkg => pkg.dependencies)).size

  console.log('\n📈 总体统计:')
  console.log(`   包数量: ${packages.length}`)
  console.log(`   总dist大小: ${formatSize(totalDistSize)}`)
  console.log(`   总es大小: ${formatSize(totalEsSize)}`)
  console.log(`   唯一依赖数: ${totalDeps}`)
}

/**
 * 使用webpack-bundle-analyzer分析特定包
 */
async function runWebpackAnalyzer(packageName: string) {
  const rootDir = process.cwd()
  const packagePath = join(rootDir, 'packages', packageName)

  if (!existsSync(packagePath)) {
    console.error(`❌ 包 ${packageName} 不存在`)
    process.exit(1)
  }

  console.log(`🔍 使用webpack-bundle-analyzer分析 ${packageName}...`)

  try {
    // 切换到包目录并运行分析
    execSync('pnpm add -D webpack-bundle-analyzer', {
      cwd: packagePath,
      stdio: 'inherit',
    })

    // 这里需要包有相应的analyze脚本
    execSync('pnpm run analyze', {
      cwd: packagePath,
      stdio: 'inherit',
    })
  } catch (error) {
    console.error('❌ 分析失败:', error)
  }
}

// 解析命令行参数
const args = process.argv.slice(2)
const command = args[0]
const packageName = args[1]

if (command === 'webpack' && packageName) {
  runWebpackAnalyzer(packageName).catch(console.error)
} else {
  runBundleAnalysis(packageName).catch(console.error)
}
