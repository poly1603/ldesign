/**
 * 性能分析仪表板
 * 📊 提供可视化的性能监控和分析界面
 */

import type { Engine } from '../types/engine'
import type { PerformanceManager } from './performance-manager'

export interface DashboardOptions {
  /** 是否启用仪表板 */
  enabled?: boolean
  /** 仪表板位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'floating'
  /** 初始是否折叠 */
  collapsed?: boolean
  /** 是否显示FPS */
  showFPS?: boolean
  /** 是否显示内存使用 */
  showMemory?: boolean
  /** 是否显示网络请求 */
  showNetwork?: boolean
  /** 是否显示组件渲染 */
  showComponents?: boolean
  /** 更新间隔(ms) */
  updateInterval?: number
  /** 自定义样式 */
  customStyles?: string
  /** 主题 */
  theme?: 'light' | 'dark' | 'auto'
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可调整大小 */
  resizable?: boolean
}

export interface PerformanceMetrics {
  /** FPS指标 */
  fps: {
    current: number
    avg: number
    min: number
    max: number
    history: number[]
  }
  /** 内存指标 */
  memory: {
    used: number
    limit: number
    percent: number
    history: number[]
  }
  /** 网络指标 */
  network: {
    requests: number
    totalSize: number
    avgLatency: number
    failedRequests: number
    pendingRequests: number
  }
  /** 组件指标 */
  components: {
    totalRenders: number
    avgRenderTime: number
    slowComponents: Array<{
      name: string
      renderTime: number
      count: number
    }>
  }
  /** 缓存指标 */
  cache: {
    hits: number
    misses: number
    hitRate: number
    size: number
    maxSize: number
  }
  /** 事件指标 */
  events: {
    totalEmitted: number
    totalListeners: number
    topEvents: Array<{
      name: string
      count: number
      avgTime: number
    }>
  }
}

/**
 * 性能仪表板实现
 */
export class PerformanceDashboard {
  private engine: Engine
  private performanceManager: PerformanceManager
  private options: Required<DashboardOptions>
  private container?: HTMLElement
  private isVisible = false
  private updateTimer?: NodeJS.Timeout
  private metrics: PerformanceMetrics
  private charts: Map<string, any> = new Map()
  private isDragging = false
  private dragOffset = { x: 0, y: 0 }
  private resizeHandle?: HTMLElement

  constructor(
    engine: Engine,
    performanceManager: PerformanceManager,
    options: DashboardOptions = {}
  ) {
    this.engine = engine
    this.performanceManager = performanceManager
    this.options = {
      enabled: options.enabled ?? true,
      position: options.position ?? 'bottom-right',
      collapsed: options.collapsed ?? false,
      showFPS: options.showFPS ?? true,
      showMemory: options.showMemory ?? true,
      showNetwork: options.showNetwork ?? true,
      showComponents: options.showComponents ?? true,
      updateInterval: options.updateInterval ?? 100,
      customStyles: options.customStyles ?? '',
      theme: options.theme ?? 'auto',
      draggable: options.draggable ?? true,
      resizable: options.resizable ?? true
    }

    this.metrics = this.initMetrics()

    if (this.options.enabled && this.isDevelopment()) {
      this.initialize()
    }
  }

  /**
   * 初始化指标数据
   */
  private initMetrics(): PerformanceMetrics {
    return {
      fps: {
        current: 0,
        avg: 0,
        min: 60,
        max: 0,
        history: []
      },
      memory: {
        used: 0,
        limit: 0,
        percent: 0,
        history: []
      },
      network: {
        requests: 0,
        totalSize: 0,
        avgLatency: 0,
        failedRequests: 0,
        pendingRequests: 0
      },
      components: {
        totalRenders: 0,
        avgRenderTime: 0,
        slowComponents: []
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        maxSize: 0
      },
      events: {
        totalEmitted: 0,
        totalListeners: 0,
        topEvents: []
      }
    }
  }

