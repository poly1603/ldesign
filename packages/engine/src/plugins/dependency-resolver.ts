/**
 * Plugin Dependency Resolver
 * 
 * 提供插件依赖解析功能：
 * - 拓扑排序确定加载顺序
 * - 循环依赖检测
 * - 可选依赖支持
 * - 版本兼容性检查
 * - 依赖图可视化
 */

import type { Logger, Plugin  } from '../types'


// 依赖类型
export type DependencyType = 'required' | 'optional' | 'peer'

// 版本范围
export interface VersionRange {
  min?: string
  max?: string
  exact?: string
}

// 增强的插件依赖信息
export interface PluginDependency {
  name: string
  type?: DependencyType
  version?: string | VersionRange
  condition?: () => boolean // 条件依赖
}

// 插件节点
export interface PluginNode {
  plugin: Plugin
  dependencies: PluginDependency[]
  dependents: Set<string>
  depth: number
  visited: boolean
  processing: boolean
}

// 依赖解析结果
export interface ResolutionResult {
  success: boolean
  order?: Plugin[]
  cycles?: string[][]
  missing?: string[]
  incompatible?: Array<{
    plugin: string
    dependency: string
    reason: string
  }>
  warnings?: string[]
}

// 依赖图
export interface DependencyGraph {
  nodes: Map<string, PluginNode>
  edges: Map<string, Set<string>>
  roots: Set<string>
  leaves: Set<string>
}

/**
 * 插件依赖解析器
 */
export class DependencyResolver {
  private graph: DependencyGraph = {
    nodes: new Map(),
    edges: new Map(),
    roots: new Set(),
    leaves: new Set()
  }
  
  private cycles: string[][] = []
  private missing: Set<string> = new Set()
  private incompatible: Array<{
    plugin: string
    dependency: string
    reason: string
  }> = []
  
  constructor(private logger?: Logger) {}

  /**
   * 解析插件依赖并返回加载顺序
   */
  resolve(plugins: Plugin[]): ResolutionResult {
    this.reset()
    
    // 构建依赖图
    this.buildGraph(plugins)
    
    // 检测循环依赖
    this.detectCycles()
    
    if (this.cycles.length > 0) {
      this.logger?.error('Circular dependencies detected', this.cycles)
      return {
        success: false,
        cycles: this.cycles,
        missing: Array.from(this.missing),
        incompatible: this.incompatible
      }
    }
    
    // 检查缺失依赖
    this.checkMissingDependencies()
    
    if (this.missing.size > 0 && !this.hasOnlyOptionalMissing()) {
      this.logger?.error('Missing required dependencies', Array.from(this.missing))
      return {
        success: false,
        missing: Array.from(this.missing),
        incompatible: this.incompatible
      }
    }
    
    // 检查版本兼容性
    this.checkVersionCompatibility(plugins)
    
    if (this.incompatible.length > 0) {
      const criticalIncompatible = this.incompatible.filter(
        i => !this.isOptionalDependency(i.plugin, i.dependency)
      )
      
      if (criticalIncompatible.length > 0) {
        this.logger?.error('Incompatible plugin versions', criticalIncompatible)
        return {
          success: false,
          incompatible: this.incompatible,
          missing: Array.from(this.missing)
        }
      }
    }
    
    // 执行拓扑排序
    const order = this.topologicalSort()
    
    if (!order) {
      return {
        success: false,
        cycles: this.cycles,
        missing: Array.from(this.missing),
        incompatible: this.incompatible
      }
    }
    
    // 生成警告信息
    const warnings = this.generateWarnings()
    
    this.logger?.info('Plugin dependency resolution completed', {
      totalPlugins: plugins.length,
      loadOrder: order.map(p => p.name),
      warnings: warnings.length
    })
    
    return {
      success: true,
      order,
      warnings,
      missing: Array.from(this.missing).filter(m => this.isOptionalDependency('', m)),
      incompatible: this.incompatible.filter(i => this.isOptionalDependency(i.plugin, i.dependency))
    }
  }

