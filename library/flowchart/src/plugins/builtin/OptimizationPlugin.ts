/**
 * 优化插件
 * 
 * 集成所有优化功能到LogicFlow中，提供统一的优化管理界面
 */

import LogicFlow from '@logicflow/core'
import { BasePlugin } from '../BasePlugin'
import { PerformanceMonitor } from '../../optimization/PerformanceMonitor'
import { MemoryManager } from '../../optimization/MemoryManager'
import { UXEnhancer } from '../../optimization/UXEnhancer'
import { MobileAdapter } from '../../optimization/MobileAdapter'
import { AccessibilityManager } from '../../optimization/AccessibilityManager'
import { ErrorHandler } from '../../optimization/ErrorHandler'
import type {
  OptimizationPluginConfig,
  PerformanceMonitorConfig,
  MemoryManagerConfig,
  UXEnhancerConfig,
  MobileAdapterConfig,
  AccessibilityConfig,
  ErrorHandlerConfig
} from '../../optimization/types'

/**
 * 优化插件实现
 */
export class OptimizationPlugin extends BasePlugin {
  static pluginName = 'OptimizationPlugin'
  
  private performanceMonitor?: PerformanceMonitor
  private memoryManager?: MemoryManager
  private uxEnhancer?: UXEnhancer
  private mobileAdapter?: MobileAdapter
  private accessibilityManager?: AccessibilityManager
  private errorHandler?: ErrorHandler
  private toolbarContainer?: HTMLElement
  private statusPanel?: HTMLElement
  private optimizationInterval?: NodeJS.Timeout

  constructor(config: OptimizationPluginConfig = {}) {
    super()
    this.config = {
      enabled: true,
      performance: {
        enabled: true,
        autoOptimize: true,
        thresholds: {
          memory: 80,
          fps: 30,
          loadTime: 3000
        }
      },
      memory: {
        enabled: true,
        autoCleanup: true,
        gcInterval: 30000
      },
      ux: {
        enabled: true,
        animations: {
          enabled: true,
          duration: 300,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
      },
      mobile: {
        enabled: true,
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1200
        }
      },
      accessibility: {
        enabled: true,
        keyboard: {
          enabled: true,
          focusVisible: true
        }
      },
      errorHandling: {
        enabled: true,
        autoRecover: true,
        notification: {
          enabled: true,
          autoHide: true
        }
      },
      ui: {
        showToolbar: true,
        showStatus: true,
        position: 'top-right'
      },
      ...config
    }
  }

  /**
   * 安装插件
   */
  install(lf: LogicFlow): void {
    super.install(lf)

    if (!this.config.enabled) {
      return
    }

    console.log('安装优化插件...')

    // 初始化各个优化组件
    this.initializeComponents()

    // 创建UI界面
    if (this.config.ui.showToolbar) {
      this.createToolbar()
    }

    if (this.config.ui.showStatus) {
      this.createStatusPanel()
    }

    // 设置自动优化
    this.setupAutoOptimization()

    // 监听LogicFlow事件
    this.setupEventListeners()

    console.log('优化插件安装完成')
  }

