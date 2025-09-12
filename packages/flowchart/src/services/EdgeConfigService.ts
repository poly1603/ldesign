/**
 * 连线配置服务
 * 
 * 为连线添加丰富的配置选项，包括样式、动画、标签等
 */

import type { ApprovalEdgeType } from '../types'
import type { LayoutDirection } from './LayoutDetectionService'

export interface EdgeStyleConfig {
  // 基础样式
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
  strokeOpacity?: number
  fill?: string
  
  // 动画配置
  animated?: boolean
  animationDuration?: number
  animationTimingFunction?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  animationDelay?: number
  animationDirection?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  
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
  }
}

export interface EdgeLabelConfig {
  // 文本配置
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  color?: string
  
  // 位置配置
  position?: 'start' | 'middle' | 'end' | 'custom'
  offset?: { x: number, y: number }
  distance?: number // 距离连线的距离
  
  // 背景配置
  background?: {
    enabled: boolean
    color: string
    padding: number
    borderRadius: number
    opacity: number
  }
  
  // 边框配置
  border?: {
    enabled: boolean
    width: number
    color: string
    style: 'solid' | 'dashed' | 'dotted'
  }
}

export interface EdgeArrowConfig {
  // 箭头样式
  type?: 'none' | 'simple' | 'filled' | 'diamond' | 'circle' | 'custom'
  size?: number
  color?: string
  strokeWidth?: number
  
  // 自定义箭头路径
  customPath?: string
  
  // 位置配置
  position?: 'end' | 'start' | 'both'
  offset?: number // 距离节点的偏移
}

export interface EdgeBehaviorConfig {
  // 交互配置
  hoverable?: boolean
  selectable?: boolean
  draggable?: boolean
  
  // 悬停效果
  hoverStyle?: Partial<EdgeStyleConfig>
  hoverScale?: number
  hoverDuration?: number
  
  // 选中效果
  selectedStyle?: Partial<EdgeStyleConfig>
  
  // 点击行为
  clickable?: boolean
  doubleClickable?: boolean
  
  // 右键菜单
  contextMenu?: boolean
}

export interface EdgeFlowConfig {
  // 流向指示
  flowIndicator?: {
    enabled: boolean
    type: 'dots' | 'arrows' | 'pulse' | 'dash'
    speed: number // 动画速度
    size: number
    color: string
    spacing: number // 指示器之间的间距
  }
  
  // 数据流量指示
  dataFlow?: {
    enabled: boolean
    volume: 'low' | 'medium' | 'high'
    direction: 'forward' | 'backward' | 'bidirectional'
    speed: number
  }
}

export interface CompleteEdgeConfig {
  id?: string
  type: ApprovalEdgeType
  sourceNodeId: string
  targetNodeId: string
  
  // 基础配置
  text?: string
  properties?: Record<string, any>
  
  // 样式配置
  style?: EdgeStyleConfig
  
  // 标签配置
  labels?: EdgeLabelConfig[]
  
  // 箭头配置
  arrow?: EdgeArrowConfig
  
  // 行为配置
  behavior?: EdgeBehaviorConfig
  
  // 流向配置
  flow?: EdgeFlowConfig
  
  // 路径配置
  pathType?: 'straight' | 'polyline' | 'bezier' | 'custom'
  pathPoints?: Array<{ x: number, y: number }>
  pathCurve?: number // 贝塞尔曲线弯曲程度
  
  // 条件配置（用于条件分支）
  condition?: {
    expression: string
    description?: string
    priority?: number
    color?: string
  }
}

export class EdgeConfigService {
  /**
   * 获取默认的连线配置
   */
  getDefaultConfig(edgeType: ApprovalEdgeType, layoutDirection?: LayoutDirection): CompleteEdgeConfig {
    const baseConfig: CompleteEdgeConfig = {
      type: edgeType,
      sourceNodeId: '',
      targetNodeId: '',
      style: this.getDefaultStyle(edgeType),
      arrow: this.getDefaultArrow(edgeType),
      behavior: this.getDefaultBehavior(),
      pathType: this.getRecommendedPathType(layoutDirection)
    }
    
    // 根据连线类型调整配置
    switch (edgeType) {
      case 'approval-edge':
        return {
          ...baseConfig,
          style: {
            ...baseConfig.style,
            stroke: 'var(--ldesign-primary-color, #1890ff)',
            strokeWidth: 2
          },
          flow: {
            flowIndicator: {
              enabled: true,
              type: 'arrows',
              speed: 2,
              size: 8,
              color: 'var(--ldesign-primary-color, #1890ff)',
              spacing: 20
            }
          }
        }
        
      default:
        return baseConfig
    }
  }

