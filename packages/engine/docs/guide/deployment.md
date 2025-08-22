# 部署指南

本指南介绍如何将使用 Vue3 Engine 构建的应用部署到不同的环境中。

## 构建准备

### 1. 环境配置

在部署前，确保正确配置了不同环境的设置：

```typescript
// config/production.ts
export const productionConfig = {
  config: {
    appName: '我的应用',
    version: process.env.VUE_APP_VERSION || '1.0.0',
    debug: false,
    apiBaseURL: process.env.VUE_APP_API_BASE_URL || 'https://api.example.com',
  },
  logger: {
    level: 'warn', // 生产环境只记录警告和错误
    format: 'json',
    outputs: [
      {
        type: 'console',
        level: 'error',
      },
      {
        type: 'remote',
        level: 'warn',
        endpoint: '/api/logs',
      },
    ],
  },
  state: {
    persist: true,
    storage: 'localStorage',
    encryption: true, // 生产环境启用加密
  },
  notifications: {
    position: 'top-right',
    duration: 3000,
    maxCount: 5,
  },
}
```

```typescript
// config/development.ts
export const developmentConfig = {
  config: {
    appName: '我的应用 (开发)',
    version: 'dev',
    debug: true,
    apiBaseURL: 'http://localhost:3000/api',
  },
  logger: {
    level: 'debug',
    format: 'pretty',
  },
  state: {
    persist: true,
    storage: 'localStorage',
  },
}
```

### 2. 主入口文件

```typescript
import { createApp, presets } from '@ldesign/engine'
// main.ts
import App from './App.vue'
import { developmentConfig } from './config/development'
import { productionConfig } from './config/production'

// 根据环境选择配置
const config
  = process.env.NODE_ENV === 'production'
    ? { ...presets.production(), ...productionConfig }
    : { ...presets.development(), ...developmentConfig }

const engine = createApp(App, config)

// 生产环境错误处理
if (process.env.NODE_ENV === 'production') {
  // 全局错误捕获
  window.addEventListener('error', (event) => {
    engine.logger.error('全局错误', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    })
  })

  // Promise 错误捕获
  window.addEventListener('unhandledrejection', (event) => {
    engine.logger.error('未处理的Promise错误', {
      reason: event.reason,
    })
  })
}

engine.mount('#app')

export { engine }
```

## 构建优化

### 1. Vite 配置优化

```typescript
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],

  // 构建优化
  build: {
    // 生成源码映射（可选）
    sourcemap: process.env.NODE_ENV !== 'production',

    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将引擎相关代码分离
          engine: ['@ldesign/engine'],
          // 将Vue相关代码分离
          vue: ['vue', 'vue-router'],
          // 将工具库分离
          utils: ['lodash', 'dayjs'],
        },
      },
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console.log（保留error和warn）
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // 别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
```

### 2. 环境变量配置

```bash
# .env.production
VUE_APP_API_BASE_URL=https://api.example.com
VUE_APP_VERSION=1.0.0
VUE_APP_SENTRY_DSN=https://your-sentry-dsn
VUE_APP_ANALYTICS_ID=GA-XXXXXXXXX
```

```bash
# .env.development
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_VERSION=dev
```

## 部署到不同平台

### 1. Netlify 部署

创建 `netlify.toml` 文件：

```toml
[build]
publish = "dist"
command = "npm run build"

[build.environment]
NODE_VERSION = "18"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200

[[headers]]
for = "/assets/*"

[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "*.js"

[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "*.css"

[headers.values]
Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Vercel 部署

创建 `vercel.json` 文件：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. GitHub Pages 部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VUE_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 4. Docker 部署

创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:18-alpine as build-stage

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage

# 复制构建结果
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        # 静态资源缓存
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '80:80'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 性能优化

### 1. 代码分割

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    // 预加载
    meta: { preload: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由预加载
router.beforeEach((to, from, next) => {
  if (to.meta?.preload) {
    // 预加载组件
    to.matched.forEach((record) => {
      if (typeof record.component === 'function') {
        record.component()
      }
    })
  }
  next()
})

export default router
```

