/**
 * 测试数据生成器
 * 用于生成不同规模的流程图数据，用于性能测试
 */

import type { FlowchartData, ApprovalNodeConfig, ApprovalEdgeConfig, ApprovalNodeType } from '../types'

export interface TestDataConfig {
  /** 节点数量 */
  nodeCount: number
  /** 边密度（0-1，表示实际边数与最大可能边数的比例） */
  edgeDensity: number
  /** 节点类型分布 */
  nodeTypeDistribution: {
    start: number      // 开始节点比例
    approval: number   // 审批节点比例
    condition: number  // 条件节点比例
    process: number    // 处理节点比例
    end: number        // 结束节点比例
  }
  /** 画布尺寸 */
  canvasSize: {
    width: number
    height: number
  }
  /** 是否生成复杂的连接关系 */
  complexConnections: boolean
  /** 随机种子（用于生成可重复的数据） */
  seed?: number
}

export interface TestScenario {
  name: string
  description: string
  config: TestDataConfig
}

/**
 * 测试数据生成器类
 */
export class TestDataGenerator {
  private random: () => number

  constructor(seed?: number) {
    // 使用种子生成可重复的随机数
    this.random = this.createSeededRandom(seed || Date.now())
  }

  /**
   * 生成测试数据
   */
  generateTestData(config: TestDataConfig): FlowchartData {
    const nodes = this.generateNodes(config)
    const edges = this.generateEdges(nodes, config)

    return {
      nodes,
      edges
    }
  }

  /**
   * 获取预定义的测试场景
   */
  static getTestScenarios(): TestScenario[] {
    return [
      {
        name: 'small',
        description: '小型流程图（10-20个节点）',
        config: {
          nodeCount: 15,
          edgeDensity: 0.3,
          nodeTypeDistribution: {
            start: 0.1,
            approval: 0.4,
            condition: 0.2,
            process: 0.2,
            end: 0.1
          },
          canvasSize: { width: 1200, height: 800 },
          complexConnections: false
        }
      },
      {
        name: 'medium',
        description: '中型流程图（50-100个节点）',
        config: {
          nodeCount: 75,
          edgeDensity: 0.25,
          nodeTypeDistribution: {
            start: 0.05,
            approval: 0.45,
            condition: 0.25,
            process: 0.2,
            end: 0.05
          },
          canvasSize: { width: 2000, height: 1500 },
          complexConnections: true
        }
      },
      {
        name: 'large',
        description: '大型流程图（200-300个节点）',
        config: {
          nodeCount: 250,
          edgeDensity: 0.2,
          nodeTypeDistribution: {
            start: 0.02,
            approval: 0.5,
            condition: 0.25,
            process: 0.2,
            end: 0.03
          },
          canvasSize: { width: 3000, height: 2500 },
          complexConnections: true
        }
      },
      {
        name: 'xlarge',
        description: '超大型流程图（500-1000个节点）',
        config: {
          nodeCount: 750,
          edgeDensity: 0.15,
          nodeTypeDistribution: {
            start: 0.01,
            approval: 0.55,
            condition: 0.25,
            process: 0.18,
            end: 0.01
          },
          canvasSize: { width: 4000, height: 3500 },
          complexConnections: true
        }
      },
      {
        name: 'stress',
        description: '压力测试（1000+个节点）',
        config: {
          nodeCount: 1500,
          edgeDensity: 0.1,
          nodeTypeDistribution: {
            start: 0.005,
            approval: 0.6,
            condition: 0.25,
            process: 0.14,
            end: 0.005
          },
          canvasSize: { width: 5000, height: 4000 },
          complexConnections: true
        }
      }
    ]
  }

  /**
   * 根据场景名称生成测试数据
   */
  generateScenarioData(scenarioName: string): FlowchartData {
    const scenarios = TestDataGenerator.getTestScenarios()
    const scenario = scenarios.find(s => s.name === scenarioName)
    
    if (!scenario) {
      throw new Error(`未找到测试场景: ${scenarioName}`)
    }

    return this.generateTestData(scenario.config)
  }

  /**
   * 生成性能基准测试数据集
   */
  generateBenchmarkDataset(): { [key: string]: FlowchartData } {
    const scenarios = TestDataGenerator.getTestScenarios()
    const dataset: { [key: string]: FlowchartData } = {}

    scenarios.forEach(scenario => {
      dataset[scenario.name] = this.generateTestData(scenario.config)
    })

    return dataset
  }

