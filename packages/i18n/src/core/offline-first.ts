/**
 * @ldesign/i18n - Offline First Support
 * 离线优先支持：Service Worker、缓存策略、后台同步
 */

import type { Locale, Messages } from '../types';

/**
 * 离线配置
 */
export interface OfflineConfig {
  enabled?: boolean;
  serviceWorkerPath?: string;
  cacheStrategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  cacheName?: string;
  maxAge?: number;
  maxEntries?: number;
  enableBackgroundSync?: boolean;
  syncInterval?: number;
  offlineFallback?: Messages;
  precache?: string[];
  runtimeCache?: RuntimeCacheConfig[];
  enableIndexedDB?: boolean;
  enableWebSQL?: boolean;
}

/**
 * 运行时缓存配置
 */
interface RuntimeCacheConfig {
  urlPattern: RegExp | string;
  handler: 'cacheFirst' | 'networkFirst' | 'networkOnly' | 'cacheOnly' | 'staleWhileRevalidate';
  options?: {
    cacheName?: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
  };
}

/**
 * 同步队列项
 */
interface SyncQueueItem {
  id: string;
  action: 'fetch' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

/**
 * 离线管理器
 */
export class OfflineManager {
  private readonly config: OfflineConfig;
  private serviceWorkerRegistration?: ServiceWorkerRegistration;
  private syncQueue: SyncQueueItem[] = [];
  private db?: IDBDatabase;
  private isOnline = navigator.onLine;
  private syncTimer?: NodeJS.Timeout;
  private cacheStorage?: Cache;
  private eventListeners: Array<{ target: EventTarget; event: string; handler: EventListener }> = [];
  private readonly MAX_SYNC_QUEUE_SIZE = 100;
  private swBlobUrl?: string; // 记录 blob URL 以便清理

  constructor(config: OfflineConfig = {}) {
    this.config = {
      enabled: true,
      serviceWorkerPath: '/sw.js',
      cacheStrategy: 'cache-first',
      cacheName: 'i18n-offline-v1',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      maxEntries: 100,
      enableBackgroundSync: true,
      syncInterval: 30000, // 30秒
      enableIndexedDB: true,
      ...config
    };

    if (this.config?.enabled) {
      this.initialize();
    }
  }

  /**
   * 初始化
   */
  private async initialize(): Promise<void> {
    // 注册Service Worker
    await this.registerServiceWorker();
    
    // 初始化IndexedDB
    if (this.config?.enableIndexedDB) {
      await this.initializeIndexedDB();
    }

    // 初始化缓存
    await this.initializeCache();

    // 监听网络状态
    this.setupNetworkListeners();

    // 启动后台同步
    if (this.config?.enableBackgroundSync) {
      this.startBackgroundSync();
    }
  }

  /**
   * 注册Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[OfflineManager] Service Worker not supported');
      return;
    }

    try {
      // 生成Service Worker代码
      const swCode = this.generateServiceWorkerCode();
      const blob = new Blob([swCode], { type: 'application/javascript' });
      
      // 清理旧的 blob URL
      if (this.swBlobUrl) {
        URL.revokeObjectURL(this.swBlobUrl);
      }
      
      this.swBlobUrl = URL.createObjectURL(blob);

      this.serviceWorkerRegistration = await navigator.serviceWorker.register(this.swBlobUrl, {
        scope: '/'
      });

      

      // 监听更新
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        
      });

      // 等待激活
      await navigator.serviceWorker.ready;
      
      // 设置消息监听
      this.setupMessageChannel();
    } catch (error) {
      console.error('[OfflineManager] Service Worker registration failed:', error);
    }
  }

  /**
   * 生成Service Worker代码
   */
  private generateServiceWorkerCode(): string {
    const config = this.config;
    
    return `
      const CACHE_NAME = '${config.cacheName}';
      const MAX_AGE = ${config.maxAge};
      const MAX_ENTRIES = ${config.maxEntries};
      
      // 预缓存资源
      const PRECACHE_URLS = ${JSON.stringify(config.precache || [])};
      
      // 安装事件
      self.addEventListener('install', event => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
        );
      });
      
      // 激活事件
      self.addEventListener('activate', event => {
        event.waitUntil(
          caches.keys()
            .then(cacheNames => {
              return Promise.all(
                cacheNames
                  .filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
              );
            })
            .then(() => self.clients.claim())
        );
      });
      
      // 获取事件
      self.addEventListener('fetch', event => {
        const { request } = event;
        
        // 只处理i18n相关请求
        if (!request.url.includes('i18n') && !request.url.includes('locale')) {
          return;
        }
        
        // 根据策略处理
        const strategy = '${config.cacheStrategy}';
        
        switch (strategy) {
          case 'cache-first':
            event.respondWith(cacheFirst(request));
            break;
          case 'network-first':
            event.respondWith(networkFirst(request));
            break;
          case 'stale-while-revalidate':
            event.respondWith(staleWhileRevalidate(request));
            break;
        }
      });
      
      // 缓存优先策略
      async function cacheFirst(request) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached && !isExpired(cached)) {
          return cached;
        }
        
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          if (cached) {
            return cached;
          }
          throw error;
        }
      }
      
      // 网络优先策略
      async function networkFirst(request) {
        const cache = await caches.open(CACHE_NAME);
        
        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await cache.match(request);
          if (cached) {
            return cached;
          }
          throw error;
        }
      }
      
      // 过期重验证策略
      async function staleWhileRevalidate(request) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        });
        
        return cached || fetchPromise;
      }
      
      // 检查是否过期
      function isExpired(response) {
        const date = response.headers.get('date');
        if (!date) return false;
        
        const age = Date.now() - new Date(date).getTime();
        return age > MAX_AGE;
      }
      
      // 后台同步
      self.addEventListener('sync', event => {
        if (event.tag === 'i18n-sync') {
          event.waitUntil(syncData());
        }
      });
      
      // 同步数据
      async function syncData() {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        
        for (const request of requests) {
          try {
            const response = await fetch(request);
            if (response.ok) {
              await cache.put(request, response);
            }
          } catch (error) {
            console.error('Sync failed for', request.url);
          }
        }
      }
      
      // 消息处理
      self.addEventListener('message', event => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'SKIP_WAITING':
            self.skipWaiting();
            break;
          case 'CLEAR_CACHE':
            caches.delete(CACHE_NAME);
            break;
          case 'CACHE_URLS':
            cacheUrls(data.urls);
            break;
        }
      });
      
      // 缓存URLs
      async function cacheUrls(urls) {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urls);
      }
    `;
  }

