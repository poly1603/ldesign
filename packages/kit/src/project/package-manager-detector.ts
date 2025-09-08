/**
 * 包管理器检测器
 *
 * 用于检测和分析项目使用的包管理器
 * 支持 npm、yarn、pnpm、bun 等主流包管理器
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PackageManager } from './types'

/**
 * 包管理器特性枚举
 * 定义包管理器支持的特性
 */
export enum PackageManagerFeature {
  /** 工作空间支持 */
  WORKSPACE = 'workspace',
  /** 缓存机制 */
  CACHING = 'caching',
  /** 符号链接优化 */
  SYMLINK_OPTIMIZATION = 'symlink-optimization',
  /** 零安装模式 */
  ZERO_INSTALL = 'zero-install',
  /** 安全审计 */
  SECURITY_AUDIT = 'security-audit',
  /** 依赖去重 */
  DEPENDENCY_DEDUPLICATION = 'dependency-deduplication',
  /** 离线模式 */
  OFFLINE_MODE = 'offline-mode',
  /** 并行安装 */
  PARALLEL_INSTALLATION = 'parallel-installation',
}

/**
 * 包管理器性能特征接口
 * 描述包管理器的性能表现
 */
export interface PackageManagerPerformance {
  /** 安装速度 */
  installSpeed: 'fast' | 'medium' | 'slow'
  /** 磁盘使用效率 */
  diskEfficiency: 'excellent' | 'good' | 'average'
  /** 内存使用 */
  memoryUsage: 'low' | 'medium' | 'high'
  /** 网络效率 */
  networkEfficiency: 'excellent' | 'good' | 'average'
  /** 缓存效果 */
  cacheEffectiveness: 'excellent' | 'good' | 'average'
}

/**
 * 包管理器信息接口
 * 描述检测到的包管理器详细信息
 */
export interface PackageManagerInfo {
  /** 包管理器类型 */
  type: PackageManager
  /** 包管理器版本 */
  version?: string
  /** 锁文件路径 */
  lockFile?: string
  /** 配置文件路径 */
  configFiles: string[]
  /** 是否已安装 */
  isInstalled: boolean
  /** 是否为活跃使用的管理器 */
  isActive: boolean
  /** 支持的特性 */
  features: PackageManagerFeature[]
  /** 性能特征 */
  performance: PackageManagerPerformance
}

/**
 * 包管理器检测结果接口
 * 包含所有检测到的包管理器信息
 */
export interface PackageManagerDetectionResult {
  /** 活跃的包管理器 */
  activeManager: PackageManagerInfo
  /** 所有检测到的包管理器 */
  allManagers: PackageManagerInfo[]
  /** 推荐的包管理器 */
  recommendedManager?: PackageManagerInfo
  /** 迁移建议 */
  migrationAdvice: string[]
  /** 配置优化建议 */
  optimizationTips: string[]
}

/**
 * 包管理器检测器类
 * 提供包管理器的检测和分析功能
 */
export class PackageManagerDetector {
  /** 项目根目录 */
  private projectRoot: string

