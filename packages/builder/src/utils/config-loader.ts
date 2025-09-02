/**
 * 配置加载器
 * 负责加载和解析构建配置，支持 TypeScript 配置文件
 */

import type { BuildOptions } from '../types'
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
  'ldesign.builder.ts',    // 备用 TypeScript 配置
  'ldesign.builder.mjs',   // 备用 ES 模块配置
  'ldesign.builder.js',    // 备用 CommonJS 配置
  'ldesign.builder.json',  // 备用 JSON 配置
  'builder.config.ts',     // 传统 TypeScript 配置
  'builder.config.mjs',    // 传统 ES 模块配置
  'builder.config.js',     // 传统 CommonJS 配置
  'builder.config.json',   // 传统 JSON 配置
]

/**
 * 加载用户配置
 * @param cwd 项目路径
 * @returns 配置对象
 */
export async function loadUserConfig(cwd: string = process.cwd()): Promise<Partial<BuildOptions> | null> {
  console.log(`[BuilderConfig] 开始加载配置文件，项目路径: ${cwd}`)

  const configFile = findConfigFile(cwd)

  if (!configFile) {
    console.log('[BuilderConfig] 未找到配置文件，使用默认配置')
    return null
  }

  console.log(`[BuilderConfig] 找到配置文件: ${configFile}`)

  try {
    let config: Partial<BuildOptions>

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
      })

      try {
        config = jiti(configFile)
        console.log('[BuilderConfig] 使用 jiti 成功加载配置文件')
      } catch (jitiError) {
        console.warn(`[BuilderConfig] jiti 加载失败，尝试动态导入: ${configFile}`, jitiError)
        // 回退到动态导入
        const fileUrl = `file://${configFile.replace(/\\/g, '/')}`
        const configModule = await import(fileUrl + '?t=' + Date.now())
        config = configModule.default || configModule
        console.log('[BuilderConfig] 动态导入成功')
      }
    } else {
      // JavaScript 配置文件
      try {
        // 优先使用 jiti 加载，支持更好的错误处理
        const jiti = createJiti(cwd, {
          interopDefault: true,
        })
        config = jiti(configFile)
        console.log('[BuilderConfig] 使用 jiti 成功加载 JavaScript 配置文件')
      } catch (jitiError) {
        console.warn(`[BuilderConfig] jiti 加载失败，尝试动态导入: ${configFile}`, jitiError)
        // 回退到动态导入
        const configModule = await import(configFile + '?t=' + Date.now())
        config = configModule.default || configModule
        console.log('[BuilderConfig] 动态导入成功')
      }
    }

    // 验证配置
    if (typeof config !== 'object' || config === null) {
      console.warn('[BuilderConfig] 配置文件格式无效，使用默认配置')
      return null
    }

    console.log('[BuilderConfig] 配置加载成功')
    return config
  } catch (error) {
    console.error(`[BuilderConfig] 加载配置文件失败: ${configFile}`, error)
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
      console.log(`[BuilderConfig] 找到配置文件: ${fileName}`)
      return filePath
    }
  }
  console.log('[BuilderConfig] 未找到任何配置文件')
  return null
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
 * @param base 基础配置
 * @param override 覆盖配置
 * @returns 合并后的配置
 */
export function mergeConfig(base: Partial<BuildOptions>, override: Partial<BuildOptions>): Partial<BuildOptions> {
  const merged = {
    ...base,
    ...override,
    // 深度合并数组
    formats: [
      ...(base.formats || []),
      ...(override.formats || []),
    ],
    plugins: [
      ...(base.plugins || []),
      ...(override.plugins || []),
    ],
  }

  // 特殊处理 external 字段，因为它可以是数组或函数
  if (override.external !== undefined) {
    // 如果 override 有 external，直接使用 override 的值
    merged.external = override.external
  } else if (base.external !== undefined) {
    // 如果只有 base 有 external，使用 base 的值
    merged.external = base.external
  }

  return merged
}

/**
 * 验证配置
 * @param config 配置对象
 * @returns 验证结果
 */
