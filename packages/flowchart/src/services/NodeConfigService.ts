/**
 * 节点配置服务
 * 
 * 为节点添加丰富的配置选项，包括布局、样式、交互等
 */

import type { ApprovalNodeType } from '../types'
import type { LayoutDirection } from './LayoutDetectionService'
import type { NodeLayout } from './NodeRenderOptimizer'

export interface NodeStyleConfig {
  // 基础样式
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
  strokeOpacity?: number
  fillOpacity?: number
  
  // 尺寸配置
  width?: number
  height?: number
  radius?: number
  
  // 渐变配置
  gradient?: {
    type: 'linear' | 'radial'
    colors: Array<{ offset: number, color: string }>
    direction?: number // 线性渐变角度
  }
  
  // 阴影配置
  shadow?: {
    enabled: boolean
    offsetX: number
    offsetY: number
    blur: number
    color: string
    inset?: boolean
  }
  
  // 边框样式
  border?: {
    radius?: number
    style?: 'solid' | 'dashed' | 'dotted' | 'double'
  }
}

export interface NodeTextConfig {
  // 文本内容
  content?: string
  
  // 字体配置
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  fontStyle?: 'normal' | 'italic' | 'oblique'
  color?: string
  
  // 对齐配置
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  
  // 位置配置
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'custom'
  offset?: { x: number, y: number }
  
  // 多行配置
  maxLines?: number
  lineHeight?: number
  wordBreak?: 'normal' | 'break-all' | 'keep-all'
  
  // 背景配置
  background?: {
    enabled: boolean
    color: string
    padding: number
    borderRadius: number
    opacity: number
  }
  
  // 文本效果
  textShadow?: {
    enabled: boolean
    offsetX: number
    offsetY: number
    blur: number
    color: string
  }
  
  // 装饰
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline'
}

export interface NodeIconConfig {
  // 图标类型
  type?: 'built-in' | 'custom' | 'emoji' | 'image'
  name?: string
  customPath?: string
  emoji?: string
  imageUrl?: string
  
  // 尺寸配置
  size?: number
  width?: number
  height?: number
  
  // 位置配置
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom'
  offset?: { x: number, y: number }
  
  // 样式配置
  color?: string
  strokeWidth?: number
  fill?: string
  opacity?: number
  
  // 旋转配置
  rotation?: number
  
  // 动画配置
  animation?: {
    type: 'none' | 'spin' | 'pulse' | 'bounce' | 'shake'
    duration: number
    iterationCount: number | 'infinite'
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  }
}

export interface NodeLayoutConfig {
  // 布局策略
  strategy?: 'vertical' | 'horizontal' | 'overlay' | 'custom'
  
  // 间距配置
  iconTextSpacing?: number
  padding?: number | { top: number, right: number, bottom: number, left: number }
  
  // 对齐方式
  horizontalAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  
  // 自适应配置
  autoResize?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  
  // 内容适配
  contentFit?: 'contain' | 'cover' | 'fill' | 'scale-down'
  
  // 防重叠
  preventOverlap?: boolean
  overlapResolution?: 'resize' | 'reposition' | 'scale'
}

export interface NodeBehaviorConfig {
  // 交互配置
  draggable?: boolean
  resizable?: boolean
  rotatable?: boolean
  selectable?: boolean
  hoverable?: boolean
  
  // 连接配置
  connectable?: boolean
  connectableAsSource?: boolean
  connectableAsTarget?: boolean
  maxConnections?: number
  
  // 编辑配置
  textEditable?: boolean
  propertiesEditable?: boolean
  
  // 悬停效果
  hoverStyle?: Partial<NodeStyleConfig>
  hoverScale?: number
  hoverDuration?: number
  
  // 选中效果
  selectedStyle?: Partial<NodeStyleConfig>
  selectedScale?: number
  
  // 焦点效果
  focusStyle?: Partial<NodeStyleConfig>
  
  // 禁用状态
  disabled?: boolean
  disabledStyle?: Partial<NodeStyleConfig>
  
  // 动画配置
  animations?: {
    appear?: string
    disappear?: string
    hover?: string
    select?: string
  }
  
