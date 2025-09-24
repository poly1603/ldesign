import type { FlowchartData, FlowchartNode, FlowchartEdge, Position, Bounds } from '../core/types'
import { layoutDetectionService, type LayoutDirection, type LayoutAnalysis } from './LayoutDetectionService'

/**
 * 布局模板类型
 */
export interface LayoutTemplate {
  id: string
  name: string
  description: string
  type: 'linear' | 'hierarchical' | 'circular' | 'grid' | 'organic' | 'swimlane'
  direction?: LayoutDirection
  categories: string[] // 适用的流程类型
  complexity: 'simple' | 'medium' | 'complex'
  preview: string // Base64预览图
  config: {
    nodeSpacing: { x: number; y: number }
    alignment: 'start' | 'center' | 'end' | 'distributed'
    levelSpacing?: number // 层级间距
    branchSpacing?: number // 分支间距
    circleRadius?: number // 圆形布局半径
    swimlaneHeight?: number // 泳道高度
  }
}

/**
 * 布局建议
 */
export interface LayoutSuggestion {
  template: LayoutTemplate
  confidence: number // 推荐置信度(0-1)
  reason: string // 推荐理由
  benefits: string[] // 优势
  improvements: {
    readability: number // 可读性提升
    efficiency: number // 效率提升
    aesthetics: number // 美观度提升
  }
  preview: {
    beforeScore: number // 优化前评分
    afterScore: number // 优化后评分
    improvements: string[] // 具体改进点
  }
}

/**
 * 性能分析结果
 */
export interface PerformanceAnalysis {
  score: number // 总体评分(0-100)
  issues: LayoutIssue[]
  metrics: {
    nodeOverlap: number // 节点重叠程度
    edgeCrossings: number // 连线交叉数量
    layoutBalance: number // 布局平衡性
    spaceUtilization: number // 空间利用率
    visualComplexity: number // 视觉复杂度
    readabilityScore: number // 可读性评分
  }
  suggestions: PerformanceOptimization[]
}

/**
 * 布局问题
 */
export interface LayoutIssue {
  id: string
  type: 'overlap' | 'crossing' | 'spacing' | 'alignment' | 'hierarchy' | 'balance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedNodes: string[]
  affectedEdges?: string[]
  position?: Position
  suggestion: string
  autoFixable: boolean
}

/**
 * 性能优化建议
 */
export interface PerformanceOptimization {
  id: string
  type: 'layout' | 'spacing' | 'grouping' | 'routing' | 'styling'
  priority: number // 优先级(1-10)
  title: string
  description: string
  expectedImprovement: number // 预期改进百分比
  difficulty: 'easy' | 'medium' | 'hard'
  automatable: boolean
  action: () => Promise<FlowchartData> // 自动执行函数
}

/**
 * 智能排列选项
 */
export interface SmartArrangementOptions {
  algorithm: 'force-directed' | 'hierarchical' | 'circular' | 'grid' | 'organic'
  constraints: {
    preserveGroups: boolean
    respectConnections: boolean
    minimizeEdgeCrossings: boolean
    optimizeForReadability: boolean
  }
  spacing: {
    node: { x: number; y: number }
    level: number
    group: number
  }
  bounds?: Bounds // 布局边界
}

/**
 * 流程类型识别结果
 */
export interface ProcessTypeRecognition {
  primaryType: 'approval' | 'decision' | 'sequential' | 'parallel' | 'loop' | 'exception' | 'mixed'
  confidence: number
  characteristics: string[]
  complexity: number // 复杂度评分
  patterns: {
    hasDecisionPoints: boolean
    hasParallelBranches: boolean
    hasLoops: boolean
    hasExceptionHandling: boolean
    hasApprovalFlow: boolean
  }
}

/**
 * AI智能布局优化服务
 */
export class AILayoutService {
  private templates: LayoutTemplate[] = []
  private analysisCache = new Map<string, PerformanceAnalysis>()
  
  constructor() {
    this.initializeTemplates()
  }

