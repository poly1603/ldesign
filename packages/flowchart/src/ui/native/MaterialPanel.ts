/**
 * 原生DOM实现的物料面板
 */

import type { ApprovalNodeType, FlowchartTheme } from '../../types'

export interface MaterialPanelConfig {
  readonly?: boolean
  theme?: FlowchartTheme
  onNodeAdd?: (type: ApprovalNodeType, position: { x: number, y: number }) => void
}

/**
 * 节点类型定义
 */
const NODE_TYPES = [
  // 基础节点
  {
    category: '基础节点',
    nodes: [
      { type: 'start', label: '开始', icon: '▶️' },
      { type: 'approval', label: '审批', icon: '✅' },
      { type: 'condition', label: '条件', icon: '◆' },
      { type: 'process', label: '处理', icon: '⚙️' },
      { type: 'end', label: '结束', icon: '⏹️' }
    ]
  },
  // 任务节点
  {
    category: '任务节点',
    nodes: [
      { type: 'user-task', label: '用户任务', icon: '👤' },
      { type: 'service-task', label: '服务任务', icon: '🔧' },
      { type: 'script-task', label: '脚本任务', icon: '📜' },
      { type: 'manual-task', label: '手工任务', icon: '✋' }
    ]
  },
  // 网关节点
  {
    category: '网关节点',
    nodes: [
      { type: 'parallel-gateway', label: '并行网关', icon: '➕' },
      { type: 'exclusive-gateway', label: '排他网关', icon: '❌' },
      { type: 'inclusive-gateway', label: '包容网关', icon: '⭕' },
      { type: 'event-gateway', label: '事件网关', icon: '⚡' }
    ]
  },
  // 事件节点
  {
    category: '事件节点',
    nodes: [
      { type: 'timer-event', label: '定时事件', icon: '⏰' },
      { type: 'message-event', label: '消息事件', icon: '💬' },
      { type: 'signal-event', label: '信号事件', icon: '📡' }
    ]
  }
]

export class MaterialPanel {
  private container: HTMLElement
  private config: MaterialPanelConfig
  private panelElement: HTMLElement | null = null

  constructor(container: HTMLElement, config: MaterialPanelConfig = {}) {
    this.container = container
    this.config = config
    this.init()
  }

  /**
   * 初始化面板
   */
  private init(): void {
    this.createPanel()
    this.bindEvents()
  }

  /**
   * 创建面板DOM结构
   */
  private createPanel(): void {
    this.panelElement = document.createElement('div')
    this.panelElement.className = 'ldesign-material-panel'
    this.panelElement.innerHTML = `
      <div class="panel-header">
        <h3>节点物料</h3>
        <p>拖拽节点到画布创建流程</p>
      </div>
      <div class="panel-content">
        ${this.createCategoriesHTML()}
      </div>
    `

    this.container.appendChild(this.panelElement)
    this.applyStyles()
  }

  /**
   * 创建分类HTML
   */
  private createCategoriesHTML(): string {
    return NODE_TYPES.map(category => `
      <div class="node-category">
        <div class="category-header">
          <span class="category-title">${category.category}</span>
        </div>
        <div class="category-nodes">
          ${category.nodes.map(node => `
            <div class="node-item" 
                 data-type="${node.type}" 
                 draggable="true"
                 title="${node.label}">
              <div class="node-icon">${node.icon}</div>
              <span class="node-label">${node.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.panelElement) return

    // 拖拽开始事件
    this.panelElement.addEventListener('dragstart', (e) => {
      const target = e.target as HTMLElement
      const nodeItem = target.closest('.node-item') as HTMLElement
      
      if (nodeItem) {
        const nodeType = nodeItem.dataset.type as ApprovalNodeType
        e.dataTransfer?.setData('text/plain', nodeType)
        e.dataTransfer?.setData('application/node-type', nodeType)
        
        // 添加拖拽样式
        nodeItem.classList.add('dragging')
      }
    })

    // 拖拽结束事件
    this.panelElement.addEventListener('dragend', (e) => {
      const target = e.target as HTMLElement
      const nodeItem = target.closest('.node-item') as HTMLElement
      
      if (nodeItem) {
        nodeItem.classList.remove('dragging')
      }
    })

    // 双击添加节点
    this.panelElement.addEventListener('dblclick', (e) => {
      const target = e.target as HTMLElement
      const nodeItem = target.closest('.node-item') as HTMLElement
      
      if (nodeItem) {
        const nodeType = nodeItem.dataset.type as ApprovalNodeType
        // 在画布中心添加节点
        this.config.onNodeAdd?.(nodeType, { x: 400, y: 300 })
      }
    })
  }

  /**
   * 应用样式
   */
  private applyStyles(): void {
    if (!this.panelElement) return

    const styles = `
      .ldesign-material-panel {
        width: 100%;
        height: 100%;
        background: var(--ldesign-bg-color-container, #fff);
        border-right: 1px solid var(--ldesign-border-color, #e5e5e5);
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
        padding: 8px;
      }

      .node-category {
        margin-bottom: 16px;
      }

      .category-header {
        padding: 8px 12px;
        background: var(--ldesign-bg-color-component, #f8f9fa);
        border-radius: 4px;
        margin-bottom: 8px;
      }

      .category-title {
        font-size: 12px;
        font-weight: 500;
        color: var(--ldesign-text-color-secondary, #666);
      }

      .category-nodes {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .node-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 8px;
        background: var(--ldesign-bg-color-container, #fff);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: 6px;
        cursor: grab;
        transition: all 0.2s ease;
        user-select: none;
      }

      .node-item:hover {
        background: var(--ldesign-bg-color-container-hover, #f5f5f5);
        border-color: var(--ldesign-brand-color, #722ED1);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .node-item:active {
        transform: translateY(0);
      }

      .node-item.dragging {
        opacity: 0.5;
        transform: rotate(5deg);
      }

      .node-icon {
        font-size: 20px;
        margin-bottom: 4px;
        line-height: 1;
      }

      .node-label {
        font-size: 11px;
        color: var(--ldesign-text-color-primary, #333);
        text-align: center;
        line-height: 1.2;
      }

      /* 只读模式样式 */
      .ldesign-material-panel.readonly .node-item {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .ldesign-material-panel.readonly .node-item:hover {
        transform: none;
        box-shadow: none;
        border-color: var(--ldesign-border-color, #e5e5e5);
      }

      /* 主题样式 */
      .theme-dark .ldesign-material-panel {
        background: #1f1f1f;
        border-color: #333;
      }

      .theme-dark .panel-header {
        background: #2a2a2a;
        border-color: #333;
      }

      .theme-dark .node-item {
        background: #2a2a2a;
        border-color: #333;
        color: #fff;
      }

      .theme-dark .node-item:hover {
        background: #333;
      }
    `

    // 注入样式
    if (!document.getElementById('material-panel-styles')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'material-panel-styles'
      styleElement.textContent = styles
      document.head.appendChild(styleElement)
    }
  }

  /**
   * 设置只读模式
   */
  public setReadonly(readonly: boolean): void {
    this.config.readonly = readonly
    
    if (this.panelElement) {
      if (readonly) {
        this.panelElement.classList.add('readonly')
      } else {
        this.panelElement.classList.remove('readonly')
      }
    }
  }

  /**
   * 设置主题
   */
  public setTheme(theme: FlowchartTheme): void {
    this.config.theme = theme
    // 主题通过CSS类在容器级别控制
  }

  /**
   * 销毁面板
   */
  public destroy(): void {
    if (this.panelElement) {
      this.panelElement.remove()
      this.panelElement = null
    }
  }
}
