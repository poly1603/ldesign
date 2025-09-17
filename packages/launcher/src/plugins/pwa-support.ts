/**
 * PWA 支持插件
 * 
 * 自动生成 PWA 所需的文件和配置
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import { Logger } from '../utils/logger'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface PWASupportOptions {
  /** 应用名称 */
  appName?: string
  /** 应用短名称 */
  shortName?: string
  /** 应用描述 */
  description?: string
  /** 主题颜色 */
  themeColor?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 显示模式 */
  display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser'
  /** 启动 URL */
  startUrl?: string
  /** 图标目录 */
  iconsDir?: string
  /** 输出目录 */
  outputDir?: string
  /** 是否生成 Service Worker */
  generateSW?: boolean
  /** 缓存策略 */
  cacheStrategy?: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate'
  /** 离线页面 */
  offlinePage?: string
  /** 是否启用推送通知 */
  enableNotifications?: boolean
  /** 应用类别 */
  categories?: string[]
}

export interface PWAManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: string
  theme_color: string
  background_color: string
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose?: string
  }>
  categories?: string[]
}

export class PWASupport {
  private logger: Logger
  private options: Required<Omit<PWASupportOptions, 'categories' | 'offlinePage'>> & 
    Pick<PWASupportOptions, 'categories' | 'offlinePage'>

  constructor(options: PWASupportOptions = {}) {
    this.logger = new Logger('PWASupport')
    this.options = {
      appName: 'My App',
      shortName: 'MyApp',
      description: 'A Progressive Web App',
      themeColor: '#000000',
      backgroundColor: '#ffffff',
      display: 'standalone',
      startUrl: '/',
      iconsDir: './src/assets/icons',
      outputDir: './public',
      generateSW: true,
      cacheStrategy: 'staleWhileRevalidate',
      enableNotifications: false,
      categories: options.categories,
      offlinePage: options.offlinePage,
      ...options
    }
  }

