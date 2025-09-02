import type {
  CSSPreprocessor,
  DetectionReport,
  DetectionResult,
  DetectionStep,
  FrameworkType,
  IProjectDetector,
  ProjectType,
} from '@/types'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ErrorHandler } from './ErrorHandler'

/**
 * 项目类型检测器实现类
 * 通过分析项目文件和依赖来自动识别项目框架类型
 */
export class ProjectDetector implements IProjectDetector {
  private errorHandler: ErrorHandler

  constructor() {
    this.errorHandler = new ErrorHandler()
  }

  /**
   * 检测项目类型
   * @param projectRoot 项目根目录路径
   * @returns 检测结果
   */
  async detectProjectType(projectRoot: string): Promise<DetectionResult> {
    const report: DetectionReport = {
      detectedFiles: [],
      detectedDependencies: [],
      dependencies: {},
      devDependencies: {},
      confidence: 0,
      steps: [],
      duration: 0,
    }

    try {
      // 步骤1: 验证项目根目录
      await this.validateProjectRoot(projectRoot, report)

      // 步骤2: 读取package.json
      await this.readPackageJson(projectRoot, report)

      // 步骤3: 检测框架特征文件
      await this.detectFrameworkFiles(projectRoot, report)

      // 步骤4: 分析依赖
      this.analyzeDependencies(report)

      // 步骤5: 确定项目类型
      const projectType = this.determineProjectType(report)

      return {
        projectType,
        framework: this.extractFramework(projectType),
        confidence: report.confidence,
        report,
      }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'project type detection',
      )

      return {
        projectType: 'unknown',
        framework: 'vanilla',
        confidence: 0,
        report,
        error: launcherError,
      }
    }
  }

  /**
   * 验证项目根目录
   * @param projectRoot 项目根目录路径
   * @param report 检测报告
   */
  private async validateProjectRoot(projectRoot: string, report: DetectionReport): Promise<void> {
    const step: DetectionStep = {
      name: 'validate_project_root',
      description: '验证项目根目录',
      result: 'failed',
      message: '',
      duration: 0,
      success: false,
    }

    try {
      const stats = await fs.stat(projectRoot)
      if (!stats.isDirectory()) {
        throw new Error(`路径不是有效的目录: ${projectRoot}`)
      }

      step.success = true
      step.result = 'success'
      step.message = '项目根目录验证成功'
    }
    catch (error) {
      step.error = (error as Error).message
      throw error
    }
    finally {
      report.steps.push(step)
    }
  }

  /**
   * 读取package.json文件
   * @param projectRoot 项目根目录路径
   * @param report 检测报告
   * @returns package.json内容
   */
  private async readPackageJson(projectRoot: string, report: DetectionReport): Promise<any> {
    const step: DetectionStep = {
      name: 'read_package_json',
      description: '读取package.json文件',
      result: 'failed',
      message: '',
      duration: 0,
      success: false,
    }

    try {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content)

      report.detectedFiles.push('package.json')
      report.dependencies = packageJson.dependencies || {}
      report.devDependencies = packageJson.devDependencies || {}

      step.success = true
      step.result = 'success'
      step.message = `发现 ${Object.keys(report.dependencies).length} 个依赖，${Object.keys(report.devDependencies).length} 个开发依赖`

      return packageJson
    }
    catch (error) {
      step.error = (error as Error).message
      throw new Error(`无法读取package.json: ${(error as Error).message}`)
    }
    finally {
      report.steps.push(step)
    }
  }

  /**
   * 检测框架特征文件
   * @param projectRoot 项目根目录路径
   * @param report 检测报告
   */
  private async detectFrameworkFiles(projectRoot: string, report: DetectionReport): Promise<void> {
    const step: DetectionStep = {
      name: 'detect_framework_files',
      description: '检测框架特征文件',
      result: 'failed',
      message: '',
      duration: 0,
      success: false,
    }

    try {
      const filesToCheck = [
        // Vue 特征文件
        'vue.config.js',
        'vue.config.ts',
        'nuxt.config.js',
        'nuxt.config.ts',
        'quasar.config.js',
        'src/App.vue',
        'src/main.js',
        'src/main.ts',
        'src/components/HelloWorld.vue',
        'app.vue',
        'pages/index.vue',
        // React 特征文件
        'next.config.js',
        'next.config.ts',
        'next.config.mjs',
        'gatsby-config.js',
        'gatsby-config.ts',
        'remix.config.js',
        'src/App.jsx',
        'src/App.tsx',
        'src/index.jsx',
        'src/index.tsx',
        'src/App.js',
        'src/components/App.jsx',
        'app/layout.tsx', // Next.js App Router
        'pages/_app.tsx', // Next.js Pages Router
        // Svelte 特征文件
        'svelte.config.js',
        'src/App.svelte',
        'src/main.js',
        'src/routes/+page.svelte', // SvelteKit
        // Angular 特征文件
        'angular.json',
        'src/app/app.component.ts',
        'src/main.ts',
        // Lit 特征文件
        'src/my-element.js',
        'src/my-element.ts',
        'lit-element.js',
        'lit-element.ts',
        'src/components/my-element.ts',
        // 原生 HTML 特征文件
        'index.html',
        'src/index.html',
        'public/index.html',
        'src/script.js',
        'src/main.js',
        'src/style.css',
        'src/styles.css',
        'assets/style.css',
        // Vite 配置文件
        'vite.config.js',
        'vite.config.ts',
        'vite.config.mjs',
        'vitest.config.js',
        'vitest.config.ts',
        // 其他构建工具配置文件
        'webpack.config.js',
        'rollup.config.js',
        'parcel.config.js',
        'snowpack.config.js',
        // TypeScript 配置
        'tsconfig.json',
        'jsconfig.json',
        'tsconfig.app.json',
        'tsconfig.node.json',
        // 包管理器文件
        'pnpm-lock.yaml',
        'yarn.lock',
        'package-lock.json',
        'bun.lockb',
      ]

      const detectedFiles: string[] = []

      for (const file of filesToCheck) {
        try {
          const filePath = path.join(projectRoot, file)
          await fs.access(filePath)
          detectedFiles.push(file)
        }
        catch {
          // 文件不存在，继续检查下一个
        }
      }

      // 检测 Lit 组件文件
      await this.detectLitComponents(projectRoot, detectedFiles)

      // 检测原生 HTML 项目特征
      await this.detectNativeHtmlFeatures(projectRoot, detectedFiles)

      // 检测更多框架特征
      await this.detectAdvancedFrameworkFeatures(projectRoot, detectedFiles)

      report.detectedFiles.push(...detectedFiles)
      step.success = true
      step.result = 'success'
      step.message = `检测到 ${detectedFiles.length} 个特征文件: ${detectedFiles.join(', ')}`
    }
    catch (error) {
      step.error = (error as Error).message
    }
    finally {
      report.steps.push(step)
    }
  }

  /**
   * 分析依赖
   * @param report 检测报告
   */
  private analyzeDependencies(report: DetectionReport): void {
    const step: DetectionStep = {
      name: 'analyze_dependencies',
      description: '分析项目依赖',
      result: 'failed',
      message: '',
      duration: 0,
      success: false,
    }

    try {
      const allDeps = { ...report.dependencies, ...report.devDependencies }
      const frameworks: string[] = []
      const detectedFrameworks = new Set<string>()

      // Vue 生态检测
      if (allDeps.vue) {
        const vueVersion = this.extractVersion(allDeps.vue)
        if (vueVersion && vueVersion.startsWith('2.')) {
          frameworks.push('Vue 2')
          detectedFrameworks.add('vue2')
        } else {
          frameworks.push('Vue 3')
          detectedFrameworks.add('vue3')
        }
      }
      
      // 检测 Nuxt.js
      if (allDeps.nuxt || allDeps['@nuxt/kit'] || allDeps.nuxt3) {
        frameworks.push('Nuxt.js')
        detectedFrameworks.add('vue3')
      }
      
      // 检测 Quasar
      if (allDeps.quasar || allDeps['@quasar/app']) {
        frameworks.push('Quasar')
        detectedFrameworks.add('vue3')
      }

      // React 生态检测
      if (allDeps.react) {
        frameworks.push('React')
        detectedFrameworks.add('react')
        
        // 检测 Next.js
        if (allDeps.next) {
          frameworks.push('Next.js')
        }
        
        // 检测 Gatsby
        if (allDeps.gatsby) {
          frameworks.push('Gatsby')
        }
        
        // 检测 Remix
        if (allDeps['@remix-run/node'] || allDeps['@remix-run/react']) {
          frameworks.push('Remix')
        }
      }

      // Lit 生态检测 - 增强检测
      if (allDeps.lit || allDeps['lit-element'] || allDeps['@lit/reactive-element'] || allDeps['@lit/lit-element']) {
        frameworks.push('Lit')
        detectedFrameworks.add('lit')
      }

      // Svelte 生态检测
      if (allDeps.svelte) {
        frameworks.push('Svelte')
        detectedFrameworks.add('svelte')
        
        // 检测 SvelteKit
        if (allDeps['@sveltejs/kit']) {
          frameworks.push('SvelteKit')
        }
      }

      // Angular 生态检测
      if (allDeps['@angular/core']) {
        frameworks.push('Angular')
        detectedFrameworks.add('angular')
      }
      
      // Solid.js 检测
      if (allDeps['solid-js']) {
        frameworks.push('Solid.js')
        detectedFrameworks.add('solid')
      }
      
      // Preact 检测
      if (allDeps.preact) {
        frameworks.push('Preact')
        detectedFrameworks.add('preact')
      }
      
      // Alpine.js 检测
      if (allDeps.alpinejs || allDeps['@alpinejs/core']) {
        frameworks.push('Alpine.js')
        detectedFrameworks.add('alpine')
      }
      
      // Stencil 检测
      if (allDeps['@stencil/core']) {
        frameworks.push('Stencil')
        detectedFrameworks.add('stencil')
      }

      // 将检测到的框架添加到报告中
      report.detectedDependencies = Array.from(detectedFrameworks)

      step.success = true
      step.result = 'success'
      step.message = frameworks.length > 0
        ? `检测到框架: ${frameworks.join(', ')}`
        : '未检测到明确的框架依赖'
    }
    catch (error) {
      step.error = (error as Error).message
    }
    finally {
      report.steps.push(step)
    }
  }

  /**
   * 确定项目类型
   * @param report 检测报告
   * @returns 项目类型
   */
  private determineProjectType(report: DetectionReport): ProjectType {
    const allDeps = { ...report.dependencies, ...report.devDependencies }
    const detectedFiles = report.detectedFiles
    let confidence = 0

    // Vue 项目检测
    if (allDeps.vue) {
      const vueVersion = this.extractVersion(allDeps.vue)
      confidence += 80

      if (vueVersion && vueVersion.startsWith('2.')) {
        confidence += 10
        report.confidence = Math.min(confidence, 100)
        return 'vue2'
      }
      else {
        confidence += 10
        report.confidence = Math.min(confidence, 100)
        return 'vue3'
      }
    }

    // React 项目检测
    if (allDeps.react) {
      confidence += 80

      if (allDeps.next || detectedFiles.includes('next.config.js') || detectedFiles.includes('next.config.ts')) {
        confidence += 10
        report.confidence = Math.min(confidence, 100)
        return 'react-next'
      }
      else {
        confidence += 10
        report.confidence = Math.min(confidence, 100)
        return 'react'
      }
    }

    // Lit 项目检测 - 增强检测逻辑
    if (allDeps.lit || allDeps['lit-element'] || allDeps['@lit/reactive-element'] || this.hasLitFeatures(detectedFiles)) {
      confidence += 90
      report.confidence = Math.min(confidence, 100)
      return 'lit'
    }

    // Svelte 项目检测
    if (allDeps.svelte) {
      confidence += 90
      report.confidence = Math.min(confidence, 100)
      return 'svelte'
    }

    // Angular 项目检测
    if (allDeps['@angular/core']) {
      confidence += 90
      report.confidence = Math.min(confidence, 100)
      return 'angular'
    }

    // 原生 HTML 项目检测 - 新增
    if (this.isNativeHtmlProject(detectedFiles, allDeps)) {
      confidence += 70
      report.confidence = Math.min(confidence, 100)
      return 'html'
    }

    // TypeScript 项目检测
    if (allDeps.typescript || detectedFiles.includes('tsconfig.json')) {
      confidence += 30
      report.confidence = Math.min(confidence, 100)
      return 'vanilla-ts'
    }

    // 默认为 vanilla JavaScript
    confidence += 20
    report.confidence = Math.min(confidence, 100)
    return 'vanilla'
  }

  /**
   * 从项目类型提取框架类型
   * @param projectType 项目类型
   * @returns 框架类型
   */
  private extractFramework(projectType: ProjectType): FrameworkType {
    switch (projectType) {
      case 'vue2':
        return 'vue2'
      case 'vue3':
        return 'vue3'
      case 'react':
      case 'react-next':
        return 'react'
      case 'lit':
        return 'lit'
      case 'html':
        return 'html'
      case 'svelte':
      case 'angular':
      case 'vanilla':
      case 'vanilla-ts':
      default:
        return 'vanilla'
    }
  }

  /**
   * 提取版本号
   * @param versionString 版本字符串
   * @returns 清理后的版本号
   */
  private extractVersion(versionString: string): string | null {
    if (!versionString)
      return null

    // 移除版本前缀符号 (^, ~, >=, 等)
    const cleanVersion = versionString.replace(/^\D*/, '')
    const match = cleanVersion.match(/^(\d+\.\d+\.\d+)/)

    return match ? match[1] : null
  }

  /**
   * 检查是否为 Vite 项目
   * @param projectRoot 项目根目录路径
   * @returns 是否为 Vite 项目
   */
  async isViteProject(projectRoot: string): Promise<boolean> {
    try {
      // 检查 vite.config.* 文件
      const viteConfigFiles = [
        'vite.config.js',
        'vite.config.ts',
        'vite.config.mjs',
      ]

      for (const configFile of viteConfigFiles) {
        try {
          const configPath = path.join(projectRoot, configFile)
          await fs.access(configPath)
          return true
        }
        catch {
          // 继续检查下一个文件
        }
      }

      // 检查 package.json 中的 vite 依赖
      try {
        const packageJsonPath = path.join(projectRoot, 'package.json')
        const content = await fs.readFile(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(content)

        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        }

        return !!(allDeps.vite || allDeps['@vitejs/plugin-vue'] || allDeps['@vitejs/plugin-react'])
      }
      catch {
        return false
      }
    }
    catch {
      return false
    }
  }

  /**
   * 获取推荐的 Vite 插件
   * @param projectType 项目类型
   * @returns 推荐的插件列表
   */
  getRecommendedPlugins(projectType: ProjectType): string[] {
    switch (projectType) {
      case 'vue2':
        return ['@vitejs/plugin-vue2']
      case 'vue3':
        return ['@vitejs/plugin-vue']
      case 'react':
      case 'react-next':
        return ['@vitejs/plugin-react']
      case 'lit':
        return ['@vitejs/plugin-lit']
      case 'svelte':
        return ['@sveltejs/vite-plugin-svelte']
      case 'vanilla-ts':
        return ['@vitejs/plugin-typescript']
      default:
        return []
    }
  }

  // IProjectDetector 接口方法实现
  async detect(root: string): Promise<DetectionResult> {
    return this.detectProjectType(root)
  }

  async detectFramework(root: string): Promise<FrameworkType> {
    const result = await this.detectProjectType(root)
    return result.framework
  }

  async detectTypeScript(root: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(root, 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content)

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      // 检查 TypeScript 依赖或 tsconfig.json 文件
      if (allDeps.typescript)
        return true

      try {
        const tsconfigPath = path.join(root, 'tsconfig.json')
        await fs.access(tsconfigPath)
        return true
      }
      catch {
        return false
      }
    }
    catch {
      return false
    }
  }

  async detectCSSPreprocessor(root: string): Promise<CSSPreprocessor | undefined> {
    try {
      const packageJsonPath = path.join(root, 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content)

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      if (allDeps.sass || allDeps.scss)
        return 'sass'
      if (allDeps.less)
        return 'less'
      if (allDeps.stylus)
        return 'stylus'

      return undefined
    }
    catch {
      return undefined
    }
  }

  /**
   * 检测 Lit 组件文件
   * @param projectRoot 项目根目录
   * @param detectedFiles 已检测到的文件列表
   */
  private async detectLitComponents(projectRoot: string, detectedFiles: string[]): Promise<void> {
    try {
      // 检查 src 目录下的 JS/TS 文件是否包含 Lit 相关代码
      const srcDir = path.join(projectRoot, 'src')
      try {
        const files = await fs.readdir(srcDir)
        for (const file of files) {
          if (file.endsWith('.js') || file.endsWith('.ts')) {
            const filePath = path.join(srcDir, file)
            const content = await fs.readFile(filePath, 'utf-8')

            // 检查是否包含 Lit 相关导入或代码
            if (content.includes('from \'lit\'') ||
              content.includes('from "lit"') ||
              content.includes('LitElement') ||
              content.includes('@customElement') ||
              content.includes('html`') ||
              content.includes('css`')) {
              detectedFiles.push(`src/${file}`)
            }
          }
        }
      } catch {
        // src 目录不存在或无法读取
      }
    } catch {
      // 忽略错误
    }
  }

  /**
   * 检测原生 HTML 项目特征
   * @param projectRoot 项目根目录
   * @param detectedFiles 已检测到的文件列表
   */
  private async detectNativeHtmlFeatures(projectRoot: string, detectedFiles: string[]): Promise<void> {
    try {
      // 检查是否有 index.html 文件
      const indexHtmlPath = path.join(projectRoot, 'index.html')
      try {
        await fs.access(indexHtmlPath)
        const content = await fs.readFile(indexHtmlPath, 'utf-8')

        // 检查 HTML 文件是否包含原生特征（没有框架特定的标记）
        const hasVueFeatures = content.includes('{{ ') || content.includes('v-') || content.includes('#app')
        const hasReactFeatures = content.includes('react') || content.includes('ReactDOM')
        const hasAngularFeatures = content.includes('ng-') || content.includes('angular')

        if (!hasVueFeatures && !hasReactFeatures && !hasAngularFeatures) {
          detectedFiles.push('index.html')

          // 检查是否有对应的 CSS 和 JS 文件
          const possibleFiles = [
            'style.css',
            'styles.css',
            'main.css',
            'script.js',
            'main.js',
            'app.js'
          ]

          for (const file of possibleFiles) {
            try {
              await fs.access(path.join(projectRoot, file))
              detectedFiles.push(file)
            } catch {
              // 文件不存在
            }
          }
        }
      } catch {
        // index.html 不存在
      }
    } catch {
      // 忽略错误
    }
  }

  /**
   * 检查是否有 Lit 特征
   * @param detectedFiles 检测到的文件列表
   * @returns 是否有 Lit 特征
   */
  private hasLitFeatures(detectedFiles: string[]): boolean {
    return detectedFiles.some(file =>
      file.includes('lit-element') ||
      file.includes('my-element') ||
      (file.startsWith('src/') && (file.endsWith('.js') || file.endsWith('.ts')))
    )
  }

  /**
   * 检查是否是原生 HTML 项目
   * @param detectedFiles 检测到的文件列表
   * @param allDeps 所有依赖
   * @returns 是否是原生 HTML 项目
   */
  private isNativeHtmlProject(detectedFiles: string[], allDeps: Record<string, string>): boolean {
    // 有 index.html 文件
    const hasIndexHtml = detectedFiles.includes('index.html')

    // 有基本的 CSS/JS 文件
    const hasBasicFiles = detectedFiles.some(file =>
      file.endsWith('.css') ||
      file.endsWith('.js') ||
      file === 'script.js' ||
      file === 'main.js' ||
      file === 'app.js'
    )

    // 没有主要框架依赖
    const hasNoFrameworkDeps = !allDeps.vue &&
      !allDeps.react &&
      !allDeps.lit &&
      !allDeps.svelte &&
      !allDeps['@angular/core']

    return hasIndexHtml && hasBasicFiles && hasNoFrameworkDeps
  }
  
  /**
   * 检测高级框架特征
   * @param projectRoot 项目根目录
   * @param detectedFiles 已检测到的文件列表
   */
  private async detectAdvancedFrameworkFeatures(projectRoot: string, detectedFiles: string[]): Promise<void> {
    try {
      // 检测 Svelte 文件
      const svelteFiles = await this.findFilesByExtension(projectRoot, '.svelte', ['src', 'pages', 'routes'])
      detectedFiles.push(...svelteFiles)
      
      // 检测 Vue 文件
      const vueFiles = await this.findFilesByExtension(projectRoot, '.vue', ['src', 'pages', 'components'])
      detectedFiles.push(...vueFiles.slice(0, 3)) // 只添加前3个作为示例
      
      // 检测 JSX/TSX 文件
      const jsxFiles = await this.findFilesByExtension(projectRoot, ['.jsx', '.tsx'], ['src', 'pages', 'app', 'components'])
      detectedFiles.push(...jsxFiles.slice(0, 3)) // 只添加前3个作为示例
      
      // 检测 Angular 文件
      const ngFiles = await this.findFilesByPattern(projectRoot, '*.component.ts', ['src/app'])
      detectedFiles.push(...ngFiles.slice(0, 2))
      
      // 检测 Stencil 组件
      const stencilFiles = await this.findFilesByPattern(projectRoot, '*.tsx', ['src/components'])
      if (stencilFiles.length > 0) {
        // 检查是否真的是 Stencil 文件
        for (const file of stencilFiles.slice(0, 2)) {
          try {
            const filePath = path.join(projectRoot, file)
            const content = await fs.readFile(filePath, 'utf-8')
            if (content.includes('@Component') && content.includes('@stencil/core')) {
              detectedFiles.push(file)
            }
          } catch {
            // 忽略读取错误
          }
        }
      }
    } catch {
      // 忽略错误
    }
  }
  
  /**
   * 按扩展名查找文件
   * @param projectRoot 项目根目录
   * @param extensions 文件扩展名（单个或数组）
   * @param searchDirs 搜索目录
   * @returns 找到的文件列表
   */
  private async findFilesByExtension(
    projectRoot: string, 
    extensions: string | string[], 
    searchDirs: string[] = ['src']
  ): Promise<string[]> {
    const foundFiles: string[] = []
    const exts = Array.isArray(extensions) ? extensions : [extensions]
    
    for (const dir of searchDirs) {
      try {
        const dirPath = path.join(projectRoot, dir)
        const files = await fs.readdir(dirPath, { recursive: true })
        
        for (const file of files) {
          const fileName = file.toString()
          if (exts.some(ext => fileName.endsWith(ext))) {
            foundFiles.push(`${dir}/${fileName}`)
          }
        }
      } catch {
        // 目录不存在或无法访问
      }
    }
    
    return foundFiles
  }
  
  /**
   * 按模式查找文件
   * @param projectRoot 项目根目录
   * @param pattern 文件模式
   * @param searchDirs 搜索目录
   * @returns 找到的文件列表
   */
  private async findFilesByPattern(
    projectRoot: string, 
    pattern: string, 
    searchDirs: string[] = ['src']
  ): Promise<string[]> {
    const foundFiles: string[] = []
    
    // 简化的模式匹配（支持 *.ext 格式）
    const regex = new RegExp(pattern.replace('*', '.*'))
    
    for (const dir of searchDirs) {
      try {
        const dirPath = path.join(projectRoot, dir)
        const files = await fs.readdir(dirPath, { recursive: true })
        
        for (const file of files) {
          const fileName = file.toString()
          if (regex.test(fileName)) {
            foundFiles.push(`${dir}/${fileName}`)
          }
        }
      } catch {
        // 目录不存在或无法访问
      }
    }
    
    return foundFiles
  }
}

/**
 * 默认项目检测器实例
 */
export const projectDetector = new ProjectDetector()
