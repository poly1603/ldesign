/**
 * 数据绑定插件
 * 
 * 为流程图编辑器提供数据绑定功能
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'
import {
  DataBindingManager,
  type DataSource,
  type DataSourceConfig,
  type DataBinding,
  type DataBindingConfig,
  type DataUpdateEvent,
  type BindingUpdateEvent
} from '../../databinding'

/**
 * 数据绑定插件配置
 */
export interface DataBindingPluginConfig extends Partial<DataBindingConfig> {
  /** 是否显示数据绑定面板 */
  showBindingPanel?: boolean
  /** 面板位置 */
  panelPosition?: 'top' | 'right' | 'bottom' | 'left'
  /** 是否启用实时预览 */
  enableLivePreview?: boolean
  /** 是否显示绑定指示器 */
  showBindingIndicators?: boolean
}

/**
 * 数据绑定插件类
 */
export class DataBindingPlugin extends BasePlugin<DataBindingPluginConfig> {
  readonly name = 'data-binding'
  readonly version = '1.0.0'
  readonly description = '数据绑定功能插件'

  private bindingManager?: DataBindingManager
  private bindingPanel?: HTMLElement
  private config?: DataBindingPluginConfig
  private isEnabled: boolean = false

  /**
   * 安装插件
   */
  protected onInstall(): void {
    if (!this.editor) {
      throw new Error('编辑器实例未找到')
    }

    // 监听编辑器事件
    this.setupEditorEventListeners()
    
    console.log('数据绑定插件安装完成')
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    this.disableDataBinding()
    this.removeEditorEventListeners()
    this.removeBindingPanel()
    
    console.log('数据绑定插件卸载完成')
  }

  /**
   * 启用数据绑定功能
   */
  async enableDataBinding(config?: DataBindingPluginConfig): Promise<void> {
    if (this.isEnabled) {
      return
    }

    this.config = {
      enabled: true,
      defaultPollInterval: 30000,
      defaultCacheExpiry: 300000,
      maxConcurrentConnections: 10,
      defaultTimeout: 10000,
      debugMode: false,
      builtinTransformers: [],
      builtinValidators: [],
      showBindingPanel: true,
      panelPosition: 'right',
      enableLivePreview: true,
      showBindingIndicators: true,
      ...config
    }

    try {
      // 创建数据绑定管理器
      this.bindingManager = new DataBindingManager(this.config)
      
      // 设置事件监听器
      this.setupBindingEventListeners()
      
      // 创建数据绑定面板
      if (this.config.showBindingPanel) {
        this.createBindingPanel()
      }
      
      this.isEnabled = true
      
      // 触发数据绑定启用事件
      this.editor!.emit('data-binding:enabled')
      
      console.log('数据绑定功能启用成功')
    } catch (error) {
      console.error('启用数据绑定功能失败:', error)
      throw error
    }
  }

  /**
   * 禁用数据绑定功能
   */
  disableDataBinding(): void {
    if (!this.isEnabled) {
      return
    }

    try {
      // 移除数据绑定面板
      this.removeBindingPanel()
      
      // 移除事件监听器
      this.removeBindingEventListeners()
      
      this.bindingManager = undefined
      this.isEnabled = false
      
      // 触发数据绑定禁用事件
      this.editor!.emit('data-binding:disabled')
      
      console.log('数据绑定功能已禁用')
    } catch (error) {
      console.error('禁用数据绑定功能失败:', error)
    }
  }

  /**
   * 添加数据源
   */
  async addDataSource(config: DataSourceConfig): Promise<DataSource> {
    if (!this.bindingManager) {
      throw new Error('数据绑定功能未启用')
    }

    return this.bindingManager.addDataSource(config)
  }

  /**
   * 移除数据源
   */
  async removeDataSource(id: string): Promise<void> {
    if (!this.bindingManager) {
      throw new Error('数据绑定功能未启用')
    }

    return this.bindingManager.removeDataSource(id)
  }

  /**
   * 获取数据源列表
   */
  getDataSources(): DataSource[] {
    if (!this.bindingManager) {
      return []
    }

    return this.bindingManager.getDataSources()
  }

