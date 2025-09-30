/**
 * 产物分析服务
 * 分析打包产物的文件结构、大小、依赖等信息
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { join, relative, extname, basename, dirname } from 'path'
import { logger } from '../../utils/logger.js'

const analyzerLogger = logger.withPrefix('build-analyzer')

export interface FileInfo {
  name: string
  path: string
  size: number
  type: 'file' | 'directory'
  extension?: string
  children?: FileInfo[]
}

export interface DistDirectoryInfo {
  name: string
  path: string
  exists: boolean
  totalFiles: number
  totalSize: number
  totalDirectories: number
  fileTypes: {
    type: string
    count: number
    size: number
    percentage: number
  }[]
  fileTree: FileInfo[]
  largestFiles: {
    path: string
    size: number
    percentage: number
  }[]
}

export interface BuildAnalysis {
  // 基本信息
  projectName: string
  version: string
  buildTime?: string
  
  // 产物目录（兼容旧版本）
  distPath: string
  distExists: boolean
  
  // 多个产物目录
  distDirectories: DistDirectoryInfo[]
  
  // 文件统计（所有产物目录的总和）
  totalFiles: number
  totalSize: number
  totalDirectories: number
  
  // 文件类型统计
  fileTypes: {
    type: string
    count: number
    size: number
    percentage: number
  }[]
  
  // 文件树
  fileTree: FileInfo[]
  
  // 最大文件
  largestFiles: {
    path: string
    size: number
    percentage: number
  }[]
  
  // 依赖分析（如果有 package.json）
  dependencies?: {
    production: string[]
    development: string[]
    total: number
  }
}

/**
 * 格式化文件大小
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 递归读取目录树
 */
function readDirectoryTree(dirPath: string, basePath: string): FileInfo {
  const stats = statSync(dirPath)
  const name = basename(dirPath)
  const relativePath = relative(basePath, dirPath)
  
  if (stats.isDirectory()) {
    const children: FileInfo[] = []
    
    try {
      const items = readdirSync(dirPath)
      
      for (const item of items) {
        // 跳过 node_modules 和隐藏文件
        if (item === 'node_modules' || item.startsWith('.')) {
          continue
        }
        
        const itemPath = join(dirPath, item)
        try {
          children.push(readDirectoryTree(itemPath, basePath))
        } catch (error) {
          analyzerLogger.warn(`无法读取: ${itemPath}`)
        }
      }
    } catch (error) {
      analyzerLogger.error(`读取目录失败: ${dirPath}`, error)
    }
    
    // 计算目录总大小
    const totalSize = children.reduce((sum, child) => sum + child.size, 0)
    
    return {
      name,
      path: relativePath || '.',
      size: totalSize,
      type: 'directory',
      children: children.sort((a, b) => {
        // 目录优先，然后按大小排序
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1
        }
        return b.size - a.size
      })
    }
  } else {
    return {
      name,
      path: relativePath,
      size: stats.size,
      type: 'file',
      extension: extname(name).slice(1)
    }
  }
}

/**
 * 递归统计文件
 */
function collectAllFiles(tree: FileInfo): FileInfo[] {
  const files: FileInfo[] = []
  
  if (tree.type === 'file') {
    files.push(tree)
  } else if (tree.children) {
    for (const child of tree.children) {
      files.push(...collectAllFiles(child))
    }
  }
  
  return files
}

/**
 * 分析文件类型统计
 */
function analyzeFileTypes(files: FileInfo[], totalSize: number) {
  const typeMap = new Map<string, { count: number; size: number }>()
  
  for (const file of files) {
    const ext = file.extension || 'other'
    const existing = typeMap.get(ext) || { count: 0, size: 0 }
    
    typeMap.set(ext, {
      count: existing.count + 1,
      size: existing.size + file.size
    })
  }
  
  const fileTypes = Array.from(typeMap.entries())
    .map(([type, stats]) => ({
      type,
      count: stats.count,
      size: stats.size,
      percentage: totalSize > 0 ? (stats.size / totalSize) * 100 : 0
    }))
    .sort((a, b) => b.size - a.size)
  
  return fileTypes
}

