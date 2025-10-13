/**
 * @ldesign/i18n - Edge Computing Accelerator
 * 边缘计算翻译加速：CDN加速、Service Worker、P2P共享
 */

import type { I18nPlugin, I18nInstance, Locale, Messages } from '../types';

/**
 * 边缘节点配置
 */
export interface EdgeNodeConfig {
  url: string;
  region: string;
  priority: number;
  latency?: number;
  bandwidth?: number;
  reliability?: number;
}

/**
 * P2P配置
 */
export interface P2PConfig {
  enabled?: boolean;
  signalServer?: string;
  maxPeers?: number;
  shareRatio?: number;
  encryption?: boolean;
}

/**
 * Service Worker配置
 */
export interface ServiceWorkerConfig {
  enabled?: boolean;
  scope?: string;
  updateInterval?: number;
  cacheStrategy?: 'cache-first' | 'network-first' | 'fastest';
  prefetchKeys?: string[];
}

/**
 * CDN提供商配置
 */
export interface CDNProvider {
  name: string;
  baseUrl: string;
  regions: string[];
  headers?: Record<string, string>;
  transform?: (url: string) => string;
}

/**
 * 边缘计算配置
 */
export interface EdgeComputingConfig {
  cdn?: {
    providers?: CDNProvider[];
    autoSelect?: boolean;
    testLatency?: boolean;
    fallbackToOrigin?: boolean;
  };
  serviceWorker?: ServiceWorkerConfig;
  p2p?: P2PConfig;
  edgeNodes?: EdgeNodeConfig[];
  compression?: boolean;
  encryption?: boolean;
}

/**
 * CDN管理器
 */
class CDNManager {
  private providers: CDNProvider[] = [];
  private currentProvider?: CDNProvider;
  private latencyMap: Map<string, number> = new Map();
  
  constructor(providers: CDNProvider[] = []) {
    this.providers = providers;
    this.initializeDefaultProviders();
  }
  
  /**
   * 初始化默认CDN提供商
   */
  private initializeDefaultProviders(): void {
    const defaults: CDNProvider[] = [
      {
        name: 'cloudflare',
        baseUrl: 'https://cdn.cloudflare.com',
        regions: ['global'],
        transform: (url) => `${this.baseUrl}/i18n/${url}`
      },
      {
        name: 'fastly',
        baseUrl: 'https://cdn.fastly.net',
        regions: ['us', 'eu', 'asia'],
        transform: (url) => `${this.baseUrl}/translations/${url}`
      },
      {
        name: 'akamai',
        baseUrl: 'https://cdn.akamai.com',
        regions: ['global'],
        transform: (url) => `${this.baseUrl}/locale/${url}`
      }
    ];
    
    this.providers.push(...defaults.filter(d => 
      !this.providers.find(p => p.name === d.name)
    ));
  }
  
