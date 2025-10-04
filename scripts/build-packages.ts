#!/usr/bin/env tsx

/**
 * LDesign Packages 批量打包工具
 * 
 * 功能：
 * - 自动扫描 packages 目录下的所有子包
 * - 分析包之间的依赖关系
 * - 使用拓扑排序确定正确的打包顺序
 * - 按依赖顺序依次打包所有包
 * - 提供详细的进度显示和错误处理
 * 
 * 使用方法：
 * ```bash
 * # 打包所有包
 * tsx scripts/build-packages.ts
 * 
 * # 只分析依赖关系，不执行打包
 * tsx scripts/build-packages.ts --dry-run
 * 
 * # 显示详细日志
 * tsx scripts/build-packages.ts --verbose
 * 
 * # 并行打包（同一层级的包可以并行）
 * tsx scripts/build-packages.ts --parallel
 * ```
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { readdir, readFile, stat } from 'fs/promises'
import { join, resolve } from 'path'
import { spawn } from 'child_process'
import { performance } from 'perf_hooks'

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
}

/**
 * 包信息接口
 */
interface PackageInfo {
  /** 包名 */
  name: string
  /** 包路径 */
  path: string
  /** 包版本 */
  version: string
  /** 依赖的其他 @ldesign 包 */
  dependencies: string[]
  /** package.json 内容 */
  packageJson: any
  /** 是否有构建脚本 */
  hasBuildScript: boolean
}

/**
 * 依赖图节点
 */
interface DependencyNode {
  /** 包名 */
  name: string
  /** 依赖的包 */
  dependencies: Set<string>
  /** 被依赖的包 */
  dependents: Set<string>
  /** 拓扑排序层级 */
  level: number
}

/**
 * 构建选项
 */
interface BuildOptions {
  /** 是否只进行干运行（不实际执行打包） */
  dryRun: boolean
  /** 是否显示详细日志 */
  verbose: boolean
  /** 是否并行打包同一层级的包 */
  parallel: boolean
  /** 工作目录 */
  cwd: string
  /** packages 目录路径 */
  packagesDir: string
}

/**
 * 日志工具类
 */
class Logger {
  constructor(private isVerbose: boolean = false) { }

