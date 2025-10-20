/**
 * @ldesign/router 路由版本控制系统
 *
 * 提供路由配置的版本管理、备份和回滚功能
 */

import type { Router, RouteRecordRaw } from '../types'
import { reactive } from 'vue'

// ==================== 类型定义 ====================

/**
 * 路由版本快照
 */
export interface RouteVersion {
  /** 版本ID */
  id: string
  /** 版本名称 */
  name: string
  /** 版本描述 */
  description?: string
  /** 创建时间 */
  createdAt: Date
  /** 路由配置快照 */
  routes: RouteRecordRaw[]
  /** 元数据 */
  metadata?: {
    /** 路由数量 */
    routeCount: number
    /** 动态路由数量 */
    dynamicRouteCount: number
    /** 嵌套深度 */
    maxDepth: number
    /** 创建者 */
    author?: string
    /** 标签 */
    tags?: string[]
  }
}

/**
 * 版本比较结果
 */
export interface VersionDiff {
  /** 新增的路由 */
  added: RouteRecordRaw[]
  /** 删除的路由 */
  removed: RouteRecordRaw[]
  /** 修改的路由 */
  modified: Array<{
    before: RouteRecordRaw
    after: RouteRecordRaw
    changes: string[]
  }>
  /** 总变更数 */
  totalChanges: number
}

/**
 * 版本控制配置
 */
export interface VersionControlConfig {
  /** 最大版本数量 */
  maxVersions?: number
  /** 是否自动创建版本 */
  autoSave?: boolean
  /** 自动保存间隔（毫秒） */
  autoSaveInterval?: number
  /** 是否启用压缩 */
  compression?: boolean
  /** 存储策略 */
  storage?: 'memory' | 'localStorage' | 'indexedDB'
}

// ==================== 路由版本控制器 ====================

/**
 * 路由版本控制管理器
 */
export class RouteVersionControl {
  private router: Router
  private versions: Map<string, RouteVersion> = new Map()
  private currentVersionId: string | null = null
  private config: Required<VersionControlConfig>
  private autoSaveTimer?: number

  // 响应式状态
  public state: {
    versions: RouteVersion[]
    currentVersion: RouteVersion | null
    isDirty: boolean
    isLoading: boolean
  } = reactive({
    versions: [] as RouteVersion[],
    currentVersion: null as RouteVersion | null,
    isDirty: false,
    isLoading: false,
  })

  constructor(router: Router, config?: VersionControlConfig) {
    this.router = router
    this.config = {
      maxVersions: 20,
      autoSave: false,
      autoSaveInterval: 5 * 60 * 1000, // 5分钟
      compression: true,
      storage: 'memory',
      ...config,
    }

    // 初始化
    this.initialize()
  }

  /**
   * 初始化版本控制
   */
  private async initialize(): Promise<void> {
    // 加载已保存的版本
    await this.loadVersions()

    // 创建初始版本
    if (this.versions.size === 0) {
      await this.createVersion('initial', 'Initial route configuration')
    }

    // 设置自动保存
    if (this.config?.autoSave) {
      this.startAutoSave()
    }

    // 监听路由变化
    this.watchRouteChanges()
  }

  /**
   * 创建新版本
   */
  async createVersion(name: string, description?: string): Promise<RouteVersion> {
    const id = this.generateVersionId()
    const routes = this.captureCurrentRoutes()

    const version: RouteVersion = {
      id,
      name,
      description,
      createdAt: new Date(),
      routes: this.config?.compression ? this.compressRoutes(routes) : routes,
      metadata: this.analyzeRoutes(routes),
    }

    // 检查版本限制
    if (this.versions.size >= this.config?.maxVersions) {
      this.removeOldestVersion()
    }

    this.versions.set(id, version)
    this.currentVersionId = id

    // 更新状态
    this.updateState()

    // 保存到存储
    await this.saveVersion(version)

    this.state.isDirty = false

    return version
  }

