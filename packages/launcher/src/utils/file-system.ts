/**
 * 文件系统工具
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { promises as fs, constants, Stats } from 'fs'
import { join, dirname } from 'path'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

export interface CopyOptions {
  overwrite?: boolean
  preserveTimestamps?: boolean
  filter?: (src: string, dest: string) => boolean
}

export interface ReadOptions {
  encoding?: BufferEncoding
  flag?: string
}

export interface WriteOptions {
  encoding?: BufferEncoding
  mode?: number
  flag?: string
}

export class FileSystem {
  /**
   * 检查文件或目录是否存在
   */
  static async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查路径是否可读
   */
  static async isReadable(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.R_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查路径是否可写
   */
  static async isWritable(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.W_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取文件或目录的统计信息
   */
  static async stat(path: string): Promise<Stats> {
    return fs.stat(path)
  }

  /**
   * 检查是否为文件
   */
  static async isFile(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path)
      return stats.isFile()
    } catch {
      return false
    }
  }

  /**
   * 检查是否为目录
   */
  static async isDirectory(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  /**
   * 读取文件内容
   */
  static async readFile(path: string, options: ReadOptions = {}): Promise<string> {
    const encoding = options.encoding || 'utf8'
    return fs.readFile(path, { encoding, flag: options.flag })
  }

  /**
   * 读取文件为 Buffer
   */
  static async readBuffer(path: string): Promise<Buffer> {
    return fs.readFile(path)
  }

  /**
   * 写入文件
   */
  static async writeFile(path: string, data: string | Buffer, options: WriteOptions = {}): Promise<void> {
    // 确保目录存在
    await this.ensureDir(dirname(path))

    return fs.writeFile(path, data, {
      encoding: options.encoding || 'utf8',
      mode: options.mode,
      flag: options.flag
    })
  }

  /**
   * 追加内容到文件
   */
  static async appendFile(path: string, data: string | Buffer, options: WriteOptions = {}): Promise<void> {
    // 确保目录存在
    await this.ensureDir(dirname(path))

    return fs.appendFile(path, data, {
      encoding: options.encoding || 'utf8',
      mode: options.mode,
      flag: options.flag
    })
  }

  /**
   * 删除文件或目录
   */
  static async remove(path: string): Promise<void> {
    try {
      const stats = await fs.stat(path)
      if (stats.isDirectory()) {
        await fs.rmdir(path, { recursive: true })
      } else {
        await fs.unlink(path)
      }
    } catch (error) {
      // 如果文件不存在，忽略错误
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  /**
   * 创建目录
   */
  static async ensureDir(path: string): Promise<void> {
    try {
      await fs.mkdir(path, { recursive: true })
    } catch (error) {
      // 如果目录已存在，忽略错误
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error
      }
    }
  }

  /**
   * 读取目录内容
   */
  static async readDir(path: string): Promise<string[]> {
    return fs.readdir(path)
  }

  /**
   * 复制文件
   */
  static async copyFile(src: string, dest: string, options: CopyOptions = {}): Promise<void> {
    // 检查源文件是否存在
    if (!(await this.exists(src))) {
      throw new Error(`源文件不存在: ${src}`)
    }

    // 检查是否覆盖
    if (!options.overwrite && await this.exists(dest)) {
      throw new Error(`目标文件已存在: ${dest}`)
    }

    // 确保目标目录存在
    await this.ensureDir(dirname(dest))

    // 复制文件
    await pipeline(
      createReadStream(src),
      createWriteStream(dest)
    )

    // 保持时间戳
    if (options.preserveTimestamps) {
      const stats = await fs.stat(src)
      await fs.utimes(dest, stats.atime, stats.mtime)
    }
  }

  /**
   * 复制目录
   */
  static async copyDir(src: string, dest: string, options: CopyOptions = {}): Promise<void> {
    // 检查源目录是否存在
    if (!(await this.isDirectory(src))) {
      throw new Error(`源目录不存在或不是目录: ${src}`)
    }

    // 创建目标目录
    await this.ensureDir(dest)

    // 读取源目录内容
    const entries = await fs.readdir(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const destPath = join(dest, entry.name)

      // 应用过滤器
      if (options.filter && !options.filter(srcPath, destPath)) {
        continue
      }

      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath, options)
      } else {
        await this.copyFile(srcPath, destPath, options)
      }
    }
  }

  /**
   * 移动文件或目录
   */
  static async move(src: string, dest: string): Promise<void> {
    try {
      await fs.rename(src, dest)
    } catch (error) {
      // 如果跨设备移动失败，则复制后删除
      if ((error as NodeJS.ErrnoException).code === 'EXDEV') {
        const stats = await fs.stat(src)
        if (stats.isDirectory()) {
          await this.copyDir(src, dest)
        } else {
          await this.copyFile(src, dest)
        }
        await this.remove(src)
      } else {
        throw error
      }
    }
  }

  /**
   * 获取文件大小
   */
  static async getSize(path: string): Promise<number> {
    const stats = await fs.stat(path)
    return stats.size
  }

  /**
   * 获取文件的修改时间
   */
  static async getMtime(path: string): Promise<Date> {
    const stats = await fs.stat(path)
    return stats.mtime
  }

  /**
   * 创建临时文件
   */
  static async createTempFile(prefix: string = 'tmp', suffix: string = ''): Promise<string> {
    const tmpDir = process.env.TMPDIR || process.env.TMP || '/tmp'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const filename = `${prefix}-${timestamp}-${random}${suffix}`
    return join(tmpDir, filename)
  }

  /**
   * 清空目录
   */
  static async emptyDir(path: string): Promise<void> {
    if (!(await this.exists(path))) {
      await this.ensureDir(path)
      return
    }

    const entries = await fs.readdir(path)
    await Promise.all(
      entries.map(entry => this.remove(join(path, entry)))
    )
  }
}

// 导出便捷函数
export const {
  exists,
  isReadable,
  isWritable,
  stat,
  isFile,
  isDirectory,
  readFile,
  readBuffer,
  writeFile,
  appendFile,
  remove,
  ensureDir,
  readDir,
  copyFile,
  copyDir,
  move,
  getSize,
  getMtime,
  createTempFile,
  emptyDir
} = FileSystem
