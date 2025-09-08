/**
 * 构建工具检测器
 *
 * 用于检测和分析项目使用的构建工具配置
 * 支持 Vite、Webpack、Rollup、esbuild、tsup 等主流构建工具
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { glob } from 'glob'
import { BuildTool } from './types'

/**
 * 构建工具信息接口
 * 描述检测到的构建工具详细信息
 */
export interface BuildToolInfo {
  /** 构建工具类型 */
  tool: BuildTool
  /** 工具版本 */
  version?: string
  /** 配置文件路径列表 */
  configFiles: string[]
  /** 是否已安装 */
  isInstalled: boolean
  /** 是否为主要构建工具 */
  isPrimary: boolean
  /** 相关插件列表 */
  plugins: string[]
  /** 构建脚本命令 */
  buildScripts: string[]
  /** 支持的特性 */
  features: BuildToolFeature[]
}

/**
 * 构建工具特性枚举
 * 定义构建工具支持的特性
 */
export enum BuildToolFeature {
  /** 热重载 */
  HOT_RELOAD = 'hot-reload',
  /** 代码分割 */
  CODE_SPLITTING = 'code-splitting',
  /** 树摇优化 */
  TREE_SHAKING = 'tree-shaking',
  /** TypeScript 支持 */
  TYPESCRIPT = 'typescript',
  /** CSS 预处理器 */
  CSS_PREPROCESSOR = 'css-preprocessor',
  /** 静态资源处理 */
  ASSETS_HANDLING = 'assets-handling',
  /** 开发服务器 */
  DEV_SERVER = 'dev-server',
  /** 生产构建优化 */
  PRODUCTION_OPTIMIZATION = 'production-optimization',
  /** 模块联邦 */
  MODULE_FEDERATION = 'module-federation',
  /** PWA 支持 */
  PWA = 'pwa',
}

/**
 * 构建工具检测结果接口
 * 包含所有检测到的构建工具信息
 */
export interface BuildToolDetectionResult {
  /** 主要构建工具 */
  primaryTool: BuildToolInfo
  /** 所有检测到的构建工具 */
  allTools: BuildToolInfo[]
  /** 构建配置摘要 */
  configSummary: BuildConfigSummary
  /** 性能分析 */
  performanceAnalysis?: BuildPerformanceAnalysis
  /** 推荐的优化建议 */
  recommendations: string[]
}

/**
 * 构建配置摘要接口
 * 总结项目的构建配置情况
 */
export interface BuildConfigSummary {
  /** 入口文件 */
  entryPoints: string[]
  /** 输出目录 */
  outputDir: string
  /** 支持的文件类型 */
  supportedExtensions: string[]
  /** 环境配置 */
  environments: string[]
  /** 插件数量 */
  pluginCount: number
  /** 是否有代码分割 */
  hasCodeSplitting: boolean
  /** 是否有优化配置 */
  hasOptimization: boolean
}

/**
 * 构建性能分析接口
 * 分析构建工具的性能特征
 */
export interface BuildPerformanceAnalysis {
  /** 预期构建速度 */
  expectedBuildSpeed: 'fast' | 'medium' | 'slow'
  /** 开发体验评分 */
  devExperienceScore: number
  /** 生产构建质量评分 */
  productionQualityScore: number
  /** 学习曲线评估 */
  learningCurve: 'easy' | 'medium' | 'hard'
  /** 生态系统支持 */
  ecosystemSupport: 'excellent' | 'good' | 'limited'
}

/**
 * 构建工具检测器类
 * 提供构建工具的检测和分析功能
 */
export class BuildToolDetector {
  /** 项目根目录 */
  private projectRoot: string
  /** package.json 内容缓存 */
  private packageJsonCache?: any