  /**
   * 输出信息日志
   */
  info(message: string): void {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`)
  }

  /**
   * 输出成功日志
   */
  success(message: string): void {
    console.log(`${colors.green}✓${colors.reset} ${message}`)
  }

  /**
   * 输出警告日志
   */
  warn(message: string): void {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`)
  }

  /**
   * 输出错误日志
   */
  error(message: string): void {
    console.log(`${colors.red}✗${colors.reset} ${message}`)
  }

  /**
   * 输出详细日志（仅在 verbose 模式下显示）
   */
  verbose(message: string): void {
    if (this.isVerbose) {
      console.log(`${colors.gray}  ${message}${colors.reset}`)
    }
  }

  /**
   * 输出标题
   */
  title(message: string): void {
    console.log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`)
  }

  /**
   * 输出分隔线
   */
  separator(): void {
    console.log(`${colors.gray}${'─'.repeat(60)}${colors.reset}`)
  }
}

/**
 * 包扫描器 - 负责扫描和分析包信息
 */
class PackageScanner {
  constructor(
    private packagesDir: string,
    private logger: Logger
  ) { }

  /**
   * 扫描所有包
   */
  async scanPackages(): Promise<PackageInfo[]> {
    this.logger.title('📦 扫描 packages 目录...')

    try {
      const entries = await readdir(this.packagesDir)
      const packages: PackageInfo[] = []

      for (const entry of entries) {
        const packagePath = join(this.packagesDir, entry)
        const packageStat = await stat(packagePath)

        if (packageStat.isDirectory()) {
          const packageInfo = await this.analyzePackage(entry, packagePath)
          if (packageInfo) {
            packages.push(packageInfo)
            this.logger.verbose(`发现包: ${packageInfo.name} (${packageInfo.version})`)
          }
        }
      }

      this.logger.success(`扫描完成，共发现 ${packages.length} 个包`)
      return packages
    } catch (error) {
      this.logger.error(`扫描包失败: ${error}`)
      throw error
    }
  }

  /**
   * 分析单个包的信息
   */
  private async analyzePackage(dirName: string, packagePath: string): Promise<PackageInfo | null> {
    try {
      const packageJsonPath = join(packagePath, 'package.json')
      const packageJsonContent = await readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(packageJsonContent)

      // 检查是否是 @ldesign 包
      if (!packageJson.name || !packageJson.name.startsWith('@ldesign/')) {
        this.logger.verbose(`跳过非 @ldesign 包: ${packageJson.name || dirName}`)
        return null
      }

      // 分析依赖关系
      const dependencies = this.extractLDesignDependencies(packageJson)

      // 检查是否有构建脚本
      const hasBuildScript = !!(packageJson.scripts && packageJson.scripts.build)

      return {
        name: packageJson.name,
        path: packagePath,
        version: packageJson.version || '0.0.0',
        dependencies,
        packageJson,
        hasBuildScript
      }
    } catch (error) {
      this.logger.warn(`分析包 ${dirName} 失败: ${error}`)
      return null
    }
  }

  /**
   * 提取 @ldesign 相关的依赖
   */
  private extractLDesignDependencies(packageJson: any): string[] {
    const dependencies: string[] = []

    // 检查 dependencies
    if (packageJson.dependencies) {
      for (const dep of Object.keys(packageJson.dependencies)) {
        if (dep.startsWith('@ldesign/')) {
          dependencies.push(dep)
        }
      }
    }

    // 检查 devDependencies 中的 @ldesign 包（排除 @ldesign/builder）
    if (packageJson.devDependencies) {
      for (const dep of Object.keys(packageJson.devDependencies)) {
        if (dep.startsWith('@ldesign/') && dep !== '@ldesign/builder') {
          dependencies.push(dep)
        }
      }
    }

    return [...new Set(dependencies)] // 去重
  }
}

/**
 * 依赖分析器 - 负责构建依赖图和拓扑排序
 */
class DependencyAnalyzer {
  constructor(private logger: Logger) { }

  /**
   * 构建依赖图
   */
  buildDependencyGraph(packages: PackageInfo[]): Map<string, DependencyNode> {
    this.logger.title('🔗 构建依赖关系图...')

    const graph = new Map<string, DependencyNode>()

    // 初始化所有节点
    for (const pkg of packages) {
      graph.set(pkg.name, {
        name: pkg.name,
        dependencies: new Set(),
        dependents: new Set(),
        level: 0
      })
    }

    // 建立依赖关系
    for (const pkg of packages) {
      const node = graph.get(pkg.name)!

      for (const dep of pkg.dependencies) {
        if (graph.has(dep)) {
          node.dependencies.add(dep)
          graph.get(dep)!.dependents.add(pkg.name)
          this.logger.verbose(`${pkg.name} 依赖 ${dep}`)
        }
      }
    }

    this.logger.success(`依赖图构建完成，共 ${graph.size} 个节点`)
    return graph
  }

  /**
   * 拓扑排序 - 确定打包顺序
   */
  topologicalSort(graph: Map<string, DependencyNode>): string[][] {
    this.logger.title('📊 执行拓扑排序...')

    const result: string[][] = []
    const visited = new Set<string>()
    const inDegree = new Map<string, number>()

    // 计算入度
    for (const [name, node] of graph) {
      inDegree.set(name, node.dependencies.size)
    }

    let level = 0

    while (visited.size < graph.size) {
      const currentLevel: string[] = []

      // 找到当前层级可以处理的节点（入度为0）
      for (const [name, degree] of inDegree) {
        if (degree === 0 && !visited.has(name)) {
          currentLevel.push(name)
        }
      }

      if (currentLevel.length === 0) {
        // 检测到循环依赖
        const remaining = Array.from(graph.keys()).filter(name => !visited.has(name))
        throw new Error(`检测到循环依赖: ${remaining.join(', ')}`)
      }

      // 标记当前层级的节点为已访问
      for (const name of currentLevel) {
        visited.add(name)
        graph.get(name)!.level = level

        // 减少依赖此节点的其他节点的入度
        for (const dependent of graph.get(name)!.dependents) {
          if (!visited.has(dependent)) {
            inDegree.set(dependent, inDegree.get(dependent)! - 1)
          }
        }
      }

      result.push(currentLevel)
      level++

      this.logger.verbose(`第 ${level} 层: ${currentLevel.join(', ')}`)
    }

    this.logger.success(`拓扑排序完成，共 ${result.length} 个层级`)
    return result
  }

  /**
   * 验证依赖关系的完整性
   */
  validateDependencies(packages: PackageInfo[]): void {
    this.logger.title('🔍 验证依赖关系...')

    const packageNames = new Set(packages.map(pkg => pkg.name))
    const issues: string[] = []

    for (const pkg of packages) {
      for (const dep of pkg.dependencies) {
        if (!packageNames.has(dep)) {
          issues.push(`${pkg.name} 依赖的 ${dep} 不存在于当前包列表中`)
        }
      }
    }

    if (issues.length > 0) {
      this.logger.warn('发现依赖问题:')
      for (const issue of issues) {
        this.logger.warn(`  - ${issue}`)
      }
    } else {
      this.logger.success('依赖关系验证通过')
    }
  }
}

/**
 * 包构建器 - 负责执行实际的打包操作
 */
class PackageBuilder {
  constructor(
    private options: BuildOptions,
    private logger: Logger
  ) { }

  /**
   * 按层级构建所有包
   */
  async buildPackages(
    packages: PackageInfo[],
    buildOrder: string[][]
  ): Promise<void> {
    this.logger.title('🚀 开始构建包...')

    const packageMap = new Map(packages.map(pkg => [pkg.name, pkg]))
    const startTime = performance.now()
    let totalBuilt = 0

    for (let i = 0; i < buildOrder.length; i++) {
      const level = buildOrder[i]
      const levelPackages = level
        .map(name => packageMap.get(name))
        .filter((pkg): pkg is PackageInfo => pkg !== undefined && pkg.hasBuildScript)

      if (levelPackages.length === 0) {
        this.logger.verbose(`第 ${i + 1} 层没有需要构建的包`)
        continue
      }

      this.logger.info(`\n第 ${i + 1} 层构建 (${levelPackages.length} 个包): ${levelPackages.map(p => p.name).join(', ')}`)

      if (this.options.parallel && levelPackages.length > 1) {
        // 并行构建同一层级的包
        await this.buildPackagesInParallel(levelPackages)
      } else {
        // 串行构建
        for (const pkg of levelPackages) {
          await this.buildSinglePackage(pkg)
        }
      }

      totalBuilt += levelPackages.length
    }

    const endTime = performance.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    this.logger.separator()
    this.logger.success(`🎉 构建完成！共构建 ${totalBuilt} 个包，耗时 ${duration}s`)
  }

  /**
   * 并行构建多个包
   */
  private async buildPackagesInParallel(packages: PackageInfo[]): Promise<void> {
    const promises = packages.map(pkg => this.buildSinglePackage(pkg))
    await Promise.all(promises)
  }

  /**
   * 构建单个包
   */
  private async buildSinglePackage(pkg: PackageInfo): Promise<void> {
    const startTime = performance.now()

    if (this.options.dryRun) {
      this.logger.info(`[DRY RUN] 构建 ${pkg.name}`)
      return
    }

    this.logger.info(`构建 ${pkg.name}...`)

    try {
      await this.executeCommand('pnpm', ['run', 'build'], pkg.path)

      const endTime = performance.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)

      this.logger.success(`${pkg.name} 构建成功 (${duration}s)`)
    } catch (error) {
      this.logger.error(`${pkg.name} 构建失败: ${error}`)
      throw error
    }
  }

  /**
   * 执行命令
   */
  private executeCommand(command: string, args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        shell: process.platform === 'win32',
        env: { ...process.env }
      })

      let stdout = ''
      let stderr = ''

      if (!this.options.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString()
        })

        child.stderr?.on('data', (data) => {
          stderr += data.toString()
        })
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          const error = new Error(`命令执行失败 (退出码: ${code})`)
          if (!this.options.verbose && stderr) {
            this.logger.error(`错误输出: ${stderr}`)
          }
          reject(error)
        }
      })

      child.on('error', (error) => {
        reject(error)
      })
    })
  }
}

/**
 * 主应用程序类
 */
class BuildPackagesApp {
  private logger: Logger
  private scanner: PackageScanner
  private analyzer: DependencyAnalyzer
  private builder: PackageBuilder

  constructor(private options: BuildOptions) {
    this.logger = new Logger(options.verbose)
    this.scanner = new PackageScanner(options.packagesDir, this.logger)
    this.analyzer = new DependencyAnalyzer(this.logger)
    this.builder = new PackageBuilder(options, this.logger)
  }

  /**
   * 运行主程序
   */
  async run(): Promise<void> {
    try {
      this.logger.title('🏗️  LDesign Packages 批量打包工具')
      this.logger.info(`工作目录: ${this.options.cwd}`)
      this.logger.info(`包目录: ${this.options.packagesDir}`)

      if (this.options.dryRun) {
        this.logger.warn('运行在 DRY RUN 模式，不会执行实际的打包操作')
      }

      // 1. 扫描所有包
      const packages = await this.scanner.scanPackages()

      if (packages.length === 0) {
        this.logger.warn('未发现任何包，退出')
        return
      }

      // 2. 验证依赖关系
      this.analyzer.validateDependencies(packages)

      // 3. 构建依赖图
      const dependencyGraph = this.analyzer.buildDependencyGraph(packages)

      // 4. 拓扑排序
      const buildOrder = this.analyzer.topologicalSort(dependencyGraph)

      // 5. 显示构建计划
      this.displayBuildPlan(packages, buildOrder)

      // 6. 执行构建
      if (!this.options.dryRun) {
        await this.builder.buildPackages(packages, buildOrder)
      } else {
        this.logger.info('DRY RUN 模式，跳过实际构建')
      }

    } catch (error) {
      this.logger.error(`构建失败: ${error}`)
      process.exit(1)
    }
  }

  /**
   * 显示构建计划
   */
  private displayBuildPlan(packages: PackageInfo[], buildOrder: string[][]): void {
    this.logger.title('📋 构建计划')

    const packageMap = new Map(packages.map(pkg => [pkg.name, pkg]))
    let totalToBuild = 0

    for (let i = 0; i < buildOrder.length; i++) {
      const level = buildOrder[i]
      const levelPackages = level
        .map(name => packageMap.get(name))
        .filter((pkg): pkg is PackageInfo => pkg !== undefined)

      const buildablePackages = levelPackages.filter(pkg => pkg.hasBuildScript)
      const skippedPackages = levelPackages.filter(pkg => !pkg.hasBuildScript)

      this.logger.info(`第 ${i + 1} 层:`)

      if (buildablePackages.length > 0) {
        this.logger.info(`  构建: ${buildablePackages.map(p => p.name).join(', ')}`)
        totalToBuild += buildablePackages.length
      }

      if (skippedPackages.length > 0) {
        this.logger.verbose(`  跳过: ${skippedPackages.map(p => p.name).join(', ')} (无构建脚本)`)
      }
    }

    this.logger.separator()
    this.logger.info(`总计: ${packages.length} 个包，${totalToBuild} 个需要构建`)

    if (this.options.parallel) {
      this.logger.info('构建模式: 并行 (同一层级的包将并行构建)')
    } else {
      this.logger.info('构建模式: 串行')
    }
  }
}

/**
 * 解析命令行参数
 */
function parseArguments(): BuildOptions {
  const args = process.argv.slice(2)
  const cwd = process.cwd()

  const options: BuildOptions = {
    dryRun: false,
    verbose: false,
    parallel: true, // 默认启用并行模式
    cwd,
    packagesDir: resolve(cwd, 'packages')
  }

  for (const arg of args) {
    switch (arg) {
      case '--dry-run':
        options.dryRun = true
        break
      case '--verbose':
        options.verbose = true
        break
      case '--parallel':
        options.parallel = true
        break
      case '--serial':
        options.parallel = false
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
      default:
        if (arg.startsWith('--')) {
          console.error(`未知参数: ${arg}`)
          process.exit(1)
        }
    }
  }

  return options
}

/**
 * 打印帮助信息
 */
function printHelp(): void {
  console.log(`
${colors.bright}LDesign Packages 批量打包工具${colors.reset}

${colors.cyan}用法:${colors.reset}
  tsx scripts/build-packages.ts [选项]

${colors.cyan}选项:${colors.reset}
  --dry-run     只分析依赖关系，不执行实际的打包操作
  --verbose     显示详细的日志输出
  --parallel    并行构建同一层级的包（默认启用）
  --serial      串行构建所有包（禁用并行模式）
  --help, -h    显示此帮助信息

${colors.cyan}示例:${colors.reset}
  tsx scripts/build-packages.ts                    # 并行构建所有包（默认）
  tsx scripts/build-packages.ts --serial           # 串行构建所有包
  tsx scripts/build-packages.ts --dry-run          # 只分析依赖关系
  tsx scripts/build-packages.ts --verbose          # 显示详细日志
  tsx scripts/build-packages.ts --dry-run --verbose # 详细分析模式

${colors.cyan}说明:${colors.reset}
  此工具会自动扫描 packages 目录下的所有 @ldesign 包，分析它们之间的依赖关系，
  并按照正确的顺序进行构建。基础包会先构建，依赖其他包的包会后构建。

  ${colors.yellow}注意:${colors.reset} 只有包含 build 脚本的包才会被构建。
`)
}

/**
 * 主入口函数
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments()
    const app = new BuildPackagesApp(options)
    await app.run()
  } catch (error) {
    console.error(`${colors.red}程序异常退出: ${error}${colors.reset}`)
    process.exit(1)
  }
}

// 运行主程序
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('build-packages.ts')) {
  main()
}