  /**
   * 初始化IndexedDB
   */
  private async initializeIndexedDB(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('[OfflineManager] IndexedDB not supported');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('i18n-offline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建对象存储
        if (!db.objectStoreNames.contains('translations')) {
          const store = db.createObjectStore('translations', { keyPath: 'id' });
          store.createIndex('locale', 'locale', { unique: false });
          store.createIndex('namespace', 'namespace', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 初始化缓存
   */
  private async initializeCache(): Promise<void> {
    if ('caches' in window) {
      this.cacheStorage = await caches.open(this.config?.cacheName!);
    }
  }

  /**
   * 设置网络监听器
   */
  private setupNetworkListeners(): void {
    const onlineHandler = () => {
      this.isOnline = true;
      this.syncPendingData();
    };
    
    const offlineHandler = () => {
      this.isOnline = false;
    };
    
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);
    
    // 记录事件监听器
    this.eventListeners.push(
      { target: window, event: 'online', handler: onlineHandler },
      { target: window, event: 'offline', handler: offlineHandler }
    );
  }

  /**
   * 设置消息通道
   */
  private setupMessageChannel(): void {
    const messageHandler = (event: MessageEvent) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'CACHE_UPDATED':
          // 处理缓存更新
          break;
        case 'SYNC_COMPLETE':
          // 处理同步完成
          break;
      }
    };
    
    navigator.serviceWorker.addEventListener('message', messageHandler);
    
    // 记录事件监听器
    this.eventListeners.push({
      target: navigator.serviceWorker,
      event: 'message',
      handler: messageHandler as EventListener
    });
  }

  /**
   * 保存到离线存储
   */
  async saveOffline(locale: Locale, namespace: string, messages: Messages): Promise<void> {
    const id = `${locale}:${namespace}`;
    const data = {
      id,
      locale,
      namespace,
      messages,
      timestamp: Date.now()
    };

    // 保存到IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['translations'], 'readwrite');
      const store = transaction.objectStore('translations');
      await this.promisifyRequest(store.put(data));
    }

    // 保存到Cache API
    if (this.cacheStorage) {
      const response = new Response(JSON.stringify(messages), {
        headers: {
          'Content-Type': 'application/json',
          'Date': new Date().toISOString()
        }
      });
      await this.cacheStorage.put(new Request(`/i18n/${locale}/${namespace}.json`), response);
    }

    // 保存到localStorage作为备份
    try {
      localStorage.setItem(`i18n:${id}`, JSON.stringify(data));
    } catch (e) {
      console.warn('[OfflineManager] localStorage save failed:', e);
    }
  }

