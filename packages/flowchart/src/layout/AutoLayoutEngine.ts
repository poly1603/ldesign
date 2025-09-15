/**
 * 自动布局引擎
 * 
 * 提供多种布局算法和智能布局建议
 */

import type {
  AutoLayoutEngine as IAutoLayoutEngine,
  LayoutConfig,
  LayoutResult,
  LayoutSuggestion,
  LayoutTemplate,
  LayoutOptimizationOptions,
  LayoutAlgorithmInterface,
  LayoutContext,
  LayoutHistory
} from './types'
import type { FlowchartData } from '../types'
import { HierarchicalLayout } from './algorithms/HierarchicalLayout'
import { ForceDirectedLayout } from './algorithms/ForceDirectedLayout'
import { CircularLayout } from './algorithms/CircularLayout'
import { GridLayout } from './algorithms/GridLayout'
import { TreeLayout } from './algorithms/TreeLayout'
import { LayoutOptimizer } from './LayoutOptimizer'
import { LayoutAnalyzer } from './LayoutAnalyzer'
import { EventEmitter } from 'events'

/**
 * 自动布局引擎类
 */
export class AutoLayoutEngine extends EventEmitter implements IAutoLayoutEngine {
  private algorithms: Map<string, LayoutAlgorithmInterface> = new Map()
  private optimizer: LayoutOptimizer
  private analyzer: LayoutAnalyzer
  private templates: LayoutTemplate[] = []
  private history: LayoutHistory[] = []
  private context?: LayoutContext

  constructor() {
    super()
    
    this.optimizer = new LayoutOptimizer()
    this.analyzer = new LayoutAnalyzer()
    
    this.initializeAlgorithms()
    this.initializeTemplates()
  }

  /**
   * 应用布局
   */
  async applyLayout(data: FlowchartData, config: LayoutConfig): Promise<LayoutResult> {
    const startTime = Date.now()
    
    try {
      this.emit('layout:started', config)
      
      // 验证配置
      if (!this.validateConfig(config)) {
        throw new Error('无效的布局配置')
      }
      
      // 获取布局算法
      const algorithm = this.algorithms.get(config.algorithm)
      if (!algorithm) {
        throw new Error(`不支持的布局算法: ${config.algorithm}`)
      }
      
      // 执行布局
      const result = await algorithm.layout(data, config)
      
      // 计算统计信息
      result.stats.duration = Date.now() - startTime
      result.stats.qualityScore = this.optimizer.calculateQuality(result)
      result.stats.crossings = this.optimizer.detectCrossings(result)
      
      // 添加到历史记录
      this.addToHistory(config, result)
      
      this.emit('layout:completed', result)
      return result
      
    } catch (error) {
      this.emit('layout:failed', error as Error)
      throw error
    }
  }

  /**
   * 优化布局
   */
  async optimizeLayout(data: FlowchartData, options: LayoutOptimizationOptions): Promise<LayoutResult> {
    try {
      // 首先应用基础布局
      const baseConfig: LayoutConfig = {
        algorithm: 'hierarchical',
        direction: 'TB',
        animated: false
      }
      
      let result = await this.applyLayout(data, baseConfig)
      
      // 应用优化
      result = await this.optimizer.optimize(result, options)
      
      this.emit('layout:optimized', result)
      return result
      
    } catch (error) {
      this.emit('layout:failed', error as Error)
      throw error
    }
  }

  /**
   * 获取布局建议
   */
  async getLayoutSuggestions(data: FlowchartData): Promise<LayoutSuggestion[]> {
    const suggestions: LayoutSuggestion[] = []
    
    // 分析流程图特征
    const analysis = this.analyzer.analyzeFlowchart(data)
    
    // 基于分析结果生成建议
    if (analysis.isHierarchical) {
      suggestions.push({
        algorithm: 'hierarchical',
        reason: '检测到层次结构，适合使用层次布局',
        score: 0.9,
        config: {
          algorithm: 'hierarchical',
          direction: analysis.preferredDirection || 'TB',
          nodeSpacing: { horizontal: 100, vertical: 80 },
          animated: true
        },
        description: '自动排列节点为清晰的层次结构'
      })
    }
    
    if (analysis.isTree) {
      suggestions.push({
        algorithm: 'tree',
        reason: '检测到树形结构，适合使用树形布局',
        score: 0.85,
        config: {
          algorithm: 'tree',
          direction: 'TB',
          nodeSpacing: { horizontal: 120, vertical: 100 },
          animated: true
        },
        description: '按树形结构排列节点'
      })
    }
    
    if (analysis.nodeCount < 20) {
      suggestions.push({
        algorithm: 'force-directed',
        reason: '节点数量适中，力导向布局可以产生自然的排列',
        score: 0.7,
        config: {
          algorithm: 'force-directed',
          animated: true,
          algorithmConfig: {
            iterations: 300,
            springLength: 100,
            springStrength: 0.1
          }
        },
        description: '使用物理模拟创建自然的节点排列'
      })
    }
    
    if (analysis.hasCircularPattern) {
      suggestions.push({
        algorithm: 'circular',
        reason: '检测到循环模式，适合圆形布局',
        score: 0.75,
        config: {
          algorithm: 'circular',
          animated: true,
          algorithmConfig: {
            radius: 200,
            startAngle: 0
          }
        },
        description: '将节点排列成圆形'
      })
    }
    
    // 如果节点很多，建议网格布局
    if (analysis.nodeCount > 50) {
      suggestions.push({
        algorithm: 'grid',
        reason: '节点数量较多，网格布局便于管理',
        score: 0.6,
        config: {
          algorithm: 'grid',
          nodeSpacing: { horizontal: 150, vertical: 120 },
          animated: true
        },
        description: '将节点整齐排列成网格'
      })
    }
    
    // 按分数排序
    return suggestions.sort((a, b) => b.score - a.score)
  }

