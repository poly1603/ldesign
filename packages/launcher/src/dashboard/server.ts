/**
 * 监控面板服务端
 * 
 * 提供实时性能数据和构建分析的 WebSocket 服务
 */

import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { EventEmitter } from 'events'
import { Logger } from '../utils/logger'
import type { PerformanceMetrics } from '../core/PerformanceOptimizer'
import type { DevMetrics } from '../core/DevExperience'

export interface DashboardConfig {
  /** 服务端口 */
  port?: number
  /** 主机地址 */
  host?: string
  /** 更新频率 (ms) */
  updateInterval?: number
  /** 启用认证 */
  enableAuth?: boolean
  /** 认证令牌 */
  authToken?: string
}

export interface DashboardMetrics {
  /** 时间戳 */
  timestamp: number
  /** 性能指标 */
  performance: PerformanceMetrics
  /** 开发指标 */
  dev: DevMetrics
  /** 系统指标 */
  system: {
    cpu: number
    memory: number
    uptime: number
  }
  /** 构建历史 */
  buildHistory: BuildRecord[]
  /** 活动连接数 */
  activeConnections: number
}

export interface BuildRecord {
  id: string
  timestamp: number
  duration: number
  success: boolean
  size?: number
  errors?: string[]
}

/**
 * 监控面板服务器
 */
export class DashboardServer extends EventEmitter {
  private logger: Logger
  private config: Required<DashboardConfig>
  private server?: any
  private wss?: WebSocketServer
  private metrics: DashboardMetrics
  private clients: Set<any> = new Set()
  private updateTimer?: NodeJS.Timeout
  private buildHistory: BuildRecord[] = []