  /**
   * 初始化仪表板
   */
  private initialize(): void {
    this.createDashboard()
    this.startMonitoring()
    this.setupKeyboardShortcuts()

    this.engine.logger.info('Performance Dashboard initialized')
  }

  /**
   * 创建仪表板UI
   */
  private createDashboard(): void {
    // 创建容器
    this.container = document.createElement('div')
    this.container.id = 'ldesign-performance-dashboard'
    this.container.className = `perf-dashboard ${this.options.collapsed ? 'collapsed' : ''} ${this.getThemeClass()}`

    // 设置样式
    this.applyStyles()

    // 创建头部
    const header = this.createHeader()
    this.container.appendChild(header)

    // 创建内容区域
    const content = this.createContent()
    this.container.appendChild(content)

    // 如果可调整大小，添加调整手柄
    if (this.options.resizable) {
      this.addResizeHandle()
    }

    // 添加到页面
    document.body.appendChild(this.container)

    this.isVisible = true
  }

  /**
   * 创建头部
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div')
    header.className = 'dashboard-header'

    // 标题
    const title = document.createElement('div')
    title.className = 'dashboard-title'
    title.innerHTML = '🚀 Performance Monitor'

    // 控制按钮
    const controls = document.createElement('div')
    controls.className = 'dashboard-controls'

    // 最小化按钮
    const minimizeBtn = document.createElement('button')
    minimizeBtn.className = 'control-btn'
    minimizeBtn.innerHTML = '−'
    minimizeBtn.onclick = () => this.toggle()

    // 关闭按钮
    const closeBtn = document.createElement('button')
    closeBtn.className = 'control-btn'
    closeBtn.innerHTML = '×'
    closeBtn.onclick = () => this.destroy()

    controls.appendChild(minimizeBtn)
    controls.appendChild(closeBtn)

    header.appendChild(title)
    header.appendChild(controls)

    // 如果可拖拽，设置拖拽功能
    if (this.options.draggable) {
      this.setupDragging(header)
    }

    return header
  }

  /**
   * 创建内容区域
   */
  private createContent(): HTMLElement {
    const content = document.createElement('div')
    content.className = 'dashboard-content'

    // 创建各个监控面板
    if (this.options.showFPS) {
      content.appendChild(this.createFPSPanel())
    }

    if (this.options.showMemory) {
      content.appendChild(this.createMemoryPanel())
    }

    if (this.options.showNetwork) {
      content.appendChild(this.createNetworkPanel())
    }

    if (this.options.showComponents) {
      content.appendChild(this.createComponentsPanel())
    }

    // 额外面板
    content.appendChild(this.createCachePanel())
    content.appendChild(this.createEventsPanel())

    return content
  }

  /**
   * 创建FPS面板
   */
  private createFPSPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'metric-panel fps-panel'

    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">📈 FPS</span>
        <span class="panel-value" id="fps-current">0</span>
      </div>
      <div class="panel-content">
        <canvas id="fps-chart" width="200" height="50"></canvas>
        <div class="panel-stats">
          <div class="stat">
            <span class="stat-label">Avg:</span>
            <span class="stat-value" id="fps-avg">0</span>
          </div>
          <div class="stat">
            <span class="stat-label">Min:</span>
            <span class="stat-value" id="fps-min">0</span>
          </div>
          <div class="stat">
            <span class="stat-label">Max:</span>
            <span class="stat-value" id="fps-max">0</span>
          </div>
        </div>
      </div>
    `

    // 初始化FPS图表
    setTimeout(() => {
      const canvas = panel.querySelector('#fps-chart') as HTMLCanvasElement
      if (canvas) {
        this.initFPSChart(canvas)
      }
    }, 0)

    return panel
  }

  /**
   * 创建内存面板
   */
  private createMemoryPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'metric-panel memory-panel'

    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">💾 Memory</span>
        <span class="panel-value" id="memory-percent">0%</span>
      </div>
      <div class="panel-content">
        <div class="progress-bar">
          <div class="progress-fill" id="memory-bar"></div>
        </div>
        <div class="panel-stats">
          <div class="stat">
            <span class="stat-label">Used:</span>
            <span class="stat-value" id="memory-used">0 MB</span>
          </div>
          <div class="stat">
            <span class="stat-label">Limit:</span>
            <span class="stat-value" id="memory-limit">0 MB</span>
          </div>
        </div>
        <canvas id="memory-chart" width="200" height="50"></canvas>
      </div>
    `

