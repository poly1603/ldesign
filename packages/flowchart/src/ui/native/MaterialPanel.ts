/**
 * 原生DOM实现的物料面板
 */

import type { ApprovalNodeType, FlowchartTheme } from '../../types'

/**
 * SVG图标映射
 */
const SVG_ICONS = {
  start: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7" fill="#52c41a" stroke="#389e0d" stroke-width="1"/>
    <path d="M6 5l6 3-6 3V5z" fill="white"/>
  </svg>`,
  approval: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="10" rx="2" fill="#1890ff" stroke="#096dd9" stroke-width="1"/>
    <path d="M4 8l2 2 6-4" stroke="white" stroke-width="2" fill="none"/>
  </svg>`,
  condition: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1l7 7-7 7-7-7z" fill="#faad14" stroke="#d48806" stroke-width="1"/>
    <text x="8" y="10" text-anchor="middle" fill="white" font-size="8">?</text>
  </svg>`,
  process: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="10" rx="2" fill="#722ed1" stroke="#531dab" stroke-width="1"/>
    <circle cx="6" cy="8" r="1.5" fill="white"/>
    <circle cx="10" cy="8" r="1.5" fill="white"/>
  </svg>`,
  end: `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7" fill="#f5222d" stroke="#cf1322" stroke-width="1"/>
    <rect x="5" y="5" width="6" height="6" fill="white"/>
  </svg>`,
  'user-task': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="10" rx="2" fill="#13c2c2" stroke="#08979c" stroke-width="1"/>
    <circle cx="8" cy="7" r="2" fill="white"/>
    <path d="M5 11c0-1.5 1.5-3 3-3s3 1.5 3 3" stroke="white" stroke-width="1" fill="none"/>
  </svg>`,
  'service-task': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="10" rx="2" fill="#eb2f96" stroke="#c41d7f" stroke-width="1"/>
    <path d="M6 6l4 2-4 2V6z" fill="white"/>
  </svg>`,
  'script-task': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="10" rx="2" fill="#52c41a" stroke="#389e0d" stroke-width="1"/>
    <text x="8" y="10" text-anchor="middle" fill="white" font-size="8">&lt;/&gt;</text>
  </svg>`,
  'manual-task': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="10" rx="2" fill="#fa8c16" stroke="#d46b08" stroke-width="1"/>
    <path d="M6 6h4M6 8h4M6 10h2" stroke="white" stroke-width="1"/>
  </svg>`,
  'parallel-gateway': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1l7 7-7 7-7-7z" fill="#1890ff" stroke="#096dd9" stroke-width="1"/>
    <path d="M8 4v8M4 8h8" stroke="white" stroke-width="2"/>
  </svg>`,
  'exclusive-gateway': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1l7 7-7 7-7-7z" fill="#f5222d" stroke="#cf1322" stroke-width="1"/>
    <path d="M5 5l6 6M11 5l-6 6" stroke="white" stroke-width="2"/>
  </svg>`,
  'inclusive-gateway': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1l7 7-7 7-7-7z" fill="#52c41a" stroke="#389e0d" stroke-width="1"/>
    <circle cx="8" cy="8" r="3" stroke="white" stroke-width="2" fill="none"/>
  </svg>`,
  'event-gateway': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1l7 7-7 7-7-7z" fill="#722ed1" stroke="#531dab" stroke-width="1"/>
    <path d="M8 4l2 4-2 4-2-4z" fill="white"/>
  </svg>`,
  'timer-event': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7" fill="#faad14" stroke="#d48806" stroke-width="1"/>
    <path d="M8 4v4l3 3" stroke="white" stroke-width="2" fill="none"/>
  </svg>`,
  'message-event': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7" fill="#13c2c2" stroke="#08979c" stroke-width="1"/>
    <rect x="4" y="6" width="8" height="5" rx="1" fill="white"/>
    <path d="M4 6l4 3 4-3" stroke="#13c2c2" stroke-width="1" fill="none"/>
  </svg>`,
  'signal-event': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7" fill="#eb2f96" stroke="#c41d7f" stroke-width="1"/>
    <path d="M5 10l3-6 3 6H5z" fill="white"/>
  </svg>`
}

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
      { type: 'start', label: '开始', icon: SVG_ICONS.start },
      { type: 'approval', label: '审批', icon: SVG_ICONS.approval },
      { type: 'condition', label: '条件', icon: SVG_ICONS.condition },
      { type: 'process', label: '处理', icon: SVG_ICONS.process },
      { type: 'end', label: '结束', icon: SVG_ICONS.end }
    ]
  },
  // 任务节点
  {
    category: '任务节点',
    nodes: [
      { type: 'user-task', label: '用户任务', icon: SVG_ICONS['user-task'] },
      { type: 'service-task', label: '服务任务', icon: SVG_ICONS['service-task'] },
      { type: 'script-task', label: '脚本任务', icon: SVG_ICONS['script-task'] },
      { type: 'manual-task', label: '手工任务', icon: SVG_ICONS['manual-task'] }
    ]
  },
  // 网关节点
  {
    category: '网关节点',
    nodes: [
      { type: 'parallel-gateway', label: '并行网关', icon: SVG_ICONS['parallel-gateway'] },
      { type: 'exclusive-gateway', label: '排他网关', icon: SVG_ICONS['exclusive-gateway'] },
      { type: 'inclusive-gateway', label: '包容网关', icon: SVG_ICONS['inclusive-gateway'] },
      { type: 'event-gateway', label: '事件网关', icon: SVG_ICONS['event-gateway'] }
    ]
  },
  // 事件节点
  {
    category: '事件节点',
    nodes: [
      { type: 'timer-event', label: '定时事件', icon: SVG_ICONS['timer-event'] },
      { type: 'message-event', label: '消息事件', icon: SVG_ICONS['message-event'] },
      { type: 'signal-event', label: '信号事件', icon: SVG_ICONS['signal-event'] }
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