  /**
   * 构建依赖图
   */
  private buildGraph(plugins: Plugin[]): void {
    // 创建节点
    for (const plugin of plugins) {
      const dependencies = this.parseDependencies(plugin)
      
      const node: PluginNode = {
        plugin,
        dependencies,
        dependents: new Set(),
        depth: 0,
        visited: false,
        processing: false
      }
      
      this.graph.nodes.set(plugin.name, node)
      this.graph.edges.set(plugin.name, new Set())
    }
    
    // 建立边和依赖关系
    for (const [name, node] of this.graph.nodes) {
      for (const dep of node.dependencies) {
        if (this.graph.nodes.has(dep.name)) {
          this.graph.edges.get(name)!.add(dep.name)
          this.graph.nodes.get(dep.name)!.dependents.add(name)
        } else if (dep.type === 'required') {
          this.missing.add(dep.name)
        }
      }
    }
    
    // 识别根节点和叶节点
    for (const [name, node] of this.graph.nodes) {
      if (node.dependencies.length === 0 || 
          node.dependencies.every(d => d.type === 'optional')) {
        this.graph.roots.add(name)
      }
      
      if (node.dependents.size === 0) {
        this.graph.leaves.add(name)
      }
    }
    
    // 计算深度
    this.calculateDepth()
  }

