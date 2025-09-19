/**
 * 文件系统工具函数
 * 
 * 提供文件和目录操作的工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { promises as fs } from 'fs'
import { existsSync, statSync } from 'fs'
import { join, dirname, basename, extname, resolve, relative } from 'path'
import { ensureDir, copy, remove, move } from 'fs-extra'
import type { FilePath, FileInfo, OperationResult } from '../types/common'
import { DEFAULT_ENCODING } from '../constants/defaults'

/**
 * 检查文件或目录是否存在
 * @param path 文件路径
 * @returns 是否存在
 */
export function exists(path: FilePath): boolean {
  try {
    return existsSync(path)
  } catch {
    return false
  }
}

/**
 * 异步检查文件或目录是否存在
 * @param path 文件路径
 * @returns 是否存在
 */
export async function existsAsync(path: FilePath): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

/**
 * 获取文件信息
 * @param path 文件路径
 * @returns 文件信息
 */
export async function getFileInfo(path: FilePath): Promise<FileInfo> {
  const absolutePath = resolve(path)
  const fileName = basename(absolutePath)
  const extension = extname(absolutePath)

  try {
    const stats = await fs.stat(absolutePath)

    return {
      path: absolutePath,
      name: fileName,
      extension,
      size: stats.size,
      lastModified: stats.mtime,
      isDirectory: stats.isDirectory(),
      exists: true
    }
  } catch {
    return {
      path: absolutePath,
      name: fileName,
      extension,
      size: 0,
      lastModified: new Date(0),
      isDirectory: false,
      exists: false
    }
  }
}

/**
 * 读取文件内容
 * @param path 文件路径
 * @param encoding 编码格式
 * @returns 文件内容
 */