  /**
   * 测试CDN延迟
   */
  async testLatency(provider: CDNProvider): Promise<number> {
    const testUrl = `${provider.baseUrl}/ping`;
    const start = performance.now();
    
    try {
      await fetch(testUrl, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const latency = performance.now() - start;
      this.latencyMap.set(provider.name, latency);
      return latency;
    } catch (error) {
      return Infinity;
    }
  }
  
  /**
   * 自动选择最佳CDN
   */
  async selectBestProvider(): Promise<CDNProvider | null> {
    if (this.providers.length === 0) return null;
    
    const tests = await Promise.all(
      this.providers.map(async provider => ({
        provider,
        latency: await this.testLatency(provider)
      }))
    );
    
    tests.sort((a, b) => a.latency - b.latency);
    
    if (tests[0].latency < Infinity) {
      this.currentProvider = tests[0].provider;
      console.log(`[CDNManager] Selected ${this.currentProvider.name} (${tests[0].latency.toFixed(2)}ms)`);
      return this.currentProvider;
    }
    
    return null;
  }
  
  /**
   * 获取CDN URL
   */
  getCDNUrl(resource: string): string {
    if (!this.currentProvider) {
      return resource;
    }
    
    if (this.currentProvider.transform) {
      return this.currentProvider.transform(resource);
    }
    
    return `${this.currentProvider.baseUrl}/${resource}`;
  }
  
  /**
   * 从CDN加载资源
   */
  async loadFromCDN(locale: Locale): Promise<Messages | null> {
    if (!this.currentProvider) {
      await this.selectBestProvider();
    }
    
    if (!this.currentProvider) {
      return null;
    }
    
    const url = this.getCDNUrl(`${locale}.json`);
    
    try {
      const response = await fetch(url, {
        headers: this.currentProvider.headers || {},
        cache: 'default'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`[CDNManager] Failed to load from CDN:`, error);
      
      // 尝试其他CDN
      const otherProviders = this.providers.filter(p => p !== this.currentProvider);
      for (const provider of otherProviders) {
        this.currentProvider = provider;
        const result = await this.loadFromCDN(locale);
        if (result) return result;
      }
      
      return null;
    }
  }
}

/**
 * Service Worker管理器
 */
class ServiceWorkerManager {
  private registration?: ServiceWorkerRegistration;
  private config: ServiceWorkerConfig;
  private messageChannel?: MessageChannel;
  
  constructor(config: ServiceWorkerConfig = {}) {
    this.config = {
      enabled: true,
      scope: '/',
      updateInterval: 3600000, // 1 hour
      cacheStrategy: 'cache-first',
      prefetchKeys: [],
      ...config
    };
  }
  
  /**
   * 注册Service Worker
   */
  async register(): Promise<void> {
    if (!('serviceWorker' in navigator) || !this.config.enabled) {
      return;
    }
    
    const swCode = this.generateServiceWorkerCode();
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);
    
    try {
      this.registration = await navigator.serviceWorker.register(swUrl, {
        scope: this.config.scope
      });
      
      console.log('[ServiceWorkerManager] Registered successfully');
      
      // 设置更新定时器
      if (this.config.updateInterval) {
        setInterval(() => {
          this.registration?.update();
        }, this.config.updateInterval);
      }
      
      // 设置消息通道
      this.setupMessageChannel();
      
      // 预取资源
      if (this.config.prefetchKeys?.length) {
        this.prefetchResources();
      }
    } catch (error) {
      console.error('[ServiceWorkerManager] Registration failed:', error);
    }
  }
  
  /**
   * 生成Service Worker代码
   */
  private generateServiceWorkerCode(): string {
    return `
      const CACHE_NAME = 'i18n-edge-v1';
      const CACHE_STRATEGY = '${this.config.cacheStrategy}';
      const PREFETCH_KEYS = ${JSON.stringify(this.config.prefetchKeys)};
      
      // 缓存策略实现
      const strategies = {
        'cache-first': async (request) => {
          const cached = await caches.match(request);
          if (cached) return cached;
          
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
          }
          return response;
        },
        
        'network-first': async (request) => {
          try {
            const response = await fetch(request);
            if (response.ok) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(request, response.clone());
            }
            return response;
          } catch (error) {
            return caches.match(request) || new Response('{}', {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        },
        
        'fastest': async (request) => {
          const promises = [
            caches.match(request),
            fetch(request).catch(() => null)
          ];
          
          const results = await Promise.race(promises);
          if (results) {
            if (results.ok && !results.headers.get('x-from-cache')) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(request, results.clone());
            }
            return results;
          }
          
          return new Response('{}', {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      };
      
      self.addEventListener('install', event => {
        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => {
            if (PREFETCH_KEYS.length > 0) {
              return cache.addAll(PREFETCH_KEYS.map(key => '/i18n/' + key));
            }
          })
        );
        self.skipWaiting();
      });
      
      self.addEventListener('activate', event => {
        event.waitUntil(
          caches.keys().then(names => {
            return Promise.all(
              names
                .filter(name => name !== CACHE_NAME)
                .map(name => caches.delete(name))
            );
          })
        );
        self.clients.claim();
      });
      
      self.addEventListener('fetch', event => {
        const { request } = event;
        
        // 只处理i18n相关请求
        if (!request.url.includes('i18n') && !request.url.includes('locale')) {
          return;
        }
        
        const strategy = strategies[CACHE_STRATEGY] || strategies['cache-first'];
        event.respondWith(strategy(request));
      });
      
      // 处理消息
      self.addEventListener('message', event => {
        if (event.data.type === 'PREFETCH') {
          const urls = event.data.urls;
          caches.open(CACHE_NAME).then(cache => {
            cache.addAll(urls);
          });
        }
        
        if (event.data.type === 'CLEAR_CACHE') {
          caches.delete(CACHE_NAME);
        }
      });
    `;
  }
  
  /**
   * 设置消息通道
   */
  private setupMessageChannel(): void {
    this.messageChannel = new MessageChannel();
    
    if (this.registration?.active) {
      this.registration.active.postMessage({ type: 'INIT' }, [this.messageChannel.port2]);
    }
  }
  
  /**
   * 预取资源
   */
  private prefetchResources(): void {
    if (!this.registration?.active || !this.config.prefetchKeys?.length) {
      return;
    }
    
    this.registration.active.postMessage({
      type: 'PREFETCH',
      urls: this.config.prefetchKeys.map(key => `/i18n/${key}.json`)
    });
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    if (this.registration?.active) {
      this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  }
}

/**
 * P2P管理器
 */
class P2PManager {
  private config: P2PConfig;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private sharedTranslations: Map<string, Messages> = new Map();
  private signalSocket?: WebSocket;
  
  constructor(config: P2PConfig = {}) {
    this.config = {
      enabled: true,
      signalServer: 'wss://signal.example.com',
      maxPeers: 10,
      shareRatio: 0.5,
      encryption: true,
      ...config
    };
  }
  
  /**
   * 初始化P2P网络
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) return;
    
    // 连接信号服务器
    await this.connectSignalServer();
    
    // 开始发现对等节点
    this.discoverPeers();
  }
  
  /**
   * 连接信号服务器
   */
  private async connectSignalServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.signalSocket = new WebSocket(this.config.signalServer!);
        
        this.signalSocket.onopen = () => {
          console.log('[P2PManager] Connected to signal server');
          this.signalSocket!.send(JSON.stringify({
            type: 'join',
            room: 'i18n-translations'
          }));
          resolve();
        };
        
        this.signalSocket.onmessage = async (event) => {
          const message = JSON.parse(event.data);
          await this.handleSignalMessage(message);
        };
        
        this.signalSocket.onerror = reject;
      } catch (error) {
        console.error('[P2PManager] Failed to connect to signal server:', error);
        reject(error);
      }
    });
  }
  
  /**
   * 处理信号消息
   */
  private async handleSignalMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'peer':
        await this.connectToPeer(message.peerId);
        break;
      case 'offer':
        await this.handleOffer(message);
        break;
      case 'answer':
        await this.handleAnswer(message);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
    }
  }
  
  /**
   * 发现对等节点
   */
  private discoverPeers(): void {
    if (this.signalSocket?.readyState === WebSocket.OPEN) {
      this.signalSocket.send(JSON.stringify({
        type: 'discover'
      }));
    }
    
    // 定期发现新节点
    setInterval(() => this.discoverPeers(), 30000);
  }
  
  /**
   * 连接到对等节点
   */
  private async connectToPeer(peerId: string): Promise<void> {
    if (this.peers.has(peerId) || this.peers.size >= this.config.maxPeers!) {
      return;
    }
    
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    this.peers.set(peerId, pc);
    
    // 创建数据通道
    const channel = pc.createDataChannel('translations', {
      ordered: true
    });
    
    channel.onopen = () => {
      console.log(`[P2PManager] Connected to peer ${peerId}`);
      this.dataChannels.set(peerId, channel);
    };
    
    channel.onmessage = (event) => {
      this.handlePeerMessage(peerId, event.data);
    };
    
    // 创建offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    // 发送offer
    this.signalSocket?.send(JSON.stringify({
      type: 'offer',
      to: peerId,
      offer: offer
    }));
  }
  
  /**
   * 处理对等节点消息
   */
  private handlePeerMessage(peerId: string, data: string): void {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'request') {
        // 响应翻译请求
        this.handleTranslationRequest(peerId, message);
      } else if (message.type === 'response') {
        // 接收翻译响应
        this.handleTranslationResponse(message);
      } else if (message.type === 'announce') {
        // 处理翻译公告
        this.handleTranslationAnnounce(peerId, message);
      }
    } catch (error) {
      console.error('[P2PManager] Failed to handle peer message:', error);
    }
  }
  
  /**
   * 处理翻译请求
   */
  private handleTranslationRequest(peerId: string, request: any): void {
    const key = `${request.locale}:${request.key}`;
    const translation = this.sharedTranslations.get(key);
    
    if (translation) {
      const channel = this.dataChannels.get(peerId);
      if (channel?.readyState === 'open') {
        channel.send(JSON.stringify({
          type: 'response',
          requestId: request.id,
          translation: translation
        }));
      }
    }
  }
  
  /**
   * 处理翻译响应
   */
  private handleTranslationResponse(response: any): void {
    // 缓存接收到的翻译
    const key = `${response.locale}:${response.key}`;
    this.sharedTranslations.set(key, response.translation);
  }
  
  /**
   * 处理翻译公告
   */
  private handleTranslationAnnounce(peerId: string, announce: any): void {
    console.log(`[P2PManager] Peer ${peerId} announced ${announce.keys.length} translations`);
  }
  
  /**
   * 处理offer
   */
  private async handleOffer(message: any): Promise<void> {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    
    this.peers.set(message.from, pc);
    
    pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onopen = () => {
        this.dataChannels.set(message.from, channel);
      };
      channel.onmessage = (event) => {
        this.handlePeerMessage(message.from, event.data);
      };
    };
    
    await pc.setRemoteDescription(message.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    this.signalSocket?.send(JSON.stringify({
      type: 'answer',
      to: message.from,
      answer: answer
    }));
  }
  
  /**
   * 处理answer
   */
  private async handleAnswer(message: any): Promise<void> {
    const pc = this.peers.get(message.from);
    if (pc) {
      await pc.setRemoteDescription(message.answer);
    }
  }
  
  /**
   * 处理ICE候选
   */
  private async handleIceCandidate(message: any): Promise<void> {
    const pc = this.peers.get(message.from);
    if (pc) {
      await pc.addIceCandidate(message.candidate);
    }
  }
  
  /**
   * 请求翻译
   */
  async requestTranslation(locale: Locale, key: string): Promise<Messages | null> {
    const requestId = Math.random().toString(36).substr(2, 9);
    
    // 向所有对等节点广播请求
    for (const [peerId, channel] of this.dataChannels) {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify({
          type: 'request',
          id: requestId,
          locale: locale,
          key: key
        }));
      }
    }
    
    // 等待响应
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 1000);
      
      const checkResponse = () => {
        const cached = this.sharedTranslations.get(`${locale}:${key}`);
        if (cached) {
          clearTimeout(timeout);
          resolve(cached);
        } else {
          setTimeout(checkResponse, 100);
        }
      };
      
      checkResponse();
    });
  }
  
  /**
   * 共享翻译
   */
  shareTranslation(locale: Locale, key: string, translation: Messages): void {
    // 决定是否共享
    if (Math.random() > this.config.shareRatio!) {
      return;
    }
    
    const cacheKey = `${locale}:${key}`;
    this.sharedTranslations.set(cacheKey, translation);
    
    // 向对等节点公告
    for (const channel of this.dataChannels.values()) {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify({
          type: 'announce',
          keys: [cacheKey]
        }));
      }
    }
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    for (const channel of this.dataChannels.values()) {
      channel.close();
    }
    
    for (const pc of this.peers.values()) {
      pc.close();
    }
    
    this.signalSocket?.close();
    
    this.peers.clear();
    this.dataChannels.clear();
    this.sharedTranslations.clear();
  }
}

