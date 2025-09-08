/**
 * 项目类型检测器
 *
 * 用于自动检测前端项目的类型、框架、构建工具等信息
 * 支持Vue2/3、React、Angular、Svelte等主流前端框架
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import type {
  ConfigFile,
  DependencyInfo,
  DetectionCondition,
  DetectionRule,
  ProjectAnalysisOptions,
  ProjectDetectionResult,
  ProjectStatistics,
} from './types'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { glob } from 'glob'
import { BuildTool, PackageManager, ProjectType } from './types'

/**
 * 项目检测器类
 * 提供项目类型、框架、工具链的自动检测功能
 */
export class ProjectDetector {
  /** 项目根目录 */
  private projectRoot: string
  /** 分析选项 */
  private options: Required<ProjectAnalysisOptions>
  /** package.json 内容缓存 */
  private packageJsonCache?: any

  /**
   * 构造函数
   * @param options 项目分析选项
   */
  constructor(options: ProjectAnalysisOptions = {}) {
    this.projectRoot = options.projectRoot || process.cwd()
    this.options = {
      projectRoot: this.projectRoot,
      deepAnalyzeDependencies: options.deepAnalyzeDependencies ?? true,
      detectConfigFiles: options.detectConfigFiles ?? true,
      analyzeScripts: options.analyzeScripts ?? true,
      detectDevTools: options.detectDevTools ?? true,
      customDetectionRules: options.customDetectionRules ?? [],
    }
  }

  /**
   * 检测项目类型
   * 主入口方法，返回完整的项目检测结果
   *
   * @returns 项目检测结果
   */
  async detectProject(): Promise<ProjectDetectionResult> {
    const packageJson = this.getPackageJson()
    const packageManager = this.detectPackageManager()
    const buildTools = this.detectBuildTools(packageJson)
    const hasTypeScript = this.detectTypeScript()
    const configFiles = this.detectConfigFiles()

    // 检测项目类型
    const projectTypeResult = this.detectProjectType(packageJson, configFiles)

    return {
      projectType: projectTypeResult.type,
      framework: projectTypeResult.framework,
      frameworkVersion: projectTypeResult.version,
      packageManager,
      buildTools,
      hasTypeScript,
      projectRoot: this.projectRoot,
      configFiles: configFiles.map(f => f.name),
      mainDependencies: Object.keys(packageJson?.dependencies || {}),
      devDependencies: Object.keys(packageJson?.devDependencies || {}),
      scripts: packageJson?.scripts || {},
      confidence: projectTypeResult.confidence,
      details: projectTypeResult.details,
    }
  }

  /**
   * 读取并缓存 package.json 文件
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
   * 检测包管理器类型
   * 根据锁文件和配置文件判断使用的包管理器
   *
   * @returns 包管理器类型
   */
  private detectPackageManager(): PackageManager {
    const lockFiles = [
      { file: 'pnpm-lock.yaml', manager: PackageManager.PNPM },
      { file: 'yarn.lock', manager: PackageManager.YARN },
      { file: 'bun.lockb', manager: PackageManager.BUN },
      { file: 'package-lock.json', manager: PackageManager.NPM },
    ]

    for (const { file, manager } of lockFiles) {
      if (existsSync(resolve(this.projectRoot, file))) {
        return manager
      }
    }

    // 检查 .npmrc 或其他配置文件
    const npmrcPath = resolve(this.projectRoot, '.npmrc')
    if (existsSync(npmrcPath)) {
      const content = readFileSync(npmrcPath, 'utf-8')
      if (content.includes('pnpm') || content.includes('@pnpm')) {
        return PackageManager.PNPM
      }
    }

    return PackageManager.NPM // 默认为 npm
  }

