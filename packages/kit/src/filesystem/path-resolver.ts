/**
 * 路径解析器
 * 提供高级路径解析和处理功能
 */

import { existsSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { FileSystemError } from '../types'
import { PathUtils } from '../utils'
import { FileSystem } from './file-system'

/**
 * 路径解析器类
 */
export class PathResolver {
  private static readonly VARIABLE_PATTERN = /\$\{([^}]+)\}/g
  private static readonly ENV_PATTERN = /\$([A-Z_][A-Z0-9_]*)/g

  /**
   * 解析路径中的变量
   * @param path 包含变量的路径
   * @param variables 变量映射
   * @returns 解析后的路径
   */
  static resolvePath(path: string, variables: Record<string, string> = {}): string {
    let resolvedPath = path

    // 解析自定义变量 ${VAR}
    resolvedPath = resolvedPath.replace(PathResolver.VARIABLE_PATTERN, (match, varName) => {
      if (variables[varName] !== undefined) {
        return variables[varName]
      }

      // 尝试从环境变量获取
      const envValue = process.env[varName]
      if (envValue !== undefined) {
        return envValue
      }

      // 内置变量
      switch (varName) {
        case 'HOME':
        case 'USERPROFILE':
          return homedir()
        case 'TEMP':
        case 'TMP':
          return tmpdir()
        case 'CWD':
          return process.cwd()
        case 'NODE_MODULES':
          return PathResolver.findNodeModules()
        default:
          return match // 保持原样
      }
    })

    // 解析环境变量 $VAR
    resolvedPath = resolvedPath.replace(PathResolver.ENV_PATTERN, (match, varName) => {
      const envValue = process.env[varName]
      return envValue !== undefined ? envValue : match
    })

    // 展开波浪号
    resolvedPath = PathUtils.expandTilde(resolvedPath)

    // 转换为绝对路径
    if (!PathUtils.isAbsolute(resolvedPath)) {
      resolvedPath = resolve(resolvedPath)
    }

    return PathUtils.normalize(resolvedPath)
  }

  /**
   * 查找最近的文件
   * @param fileName 文件名
   * @param startDir 开始搜索的目录
   * @returns 找到的文件路径
   */
  static async findUp(fileName: string, startDir: string = process.cwd()): Promise<string | null> {
    let currentDir = resolve(startDir)

    while (true) {
      const filePath = join(currentDir, fileName)

      if (await FileSystem.exists(filePath)) {
        return filePath
      }

      const parentDir = dirname(currentDir)
      if (parentDir === currentDir) {
        // 已到达根目录
        break
      }

      currentDir = parentDir
    }

    return null
  }

  /**
   * 查找项目根目录
   * @param startDir 开始搜索的目录
   * @param indicators 项目根目录指示文件
   * @returns 项目根目录路径
   */
  static async findProjectRoot(
    startDir: string = process.cwd(),
    indicators: string[] = ['package.json', '.git', 'pnpm-workspace.yaml', 'lerna.json'],
  ): Promise<string | null> {
    for (const indicator of indicators) {
      const found = await PathResolver.findUp(indicator, startDir)
      if (found) {
        return dirname(found)
      }
    }

    return null
  }

  /**
   * 查找 node_modules 目录
   * @param startDir 开始搜索的目录
   * @returns node_modules 目录路径
   */
  static findNodeModules(startDir: string = process.cwd()): string {
    let currentDir = resolve(startDir)

    while (true) {
      const nodeModulesPath = join(currentDir, 'node_modules')

      if (existsSync(nodeModulesPath)) {
        return nodeModulesPath
      }

      const parentDir = dirname(currentDir)
      if (parentDir === currentDir) {
        // 已到达根目录，返回默认路径
        break
      }

      currentDir = parentDir
    }

    // 返回当前目录下的 node_modules（即使不存在）
    return join(process.cwd(), 'node_modules')
  }

  /**
   * 解析模块路径
   * @param moduleName 模块名
   * @param startDir 开始搜索的目录
   * @returns 模块路径
   */
  static async resolveModule(
    moduleName: string,
    startDir: string = process.cwd(),
  ): Promise<string | null> {
    // 如果是相对路径，直接解析
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      const resolved = resolve(startDir, moduleName)
      return (await FileSystem.exists(resolved)) ? resolved : null
    }

    // 如果是绝对路径，直接返回
    if (PathUtils.isAbsolute(moduleName)) {
      return (await FileSystem.exists(moduleName)) ? moduleName : null
    }

    // 搜索 node_modules
    let currentDir = resolve(startDir)

    while (true) {
      const nodeModulesPath = join(currentDir, 'node_modules', moduleName)

      if (await FileSystem.exists(nodeModulesPath)) {
        return nodeModulesPath
      }

      const parentDir = dirname(currentDir)
      if (parentDir === currentDir) {
        break
      }

      currentDir = parentDir
    }

    return null
  }

  /**
   * 创建相对路径映射
   * @param basePath 基础路径
   * @param paths 路径数组
   * @returns 相对路径映射
   */
  static createRelativeMapping(basePath: string, paths: string[]): Record<string, string> {
    const mapping: Record<string, string> = {}
    const resolvedBase = resolve(basePath)

    for (const path of paths) {
      const resolvedPath = resolve(path)
      const relativePath = relative(resolvedBase, resolvedPath)
      mapping[path] = PathUtils.normalize(relativePath)
    }

    return mapping
  }

  /**
   * 解析 glob 模式
   * @param pattern glob 模式
   * @param basePath 基础路径
   * @returns 解析后的模式
   */
  static resolveGlobPattern(pattern: string, basePath: string = process.cwd()): string {
    // 如果模式是绝对路径，直接返回
    if (PathUtils.isAbsolute(pattern)) {
      return PathUtils.normalize(pattern)
    }

    // 解析变量
    const resolvedPattern = PathResolver.resolvePath(pattern)

    // 如果解析后是绝对路径，直接返回
    if (PathUtils.isAbsolute(resolvedPattern)) {
      return PathUtils.normalize(resolvedPattern)
    }

    // 相对于基础路径
    return PathUtils.normalize(join(basePath, resolvedPattern))
  }

  /**
   * 创建路径别名解析器
   * @param aliases 别名映射
   * @param basePath 基础路径
   * @returns 别名解析器
   */
  static createAliasResolver(
    aliases: Record<string, string>,
    basePath: string = process.cwd(),
  ): (path: string) => string {
    const resolvedAliases: Record<string, string> = {}

    // 预解析所有别名
    for (const [alias, target] of Object.entries(aliases)) {
      resolvedAliases[alias] = PathResolver.resolvePath(target, { BASE: basePath })
    }

    return (path: string): string => {
      // 检查是否匹配任何别名
      for (const [alias, target] of Object.entries(resolvedAliases)) {
        if (path === alias) {
          return target
        }

        if (path.startsWith(`${alias}/`)) {
          return join(target, path.slice(alias.length + 1))
        }
      }

      // 没有匹配的别名，按正常路径解析
      return PathResolver.resolvePath(path, { BASE: basePath })
    }
  }

  /**
   * 获取路径的所有可能变体
   * @param path 路径
   * @returns 路径变体数组
   */
  static getPathVariants(path: string): string[] {
    const variants: string[] = []
    const normalized = PathUtils.normalize(path)

    variants.push(normalized)

    // 添加不同的扩展名变体
    const extensions = ['.js', '.ts', '.json', '.mjs', '.cjs']
    const withoutExt = PathUtils.parse(normalized).name
    const dir = PathUtils.dirname(normalized)

    for (const ext of extensions) {
      variants.push(join(dir, withoutExt + ext))
    }

    // 如果是目录，添加 index 文件变体
    for (const ext of extensions) {
      variants.push(join(normalized, `index${ext}`))
    }

    return [...new Set(variants)] // 去重
  }

  /**
   * 解析配置文件路径
   * @param configName 配置文件名（不含扩展名）
   * @param searchDirs 搜索目录
   * @returns 配置文件路径
   */
  static async resolveConfigFile(
    configName: string,
    searchDirs: string[] = [process.cwd()],
  ): Promise<string | null> {
    const extensions = ['.json', '.js', '.ts', '.mjs', '.cjs', '.yaml', '.yml']
    const variants = [configName, `.${configName}`, `${configName}.config`, `.${configName}.config`]

    for (const searchDir of searchDirs) {
      for (const variant of variants) {
        for (const ext of extensions) {
          const configPath = join(searchDir, variant + ext)

          if (await FileSystem.exists(configPath)) {
            return configPath
          }
        }
      }
    }

    return null
  }

  /**
   * 创建安全路径（防止路径遍历攻击）
   * @param basePath 基础路径
   * @param userPath 用户提供的路径
   * @returns 安全的路径
   */
  static createSafePath(basePath: string, userPath: string): string {
    const resolvedBase = resolve(basePath)
    const resolvedUser = resolve(resolvedBase, userPath)

    // 检查解析后的路径是否在基础路径内
    if (!PathUtils.isInside(resolvedUser, resolvedBase)) {
      throw new FileSystemError(`Path traversal detected: ${userPath}`, userPath)
    }

    return PathUtils.normalize(resolvedUser)
  }

  /**
   * 批量解析路径
   * @param paths 路径数组
   * @param variables 变量映射
   * @returns 解析后的路径数组
   */
  static resolvePaths(paths: string[], variables: Record<string, string> = {}): string[] {
    return paths.map(path => PathResolver.resolvePath(path, variables))
  }

  /**
   * 获取路径的元数据
   * @param path 路径
   * @returns 路径元数据
   */
  static getPathMetadata(path: string): PathMetadata {
    const resolved = PathResolver.resolvePath(path)
    const parsed = PathUtils.parse(resolved)

    return {
      original: path,
      resolved,
      isAbsolute: PathUtils.isAbsolute(path),
      isResolved: PathUtils.isAbsolute(resolved),
      depth: PathUtils.getDepth(resolved),
      segments: resolved.split('/').filter(Boolean),
      ...parsed,
    }
  }
}

// 类型定义
interface PathMetadata {
  original: string
  resolved: string
  isAbsolute: boolean
  isResolved: boolean
  depth: number
  segments: string[]
  root: string
  dir: string
  base: string
  ext: string
  name: string
}