  constructor(config: DashboardConfig = {}) {
    super()
    
    this.logger = new Logger('DashboardServer')
    
    this.config = {
      port: 9527,
      host: 'localhost',
      updateInterval: 1000,
      enableAuth: false,
      authToken: '',
      ...config
    }

    // 初始化指标
    this.metrics = {
      timestamp: Date.now(),
      performance: {},
      dev: {
        hmrUpdateCount: 0,
        averageHmrTime: 0,
        compileErrorCount: 0,
        runtimeErrorCount: 0,
        fullReloadCount: 0
      },
      system: {
        cpu: 0,
        memory: 0,
        uptime: process.uptime()
      },
      buildHistory: [],
      activeConnections: 0
    }
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 创建 HTTP 服务器
        this.server = createServer((req, res) => {
          if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(this.getDashboardHTML())
          } else if (req.url === '/api/metrics') {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(this.metrics))
          } else if (req.url === '/api/history') {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(this.buildHistory))
          } else {
            res.writeHead(404)
            res.end('Not Found')
          }
        })

        // 创建 WebSocket 服务器
        this.wss = new WebSocketServer({ server: this.server })

        this.wss.on('connection', (ws, req) => {
          // 认证检查
          if (this.config.enableAuth) {
            const token = req.headers.authorization?.replace('Bearer ', '')
            if (token !== this.config.authToken) {
              ws.close(1008, 'Unauthorized')
              return
            }
          }

          this.logger.debug('新的客户端连接')
          this.clients.add(ws)
          this.metrics.activeConnections = this.clients.size

          // 发送初始数据
          ws.send(JSON.stringify({
            type: 'init',
            data: this.metrics
          }))

          ws.on('message', (message) => {
            try {
              const data = JSON.parse(message.toString())
              this.handleClientMessage(ws, data)
            } catch (error) {
              this.logger.error('处理客户端消息失败:', error)
            }
          })

          ws.on('close', () => {
            this.clients.delete(ws)
            this.metrics.activeConnections = this.clients.size
            this.logger.debug('客户端断开连接')
          })

          ws.on('error', (error) => {
            this.logger.error('WebSocket 错误:', error)
          })
        })

        // 启动服务器
        this.server.listen(this.config.port, this.config.host, () => {
          this.logger.info(`监控面板启动: http://${this.config.host}:${this.config.port}`)
          this.startMetricsUpdate()
          resolve()
        })

        this.server.on('error', reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 停止服务器
   */
  async stop(): Promise<void> {
    this.stopMetricsUpdate()

    // 关闭所有客户端连接
    for (const client of this.clients) {
      client.close()
    }
    this.clients.clear()

    // 关闭 WebSocket 服务器
    if (this.wss) {
      await new Promise<void>((resolve) => {
        this.wss!.close(() => resolve())
      })
    }

    // 关闭 HTTP 服务器
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve())
      })
    }

    this.logger.info('监控面板已停止')
  }

  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(metrics: PerformanceMetrics): void {
    this.metrics.performance = metrics
    this.broadcast({
      type: 'performance',
      data: metrics
    })
  }

  /**
   * 更新开发指标
   */
  updateDevMetrics(metrics: DevMetrics): void {
    this.metrics.dev = metrics
    this.broadcast({
      type: 'dev',
      data: metrics
    })
  }

  /**
   * 记录构建
   */
  recordBuild(record: BuildRecord): void {
    this.buildHistory.unshift(record)
    
    // 保留最近100条记录
    if (this.buildHistory.length > 100) {
      this.buildHistory = this.buildHistory.slice(0, 100)
    }
    
    this.metrics.buildHistory = this.buildHistory.slice(0, 10)
    
    this.broadcast({
      type: 'build',
      data: record
    })
  }

  /**
   * 处理客户端消息
   */
  private handleClientMessage(ws: any, data: any): void {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break
      
      case 'getHistory':
        ws.send(JSON.stringify({
          type: 'history',
          data: this.buildHistory
        }))
        break
      
      case 'clearHistory':
        this.buildHistory = []
        this.metrics.buildHistory = []
        this.broadcast({
          type: 'historyCleared'
        })
        break
      
      default:
        this.logger.warn(`未知消息类型: ${data.type}`)
    }
  }

  /**
   * 广播消息到所有客户端
   */
  private broadcast(message: any): void {
    const data = JSON.stringify(message)
    for (const client of this.clients) {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(data)
      }
    }
  }

  /**
   * 开始定期更新指标
   */
  private startMetricsUpdate(): void {
    this.updateTimer = setInterval(() => {
      this.updateSystemMetrics()
    }, this.config.updateInterval)
  }

  /**
   * 停止定期更新
   */
  private stopMetricsUpdate(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = undefined
    }
  }

  /**
   * 更新系统指标
   */
  private updateSystemMetrics(): void {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    this.metrics.system = {
      cpu: cpuUsage.user + cpuUsage.system,
      memory: memUsage.heapUsed / memUsage.heapTotal * 100,
      uptime: process.uptime()
    }
    
    this.metrics.timestamp = Date.now()
    
    this.broadcast({
      type: 'system',
      data: this.metrics.system
    })
  }

  /**
   * 获取监控面板 HTML
   */
  private getDashboardHTML(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Launcher 监控面板</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 12px;
      padding: 20px 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .header h1 {
      color: #667eea;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status {
      display: inline-block;
      width: 12px;
      height: 12px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .card h2 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 10px;
      background: #f3f4f6;
      border-radius: 6px;
    }
    .metric-label {
      color: #6b7280;
      font-size: 14px;
    }
    .metric-value {
      font-weight: bold;
      color: #111827;
    }
    .chart-container {
      position: relative;
      height: 300px;
      margin-top: 15px;
    }
    .build-item {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      margin: 5px 0;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #10b981;
    }
    .build-item.failed {
      border-left-color: #ef4444;
    }
    .connection-status {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 10px 20px;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span class="status"></span> Launcher 性能监控面板</h1>
    </div>
    
    <div class="grid">
      <div class="card">
        <h2>📊 性能指标</h2>
        <div class="metric">
          <span class="metric-label">构建时间</span>
          <span class="metric-value" id="buildTime">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">内存使用</span>
          <span class="metric-value" id="memoryUsage">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">缓存命中率</span>
          <span class="metric-value" id="cacheHitRate">-</span>
        </div>
      </div>
      
      <div class="card">
        <h2>🔥 HMR 统计</h2>
        <div class="metric">
          <span class="metric-label">更新次数</span>
          <span class="metric-value" id="hmrCount">0</span>
        </div>
        <div class="metric">
          <span class="metric-label">平均时间</span>
          <span class="metric-value" id="hmrTime">0ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">错误次数</span>
          <span class="metric-value" id="errorCount">0</span>
        </div>
      </div>
      
      <div class="card">
        <h2>💻 系统状态</h2>
        <div class="metric">
          <span class="metric-label">CPU 使用</span>
          <span class="metric-value" id="cpuUsage">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">内存占用</span>
          <span class="metric-value" id="systemMemory">-</span>
        </div>
        <div class="metric">
          <span class="metric-label">运行时间</span>
          <span class="metric-value" id="uptime">-</span>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2>📈 实时性能图表</h2>
      <div class="chart-container">
        <canvas id="performanceChart"></canvas>
      </div>
    </div>
    
    <div class="card">
      <h2>🔨 构建历史</h2>
      <div id="buildHistory"></div>
    </div>
  </div>
  
  <div class="connection-status" id="connectionStatus">
    🔗 连接中...
  </div>

  <script>
    const ws = new WebSocket('ws://' + location.host)
    const chart = initChart()
    
    ws.onopen = () => {
      document.getElementById('connectionStatus').textContent = '✅ 已连接'
    }
    
    ws.onclose = () => {
      document.getElementById('connectionStatus').textContent = '❌ 连接断开'
    }
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleMessage(message)
    }
    
    function handleMessage(message) {
      switch (message.type) {
        case 'init':
        case 'performance':
          updatePerformanceMetrics(message.data)
          break
        case 'dev':
          updateDevMetrics(message.data)
          break
        case 'system':
          updateSystemMetrics(message.data)
          break
        case 'build':
          addBuildRecord(message.data)
          break
      }
    }
    
    function updatePerformanceMetrics(data) {
      if (data.buildTime) {
        document.getElementById('buildTime').textContent = data.buildTime + 'ms'
      }
      if (data.memoryUsage) {
        const mb = (data.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
        document.getElementById('memoryUsage').textContent = mb + 'MB'
      }
      if (data.cacheHitRate !== undefined) {
        document.getElementById('cacheHitRate').textContent = data.cacheHitRate + '%'
      }
    }
    
    function updateDevMetrics(data) {
      document.getElementById('hmrCount').textContent = data.hmrUpdateCount || 0
      document.getElementById('hmrTime').textContent = (data.averageHmrTime || 0) + 'ms'
      document.getElementById('errorCount').textContent = data.compileErrorCount || 0
    }
    
    function updateSystemMetrics(data) {
      document.getElementById('cpuUsage').textContent = (data.cpu / 1000000).toFixed(2) + 's'
      document.getElementById('systemMemory').textContent = data.memory.toFixed(1) + '%'
      document.getElementById('uptime').textContent = formatUptime(data.uptime)
      
      // 更新图表
      updateChart(chart, data)
    }
    
    function formatUptime(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return hours + 'h ' + minutes + 'm'
    }
    
    function addBuildRecord(record) {
      const container = document.getElementById('buildHistory')
      const item = document.createElement('div')
      item.className = 'build-item' + (record.success ? '' : ' failed')
      item.innerHTML = \`
        <span>\${new Date(record.timestamp).toLocaleTimeString()}</span>
        <span>\${record.duration}ms</span>
        <span>\${record.success ? '✅' : '❌'}</span>
      \`
      container.insertBefore(item, container.firstChild)
      
      // 保留最近10条
      while (container.children.length > 10) {
        container.removeChild(container.lastChild)
      }
    }
    
    function initChart() {
      const ctx = document.getElementById('performanceChart').getContext('2d')
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'CPU',
            data: [],
            borderColor: '#667eea',
            tension: 0.1
          }, {
            label: '内存',
            data: [],
            borderColor: '#764ba2',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
    
    function updateChart(chart, data) {
      const now = new Date().toLocaleTimeString()
      chart.data.labels.push(now)
      chart.data.datasets[0].data.push(data.cpu / 1000000)
      chart.data.datasets[1].data.push(data.memory)
      
      // 保留最近20个数据点
      if (chart.data.labels.length > 20) {
        chart.data.labels.shift()
        chart.data.datasets[0].data.shift()
        chart.data.datasets[1].data.shift()
      }
      
      chart.update()
    }
    
    // 定期 ping 保持连接
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  </script>
</body>
</html>`
  }
}

/**
 * 创建监控面板服务器
 */
export function createDashboardServer(config?: DashboardConfig): DashboardServer {
  return new DashboardServer(config)
}