  /**
   * 检测构建工具
   * 根据依赖和配置文件检测项目使用的构建工具
   *
   * @param packageJson package.json 内容
   * @returns 构建工具列表
   */
  private detectBuildTools(packageJson: any): BuildTool[] {
    const buildTools: BuildTool[] = []

    if (!packageJson)
      return buildTools

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    // 检测构建工具依赖
    const toolDetection: Array<{ deps: string[], tool: BuildTool }> = [
      { deps: ['vite', '@vitejs/plugin-vue', '@vitejs/plugin-react'], tool: BuildTool.VITE },
      { deps: ['webpack', 'webpack-cli', '@webpack-cli/serve'], tool: BuildTool.WEBPACK },
      {
        deps: ['rollup', '@rollup/plugin-typescript', '@rollup/plugin-node-resolve'],
        tool: BuildTool.ROLLUP,
      },
      { deps: ['esbuild', 'esbuild-loader'], tool: BuildTool.ESBUILD },
      { deps: ['turbopack'], tool: BuildTool.TURBOPACK },
      { deps: ['parcel', '@parcel/core'], tool: BuildTool.PARCEL },
      { deps: ['tsup'], tool: BuildTool.TSUP },
      { deps: ['unbuild'], tool: BuildTool.UNBUILD },
    ]

    for (const { deps, tool } of toolDetection) {
      if (deps.some(dep => dep in allDeps)) {
        buildTools.push(tool)
      }
    }

    // 检测配置文件
    const configFiles = [
      { files: ['vite.config.ts', 'vite.config.js'], tool: BuildTool.VITE },
      { files: ['webpack.config.js', 'webpack.config.ts'], tool: BuildTool.WEBPACK },
      { files: ['rollup.config.js', 'rollup.config.ts'], tool: BuildTool.ROLLUP },
      { files: ['tsup.config.ts', 'tsup.config.js'], tool: BuildTool.TSUP },
    ]

    for (const { files, tool } of configFiles) {
      if (files.some(file => existsSync(resolve(this.projectRoot, file)))) {
        if (!buildTools.includes(tool)) {
          buildTools.push(tool)
        }
      }
    }

    return buildTools.length > 0 ? buildTools : [BuildTool.UNKNOWN]
  }

  /**
   * 检测 TypeScript 支持
   * 检查项目是否使用 TypeScript
   *
   * @returns 是否支持 TypeScript
   */
  private detectTypeScript(): boolean {
    // 检查 tsconfig.json
    if (existsSync(resolve(this.projectRoot, 'tsconfig.json'))) {
      return true
    }

    // 检查 TypeScript 依赖
    const packageJson = this.getPackageJson()
    if (packageJson) {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      if ('typescript' in allDeps || '@types/node' in allDeps) {
        return true
      }
    }

    // 检查 TypeScript 文件
    try {
      const tsFiles = glob.sync('**/*.ts', {
        cwd: this.projectRoot,
        ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
        absolute: false,
      })
      return tsFiles.length > 0
    }
    catch {
      return false
    }
  }

  /**
   * 检测配置文件
   * 扫描项目中的各种配置文件
   *
   * @returns 配置文件列表
   */
  private detectConfigFiles(): ConfigFile[] {
    const configFilePatterns = [
      // TypeScript 配置
      'tsconfig.json',
      'tsconfig.*.json',
      // 构建工具配置
      'vite.config.ts',
      'vite.config.js',
      'webpack.config.js',
      'webpack.config.ts',
      'rollup.config.js',
      'rollup.config.ts',
      'tsup.config.ts',
      'tsup.config.js',
      // 代码质量工具
      '.eslintrc.js',
      '.eslintrc.json',
      '.eslintrc.yaml',
      'eslint.config.js',
      '.prettierrc',
      '.prettierrc.json',
      '.prettierrc.yaml',
      'prettier.config.js',
      // 测试配置
      'vitest.config.ts',
      'vitest.config.js',
      'jest.config.js',
      'jest.config.ts',
      'playwright.config.ts',
      // 其他配置
      '.gitignore',
      '.npmignore',
      '.editorconfig',
      'tailwind.config.js',
      'tailwind.config.ts',
      'postcss.config.js',
    ]

    const configFiles: ConfigFile[] = []

    for (const pattern of configFilePatterns) {
      try {
        const files = glob.sync(pattern, {
          cwd: this.projectRoot,
          absolute: false,
          dot: true,
        })

        for (const file of files) {
          const fullPath = resolve(this.projectRoot, file)
          if (existsSync(fullPath)) {
            configFiles.push({
              name: file,
              path: fullPath,
              type: this.getFileType(file),
              exists: true,
            })
          }
        }
      }
      catch {
        // 忽略 glob 错误
      }
    }

    return configFiles
  }

  /**
   * 获取文件类型
   * 根据文件扩展名确定文件类型
   *
   * @param filename 文件名
   * @returns 文件类型
   */
  private getFileType(filename: string): 'json' | 'js' | 'ts' | 'yaml' | 'toml' | 'other' {
    const ext = extname(filename).toLowerCase()
    switch (ext) {
      case '.json':
        return 'json'
      case '.js':
        return 'js'
      case '.ts':
        return 'ts'
      case '.yaml':
      case '.yml':
        return 'yaml'
      case '.toml':
        return 'toml'
      default:
        return 'other'
    }
  }

