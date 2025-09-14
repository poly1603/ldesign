/**
 * 原生DOM实现的属性面板
 */

import type { ApprovalNodeConfig, ApprovalEdgeConfig, ApprovalNodeType, ApprovalEdgeType, FlowchartTheme } from '../../types'

export interface PropertyPanelConfig {
  selectedNode?: ApprovalNodeConfig | null
  readonly?: boolean
  theme?: FlowchartTheme
  onUpdateNode?: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => void
  onUpdateEdge?: (edgeId: string, updates: Partial<ApprovalEdgeConfig>) => void
}

/**
 * 节点类型标签映射
 */
const NODE_TYPE_LABELS: Record<ApprovalNodeType, string> = {
  'start': '开始节点',
  'approval': '审批节点',
  'condition': '条件节点',
  'process': '处理节点',
  'end': '结束节点',
  'user-task': '用户任务',
  'service-task': '服务任务',
  'script-task': '脚本任务',
  'manual-task': '手工任务',
  'parallel-gateway': '并行网关',
  'exclusive-gateway': '排他网关',
  'inclusive-gateway': '包容网关',
  'event-gateway': '事件网关',
  'timer-event': '定时事件',
  'message-event': '消息事件',
  'signal-event': '信号事件'
}

/**
 * 连线类型标签映射
 */
const EDGE_TYPE_LABELS: Record<ApprovalEdgeType, string> = {
  'approval-edge': '审批连线',
  'condition-edge': '条件连线',
  'sequence-edge': '顺序连线',
  'default-edge': '默认连线'
}

export class PropertyPanel {
  private container: HTMLElement
  private config: PropertyPanelConfig
  private panelElement: HTMLElement | null = null
  private selectedNode: ApprovalNodeConfig | null = null
  private selectedEdge: ApprovalEdgeConfig | null = null
  private previewTimer: NodeJS.Timeout | null = null

  constructor(container: HTMLElement, config: PropertyPanelConfig = {}) {
    this.container = container
    this.config = config
    this.selectedNode = config.selectedNode || null
    this.init()
  }

  /**
   * 初始化面板
   */
  private init(): void {
    this.createPanel()
    this.render()
    this.applyStyles()
  }

  /**
   * 创建面板DOM结构
   */
  private createPanel(): void {
    this.panelElement = document.createElement('div')
    this.panelElement.className = 'ldesign-property-panel'
    this.container.appendChild(this.panelElement)
  }

  /**
   * 渲染面板内容
   */
  private render(): void {
    if (!this.panelElement) return

    if (!this.selectedNode && !this.selectedEdge) {
      this.panelElement.innerHTML = `
        <div class="panel-header">
          <h3>属性面板</h3>
          <p>选择一个节点或连线查看属性</p>
        </div>
        <div class="panel-content">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <p>请点击画布中的节点或连线<br>查看和编辑属性</p>
          </div>
        </div>
      `
    } else if (this.selectedNode) {
      this.panelElement.innerHTML = `
        <div class="panel-header">
          <h3>属性面板</h3>
          <p>${NODE_TYPE_LABELS[this.selectedNode.type] || this.selectedNode.type}</p>
        </div>
        <div class="panel-content">
          ${this.createNodePropertiesHTML()}
        </div>
      `
      this.bindPropertyEvents()
    } else if (this.selectedEdge) {
      this.panelElement.innerHTML = `
        <div class="panel-header">
          <h3>属性面板</h3>
          <p>连线属性</p>
        </div>
        <div class="panel-content">
          ${this.createEdgePropertiesHTML()}
        </div>
      `
      this.bindEdgePropertyEvents()
    }
  }

  /**
   * 创建节点属性HTML
   */
  private createNodePropertiesHTML(): string {
    if (!this.selectedNode) return ''

    const readonly = this.config.readonly ? 'readonly' : ''
    const disabled = this.config.readonly ? 'disabled' : ''

    return `
      <div class="property-section">
        <h4>基本信息</h4>
        <div class="property-group">
          <label>节点ID</label>
          <input type="text" 
                 class="property-input" 
                 data-field="id"
                 value="${this.selectedNode.id}" 
                 ${readonly}>
        </div>
        <div class="property-group">
          <label>节点类型</label>
          <select class="property-input"
                  data-field="type"
                  ${readonly ? 'disabled' : ''}>
            ${Object.entries(NODE_TYPE_LABELS).map(([type, label]) =>
      `<option value="${type}" ${type === this.selectedNode.type ? 'selected' : ''}>${label}</option>`
    ).join('')}
          </select>
        </div>
        <div class="property-group">
          <label>节点文本</label>
          <input type="text" 
                 class="property-input" 
                 data-field="text"
                 value="${this.selectedNode.text || ''}" 
                 ${readonly}>
        </div>
      </div>

      <div class="property-section">
        <h4>位置信息</h4>
        <div class="property-row">
          <div class="property-group">
            <label>X坐标</label>
            <input type="number" 
                   class="property-input" 
                   data-field="x"
                   value="${this.selectedNode.x}" 
                   ${readonly}>
          </div>
          <div class="property-group">
            <label>Y坐标</label>
            <input type="number" 
                   class="property-input" 
                   data-field="y"
                   value="${this.selectedNode.y}" 
                   ${readonly}>
          </div>
        </div>
      </div>

      ${this.createCustomPropertiesHTML()}
    `
  }