/**
 * 边缘计算加速器
 */
export class EdgeComputingAccelerator {
  private cdnManager: CDNManager;
  private swManager: ServiceWorkerManager;
  private p2pManager: P2PManager;
  private config: EdgeComputingConfig;
  private metricsCollector: Map<string, any> = new Map();
  
  constructor(config: EdgeComputingConfig = {}) {
    this.config = config;
    
    // 初始化CDN管理器
    this.cdnManager = new CDNManager(config.cdn?.providers);
    
    // 初始化Service Worker管理器
    this.swManager = new ServiceWorkerManager(config.serviceWorker);
    
    // 初始化P2P管理器
    this.p2pManager = new P2PManager(config.p2p);
  }
  
  /**
   * 初始化
   */
  async initialize(): Promise<void> {
    // 注册Service Worker
    await this.swManager.register();
    
    // 初始化P2P网络
    await this.p2pManager.initialize();
    
    // 选择最佳CDN
    if (this.config.cdn?.autoSelect) {
      await this.cdnManager.selectBestProvider();
    }
    
    console.log('[EdgeComputing] Initialized successfully');
  }
  
  /**
   * 加载翻译（使用最快的源）
   */
  async loadTranslation(locale: Locale): Promise<Messages | null> {
    const start = performance.now();
    
    // 并行尝试所有源
    const sources = [
      this.loadFromP2P(locale),
      this.loadFromCDN(locale),
      this.loadFromOrigin(locale)
    ];
    
    try {
      // 返回最快的结果
      const result = await Promise.race(sources.filter(Boolean));
      
      const loadTime = performance.now() - start;
      this.recordMetric('load_time', loadTime);
      
      return result;
    } catch (error) {
      console.error('[EdgeComputing] Failed to load translation:', error);
      return null;
    }
  }
  
