/**
 * 自动布局插件
 * 
 * 为流程图编辑器提供智能自动布局功能
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'
import {
  AutoLayoutEngine,
  type LayoutConfig,
  type LayoutResult,
  type LayoutSuggestion,
  type LayoutTemplate,
  type LayoutOptimizationOptions
} from '../../layout'

/**
 * 自动布局插件配置
 */
export interface AutoLayoutPluginConfig {
  /** 是否启用自动布局建议 */
  enableSuggestions?: boolean
  /** 是否显示布局工具栏 */
  showLayoutToolbar?: boolean
  /** 工具栏位置 */
  toolbarPosition?: 'top' | 'right' | 'bottom' | 'left'
  /** 是否启用快捷键 */
  enableShortcuts?: boolean
  /** 默认布局配置 */
  defaultLayoutConfig?: Partial<LayoutConfig>
  /** 是否启用布局历史 */
  enableLayoutHistory?: boolean
  /** 是否启用布局预览 */
  enableLayoutPreview?: boolean
}

/**
 * 自动布局插件类
 */
export class AutoLayoutPlugin extends BasePlugin<AutoLayoutPluginConfig> {
  readonly name = 'auto-layout'
  readonly version = '1.0.0'
  readonly description = '智能自动布局功能插件'

  private layoutEngine?: AutoLayoutEngine
  private layoutToolbar?: HTMLElement
  private config?: AutoLayoutPluginConfig
  private isEnabled: boolean = false
  private currentLayout?: LayoutResult

  /**
   * 安装插件
   */
  protected onInstall(): void {
    if (!this.editor) {
      throw new Error('编辑器实例未找到')
    }

    // 监听编辑器事件
    this.setupEditorEventListeners()
    
    console.log('自动布局插件安装完成')
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    this.disableAutoLayout()
    this.removeEditorEventListeners()
    this.removeLayoutToolbar()
    
    console.log('自动布局插件卸载完成')
  }

  /**
   * 启用自动布局功能
   */
  async enableAutoLayout(config?: AutoLayoutPluginConfig): Promise<void> {
    if (this.isEnabled) {
      return
    }

    this.config = {
      enableSuggestions: true,
      showLayoutToolbar: true,
      toolbarPosition: 'top',
      enableShortcuts: true,
      enableLayoutHistory: true,
      enableLayoutPreview: true,
      defaultLayoutConfig: {
        algorithm: 'hierarchical',
        direction: 'TB',
        animated: true,
        animationDuration: 1000
      },
      ...config
    }

    try {
      // 创建布局引擎
      this.layoutEngine = new AutoLayoutEngine()
      
      // 设置布局引擎事件监听器
      this.setupLayoutEngineEventListeners()
      
      // 创建布局工具栏
      if (this.config.showLayoutToolbar) {
        this.createLayoutToolbar()
      }
      
      // 设置快捷键
      if (this.config.enableShortcuts) {
        this.setupShortcuts()
      }
      
      this.isEnabled = true
      
      // 触发布局启用事件
      this.editor!.emit('layout:enabled')
      
      console.log('自动布局功能启用成功')
    } catch (error) {
      console.error('启用自动布局功能失败:', error)
      throw error
    }
  }

  /**
   * 禁用自动布局功能
   */
  disableAutoLayout(): void {
    if (!this.isEnabled) {
      return
    }

    try {
      // 移除布局工具栏
      this.removeLayoutToolbar()
      
      // 移除快捷键
      this.removeShortcuts()
      
      // 移除事件监听器
      this.removeLayoutEngineEventListeners()
      
      this.layoutEngine = undefined
      this.isEnabled = false
      
      // 触发布局禁用事件
      this.editor!.emit('layout:disabled')
      
      console.log('自动布局功能已禁用')
    } catch (error) {
      console.error('禁用自动布局功能失败:', error)
    }
  }

  /**
   * 应用布局
   */
  async applyLayout(config?: LayoutConfig): Promise<LayoutResult> {
    if (!this.layoutEngine) {
      throw new Error('自动布局功能未启用')
    }

    const layoutConfig = { ...this.config?.defaultLayoutConfig, ...config }
    const flowchartData = this.editor!.getData()
    
    const result = await this.layoutEngine.applyLayout(flowchartData, layoutConfig)
    
    // 应用布局结果到编辑器
    await this.applyLayoutResult(result)
    
    this.currentLayout = result
    return result
  }