  /**
   * 检测项目类型
   * 基于多种检测规则确定项目类型
   *
   * @param packageJson package.json 内容
   * @param configFiles 配置文件列表
   * @returns 项目类型检测结果
   */
  private detectProjectType(
    packageJson: any,
    configFiles: ConfigFile[],
  ): {
      type: ProjectType
      framework?: string
      version?: string
      confidence: number
      details: string[]
    } {
    const details: string[] = []
    let maxConfidence = 0
    let detectedType = ProjectType.UNKNOWN
    let framework: string | undefined
    let version: string | undefined

    if (!packageJson) {
      details.push('未找到 package.json 文件')
      return { type: ProjectType.STATIC, confidence: 50, details }
    }

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    // Vue.js 检测
    const vueResult = this.detectVueProject(allDeps, configFiles)
    if (vueResult.confidence > maxConfidence) {
      maxConfidence = vueResult.confidence
      detectedType = vueResult.type
      framework = vueResult.framework
      version = vueResult.version
      details.push(...vueResult.details)
    }

    // React 检测
    const reactResult = this.detectReactProject(allDeps, configFiles)
    if (reactResult.confidence > maxConfidence) {
      maxConfidence = reactResult.confidence
      detectedType = reactResult.type
      framework = reactResult.framework
      version = reactResult.version
      details.push(...reactResult.details)
    }

    // Angular 检测
    const angularResult = this.detectAngularProject(allDeps, configFiles)
    if (angularResult.confidence > maxConfidence) {
      maxConfidence = angularResult.confidence
      detectedType = angularResult.type
      framework = angularResult.framework
      version = angularResult.version
      details.push(...angularResult.details)
    }

    // Svelte 检测
    const svelteResult = this.detectSvelteProject(allDeps, configFiles)
    if (svelteResult.confidence > maxConfidence) {
      maxConfidence = svelteResult.confidence
      detectedType = svelteResult.type
      framework = svelteResult.framework
      version = svelteResult.version
      details.push(...svelteResult.details)
    }

    // Node.js 项目检测
    if (maxConfidence < 50) {
      const nodeResult = this.detectNodeProject(allDeps, packageJson)
      if (nodeResult.confidence > maxConfidence) {
        maxConfidence = nodeResult.confidence
        detectedType = nodeResult.type
        framework = nodeResult.framework
        details.push(...nodeResult.details)
      }
    }

    // 自定义规则检测
    for (const rule of this.options.customDetectionRules) {
      const customResult = this.evaluateCustomRule(rule, packageJson, configFiles)
      if (customResult.confidence > maxConfidence) {
        maxConfidence = customResult.confidence
        detectedType = rule.projectType
        details.push(`自定义规则匹配: ${rule.name}`)
      }
    }

    return {
      type: detectedType,
      framework,
      version,
      confidence: maxConfidence,
      details,
    }
  }