  /**
   * 分析流程类型
   */
  async analyzeProcessType(flowchartData: FlowchartData): Promise<ProcessTypeRecognition> {
    const nodes = flowchartData.nodes
    const edges = flowchartData.edges
    
    // 分析节点类型分布
    const nodeTypes = new Map<string, number>()
    nodes.forEach(node => {
      const type = node.type || 'process'
      nodeTypes.set(type, (nodeTypes.get(type) || 0) + 1)
    })
    
    // 分析连线模式
    const patterns = {
      hasDecisionPoints: nodeTypes.has('decision') || nodeTypes.has('condition'),
      hasParallelBranches: this.detectParallelBranches(nodes, edges),
      hasLoops: this.detectLoops(edges),
      hasExceptionHandling: nodeTypes.has('exception') || nodeTypes.has('error'),
      hasApprovalFlow: nodeTypes.has('approval') || nodeTypes.has('review')
    }
    
    // 计算复杂度
    const complexity = this.calculateComplexity(nodes, edges, patterns)
    
    // 识别主要类型
    const primaryType = this.identifyPrimaryType(nodeTypes, patterns, complexity)
    
    // 计算置信度
    const confidence = this.calculateTypeConfidence(primaryType, nodeTypes, patterns)
    
    // 提取特征
    const characteristics = this.extractCharacteristics(nodeTypes, patterns, complexity)
    
    return {
      primaryType,
      confidence,
      characteristics,
      complexity,
      patterns
    }
  }

  /**
   * 获取布局建议
   */
  async getLayoutSuggestions(flowchartData: FlowchartData): Promise<LayoutSuggestion[]> {
    // 分析当前布局
    const currentAnalysis = await this.analyzePerformance(flowchartData)
    const processType = await this.analyzeProcessType(flowchartData)
    
    // 筛选适合的模板
    const suitableTemplates = this.templates.filter(template => 
      template.categories.includes(processType.primaryType) ||
      template.complexity === this.getComplexityLevel(processType.complexity)
    )
    
    const suggestions: LayoutSuggestion[] = []
    
    for (const template of suitableTemplates) {
      // 计算模拟布局的性能
      const simulatedData = await this.applyLayoutTemplate(flowchartData, template)
      const simulatedAnalysis = await this.analyzePerformance(simulatedData)
      
      // 计算置信度和改进度
      const confidence = this.calculateSuggestionConfidence(
        processType, 
        template, 
        currentAnalysis, 
        simulatedAnalysis
      )
      
      if (confidence > 0.3) { // 只推荐置信度较高的
        suggestions.push({
          template,
          confidence,
          reason: this.generateReasonText(processType, template, currentAnalysis),
          benefits: this.generateBenefits(template, currentAnalysis, simulatedAnalysis),
          improvements: {
            readability: simulatedAnalysis.metrics.readabilityScore - currentAnalysis.metrics.readabilityScore,
            efficiency: this.calculateEfficiencyImprovement(currentAnalysis, simulatedAnalysis),
            aesthetics: this.calculateAestheticImprovement(currentAnalysis, simulatedAnalysis)
          },
          preview: {
            beforeScore: currentAnalysis.score,
            afterScore: simulatedAnalysis.score,
            improvements: this.generateImprovements(currentAnalysis, simulatedAnalysis)
          }
        })
      }
    }
    
    // 按置信度排序
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }

  /**
   * 智能节点排列
   */
  async smartArrangeNodes(
    flowchartData: FlowchartData, 
    options: SmartArrangementOptions
  ): Promise<FlowchartData> {
    const { algorithm, constraints, spacing, bounds } = options
    
    switch (algorithm) {
      case 'force-directed':
        return this.applyForceDirectedLayout(flowchartData, constraints, spacing, bounds)
      case 'hierarchical':
        return this.applyHierarchicalLayout(flowchartData, constraints, spacing, bounds)
      case 'circular':
        return this.applyCircularLayout(flowchartData, constraints, spacing, bounds)
      case 'grid':
        return this.applyGridLayout(flowchartData, constraints, spacing, bounds)
      case 'organic':
        return this.applyOrganicLayout(flowchartData, constraints, spacing, bounds)
      default:
        return flowchartData
    }
  }

  /**
   * 分析布局性能
   */
  async analyzePerformance(flowchartData: FlowchartData): Promise<PerformanceAnalysis> {
    const cacheKey = this.generateCacheKey(flowchartData)
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!
    }
    
    const analysis = await this.performDetailedAnalysis(flowchartData)
    this.analysisCache.set(cacheKey, analysis)
    
