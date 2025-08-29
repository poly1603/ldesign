/**
 * 配置文件加载器
 * 支持加载用户自定义的 ldesign.config.ts/js 配置文件
 * 使用 jiti 支持 TypeScript 和 ESM 语法
 */

import type { LauncherConfig } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import createJiti from 'jiti'

/**
 * 加载用户配置文件
 * @param cwd 工作目录
 * @returns 用户配置对象
 */
export async function loadUserConfig(cwd: string = process.cwd()): Promise<Partial<LauncherConfig> | null> {
  const candidates = [
    'ldesign.config.ts',
    'ldesign.config.js',
    'ldesign.config.mjs',
    'ldesign.launcher.ts',
    'ldesign.launcher.js',
    'launcher.config.ts',
    'launcher.config.js',
  ]

  // 创建 jiti 实例用于加载 TypeScript 和 ESM 文件
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

  for (const name of candidates) {
    const full = path.resolve(cwd, name)
    if (fs.existsSync(full)) {
      try {
        console.log(`[LauncherConfig] 尝试加载配置文件: ${name}`)

        let mod: any

        if (name.endsWith('.ts') || name.endsWith('.mjs')) {
          // 使用 jiti 加载 TypeScript 和 ESM 文件
          try {
            mod = jiti(full)
          }
          catch (error) {
            console.warn(`[LauncherConfig] jiti 加载失败，尝试动态导入: ${name}`, error)
            // 回退到动态导入
            const fileUrl = `file://${full.replace(/\\/g, '/')}`
            mod = await import(fileUrl + '?t=' + Date.now())
          }
        } else {
          // JavaScript 配置文件
          try {
            // 优先使用 jiti 加载，支持更好的错误处理
            mod = jiti(full)
          }
          catch (error) {
            console.warn(`[LauncherConfig] jiti 加载失败，尝试其他方式: ${name}`, error)

            // 回退到传统方式
            if (typeof require === 'undefined') {
              // ES 模块环境
              const fileUrl = `file://${full.replace(/\\/g, '/')}`
              mod = await import(fileUrl + '?t=' + Date.now())
            } else {
              // CommonJS 环境
              // 清理 require 缓存
              const cache: Record<string, any> = (require as any).cache || {}
              const fullNorm = path.normalize(full)
              for (const key of Object.keys(cache)) {
                const keyNorm = path.normalize(key)
                if (keyNorm === fullNorm || keyNorm.endsWith(path.sep + name)) {
                  delete (require as any).cache[key]
                }
              }
              mod = require(full)
            }
          }
        }

        // 提取配置对象
        const raw = (mod && (mod.default || mod))

        if (raw && typeof raw === 'object') {
          console.log(`[LauncherConfig] 成功加载配置文件: ${name}`)

          // 验证配置格式
          if (validateConfig(raw)) {
            return raw as Partial<LauncherConfig>
          } else {
            console.warn(`[LauncherConfig] 配置文件格式验证失败: ${name}`)
            continue
          }
        }

        console.warn(`[LauncherConfig] 配置文件格式无效: ${name}`)
      }
      catch (error) {
        console.warn(`[LauncherConfig] 加载配置文件失败: ${name}`, error)
        continue
      }
    }
  }

  console.log(`[LauncherConfig] 未找到有效的配置文件，使用默认配置`)
  return null
}

/**
 * 验证配置对象格式
 * @param config 配置对象
 * @returns 是否有效
 */
function validateConfig(config: any): boolean {
  if (!config || typeof config !== 'object') {
    return false
  }

  // 基本的配置验证
  // 允许空配置对象
  if (Object.keys(config).length === 0) {
    return true
  }

  // 检查是否包含已知的配置字段
  const knownFields = [
    'projectName', 'framework', 'server', 'build', 'network', 'security',
    'assets', 'plugins', 'optimization', 'vite', 'dev', 'preview'
  ]

  const hasKnownField = Object.keys(config).some(key => knownFields.includes(key))

  if (!hasKnownField) {
    console.warn(`[LauncherConfig] 配置对象不包含已知字段，可能不是有效的 LDesign 配置`)
  }

  return true
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