  // 右键菜单
  contextMenu?: boolean
  customMenuItems?: Array<{
    label: string
    action: string
    icon?: string
    disabled?: boolean
    separator?: boolean
  }>
}

export interface NodeAnchorConfig {
  // 锚点配置
  anchors?: Array<{
    id: string
    type: 'input' | 'output' | 'both'
    position: 'top' | 'right' | 'bottom' | 'left' | 'custom'
    offset?: { x: number, y: number }
    style?: {
      fill?: string
      stroke?: string
      strokeWidth?: number
      radius?: number
    }
    label?: string
    visible?: boolean
    connectable?: boolean
  }>
  
  // 默认锚点行为
  defaultAnchorBehavior?: {
    autoGenerate?: boolean
    type?: 'input' | 'output' | 'both'
    style?: NodeAnchorConfig['anchors'][0]['style']
  }
}

export interface CompleteNodeConfig {
  id?: string
  type: ApprovalNodeType
  x: number
  y: number
  
  // 基础配置
  text?: string
  properties?: Record<string, any>
  
  // 样式配置
  style?: NodeStyleConfig
  
  // 文本配置
  textConfig?: NodeTextConfig
  
  // 图标配置
  icon?: NodeIconConfig
  
  // 布局配置
  layout?: NodeLayoutConfig
  
  // 行为配置
  behavior?: NodeBehaviorConfig
  
  // 锚点配置
  anchor?: NodeAnchorConfig
  
  // 自定义渲染
  customRenderer?: {
    enabled: boolean
    renderFunction?: string // 自定义渲染函数的字符串表示
  }
  
  // 数据绑定
  dataBinding?: {
    enabled: boolean
    source?: string
    fields?: Record<string, string>
    updateInterval?: number
  }
  
  // 条件配置
  condition?: {
    expression?: string
    visible?: boolean
    enabled?: boolean
  }
}

export class NodeConfigService {
  /**
   * 获取默认的节点配置
   */
  getDefaultConfig(nodeType: ApprovalNodeType, layoutDirection?: LayoutDirection): CompleteNodeConfig {
    const baseConfig: CompleteNodeConfig = {
      type: nodeType,
      x: 0,
      y: 0,
      style: this.getDefaultStyle(nodeType),
      textConfig: this.getDefaultTextConfig(nodeType),
      icon: this.getDefaultIconConfig(nodeType),
      layout: this.getDefaultLayoutConfig(nodeType, layoutDirection),
      behavior: this.getDefaultBehaviorConfig(nodeType),
      anchor: this.getDefaultAnchorConfig(nodeType, layoutDirection)
    }
    
    // 根据节点类型特殊配置
    return this.applyNodeTypeSpecificConfig(baseConfig, nodeType)
  }

