import { FlowNode } from '../core/Node';
import { Position } from '../types';

/**
 * 力导向布局配置
 */
export interface ForceLayoutConfig {
  iterations?: number;        // 迭代次数
  nodeRepulsion?: number;     // 节点斥力
  edgeAttraction?: number;    // 边吸引力
  damping?: number;           // 阻尼系数
  centerGravity?: number;     // 中心引力
}

/**
 * 力导向布局引擎
 * 基于物理模拟的布局算法
 */
export class ForceLayout {
  private config: Required<ForceLayoutConfig>;

  constructor(config: ForceLayoutConfig = {}) {
    this.config = {
      iterations: config.iterations ?? 100,
      nodeRepulsion: config.nodeRepulsion ?? 5000,
      edgeAttraction: config.edgeAttraction ?? 0.01,
      damping: config.damping ?? 0.9,
      centerGravity: config.centerGravity ?? 0.1
    };
  }

  /**
   * 执行布局
   */
  public layout(nodes: Map<string, FlowNode>): void {
    if (nodes.size === 0) {
      return;
    }

    // 初始化节点位置（如果没有设置）
    this.initializePositions(nodes);

    // 初始化速度
    const velocities = new Map<string, Position>();
    nodes.forEach((node, id) => {
      velocities.set(id, { x: 0, y: 0 });
    });

    // 迭代计算
    for (let i = 0; i < this.config.iterations; i++) {
      this.iterate(nodes, velocities);
    }
  }

  /**
   * 初始化节点位置
   */
  private initializePositions(nodes: Map<string, FlowNode>): void {
    const nodeArray = Array.from(nodes.values());
    const radius = 100;

    nodeArray.forEach((node, index) => {
      if (!node.position || (node.position.x === 0 && node.position.y === 0)) {
        const angle = (index / nodeArray.length) * 2 * Math.PI;
        node.position = {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
      }
    });
  }

  /**
   * 单次迭代
   */
  private iterate(nodes: Map<string, FlowNode>, velocities: Map<string, Position>): void {
    const forces = new Map<string, Position>();

    // 初始化力
    nodes.forEach((node, id) => {
      forces.set(id, { x: 0, y: 0 });
    });

    // 计算斥力（节点之间）
    this.calculateRepulsion(nodes, forces);

    // 计算引力（边）
    this.calculateAttraction(nodes, forces);

    // 计算中心引力
    this.calculateCenterGravity(nodes, forces);

    // 更新位置
    this.updatePositions(nodes, velocities, forces);
  }

  /**
   * 计算节点间斥力
   */
  private calculateRepulsion(nodes: Map<string, FlowNode>, forces: Map<string, Position>): void {
    const nodeArray = Array.from(nodes.values());

    for (let i = 0; i < nodeArray.length; i++) {
      for (let j = i + 1; j < nodeArray.length; j++) {
        const node1 = nodeArray[i];
        const node2 = nodeArray[j];

        const dx = node2.position.x - node1.position.x;
        const dy = node2.position.y - node1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = this.config.nodeRepulsion / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        const force1 = forces.get(node1.id)!;
        const force2 = forces.get(node2.id)!;

        force1.x -= fx;
        force1.y -= fy;
        force2.x += fx;
        force2.y += fy;
      }
    }
  }

  /**
   * 计算边的引力
   */
  private calculateAttraction(nodes: Map<string, FlowNode>, forces: Map<string, Position>): void {
    nodes.forEach(node => {
      const outputs = node.getOutputs();

      outputs.forEach(output => {
        const dx = output.position.x - node.position.x;
        const dy = output.position.y - node.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = distance * this.config.edgeAttraction;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        const force1 = forces.get(node.id)!;
        const force2 = forces.get(output.id)!;

        force1.x += fx;
        force1.y += fy;
        force2.x -= fx;
        force2.y -= fy;
      });
    });
  }

  /**
   * 计算中心引力
   */
  private calculateCenterGravity(
    nodes: Map<string, FlowNode>,
    forces: Map<string, Position>
  ): void {
    nodes.forEach((node, id) => {
      const force = forces.get(id)!;
      force.x -= node.position.x * this.config.centerGravity;
      force.y -= node.position.y * this.config.centerGravity;
    });
  }

  /**
   * 更新节点位置
   */
  private updatePositions(
    nodes: Map<string, FlowNode>,
    velocities: Map<string, Position>,
    forces: Map<string, Position>
  ): void {
    nodes.forEach((node, id) => {
      const velocity = velocities.get(id)!;
      const force = forces.get(id)!;

      // 更新速度
      velocity.x = (velocity.x + force.x) * this.config.damping;
      velocity.y = (velocity.y + force.y) * this.config.damping;

      // 更新位置
      node.position.x += velocity.x;
      node.position.y += velocity.y;
    });
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<ForceLayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

