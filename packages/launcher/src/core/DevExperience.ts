/**
 * 开发体验增强模块
 * 
 * 提供更好的开发体验，包括 HMR 优化、错误提示美化、性能监控等
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import type { Plugin, ViteDevServer, HmrContext } from 'vite'
import { Logger } from '../utils/logger'
import chalk from 'chalk'
import ora from 'ora'

export interface DevExperienceOptions {
  /** 启用错误覆盖层 */
  enableErrorOverlay?: boolean
  /** 启用控制台美化 */
  enablePrettyConsole?: boolean
  /** 启用构建进度条 */
  enableProgressBar?: boolean
  /** 启用性能提示 */
  enablePerformanceHints?: boolean
  /** 启用快速刷新 */
  enableFastRefresh?: boolean
  /** 启用网络延迟模拟 */
  enableNetworkThrottle?: boolean
  /** 网络延迟（ms） */
  networkDelay?: number
  /** 启用源码映射 */
  enableSourceMap?: boolean
  /** 自动打开浏览器 */
  autoOpenBrowser?: boolean
  /** 自动打开的URL */
  openUrl?: string
}

export interface DevMetrics {
  /** HMR 更新次数 */
  hmrUpdateCount: number
  /** 平均 HMR 时间 */
  averageHmrTime: number
  /** 编译错误次数 */
  compileErrorCount: number
  /** 运行时错误次数 */
  runtimeErrorCount: number
  /** 页面刷新次数 */
  fullReloadCount: number
  /** 最后更新时间 */
  lastUpdateTime?: Date
}

/**
 * 开发体验增强类
 */
export class DevExperience extends EventEmitter {
  private logger: Logger
  private options: Required<DevExperienceOptions>
  private metrics: DevMetrics
  private spinner: any
  private server?: ViteDevServer
  private hmrTimings: number[] = []

  constructor(options: DevExperienceOptions = {}) {
    super()
    
    this.logger = new Logger('DevExperience')
    
    // 设置默认选项
    this.options = {
      enableErrorOverlay: true,
      enablePrettyConsole: true,
      enableProgressBar: true,
      enablePerformanceHints: true,
      enableFastRefresh: true,
      enableNetworkThrottle: false,
      networkDelay: 0,
      enableSourceMap: true,
      autoOpenBrowser: false,
      openUrl: 'http://localhost:3000',
      ...options
    }

    // 初始化指标
    this.metrics = {
      hmrUpdateCount: 0,
      averageHmrTime: 0,
      compileErrorCount: 0,
      runtimeErrorCount: 0,
      fullReloadCount: 0
    }
  }

  /**
   * 创建 Vite 插件
   */
  createVitePlugin(): Plugin {
    return {
      name: 'launcher:dev-experience',
      
      configureServer: (server: ViteDevServer) => {
        this.server = server
        this.setupServerEnhancements(server)
      },
      
      handleHotUpdate: (ctx: HmrContext) => {
        this.trackHmrUpdate(ctx)
        return undefined
      },
      
      transformIndexHtml: (html: string) => {
        if (this.options.enableErrorOverlay) {
          return this.injectErrorOverlay(html)
        }
        return html
      }
    }
  }

  /**
   * 设置服务器增强
   */
  private setupServerEnhancements(server: ViteDevServer): void {
    // 美化控制台输出
    if (this.options.enablePrettyConsole) {
      this.setupPrettyConsole(server)
    }

    // 网络延迟模拟
    if (this.options.enableNetworkThrottle && this.options.networkDelay > 0) {
      this.setupNetworkThrottle(server)
    }

    // 错误处理增强
    this.setupErrorHandling(server)

    // 性能监控
    if (this.options.enablePerformanceHints) {
      this.setupPerformanceMonitoring(server)
    }

    // 监听服务器事件
    server.watcher.on('change', (file) => {
      this.logger.debug(`文件变更: ${file}`)
    })

    // 自动打开浏览器
    if (this.options.autoOpenBrowser) {
      this.openBrowser()
    }
  }

  /**
   * 设置美化控制台
   */
  private setupPrettyConsole(server: ViteDevServer): void {
    const originalInfo = console.info
    const originalWarn = console.warn
    const originalError = console.error

    console.info = (...args: any[]) => {
      originalInfo(chalk.blue('ℹ'), ...args)
    }

    console.warn = (...args: any[]) => {
      originalWarn(chalk.yellow('⚠'), ...args)
    }

    console.error = (...args: any[]) => {
      this.metrics.runtimeErrorCount++
      originalError(chalk.red('✖'), ...args)
    }
  }

