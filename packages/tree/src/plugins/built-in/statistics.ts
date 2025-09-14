/**
 * 统计插件
 * 
 * 提供树形结构的统计信息显示
 */

import { BasePlugin } from '../core/base-plugin'
import type { PluginContext, PluginConfig } from '../core/plugin-interface'

/**
 * 统计插件配置
 */
export interface StatisticsPluginConfig extends PluginConfig {
  /**
   * 显示位置
   */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'overlay'

  /**
   * 显示的统计项
   */
  items?: string[]

  /**
   * 自动更新间隔（毫秒）
   */
  updateInterval?: number

  /**
   * 样式配置
   */
  style?: {
    background?: string
    color?: string
    fontSize?: string
    padding?: string
    borderRadius?: string
  }

  /**
   * 是否显示图标
   */
  showIcons?: boolean

  /**
   * 自定义格式化函数
   */
  formatters?: Record<string, (value: number, context: PluginContext) => string>
}

/**
 * 统计数据接口
 */
export interface TreeStatistics {
  /** 总节点数 */
  totalNodes: number
  /** 根节点数 */
  rootNodes: number
  /** 叶子节点数 */
  leafNodes: number
  /** 展开的节点数 */
  expandedNodes: number
  /** 选中的节点数 */
  selectedNodes: number
  /** 最大深度 */
  maxDepth: number
  /** 平均深度 */
  averageDepth: number
  /** 加载中的节点数 */
  loadingNodes: number
  /** 错误节点数 */
  errorNodes: number
}

/**
 * 统计插件类
 */
export class StatisticsPlugin extends BasePlugin {
  private statisticsElement?: HTMLElement
  private updateTimer?: number
  private statistics: TreeStatistics = {
    totalNodes: 0,
    rootNodes: 0,
    leafNodes: 0,
    expandedNodes: 0,
    selectedNodes: 0,
    maxDepth: 0,
    averageDepth: 0,
    loadingNodes: 0,
    errorNodes: 0,
  }

  constructor(config: StatisticsPluginConfig = {}) {
    super(
      {
        name: 'statistics',
        version: '1.0.0',
        description: '树形组件统计插件',
        author: 'LDesign',
        configSchema: {
          position: { type: 'string', default: 'bottom' },
          items: { 
            type: 'array', 
            default: ['totalNodes', 'selectedNodes', 'expandedNodes', 'maxDepth'] 
          },
          updateInterval: { type: 'number', default: 1000 },
          showIcons: { type: 'boolean', default: true },
          style: { type: 'object', default: {} },
          formatters: { type: 'object', default: {} },
        },
      },
      {
        position: 'bottom',
        items: ['totalNodes', 'selectedNodes', 'expandedNodes', 'maxDepth'],
        updateInterval: 1000,
        showIcons: true,
        style: {},
        formatters: {},
        ...config,
      }
    )
  }

  /**
   * 插件挂载
   */
  mounted(context: PluginContext): void {
    this.createStatisticsElement(context)
    this.startUpdateTimer()
    this.bindEvents(context)
    this.updateStatistics(context)
  }

  /**
   * 插件卸载前
   */
  beforeUnmount(context: PluginContext): void {
    this.stopUpdateTimer()
    this.removeStatisticsElement()
  }

  /**
   * 创建统计元素
   */
  private createStatisticsElement(context: PluginContext): void {
    const config = this.getConfig<StatisticsPluginConfig>()
    const container = context.getContainer()

    this.statisticsElement = context.createElement('div', {
      className: 'ldesign-tree-statistics',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '8px 12px',
        background: '#f5f5f5',
        borderTop: '1px solid #e8e8e8',
        fontSize: '12px',
        color: '#666',
        ...config.style,
      },
    })