  /**
   * 解析插件依赖
   */
  private parseDependencies(plugin: Plugin): PluginDependency[] {
    const deps: PluginDependency[] = []
    
    // 处理简单依赖数组
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (typeof dep === 'string') {
          deps.push({ name: dep, type: 'required' })
        } else if (typeof dep === 'object') {
          deps.push(dep as PluginDependency)
        }
      }
    }
    
    // 处理对等依赖
    if ((plugin as any).peerDependencies) {
      for (const dep of (plugin as any).peerDependencies) {
        if (typeof dep === 'string') {
          deps.push({ name: dep, type: 'peer' })
        } else if (typeof dep === 'object') {
          deps.push({ ...dep, type: 'peer' })
        }
      }
    }
    
    // 处理可选依赖
    if ((plugin as any).optionalDependencies) {
      for (const dep of (plugin as any).optionalDependencies) {
        if (typeof dep === 'string') {
          deps.push({ name: dep, type: 'optional' })
        } else if (typeof dep === 'object') {
          deps.push({ ...dep, type: 'optional' })
        }
      }
    }
    
    return deps
  }

  /**
   * 检测循环依赖（使用 DFS）
   */
  private detectCycles(): void {
    const visited = new Set<string>()
    const stack = new Set<string>()
    
    const dfs = (nodeName: string, path: string[] = []): void => {
      if (stack.has(nodeName)) {
        // 发现循环
        const cycleStart = path.indexOf(nodeName)
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart)
          cycle.push(nodeName)
          this.cycles.push(cycle)
          return
        }
      }
      
      if (visited.has(nodeName)) {
        return
      }
      
      visited.add(nodeName)
      stack.add(nodeName)
      path.push(nodeName)
      
      const edges = this.graph.edges.get(nodeName)
      if (edges) {
        for (const neighbor of edges) {
          dfs(neighbor, [...path])
        }
      }
      
      stack.delete(nodeName)
    }
    
    // 从每个节点开始 DFS
    for (const nodeName of this.graph.nodes.keys()) {
      if (!visited.has(nodeName)) {
        dfs(nodeName)
      }
    }
  }

  /**
   * 拓扑排序（使用 Kahn's 算法）
   */
  private topologicalSort(): Plugin[] | null {
    const inDegree = new Map<string, number>()
    const queue: string[] = []
    const sorted: Plugin[] = []
    
    // 计算入度
    for (const [name] of this.graph.nodes) {
      inDegree.set(name, 0)
    }
    
    for (const [, edges] of this.graph.edges) {
      for (const target of edges) {
        inDegree.set(target, (inDegree.get(target) || 0) + 1)
      }
    }
    
    // 找出入度为 0 的节点
    for (const [name, degree] of inDegree) {
      if (degree === 0) {
        queue.push(name)
      }
    }
    
    // 执行拓扑排序
    while (queue.length > 0) {
      const current = queue.shift()!
      const node = this.graph.nodes.get(current)
      
      if (node) {
        sorted.push(node.plugin)
        
        // 更新相邻节点的入度
        const edges = this.graph.edges.get(current)
        if (edges) {
          for (const neighbor of edges) {
            const newDegree = (inDegree.get(neighbor) || 0) - 1
            inDegree.set(neighbor, newDegree)
            
            if (newDegree === 0) {
              queue.push(neighbor)
            }
          }
        }
      }
    }
    
    // 检查是否所有节点都被排序
    if (sorted.length !== this.graph.nodes.size) {
      this.logger?.error('Topological sort failed - graph has cycles or disconnected components')
      return null
    }
    
    return sorted
  }

  /**
   * 计算节点深度
   */
  private calculateDepth(): void {
    const visited = new Set<string>()
    
    const calculateNodeDepth = (nodeName: string): number => {
      if (visited.has(nodeName)) {
        const node = this.graph.nodes.get(nodeName)
        return node?.depth || 0
      }
      
      visited.add(nodeName)
      const node = this.graph.nodes.get(nodeName)
      if (!node) return 0
      
      let maxDepth = 0
      const edges = this.graph.edges.get(nodeName)
      
      if (edges) {
        for (const dep of edges) {
          const depthValue = calculateNodeDepth(dep) + 1
          maxDepth = Math.max(maxDepth, depthValue)
        }
      }
      
      node.depth = maxDepth
      return maxDepth
    }
    
    for (const nodeName of this.graph.nodes.keys()) {
      calculateNodeDepth(nodeName)
    }
  }

  /**
   * 检查缺失的依赖
   */
  private checkMissingDependencies(): void {
    for (const [, node] of this.graph.nodes) {
      for (const dep of node.dependencies) {
        if (!this.graph.nodes.has(dep.name)) {
          // 检查条件依赖
          if (dep.condition && !dep.condition()) {
            continue
          }
          
          if (dep.type === 'required') {
            this.missing.add(dep.name)
          }
        }
      }
    }
  }

  /**
   * 检查版本兼容性
   */
  private checkVersionCompatibility(plugins: Plugin[]): void {
    const pluginVersions = new Map<string, string>()
    
    // 收集插件版本
    for (const plugin of plugins) {
      pluginVersions.set(plugin.name, plugin.version || '0.0.0')
    }
    
    // 检查每个依赖的版本要求
    for (const [pluginName, node] of this.graph.nodes) {
      for (const dep of node.dependencies) {
        const depVersion = pluginVersions.get(dep.name)
        
        if (!depVersion) continue
        
        if (dep.version) {
          const compatible = this.isVersionCompatible(depVersion, dep.version)
          
          if (!compatible) {
            this.incompatible.push({
              plugin: pluginName,
              dependency: dep.name,
              reason: `Required ${this.formatVersionRequirement(dep.version)}, got ${depVersion}`
            })
          }
        }
      }
    }
  }

  /**
   * 检查版本兼容性
   */
  private isVersionCompatible(
    version: string, 
    requirement: string | VersionRange
  ): boolean {
    if (typeof requirement === 'string') {
      // 简单版本匹配
      if (requirement.startsWith('^')) {
        // 兼容主版本
        const reqMajor = requirement.slice(1).split('.')[0]
        const verMajor = version.split('.')[0]
        return reqMajor === verMajor
      } else if (requirement.startsWith('~')) {
        // 兼容次版本
        const reqParts = requirement.slice(1).split('.')
        const verParts = version.split('.')
        return reqParts[0] === verParts[0] && reqParts[1] === verParts[1]
      } else {
        // 精确匹配
        return version === requirement
      }
    } else {
      // 范围匹配
      const verParts = version.split('.').map(Number)
      
      if (requirement.exact) {
        return version === requirement.exact
      }
      
      if (requirement.min) {
        const minParts = requirement.min.split('.').map(Number)
        for (let i = 0; i < minParts.length; i++) {
          if ((verParts[i] || 0) < minParts[i]) return false
          if ((verParts[i] || 0) > minParts[i]) break
        }
      }
      
      if (requirement.max) {
        const maxParts = requirement.max.split('.').map(Number)
        for (let i = 0; i < maxParts.length; i++) {
          if ((verParts[i] || 0) > maxParts[i]) return false
          if ((verParts[i] || 0) < maxParts[i]) break
        }
      }
      
      return true
    }
  }

  /**
   * 格式化版本要求
   */
  private formatVersionRequirement(requirement: string | VersionRange): string {
    if (typeof requirement === 'string') {
      return requirement
    }
    
    if (requirement.exact) {
      return `= ${requirement.exact}`
    }
    
    const parts: string[] = []
    if (requirement.min) parts.push(`>= ${requirement.min}`)
    if (requirement.max) parts.push(`<= ${requirement.max}`)
    
    return parts.join(' and ')
  }

  /**
   * 检查是否只有可选依赖缺失
   */
  private hasOnlyOptionalMissing(): boolean {
    for (const missing of this.missing) {
      let isOptional = false
      
      for (const [, node] of this.graph.nodes) {
        const dep = node.dependencies.find(d => d.name === missing)
        if (dep && dep.type === 'optional') {
          isOptional = true
          break
        }
      }
      
      if (!isOptional) {
        return false
      }
    }
    
    return true
  }

  /**
   * 检查是否是可选依赖
   */
  private isOptionalDependency(plugin: string, dependency: string): boolean {
    if (!plugin) {
      // 检查所有插件
      for (const [, node] of this.graph.nodes) {
        const dep = node.dependencies.find(d => d.name === dependency)
        if (dep && dep.type === 'optional') {
          return true
        }
      }
      return false
    }
    
    const node = this.graph.nodes.get(plugin)
    if (!node) return false
    
    const dep = node.dependencies.find(d => d.name === dependency)
    return dep?.type === 'optional'
  }

  /**
   * 生成警告信息
   */
  private generateWarnings(): string[] {
    const warnings: string[] = []
    
    // 可选依赖缺失警告
    for (const missing of this.missing) {
      if (this.isOptionalDependency('', missing)) {
        warnings.push(`Optional dependency "${missing}" is not available`)
      }
    }
    
    // 版本兼容性警告
    for (const incomp of this.incompatible) {
      if (this.isOptionalDependency(incomp.plugin, incomp.dependency)) {
        warnings.push(
          `Optional dependency version mismatch: ${incomp.plugin} -> ${incomp.dependency}: ${incomp.reason}`
        )
      }
    }
    
    // 深度警告
    for (const [name, node] of this.graph.nodes) {
      if (node.depth > 5) {
        warnings.push(`Plugin "${name}" has a deep dependency chain (depth: ${node.depth})`)
      }
    }
    
    return warnings
  }

  /**
   * 获取依赖图的可视化表示
   */
  getVisualization(format: 'mermaid' | 'dot' | 'json' = 'json'): string {
    switch (format) {
      case 'mermaid':
        return this.toMermaid()
      case 'dot':
        return this.toDot()
      default:
        return this.toJson()
    }
  }

  /**
   * 转换为 Mermaid 图
   */
  private toMermaid(): string {
    const lines: string[] = ['graph TD']
    
    for (const [from, edges] of this.graph.edges) {
      for (const to of edges) {
        const fromNode = this.graph.nodes.get(from)
        const dep = fromNode?.dependencies.find(d => d.name === to)
        const style = dep?.type === 'optional' ? '-.->|optional|' : '-->'
        lines.push(`  ${from}${style}${to}`)
      }
    }
    
    // 标记缺失的依赖
    for (const missing of this.missing) {
      lines.push(`  ${missing}[${missing} - MISSING]`)
      lines.push(`  style ${missing} fill:#f96`)
    }
    
    return lines.join('\n')
  }

  /**
   * 转换为 DOT 图
   */
  private toDot(): string {
    const lines: string[] = ['digraph Dependencies {']
    
    for (const [from, edges] of this.graph.edges) {
      for (const to of edges) {
        const fromNode = this.graph.nodes.get(from)
        const dep = fromNode?.dependencies.find(d => d.name === to)
        const style = dep?.type === 'optional' ? 'style=dashed' : ''
        lines.push(`  "${from}" -> "${to}" [${style}];`)
      }
    }
    
    // 标记缺失的依赖
    for (const missing of this.missing) {
      lines.push(`  "${missing}" [style=filled,fillcolor=red,label="${missing} (MISSING)"];`)
    }
    
    lines.push('}')
    return lines.join('\n')
  }

  /**
   * 转换为 JSON
   */
  private toJson(): string {
    const result = {
      nodes: Array.from(this.graph.nodes.entries()).map(([name, node]) => ({
        name,
        version: node.plugin.version,
        depth: node.depth,
        dependencies: node.dependencies,
        dependents: Array.from(node.dependents)
      })),
      edges: Array.from(this.graph.edges.entries()).map(([from, tos]) => ({
        from,
        to: Array.from(tos)
      })),
      roots: Array.from(this.graph.roots),
      leaves: Array.from(this.graph.leaves),
      cycles: this.cycles,
      missing: Array.from(this.missing),
      incompatible: this.incompatible
    }
    
    return JSON.stringify(result, null, 2)
  }

  /**
   * 重置解析器状态
   */
  private reset(): void {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      roots: new Set(),
      leaves: new Set()
    }
    this.cycles = []
    this.missing = new Set()
    this.incompatible = []
  }
}

/**
 * 创建依赖解析器实例
 */
export function createDependencyResolver(logger?: Logger): DependencyResolver {
  return new DependencyResolver(logger)
}