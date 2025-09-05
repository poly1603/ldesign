/**
 * 插件相关工具函数（为后续 plugin 包预留）
 * 
 * 提供插件加载、验证、管理等工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { FileSystem } from './file-system'
import { PathUtils } from './path-utils'
import type { Plugin } from 'vite'
import type { LauncherPlugin, ValidationResult } from '../types'

/**
 * 验证插件
 * 
 * @param plugin - 要验证的插件
 * @returns 验证结果
 */
export function validatePlugin(plugin: LauncherPlugin): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 验证插件名称
  if (!plugin.name || typeof plugin.name !== 'string') {
    errors.push('插件必须有有效的名称')
  } else if (plugin.name.length === 0) {
    errors.push('插件名称不能为空')
  }

  // 验证插件元数据
  if (plugin.meta) {
    if (!plugin.meta.version) {
      warnings.push('建议提供插件版本信息')
    } else if (!/^\d+\.\d+\.\d+/.test(plugin.meta.version)) {
      warnings.push('插件版本格式不符合语义化版本规范')
    }

    if (!plugin.meta.description) {
      warnings.push('建议提供插件描述')
    }

    if (!plugin.meta.author) {
      warnings.push('建议提供插件作者信息')
    }
  } else {
    warnings.push('建议提供插件元数据')
  }

  // 验证插件配置
  if (plugin.config) {
    if (plugin.config.priority && typeof plugin.config.priority !== 'number') {
      errors.push('插件优先级必须是数字')
    }

    if (plugin.config.apply && typeof plugin.config.apply !== 'string' && typeof plugin.config.apply !== 'function') {
      errors.push('插件应用条件必须是字符串或函数')
    }

    if (plugin.config.enforce && !['pre', 'post'].includes(plugin.config.enforce)) {
      errors.push('插件执行顺序必须是 "pre" 或 "post"')
    }
  }

  // 验证插件钩子
  if (plugin.hooks) {
    const hookNames = Object.keys(plugin.hooks)
    for (const hookName of hookNames) {
      const hook = (plugin.hooks as any)[hookName]
      if (hook && typeof hook !== 'function') {
        errors.push(`插件钩子 "${hookName}" 必须是函数`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 从文件加载插件
 * 
 * @param filePath - 插件文件路径
 * @returns 加载的插件
 */
export async function loadPluginFromFile(filePath: string): Promise<LauncherPlugin> {
  try {
    if (!(await FileSystem.exists(filePath))) {
      throw new Error(`插件文件不存在: ${filePath}`)
    }

    const ext = PathUtils.extname(filePath).toLowerCase()

    if (!['.js', '.mjs', '.cjs', '.ts'].includes(ext)) {
      throw new Error(`不支持的插件文件格式: ${ext}`)
    }

    // 清除模块缓存
    const absolutePath = PathUtils.resolve(filePath)
    delete require.cache[absolutePath]

    // 动态导入插件
    const module = await import(absolutePath)
    const plugin = module.default || module

    if (!plugin || typeof plugin !== 'object') {
      throw new Error('插件文件必须导出一个插件对象')
    }

    // 验证插件
    const validation = validatePlugin(plugin)
    if (!validation.valid) {
      throw new Error(`插件验证失败: ${validation.errors.join(', ')}`)
    }

    return plugin

  } catch (error) {
    throw new Error(`加载插件文件失败: ${(error as Error).message}`)
  }
}

/**
 * 从模块加载插件
 * 
 * @param moduleName - 模块名称
 * @returns 加载的插件
 */
export async function loadPluginFromModule(moduleName: string): Promise<LauncherPlugin> {
  try {
    // 尝试解析模块路径
    const modulePath = require.resolve(moduleName)

    // 清除模块缓存
    delete require.cache[modulePath]

    // 动态导入插件
    const module = await import(moduleName)
    const plugin = module.default || module

    if (!plugin || typeof plugin !== 'object') {
      throw new Error('插件模块必须导出一个插件对象')
    }

    // 验证插件
    const validation = validatePlugin(plugin)
    if (!validation.valid) {
      throw new Error(`插件验证失败: ${validation.errors.join(', ')}`)
    }

    return plugin

  } catch (error) {
    throw new Error(`加载插件模块失败: ${(error as Error).message}`)
  }
}

/**
 * 解析插件依赖
 * 
 * @param plugins - 插件列表
 * @returns 依赖图
 */
export function resolvePluginDependencies(plugins: LauncherPlugin[]): Map<string, Set<string>> {
  const dependencyGraph = new Map<string, Set<string>>()

  for (const plugin of plugins) {
    const pluginName = plugin.name || 'unknown'

    if (!dependencyGraph.has(pluginName)) {
      dependencyGraph.set(pluginName, new Set())
    }

    // 添加依赖关系
    if (plugin.meta?.dependencies) {
      const dependencies = dependencyGraph.get(pluginName)!
      plugin.meta.dependencies.forEach(dep => dependencies.add(dep))
    }
  }

  return dependencyGraph
}

/**
 * 检测循环依赖
 * 
 * @param dependencyGraph - 依赖图
 * @returns 循环依赖列表
 */
export function detectCircularDependencies(dependencyGraph: Map<string, Set<string>>): string[][] {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const cycles: string[][] = []

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      // 找到循环依赖
      const cycleStart = path.indexOf(node)
      cycles.push([...path.slice(cycleStart), node])
      return
    }

    if (visited.has(node)) {
      return
    }

    visited.add(node)
    recursionStack.add(node)

    const dependencies = dependencyGraph.get(node) || new Set()
    for (const dep of dependencies) {
      dfs(dep, [...path, node])
    }

    recursionStack.delete(node)
  }

  for (const node of dependencyGraph.keys()) {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  }

  return cycles
}

/**
 * 计算插件加载顺序（拓扑排序）
 * 
 * @param dependencyGraph - 依赖图
 * @returns 加载顺序
 */
export function calculatePluginLoadOrder(dependencyGraph: Map<string, Set<string>>): string[] {
  const inDegree = new Map<string, number>()
  const queue: string[] = []
  const result: string[] = []

  // 初始化入度
  for (const node of dependencyGraph.keys()) {
    inDegree.set(node, 0)
  }

  // 计算入度
  for (const dependencies of dependencyGraph.values()) {
    for (const dep of dependencies) {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1)
    }
  }

  // 找到入度为 0 的节点
  for (const [node, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(node)
    }
  }

  // 拓扑排序
  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)

    const dependencies = dependencyGraph.get(node) || new Set()
    for (const dep of dependencies) {
      const newDegree = (inDegree.get(dep) || 0) - 1
      inDegree.set(dep, newDegree)

      if (newDegree === 0) {
        queue.push(dep)
      }
    }
  }

  return result
}

