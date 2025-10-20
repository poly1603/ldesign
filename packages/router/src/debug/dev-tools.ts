/**
 * @ldesign/router 开发工具增强
 *
 * 提供更强大的开发调试和分析工具
 */

import type { RouteLocationNormalized, Router, RouteRecordRaw } from '../types'
import { codeQualityChecker } from '../utils/code-quality'
// 性能统计功能已移动到其他模块

/**
 * 开发工具配置
 */
export interface DevToolsConfig {
  /** 是否启用开发工具 */
  enabled: boolean
  /** 热键配置 */
  hotkeys: {
    toggle: string
    inspect: string
    performance: string
    quality: string
  }
  /** 面板配置 */
  panel: {
    position: 'top' | 'bottom' | 'left' | 'right'
    size: number
    theme: 'light' | 'dark' | 'auto'
  }
  /** 功能开关 */
  features: {
    routeInspector: boolean
    performanceMonitor: boolean
    qualityChecker: boolean
    networkTracker: boolean
    stateViewer: boolean
  }
}

/**
 * 路由检查器
 */
export class RouteInspector {
  private router: Router
  private highlightedElement: HTMLElement | null = null

  constructor(router: Router) {
    this.router = router
  }

  /**
   * 检查当前路由
   */
  inspectCurrentRoute(): RouteInspectionResult {
    const currentRoute = this.router.currentRoute.value
    return this.inspectRoute(currentRoute)
  }

  /**
   * 检查指定路由
   */
  inspectRoute(route: RouteLocationNormalized): RouteInspectionResult {
    return {
      route: {
        path: route.path,
        name: route.name ? String(route.name) : undefined,
        params: route.params,
        query: route.query,
        meta: route.meta,
        matched: route.matched.map(record => ({
          path: record.path,
          name: record.name ? String(record.name) : undefined,
          component: record.components?.default?.name || 'Anonymous',
        })),
      },
      performance: this.analyzeRoutePerformance(route),
      accessibility: this.checkAccessibility(route),
      seo: this.checkSEO(route),
      security: this.checkSecurity(route),
    }
  }

  /**
   * 分析路由性能
   */
  private analyzeRoutePerformance(_route: RouteLocationNormalized) {
    return {
      loadTime: performance.now(), // 简化实现
      cacheHit: false, // 简化实现
      componentSize: 'Unknown', // 需要实际测量
      recommendations: [
        '考虑使用路由懒加载',
        '启用组件缓存',
        '优化组件大小',
      ],
    }
  }

  /**
   * 检查无障碍访问
   */
  private checkAccessibility(route: RouteLocationNormalized) {
    const issues: string[] = []

    if (!route.meta?.title) {
      issues.push('缺少页面标题')
    }

    if (!route.meta?.description) {
      issues.push('缺少页面描述')
    }

    return {
      score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 25),
      issues,
      suggestions: [
        '添加页面标题和描述',
        '确保键盘导航可用',
        '检查颜色对比度',
      ],
    }
  }

  /**
   * 检查SEO
   */
  private checkSEO(route: RouteLocationNormalized) {
    const issues: string[] = []

    if (!route.meta?.title) {
      issues.push('缺少页面标题')
    }

    if (!route.meta?.description) {
      issues.push('缺少meta描述')
    }

    if (!route.meta?.keywords) {
      issues.push('缺少关键词')
    }

    return {
      score: Math.max(0, 100 - issues.length * 20),
      issues,
      suggestions: [
        '添加页面标题和描述',
        '设置合适的关键词',
        '优化URL结构',
      ],
    }
  }

  /**
   * 检查安全性
   */
  private checkSecurity(route: RouteLocationNormalized) {
    const issues: string[] = []

    // 检查是否需要认证
    if (route.meta?.requiresAuth && !route.meta?.auth) {
      issues.push('需要认证但未配置认证检查')
    }

    // 检查权限配置
    if (route.meta?.roles && !Array.isArray(route.meta.roles)) {
      issues.push('角色配置格式错误')
    }

    return {
      score: Math.max(0, 100 - issues.length * 30),
      issues,
      suggestions: [
        '配置适当的认证检查',
        '设置角色权限',
        '验证输入参数',
      ],
    }
  }

  /**
   * 高亮路由元素
   */
  highlightRouteElement(selector: string): void {
    this.clearHighlight()

    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.style.outline = '2px solid #007acc'
      element.style.outlineOffset = '2px'
      this.highlightedElement = element
    }
  }

  /**
   * 清除高亮
   */
  clearHighlight(): void {
    if (this.highlightedElement) {
      this.highlightedElement.style.outline = ''
      this.highlightedElement.style.outlineOffset = ''
      this.highlightedElement = null
    }
  }
}