export async function readFile(
  path: FilePath,
  encoding: BufferEncoding = DEFAULT_ENCODING
): Promise<OperationResult<string>> {
  try {
    const content = await fs.readFile(path, encoding)
    return {
      success: true,
      data: content
    }
  } catch (error) {
    return {
      success: false,
      error: `读取文件失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 写入文件内容
 * @param path 文件路径
 * @param content 文件内容
 * @param encoding 编码格式
 * @returns 操作结果
 */
export async function writeFile(
  path: FilePath,
  content: string,
  encoding: BufferEncoding = DEFAULT_ENCODING
): Promise<OperationResult<void>> {
  try {
    // 确保目录存在
    await ensureDir(dirname(path))
    await fs.writeFile(path, content, encoding)

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `写入文件失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 复制文件或目录
 * @param src 源路径
 * @param dest 目标路径
 * @returns 操作结果
 */
export async function copyFile(src: FilePath, dest: FilePath): Promise<OperationResult<void>> {
  try {
    await copy(src, dest)
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `复制文件失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 移动文件或目录
 * @param src 源路径
 * @param dest 目标路径
 * @returns 操作结果
 */
export async function moveFile(src: FilePath, dest: FilePath): Promise<OperationResult<void>> {
  try {
    await move(src, dest)
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `移动文件失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 删除文件或目录
 * @param path 文件路径
 * @returns 操作结果
 */
export async function deleteFile(path: FilePath): Promise<OperationResult<void>> {
  try {
    await remove(path)
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `删除文件失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 创建目录
 * @param path 目录路径
 * @returns 操作结果
 */
export async function createDirectory(path: FilePath): Promise<OperationResult<void>> {
  try {
    await ensureDir(path)
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: `创建目录失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 列出目录内容
 * @param path 目录路径
 * @param recursive 是否递归
 * @returns 文件列表
 */
export async function listDirectory(
  path: FilePath,
  recursive = false
): Promise<OperationResult<FileInfo[]>> {
  try {
    const files: FileInfo[] = []

    const entries = await fs.readdir(path, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(path, entry.name)
      const fileInfo = await getFileInfo(fullPath)
      files.push(fileInfo)

      if (recursive && entry.isDirectory()) {
        const subResult = await listDirectory(fullPath, true)
        if (subResult.success && subResult.data) {
          files.push(...subResult.data)
        }
      }
    }

    return {
      success: true,
      data: files
    }
  } catch (error) {
    return {
      success: false,
      error: `列出目录失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 查找文件
 * @param dir 搜索目录
 * @param pattern 文件名模式
 * @param recursive 是否递归搜索
 * @returns 匹配的文件列表
 */
export async function findFiles(
  dir: FilePath,
  pattern: string | RegExp,
  recursive = true
): Promise<OperationResult<FilePath[]>> {
  try {
    const files: FilePath[] = []
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isFile() && regex.test(entry.name)) {
        files.push(fullPath)
      } else if (entry.isDirectory() && recursive) {
        const subResult = await findFiles(fullPath, pattern, true)
        if (subResult.success && subResult.data) {
          files.push(...subResult.data)
        }
      }
    }

    return {
      success: true,
      data: files
    }
  } catch (error) {
    return {
      success: false,
      error: `查找文件失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 备份文件
 * @param path 文件路径
 * @param suffix 备份后缀
 * @returns 备份文件路径
 */
export async function backupFile(
  path: FilePath,
  suffix = '.backup'
): Promise<OperationResult<FilePath>> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `${path}${suffix}.${timestamp}`

    const result = await copyFile(path, backupPath)
    if (!result.success) {
      return result as OperationResult<FilePath>
    }

    return {
      success: true,
      data: backupPath
    }
  } catch (error) {
    return {
      success: false,
      error: `备份文件失败: ${error instanceof Error ? error.message : error}`
    }
  }
}

/**
 * 获取相对路径
 * @param from 起始路径
 * @param to 目标路径
 * @returns 相对路径
 */
export function getRelativePath(from: FilePath, to: FilePath): string {
  return relative(from, to)
}

/**
 * 获取绝对路径
 * @param path 路径
 * @returns 绝对路径
 */
export function getAbsolutePath(path: FilePath): string {
  return resolve(path)
}

/**
 * 规范化路径
 * @param path 路径
 * @returns 规范化后的路径
 */
export function normalizePath(path: FilePath): string {
  return path.replace(/\\/g, '/')
}

/**
 * 查找配置文件
 * @param cwd 工作目录
 * @returns 配置文件路径映射
 */
export async function findConfigFiles(cwd: FilePath): Promise<Record<string, string | null>> {
  const configFiles = {
    launcher: null as string | null,
    app: null as string | null,
    package: null as string | null
  }

  // 查找 launcher 配置文件
  const launcherPatterns = [
    'launcher.config.ts',
    'launcher.config.js',
    'launcher.config.mjs',
    'launcher.config.json'
  ]

  // 首先在 .ldesign 目录中查找
  for (const pattern of launcherPatterns) {
    const filePath = join(cwd, '.ldesign', pattern)
    if (await existsAsync(filePath)) {
      configFiles.launcher = filePath
      break
    }
  }

  // 如果 .ldesign 目录中没有找到，再在根目录查找
  if (!configFiles.launcher) {
    for (const pattern of launcherPatterns) {
      const filePath = join(cwd, pattern)
      if (await existsAsync(filePath)) {
        configFiles.launcher = filePath
        break
      }
    }
  }

  // 查找 app 配置文件
  const appPatterns = [
    'app.config.ts',
    'app.config.js',
    'app.config.mjs',
    'app.config.json'
  ]

  // 首先在 .ldesign 目录中查找
  for (const pattern of appPatterns) {
    const filePath = join(cwd, '.ldesign', pattern)
    if (await existsAsync(filePath)) {
      configFiles.app = filePath
      break
    }
  }

  // 如果 .ldesign 目录中没有找到，再在根目录查找
  if (!configFiles.app) {
    for (const pattern of appPatterns) {
      const filePath = join(cwd, pattern)
      if (await existsAsync(filePath)) {
        configFiles.app = filePath
        break
      }
    }
  }

  // 查找 package.json
  const packagePath = join(cwd, 'package.json')
  if (await existsAsync(packagePath)) {
    configFiles.package = packagePath
  }

  return configFiles
}