  /**
   * 设置网络延迟模拟
   */
  private setupNetworkThrottle(server: ViteDevServer): void {
    server.middlewares.use((req, res, next) => {
      if (this.options.networkDelay > 0) {
        setTimeout(() => next(), this.options.networkDelay)
      } else {
        next()
      }
    })
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(server: ViteDevServer): void {
    // 编译错误处理
    server.watcher.on('error', (error) => {
      this.metrics.compileErrorCount++
      this.logger.error('编译错误:', error)
      this.emit('compile-error', error)
    })

    // WebSocket 错误广播
    server.ws.on('error', (error) => {
      this.logger.error('WebSocket 错误:', error)
    })
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(server: ViteDevServer): void {
    setInterval(() => {
      const memUsage = process.memoryUsage()
      const heapUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2)
      
      if (parseFloat(heapUsedMB) > 500) {
        this.logger.warn(`内存使用较高: ${heapUsedMB}MB`)
        this.emit('high-memory', parseFloat(heapUsedMB))
      }
    }, 30000) // 每30秒检查一次
  }

  /**
   * 跟踪 HMR 更新
   */
  private trackHmrUpdate(ctx: HmrContext): void {
    const startTime = Date.now()
    
    // 记录更新
    this.metrics.hmrUpdateCount++
    this.metrics.lastUpdateTime = new Date()
    
    // 计算 HMR 时间
    process.nextTick(() => {
      const hmrTime = Date.now() - startTime
      this.hmrTimings.push(hmrTime)
      
      // 保持最近100次的记录
      if (this.hmrTimings.length > 100) {
        this.hmrTimings.shift()
      }
      
      // 计算平均时间
      this.metrics.averageHmrTime = 
        this.hmrTimings.reduce((a, b) => a + b, 0) / this.hmrTimings.length
      
      // 性能提示
      if (this.options.enablePerformanceHints && hmrTime > 1000) {
        this.logger.warn(`HMR 更新较慢: ${hmrTime}ms`)
      }
      
      this.logger.debug(`HMR 更新完成: ${hmrTime}ms`)
    })
  }

  /**
   * 注入错误覆盖层
   */
  private injectErrorOverlay(html: string): string {
    const overlayScript = `
      <script>
        (function() {
          const errorOverlay = {
            show: function(error) {
              const overlay = document.createElement('div');
              overlay.id = 'launcher-error-overlay';
              overlay.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                color: #e8e8e8;
                font-family: Consolas, Monaco, monospace;
                padding: 20px;
                overflow: auto;
                z-index: 999999;
              \`;
              
              const content = document.createElement('div');
              content.style.cssText = \`
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #1e1e1e;
                border-radius: 8px;
              \`;
              
              const title = document.createElement('h2');
              title.style.cssText = 'color: #ff5555; margin: 0 0 20px;';
              title.textContent = '⚠ 编译错误';
              
              const message = document.createElement('pre');
              message.style.cssText = \`
                color: #f8f8f2;
                background: #282828;
                padding: 15px;
                border-radius: 4px;
                overflow-x: auto;
                line-height: 1.5;
              \`;
              message.textContent = error.message || error;
              
              const closeBtn = document.createElement('button');
              closeBtn.style.cssText = \`
                position: absolute;
                top: 20px;
                right: 20px;
                background: #ff5555;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
              \`;
              closeBtn.textContent = '关闭';
              closeBtn.onclick = () => overlay.remove();
              
              content.appendChild(title);
              content.appendChild(message);
              overlay.appendChild(content);
              overlay.appendChild(closeBtn);
              document.body.appendChild(overlay);
            },
            
            hide: function() {
              const overlay = document.getElementById('launcher-error-overlay');
              if (overlay) overlay.remove();
            }
          };
          
          window.__launcherErrorOverlay = errorOverlay;
          
          // 监听错误
          window.addEventListener('error', (e) => {
            errorOverlay.show(e.error || e.message);
          });
          
          window.addEventListener('unhandledrejection', (e) => {
            errorOverlay.show(e.reason);
          });
        })();
      </script>
    `
    
    // 在 </head> 前注入脚本
    return html.replace('</head>', `${overlayScript}</head>`)
  }

  /**
   * 打开浏览器
   */
  private async openBrowser(): Promise<void> {
    try {
      // 尝试动态导入 open 包
      // @ts-ignore
      const open = await import('open').then(m => m.default).catch(() => null)
      
      if (open) {
        await open(this.options.openUrl)
        this.logger.info(`已在浏览器中打开: ${this.options.openUrl}`)
      } else {
        // 如果没有 open 包，使用系统命令
        const { exec } = await import('child_process')
        const url = this.options.openUrl
        
        const command = process.platform === 'win32' ? `start ${url}` :
                       process.platform === 'darwin' ? `open ${url}` :
                       `xdg-open ${url}`
        
        exec(command, (error) => {
          if (error) {
            this.logger.warn('无法自动打开浏览器')
          } else {
            this.logger.info(`已在浏览器中打开: ${url}`)
          }
        })
      }
    } catch (error) {
      this.logger.warn('无法自动打开浏览器')
    }
  }

  /**
   * 显示进度条
   */
  showProgress(text: string): void {
    if (this.options.enableProgressBar) {
      this.spinner = ora(text).start()
    }
  }

  /**
   * 更新进度条
   */
  updateProgress(text: string): void {
    if (this.spinner) {
      this.spinner.text = text
    }
  }

  /**
   * 完成进度条
   */
  completeProgress(text: string, success: boolean = true): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(text)
      } else {
        this.spinner.fail(text)
      }
      this.spinner = null
    }
  }

  /**
   * 获取开发指标
   */
  getMetrics(): DevMetrics {
    return { ...this.metrics }
  }

  /**
   * 重置指标
   */
  resetMetrics(): void {
    this.metrics = {
      hmrUpdateCount: 0,
      averageHmrTime: 0,
      compileErrorCount: 0,
      runtimeErrorCount: 0,
      fullReloadCount: 0
    }
    this.hmrTimings = []
  }
}

/**
 * 创建开发体验增强实例
 */
export function createDevExperience(options?: DevExperienceOptions): DevExperience {
  return new DevExperience(options)
}
