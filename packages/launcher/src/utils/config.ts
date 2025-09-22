/**
 * 配置处理工具函数
 * 
 * 提供配置文件的加载、验证、合并等工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { FileSystem } from './file-system'
import { PathUtils } from './path-utils'
import type { ViteLauncherConfig, ValidationResult } from '../types'
import { DEFAULT_CONFIG_FILES, SUPPORTED_CONFIG_EXTENSIONS } from '../constants'

/**
 * 查找配置文件
 * 
 * @param cwd - 工作目录
 * @param configFile - 指定的配置文件路径（可选）
 * @returns 找到的配置文件路径
 */
export async function findConfigFile(cwd: string, configFile?: string): Promise<string | null> {
  if (configFile) {
    // 如果指定了配置文件，直接按传入路径检查（保持与测试期望一致，不进行路径拼接）
    const targetPath = configFile

    if (await FileSystem.exists(targetPath)) {
      return targetPath
    }

    throw new Error(`指定的配置文件不存在: ${configFile}`)
  }

  // 自动查找配置文件
  for (const fileName of DEFAULT_CONFIG_FILES) {
    const filePath = PathUtils.resolve(cwd, fileName)

    if (await FileSystem.exists(filePath)) {
      return filePath
    }
  }

  return null
}

/**
 * 加载配置文件
 * 
 * @param configPath - 配置文件路径
 * @returns 加载的配置对象
 */
export async function loadConfigFile(configPath: string): Promise<ViteLauncherConfig> {
  try {
    const ext = PathUtils.extname(configPath).toLowerCase()

    if (!SUPPORTED_CONFIG_EXTENSIONS.includes(ext as any)) {
      throw new Error(`不支持的配置文件格式: ${ext}`)
    }

    // 检查文件是否存在
    if (!(await FileSystem.exists(configPath))) {
      throw new Error(`配置文件不存在: ${configPath}`)
    }

    let config: ViteLauncherConfig

    if (ext === '.json') {
      // JSON 配置文件
      const content = await FileSystem.readFile(configPath, { encoding: 'utf-8' })
      config = JSON.parse(content)
    } else {
      // JavaScript/TypeScript 配置文件
      // 使用动态导入加载模块
      const absolutePath = PathUtils.resolve(configPath)

      // 清除模块缓存以支持热重载
      delete require.cache[absolutePath]

      const module = await import(absolutePath)
      config = module.default || module
    }

    return config

  } catch (error) {
    throw new Error(`加载配置文件失败: ${(error as Error).message}`)
  }
}

/**
 * 保存配置文件
 * 
 * @param configPath - 配置文件路径
 * @param config - 配置对象
 */
export async function saveConfigFile(configPath: string, config: ViteLauncherConfig): Promise<void> {
  try {
    const ext = PathUtils.extname(configPath).toLowerCase()

    if (ext === '.json') {
      // JSON 格式
      const content = JSON.stringify(config, null, 2)
      await FileSystem.writeFile(configPath, content, { encoding: 'utf-8' })
    } else {
      // JavaScript/TypeScript 格式
      const content = generateConfigFileContent(config, ext === '.ts')
      await FileSystem.writeFile(configPath, content, { encoding: 'utf-8' })
    }

  } catch (error) {
    throw new Error(`保存配置文件失败: ${(error as Error).message}`)
  }
}

/**
 * 深度合并配置对象
 *
 * @param base - 基础配置
 * @param override - 覆盖配置
 * @returns 合并后的配置
 */
export function mergeConfigs(base: ViteLauncherConfig, override: ViteLauncherConfig): ViteLauncherConfig {
  // 本地深度合并兜底实现
  const localDeepMerge = (target: any, source: any): any => {
    const result: any = { ...target }
    for (const key in source) {
      const sv = (source as any)[key]
      const tv = (target as any)[key]
      if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
        result[key] = localDeepMerge(tv || {}, sv)
      } else if (Array.isArray(sv)) {
        result[key] = Array.isArray(tv) ? [...tv, ...sv] : [...sv]
      } else {
        result[key] = sv
      }
    }
    return result
  }

  // 直接使用本地深度合并实现，避免动态导入导致的类型问题
  return localDeepMerge(base, override)
}

/**
 * 验证配置对象
 * 
 * @param config - 要验证的配置
 * @returns 验证结果
 */