### 2. 资源优化

```typescript
// plugins/performance.ts
import { creators } from '@ldesign/engine'

export const performancePlugin = creators.plugin('performance', (engine) => {
  // 图片懒加载
  const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src!
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  }

  // 预加载关键资源
  const preloadCriticalResources = () => {
    const criticalResources = ['/api/user/profile', '/api/app/config']

    criticalResources.forEach((url) => {
      fetch(url, { method: 'HEAD' }).catch(() => {}) // 忽略错误
    })
  }

  // 应用挂载后执行优化
  engine.events.on('app:mounted', () => {
    lazyLoadImages()
    preloadCriticalResources()
  })
})
```

## 监控和分析

### 1. 错误监控

```typescript
import { creators } from '@ldesign/engine'
// plugins/sentry.ts
import * as Sentry from '@sentry/vue'

export const sentryPlugin = creators.plugin('sentry', (engine) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      app: engine.app,
      dsn: process.env.VUE_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.VUE_APP_VERSION,

      // 性能监控
      tracesSampleRate: 0.1,

      // 用户上下文
      beforeSend(event) {
        const user = engine.state.get('user')
        if (user) {
          event.user = {
            id: user.id,
            email: user.email,
          }
        }
        return event
      },
    })

    // 集成引擎日志
    engine.logger.addOutput({
      type: 'custom',
      handler: (level, message, data) => {
        if (level === 'error') {
          Sentry.captureException(new Error(message), {
            extra: data,
          })
        }
      },
    })
  }
})
```

### 2. 性能监控

```typescript
// plugins/analytics.ts
import { creators } from '@ldesign/engine'

export const analyticsPlugin = creators.plugin('analytics', (engine) => {
  // 页面访问统计
  const trackPageView = (path: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('config', process.env.VUE_APP_ANALYTICS_ID, {
        page_path: path,
      })
    }
  }

  // 用户行为统计
  const trackEvent = (action: string, category: string, label?: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
      })
    }
  }

  // 性能指标统计
  const trackPerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming

      // 页面加载时间
      const loadTime = navigation.loadEventEnd - navigation.fetchStart

      trackEvent('page_load_time', 'performance', loadTime.toString())
    }
  }

  // 暴露分析方法
  engine.analytics = {
    trackPageView,
    trackEvent,
    trackPerformance,
  }

  // 自动统计
  engine.events.on('app:mounted', () => {
    trackPerformance()
  })
})
```

## 安全考虑

### 1. 内容安全策略 (CSP)

在 `index.html` 中添加：

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
"
/>
```

### 2. 敏感信息处理

```typescript
// utils/security.ts
export function sanitizeUserData(data: any) {
  // 移除敏感字段
  const { password, token, ...safeData } = data
  return safeData
}

export function encryptStorage(data: any) {
  // 加密存储敏感数据
  if (process.env.NODE_ENV === 'production') {
    return btoa(JSON.stringify(data))
  }
  return JSON.stringify(data)
}

export function decryptStorage(encryptedData: string) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return JSON.parse(atob(encryptedData))
    }
    return JSON.parse(encryptedData)
  }
  catch {
    return null
  }
}
```

## 部署检查清单

### 构建前检查

- [ ] 环境变量配置正确
- [ ] 生产环境配置已设置
- [ ] 敏感信息已移除
- [ ] 代码已通过测试
- [ ] 性能优化已实施

### 部署后检查

- [ ] 应用正常启动
- [ ] 路由功能正常
- [ ] API 接口连接正常
- [ ] 静态资源加载正常
- [ ] 错误监控正常工作
- [ ] 性能指标在可接受范围内
- [ ] 安全头设置正确

### 监控设置

- [ ] 错误监控已配置
- [ ] 性能监控已启用
- [ ] 日志收集正常
- [ ] 告警规则已设置
- [ ] 备份策略已实施

通过遵循这个部署指南，你可以确保 Vue3 Engine 应用在生产环境中稳定、安全、高效地运行。
