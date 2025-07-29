import type { IPlugin, EngineConfig } from '../types'
import { isString, isObject, isFunction, isArray } from './helpers'

/**
 * 验证插件对象
 */
export function validatePlugin(plugin: any): plugin is IPlugin {
  if (!isObject(plugin)) {
    throw new Error('Plugin must be an object')
  }

  if (!isString(plugin.name) || plugin.name.trim() === '') {
    throw new Error('Plugin must have a valid name')
  }

  if (!isString(plugin.version) || plugin.version.trim() === '') {
    throw new Error('Plugin must have a valid version')
  }

  if (!isFunction(plugin.install)) {
    throw new Error('Plugin must have an install function')
  }

  if (plugin.uninstall && !isFunction(plugin.uninstall)) {
    throw new Error('Plugin uninstall must be a function if provided')
  }

  if (plugin.dependencies && !isArray(plugin.dependencies)) {
    throw new Error('Plugin dependencies must be an array if provided')
  }

  if (plugin.dependencies) {
    for (const dep of plugin.dependencies) {
      if (!isString(dep) || dep.trim() === '') {
        throw new Error('Plugin dependencies must be non-empty strings')
      }
    }
  }

  return true
}

/**
 * 验证引擎配置
 */
export function validateEngineConfig(config: any): config is EngineConfig {
  if (!isObject(config)) {
    throw new Error('Engine config must be an object')
  }

  if (config.debug !== undefined && typeof config.debug !== 'boolean') {
    throw new Error('Engine config debug must be a boolean if provided')
  }

  if (config.plugins !== undefined) {
    if (!isArray(config.plugins)) {
      throw new Error('Engine config plugins must be an array if provided')
    }

    for (const pluginConfig of config.plugins) {
      if (!isObject(pluginConfig)) {
        throw new Error('Plugin config must be an object')
      }

      if (!pluginConfig.plugin) {
        throw new Error('Plugin config must have a plugin property')
      }

      if (!isFunction(pluginConfig.plugin) && !validatePlugin(pluginConfig.plugin)) {
        throw new Error('Plugin config plugin must be a valid plugin or installer function')
      }

      if (pluginConfig.enabled !== undefined && typeof pluginConfig.enabled !== 'boolean') {
        throw new Error('Plugin config enabled must be a boolean if provided')
      }
    }
  }

  return true
}

/**
 * 验证版本号格式
 */
export function validateVersion(version: string): boolean {
  const versionRegex = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9-]+)?(?:\+[a-zA-Z0-9-]+)?$/
  return versionRegex.test(version)
}

/**
 * 验证插件名称格式
 */
export function validatePluginName(name: string): boolean {
  // 插件名称应该是有效的标识符，可以包含字母、数字、连字符和下划线
  const nameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
  return nameRegex.test(name)
}

/**
 * 验证事件名称格式
 */
export function validateEventName(name: string): boolean {
  // 事件名称可以包含字母、数字、冒号、连字符和下划线
  const eventRegex = /^[a-zA-Z][a-zA-Z0-9:_-]*$/
  return eventRegex.test(name)
}

/**
 * 验证URL格式
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证JSON字符串
 */
export function validateJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

/**
 * 验证对象是否有必需的属性
 */
export function validateRequiredProperties(
  obj: any,
  requiredProps: string[],
  objectName = 'Object'
): boolean {
  if (!isObject(obj)) {
    throw new Error(`${objectName} must be an object`)
  }

  for (const prop of requiredProps) {
    if (!(prop in obj)) {
      throw new Error(`${objectName} must have property: ${prop}`)
    }
  }

  return true
}

/**
 * 验证数组中的所有元素是否满足条件
 */
export function validateArrayElements<T>(
  arr: any[],
  validator: (item: any) => item is T,
  arrayName = 'Array'
): arr is T[] {
  if (!isArray(arr)) {
    throw new Error(`${arrayName} must be an array`)
  }

  for (let i = 0; i < arr.length; i++) {
    if (!validator(arr[i])) {
      throw new Error(`${arrayName}[${i}] is invalid`)
    }
  }

  return true
}

/**
 * 验证数值范围
 */
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number,
  valueName = 'Value'
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${valueName} must be a valid number`)
  }

  if (min !== undefined && value < min) {
    throw new Error(`${valueName} must be >= ${min}`)
  }

  if (max !== undefined && value > max) {
    throw new Error(`${valueName} must be <= ${max}`)
  }

  return true
}

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: string,
  minLength?: number,
  maxLength?: number,
  valueName = 'String'
): boolean {
  if (!isString(value)) {
    throw new Error(`${valueName} must be a string`)
  }

  if (minLength !== undefined && value.length < minLength) {
    throw new Error(`${valueName} must be at least ${minLength} characters long`)
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw new Error(`${valueName} must be at most ${maxLength} characters long`)
  }

  return true
}