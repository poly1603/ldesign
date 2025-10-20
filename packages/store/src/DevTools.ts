/**
 * Developer Tools and Debugging Suite
 * 提供可视化调试、状态检查和开发工具集成
 */

import { EventEmitter } from './utils/event-emitter'

// ============= DevTools Types =============
interface StoreSnapshot {
  id: string;
  timestamp: number;
  state: any;
  computed: Record<string, any>;
  metadata: {
    actionName?: string;
    actionArgs?: any[];
    duration?: number;
    error?: Error;
  };
}

interface DevToolsConfig {
  name?: string;
  maxHistory?: number;
  logActions?: boolean;
  logState?: boolean;
  enableTimeTravel?: boolean;
  enableHotReload?: boolean;
  port?: number;
}

interface StoreInspection {
  state: any;
  computed: Record<string, any>;
  actions: string[];
  watchers: Array<{ path: string; callback: string }>;
  subscribers: number;
  history: StoreSnapshot[];
}

// ============= DevTools Connection =============
export class DevToolsConnection extends EventEmitter {
  private ws?: WebSocket | any;
  private reconnectTimer?: NodeJS.Timeout;
  private isConnected = false;
  private messageQueue: any[] = [];

  constructor(private port = 8089) {
    super();
    this.connect();
  }

  private async connect(): Promise<void> {
    if (typeof WebSocket === 'undefined') {
      // Node.js environment - try to import ws
      try {
        const { default: WS } = await import('ws');
        this.ws = new WS(`ws://localhost:${this.port}/devtools`);
      } catch {
        console.warn('WebSocket not available, DevTools connection disabled');
        return;
      }
    } else {
      // Browser environment
      this.ws = new WebSocket(`ws://localhost:${this.port}/devtools`);
    }

    if (this.ws) {
      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit('connected');
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event: any) => {
        const message = JSON.parse(event.data);
        this.emit('message', message);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error: any) => {
        console.error('DevTools connection error:', error);
        this.emit('error', error);
      };
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
    }, 3000);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  send(message: any): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}

// ============= Store DevTools =============
export class StoreDevTools extends EventEmitter {
  private stores = new Map<string, any>();
  private history = new Map<string, StoreSnapshot[]>();
  private connection?: DevToolsConnection;
  private config: Required<DevToolsConfig>;
  private timeTravelIndex = new Map<string, number>();
  private watchers = new Map<string, Array<{ path: string; callback: string }>>();
  private subscribers = new Map<string, number>();

  constructor(config: DevToolsConfig = {}) {
    super();

    this.config = {
      name: config.name || 'LDesign Store',
      maxHistory: config.maxHistory || 50,
      logActions: config.logActions ?? true,
      logState: config.logState ?? false,
      enableTimeTravel: config.enableTimeTravel ?? true,
      enableHotReload: config.enableHotReload ?? true,
      port: config.port || 8089
    };

    if (this.config?.port) {
      this.setupConnection();
    }

    this.setupGlobalHooks();
  }

  // 设置连接
  private setupConnection(): void {
    this.connection = new DevToolsConnection(this.config?.port);

    this.connection.on('message', (message: any) => {
      this.handleDevToolsMessage(message);
    });

    this.connection.on('connected', () => {
      this.emit('devtools:connected');
      this.syncAllStores();
    });
  }

