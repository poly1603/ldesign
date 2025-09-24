/**
 * 增强属性面板
 * 
 * 在原有属性面板基础上，添加布局方向设置、节点布局配置等选项
 */

import type { ApprovalNodeConfig, ApprovalEdgeConfig, ApprovalNodeType, ApprovalEdgeType, FlowchartTheme } from '../../types'
import type { LayoutDirection } from '../../services/LayoutDetectionService'
import type { NodeStyleConfig, NodeTextConfig, NodeIconConfig, NodeLayoutConfig, CompleteNodeConfig } from '../../services/NodeConfigService'
import type { EdgeStyleConfig, EdgeLabelConfig, EdgeArrowConfig, CompleteEdgeConfig } from '../../services/EdgeConfigService'
import { layoutDetectionService } from '../../services/LayoutDetectionService'
import { nodeConfigService } from '../../services/NodeConfigService'
import { edgeConfigService } from '../../services/EdgeConfigService'

export interface EnhancedPropertyPanelConfig {
  selectedNode?: ApprovalNodeConfig | null
  selectedEdge?: ApprovalEdgeConfig | null
  readonly?: boolean
  theme?: FlowchartTheme
  layoutDirection?: LayoutDirection
  onUpdateNode?: (nodeId: string, updates: Partial<ApprovalNodeConfig>) => void
  onUpdateEdge?: (edgeId: string, updates: Partial<ApprovalEdgeConfig>) => void
  onLayoutDirectionChange?: (direction: LayoutDirection) => void
  onFlowchartDataChange?: (data: any) => void
}

export class EnhancedPropertyPanel {
  private container: HTMLElement
  private config: EnhancedPropertyPanelConfig
  private panelElement: HTMLElement | null = null
  private selectedNode: ApprovalNodeConfig | null = null
  private selectedEdge: ApprovalEdgeConfig | null = null
  private currentLayoutDirection: LayoutDirection = 'horizontal'

  constructor(container: HTMLElement, config: EnhancedPropertyPanelConfig = {}) {
    this.container = container
    this.config = config
    this.selectedNode = config.selectedNode || null
    this.selectedEdge = config.selectedEdge || null
    this.currentLayoutDirection = config.layoutDirection || 'horizontal'
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
    this.panelElement.className = 'ldesign-enhanced-property-panel'
    this.container.appendChild(this.panelElement)
  }

  /**
   * 渲染面板内容
   */
  private render(): void {
    if (!this.panelElement) return

    if (!this.selectedNode && !this.selectedEdge) {
      this.renderEmptyState()
    } else if (this.selectedNode) {
      this.renderNodeProperties()
    } else if (this.selectedEdge) {
      this.renderEdgeProperties()
    }
  }

  /**
   * 渲染空状态
   */
  private renderEmptyState(): void {
    this.panelElement!.innerHTML = `
      <div class="panel-header">
        <h3>属性面板</h3>
      </div>
      <div class="panel-content">
        <div class="global-settings">
          <div class="property-section">
            <h4>🎯 流程图设置</h4>
            ${this.createLayoutDirectionHTML()}
            ${this.createGlobalSettingsHTML()}
          </div>
        </div>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>请点击画布中的节点或连线<br>查看和编辑详细属性</p>
        </div>
      </div>
    `
    this.bindGlobalEvents()
  }