  /**
   * 获取默认样式配置
   */
  private getDefaultStyle(nodeType: ApprovalNodeType): NodeStyleConfig {
    const baseStyle: NodeStyleConfig = {
      strokeWidth: 2,
      strokeOpacity: 1,
      fillOpacity: 1
    }
    
    // 根据节点类型设置颜色
    const colorMap: Record<ApprovalNodeType, { fill: string, stroke: string }> = {
      'start': { fill: 'var(--ldesign-success-color-1, #ebfaeb)', stroke: 'var(--ldesign-success-color, #52c41a)' },
      'end': { fill: 'var(--ldesign-error-color-1, #fde8e8)', stroke: 'var(--ldesign-error-color, #e54848)' },
      'approval': { fill: 'var(--ldesign-primary-color-1, #e6f7ff)', stroke: 'var(--ldesign-primary-color, #1890ff)' },
      'condition': { fill: 'var(--ldesign-warning-color-1, #fff9e6)', stroke: 'var(--ldesign-warning-color, #faad14)' },
      'process': { fill: 'var(--ldesign-purple-color-1, #f4f0ff)', stroke: 'var(--ldesign-purple-color, #722ed1)' },
      'user-task': { fill: 'var(--ldesign-cyan-color-1, #e6fffe)', stroke: 'var(--ldesign-cyan-color, #13c2c2)' },
      'service-task': { fill: 'var(--ldesign-magenta-color-1, #fff0f8)', stroke: 'var(--ldesign-magenta-color, #eb2f96)' },
      'script-task': { fill: 'var(--ldesign-success-color-1, #ebfaeb)', stroke: 'var(--ldesign-success-color, #52c41a)' },
      'manual-task': { fill: 'var(--ldesign-orange-color-1, #fff2e6)', stroke: 'var(--ldesign-orange-color, #fa8c16)' },
      'parallel-gateway': { fill: 'var(--ldesign-primary-color-1, #e6f7ff)', stroke: 'var(--ldesign-primary-color, #1890ff)' },
      'exclusive-gateway': { fill: 'var(--ldesign-error-color-1, #fde8e8)', stroke: 'var(--ldesign-error-color, #f5222d)' },
      'inclusive-gateway': { fill: 'var(--ldesign-success-color-1, #ebfaeb)', stroke: 'var(--ldesign-success-color, #52c41a)' },
      'event-gateway': { fill: 'var(--ldesign-purple-color-1, #f4f0ff)', stroke: 'var(--ldesign-purple-color, #722ed1)' },
      'timer-event': { fill: 'var(--ldesign-warning-color-1, #fff9e6)', stroke: 'var(--ldesign-warning-color, #faad14)' },
      'message-event': { fill: 'var(--ldesign-cyan-color-1, #e6fffe)', stroke: 'var(--ldesign-cyan-color, #13c2c2)' },
      'signal-event': { fill: 'var(--ldesign-magenta-color-1, #fff0f8)', stroke: 'var(--ldesign-magenta-color, #eb2f96)' }
    }
    
    const colors = colorMap[nodeType] || colorMap['process']
    
    return {
      ...baseStyle,
      ...colors
    }
  }

