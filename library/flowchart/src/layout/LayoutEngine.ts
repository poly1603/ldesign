import { FlowNode } from '../core/Node';
import { LayoutConfig, Position } from '../types';

/**
 * 自动布局引擎
 */
export class LayoutEngine {
  private config: LayoutConfig;

  constructor(config: LayoutConfig) {
    this.config = config;
  }

  /**
   * 执行自动布局
   */
  public layout(nodes: Map<string, FlowNode>): void {
    const nodeArray = Array.from(nodes.values());
    
    // 只对非手动节点进行自动布局
    const autoLayoutNodes = nodeArray.filter(node => !node.manualPosition);
    
    if (autoLayoutNodes.length === 0) {
      return;
    }
    
    // 找到起始节点（排除手动节点）
    const startNodes = autoLayoutNodes.filter(node => node.getInputs().length === 0);
    
    if (startNodes.length === 0) {
      return;
    }

    // 层级遍历计算每个节点的层级
    const levels = this.calculateLevels(startNodes);
    
    // 根据层级布局节点
    this.layoutByLevels(levels);
  }

  /**
   * 计算节点层级（排除手动节点）
   */
  private calculateLevels(startNodes: FlowNode[]): Map<number, FlowNode[]> {
    const levels = new Map<number, FlowNode[]>();
    const visited = new Set<string>();
    const queue: { node: FlowNode; level: number }[] = [];

    // 初始化起始节点
    startNodes.forEach(node => {
      queue.push({ node, level: 0 });
    });

    while (queue.length > 0) {
      const { node, level } = queue.shift()!;
      
      if (visited.has(node.id) || node.manualPosition) {
        continue;
      }
      
      visited.add(node.id);
      
      if (!levels.has(level)) {
        levels.set(level, []);
      }
      levels.get(level)!.push(node);

      // 添加输出节点到队列（跳过手动节点）
      node.getOutputs().forEach(output => {
        if (!visited.has(output.id) && !output.manualPosition) {
          queue.push({ node: output, level: level + 1 });
        }
      });
    }

    return levels;
  }

  /**
   * 根据层级布局节点
   */
  private layoutByLevels(levels: Map<number, FlowNode[]>): void {
    const { direction, nodeGap, levelGap } = this.config;
    const nodeWidth = 160;
    const nodeHeight = 60;

    levels.forEach((nodesInLevel, level) => {
      const totalWidth = nodesInLevel.length * nodeWidth + (nodesInLevel.length - 1) * nodeGap;
      let startX = -totalWidth / 2;

      nodesInLevel.forEach((node, index) => {
        // 跳过手动设置位置的节点
        if (node.manualPosition) {
          return;
        }

        const position: Position = direction === 'TB' 
          ? {
              x: startX + index * (nodeWidth + nodeGap) + nodeWidth / 2,
              y: level * (nodeHeight + levelGap) + nodeHeight / 2
            }
          : {
              x: level * (nodeWidth + levelGap) + nodeWidth / 2,
              y: startX + index * (nodeHeight + nodeGap) + nodeHeight / 2
            };

        node.updatePosition(position);
      });
    });
  }

  /**
   * 更新布局配置
   */
  public updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }
}




