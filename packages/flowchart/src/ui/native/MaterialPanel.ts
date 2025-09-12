/**
 * 原生DOM实现的物料面板
 */

import type { ApprovalNodeType, FlowchartTheme, CustomMaterial } from '../../types'
import type { MaterialRepositoryManager } from '../../materials/MaterialRepositoryManager'
import { getNodeIcon, getCustomMaterialIcon } from '../../utils/icons'

// 移除了SVG_ICONS，现在使用lucide图标

export interface MaterialPanelConfig {
  readonly?: boolean
  theme?: FlowchartTheme
  onNodeAdd?: (type: ApprovalNodeType, position: { x: number, y: number }) => void
  materialRepositoryManager?: MaterialRepositoryManager
  onCustomMaterialAdd?: (material: CustomMaterial, position: { x: number, y: number }) => void
}

/**
 * 节点类型定义
 */
const NODE_TYPES = [
  // 基础节点
  {
    category: '基础节点',
    nodes: [
      { type: 'start', label: '开始', icon: () => getNodeIcon('start') },
      { type: 'approval', label: '审批', icon: () => getNodeIcon('approval') },
      { type: 'condition', label: '条件', icon: () => getNodeIcon('condition') },
      { type: 'process', label: '处理', icon: () => getNodeIcon('process') },
      { type: 'end', label: '结束', icon: () => getNodeIcon('end') }
    ]
  },
  // 任务节点
  {
    category: '任务节点',
    nodes: [
      { type: 'user-task', label: '用户任务', icon: () => getNodeIcon('user-task') },
      { type: 'service-task', label: '服务任务', icon: () => getNodeIcon('service-task') },
      { type: 'script-task', label: '脚本任务', icon: () => getNodeIcon('script-task') },
      { type: 'manual-task', label: '手工任务', icon: () => getNodeIcon('manual-task') }
    ]
  },
  // 网关节点
  {
    category: '网关节点',
    nodes: [
      { type: 'parallel-gateway', label: '并行网关', icon: () => getNodeIcon('parallel-gateway') },
      { type: 'exclusive-gateway', label: '排他网关', icon: () => getNodeIcon('exclusive-gateway') },
      { type: 'inclusive-gateway', label: '包容网关', icon: () => getNodeIcon('inclusive-gateway') },
      { type: 'event-gateway', label: '事件网关', icon: () => getNodeIcon('event-gateway') }
    ]
  },
  // 事件节点
  {
    category: '事件节点',
    nodes: [
      { type: 'timer-event', label: '定时事件', icon: () => getNodeIcon('timer-event') },
      { type: 'message-event', label: '消息事件', icon: () => getNodeIcon('message-event') },
      { type: 'signal-event', label: '信号事件', icon: () => getNodeIcon('signal-event') }
    ]
  }
]

export class MaterialPanel {
  private container: HTMLElement
  private config: MaterialPanelConfig
  private panelElement: HTMLElement | null = null
  private customMaterials: CustomMaterial[] = []

  constructor(container: HTMLElement, config: MaterialPanelConfig = {}) {
    this.container = container
    this.config = config
    this.loadCustomMaterials()
    this.init()
  }

