// Service Worker for LDesign Simple App
const CACHE_NAME = 'ldesign-v1'
const urlsToCache = [
  '/',
  '/index.html',
]

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
      .catch((err) => {
        console.error('Cache addAll failed:', err)
      })
  )
  // 立即激活新的 Service Worker
  self.skipWaiting()
})

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  // 立即接管所有页面
  return self.clients.claim()
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  // 只缓存 GET 请求
  if (event.request.method !== 'GET') {
    return
  }

  // 跳过 Vite 的 HMR 请求
  if (event.request.url.includes('/@vite/') || 
      event.request.url.includes('/@fs/') ||
      event.request.url.includes('__vite_ping')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有，直接返回
        if (response) {
          return response
        }

        // 否则发起网络请求
        return fetch(event.request).then((response) => {
          // 只缓存成功的响应
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }

          // 只缓存特定类型的资源
          const contentType = response.headers.get('content-type')
          const shouldCache = 
            contentType && (
              contentType.includes('text/html') ||
              contentType.includes('text/css') ||
              contentType.includes('application/javascript') ||
              contentType.includes('image/')
            )

          if (shouldCache) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })
          }

          return response
        })
      })
      .catch(() => {
        // 网络请求失败，返回离线页面（如果有的话）
        return caches.match('/index.html')
      })
  )
})