/**
 * 分析依赖信息
 */
function analyzeDependencies(projectPath: string) {
  try {
    const packageJsonPath = join(projectPath, 'package.json')
    
    if (!existsSync(packageJsonPath)) {
      return undefined
    }
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    const production = Object.keys(packageJson.dependencies || {})
    const development = Object.keys(packageJson.devDependencies || {})
    
    return {
      production,
      development,
      total: production.length + development.length
    }
  } catch (error) {
    analyzerLogger.warn('分析依赖失败:', error)
    return undefined
  }
}

/**
 * 从路径中提取目录名称
 */
function extractDirFromPath(filePath: string): string | null {
  // 匹配 ./dist/xxx 或 dist/xxx 或 ./lib/index.js 等
  const match = filePath.match(/^\.\/([^/]+)\/|^([^/]+)\//)
  if (match) {
    return match[1] || match[2]
  }
  return null
}

/**
 * 从 package.json 检测产物目录
 */
function detectDistPathsFromPackageJson(projectPath: string): string[] {
  const distDirs = new Set<string>()
  
  try {
    const packageJsonPath = join(projectPath, 'package.json')
    
    if (!existsSync(packageJsonPath)) {
      return []
    }
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    // 从 main、module、types 字段提取
    const entryFields = ['main', 'module', 'types', 'unpkg', 'jsdelivr', 'browser']
    for (const field of entryFields) {
      if (packageJson[field] && typeof packageJson[field] === 'string') {
        const dir = extractDirFromPath(packageJson[field])
        if (dir) distDirs.add(dir)
      }
    }
    
    // 从 exports 字段提取
    if (packageJson.exports && typeof packageJson.exports === 'object') {
      const extractFromExports = (obj: any) => {
        if (typeof obj === 'string') {
          const dir = extractDirFromPath(obj)
          if (dir) distDirs.add(dir)
        } else if (typeof obj === 'object' && obj !== null) {
          Object.values(obj).forEach(extractFromExports)
        }
      }
      extractFromExports(packageJson.exports)
    }
    
    // 从 files 字段提取
    if (Array.isArray(packageJson.files)) {
      for (const file of packageJson.files) {
        if (typeof file === 'string') {
          // files 字段通常直接是目录名，不带 ./ 前缀
          const cleanFile = file.replace(/^\.\//, '').split('/')[0]
          // 排除常见的非产物目录和文件
          const excludedItems = ['src', 'test', 'tests', '__tests__', 'docs', 'examples', 'scripts', '.github', 'node_modules', 'README.md', 'LICENSE', 'CHANGELOG.md', 'package.json', 'tsconfig.json']
          // 排除带扩展名的文件（如 .md, .json 等）
          const hasExtension = /\.[a-zA-Z0-9]+$/.test(cleanFile)
          if (cleanFile && !excludedItems.includes(cleanFile) && !hasExtension) {
            distDirs.add(cleanFile)
          }
        }
      }
    }
    
  } catch (error) {
    analyzerLogger.warn('从 package.json 提取产物目录失败:', error)
  }
  
  return Array.from(distDirs)
}

/**
 * 检测产物目录（兼容旧版本，返回第一个找到的目录）
 */
function detectDistPath(projectPath: string): string {
  const distPaths = detectAllDistPaths(projectPath)
  return distPaths.length > 0 ? join(projectPath, distPaths[0]) : join(projectPath, 'dist')
}

/**
 * 检测所有产物目录
 */
function detectAllDistPaths(projectPath: string): string[] {
  // 首先从 package.json 提取
  const pkgDirs = detectDistPathsFromPackageJson(projectPath)
  
  // 过滤出真实存在的目录
  const existingDirs = pkgDirs.filter(dir => {
    const fullPath = join(projectPath, dir)
    return existsSync(fullPath)
  })
  
  // 如果 package.json 中有配置且存在，则使用它们
  if (existingDirs.length > 0) {
    return existingDirs
  }
  
  // 否则使用常见的产物目录名称
  const commonDistPaths = ['dist', 'es', 'lib', 'esm', 'cjs', 'build', 'output']
  
  for (const distName of commonDistPaths) {
    const distPath = join(projectPath, distName)
    if (existsSync(distPath)) {
      return [distName]
    }
  }
  
  // 默认返回 dist（即使不存在）
  return ['dist']
}

/**
 * 分析单个产物目录
 */
function analyzeDistDirectory(projectPath: string, distDirName: string): DistDirectoryInfo {
  const distPath = join(projectPath, distDirName)
  const distExists = existsSync(distPath)
  
  if (!distExists) {
    return {
      name: distDirName,
      path: distPath,
      exists: false,
      totalFiles: 0,
      totalSize: 0,
      totalDirectories: 0,
      fileTypes: [],
      fileTree: [],
      largestFiles: []
    }
  }
  
  // 读取文件树
  const fileTree = readDirectoryTree(distPath, distPath)
  
  // 收集所有文件
  const allFiles = collectAllFiles(fileTree)
  
  // 统计信息
  const totalFiles = allFiles.length
  const totalSize = fileTree.size
  const totalDirectories = countDirectories(fileTree)
  
  // 文件类型统计
  const fileTypes = analyzeFileTypes(allFiles, totalSize)
  
  // 最大文件（前10个）
  const largestFiles = allFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map(file => ({
      path: file.path,
      size: file.size,
      percentage: totalSize > 0 ? (file.size / totalSize) * 100 : 0
    }))
  
  return {
    name: distDirName,
    path: distPath,
    exists: true,
    totalFiles,
    totalSize,
    totalDirectories,
    fileTypes,
    fileTree: [fileTree],
    largestFiles
  }
}

/**
 * 分析构建产物
 */
export function analyzeBuild(projectPath: string): BuildAnalysis {
  try {
    analyzerLogger.info(`开始分析产物: ${projectPath}`)
    
    // 读取 package.json
    const packageJsonPath = join(projectPath, 'package.json')
    let projectName = 'Unknown'
    let version = '0.0.0'
    
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        projectName = packageJson.name || projectName
        version = packageJson.version || version
      } catch (error) {
        analyzerLogger.warn('读取 package.json 失败')
      }
    }
    
    // 检测所有产物目录
    const distDirNames = detectAllDistPaths(projectPath)
    analyzerLogger.info(`检测到产物目录: ${distDirNames.join(', ')}`)
    
    // 分析每个产物目录
    const distDirectories = distDirNames.map(dirName => analyzeDistDirectory(projectPath, dirName))
    
    // 过滤出存在的目录
    const existingDistDirs = distDirectories.filter(d => d.exists)
    
    if (existingDistDirs.length === 0) {
      analyzerLogger.warn(`没有找到存在的产物目录`)
      
      // 兼容旧版本，返回第一个检测到的目录（即使不存在）
      const firstDir = distDirectories[0] || {
        name: 'dist',
        path: join(projectPath, 'dist'),
        exists: false,
        totalFiles: 0,
        totalSize: 0,
        totalDirectories: 0,
        fileTypes: [],
        fileTree: [],
        largestFiles: []
      }
      
      return {
        projectName,
        version,
        distPath: firstDir.path,
        distExists: false,
        distDirectories: [firstDir],
        totalFiles: 0,
        totalSize: 0,
        totalDirectories: 0,
        fileTypes: [],
        fileTree: [],
        largestFiles: []
      }
    }
    
    // 合并所有产物目录的统计信息
    const allFiles: FileInfo[] = []
    const allFileTrees: FileInfo[] = []
    
    for (const distDir of existingDistDirs) {
      allFileTrees.push(...distDir.fileTree)
      for (const tree of distDir.fileTree) {
        allFiles.push(...collectAllFiles(tree))
      }
    }
    
    // 总统计
    const totalFiles = allFiles.length
    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0)
    const totalDirectories = existingDistDirs.reduce((sum, dir) => sum + dir.totalDirectories, 0)
    
    // 文件类型统计（合并）
    const fileTypes = analyzeFileTypes(allFiles, totalSize)
    
    // 最大文件（所有目录中的前10个）
    const largestFiles = allFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(file => ({
        path: file.path,
        size: file.size,
        percentage: totalSize > 0 ? (file.size / totalSize) * 100 : 0
      }))
    
    // 依赖分析
    const dependencies = analyzeDependencies(projectPath)
    
    // 兼容旧版本：使用第一个存在的目录作为 distPath
    const primaryDistDir = existingDistDirs[0]
    
    const analysis: BuildAnalysis = {
      projectName,
      version,
      buildTime: new Date().toISOString(),
      distPath: primaryDistDir.path,
      distExists: true,
      distDirectories,
      totalFiles,
      totalSize,
      totalDirectories,
      fileTypes,
      fileTree: allFileTrees,
      largestFiles,
      dependencies
    }
    
    analyzerLogger.info(`分析完成: ${distDirectories.length} 个产物目录, ${totalFiles} 文件, ${formatSize(totalSize)}`)
    
    return analysis
  } catch (error) {
    analyzerLogger.error('分析产物失败:', error)
    throw error
  }
}