export function validateConfig(config: ViteLauncherConfig): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // 验证基本结构
    if (typeof config !== 'object' || config === null) {
      errors.push('配置必须是一个对象')
      return { valid: false, errors, warnings }
    }

    // 验证服务器配置
    if (config.server) {
      if (config.server.port && (typeof config.server.port !== 'number' || config.server.port < 1 || config.server.port > 65535)) {
        errors.push('服务器端口必须是 1-65535 之间的数字')
      }

      if (config.server.host && typeof config.server.host !== 'string') {
        errors.push('服务器主机地址必须是字符串')
      }
    }

    // 验证构建配置
    if (config.build) {
      if (config.build.outDir && typeof config.build.outDir !== 'string') {
        errors.push('构建输出目录必须是字符串')
      }

      if (config.build.target && typeof config.build.target !== 'string' && !Array.isArray(config.build.target)) {
        errors.push('构建目标必须是字符串或字符串数组')
      }
    }

    // 验证预览配置
    if (config.preview) {
      if (config.preview.port && (typeof config.preview.port !== 'number' || config.preview.port < 1 || config.preview.port > 65535)) {
        errors.push('预览服务器端口必须是 1-65535 之间的数字')
      }
    }

    // 验证 launcher 特有配置
    if (config.launcher) {
      if (config.launcher.logLevel && !['silent', 'error', 'warn', 'info', 'debug'].includes(config.launcher.logLevel)) {
        errors.push('日志级别必须是 silent、error、warn、info 或 debug 之一')
      }

      if (config.launcher.mode && !['development', 'production', 'test'].includes(config.launcher.mode)) {
        errors.push('运行模式必须是 development、production 或 test 之一')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }

  } catch (error) {
    return {
      valid: false,
      errors: [`配置验证过程中发生错误: ${(error as Error).message}`],
      warnings
    }
  }
}

/**
 * 规范化配置路径
 * 
 * @param config - 配置对象
 * @param basePath - 基础路径
 * @returns 规范化后的配置
 */
export function normalizeConfigPaths(config: ViteLauncherConfig, basePath: string): ViteLauncherConfig {
  const normalized = { ...config }

  // 规范化根目录
  if (normalized.root && !PathUtils.isAbsolute(normalized.root)) {
    normalized.root = PathUtils.resolve(basePath, normalized.root)
  }

  // 规范化构建输出目录
  if (normalized.build?.outDir && !PathUtils.isAbsolute(normalized.build.outDir)) {
    normalized.build.outDir = PathUtils.resolve(basePath, normalized.build.outDir)
  }

  // 规范化公共目录
  if (normalized.publicDir && !PathUtils.isAbsolute(normalized.publicDir)) {
    normalized.publicDir = PathUtils.resolve(basePath, normalized.publicDir)
  }

  return normalized
}

/**
 * 生成配置文件内容
 * 
 * @param config - 配置对象
 * @param isTypeScript - 是否为 TypeScript 文件
 * @returns 配置文件内容
 */
function generateConfigFileContent(config: ViteLauncherConfig, isTypeScript: boolean = false): string {
  const typeImport = isTypeScript
    ? "import type { ViteLauncherConfig } from '@ldesign/launcher'\n\n"
    : ''

  const typeAnnotation = isTypeScript
    ? ' satisfies ViteLauncherConfig'
    : ''

  const configString = JSON.stringify(config, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // 移除属性名的引号
    .replace(/"/g, "'") // 使用单引号

  return `${typeImport}/**
 * Launcher 配置文件
 * 
 * @see https://github.com/ldesign/launcher
 */
export default ${configString}${typeAnnotation}
`
}

/**
 * 获取配置文件的默认路径
 * 
 * @param cwd - 工作目录
 * @param preferTypeScript - 是否优先使用 TypeScript
 * @returns 默认配置文件路径
 */
export function getDefaultConfigPath(cwd: string, preferTypeScript: boolean = true): string {
  const fileName = preferTypeScript ? 'launcher.config.ts' : 'launcher.config.js'
  return PathUtils.resolve(cwd, fileName)
}

/**
 * 检查配置文件是否为 TypeScript 格式
 * 
 * @param configPath - 配置文件路径
 * @returns 是否为 TypeScript 格式
 */
export function isTypeScriptConfig(configPath: string): boolean {
  return PathUtils.extname(configPath).toLowerCase() === '.ts'
}

/**
 * 获取配置文件的监听模式选项
 * 
 * @param configPath - 配置文件路径
 * @returns 监听选项
 */
export function getConfigWatchOptions(_configPath: string) {
  return {
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**'
    ],
    ignoreInitial: true,
    persistent: true
  }
}

/**
 * 创建路径解析器
 *
 * 提供内置的路径解析功能，用户无需手动定义r函数
 *
 * @param cwd - 工作目录，默认为process.cwd()
 * @returns 路径解析函数
 */
export function createPathResolver(cwd?: string) {
  const workingDir = cwd || process.cwd()

  return (relativePath: string): string => {
    return PathUtils.resolve(workingDir, relativePath)
  }
}



/**
 * 定义配置的辅助函数
 * 提供类型安全和智能提示
 *
 * @param config - 配置对象
 * @returns 配置对象
 */
export function defineConfig(config: ViteLauncherConfig): ViteLauncherConfig {
  return config
}
