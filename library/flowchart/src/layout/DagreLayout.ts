import { FlowNode } from '../core/Node';
import { LayoutConfig } from '../types';

/**
 * Dagre 布局引擎
 * 基于分层的有向图布局算法
 */
export class DagreLayout {
  private config: LayoutConfig;

  constructor(config: LayoutConfig) {
    this.config = config;
  }

  /**
   * 执行布局
   */
  public layout(nodes: Map<string, FlowNode>): void {
    if (nodes.size === 0) {
      return;
    }

    // 1. 找到所有起始节点（没有输入的节点）
    const startNodes = this.findStartNodes(nodes);
    
    if (startNodes.length === 0) {
      console.warn('No start nodes found, using first node as start');
      startNodes.push(Array.from(nodes.values())[0]);
    }

    // 2. 分层（Layer Assignment）
    const layers = this.assignLayers(startNodes);

    // 3. 减少交叉（Crossing Reduction）
    this.reduceCrossings(layers);

    // 4. 计算坐标
    this.assignCoordinates(layers);
  }

  /**
   * 找到起始节点
   */
  private findStartNodes(nodes: Map<string, FlowNode>): FlowNode[] {
    const startNodes: FlowNode[] = [];
    nodes.forEach(node => {
      if (node.getInputs().length === 0) {
        startNodes.push(node);
      }
    });
    return startNodes;
  }

  /**
   * 分层算法 - 使用 BFS
   */
  private assignLayers(startNodes: FlowNode[]): FlowNode[][] {
    const layers: FlowNode[][] = [];
    const visited = new Set<string>();
    const nodeLayer = new Map<string, number>();

    // BFS 遍历
    const queue: Array<{ node: FlowNode; layer: number }> = [];
    
    startNodes.forEach(node => {
      queue.push({ node, layer: 0 });
      nodeLayer.set(node.id, 0);
    });

    while (queue.length > 0) {
      const { node, layer } = queue.shift()!;
      
      if (visited.has(node.id)) {
        continue;
      }
      
      visited.add(node.id);

      // 确保层数组存在
      if (!layers[layer]) {
        layers[layer] = [];
      }
      layers[layer].push(node);

      // 处理输出节点
      const outputs = node.getOutputs();
      outputs.forEach(output => {
        const currentLayer = nodeLayer.get(output.id);
        const newLayer = layer + 1;
        
        // 如果节点还没有分配层级，或者新层级更大，则更新
        if (currentLayer === undefined || newLayer > currentLayer) {
          nodeLayer.set(output.id, newLayer);
          queue.push({ node: output, layer: newLayer });
        }
      });
    }

    return layers;
  }

  /**
   * 减少交叉 - 使用中位数启发式算法
   */
  private reduceCrossings(layers: FlowNode[][]): void {
    // 多次迭代以减少交叉
    const maxIterations = 4;
    
    for (let i = 0; i < maxIterations; i++) {
      // 从上到下
      for (let l = 1; l < layers.length; l++) {
        this.sortLayerByMedian(layers[l], layers[l - 1], true);
      }
      
      // 从下到上
      for (let l = layers.length - 2; l >= 0; l--) {
        this.sortLayerByMedian(layers[l], layers[l + 1], false);
      }
    }
  }

  /**
   * 根据中位数排序层
   */
  private sortLayerByMedian(
    layer: FlowNode[],
    referenceLayer: FlowNode[],
    useInputs: boolean
  ): void {
    const positions = new Map<string, number>();
    
    // 计算参考层中每个节点的位置
    referenceLayer.forEach((node, index) => {
      positions.set(node.id, index);
    });

    // 计算当前层每个节点的中位数位置
    const medians = layer.map(node => {
      const connections = useInputs ? node.getInputs() : node.getOutputs();
      const connectedPositions = connections
        .map(conn => positions.get(conn.id))
        .filter((pos): pos is number => pos !== undefined)
        .sort((a, b) => a - b);

      if (connectedPositions.length === 0) {
        return -1;
      }

      const mid = Math.floor(connectedPositions.length / 2);
      return connectedPositions[mid];
    });

    // 根据中位数排序
    const sorted = layer
      .map((node, index) => ({ node, median: medians[index] }))
      .sort((a, b) => {
        if (a.median === -1) return 1;
        if (b.median === -1) return -1;
        return a.median - b.median;
      });

    // 更新层数组
    layer.length = 0;
    sorted.forEach(item => layer.push(item.node));
  }

  /**
   * 分配坐标
   */
  private assignCoordinates(layers: FlowNode[][]): void {
    const { levelGap, nodeGap } = this.config;
    const direction = this.config.direction || 'TB';

    layers.forEach((layer, layerIndex) => {
      const layerSize = layer.length;
      const layerWidth = (layerSize - 1) * nodeGap;

      layer.forEach((node, nodeIndex) => {
        if (direction === 'TB') {
          // 从上到下
          const x = -layerWidth / 2 + nodeIndex * nodeGap;
          const y = layerIndex * levelGap;
          node.position = { x, y };
        } else {
          // 从左到右
          const x = layerIndex * levelGap;
          const y = -layerWidth / 2 + nodeIndex * nodeGap;
          node.position = { x, y };
        }
      });
    });
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