/**
 * 路由检查结果
 */
export interface RouteInspectionResult {
  route: {
    path: string
    name?: string
    params: Record<string, any>
    query: Record<string, any>
    meta: Record<string, any>
    matched: Array<{
      path: string
      name?: string
      component: string
    }>
  }
  performance: {
    loadTime: number
    cacheHit: boolean
    componentSize: string
    recommendations: string[]
  }
  accessibility: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  seo: {
    score: number
    issues: string[]
    suggestions: string[]
  }
  security: {
    score: number
    issues: string[]
    suggestions: string[]
  }
}

/**
 * 开发工具面板
 */
export class DevToolsPanel {
  private container: HTMLElement | null = null
  private isVisible = false
  private config: DevToolsConfig
  // Router reference removed
  private inspector: RouteInspector

  constructor(router: Router, config: Partial<DevToolsConfig> = {}) {
    this.inspector = new RouteInspector(router)
    this.config = {
      enabled: true,
      hotkeys: {
        toggle: 'Ctrl+Shift+D',
        inspect: 'Ctrl+Shift+I',
        performance: 'Ctrl+Shift+P',
        quality: 'Ctrl+Shift+Q',
      },
      panel: {
        position: 'bottom',
        size: 300,
        theme: 'auto',
      },
      features: {
        routeInspector: true,
        performanceMonitor: true,
        qualityChecker: true,
        networkTracker: true,
        stateViewer: true,
      },
      ...config,
    }

    if (this.config?.enabled) {
      this.init()
    }
  }

  /**
   * 初始化开发工具
   */
  private init(): void {
    this.setupHotkeys()
    this.createPanel()
  }

  /**
   * 设置热键
   */
  private setupHotkeys(): void {
    document.addEventListener('keydown', (event) => {
      if (this.matchHotkey(event, this.config?.hotkeys.toggle)) {
        this.toggle()
      }
      else if (this.matchHotkey(event, this.config?.hotkeys.inspect)) {
        this.showInspector()
      }
      else if (this.matchHotkey(event, this.config?.hotkeys.performance)) {
        this.showPerformance()
      }
      else if (this.matchHotkey(event, this.config?.hotkeys.quality)) {
        this.showQuality()
      }
    })
  }

  /**
   * 匹配热键
   */
  private matchHotkey(event: KeyboardEvent, hotkey: string): boolean {
    const keys = hotkey.split('+').map(k => k.trim().toLowerCase())
    const pressed: string[] = []

    if (event.ctrlKey)
      pressed.push('ctrl')
    if (event.shiftKey)
      pressed.push('shift')
    if (event.altKey)
      pressed.push('alt')
    if (event.metaKey)
      pressed.push('meta')
    pressed.push(event.key.toLowerCase())

    return keys.every(key => pressed.includes(key)) && keys.length === pressed.length
  }

  /**
   * 创建面板
   */
  private createPanel(): void {
    this.container = document.createElement('div')
    this.container.id = 'ldesign-router-devtools'
    this.container.style.cssText = `
      position: fixed;
      ${this.config?.panel.position}: 0;
      left: 0;
      right: 0;
      height: ${this.config?.panel.size}px;
      background: #1e1e1e;
      color: #fff;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      z-index: 999999;
      border-top: 1px solid #333;
      display: none;
      overflow: auto;
    `

    document.body.appendChild(this.container)
  }

  /**
   * 切换面板显示
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide()
    }
    else {
      this.show()
    }
  }

  /**
   * 显示面板
   */
  show(): void {
    if (this.container) {
      this.container.style.display = 'block'
      this.isVisible = true
      this.render()
    }
  }

