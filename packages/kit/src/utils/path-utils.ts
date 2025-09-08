/**
 * 路径处理工具类
 * 提供跨平台路径操作、解析、标准化等功能
 */

import { homedir, tmpdir } from 'node:os'
import {
  basename,
  dirname,
  extname,
  format,
  isAbsolute,
  join,
  normalize,
  parse,
  relative,
  resolve,
  sep,
} from 'node:path'

/**
 * 路径处理工具
 */
export class PathUtils {
  /**
   * 标准化路径（统一使用正斜杠）
   * @param filePath 文件路径
   * @returns 标准化后的路径
   */
  static normalize(filePath: string): string {
    return normalize(filePath).replace(/\\/g, '/')
  }

  /**
   * 获取相对路径
   * @param from 起始路径
   * @param to 目标路径
   * @returns 相对路径
   */
  static relative(from: string, to: string): string {
    return PathUtils.normalize(relative(from, to))
  }

  /**
   * 解析绝对路径
   * @param paths 路径片段
   * @returns 绝对路径
   */
  static resolve(...paths: string[]): string {
    return PathUtils.normalize(resolve(...paths))
  }

  /**
   * 连接路径
   * @param paths 路径片段
   * @returns 连接后的路径
   */
  static join(...paths: string[]): string {
    return PathUtils.normalize(join(...paths))
  }

  /**
   * 获取文件名（不含扩展名）
   * @param filePath 文件路径
   * @param ext 要移除的扩展名
   * @returns 文件名
   */
  static basename(filePath: string, ext?: string): string {
    return basename(filePath, ext)
  }

  /**
   * 获取目录名
   * @param filePath 文件路径
   * @returns 目录路径
   */
  static dirname(filePath: string): string {
    return PathUtils.normalize(dirname(filePath))
  }

  /**
   * 获取文件扩展名
   * @param filePath 文件路径
   * @returns 扩展名（包含点号）
   */
  static extname(filePath: string): string {
    return extname(filePath)
  }

  /**
   * 解析路径信息
   * @param filePath 文件路径
   * @returns 路径信息对象
   */
  static parse(filePath: string) {
    const parsed = parse(filePath)
    return {
      ...parsed,
      dir: PathUtils.normalize(parsed.dir),
      root: PathUtils.normalize(parsed.root),
    }
  }

  /**
   * 格式化路径
   * @param pathObject 路径对象
   * @returns 格式化后的路径
   */
  static format(pathObject: {
    dir?: string
    root?: string
    base?: string
    name?: string
    ext?: string
  }): string {
    return PathUtils.normalize(format(pathObject))
  }

  /**
   * 检查是否为绝对路径
   * @param filePath 文件路径
   * @returns 是否为绝对路径
   */
  static isAbsolute(filePath: string): boolean {
    return isAbsolute(filePath)
  }

  /**
   * 转换为绝对路径
   * @param filePath 文件路径
   * @param basePath 基础路径
   * @returns 绝对路径
   */
  static toAbsolute(filePath: string, basePath = process.cwd()): string {
    if (PathUtils.isAbsolute(filePath)) {
      return PathUtils.normalize(filePath)
    }
    return PathUtils.resolve(basePath, filePath)
  }

  /**
   * 获取用户主目录
   * @returns 用户主目录路径
   */
  static getHomeDir(): string {
    return PathUtils.normalize(homedir())
  }

  /**
   * 获取临时目录
   * @returns 临时目录路径
   */
  static getTempDir(): string {
    return PathUtils.normalize(tmpdir())
  }

  /**
   * 获取当前工作目录
   * @returns 当前工作目录路径
   */
  static getCwd(): string {
    return PathUtils.normalize(process.cwd())
  }

  /**
   * 展开波浪号路径（~）
   * @param filePath 文件路径
   * @returns 展开后的路径
   */
  static expandTilde(filePath: string): string {
    if (filePath.startsWith('~/') || filePath === '~') {
      return PathUtils.join(PathUtils.getHomeDir(), filePath.slice(2))
    }
    return filePath
  }

  /**
   * 获取路径的深度
   * @param filePath 文件路径
   * @returns 路径深度
   */
  static getDepth(filePath: string): number {
    const normalized = PathUtils.normalize(filePath)
    if (normalized === '/' || normalized === '.') {
      return 0
    }
    return normalized.split('/').filter(Boolean).length
  }

  /**
   * 获取两个路径的公共祖先路径
   * @param paths 路径数组
   * @returns 公共祖先路径
   */
  static getCommonAncestor(...paths: string[]): string {
    if (paths.length === 0)
      return ''
    if (paths.length === 1) {
      const first = paths[0] || ''
      return PathUtils.dirname(first)
    }

    const normalizedPaths = paths.map(p => PathUtils.normalize(p))
    const segments = normalizedPaths.map(p => p.split('/').filter(Boolean))

    if (segments.length === 0)
      return ''

    const minLength = Math.min(...segments.map(s => s.length))
    const commonSegments: string[] = []

    for (let i = 0; i < minLength; i++) {
      const firstSeg = segments[0] || []
      const segment = firstSeg[i]
      if (segment !== undefined && segments.every(s => s[i] === segment)) {
        commonSegments.push(segment)
      }
      else {
        break
      }
    }

    return commonSegments.length > 0 ? `/${commonSegments.join('/')}` : '/'
  }