  /**
   * 创建自定义属性HTML
   */
  private createCustomPropertiesHTML(): string {
    if (!this.selectedNode?.properties || Object.keys(this.selectedNode.properties).length === 0) {
      return ''
    }

    const readonly = this.config.readonly ? 'readonly' : ''

    const propertiesHTML = Object.entries(this.selectedNode.properties).map(([key, value]) => `
      <div class="property-group">
        <label>${key}</label>
        <input type="text" 
               class="property-input" 
               data-field="properties.${key}"
               value="${value || ''}" 
               ${readonly}>
      </div>
    `).join('')

    return `
      <div class="property-section">
        <h4>自定义属性</h4>
        ${propertiesHTML}
      </div>
    `
  }

  /**
   * 绑定属性事件
   */
  private bindPropertyEvents(): void {
    if (!this.panelElement || this.config.readonly) return

    // 输入框实时更新
    const inputs = this.panelElement.querySelectorAll('.property-input')
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        // 实时应用更改
        if (!this.config.readonly) {
          clearTimeout(this.previewTimer)
          this.previewTimer = setTimeout(() => {
            this.applyChanges()
          }, 300) // 300ms防抖
        }
      })
    })
  }

  /**
   * 应用更改
   */
  private applyChanges(): void {
    if (!this.selectedNode || !this.panelElement) return

    const updates: Partial<ApprovalNodeConfig> = {}
    const inputs = this.panelElement.querySelectorAll('.property-input[data-field]') as NodeListOf<HTMLInputElement>

    inputs.forEach(input => {
      const field = input.dataset.field
      const value = input.value

      if (field) {
        if (field.startsWith('properties.')) {
          const propKey = field.replace('properties.', '')
          if (!updates.properties) updates.properties = {}
          updates.properties[propKey] = value
        } else if (field === 'x' || field === 'y') {
          updates[field] = parseFloat(value) || 0
        } else {
          (updates as any)[field] = value
        }
      }
    })

    // 触发更新回调
    this.config.onUpdateNode?.(this.selectedNode.id, updates)

    // 更新本地状态
    Object.assign(this.selectedNode, updates)
  }



  /**
   * 预览更改（实时更新但不保存）
   */
  private previewChanges(): void {
    if (!this.selectedNode || !this.panelElement) return

    const updates: Partial<ApprovalNodeConfig> = {}
    const inputs = this.panelElement.querySelectorAll('.property-input[data-field]') as NodeListOf<HTMLInputElement>

    inputs.forEach(input => {
      const field = input.dataset.field
      const value = input.value

      if (field) {
        if (field.startsWith('properties.')) {
          const propKey = field.replace('properties.', '')
          if (!updates.properties) updates.properties = {}
          updates.properties[propKey] = value
        } else if (field === 'x' || field === 'y') {
          updates[field] = parseFloat(value) || 0
        } else {
          (updates as any)[field] = value
        }
      }
    })

    // 只触发更新回调，不更新本地状态
    this.config.onUpdateNode?.(this.selectedNode.id, updates)
  }



  /**
   * 应用样式
   */
  private applyStyles(): void {
    const styles = `
      .ldesign-property-panel {
        width: 100%;
        height: 100%;
        background: var(--ldesign-bg-color-container, #fff);
        border-left: 1px solid var(--ldesign-border-color, #e5e5e5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .panel-header {
        padding: 16px;
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        background: var(--ldesign-bg-color-component, #fafafa);
      }

      .panel-header h3 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--ldesign-text-color-primary, #333);
      }

      .panel-header p {
        margin: 0;
        font-size: 12px;
        color: var(--ldesign-text-color-secondary, #666);
      }

      .panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--ldesign-text-color-secondary, #666);
      }

      .empty-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .property-section {
        margin-bottom: 24px;
      }

      .property-section h4 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--ldesign-text-color-primary, #333);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        padding-bottom: 6px;
      }

      .property-group {
        margin-bottom: 12px;
      }

      .property-row {
        display: flex;
        gap: 12px;
      }

      .property-row .property-group {
        flex: 1;
      }

      .property-group label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: 500;
        color: var(--ldesign-text-color-secondary, #666);
      }

      .property-input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: 4px;
        font-size: 12px;
        background: var(--ldesign-bg-color-container, #fff);
        color: var(--ldesign-text-color-primary, #333);
        transition: border-color 0.2s ease;
      }

      .property-input:focus {
        outline: none;
        border-color: var(--ldesign-brand-color, #722ED1);
        box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus, rgba(114, 46, 209, 0.1));
      }

      .property-input:readonly {
        background: var(--ldesign-bg-color-component-disabled, #f5f5f5);
        color: var(--ldesign-text-color-disabled, #999);
        cursor: not-allowed;
      }

      .property-actions {
        padding-top: 16px;
        border-top: 1px solid var(--ldesign-border-color, #e5e5e5);
        display: flex;
        gap: 8px;
      }

      .btn-primary, .btn-secondary {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: var(--ldesign-brand-color, #722ED1);
        color: white;
      }

      .btn-primary:hover {
        background: var(--ldesign-brand-color-hover, #5e2aa7);
      }

      .btn-primary.has-changes {
        background: var(--ldesign-warning-color, #f5c538);
        color: #333;
      }

      .btn-secondary {
        background: var(--ldesign-bg-color-component, #f8f9fa);
        color: var(--ldesign-text-color-primary, #333);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
      }

      .btn-secondary:hover {
        background: var(--ldesign-bg-color-component-hover, #e9ecef);
      }

      /* 主题样式 */
      .theme-dark .ldesign-property-panel {
        background: #1f1f1f;
        border-color: #333;
      }

      .theme-dark .panel-header {
        background: #2a2a2a;
        border-color: #333;
      }

      .theme-dark .property-input {
        background: #2a2a2a;
        border-color: #333;
        color: #fff;
      }

      .theme-dark .property-input:readonly {
        background: #1a1a1a;
        color: #666;
      }
    `

    // 注入样式
    if (!document.getElementById('property-panel-styles')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'property-panel-styles'
      styleElement.textContent = styles
      document.head.appendChild(styleElement)
    }
  }

  /**
   * 设置选中的节点
   */
  public setSelectedNode(node: ApprovalNodeConfig | null): void {
    this.selectedNode = node
    this.selectedEdge = null // 清除边选中
    this.render()
  }

  /**
   * 设置选中的边
   */
  public setSelectedEdge(edge: ApprovalEdgeConfig | null): void {
    this.selectedEdge = edge
    this.selectedNode = null // 清除节点选中
    this.render()
  }

  /**
   * 设置只读模式
   */
  public setReadonly(readonly: boolean): void {
    this.config.readonly = readonly
    this.render()
  }

  /**
   * 设置主题
   */
  public setTheme(theme: FlowchartTheme): void {
    this.config.theme = theme
    // 主题通过CSS类在容器级别控制
  }

  /**
   * 创建边属性HTML
   */
  private createEdgePropertiesHTML(): string {
    if (!this.selectedEdge) return ''

    return `
      <div class="property-section">
        <h4>基本信息</h4>
        <div class="property-group">
          <label>连线ID</label>
          <input type="text" class="property-input" value="${this.selectedEdge.id}" readonly>
        </div>
        <div class="property-group">
          <label>连线类型</label>
          <select class="property-input"
                  data-field="type"
                  ${this.config.readonly ? 'disabled' : ''}>
            ${Object.entries(EDGE_TYPE_LABELS).map(([type, label]) =>
      `<option value="${type}" ${type === this.selectedEdge.type ? 'selected' : ''}>${label}</option>`
    ).join('')}
          </select>
        </div>
        <div class="property-group">
          <label>连线文本</label>
          <input type="text" class="property-input" data-field="text" value="${this.selectedEdge.text || ''}" ${this.config.readonly ? 'readonly' : ''}>
        </div>
      </div>

      <div class="property-section">
        <h4>连接信息</h4>
        <div class="property-group">
          <label>源节点ID</label>
          <input type="text" class="property-input" value="${this.selectedEdge.sourceNodeId}" readonly>
        </div>
        <div class="property-group">
          <label>目标节点ID</label>
          <input type="text" class="property-input" value="${this.selectedEdge.targetNodeId}" readonly>
        </div>
      </div>
    `
  }

  /**
   * 绑定边属性事件
   */
  private bindEdgePropertyEvents(): void {
    if (!this.panelElement || this.config.readonly) return

    // 监听输入变化，实时更新
    const inputs = this.panelElement.querySelectorAll('.property-input:not([readonly])')
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        // 实时应用连线更改
        clearTimeout(this.previewTimer)
        this.previewTimer = setTimeout(() => {
          this.applyEdgeChanges()
        }, 300) // 300ms防抖
      })
    })
  }



  /**
   * 应用边更改
   */
  private applyEdgeChanges(): void {
    if (!this.selectedEdge || !this.panelElement) return

    const inputs = this.panelElement.querySelectorAll('.property-input:not([readonly])') as NodeListOf<HTMLInputElement>
    const updates: Partial<ApprovalEdgeConfig> = {}

    inputs.forEach(input => {
      const field = input.dataset.field
      const value = input.value

      if (field) {
        if (field === 'text') {
          updates.text = value
        }
      }
    })

    // 触发更新回调
    this.config.onUpdateEdge?.(this.selectedEdge.id, updates)

    // 更新本地状态
    Object.assign(this.selectedEdge, updates)
  }



  /**
   * 销毁面板
   */
  public destroy(): void {
    // 清理定时器
    if (this.previewTimer) {
      clearTimeout(this.previewTimer)
      this.previewTimer = null
    }
    
    if (this.panelElement) {
      this.panelElement.remove()
      this.panelElement = null
    }
  }
}
