/**
 * 路径工具
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import * as path from 'path'
import { homedir, platform } from 'os'

export class PathUtils {
  /**
   * 解析路径为绝对路径
   */
  static resolve(...paths: string[]): string {
    return path.resolve(...paths)
  }

  /**
   * 连接路径
   */
  static join(...paths: string[]): string {
    return path.join(...paths)
  }

  /**
   * 获取相对路径
   */
  static relative(from: string, to: string): string {
    return path.relative(from, to)
  }

  /**
   * 获取目录名
   */
  static dirname(pathStr: string): string {
    return path.dirname(pathStr)
  }

  /**
   * 获取文件名
   */
  static basename(pathStr: string, ext?: string): string {
    return path.basename(pathStr, ext)
  }

  /**
   * 获取文件扩展名
   */
  static extname(pathStr: string): string {
    return path.extname(pathStr)
  }

  /**
   * 解析路径
   */
  static parse(pathStr: string): {
    root: string
    dir: string
    base: string
    ext: string
    name: string
  } {
    return path.parse(pathStr)
  }

  /**
   * 格式化路径
   */
  static format(pathObject: {
    root?: string
    dir?: string
    base?: string
    ext?: string
    name?: string
  }): string {
    return path.format(pathObject)
  }

  /**
   * 检查是否为绝对路径
   */
  static isAbsolute(pathStr: string): boolean {
    return path.isAbsolute(pathStr)
  }

  /**
   * 规范化路径
   */
  static normalize(pathStr: string): string {
    return path.normalize(pathStr)
  }

  /**
   * 获取路径分隔符
   */
  static get sep(): string {
    return path.sep
  }

  /**
   * 获取 POSIX 路径工具
   */
  static get posix() {
    return path.posix
  }

  /**
   * 获取 Windows 路径工具
   */
  static get win32() {
    return path.win32
  }

  /**
   * 转换为 POSIX 路径
   */
  static toPosix(pathStr: string): string {
    return pathStr.split(path.sep).join(path.posix.sep)
  }

  /**
   * 转换为 Windows 路径
   */
  static toWin32(pathStr: string): string {
    return pathStr.split(path.posix.sep).join(path.win32.sep)
  }

  /**
   * 获取用户主目录
   */
  static getHomeDir(): string {
    return homedir()
  }

  /**
   * 展开波浪号路径
   */
  static expandTilde(path: string): string {
    if (path.startsWith('~/') || path === '~') {
      return join(homedir(), path.slice(2))
    }
    return path
  }

  /**
   * 获取当前工作目录
   */
  static getCwd(): string {
    return process.cwd()
  }

  /**
   * 检查路径是否在指定目录内
   */
  static isInside(path: string, parent: string): boolean {
    const rel = relative(parent, path)
    return !rel.startsWith('..') && !isAbsolute(rel)
  }

  /**
   * 获取公共路径前缀
   */
  static getCommonPath(paths: string[]): string {
    if (paths.length === 0) return ''
    if (paths.length === 1) return path.dirname(paths[0])

    const resolved = paths.map(p => path.resolve(p))
    const parts = resolved[0].split(path.sep)

    for (let i = 1; i < resolved.length; i++) {
      const currentParts = resolved[i].split(path.sep)
      let j = 0

      while (j < parts.length && j < currentParts.length && parts[j] === currentParts[j]) {
        j++
      }

      parts.length = j
    }

    return parts.join(path.sep) || path.sep
  }

  /**
   * 确保路径以指定字符结尾
   */
  static ensureTrailing(pathStr: string, char: string = path.sep): string {
    return pathStr.endsWith(char) ? pathStr : pathStr + char
  }

  /**
   * 确保路径不以指定字符结尾
   */
  static removeTrailing(pathStr: string, char: string = path.sep): string {
    return pathStr.endsWith(char) ? pathStr.slice(0, -char.length) : pathStr
  }

  /**
   * 确保路径以指定字符开头
   */
  static ensureLeading(pathStr: string, char: string = path.sep): string {
    return pathStr.startsWith(char) ? pathStr : char + pathStr
  }

  /**
   * 确保路径不以指定字符开头
   */
  static removeLeading(pathStr: string, char: string = path.sep): string {
    return pathStr.startsWith(char) ? pathStr.slice(char.length) : pathStr
  }

  /**
   * 获取文件名（不含扩展名）
   */
  static getNameWithoutExt(path: string): string {
    const parsed = parse(path)
    return parsed.name
  }

  /**
   * 更改文件扩展名
   */
  static changeExt(path: string, newExt: string): string {
    const parsed = parse(path)
    return format({
      ...parsed,
      base: undefined,
      ext: newExt.startsWith('.') ? newExt : '.' + newExt
    })
  }

  /**
   * 添加后缀到文件名
   */
  static addSuffix(path: string, suffix: string): string {
    const parsed = parse(path)
    return format({
      ...parsed,
      base: undefined,
      name: parsed.name + suffix
    })
  }

  /**
   * 获取深度（从根目录开始的层级数）
   */
  static getDepth(pathStr: string): number {
    const normalized = path.normalize(path.resolve(pathStr))
    const parts = normalized.split(path.sep).filter(Boolean)
    return parts.length
  }

  /**
   * 检查是否为隐藏文件/目录
   */
  static isHidden(path: string): boolean {
    const name = basename(path)
    return name.startsWith('.')
  }

  /**
   * 获取相对于项目根目录的路径
   */
  static getProjectRelative(path: string, projectRoot?: string): string {
    const root = projectRoot || this.findProjectRoot() || this.getCwd()
    return relative(root, path)
  }

  /**
   * 查找项目根目录（包含 package.json 的目录）
   */
  static findProjectRoot(startPath?: string): string | null {
    let currentPath = resolve(startPath || this.getCwd())

    while (currentPath !== dirname(currentPath)) {
      try {
        const packageJsonPath = join(currentPath, 'package.json')
        require.resolve(packageJsonPath)
        return currentPath
      } catch {
        currentPath = dirname(currentPath)
      }
    }

    return null
  }

  /**
   * 获取平台特定的路径
   */
  static getPlatformPath(pathStr: string): string {
    return platform() === 'win32' ? this.toWin32(pathStr) : this.toPosix(pathStr)
  }

  /**
   * 创建安全的文件名
   */
  static sanitizeFilename(filename: string): string {
    // 移除或替换不安全的字符
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  /**
   * 生成唯一的文件路径
   */
  static getUniquePath(basePath: string): string {
    const parsed = path.parse(basePath)
    let counter = 1
    let uniquePath = basePath

    const fs = require('fs')

    while (fs.existsSync(uniquePath)) {
      uniquePath = path.format({
        ...parsed,
        base: undefined,
        name: `${parsed.name}_${counter}`
      })
      counter++
    }

    return uniquePath
  }
}

// 导出便捷函数
export const {
  toPosix,
  toWin32,
  getHomeDir,
  expandTilde,
  getCwd,
  isInside,
  getCommonPath,
  ensureTrailing,
  removeTrailing,
  ensureLeading,
  removeLeading,
  getNameWithoutExt,
  changeExt,
  addSuffix,
  getDepth,
  isHidden,
  getProjectRelative,
  findProjectRoot,
  getPlatformPath,
  sanitizeFilename,
  getUniquePath
} = PathUtils

// 重新导出 path 模块的基本函数
export const { resolve, join, relative, dirname, basename, extname, parse, format, isAbsolute, normalize } = path
