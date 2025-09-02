/**
 * 配置文件加载器
 * 支持加载用户自定义的 ldesign.config.ts/js 配置文件
 * 使用 jiti 支持 TypeScript 和 ESM 语法
 */

import type { LauncherConfig } from '../types'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import createJiti from 'jiti'

/**
 * 默认配置文件名列表（按优先级排序）
 */
const CONFIG_FILES = [
  'ldesign.config.ts',     // 优先使用 TypeScript 配置
  'ldesign.config.mjs',    // ES 模块配置
  'ldesign.config.js',     // CommonJS 配置
  'ldesign.config.json',   // JSON 配置
  'ldesign.launcher.ts',   // 备用 TypeScript 配置
  'ldesign.launcher.mjs',  // 备用 ES 模块配置
  'ldesign.launcher.js',   // 备用 CommonJS 配置
  'ldesign.launcher.json', // 备用 JSON 配置
  'launcher.config.ts',    // 传统 TypeScript 配置
  'launcher.config.mjs',   // 传统 ES 模块配置
  'launcher.config.js',    // 传统 CommonJS 配置
  'launcher.config.json',  // 传统 JSON 配置
]

/**
 * 加载用户配置文件
 * @param cwd 工作目录
 * @returns 用户配置对象
 */
export async function loadUserConfig(cwd: string = process.cwd()): Promise<Partial<LauncherConfig> | null> {
  console.log(`[LauncherConfig] 开始加载配置文件，项目路径: ${cwd}`)

  const configFile = findConfigFile(cwd)

  if (!configFile) {
    console.log('[LauncherConfig] 未找到配置文件，使用默认配置')
    return null
  }

  console.log(`[LauncherConfig] 找到配置文件: ${configFile}`)

  try {
    let config: Partial<LauncherConfig>

    // 根据文件扩展名选择加载方式
    const ext = configFile.split('.').pop()

    if (ext === 'json') {
      // JSON 配置文件
      const configModule = await import(configFile, { assert: { type: 'json' } })
      config = configModule.default || configModule
    } else if (ext === 'ts' || ext === 'mjs') {
      // TypeScript 和 ES 模块配置文件，使用 jiti 加载
      const jiti = createJiti(cwd, {
        interopDefault: true,
        esmResolve: true,
        transformOptions: {
          babel: {
            plugins: [
              // 支持装饰器语法
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              // 支持类属性语法
              ['@babel/plugin-proposal-class-properties', { loose: true }],
            ],
          },
        },
      })

      try {
        config = jiti(configFile)
        console.log('[LauncherConfig] 使用 jiti 成功加载配置文件')
      } catch (jitiError) {
        console.warn(`[LauncherConfig] jiti 加载失败，尝试动态导入: ${configFile}`, jitiError)
        // 回退到动态导入
        const fileUrl = `file://${configFile.replace(/\\/g, '/')}`
        const configModule = await import(fileUrl + '?t=' + Date.now())
        config = configModule.default || configModule
        console.log('[LauncherConfig] 动态导入成功')
      }
    } else {
      // JavaScript 配置文件
      try {
        // 优先使用 jiti 加载，支持更好的错误处理
        const jiti = createJiti(cwd, {
          interopDefault: true,
        })
        config = jiti(configFile)
        console.log('[LauncherConfig] 使用 jiti 成功加载 JavaScript 配置文件')
      } catch (jitiError) {
        console.warn(`[LauncherConfig] jiti 加载失败，尝试动态导入: ${configFile}`, jitiError)
        // 回退到动态导入
        const configModule = await import(configFile + '?t=' + Date.now())
        config = configModule.default || configModule
        console.log('[LauncherConfig] 动态导入成功')
      }
    }

    // 验证配置
    const validation = validateConfig(config)
    if (!validation.valid) {
      console.warn('[LauncherConfig] 配置验证失败:', validation.errors)
      validation.warnings.forEach(warning => console.warn(`[LauncherConfig] 警告: ${warning}`))
      return null
    }

    // 输出警告
    validation.warnings.forEach(warning => console.warn(`[LauncherConfig] 警告: ${warning}`))

    console.log('[LauncherConfig] 配置加载成功')
    return config
  } catch (error) {
    console.error(`[LauncherConfig] 加载配置文件失败: ${configFile}`, error)
    return null
  }
}

