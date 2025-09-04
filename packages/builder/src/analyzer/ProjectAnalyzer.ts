/**
 * 项目分析器 - 用于分析项目类型和文件结构
 */

import { glob } from 'glob'
import { readFileSync, existsSync } from 'fs'
import { join, extname, relative } from 'path'

// 项目类型枚举
export enum ProjectType {
  PureLess = 'pure-less',         // 纯样式库
  TypeScriptLib = 'ts-lib',       // TypeScript 工具库
  Vue2Component = 'vue2-component', // Vue2 组件库
  Vue3Component = 'vue3-component', // Vue3 组件库
  Mixed = 'mixed'                 // 混合类型
}

// 文件类型统计
export interface FileStats {
  typescript: string[]
  javascript: string[]
  vue: string[]
  tsx: string[]
  jsx: string[]
  less: string[]
  css: string[]
  scss: string[]
}

// Vue 文件分析结果
export interface VueFileAnalysis {
  path: string
  hasScript: boolean
  hasStyle: boolean
  scriptLang?: 'js' | 'ts' | 'jsx' | 'tsx'
  styleLang?: 'css' | 'less' | 'scss' | 'sass' | 'stylus'
  styleScoped?: boolean
  setupScript?: boolean
}

// 项目分析结果
export interface ProjectAnalysis {
  projectType: ProjectType
  vueVersion?: 2 | 3
  hasTypeScript: boolean
  hasTsx: boolean
  hasJsx: boolean
  hasLess: boolean
  hasCss: boolean
  hasScss: boolean
  hasVue: boolean
  fileStats: FileStats
  vueFiles: VueFileAnalysis[]
  dependencies: string[]
  devDependencies: string[]
  entry?: string
  packageName?: string
}

export class ProjectAnalyzer {
  private projectRoot: string
  private srcDir: string

  constructor(projectRoot: string, srcDir: string = 'src') {
    this.projectRoot = projectRoot
    this.srcDir = join(projectRoot, srcDir)
  }

  /**
   * 分析项目
   */
  async analyze(): Promise<ProjectAnalysis> {
    const fileStats = await this.scanFiles()
    const vueFiles = await this.analyzeVueFiles(fileStats.vue)
    const { dependencies, devDependencies, packageName, vueVersion } = this.analyzePackageJson()
    const entry = this.detectEntry()

    const hasTypeScript = fileStats.typescript.length > 0 || fileStats.tsx.length > 0
    const hasTsx = fileStats.tsx.length > 0
    const hasJsx = fileStats.jsx.length > 0
    const hasLess = fileStats.less.length > 0 || this.hasLessInVue(vueFiles)
    const hasCss = fileStats.css.length > 0 || this.hasCssInVue(vueFiles)
    const hasScss = fileStats.scss.length > 0 || this.hasScssInVue(vueFiles)
    const hasVue = fileStats.vue.length > 0

    const projectType = this.detectProjectType({
      hasTypeScript,
      hasVue,
      hasLess,
      hasCss,
      hasScss,
      vueVersion,
      fileStats
    })

    return {
      projectType,
      vueVersion,
      hasTypeScript,
      hasTsx,
      hasJsx,
      hasLess,
      hasCss,
      hasScss,
      hasVue,
      fileStats,
      vueFiles,
      dependencies,
      devDependencies,
      entry,
      packageName
    }
  }

