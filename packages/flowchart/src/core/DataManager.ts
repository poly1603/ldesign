/**
 * 数据管理器
 * 负责管理流程图数据、状态同步、数据验证等功能
 */

import type {
  FlowchartData,
  NodeData,
  EdgeData,
  Viewport,
  EventEmitter,
  Command
} from '@/types/index.js';
import { EventType } from '@/types/index.js';
import { SimpleEventEmitter } from '@/utils/index.js';

/**
 * 历史记录项
 */
interface HistoryItem {
  /** 命令 */
  command: Command;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 数据变更事件
 */
export interface DataChangeEvent {
  /** 变更类型 */
  type: 'node' | 'edge' | 'viewport' | 'metadata' | 'data' | 'all';
  /** 操作类型 */
  action: 'add' | 'update' | 'remove' | 'load' | 'clear';
  /** 变更的数据 */
  data: any;
  /** 旧数据（更新和删除时） */
  oldData?: any;
}

/**
 * 数据管理器类
 */
export class DataManager extends SimpleEventEmitter implements EventEmitter {
  private data: FlowchartData;
  private history: HistoryItem[] = [];
  private historyIndex = -1;
  private maxHistorySize = 100;
  private isExecutingCommand = false;

  constructor(initialData?: Partial<FlowchartData>) {
    super();

    this.data = {
      nodes: [],
      edges: [],
      viewport: {
        scale: 1,
        offset: { x: 0, y: 0 },
        size: { width: 800, height: 600 }
      },
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      ...initialData
    };
  }

