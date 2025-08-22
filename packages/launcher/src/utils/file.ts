/**
 * 文件系统工具模块
 * 提供文件和目录操作的工具函数
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * 文件系统操作工具类
 * 封装了常用的文件和目录操作方法
 */
export class FileUtils {
  /**
   * 检查文件或目录是否存在
   * @param filePath 文件路径
   * @returns 是否存在
   * @example
   * ```typescript
   * const exists = await FileUtils.exists('./package.json')
   * console.log(exists) // true or false
   * ```
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否为目录
   * @param dirPath 目录路径
   * @returns 是否为目录
   * @example
   * ```typescript
   * const isDir = await FileUtils.isDirectory('./src')
   * console.log(isDir) // true or false
   * ```
   */
  static async isDirectory(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath)
      return stat.isDirectory()
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否为文件
   * @param filePath 文件路径
   * @returns 是否为文件
   * @example
   * ```typescript
   * const isFile = await FileUtils.isFile('./package.json')
   * console.log(isFile) // true or false
   * ```
   */
  static async isFile(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath)
      return stat.isFile()
    }
    catch {
      return false
    }
  }

  /**
   * 确保目录存在，不存在则创建
   * @param dirPath 目录路径
   * @throws {Error} 创建目录失败时抛出异常
   * @example
   * ```typescript
   * await FileUtils.ensureDir('./dist/assets')
   * // 确保 dist/assets 目录存在
   * ```
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true })
    }
    catch (error) {
      const nodeError = error as NodeJS.ErrnoException
      if (nodeError.code !== 'EEXIST') {
        throw new Error(`创建目录失败: ${dirPath}. 原因: ${nodeError.message}`)
      }
    }
  }

  /**
   * 读取 JSON 文件并解析
   * @param filePath 文件路径
   * @returns JSON 对象
   * @throws {Error} 文件不存在或解析失败时抛出异常
   * @example
   * ```typescript
   * const packageJson = await FileUtils.readJson<PackageJson>('./package.json')
   * console.log(packageJson.name)
   * ```
   */
  static async readJson<T = Record<string, unknown>>(filePath: string): Promise<T> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content) as T
    }
    catch (error) {
      throw new Error(`读取JSON文件失败: ${filePath}. 原因: ${(error as Error).message}`)
    }
  }

  /**
   * 将对象写入 JSON 文件
   * @param filePath 文件路径
   * @param data 数据对象
   * @param indent 缩进空格数
   * @throws {Error} 写入失败时抛出异常
   * @example
   * ```typescript
   * const data = { name: 'my-project', version: '1.0.0' }
   * await FileUtils.writeJson('./package.json', data, 2)
   * ```
   */
  static async writeJson(filePath: string, data: unknown, indent: number = 2): Promise<void> {
    try {
      await this.ensureDir(path.dirname(filePath))
      const content = JSON.stringify(data, null, indent)
      await fs.writeFile(filePath, content, 'utf-8')
    }
    catch (error) {
      throw new Error(`写入JSON文件失败: ${filePath}. 原因: ${(error as Error).message}`)
    }
  }

  /**
   * 复制文件
   * @param src 源文件路径
   * @param dest 目标文件路径
   * @throws {Error} 复制失败时抛出异常
   * @example
   * ```typescript
   * await FileUtils.copyFile('./src/template.ts', './dist/app.ts')
   * ```
   */
  static async copyFile(src: string, dest: string): Promise<void> {
    try {
      await this.ensureDir(path.dirname(dest))
      await fs.copyFile(src, dest)
    }
    catch (error) {
      throw new Error(`复制文件失败: ${src} -> ${dest}. 原因: ${(error as Error).message}`)
    }
  }

  /**
   * 递归复制目录
   * @param src 源目录路径
   * @param dest 目标目录路径
   * @throws {Error} 复制失败时抛出异常
   * @example
   * ```typescript
   * await FileUtils.copyDir('./templates/vue3', './my-app')
   * ```
   */
  static async copyDir(src: string, dest: string): Promise<void> {
    try {
      await this.ensureDir(dest)
      const entries = await fs.readdir(src, { withFileTypes: true })

      const copyPromises = entries.map(async (entry) => {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
          await this.copyDir(srcPath, destPath)
        }
        else {
          await this.copyFile(srcPath, destPath)
        }
      })

      await Promise.all(copyPromises)
    }
    catch (error) {
      throw new Error(`复制目录失败: ${src} -> ${dest}. 原因: ${(error as Error).message}`)
    }
  }

  /**
   * 删除文件或目录
   * @param targetPath 目标路径
   * @example
   * ```typescript
   * await FileUtils.remove('./dist')
   * await FileUtils.remove('./old-file.txt')
   * ```
   */
  static async remove(targetPath: string): Promise<void> {
    try {
      await fs.rm(targetPath, { recursive: true, force: true })
    }
    catch (error) {
      const nodeError = error as NodeJS.ErrnoException
      // 忽略不存在的文件/目录
      if (nodeError.code !== 'ENOENT') {
        throw new Error(`删除失败: ${targetPath}. 原因: ${nodeError.message}`)
      }
    }
  }

  /**
   * 获取文件大小
   * @param filePath 文件路径
   * @returns 文件大小（字节）
   * @throws {Error} 文件不存在时抛出异常
   * @example
   * ```typescript
   * const size = await FileUtils.getFileSize('./dist/main.js')
   * console.log(`文件大小: ${size} 字节`)
   * ```
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      const stat = await fs.stat(filePath)
      return stat.size
    }
    catch (error) {
      throw new Error(`获取文件大小失败: ${filePath}. 原因: ${(error as Error).message}`)
    }
  }

  /**
   * 查找匹配模式的文件
   * @param dir 搜索目录
   * @param pattern 文件名模式（支持正则表达式或字符串）
   * @param options 搜索选项
   * @returns 匹配的文件路径数组
   * @example
   * ```typescript
   * // 查找所有 .ts 文件
   * const tsFiles = await FileUtils.findFiles('./src', /\.ts$/)
   * 
   * // 查找包含 'test' 的文件
   * const testFiles = await FileUtils.findFiles('./src', 'test')
   * ```
   */
  static async findFiles(
    dir: string, 
    pattern: string | RegExp,
    options: {
      /** 是否递归搜索子目录 */
      recursive?: boolean
      /** 最大搜索深度 */
      maxDepth?: number
    } = {}
  ): Promise<string[]> {
    const { recursive = true, maxDepth = 10 } = options
    const results: string[] = []

    async function search(currentDir: string, currentDepth: number = 0): Promise<void> {
      if (currentDepth > maxDepth) return

      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true })

        const searchPromises = entries.map(async (entry) => {
          const fullPath = path.join(currentDir, entry.name)

          if (entry.isDirectory() && recursive) {
            await search(fullPath, currentDepth + 1)
          }
          else if (entry.isFile()) {
            const matches = typeof pattern === 'string'
              ? entry.name.includes(pattern)
              : pattern.test(entry.name)

            if (matches) {
              results.push(fullPath)
            }
          }
        })

        await Promise.all(searchPromises)
      }
      catch (error) {
        // 跳过无法访问的目录
        console.warn(`跳过目录: ${currentDir}. 原因: ${(error as Error).message}`)
      }
    }

    await search(dir)
    return results
  }

  /**
   * 计算目录大小
   * @param dirPath 目录路径
   * @returns 目录总大小（字节）
   * @example
   * ```typescript
   * const size = await FileUtils.getDirSize('./dist')
   * console.log(`目录大小: ${size} 字节`)
   * ```
   */
  static async getDirSize(dirPath: string): Promise<number> {
    let totalSize = 0

    async function calculateSize(currentPath: string): Promise<void> {
      const stat = await fs.stat(currentPath)

      if (stat.isFile()) {
        totalSize += stat.size
      }
      else if (stat.isDirectory()) {
        const entries = await fs.readdir(currentPath)
        const sizePromises = entries.map(entry => 
          calculateSize(path.join(currentPath, entry))
        )
        await Promise.all(sizePromises)
      }
    }

    try {
      await calculateSize(dirPath)
      return totalSize
    }
    catch (error) {
      throw new Error(`计算目录大小失败: ${dirPath}. 原因: ${(error as Error).message}`)
    }
  }
}

// 导出便捷函数，使用更简洁的调用方式
export const {
  exists,
  isDirectory,
  isFile,
  ensureDir,
  readJson,
  writeJson,
  copyFile,
  copyDir,
  remove,
  getFileSize,
  findFiles,
} = FileUtils