  /**
   * 从离线存储加载
   */
  async loadOffline(locale: Locale, namespace: string): Promise<Messages | null> {
    const id = `${locale}:${namespace}`;

    // 尝试从IndexedDB加载
    if (this.db) {
      try {
        const transaction = this.db.transaction(['translations'], 'readonly');
        const store = transaction.objectStore('translations');
        const data = await this.promisifyRequest(store.get(id));
        
        if (data && !this.isExpired(data.timestamp)) {
          return data.messages;
        }
      } catch (e) {
        console.warn('[OfflineManager] IndexedDB load failed:', e);
      }
    }

    // 尝试从Cache API加载
    if (this.cacheStorage) {
      try {
        const response = await this.cacheStorage.match(`/i18n/${locale}/${namespace}.json`);
        if (response) {
          return await response.json();
        }
      } catch (e) {
        console.warn('[OfflineManager] Cache API load failed:', e);
      }
    }

    // 尝试从localStorage加载
    try {
      const stored = localStorage.getItem(`i18n:${id}`);
      if (stored) {
        const data = JSON.parse(stored);
        if (!this.isExpired(data.timestamp)) {
          return data.messages;
        }
      }
    } catch (e) {
      console.warn('[OfflineManager] localStorage load failed:', e);
    }

    return null;
  }

  /**
   * 添加到同步队列
   */
  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): void {
    // 限制同步队列大小
    if (this.syncQueue.length >= this.MAX_SYNC_QUEUE_SIZE) {
      this.syncQueue.shift(); // 移除最旧的项
    }
    
    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.push(syncItem);

    // 保存到IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      store.add(syncItem);
    }

    // 如果在线，立即同步
    if (this.isOnline) {
      this.syncPendingData();
    }
  }

  /**
   * 启动后台同步
   */
  private startBackgroundSync(): void {
    // 注册后台同步
    if (this.serviceWorkerRegistration && 'sync' in this.serviceWorkerRegistration) {
      (this.serviceWorkerRegistration as any).sync.register('i18n-sync').catch((err: any) => {
        console.warn('[OfflineManager] Background sync registration failed:', err);
      });
    }

    // 定期同步
    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingData();
      }
    }, this.config?.syncInterval!);
  }

  /**
   * 同步待处理数据
   */
  private async syncPendingData(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    

    const completed: string[] = [];

    for (const item of this.syncQueue) {
      try {
        await this.processSyncItem(item);
        completed.push(item.id);
      } catch (error) {
        item.retries++;
        if (item.retries > 3) {
          console.error('[OfflineManager] Sync failed after 3 retries:', item);
          completed.push(item.id);
        }
      }
    }

    // 移除已完成的项
    this.syncQueue = this.syncQueue.filter(item => !completed.includes(item.id));

    // 更新IndexedDB
    if (this.db && completed.length > 0) {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      for (const id of completed) {
        store.delete(id);
      }
    }
  }

  /**
   * 处理同步项
   */
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    // 这里应该实现实际的同步逻辑
    
    
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * 清理过期缓存
   */
  async clearExpiredCache(): Promise<void> {
    const now = Date.now();

    // 清理IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['translations'], 'readwrite');
      const store = transaction.objectStore('translations');
      const index = store.index('timestamp');
      
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          const value: any = cursor.value;
          if (this.isExpired(value.timestamp)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }

    // 清理localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('i18n:')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data = JSON.parse(stored);
            if (this.isExpired(data.timestamp)) {
              keysToRemove.push(key);
            }
          }
        } catch (e) {
          if (key) keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * 检查是否过期
   */
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.config?.maxAge!;
  }

  /**
   * Promise化IndexedDB请求
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取离线统计
   */
  getOfflineStats(): {
    isOnline: boolean;
    cacheSize: number;
    syncQueueLength: number;
    lastSync: Date | null;
  } {
    return {
      isOnline: this.isOnline,
      cacheSize: 0, // 需要实现计算逻辑
      syncQueueLength: this.syncQueue.length,
      lastSync: null // 需要记录
    };
  }

  /**
   * 销毁
   */
  async destroy(): Promise<void> {
    // 清理事件监听器
    this.eventListeners.forEach(({ target, event, handler }) => {
      target.removeEventListener(event, handler);
    });
    this.eventListeners = [];
    
    // 注销Service Worker
    if (this.serviceWorkerRegistration) {
      await this.serviceWorkerRegistration.unregister();
      this.serviceWorkerRegistration = undefined;
    }
    
    // 清理 blob URL
    if (this.swBlobUrl) {
      URL.revokeObjectURL(this.swBlobUrl);
      this.swBlobUrl = undefined;
    }

    // 关闭数据库
    if (this.db) {
      this.db.close();
      this.db = undefined;
    }

    // 清理定时器
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    // 清理缓存
    if ('caches' in window && this.config?.cacheName) {
      await caches.delete(this.config.cacheName);
    }
    
    // 清理同步队列
    this.syncQueue = [];
  }
}

/**
 * 创建离线管理器
 */
export function createOfflineManager(config?: OfflineConfig): OfflineManager {
  return new OfflineManager(config);
}