  /**
   * 创建布局方向控件HTML
   */
  private createLayoutDirectionHTML(): string {
    return `
      <div class="property-group">
        <label>
          📐 布局方向
          <span class="tooltip" title="流程图的主要布局方向，影响节点锚点位置和连线路径">?</span>
        </label>
        <div class="layout-direction-selector">
          <div class="direction-option ${this.currentLayoutDirection === 'horizontal' ? 'selected' : ''}" 
               data-direction="horizontal">
            <div class="direction-icon">↔️</div>
            <span>横向</span>
          </div>
          <div class="direction-option ${this.currentLayoutDirection === 'vertical' ? 'selected' : ''}" 
               data-direction="vertical">
            <div class="direction-icon">↕️</div>
            <span>纵向</span>
          </div>
          <div class="direction-option ${this.currentLayoutDirection === 'mixed' ? 'selected' : ''}" 
               data-direction="mixed">
            <div class="direction-icon">🔄</div>
            <span>混合</span>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 创建全局设置HTML
   */
  private createGlobalSettingsHTML(): string {
    return `
      <div class="property-group">
        <label>🎨 主题设置</label>
        <select class="property-input" id="theme-selector">
          <option value="light" ${this.config.theme === 'light' ? 'selected' : ''}>浅色主题</option>
          <option value="dark" ${this.config.theme === 'dark' ? 'selected' : ''}>深色主题</option>
          <option value="blue" ${this.config.theme === 'blue' ? 'selected' : ''}>蓝色主题</option>
        </select>
      </div>
      <div class="property-group">
        <label>⚙️ 快捷操作</label>
        <div class="quick-actions">
          <button class="btn-action" id="auto-layout">智能排列</button>
          <button class="btn-action" id="optimize-layout">优化布局</button>
          <button class="btn-action" id="reset-layout">重置位置</button>
        </div>
      </div>
    `
  }

  /**
   * 渲染节点属性
   */
  private renderNodeProperties(): void {
    if (!this.selectedNode) return

    this.panelElement!.innerHTML = `
      <div class="panel-header">
        <h3>节点属性</h3>
        <p>${this.getNodeTypeLabel(this.selectedNode.type)}</p>
      </div>
      <div class="panel-content">
        <div class="property-tabs">
          <button class="tab-button active" data-tab="basic">🏷️ 基础</button>
          <button class="tab-button" data-tab="style">🎨 样式</button>
          <button class="tab-button" data-tab="layout">📐 布局</button>
          <button class="tab-button" data-tab="behavior">⚡ 行为</button>
        </div>
        
        <div class="tab-content" id="basic-tab">
          ${this.createBasicPropertiesHTML()}
        </div>
        
        <div class="tab-content hidden" id="style-tab">
          ${this.createStylePropertiesHTML()}
        </div>
        
        <div class="tab-content hidden" id="layout-tab">
          ${this.createLayoutPropertiesHTML()}
        </div>
        
        <div class="tab-content hidden" id="behavior-tab">
          ${this.createBehaviorPropertiesHTML()}
        </div>
        
        ${!this.config.readonly ? `
          <div class="property-actions">
            <button class="btn-primary" id="apply-node-changes">应用更改</button>
            <button class="btn-secondary" id="reset-node-changes">重置</button>
            <button class="btn-danger" id="delete-node">删除节点</button>
          </div>
        ` : ''}
      </div>
    `
    
    this.bindNodePropertyEvents()
  }

  /**
   * 创建基础属性HTML
   */
  private createBasicPropertiesHTML(): string {
    if (!this.selectedNode) return ''

    return `
      <div class="property-section">
        <h4>基本信息</h4>
        <div class="property-group">
          <label>节点ID</label>
          <input type="text" class="property-input" data-field="id" 
                 value="${this.selectedNode.id}" ${this.config.readonly ? 'readonly' : ''}>
        </div>
        <div class="property-group">
          <label>节点类型</label>
          <select class="property-input" data-field="type" ${this.config.readonly ? 'disabled' : ''}>
            ${this.createNodeTypeOptions()}
          </select>
        </div>
        <div class="property-group">
          <label>显示文本</label>
          <textarea class="property-input" data-field="text" rows="2" 
                    ${this.config.readonly ? 'readonly' : ''}>${this.selectedNode.text || ''}</textarea>
        </div>
      </div>

      <div class="property-section">
        <h4>位置信息</h4>
        <div class="property-row">
          <div class="property-group">
            <label>X坐标</label>
            <input type="number" class="property-input" data-field="x" 
                   value="${this.selectedNode.x}" step="10" ${this.config.readonly ? 'readonly' : ''}>
          </div>
          <div class="property-group">
            <label>Y坐标</label>
            <input type="number" class="property-input" data-field="y" 
                   value="${this.selectedNode.y}" step="10" ${this.config.readonly ? 'readonly' : ''}>
          </div>
        </div>
      </div>

      ${this.createCustomPropertiesHTML()}
    `
  }

  /**
   * 创建样式属性HTML
   */
  private createStylePropertiesHTML(): string {
    return `
      <div class="property-section">
        <h4>🎨 外观样式</h4>
        <div class="property-row">
          <div class="property-group">
            <label>填充颜色</label>
            <input type="color" class="property-input color-input" data-field="style.fill" 
                   value="#e6f7ff" ${this.config.readonly ? 'disabled' : ''}>
          </div>
          <div class="property-group">
            <label>边框颜色</label>
            <input type="color" class="property-input color-input" data-field="style.stroke" 
                   value="#1890ff" ${this.config.readonly ? 'disabled' : ''}>
          </div>
        </div>
        <div class="property-row">
          <div class="property-group">
            <label>边框宽度</label>
            <input type="range" class="property-input range-input" data-field="style.strokeWidth" 
                   min="1" max="5" value="2" ${this.config.readonly ? 'disabled' : ''}>
            <span class="range-value">2px</span>
          </div>
          <div class="property-group">
            <label>透明度</label>
            <input type="range" class="property-input range-input" data-field="style.fillOpacity" 
                   min="0" max="1" step="0.1" value="1" ${this.config.readonly ? 'disabled' : ''}>
            <span class="range-value">100%</span>
          </div>
        </div>
      </div>

      <div class="property-section">
        <h4>✏️ 文本样式</h4>
        <div class="property-row">
          <div class="property-group">
            <label>字体大小</label>
            <input type="range" class="property-input range-input" data-field="textConfig.fontSize" 
                   min="8" max="24" value="12" ${this.config.readonly ? 'disabled' : ''}>
            <span class="range-value">12px</span>
          </div>
          <div class="property-group">
            <label>字体粗细</label>
            <select class="property-input" data-field="textConfig.fontWeight" ${this.config.readonly ? 'disabled' : ''}>
              <option value="normal">正常</option>
              <option value="bold">加粗</option>
              <option value="600">中等</option>
            </select>
          </div>
        </div>
        <div class="property-group">
          <label>文本颜色</label>
          <input type="color" class="property-input color-input" data-field="textConfig.color" 
                 value="#333333" ${this.config.readonly ? 'disabled' : ''}>
        </div>
      </div>

      <div class="property-section">
        <h4>🏷️ 图标设置</h4>
        <div class="property-row">
          <div class="property-group">
            <label>图标大小</label>
            <input type="range" class="property-input range-input" data-field="icon.size" 
                   min="12" max="32" value="16" ${this.config.readonly ? 'disabled' : ''}>
            <span class="range-value">16px</span>
          </div>
          <div class="property-group">
            <label>图标颜色</label>
            <input type="color" class="property-input color-input" data-field="icon.color" 
                   value="#1890ff" ${this.config.readonly ? 'disabled' : ''}>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 创建布局属性HTML
   */
  private createLayoutPropertiesHTML(): string {
    return `
      <div class="property-section">
        <h4>📐 布局设置</h4>
        <div class="property-group">
          <label>布局策略</label>
          <select class="property-input" data-field="layout.strategy" ${this.config.readonly ? 'disabled' : ''}>
            <option value="vertical">垂直排列</option>
            <option value="horizontal">水平排列</option>
            <option value="overlay">重叠布局</option>
          </select>
        </div>
        <div class="property-group">
          <label>图标文字间距</label>
          <input type="range" class="property-input range-input" data-field="layout.iconTextSpacing" 
                 min="2" max="20" value="8" ${this.config.readonly ? 'disabled' : ''}>
          <span class="range-value">8px</span>
        </div>
        <div class="property-row">
          <div class="property-group">
            <label>最小宽度</label>
            <input type="number" class="property-input" data-field="layout.minWidth" 
                   value="60" step="10" ${this.config.readonly ? 'readonly' : ''}>
          </div>
          <div class="property-group">
            <label>最大宽度</label>
            <input type="number" class="property-input" data-field="layout.maxWidth" 
                   value="120" step="10" ${this.config.readonly ? 'readonly' : ''}>
          </div>
        </div>
      </div>

      <div class="property-section">
        <h4>🔧 对齐方式</h4>
        <div class="property-row">
          <div class="property-group">
            <label>水平对齐</label>
            <select class="property-input" data-field="layout.horizontalAlign" ${this.config.readonly ? 'disabled' : ''}>
              <option value="left">左对齐</option>
              <option value="center" selected>居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
          <div class="property-group">
            <label>垂直对齐</label>
            <select class="property-input" data-field="layout.verticalAlign" ${this.config.readonly ? 'disabled' : ''}>
              <option value="top">顶部对齐</option>
              <option value="middle" selected>居中</option>
              <option value="bottom">底部对齐</option>
            </select>
          </div>
        </div>
      </div>

      <div class="property-section">
        <h4>⚙️ 自适应设置</h4>
        <div class="property-group">
          <label class="checkbox-label">
            <input type="checkbox" data-field="layout.autoResize" checked ${this.config.readonly ? 'disabled' : ''}>
            自动调整大小
          </label>
        </div>
        <div class="property-group">
          <label class="checkbox-label">
            <input type="checkbox" data-field="layout.preventOverlap" checked ${this.config.readonly ? 'disabled' : ''}>
            防止重叠
          </label>
        </div>
      </div>
    `
  }

  /**
   * 创建行为属性HTML
   */
  private createBehaviorPropertiesHTML(): string {
    return `
      <div class="property-section">
        <h4>⚡ 交互行为</h4>
        <div class="property-row">
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.draggable" checked ${this.config.readonly ? 'disabled' : ''}>
              可拖拽
            </label>
          </div>
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.resizable" ${this.config.readonly ? 'disabled' : ''}>
              可调整大小
            </label>
          </div>
        </div>
        <div class="property-row">
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.selectable" checked ${this.config.readonly ? 'disabled' : ''}>
              可选择
            </label>
          </div>
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.hoverable" checked ${this.config.readonly ? 'disabled' : ''}>
              悬停效果
            </label>
          </div>
        </div>
      </div>

      <div class="property-section">
        <h4>🔗 连接设置</h4>
        <div class="property-group">
          <label class="checkbox-label">
            <input type="checkbox" data-field="behavior.connectable" checked ${this.config.readonly ? 'disabled' : ''}>
            允许连接
          </label>
        </div>
        <div class="property-row">
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.connectableAsSource" 
                     ${this.selectedNode?.type !== 'end' ? 'checked' : ''} ${this.config.readonly ? 'disabled' : ''}>
              可作为源节点
            </label>
          </div>
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.connectableAsTarget" 
                     ${this.selectedNode?.type !== 'start' ? 'checked' : ''} ${this.config.readonly ? 'disabled' : ''}>
              可作为目标节点
            </label>
          </div>
        </div>
      </div>

      <div class="property-section">
        <h4>✏️ 编辑设置</h4>
        <div class="property-row">
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.textEditable" checked ${this.config.readonly ? 'disabled' : ''}>
              文本可编辑
            </label>
          </div>
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.propertiesEditable" checked ${this.config.readonly ? 'disabled' : ''}>
              属性可编辑
            </label>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 渲染连线属性
   */
  private renderEdgeProperties(): void {
    if (!this.selectedEdge) return

    this.panelElement!.innerHTML = `
      <div class="panel-header">
        <h3>连线属性</h3>
        <p>连接线配置</p>
      </div>
      <div class="panel-content">
        <div class="property-tabs">
          <button class="tab-button active" data-tab="basic">🏷️ 基础</button>
          <button class="tab-button" data-tab="style">🎨 样式</button>
          <button class="tab-button" data-tab="flow">💫 流向</button>
          <button class="tab-button" data-tab="advanced">⚙️ 高级</button>
        </div>
        
        <div class="tab-content" id="basic-tab">
          ${this.createEdgeBasicPropertiesHTML()}
        </div>
        
        <div class="tab-content hidden" id="style-tab">
          ${this.createEdgeStylePropertiesHTML()}
        </div>
        
        <div class="tab-content hidden" id="flow-tab">
          ${this.createEdgeFlowPropertiesHTML()}
        </div>
        
        <div class="tab-content hidden" id="advanced-tab">
          ${this.createEdgeAdvancedPropertiesHTML()}
        </div>
        
        ${!this.config.readonly ? `
          <div class="property-actions">
            <button class="btn-primary" id="apply-edge-changes">应用更改</button>
            <button class="btn-secondary" id="reset-edge-changes">重置</button>
            <button class="btn-danger" id="delete-edge">删除连线</button>
          </div>
        ` : ''}
      </div>
    `
    
    this.bindEdgePropertyEvents()
  }

  /**
   * 创建连线基础属性HTML
   */
  private createEdgeBasicPropertiesHTML(): string {
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
          <select class="property-input" data-field="type" ${this.config.readonly ? 'disabled' : ''}>
            <option value="approval-edge">审批连线</option>
            <option value="condition-edge">条件连线</option>
            <option value="sequence-edge">顺序连线</option>
          </select>
        </div>
        <div class="property-group">
          <label>连线标签</label>
          <input type="text" class="property-input" data-field="text" 
                 value="${this.selectedEdge.text || ''}" ${this.config.readonly ? 'readonly' : ''}>
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
   * 创建连线样式属性HTML
   */
  private createEdgeStylePropertiesHTML(): string {
    return `
      <div class="property-section">
        <h4>🎨 线条样式</h4>
        <div class="property-row">
          <div class="property-group">
            <label>线条颜色</label>
            <input type="color" class="property-input color-input" data-field="style.stroke" 
                   value="#1890ff" ${this.config.readonly ? 'disabled' : ''}>
          </div>
          <div class="property-group">
            <label>线条宽度</label>
            <input type="range" class="property-input range-input" data-field="style.strokeWidth" 
                   min="1" max="5" value="2" ${this.config.readonly ? 'disabled' : ''}>
            <span class="range-value">2px</span>
          </div>
        </div>
        <div class="property-group">
          <label>线条样式</label>
          <select class="property-input" data-field="style.strokeDasharray" ${this.config.readonly ? 'disabled' : ''}>
            <option value="">实线</option>
            <option value="5,5">虚线</option>
            <option value="2,2">点线</option>
            <option value="10,5,2,5">点划线</option>
          </select>
        </div>
      </div>

      <div class="property-section">
        <h4>🏹 箭头设置</h4>
        <div class="property-row">
          <div class="property-group">
            <label>箭头类型</label>
            <select class="property-input" data-field="arrow.type" ${this.config.readonly ? 'disabled' : ''}>
              <option value="simple" selected>简单箭头</option>
              <option value="filled">实心箭头</option>
              <option value="diamond">菱形箭头</option>
              <option value="circle">圆形箭头</option>
            </select>
          </div>
          <div class="property-group">
            <label>箭头大小</label>
            <input type="range" class="property-input range-input" data-field="arrow.size" 
                   min="6" max="16" value="8" ${this.config.readonly ? 'disabled' : ''}>
            <span class="range-value">8px</span>
          </div>
        </div>
      </div>

      <div class="property-section">
        <h4>🏷️ 标签样式</h4>
        <div class="property-group">
          <label>标签位置</label>
          <select class="property-input" data-field="labels.position" ${this.config.readonly ? 'disabled' : ''}>
            <option value="start">起点</option>
            <option value="middle" selected>中间</option>
            <option value="end">终点</option>
          </select>
        </div>
        <div class="property-row">
          <div class="property-group">
            <label>字体大小</label>
            <input type="range" class="property-input range-input" data-field="labels.fontSize" 
                   min="8" max="16" value="11" ${this.config.readonly ? 'disabled' : ''}>
            <span class="range-value">11px</span>
          </div>
          <div class="property-group">
            <label>字体颜色</label>
            <input type="color" class="property-input color-input" data-field="labels.color" 
                   value="#333333" ${this.config.readonly ? 'disabled' : ''}>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 创建连线流向属性HTML
   */
  private createEdgeFlowPropertiesHTML(): string {
    return `
      <div class="property-section">
        <h4>💫 流向动画</h4>
        <div class="property-group">
          <label class="checkbox-label">
            <input type="checkbox" data-field="flow.flowIndicator.enabled" ${this.config.readonly ? 'disabled' : ''}>
            启用流向指示
          </label>
        </div>
        <div class="property-row">
          <div class="property-group">
            <label>指示器类型</label>
            <select class="property-input" data-field="flow.flowIndicator.type" ${this.config.readonly ? 'disabled' : ''}>
              <option value="dots">点状</option>
              <option value="arrows" selected>箭头</option>
              <option value="pulse">脉冲</option>
              <option value="dash">虚线</option>
            </select>
          </div>
          <div class="property-group">
            <label>动画速度</label>
            <input type="range" class="property-input range-input" data-field="flow.flowIndicator.speed" 
                   min="1" max="5" value="2" ${this.config.readonly ? 'disabled' : ''}>
            <span class="range-value">2x</span>
          </div>
        </div>
      </div>

      <div class="property-section">
        <h4>📊 数据流指示</h4>
        <div class="property-group">
          <label class="checkbox-label">
            <input type="checkbox" data-field="flow.dataFlow.enabled" ${this.config.readonly ? 'disabled' : ''}>
            启用数据流指示
          </label>
        </div>
        <div class="property-group">
          <label>流量等级</label>
          <select class="property-input" data-field="flow.dataFlow.volume" ${this.config.readonly ? 'disabled' : ''}>
            <option value="low">低流量</option>
            <option value="medium" selected>中等流量</option>
            <option value="high">高流量</option>
          </select>
        </div>
        <div class="property-group">
          <label>流向</label>
          <select class="property-input" data-field="flow.dataFlow.direction" ${this.config.readonly ? 'disabled' : ''}>
            <option value="forward" selected>正向</option>
            <option value="backward">反向</option>
            <option value="bidirectional">双向</option>
          </select>
        </div>
      </div>
    `
  }

  /**
   * 创建连线高级属性HTML
   */
  private createEdgeAdvancedPropertiesHTML(): string {
    return `
      <div class="property-section">
        <h4>🛠️ 路径设置</h4>
        <div class="property-group">
          <label>路径类型</label>
          <select class="property-input" data-field="pathType" ${this.config.readonly ? 'disabled' : ''}>
            <option value="straight" selected>直线</option>
            <option value="polyline">折线</option>
            <option value="bezier">贝塞尔曲线</option>
          </select>
        </div>
        <div class="property-group">
          <label>曲线弯曲度</label>
          <input type="range" class="property-input range-input" data-field="pathCurve" 
                 min="0" max="1" step="0.1" value="0.3" ${this.config.readonly ? 'disabled' : ''}>
          <span class="range-value">30%</span>
        </div>
      </div>

      <div class="property-section">
        <h4>🎯 条件设置</h4>
        <div class="property-group">
          <label>条件表达式</label>
          <textarea class="property-input" data-field="condition.expression" rows="2" 
                    placeholder="例如：approved == true" ${this.config.readonly ? 'readonly' : ''}></textarea>
        </div>
        <div class="property-group">
          <label>条件描述</label>
          <input type="text" class="property-input" data-field="condition.description" 
                 placeholder="例如：审批通过" ${this.config.readonly ? 'readonly' : ''}>
        </div>
        <div class="property-group">
          <label>优先级</label>
          <input type="number" class="property-input" data-field="condition.priority" 
                 value="1" min="1" max="10" ${this.config.readonly ? 'readonly' : ''}>
        </div>
      </div>

      <div class="property-section">
        <h4>⚡ 交互行为</h4>
        <div class="property-row">
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.hoverable" checked ${this.config.readonly ? 'disabled' : ''}>
              悬停效果
            </label>
          </div>
          <div class="property-group">
            <label class="checkbox-label">
              <input type="checkbox" data-field="behavior.selectable" checked ${this.config.readonly ? 'disabled' : ''}>
              可选择
            </label>
          </div>
        </div>
        <div class="property-group">
          <label class="checkbox-label">
            <input type="checkbox" data-field="behavior.contextMenu" checked ${this.config.readonly ? 'disabled' : ''}>
            右键菜单
          </label>
        </div>
      </div>
    `
  }

  /**
   * 创建自定义属性HTML
   */
  private createCustomPropertiesHTML(): string {
    if (!this.selectedNode?.properties || Object.keys(this.selectedNode.properties).length === 0) {
      return ''
    }

    const propertiesHTML = Object.entries(this.selectedNode.properties).map(([key, value]) => `
      <div class="property-group">
        <label>${key}</label>
        <input type="text" class="property-input" data-field="properties.${key}" 
               value="${value || ''}" ${this.config.readonly ? 'readonly' : ''}>
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
   * 创建节点类型选项
   */
  private createNodeTypeOptions(): string {
    const nodeTypes: Record<ApprovalNodeType, string> = {
      'start': '🎬 开始节点',
      'approval': '✅ 审批节点',
      'condition': '❓ 条件节点',
      'process': '⚙️ 处理节点',
      'end': '🏁 结束节点',
      'user-task': '👤 用户任务',
      'service-task': '🔧 服务任务',
      'script-task': '📜 脚本任务',
      'manual-task': '✋ 手工任务',
      'parallel-gateway': '➕ 并行网关',
      'exclusive-gateway': '❌ 排他网关',
      'inclusive-gateway': '⭕ 包容网关',
      'event-gateway': '🔺 事件网关',
      'timer-event': '⏰ 定时事件',
      'message-event': '📧 消息事件',
      'signal-event': '⚡ 信号事件'
    }

    return Object.entries(nodeTypes).map(([type, label]) =>
      `<option value="${type}" ${type === this.selectedNode?.type ? 'selected' : ''}>${label}</option>`
    ).join('')
  }

  /**
   * 获取节点类型标签
   */
  private getNodeTypeLabel(nodeType: ApprovalNodeType): string {
    const labels: Record<ApprovalNodeType, string> = {
      'start': '🎬 开始节点',
      'approval': '✅ 审批节点',
      'condition': '❓ 条件节点',
      'process': '⚙️ 处理节点',
      'end': '🏁 结束节点',
      'user-task': '👤 用户任务',
      'service-task': '🔧 服务任务',
      'script-task': '📜 脚本任务',
      'manual-task': '✋ 手工任务',
      'parallel-gateway': '➕ 并行网关',
      'exclusive-gateway': '❌ 排他网关',
      'inclusive-gateway': '⭕ 包容网关',
      'event-gateway': '🔺 事件网关',
      'timer-event': '⏰ 定时事件',
      'message-event': '📧 消息事件',
      'signal-event': '⚡ 信号事件'
    }
    return labels[nodeType] || nodeType
  }

  /**
   * 绑定全局事件
   */
  private bindGlobalEvents(): void {
    if (!this.panelElement) return

    // 布局方向选择
    const directionOptions = this.panelElement.querySelectorAll('.direction-option')
    directionOptions.forEach(option => {
      option.addEventListener('click', () => {
        const direction = option.getAttribute('data-direction') as LayoutDirection
        if (direction) {
          this.setLayoutDirection(direction)
        }
      })
    })

    // 快捷操作
    this.bindQuickActions()
  }

  /**
   * 绑定快捷操作
   */
  private bindQuickActions(): void {
    const autoLayoutBtn = this.panelElement?.querySelector('#auto-layout')
    if (autoLayoutBtn) {
      autoLayoutBtn.addEventListener('click', () => {
        // 触发自动布局
        this.config.onFlowchartDataChange?.('auto-layout')
      })
    }

    const optimizeLayoutBtn = this.panelElement?.querySelector('#optimize-layout')
    if (optimizeLayoutBtn) {
      optimizeLayoutBtn.addEventListener('click', () => {
        // 触发优化布局
        this.config.onFlowchartDataChange?.('optimize-layout')
      })
    }

    const resetLayoutBtn = this.panelElement?.querySelector('#reset-layout')
    if (resetLayoutBtn) {
      resetLayoutBtn.addEventListener('click', () => {
        // 触发重置布局
        this.config.onFlowchartDataChange?.('reset-layout')
      })
    }
  }

  /**
   * 绑定节点属性事件
   */
  private bindNodePropertyEvents(): void {
    if (!this.panelElement) return

    // 标签页切换
    this.bindTabEvents()

    // 输入变化监听
    this.bindInputEvents()

    // 操作按钮
    this.bindNodeActionEvents()
  }

  /**
   * 绑定标签页事件
   */
  private bindTabEvents(): void {
    const tabButtons = this.panelElement?.querySelectorAll('.tab-button')
    const tabContents = this.panelElement?.querySelectorAll('.tab-content')

    tabButtons?.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab')
        
        // 更新按钮状态
        tabButtons.forEach(btn => btn.classList.remove('active'))
        button.classList.add('active')
        
        // 更新内容显示
        tabContents?.forEach(content => {
          if (content.id === `${targetTab}-tab`) {
            content.classList.remove('hidden')
          } else {
            content.classList.add('hidden')
          }
        })
      })
    })
  }

  /**
   * 绑定输入事件
   */
  private bindInputEvents(): void {
    if (!this.panelElement || this.config.readonly) return

    const inputs = this.panelElement.querySelectorAll('.property-input')
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.markAsChanged()
        this.updateRangeValues()
      })
    })
  }

  /**
   * 更新范围输入显示值
   */
  private updateRangeValues(): void {
    const rangeInputs = this.panelElement?.querySelectorAll('.range-input')
    rangeInputs?.forEach(input => {
      const rangeValue = (input as HTMLInputElement).nextElementSibling
      if (rangeValue && rangeValue.classList.contains('range-value')) {
        const value = (input as HTMLInputElement).value
        const field = input.getAttribute('data-field')
        
        if (field?.includes('opacity') || field?.includes('Opacity')) {
          rangeValue.textContent = `${Math.round(parseFloat(value) * 100)}%`
        } else if (field?.includes('size') || field?.includes('Size') || field?.includes('width') || field?.includes('Width')) {
          rangeValue.textContent = `${value}px`
        } else if (field?.includes('speed') || field?.includes('Speed')) {
          rangeValue.textContent = `${value}x`
        } else if (field?.includes('curve') || field?.includes('Curve')) {
          rangeValue.textContent = `${Math.round(parseFloat(value) * 100)}%`
        } else {
          rangeValue.textContent = `${value}px`
        }
      }
    })
  }

  /**
   * 绑定节点操作事件
   */
  private bindNodeActionEvents(): void {
    const applyBtn = this.panelElement?.querySelector('#apply-node-changes')
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyNodeChanges())
    }

    const resetBtn = this.panelElement?.querySelector('#reset-node-changes')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.render())
    }

    const deleteBtn = this.panelElement?.querySelector('#delete-node')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteNode())
    }
  }

  /**
   * 绑定连线属性事件
   */
  private bindEdgePropertyEvents(): void {
    if (!this.panelElement) return

    // 标签页切换
    this.bindTabEvents()

    // 输入变化监听
    this.bindInputEvents()

    // 操作按钮
    this.bindEdgeActionEvents()
  }

  /**
   * 绑定连线操作事件
   */
  private bindEdgeActionEvents(): void {
    const applyBtn = this.panelElement?.querySelector('#apply-edge-changes')
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyEdgeChanges())
    }

    const resetBtn = this.panelElement?.querySelector('#reset-edge-changes')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.render())
    }

    const deleteBtn = this.panelElement?.querySelector('#delete-edge')
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteEdge())
    }
  }

  /**
   * 设置布局方向
   */
  private setLayoutDirection(direction: LayoutDirection): void {
    this.currentLayoutDirection = direction
    
    // 更新UI显示
    const directionOptions = this.panelElement?.querySelectorAll('.direction-option')
    directionOptions?.forEach(option => {
      if (option.getAttribute('data-direction') === direction) {
        option.classList.add('selected')
      } else {
        option.classList.remove('selected')
      }
    })
    
    // 触发回调
    this.config.onLayoutDirectionChange?.(direction)
  }

  /**
   * 应用节点更改
   */
  private applyNodeChanges(): void {
    if (!this.selectedNode || !this.panelElement) return

    try {
      const updates: Partial<ApprovalNodeConfig> = {}
      const inputs = this.panelElement.querySelectorAll('.property-input[data-field]') as NodeListOf<HTMLInputElement>

      inputs.forEach(input => {
        const field = input.dataset.field
        let value: any = input.value

        if (!field) return

        // 处理不同类型的字段
        if (input.type === 'checkbox') {
          value = (input as HTMLInputElement).checked
        } else if (input.type === 'number' || input.type === 'range') {
          value = parseFloat(value) || 0
        }

        // 设置嵌套字段
        this.setNestedProperty(updates, field, value)
      })

      // 触发更新回调，传递清理后的数据
      if (this.selectedNode.id && Object.keys(updates).length > 0) {
        // 清理空值和无效数据
        const cleanUpdates = this.cleanUpdates(updates)
        this.config.onUpdateNode?.(this.selectedNode.id, cleanUpdates)
        
        // 更新本地状态
        Object.assign(this.selectedNode, cleanUpdates)
      }

      // 移除更改标记
      this.removeChangedMark()
    } catch (error) {
      console.error('应用节点更改失败:', error)
    }
  }

  /**
   * 清理更新数据，移除空值和无效数据
   */
  private cleanUpdates(updates: any): any {
    const cleaned: any = {}
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && value !== null) {
          // 递归清理嵌套对象
          const cleanedNested = this.cleanUpdates(value)
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested
          }
        } else {
          cleaned[key] = value
        }
      }
    }
    
    return cleaned
  }

  /**
   * 应用连线更改
   */
  private applyEdgeChanges(): void {
    if (!this.selectedEdge || !this.panelElement) return

    const updates: Partial<ApprovalEdgeConfig> = {}
    const inputs = this.panelElement.querySelectorAll('.property-input[data-field]') as NodeListOf<HTMLInputElement>

    inputs.forEach(input => {
      const field = input.dataset.field
      let value: any = input.value

      if (!field) return

      // 处理不同类型的字段
      if (input.type === 'checkbox') {
        value = (input as HTMLInputElement).checked
      } else if (input.type === 'number' || input.type === 'range') {
        value = parseFloat(value) || 0
      }

      // 设置嵌套字段
      this.setNestedProperty(updates, field, value)
    })

    // 触发更新回调
    if (this.selectedEdge.id) {
      this.config.onUpdateEdge?.(this.selectedEdge.id, updates)
    }

    // 更新本地状态
    Object.assign(this.selectedEdge, updates)

    // 移除更改标记
    this.removeChangedMark()
  }

  /**
   * 设置嵌套属性
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key]) {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 删除节点
   */
  private deleteNode(): void {
    if (!this.selectedNode) return

    if (confirm(`确定要删除节点 "${this.selectedNode.text || this.selectedNode.id}" 吗？`)) {
      this.config.onFlowchartDataChange?.(`delete-node:${this.selectedNode.id}`)
      this.setSelectedNode(null)
    }
  }

  /**
   * 删除连线
   */
  private deleteEdge(): void {
    if (!this.selectedEdge) return

    if (confirm('确定要删除这条连线吗？')) {
      this.config.onFlowchartDataChange?.(`delete-edge:${this.selectedEdge.id}`)
      this.setSelectedEdge(null)
    }
  }

  /**
   * 标记为已更改
   */
  private markAsChanged(): void {
    const applyBtn = this.panelElement?.querySelector('.btn-primary') as HTMLButtonElement
    if (applyBtn && !applyBtn.textContent?.includes('*')) {
      applyBtn.textContent += ' *'
      applyBtn.classList.add('has-changes')
    }
  }

  /**
   * 移除更改标记
   */
  private removeChangedMark(): void {
    const applyBtn = this.panelElement?.querySelector('.btn-primary') as HTMLButtonElement
    if (applyBtn) {
      applyBtn.textContent = applyBtn.textContent?.replace(' *', '') || '应用更改'
      applyBtn.classList.remove('has-changes')
    }
  }

  /**
   * 应用样式
   */
  private applyStyles(): void {
    const styles = `
      .ldesign-enhanced-property-panel {
        width: 100%;
        height: 100%;
        background: var(--ldesign-bg-color-container, #fff);
        border-left: 1px solid var(--ldesign-border-color, #e5e5e5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-size: 12px;
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

      .global-settings {
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 2px solid var(--ldesign-border-color, #e5e5e5);
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

      /* 标签页 */
      .property-tabs {
        display: flex;
        border-bottom: 2px solid var(--ldesign-border-color, #e5e5e5);
        margin-bottom: 16px;
      }

      .tab-button {
        flex: 1;
        padding: 8px 4px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 11px;
        color: var(--ldesign-text-color-secondary, #666);
        transition: all 0.2s ease;
        text-align: center;
      }

      .tab-button:hover {
        color: var(--ldesign-brand-color, #722ED1);
        background: var(--ldesign-bg-color-component, #fafafa);
      }

      .tab-button.active {
        color: var(--ldesign-brand-color, #722ED1);
        border-bottom-color: var(--ldesign-brand-color, #722ED1);
        font-weight: 600;
      }

      .tab-content {
        animation: fadeIn 0.3s ease;
      }

      .tab-content.hidden {
        display: none;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* 属性分组 */
      .property-section {
        margin-bottom: 20px;
      }

      .property-section h4 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--ldesign-text-color-primary, #333);
        border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
        padding-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
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
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .tooltip {
        width: 14px;
        height: 14px;
        background: var(--ldesign-text-color-secondary, #666);
        color: white;
        border-radius: 50%;
        font-size: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: help;
      }

      /* 输入控件 */
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

      .color-input {
        height: 32px;
        padding: 2px;
        cursor: pointer;
      }

      .range-input {
        padding: 0;
        margin: 4px 0;
      }

      .range-value {
        display: inline-block;
        margin-left: 8px;
        font-size: 11px;
        color: var(--ldesign-text-color-secondary, #666);
        min-width: 40px;
      }

      .checkbox-label {
        display: flex !important;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        margin-bottom: 8px !important;
      }

      .checkbox-label input[type="checkbox"] {
        width: auto;
        margin: 0;
      }

      /* 布局方向选择器 */
      .layout-direction-selector {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      .direction-option {
        flex: 1;
        padding: 8px;
        border: 2px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: 6px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--ldesign-bg-color-container, #fff);
      }

      .direction-option:hover {
        border-color: var(--ldesign-brand-color, #722ED1);
        transform: translateY(-1px);
      }

      .direction-option.selected {
        border-color: var(--ldesign-brand-color, #722ED1);
        background: var(--ldesign-brand-color-1, #f6f0ff);
        color: var(--ldesign-brand-color, #722ED1);
        font-weight: 600;
      }

      .direction-icon {
        font-size: 18px;
        margin-bottom: 4px;
      }

      .direction-option span {
        font-size: 11px;
        display: block;
      }

      /* 快捷操作 */
      .quick-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .btn-action {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
        border-radius: 4px;
        background: var(--ldesign-bg-color-component, #fafafa);
        color: var(--ldesign-text-color-primary, #333);
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 0;
      }

      .btn-action:hover {
        border-color: var(--ldesign-brand-color, #722ED1);
        color: var(--ldesign-brand-color, #722ED1);
        transform: translateY(-1px);
      }

      /* 操作按钮 */
      .property-actions {
        padding-top: 16px;
        border-top: 1px solid var(--ldesign-border-color, #e5e5e5);
        display: flex;
        gap: 8px;
        margin-top: 20px;
      }

      .btn-primary, .btn-secondary, .btn-danger {
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
        transform: translateY(-1px);
      }

      .btn-primary.has-changes {
        background: var(--ldesign-warning-color, #f5c538);
        color: #333;
        box-shadow: 0 0 0 2px var(--ldesign-warning-color-1, #fff9e6);
      }

      .btn-secondary {
        background: var(--ldesign-bg-color-component, #f8f9fa);
        color: var(--ldesign-text-color-primary, #333);
        border: 1px solid var(--ldesign-border-color, #e5e5e5);
      }

      .btn-secondary:hover {
        background: var(--ldesign-bg-color-component-hover, #e9ecef);
        transform: translateY(-1px);
      }

      .btn-danger {
        background: var(--ldesign-error-color, #f5222d);
        color: white;
      }

      .btn-danger:hover {
        background: var(--ldesign-error-color-hover, #d4171e);
        transform: translateY(-1px);
      }
    `

    // 注入样式
    if (!document.getElementById('enhanced-property-panel-styles')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'enhanced-property-panel-styles'
      styleElement.textContent = styles
      document.head.appendChild(styleElement)
    }
  }

  /**
   * 设置选中的节点
   */
  public setSelectedNode(node: ApprovalNodeConfig | null): void {
    this.selectedNode = node
    this.selectedEdge = null
    this.render()
  }

  /**
   * 设置选中的边
   */
  public setSelectedEdge(edge: ApprovalEdgeConfig | null): void {
    this.selectedEdge = edge
    this.selectedNode = null
    this.render()
  }

  /**
   * 设置布局方向（外部调用）
   */
  public setLayoutDirection(direction: LayoutDirection): void {
    this.currentLayoutDirection = direction
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