  /**
   * 恢复到指定版本
   */
  async restoreVersion(versionId: string): Promise<boolean> {
    const version = this.versions.get(versionId)
    if (!version) {
      console.error(`Version ${versionId} not found`)
      return false
    }

    this.state.isLoading = true

    try {
      const routes = this.config?.compression
        ? this.decompressRoutes(version.routes)
        : version.routes

      // 清除现有路由
      this.clearCurrentRoutes()

      // 添加版本中的路由
      for (const route of routes) {
        this.router.addRoute(route)
      }

      this.currentVersionId = versionId
      this.updateState()
      this.state.isDirty = false

      return true
    }
    catch (error) {
      console.error('Failed to restore version:', error)
      return false
    }
    finally {
      this.state.isLoading = false
    }
  }

  /**
   * 删除版本
   */
  async deleteVersion(versionId: string): Promise<boolean> {
    if (versionId === this.currentVersionId) {
      console.error('Cannot delete current version')
      return false
    }

    const deleted = this.versions.delete(versionId)

    if (deleted) {
      await this.removeFromStorage(versionId)
      this.updateState()
    }

    return deleted
  }

  /**
   * 比较两个版本
   */
  compareVersions(versionId1: string, versionId2: string): VersionDiff | null {
    const version1 = this.versions.get(versionId1)
    const version2 = this.versions.get(versionId2)

    if (!version1 || !version2) {
      return null
    }

    const routes1 = this.config?.compression
      ? this.decompressRoutes(version1.routes)
      : version1.routes
    const routes2 = this.config?.compression
      ? this.decompressRoutes(version2.routes)
      : version2.routes

    return this.diffRoutes(routes1, routes2)
  }