  /**
   * 构造函数
   * @param projectRoot 项目根目录，默认为当前目录
   */
  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd()
  }

  /**
   * 检测项目的构建工具
   * 主入口方法，返回完整的构建工具检测结果
   *
   * @returns 构建工具检测结果
   */
  async detectBuildTools(): Promise<BuildToolDetectionResult> {
    const allTools = await this.scanForBuildTools()
    const primaryTool = this.determinePrimaryTool(allTools)
    const configSummary = await this.analyzeConfigSummary(allTools)
    const performanceAnalysis = this.analyzePerformance(primaryTool)
    const recommendations = this.generateRecommendations(allTools)

    return {
      primaryTool,
      allTools,
      configSummary,
      performanceAnalysis,
      recommendations,
    }
  }

  /**
   * 扫描所有构建工具
   * 检测项目中使用的所有构建工具
   *
   * @returns 构建工具信息列表
   */
  private async scanForBuildTools(): Promise<BuildToolInfo[]> {
    const packageJson = this.getPackageJson()
    const tools: BuildToolInfo[] = []

    // 定义构建工具检测配置
    const toolConfigs = [
      {
        tool: BuildTool.VITE,
        dependencies: ['vite', '@vitejs/plugin-vue', '@vitejs/plugin-react'],
        configFiles: ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'],
        scripts: ['dev', 'build', 'serve', 'preview'],
        features: [
          BuildToolFeature.HOT_RELOAD,
          BuildToolFeature.TYPESCRIPT,
          BuildToolFeature.DEV_SERVER,
          BuildToolFeature.TREE_SHAKING,
        ],
      },
      {
        tool: BuildTool.WEBPACK,
        dependencies: ['webpack', 'webpack-cli', 'webpack-dev-server'],
        configFiles: ['webpack.config.js', 'webpack.config.ts', 'webpack.*.js'],
        scripts: ['build', 'start', 'dev'],
        features: [
          BuildToolFeature.HOT_RELOAD,
          BuildToolFeature.CODE_SPLITTING,
          BuildToolFeature.MODULE_FEDERATION,
          BuildToolFeature.PRODUCTION_OPTIMIZATION,
        ],
      },
      {
        tool: BuildTool.ROLLUP,
        dependencies: ['rollup', '@rollup/plugin-typescript', '@rollup/plugin-node-resolve'],
        configFiles: ['rollup.config.js', 'rollup.config.ts', 'rollup.config.mjs'],
        scripts: ['build', 'watch'],
        features: [
          BuildToolFeature.TREE_SHAKING,
          BuildToolFeature.TYPESCRIPT,
          BuildToolFeature.CODE_SPLITTING,
        ],
      },
      {
        tool: BuildTool.ESBUILD,
        dependencies: ['esbuild'],
        configFiles: ['esbuild.config.js', 'esbuild.config.ts'],
        scripts: ['build'],
        features: [BuildToolFeature.TYPESCRIPT, BuildToolFeature.TREE_SHAKING],
      },
      {
        tool: BuildTool.TSUP,
        dependencies: ['tsup'],
        configFiles: ['tsup.config.ts', 'tsup.config.js'],
        scripts: ['build', 'dev'],
        features: [BuildToolFeature.TYPESCRIPT, BuildToolFeature.TREE_SHAKING],
      },
      {
        tool: BuildTool.PARCEL,
        dependencies: ['parcel', '@parcel/core'],
        configFiles: ['.parcelrc', 'parcel.config.js'],
        scripts: ['build', 'start'],
        features: [
          BuildToolFeature.HOT_RELOAD,
          BuildToolFeature.TYPESCRIPT,
          BuildToolFeature.ASSETS_HANDLING,
        ],
      },
    ]

    // 检测每个构建工具
    for (const config of toolConfigs) {
      const toolInfo = await this.detectSpecificTool(config, packageJson)
      if (toolInfo.isInstalled || toolInfo.configFiles.length > 0) {
        tools.push(toolInfo)
      }
    }

    return tools
  }

  /**
   * 检测特定构建工具
   *
   * @param config 工具配置
   * @param packageJson package.json 内容
   * @returns 构建工具信息
   */
  private async detectSpecificTool(
    config: {
      tool: BuildTool
      dependencies: string[]
      configFiles: string[]
      scripts: string[]
      features: BuildToolFeature[]
    },
    packageJson: any,
  ): Promise<BuildToolInfo> {
    const allDeps = {
      ...packageJson?.dependencies,
      ...packageJson?.devDependencies,
    }

    // 检查是否安装了相关依赖
    const isInstalled = config.dependencies.some(dep => dep in allDeps)

    // 获取版本信息
    let version: string | undefined
    for (const dep of config.dependencies) {
      if (dep in allDeps) {
        version = allDeps[dep]
        break
      }
    }

    // 检测配置文件
    const configFiles: string[] = []
    for (const pattern of config.configFiles) {
      try {
        const matches = glob.sync(pattern, { cwd: this.projectRoot })
        configFiles.push(...matches)
      }
      catch {
        // 忽略 glob 错误
      }
    }

    // 检查相关插件
    const plugins = Object.keys(allDeps).filter(
      dep => dep.includes(config.tool) && dep.includes('plugin'),
    )

    // 检查构建脚本
    const scripts = packageJson?.scripts || {}
    const buildScripts = config.scripts.filter(script => script in scripts)

    return {
      tool: config.tool,
      version,
      configFiles,
      isInstalled,
      isPrimary: false, // 将在后续确定
      plugins,
      buildScripts,
      features: config.features,
    }
  }

  /**
   * 确定主要构建工具
   * 基于安装情况和配置复杂度确定主要的构建工具
   *
   * @param tools 所有检测到的构建工具
   * @returns 主要构建工具
   */
  private determinePrimaryTool(tools: BuildToolInfo[]): BuildToolInfo {
    if (tools.length === 0) {
      return {
        tool: BuildTool.UNKNOWN,
        configFiles: [],
        isInstalled: false,
        isPrimary: true,
        plugins: [],
        buildScripts: [],
        features: [],
      }
    }

    // 计算每个工具的分数
    const scoredTools = tools.map(tool => ({
      tool,
      score: this.calculateToolScore(tool),
    }))

    // 按分数排序，选择分数最高的作为主要工具
    scoredTools.sort((a, b) => b.score - a.score)
    const primaryTool = { ...scoredTools[0]!.tool, isPrimary: true }

    return primaryTool
  }

  /**
   * 计算构建工具分数
   * 基于多个因素评估构建工具的重要性
   *
   * @param tool 构建工具信息
   * @returns 分数
   */
  private calculateToolScore(tool: BuildToolInfo): number {
    let score = 0

    // 基础分数：是否安装
    if (tool.isInstalled)
      score += 40

    // 配置文件数量
    score += tool.configFiles.length * 15

    // 插件数量
    score += tool.plugins.length * 5

    // 构建脚本数量
    score += tool.buildScripts.length * 10

    // 特殊工具的额外分数
    switch (tool.tool) {
      case BuildTool.VITE:
        score += 10 // Vite 是现代首选
        break
      case BuildTool.WEBPACK:
        score += 5 // Webpack 很常见但较重
        break
      case BuildTool.TSUP:
        score += 8 // tsup 对 TypeScript 友好
        break
    }

    return score
  }

  /**
   * 分析构建配置摘要
   *
   * @param tools 构建工具列表
   * @returns 构建配置摘要
   */
  private async analyzeConfigSummary(tools: BuildToolInfo[]): Promise<BuildConfigSummary> {
    const primaryTool = tools.find(t => t.isPrimary) || tools[0]

    if (!primaryTool) {
      return {
        entryPoints: [],
        outputDir: 'dist',
        supportedExtensions: ['.js', '.ts'],
        environments: ['development', 'production'],
        pluginCount: 0,
        hasCodeSplitting: false,
        hasOptimization: false,
      }
    }

    const config = await this.parseToolConfig(primaryTool)

    return {
      entryPoints: config.entryPoints || ['src/index.ts', 'src/main.ts', 'src/app.ts'],
      outputDir: config.outputDir || 'dist',
      supportedExtensions: this.getSupportedExtensions(primaryTool),
      environments: config.environments || ['development', 'production'],
      pluginCount: primaryTool.plugins.length,
      hasCodeSplitting: config.hasCodeSplitting || false,
      hasOptimization: config.hasOptimization || false,
    }
  }

  /**
   * 解析构建工具配置
   * 读取并解析构建工具的配置文件
   *
   * @param tool 构建工具信息
   * @returns 解析后的配置
   */
  private async parseToolConfig(tool: BuildToolInfo): Promise<any> {
    if (tool.configFiles.length === 0) {
      return {}
    }

    const configFile = tool.configFiles[0]
    if (!configFile) {
      return {}
    }
    const configPath = resolve(this.projectRoot, configFile)

    try {
      if (configFile.endsWith('.json')) {
        const content = readFileSync(configPath, 'utf-8')
        return JSON.parse(content)
      }
      else if (configFile.endsWith('.js') || configFile.endsWith('.ts')) {
        // 对于 JS/TS 配置文件，我们只能做静态分析
        return this.staticAnalyzeJSConfig(configPath)
      }
    }
    catch (error) {
      console.warn(`无法解析配置文件 ${configFile}:`, error)
    }

    return {}
  }

  /**
   * 静态分析 JavaScript/TypeScript 配置文件
   *
   * @param configPath 配置文件路径
   * @returns 分析结果
   */
  private staticAnalyzeJSConfig(configPath: string): any {
    try {
      const content = readFileSync(configPath, 'utf-8')

      const config: any = {
        hasCodeSplitting: content.includes('splitChunks') || content.includes('manualChunks'),
        hasOptimization: content.includes('optimization') || content.includes('minify'),
        entryPoints: this.extractEntryPoints(content),
        outputDir: this.extractOutputDir(content),
      }

      return config
    }
    catch {
      return {}
    }
  }

  /**
   * 从配置内容中提取入口点
   *
   * @param content 配置文件内容
   * @returns 入口点列表
   */
  private extractEntryPoints(content: string): string[] {
    const entryMatches = content.match(/entry[:\\s]*["']([^"']+)["']/g)
    if (entryMatches) {
      return (
        entryMatches
          .map((match) => {
            const result = match.match(/["']([^"']+)["']/)
            return result ? result[1] : ''
          })
          .filter(Boolean) as string[]
      )
    }
    return []
  }

  /**
   * 从配置内容中提取输出目录
   *
   * @param content 配置文件内容
   * @returns 输出目录
   */
  private extractOutputDir(content: string): string {
    const outputMatches = content.match(
      /output[:\\s]*["']([^"']+)["']|outDir[:\\s]*["']([^"']+)["']/,
    )
    if (outputMatches) {
      return outputMatches[1] || outputMatches[2] || 'dist'
    }
    return 'dist'
  }

  /**
   * 获取构建工具支持的文件扩展名
   *
   * @param tool 构建工具信息
   * @returns 支持的扩展名列表
   */
  private getSupportedExtensions(tool: BuildToolInfo): string[] {
    const baseExtensions = ['.js', '.ts', '.json']

    switch (tool.tool) {
      case BuildTool.VITE:
        return [...baseExtensions, '.vue', '.jsx', '.tsx', '.css', '.scss', '.less', '.svg', '.png']
      case BuildTool.WEBPACK:
        return [
          ...baseExtensions,
          '.jsx',
          '.tsx',
          '.vue',
          '.css',
          '.scss',
          '.less',
          '.png',
          '.jpg',
          '.svg',
        ]
      case BuildTool.ROLLUP:
        return [...baseExtensions, '.jsx', '.tsx', '.css']
      default:
        return baseExtensions
    }
  }

  /**
   * 分析构建工具性能
   * 评估构建工具的性能特征
   *
   * @param tool 构建工具信息
   * @returns 性能分析结果
   */
  private analyzePerformance(tool: BuildToolInfo): BuildPerformanceAnalysis {
    switch (tool.tool) {
      case BuildTool.VITE:
        return {
          expectedBuildSpeed: 'fast',
          devExperienceScore: 9,
          productionQualityScore: 8,
          learningCurve: 'easy',
          ecosystemSupport: 'excellent',
        }
      case BuildTool.ESBUILD:
        return {
          expectedBuildSpeed: 'fast',
          devExperienceScore: 7,
          productionQualityScore: 7,
          learningCurve: 'medium',
          ecosystemSupport: 'good',
        }
      case BuildTool.WEBPACK:
        return {
          expectedBuildSpeed: 'medium',
          devExperienceScore: 7,
          productionQualityScore: 9,
          learningCurve: 'hard',
          ecosystemSupport: 'excellent',
        }
      case BuildTool.ROLLUP:
        return {
          expectedBuildSpeed: 'medium',
          devExperienceScore: 6,
          productionQualityScore: 8,
          learningCurve: 'medium',
          ecosystemSupport: 'good',
        }
      case BuildTool.TSUP:
        return {
          expectedBuildSpeed: 'fast',
          devExperienceScore: 8,
          productionQualityScore: 8,
          learningCurve: 'easy',
          ecosystemSupport: 'good',
        }
      default:
        return {
          expectedBuildSpeed: 'medium',
          devExperienceScore: 5,
          productionQualityScore: 5,
          learningCurve: 'medium',
          ecosystemSupport: 'limited',
        }
    }
  }

  /**
   * 生成优化建议
   * 基于检测结果生成构建优化建议
   *
   * @param tools 构建工具列表
   * @returns 建议列表
   */
  private generateRecommendations(tools: BuildToolInfo[]): string[] {
    const recommendations: string[] = []

    if (tools.length === 0) {
      recommendations.push('建议添加构建工具以优化开发体验')
      recommendations.push('推荐使用 Vite 作为现代前端构建工具')
      return recommendations
    }

    const primaryTool = tools.find(t => t.isPrimary)
    if (!primaryTool)
      return recommendations

    // 基于主要工具生成建议
    switch (primaryTool.tool) {
      case BuildTool.WEBPACK:
        recommendations.push('考虑迁移到 Vite 以获得更快的开发体验')
        if (primaryTool.plugins.length < 3) {
          recommendations.push('可以添加更多 Webpack 插件来优化构建')
        }
        break

      case BuildTool.VITE:
        if (!primaryTool.features.includes(BuildToolFeature.PWA)) {
          recommendations.push('考虑添加 PWA 插件以支持离线访问')
        }
        break

      case BuildTool.ROLLUP:
        recommendations.push('Rollup 适合库开发，如果是应用开发建议考虑 Vite')
        break

      default:
        recommendations.push('建议使用更现代的构建工具如 Vite 或 esbuild')
    }

    // 通用建议
    if (tools.length > 2) {
      recommendations.push('检测到多个构建工具，建议统一使用一个主要构建工具')
    }

    if (!tools.some(t => t.features.includes(BuildToolFeature.TYPESCRIPT))) {
      recommendations.push('建议添加 TypeScript 支持以提高代码质量')
    }

    return recommendations
  }

  /**
   * 读取 package.json 文件
   *
   * @returns package.json 内容或 null
   */
  private getPackageJson(): any {
    if (this.packageJsonCache) {
      return this.packageJsonCache
    }

    const packageJsonPath = resolve(this.projectRoot, 'package.json')
    if (!existsSync(packageJsonPath)) {
      return null
    }

    try {
      const content = readFileSync(packageJsonPath, 'utf-8')
      this.packageJsonCache = JSON.parse(content)
      return this.packageJsonCache
    }
    catch (error) {
      console.warn('无法解析 package.json:', error)
      return null
    }
  }

  /**
   * 生成构建工具报告
   * 创建可读的构建工具检测报告
   *
   * @param result 检测结果
   * @returns 报告字符串
   */
  generateReport(result: BuildToolDetectionResult): string {
    const report: string[] = []

    report.push('# 构建工具分析报告')
    report.push('')

    // 主要构建工具
    report.push('## 主要构建工具')
    report.push(`工具: ${result.primaryTool.tool}`)
    if (result.primaryTool.version) {
      report.push(`版本: ${result.primaryTool.version}`)
    }
    report.push(`配置文件: ${result.primaryTool.configFiles.join(', ') || '无'}`)
    report.push(`插件数量: ${result.primaryTool.plugins.length}`)
    report.push('')

    // 所有工具
    if (result.allTools.length > 1) {
      report.push('## 所有检测到的构建工具')
      for (const tool of result.allTools) {
        report.push(`- ${tool.tool} ${tool.version ? `(${tool.version})` : ''}`)
      }
      report.push('')
    }

    // 配置摘要
    report.push('## 构建配置摘要')
    report.push(`入口文件: ${result.configSummary.entryPoints.join(', ')}`)
    report.push(`输出目录: ${result.configSummary.outputDir}`)
    report.push(`支持的文件类型: ${result.configSummary.supportedExtensions.join(', ')}`)
    report.push(`插件数量: ${result.configSummary.pluginCount}`)
    report.push(`代码分割: ${result.configSummary.hasCodeSplitting ? '是' : '否'}`)
    report.push(`构建优化: ${result.configSummary.hasOptimization ? '是' : '否'}`)
    report.push('')

    // 性能分析
    if (result.performanceAnalysis) {
      const perf = result.performanceAnalysis
      report.push('## 性能分析')
      report.push(`预期构建速度: ${perf.expectedBuildSpeed}`)
      report.push(`开发体验评分: ${perf.devExperienceScore}/10`)
      report.push(`生产构建质量: ${perf.productionQualityScore}/10`)
      report.push(`学习曲线: ${perf.learningCurve}`)
      report.push(`生态系统支持: ${perf.ecosystemSupport}`)
      report.push('')
    }

    // 优化建议
    if (result.recommendations.length > 0) {
      report.push('## 优化建议')
      for (const recommendation of result.recommendations) {
        report.push(`- ${recommendation}`)
      }
    }

    return report.join('\\n')
  }
}

/**
 * 创建构建工具检测器实例
 * 工厂函数，用于创建构建工具检测器
 *
 * @param projectRoot 项目根目录
 * @returns 构建工具检测器实例
 */
export function createBuildToolDetector(projectRoot?: string): BuildToolDetector {
  return new BuildToolDetector(projectRoot)
}

/**
 * 快速检测构建工具
 * 便捷函数，直接返回构建工具检测结果
 *
 * @param projectPath 项目路径，默认为当前目录
 * @returns 构建工具检测结果
 */
export async function detectBuildTools(projectPath?: string): Promise<BuildToolDetectionResult> {
  const detector = new BuildToolDetector(projectPath)
  return detector.detectBuildTools()
}