  /**
   * 获取布局建议
   */
  async getLayoutSuggestions(): Promise<LayoutSuggestion[]> {
    if (!this.layoutEngine) {
      throw new Error('自动布局功能未启用')
    }

    const flowchartData = this.editor!.getData()
    return this.layoutEngine.getLayoutSuggestions(flowchartData)
  }

  /**
   * 应用布局建议
   */
  async applySuggestion(suggestion: LayoutSuggestion): Promise<LayoutResult> {
    return this.applyLayout(suggestion.config)
  }

  /**
   * 优化当前布局
   */
  async optimizeLayout(options?: LayoutOptimizationOptions): Promise<LayoutResult> {
    if (!this.layoutEngine) {
      throw new Error('自动布局功能未启用')
    }

    const flowchartData = this.editor!.getData()
    const optimizationOptions = {
      objectives: ['minimize-crossings', 'maximize-readability'],
      maxIterations: 100,
      ...options
    }
    
    const result = await this.layoutEngine.optimizeLayout(flowchartData, optimizationOptions)
    
    // 应用优化结果到编辑器
    await this.applyLayoutResult(result)
    
    this.currentLayout = result
    return result
  }

  /**
   * 获取布局模板
   */
  getLayoutTemplates(): LayoutTemplate[] {
    if (!this.layoutEngine) {
      return []
    }

    return this.layoutEngine.getLayoutTemplates()
  }

  /**
   * 应用布局模板
   */
  async applyLayoutTemplate(template: LayoutTemplate): Promise<LayoutResult> {
    if (!this.layoutEngine) {
      throw new Error('自动布局功能未启用')
    }

    const flowchartData = this.editor!.getData()
    const result = await this.layoutEngine.applyLayoutTemplate(flowchartData, template)
    
    // 应用布局结果到编辑器
    await this.applyLayoutResult(result)
    
    this.currentLayout = result
    return result
  }

  /**
   * 预览布局效果
   */
  async previewLayout(config: LayoutConfig): Promise<LayoutResult> {
    if (!this.layoutEngine) {
      throw new Error('自动布局功能未启用')
    }

    const flowchartData = this.editor!.getData()
    return this.layoutEngine.previewLayout(flowchartData, config)
  }

  /**
   * 获取布局历史
   */
  getLayoutHistory(): any[] {
    if (!this.layoutEngine) {
      return []
    }

    return this.layoutEngine.getLayoutHistory()
  }

  /**
   * 设置编辑器事件监听器
   */
  private setupEditorEventListeners(): void {
    if (!this.editor) return

    // 监听数据变化，提供布局建议
    this.editor.on('data:change', this.handleDataChange)
  }

  /**
   * 移除编辑器事件监听器
   */
  private removeEditorEventListeners(): void {
    if (!this.editor) return

    this.editor.off('data:change', this.handleDataChange)
  }

  /**
   * 设置布局引擎事件监听器
   */
  private setupLayoutEngineEventListeners(): void {
    if (!this.layoutEngine) return

    this.layoutEngine.on('layout:started', this.handleLayoutStarted)
    this.layoutEngine.on('layout:completed', this.handleLayoutCompleted)
    this.layoutEngine.on('layout:failed', this.handleLayoutFailed)
  }

  /**
   * 移除布局引擎事件监听器
   */
  private removeLayoutEngineEventListeners(): void {
    if (!this.layoutEngine) return

    this.layoutEngine.off('layout:started', this.handleLayoutStarted)
    this.layoutEngine.off('layout:completed', this.handleLayoutCompleted)
    this.layoutEngine.off('layout:failed', this.handleLayoutFailed)
  }

  /**
   * 创建布局工具栏
   */
  private createLayoutToolbar(): void {
    this.layoutToolbar = document.createElement('div')
    this.layoutToolbar.className = 'flowchart-layout-toolbar'
    this.layoutToolbar.innerHTML = `
      <div class="layout-toolbar-header">
        <h3>自动布局</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="layout-algorithms">
        <button class="layout-btn" data-algorithm="hierarchical">层次布局</button>
        <button class="layout-btn" data-algorithm="force-directed">力导向布局</button>
        <button class="layout-btn" data-algorithm="circular">圆形布局</button>
        <button class="layout-btn" data-algorithm="grid">网格布局</button>
        <button class="layout-btn" data-algorithm="tree">树形布局</button>
      </div>
      <div class="layout-actions">
        <button class="optimize-btn">优化布局</button>
        <button class="suggestions-btn">获取建议</button>
      </div>
    `
    
    // 添加样式
    this.addLayoutToolbarStyles()
    
    // 添加事件监听器
    this.setupLayoutToolbarEventListeners()
    
    // 添加到编辑器容器
    const editorContainer = this.editor!.getContainer()
    editorContainer.appendChild(this.layoutToolbar)
  }