/**
 * 过滤插件
 * 
 * @param plugins - 插件列表
 * @param condition - 过滤条件
 * @returns 过滤后的插件列表
 */
export function filterPlugins(
  plugins: LauncherPlugin[],
  condition: (plugin: LauncherPlugin) => boolean
): LauncherPlugin[] {
  return plugins.filter(condition)
}

/**
 * 按优先级排序插件
 * 
 * @param plugins - 插件列表
 * @returns 排序后的插件列表
 */
export function sortPluginsByPriority(plugins: LauncherPlugin[]): LauncherPlugin[] {
  return [...plugins].sort((a, b) => {
    const priorityA = a.config?.priority || 100
    const priorityB = b.config?.priority || 100
    return priorityA - priorityB
  })
}

/**
 * 查找插件
 * 
 * @param plugins - 插件列表
 * @param name - 插件名称
 * @returns 找到的插件
 */
export function findPlugin(plugins: LauncherPlugin[], name: string): LauncherPlugin | undefined {
  return plugins.find(plugin => plugin.name === name)
}

/**
 * 获取插件统计信息
 * 
 * @param plugins - 插件列表
 * @returns 统计信息
 */
export function getPluginStats(plugins: LauncherPlugin[]): {
  total: number
  withMeta: number
  withConfig: number
  withHooks: number
  withDependencies: number
} {
  return {
    total: plugins.length,
    withMeta: plugins.filter(p => p.meta).length,
    withConfig: plugins.filter(p => p.config).length,
    withHooks: plugins.filter(p => p.hooks).length,
    withDependencies: plugins.filter(p => p.meta?.dependencies?.length).length
  }
}

/**
 * 创建插件包装器
 * 
 * @param plugin - 原始插件
 * @param wrapper - 包装器函数
 * @returns 包装后的插件
 */
export function wrapPlugin(
  plugin: Plugin,
  wrapper: (plugin: Plugin) => LauncherPlugin
): LauncherPlugin {
  return wrapper(plugin)
}

/**
 * 合并插件配置
 * 
 * @param base - 基础配置
 * @param override - 覆盖配置
 * @returns 合并后的配置
 */
export function mergePluginConfig(base: any, override: any): any {
  try {
    const { ObjectUtils } = require('@ldesign/kit')
    return ObjectUtils.deepMerge(base, override)
  } catch (error) {
    return { ...base, ...override }
  }
}

/**
 * 生成插件清单
 * 
 * @param plugins - 插件列表
 * @returns 插件清单
 */
export function generatePluginManifest(plugins: LauncherPlugin[]): {
  version: string
  timestamp: string
  plugins: Array<{
    name: string
    version?: string
    description?: string
    author?: string
    priority?: number
    dependencies?: string[]
  }>
} {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    plugins: plugins.map(plugin => ({
      name: plugin.name || 'unknown',
      version: plugin.meta?.version,
      description: plugin.meta?.description,
      author: plugin.meta?.author,
      priority: plugin.config?.priority,
      dependencies: plugin.meta?.dependencies
    }))
  }
}