  /**
   * 获取默认样式
   */
  private getDefaultStyle(edgeType: ApprovalEdgeType): EdgeStyleConfig {
    return {
      stroke: 'var(--ldesign-border-color-base, #d9d9d9)',
      strokeWidth: 1,
      strokeOpacity: 1,
      animated: false,
      animationDuration: 2000,
      animationTimingFunction: 'ease-in-out'
    }
  }

  /**
   * 获取默认箭头配置
   */
  private getDefaultArrow(edgeType: ApprovalEdgeType): EdgeArrowConfig {
    return {
      type: 'simple',
      size: 8,
      color: 'var(--ldesign-border-color-base, #d9d9d9)',
      strokeWidth: 1,
      position: 'end',
      offset: 5
    }
  }

  /**
   * 获取默认行为配置
   */
  private getDefaultBehavior(): EdgeBehaviorConfig {
    return {
      hoverable: true,
      selectable: true,
      draggable: false,
      clickable: true,
      contextMenu: true,
      hoverStyle: {
        stroke: 'var(--ldesign-primary-color, #1890ff)',
        strokeWidth: 2
      },
      selectedStyle: {
        stroke: 'var(--ldesign-primary-color, #1890ff)',
        strokeWidth: 2,
        strokeDasharray: '5,5'
      }
    }
  }

  /**
   * 根据布局方向推荐路径类型
   */
  private getRecommendedPathType(layoutDirection?: LayoutDirection): 'straight' | 'polyline' | 'bezier' {
    switch (layoutDirection) {
      case 'horizontal':
      case 'vertical':
        return 'straight'
      case 'mixed':
        return 'polyline'
      default:
        return 'bezier'
    }
  }

  /**
   * 创建条件分支连线配置
   */
  createConditionalEdge(
    condition: string,
    description?: string,
    priority: number = 1,
    isApproved: boolean = true
  ): Partial<CompleteEdgeConfig> {
    const color = isApproved 
      ? 'var(--ldesign-success-color, #52c41a)' 
      : 'var(--ldesign-error-color, #f5222d)'
    
    return {
      type: 'approval-edge',
      condition: {
        expression: condition,
        description,
        priority,
        color
      },
      style: {
        stroke: color,
        strokeWidth: 2,
        animated: true,
        animationDuration: 1500
      },
      labels: [{
        text: description || condition,
        position: 'middle',
        fontSize: 11,
        color: color,
        background: {
          enabled: true,
          color: 'var(--ldesign-bg-color-container, #ffffff)',
          padding: 4,
          borderRadius: 4,
          opacity: 0.9
        },
        border: {
          enabled: true,
          width: 1,
          color: color,
          style: 'solid'
        }
      }],
      arrow: {
        type: 'filled',
        size: 10,
        color: color
      }
    }
  }