    // 根据位置插入元素
    switch (config.position) {
      case 'top':
        container.insertBefore(this.statisticsElement, container.firstChild)
        break
      case 'bottom':
        container.appendChild(this.statisticsElement)
        break
      case 'overlay':
        this.statisticsElement.style.position = 'absolute'
        this.statisticsElement.style.top = '8px'
        this.statisticsElement.style.right = '8px'
        this.statisticsElement.style.zIndex = '10'
        this.statisticsElement.style.background = 'rgba(255, 255, 255, 0.9)'
        this.statisticsElement.style.borderRadius = '4px'
        this.statisticsElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
        container.style.position = 'relative'
        container.appendChild(this.statisticsElement)
        break
      default:
        container.appendChild(this.statisticsElement)
    }
  }

  /**
   * 移除统计元素
   */
  private removeStatisticsElement(): void {
    if (this.statisticsElement && this.statisticsElement.parentNode) {
      this.statisticsElement.parentNode.removeChild(this.statisticsElement)
      this.statisticsElement = undefined
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(context: PluginContext): void {
    // 监听树状态变化事件
    context.on('tree:nodeExpanded', () => this.updateStatistics(context))
    context.on('tree:nodeCollapsed', () => this.updateStatistics(context))
    context.on('tree:nodeSelected', () => this.updateStatistics(context))
    context.on('tree:nodeUnselected', () => this.updateStatistics(context))
    context.on('tree:dataChanged', () => this.updateStatistics(context))
    context.on('tree:nodeAdded', () => this.updateStatistics(context))
    context.on('tree:nodeRemoved', () => this.updateStatistics(context))
  }

  /**
   * 开始更新定时器
   */
  private startUpdateTimer(): void {
    const config = this.getConfig<StatisticsPluginConfig>()
    if (config.updateInterval && config.updateInterval > 0) {
      this.updateTimer = window.setInterval(() => {
        if (this.context) {
          this.updateStatistics(this.context)
        }
      }, config.updateInterval)
    }
  }

  /**
   * 停止更新定时器
   */
  private stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = undefined
    }
  }

  /**
   * 更新统计信息
   */
  private updateStatistics(context: PluginContext): void {
    this.calculateStatistics(context)
    this.renderStatistics(context)
  }

  /**
   * 计算统计信息
   */
  private calculateStatistics(context: PluginContext): void {
    const allNodes = context.getAllNodes()
    const selectedNodes = context.getSelectedNodes()

    // 基础统计
    this.statistics.totalNodes = allNodes.length
    this.statistics.selectedNodes = selectedNodes.length
    this.statistics.rootNodes = allNodes.filter(node => !node.parent).length
    this.statistics.leafNodes = allNodes.filter(node => !node.hasChildren).length
    this.statistics.expandedNodes = allNodes.filter(node => node.expanded).length
    this.statistics.loadingNodes = allNodes.filter(node => node.loading).length
    this.statistics.errorNodes = allNodes.filter(node => node.error).length

    // 深度统计
    const depths = allNodes.map(node => this.getNodeDepth(node))
    this.statistics.maxDepth = Math.max(...depths, 0)
    this.statistics.averageDepth = depths.length > 0 
      ? Math.round((depths.reduce((sum, depth) => sum + depth, 0) / depths.length) * 100) / 100
      : 0
  }

  /**
   * 获取节点深度
   */
  private getNodeDepth(node: any): number {
    let depth = 0
    let current = node.parent
    while (current) {
      depth++
      current = current.parent
    }
    return depth
  }

  /**
   * 渲染统计信息
   */
  private renderStatistics(context: PluginContext): void {
    if (!this.statisticsElement) return

    const config = this.getConfig<StatisticsPluginConfig>()
    const items = config.items || []
    const formatters = config.formatters || {}
    const showIcons = config.showIcons

    // 清空内容
    this.statisticsElement.innerHTML = ''

    // 统计项配置
    const itemConfigs = {
      totalNodes: { label: '总节点', icon: '📊', value: this.statistics.totalNodes },
      rootNodes: { label: '根节点', icon: '🌳', value: this.statistics.rootNodes },
      leafNodes: { label: '叶子节点', icon: '🍃', value: this.statistics.leafNodes },
      expandedNodes: { label: '已展开', icon: '📂', value: this.statistics.expandedNodes },
      selectedNodes: { label: '已选择', icon: '✅', value: this.statistics.selectedNodes },
      maxDepth: { label: '最大深度', icon: '📏', value: this.statistics.maxDepth },
      averageDepth: { label: '平均深度', icon: '📐', value: this.statistics.averageDepth },
      loadingNodes: { label: '加载中', icon: '⏳', value: this.statistics.loadingNodes },
      errorNodes: { label: '错误节点', icon: '❌', value: this.statistics.errorNodes },
    }

    // 渲染每个统计项
    items.forEach(itemKey => {
      const itemConfig = itemConfigs[itemKey as keyof typeof itemConfigs]
      if (!itemConfig) return

      const formatter = formatters[itemKey]
      const formattedValue = formatter 
        ? formatter(itemConfig.value, context)
        : itemConfig.value.toString()

      const itemElement = context.createElement('div', {
        className: 'statistics-item',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        },
      })

      if (showIcons) {
        const iconElement = context.createElement('span', {
          className: 'statistics-icon',
          textContent: itemConfig.icon,
        })
        itemElement.appendChild(iconElement)
      }

      const labelElement = context.createElement('span', {
        className: 'statistics-label',
        textContent: `${itemConfig.label}:`,
        style: { fontWeight: '500' },
      })
      itemElement.appendChild(labelElement)

      const valueElement = context.createElement('span', {
        className: 'statistics-value',
        textContent: formattedValue,
        style: { color: '#1890ff', fontWeight: 'bold' },
      })
      itemElement.appendChild(valueElement)

      this.statisticsElement.appendChild(itemElement)
    })
  }

  /**
   * 获取当前统计信息
   */
  getStatistics(): TreeStatistics {
    return { ...this.statistics }
  }

  /**
   * 导出统计信息
   */
  exportStatistics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = Object.keys(this.statistics).join(',')
      const values = Object.values(this.statistics).join(',')
      return `${headers}\n${values}`
    }
    return JSON.stringify(this.statistics, null, 2)
  }
}

/**
 * 创建统计插件实例
 */
export function createStatisticsPlugin(config?: StatisticsPluginConfig): StatisticsPlugin {
  return new StatisticsPlugin(config)
}