  /**
   * 扫描文件
   */
  private async scanFiles(): Promise<FileStats> {
    const patterns = [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.vue',
      '**/*.less',
      '**/*.css',
      '**/*.scss'
    ]

    const files: FileStats = {
      typescript: [],
      javascript: [],
      vue: [],
      tsx: [],
      jsx: [],
      less: [],
      css: [],
      scss: []
    }

    for (const pattern of patterns) {
      const matched = glob.sync(pattern, {
        cwd: this.srcDir,
        ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.test.*', '**/*.spec.*']
      })

      matched.forEach(file => {
        const ext = extname(file).toLowerCase()
        const fullPath = join(this.srcDir, file)
        
        switch (ext) {
          case '.ts':
            files.typescript.push(fullPath)
            break
          case '.tsx':
            files.tsx.push(fullPath)
            break
          case '.js':
            files.javascript.push(fullPath)
            break
          case '.jsx':
            files.jsx.push(fullPath)
            break
          case '.vue':
            files.vue.push(fullPath)
            break
          case '.less':
            files.less.push(fullPath)
            break
          case '.css':
            files.css.push(fullPath)
            break
          case '.scss':
          case '.sass':
            files.scss.push(fullPath)
            break
        }
      })
    }

    return files
  }

  /**
   * 分析 Vue 文件
   */
  private async analyzeVueFiles(vueFiles: string[]): Promise<VueFileAnalysis[]> {
    const results: VueFileAnalysis[] = []

    for (const file of vueFiles) {
      const content = readFileSync(file, 'utf-8')
      const analysis: VueFileAnalysis = {
        path: file,
        hasScript: false,
        hasStyle: false
      }

      // 分析 script 标签
      const scriptMatch = content.match(/<script([^>]*)>/i)
      if (scriptMatch) {
        analysis.hasScript = true
        const attrs = scriptMatch[1]
        
        // 检测 setup
        if (attrs.includes('setup')) {
          analysis.setupScript = true
        }
        
        // 检测语言
        const langMatch = attrs.match(/lang=["']([^"']+)["']/i)
        if (langMatch) {
          analysis.scriptLang = langMatch[1] as any
        } else {
          analysis.scriptLang = 'js'
        }
      }

      // 分析 style 标签
      const styleMatch = content.match(/<style([^>]*)>/i)
      if (styleMatch) {
        analysis.hasStyle = true
        const attrs = styleMatch[1]
        
        // 检测 scoped
        if (attrs.includes('scoped')) {
          analysis.styleScoped = true
        }
        
        // 检测语言
        const langMatch = attrs.match(/lang=["']([^"']+)["']/i)
        if (langMatch) {
          analysis.styleLang = langMatch[1] as any
        } else {
          analysis.styleLang = 'css'
        }
      }

      results.push(analysis)
    }

    return results
  }

  /**
   * 分析 package.json
   */
  private analyzePackageJson() {
    const pkgPath = join(this.projectRoot, 'package.json')
    if (!existsSync(pkgPath)) {
      return { dependencies: [], devDependencies: [], packageName: undefined, vueVersion: undefined }
    }

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const dependencies = Object.keys(pkg.dependencies || {})
    const devDependencies = Object.keys(pkg.devDependencies || {})
    const allDeps = [...dependencies, ...devDependencies]

    // 检测 Vue 版本
    let vueVersion: 2 | 3 | undefined
    if (allDeps.includes('vue')) {
      const vueDep = pkg.dependencies?.vue || pkg.devDependencies?.vue || ''
      if (vueDep.includes('2.') || vueDep.includes('^2') || vueDep.includes('~2')) {
        vueVersion = 2
      } else if (vueDep.includes('3.') || vueDep.includes('^3') || vueDep.includes('~3')) {
        vueVersion = 3
      } else {
        // 默认为 Vue 3
        vueVersion = 3
      }
    }

    return {
      dependencies,
      devDependencies,
      packageName: pkg.name,
      vueVersion
    }
  }

  /**
   * 检测入口文件
   */
  private detectEntry(): string | undefined {
    const possibleEntries = [
      'index.ts',
      'index.tsx',
      'index.js',
      'index.jsx',
      'main.ts',
      'main.tsx',
      'main.js',
      'main.jsx'
    ]

    for (const entry of possibleEntries) {
      const entryPath = join(this.srcDir, entry)
      if (existsSync(entryPath)) {
        return relative(this.projectRoot, entryPath).replace(/\\/g, '/')
      }
    }

    return undefined
  }

  /**
   * 检测项目类型
   */
  private detectProjectType(analysis: {
    hasTypeScript: boolean
    hasVue: boolean
    hasLess: boolean
    hasCss: boolean
    hasScss: boolean
    vueVersion?: 2 | 3
    fileStats: FileStats
  }): ProjectType {
    const { hasTypeScript, hasVue, hasLess, hasCss, hasScss, vueVersion, fileStats } = analysis

    // 纯样式库判断
    if (!hasTypeScript && !hasVue && !fileStats.javascript.length && (hasLess || hasCss || hasScss)) {
      return ProjectType.PureLess
    }

    // Vue 组件库判断
    if (hasVue) {
      return vueVersion === 2 ? ProjectType.Vue2Component : ProjectType.Vue3Component
    }

    // TypeScript 工具库判断
    if (hasTypeScript && !hasVue) {
      return ProjectType.TypeScriptLib
    }

    return ProjectType.Mixed
  }

  /**
   * 检查 Vue 文件中是否有 Less
   */
  private hasLessInVue(vueFiles: VueFileAnalysis[]): boolean {
    return vueFiles.some(file => file.styleLang === 'less')
  }

  /**
   * 检查 Vue 文件中是否有 CSS
   */
  private hasCssInVue(vueFiles: VueFileAnalysis[]): boolean {
    return vueFiles.some(file => file.styleLang === 'css')
  }

  /**
   * 检查 Vue 文件中是否有 SCSS
   */
  private hasScssInVue(vueFiles: VueFileAnalysis[]): boolean {
    return vueFiles.some(file => file.styleLang === 'scss' || file.styleLang === 'sass')
  }
}