  /**
   * 隐藏面板
   */
  hide(): void {
    if (this.container) {
      this.container.style.display = 'none'
      this.isVisible = false
    }
  }

  /**
   * 显示路由检查器
   */
  showInspector(): void {
    this.show()
    const result = this.inspector.inspectCurrentRoute()
    this.renderInspector(result)
  }

  /**
   * 显示性能监控
   */
  showPerformance(): void {
    this.show()
    // TODO: 实现性能统计
    const stats = {
      avgLoadTime: 0,
      slowestRoutes: [],
      totalNavigations: 0,
      cacheHitRate: 0
    }
    this.renderPerformance(stats)
  }

  /**
   * 显示质量检查
   */
  showQuality(): void {
    this.show()
    const routes = this.getAllRoutes()
    const issues = codeQualityChecker.check({ routes })
    this.renderQuality(issues)
  }

  /**
   * 获取所有路由
   */
  private getAllRoutes(): RouteRecordRaw[] {
    // 这里需要从路由器中获取所有路由配置
    // 简化实现
    return []
  }

  /**
   * 渲染面板内容
   */
  private render(): void {
    if (!this.container)
      return

    this.container.innerHTML = `
      <div style="padding: 10px; border-bottom: 1px solid #333;">
        <h3 style="margin: 0; color: #007acc;">LDesign Router DevTools</h3>
        <div style="margin-top: 5px;">
          <button onclick="window.ldesignRouterDevTools.showInspector()" style="margin-right: 10px;">检查器</button>
          <button onclick="window.ldesignRouterDevTools.showPerformance()" style="margin-right: 10px;">性能</button>
          <button onclick="window.ldesignRouterDevTools.showQuality()" style="margin-right: 10px;">质量</button>
        </div>
      </div>
      <div id="devtools-content" style="padding: 10px;"></div>
    `

    // 暴露到全局以便按钮调用
    ;(window as any).ldesignRouterDevTools = this
  }

  /**
   * 渲染检查器结果
   */
  private renderInspector(result: RouteInspectionResult): void {
    const content = document.getElementById('devtools-content')
    if (!content)
      return

    content.innerHTML = `
      <h4>路由检查结果</h4>
      <div><strong>路径:</strong> ${result.route.path}</div>
      <div><strong>名称:</strong> ${result.route.name || 'N/A'}</div>
      <div><strong>性能评分:</strong> ${result.performance.cacheHit ? '良好' : '需优化'}</div>
      <div><strong>无障碍评分:</strong> ${result.accessibility.score}/100</div>
      <div><strong>SEO评分:</strong> ${result.seo.score}/100</div>
      <div><strong>安全评分:</strong> ${result.security.score}/100</div>
    `
  }

  /**
   * 渲染性能数据
   */
  private renderPerformance(stats: any): void {
    const content = document.getElementById('devtools-content')
    if (!content)
      return

    content.innerHTML = `
      <h4>性能监控</h4>
      <div><strong>缓存命中率:</strong> ${(stats.monitor.hitRate * 100).toFixed(2)}%</div>
      <div><strong>缓存大小:</strong> ${stats.memory.cacheSize}</div>
      <div><strong>内存使用率:</strong> ${(stats.memory.usageRatio * 100).toFixed(2)}%</div>
    `
  }

  /**
   * 渲染质量检查结果
   */
  private renderQuality(issues: any[]): void {
    const content = document.getElementById('devtools-content')
    if (!content)
      return

    content.innerHTML = `
      <h4>代码质量检查</h4>
      <div><strong>问题总数:</strong> ${issues.length}</div>
      ${issues.map(issue => `
        <div style="margin: 5px 0; padding: 5px; background: #333;">
          <div><strong>${issue.severity}:</strong> ${issue.message}</div>
          <div style="font-size: 11px; color: #ccc;">${issue.suggestion}</div>
        </div>
      `).join('')}
    `
  }

  /**
   * 销毁开发工具
   */
  destroy(): void {
    if (this.container) {
      document.body.removeChild(this.container)
      this.container = null
    }
    this.inspector.clearHighlight()
  }
}

// 导出开发工具创建函数
export function createDevTools(router: Router, config?: Partial<DevToolsConfig>): DevToolsPanel {
  return new DevToolsPanel(router, config)
}