  /**
   * 应用布局模板
   */
  async applyLayoutTemplate(data: FlowchartData, template: LayoutTemplate): Promise<LayoutResult> {
    return this.applyLayout(data, template.config)
  }

  /**
   * 验证布局配置
   */
  validateConfig(config: LayoutConfig): boolean {
    // 检查必需字段
    if (!config.algorithm) {
      return false
    }
    
    // 检查算法是否支持
    if (!this.algorithms.has(config.algorithm)) {
      return false
    }
    
    // 委托给具体算法验证
    const algorithm = this.algorithms.get(config.algorithm)!
    return algorithm.validateConfig(config)
  }

  /**
   * 获取支持的算法
   */
  getSupportedAlgorithms(): string[] {
    return Array.from(this.algorithms.keys())
  }

  /**
   * 获取布局模板
   */
  getLayoutTemplates(): LayoutTemplate[] {
    return [...this.templates]
  }

  /**
   * 添加自定义模板
   */
  addLayoutTemplate(template: LayoutTemplate): void {
    this.templates.push(template)
  }

  /**
   * 获取布局历史
   */
  getLayoutHistory(): LayoutHistory[] {
    return [...this.history]
  }

  /**
   * 清空布局历史
   */
  clearLayoutHistory(): void {
    this.history = []
  }

  /**
   * 设置布局上下文
   */
  setContext(context: LayoutContext): void {
    this.context = context
  }

  /**
   * 获取算法信息
   */
  getAlgorithmInfo(algorithm: string): LayoutAlgorithmInterface | undefined {
    return this.algorithms.get(algorithm)
  }

  /**
   * 预览布局效果
   */
  async previewLayout(data: FlowchartData, config: LayoutConfig): Promise<LayoutResult> {
    // 创建数据副本进行预览
    const previewData = JSON.parse(JSON.stringify(data))
    
    // 应用布局但不触发事件
    const algorithm = this.algorithms.get(config.algorithm)
    if (!algorithm) {
      throw new Error(`不支持的布局算法: ${config.algorithm}`)
    }
    
    return algorithm.layout(previewData, config)
  }

  /**
   * 初始化布局算法
   */
  private initializeAlgorithms(): void {
    this.algorithms.set('hierarchical', new HierarchicalLayout())
    this.algorithms.set('force-directed', new ForceDirectedLayout())
    this.algorithms.set('circular', new CircularLayout())
    this.algorithms.set('grid', new GridLayout())
    this.algorithms.set('tree', new TreeLayout())
  }

  /**
   * 初始化布局模板
   */
  private initializeTemplates(): void {
    // 审批流程模板
    this.templates.push({
      id: 'approval-workflow',
      name: '审批流程',
      description: '适用于审批流程的层次布局',
      config: {
        algorithm: 'hierarchical',
        direction: 'TB',
        nodeSpacing: { horizontal: 120, vertical: 100 },
        levelSpacing: 80,
        animated: true
      },
      applicableTypes: ['approval', 'workflow', 'process']
    })
    
    // 决策树模板
    this.templates.push({
      id: 'decision-tree',
      name: '决策树',
      description: '适用于决策流程的树形布局',
      config: {
        algorithm: 'tree',
        direction: 'TB',
        nodeSpacing: { horizontal: 150, vertical: 120 },
        animated: true
      },
      applicableTypes: ['decision', 'tree', 'conditional']
    })
    
    // 循环流程模板
    this.templates.push({
      id: 'circular-process',
      name: '循环流程',
      description: '适用于循环流程的圆形布局',
      config: {
        algorithm: 'circular',
        animated: true,
        algorithmConfig: {
          radius: 250,
          startAngle: -90
        }
      },
      applicableTypes: ['cycle', 'loop', 'circular']
    })
    
    // 网络图模板
    this.templates.push({
      id: 'network-diagram',
      name: '网络图',
      description: '适用于复杂关系的力导向布局',
      config: {
        algorithm: 'force-directed',
        animated: true,
        algorithmConfig: {
          iterations: 500,
          springLength: 150,
          springStrength: 0.05,
          repulsionStrength: 1000
        }
      },
      applicableTypes: ['network', 'relationship', 'complex']
    })
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(config: LayoutConfig, result: LayoutResult): void {
    const historyItem: LayoutHistory = {
      id: this.generateId(),
      config,
      result,
      timestamp: Date.now()
    }
    
    this.history.unshift(historyItem)
    
    // 限制历史记录数量
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50)
    }
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