  /**
   * 移除布局工具栏
   */
  private removeLayoutToolbar(): void {
    if (this.layoutToolbar) {
      this.layoutToolbar.remove()
      this.layoutToolbar = undefined
    }
  }

  /**
   * 添加布局工具栏样式
   */
  private addLayoutToolbarStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .flowchart-layout-toolbar {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 200px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        padding: 10px;
      }
      
      .layout-toolbar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .layout-algorithms {
        margin-bottom: 10px;
      }
      
      .layout-btn, .optimize-btn, .suggestions-btn {
        width: 100%;
        padding: 8px;
        margin-bottom: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: white;
        cursor: pointer;
      }
      
      .layout-btn:hover, .optimize-btn:hover, .suggestions-btn:hover {
        background: #f5f5f5;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 设置布局工具栏事件监听器
   */
  private setupLayoutToolbarEventListeners(): void {
    if (!this.layoutToolbar) return

    // 关闭按钮
    const closeBtn = this.layoutToolbar.querySelector('.close-btn')
    closeBtn?.addEventListener('click', () => this.removeLayoutToolbar())

    // 布局算法按钮
    const layoutBtns = this.layoutToolbar.querySelectorAll('.layout-btn')
    layoutBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const algorithm = btn.getAttribute('data-algorithm')
        if (algorithm) {
          try {
            await this.applyLayout({ algorithm } as LayoutConfig)
          } catch (error) {
            console.error('应用布局失败:', error)
          }
        }
      })
    })

    // 优化按钮
    const optimizeBtn = this.layoutToolbar.querySelector('.optimize-btn')
    optimizeBtn?.addEventListener('click', async () => {
      try {
        await this.optimizeLayout()
      } catch (error) {
        console.error('优化布局失败:', error)
      }
    })

    // 建议按钮
    const suggestionsBtn = this.layoutToolbar.querySelector('.suggestions-btn')
    suggestionsBtn?.addEventListener('click', async () => {
      try {
        const suggestions = await this.getLayoutSuggestions()
        this.showLayoutSuggestions(suggestions)
      } catch (error) {
        console.error('获取布局建议失败:', error)
      }
    })
  }

  /**
   * 显示布局建议
   */
  private showLayoutSuggestions(suggestions: LayoutSuggestion[]): void {
    // 简化实现，实际应该创建一个建议面板
    console.log('布局建议:', suggestions)
    
    if (suggestions.length > 0) {
      const bestSuggestion = suggestions[0]
      const apply = confirm(`建议使用 ${bestSuggestion.algorithm} 布局\n原因: ${bestSuggestion.reason}\n是否应用？`)
      
      if (apply) {
        this.applySuggestion(bestSuggestion)
      }
    }
  }

  /**
   * 应用布局结果到编辑器
   */
  private async applyLayoutResult(result: LayoutResult): Promise<void> {
    // 更新节点位置
    for (const [nodeId, position] of Object.entries(result.nodePositions)) {
      this.editor!.emit('node:position:update', {
        nodeId,
        position,
        animated: result.config.animated
      })
    }
    
    // 如果有边路径，更新边
    if (result.edgePaths) {
      for (const [edgeId, path] of Object.entries(result.edgePaths)) {
        this.editor!.emit('edge:path:update', {
          edgeId,
          path
        })
      }
    }
  }

  /**
   * 设置快捷键
   */
  private setupShortcuts(): void {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * 移除快捷键
   */
  private removeShortcuts(): void {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  // 事件处理器
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      this.applyLayout()
    }
  }

  private handleDataChange = async (): Promise<void> => {
    if (this.config?.enableSuggestions) {
      // 延迟提供建议，避免频繁计算
      setTimeout(async () => {
        try {
          const suggestions = await this.getLayoutSuggestions()
          this.editor!.emit('layout:suggestions', suggestions)
        } catch (error) {
          console.error('获取布局建议失败:', error)
        }
      }, 1000)
    }
  }

  private handleLayoutStarted = (config: LayoutConfig): void => {
    this.editor!.emit('layout:started', config)
  }

  private handleLayoutCompleted = (result: LayoutResult): void => {
    this.editor!.emit('layout:completed', result)
  }

  private handleLayoutFailed = (error: Error): void => {
    this.editor!.emit('layout:failed', error)
  }
}
