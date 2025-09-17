/**
 * 通配符解析工具函数
 * 
 * 提供文件路径模式匹配和解析功能
 */

import { glob } from 'glob'
import path from 'path'

/**
 * 解析输入模式
 * 
 * 将通配符模式转换为实际的文件路径列表
 * 
 * @param input - 输入模式（支持字符串、数组、对象）
 * @param rootDir - 根目录
 * @returns 解析后的文件路径
 */
export async function resolveInputPatterns(
  input: string | string[] | Record<string, string>,
  rootDir: string = process.cwd()
): Promise<string | string[] | Record<string, string>> {
  // 如果是对象（多入口），递归处理每个值
  if (typeof input === 'object' && !Array.isArray(input)) {
    const resolved: Record<string, string> = {}
    for (const [key, pattern] of Object.entries(input)) {
      const result = await resolveSinglePattern(pattern, rootDir)
      if (Array.isArray(result) && result.length === 1) {
        resolved[key] = result[0]
      } else if (typeof result === 'string') {
        resolved[key] = result
      } else {
        throw new Error(`多入口配置的值必须解析为单个文件: ${key}`)
      }
    }
    return resolved
  }

  // 如果是数组，处理每个模式
  if (Array.isArray(input)) {
    const allFiles: string[] = []
    const excludePatterns: string[] = []
    const includePatterns: string[] = []

    // 分离包含和排除模式
    for (const pattern of input) {
      if (typeof pattern === 'string' && pattern.startsWith('!')) {
        excludePatterns.push(pattern.slice(1))
      } else {
        includePatterns.push(pattern)
      }
    }

    // 解析包含模式
    for (const pattern of includePatterns) {
      const files = await resolveSinglePattern(pattern, rootDir)
      if (Array.isArray(files)) {
        allFiles.push(...files)
      } else {
        allFiles.push(files)
      }
    }

    // 应用排除模式 - 优化性能
    if (excludePatterns.length > 0) {
      const excludedFiles = new Set<string>()

      // 并行处理排除模式以提高性能
      const excludePromises = excludePatterns.map(async (pattern) => {
        const files = await resolveSinglePattern(pattern, rootDir)
        const fileArray = Array.isArray(files) ? files : [files]
        return fileArray
      })

      const excludeResults = await Promise.all(excludePromises)
      excludeResults.flat().forEach(f => excludedFiles.add(f))

      return allFiles.filter(f => !excludedFiles.has(f))
    }

    // 去重并排序 - 使用更高效的去重方式
    const uniqueFiles = new Set(allFiles)
    return Array.from(uniqueFiles).sort()
  }

  // 单个字符串模式
  return resolveSinglePattern(input, rootDir)
}

/**
 * 解析单个模式
 * 
 * @param pattern - 文件模式
 * @param rootDir - 根目录
 * @returns 解析后的文件路径
 */
