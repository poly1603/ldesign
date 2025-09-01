/**
 * 路径工具函数
 */

/**
 * 路径工具类
 */
export const pathUtils = {
  /**
   * 规范化路径
   */
  normalize(path: string): string {
    if (!path)
      return '.'

    // 将反斜杠转换为正斜杠
    let normalized = path.replace(/\\/g, '/')

    // 移除多余的斜杠
    normalized = normalized.replace(/\/+/g, '/')

    // 处理相对路径
    if (normalized.startsWith('./')) {
      normalized = normalized.slice(2)
    }

    // 如果是空字符串，返回当前目录
    if (!normalized)
      return '.'

    return normalized
  },

  /**
   * 解析模板路径
   */
  parseTemplatePath(path: string): {
    category: string
    device: string
    templateName: string
    fileName: string
  } {
    if (!path) {
      throw new Error('Path cannot be empty')
    }

    const normalized = this.normalize(path)
    const parts = normalized.split('/')

    // 移除可能的 templates 前缀
    let startIndex = 0
    if (parts[0] === 'templates' || parts[0] === 'src') {
      startIndex = 1
    }
    if (parts[startIndex] === 'templates') {
      startIndex++
    }

    const relevantParts = parts.slice(startIndex)

    if (relevantParts.length < 4) {
      throw new Error('Invalid template path format')
    }

    const fileName = relevantParts[relevantParts.length - 1]
    const templateName = relevantParts[relevantParts.length - 2]
    const device = relevantParts[relevantParts.length - 3]
    const category = relevantParts.slice(0, -3).join('/')

    return {
      category,
      device,
      templateName,
      fileName,
    }
  },

  /**
   * 构建模板路径
   */
  buildTemplatePath(category: string, device: string, templateName: string, fileName?: string): string {
    if (!category || !device || !templateName) {
      throw new Error('Category, device, and templateName are required')
    }

    const parts = [category, device, templateName]
    if (fileName) {
      parts.push(fileName)
    }

    return parts.join('/')
  },

  /**
   * 检查文件是否在目录内
   */
  isInsideDirectory(filePath: string, dirPath: string): boolean {
    if (!filePath || !dirPath)
      return false

    const normalizedFile = this.normalize(filePath)
    const normalizedDir = this.normalize(dirPath)

    return normalizedFile.startsWith(`${normalizedDir}/`) && normalizedFile !== normalizedDir
  },

  /**
   * 获取相对路径
   */
  getRelativePath(basePath: string, targetPath: string): string {
    const normalizedBase = this.normalize(basePath)
    const normalizedTarget = this.normalize(targetPath)

    if (normalizedBase === normalizedTarget) {
      return '.'
    }

    if (normalizedTarget.startsWith(`${normalizedBase}/`)) {
      return normalizedTarget.slice(normalizedBase.length + 1)
    }

    // 简单的相对路径计算
    const baseParts = normalizedBase.split('/')
    const targetParts = normalizedTarget.split('/')

    let commonLength = 0
    for (let i = 0; i < Math.min(baseParts.length, targetParts.length); i++) {
      if (baseParts[i] === targetParts[i]) {
        commonLength++
      }
      else {
        break
      }
    }

    const upLevels = baseParts.length - commonLength
    const downPath = targetParts.slice(commonLength).join('/')

    const upPath = '../'.repeat(upLevels)
    return upPath + downPath
  },

  /**
   * 连接路径段
   */
  joinPaths(...segments: string[]): string {
    const filtered = segments.filter(segment => segment && segment.trim())
    if (filtered.length === 0)
      return ''

    let result = filtered[0]
    for (let i = 1; i < filtered.length; i++) {
      const segment = filtered[i]
      if (segment.startsWith('/')) {
        result = segment
      }
      else {
        if (!result.endsWith('/')) {
          result += '/'
        }
        result += segment
      }
    }

    return this.normalize(result)
  },

  /**
   * 获取文件扩展名
   */
  getFileExtension(filePath: string): string {
    const fileName = this.getFileName(filePath)
    const lastDotIndex = fileName.lastIndexOf('.')

    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return ''
    }

    return fileName.slice(lastDotIndex)
  },

  /**
   * 获取文件名
   */
  getFileName(filePath: string): string {
    if (!filePath)
      return ''
    const normalized = this.normalize(filePath)
    const parts = normalized.split('/')
    return parts[parts.length - 1] || ''
  },

  /**
   * 获取目录名
   */
  getDirectoryName(filePath: string): string {
    const normalized = this.normalize(filePath)
    const lastSlashIndex = normalized.lastIndexOf('/')

    if (lastSlashIndex === -1) {
      return '.'
    }

    if (lastSlashIndex === 0) {
      return '/'
    }

    return normalized.slice(0, lastSlashIndex)
  },

  /**
   * 检查是否为绝对路径
   */
  isAbsolutePath(path: string): boolean {
    if (!path)
      return false

    // Unix 绝对路径
    if (path.startsWith('/'))
      return true

    // Windows 绝对路径
    if (/^[A-Z]:[\\/]/i.test(path))
      return true

    // UNC 路径
    if (path.startsWith('\\\\'))
      return true

    return false
  },

  /**
   * 解析路径
   */
  resolvePath(basePath: string, relativePath: string): string {
    if (this.isAbsolutePath(relativePath)) {
      return this.normalize(relativePath)
    }

    const joined = this.joinPaths(basePath, relativePath)
    const normalized = this.normalize(joined)

    // 处理 . 和 .. 路径段
    const parts = normalized.split('/')
    const resolved: string[] = []

    for (const part of parts) {
      if (part === '.' || part === '') {
        continue
      }
      else if (part === '..') {
        if (resolved.length > 0 && resolved[resolved.length - 1] !== '..') {
          resolved.pop()
        }
        else if (!normalized.startsWith('/')) {
          resolved.push('..')
        }
      }
      else {
        resolved.push(part)
      }
    }

    let result = resolved.join('/')
    if (normalized.startsWith('/') && !result.startsWith('/')) {
      result = `/${result}`
    }

    return result || (normalized.startsWith('/') ? '/' : '.')
  },
}