  /**
   * 检测 Vue.js 项目
   * 识别 Vue 2.x 和 Vue 3.x 项目
   *
   * @param dependencies 依赖列表
   * @param configFiles 配置文件列表
   * @returns Vue 项目检测结果
   */
  private detectVueProject(
    dependencies: Record<string, string>,
    configFiles: ConfigFile[],
  ): {
      type: ProjectType
      framework: string
      version?: string
      confidence: number
      details: string[]
    } {
    const details: string[] = []
    let confidence = 0

    // Nuxt.js 检测
    if ('nuxt' in dependencies || '@nuxt/kit' in dependencies) {
      details.push('检测到 Nuxt.js 框架')
      return {
        type: ProjectType.NUXTJS,
        framework: 'Nuxt.js',
        version: dependencies.nuxt || dependencies['@nuxt/kit'],
        confidence: 95,
        details,
      }
    }

    // Vue 3.x 检测
    if ('vue' in dependencies) {
      const vueVersion = dependencies.vue
      confidence += 70
      details.push(`检测到 Vue.js 依赖: ${vueVersion}`)

      if (vueVersion.startsWith('^3') || vueVersion.startsWith('3') || vueVersion.includes('3.')) {
        confidence += 20
        details.push('版本号指向 Vue 3.x')

        if ('@vue/composition-api' in dependencies) {
          confidence -= 10 // 可能是 Vue 2 with composition API
        }

        return {
          type: ProjectType.VUE3,
          framework: 'Vue.js',
          version: vueVersion,
          confidence,
          details,
        }
      }

      // Vue 2.x 检测
      if (vueVersion.startsWith('^2') || vueVersion.startsWith('2') || vueVersion.includes('2.')) {
        confidence += 20
        details.push('版本号指向 Vue 2.x')

        return {
          type: ProjectType.VUE2,
          framework: 'Vue.js',
          version: vueVersion,
          confidence,
          details,
        }
      }

      // 无法确定具体版本时的处理
      return {
        type: ProjectType.VUE3, // 默认假设为 Vue 3
        framework: 'Vue.js',
        version: vueVersion,
        confidence: confidence - 10,
        details: [...details, '无法确定具体 Vue 版本，默认为 Vue 3'],
      }
    }

    // 检测 Vue CLI 或其他 Vue 相关配置
    const vueConfigExists = configFiles.some(
      f => f.name === 'vue.config.js' || f.name === 'vue.config.ts',
    )

    if (vueConfigExists) {
      confidence += 30
      details.push('检测到 Vue 配置文件')
    }

    if ('@vue/cli-service' in dependencies) {
      confidence += 40
      details.push('检测到 Vue CLI')
    }

    return {
      type: ProjectType.UNKNOWN,
      framework: '',
      confidence: 0,
      details: [],
    }
  }

  /**
   * 检测 React 项目
   * 识别 React、Next.js 等 React 生态项目
   *
   * @param dependencies 依赖列表
   * @param configFiles 配置文件列表
   * @returns React 项目检测结果
   */
  private detectReactProject(
    dependencies: Record<string, string>,
    _configFiles: ConfigFile[],
  ): {
      type: ProjectType
      framework: string
      version?: string
      confidence: number
      details: string[]
    } {
    const details: string[] = []
    let confidence = 0

    // Next.js 检测
    if ('next' in dependencies) {
      details.push('检测到 Next.js 框架')
      return {
        type: ProjectType.NEXTJS,
        framework: 'Next.js',
        version: dependencies.next,
        confidence: 95,
        details,
      }
    }

    // React 检测
    if ('react' in dependencies) {
      confidence += 70
      const reactVersion = dependencies.react
      details.push(`检测到 React 依赖: ${reactVersion}`)

      if ('react-dom' in dependencies) {
        confidence += 15
        details.push('检测到 React DOM')
      }

      if ('react-scripts' in dependencies) {
        confidence += 10
        details.push('检测到 Create React App')
      }

      if ('@types/react' in dependencies) {
        confidence += 5
        details.push('检测到 React TypeScript 支持')
      }

      return {
        type: ProjectType.REACT,
        framework: 'React',
        version: reactVersion,
        confidence,
        details,
      }
    }

    return {
      type: ProjectType.UNKNOWN,
      framework: '',
      confidence: 0,
      details: [],
    }
  }

  /**
   * 检测 Angular 项目
   * 识别 Angular 项目
   *
   * @param dependencies 依赖列表
   * @param configFiles 配置文件列表
   * @returns Angular 项目检测结果
   */
  private detectAngularProject(
    dependencies: Record<string, string>,
    configFiles: ConfigFile[],
  ): {
      type: ProjectType
      framework: string
      version?: string
      confidence: number
      details: string[]
    } {
    const details: string[] = []
    let confidence = 0

    if ('@angular/core' in dependencies) {
      confidence += 80
      const angularVersion = dependencies['@angular/core']
      details.push(`检测到 Angular 核心: ${angularVersion}`)

      if ('@angular/cli' in dependencies) {
        confidence += 15
        details.push('检测到 Angular CLI')
      }

      if (configFiles.some(f => f.name === 'angular.json')) {
        confidence += 5
        details.push('检测到 Angular 配置文件')
      }

      return {
        type: ProjectType.ANGULAR,
        framework: 'Angular',
        version: angularVersion,
        confidence,
        details,
      }
    }

    return {
      type: ProjectType.UNKNOWN,
      framework: '',
      confidence: 0,
      details: [],
    }
  }