  // 设置全局钩子
  private setupGlobalHooks(): void {
    if (typeof window !== 'undefined') {
      (window as any).__LDESIGN_DEVTOOLS__ = this;
    }

    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__LDESIGN_DEVTOOLS__ = this;
    }
  }

  // 注册 Store
  registerStore(name: string, store: any): void {
    this.stores.set(name, store);
    this.history.set(name, []);
    this.timeTravelIndex.set(name, -1);
    this.watchers.set(name, []);
    this.subscribers.set(name, 0);

    // 拦截 actions
    this.interceptActions(name, store);

    // 监听状态变化
    this.watchStateChanges(name, store);

    // 追踪订阅者
    this.trackSubscribers(name, store);

    // 发送初始状态
    this.sendStoreUpdate(name, store);

    this.emit('store:registered', { name, store });
  }

  // 拦截 actions
  private interceptActions(storeName: string, store: any): void {
    const actions = store.actions || {};

    Object.keys(actions).forEach(actionName => {
      const originalAction = actions[actionName];

      actions[actionName] = (...args: any[]) => {
        const startTime = performance.now();

        if (this.config?.logActions) {
          console.group(`🎯 [${storeName}] ${actionName}`);
          console.log('Args:', args);
        }

        try {
          const result = originalAction.apply(store, args);

          const duration = performance.now() - startTime;

          if (this.config?.logActions) {
            console.log(`Duration: ${duration.toFixed(2)}ms`);
            console.groupEnd();
          }

          // 记录快照
          this.recordSnapshot(storeName, store, {
            actionName,
            actionArgs: args,
            duration
          });

          return result;
        } catch (error) {
          if (this.config?.logActions) {
            console.error('Error:', error);
            console.groupEnd();
          }

          // 记录错误快照
          this.recordSnapshot(storeName, store, {
            actionName,
            actionArgs: args,
            error: error as Error
          });

          throw error;
        }
      };
    });
  }

  // 监听状态变化
  private watchStateChanges(storeName: string, store: any): void {
    if (store.watch) {
      // 追踪根路径 watcher
      const watchersList = this.watchers.get(storeName) || [];
      watchersList.push({
        path: '*',
        callback: 'DevTools.watchStateChanges'
      });
      this.watchers.set(storeName, watchersList);

      store.watch('*', (newValue: any, oldValue: any, path: string) => {
        if (this.config?.logState) {
          console.log(`[${storeName}] State changed at ${path}:`, { oldValue, newValue });
        }

        this.sendStoreUpdate(storeName, store);
      });
    }

    // 拦截 watch 方法以追踪所有 watchers
    if (store.watch) {
      const originalWatch = store.watch.bind(store);
      store.watch = (path: string, callback: (...args: any[]) => any) => {
        const watchersList = this.watchers.get(storeName) || [];
        watchersList.push({
          path,
          callback: callback.name || 'anonymous'
        });
        this.watchers.set(storeName, watchersList);

        return originalWatch(path, callback);
      };
    }
  }

  // 追踪订阅者
  private trackSubscribers(storeName: string, store: any): void {
    // 拦截 $subscribe 方法以追踪订阅者数量
    if (store.$subscribe) {
      const original$Subscribe = store.$subscribe.bind(store);
      store.$subscribe = (callback: (...args: any[]) => any, options?: any) => {
        // 增加订阅者计数
        const currentCount = this.subscribers.get(storeName) || 0;
        this.subscribers.set(storeName, currentCount + 1);

        // 调用原始 $subscribe 方法
        const unsubscribe = original$Subscribe(callback, options);

        // 包装 unsubscribe 以在取消订阅时减少计数
        return () => {
          const count = this.subscribers.get(storeName) || 0;
          this.subscribers.set(storeName, Math.max(0, count - 1));
          unsubscribe();
        };
      };
    }

    // 拦截 $onAction 方法以追踪 action 订阅者
    if (store.$onAction) {
      const original$OnAction = store.$onAction.bind(store);
      store.$onAction = (callback: (...args: any[]) => any) => {
        // 增加订阅者计数
        const currentCount = this.subscribers.get(storeName) || 0;
        this.subscribers.set(storeName, currentCount + 1);

        // 调用原始 $onAction 方法
        const unsubscribe = original$OnAction(callback);

        // 包装 unsubscribe 以在取消订阅时减少计数
        return () => {
          const count = this.subscribers.get(storeName) || 0;
          this.subscribers.set(storeName, Math.max(0, count - 1));
          unsubscribe();
        };
      };
    }
  }

  // 记录快照
  private recordSnapshot(
    storeName: string,
    store: any,
    metadata: StoreSnapshot['metadata']
  ): void {
    if (!this.config?.enableTimeTravel) return;

    const snapshot: StoreSnapshot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      state: this.cloneState(store.state),
      computed: this.getComputedValues(store),
      metadata
    };

    const storeHistory = this.history.get(storeName) || [];
    storeHistory.push(snapshot);

    // 限制历史记录数量
    if (storeHistory.length > this.config?.maxHistory) {
      storeHistory.shift();
    }

    this.history.set(storeName, storeHistory);
    this.timeTravelIndex.set(storeName, storeHistory.length - 1);

    this.emit('snapshot:recorded', { storeName, snapshot });
    this.sendSnapshot(storeName, snapshot);
  }

  // 克隆状态
  private cloneState(state: any): any {
    try {
      return JSON.parse(JSON.stringify(state));
    } catch {
      // 处理循环引用
      const seen = new WeakSet();
      return JSON.parse(JSON.stringify(state, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }));
    }
  }

  // 获取计算属性值
  private getComputedValues(store: any): Record<string, any> {
    const computed: Record<string, any> = {};

    if (store.computed) {
      Object.keys(store.computed).forEach(key => {
        try {
          computed[key] = store[key];
        } catch (e: any) {
          computed[key] = `[Error: ${e?.message || 'Unknown error'}]`;
        }
      });
    }

    return computed;
  }

  // 时间旅行
  timeTravel(storeName: string, direction: 'forward' | 'backward' | number): void {
    if (!this.config?.enableTimeTravel) {
      console.warn('Time travel is disabled');
      return;
    }

    const store = this.stores.get(storeName);
    const storeHistory = this.history.get(storeName);

    if (!store || !storeHistory || storeHistory.length === 0) {
      console.warn(`No history for store: ${storeName}`);
      return;
    }

    let currentIndex = this.timeTravelIndex.get(storeName) || 0;

    if (typeof direction === 'number') {
      currentIndex = Math.max(0, Math.min(direction, storeHistory.length - 1));
    } else if (direction === 'forward') {
      currentIndex = Math.min(currentIndex + 1, storeHistory.length - 1);
    } else {
      currentIndex = Math.max(currentIndex - 1, 0);
    }

    this.timeTravelIndex.set(storeName, currentIndex);

    const snapshot = storeHistory[currentIndex];
    if (snapshot && store.setState) {
      store.setState(snapshot.state);

      this.emit('time:travel', {
        storeName,
        index: currentIndex,
        timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
        action: snapshot.metadata.actionName,
        state: snapshot.state
      });
    }
  }

  // 检查 Store
  inspect(storeName: string): StoreInspection | null {
    const store = this.stores.get(storeName);
    if (!store) return null;

    const storeHistory = this.history.get(storeName) || [];

    return {
      state: this.cloneState(store.state),
      computed: this.getComputedValues(store),
      actions: Object.keys(store.actions || {}),
      watchers: this.watchers.get(storeName) || [],
      subscribers: this.subscribers.get(storeName) || 0,
      history: storeHistory
    };
  }

  // 热重载
  hotReload(storeName: string, newModule: any): void {
    if (!this.config?.enableHotReload) {
      console.warn('Hot reload is disabled');
      return;
    }

    const store = this.stores.get(storeName);
    if (!store) {
      console.warn(`Store not found: ${storeName}`);
      return;
    }

    // 保存当前状态
    const currentState = this.cloneState(store.state);

    // 更新 actions
    if (newModule.actions) {
      Object.assign(store.actions, newModule.actions);
      this.interceptActions(storeName, store);
    }

    // 更新 computed
    if (newModule.computed) {
      Object.assign(store.computed, newModule.computed);
    }

    // 恢复状态
    if (store.setState) {
      store.setState(currentState);
    }

    this.sendStoreUpdate(storeName, store);
    this.emit('store:reloaded', { storeName, store });
  }

  // 处理 DevTools 消息
  private handleDevToolsMessage(message: any): void {
    switch (message.type) {
      case 'TIME_TRAVEL':
        this.timeTravel(message.storeName, message.index);
        break;

      case 'INSPECT': {
        const inspection = this.inspect(message.storeName);
        this.connection?.send({
          type: 'INSPECTION_RESULT',
          storeName: message.storeName,
          data: inspection
        });
        break;
      }

      case 'EXPORT_STATE':
        this.exportState(message.storeName);
        break;

      case 'IMPORT_STATE':
        this.importState(message.storeName, message.state);
        break;
    }
  }

  // 发送 Store 更新
  private sendStoreUpdate(storeName: string, store: any): void {
    if (!this.connection) return;

    this.connection.send({
      type: 'STORE_UPDATE',
      storeName,
      data: {
        state: this.cloneState(store.state),
        computed: this.getComputedValues(store)
      }
    });
  }

  // 发送快照
  private sendSnapshot(storeName: string, snapshot: StoreSnapshot): void {
    if (!this.connection) return;

    this.connection.send({
      type: 'SNAPSHOT',
      storeName,
      snapshot
    });
  }

  // 同步所有 Stores
  private syncAllStores(): void {
    this.stores.forEach((store, name) => {
      this.sendStoreUpdate(name, store);

      const storeHistory = this.history.get(name);
      if (storeHistory) {
        storeHistory.forEach(snapshot => {
          this.sendSnapshot(name, snapshot);
        });
      }
    });
  }

  // 导出状态
  exportState(storeName?: string): any {
    if (storeName) {
      const store = this.stores.get(storeName);
      return store ? this.cloneState(store.state) : null;
    }

    const allStates: Record<string, any> = {};
    this.stores.forEach((store, name) => {
      allStates[name] = this.cloneState(store.state);
    });

    return allStates;
  }

  // 导入状态
  importState(storeName: string, state: any): void {
    const store = this.stores.get(storeName);
    if (!store || !store.setState) {
      console.warn(`Cannot import state for store: ${storeName}`);
      return;
    }

    store.setState(state);
    this.emit('state:imported', { storeName, state });
  }

  // 清理
  destroy(): void {
    this.connection?.disconnect();
    this.stores.clear();
    this.history.clear();
    this.timeTravelIndex.clear();
    this.watchers.clear();
    this.subscribers.clear();
    this.removeAllListeners();
  }
}

