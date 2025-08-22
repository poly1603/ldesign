/**
 * @fileoverview 项目检测器实现类
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import path from 'node:path'
import type {
  DetectionResult,
  DetectionReport,
  DetectionStep,
  FrameworkType,
  IProjectDetector,
  PackageManager,
  ProjectType,
  CSSPreprocessor,
  PackageInfo,
} from '../types'
import { ERROR_CODES } from '../types'
import {
  exists,
  readFile,
  readPackageJson,
  searchFiles,
  logger,
  createTimer,
} from '../utils'
import { FRAMEWORK_PATTERNS, FILE_PATHS } from '../constants'
import { ErrorHandler } from './ErrorHandler'

/**
 * 项目检测器实现类
 * 负责检测项目类型、框架、依赖等信息
 * 
 * @example
 * ```typescript
 * const detector = new ProjectDetector()
 * const result = await detector.detectProjectType('/path/to/project')
 * console.log(`检测到项目类型: ${result.projectType}`)
 * ```
 */
export class ProjectDetector implements IProjectDetector {
  private readonly errorHandler: ErrorHandler

  constructor() {
    this.errorHandler = new ErrorHandler()
  }

  /**
   * 检测项目类型
   * @param root 项目根目录路径
   * @returns 检测结果
   */
  async detectProjectType(root: string): Promise<DetectionResult> {
    const timer = createTimer('Project Detection')
    const startTime = new Date()
    const steps: DetectionStep[] = []

    try {
      logger.info(`开始检测项目类型: ${root}`)

      // 验证项目根目录
      await this.validateProjectRoot(root, steps)

      // 读取 package.json
      const packageInfo = await this.readPackageInfo(root, steps)

      // 检测框架类型
      const framework = await this.detectFramework(root, packageInfo, steps)

      // 检测 TypeScript 使用情况
      const hasTypeScript = await this.detectTypeScript(root, steps)

      // 检测 CSS 预处理器
      const cssPreprocessor = await this.detectCSSPreprocessor(root, steps)

      // 检测包管理器
      const packageManager = await this.detectPackageManager(root, steps)

      // 计算置信度
      const confidence = this.calculateConfidence(framework, packageInfo, steps)

      // 构建检测报告
      const report: DetectionReport = {
        detectedFiles: await this.getDetectedFiles(root),
        detectedDependencies: this.extractDependencyNames(packageInfo),
        dependencies: packageInfo.dependencies,
        devDependencies: packageInfo.devDependencies,
        confidence,
        steps,
        duration: Date.now() - startTime.getTime(),
        startTime,
        projectRoot: root,
      }

      timer.end('completed successfully')

      const result: DetectionResult = {
        projectType: this.determineProjectType(framework),
        framework,
        confidence,
        report,
        success: true,
      }

      logger.success(`项目检测完成: ${framework} (置信度: ${confidence.toFixed(1)}%)`)
      return result

    } catch (error) {
      timer.end('failed')
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'project type detection'
      )

      steps.push({
        name: 'error',
        description: '检测过程中发生错误',
        result: 'failed',
        message: launcherError.message,
        error: launcherError.message,
        duration: Date.now() - startTime.getTime(),
        startTime,
      })

      return {
        projectType: 'unknown',
        framework: 'vanilla',
        confidence: 0,
        report: {
          detectedFiles: [],
          detectedDependencies: [],
          dependencies: {},
          devDependencies: {},
          confidence: 0,
          steps,
          duration: Date.now() - startTime.getTime(),
          startTime,
          projectRoot: root,
        },
        error: launcherError,
        success: false,
      }
    }
  }

  /**
   * 检测框架类型
   * @param root 项目根目录
   * @returns 框架类型
   */
  async detectFramework(root: string): Promise<FrameworkType> {
    const result = await this.detectProjectType(root)
    return result.framework
  }

  /**
   * 检测 TypeScript 使用情况
   * @param root 项目根目录
   * @returns 是否使用 TypeScript
   */
  async detectTypeScript(root: string): Promise<boolean> {
    const steps: DetectionStep[] = []
    return this.detectTypeScript(root, steps)
  }

  /**
   * 检测 CSS 预处理器
   * @param root 项目根目录
   * @returns CSS 预处理器类型
   */
  async detectCSSPreprocessor(root: string): Promise<CSSPreprocessor | undefined> {
    const steps: DetectionStep[] = []
    return this.detectCSSPreprocessor(root, steps)
  }

  /**
   * 检测包管理器
   * @param root 项目根目录
   * @returns 包管理器类型
   */
  async detectPackageManager(root: string): Promise<PackageManager> {
    const steps: DetectionStep[] = []
    return this.detectPackageManager(root, steps)
  }

  /**
   * 验证项目结构
   * @param root 项目根目录
   * @returns 是否有效
   */
  async validateProjectStructure(root: string): Promise<boolean> {
    try {
      const steps: DetectionStep[] = []
      await this.validateProjectRoot(root, steps)
      return steps.every(step => step.result === 'success')
    } catch {
      return false
    }
  }

  /**
   * 验证项目根目录
   * @param root 项目根目录路径
   * @param steps 检测步骤数组
   */
  private async validateProjectRoot(root: string, steps: DetectionStep[]): Promise<void> {
    const stepStart = Date.now()

    try {
      // 检查目录是否存在
      const exists = await this.checkPathExists(root)
      if (!exists) {
        throw this.errorHandler.createError(
          ERROR_CODES.INVALID_PROJECT_ROOT,
          `项目根目录不存在: ${root}`
        )
      }

      // 检查是否为目录
      const isDirectory = await this.checkIsDirectory(root)
      if (!isDirectory) {
        throw this.errorHandler.createError(
          ERROR_CODES.INVALID_PROJECT_ROOT,
          `路径不是目录: ${root}`
        )
      }

      steps.push({
        name: 'validate_root',
        description: '验证项目根目录',
        result: 'success',
        message: '项目根目录验证通过',
        success: true,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

    } catch (error) {
      steps.push({
        name: 'validate_root',
        description: '验证项目根目录',
        result: 'failed',
        message: '项目根目录验证失败',
        error: (error as Error).message,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })
      throw error
    }
  }

  /**
   * 读取包信息
   * @param root 项目根目录
   * @param steps 检测步骤数组
   * @returns 包信息
   */
  private async readPackageInfo(root: string, steps: DetectionStep[]): Promise<PackageInfo> {
    const stepStart = Date.now()

    try {
      const packageInfo = await readPackageJson(root)

      steps.push({
        name: 'read_package',
        description: '读取 package.json',
        result: 'success',
        message: `成功读取 package.json (${packageInfo.name})`,
        success: true,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return packageInfo

    } catch (error) {
      // package.json 不存在时创建默认信息
      const defaultPackageInfo: PackageInfo = {
        name: 'unknown-project',
        version: '0.0.0',
        scripts: {},
        dependencies: {},
        devDependencies: {},
        peerDependencies: {},
        optionalDependencies: {},
        keywords: [],
      }

      steps.push({
        name: 'read_package',
        description: '读取 package.json',
        result: 'skipped',
        message: 'package.json 不存在，使用默认配置',
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return defaultPackageInfo
    }
  }

  /**
   * 检测框架类型（内部实现）
   * @param root 项目根目录
   * @param packageInfo 包信息
   * @param steps 检测步骤数组
   * @returns 框架类型
   */
  private async detectFramework(
    root: string,
    packageInfo: PackageInfo,
    steps: DetectionStep[]
  ): Promise<FrameworkType> {
    const stepStart = Date.now()

    try {
      // 基于依赖检测
      const frameworkFromDeps = this.detectFrameworkFromDependencies(packageInfo)
      
      // 基于文件检测
      const frameworkFromFiles = await this.detectFrameworkFromFiles(root)

      // 综合判断
      let detectedFramework: FrameworkType = 'vanilla'
      let confidence = 0

      for (const [framework, pattern] of Object.entries(FRAMEWORK_PATTERNS)) {
        let score = 0

        // 依赖匹配度
        if (frameworkFromDeps === framework) {
          score += 0.6
        }

        // 文件匹配度
        if (frameworkFromFiles === framework) {
          score += 0.4
        }

        if (score > confidence) {
          confidence = score
          detectedFramework = framework as FrameworkType
        }
      }

      steps.push({
        name: 'detect_framework',
        description: '检测前端框架',
        result: 'success',
        message: `检测到框架: ${detectedFramework} (置信度: ${(confidence * 100).toFixed(1)}%)`,
        success: true,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return detectedFramework

    } catch (error) {
      steps.push({
        name: 'detect_framework',
        description: '检测前端框架',
        result: 'failed',
        message: '框架检测失败，使用默认值',
        error: (error as Error).message,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return 'vanilla'
    }
  }

  /**
   * 基于依赖检测框架
   * @param packageInfo 包信息
   * @returns 框架类型
   */
  private detectFrameworkFromDependencies(packageInfo: PackageInfo): FrameworkType {
    const allDeps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies,
    }

    // Vue 3
    if (allDeps['vue'] && (allDeps['vue'].startsWith('^3') || allDeps['vue'].startsWith('3'))) {
      return 'vue3'
    }

    // Vue 2
    if (allDeps['vue'] && (allDeps['vue'].startsWith('^2') || allDeps['vue'].startsWith('2'))) {
      return 'vue2'
    }

    // React
    if (allDeps['react'] || allDeps['react-dom']) {
      return 'react'
    }

    // Svelte
    if (allDeps['svelte']) {
      return 'svelte'
    }

    // Lit
    if (allDeps['lit']) {
      return 'lit'
    }

    // Angular
    if (allDeps['@angular/core']) {
      return 'angular'
    }

    return 'vanilla'
  }

  /**
   * 基于文件检测框架
   * @param root 项目根目录
   * @returns 框架类型
   */
  private async detectFrameworkFromFiles(root: string): Promise<FrameworkType> {
    try {
      // 检测 Vue 文件
      const vueFiles = await searchFiles({
        pattern: path.join(root, '**/*.vue'),
        ignore: ['node_modules/**'],
      })
      if (vueFiles.length > 0) {
        return 'vue3' // 默认为 Vue 3，具体版本通过依赖确定
      }

      // 检测 React/JSX 文件
      const reactFiles = await searchFiles({
        pattern: path.join(root, '**/*.{jsx,tsx}'),
        ignore: ['node_modules/**'],
      })
      if (reactFiles.length > 0) {
        return 'react'
      }

      // 检测 Svelte 文件
      const svelteFiles = await searchFiles({
        pattern: path.join(root, '**/*.svelte'),
        ignore: ['node_modules/**'],
      })
      if (svelteFiles.length > 0) {
        return 'svelte'
      }

      // 检测 Angular 文件
      const angularFiles = await searchFiles({
        pattern: path.join(root, '**/*.component.ts'),
        ignore: ['node_modules/**'],
      })
      if (angularFiles.length > 0) {
        return 'angular'
      }

      return 'vanilla'

    } catch (error) {
      logger.warn('文件检测失败:', (error as Error).message)
      return 'vanilla'
    }
  }

  /**
   * 检测 TypeScript 使用情况（内部实现）
   * @param root 项目根目录
   * @param steps 检测步骤数组
   * @returns 是否使用 TypeScript
   */
  private async detectTypeScript(root: string, steps: DetectionStep[]): Promise<boolean> {
    const stepStart = Date.now()

    try {
      // 检查 tsconfig.json
      for (const configFile of FILE_PATHS.TS_CONFIG_FILES) {
        const configPath = path.join(root, configFile)
        if (await exists(configPath)) {
          steps.push({
            name: 'detect_typescript',
            description: '检测 TypeScript',
            result: 'success',
            message: `发现 TypeScript 配置文件: ${configFile}`,
            success: true,
            duration: Date.now() - stepStart,
            startTime: new Date(stepStart),
          })
          return true
        }
      }

      // 检查 .ts/.tsx 文件
      const tsFiles = await searchFiles({
        pattern: path.join(root, '**/*.{ts,tsx}'),
        ignore: ['node_modules/**', 'dist/**'],
        maxDepth: 3,
      })

      if (tsFiles.length > 0) {
        steps.push({
          name: 'detect_typescript',
          description: '检测 TypeScript',
          result: 'success',
          message: `发现 ${tsFiles.length} 个 TypeScript 文件`,
          success: true,
          duration: Date.now() - stepStart,
          startTime: new Date(stepStart),
        })
        return true
      }

      steps.push({
        name: 'detect_typescript',
        description: '检测 TypeScript',
        result: 'success',
        message: '未检测到 TypeScript 使用',
        success: true,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return false

    } catch (error) {
      steps.push({
        name: 'detect_typescript',
        description: '检测 TypeScript',
        result: 'failed',
        message: 'TypeScript 检测失败',
        error: (error as Error).message,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return false
    }
  }

  /**
   * 检测 CSS 预处理器（内部实现）
   * @param root 项目根目录
   * @param steps 检测步骤数组
   * @returns CSS 预处理器类型
   */
  private async detectCSSPreprocessor(
    root: string,
    steps: DetectionStep[]
  ): Promise<CSSPreprocessor | undefined> {
    const stepStart = Date.now()

    try {
      const preprocessors = ['scss', 'sass', 'less', 'styl', 'stylus']
      const detectedPreprocessors: CSSPreprocessor[] = []

      for (const ext of preprocessors) {
        const files = await searchFiles({
          pattern: path.join(root, `**/*.${ext}`),
          ignore: ['node_modules/**'],
          maxDepth: 3,
        })

        if (files.length > 0) {
          const preprocessor = ext === 'styl' ? 'stylus' : (ext as CSSPreprocessor)
          detectedPreprocessors.push(preprocessor)
        }
      }

      if (detectedPreprocessors.length > 0) {
        const result = detectedPreprocessors[0] // 使用第一个检测到的
        steps.push({
          name: 'detect_css_preprocessor',
          description: '检测 CSS 预处理器',
          result: 'success',
          message: `检测到 CSS 预处理器: ${result}`,
          success: true,
          duration: Date.now() - stepStart,
          startTime: new Date(stepStart),
        })
        return result
      }

      steps.push({
        name: 'detect_css_preprocessor',
        description: '检测 CSS 预处理器',
        result: 'success',
        message: '未检测到 CSS 预处理器',
        success: true,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return undefined

    } catch (error) {
      steps.push({
        name: 'detect_css_preprocessor',
        description: '检测 CSS 预处理器',
        result: 'failed',
        message: 'CSS 预处理器检测失败',
        error: (error as Error).message,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return undefined
    }
  }

  /**
   * 检测包管理器（内部实现）
   * @param root 项目根目录
   * @param steps 检测步骤数组
   * @returns 包管理器类型
   */
  private async detectPackageManager(root: string, steps: DetectionStep[]): Promise<PackageManager> {
    const stepStart = Date.now()

    try {
      // 检查锁文件
      const lockFiles: Array<[string, PackageManager]> = [
        ['pnpm-lock.yaml', 'pnpm'],
        ['yarn.lock', 'yarn'],
        ['bun.lockb', 'bun'],
        ['package-lock.json', 'npm'],
      ]

      for (const [lockFile, manager] of lockFiles) {
        const lockPath = path.join(root, lockFile)
        if (await exists(lockPath)) {
          steps.push({
            name: 'detect_package_manager',
            description: '检测包管理器',
            result: 'success',
            message: `检测到包管理器: ${manager} (${lockFile})`,
            success: true,
            duration: Date.now() - stepStart,
            startTime: new Date(stepStart),
          })
          return manager
        }
      }

      steps.push({
        name: 'detect_package_manager',
        description: '检测包管理器',
        result: 'success',
        message: '未找到锁文件，默认使用 npm',
        success: true,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return 'npm'

    } catch (error) {
      steps.push({
        name: 'detect_package_manager',
        description: '检测包管理器',
        result: 'failed',
        message: '包管理器检测失败，默认使用 npm',
        error: (error as Error).message,
        duration: Date.now() - stepStart,
        startTime: new Date(stepStart),
      })

      return 'npm'
    }
  }

  /**
   * 计算检测置信度
   * @param framework 检测到的框架
   * @param packageInfo 包信息
   * @param steps 检测步骤
   * @returns 置信度 (0-100)
   */
  private calculateConfidence(
    framework: FrameworkType,
    packageInfo: PackageInfo,
    steps: DetectionStep[]
  ): number {
    let confidence = 0

    // 基础分数
    if (framework !== 'vanilla') {
      confidence += 30
    }

    // package.json 存在加分
    if (packageInfo.name !== 'unknown-project') {
      confidence += 20
    }

    // 依赖匹配加分
    const pattern = FRAMEWORK_PATTERNS[framework]
    if (pattern) {
      const allDeps = { ...packageInfo.dependencies, ...packageInfo.devDependencies }
      const matchedDeps = pattern.dependencies.filter(dep => dep in allDeps)
      confidence += matchedDeps.length * 15
    }

    // 成功步骤加分
    const successSteps = steps.filter(step => step.result === 'success').length
    confidence += successSteps * 5

    return Math.min(confidence, 100)
  }

  /**
   * 确定项目类型
   * @param framework 框架类型
   * @returns 项目类型
   */
  private determineProjectType(framework: FrameworkType): ProjectType {
    // 项目类型和框架类型基本一致
    return framework as ProjectType
  }

  /**
   * 获取检测到的文件列表
   * @param root 项目根目录
   * @returns 文件列表
   */
  private async getDetectedFiles(root: string): Promise<string[]> {
    try {
      const files = await searchFiles({
        pattern: path.join(root, '**/*'),
        ignore: ['node_modules/**', '.git/**', 'dist/**'],
        maxDepth: 2,
      })
      return files.map(file => path.relative(root, file))
    } catch {
      return []
    }
  }

  /**
   * 提取依赖名称
   * @param packageInfo 包信息
   * @returns 依赖名称列表
   */
  private extractDependencyNames(packageInfo: PackageInfo): string[] {
    return [
      ...Object.keys(packageInfo.dependencies),
      ...Object.keys(packageInfo.devDependencies),
    ]
  }

  /**
   * 检查路径是否存在
   * @param filePath 文件路径
   * @returns 是否存在
   */
  private async checkPathExists(filePath: string): Promise<boolean> {
    return exists(filePath)
  }

  /**
   * 检查是否为目录
   * @param dirPath 目录路径
   * @returns 是否为目录
   */
  private async checkIsDirectory(dirPath: string): Promise<boolean> {
    try {
      const fs = await import('node:fs/promises')
      const stat = await fs.stat(dirPath)
      return stat.isDirectory()
    } catch {
      return false
    }
  }
}