  /**
   * 检测 Svelte 项目
   * 识别 Svelte/SvelteKit 项目
   *
   * @param dependencies 依赖列表
   * @param configFiles 配置文件列表
   * @returns Svelte 项目检测结果
   */
  private detectSvelteProject(
    dependencies: Record<string, string>,
    configFiles: ConfigFile[],
  ): {
      type: ProjectType
      framework: string
      version?: string
      confidence: number
      details: string[]
    } {
    const details: string[] = []
    let confidence = 0

    if ('svelte' in dependencies) {
      confidence += 70
      const svelteVersion = dependencies.svelte
      details.push(`检测到 Svelte: ${svelteVersion}`)

      if ('@sveltejs/kit' in dependencies) {
        confidence += 20
        details.push('检测到 SvelteKit')
      }

      if (configFiles.some(f => f.name === 'svelte.config.js')) {
        confidence += 10
        details.push('检测到 Svelte 配置文件')
      }

      return {
        type: ProjectType.SVELTE,
        framework: 'Svelte',
        version: svelteVersion,
        confidence,
        details,
      }
    }

    return {
      type: ProjectType.UNKNOWN,
      framework: '',
      confidence: 0,
      details: [],
    }
  }

  /**
   * 检测 Node.js 项目
   * 识别纯 Node.js 后端项目
   *
   * @param dependencies 依赖列表
   * @param packageJson package.json 内容
   * @returns Node.js 项目检测结果
   */
  private detectNodeProject(
    dependencies: Record<string, string>,
    packageJson: any,
  ): {
      type: ProjectType
      framework?: string
      confidence: number
      details: string[]
    } {
    const details: string[] = []
    let confidence = 0

    // 检查是否有前端框架依赖（如果有则不是纯 Node.js）
    const frontendFrameworks = ['vue', 'react', '@angular/core', 'svelte']
    if (frontendFrameworks.some(fw => fw in dependencies)) {
      return { type: ProjectType.UNKNOWN, confidence: 0, details: [] }
    }

    // 检测 Node.js 相关依赖
    const nodeFrameworks = ['express', 'koa', 'fastify', 'nest', '@nestjs/core', 'hapi']
    const hasNodeFramework = nodeFrameworks.some(fw => fw in dependencies)

    if (hasNodeFramework) {
      confidence += 60
      details.push('检测到 Node.js 后端框架')
    }

    // 检查 package.json 中的 main 字段
    if (packageJson.main && !packageJson.main.includes('index.html')) {
      confidence += 20
      details.push('检测到 Node.js 入口文件')
    }

    // 检查脚本命令
    const scripts = packageJson.scripts || {}
    if ('start' in scripts && !scripts.start.includes('serve')) {
      confidence += 10
      details.push('检测到 Node.js 启动脚本')
    }

    return {
      type: confidence >= 50 ? ProjectType.NODEJS : ProjectType.UNKNOWN,
      confidence,
      details,
    }
  }

  /**
   * 评估自定义检测规则
   * 根据用户定义的规则进行项目类型检测
   *
   * @param rule 检测规则
   * @param packageJson package.json 内容
   * @param configFiles 配置文件列表
   * @returns 规则评估结果
   */
  private evaluateCustomRule(
    rule: DetectionRule,
    packageJson: any,
    configFiles: ConfigFile[],
  ): { confidence: number } {
    let matchedConditions = 0

    for (const condition of rule.conditions) {
      if (this.evaluateCondition(condition, packageJson, configFiles)) {
        matchedConditions++
      }
    }

    const confidence = (matchedConditions / rule.conditions.length) * rule.weight
    return { confidence }
  }

  /**
   * 评估单个检测条件
   *
   * @param condition 检测条件
   * @param packageJson package.json 内容
   * @param configFiles 配置文件列表
   * @returns 是否满足条件
   */
  private evaluateCondition(
    condition: DetectionCondition,
    packageJson: any,
    configFiles: ConfigFile[],
  ): boolean {
    switch (condition.type) {
      case 'file':
        return configFiles.some(f => f.name === condition.target)

      case 'dependency': {
        const allDeps = {
          ...packageJson?.dependencies,
          ...packageJson?.devDependencies,
        }
        return condition.target in allDeps
      }

      case 'script': {
        const scripts = packageJson?.scripts || {}
        return condition.target in scripts
      }

      case 'content':
        // 这里可以实现文件内容检测
        return false

      default:
        return false
    }
  }