// ============= Console Formatter =============
export class ConsoleFormatter {
  static setup(): void {
    if (typeof window === 'undefined') return;

    // 自定义 console 样式
    const styles = {
      store: 'color: #4CAF50; font-weight: bold',
      action: 'color: #2196F3',
      state: 'color: #FF9800',
      computed: 'color: #9C27B0',
      error: 'color: #F44336; font-weight: bold'
    };

    // Store 格式化
    (window as any).devtoolsFormatters = (window as any).devtoolsFormatters || [];
    (window as any).devtoolsFormatters.push({
      header(obj: any) {
        if (!obj || !obj.__isStore) return null;

        return ['div', { style: styles.store }, ['span', {}, '📦 '], ['span', { style: 'font-weight: normal' }, obj.name || 'Store']];
      },

      hasBody(obj: any) {
        return obj && obj.__isStore;
      },

      body(obj: any) {
        const elements = ['div', {}];

        // State
        elements.push(
          ['div', { style: styles.state }, ['span', {}, '🔸 State: '], ['object', { object: obj.state }]]
        );

        // Computed
        if (obj.computed) {
          const computedValues = Object.keys(obj.computed).reduce((acc, key) => {
            try {
              acc[key] = obj[key];
            } catch (e: any) {
              acc[key] = `[Error: ${e?.message || 'Unknown error'}]`;
            }
            return acc;
          }, {} as any);

          elements.push(
            ['div', { style: styles.computed }, ['span', {}, '🔹 Computed: '], ['object', { object: computedValues }]]
          );
        }

        // Actions
        if (obj.actions) {
          elements.push(
            ['div', { style: styles.action }, ['span', {}, '⚡ Actions: '], ['object', { object: Object.keys(obj.actions) }]]
          );
        }

        return elements;
      }
    });
  }
}

