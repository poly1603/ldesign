/**
 * 历史插件 - 撤销/重做功能
 */

import { Graph } from '../../core/Graph';
import { Plugin, HistoryConfig } from '../../types/plugin';
import { Command } from './Command';
import { GraphEvent } from '../../types/graph';

export class HistoryPlugin implements Plugin {
  name = 'HistoryPlugin';
  config: HistoryConfig;

  private graph: Graph | null = null;
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxStack: number;

  constructor(config: HistoryConfig = {}) {
    this.config = config;
    this.maxStack = config.maxStack || 50;
  }

  install(graph: Graph): void {
    this.graph = graph;

    // 监听图事件，记录命令
    // 这里需要根据具体的事件类型创建相应的命令
    // 由于时间关系，这里只提供基本框架
  }

  uninstall(): void {
    this.clear();
    this.graph = null;
  }

  /**
   * 执行命令并记录
   */
  execute(command: Command): void {
    command.execute();
    this.pushCommand(command);

    if (this.graph) {
      this.graph.emit(GraphEvent.HISTORY_CHANGE, {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      });
    }
  }

  /**
   * 添加命令到栈
   */
  private pushCommand(command: Command): void {
    this.undoStack.push(command);

    // 限制栈大小
    if (this.undoStack.length > this.maxStack) {
      this.undoStack.shift();
    }

    // 清空重做栈
    this.redoStack = [];
  }

  /**
   * 撤销
   */
  undo(): boolean {
    if (!this.canUndo()) return false;

    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);

    if (this.graph) {
      this.graph.emit(GraphEvent.HISTORY_CHANGE, {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      });
    }

    return true;
  }

  /**
   * 重做
   */
  redo(): boolean {
    if (!this.canRedo()) return false;

    const command = this.redoStack.pop()!;
    command.redo();
    this.undoStack.push(command);

    if (this.graph) {
      this.graph.emit(GraphEvent.HISTORY_CHANGE, {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      });
    }

    return true;
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];

    if (this.graph) {
      this.graph.emit(GraphEvent.HISTORY_CHANGE, {
        canUndo: false,
        canRedo: false,
      });
    }
  }

  /**
   * 获取历史信息
   */
  getHistory(): {
    undoStack: number;
    redoStack: number;
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      undoStack: this.undoStack.length,
      redoStack: this.redoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }
}