  /**
   * 从P2P加载
   */
  private async loadFromP2P(locale: Locale): Promise<Messages | null> {
    if (!this.config.p2p?.enabled) return null;
    
    const start = performance.now();
    const result = await this.p2pManager.requestTranslation(locale, 'all');
    
    if (result) {
      this.recordMetric('p2p_hit', true);
      this.recordMetric('p2p_latency', performance.now() - start);
    }
    
    return result;
  }
  
  /**
   * 从CDN加载
   */
  private async loadFromCDN(locale: Locale): Promise<Messages | null> {
    if (!this.config.cdn) return null;
    
    const start = performance.now();
    const result = await this.cdnManager.loadFromCDN(locale);
    
    if (result) {
      this.recordMetric('cdn_hit', true);
      this.recordMetric('cdn_latency', performance.now() - start);
      
      // 共享到P2P网络
      if (this.config.p2p?.enabled) {
        this.p2pManager.shareTranslation(locale, 'all', result);
      }
    }
    
    return result;
  }
  
  /**
   * 从源站加载
   */
  private async loadFromOrigin(locale: Locale): Promise<Messages | null> {
    // 延迟一点，优先使用边缘节点
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const response = await fetch(`/api/i18n/${locale}.json`);
      if (!response.ok) return null;
      
      const result = await response.json();
      
      // 缓存到P2P
      if (this.config.p2p?.enabled && result) {
        this.p2pManager.shareTranslation(locale, 'all', result);
      }
      
      return result;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 记录指标
   */
  private recordMetric(name: string, value: any): void {
    const metrics = this.metricsCollector.get(name) || [];
    metrics.push({ value, timestamp: Date.now() });
    
    // 保留最近100条记录
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    this.metricsCollector.set(name, metrics);
  }
  
  /**
   * 获取性能指标
   */
  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [name, values] of this.metricsCollector) {
      if (values.length === 0) continue;
      
      if (typeof values[0].value === 'number') {
        const numbers = values.map((v: any) => v.value);
        metrics[name] = {
          avg: numbers.reduce((a: number, b: number) => a + b, 0) / numbers.length,
          min: Math.min(...numbers),
          max: Math.max(...numbers),
          count: numbers.length
        };
      } else {
        metrics[name] = values.length;
      }
    }
    