  /**
   * 添加数据绑定
   */
  async addBinding(binding: DataBinding): Promise<void> {
    if (!this.bindingManager) {
      throw new Error('数据绑定功能未启用')
    }

    return this.bindingManager.addBinding(binding)
  }

  /**
   * 移除数据绑定
   */
  async removeBinding(id: string): Promise<void> {
    if (!this.bindingManager) {
      throw new Error('数据绑定功能未启用')
    }

    return this.bindingManager.removeBinding(id)
  }

  /**
   * 获取节点的绑定
   */
  getNodeBindings(nodeId: string): DataBinding[] {
    if (!this.bindingManager) {
      return []
    }

    return this.bindingManager.getNodeBindings(nodeId)
  }

  /**
   * 刷新所有绑定
   */
  async refreshAllBindings(): Promise<void> {
    if (!this.bindingManager) {
      throw new Error('数据绑定功能未启用')
    }

    return this.bindingManager.refreshAllBindings()
  }

  /**
   * 设置编辑器事件监听器
   */
  private setupEditorEventListeners(): void {
    if (!this.editor) return

    // 监听节点选择
    this.editor.on('node:selected', this.handleNodeSelected)
    
    // 监听节点删除
    this.editor.on('node:deleted', this.handleNodeDeleted)
  }

  /**
   * 移除编辑器事件监听器
   */
  private removeEditorEventListeners(): void {
    if (!this.editor) return

    this.editor.off('node:selected', this.handleNodeSelected)
    this.editor.off('node:deleted', this.handleNodeDeleted)
  }

  /**
   * 设置数据绑定事件监听器
   */
  private setupBindingEventListeners(): void {
    if (!this.bindingManager) return

    this.bindingManager.on('datasource:connected', this.handleDataSourceConnected)
    this.bindingManager.on('datasource:disconnected', this.handleDataSourceDisconnected)
    this.bindingManager.on('datasource:error', this.handleDataSourceError)
    this.bindingManager.on('datasource:data-updated', this.handleDataUpdated)
    this.bindingManager.on('binding:created', this.handleBindingCreated)
    this.bindingManager.on('binding:updated', this.handleBindingUpdated)
    this.bindingManager.on('binding:removed', this.handleBindingRemoved)
    this.bindingManager.on('binding:error', this.handleBindingError)
  }

  /**
   * 移除数据绑定事件监听器
   */
  private removeBindingEventListeners(): void {
    if (!this.bindingManager) return

    this.bindingManager.off('datasource:connected', this.handleDataSourceConnected)
    this.bindingManager.off('datasource:disconnected', this.handleDataSourceDisconnected)
    this.bindingManager.off('datasource:error', this.handleDataSourceError)
    this.bindingManager.off('datasource:data-updated', this.handleDataUpdated)
    this.bindingManager.off('binding:created', this.handleBindingCreated)
    this.bindingManager.off('binding:updated', this.handleBindingUpdated)
    this.bindingManager.off('binding:removed', this.handleBindingRemoved)
    this.bindingManager.off('binding:error', this.handleBindingError)
  }

  /**
   * 创建数据绑定面板
   */
  private createBindingPanel(): void {
    this.bindingPanel = document.createElement('div')
    this.bindingPanel.className = 'flowchart-binding-panel'
    this.bindingPanel.innerHTML = `
      <div class="binding-panel-header">
        <h3>数据绑定</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="binding-tabs">
        <button class="tab-btn active" data-tab="datasources">数据源</button>
        <button class="tab-btn" data-tab="bindings">绑定</button>
        <button class="tab-btn" data-tab="preview">预览</button>
      </div>
      <div class="binding-content">
        <div class="tab-content active" id="datasources-tab">
          <div class="datasource-actions">
            <button class="add-datasource-btn">添加数据源</button>
            <button class="refresh-datasources-btn">刷新</button>
          </div>
          <div class="datasource-list">
            <!-- 数据源列表将在这里动态生成 -->
          </div>
        </div>
        <div class="tab-content" id="bindings-tab">
          <div class="binding-actions">
            <button class="add-binding-btn">添加绑定</button>
            <button class="refresh-bindings-btn">刷新所有</button>
          </div>
          <div class="binding-list">
            <!-- 绑定列表将在这里动态生成 -->
          </div>
        </div>
        <div class="tab-content" id="preview-tab">
          <div class="preview-content">
            <!-- 预览内容将在这里显示 -->
          </div>
        </div>
      </div>
    `
    
    // 添加样式
    this.addBindingPanelStyles()
    
    // 添加事件监听器
    this.setupBindingPanelEventListeners()
    
    // 添加到编辑器容器
    const editorContainer = this.editor!.getContainer()
    editorContainer.appendChild(this.bindingPanel)
    
    // 初始化面板内容
    this.updateBindingPanel()
  }