  /**
   * 获取项目统计信息
   * 收集项目的各种统计数据
   *
   * @returns 项目统计信息
   */
  async getProjectStatistics(): Promise<ProjectStatistics> {
    const packageJson = this.getPackageJson()

    // 统计文件数量
    const allFiles = glob.sync('**/*', {
      cwd: this.projectRoot,
      ignore: ['node_modules/**', 'dist/**', '.git/**'],
      nodir: true,
    })

    const codeFiles = allFiles.filter((file) => {
      const ext = extname(file)
      return ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.css', '.scss', '.less'].includes(
        ext,
      )
    })

    const testFiles = allFiles.filter(
      file => file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__'),
    )

    // 计算代码行数
    let linesOfCode = 0
    for (const file of codeFiles.slice(0, 100)) {
      // 限制检查的文件数量
      try {
        const content = readFileSync(resolve(this.projectRoot, file), 'utf-8')
        linesOfCode += content.split('\n').length
      }
      catch {
        // 忽略读取错误
      }
    }

    // 计算项目大小
    let projectSize = 0
    for (const file of allFiles.slice(0, 1000)) {
      // 限制检查的文件数量
      try {
        const stats = statSync(resolve(this.projectRoot, file))
        projectSize += stats.size
      }
      catch {
        // 忽略错误
      }
    }

    return {
      totalFiles: allFiles.length,
      codeFiles: codeFiles.length,
      linesOfCode,
      dependencyCount: Object.keys(packageJson?.dependencies || {}).length,
      devDependencyCount: Object.keys(packageJson?.devDependencies || {}).length,
      configFileCount: this.detectConfigFiles().length,
      testFileCount: testFiles.length,
      projectSize,
    }
  }

  /**
   * 分析项目依赖
   * 获取依赖的详细信息
   *
   * @returns 依赖信息列表
   */
  async analyzeDependencies(): Promise<DependencyInfo[]> {
    const packageJson = this.getPackageJson()
    if (!packageJson)
      return []

    const dependencies: DependencyInfo[] = []

    // 分析生产依赖
    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
      dependencies.push({
        name,
        version: version as string,
        type: 'dependency',
        isFrameworkCore: this.isFrameworkCore(name),
      })
    }

    // 分析开发依赖
    for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
      dependencies.push({
        name,
        version: version as string,
        type: 'devDependency',
        isFrameworkCore: this.isFrameworkCore(name),
      })
    }

    return dependencies
  }

  /**
   * 判断是否为框架核心依赖
   *
   * @param dependencyName 依赖名称
   * @returns 是否为框架核心依赖
   */
  private isFrameworkCore(dependencyName: string): boolean {
    const coreFrameworks = [
      'vue',
      'react',
      '@angular/core',
      'svelte',
      'next',
      'nuxt',
      '@nuxt/kit',
      '@sveltejs/kit',
      'express',
      'koa',
      'fastify',
      '@nestjs/core',
    ]
    return coreFrameworks.includes(dependencyName)
  }

  /**
   * 检测开发服务器配置
   * 分析项目的开发服务器设置
   *
   * @returns 开发服务器信息
   */
  detectDevServer(): any {
    const packageJson = this.getPackageJson()
    const scripts = packageJson?.scripts || {}

    const devCommands = ['dev', 'serve', 'start:dev', 'development']
    const devCommand = devCommands.find(cmd => cmd in scripts)

    if (!devCommand)
      return null

    // 尝试解析端口和配置
    const command = scripts[devCommand]
    const portMatch = command.match(/--port[=\s]+(\d+)|(?:^|\s)(\d{4,5})(?:\s|$)/)
    const port = portMatch ? Number.parseInt(portMatch[1] || portMatch[2]) : 3000

    return {
      name: devCommand,
      port,
      startCommand: command,
      isRunning: false,
    }
  }
}

/**
 * 创建项目检测器实例
 * 工厂函数，用于创建项目检测器
 *
 * @param options 分析选项
 * @returns 项目检测器实例
 */
export function createProjectDetector(options?: ProjectAnalysisOptions): ProjectDetector {
  return new ProjectDetector(options)
}

/**
 * 快速检测项目类型
 * 便捷函数，直接返回项目类型检测结果
 *
 * @param projectPath 项目路径，默认为当前目录
 * @returns 项目检测结果
 */
export async function detectProjectType(projectPath?: string): Promise<ProjectDetectionResult> {
  const detector = new ProjectDetector({ projectRoot: projectPath })
  return detector.detectProject()
}