    return metrics;
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    this.swManager.clearCache();
    this.p2pManager.dispose();
    this.metricsCollector.clear();
  }
}

/**
 * 边缘计算插件
 */
export class EdgeComputingPlugin implements I18nPlugin {
  name = 'edge-computing';
  version = '1.0.0';
  
  private accelerator: EdgeComputingAccelerator;
  
  constructor(config?: EdgeComputingConfig) {
    this.accelerator = new EdgeComputingAccelerator(config);
  }
  
  async install(i18n: I18nInstance): Promise<void> {
    console.log('[EdgeComputing] Installing edge computing accelerator...');
    
    // 初始化加速器
    await this.accelerator.initialize();
    
    // 拦截翻译加载
    const originalLoad = i18n.loadMessages;
    if (originalLoad) {
      i18n.loadMessages = async (locale: Locale) => {
        // 先尝试从边缘加载
        const edgeResult = await this.accelerator.loadTranslation(locale);
        if (edgeResult) {
          i18n.addMessages(locale, edgeResult);
          return edgeResult;
        }
        
        // 回退到原始加载
        return originalLoad.call(i18n, locale);
      };
    }
    
    // 添加性能指标API
    (i18n as any).getEdgeMetrics = () => {
      return this.accelerator.getMetrics();
    };
    
    console.log('[EdgeComputing] Edge computing accelerator installed');
  }
  
  async uninstall(i18n: I18nInstance): Promise<void> {
    this.accelerator.dispose();
    delete (i18n as any).getEdgeMetrics;
    console.log('[EdgeComputing] Edge computing accelerator uninstalled');
  }
}

export default EdgeComputingPlugin;