    return analysis
  }

  /**
   * 应用布局模板
   */
  async applyLayoutTemplate(
    flowchartData: FlowchartData, 
    template: LayoutTemplate
  ): Promise<FlowchartData> {
    const { nodes, edges } = flowchartData
    
    switch (template.type) {
      case 'linear':
        return this.applyLinearTemplate(flowchartData, template)
      case 'hierarchical':
        return this.applyHierarchicalTemplate(flowchartData, template)
      case 'circular':
        return this.applyCircularTemplate(flowchartData, template)
      case 'grid':
        return this.applyGridTemplate(flowchartData, template)
      case 'organic':
        return this.applyOrganicTemplate(flowchartData, template)
      case 'swimlane':
        return this.applySwimLaneTemplate(flowchartData, template)
      default:
        return flowchartData
    }
  }

  /**
   * 获取性能优化建议
   */
  async getOptimizationSuggestions(flowchartData: FlowchartData): Promise<PerformanceOptimization[]> {
    const analysis = await this.analyzePerformance(flowchartData)
    const suggestions: PerformanceOptimization[] = []
    
    // 基于问题生成优化建议
    analysis.issues.forEach((issue, index) => {
      const optimization = this.createOptimizationFromIssue(issue, flowchartData, index)
      if (optimization) {
        suggestions.push(optimization)
      }
    })
    
    // 添加通用优化建议
    suggestions.push(...this.getGeneralOptimizations(analysis, flowchartData))
    
    // 按优先级排序
    return suggestions.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 自动修复布局问题
   */
  async autoFixIssues(
    flowchartData: FlowchartData, 
    issueIds?: string[]
  ): Promise<FlowchartData> {
    const analysis = await this.analyzePerformance(flowchartData)
    let fixedData = { ...flowchartData }
    
    const issuesToFix = issueIds 
      ? analysis.issues.filter(issue => issueIds.includes(issue.id))
      : analysis.issues.filter(issue => issue.autoFixable)
    
    for (const issue of issuesToFix) {
      fixedData = await this.fixSpecificIssue(fixedData, issue)
    }
    
    return fixedData
  }

  /**
   * 初始化布局模板
   */
  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'linear-horizontal',
        name: '水平线性布局',
        description: '节点按水平方向线性排列，适合简单的顺序流程',
        type: 'linear',
        direction: 'horizontal',
        categories: ['sequential', 'approval'],
        complexity: 'simple',
        preview: '',
        config: {
          nodeSpacing: { x: 120, y: 80 },
          alignment: 'center'
        }
      },
      {
        id: 'linear-vertical',
        name: '垂直线性布局',
        description: '节点按垂直方向线性排列，节省水平空间',
        type: 'linear',
        direction: 'vertical',
        categories: ['sequential', 'approval'],
        complexity: 'simple',
        preview: '',
        config: {
          nodeSpacing: { x: 100, y: 100 },
          alignment: 'center'
        }
      },
      {
        id: 'hierarchical-top-down',
        name: '自上而下层次布局',
        description: '按层次结构排列，清晰展示流程层级关系',
        type: 'hierarchical',
        direction: 'vertical',
        categories: ['decision', 'mixed', 'approval'],
        complexity: 'medium',
        preview: '',
        config: {
          nodeSpacing: { x: 100, y: 60 },
          alignment: 'center',
          levelSpacing: 80,
          branchSpacing: 40
        }
      },
      {
        id: 'hierarchical-left-right',
        name: '从左到右层次布局',
        description: '水平层次结构，适合宽度充足的显示区域',
        type: 'hierarchical',
        direction: 'horizontal',
        categories: ['decision', 'mixed'],
        complexity: 'medium',
        preview: '',
        config: {
          nodeSpacing: { x: 80, y: 100 },
          alignment: 'center',
          levelSpacing: 120,
          branchSpacing: 60
        }
      },
      {
        id: 'circular-radial',
        name: '径向圆形布局',
        description: '节点环形排列，中心突出主要流程',
        type: 'circular',
        categories: ['loop', 'parallel'],
        complexity: 'medium',
        preview: '',
        config: {
          nodeSpacing: { x: 80, y: 80 },
          alignment: 'distributed',
          circleRadius: 200
        }
      },
      {
        id: 'grid-matrix',
        name: '网格矩阵布局',
        description: '规整的网格排列，便于大量节点的组织',
        type: 'grid',
        categories: ['parallel', 'mixed'],
        complexity: 'complex',
        preview: '',
        config: {
          nodeSpacing: { x: 120, y: 100 },
          alignment: 'distributed'
        }
      },
      {
        id: 'organic-natural',
        name: '有机自然布局',
        description: '模拟自然增长模式，视觉效果自然美观',
        type: 'organic',
        categories: ['exception', 'mixed'],
        complexity: 'complex',
        preview: '',
        config: {
          nodeSpacing: { x: 100, y: 100 },
          alignment: 'center'
        }
      },
      {
        id: 'swimlane-horizontal',
        name: '水平泳道布局',
        description: '按职责或阶段分组，清晰的责任划分',
        type: 'swimlane',
        direction: 'horizontal',
        categories: ['approval', 'mixed'],
        complexity: 'complex',
        preview: '',
        config: {
          nodeSpacing: { x: 120, y: 80 },
          alignment: 'start',
          swimlaneHeight: 200
        }
      }
    ]
  }

  /**
   * 执行详细性能分析
   */
  private async performDetailedAnalysis(flowchartData: FlowchartData): Promise<PerformanceAnalysis> {
    const issues: LayoutIssue[] = []
    const metrics = {
      nodeOverlap: this.calculateNodeOverlap(flowchartData.nodes),
      edgeCrossings: this.calculateEdgeCrossings(flowchartData),
      layoutBalance: this.calculateLayoutBalance(flowchartData.nodes),
      spaceUtilization: this.calculateSpaceUtilization(flowchartData.nodes),
      visualComplexity: this.calculateVisualComplexity(flowchartData),
      readabilityScore: this.calculateReadabilityScore(flowchartData)
    }
    
    // 检测各种布局问题
    issues.push(...this.detectOverlapIssues(flowchartData.nodes))
    issues.push(...this.detectCrossingIssues(flowchartData))
    issues.push(...this.detectSpacingIssues(flowchartData.nodes))
    issues.push(...this.detectAlignmentIssues(flowchartData.nodes))
    issues.push(...this.detectHierarchyIssues(flowchartData))
    issues.push(...this.detectBalanceIssues(flowchartData.nodes))
    
    // 计算总体评分
    const score = this.calculateOverallScore(metrics, issues)
    
    const suggestions = await this.getOptimizationSuggestions(flowchartData)
    
    return {
      score,
      issues,
      metrics,
      suggestions
    }
  }

  /**
   * 应用力导向布局
   */
  private async applyForceDirectedLayout(
    flowchartData: FlowchartData,
    constraints: any,
    spacing: any,
    bounds?: Bounds
  ): Promise<FlowchartData> {
    // 简化的力导向布局算法实现
    const nodes = [...flowchartData.nodes]
    const edges = flowchartData.edges
    
    // 初始化节点位置（如果没有的话）
    nodes.forEach((node, index) => {
      if (!node.position) {
        node.position = {
          x: Math.random() * (bounds?.width || 800),
          y: Math.random() * (bounds?.height || 600)
        }
      }
    })
    
    // 迭代计算力的作用
    const iterations = 100
    const repulsionForce = 1000
    const attractionForce = 0.1
    const dampening = 0.9
    
    for (let iter = 0; iter < iterations; iter++) {
      const forces = new Map<string, { x: number; y: number }>()
      
      // 初始化力
      nodes.forEach(node => {
        forces.set(node.id, { x: 0, y: 0 })
      })
      
      // 计算排斥力
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i]
          const nodeB = nodes[j]
          
          const dx = nodeB.position.x - nodeA.position.x
          const dy = nodeB.position.y - nodeA.position.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          
          const force = repulsionForce / (distance * distance)
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force
          
          const forceA = forces.get(nodeA.id)!
          const forceB = forces.get(nodeB.id)!
          
          forceA.x -= fx
          forceA.y -= fy
          forceB.x += fx
          forceB.y += fy
        }
      }
      
      // 计算吸引力（基于连线）
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source)
        const targetNode = nodes.find(n => n.id === edge.target)
        
        if (sourceNode && targetNode) {
          const dx = targetNode.position.x - sourceNode.position.x
          const dy = targetNode.position.y - sourceNode.position.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          
          const force = attractionForce * distance
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force
          
          const forceSource = forces.get(sourceNode.id)!
          const forceTarget = forces.get(targetNode.id)!
          
          forceSource.x += fx
          forceSource.y += fy
          forceTarget.x -= fx
          forceTarget.y -= fy
        }
      })
      
      // 应用力并更新位置
      nodes.forEach(node => {
        const force = forces.get(node.id)!
        node.position.x += force.x * dampening
        node.position.y += force.y * dampening
        
        // 约束到边界内
        if (bounds) {
          node.position.x = Math.max(0, Math.min(bounds.width, node.position.x))
          node.position.y = Math.max(0, Math.min(bounds.height, node.position.y))
        }
      })
    }
    
    return {
      ...flowchartData,
      nodes
    }
  }

  /**
   * 应用层次布局
   */
  private async applyHierarchicalLayout(
    flowchartData: FlowchartData,
    constraints: any,
    spacing: any,
    bounds?: Bounds
  ): Promise<FlowchartData> {
    const nodes = [...flowchartData.nodes]
    const edges = flowchartData.edges
    
    // 构建层次结构
    const levels = this.buildHierarchy(nodes, edges)
    
    // 按层级排列节点
    const levelHeight = spacing.level || 100
    const nodeSpacing = spacing.node.x || 120
    
    levels.forEach((levelNodes, levelIndex) => {
      const y = levelIndex * levelHeight
      const totalWidth = (levelNodes.length - 1) * nodeSpacing
      const startX = bounds ? (bounds.width - totalWidth) / 2 : 0
      
      levelNodes.forEach((node, nodeIndex) => {
        node.position = {
          x: startX + nodeIndex * nodeSpacing,
          y: y
        }
      })
    })
    
    return {
      ...flowchartData,
      nodes
    }
  }

  /**
   * 应用圆形布局
   */
  private async applyCircularLayout(
    flowchartData: FlowchartData,
    constraints: any,
    spacing: any,
    bounds?: Bounds
  ): Promise<FlowchartData> {
    const nodes = [...flowchartData.nodes]
    const radius = 200
    const centerX = bounds ? bounds.width / 2 : 400
    const centerY = bounds ? bounds.height / 2 : 300
    
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length
      node.position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    })
    
    return {
      ...flowchartData,
      nodes
    }
  }

  /**
   * 应用网格布局
   */
  private async applyGridLayout(
    flowchartData: FlowchartData,
    constraints: any,
    spacing: any,
    bounds?: Bounds
  ): Promise<FlowchartData> {
    const nodes = [...flowchartData.nodes]
    const cols = Math.ceil(Math.sqrt(nodes.length))
    const nodeSpacingX = spacing.node.x || 120
    const nodeSpacingY = spacing.node.y || 100
    
    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      
      node.position = {
        x: col * nodeSpacingX,
        y: row * nodeSpacingY
      }
    })
    
    return {
      ...flowchartData,
      nodes
    }
  }

  /**
   * 应用有机布局
   */
  private async applyOrganicLayout(
    flowchartData: FlowchartData,
    constraints: any,
    spacing: any,
    bounds?: Bounds
  ): Promise<FlowchartData> {
    // 有机布局使用改进的力导向算法
    return this.applyForceDirectedLayout(flowchartData, constraints, spacing, bounds)
  }

  // 辅助方法 - 这里只实现关键的几个，完整实现会很长

  private detectParallelBranches(nodes: FlowchartNode[], edges: FlowchartEdge[]): boolean {
    // 检测是否存在并行分支
    const outDegree = new Map<string, number>()
    edges.forEach(edge => {
      outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1)
    })
    
    return Array.from(outDegree.values()).some(degree => degree > 1)
  }

  private detectLoops(edges: FlowchartEdge[]): boolean {
    // 简单的环检测
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    
    const hasLoop = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true
      if (visited.has(nodeId)) return false
      
      visited.add(nodeId)
      recursionStack.add(nodeId)
      
      const outgoingEdges = edges.filter(edge => edge.source === nodeId)
      for (const edge of outgoingEdges) {
        if (hasLoop(edge.target)) return true
      }
      
      recursionStack.delete(nodeId)
      return false
    }
    
    const allNodes = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)])
    for (const nodeId of allNodes) {
      if (!visited.has(nodeId) && hasLoop(nodeId)) {
        return true
      }
    }
    
    return false
  }

  private calculateComplexity(
    nodes: FlowchartNode[], 
    edges: FlowchartEdge[], 
    patterns: any
  ): number {
    let complexity = nodes.length * 10 // 基础复杂度
    complexity += edges.length * 5 // 连线增加复杂度
    
    if (patterns.hasDecisionPoints) complexity += 20
    if (patterns.hasParallelBranches) complexity += 30
    if (patterns.hasLoops) complexity += 25
    if (patterns.hasExceptionHandling) complexity += 15
    
    return Math.min(complexity, 100) // 限制在100以内
  }

  private identifyPrimaryType(
    nodeTypes: Map<string, number>,
    patterns: any,
    complexity: number
  ): ProcessTypeRecognition['primaryType'] {
    if (patterns.hasApprovalFlow) return 'approval'
    if (patterns.hasDecisionPoints && patterns.hasParallelBranches) return 'mixed'
    if (patterns.hasDecisionPoints) return 'decision'
    if (patterns.hasParallelBranches) return 'parallel'
    if (patterns.hasLoops) return 'loop'
    if (patterns.hasExceptionHandling) return 'exception'
    return 'sequential'
  }

  private calculateTypeConfidence(
    primaryType: string,
    nodeTypes: Map<string, number>,
    patterns: any
  ): number {
    // 基于特征匹配度计算置信度
    let confidence = 0.5 // 基础置信度
    
    switch (primaryType) {
      case 'approval':
        if (nodeTypes.has('approval')) confidence += 0.3
        if (nodeTypes.has('review')) confidence += 0.2
        break
      case 'decision':
        if (nodeTypes.has('decision')) confidence += 0.3
        if (patterns.hasDecisionPoints) confidence += 0.2
        break
      // 其他类型的置信度计算...
    }
    
    return Math.min(confidence, 1)
  }

  private extractCharacteristics(
    nodeTypes: Map<string, number>,
    patterns: any,
    complexity: number
  ): string[] {
    const characteristics: string[] = []
    
    if (complexity > 70) characteristics.push('高复杂度流程')
    else if (complexity > 40) characteristics.push('中等复杂度流程')
    else characteristics.push('简单流程')
    
    if (patterns.hasDecisionPoints) characteristics.push('包含决策节点')
    if (patterns.hasParallelBranches) characteristics.push('包含并行分支')
    if (patterns.hasLoops) characteristics.push('包含循环结构')
    if (patterns.hasExceptionHandling) characteristics.push('包含异常处理')
    if (patterns.hasApprovalFlow) characteristics.push('包含审批流程')
    
    return characteristics
  }

  private buildHierarchy(nodes: FlowchartNode[], edges: FlowchartEdge[]): FlowchartNode[][] {
    // 简化的层次构建
    const levels: FlowchartNode[][] = []
    const visited = new Set<string>()
    
    // 找到根节点（入度为0的节点）
    const inDegree = new Map<string, number>()
    nodes.forEach(node => inDegree.set(node.id, 0))
    edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    })
    
    const rootNodes = nodes.filter(node => inDegree.get(node.id) === 0)
    
    if (rootNodes.length > 0) {
      levels[0] = rootNodes
      // 简化实现，实际需要更复杂的算法
    } else {
      // 如果没有明确的根节点，按现有位置分层
      levels[0] = nodes.slice(0, Math.ceil(nodes.length / 3))
      levels[1] = nodes.slice(Math.ceil(nodes.length / 3), Math.ceil(nodes.length * 2 / 3))
      levels[2] = nodes.slice(Math.ceil(nodes.length * 2 / 3))
    }
    
    return levels.filter(level => level.length > 0)
  }

  // 其他辅助方法的简化实现...
  private getComplexityLevel(complexity: number): LayoutTemplate['complexity'] {
    if (complexity > 70) return 'complex'
    if (complexity > 40) return 'medium'
    return 'simple'
  }

  private calculateSuggestionConfidence(
    processType: ProcessTypeRecognition,
    template: LayoutTemplate,
    currentAnalysis: PerformanceAnalysis,
    simulatedAnalysis: PerformanceAnalysis
  ): number {
    let confidence = 0.5
    
    // 基于流程类型匹配
    if (template.categories.includes(processType.primaryType)) {
      confidence += 0.3
    }
    
    // 基于复杂度匹配
    if (template.complexity === this.getComplexityLevel(processType.complexity)) {
      confidence += 0.2
    }
    
    // 基于性能改进
    const improvement = (simulatedAnalysis.score - currentAnalysis.score) / 100
    confidence += Math.max(0, improvement * 0.3)
    
    return Math.min(confidence, 1)
  }

  private generateReasonText(
    processType: ProcessTypeRecognition,
    template: LayoutTemplate,
    analysis: PerformanceAnalysis
  ): string {
    return `基于流程类型(${processType.primaryType})和当前布局问题，${template.name}能够有效改善可读性和整体结构。`
  }

  private generateBenefits(
    template: LayoutTemplate,
    currentAnalysis: PerformanceAnalysis,
    simulatedAnalysis: PerformanceAnalysis
  ): string[] {
    const benefits: string[] = []
    
    if (simulatedAnalysis.metrics.readabilityScore > currentAnalysis.metrics.readabilityScore) {
      benefits.push('提升流程可读性')
    }
    
    if (simulatedAnalysis.metrics.edgeCrossings < currentAnalysis.metrics.edgeCrossings) {
      benefits.push('减少连线交叉')
    }
    
    if (simulatedAnalysis.metrics.layoutBalance > currentAnalysis.metrics.layoutBalance) {
      benefits.push('改善布局平衡')
    }
    
    return benefits
  }

  private calculateEfficiencyImprovement(
    currentAnalysis: PerformanceAnalysis,
    simulatedAnalysis: PerformanceAnalysis
  ): number {
    // 基于多个指标计算效率改进
    return (simulatedAnalysis.score - currentAnalysis.score) / 100
  }

  private calculateAestheticImprovement(
    currentAnalysis: PerformanceAnalysis,
    simulatedAnalysis: PerformanceAnalysis
  ): number {
    return (simulatedAnalysis.metrics.layoutBalance - currentAnalysis.metrics.layoutBalance) / 100
  }

  private generateImprovements(
    currentAnalysis: PerformanceAnalysis,
    simulatedAnalysis: PerformanceAnalysis
  ): string[] {
    const improvements: string[] = []
    
    if (simulatedAnalysis.metrics.nodeOverlap < currentAnalysis.metrics.nodeOverlap) {
      improvements.push('减少节点重叠')
    }
    
    if (simulatedAnalysis.metrics.edgeCrossings < currentAnalysis.metrics.edgeCrossings) {
      improvements.push('减少连线交叉')
    }
    
    return improvements
  }

  // 简化的性能计算方法
  private calculateNodeOverlap(nodes: FlowchartNode[]): number {
    return 0 // 简化实现
  }

  private calculateEdgeCrossings(flowchartData: FlowchartData): number {
    return 0 // 简化实现
  }

  private calculateLayoutBalance(nodes: FlowchartNode[]): number {
    return 0.8 // 简化实现
  }

  private calculateSpaceUtilization(nodes: FlowchartNode[]): number {
    return 0.7 // 简化实现
  }

  private calculateVisualComplexity(flowchartData: FlowchartData): number {
    return 0.5 // 简化实现
  }

  private calculateReadabilityScore(flowchartData: FlowchartData): number {
    return 0.75 // 简化实现
  }

  private detectOverlapIssues(nodes: FlowchartNode[]): LayoutIssue[] {
    return [] // 简化实现
  }

  private detectCrossingIssues(flowchartData: FlowchartData): LayoutIssue[] {
    return [] // 简化实现
  }

  private detectSpacingIssues(nodes: FlowchartNode[]): LayoutIssue[] {
    return [] // 简化实现
  }

  private detectAlignmentIssues(nodes: FlowchartNode[]): LayoutIssue[] {
    return [] // 简化实现
  }

  private detectHierarchyIssues(flowchartData: FlowchartData): LayoutIssue[] {
    return [] // 简化实现
  }

  private detectBalanceIssues(nodes: FlowchartNode[]): LayoutIssue[] {
    return [] // 简化实现
  }

  private calculateOverallScore(
    metrics: PerformanceAnalysis['metrics'],
    issues: LayoutIssue[]
  ): number {
    // 基于各项指标计算总分
    let score = 80 // 基础分
    
    // 根据问题严重程度扣分
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 15; break
        case 'high': score -= 10; break
        case 'medium': score -= 5; break
        case 'low': score -= 2; break
      }
    })
    
    return Math.max(0, score)
  }

  private createOptimizationFromIssue(
    issue: LayoutIssue,
    flowchartData: FlowchartData,
    index: number
  ): PerformanceOptimization | null {
    return {
      id: `fix-${issue.id}`,
      type: 'layout',
      priority: issue.severity === 'critical' ? 10 : issue.severity === 'high' ? 8 : 5,
      title: `修复${issue.description}`,
      description: issue.suggestion,
      expectedImprovement: 10,
      difficulty: 'medium',
      automatable: issue.autoFixable,
      action: async () => this.fixSpecificIssue(flowchartData, issue)
    }
  }

  private getGeneralOptimizations(
    analysis: PerformanceAnalysis,
    flowchartData: FlowchartData
  ): PerformanceOptimization[] {
    return [] // 简化实现
  }

  private async fixSpecificIssue(
    flowchartData: FlowchartData,
    issue: LayoutIssue
  ): Promise<FlowchartData> {
    // 根据问题类型执行具体修复
    return flowchartData // 简化实现
  }

  private generateCacheKey(flowchartData: FlowchartData): string {
    return JSON.stringify({
      nodeCount: flowchartData.nodes.length,
      edgeCount: flowchartData.edges.length,
      // 简化的缓存键生成
    })
  }

  // 模板应用方法的简化实现
  private async applyLinearTemplate(
    flowchartData: FlowchartData,
    template: LayoutTemplate
  ): Promise<FlowchartData> {
    const nodes = [...flowchartData.nodes]
    const spacing = template.config.nodeSpacing
    
    if (template.direction === 'horizontal') {
      nodes.forEach((node, index) => {
        node.position = {
          x: index * spacing.x,
          y: 200 // 固定Y位置
        }
      })
    } else {
      nodes.forEach((node, index) => {
        node.position = {
          x: 200, // 固定X位置
          y: index * spacing.y
        }
      })
    }
    
    return { ...flowchartData, nodes }
  }

  private async applyHierarchicalTemplate(
    flowchartData: FlowchartData,
    template: LayoutTemplate
  ): Promise<FlowchartData> {
    return this.applyHierarchicalLayout(flowchartData, {}, template.config)
  }

  private async applyCircularTemplate(
    flowchartData: FlowchartData,
    template: LayoutTemplate
  ): Promise<FlowchartData> {
    return this.applyCircularLayout(flowchartData, {}, template.config)
  }

  private async applyGridTemplate(
    flowchartData: FlowchartData,
    template: LayoutTemplate
  ): Promise<FlowchartData> {
    return this.applyGridLayout(flowchartData, {}, template.config)
  }

  private async applyOrganicTemplate(
    flowchartData: FlowchartData,
    template: LayoutTemplate
  ): Promise<FlowchartData> {
    return this.applyOrganicLayout(flowchartData, {}, template.config)
  }

  private async applySwimLaneTemplate(
    flowchartData: FlowchartData,
    template: LayoutTemplate
  ): Promise<FlowchartData> {
    // 泳道布局的简化实现
    const nodes = [...flowchartData.nodes]
    const swimlaneHeight = template.config.swimlaneHeight || 200
    const nodeSpacing = template.config.nodeSpacing
    
    // 简单按节点类型分组到不同泳道
    const groups = new Map<string, FlowchartNode[]>()
    nodes.forEach(node => {
      const type = node.type || 'default'
      if (!groups.has(type)) {
        groups.set(type, [])
      }
      groups.get(type)!.push(node)
    })
    
    let currentY = 0
    groups.forEach((groupNodes, groupType) => {
      groupNodes.forEach((node, index) => {
        node.position = {
          x: index * nodeSpacing.x,
          y: currentY + swimlaneHeight / 2
        }
      })
      currentY += swimlaneHeight
    })
    
    return { ...flowchartData, nodes }
  }
}

// 导出服务实例
export const aiLayoutService = new AILayoutService()

// 导出类型
export type {
  LayoutTemplate,
  LayoutSuggestion,
  PerformanceAnalysis,
  LayoutIssue,
  PerformanceOptimization,
  SmartArrangementOptions,
  ProcessTypeRecognition
}