  /**
   * 生成节点
   */
  private generateNodes(config: TestDataConfig): ApprovalNodeConfig[] {
    const nodes: ApprovalNodeConfig[] = []
    const { nodeCount, nodeTypeDistribution, canvasSize } = config

    // 计算每种类型的节点数量
    const typeCounts = {
      start: Math.max(1, Math.floor(nodeCount * nodeTypeDistribution.start)),
      approval: Math.floor(nodeCount * nodeTypeDistribution.approval),
      condition: Math.floor(nodeCount * nodeTypeDistribution.condition),
      process: Math.floor(nodeCount * nodeTypeDistribution.process),
      end: Math.max(1, Math.floor(nodeCount * nodeTypeDistribution.end))
    }

    // 调整总数以匹配目标节点数量
    const totalCalculated = Object.values(typeCounts).reduce((sum, count) => sum + count, 0)
    if (totalCalculated < nodeCount) {
      typeCounts.approval += nodeCount - totalCalculated
    }

    let nodeIndex = 0

    // 生成各种类型的节点
    Object.entries(typeCounts).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        const node = this.createNode(
          `node_${nodeIndex++}`,
          type as ApprovalNodeType,
          canvasSize
        )
        nodes.push(node)
      }
    })

    return nodes
  }

  /**
   * 创建单个节点
   */
  private createNode(id: string, type: ApprovalNodeType, canvasSize: { width: number; height: number }): ApprovalNodeConfig {
    const x = this.random() * (canvasSize.width - 200) + 100
    const y = this.random() * (canvasSize.height - 200) + 100

    const nodeTexts = {
      start: ['开始', '流程开始', '启动'],
      approval: ['审批', '领导审批', '部门审批', '财务审批', '总经理审批'],
      condition: ['条件判断', '金额判断', '权限判断', '状态判断'],
      process: ['处理', '数据处理', '文档生成', '通知发送', '记录保存'],
      end: ['结束', '流程结束', '完成']
    }

    const texts = nodeTexts[type] || [type]
    const text = texts[Math.floor(this.random() * texts.length)]

    return {
      id,
      type,
      x: Math.round(x),
      y: Math.round(y),
      text,
      properties: {
        name: text,
        description: `自动生成的${type}节点`,
        ...this.generateNodeProperties(type)
      }
    }
  }

  /**
   * 生成节点属性
   */
  private generateNodeProperties(type: ApprovalNodeType): Record<string, any> {
    const baseProperties = {
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    }

    switch (type) {
      case 'approval':
        return {
          ...baseProperties,
          approver: `用户${Math.floor(this.random() * 100)}`,
          department: ['人事部', '财务部', '技术部', '市场部'][Math.floor(this.random() * 4)],
          level: Math.floor(this.random() * 5) + 1
        }
      case 'condition':
        return {
          ...baseProperties,
          condition: `金额 ${this.random() > 0.5 ? '>' : '<'} ${Math.floor(this.random() * 10000)}`,
          trueLabel: '是',
          falseLabel: '否'
        }
      case 'process':
        return {
          ...baseProperties,
          duration: Math.floor(this.random() * 60) + 1, // 1-60分钟
          automated: this.random() > 0.5
        }
      default:
        return baseProperties
    }
  }

  /**
   * 生成边
   */
  private generateEdges(nodes: ApprovalNodeConfig[], config: TestDataConfig): ApprovalEdgeConfig[] {
    const edges: ApprovalEdgeConfig[] = []
    const { edgeDensity, complexConnections } = config

    if (complexConnections) {
      return this.generateComplexEdges(nodes, edgeDensity)
    } else {
      return this.generateSimpleEdges(nodes, edgeDensity)
    }
  }

  /**
   * 生成简单的边连接（主要是线性连接）
   */
  private generateSimpleEdges(nodes: ApprovalNodeConfig[], edgeDensity: number): ApprovalEdgeConfig[] {
    const edges: ApprovalEdgeConfig[] = []
    const maxEdges = Math.floor(nodes.length * edgeDensity * 2) // 简单估算

    // 创建主要的线性连接
    for (let i = 0; i < nodes.length - 1; i++) {
      if (this.random() < 0.8) { // 80%的概率创建连接
        edges.push(this.createEdge(nodes[i].id, nodes[i + 1].id, edges.length))
      }
    }

    // 添加一些随机连接
    const remainingEdges = maxEdges - edges.length
    for (let i = 0; i < remainingEdges; i++) {
      const sourceIndex = Math.floor(this.random() * nodes.length)
      const targetIndex = Math.floor(this.random() * nodes.length)
      
      if (sourceIndex !== targetIndex) {
        const sourceId = nodes[sourceIndex].id
        const targetId = nodes[targetIndex].id
        
        // 避免重复边
        if (!edges.some(e => e.sourceNodeId === sourceId && e.targetNodeId === targetId)) {
          edges.push(this.createEdge(sourceId, targetId, edges.length))
        }
      }
    }

    return edges
  }

  /**
   * 生成复杂的边连接（包含分支、合并等）
   */
  private generateComplexEdges(nodes: ApprovalNodeConfig[], edgeDensity: number): ApprovalEdgeConfig[] {
    const edges: ApprovalEdgeConfig[] = []
    const startNodes = nodes.filter(n => n.type === 'start')
    const endNodes = nodes.filter(n => n.type === 'end')
    const middleNodes = nodes.filter(n => n.type !== 'start' && n.type !== 'end')

    // 确保每个开始节点都有出边
    startNodes.forEach(startNode => {
      const targetCount = Math.floor(this.random() * 3) + 1 // 1-3个目标
      const targets = this.selectRandomNodes(middleNodes, targetCount)
      targets.forEach(target => {
        edges.push(this.createEdge(startNode.id, target.id, edges.length))
      })
    })

    // 确保每个结束节点都有入边
    endNodes.forEach(endNode => {
      const sourceCount = Math.floor(this.random() * 3) + 1 // 1-3个来源
      const sources = this.selectRandomNodes(middleNodes, sourceCount)
      sources.forEach(source => {
        if (!edges.some(e => e.sourceNodeId === source.id && e.targetNodeId === endNode.id)) {
          edges.push(this.createEdge(source.id, endNode.id, edges.length))
        }
      })
    })

    // 在中间节点之间创建连接
    const targetEdgeCount = Math.floor(nodes.length * edgeDensity)
    while (edges.length < targetEdgeCount) {
      const sourceNode = middleNodes[Math.floor(this.random() * middleNodes.length)]
      const targetNode = middleNodes[Math.floor(this.random() * middleNodes.length)]
      
      if (sourceNode.id !== targetNode.id) {
        if (!edges.some(e => e.sourceNodeId === sourceNode.id && e.targetNodeId === targetNode.id)) {
          edges.push(this.createEdge(sourceNode.id, targetNode.id, edges.length))
        }
      }
    }

    return edges
  }

  /**
   * 创建边
   */
  private createEdge(sourceNodeId: string, targetNodeId: string, index: number): ApprovalEdgeConfig {
    return {
      id: `edge_${index}`,
      type: 'approval-edge',
      sourceNodeId,
      targetNodeId,
      text: this.random() > 0.7 ? ['同意', '通过', '批准', '确认'][Math.floor(this.random() * 4)] : '',
      properties: {
        createdAt: new Date().toISOString()
      }
    }
  }

  /**
   * 从数组中随机选择指定数量的元素
   */
  private selectRandomNodes<T>(nodes: T[], count: number): T[] {
    const shuffled = [...nodes].sort(() => this.random() - 0.5)
    return shuffled.slice(0, Math.min(count, nodes.length))
  }

  /**
   * 创建带种子的随机数生成器
   */
  private createSeededRandom(seed: number): () => number {
    let currentSeed = seed
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280
      return currentSeed / 233280
    }
  }
}

