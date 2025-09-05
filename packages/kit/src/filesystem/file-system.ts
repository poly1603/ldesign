/**
 * 文件系统主类
 * 提供统一的文件系统操作接口
 */

import type { Stats } from 'node:fs'
import type { FileInfo } from '../types'
import { constants, createReadStream, createWriteStream, promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { FileSystemError } from '../types'
import { PathUtils, RandomUtils } from '../utils'

/**
 * 文件系统操作类
 */
export class FileSystem {
  /**
   * 检查文件或目录是否存在
   * @param path 路径
   * @returns 是否存在
   */
  static async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.F_OK)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否为文件
   * @param path 路径
   * @returns 是否为文件
   */
  static async isFile(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(path)
      return stat.isFile()
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否为目录
   * @param path 路径
   * @returns 是否为目录
   */
  static async isDirectory(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(path)
      return stat.isDirectory()
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否为符号链接
   * @param path 路径
   * @returns 是否为符号链接
   */
  static async isSymlink(path: string): Promise<boolean> {
    try {
      const stat = await fs.lstat(path)
      return stat.isSymbolicLink()
    }
    catch {
      return false
    }
  }

  /**
   * 获取文件或目录信息
   * @param path 路径
   * @returns 文件信息
   */
  static async getInfo(path: string): Promise<FileInfo> {
    try {
      const stat = await fs.stat(path)
      return {
        path: PathUtils.normalize(path),
        name: basename(path),
        ext: extname(path),
        size: stat.size,
        mtime: stat.mtime,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
      }
    }
    catch (error) {
      throw new FileSystemError(`Failed to get file info: ${path}`, path, error as Error)
    }
  }

  /**
   * 获取文件大小
   * @param path 文件路径
   * @returns 文件大小（字节）
   */
  static async getSize(path: string): Promise<number> {
    try {
      const stat = await fs.stat(path)
      return stat.size
    }
    catch (error) {
      throw new FileSystemError(`Failed to get file size: ${path}`, path, error as Error)
    }
  }

  /**
   * 获取文件修改时间
   * @param path 文件路径
   * @returns 修改时间
   */
  static async getMtime(path: string): Promise<Date> {
    try {
      const stat = await fs.stat(path)
      return stat.mtime
    }
    catch (error) {
      throw new FileSystemError(`Failed to get file mtime: ${path}`, path, error as Error)
    }
  }

  /**
   * 读取文件内容
   * @param path 文件路径
   * @param encoding 编码格式
   * @returns 文件内容
   */
  static async readFile(path: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    try {
      return await fs.readFile(path, encoding)
    }
    catch (error) {
      throw new FileSystemError(`Failed to read file: ${path}`, path, error as Error)
    }
  }

  /**
   * 读取文件为 Buffer
   * @param path 文件路径
   * @returns 文件内容
   */
  static async readBuffer(path: string): Promise<Buffer> {
    try {
      return await fs.readFile(path)
    }
    catch (error) {
      throw new FileSystemError(`Failed to read file as buffer: ${path}`, path, error as Error)
    }
  }

  /**
   * 写入文件内容
   * @param path 文件路径
   * @param content 文件内容
   * @param encoding 编码格式
   */
  static async writeFile(
    path: string,
    content: string | Buffer,
    encoding: BufferEncoding = 'utf8',
  ): Promise<void> {
    try {
      await FileSystem.ensureDir(dirname(path))
      await fs.writeFile(path, content, encoding)
    }
    catch (error) {
      throw new FileSystemError(`Failed to write file: ${path}`, path, error as Error)
    }
  }

  /**
   * 追加文件内容
   * @param path 文件路径
   * @param content 要追加的内容
   * @param encoding 编码格式
   */
  static async appendFile(
    path: string,
    content: string | Buffer,
    encoding: BufferEncoding = 'utf8',
  ): Promise<void> {
    try {
      await FileSystem.ensureDir(dirname(path))
      await fs.appendFile(path, content, encoding)
    }
    catch (error) {
      throw new FileSystemError(`Failed to append file: ${path}`, path, error as Error)
    }
  }

  /**
   * 复制文件
   * @param src 源文件路径
   * @param dest 目标文件路径
   * @param overwrite 是否覆盖
   */
  static async copyFile(src: string, dest: string, overwrite = true): Promise<void> {
    try {
      await FileSystem.ensureDir(dirname(dest))

      if (!overwrite && (await FileSystem.exists(dest))) {
        throw new Error(`Destination file already exists: ${dest}`)
      }

      await fs.copyFile(src, dest)
    }
    catch (error) {
      throw new FileSystemError(`Failed to copy file: ${src} -> ${dest}`, src, error as Error)
    }
  }

  /**
   * 移动/重命名文件
   * @param src 源路径
   * @param dest 目标路径
   */
  static async moveFile(src: string, dest: string): Promise<void> {
    try {
      await FileSystem.ensureDir(dirname(dest))
      await fs.rename(src, dest)
    }
    catch (error) {
      throw new FileSystemError(`Failed to move file: ${src} -> ${dest}`, src, error as Error)
    }
  }

  /**
   * 删除文件
   * @param path 文件路径
   */
  static async removeFile(path: string): Promise<void> {
    try {
      await fs.unlink(path)
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new FileSystemError(`Failed to remove file: ${path}`, path, error as Error)
      }
    }
  }

  /**
   * 创建目录
   * @param path 目录路径
   * @param recursive 是否递归创建
   */
  static async createDir(path: string, recursive = true): Promise<void> {
    try {
      await fs.mkdir(path, { recursive })
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw new FileSystemError(`Failed to create directory: ${path}`, path, error as Error)
      }
    }
  }

  /**
   * 确保目录存在
   * @param path 目录路径
   */
  static async ensureDir(path: string): Promise<void> {
    await FileSystem.createDir(path, true)
  }

  /**
   * 读取目录内容
   * @param path 目录路径
   * @param withFileTypes 是否包含文件类型信息
   * @returns 目录内容
   */
  static async readDir(path: string, withFileTypes = false): Promise<string[] | FileInfo[]> {
    try {
      if (withFileTypes) {
        const entries = await fs.readdir(path, { withFileTypes: true })
        const results: FileInfo[] = []

        for (const entry of entries) {
          const fullPath = join(path, entry.name)
          const stat = await fs.stat(fullPath)
          results.push({
            path: PathUtils.normalize(fullPath),
            name: entry.name,
            ext: extname(entry.name),
            size: stat.size,
            mtime: stat.mtime,
            isDirectory: entry.isDirectory(),
            isFile: entry.isFile(),
          })
        }

        return results
      }
      else {
        return await fs.readdir(path)
      }
    }
    catch (error) {
      throw new FileSystemError(`Failed to read directory: ${path}`, path, error as Error)
    }
  }

  /**
   * 删除目录
   * @param path 目录路径
   * @param recursive 是否递归删除
   */
  static async removeDir(path: string, recursive = true): Promise<void> {
    try {
      await fs.rm(path, { recursive, force: true })
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new FileSystemError(`Failed to remove directory: ${path}`, path, error as Error)
      }
    }
  }

  /**
   * 复制目录
   * @param src 源目录路径
   * @param dest 目标目录路径
   * @param overwrite 是否覆盖
   */
  static async copyDir(src: string, dest: string, overwrite = true): Promise<void> {
    try {
      await FileSystem.ensureDir(dest)
      const entries = await fs.readdir(src, { withFileTypes: true })

      for (const entry of entries) {
        const srcPath = join(src, entry.name)
        const destPath = join(dest, entry.name)

        if (entry.isDirectory()) {
          await FileSystem.copyDir(srcPath, destPath, overwrite)
        }
        else {
          await FileSystem.copyFile(srcPath, destPath, overwrite)
        }
      }
    }
    catch (error) {
      throw new FileSystemError(`Failed to copy directory: ${src} -> ${dest}`, src, error as Error)
    }
  }

  /**
   * 移动目录
   * @param src 源目录路径
   * @param dest 目标目录路径
   */
  static async moveDir(src: string, dest: string): Promise<void> {
    try {
      await FileSystem.ensureDir(dirname(dest))
      await fs.rename(src, dest)
    }
    catch (error) {
      throw new FileSystemError(`Failed to move directory: ${src} -> ${dest}`, src, error as Error)
    }
  }

  /**
   * 创建符号链接
   * @param target 目标路径
   * @param path 链接路径
   * @param type 链接类型
   */
  static async createSymlink(
    target: string,
    path: string,
    type: 'file' | 'dir' | 'junction' = 'file',
  ): Promise<void> {
    try {
      await FileSystem.ensureDir(dirname(path))
      await fs.symlink(target, path, type)
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to create symlink: ${target} -> ${path}`,
        path,
        error as Error,
      )
    }
  }

  /**
   * 读取符号链接
   * @param path 链接路径
   * @returns 目标路径
   */
  static async readSymlink(path: string): Promise<string> {
    try {
      return await fs.readlink(path)
    }
    catch (error) {
      throw new FileSystemError(`Failed to read symlink: ${path}`, path, error as Error)
    }
  }

  /**
   * 更改文件权限
   * @param path 文件路径
   * @param mode 权限模式
   */
  static async chmod(path: string, mode: string | number): Promise<void> {
    try {
      await fs.chmod(path, mode)
    }
    catch (error) {
      throw new FileSystemError(`Failed to change permissions: ${path}`, path, error as Error)
    }
  }

  /**
   * 更改文件所有者
   * @param path 文件路径
   * @param uid 用户ID
   * @param gid 组ID
   */
  static async chown(path: string, uid: number, gid: number): Promise<void> {
    try {
      await fs.chown(path, uid, gid)
    }
    catch (error) {
      throw new FileSystemError(`Failed to change ownership: ${path}`, path, error as Error)
    }
  }

  /**
   * 创建文件流
   * @param path 文件路径
   * @param options 选项
   * @returns 读取流
   */
  static createReadStream(path: string, options?: Parameters<typeof createReadStream>[1]) {
    return createReadStream(path, options)
  }

  /**
   * 创建写入流
   * @param path 文件路径
   * @param options 选项
   * @returns 写入流
   */
  static createWriteStream(path: string, options?: Parameters<typeof createWriteStream>[1]) {
    return createWriteStream(path, options)
  }

  /**
   * 流式复制文件
   * @param src 源文件路径
   * @param dest 目标文件路径
   */
  static async streamCopy(src: string, dest: string): Promise<void> {
    try {
      await FileSystem.ensureDir(dirname(dest))
      const readStream = FileSystem.createReadStream(src)
      const writeStream = FileSystem.createWriteStream(dest)
      await pipeline(readStream, writeStream)
    }
    catch (error) {
      throw new FileSystemError(`Failed to stream copy: ${src} -> ${dest}`, src, error as Error)
    }
  }

  /**
   * 获取文件状态信息
   * @param path 文件路径
   * @returns 文件状态
   */
  static async stat(path: string): Promise<Stats> {
    try {
      return await fs.stat(path)
    }
    catch (error) {
      throw new FileSystemError(`Failed to get file stats: ${path}`, path, error as Error)
    }
  }

  /**
   * 获取路径的目录部分
   * @param path 文件路径
   * @returns 目录路径
   */
  static dirname(path: string): string {
    return dirname(path)
  }

  /**
   * 获取路径的基名部分
   * @param path 文件路径
   * @returns 文件名
   */
  static basename(path: string): string {
    return basename(path)
  }

  /**
   * 连接路径
   * @param paths 路径片段
   * @returns 连接后的路径
   */
  static join(...paths: string[]): string {
    return join(...paths)
  }

  /**
   * 复制文件或目录
   * @param src 源路径
   * @param dest 目标路径
   * @param overwrite 是否覆盖
   */
  static async copy(src: string, dest: string, overwrite = true): Promise<void> {
    try {
      const srcStat = await fs.stat(src)

      if (srcStat.isDirectory()) {
        await FileSystem.copyDir(src, dest, overwrite)
      }
      else {
        await FileSystem.copyFile(src, dest, overwrite)
      }
    }
    catch (error) {
      throw new FileSystemError(`Failed to copy: ${src} -> ${dest}`, src, error as Error)
    }
  }

  /**
   * 移动文件或目录
   * @param src 源路径
   * @param dest 目标路径
   */
  static async move(src: string, dest: string): Promise<void> {
    try {
      const srcStat = await fs.stat(src)

      if (srcStat.isDirectory()) {
        await FileSystem.moveDir(src, dest)
      }
      else {
        await FileSystem.moveFile(src, dest)
      }
    }
    catch (error) {
      throw new FileSystemError(`Failed to move: ${src} -> ${dest}`, src, error as Error)
    }
  }

  /**
   * 删除文件
   * @param path 文件路径
   */
  static async deleteFile(path: string): Promise<void> {
    await FileSystem.removeFile(path)
  }

  /**
   * 删除文件或目录（通用方法）
   * @param path 文件或目录路径
   */
  static async remove(path: string): Promise<void> {
    try {
      const stat = await fs.stat(path)
      if (stat.isDirectory()) {
        await FileSystem.removeDir(path)
      }
      else {
        await FileSystem.removeFile(path)
      }
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new FileSystemError(`Failed to remove: ${path}`, path, error as Error)
      }
    }
  }

  /**
   * 创建临时目录
   * @param prefix 目录前缀
   * @returns 临时目录路径
   */
  static async createTempDir(prefix = 'ldesign-kit-'): Promise<string> {
    try {
      const tempPath = join(tmpdir(), prefix + RandomUtils.generateId(8))
      await FileSystem.createDir(tempPath)
      return tempPath
    }
    catch (error) {
      throw new FileSystemError(`Failed to create temp directory`, '', error as Error)
    }
  }

  /**
   * 设置文件时间戳
   * @param path 文件路径
   * @param atime 访问时间
   * @param mtime 修改时间
   */
  static async setTimestamps(path: string, atime: Date, mtime: Date): Promise<void> {
    try {
      await fs.utimes(path, atime, mtime)
    }
    catch (error) {
      throw new FileSystemError(`Failed to set timestamps: ${path}`, path, error as Error)
    }
  }
}
