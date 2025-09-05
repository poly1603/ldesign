/**
 * 路径处理工具
 * 
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */

import path from 'path'
import { fileURLToPath } from 'url'

/**
 * 路径工具类
 */
export class PathUtils {
  /**
   * 规范化路径（统一使用正斜杠）
   */
  static normalize(filePath: string): string {
    return path.posix.normalize(filePath.replace(/\\/g, '/'))
  }

  /**
   * 解析绝对路径
   */
  static resolve(...paths: string[]): string {
    return path.resolve(...paths)
  }

  /**
   * 获取相对路径
   */
  static relative(from: string, to: string): string {
    return this.normalize(path.relative(from, to))
  }

  /**
   * 连接路径
   */
  static join(...paths: string[]): string {
    return this.normalize(path.join(...paths))
  }

  /**
   * 获取目录名
   */
  static dirname(filePath: string): string {
    return this.normalize(path.dirname(filePath))
  }

  /**
   * 获取文件名（包含扩展名）
   */
  static basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext)
  }

  /**
   * 获取文件扩展名
   */
  static extname(filePath: string): string {
    return path.extname(filePath)
  }

  /**
   * 获取文件名（不包含扩展名）
   */
  static filename(filePath: string): string {
    return this.basename(filePath, this.extname(filePath))
  }

  /**
   * 判断路径是否为绝对路径
   */
  static isAbsolute(filePath: string): boolean {
    return path.isAbsolute(filePath)
  }

  /**
   * 转换为绝对路径
   */
  static toAbsolute(filePath: string, basePath?: string): string {
    if (this.isAbsolute(filePath)) {
      return this.normalize(filePath)
    }
    return this.resolve(basePath || process.cwd(), filePath)
  }

  /**
   * 转换为相对路径
   */
  static toRelative(filePath: string, basePath?: string): string {
    const base = basePath || process.cwd()
    if (this.isAbsolute(filePath)) {
      return this.relative(base, filePath)
    }
    return this.normalize(filePath)
  }

  /**
   * 替换文件扩展名
   */
  static replaceExt(filePath: string, newExt: string): string {
    const dir = this.dirname(filePath)
    const name = this.filename(filePath)
    const ext = newExt.startsWith('.') ? newExt : `.${newExt}`
    return this.join(dir, `${name}${ext}`)
  }

  /**
   * 添加后缀到文件名
   */
  static addSuffix(filePath: string, suffix: string): string {
    const dir = this.dirname(filePath)
    const name = this.filename(filePath)
    const ext = this.extname(filePath)
    return this.join(dir, `${name}${suffix}${ext}`)
  }

  /**
   * 获取路径的各个部分
   */
  static parse(filePath: string): {
    root: string
    dir: string
    base: string
    ext: string
    name: string
  } {
    const parsed = path.parse(filePath)
    return {
      root: parsed.root,
      dir: this.normalize(parsed.dir),
      base: parsed.base,
      ext: parsed.ext,
      name: parsed.name
    }
  }

  /**
   * 从路径部分构建路径
   */
  static format(pathObject: {
    root?: string
    dir?: string
    base?: string
    ext?: string
    name?: string
  }): string {
    return this.normalize(path.format(pathObject))
  }

  /**
   * 检查路径是否在指定目录内
   */
  static isInside(filePath: string, dirPath: string): boolean {
    const relativePath = this.relative(dirPath, filePath)
    return !relativePath.startsWith('../') && !this.isAbsolute(relativePath)
  }

  /**
   * 获取两个路径的公共父目录
   */
  static getCommonParent(path1: string, path2: string): string {
    const abs1 = this.toAbsolute(path1)
    const abs2 = this.toAbsolute(path2)
    
    const parts1 = abs1.split(path.sep)
    const parts2 = abs2.split(path.sep)
    
    const commonParts: string[] = []
    const minLength = Math.min(parts1.length, parts2.length)
    
    for (let i = 0; i < minLength; i++) {
      if (parts1[i] === parts2[i]) {
        commonParts.push(parts1[i])
      } else {
        break
      }
    }
    
    return commonParts.join(path.sep) || path.sep
  }

  /**
   * 获取路径深度
   */
  static getDepth(filePath: string): number {
    const normalized = this.normalize(filePath)
    if (normalized === '/' || normalized === '.') {
      return 0
    }
    return normalized.split('/').filter(part => part && part !== '.').length
  }

  /**
   * 匹配路径模式
   */
  static matchPattern(filePath: string, pattern: string): boolean {
    // 简单的 glob 模式匹配
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(this.normalize(filePath))
  }

  /**
   * 获取文件的 URL 路径
   */
  static toFileURL(filePath: string): string {
    const absolutePath = this.toAbsolute(filePath)
    return `file://${absolutePath.replace(/\\/g, '/')}`
  }

  /**
   * 从文件 URL 获取路径
   */
  static fromFileURL(fileURL: string): string {
    return this.normalize(fileURLToPath(fileURL))
  }

  /**
   * 获取项目根目录
   */
  static findProjectRoot(startPath?: string): string {
    let currentPath = startPath || process.cwd()
    
    while (currentPath !== path.dirname(currentPath)) {
      // 检查是否存在 package.json
      const packageJsonPath = this.join(currentPath, 'package.json')
      if (require('fs').existsSync(packageJsonPath)) {
        return currentPath
      }
      
      // 检查是否存在 .git 目录
      const gitPath = this.join(currentPath, '.git')
      if (require('fs').existsSync(gitPath)) {
        return currentPath
      }
      
      currentPath = path.dirname(currentPath)
    }
    
    // 如果没找到，返回起始路径
    return startPath || process.cwd()
  }

  /**
   * 获取相对于项目根目录的路径
   */
  static getProjectRelativePath(filePath: string, projectRoot?: string): string {
    const root = projectRoot || this.findProjectRoot()
    return this.relative(root, filePath)
  }

  /**
   * 清理路径（移除多余的分隔符和相对路径符号）
   */
  static clean(filePath: string): string {
    return this.normalize(filePath)
      .replace(/\/+/g, '/') // 移除多余的斜杠
      .replace(/\/\.\//g, '/') // 移除 ./
      .replace(/\/\.$/, '') // 移除结尾的 /.
      .replace(/^\.\//g, '') // 移除开头的 ./
  }

  /**
   * 确保路径以指定字符结尾
   */
  static ensureTrailingSlash(dirPath: string): string {
    const normalized = this.normalize(dirPath)
    return normalized.endsWith('/') ? normalized : `${normalized}/`
  }

  /**
   * 确保路径不以指定字符结尾
   */
  static removeTrailingSlash(dirPath: string): string {
    const normalized = this.normalize(dirPath)
    return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized
  }

  /**
   * 获取路径的所有父目录
   */
  static getParents(filePath: string): string[] {
    const parents: string[] = []
    let currentPath = this.dirname(filePath)
    
    while (currentPath !== this.dirname(currentPath)) {
      parents.push(currentPath)
      currentPath = this.dirname(currentPath)
    }
    
    return parents
  }

  /**
   * 检查路径是否为隐藏文件或目录
   */
  static isHidden(filePath: string): boolean {
    const basename = this.basename(filePath)
    return basename.startsWith('.')
  }

  /**
   * 获取平台特定的路径分隔符
   */
  static get sep(): string {
    return path.sep
  }

  /**
   * 获取平台特定的路径定界符
   */
  static get delimiter(): string {
    return path.delimiter
  }
}

// 导出便捷函数
export const {
  normalize,
  resolve,
  relative,
  join,
  dirname,
  basename,
  extname,
  filename,
  isAbsolute,
  toAbsolute,
  toRelative,
  replaceExt,
  addSuffix,
  parse,
  format,
  isInside,
  getCommonParent,
  getDepth,
  matchPattern,
  toFileURL,
  fromFileURL,
  findProjectRoot,
  getProjectRelativePath,
  clean,
  ensureTrailingSlash,
  removeTrailingSlash,
  getParents,
  isHidden
} = PathUtils