/**
 * 查找配置文件
 * @param cwd 项目路径
 * @returns 配置文件路径或 null
 */
function findConfigFile(cwd: string): string | null {
  for (const fileName of CONFIG_FILES) {
    const filePath = resolve(cwd, fileName)
    if (existsSync(filePath)) {
      console.log(`[LauncherConfig] 找到配置文件: ${fileName}`)
      return filePath
    }
  }
  console.log('[LauncherConfig] 未找到任何配置文件')
  return null
}

/**
 * 验证配置对象格式
 * @param config 配置对象
 * @returns 验证结果
 */
function validateConfig(config: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // 验证基本结构
  if (typeof config !== 'object' || config === null) {
    errors.push('配置必须是一个对象')
    return { valid: false, errors, warnings }
  }

  // 允许空配置对象
  if (Object.keys(config).length === 0) {
    return { valid: true, errors, warnings }
  }

  // 检查是否包含已知的配置字段
  const knownFields = [
    'projectType', 'vite', 'network', 'security', 'assets', 'plugins', 
    'optimization', 'dev', 'build', 'preview'
  ]
  
  const hasKnownField = Object.keys(config).some(key => knownFields.includes(key))
  if (!hasKnownField) {
    warnings.push('配置对象不包含已知字段，可能不是有效的 LDesign 配置')
  }

  // 验证 vite 配置
  if (config.vite) {
    if (typeof config.vite !== 'object') {
      errors.push('vite 配置必须是一个对象')
    } else {
      // 验证 server 配置
      if (config.vite.server) {
        const server = config.vite.server
        if (server.port && (typeof server.port !== 'number' || server.port < 1 || server.port > 65535)) {
          errors.push('server.port 必须是 1-65535 之间的数字')
        }
        if (server.host && typeof server.host !== 'string' && typeof server.host !== 'boolean') {
          errors.push('server.host 必须是字符串或布尔值')
        }
      }

      // 验证 build 配置
      if (config.vite.build) {
        const build = config.vite.build
        if (build.outDir && typeof build.outDir !== 'string') {
          errors.push('build.outDir 必须是字符串')
        }
        if (build.target) {
          const validTargets = ['es5', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'esnext']
          const targets = Array.isArray(build.target) ? build.target : [build.target]
          for (const target of targets) {
            if (typeof target === 'string' && !validTargets.includes(target)) {
              errors.push(`无效的构建目标: ${target}`)
            }
          }
        }
      }

      // 验证插件配置
      if (config.vite.plugins && !Array.isArray(config.vite.plugins)) {
        errors.push('vite.plugins 必须是数组')
      }
    }
  }

  // 验证网络配置
  if (config.network) {
    if (typeof config.network !== 'object') {
      errors.push('network 配置必须是一个对象')
    } else {
      if (config.network.port && (typeof config.network.port !== 'number' || config.network.port < 1 || config.network.port > 65535)) {
        errors.push('network.port 必须是 1-65535 之间的数字')
      }
      if (config.network.proxy && typeof config.network.proxy !== 'object') {
        errors.push('network.proxy 必须是一个对象')
      }
    }
  }

  // 验证安全配置
  if (config.security) {
    if (typeof config.security !== 'object') {
      errors.push('security 配置必须是一个对象')
    }
  }

  // 验证插件配置
  if (config.plugins) {
    if (typeof config.plugins !== 'object') {
      errors.push('plugins 配置必须是一个对象')
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * 解析配置文件路径
 * @param cwd 项目路径
 * @returns 配置文件路径或 null
 */
export function resolveConfigFile(cwd: string): string | null {
  return findConfigFile(cwd)
}

/**
 * 合并配置
 * @param defaultConfig 默认配置
 * @param userConfig 用户配置
 * @returns 合并后的配置
 */
export function mergeConfig<T extends Record<string, any>>(
  defaultConfig: T,
  userConfig: Partial<T> | null
): T {
  if (!userConfig) {
    return defaultConfig
  }

  const merged = { ...defaultConfig }

  for (const [key, value] of Object.entries(userConfig)) {
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 深度合并对象
        merged[key as keyof T] = {
          ...(merged[key as keyof T] as any),
          ...value
        } as T[keyof T]
      } else {
        // 直接覆盖
        merged[key as keyof T] = value as T[keyof T]
      }
    }
  }

  return merged
}