  /**
   * 卸载插件
   */
  uninstall(): void {
    console.log('卸载优化插件...')

    // 销毁组件
    this.destroyComponents()

    // 清理UI
    this.cleanupUI()

    // 清理定时器
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval)
    }

    super.uninstall()
    console.log('优化插件卸载完成')
  }

  /**
   * 初始化组件
   */
  private initializeComponents(): void {
    // 初始化性能监控器
    if (this.config.performance.enabled) {
      this.performanceMonitor = new PerformanceMonitor(this.config.performance as PerformanceMonitorConfig)
      this.performanceMonitor.start()
    }

    // 初始化内存管理器
    if (this.config.memory.enabled) {
      this.memoryManager = new MemoryManager(this.config.memory as MemoryManagerConfig)
    }

    // 初始化用户体验增强器
    if (this.config.ux.enabled) {
      this.uxEnhancer = new UXEnhancer(this.config.ux as UXEnhancerConfig)
    }

    // 初始化移动端适配器
    if (this.config.mobile.enabled) {
      this.mobileAdapter = new MobileAdapter(this.config.mobile as MobileAdapterConfig)
    }

    // 初始化无障碍管理器
    if (this.config.accessibility.enabled) {
      this.accessibilityManager = new AccessibilityManager(this.config.accessibility as AccessibilityConfig)
    }

    // 初始化错误处理器
    if (this.config.errorHandling.enabled) {
      this.errorHandler = new ErrorHandler(this.config.errorHandling as ErrorHandlerConfig)
    }
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): void {
    this.toolbarContainer = document.createElement('div')
    this.toolbarContainer.className = 'lf-optimization-toolbar'
    this.toolbarContainer.style.cssText = `
      position: fixed;
      ${this.config.ui.position === 'top-right' ? 'top: 10px; right: 10px;' : 'top: 10px; left: 10px;'}
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      display: flex;
      gap: 8px;
      align-items: center;
    `

    // 性能监控按钮
    if (this.performanceMonitor) {
      const perfButton = this.createToolbarButton('📊', '性能监控', () => {
        this.showPerformanceReport()
      })
      this.toolbarContainer.appendChild(perfButton)
    }

    // 内存管理按钮
    if (this.memoryManager) {
      const memoryButton = this.createToolbarButton('🧹', '内存清理', () => {
        this.memoryManager?.cleanup()
      })
      this.toolbarContainer.appendChild(memoryButton)
    }

    // 用户体验按钮
    if (this.uxEnhancer) {
      const uxButton = this.createToolbarButton('✨', 'UX优化', () => {
        this.uxEnhancer?.optimize()
      })
      this.toolbarContainer.appendChild(uxButton)
    }

    // 无障碍按钮
    if (this.accessibilityManager) {
      const a11yButton = this.createToolbarButton('♿', '无障碍', () => {
        this.showAccessibilityPanel()
      })
      this.toolbarContainer.appendChild(a11yButton)
    }

    // 错误历史按钮
    if (this.errorHandler) {
      const errorButton = this.createToolbarButton('🐛', '错误历史', () => {
        this.showErrorHistory()
      })
      this.toolbarContainer.appendChild(errorButton)
    }

    // 设置按钮
    const settingsButton = this.createToolbarButton('⚙️', '优化设置', () => {
      this.showSettingsPanel()
    })
    this.toolbarContainer.appendChild(settingsButton)

    document.body.appendChild(this.toolbarContainer)
  }

  /**
   * 创建工具栏按钮
   */
  private createToolbarButton(icon: string, title: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button')
    button.textContent = icon
    button.title = title
    button.style.cssText = `
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    `
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#f0f0f0'
    })
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent'
    })
    button.onclick = onClick
    return button
  }

  /**
   * 创建状态面板
   */
  private createStatusPanel(): void {
    this.statusPanel = document.createElement('div')
    this.statusPanel.className = 'lf-optimization-status'
    this.statusPanel.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      z-index: 1000;
      min-width: 200px;
    `

    document.body.appendChild(this.statusPanel)
    this.updateStatusPanel()

    // 定期更新状态
    setInterval(() => {
      this.updateStatusPanel()
    }, 1000)
  }

  /**
   * 更新状态面板
   */
  private updateStatusPanel(): void {
    if (!this.statusPanel) return

    const status: string[] = []

    // 性能状态
    if (this.performanceMonitor) {
      const metrics = this.performanceMonitor.getMetrics()
      status.push(`FPS: ${metrics.fps.toFixed(1)}`)
      status.push(`内存: ${(metrics.memory.used / 1024 / 1024).toFixed(1)}MB`)
    }

    // 错误状态
    if (this.errorHandler) {
      const errors = this.errorHandler.getErrorHistory()
      const recentErrors = errors.filter(e => Date.now() - e.timestamp < 60000)
      if (recentErrors.length > 0) {
        status.push(`错误: ${recentErrors.length}`)
      }
    }

    // 设备信息
    if (this.mobileAdapter) {
      const deviceInfo = this.mobileAdapter.getDeviceInfo()
      status.push(`设备: ${deviceInfo.type}`)
    }

    this.statusPanel.innerHTML = status.join(' | ')
  }

  /**
   * 设置自动优化
   */
  private setupAutoOptimization(): void {
    if (!this.config.performance.autoOptimize) {
      return
    }

    this.optimizationInterval = setInterval(() => {
      this.performAutoOptimization()
    }, 10000) // 每10秒检查一次
  }

  /**
   * 执行自动优化
   */
  private async performAutoOptimization(): Promise<void> {
    try {
      // 检查性能指标
      if (this.performanceMonitor) {
        const metrics = this.performanceMonitor.getMetrics()
        
        // 内存使用率过高
        if (metrics.memory.percentage > this.config.performance.thresholds.memory) {
          console.log('内存使用率过高，执行清理')
          await this.memoryManager?.cleanup()
        }

        // FPS过低
        if (metrics.fps < this.config.performance.thresholds.fps) {
          console.log('FPS过低，优化用户体验')
          await this.uxEnhancer?.optimize()
        }
      }

      // 检查错误情况
      if (this.errorHandler) {
        const errors = this.errorHandler.getErrorHistory()
        const recentErrors = errors.filter(e => Date.now() - e.timestamp < 60000 && !e.recovered)
        
        for (const error of recentErrors) {
          await this.errorHandler.recover(error.id)
        }
      }
    } catch (error) {
      console.error('自动优化失败:', error)
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.lf) return

    // 监听节点变化
    this.lf.on('node:add,node:delete,node:update', () => {
      // 节点变化时触发性能检查
      if (this.performanceMonitor) {
        this.performanceMonitor.recordInteraction('node_operation')
      }
    })

    // 监听边变化
    this.lf.on('edge:add,edge:delete,edge:update', () => {
      if (this.performanceMonitor) {
        this.performanceMonitor.recordInteraction('edge_operation')
      }
    })

    // 监听画布操作
    this.lf.on('graph:transform', () => {
      if (this.performanceMonitor) {
        this.performanceMonitor.recordInteraction('canvas_transform')
      }
    })
  }

  /**
   * 显示性能报告
   */
  private showPerformanceReport(): void {
    if (!this.performanceMonitor) return

    const metrics = this.performanceMonitor.getMetrics()
    const report = this.performanceMonitor.generateReport()

    const modal = this.createModal('性能报告', `
      <div style="font-family: monospace; font-size: 14px;">
        <h4>实时指标</h4>
        <p>FPS: ${metrics.fps.toFixed(1)}</p>
        <p>内存使用: ${(metrics.memory.used / 1024 / 1024).toFixed(1)}MB (${metrics.memory.percentage.toFixed(1)}%)</p>
        <p>CPU使用: ${metrics.cpu.toFixed(1)}%</p>
        
        <h4>性能评分</h4>
        <p>总分: ${report.score}/100</p>
        
        <h4>建议</h4>
        <ul>
          ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    `)

    document.body.appendChild(modal)
  }

  /**
   * 显示无障碍面板
   */
  private showAccessibilityPanel(): void {
    if (!this.accessibilityManager) return

    const modal = this.createModal('无障碍设置', `
      <div>
        <label>
          <input type="checkbox" id="highContrast"> 高对比度
        </label><br><br>
        <label>
          <input type="checkbox" id="largeText"> 大字体
        </label><br><br>
        <label>
          <input type="checkbox" id="reducedMotion"> 减少动画
        </label><br><br>
        <button onclick="this.closest('.modal').querySelector('#auditBtn').click()">执行无障碍审计</button>
        <button id="auditBtn" style="display:none" onclick="window.optimizationPlugin.runAccessibilityAudit()">审计</button>
      </div>
    `)

    // 设置事件监听器
    const highContrastCheckbox = modal.querySelector('#highContrast') as HTMLInputElement
    highContrastCheckbox.onchange = () => {
      this.accessibilityManager?.applyHighContrast(highContrastCheckbox.checked)
    }

    document.body.appendChild(modal)
    
    // 临时设置全局引用以便按钮调用
    ;(window as any).optimizationPlugin = this
  }

  /**
   * 运行无障碍审计
   */
  async runAccessibilityAudit(): Promise<void> {
    if (!this.accessibilityManager) return

    const audit = await this.accessibilityManager.audit()
    
    const modal = this.createModal('无障碍审计结果', `
      <div>
        <h4>评分: ${audit.score}/100</h4>
        <h4>问题 (${audit.issues.length})</h4>
        <ul>
          ${audit.issues.map(issue => `<li>${issue.description}</li>`).join('')}
        </ul>
        <h4>建议</h4>
        <ul>
          ${audit.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    `)

    document.body.appendChild(modal)
  }

  /**
   * 显示错误历史
   */
  private showErrorHistory(): void {
    if (!this.errorHandler) return

    const errors = this.errorHandler.getErrorHistory()
    
    const modal = this.createModal('错误历史', `
      <div>
        <p>总错误数: ${errors.length}</p>
        <div style="max-height: 300px; overflow-y: auto;">
          ${errors.map(error => `
            <div style="border: 1px solid #ddd; padding: 8px; margin: 4px 0; border-radius: 4px;">
              <strong>${error.type}</strong> - ${error.message}
              <br><small>${new Date(error.timestamp).toLocaleString()}</small>
              ${error.recovered ? '<span style="color: green;">✓ 已恢复</span>' : '<span style="color: red;">✗ 未恢复</span>'}
            </div>
          `).join('')}
        </div>
        <button onclick="window.optimizationPlugin.clearErrors()">清除历史</button>
      </div>
    `)

    document.body.appendChild(modal)
  }

  /**
   * 清除错误历史
   */
  clearErrors(): void {
    this.errorHandler?.clearErrors()
    document.querySelector('.modal')?.remove()
  }

  /**
   * 显示设置面板
   */
  private showSettingsPanel(): void {
    const modal = this.createModal('优化设置', `
      <div>
        <h4>性能监控</h4>
        <label>
          <input type="checkbox" id="perfEnabled" ${this.config.performance.enabled ? 'checked' : ''}> 启用性能监控
        </label><br>
        <label>
          <input type="checkbox" id="autoOptimize" ${this.config.performance.autoOptimize ? 'checked' : ''}> 自动优化
        </label><br><br>
        
        <h4>内存管理</h4>
        <label>
          <input type="checkbox" id="memoryEnabled" ${this.config.memory.enabled ? 'checked' : ''}> 启用内存管理
        </label><br>
        <label>
          <input type="checkbox" id="autoCleanup" ${this.config.memory.autoCleanup ? 'checked' : ''}> 自动清理
        </label><br><br>
        
        <h4>用户体验</h4>
        <label>
          <input type="checkbox" id="uxEnabled" ${this.config.ux.enabled ? 'checked' : ''}> 启用UX增强
        </label><br>
        <label>
          <input type="checkbox" id="animations" ${this.config.ux.animations?.enabled ? 'checked' : ''}> 启用动画
        </label><br><br>
        
        <button onclick="window.optimizationPlugin.saveSettings()">保存设置</button>
      </div>
    `)

    document.body.appendChild(modal)
  }

  /**
   * 保存设置
   */
  saveSettings(): void {
    const modal = document.querySelector('.modal')
    if (!modal) return

    // 更新配置
    this.config.performance.enabled = (modal.querySelector('#perfEnabled') as HTMLInputElement).checked
    this.config.performance.autoOptimize = (modal.querySelector('#autoOptimize') as HTMLInputElement).checked
    this.config.memory.enabled = (modal.querySelector('#memoryEnabled') as HTMLInputElement).checked
    this.config.memory.autoCleanup = (modal.querySelector('#autoCleanup') as HTMLInputElement).checked
    this.config.ux.enabled = (modal.querySelector('#uxEnabled') as HTMLInputElement).checked
    if (this.config.ux.animations) {
      this.config.ux.animations.enabled = (modal.querySelector('#animations') as HTMLInputElement).checked
    }

    // 重新初始化组件
    this.destroyComponents()
    this.initializeComponents()

    modal.remove()
    console.log('优化设置已保存')
  }

  /**
   * 创建模态框
   */
  private createModal(title: string, content: string): HTMLElement {
    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    const modalContent = document.createElement('div')
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 600px;
      max-height: 80%;
      overflow: auto;
      position: relative;
    `

    modalContent.innerHTML = `
      <h3>${title}</h3>
      ${content}
      <button onclick="this.closest('.modal').remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
    `

    modal.appendChild(modalContent)

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    }

    return modal
  }

  /**
   * 销毁组件
   */
  private destroyComponents(): void {
    this.performanceMonitor?.destroy()
    this.memoryManager?.destroy()
    this.uxEnhancer?.destroy()
    this.mobileAdapter?.destroy()
    this.accessibilityManager?.destroy()
    this.errorHandler?.destroy()

    this.performanceMonitor = undefined
    this.memoryManager = undefined
    this.uxEnhancer = undefined
    this.mobileAdapter = undefined
    this.accessibilityManager = undefined
    this.errorHandler = undefined
  }

  /**
   * 清理UI
   */
  private cleanupUI(): void {
    this.toolbarContainer?.remove()
    this.statusPanel?.remove()
    this.toolbarContainer = undefined
    this.statusPanel = undefined
  }
}
