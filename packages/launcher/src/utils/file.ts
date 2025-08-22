/**
 * @fileoverview 文件系统工具函数
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { glob } from 'fast-glob'
import type { 
  FileInfo, 
  FileSearchOptions, 
  FileOperationOptions,
  PackageInfo,
} from '../types'

/**
 * 检查文件或目录是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * 检查路径是否为目录
 * @param dirPath 目录路径
 * @returns 是否为目录
 */
export async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath)
    return stat.isDirectory()
  } catch {
    return false
  }
}

/**
 * 检查路径是否为文件
 * @param filePath 文件路径
 * @returns 是否为文件
 */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile()
  } catch {
    return false
  }
}

/**
 * 获取文件信息
 * @param filePath 文件路径
 * @returns 文件信息
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stat = await fs.stat(filePath)
  const parsedPath = path.parse(filePath)
  
  return {
    path: filePath,
    name: parsedPath.base,
    extension: parsedPath.ext,
    size: stat.size,
    isDirectory: stat.isDirectory(),
    isFile: stat.isFile(),
    createdAt: stat.birthtime,
    modifiedAt: stat.mtime,
    accessedAt: stat.atime,
  }
}

/**
 * 递归创建目录
 * @param dirPath 目录路径
 * @param options 操作选项
 */
export async function ensureDir(
  dirPath: string, 
  options: Pick<FileOperationOptions, 'mode'> = {}
): Promise<void> {
  await fs.mkdir(dirPath, { 
    recursive: true, 
    mode: options.mode 
  })
}

/**
 * 安全地读取文件内容
 * @param filePath 文件路径
 * @param encoding 文件编码
 * @returns 文件内容
 */
export async function readFile(
  filePath: string, 
  encoding: BufferEncoding = 'utf8'
): Promise<string> {
  return fs.readFile(filePath, encoding)
}

/**
 * 安全地写入文件内容
 * @param filePath 文件路径
 * @param content 文件内容
 * @param options 操作选项
 */
export async function writeFile(
  filePath: string,
  content: string,
  options: FileOperationOptions = {}
): Promise<void> {
  const {
    createParentDirs = true,
    encoding = 'utf8',
    mode,
    overwrite = true
  } = options

  // 检查文件是否存在且不允许覆盖
  if (!overwrite && await exists(filePath)) {
    throw new Error(`File already exists: ${filePath}`)
  }

  // 创建父目录
  if (createParentDirs) {
    const parentDir = path.dirname(filePath)
    await ensureDir(parentDir)
  }

  await fs.writeFile(filePath, content, { 
    encoding, 
    mode 
  })
}

/**
 * 复制文件
 * @param sourcePath 源文件路径
 * @param targetPath 目标文件路径
 * @param options 操作选项
 */
export async function copyFile(
  sourcePath: string,
  targetPath: string,
  options: Pick<FileOperationOptions, 'createParentDirs' | 'overwrite'> = {}
): Promise<void> {
  const {
    createParentDirs = true,
    overwrite = true
  } = options

  // 检查源文件是否存在
  if (!await exists(sourcePath)) {
    throw new Error(`Source file does not exist: ${sourcePath}`)
  }

  // 检查目标文件是否存在且不允许覆盖
  if (!overwrite && await exists(targetPath)) {
    throw new Error(`Target file already exists: ${targetPath}`)
  }

  // 创建父目录
  if (createParentDirs) {
    const parentDir = path.dirname(targetPath)
    await ensureDir(parentDir)
  }

  await fs.copyFile(sourcePath, targetPath)
}

/**
 * 递归复制目录
 * @param sourceDir 源目录路径
 * @param targetDir 目标目录路径
 * @param options 操作选项
 */