  /**
   * 移除数据绑定面板
   */
  private removeBindingPanel(): void {
    if (this.bindingPanel) {
      this.bindingPanel.remove()
      this.bindingPanel = undefined
    }
  }

  /**
   * 添加数据绑定面板样式
   */
  private addBindingPanelStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .flowchart-binding-panel {
        position: absolute;
        top: 10px;
        right: 320px;
        width: 350px;
        height: 600px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }
      
      .binding-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .binding-tabs {
        display: flex;
        border-bottom: 1px solid #eee;
      }
      
      .tab-btn {
        flex: 1;
        padding: 10px;
        border: none;
        background: none;
        cursor: pointer;
      }
      
      .tab-btn.active {
        background: #f5f5f5;
        border-bottom: 2px solid #007bff;
      }
      
      .binding-content {
        flex: 1;
        overflow: hidden;
      }
      
      .tab-content {
        display: none;
        height: 100%;
        padding: 10px;
        overflow-y: auto;
      }
      
      .tab-content.active {
        display: block;
      }
      
      .datasource-actions, .binding-actions {
        margin-bottom: 10px;
      }
      
      .datasource-actions button, .binding-actions button {
        margin-right: 5px;
        padding: 5px 10px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background: white;
        cursor: pointer;
      }
      
      .datasource-item, .binding-item {
        padding: 8px;
        border: 1px solid #eee;
        border-radius: 3px;
        margin-bottom: 5px;
        cursor: pointer;
      }
      
      .datasource-item:hover, .binding-item:hover {
        background: #f5f5f5;
      }
      
      .datasource-item.connected {
        border-left: 4px solid #28a745;
      }
      
      .datasource-item.error {
        border-left: 4px solid #dc3545;
      }
      
      .binding-item.enabled {
        border-left: 4px solid #007bff;
      }
      