  /**
   * 获取版本历史
   */
  getVersionHistory(): RouteVersion[] {
    return Array.from(this.versions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(): RouteVersion | null {
    if (!this.currentVersionId)
      return null
    return this.versions.get(this.currentVersionId) || null
  }

  /**
   * 导出版本
   */
  exportVersion(versionId: string): string | null {
    const version = this.versions.get(versionId)
    if (!version)
      return null

    return JSON.stringify(version, null, 2)
  }

  /**
   * 导入版本
   */
  async importVersion(data: string): Promise<boolean> {
    try {
      const version: RouteVersion = JSON.parse(data)

      // 验证版本格式
      if (!this.validateVersion(version)) {
        throw new Error('Invalid version format')
      }

      // 生成新ID避免冲突
      version.id = this.generateVersionId()
      version.createdAt = new Date(version.createdAt)

      this.versions.set(version.id, version)
      await this.saveVersion(version)
      this.updateState()

      return true
    }
    catch (error) {
      console.error('Failed to import version:', error)
      return false
    }
  }

  /**
   * 创建分支版本
   */
  async createBranch(
    baseVersionId: string,
    branchName: string,
  ): Promise<RouteVersion | null> {
    const baseVersion = this.versions.get(baseVersionId)
    if (!baseVersion)
      return null

    const branchVersion: RouteVersion = {
      ...baseVersion,
      id: this.generateVersionId(),
      name: branchName,
      description: `Branch from ${baseVersion.name}`,
      createdAt: new Date(),
    }

    this.versions.set(branchVersion.id, branchVersion)
    await this.saveVersion(branchVersion)
    this.updateState()

    return branchVersion
  }

  /**
   * 合并版本
   */
  async mergeVersions(
    sourceId: string,
    targetId: string,
    strategy: 'override' | 'merge' = 'merge',
  ): Promise<RouteVersion | null> {
    const source = this.versions.get(sourceId)
    const target = this.versions.get(targetId)

    if (!source || !target)
      return null

    const sourceRoutes = this.config?.compression
      ? this.decompressRoutes(source.routes)
      : source.routes
    const targetRoutes = this.config?.compression
      ? this.decompressRoutes(target.routes)
      : target.routes

    let mergedRoutes: RouteRecordRaw[]

    if (strategy === 'override') {
      mergedRoutes = sourceRoutes
    }
    else {
      mergedRoutes = this.mergeRoutes(targetRoutes, sourceRoutes)
    }

    const mergedVersion: RouteVersion = {
      id: this.generateVersionId(),
      name: `Merge: ${source.name} -> ${target.name}`,
      description: `Merged ${source.name} into ${target.name}`,
      createdAt: new Date(),
      routes: this.config?.compression ? this.compressRoutes(mergedRoutes) : mergedRoutes,
      metadata: this.analyzeRoutes(mergedRoutes),
    }

    this.versions.set(mergedVersion.id, mergedVersion)
    await this.saveVersion(mergedVersion)
    this.updateState()

    return mergedVersion
  }

  // ==================== 私有方法 ====================

  /**
   * 生成版本ID
   */
  private generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 捕获当前路由配置
   */
  private captureCurrentRoutes(): RouteRecordRaw[] {
    return this.router.getRoutes().map(route => this.routeToRaw(route))
  }

  /**
   * 将路由记录转换为原始格式
   */
  private routeToRaw(route: any): RouteRecordRaw {
    return {
      path: route.path,
      name: route.name,
      component: route.component,
      meta: route.meta,
      props: route.props,
      children: route.children?.map((child: any) => this.routeToRaw(child)),
    }
  }

  /**
   * 清除当前路由
   */
  private clearCurrentRoutes(): void {
    const routes = this.router.getRoutes()
    routes.forEach((route) => {
      if (route.name) {
        this.router.removeRoute(route.name)
      }
    })
  }

  /**
   * 分析路由配置
   */
  private analyzeRoutes(routes: RouteRecordRaw[]): RouteVersion['metadata'] {
    let dynamicCount = 0
    let maxDepth = 0

    const analyze = (route: RouteRecordRaw, depth = 0) => {
      if (route.path.includes(':') || route.path.includes('*')) {
        dynamicCount++
      }
      maxDepth = Math.max(maxDepth, depth)

      route.children?.forEach(child => analyze(child, depth + 1))
    }

    routes.forEach(route => analyze(route))

    return {
      routeCount: routes.length,
      dynamicRouteCount: dynamicCount,
      maxDepth,
    }
  }

  /**
   * 比较路由差异
   */
  private diffRoutes(routes1: RouteRecordRaw[], routes2: RouteRecordRaw[]): VersionDiff {
    const map1 = new Map(routes1.map(r => [r.path, r]))
    const map2 = new Map(routes2.map(r => [r.path, r]))

    const added: RouteRecordRaw[] = []
    const removed: RouteRecordRaw[] = []
    const modified: VersionDiff['modified'] = []

    // 查找新增和修改的路由
    for (const [path, route] of map2) {
      if (!map1.has(path)) {
        added.push(route)
      }
      else {
        const oldRoute = map1.get(path)!
        const changes = this.detectChanges(oldRoute, route)
        if (changes.length > 0) {
          modified.push({
            before: oldRoute,
            after: route,
            changes,
          })
        }
      }
    }

    // 查找删除的路由
    for (const [path, route] of map1) {
      if (!map2.has(path)) {
        removed.push(route)
      }
    }

    return {
      added,
      removed,
      modified,
      totalChanges: added.length + removed.length + modified.length,
    }
  }

  /**
   * 检测路由变化
   */
  private detectChanges(route1: RouteRecordRaw, route2: RouteRecordRaw): string[] {
    const changes: string[] = []

    if (route1.name !== route2.name) {
      changes.push(`name: ${String(route1.name)} -> ${String(route2.name)}`)
    }
    if (JSON.stringify(route1.meta) !== JSON.stringify(route2.meta)) {
      changes.push('meta changed')
    }
    if (JSON.stringify(route1.props) !== JSON.stringify(route2.props)) {
      changes.push('props changed')
    }
    if (route1.component !== route2.component) {
      changes.push('component changed')
    }

    return changes
  }

  /**
   * 合并路由
   */
  private mergeRoutes(
    target: RouteRecordRaw[],
    source: RouteRecordRaw[],
  ): RouteRecordRaw[] {
    const merged = [...target]
    const targetPaths = new Set(target.map(r => r.path))

    for (const route of source) {
      if (!targetPaths.has(route.path)) {
        merged.push(route)
      }
    }

    return merged
  }

  /**
   * 压缩路由（简单实现）
   */
  private compressRoutes(routes: RouteRecordRaw[]): any {
    // 在实际实现中，可以使用更高效的压缩算法
    return routes
  }

  /**
   * 解压路由
   */
  private decompressRoutes(compressed: any): RouteRecordRaw[] {
    return compressed as RouteRecordRaw[]
  }

  /**
   * 监听路由变化
   */
  private watchRouteChanges(): void {
    this.router.afterEach(() => {
      this.state.isDirty = true
    })
  }

  /**
   * 开始自动保存
   */
  private startAutoSave(): void {
    this.autoSaveTimer = window.setInterval(() => {
      if (this.state.isDirty) {
        this.createVersion(
          `auto_${new Date().toISOString()}`,
          'Auto-saved version',
        )
      }
    }, this.config?.autoSaveInterval)
  }

  /**
   * 停止自动保存
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = undefined
    }
  }

  /**
   * 更新响应式状态
   */
  private updateState(): void {
    this.state.versions = this.getVersionHistory()
    this.state.currentVersion = this.getCurrentVersion()
  }

  /**
   * 移除最旧的版本
   */
  private removeOldestVersion(): void {
    const versions = this.getVersionHistory()
    if (versions.length > 0) {
      const oldest = versions[versions.length - 1]
      if (oldest) this.deleteVersion(oldest.id)
    }
  }

  /**
   * 验证版本格式
   */
  private validateVersion(version: any): boolean {
    return (
      version
      && typeof version.id === 'string'
      && typeof version.name === 'string'
      && Array.isArray(version.routes)
    )
  }

  // ==================== 存储相关方法 ====================

  /**
   * 加载版本
   */
  private async loadVersions(): Promise<void> {
    if (this.config?.storage === 'localStorage') {
      const data = localStorage.getItem('router_versions')
      if (data) {
        try {
          const versions: RouteVersion[] = JSON.parse(data)
          versions.forEach((v) => {
            v.createdAt = new Date(v.createdAt)
            this.versions.set(v.id, v)
          })
        }
        catch (error) {
          console.error('Failed to load versions:', error)
        }
      }
    }
    // 其他存储策略的实现...
  }

  /**
   * 保存版本
   */
  private async saveVersion(_version: RouteVersion): Promise<void> {
    if (this.config?.storage === 'localStorage') {
      const versions = Array.from(this.versions.values())
      localStorage.setItem('router_versions', JSON.stringify(versions))
    }
    // 其他存储策略的实现...
  }

  /**
   * 从存储中删除版本
   */
  private async removeFromStorage(versionId: string): Promise<void> {
    if (this.config?.storage === 'localStorage') {
      const versions = Array.from(this.versions.values())
        .filter(v => v.id !== versionId)
      localStorage.setItem('router_versions', JSON.stringify(versions))
    }
    // 其他存储策略的实现...
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopAutoSave()
    this.versions.clear()
  }
}

// ==================== 导出便捷函数 ====================

let defaultVersionControl: RouteVersionControl | null = null

/**
 * 设置路由版本控制
 */
export function setupRouteVersionControl(
  router: Router,
  config?: VersionControlConfig,
): RouteVersionControl {
  if (!defaultVersionControl) {
    defaultVersionControl = new RouteVersionControl(router, config)
  }
  return defaultVersionControl
}

/**
 * 获取版本控制实例
 */
export function getVersionControl(): RouteVersionControl | null {
  return defaultVersionControl
}

/**
 * 快速创建版本
 */
export async function createRouteVersion(name: string, description?: string): Promise<RouteVersion | null> {
  if (!defaultVersionControl) {
    console.error('Route version control not initialized')
    return null
  }
  return defaultVersionControl.createVersion(name, description)
}

/**
 * 快速恢复版本
 */
export async function restoreRouteVersion(versionId: string): Promise<boolean> {
  if (!defaultVersionControl) {
    console.error('Route version control not initialized')
    return false
  }
  return defaultVersionControl.restoreVersion(versionId)
}