export async function copyDir(
  sourceDir: string,
  targetDir: string,
  options: Pick<FileOperationOptions, 'overwrite'> = {}
): Promise<void> {
  const { overwrite = true } = options

  // 确保源目录存在
  if (!await isDirectory(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`)
  }

  // 创建目标目录
  await ensureDir(targetDir)

  const entries = await fs.readdir(sourceDir, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(sourceDir, entry.name)
      const targetPath = path.join(targetDir, entry.name)

      if (entry.isDirectory()) {
        await copyDir(sourcePath, targetPath, options)
      } else {
        await copyFile(sourcePath, targetPath, { 
          createParentDirs: false, 
          overwrite 
        })
      }
    })
  )
}

/**
 * 删除文件或目录
 * @param targetPath 目标路径
 * @param recursive 是否递归删除
 */
export async function remove(targetPath: string, recursive = true): Promise<void> {
  try {
    await fs.rm(targetPath, { recursive, force: true })
  } catch (error) {
    // 忽略文件不存在的错误
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}

/**
 * 搜索文件
 * @param searchOptions 搜索选项
 * @returns 匹配的文件路径列表
 */
export async function searchFiles(searchOptions: FileSearchOptions): Promise<string[]> {
  const {
    pattern,
    recursive = true,
    ignore = ['node_modules/**', '.git/**', 'dist/**'],
    maxDepth = 10,
    includeHidden = false,
    fileTypes = []
  } = searchOptions

  const globOptions = {
    dot: includeHidden,
    deep: recursive ? maxDepth : 1,
    ignore,
    onlyFiles: true,
    absolute: true,
  }

  let files = await glob(pattern, globOptions)

  // 按文件类型过滤
  if (fileTypes.length > 0) {
    files = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return fileTypes.includes(ext)
    })
  }

  return files
}

/**
 * 获取目录大小
 * @param dirPath 目录路径
 * @returns 目录大小（字节）
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0

  async function calculateSize(currentPath: string): Promise<void> {
    const stat = await fs.stat(currentPath)
    
    if (stat.isFile()) {
      totalSize += stat.size
    } else if (stat.isDirectory()) {
      const entries = await fs.readdir(currentPath)
      await Promise.all(
        entries.map(entry => 
          calculateSize(path.join(currentPath, entry))
        )
      )
    }
  }

  await calculateSize(dirPath)
  return totalSize
}

/**
 * 读取并解析 package.json 文件
 * @param projectRoot 项目根目录
 * @returns package.json 内容
 */
export async function readPackageJson(projectRoot: string): Promise<PackageInfo> {
  const packagePath = path.join(projectRoot, 'package.json')
  
  if (!await exists(packagePath)) {
    throw new Error(`package.json not found in ${projectRoot}`)
  }

  const content = await readFile(packagePath)
  const packageJson = JSON.parse(content) as Partial<PackageInfo>

  // 提供默认值
  return {
    name: packageJson.name || 'unknown',
    version: packageJson.version || '0.0.0',
    description: packageJson.description,
    main: packageJson.main,
    module: packageJson.module,
    types: packageJson.types,
    scripts: packageJson.scripts || {},
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
    peerDependencies: packageJson.peerDependencies || {},
    optionalDependencies: packageJson.optionalDependencies || {},
    keywords: packageJson.keywords || [],
    author: packageJson.author,
    license: packageJson.license,
    repository: packageJson.repository,
    bugs: packageJson.bugs,
    homepage: packageJson.homepage,
  }
}

/**
 * 写入 package.json 文件
 * @param projectRoot 项目根目录
 * @param packageInfo package.json 内容
 */
export async function writePackageJson(
  projectRoot: string, 
  packageInfo: PackageInfo
): Promise<void> {
  const packagePath = path.join(projectRoot, 'package.json')
  const content = JSON.stringify(packageInfo, null, 2)
  await writeFile(packagePath, content)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 获取相对路径
 * @param from 起始路径
 * @param to 目标路径
 * @returns 相对路径
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to)
}

/**
 * 规范化路径
 * @param filePath 文件路径
 * @returns 规范化后的路径
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath).replace(/\\/g, '/')
}

/**
 * 检查文件是否为文本文件
 * @param filePath 文件路径
 * @returns 是否为文本文件
 */
export async function isTextFile(filePath: string): Promise<boolean> {
  try {
    const buffer = await fs.readFile(filePath)
    const chunk = buffer.slice(0, 1024)
    
    // 检查是否包含 null 字节（二进制文件的特征）
    return !chunk.includes(0)
  } catch {
    return false
  }
}