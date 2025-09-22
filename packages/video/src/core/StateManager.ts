/**
 * 状态管理器实现
 * 提供播放器状态的集中管理和状态转换控制
 */

import { PlayerState } from '../types';
import type { EventManager } from './EventManager';

/**
 * 状态转换映射
 * 定义哪些状态可以转换到哪些状态
 */
const STATE_TRANSITIONS: Record<PlayerState, PlayerState[]> = {
  [PlayerState.INITIAL]: [PlayerState.LOADING, PlayerState.ERROR, PlayerState.DESTROYED],
  [PlayerState.LOADING]: [PlayerState.READY, PlayerState.ERROR, PlayerState.DESTROYED],
  [PlayerState.READY]: [PlayerState.PLAYING, PlayerState.LOADING, PlayerState.ERROR, PlayerState.DESTROYED],
  [PlayerState.PLAYING]: [PlayerState.PAUSED, PlayerState.SEEKING, PlayerState.BUFFERING, PlayerState.ENDED, PlayerState.ERROR, PlayerState.DESTROYED],
  [PlayerState.PAUSED]: [PlayerState.PLAYING, PlayerState.SEEKING, PlayerState.ENDED, PlayerState.ERROR, PlayerState.DESTROYED],
  [PlayerState.SEEKING]: [PlayerState.PLAYING, PlayerState.PAUSED, PlayerState.BUFFERING, PlayerState.ERROR, PlayerState.DESTROYED],
  [PlayerState.BUFFERING]: [PlayerState.PLAYING, PlayerState.PAUSED, PlayerState.ERROR, PlayerState.DESTROYED],
  [PlayerState.ENDED]: [PlayerState.PLAYING, PlayerState.LOADING, PlayerState.ERROR, PlayerState.DESTROYED],
  [PlayerState.ERROR]: [PlayerState.LOADING, PlayerState.READY, PlayerState.DESTROYED],
  [PlayerState.DESTROYED]: [] // 终态，不能转换到其他状态
};

/**
 * 状态变化事件数据
 */
export interface StateChangeEvent {
  from: PlayerState;
  to: PlayerState;
  timestamp: number;
  reason?: string;
}

/**
 * 状态管理器选项
 */
export interface StateManagerOptions {
  initialState?: PlayerState;
  enableHistory?: boolean;
  maxHistorySize?: number;
  enableValidation?: boolean;
}

/**
 * 状态管理器实现
 */
export class StateManager {
  private currentState: PlayerState;
  private previousState: PlayerState | null;
  private stateHistory: StateChangeEvent[];
  private readonly eventManager: EventManager;
  private readonly options: Required<StateManagerOptions>;
  private readonly stateTimestamps: Map<PlayerState, number>;
  private readonly stateListeners: Map<PlayerState, Set<(event: StateChangeEvent) => void>>;

  constructor(eventManager: EventManager, options: StateManagerOptions = {}) {
    this.eventManager = eventManager;
    this.options = {
      initialState: PlayerState.INITIAL,
      enableHistory: true,
      maxHistorySize: 50,
      enableValidation: true,
      ...options
    };

    this.currentState = this.options.initialState;
    this.previousState = null;
    this.stateHistory = [];
    this.stateTimestamps = new Map();
    this.stateListeners = new Map();

    // 记录初始状态时间戳
    this.stateTimestamps.set(this.currentState, Date.now());
  }

  /**
   * 获取当前状态
   */
  get state(): PlayerState {
    return this.currentState;
  }

  /**
   * 获取上一个状态
   */
  get previous(): PlayerState | null {
    return this.previousState;
  }

  /**
   * 获取状态历史
   */
  get history(): readonly StateChangeEvent[] {
    return [...this.stateHistory];
  }

  /**
   * 检查是否可以转换到指定状态
   */
  canTransitionTo(state: PlayerState): boolean {
    if (!this.options.enableValidation) {
      return true;
    }

    const allowedStates = STATE_TRANSITIONS[this.currentState];
    return allowedStates.includes(state);
  }

