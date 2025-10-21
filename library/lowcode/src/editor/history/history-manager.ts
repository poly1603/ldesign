/**
 * 历史记录管理器
 */

import type { LowcodeSchema, HistoryRecord } from '../../types';
import { deepClone, generateId } from '../../utils';

/**
 * 历史记录管理器类
 */
export class HistoryManager {
  private history: HistoryRecord[] = [];
  private currentIndex = -1;
  private maxHistory = 50;

  /**
   * 保存快照
   */
  push(schema: LowcodeSchema, description?: string): void {
    // 删除当前位置之后的历史
    this.history = this.history.slice(0, this.currentIndex + 1);

    // 创建新快照
    const record: HistoryRecord = {
      id: generateId('history'),
      type: 'batch',
      snapshot: deepClone(schema),
      timestamp: Date.now(),
      description
    };

    this.history.push(record);
    this.currentIndex++;

    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * 撤销
   */
  undo(): LowcodeSchema | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    return deepClone(this.history[this.currentIndex].snapshot);
  }

  /**
   * 重做
   */
  redo(): LowcodeSchema | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    return deepClone(this.history[this.currentIndex].snapshot);
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * 获取历史记录列表
   */
  getHistory(): HistoryRecord[] {
    return [...this.history];
  }

  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * 设置最大历史记录数
   */
  setMaxHistory(max: number): void {
    this.maxHistory = Math.max(1, max);

    // 如果当前历史超过最大值，删除旧记录
    if (this.history.length > this.maxHistory) {
      const excess = this.history.length - this.maxHistory;
      this.history.splice(0, excess);
      this.currentIndex = Math.max(0, this.currentIndex - excess);
    }
  }
}



