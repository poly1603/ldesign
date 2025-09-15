/**
 * 力导向布局算法
 * 
 * 使用物理模拟的方式排列节点，适用于复杂的关系图
 */

import { BaseLayoutAlgorithm } from './BaseLayoutAlgorithm'
import type {
  LayoutConfig,
  Position
} from '../types'
import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../../types'

/**
 * 力的类型
 */
interface Force {
  x: number
  y: number
}

/**
 * 节点状态
 */
interface NodeState {
  id: string
  position: Position
  velocity: Force
  force: Force
  mass: number
  fixed: boolean
}

/**
 * 力导向布局算法类
 */
export class ForceDirectedLayout extends BaseLayoutAlgorithm {
  readonly name = 'force-directed' as const
  readonly description = '力导向布局算法，使用物理模拟创建自然的节点排列'

  /**
   * 验证特定配置
   */
  protected validateSpecificConfig(config: LayoutConfig): boolean {
    const algorithmConfig = config.algorithmConfig || {}
    
    // 验证迭代次数
    if (algorithmConfig.iterations && algorithmConfig.iterations < 1) {
      return false
    }
    
    // 验证弹簧参数
    if (algorithmConfig.springLength && algorithmConfig.springLength < 0) {
      return false
    }
    
    if (algorithmConfig.springStrength && algorithmConfig.springStrength < 0) {
      return false
    }
    
    return true
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<LayoutConfig> {
    return {
      ...super.getDefaultConfig(),
      algorithmConfig: {
        iterations: 300,
        springLength: 100,
        springStrength: 0.1,
        repulsionStrength: 1000,
        damping: 0.9,
        timeStep: 1.0,
        centerForce: 0.01,
        initialTemperature: 100,
        coolingFactor: 0.95
      }
    }
  }

  /**
   * 执行力导向布局
   */
  protected async executeLayout(data: FlowchartData, config: LayoutConfig): Promise<Record<string, Position>> {
    const { nodes, edges } = data
    const algorithmConfig = { ...this.getDefaultConfig().algorithmConfig, ...config.algorithmConfig }
    
    // 初始化节点状态
    const nodeStates = this.initializeNodeStates(nodes, config)
    
    // 执行模拟
    const finalStates = await this.runSimulation(nodeStates, edges, algorithmConfig)
    
    // 提取位置
    const positions: Record<string, Position> = {}
    for (const state of finalStates) {
      positions[state.id] = { ...state.position }
    }
    
    return positions
  }

  /**
   * 初始化节点状态
   */
  private initializeNodeStates(nodes: FlowchartNode[], config: LayoutConfig): NodeState[] {
    const nodeStates: NodeState[] = []
    const centerX = 0
    const centerY = 0
    const radius = Math.sqrt(nodes.length) * 50
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      
      // 检查是否有固定位置
      const isFixed = config.constraints?.fixedNodes?.includes(node.id) || false
      
      let position: Position
      if (isFixed && config.preservePositions) {
        // 使用现有位置
        position = (node as any).position || { x: centerX, y: centerY }
      } else {
        // 随机初始位置（圆形分布）
        const angle = (i / nodes.length) * 2 * Math.PI
        position = {
          x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
          y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 20
        }
      }
      
      nodeStates.push({
        id: node.id,
        position,
        velocity: { x: 0, y: 0 },
        force: { x: 0, y: 0 },
        mass: this.calculateNodeMass(node),
        fixed: isFixed
      })
    }
    
    return nodeStates
  }

  /**
   * 运行物理模拟
   */
  private async runSimulation(
    nodeStates: NodeState[],
    edges: FlowchartEdge[],
    config: any
  ): Promise<NodeState[]> {
    const {
      iterations,
      springLength,
      springStrength,
      repulsionStrength,
      damping,
      timeStep,
      centerForce,
      initialTemperature,
      coolingFactor
    } = config
    
    let temperature = initialTemperature
    
    for (let iteration = 0; iteration < iterations; iteration++) {
      // 重置力
      for (const state of nodeStates) {
        state.force = { x: 0, y: 0 }
      }
      
      // 计算排斥力
      this.calculateRepulsionForces(nodeStates, repulsionStrength)
      
      // 计算弹簧力
      this.calculateSpringForces(nodeStates, edges, springLength, springStrength)
      
      // 计算中心力
      this.calculateCenterForces(nodeStates, centerForce)
      
      // 更新位置
      this.updatePositions(nodeStates, timeStep, damping, temperature)
      
      // 降温
      temperature *= coolingFactor
      
      // 检查收敛
      if (this.hasConverged(nodeStates, temperature)) {
        break
      }
    }
    
    return nodeStates
  }