      .binding-item.disabled {
        border-left: 4px solid #6c757d;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 设置数据绑定面板事件监听器
   */
  private setupBindingPanelEventListeners(): void {
    if (!this.bindingPanel) return

    // 关闭按钮
    const closeBtn = this.bindingPanel.querySelector('.close-btn')
    closeBtn?.addEventListener('click', () => this.removeBindingPanel())

    // 标签切换
    const tabBtns = this.bindingPanel.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab')
        this.switchTab(tab!)
      })
    })

    // 添加数据源按钮
    const addDataSourceBtn = this.bindingPanel.querySelector('.add-datasource-btn')
    addDataSourceBtn?.addEventListener('click', () => this.showAddDataSourceDialog())

    // 添加绑定按钮
    const addBindingBtn = this.bindingPanel.querySelector('.add-binding-btn')
    addBindingBtn?.addEventListener('click', () => this.showAddBindingDialog())

    // 刷新按钮
    const refreshDataSourcesBtn = this.bindingPanel.querySelector('.refresh-datasources-btn')
    refreshDataSourcesBtn?.addEventListener('click', () => this.updateBindingPanel())

    const refreshBindingsBtn = this.bindingPanel.querySelector('.refresh-bindings-btn')
    refreshBindingsBtn?.addEventListener('click', () => this.refreshAllBindings())
  }

  /**
   * 切换标签
   */
  private switchTab(tab: string): void {
    if (!this.bindingPanel) return

    // 更新标签按钮状态
    const tabBtns = this.bindingPanel.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab)
    })

    // 更新内容显示
    const tabContents = this.bindingPanel.querySelectorAll('.tab-content')
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tab}-tab`)
    })
  }

  /**
   * 更新数据绑定面板
   */
  private async updateBindingPanel(): Promise<void> {
    if (!this.bindingPanel) return

    try {
      // 更新数据源列表
      await this.updateDataSourceList()
      
      // 更新绑定列表
      await this.updateBindingList()
      
      // 更新预览
      await this.updatePreview()
    } catch (error) {
      console.error('更新数据绑定面板失败:', error)
    }
  }

  /**
   * 更新数据源列表
   */
  private async updateDataSourceList(): Promise<void> {
    if (!this.bindingPanel || !this.bindingManager) return

    const dataSourceList = this.bindingPanel.querySelector('.datasource-list')
    if (!dataSourceList) return

    const dataSources = this.getDataSources()

    dataSourceList.innerHTML = dataSources.map(dataSource => `
      <div class="datasource-item ${dataSource.status}" data-datasource-id="${dataSource.config.id}">
        <div class="datasource-name">${dataSource.config.name}</div>
        <div class="datasource-info">
          <small>${dataSource.config.type} • ${dataSource.status}</small>
        </div>
        <div class="datasource-url">${dataSource.config.url || ''}</div>
      </div>
    `).join('')

    // 添加数据源项点击事件
    const dataSourceItems = dataSourceList.querySelectorAll('.datasource-item')
    dataSourceItems.forEach(item => {
      item.addEventListener('click', () => {
        const dataSourceId = item.getAttribute('data-datasource-id')
        if (dataSourceId) {
          this.showDataSourceDetails(dataSourceId)
        }
      })
    })
  }

  /**
   * 更新绑定列表
   */
  private async updateBindingList(): Promise<void> {
    // TODO: 实现绑定列表更新
  }

  /**
   * 更新预览
   */
  private async updatePreview(): Promise<void> {
    // TODO: 实现预览更新
  }

  /**
   * 显示添加数据源对话框
   */
  private showAddDataSourceDialog(): void {
    // TODO: 实现添加数据源对话框
  }

  /**
   * 显示添加绑定对话框
   */
  private showAddBindingDialog(): void {
    // TODO: 实现添加绑定对话框
  }

  /**
   * 显示数据源详情
   */
  private showDataSourceDetails(dataSourceId: string): void {
    // TODO: 实现数据源详情显示
  }

  // 事件处理器
  private handleNodeSelected = (nodeId: string): void => {
    // 节点选择时更新绑定面板
    this.updateBindingPanel()
  }

  private handleNodeDeleted = (nodeId: string): void => {
    // 节点删除时移除相关绑定
    const bindings = this.getNodeBindings(nodeId)
    for (const binding of bindings) {
      this.removeBinding(binding.id).catch(error => {
        console.error(`移除绑定 ${binding.id} 失败:`, error)
      })
    }
  }

  private handleDataSourceConnected = (dataSource: DataSource): void => {
    this.editor!.emit('datasource:connected', dataSource)
    this.updateBindingPanel()
  }

  private handleDataSourceDisconnected = (dataSource: DataSource): void => {
    this.editor!.emit('datasource:disconnected', dataSource)
    this.updateBindingPanel()
  }

  private handleDataSourceError = (dataSource: DataSource, error: Error): void => {
    this.editor!.emit('datasource:error', dataSource, error)
    this.updateBindingPanel()
  }

  private handleDataUpdated = (event: DataUpdateEvent): void => {
    this.editor!.emit('data:updated', event)
    if (this.config?.enableLivePreview) {
      this.updatePreview()
    }
  }

  private handleBindingCreated = (binding: DataBinding): void => {
    this.editor!.emit('binding:created', binding)
    this.updateBindingPanel()
  }

  private handleBindingUpdated = (event: BindingUpdateEvent): void => {
    this.editor!.emit('binding:updated', event)
    if (this.config?.enableLivePreview) {
      this.updatePreview()
    }
  }

  private handleBindingRemoved = (bindingId: string): void => {
    this.editor!.emit('binding:removed', bindingId)
    this.updateBindingPanel()
  }

  private handleBindingError = (binding: DataBinding, error: Error): void => {
    this.editor!.emit('binding:error', binding, error)
  }
}