  /**
   * 获取默认文本配置
   */
  private getDefaultTextConfig(nodeType: ApprovalNodeType): NodeTextConfig {
    const fontSizeMap: Record<ApprovalNodeType, number> = {
      'start': 11,
      'end': 11,
      'approval': 12,
      'condition': 11,
      'process': 12,
      'user-task': 11,
      'service-task': 11,
      'script-task': 11,
      'manual-task': 11,
      'parallel-gateway': 10,
      'exclusive-gateway': 10,
      'inclusive-gateway': 10,
      'event-gateway': 10,
      'timer-event': 10,
      'message-event': 10,
      'signal-event': 10
    }
    
    return {
      fontSize: fontSizeMap[nodeType] || 12,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: (nodeType === 'start' || nodeType === 'end') ? 'bold' : 'normal',
      color: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))',
      textAlign: 'center',
      verticalAlign: 'middle',
      position: 'bottom',
      lineHeight: 1.2,
      maxLines: 2
    }
  }

  /**
   * 获取默认图标配置
   */
  private getDefaultIconConfig(nodeType: ApprovalNodeType): NodeIconConfig {
    const iconMap: Record<ApprovalNodeType, string> = {
      'start': 'play',
      'end': 'square',
      'approval': 'check-square',
      'condition': 'help-circle',
      'process': 'settings',
      'user-task': 'user',
      'service-task': 'cog',
      'script-task': 'file-text',
      'manual-task': 'hand',
      'parallel-gateway': 'plus',
      'exclusive-gateway': 'x',
      'inclusive-gateway': 'circle',
      'event-gateway': 'triangle',
      'timer-event': 'clock',
      'message-event': 'mail',
      'signal-event': 'zap'
    }
    
    return {
      type: 'built-in',
      name: iconMap[nodeType] || 'settings',
      size: 16,
      position: 'center',
      color: 'currentColor',
      strokeWidth: 2
    }
  }

  /**
   * 获取默认布局配置
   */
  private getDefaultLayoutConfig(nodeType: ApprovalNodeType, layoutDirection?: LayoutDirection): NodeLayoutConfig {
    return {
      strategy: 'vertical',
      iconTextSpacing: 8,
      padding: 10,
      horizontalAlign: 'center',
      verticalAlign: 'middle',
      autoResize: true,
      minWidth: 60,
      maxWidth: 120,
      minHeight: 60,
      maxHeight: 100,
      preventOverlap: true,
      overlapResolution: 'reposition'
    }
  }

  /**
   * 获取默认行为配置
   */
  private getDefaultBehaviorConfig(nodeType: ApprovalNodeType): NodeBehaviorConfig {
    return {
      draggable: true,
      resizable: false,
      rotatable: false,
      selectable: true,
      hoverable: true,
      connectable: true,
      connectableAsSource: nodeType !== 'end',
      connectableAsTarget: nodeType !== 'start',
      textEditable: true,
      propertiesEditable: true,
      hoverScale: 1.05,
      hoverDuration: 200,
      contextMenu: true
    }
  }

  /**
   * 获取默认锚点配置
   */
  private getDefaultAnchorConfig(nodeType: ApprovalNodeType, layoutDirection?: LayoutDirection): NodeAnchorConfig {
    const anchorConfig: NodeAnchorConfig = {
      defaultAnchorBehavior: {
        autoGenerate: true,
        type: 'both',
        style: {
          fill: 'var(--ldesign-primary-color, #1890ff)',
          stroke: 'var(--ldesign-primary-color, #1890ff)',
          strokeWidth: 1,
          radius: 4
        }
      }
    }
    
    // 根据节点类型和布局方向生成特定锚点
    if (nodeType === 'start') {
      if (layoutDirection === 'horizontal') {
        anchorConfig.anchors = [{
          id: 'start_right',
          type: 'output',
          position: 'right',
          visible: true,
          connectable: true
        }]
      } else if (layoutDirection === 'vertical') {
        anchorConfig.anchors = [{
          id: 'start_bottom',
          type: 'output',
          position: 'bottom',
          visible: true,
          connectable: true
        }]
      }
    } else if (nodeType === 'end') {
      if (layoutDirection === 'horizontal') {
        anchorConfig.anchors = [{
          id: 'end_left',
          type: 'input',
          position: 'left',
          visible: true,
          connectable: true
        }]
      } else if (layoutDirection === 'vertical') {
        anchorConfig.anchors = [{
          id: 'end_top',
          type: 'input',
          position: 'top',
          visible: true,
          connectable: true
        }]
      }
    }
    
    return anchorConfig
  }

  /**
   * 应用节点类型特定配置
   */
  private applyNodeTypeSpecificConfig(config: CompleteNodeConfig, nodeType: ApprovalNodeType): CompleteNodeConfig {
    switch (nodeType) {
      case 'start':
      case 'end':
        return {
          ...config,
          style: {
            ...config.style,
            radius: 30
          },
          layout: {
            ...config.layout,
            strategy: 'vertical',
            maxWidth: 80
          }
        }
        
      case 'condition':
        return {
          ...config,
          style: {
            ...config.style,
            // 菱形样式
            border: { radius: 0 }
          },
          behavior: {
            ...config.behavior,
            // 条件节点支持多个输出连接
            connectableAsSource: true
          }
        }
        
      case 'parallel-gateway':
      case 'exclusive-gateway':
      case 'inclusive-gateway':
      case 'event-gateway':
        return {
          ...config,
          style: {
            ...config.style,
            // 网关节点样式
            border: { radius: 0 }
          },
          layout: {
            ...config.layout,
            maxWidth: 60,
            maxHeight: 60
          }
        }
        
      default:
        return config
    }
  }

  /**
   * 创建条件节点配置
   */
  createConditionalNode(condition: string, position: { x: number, y: number }): CompleteNodeConfig {
    return {
      ...this.getDefaultConfig('condition'),
      x: position.x,
      y: position.y,
      text: '条件判断',
      properties: {
        condition: condition,
        type: 'conditional'
      },
      textConfig: {
        ...this.getDefaultTextConfig('condition'),
        content: condition
      },
      behavior: {
        ...this.getDefaultBehaviorConfig('condition'),
        maxConnections: -1 // 无限制输出连接
      }
    }
  }

  /**
   * 创建审批节点配置
   */
  createApprovalNode(
    approver: string, 
    position: { x: number, y: number },
    timeLimit?: number
  ): CompleteNodeConfig {
    return {
      ...this.getDefaultConfig('approval'),
      x: position.x,
      y: position.y,
      text: `${approver}审批`,
      properties: {
        approver: approver,
        timeLimit: timeLimit,
        type: 'approval'
      },
      textConfig: {
        ...this.getDefaultTextConfig('approval'),
        content: `${approver}审批`,
        maxLines: 2
      }
    }
  }

  /**
   * 应用主题到节点配置
   */
  applyTheme(config: CompleteNodeConfig, theme: 'light' | 'dark' | 'blue'): CompleteNodeConfig {
    const themeColors = this.getThemeColors(theme)
    
    return {
      ...config,
      style: {
        ...config.style,
        fill: config.style?.fill?.includes('var(') ? config.style.fill : themeColors.nodeFill,
        stroke: config.style?.stroke?.includes('var(') ? config.style.stroke : themeColors.nodeStroke,
        ...(config.style?.shadow && {
          shadow: {
            ...config.style.shadow,
            color: themeColors.shadowColor
          }
        })
      },
      textConfig: {
        ...config.textConfig,
        color: config.textConfig?.color?.includes('var(') ? config.textConfig.color : themeColors.textColor,
        ...(config.textConfig?.background && {
          background: {
            ...config.textConfig.background,
            color: themeColors.backgroundColor
          }
        })
      }
    }
  }

  /**
   * 获取主题颜色
   */
  private getThemeColors(theme: 'light' | 'dark' | 'blue') {
    const colorMaps = {
      light: {
        nodeFill: '#ffffff',
        nodeStroke: '#d9d9d9',
        textColor: '#333333',
        backgroundColor: '#ffffff',
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      },
      dark: {
        nodeFill: '#2a2a2a',
        nodeStroke: '#555555',
        textColor: '#ffffff',
        backgroundColor: '#1f1f1f',
        shadowColor: 'rgba(255, 255, 255, 0.1)'
      },
      blue: {
        nodeFill: '#f0f8ff',
        nodeStroke: '#b3d9ff',
        textColor: '#1a1a1a',
        backgroundColor: '#e6f4ff',
        shadowColor: 'rgba(26, 144, 255, 0.2)'
      }
    }
    
    return colorMaps[theme]
  }

  /**
   * 验证节点配置
   */
  validateConfig(config: CompleteNodeConfig): { valid: boolean, errors: string[] } {
    const errors: string[] = []
    
    if (!config.type) {
      errors.push('节点类型不能为空')
    }
    
    if (typeof config.x !== 'number' || typeof config.y !== 'number') {
      errors.push('节点位置必须为有效数字')
    }
    
    if (config.style?.strokeWidth && config.style.strokeWidth < 0) {
      errors.push('线条宽度不能为负数')
    }
    
    if (config.textConfig?.fontSize && config.textConfig.fontSize < 8) {
      errors.push('字体大小不能小于8px')
    }
    
    if (config.icon?.size && config.icon.size < 8) {
      errors.push('图标大小不能小于8px')
    }
    
    if (config.layout?.minWidth && config.layout?.maxWidth && config.layout.minWidth > config.layout.maxWidth) {
      errors.push('最小宽度不能大于最大宽度')
    }
    
    if (config.layout?.minHeight && config.layout?.maxHeight && config.layout.minHeight > config.layout.maxHeight) {
      errors.push('最小高度不能大于最大高度')
    }
    
    return { valid: errors.length === 0, errors }
  }

  /**
   * 合并节点配置
   */
  mergeConfigs(base: CompleteNodeConfig, override: Partial<CompleteNodeConfig>): CompleteNodeConfig {
    return {
      ...base,
      ...override,
      style: { ...base.style, ...override.style },
      textConfig: { ...base.textConfig, ...override.textConfig },
      icon: { ...base.icon, ...override.icon },
      layout: { ...base.layout, ...override.layout },
      behavior: { ...base.behavior, ...override.behavior },
      anchor: { ...base.anchor, ...override.anchor },
      properties: { ...base.properties, ...override.properties }
    }
  }
}

// 导出单例实例
export const nodeConfigService = new NodeConfigService()
