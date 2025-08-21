/**
 * 项目扫描器
 * 自动扫描项目文件类型和结构
 */

import path from 'path'
import { glob } from 'glob'
import { Logger } from '../utils/logger'
import type {
  ProjectScanResult,
  FileInfo,
  ProjectType,
  FileType,
  PackageInfo,
  DependencyGraph
} from '../types'

const logger = new Logger('ProjectScanner')

export class ProjectScanner {
  private readonly defaultIgnorePatterns = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.git/**',
    '**/.vscode/**',
    '**/.idea/**',
    '**/types/**',
    '**/*.d.ts',
    '**/.DS_Store',
    '**/Thumbs.db'
  ]

  /**
   * 扫描项目
   */
  async scan(root: string, options: {
    ignorePatterns?: string[]
    includePatterns?: string[]
    maxDepth?: number
  } = {}): Promise<ProjectScanResult> {
    logger.info(`开始扫描项目: ${root}`)

    const startTime = Date.now()

    try {
      // 读取包信息
      const packageInfo = await this.readPackageInfo(root)

      // 扫描文件
      const files = await this.scanFiles(root, options)

      // 检测项目类型
      const projectType = this.detectProjectType(files, packageInfo)

      // 检测入口文件
      const entryPoints = this.detectEntryPoints(files, packageInfo, projectType)

      // 创建依赖关系图
      const dependencyGraph = await this.createDependencyGraph(files)

      const scanTime = Date.now() - startTime

      const result: ProjectScanResult = {
        root,
        projectType,
        files,
        entryPoints,
        packageInfo,
        dependencyGraph,
        scanTime
      }

      logger.info(`项目扫描完成，耗时 ${scanTime}ms，发现 ${files.length} 个文件`)

      return result

    } catch (error) {
      logger.error('项目扫描失败:', error)
      throw error
    }
  }

  /**
   * 读取包信息
   */
  private async readPackageInfo(root: string): Promise<PackageInfo | null> {
    try {
      const fs = await import('fs-extra')
      const packagePath = path.join(root, 'package.json')

      if (!await fs.pathExists(packagePath)) {
        return null
      }

      const packageJson = await fs.readJson(packagePath)

      return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        main: packageJson.main,
        module: packageJson.module,
        types: packageJson.types || packageJson.typings,
        exports: packageJson.exports,
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        peerDependencies: packageJson.peerDependencies || {},
        scripts: packageJson.scripts || {},
        keywords: packageJson.keywords || [],
        author: packageJson.author,
        license: packageJson.license,
        repository: packageJson.repository,
        bugs: packageJson.bugs,
        homepage: packageJson.homepage
      }

    } catch (error) {
      logger.warn('读取 package.json 失败:', error)
      return null
    }
  }

  /**
   * 扫描文件
   */
  private async scanFiles(root: string, options: {
    ignorePatterns?: string[]
    includePatterns?: string[]
    maxDepth?: number
  }): Promise<FileInfo[]> {
    const {
      ignorePatterns = [],
      includePatterns = ['**/*'],
      maxDepth = 10
    } = options

    const allIgnorePatterns = [...this.defaultIgnorePatterns, ...ignorePatterns]

    try {
      const files: FileInfo[] = []

      // 使用 glob 扫描文件
      for (const pattern of includePatterns) {
        const matchedFiles = await glob(pattern, {
          cwd: root,
          ignore: allIgnorePatterns,
          absolute: true,
          nodir: true,
          maxDepth
        })

        for (const filePath of matchedFiles) {
          const fileInfo = await this.analyzeFile(filePath, root)
          if (fileInfo) {
            files.push(fileInfo)
          }
        }
      }

      // 去重并排序
      const uniqueFiles = this.deduplicateFiles(files)
      uniqueFiles.sort((a, b) => a.path.localeCompare(b.path))

      return uniqueFiles

    } catch (error) {
      logger.error('文件扫描失败:', error)
      throw error
    }
  }

  /**
   * 分析单个文件
   */
  private async analyzeFile(filePath: string, root: string): Promise<FileInfo | null> {
    try {
      const fs = await import('fs-extra')
      const stats = await fs.stat(filePath)

      if (!stats.isFile()) {
        return null
      }

      const relativePath = path.relative(root, filePath)
      const ext = path.extname(filePath).toLowerCase()
      const basename = path.basename(filePath, ext)

      const fileInfo: FileInfo = {
        path: filePath,
        relativePath,
        name: basename,
        extension: ext,
        type: this.detectFileType(filePath, ext),
        size: stats.size,
        lastModified: stats.mtime,
        isEntry: this.isEntryFile(relativePath, basename),
        dependencies: [],
        exports: []
      }

      // 分析文件内容（仅对源码文件）
      if (this.isSourceFile(fileInfo.type)) {
        await this.analyzeFileContent(fileInfo)
      }

      return fileInfo

    } catch (error) {
      logger.warn(`分析文件失败 ${filePath}:`, error)
      return null
    }
  }

  /**
   * 检测文件类型
   */
  private detectFileType(filePath: string, ext: string): FileType {
    const filename = path.basename(filePath).toLowerCase()

    // 根据扩展名判断
    switch (ext) {
      case '.ts':
        return 'typescript'
      case '.tsx':
        return 'tsx'
      case '.js':
        return 'javascript'
      case '.jsx':
        return 'jsx'
      case '.vue':
        return 'vue'
      case '.css':
        return 'css'
      case '.scss':
      case '.sass':
        return 'scss'
      case '.less':
        return 'less'
      case '.styl':
      case '.stylus':
        return 'stylus'
      case '.json':
        return 'json'
      case '.svelte':
        return 'other' // 作为源码类型在后续可扩展
      case '.md':
      case '.markdown':
        return 'markdown'
      case '.html':
      case '.htm':
        return 'html'
      case '.xml':
        return 'xml'
      case '.yaml':
      case '.yml':
        return 'yaml'
      case '.toml':
        return 'toml'
      case '.svg':
        return 'svg'
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.webp':
      case '.ico':
        return 'image'
      case '.woff':
      case '.woff2':
      case '.ttf':
      case '.eot':
        return 'font'
      default:
        // 根据文件名判断
        if (filename.includes('config') || filename.includes('rc')) {
          return 'config'
        }
        if (filename.includes('test') || filename.includes('spec')) {
          return 'test'
        }
        return 'other'
    }
  }

  /**
   * 判断是否为入口文件
   */
  private isEntryFile(relativePath: string, basename: string): boolean {
    const entryNames = ['index', 'main', 'app', 'entry']
    const entryPaths = ['src/index', 'src/main', 'lib/index', 'lib/main']

    // 检查文件名
    if (entryNames.includes(basename.toLowerCase())) {
      return true
    }

    // 检查路径
    const normalizedPath = relativePath.replace(/\\+/g, '/').toLowerCase()
    return entryPaths.some(entryPath =>
      normalizedPath.startsWith(entryPath) ||
      normalizedPath === entryPath + path.extname(relativePath)
    )
  }

  /**
   * 判断是否为源码文件
   */
  private isSourceFile(type: FileType): boolean {
    return [
      'typescript',
      'tsx',
      'javascript',
      'jsx',
      'vue'
    ].includes(type)
  }

  /**
   * 分析文件内容
   */
  private async analyzeFileContent(fileInfo: FileInfo): Promise<void> {
    try {
      const fs = await import('fs-extra')
      const content = await fs.readFile(fileInfo.path, 'utf-8')

      // 提取依赖
      fileInfo.dependencies = this.extractDependencies(content)

      // 提取导出
      fileInfo.exports = this.extractExports(content)

    } catch (error) {
      logger.warn(`分析文件内容失败 ${fileInfo.path}:`, error)
    }
  }

  /**
   * 提取依赖
   */
  private extractDependencies(content: string): string[] {
    const dependencies: string[] = []

    // ES6 import
    const importRegex = /import\s+(?:[^\s,{}]+\s*,?\s*)?(?:\{[^}]*\}\s*)?from\s+['"]([^'"]+)['"]/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }

    // CommonJS require
    const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g

    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }

    // 动态 import
    const dynamicImportRegex = /import\s*\(['"]([^'"]+)['"]\)/g

    while ((match = dynamicImportRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }

    return [...new Set(dependencies)] // 去重
  }

  /**
   * 提取导出
   */
  private extractExports(content: string): string[] {
    const exports: string[] = []

    // export const/let/var
    const exportVarRegex = /export\s+(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    let match

    while ((match = exportVarRegex.exec(content)) !== null) {
      exports.push(match[1])
    }

    // export function
    const exportFunctionRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g

    while ((match = exportFunctionRegex.exec(content)) !== null) {
      exports.push(match[1])
    }

    // export class
    const exportClassRegex = /export\s+(?:abstract\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g

    while ((match = exportClassRegex.exec(content)) !== null) {
      exports.push(match[1])
    }

    // export interface/type (TypeScript)
    const exportTypeRegex = /export\s+(?:interface|type)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g

    while ((match = exportTypeRegex.exec(content)) !== null) {
      exports.push(match[1])
    }

    // export { ... }
    const exportObjectRegex = /export\s*\{([^}]+)\}/g

    while ((match = exportObjectRegex.exec(content)) !== null) {
      const exportList = match[1]
        .split(',')
        .map(item => item.trim().split(/\s+as\s+/)[0].trim())
        .filter(item => item && item !== '*')

      exports.push(...exportList)
    }

    // export default
    if (/export\s+default\s/.test(content)) {
      exports.push('default')
    }

    return [...new Set(exports)] // 去重
  }

  /**
   * 检测项目类型
   */
  private detectProjectType(files: FileInfo[], packageInfo: PackageInfo | null): ProjectType {
    // 检查依赖
    if (packageInfo) {
      const allDeps = {
        ...packageInfo.dependencies,
        ...packageInfo.devDependencies,
        ...packageInfo.peerDependencies
      }

      if (allDeps.vue || allDeps['@vue/core']) {
        return 'vue'
      }

      if (allDeps.react || allDeps['@types/react']) {
        return 'react'
      }

      if (allDeps.angular || allDeps['@angular/core']) {
        return 'angular'
      }

      if (allDeps.svelte) {
        return 'svelte'
      }
    }

    // 检查文件类型
    const hasVue = files.some(f => f.type === 'vue')
    if (hasVue) {
      return 'vue'
    }

    const hasReact = files.some(f => f.type === 'jsx' || f.type === 'tsx')
    if (hasReact) {
      return 'react'
    }

    const hasTypeScript = files.some(f => f.type === 'typescript' || f.type === 'tsx')
    if (hasTypeScript) {
      return 'typescript'
    }

    return 'javascript'
  }

  /**
   * 检测入口文件
   */
  private detectEntryPoints(files: FileInfo[], packageInfo: PackageInfo | null, projectType: ProjectType): string[] {
    const entryPoints: string[] = []

    // 从 package.json 获取入口
    if (packageInfo) {
      if (packageInfo.main) {
        entryPoints.push(packageInfo.main)
      }
      if (packageInfo.module) {
        entryPoints.push(packageInfo.module)
      }
      if (packageInfo.exports) {
        this.extractExportsEntries(packageInfo.exports, entryPoints)
      }
    }

    // 自动检测入口文件
    const entryFiles = files.filter(f => f.isEntry)
    entryFiles.forEach(f => {
      if (!entryPoints.includes(f.relativePath)) {
        entryPoints.push(f.relativePath)
      }
    })

    // 如果没有找到入口文件，使用默认值
    if (entryPoints.length === 0) {
      const defaultEntries = this.getDefaultEntries(projectType)
      for (const entry of defaultEntries) {
        const found = files.find(f => f.relativePath === entry)
        if (found) {
          entryPoints.push(entry)
          break
        }
      }
    }

    return entryPoints
  }

  /**
   * 提取 exports 字段中的入口
   */
  private extractExportsEntries(exports: any, entryPoints: string[]): void {
    if (typeof exports === 'string') {
      entryPoints.push(exports)
    } else if (typeof exports === 'object' && exports !== null) {
      for (const [key, value] of Object.entries(exports)) {
        if (typeof value === 'string') {
          entryPoints.push(value)
        } else if (typeof value === 'object' && value !== null) {
          this.extractExportsEntries(value, entryPoints)
        }
      }
    }
  }

  /**
   * 获取默认入口文件
   */
  private getDefaultEntries(projectType: ProjectType): string[] {
    const extensions = projectType === 'typescript' || projectType === 'vue' || projectType === 'react'
      ? ['.ts', '.tsx', '.js', '.jsx']
      : ['.js', '.jsx']

    const entries: string[] = []
    const basePaths = ['src/index', 'src/main', 'lib/index', 'index', 'main']

    for (const basePath of basePaths) {
      for (const ext of extensions) {
        entries.push(basePath + ext)
      }
    }

    return entries
  }

  /**
   * 创建依赖关系图
   */
  private async createDependencyGraph(files: FileInfo[]): Promise<DependencyGraph> {
    const dependencyGraph: DependencyGraph = {
      nodes: new Map(),
      edges: []
    }

    // 创建节点
    for (const file of files) {
      dependencyGraph.nodes.set(file.path, {
        id: file.path,
        file: file,
        inDegree: 0,
        outDegree: 0
      })
    }

    // 创建边
    for (const file of files) {
      const internalDeps = file.dependencies
        .filter(dep => !this.isExternalDependency(dep))
        .map(dep => this.resolveDependencyPath(dep, file.path, files))
        .filter(Boolean) as string[]

      for (const depPath of internalDeps) {
        dependencyGraph.edges.push({
          from: file.path,
          to: depPath,
          type: 'import'
        })

        // 更新节点的度数
        const fromNode = dependencyGraph.nodes.get(file.path)
        const toNode = dependencyGraph.nodes.get(depPath)
        if (fromNode) fromNode.outDegree++
        if (toNode) toNode.inDegree++
      }
    }

    return dependencyGraph
  }

  /**
   * 判断是否为外部依赖
   */
  private isExternalDependency(dep: string): boolean {
    // 相对路径
    if (dep.startsWith('.')) {
      return false
    }

    // 绝对路径
    if (dep.startsWith('/')) {
      return false
    }

    // Node.js 内置模块
    const builtinModules = [
      'fs', 'path', 'url', 'util', 'events', 'stream', 'buffer',
      'crypto', 'os', 'http', 'https', 'zlib', 'querystring',
      'child_process', 'cluster', 'dgram', 'dns', 'net', 'tls'
    ]

    if (builtinModules.includes(dep)) {
      return true
    }

    // npm 包
    return true
  }

  /**
   * 解析依赖路径
   */
  private resolveDependencyPath(dep: string, fromPath: string, files: FileInfo[]): string | null {
    if (this.isExternalDependency(dep)) {
      return null
    }

    const fromDir = path.dirname(fromPath)
    const resolvedPath = path.resolve(fromDir, dep)

    // 查找匹配的文件
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json']

    for (const file of files) {
      if (file.path === resolvedPath) {
        return file.path
      }

      // 尝试添加扩展名
      for (const ext of extensions) {
        if (file.path === resolvedPath + ext) {
          return file.path
        }
      }

      // 尝试 index 文件
      for (const ext of extensions) {
        if (file.path === path.join(resolvedPath, `index${ext}`)) {
          return file.path
        }
      }
    }

    return null
  }

  /**
   * 去重文件
   */
  private deduplicateFiles(files: FileInfo[]): FileInfo[] {
    const seen = new Set<string>()
    const result: FileInfo[] = []

    for (const file of files) {
      if (!seen.has(file.path)) {
        seen.add(file.path)
        result.push(file)
      }
    }

    return result
  }
}