/**
 * 统计目录数量
 */
function countDirectories(tree: FileInfo): number {
  let count = 0
  
  if (tree.type === 'directory') {
    count = 1
    if (tree.children) {
      for (const child of tree.children) {
        count += countDirectories(child)
      }
    }
  }
  
  return count
}

/**
 * 获取产物摘要信息（轻量级）
 */
export function getBuildSummary(projectPath: string): {
  exists: boolean
  totalSize?: number
  totalFiles?: number
  distPath?: string
  distDirectories?: string[]
  lastBuildTime?: number
  largestFile?: { name: string; size: number }
} {
  try {
    // 检测所有产物目录
    const distDirNames = detectAllDistPaths(projectPath)
    
    // 过滤出存在的目录
    const existingDirs = distDirNames.filter(dirName => {
      const fullPath = join(projectPath, dirName)
      return existsSync(fullPath)
    })
    
    if (existingDirs.length === 0) {
      return { exists: false }
    }
    
    // 计算所有产物目录的总大小和文件数
    let totalSize = 0
    let totalFiles = 0
    let lastBuildTime = 0
    const allFiles: FileInfo[] = []
    
    for (const dirName of existingDirs) {
      const distPath = join(projectPath, dirName)
      const fileTree = readDirectoryTree(distPath, distPath)
      const files = collectAllFiles(fileTree)
      
      totalSize += fileTree.size
      totalFiles += files.length
      allFiles.push(...files)
      
      // 获取最后修改时间
      try {
        const stats = statSync(distPath)
        if (stats.mtimeMs > lastBuildTime) {
          lastBuildTime = stats.mtimeMs
        }
      } catch (error) {
        // 忽略错误
      }
    }
    
    // 找到最大的文件
    let largestFile: { name: string; size: number } | undefined
    if (allFiles.length > 0) {
      const sorted = allFiles.sort((a, b) => b.size - a.size)
      const largest = sorted[0]
      largestFile = {
        name: basename(largest.path),
        size: largest.size
      }
    }
    
    // 返回第一个目录作为主目录（兼容旧版本）
    const primaryDistPath = join(projectPath, existingDirs[0])
    
    return {
      exists: true,
      totalSize,
      totalFiles,
      distPath: primaryDistPath,
      distDirectories: existingDirs,
      lastBuildTime: lastBuildTime || undefined,
      largestFile
    }
  } catch (error) {
    analyzerLogger.error('获取产物摘要失败:', error)
    return { exists: false }
  }
}
