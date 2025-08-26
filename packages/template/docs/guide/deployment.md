# 部署指南

本指南介绍如何将使用 `@ldesign/template` 的应用部署到生产环境。

## 🚀 构建准备

### 生产环境配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'template-core': ['@ldesign/template'],
          'template-vue': ['@ldesign/template/vue']
        }
      }
    }
  }
})
```

### 环境变量

```bash
# .env.production
VITE_TEMPLATE_CACHE_ENABLED=true
VITE_TEMPLATE_PERFORMANCE_ENABLED=true
VITE_TEMPLATE_DEBUG=false
```

## 📦 构建优化

### 代码分割

```typescript
// 动态导入模板
async function loadTemplate(name: string) {
  const module = await import(`./templates/${name}.vue`)
  return module.default
}
```

### 资源优化

```typescript
// 压缩配置
const config = {
  cache: {
    compression: true,
    strategy: 'lru',
    maxSize: 30
  }
}
```

## 🌐 部署平台

### Vercel 部署

```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Netlify 部署

```toml
# netlify.toml
[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 服务器配置

### Nginx 配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 压缩配置
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 📊 监控配置

### 性能监控

```typescript
// 生产环境监控
const config = {
  performance: {
    enabled: true,
    sampleRate: 0.1,
    reportEndpoint: 'https://api.your-domain.com/metrics'
  }
}
```

### 错误监控

```typescript
// 集成 Sentry
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: process.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing()
  ]
})
```

## 🔒 安全配置

### CSP 策略

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';">
```

### HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
}
```

## 🚀 CI/CD 流程

### GitHub Actions

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build
        env:
          VITE_TEMPLATE_CACHE_ENABLED: true

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 📈 性能优化

### 缓存策略

```typescript
// 生产环境缓存配置
const cacheConfig = {
  enabled: true,
  strategy: 'lru',
  maxSize: 50,
  ttl: 60 * 60 * 1000, // 1小时
  persistence: true
}
```

### CDN 配置

```typescript
// 使用 CDN 加速
const config = {
  loader: {
    baseUrl: 'https://cdn.your-domain.com/templates/',
    enableCache: true
  }
}
```

## 🔍 健康检查

### 应用监控

```typescript
// 健康检查端点
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  }
  res.json(health)
})
```

### 模板系统监控

```typescript
// 模板系统健康检查
async function checkTemplateHealth() {
  try {
    const stats = manager.getCacheStats()
    return {
      cacheHitRate: stats.hitRate,
      memoryUsage: stats.memoryUsage,
      activeTemplates: stats.activeCount
    }
  }
  catch (error) {
    return { error: error.message }
  }
}
```