// ============= Visual Inspector =============
export class VisualInspector {
  private overlay?: HTMLDivElement;
  private isActive = false;

  activate(): void {
    if (typeof document === 'undefined' || this.isActive) return;

    this.isActive = true;
    this.createOverlay();
    this.setupEventListeners();
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.id = 'ldesign-inspector-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 99999;
      max-width: 400px;
      max-height: 500px;
      overflow: auto;
      display: none;
    `;

    document.body.appendChild(this.overlay);
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+I 激活/隐藏检查器
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        this.toggle();
      }
    });
  }

  toggle(): void {
    if (!this.overlay) return;

    if (this.overlay.style.display === 'none') {
      this.overlay.style.display = 'block';
      this.updateContent();
    } else {
      this.overlay.style.display = 'none';
    }
  }

  updateContent(): void {
    if (!this.overlay) return;

    const devtools = (window as any).__LDESIGN_DEVTOOLS__;
    if (!devtools) {
      this.overlay.innerHTML = '<div>DevTools not initialized</div>';
      return;
    }

    let html = '<h3 style="margin: 0 0 10px 0;">🔍 Store Inspector</h3>';

    devtools.stores.forEach((store: any, name: string) => {
      const inspection = devtools.inspect(name);
      if (!inspection) return;

      html += `
        <div style="margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 10px;">
          <h4 style="color: #4CAF50; margin: 5px 0;">${name}</h4>
          <div style="color: #FF9800;">State Keys: ${Object.keys(inspection.state).join(', ')}</div>
          <div style="color: #9C27B0;">Computed: ${Object.keys(inspection.computed).join(', ')}</div>
          <div style="color: #2196F3;">Actions: ${inspection.actions.join(', ')}</div>
          <div style="color: #999;">History: ${inspection.history.length} snapshots</div>
        </div>
      `;
    });

    this.overlay.innerHTML = html;
  }

  destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = undefined;
    this.isActive = false;
  }
}

// ============= 初始化 DevTools =============
let devToolsInstance: StoreDevTools | null = null;

export function initDevTools(config?: DevToolsConfig): StoreDevTools {
  if (!devToolsInstance) {
    devToolsInstance = new StoreDevTools(config);
    ConsoleFormatter.setup();

    // 开发环境自动激活可视检查器
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      const inspector = new VisualInspector();
      inspector.activate();
    }
  }

  return devToolsInstance;
}

export function getDevTools(): StoreDevTools | null {
  return devToolsInstance;
}