  /**
   * 加载自定义物料
   */
  private loadCustomMaterials(): void {
    if (this.config.materialRepositoryManager) {
      this.customMaterials = this.config.materialRepositoryManager.getAllMaterials()

      // 监听物料变化
      this.config.materialRepositoryManager.on('material:add', () => {
        this.customMaterials = this.config.materialRepositoryManager!.getAllMaterials()
        this.refreshCustomMaterials()
      })

      this.config.materialRepositoryManager.on('material:update', () => {
        this.customMaterials = this.config.materialRepositoryManager!.getAllMaterials()
        this.refreshCustomMaterials()
      })

      this.config.materialRepositoryManager.on('material:delete', () => {
        this.customMaterials = this.config.materialRepositoryManager!.getAllMaterials()
        this.refreshCustomMaterials()
      })
    }
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
    let html = NODE_TYPES.map(category => `
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
              <div class="node-icon">${typeof node.icon === 'function' ? node.icon() : node.icon}</div>
              <span class="node-label">${node.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')

    // 添加自定义物料分类
    if (this.customMaterials.length > 0) {
      html += `
        <div class="node-category">
          <div class="category-header">
            <span class="category-title">${getCustomMaterialIcon()} 自定义物料</span>
          </div>
          <div class="category-nodes" id="custom-materials">
            ${this.createCustomMaterialsHTML()}
          </div>
        </div>
      `
    }

    return html
  }

  /**
   * 创建自定义物料HTML
   */
  private createCustomMaterialsHTML(): string {
    return this.customMaterials.map(material => `
      <div class="node-item custom-material-item"
           data-material-id="${material.id}"
           draggable="true"
           title="${material.description || material.name}">
        <div class="node-icon">${this.createCustomMaterialIcon(material)}</div>
        <span class="node-label">${material.name}</span>
      </div>
    `).join('')
  }

  /**
   * 创建自定义物料图标
   */
  private createCustomMaterialIcon(material: CustomMaterial): string {
    const { shape, style, icon } = material
    const size = 16
    const centerX = size / 2
    const centerY = size / 2

    let shapeElement = ''

    switch (shape) {
      case 'circle':
        shapeElement = `<circle cx="${centerX}" cy="${centerY}" r="${size / 3}"
          fill="${style.fill || '#ffffff'}" stroke="${style.stroke || '#722ED1'}" stroke-width="1" />`
        break
      case 'diamond':
        shapeElement = `<polygon points="${centerX},2 ${size - 2},${centerY} ${centerX},${size - 2} 2,${centerY}"
          fill="${style.fill || '#ffffff'}" stroke="${style.stroke || '#722ED1'}" stroke-width="1" />`
        break
      case 'ellipse':
        shapeElement = `<ellipse cx="${centerX}" cy="${centerY}" rx="${size / 3}" ry="${size / 4}"
          fill="${style.fill || '#ffffff'}" stroke="${style.stroke || '#722ED1'}" stroke-width="1" />`
        break
      default:
        shapeElement = `<rect x="2" y="3" width="${size - 4}" height="${size - 6}" rx="1"
          fill="${style.fill || '#ffffff'}" stroke="${style.stroke || '#722ED1'}" stroke-width="1" />`
    }

    let iconElement = ''
    if (icon && icon.content) {
      iconElement = `<text x="${centerX}" y="${centerY + 2}" text-anchor="middle" font-size="8" fill="${icon.color || '#333'}">${icon.content}</text>`
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${shapeElement}${iconElement}</svg>`
  }

  /**
   * 刷新自定义物料
   */
  private refreshCustomMaterials(): void {
    if (!this.panelElement) return

    const customMaterialsContainer = this.panelElement.querySelector('#custom-materials')
    if (customMaterialsContainer) {
      customMaterialsContainer.innerHTML = this.createCustomMaterialsHTML()
    } else {
      // 重新创建整个面板
      this.panelElement.querySelector('.panel-content')!.innerHTML = this.createCategoriesHTML()
    }
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
        // 检查是否是自定义物料
        const materialId = nodeItem.dataset.materialId
        if (materialId) {
          // 自定义物料拖拽
          e.dataTransfer?.setData('text/plain', 'custom-material')
          e.dataTransfer?.setData('application/custom-material-id', materialId)
        } else {
          // 标准节点拖拽
          const nodeType = nodeItem.dataset.type as ApprovalNodeType
          e.dataTransfer?.setData('text/plain', nodeType)
          e.dataTransfer?.setData('application/node-type', nodeType)
        }

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
        // 检查是否是自定义物料
        const materialId = nodeItem.dataset.materialId
        if (materialId) {
          // 添加自定义物料
          const material = this.customMaterials.find(m => m.id === materialId)
          if (material) {
            this.config.onCustomMaterialAdd?.(material, { x: 400, y: 300 })
          }
        } else {
          // 添加标准节点
          const nodeType = nodeItem.dataset.type as ApprovalNodeType
          this.config.onNodeAdd?.(nodeType, { x: 400, y: 300 })
        }
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .panel-header {
        padding: 20px 16px;
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        background: linear-gradient(135deg, var(--ldesign-brand-color-1, #f1ecf9) 0%, var(--ldesign-bg-color-component, #fafafa) 100%);
        position: relative;
      }

      .panel-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--ldesign-brand-color, #722ED1), var(--ldesign-brand-color-6, #7334cb));
      }

      .panel-header h3 {
        margin: 0 0 6px 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--ldesign-text-color-primary, #333);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .panel-header h3::before {
        content: '';
        width: 4px;
        height: 16px;
        background: var(--ldesign-brand-color, #722ED1);
        border-radius: 2px;
      }

      .panel-header p {
        margin: 0;
        font-size: 13px;
        color: var(--ldesign-text-color-secondary, #666);
        line-height: 1.4;
      }

      .panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
        background: var(--ldesign-bg-color-page, #fafafa);
      }

      .panel-content::-webkit-scrollbar {
        width: 6px;
      }

      .panel-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .panel-content::-webkit-scrollbar-thumb {
        background: var(--ldesign-border-color, #e5e5e5);
        border-radius: 3px;
      }

      .panel-content::-webkit-scrollbar-thumb:hover {
        background: var(--ldesign-border-level-2-color, #d9d9d9);
      }

      .node-category {
        margin-bottom: 24px;
        background: var(--ldesign-bg-color-container, #fff);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
      }

      .category-header {
        padding: 12px 16px;
        background: linear-gradient(135deg, var(--ldesign-brand-color-1, #f1ecf9) 0%, var(--ldesign-bg-color-component, #f8f9fa) 100%);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        position: relative;
      }

      .category-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--ldesign-text-color-primary, #333);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .category-nodes {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding: 16px;
      }

      .node-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 12px;
        background: var(--ldesign-bg-color-container, #fff);
        border: 2px solid transparent;
        border-radius: 12px;
        cursor: grab;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        position: relative;
        overflow: hidden;
      }

      .node-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, transparent 0%, var(--ldesign-brand-color-1, #f1ecf9) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      }

      .node-item:hover::before {
        opacity: 1;
      }

      .node-item:hover {
        border-color: var(--ldesign-brand-color, #722ED1);
        transform: translateY(-2px) scale(1.02);
        box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
      }

      .node-item:active {
        transform: translateY(-1px) scale(1.01);
      }

      .node-item.dragging {
        opacity: 0.7;
        transform: rotate(3deg) scale(0.95);
        z-index: 1000;
      }

      .node-icon {
        font-size: 24px;
        margin-bottom: 8px;
        line-height: 1;
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--ldesign-bg-color-component, #f8f9fa);
        transition: all 0.3s ease;
      }

      .node-item:hover .node-icon {
        background: var(--ldesign-brand-color-2, #d8c8ee);
        transform: scale(1.1);
      }

      .node-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--ldesign-text-color-primary, #333);
        text-align: center;
        line-height: 1.3;
        position: relative;
        z-index: 1;
        margin-top: 4px;
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

      /* 暗色主题样式 */
      .theme-dark .ldesign-material-panel {
        background: #1a1a1a;
        border-color: #333;
      }

      .theme-dark .panel-header {
        background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
        border-color: #333;
        color: #fff;
      }

      .theme-dark .panel-header h3 {
        color: #fff;
      }

      .theme-dark .panel-header p {
        color: #ccc;
      }

      .theme-dark .panel-content {
        background: #1a1a1a;
      }

      .theme-dark .node-category {
        background: #2a2a2a;
        border-color: #333;
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3);
      }

      .theme-dark .category-header {
        background: linear-gradient(135deg, #333 0%, #2a2a2a 100%);
        border-color: #444;
      }

      .theme-dark .category-title {
        color: #fff;
      }

      .theme-dark .node-item {
        background: #2a2a2a;
        border-color: transparent;
        color: #fff;
      }

      .theme-dark .node-item::before {
        background: linear-gradient(135deg, transparent 0%, rgba(114, 46, 209, 0.2) 100%);
      }

      .theme-dark .node-item:hover {
        border-color: var(--ldesign-brand-color, #722ED1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      }

      .theme-dark .node-icon {
        background: #333;
      }

      .theme-dark .node-item:hover .node-icon {
        background: rgba(114, 46, 209, 0.3);
      }

      .theme-dark .node-label {
        color: #fff;
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
   * 更新配置
   */
  public updateConfig(newConfig: Partial<MaterialPanelConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.loadCustomMaterials()

    // 刷新面板内容
    if (this.panelElement) {
      const panelContent = this.panelElement.querySelector('.panel-content')
      if (panelContent) {
        panelContent.innerHTML = this.createCategoriesHTML()
      }
    }
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