    return panel
  }

  /**
   * 创建网络面板
   */
  private createNetworkPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'metric-panel network-panel'

    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🌐 Network</span>
        <span class="panel-value" id="network-requests">0</span>
      </div>
      <div class="panel-content">
        <div class="panel-stats">
          <div class="stat">
            <span class="stat-label">Total:</span>
            <span class="stat-value" id="network-size">0 KB</span>
          </div>
          <div class="stat">
            <span class="stat-label">Latency:</span>
            <span class="stat-value" id="network-latency">0 ms</span>
          </div>
          <div class="stat">
            <span class="stat-label">Failed:</span>
            <span class="stat-value" id="network-failed">0</span>
          </div>
          <div class="stat">
            <span class="stat-label">Pending:</span>
            <span class="stat-value" id="network-pending">0</span>
          </div>
        </div>
      </div>
    `

    return panel
  }

  /**
   * 创建组件面板
   */
  private createComponentsPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'metric-panel components-panel'

    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🧩 Components</span>
        <span class="panel-value" id="components-renders">0</span>
      </div>
      <div class="panel-content">
        <div class="panel-stats">
          <div class="stat">
            <span class="stat-label">Avg Time:</span>
            <span class="stat-value" id="components-avg-time">0 ms</span>
          </div>
        </div>
        <div class="slow-components">
          <div class="list-title">Slow Components:</div>
          <ul id="slow-components-list"></ul>
        </div>
      </div>
    `

    return panel
  }

  /**
   * 创建缓存面板
   */
  private createCachePanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'metric-panel cache-panel'

    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">📦 Cache</span>
        <span class="panel-value" id="cache-hitrate">0%</span>
      </div>
      <div class="panel-content">
        <div class="panel-stats">
          <div class="stat">
            <span class="stat-label">Hits:</span>
            <span class="stat-value" id="cache-hits">0</span>
          </div>
          <div class="stat">
            <span class="stat-label">Misses:</span>
            <span class="stat-value" id="cache-misses">0</span>
          </div>
          <div class="stat">
            <span class="stat-label">Size:</span>
            <span class="stat-value" id="cache-size">0/0</span>
          </div>
        </div>
      </div>
    `

    return panel
  }

  /**
   * 创建事件面板
   */
  private createEventsPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'metric-panel events-panel'

    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">⚡ Events</span>
        <span class="panel-value" id="events-total">0</span>
      </div>
      <div class="panel-content">
        <div class="panel-stats">
          <div class="stat">
            <span class="stat-label">Listeners:</span>
            <span class="stat-value" id="events-listeners">0</span>
          </div>
        </div>
        <div class="top-events">
          <div class="list-title">Top Events:</div>
          <ul id="top-events-list"></ul>
        </div>
      </div>
    `

    return panel
  }

  /**
   * 初始化FPS图表
   */
  private initFPSChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    this.charts.set('fps', {
      canvas,
      ctx,
      data: [],
      maxPoints: 50
    })
  }

  /**
   * 更新FPS图表
   */
  private updateFPSChart(): void {
    const chart = this.charts.get('fps')
    if (!chart) return

    const { ctx, canvas, data } = chart
    const fps = this.metrics.fps.current

    // 添加新数据点
    data.push(fps)
    if (data.length > chart.maxPoints) {
      data.shift()
    }

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制网格
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = (canvas.height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // 绘制FPS曲线
    if (data.length > 1) {
      ctx.strokeStyle = this.getFPSColor(fps)
      ctx.lineWidth = 2
      ctx.beginPath()

      const xStep = canvas.width / (chart.maxPoints - 1)
      data.forEach((value: number, index: number) => {
        const x = index * xStep
        const y = canvas.height - (value / 60) * canvas.height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }
  }

  /**
   * 获取FPS颜色
   */
  private getFPSColor(fps: number): string {
    if (fps >= 55) return '#4CAF50' // 绿色
    if (fps >= 30) return '#FFC107' // 黄色
    return '#F44336' // 红色
  }

  /**
   * 开始监控
   */
  private startMonitoring(): void {
    // 初始收集一次数据
    this.collectMetrics()
    this.updateDashboard()

    // 定期更新
    this.updateTimer = setInterval(() => {
      this.collectMetrics()
      this.updateDashboard()
    }, this.options.updateInterval)
  }

  /**
   * 收集指标数据
   */
  private collectMetrics(): void {
    // FPS数据
    this.updateFPSMetrics()

    // 内存数据
    this.updateMemoryMetrics()

    // 网络数据
    this.updateNetworkMetrics()

    // 组件数据
    this.updateComponentMetrics()

    // 缓存数据
    this.updateCacheMetrics()

    // 事件数据
    this.updateEventMetrics()
  }

  /**
   * 更新FPS指标
   */
  private updateFPSMetrics(): void {
    const fps = this.calculateFPS()

    this.metrics.fps.current = fps
    this.metrics.fps.history.push(fps)

    if (this.metrics.fps.history.length > 100) {
      this.metrics.fps.history.shift()
    }

    // 计算统计值
    const history = this.metrics.fps.history
    this.metrics.fps.avg = history.reduce((a, b) => a + b, 0) / history.length
    this.metrics.fps.min = Math.min(...history)
    this.metrics.fps.max = Math.max(...history)
  }

  /**
   * 计算FPS
   */
  private calculateFPS(): number {
    // 使用requestAnimationFrame计算FPS
    let fps = 0
    let lastTime = performance.now()
    let frames = 0

    const measureFPS = () => {
      frames++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime))
        frames = 0
        lastTime = currentTime
      }
    }

    requestAnimationFrame(measureFPS)

    return fps
  }

  /**
   * 更新内存指标
   */
  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memory.used = memory.usedJSHeapSize
      this.metrics.memory.limit = memory.jsHeapSizeLimit
      this.metrics.memory.percent = (this.metrics.memory.used / this.metrics.memory.limit) * 100

      this.metrics.memory.history.push(this.metrics.memory.used)
      if (this.metrics.memory.history.length > 100) {
        this.metrics.memory.history.shift()
      }
    }
  }

  /**
   * 更新网络指标
   */
  private updateNetworkMetrics(): void {
    // 这里需要从performanceManager获取实际的网络数据
    const networkData = this.performanceManager.getNetworkMetrics?.() || {
      requests: 0,
      totalSize: 0,
      avgLatency: 0,
      failedRequests: 0,
      pendingRequests: 0
    }

    Object.assign(this.metrics.network, networkData)
  }

  /**
   * 更新组件指标
   */
  private updateComponentMetrics(): void {
    // 从performanceManager获取组件性能数据
    const componentData = this.performanceManager.getComponentMetrics?.() || {
      totalRenders: 0,
      avgRenderTime: 0,
      slowComponents: []
    }

    Object.assign(this.metrics.components, componentData)
  }

  /**
   * 更新缓存指标
   */
  private updateCacheMetrics(): void {
    const cacheStats = this.engine.cache.getStats()

    this.metrics.cache.hits = cacheStats.hits
    this.metrics.cache.misses = cacheStats.misses
    this.metrics.cache.hitRate = cacheStats.hitRate
    this.metrics.cache.size = cacheStats.size
    this.metrics.cache.maxSize = 100 // 默认最大值
  }

  /**
   * 更新事件指标
   */
  private updateEventMetrics(): void {
    // 从事件管理器获取统计数据
    const eventData = this.engine.events.getStats?.() || {
      totalEmitted: 0,
      totalListeners: 0,
      topEvents: []
    }

    Object.assign(this.metrics.events, eventData)
  }

  /**
   * 更新仪表板显示
   */
  private updateDashboard(): void {
    if (!this.container || !this.isVisible) return

    // 更新FPS
    this.updateElement('fps-current', `${this.metrics.fps.current}`)
    this.updateElement('fps-avg', `${Math.round(this.metrics.fps.avg)}`)
    this.updateElement('fps-min', `${this.metrics.fps.min}`)
    this.updateElement('fps-max', `${this.metrics.fps.max}`)
    this.updateFPSChart()

    // 更新内存
    const memoryMB = (this.metrics.memory.used / 1024 / 1024).toFixed(1)
    const limitMB = (this.metrics.memory.limit / 1024 / 1024).toFixed(1)
    this.updateElement('memory-percent', `${Math.round(this.metrics.memory.percent)}%`)
    this.updateElement('memory-used', `${memoryMB} MB`)
    this.updateElement('memory-limit', `${limitMB} MB`)
    this.updateProgressBar('memory-bar', this.metrics.memory.percent)

    // 更新网络
    this.updateElement('network-requests', `${this.metrics.network.requests}`)
    this.updateElement('network-size', `${(this.metrics.network.totalSize / 1024).toFixed(1)} KB`)
    this.updateElement('network-latency', `${Math.round(this.metrics.network.avgLatency)} ms`)
    this.updateElement('network-failed', `${this.metrics.network.failedRequests}`)
    this.updateElement('network-pending', `${this.metrics.network.pendingRequests}`)

    // 更新组件
    this.updateElement('components-renders', `${this.metrics.components.totalRenders}`)
    this.updateElement('components-avg-time', `${this.metrics.components.avgRenderTime.toFixed(2)} ms`)
    this.updateSlowComponentsList()

    // 更新缓存
    this.updateElement('cache-hitrate', `${Math.round(this.metrics.cache.hitRate)}%`)
    this.updateElement('cache-hits', `${this.metrics.cache.hits}`)
    this.updateElement('cache-misses', `${this.metrics.cache.misses}`)
    this.updateElement('cache-size', `${this.metrics.cache.size}/${this.metrics.cache.maxSize}`)

    // 更新事件
    this.updateElement('events-total', `${this.metrics.events.totalEmitted}`)
    this.updateElement('events-listeners', `${this.metrics.events.totalListeners}`)
    this.updateTopEventsList()
  }

  /**
   * 更新元素内容
   */
  private updateElement(id: string, content: string): void {
    const element = this.container?.querySelector(`#${id}`)
    if (element) {
      element.textContent = content
    }
  }

  /**
   * 更新进度条
   */
  private updateProgressBar(id: string, percent: number): void {
    const bar = this.container?.querySelector(`#${id}`) as HTMLElement
    if (bar) {
      bar.style.width = `${Math.min(100, percent)}%`
      bar.style.backgroundColor = percent > 80 ? '#F44336' : percent > 60 ? '#FFC107' : '#4CAF50'
    }
  }

  /**
   * 更新慢组件列表
   */
  private updateSlowComponentsList(): void {
    const list = this.container?.querySelector('#slow-components-list')
    if (!list) return

    list.innerHTML = this.metrics.components.slowComponents
      .slice(0, 5)
      .map(comp => `
        <li>
          <span class="component-name">${comp.name}</span>
          <span class="component-time">${comp.renderTime.toFixed(2)}ms (${comp.count})</span>
        </li>
      `)
      .join('')
  }

  /**
   * 更新热门事件列表
   */
  private updateTopEventsList(): void {
    const list = this.container?.querySelector('#top-events-list')
    if (!list) return

    list.innerHTML = this.metrics.events.topEvents
      .slice(0, 5)
      .map(event => `
        <li>
          <span class="event-name">${event.name}</span>
          <span class="event-stats">${event.count} (${event.avgTime.toFixed(2)}ms)</span>
        </li>
      `)
      .join('')
  }

  /**
   * 设置拖拽功能
   */
  private setupDragging(header: HTMLElement): void {
    header.style.cursor = 'move'

    header.addEventListener('mousedown', (e) => {
      if (!this.container) return

      this.isDragging = true
      const rect = this.container.getBoundingClientRect()
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }

      document.addEventListener('mousemove', this.handleDrag)
      document.addEventListener('mouseup', this.stopDrag)
    })
  }

  /**
   * 处理拖拽
   */
  private handleDrag = (e: MouseEvent): void => {
    if (!this.isDragging || !this.container) return

    const x = e.clientX - this.dragOffset.x
    const y = e.clientY - this.dragOffset.y

    this.container.style.left = `${x}px`
    this.container.style.top = `${y}px`
    this.container.style.right = 'auto'
    this.container.style.bottom = 'auto'
  }

  /**
   * 停止拖拽
   */
  private stopDrag = (): void => {
    this.isDragging = false
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup', this.stopDrag)
  }

  /**
   * 添加调整大小手柄
   */
  private addResizeHandle(): void {
    this.resizeHandle = document.createElement('div')
    this.resizeHandle.className = 'resize-handle'
    this.container?.appendChild(this.resizeHandle)

    let isResizing = false
    let startWidth = 0
    let startHeight = 0
    let startX = 0
    let startY = 0

    this.resizeHandle.addEventListener('mousedown', (e) => {
      if (!this.container) return

      isResizing = true
      startWidth = this.container.offsetWidth
      startHeight = this.container.offsetHeight
      startX = e.clientX
      startY = e.clientY

      const handleResize = (e: MouseEvent) => {
        if (!isResizing || !this.container) return

        const width = startWidth + (e.clientX - startX)
        const height = startHeight + (e.clientY - startY)

        this.container.style.width = `${Math.max(300, width)}px`
        this.container.style.height = `${Math.max(200, height)}px`
      }

      const stopResize = () => {
        isResizing = false
        document.removeEventListener('mousemove', handleResize)
        document.removeEventListener('mouseup', stopResize)
      }

      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', stopResize)
    })
  }

  /**
   * 设置键盘快捷键
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+P 切换显示/隐藏
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        this.toggle()
      }
    })
  }

  /**
   * 应用样式
   */
  private applyStyles(): void {
    if (!this.container) return

    const styles = `
      #ldesign-performance-dashboard {
        position: fixed;
        ${this.getPositionStyles()}
        width: 350px;
        max-height: 600px;
        background: rgba(20, 20, 20, 0.95);
        border: 1px solid #333;
        border-radius: 8px;
        color: #fff;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      #ldesign-performance-dashboard.collapsed {
        height: 40px;
      }
      
      #ldesign-performance-dashboard.collapsed .dashboard-content {
        display: none;
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: rgba(30, 30, 30, 0.95);
        border-bottom: 1px solid #444;
        user-select: none;
      }
      
      .dashboard-title {
        font-weight: bold;
        font-size: 14px;
      }
      
      .dashboard-controls {
        display: flex;
        gap: 5px;
      }
      
      .control-btn {
        width: 20px;
        height: 20px;
        border: none;
        background: transparent;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 0;
        transition: background 0.2s;
      }
      
      .control-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .dashboard-content {
        padding: 10px;
        max-height: 550px;
        overflow-y: auto;
      }
      
      .metric-panel {
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(30, 30, 30, 0.5);
        border-radius: 4px;
        border: 1px solid #333;
      }
      
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      
      .panel-title {
        font-weight: bold;
        color: #4CAF50;
      }
      
      .panel-value {
        font-size: 18px;
        font-weight: bold;
      }
      
      .panel-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
        gap: 10px;
        margin-top: 10px;
      }
      
      .stat {
        display: flex;
        flex-direction: column;
      }
      
      .stat-label {
        color: #888;
        font-size: 10px;
      }
      
      .stat-value {
        font-size: 14px;
        font-weight: bold;
      }
      
      .progress-bar {
        width: 100%;
        height: 4px;
        background: #333;
        border-radius: 2px;
        overflow: hidden;
        margin: 10px 0;
      }
      
      .progress-fill {
        height: 100%;
        background: #4CAF50;
        transition: width 0.3s, background-color 0.3s;
      }
      
      .slow-components, .top-events {
        margin-top: 10px;
      }
      
      .list-title {
        color: #888;
        font-size: 10px;
        margin-bottom: 5px;
      }
      
      .slow-components ul, .top-events ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .slow-components li, .top-events li {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
        color: #bbb;
      }
      
      .component-name, .event-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
      
      .component-time, .event-stats {
        color: #888;
        margin-left: 10px;
      }
      
      canvas {
        width: 100%;
        height: 50px;
        margin-top: 10px;
      }
      
      .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 15px;
        height: 15px;
        cursor: nwse-resize;
        background: linear-gradient(135deg, transparent 50%, #666 50%);
      }
      
      /* 滚动条样式 */
      .dashboard-content::-webkit-scrollbar {
        width: 6px;
      }
      
      .dashboard-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .dashboard-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }
      
      .dashboard-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      ${this.options.customStyles}
    `

    // 添加样式到页面
    let styleElement = document.getElementById('ldesign-dashboard-styles')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'ldesign-dashboard-styles'
      document.head.appendChild(styleElement)
    }
    styleElement.textContent = styles
  }

  /**
   * 获取位置样式
   */
  private getPositionStyles(): string {
    const positions = {
      'top-left': 'top: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'bottom-right': 'bottom: 20px; right: 20px;',
      'floating': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    }

    return positions[this.options.position] || positions['bottom-right']
  }

  /**
   * 获取主题类名
   */
  private getThemeClass(): string {
    if (this.options.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return this.options.theme
  }

  /**
   * 检查是否为开发环境
   */
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' ||
           this.engine.config.get('debug', false) as boolean
  }

  /**
   * 切换显示/隐藏
   */
  toggle(): void {
    if (!this.container) return

    this.container.classList.toggle('collapsed')
    this.options.collapsed = this.container.classList.contains('collapsed')
  }

  /**
   * 显示仪表板
   */
  show(): void {
    if (!this.container) {
      this.createDashboard()
    }
    this.isVisible = true
    if (this.container) {
      this.container.style.display = 'block'
    }
  }

  /**
   * 隐藏仪表板
   */
  hide(): void {
    this.isVisible = false
    if (this.container) {
      this.container.style.display = 'none'
    }
  }

  /**
   * 销毁仪表板
   */
  destroy(): void {
    // 停止监控
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = undefined
    }

    // 移除DOM
    if (this.container) {
      this.container.remove()
      this.container = undefined
    }

    // 移除样式
    const styleElement = document.getElementById('ldesign-dashboard-styles')
    if (styleElement) {
      styleElement.remove()
    }

    // 清理图表
    this.charts.clear()

    this.isVisible = false

    this.engine.logger.info('Performance Dashboard destroyed')
  }
}

/**
 * 创建性能仪表板
 */
export function createPerformanceDashboard(
  engine: Engine,
  performanceManager: PerformanceManager,
  options?: DashboardOptions
): PerformanceDashboard {
  return new PerformanceDashboard(engine, performanceManager, options)
}