  /**
   * 设置 PWA 支持
   */
  async setupPWA(): Promise<void> {
    this.logger.info('开始设置 PWA 支持...')

    try {
      // 生成 Web App Manifest
      await this.generateManifest()

      // 生成图标
      await this.generateIcons()

      // 生成 Service Worker
      if (this.options.generateSW) {
        await this.generateServiceWorker()
      }

      // 生成离线页面
      if (this.options.offlinePage) {
        await this.generateOfflinePage()
      }

      // 生成 PWA 工具函数
      await this.generatePWAUtils()

      this.logger.success('PWA 支持设置完成')

    } catch (error) {
      this.logger.error('PWA 设置失败', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * 生成 Web App Manifest
   */
  private async generateManifest(): Promise<void> {
    const manifest: PWAManifest = {
      name: this.options.appName,
      short_name: this.options.shortName,
      description: this.options.description,
      start_url: this.options.startUrl,
      display: this.options.display,
      theme_color: this.options.themeColor,
      background_color: this.options.backgroundColor,
      icons: await this.getIconsConfig()
    }

    if (this.options.categories) {
      manifest.categories = this.options.categories
    }

    const manifestPath = path.join(this.options.outputDir, 'manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

    this.logger.info('Web App Manifest 已生成')
  }

  /**
   * 获取图标配置
   */
  private async getIconsConfig(): Promise<PWAManifest['icons']> {
    const icons: PWAManifest['icons'] = []
    const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]

    for (const size of iconSizes) {
      const iconPath = `icons/icon-${size}x${size}.png`
      const fullPath = path.join(this.options.outputDir, iconPath)

      try {
        await fs.access(fullPath)
        icons.push({
          src: `/${iconPath}`,
          sizes: `${size}x${size}`,
          type: 'image/png'
        })
      } catch {
        // 图标不存在，跳过
      }
    }

    // 添加可遮罩图标
    const maskableIconPath = 'icons/icon-512x512-maskable.png'
    const maskableFullPath = path.join(this.options.outputDir, maskableIconPath)

    try {
      await fs.access(maskableFullPath)
      icons.push({
        src: `/${maskableIconPath}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      })
    } catch {
      // 可遮罩图标不存在
    }

    return icons
  }

  /**
   * 生成图标
   */
  private async generateIcons(): Promise<void> {
    const iconsOutputDir = path.join(this.options.outputDir, 'icons')
    await fs.mkdir(iconsOutputDir, { recursive: true })

    // 检查是否有源图标
    const sourceIconPath = path.join(this.options.iconsDir, 'icon.png')
    
    try {
      await fs.access(sourceIconPath)
      this.logger.info('找到源图标，建议使用图像处理工具生成不同尺寸的图标')
    } catch {
      // 创建占位图标
      await this.createPlaceholderIcons(iconsOutputDir)
    }
  }

  /**
   * 创建占位图标
   */
  private async createPlaceholderIcons(iconsDir: string): Promise<void> {
    const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for (const size of iconSizes) {
      const svgIcon = this.generateSVGIcon(size)
      const iconPath = path.join(iconsDir, `icon-${size}x${size}.svg`)
      await fs.writeFile(iconPath, svgIcon)
    }

    this.logger.info('占位图标已生成，建议替换为实际图标')
  }

  /**
   * 生成 SVG 图标
   */
  private generateSVGIcon(size: number): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${this.options.themeColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" fill="${this.options.backgroundColor}" text-anchor="middle" dominant-baseline="middle">
    ${this.options.shortName.charAt(0)}
  </text>
</svg>`
  }

  /**
   * 生成 Service Worker
   */
  private async generateServiceWorker(): Promise<void> {
    const swContent = `
// Service Worker for ${this.options.appName}
const CACHE_NAME = '${this.options.shortName.toLowerCase()}-v1';
const CACHE_STRATEGY = '${this.options.cacheStrategy}';

// 需要缓存的资源
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    handleFetch(event.request)
  );
});

// 处理网络请求
async function handleFetch(request) {
  const url = new URL(request.url);
  
  // 跳过非 HTTP(S) 请求
  if (!url.protocol.startsWith('http')) {
    return fetch(request);
  }

  switch (CACHE_STRATEGY) {
    case 'cacheFirst':
      return cacheFirst(request);
    case 'networkFirst':
      return networkFirst(request);
    case 'staleWhileRevalidate':
    default:
      return staleWhileRevalidate(request);
  }
}

// 缓存优先策略
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    ${this.options.offlinePage ? `
    // 返回离线页面
    if (request.destination === 'document') {
      return caches.match('${this.options.offlinePage}');
    }
    ` : ''}
    throw error;
  }
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    ${this.options.offlinePage ? `
    // 返回离线页面
    if (request.destination === 'document') {
      return caches.match('${this.options.offlinePage}');
    }
    ` : ''}
    throw error;
  }
}

// 过期重新验证策略
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => {
    ${this.options.offlinePage ? `
    // 返回离线页面
    if (request.destination === 'document') {
      return caches.match('${this.options.offlinePage}');
    }
    ` : ''}
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

${this.options.enableNotifications ? `
// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('${this.options.appName}', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
` : ''}
`

    const swPath = path.join(this.options.outputDir, 'sw.js')
    await fs.writeFile(swPath, swContent)

    this.logger.info('Service Worker 已生成')
  }

  /**
   * 生成离线页面
   */
  private async generateOfflinePage(): Promise<void> {
    if (!this.options.offlinePage) return

    const offlineHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - ${this.options.appName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: ${this.options.backgroundColor};
            color: #333;
        }
        .offline-container {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
        }
        .offline-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .offline-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: ${this.options.themeColor};
        }
        .offline-message {
            margin-bottom: 2rem;
            line-height: 1.5;
        }
        .retry-button {
            background-color: ${this.options.themeColor};
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 1rem;
        }
        .retry-button:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
            It looks like you're not connected to the internet. 
            Please check your connection and try again.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
            Try Again
        </button>
    </div>
</body>
</html>`

    const offlinePath = path.join(this.options.outputDir, this.options.offlinePage)
    await fs.writeFile(offlinePath, offlineHTML)

    this.logger.info('离线页面已生成')
  }

  /**
   * 生成 PWA 工具函数
   */
  private async generatePWAUtils(): Promise<void> {
    const pwaUtils = `
// PWA 工具函数
class PWAUtils {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    // 注册 Service Worker
    this.registerServiceWorker();
    
    // 监听安装提示
    this.listenForInstallPrompt();
    
    // 监听应用安装
    this.listenForAppInstalled();
  }

  // 注册 Service Worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本可用
              this.showUpdateAvailable();
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // 监听安装提示
  listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
  }

  // 监听应用安装
  listenForAppInstalled() {
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  // 显示安装按钮
  showInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => this.installApp());
    }
  }

  // 隐藏安装按钮
  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  // 安装应用
  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      this.deferredPrompt = null;
    }
  }

  // 显示更新可用提示
  showUpdateAvailable() {
    if (confirm('A new version is available. Reload to update?')) {
      window.location.reload();
    }
  }

  // 检查是否为 PWA 模式
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  // 获取网络状态
  getNetworkStatus() {
    return {
      online: navigator.onLine,
      connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection
    };
  }

  ${this.options.enableNotifications ? `
  // 请求通知权限
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // 发送通知
  sendNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      });
    }
  }

  // 订阅推送通知
  async subscribeToPush() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });
        return subscription;
      } catch (error) {
        console.error('Push subscription failed:', error);
      }
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  ` : ''}
}

// 自动初始化
window.PWAUtils = PWAUtils;
window.pwaUtils = new PWAUtils();

// 导出
export default PWAUtils;
`

    const utilsPath = path.join(this.options.outputDir, 'pwa-utils.js')
    await fs.writeFile(utilsPath, pwaUtils)

    this.logger.info('PWA 工具函数已生成')
  }
}

/**
 * 创建 PWA 支持插件
 */
export function createPWASupportPlugin(options: PWASupportOptions = {}): Plugin {
  const pwaSupport = new PWASupport(options)
  
  return {
    name: 'pwa-support',
    
    async buildStart() {
      await pwaSupport.setupPWA()
    },
    
    generateBundle() {
      // 在构建时确保 PWA 文件被包含
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: '' // 实际内容已在 buildStart 中生成
      })
    }
  }
}