  /**
   * 构造函数
   * @param projectRoot 项目根目录，默认为当前目录
   */
  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
  }

  /**
   * 检测包管理器
   * 主入口方法，返回完整的包管理器检测结果
   *
   * @returns 包管理器检测结果
   */
  async detectPackageManager(): Promise<PackageManagerDetectionResult> {
    const allManagers = await this.scanForPackageManagers()
    const activeManager = this.determineActiveManager(allManagers)
    const recommendedManager = this.getRecommendedManager(allManagers)
    const migrationAdvice = this.generateMigrationAdvice(activeManager, recommendedManager)
    const optimizationTips = this.generateOptimizationTips(activeManager)

    return {
      activeManager,
      allManagers,
      recommendedManager,
      migrationAdvice,
      optimizationTips,
    }
  }

  /**
   * 扫描所有包管理器
   * 检测系统中安装的所有包管理器
   *
   * @returns 包管理器信息列表
   */
  private async scanForPackageManagers(): Promise<PackageManagerInfo[]> {
    const managers: PackageManagerInfo[] = []

    // 定义包管理器检测配置
    const managerConfigs = [
      {
        type: PackageManager.NPM,
        lockFile: 'package-lock.json',
        configFiles: ['.npmrc'],
        command: 'npm',
        features: [
          PackageManagerFeature.WORKSPACE,
          PackageManagerFeature.SECURITY_AUDIT,
          PackageManagerFeature.OFFLINE_MODE,
        ],
        performance: {
          installSpeed: 'medium' as const,
          diskEfficiency: 'average' as const,
          memoryUsage: 'medium' as const,
          networkEfficiency: 'good' as const,
          cacheEffectiveness: 'good' as const,
        },
      },
      {
        type: PackageManager.YARN,
        lockFile: 'yarn.lock',
        configFiles: ['.yarnrc', '.yarnrc.yml'],
        command: 'yarn',
        features: [
          PackageManagerFeature.WORKSPACE,
          PackageManagerFeature.CACHING,
          PackageManagerFeature.ZERO_INSTALL,
          PackageManagerFeature.DEPENDENCY_DEDUPLICATION,
        ],
        performance: {
          installSpeed: 'fast' as const,
          diskEfficiency: 'good' as const,
          memoryUsage: 'medium' as const,
          networkEfficiency: 'excellent' as const,
          cacheEffectiveness: 'excellent' as const,
        },
      },
      {
        type: PackageManager.PNPM,
        lockFile: 'pnpm-lock.yaml',
        configFiles: ['.pnpmfile.cjs', 'pnpm-workspace.yaml'],
        command: 'pnpm',
        features: [
          PackageManagerFeature.WORKSPACE,
          PackageManagerFeature.CACHING,
          PackageManagerFeature.SYMLINK_OPTIMIZATION,
          PackageManagerFeature.DEPENDENCY_DEDUPLICATION,
          PackageManagerFeature.PARALLEL_INSTALLATION,
        ],
        performance: {
          installSpeed: 'fast' as const,
          diskEfficiency: 'excellent' as const,
          memoryUsage: 'low' as const,
          networkEfficiency: 'excellent' as const,
          cacheEffectiveness: 'excellent' as const,
        },
      },
      {
        type: PackageManager.BUN,
        lockFile: 'bun.lockb',
        configFiles: ['bunfig.toml'],
        command: 'bun',
        features: [
          PackageManagerFeature.WORKSPACE,
          PackageManagerFeature.CACHING,
          PackageManagerFeature.PARALLEL_INSTALLATION,
        ],
        performance: {
          installSpeed: 'fast' as const,
          diskEfficiency: 'good' as const,
          memoryUsage: 'low' as const,
          networkEfficiency: 'excellent' as const,
          cacheEffectiveness: 'good' as const,
        },
      },
    ]

    // 检测每个包管理器
    for (const config of managerConfigs) {
      const managerInfo = await this.detectSpecificManager(config)
      managers.push(managerInfo)
    }

    return managers
  }

  /**
   * 检测特定包管理器
   *
   * @param config 包管理器配置
   * @returns 包管理器信息
   */
  private async detectSpecificManager(config: {
    type: PackageManager
    lockFile: string
    configFiles: string[]
    command: string
    features: PackageManagerFeature[]
    performance: PackageManagerPerformance
  }): Promise<PackageManagerInfo> {
    // 检查锁文件
    const lockFilePath = resolve(this.projectRoot, config.lockFile)
    const hasLockFile = existsSync(lockFilePath)

    // 检查配置文件
    const existingConfigFiles = config.configFiles.filter(file =>
      existsSync(resolve(this.projectRoot, file)),
    )

    // 检查是否已安装
    const version = await this.getManagerVersion(config.command)
    const isInstalled = version !== null

    // 确定是否为活跃管理器
    const isActive = hasLockFile || existingConfigFiles.length > 0

    return {
      type: config.type,
      version: version || undefined,
      lockFile: hasLockFile ? config.lockFile : undefined,
      configFiles: existingConfigFiles,
      isInstalled,
      isActive,
      features: config.features,
      performance: config.performance,
    }
  }

  /**
   * 获取包管理器版本
   * 通过命令行检查包管理器版本
   *
   * @param command 包管理器命令
   * @returns 版本号或 null
   */
  private async getManagerVersion(command: string): Promise<string | null> {
    try {
      const version = await this.runCommand(command, ['--version'])
      return version.trim()
    }
    catch {
      return null
    }
  }

  /**
   * 运行命令并获取输出
   *
   * @param command 命令名
   * @param args 命令参数
   * @returns 命令输出
   */
  private async runCommand(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout)
        }
        else {
          reject(new Error(stderr || stdout))
        }
      })

      child.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * 确定活跃的包管理器
   * 基于锁文件和使用情况确定当前活跃的包管理器
   *
   * @param managers 所有包管理器信息
   * @returns 活跃的包管理器
   */
  private determineActiveManager(managers: PackageManagerInfo[]): PackageManagerInfo {
    // 优先选择有锁文件的管理器
    const withLockFile = managers.filter(m => m.lockFile)
    if (withLockFile.length === 1) {
      const first = withLockFile[0]
      if (first)
        return { ...first, isActive: true }
    }

    // 如果有多个锁文件，按优先级选择
    const priorityOrder = [
      PackageManager.PNPM,
      PackageManager.YARN,
      PackageManager.BUN,
      PackageManager.NPM,
    ]

    for (const type of priorityOrder) {
      const manager = managers.find(m => m.type === type && m.lockFile)
      if (manager) {
        return { ...manager, isActive: true }
      }
    }

    // 如果没有锁文件，选择已安装的管理器
    const installed = managers.filter(m => m.isInstalled)
    if (installed.length > 0) {
      const firstInstalled = installed[0]
      if (firstInstalled)
        return { ...firstInstalled, isActive: true }
    }

    // 默认返回 npm
    const npmManager = managers.find(m => m.type === PackageManager.NPM)
    return npmManager
      ? { ...npmManager, isActive: true }
      : {
          type: PackageManager.NPM,
          configFiles: [],
          isInstalled: false,
          isActive: true,
          features: [],
          performance: {
            installSpeed: 'medium',
            diskEfficiency: 'average',
            memoryUsage: 'medium',
            networkEfficiency: 'good',
            cacheEffectiveness: 'good',
          },
        }
  }

  /**
   * 获取推荐的包管理器
   * 基于项目特征和性能要求推荐最适合的包管理器
   *
   * @param managers 所有包管理器信息
   * @returns 推荐的包管理器
   */
  private getRecommendedManager(managers: PackageManagerInfo[]): PackageManagerInfo | undefined {
    // 如果项目很大或是 monorepo，推荐 pnpm
    if (this.isLargeProject() || this.isMonorepo()) {
      return managers.find(m => m.type === PackageManager.PNPM && m.isInstalled)
    }

    // 如果需要最新特性，推荐 bun
    if (this.needsModernFeatures()) {
      return managers.find(m => m.type === PackageManager.BUN && m.isInstalled)
    }

    // 默认推荐 pnpm（性能最好）
    return (
      managers.find(m => m.type === PackageManager.PNPM && m.isInstalled)
      || managers.find(m => m.type === PackageManager.YARN && m.isInstalled)
    )
  }

  /**
   * 检查是否为大型项目
   *
   * @returns 是否为大型项目
   */
  private isLargeProject(): boolean {
    try {
      const packageJson = JSON.parse(
        readFileSync(resolve(this.projectRoot, 'package.json'), 'utf-8'),
      )
      const depCount = Object.keys({
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }).length
      return depCount > 50
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否为 monorepo
   *
   * @returns 是否为 monorepo
   */
  private isMonorepo(): boolean {
    const monorepoFiles = ['lerna.json', 'rush.json', 'pnpm-workspace.yaml', 'workspaces']

    return (
      monorepoFiles.some(file => existsSync(resolve(this.projectRoot, file)))
      || this.hasWorkspacesInPackageJson()
    )
  }

  /**
   * 检查 package.json 中是否定义了工作空间
   *
   * @returns 是否定义了工作空间
   */
  private hasWorkspacesInPackageJson(): boolean {
    try {
      const packageJson = JSON.parse(
        readFileSync(resolve(this.projectRoot, 'package.json'), 'utf-8'),
      )
      return Boolean(packageJson.workspaces)
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否需要现代特性
   *
   * @returns 是否需要现代特性
   */
  private needsModernFeatures(): boolean {
    try {
      const packageJson = JSON.parse(
        readFileSync(resolve(this.projectRoot, 'package.json'), 'utf-8'),
      )
      const modernDeps = ['vite', 'esbuild', 'typescript', '@types/node']
      return modernDeps.some(
        dep => dep in packageJson.dependencies || dep in packageJson.devDependencies,
      )
    }
    catch {
      return false
    }
  }

  /**
   * 生成迁移建议
   * 基于当前和推荐的包管理器生成迁移建议
   *
   * @param current 当前包管理器
   * @param recommended 推荐包管理器
   * @returns 迁移建议列表
   */
  private generateMigrationAdvice(
    current: PackageManagerInfo,
    recommended?: PackageManagerInfo,
  ): string[] {
    const advice: string[] = []

    if (!recommended || current.type === recommended.type) {
      return advice
    }

    advice.push(`建议从 ${current.type} 迁移到 ${recommended.type}`)
    advice.push(`迁移原因: ${this.getMigrationReason(current, recommended)}`)

    // 迁移步骤
    switch (recommended.type) {
      case PackageManager.PNPM:
        advice.push('迁移步骤:')
        advice.push('1. 删除 node_modules 和现有锁文件')
        advice.push('2. 安装 pnpm: npm install -g pnpm')
        advice.push('3. 运行 pnpm install')
        advice.push('4. 更新 CI/CD 脚本使用 pnpm')
        break

      case PackageManager.YARN:
        advice.push('迁移步骤:')
        advice.push('1. 删除 node_modules 和现有锁文件')
        advice.push('2. 安装 yarn: npm install -g yarn')
        advice.push('3. 运行 yarn install')
        advice.push('4. 更新 CI/CD 脚本使用 yarn')
        break

      case PackageManager.BUN:
        advice.push('迁移步骤:')
        advice.push('1. 删除 node_modules 和现有锁文件')
        advice.push('2. 安装 bun: https://bun.sh/')
        advice.push('3. 运行 bun install')
        advice.push('4. 更新脚本使用 bun')
        break
    }

    return advice
  }

  /**
   * 获取迁移原因
   *
   * @param current 当前包管理器
   * @param recommended 推荐包管理器
   * @returns 迁移原因
   */
  private getMigrationReason(current: PackageManagerInfo, recommended: PackageManagerInfo): string {
    const reasons: string[] = []

    if (
      recommended.performance.installSpeed === 'fast'
      && current.performance.installSpeed !== 'fast'
    ) {
      reasons.push('更快的安装速度')
    }

    if (
      recommended.performance.diskEfficiency === 'excellent'
      && current.performance.diskEfficiency !== 'excellent'
    ) {
      reasons.push('更好的磁盘空间利用率')
    }

    if (recommended.features.includes(PackageManagerFeature.SYMLINK_OPTIMIZATION)) {
      reasons.push('符号链接优化')
    }

    if (recommended.features.includes(PackageManagerFeature.WORKSPACE) && this.isMonorepo()) {
      reasons.push('更好的 monorepo 支持')
    }

    return reasons.join('、') || '更好的整体性能'
  }

  /**
   * 生成优化建议
   * 基于当前包管理器生成配置优化建议
   *
   * @param manager 包管理器信息
   * @returns 优化建议列表
   */
  private generateOptimizationTips(manager: PackageManagerInfo): string[] {
    const tips: string[] = []

    switch (manager.type) {
      case PackageManager.NPM:
        tips.push('配置 .npmrc 以启用缓存优化')
        tips.push('使用 npm ci 在 CI 环境中进行更快的安装')
        if (!manager.configFiles.includes('.npmrc')) {
          tips.push('创建 .npmrc 文件配置镜像源')
        }
        break

      case PackageManager.YARN:
        tips.push('启用 Yarn PnP 模式以提高性能')
        tips.push('配置 .yarnrc.yml 优化网络请求')
        if (this.isMonorepo()) {
          tips.push('使用 yarn workspaces 管理 monorepo')
        }
        break

      case PackageManager.PNPM:
        tips.push('配置 .pnpmfile.cjs 进行依赖修正')
        if (this.isMonorepo()) {
          tips.push('创建 pnpm-workspace.yaml 配置工作空间')
        }
        tips.push('使用 pnpm store prune 清理无用缓存')
        break

      case PackageManager.BUN:
        tips.push('配置 bunfig.toml 优化安装行为')
        tips.push('使用 bun install --frozen-lockfile 在 CI 中安装')
        break
    }

    return tips
  }

  /**
   * 生成包管理器报告
   * 创建可读的包管理器检测报告
   *
   * @param result 检测结果
   * @returns 报告字符串
   */
  generateReport(result: PackageManagerDetectionResult): string {
    const report: string[] = []

    report.push('# 包管理器分析报告')
    report.push('')

    // 当前包管理器
    report.push('## 当前包管理器')
    report.push(`类型: ${result.activeManager.type}`)
    if (result.activeManager.version) {
      report.push(`版本: ${result.activeManager.version}`)
    }
    report.push(`锁文件: ${result.activeManager.lockFile || '无'}`)
    report.push(`配置文件: ${result.activeManager.configFiles.join(', ') || '无'}`)
    report.push('')

    // 性能特征
    const perf = result.activeManager.performance
    report.push('## 性能特征')
    report.push(`安装速度: ${perf.installSpeed}`)
    report.push(`磁盘效率: ${perf.diskEfficiency}`)
    report.push(`内存使用: ${perf.memoryUsage}`)
    report.push(`网络效率: ${perf.networkEfficiency}`)
    report.push(`缓存效果: ${perf.cacheEffectiveness}`)
    report.push('')

    // 支持特性
    report.push('## 支持特性')
    for (const feature of result.activeManager.features) {
      report.push(`- ${feature}`)
    }
    report.push('')

    // 推荐管理器
    if (result.recommendedManager && result.recommendedManager.type !== result.activeManager.type) {
      report.push('## 推荐包管理器')
      report.push(`推荐使用: ${result.recommendedManager.type}`)
      if (result.migrationAdvice.length > 0) {
        report.push('### 迁移建议')
        for (const advice of result.migrationAdvice) {
          report.push(`${advice}`)
        }
      }
      report.push('')
    }

    // 优化建议
    if (result.optimizationTips.length > 0) {
      report.push('## 优化建议')
      for (const tip of result.optimizationTips) {
        report.push(`- ${tip}`)
      }
    }

    return report.join('\n')
  }
}

/**
 * 创建包管理器检测器实例
 * 工厂函数，用于创建包管理器检测器
 *
 * @param projectRoot 项目根目录
 * @returns 包管理器检测器实例
 */
export function createPackageManagerDetector(projectRoot?: string): PackageManagerDetector {
  return new PackageManagerDetector(projectRoot)
}

/**
 * 快速检测包管理器
 * 便捷函数，直接返回包管理器检测结果
 *
 * @param projectPath 项目路径，默认为当前目录
 * @returns 包管理器检测结果
 */
export async function detectPackageManager(
  projectPath?: string,
): Promise<PackageManagerDetectionResult> {
  const detector = new PackageManagerDetector(projectPath)
  return detector.detectPackageManager()
}