  /**
   * 计算排斥力
   */
  private calculateRepulsionForces(nodeStates: NodeState[], repulsionStrength: number): void {
    for (let i = 0; i < nodeStates.length; i++) {
      for (let j = i + 1; j < nodeStates.length; j++) {
        const state1 = nodeStates[i]
        const state2 = nodeStates[j]
        
        const dx = state1.position.x - state2.position.x
        const dy = state1.position.y - state2.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 0) {
          const force = repulsionStrength / (distance * distance)
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force
          
          state1.force.x += fx
          state1.force.y += fy
          state2.force.x -= fx
          state2.force.y -= fy
        }
      }
    }
  }

  /**
   * 计算弹簧力
   */
  private calculateSpringForces(
    nodeStates: NodeState[],
    edges: FlowchartEdge[],
    springLength: number,
    springStrength: number
  ): void {
    const stateMap = new Map<string, NodeState>()
    for (const state of nodeStates) {
      stateMap.set(state.id, state)
    }
    
    for (const edge of edges) {
      const sourceState = stateMap.get(edge.sourceNodeId)
      const targetState = stateMap.get(edge.targetNodeId)
      
      if (sourceState && targetState) {
        const dx = targetState.position.x - sourceState.position.x
        const dy = targetState.position.y - sourceState.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 0) {
          const displacement = distance - springLength
          const force = springStrength * displacement
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force
          
          sourceState.force.x += fx
          sourceState.force.y += fy
          targetState.force.x -= fx
          targetState.force.y -= fy
        }
      }
    }
  }

  /**
   * 计算中心力
   */
  private calculateCenterForces(nodeStates: NodeState[], centerForce: number): void {
    // 计算质心
    let centerX = 0
    let centerY = 0
    let totalMass = 0
    
    for (const state of nodeStates) {
      centerX += state.position.x * state.mass
      centerY += state.position.y * state.mass
      totalMass += state.mass
    }
    
    if (totalMass > 0) {
      centerX /= totalMass
      centerY /= totalMass
    }
    
    // 应用中心力
    for (const state of nodeStates) {
      const dx = centerX - state.position.x
      const dy = centerY - state.position.y
      
      state.force.x += dx * centerForce
      state.force.y += dy * centerForce
    }
  }

  /**
   * 更新位置
   */
  private updatePositions(
    nodeStates: NodeState[],
    timeStep: number,
    damping: number,
    temperature: number
  ): void {
    for (const state of nodeStates) {
      if (state.fixed) continue
      
      // 更新速度
      state.velocity.x = (state.velocity.x + state.force.x * timeStep / state.mass) * damping
      state.velocity.y = (state.velocity.y + state.force.y * timeStep / state.mass) * damping
      
      // 限制速度（基于温度）
      const maxVelocity = temperature
      const velocityMagnitude = Math.sqrt(state.velocity.x * state.velocity.x + state.velocity.y * state.velocity.y)
      
      if (velocityMagnitude > maxVelocity) {
        state.velocity.x = (state.velocity.x / velocityMagnitude) * maxVelocity
        state.velocity.y = (state.velocity.y / velocityMagnitude) * maxVelocity
      }
      
      // 更新位置
      state.position.x += state.velocity.x * timeStep
      state.position.y += state.velocity.y * timeStep
    }
  }

  /**
   * 检查是否收敛
   */
  private hasConverged(nodeStates: NodeState[], temperature: number): boolean {
    // 如果温度很低，认为已收敛
    if (temperature < 1) {
      return true
    }
    
    // 检查总动能
    let totalKineticEnergy = 0
    for (const state of nodeStates) {
      const velocitySquared = state.velocity.x * state.velocity.x + state.velocity.y * state.velocity.y
      totalKineticEnergy += 0.5 * state.mass * velocitySquared
    }
    
    // 如果总动能很小，认为已收敛
    return totalKineticEnergy < 0.1
  }

  /**
   * 计算节点质量
   */
  private calculateNodeMass(node: FlowchartNode): number {
    // 根据节点类型和大小计算质量
    const nodeType = (node as any).type
    
    switch (nodeType) {
      case 'start':
      case 'end':
        return 2.0 // 起始和结束节点质量较大
      case 'condition':
        return 1.5 // 条件节点质量中等
      case 'process':
      case 'approval':
        return 1.0 // 处理节点标准质量
      default:
        return 1.0
    }
  }
}
