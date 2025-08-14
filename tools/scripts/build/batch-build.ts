#!/usr/bin/env tsx

import { execSync, spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '../../../')

interface PackageInfo {
  name: string
  path: string
  hasScript: boolean
  dependencies: string[]
  workspaceDependencies: string[]
  level: number // 构建层级，用于依赖排序
}

interface BuildResult {
  package: string
  success: boolean
  duration: number
  error?: string
}

/**
 * 批量构建所有 packages
 * 支持错误容错和构建结果摘要
 */
class BatchBuilder {
  private packages: PackageInfo[] = []
  private results: BuildResult[] = []
  private startTime = Date.now()

  constructor() {
    this.scanPackages()
    this.calculateDependencyLevels()
  }

  /**
   * 扫描所有包
   */
  private scanPackages(): void {
    try {
      const packagesDir = resolve(rootDir, 'packages')
      // 使用跨平台的方式获取目录列表
      const packageDirs = execSync(
        process.platform === 'win32' ? 'dir /b /ad' : 'ls -d */',
        {
          cwd: packagesDir,
          encoding: 'utf-8',
        }
      )
        .trim()
        .split(/\r?\n/)
        .filter(Boolean)
        .map(dir => dir.replace(/\/$/, '')) // 移除末尾的斜杠

      for (const dir of packageDirs) {
        const packagePath = resolve(packagesDir, dir)
        const packageJsonPath = resolve(packagePath, 'package.json')

        if (existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(
              readFileSync(packageJsonPath, 'utf-8')
            )
            const hasScript = packageJson.scripts && packageJson.scripts.build

            const allDeps = {
              ...packageJson.dependencies,
              ...packageJson.devDependencies,
              ...packageJson.peerDependencies,
            }
            const dependencies = Object.keys(allDeps || {})
            const workspaceDependencies = dependencies.filter(dep =>
              dep.startsWith('@ldesign/')
            )

            this.packages.push({
              name: packageJson.name || dir,
              path: packagePath,
              hasScript,
              dependencies,
              workspaceDependencies,
              level: 0, // 将在 calculateDependencyLevels 中计算
            })
          } catch (error) {
            console.warn(`⚠️  无法解析 ${packageJsonPath}:`, error)
          }
        }
      }

      console.log(`📦 发现 ${this.packages.length} 个包`)
    } catch (error) {
      console.error('❌ 扫描包失败:', error)
      process.exit(1)
    }
  }

  /**
   * 计算包的依赖层级
   */
  private calculateDependencyLevels(): void {
    const packageMap = new Map<string, PackageInfo>()
    this.packages.forEach(pkg => packageMap.set(pkg.name, pkg))

    // 使用拓扑排序计算依赖层级
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const calculateLevel = (pkgName: string): number => {
      if (visiting.has(pkgName)) {
        console.warn(`⚠️  检测到循环依赖: ${pkgName}`)
        return 0
      }

      if (visited.has(pkgName)) {
        return packageMap.get(pkgName)?.level || 0
      }

      visiting.add(pkgName)
      const pkg = packageMap.get(pkgName)

      if (!pkg) {
        visiting.delete(pkgName)
        return 0
      }

      let maxDepLevel = -1
      for (const dep of pkg.workspaceDependencies) {
        const depLevel = calculateLevel(dep)
        maxDepLevel = Math.max(maxDepLevel, depLevel)
      }

      pkg.level = maxDepLevel + 1
      visiting.delete(pkgName)
      visited.add(pkgName)

      return pkg.level
    }

    // 计算所有包的层级
    this.packages.forEach(pkg => calculateLevel(pkg.name))

    // 按层级排序
    this.packages.sort((a, b) => a.level - b.level)

    console.log(`📊 依赖层级分析:`)
    const levelGroups = new Map<number, string[]>()
    this.packages.forEach(pkg => {
      if (!levelGroups.has(pkg.level)) {
        levelGroups.set(pkg.level, [])
      }
      levelGroups.get(pkg.level)!.push(pkg.name)
    })

    levelGroups.forEach((packages, level) => {
      console.log(`   层级 ${level}: ${packages.join(', ')}`)
    })
    console.log('')
  }

  /**
   * 构建单个包
   */
  private async buildPackage(pkg: PackageInfo): Promise<BuildResult> {
    const startTime = Date.now()

    console.log(`🔨 构建 ${pkg.name}...`)

    if (!pkg.hasScript) {
      console.log(`⏭️  ${pkg.name} 没有构建脚本，跳过`)
      return {
        package: pkg.name,
        success: true,
        duration: Date.now() - startTime,
        error: '没有构建脚本',
      }
    }

    return new Promise(resolve => {
      const child = spawn('pnpm', ['run', 'build'], {
        cwd: pkg.path,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', data => {
        stdout += data.toString()
      })

      child.stderr?.on('data', data => {
        stderr += data.toString()
      })

      child.on('close', code => {
        const duration = Date.now() - startTime
        const success = code === 0

        if (success) {
          console.log(`✅ ${pkg.name} 构建成功 (${duration}ms)`)
        } else {
          console.log(`❌ ${pkg.name} 构建失败 (${duration}ms)`)
          console.log(`错误输出: ${stderr}`)
        }

        resolve({
          package: pkg.name,
          success,
          duration,
          error: success ? undefined : stderr || stdout,
        })
      })

      child.on('error', error => {
        const duration = Date.now() - startTime
        console.log(`❌ ${pkg.name} 构建失败 (${duration}ms)`)
        console.log(`错误: ${error.message}`)

        resolve({
          package: pkg.name,
          success: false,
          duration,
          error: error.message,
        })
      })
    })
  }

  /**
   * 智能并行构建所有包
   */
  async buildAll(
    mode: 'serial' | 'parallel' | 'smart' = 'smart'
  ): Promise<void> {
    console.log(
      `🚀 开始批量构建 (${
        mode === 'smart'
          ? '智能并行'
          : mode === 'parallel'
          ? '完全并行'
          : '串行'
      } 模式)`
    )
    console.log('='.repeat(60))

    switch (mode) {
      case 'serial':
        await this.buildSerial()
        break
      case 'parallel':
        await this.buildParallel()
        break
      case 'smart':
      default:
        await this.buildSmart()
        break
    }

    this.printSummary()
  }

  /**
   * 串行构建
   */
  private async buildSerial(): Promise<void> {
    for (const pkg of this.packages) {
      const result = await this.buildPackage(pkg)
      this.results.push(result)
    }
  }

  /**
   * 完全并行构建
   */
  private async buildParallel(): Promise<void> {
    const promises = this.packages.map(pkg => this.buildPackage(pkg))
    this.results = await Promise.all(promises)
  }

  /**
   * 智能并行构建（按依赖层级）
   */
  private async buildSmart(): Promise<void> {
    const levelGroups = new Map<number, PackageInfo[]>()

    // 按层级分组
    this.packages.forEach(pkg => {
      if (!levelGroups.has(pkg.level)) {
        levelGroups.set(pkg.level, [])
      }
      levelGroups.get(pkg.level)!.push(pkg)
    })

    // 按层级顺序构建，同层级内并行
    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b)

    for (const level of sortedLevels) {
      const packages = levelGroups.get(level)!
      console.log(`🔨 构建层级 ${level} (${packages.length} 个包)...`)

      // 同层级内并行构建
      const promises = packages.map(pkg => this.buildPackage(pkg))
      const results = await Promise.all(promises)
      this.results.push(...results)

      // 检查是否有失败的包
      const failed = results.filter(r => !r.success)
      if (failed.length > 0) {
        console.log(
          `❌ 层级 ${level} 中有 ${failed.length} 个包构建失败，停止后续构建`
        )
        break
      }
    }
  }

  /**
   * 打印构建摘要
   */
  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime
    const successful = this.results.filter(r => r.success)
    const failed = this.results.filter(r => !r.success)

    console.log('\n' + '='.repeat(60))
    console.log('📊 构建摘要')
    console.log('='.repeat(60))
    console.log(`⏱️  总耗时: ${totalDuration}ms`)
    console.log(`📦 总包数: ${this.results.length}`)
    console.log(`✅ 成功: ${successful.length}`)
    console.log(`❌ 失败: ${failed.length}`)

    if (successful.length > 0) {
      console.log('\n🎉 构建成功的包:')
      successful.forEach(result => {
        console.log(`  ✅ ${result.package} (${result.duration}ms)`)
      })
    }

    if (failed.length > 0) {
      console.log('\n💥 构建失败的包:')
      failed.forEach(result => {
        console.log(`  ❌ ${result.package} (${result.duration}ms)`)
        if (result.error) {
          console.log(`     错误: ${result.error.split('\n')[0]}`)
        }
      })
    }

    console.log('\n' + '='.repeat(60))

    // 如果有失败的包，退出码为 1
    if (failed.length > 0) {
      process.exit(1)
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  const help = args.includes('--help') || args.includes('-h')

  // 确定构建模式
  let mode: 'serial' | 'parallel' | 'smart' = 'smart'
  if (args.includes('--serial') || args.includes('-s')) {
    mode = 'serial'
  } else if (args.includes('--parallel') || args.includes('-p')) {
    mode = 'parallel'
  } else if (args.includes('--smart') || args.includes('--intelligent')) {
    mode = 'smart'
  }

  if (help) {
    console.log(`
📦 批量构建工具

用法:
  pnpm run build:all [选项]

构建模式:
  (默认)               智能并行构建（推荐）
  --smart              智能并行构建，按依赖层级分组并行
  --parallel, -p       完全并行构建（最快，但可能有依赖问题）
  --serial, -s         串行构建（最安全，但较慢）

其他选项:
  --help, -h           显示此帮助信息

示例:
  pnpm run build:all              # 智能并行构建（推荐）
  pnpm run build:all --smart      # 智能并行构建
  pnpm run build:all --parallel   # 完全并行构建
  pnpm run build:all --serial     # 串行构建

智能并行模式说明:
  • 自动分析包之间的依赖关系
  • 按依赖层级分组，同层级内并行构建
  • 确保依赖包先于被依赖包构建
  • 兼顾构建速度和依赖安全性
`)
    return
  }

  const builder = new BatchBuilder()
  await builder.buildAll(mode)
}

// 运行
main().catch(console.error)