async function resolveSinglePattern(
  pattern: string,
  rootDir: string
): Promise<string | string[]> {
  // 如果不包含通配符，直接返回
  if (!containsGlobPattern(pattern)) {
    return path.resolve(rootDir, pattern)
  }

  // 使用 glob 解析通配符
  const files = await glob(pattern, {
    cwd: rootDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.git/**'],
  })

  // 如果没有匹配到文件：
  // - 这是通配符模式时，表示没有该类文件，返回空列表以避免将模式当作物理文件传给打包器
  // - 非通配符模式的情况在上方已提前返回，这里只处理通配符
  if (files.length === 0) {
    return []
  }

  // 如果只有一个文件，返回字符串
  if (files.length === 1) {
    return files[0]
  }

  // 多个文件返回数组
  return files.sort()
}

/**
 * 检查字符串是否包含通配符模式
 * 
 * @param pattern - 要检查的模式
 * @returns 是否包含通配符
 */
function containsGlobPattern(pattern: string): boolean {
  return /[*?[\]{}]/.test(pattern)
}

/**
 * 规范化入口配置
 *
 * 将各种输入格式标准化为 Rollup/Rolldown 可接受的格式
 *
 * @param input - 原始输入配置
 * @param rootDir - 根目录
 * @param exclude - 排除模式数组
 * @returns 规范化后的输入配置
 */
export async function normalizeInput(
  input: string | string[] | Record<string, string> | undefined,
  rootDir: string = process.cwd(),
  exclude?: string[]
): Promise<string | string[] | Record<string, string>> {
  if (!input) {
    // 默认入口
    return path.resolve(rootDir, 'src/index.ts')
  }

  let resolved = await resolveInputPatterns(input, rootDir)

  // 应用 exclude 过滤
  if (exclude && exclude.length > 0) {
    resolved = await applyExcludeFilter(resolved, exclude, rootDir)
  }

  // 对于数组输入，如果为空则抛出错误
  if (Array.isArray(resolved) && resolved.length === 0) {
    throw new Error('未找到匹配的输入文件')
  }

  return resolved
}

/**
 * 应用排除过滤器
 *
 * 从解析后的输入中排除匹配的文件
 *
 * @param resolved - 已解析的输入配置
 * @param exclude - 排除模式数组
 * @param rootDir - 根目录
 * @returns 过滤后的输入配置
 */
async function applyExcludeFilter(
  resolved: string | string[] | Record<string, string>,
  exclude: string[],
  rootDir: string
): Promise<string | string[] | Record<string, string>> {
  // 如果是字符串，检查是否匹配排除模式
  if (typeof resolved === 'string') {
    const isExcluded = await isFileExcluded(resolved, exclude, rootDir)
    if (isExcluded) {
      throw new Error(`入口文件被排除: ${resolved}`)
    }
    return resolved
  }

  // 如果是数组，过滤掉匹配的文件
  if (Array.isArray(resolved)) {
    const filtered: string[] = []
    for (const file of resolved) {
      const isExcluded = await isFileExcluded(file, exclude, rootDir)
      if (!isExcluded) {
        filtered.push(file)
      }
    }
    return filtered
  }

  // 如果是对象，过滤每个值
  if (typeof resolved === 'object' && resolved !== null) {
    const filtered: Record<string, string> = {}
    for (const [key, file] of Object.entries(resolved)) {
      const isExcluded = await isFileExcluded(file, exclude, rootDir)
      if (!isExcluded) {
        filtered[key] = file
      }
    }
    return filtered
  }

  return resolved
}

/**
 * 检查文件是否被排除
 *
 * @param filePath - 文件路径
 * @param exclude - 排除模式数组
 * @param rootDir - 根目录
 * @returns 是否被排除
 */
async function isFileExcluded(
  filePath: string,
  exclude: string[],
  rootDir: string
): Promise<boolean> {
  // 将绝对路径转换为相对路径进行匹配
  const relativePath = path.relative(rootDir, filePath)

  for (const pattern of exclude) {
    // 使用 glob 进行模式匹配
    const matches = await glob(pattern, {
      cwd: rootDir,
      absolute: false,
    })

    // 检查文件是否在匹配列表中
    if (matches.includes(relativePath) || matches.includes(filePath)) {
      return true
    }

    // 也检查简单的字符串匹配
    if (relativePath.includes(pattern) || filePath.includes(pattern)) {
      return true
    }
  }

  return false
}

/**
 * 获取输出目录列表
 * 
 * 从配置中提取所有的输出目录
 * 
 * @param config - 构建配置
 * @returns 输出目录列表
 */
export function getOutputDirs(config: any): string[] {
  const dirs: string[] = []

  // 主输出目录
  if (config.output?.dir) {
    dirs.push(config.output.dir)
  }

  // 各格式的输出目录，支持 boolean 简化配置
  if (config.output?.esm) {
    const esmDir = typeof config.output.esm === 'object' && config.output.esm.dir
      ? config.output.esm.dir
      : 'es'
    if (config.output.esm !== false) {
      dirs.push(esmDir)
    }
  }

  if (config.output?.cjs) {
    const cjsDir = typeof config.output.cjs === 'object' && config.output.cjs.dir
      ? config.output.cjs.dir
      : 'lib'
    if (config.output.cjs !== false) {
      dirs.push(cjsDir)
    }
  }

  if (config.output?.umd) {
    const umdDir = typeof config.output.umd === 'object' && config.output.umd.dir
      ? config.output.umd.dir
      : 'dist'
    if (config.output.umd !== false) {
      dirs.push(umdDir)
    }
  }

  // 添加常见的输出目录（兼容旧配置和遗留目录）
  // 注意：由于这是同步函数，我们不能使用动态 import
  // 在这里我们只返回配置的目录，不做文件系统检查
  // 清理时会自动检查目录是否存在
  const commonDirs = ['lib', 'cjs', 'dist', 'es', 'esm', 'umd']
  for (const dir of commonDirs) {
    if (!dirs.includes(dir)) {
      dirs.push(dir)
    }
  }

  // 去重
  return [...new Set(dirs)]
}