  /**
   * 检查路径是否在指定目录内
   * @param filePath 文件路径
   * @param dirPath 目录路径
   * @returns 是否在目录内
   */
  static isInside(filePath: string, dirPath: string): boolean {
    const absoluteFile = PathUtils.toAbsolute(filePath)
    const absoluteDir = PathUtils.toAbsolute(dirPath)
    const relativePath = PathUtils.relative(absoluteDir, absoluteFile)

    return !relativePath.startsWith('../') && relativePath !== '..'
  }

  /**
   * 获取文件名（不含路径和扩展名）
   * @param filePath 文件路径
   * @returns 纯文件名
   */
  static getFileName(filePath: string): string {
    const parsed = PathUtils.parse(filePath)
    return parsed.name
  }

  /**
   * 更改文件扩展名
   * @param filePath 文件路径
   * @param newExt 新扩展名
   * @returns 新路径
   */
  static changeExtension(filePath: string, newExt: string): string {
    const parsed = PathUtils.parse(filePath)
    const ext = newExt.startsWith('.') ? newExt : `.${newExt}`
    return PathUtils.format({
      ...parsed,
      base: undefined,
      ext,
    })
  }

  /**
   * 添加后缀到文件名
   * @param filePath 文件路径
   * @param suffix 后缀
   * @returns 新路径
   */
  static addSuffix(filePath: string, suffix: string): string {
    const parsed = PathUtils.parse(filePath)
    return PathUtils.format({
      ...parsed,
      base: undefined,
      name: parsed.name + suffix,
    })
  }

  /**
   * 获取路径的所有父目录
   * @param filePath 文件路径
   * @returns 父目录数组
   */
  static getParents(filePath: string): string[] {
    const absolutePath = PathUtils.toAbsolute(filePath)
    const parents: string[] = []
    let current = PathUtils.dirname(absolutePath)

    while (current !== '/' && current !== '.') {
      parents.push(current)
      const parent = PathUtils.dirname(current)
      if (parent === current)
        break
      current = parent
    }

    if (current === '/') {
      parents.push('/')
    }

    return parents
  }

  /**
   * 检查路径是否匹配模式
   * @param filePath 文件路径
   * @param pattern 模式（支持 * 和 **）
   * @returns 是否匹配
   */
  static match(filePath: string, pattern: string): boolean {
    const normalizedPath = PathUtils.normalize(filePath)
    const normalizedPattern = PathUtils.normalize(pattern)

    // 转换 glob 模式为正则表达式
    const regexPattern = normalizedPattern
      .replace(/\*\*/g, '___DOUBLE_STAR___')
      .replace(/\*/g, '[^/]*')
      .replace(/___DOUBLE_STAR___/g, '.*')
      .replace(/\?/g, '[^/]')

    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(normalizedPath)
  }

  /**
   * 获取平台特定的路径分隔符
   * @returns 路径分隔符
   */
  static getSeparator(): string {
    return sep
  }

  /**
   * 转换为 POSIX 路径
   * @param filePath 文件路径
   * @returns POSIX 路径
   */
  static toPosix(filePath: string): string {
    return filePath.replace(/\\/g, '/')
  }

  /**
   * 转换为 Windows 路径
   * @param filePath 文件路径
   * @returns Windows 路径
   */
  static toWindows(filePath: string): string {
    return filePath.replace(/\//g, '\\')
  }

  /**
   * 获取平台特定的路径
   * @param filePath 文件路径
   * @returns 平台特定路径
   */
  static toPlatform(filePath: string): string {
    return process.platform === 'win32'
      ? PathUtils.toWindows(filePath)
      : PathUtils.toPosix(filePath)
  }

  /**
   * 检查是否为有效的文件名
   * @param fileName 文件名
   * @returns 是否有效
   */
  static isValidFileName(fileName: string): boolean {
    // Windows 禁用字符
    // eslint-disable-next-line no-control-regex
    const invalidChars = /[<>:"|?*\x00-\x1F]/
    // Windows 保留名称（非捕获分组避免未使用捕获组规则）
    const reservedNames = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i

    return (
      !invalidChars.test(fileName)
      && !reservedNames.test(fileName)
      && fileName.length > 0
      && fileName.length <= 255
      && !fileName.endsWith('.')
      && !fileName.endsWith(' ')
    )
  }

  /**
   * 清理文件名（移除无效字符）
   * @param fileName 文件名
   * @param replacement 替换字符
   * @returns 清理后的文件名
   */
  static sanitizeFileName(fileName: string, replacement = '_'): string {
    return fileName
      .replace(/[<>:"|?*\x00-\x1F]/g, replacement) /* eslint-disable-line no-control-regex */
      .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, `${replacement}$1`)
      .replace(/[. ]+$/, '')
      .slice(0, 255)
  }

  /**
   * 生成唯一文件路径
   * @param filePath 原始文件路径
   * @param exists 检查文件是否存在的函数
   * @returns 唯一文件路径
   */
  static async generateUniquePath(
    filePath: string,
    exists: (path: string) => Promise<boolean> | boolean,
  ): Promise<string> {
    if (!(await exists(filePath))) {
      return filePath
    }

    const parsed = PathUtils.parse(filePath)
    let counter = 1

    while (true) {
      const newPath = PathUtils.format({
        ...parsed,
        base: undefined,
        name: `${parsed.name} (${counter})`,
      })

      if (!(await exists(newPath))) {
        return newPath
      }

      counter++
    }
  }
}