  /**
   * 转换到指定状态
   */
  setState(newState: PlayerState, reason?: string): boolean {
    // 如果状态相同，不进行转换
    if (this.currentState === newState) {
      return true;
    }

    // 验证状态转换是否合法
    if (!this.canTransitionTo(newState)) {
      console.warn(
        `Invalid state transition from ${this.currentState} to ${newState}`
      );
      return false;
    }

    // 执行状态转换
    const previousState = this.currentState;
    this.previousState = previousState;
    this.currentState = newState;

    const timestamp = Date.now();
    this.stateTimestamps.set(newState, timestamp);

    // 创建状态变化事件
    const stateChangeEvent: StateChangeEvent = {
      from: previousState,
      to: newState,
      timestamp,
      reason
    };

    // 添加到历史记录
    if (this.options.enableHistory) {
      this.stateHistory.push(stateChangeEvent);
      
      // 限制历史记录大小
      if (this.stateHistory.length > this.options.maxHistorySize) {
        this.stateHistory.shift();
      }
    }

    // 触发状态监听器
    this.notifyStateListeners(stateChangeEvent);

    // 发射状态变化事件
    this.eventManager.emit('player:statechange' as any, stateChangeEvent);

    return true;
  }

  /**
   * 检查当前是否为指定状态
   */
  is(state: PlayerState): boolean {
    return this.currentState === state;
  }

  /**
   * 检查当前是否为指定状态之一
   */
  isOneOf(...states: PlayerState[]): boolean {
    return states.includes(this.currentState);
  }

  /**
   * 获取在指定状态的持续时间（毫秒）
   */
  getStateDuration(state?: PlayerState): number {
    const targetState = state || this.currentState;
    const timestamp = this.stateTimestamps.get(targetState);
    
    if (!timestamp) {
      return 0;
    }

    return Date.now() - timestamp;
  }

  /**
   * 获取当前状态的持续时间
   */
  getCurrentStateDuration(): number {
    return this.getStateDuration();
  }

  /**
   * 添加状态监听器
   */
  onState(state: PlayerState, listener: (event: StateChangeEvent) => void): void {
    if (!this.stateListeners.has(state)) {
      this.stateListeners.set(state, new Set());
    }
    this.stateListeners.get(state)!.add(listener);
  }

  /**
   * 移除状态监听器
   */
  offState(state: PlayerState, listener: (event: StateChangeEvent) => void): void {
    const listeners = this.stateListeners.get(state);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.stateListeners.delete(state);
      }
    }
  }

  /**
   * 等待状态转换到指定状态
   */
  waitForState(state: PlayerState, timeout?: number): Promise<StateChangeEvent> {
    return new Promise((resolve, reject) => {
      // 如果已经是目标状态，立即解决
      if (this.currentState === state) {
        resolve({
          from: this.previousState || this.currentState,
          to: state,
          timestamp: this.stateTimestamps.get(state) || Date.now()
        });
        return;
      }

      // 设置超时
      let timeoutId: NodeJS.Timeout | undefined;
      if (timeout) {
        timeoutId = setTimeout(() => {
          this.offState(state, listener);
          reject(new Error(`Timeout waiting for state ${state}`));
        }, timeout);
      }

      // 添加一次性监听器
      const listener = (event: StateChangeEvent) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.offState(state, listener);
        resolve(event);
      };

      this.onState(state, listener);
    });
  }

  /**
   * 重置状态管理器
   */
  reset(initialState: PlayerState = PlayerState.INITIAL): void {
    this.currentState = initialState;
    this.previousState = null;
    this.stateHistory.length = 0;
    this.stateTimestamps.clear();
    this.stateListeners.clear();
    this.stateTimestamps.set(initialState, Date.now());
  }

  /**
   * 获取状态统计信息
   */
  getStats() {
    const stateCounts: Record<string, number> = {};
    const stateDurations: Record<string, number> = {};

    // 统计状态出现次数
    for (const event of this.stateHistory) {
      stateCounts[event.to] = (stateCounts[event.to] || 0) + 1;
    }

    // 计算状态持续时间
    for (let i = 0; i < this.stateHistory.length; i++) {
      const current = this.stateHistory[i];
      const next = this.stateHistory[i + 1];
      
      const duration = next ? next.timestamp - current.timestamp : Date.now() - current.timestamp;
      stateDurations[current.to] = (stateDurations[current.to] || 0) + duration;
    }

    return {
      currentState: this.currentState,
      previousState: this.previousState,
      currentStateDuration: this.getCurrentStateDuration(),
      totalTransitions: this.stateHistory.length,
      stateCounts,
      stateDurations,
      historySize: this.stateHistory.length
    };
  }

  /**
   * 通知状态监听器
   */
  private notifyStateListeners(event: StateChangeEvent): void {
    const listeners = this.stateListeners.get(event.to);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      }
    }
  }
}

/**
 * 创建状态管理器实例
 */
export function createStateManager(
  eventManager: EventManager,
  options?: StateManagerOptions
): StateManager {
  return new StateManager(eventManager, options);
}