export function validateConfig(config: Partial<BuildOptions>): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // 验证基本结构
  if (typeof config !== 'object' || config === null) {
    errors.push('配置必须是一个对象')
    return { valid: false, errors, warnings }
  }

  // 验证 formats 配置
  if (config.formats) {
    if (!Array.isArray(config.formats)) {
      errors.push('formats 配置必须是一个数组')
    } else {
      const validFormats = ['esm', 'cjs', 'iife', 'umd']
      const invalidFormats = config.formats.filter(format => !validFormats.includes(format))
      if (invalidFormats.length > 0) {
        errors.push(`无效的输出格式: ${invalidFormats.join(', ')}。有效格式: ${validFormats.join(', ')}`)
      }
      
      // 检查格式组合的兼容性
      if (config.formats.includes('umd') && !config.name) {
        warnings.push('UMD 格式建议设置 name 字段，用于定义全局变量名')
      }
      if (config.formats.includes('iife') && !config.name) {
        warnings.push('IIFE 格式建议设置 name 字段，用于定义全局变量名')
      }
    }
  }

  // 验证 external 配置
  if (config.external) {
    if (!Array.isArray(config.external) && typeof config.external !== 'function') {
      errors.push('external 配置必须是一个数组或函数')
    } else if (Array.isArray(config.external)) {
      const invalidExternals = config.external.filter(ext => typeof ext !== 'string')
      if (invalidExternals.length > 0) {
        errors.push('external 数组中的所有项都必须是字符串')
      }
    }
  }

  // 验证 plugins 配置
  if (config.plugins) {
    if (!Array.isArray(config.plugins)) {
      errors.push('plugins 配置必须是一个数组')
    } else {
      config.plugins.forEach((plugin, index) => {
        if (!plugin || typeof plugin !== 'object') {
          errors.push(`plugins[${index}] 必须是一个对象`)
        } else if (!plugin.name || typeof plugin.name !== 'string') {
          errors.push(`plugins[${index}] 必须包含有效的 name 字段`)
        }
      })
    }
  }

  // 验证 name 配置
  if (config.name && typeof config.name !== 'string') {
    errors.push('name 配置必须是一个字符串')
  }

  // 验证 input 配置
  if (config.input) {
    const inputType = typeof config.input
    if (inputType !== 'string' && !Array.isArray(config.input) && inputType !== 'object') {
      errors.push('input 配置必须是字符串、数组或对象')
    } else if (Array.isArray(config.input)) {
      const invalidInputs = config.input.filter(inp => typeof inp !== 'string')
      if (invalidInputs.length > 0) {
        errors.push('input 数组中的所有项都必须是字符串')
      }
    }
  }

  // 验证 outDir 配置
  if (config.outDir && typeof config.outDir !== 'string') {
    errors.push('outDir 配置必须是一个字符串')
  }

  // 验证 dts 配置
  if (config.dts && typeof config.dts !== 'boolean' && typeof config.dts !== 'object') {
    errors.push('dts 配置必须是 boolean 或 对象')
  }

  // 验证 mode 配置
  if (config.mode && !['development', 'production'].includes(config.mode)) {
    errors.push('mode 配置必须是 "development" 或 "production"')
  }

  // 验证 sourcemap 配置
  if (config.sourcemap !== undefined) {
    const validSourcemapValues = [true, false, 'inline', 'hidden']
    if (!validSourcemapValues.includes(config.sourcemap as any)) {
      errors.push('sourcemap 配置必须是 boolean、"inline" 或 "hidden"')
    }
  }

  // 验证 globals 配置
  if (config.globals) {
    if (typeof config.globals !== 'object' || Array.isArray(config.globals)) {
      errors.push('globals 配置必须是一个对象')
    } else {
      Object.entries(config.globals).forEach(([key, value]) => {
        if (typeof key !== 'string' || typeof value !== 'string') {
          errors.push('globals 对象的键和值都必须是字符串')
        }
      })
    }
  }

  // 逻辑验证：检查配置组合的合理性
  if (config.formats?.includes('umd') || config.formats?.includes('iife')) {
    if (config.external && Array.isArray(config.external) && config.external.length > 0) {
      if (!config.globals || Object.keys(config.globals).length === 0) {
        warnings.push('使用 UMD/IIFE 格式时，建议为 external 依赖配置对应的 globals 映射')
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