  /**
   * 创建高优先级连线配置
   */
  createHighPriorityEdge(): Partial<CompleteEdgeConfig> {
    return {
      style: {
        stroke: 'var(--ldesign-error-color, #f5222d)',
        strokeWidth: 3,
        animated: true,
        animationDuration: 1000,
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 2,
          blur: 4,
          color: 'rgba(245, 34, 45, 0.3)'
        }
      },
      flow: {
        flowIndicator: {
          enabled: true,
          type: 'pulse',
          speed: 3,
          size: 12,
          color: 'var(--ldesign-error-color, #f5222d)',
          spacing: 15
        }
      },
      arrow: {
        type: 'filled',
        size: 12,
        color: 'var(--ldesign-error-color, #f5222d)'
      }
    }
  }

  /**
   * 创建数据流连线配置
   */
  createDataFlowEdge(volume: 'low' | 'medium' | 'high' = 'medium'): Partial<CompleteEdgeConfig> {
    const widthMap = { low: 2, medium: 3, high: 4 }
    const speedMap = { low: 1, medium: 2, high: 3 }
    
    return {
      style: {
        stroke: 'var(--ldesign-info-color, #1890ff)',
        strokeWidth: widthMap[volume],
        gradient: {
          type: 'linear',
          direction: 0,
          colors: [
            { offset: 0, color: 'var(--ldesign-info-color-1, #e6f4ff)' },
            { offset: 1, color: 'var(--ldesign-info-color, #1890ff)' }
          ]
        }
      },
      flow: {
        dataFlow: {
          enabled: true,
          volume,
          direction: 'forward',
          speed: speedMap[volume]
        },
        flowIndicator: {
          enabled: true,
          type: 'dots',
          speed: speedMap[volume],
          size: 4,
          color: 'var(--ldesign-info-color, #1890ff)',
          spacing: 25
        }
      }
    }
  }

  /**
   * 应用主题到连线配置
   */
  applyTheme(config: CompleteEdgeConfig, theme: 'light' | 'dark' | 'blue'): CompleteEdgeConfig {
    const themeColors = this.getThemeColors(theme)
    
    return {
      ...config,
      style: {
        ...config.style,
        stroke: config.style?.stroke?.includes('var(') 
          ? config.style.stroke 
          : themeColors.border,
        ...(config.style?.shadow && {
          shadow: {
            ...config.style.shadow,
            color: themeColors.shadowColor
          }
        })
      },
      labels: config.labels?.map(label => ({
        ...label,
        color: label.color?.includes('var(') ? label.color : themeColors.text,
        background: label.background ? {
          ...label.background,
          color: themeColors.background
        } : label.background
      }))
    }
  }

  /**
   * 获取主题颜色
   */
  private getThemeColors(theme: 'light' | 'dark' | 'blue') {
    const colorMaps = {
      light: {
        border: '#d9d9d9',
        text: '#333333',
        background: '#ffffff',
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      },
      dark: {
        border: '#555555',
        text: '#ffffff',
        background: '#1f1f1f',
        shadowColor: 'rgba(255, 255, 255, 0.1)'
      },
      blue: {
        border: '#b3d9ff',
        text: '#1a1a1a',
        background: '#f0f8ff',
        shadowColor: 'rgba(26, 144, 255, 0.2)'
      }
    }
    
    return colorMaps[theme]
  }

  /**
   * 验证连线配置
   */
  validateConfig(config: CompleteEdgeConfig): { valid: boolean, errors: string[] } {
    const errors: string[] = []
    
    if (!config.sourceNodeId) {
      errors.push('源节点ID不能为空')
    }
    
    if (!config.targetNodeId) {
      errors.push('目标节点ID不能为空')
    }
    
    if (config.sourceNodeId === config.targetNodeId) {
      errors.push('源节点和目标节点不能相同')
    }
    
    if (config.style?.strokeWidth && config.style.strokeWidth < 0) {
      errors.push('线条宽度不能为负数')
    }
    
    if (config.labels) {
      config.labels.forEach((label, index) => {
        if (label.fontSize && label.fontSize < 8) {
          errors.push(`标签${index + 1}字体大小不能小于8px`)
        }
      })
    }
    
    return { valid: errors.length === 0, errors }
  }

  /**
   * 优化连线路径
   */
  optimizePath(config: CompleteEdgeConfig, sourcePos: { x: number, y: number }, targetPos: { x: number, y: number }): CompleteEdgeConfig {
    const deltaX = Math.abs(targetPos.x - sourcePos.x)
    const deltaY = Math.abs(targetPos.y - sourcePos.y)
    
    // 根据节点相对位置优化路径类型
    let optimizedPathType: 'straight' | 'polyline' | 'bezier' = config.pathType || 'straight'
    
    if (deltaX > deltaY * 3 || deltaY > deltaX * 3) {
      // 节点主要沿一个轴向排列，使用直线
      optimizedPathType = 'straight'
    } else if (deltaX > 100 && deltaY > 100) {
      // 节点距离较远且不在同一轴向，使用折线
      optimizedPathType = 'polyline'
    } else {
      // 其他情况使用贝塞尔曲线
      optimizedPathType = 'bezier'
    }
    
    return {
      ...config,
      pathType: optimizedPathType,
      pathCurve: optimizedPathType === 'bezier' ? 0.3 : undefined
    }
  }
}

// 导出单例实例
export const edgeConfigService = new EdgeConfigService()
