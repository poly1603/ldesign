/**
 * 命令管理器
 * 实现命令模式，支持撤销重做功能
 */

import type { Command, EventEmitter } from '@/types/index.js';
import { EventType } from '@/types/index.js';
import { SimpleEventEmitter } from '@/utils/index.js';
import type { DataManager } from '@/core/index.js';
import type { BaseNode } from '@/nodes/index.js';
import type { BaseEdge } from '@/edges/index.js';

/**
 * 添加节点命令
 */
export class AddNodeCommand implements Command {
  name = '添加节点';
  
  constructor(
    private dataManager: DataManager,
    private node: BaseNode
  ) {}

  execute(): void {
    this.dataManager.addNode(this.node.getData());
  }

  undo(): void {
    this.dataManager.removeNode(this.node.id);
  }

  redo(): void {
    this.execute();
  }
}

/**
 * 删除节点命令
 */
export class RemoveNodeCommand implements Command {
  name = '删除节点';
  
  constructor(
    private dataManager: DataManager,
    private node: BaseNode
  ) {}

  execute(): void {
    this.dataManager.removeNode(this.node.id);
  }

  undo(): void {
    this.dataManager.addNode(this.node.getData());
  }

  redo(): void {
    this.execute();
  }
}

/**
 * 移动节点命令
 */
export class MoveNodeCommand implements Command {
  name = '移动节点';
  
  constructor(
    private dataManager: DataManager,
    private nodeId: string,
    private oldPosition: { x: number; y: number },
    private newPosition: { x: number; y: number }
  ) {}

  execute(): void {
    this.dataManager.updateNode(this.nodeId, { position: this.newPosition });
  }

  undo(): void {
    this.dataManager.updateNode(this.nodeId, { position: this.oldPosition });
  }

  redo(): void {
    this.execute();
  }
}

/**
 * 更新节点命令
 */
export class UpdateNodeCommand implements Command {
  name = '更新节点';
  
  constructor(
    private dataManager: DataManager,
    private nodeId: string,
    private oldData: any,
    private newData: any
  ) {}

  execute(): void {
    this.dataManager.updateNode(this.nodeId, this.newData);
  }

  undo(): void {
    this.dataManager.updateNode(this.nodeId, this.oldData);
  }

  redo(): void {
    this.execute();
  }
}

/**
 * 添加连接线命令
 */
export class AddEdgeCommand implements Command {
  name = '添加连接线';
  
  constructor(
    private dataManager: DataManager,
    private edge: BaseEdge
  ) {}

  execute(): void {
    this.dataManager.addEdge(this.edge.getData());
  }

  undo(): void {
    this.dataManager.removeEdge(this.edge.id);
  }

  redo(): void {
    this.execute();
  }
}

/**
 * 删除连接线命令
 */
export class RemoveEdgeCommand implements Command {
  name = '删除连接线';
  
  constructor(
    private dataManager: DataManager,
    private edge: BaseEdge
  ) {}

  execute(): void {
    this.dataManager.removeEdge(this.edge.id);
  }

  undo(): void {
    this.dataManager.addEdge(this.edge.getData());
  }

  redo(): void {
    this.execute();
  }
}

/**
 * 更新连接线命令
 */
export class UpdateEdgeCommand implements Command {
  name = '更新连接线';
  
  constructor(
    private dataManager: DataManager,
    private edgeId: string,
    private oldData: any,
    private newData: any
  ) {}

  execute(): void {
    this.dataManager.updateEdge(this.edgeId, this.newData);
  }

  undo(): void {
    this.dataManager.updateEdge(this.edgeId, this.oldData);
  }

  redo(): void {
    this.execute();
  }
}

/**
 * 批量命令
 */
export class BatchCommand implements Command {
  name = '批量操作';
  
  constructor(
    private commands: Command[],
    name?: string
  ) {
    if (name) {
      this.name = name;
    }
  }

  execute(): void {
    for (const command of this.commands) {
      command.execute();
    }
  }

  undo(): void {
    // 逆序执行撤销
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i]!.undo();
    }
  }

  redo(): void {
    this.execute();
  }
}

/**
 * 命令管理器类
 */
export class CommandManager extends SimpleEventEmitter implements EventEmitter {
  private history: Command[] = [];
  private currentIndex = -1;
  private maxHistorySize = 100;
  private isExecuting = false;

  constructor() {
    super();
  }

  /**
   * 执行命令
   */
  executeCommand(command: Command): void {
    if (this.isExecuting) {
      return;
    }

    this.isExecuting = true;

    try {
      command.execute();
      
      // 如果当前不在历史记录的末尾，删除后面的记录
      if (this.currentIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.currentIndex + 1);
      }
      
      // 添加新命令
      this.history.push(command);
      this.currentIndex++;
      
      // 限制历史记录大小
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }
      
      this.emitHistoryChange();
      // 发射执行事件（用于状态提示等）
      this.emit(EventType.HISTORY_EXECUTE, command);
      
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    this.isExecuting = true;

    try {
      const command = this.history[this.currentIndex]!;
      command.undo();
      this.currentIndex--;
      
      this.emit(EventType.HISTORY_UNDO, command);
      this.emitHistoryChange();
      
      return true;
      
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }

    this.isExecuting = true;

    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex]!;
      command.redo();
      
      this.emit(EventType.HISTORY_REDO, command);
      this.emitHistoryChange();
      
      return true;
      
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.emitHistoryChange();
  }

  /**
   * 获取历史记录
   */
  getHistory(): Command[] {
    return [...this.history];
  }

  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * 设置最大历史记录大小
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);
    
    // 如果当前历史记录超过新的大小限制，删除最旧的记录
    if (this.history.length > this.maxHistorySize) {
      const removeCount = this.history.length - this.maxHistorySize;
      this.history.splice(0, removeCount);
      this.currentIndex = Math.max(-1, this.currentIndex - removeCount);
    }
  }

  /**
   * 获取最大历史记录大小
   */
  getMaxHistorySize(): number {
    return this.maxHistorySize;
  }

  /**
   * 创建批量命令
   */
  createBatchCommand(commands: Command[], name?: string): BatchCommand {
    return new BatchCommand(commands, name);
  }

  /**
   * 执行批量命令
   */
  executeBatch(commands: Command[], name?: string): void {
    if (commands.length === 0) {
      return;
    }

    if (commands.length === 1) {
      this.executeCommand(commands[0]!);
    } else {
      const batchCommand = this.createBatchCommand(commands, name);
      this.executeCommand(batchCommand);
    }
  }

  /**
   * 发射历史变更事件
   */
  private emitHistoryChange(): void {
    this.emit(EventType.HISTORY_CHANGE, {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      historyLength: this.history.length
    });
  }

  /**
   * 销毁命令管理器
   */
  destroy(): void {
    this.clearHistory();
    this.removeAllListeners();
  }
}