  /**
   * 获取完整数据
   */
  getData(): FlowchartData {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * 设置完整数据
   */
  setData(data: FlowchartData): void {
    const oldData = this.getData();
    this.data = JSON.parse(JSON.stringify(data));

    this.emit(EventType.DATA_CHANGE, {
      type: 'all',
      action: 'update',
      data: this.data,
      oldData
    });

    this.emit(EventType.DATA_LOAD, this.data);
  }

  /**
   * 获取所有节点
   */
  getNodes(): NodeData[] {
    return [...this.data.nodes];
  }

  /**
   * 获取节点
   */
  getNode(id: string): NodeData | undefined {
    return this.data.nodes.find(node => node.id === id);
  }

  /**
   * 添加节点
   */
  addNode(node: NodeData): void {
    if (this.getNode(node.id)) {
      throw new Error(`节点 ${node.id} 已存在`);
    }

    this.data.nodes.push({ ...node });

    this.emit(EventType.DATA_CHANGE, {
      type: 'node',
      action: 'add',
      data: node
    } as DataChangeEvent);

    this.emit(EventType.NODE_ADD, node);
  }

  /**
   * 更新节点
   */
  updateNode(id: string, updates: Partial<NodeData>): void {
    const index = this.data.nodes.findIndex(node => node.id === id);
    if (index === -1) {
      throw new Error(`节点 ${id} 不存在`);
    }

    const oldNode = { ...this.data.nodes[index]! };
    const newNode = { ...oldNode, ...updates, id }; // 确保ID不被修改

    this.data.nodes[index] = newNode;

    this.emit(EventType.DATA_CHANGE, {
      type: 'node',
      action: 'update',
      data: newNode,
      oldData: oldNode
    } as DataChangeEvent);

    this.emit(EventType.NODE_UPDATE, { node: newNode, oldNode });
  }

  /**
   * 移除节点
   */
  removeNode(id: string): boolean {
    const index = this.data.nodes.findIndex(node => node.id === id);
    if (index === -1) {
      return false;
    }

    const removedNode = this.data.nodes[index]!;
    this.data.nodes.splice(index, 1);

    // 移除相关的连接线
    const relatedEdges = this.data.edges.filter(
      edge => edge.source === id || edge.target === id
    );

    relatedEdges.forEach(edge => {
      this.removeEdge(edge.id);
    });

    this.emit(EventType.DATA_CHANGE, {
      type: 'node',
      action: 'remove',
      data: removedNode
    } as DataChangeEvent);

    this.emit(EventType.NODE_REMOVE, removedNode);
    return true;
  }

  /**
   * 获取所有连接线
   */
  getEdges(): EdgeData[] {
    return [...this.data.edges];
  }

  /**
   * 获取连接线
   */
  getEdge(id: string): EdgeData | undefined {
    return this.data.edges.find(edge => edge.id === id);
  }

  /**
   * 添加连接线
   */
  addEdge(edge: EdgeData): void {
    if (this.getEdge(edge.id)) {
      throw new Error(`连接线 ${edge.id} 已存在`);
    }

    // 验证源节点和目标节点是否存在
    if (!this.getNode(edge.source)) {
      throw new Error(`源节点 ${edge.source} 不存在`);
    }

    if (!this.getNode(edge.target)) {
      throw new Error(`目标节点 ${edge.target} 不存在`);
    }

    this.data.edges.push({ ...edge });

    this.emit(EventType.DATA_CHANGE, {
      type: 'edge',
      action: 'add',
      data: edge
    } as DataChangeEvent);

    this.emit(EventType.EDGE_ADD, edge);
  }

  /**
   * 更新连接线
   */
  updateEdge(id: string, updates: Partial<EdgeData>): void {
    const index = this.data.edges.findIndex(edge => edge.id === id);
    if (index === -1) {
      throw new Error(`连接线 ${id} 不存在`);
    }

    const oldEdge = { ...this.data.edges[index]! };
    const newEdge = { ...oldEdge, ...updates, id }; // 确保ID不被修改

    // 如果更新了源节点或目标节点，验证它们是否存在
    if (updates.source && !this.getNode(updates.source)) {
      throw new Error(`源节点 ${updates.source} 不存在`);
    }

    if (updates.target && !this.getNode(updates.target)) {
      throw new Error(`目标节点 ${updates.target} 不存在`);
    }

    this.data.edges[index] = newEdge;

    this.emit(EventType.DATA_CHANGE, {
      type: 'edge',
      action: 'update',
      data: newEdge,
      oldData: oldEdge
    } as DataChangeEvent);

    this.emit(EventType.EDGE_UPDATE, { edge: newEdge, oldEdge });
  }

  /**
   * 移除连接线
   */
  removeEdge(id: string): boolean {
    const index = this.data.edges.findIndex(edge => edge.id === id);
    if (index === -1) {
      return false;
    }

    const removedEdge = this.data.edges[index]!;
    this.data.edges.splice(index, 1);

    this.emit(EventType.DATA_CHANGE, {
      type: 'edge',
      action: 'remove',
      data: removedEdge
    } as DataChangeEvent);

    this.emit(EventType.EDGE_REMOVE, removedEdge);
    return true;
  }

  /**
   * 获取视口信息
   */
  getViewport(): Viewport {
    return { ...this.data.viewport! };
  }

  /**
   * 设置视口信息
   */
  setViewport(viewport: Partial<Viewport>): void {
    const oldViewport = { ...this.data.viewport! };
    this.data.viewport = { ...oldViewport, ...viewport };

    this.emit(EventType.DATA_CHANGE, {
      type: 'viewport',
      action: 'update',
      data: this.data.viewport,
      oldData: oldViewport
    } as DataChangeEvent);
  }

  /**
   * 获取元数据
   */
  getMetadata(): Record<string, any> {
    return { ...this.data.metadata };
  }

  /**
   * 设置元数据
   */
  setMetadata(metadata: Record<string, any>): void {
    const oldMetadata = { ...this.data.metadata };
    this.data.metadata = { ...metadata };

    this.emit(EventType.DATA_CHANGE, {
      type: 'metadata',
      action: 'update',
      data: this.data.metadata,
      oldData: oldMetadata
    } as DataChangeEvent);
  }

  /**
   * 执行命令
   */
  executeCommand(command: Command): void {
    if (this.isExecutingCommand) {
      return;
    }

    this.isExecutingCommand = true;

    try {
      command.execute();

      // 添加到历史记录
      this.addToHistory(command);

      this.emit(EventType.HISTORY_CHANGE, {
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      });

    } finally {
      this.isExecutingCommand = false;
    }
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    this.isExecutingCommand = true;

    try {
      const historyItem = this.history[this.historyIndex]!;
      historyItem.command.undo();
      this.historyIndex--;

      this.emit(EventType.HISTORY_UNDO, historyItem.command);
      this.emit(EventType.HISTORY_CHANGE, {
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      });

      return true;

    } finally {
      this.isExecutingCommand = false;
    }
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    this.isExecutingCommand = true;

    try {
      this.historyIndex++;
      const historyItem = this.history[this.historyIndex]!;
      historyItem.command.redo();

      this.emit(EventType.HISTORY_REDO, historyItem.command);
      this.emit(EventType.HISTORY_CHANGE, {
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      });

      return true;

    } finally {
      this.isExecutingCommand = false;
    }
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;

    this.emit(EventType.HISTORY_CHANGE, {
      canUndo: false,
      canRedo: false
    });
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(command: Command): void {
    // 如果当前不在历史记录的末尾，删除后面的记录
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // 添加新命令
    this.history.push({
      command,
      timestamp: Date.now()
    });

    this.historyIndex++;

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * 验证数据完整性
   */
  validateData(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证节点ID唯一性
    const nodeIds = new Set<string>();
    for (const node of this.data.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`重复的节点ID: ${node.id}`);
      }
      nodeIds.add(node.id);
    }

    // 验证连接线ID唯一性
    const edgeIds = new Set<string>();
    for (const edge of this.data.edges) {
      if (edgeIds.has(edge.id)) {
        errors.push(`重复的连接线ID: ${edge.id}`);
      }
      edgeIds.add(edge.id);

      // 验证连接线的源节点和目标节点是否存在
      if (!nodeIds.has(edge.source)) {
        errors.push(`连接线 ${edge.id} 的源节点 ${edge.source} 不存在`);
      }

      if (!nodeIds.has(edge.target)) {
        errors.push(`连接线 ${edge.id} 的目标节点 ${edge.target} 不存在`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 导出数据
   */
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * 导入数据
   */
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData) as FlowchartData;

      // 验证数据格式
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('无效的数据格式：缺少nodes数组');
      }

      if (!data.edges || !Array.isArray(data.edges)) {
        throw new Error('无效的数据格式：缺少edges数组');
      }

      this.setData(data);

    } catch (error) {
      throw new Error(`导入数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 加载数据
   */
  loadData(data: FlowchartData): void {
    this.validateDataFormat(data);
    this.data = { ...data };
    this.emit(EventType.DATA_CHANGE, {
      type: 'data',
      action: 'load',
      data: this.data
    } as DataChangeEvent);
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.data = this.createEmptyData();
    this.emit(EventType.DATA_CHANGE, {
      type: 'data',
      action: 'clear',
      data: this.data
    } as DataChangeEvent);
  }

  /**
   * 验证数据格式
   */
  private validateDataFormat(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('数据格式无效');
    }

    if (!Array.isArray(data.nodes)) {
      throw new Error('节点数据必须是数组');
    }

    if (!Array.isArray(data.edges)) {
      throw new Error('连接线数据必须是数组');
    }

    if (data.metadata && typeof data.metadata !== 'object') {
      throw new Error('元数据格式无效');
    }
  }

  /**
   * 创建空数据
   */
  private createEmptyData(): FlowchartData {
    return {
      nodes: [],
      edges: [],
      viewport: {
        scale: 1,
        offset: { x: 0, y: 0 },
        size: { width: 800, height: 600 }
      },
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * 销毁数据管理器
   */
  destroy(): void {
    this.removeAllListeners();
    this.clearHistory();
    this.data = this.createEmptyData();
  }
}