/**
 * 性能基准测试工具
 */
export class PerformanceBenchmark {
  private generator: TestDataGenerator

  constructor(seed?: number) {
    this.generator = new TestDataGenerator(seed)
  }

  /**
   * 运行性能基准测试
   */
  async runBenchmark(callback: (data: FlowchartData, scenario: string) => Promise<number>): Promise<BenchmarkResult[]> {
    const scenarios = TestDataGenerator.getTestScenarios()
    const results: BenchmarkResult[] = []

    for (const scenario of scenarios) {
      console.log(`运行基准测试: ${scenario.name}`)
      const data = this.generator.generateTestData(scenario.config)
      
      // 运行多次取平均值
      const times: number[] = []
      const iterations = 3
      
      for (let i = 0; i < iterations; i++) {
        const time = await callback(data, scenario.name)
        times.push(time)
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      results.push({
        scenario: scenario.name,
        description: scenario.description,
        nodeCount: scenario.config.nodeCount,
        edgeCount: data.edges.length,
        avgTime,
        minTime,
        maxTime,
        iterations
      })
    }

    return results
  }

  /**
   * 生成基准测试报告
   */
  generateBenchmarkReport(results: BenchmarkResult[]): string {
    let report = '# 性能基准测试报告\n\n'
    report += '| 场景 | 描述 | 节点数 | 边数 | 平均时间(ms) | 最小时间(ms) | 最大时间(ms) |\n'
    report += '|------|------|--------|------|-------------|-------------|-------------|\n'

    results.forEach(result => {
      report += `| ${result.scenario} | ${result.description} | ${result.nodeCount} | ${result.edgeCount} | ${result.avgTime.toFixed(2)} | ${result.minTime.toFixed(2)} | ${result.maxTime.toFixed(2)} |\n`
    })

    report += '\n## 性能分析\n\n'
    
    const worstPerformance = results.reduce((worst, current) => 
      current.avgTime > worst.avgTime ? current : worst
    )
    
    const bestPerformance = results.reduce((best, current) => 
      current.avgTime < best.avgTime ? current : best
    )

    report += `- **最佳性能**: ${bestPerformance.scenario} (${bestPerformance.avgTime.toFixed(2)}ms)\n`
    report += `- **最差性能**: ${worstPerformance.scenario} (${worstPerformance.avgTime.toFixed(2)}ms)\n`
    report += `- **性能比率**: ${(worstPerformance.avgTime / bestPerformance.avgTime).toFixed(2)}x\n`

    return report
  }
}

export interface BenchmarkResult {
  scenario: string
  description: string
  nodeCount: number
  edgeCount: number
  avgTime: number
  minTime: number
  maxTime: number
  iterations: number
}
