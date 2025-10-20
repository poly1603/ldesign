import type { Logger } from '../types'

// 管理器初始化状态
export interface ManagerStatus {
  name: string
  initialized: boolean
  initTime?: number
  dependencies: string[]
  dependents: string[]
  lazy: boolean
  error?: Error
}

// 管理器注册表
export class ManagerRegistry {
  private managers = new Map<string, ManagerStatus>()
  private initOrder: string[] = []
  private logger?: Logger

  constructor(logger?: Logger) {
    this.logger = logger
  }

  // 注册管理器
  register(name: string, dependencies: string[] = [], lazy = false): void {
    if (this.managers.has(name)) {
      this.logger?.warn(`Manager "${name}" already registered`)
      return
    }

    const status: ManagerStatus = {
      name,
      initialized: false,
      dependencies,
      dependents: [],
      lazy,
    }

    this.managers.set(name, status)

    // 更新依赖关系
    dependencies.forEach(dep => {
      const depStatus = this.managers.get(dep)
      if (depStatus) {
        depStatus.dependents.push(name)
      }
    })

    this.logger?.debug(`Manager "${name}" registered`, {
      dependencies,
      lazy,
    })
  }

  // 标记管理器为已初始化
  markInitialized(name: string, error?: Error): void {
    const status = this.managers.get(name)
    if (!status) {
      this.logger?.warn(`Manager "${name}" not found in registry`)
      return
    }

    status.initialized = !error
    status.initTime = Date.now()
    status.error = error

    if (!error) {
      this.initOrder.push(name)
      this.logger?.debug(`Manager "${name}" initialized successfully`)
    } else {
      this.logger?.error(`Manager "${name}" initialization failed`, error)
    }
  }

  // 检查依赖是否满足
  checkDependencies(name: string): { satisfied: boolean; missing: string[] } {
    const status = this.managers.get(name)
    if (!status) {
      return { satisfied: false, missing: [name] }
    }

    const missing: string[] = []
    for (const dep of status.dependencies) {
      const depStatus = this.managers.get(dep)
      if (!depStatus || !depStatus.initialized) {
        missing.push(dep)
      }
    }

    return {
      satisfied: missing.length === 0,
      missing,
    }
  }

  // 获取初始化顺序建议
  getInitializationOrder(): string[] {
    const order: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string): void => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving "${name}"`)
      }

      visiting.add(name)
      const status = this.managers.get(name)
      if (status && !status.lazy) {
        // 先访问依赖
        status.dependencies.forEach(dep => {
          const depStatus = this.managers.get(dep)
          if (depStatus && !depStatus.lazy) {
            visit(dep)
          }
        })
        order.push(name)
      }
      visiting.delete(name)
      visited.add(name)
    }

    // 访问所有非懒加载的管理器
    for (const [name, status] of this.managers) {
      if (!status.lazy) {
        visit(name)
      }
    }

    return order
  }

  // 获取管理器状态
  getStatus(name: string): ManagerStatus | undefined {
    return this.managers.get(name)
  }

  // 获取所有管理器状态
  getAllStatus(): ManagerStatus[] {
    return Array.from(this.managers.values())
  }

  // 获取初始化统计
  getInitializationStats(): {
    total: number
    initialized: number
    failed: number
    lazy: number
    initOrder: string[]
    averageInitTime: number
  } {
    const all = this.getAllStatus()
    const initialized = all.filter(s => s.initialized)
    const failed = all.filter(s => s.error)
    const lazy = all.filter(s => s.lazy)

    const initTimes = initialized
      .map(s => s.initTime)
      .filter(t => t !== undefined) as number[]

    const averageInitTime =
      initTimes.length > 0
        ? initTimes.reduce((sum, time) => sum + time, 0) / initTimes.length
        : 0

    return {
      total: all.length,
      initialized: initialized.length,
      failed: failed.length,
      lazy: lazy.length,
      initOrder: [...this.initOrder],
      averageInitTime,
    }
  }

  /**
   * 验证依赖关系图的完整性
   */
  validateDependencyGraph(): {
    valid: boolean
    errors: string[]
    warnings?: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查循环依赖
    try {
      this.getInitializationOrder()
    } catch (error) {
      errors.push((error as Error).message)
    }

    // 检查缺失的依赖
    for (const [name, status] of this.managers) {
      for (const dep of status.dependencies) {
        if (!this.managers.has(dep)) {
          errors.push(`Manager "${name}" depends on missing manager "${dep}"`)
        }
      }
    }

    // 检查孤立的管理器
    for (const [name, status] of this.managers) {
      if (status.dependencies.length === 0 && status.dependents.length === 0) {
        warnings.push(`Manager "${name}" has no dependencies or dependents`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // 生成依赖图的可视化表示
  generateDependencyGraph(): string {
    let graph = 'digraph ManagerDependencies {\n'
    graph += '  rankdir=TB;\n'
    graph += '  node [shape=box];\n\n'

    // 添加节点
    for (const [name, status] of this.managers) {
      const color = status.lazy ? 'lightblue' : 'lightgreen'
      const style = status.initialized ? 'solid' : 'dashed'
      graph += `  "${name}" [fillcolor=${color}, style="filled, ${style}"];\n`
    }

    graph += '\n'

    // 添加边
    for (const [name, status] of this.managers) {
      for (const dep of status.dependencies) {
        graph += `  "${dep}" -> "${name}";\n`
      }
    }

    graph += '}\n'
    return graph
  }

  // 清理注册表
  clear(): void {
    this.managers.clear()
    this.initOrder = []
    this.logger?.debug('Manager registry cleared')
  }
}

// 全局管理器注册表实例
let globalRegistry: ManagerRegistry | undefined

export function getGlobalManagerRegistry(): ManagerRegistry {
  if (!globalRegistry) {
    globalRegistry = new ManagerRegistry()
  }
  return globalRegistry
}

export function setGlobalManagerRegistry(registry: ManagerRegistry): void {
  globalRegistry = registry
}

// 管理器装饰器，用于自动注册
export function Manager(
  name: string,
  dependencies: string[] = [],
  lazy = false
) {
   
  return function <T extends new (...args: any[]) => object>(constructor: T) {
    const registry = getGlobalManagerRegistry()
    registry.register(name, dependencies, lazy)

    return class extends constructor {
       
      constructor(...args: any[]) {
        super(...args)
        registry.markInitialized(name)
      }
    }
  }
}
