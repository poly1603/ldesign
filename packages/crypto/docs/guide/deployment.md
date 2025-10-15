# 部署指南

本指南介绍如何在生产环境中部署使用 @ldesign/crypto 的应用。

## 环境配置

### 环境变量

```bash
# .env.production
# 加密密钥（从安全渠道注入）
VITE_ENCRYPTION_KEY=
VITE_MAC_KEY=

# 性能配置
VITE_ENABLE_CACHE=true
VITE_MAX_CACHE_SIZE=1000
VITE_CACHE_TTL=300000

# 安全配置
VITE_ENABLE_DEBUG=false
VITE_LOG_LEVEL=error

# 密钥轮换
VITE_KEY_ROTATION_INTERVAL=2592000000 # 30天
```

### 配置文件

```typescript
// config/production.config.ts
export const productionConfig = {
 crypto: {
  defaultAlgorithm: 'AES',
  enableCache: process.env.VITE_ENABLE_CACHE === 'true',
  maxCacheSize: parseInt(process.env.VITE_MAX_CACHE_SIZE || '1000'),
  enableParallel: true,
  autoGenerateIV: true,
  keyDerivation: true,
  debug: false,
  logLevel: 'error'
 },
 security: {
  encryptionKey: process.env.VITE_ENCRYPTION_KEY,
  macKey: process.env.VITE_MAC_KEY,
  keyRotationInterval: parseInt(process.env.VITE_KEY_ROTATION_INTERVAL || '2592000000')
 }
}
```

## 构建优化

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
 plugins: [vue()],

 build: {
  // 代码分割
  rollupOptions: {
   output: {
    manualChunks: {
     // 将加密库单独打包
     'crypto': ['@ldesign/crypto']
    }
   }
  },

  // 压缩
  minify: 'terser',
  terserOptions: {
   compress: {
    // 移除 console
    drop_console: true,
    drop_debugger: true
   }
  },

  // 源码映射（生产环境可选）
  sourcemap: false
 },

 // 依赖优化
 optimizeDeps: {
  include: ['@ldesign/crypto']
 }
})
```

### Webpack 配置

```javascript
// webpack.config.js
module.exports = {
 mode: 'production',

 optimization: {
  // 代码分割
  splitChunks: {
   cacheGroups: {
    crypto: {
     test: /[\\/]node_modules[\\/]@ldesign[\\/]crypto/,
     name: 'crypto',
     chunks: 'all'
    }
   }
  },

  // 压缩
  minimize: true,
  minimizer: [
   new TerserPlugin({
    terserOptions: {
     compress: {
      drop_console: true
     }
    }
   })
  ]
 }
}
```

## Docker 部署

### Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建
RUN pnpm build

# 生产镜像
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
 app:
  build: .
  ports:
   - "80:80"
  environment:
   - NODE_ENV=production
   - VITE_ENCRYPTION_KEY=${ENCRYPTION_KEY}
   - VITE_MAC_KEY=${MAC_KEY}
  restart: unless-stopped
  networks:
   - app-network

networks:
 app-network:
  driver: bridge
```

## 密钥管理

### 使用密钥管理服务

```typescript
// services/key-management.service.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

export class KeyManagementService {
 private client: SecretManagerServiceClient

 constructor() {
  this.client = new SecretManagerServiceClient()
 }

 /**
  * 从 Google Secret Manager 获取密钥
  */
 async getSecret(secretName: string): Promise<string> {
  const [version] = await this.client.accessSecretVersion({
   name: `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`
  })

  const payload = version.payload?.data?.toString()
  if (!payload) {
   throw new Error(`Secret ${secretName} not found`)
  }

  return payload
 }

 /**
  * 初始化加密密钥
  */
 async initializeKeys() {
  const encryptionKey = await this.getSecret('encryption-key')
  const macKey = await this.getSecret('mac-key')

  return {
   encryptionKey,
   macKey
  }
 }
}
```

### AWS Secrets Manager

```typescript
// services/aws-key-management.service.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

export class AWSKeyManagementService {
 private client: SecretsManagerClient

 constructor() {
  this.client = new SecretsManagerClient({
   region: process.env.AWS_REGION
  })
 }

 async getSecret(secretName: string): Promise<string> {
  const command = new GetSecretValueCommand({
   SecretId: secretName
  })

  const response = await this.client.send(command)
  return response.SecretString || ''
 }
}
```

## HTTPS 配置

### Nginx SSL

```nginx
# nginx.conf
server {
  listen 80;
  server_name example.com;

  # 重定向到 HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name example.com;

  # SSL 证书
  ssl_certificate /etc/nginx/ssl/cert.pem;
  ssl_certificate_key /etc/nginx/ssl/key.pem;

  # SSL 配置
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # HSTS
  add_header Strict-Transport-Security "max-age=31536000" always;

  # 安全头
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}
```

## 监控和日志

### 性能监控

```typescript
// 监控加密操作性能
import { cryptoManager } from '@ldesign/crypto'

// 定期收集指标
setInterval(() => {
 const metrics = cryptoManager.getPerformanceMetrics()

 // 发送到监控系统（如 Prometheus）
 sendMetrics({
  'crypto.operations_per_second': metrics.operationsPerSecond,
  'crypto.average_latency': metrics.averageLatency,
  'crypto.memory_usage': metrics.memoryUsage,
  'crypto.cache_hit_rate': metrics.cacheHitRate,
  'crypto.cache_size': metrics.cacheSize
 })
}, 60000) // 每分钟
```

### 错误追踪

```typescript
// 集成 Sentry
import * as Sentry from '@sentry/vue'

Sentry.init({
 dsn: process.env.VITE_SENTRY_DSN,
 environment: process.env.NODE_ENV,

 beforeSend(event, hint) {
  // 过滤敏感信息
  if (event.message?.includes('encryption')) {
   // 不发送包含密钥的错误
   return null
  }
  return event
 }
})

// 捕获加密错误
try {
 const result = aes.encrypt('data', 'key')
} catch (error) {
 Sentry.captureException(error, {
  tags: {
   operation: 'encryption',
   algorithm: 'AES'
  }
 })
}
```

### 日志记录

```typescript
// 使用 Winston 记录日志
import winston from 'winston'

const logger = winston.createLogger({
 level: process.env.LOG_LEVEL || 'info',
 format: winston.format.json(),
 transports: [
  new winston.transports.File({ filename: 'error.log', level: 'error' }),
  new winston.transports.File({ filename: 'combined.log' })
 ]
})

// 记录加密操作
logger.info('Encryption operation', {
 operation: 'encrypt',
 algorithm: 'AES',
 timestamp: Date.now()
})
```

## CDN 配置

### 静态资源 CDN

```typescript
// vite.config.ts
export default defineConfig({
 base: 'https://cdn.example.com/',

 build: {
  // 资源处理
  assetsDir: 'assets',
  assetsInlineLimit: 4096,

  rollupOptions: {
   output: {
    // 文件名带哈希
    entryFileNames: 'js/[name]-[hash].js',
    chunkFileNames: 'js/[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]'
   }
  }
 }
})
```

## 缓存策略

### HTTP 缓存头

```nginx
# nginx 缓存配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location /index.html {
  add_header Cache-Control "no-cache, must-revalidate";
}
```

### Service Worker 缓存

```typescript
// service-worker.ts
self.addEventListener('install', (event) => {
 event.waitUntil(
  caches.open('crypto-v1').then((cache) => {
   return cache.addAll([
    '/',
    '/js/crypto.js',
    // 缓存加密库
   ])
  })
 )
})

self.addEventListener('fetch', (event) => {
 event.respondWith(
  caches.match(event.request).then((response) => {
   return response || fetch(event.request)
  })
 )
})
```

## 负载均衡

### 多实例部署

```yaml
# kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
 name: crypto-app
spec:
 replicas: 3
 selector:
  matchLabels:
   app: crypto-app
 template:
  metadata:
   labels:
    app: crypto-app
  spec:
   containers:
   - name: crypto-app
    image: crypto-app:latest
    ports:
    - containerPort: 80
    env:
    - name: ENCRYPTION_KEY
     valueFrom:
      secretKeyRef:
       name: crypto-secrets
       key: encryption-key
    resources:
     limits:
      memory: "512Mi"
      cpu: "500m"
     requests:
      memory: "256Mi"
      cpu: "250m"
```

## 健康检查

### 健康端点

```typescript
// health.ts
import { cryptoManager } from '@ldesign/crypto'

export async function healthCheck() {
 try {
  // 测试加密功能
  const result = cryptoManager.encrypt('test', 'test', 'AES')

  // 检查缓存状态
  const stats = cryptoManager.getCacheStats()

  return {
   status: 'healthy',
   crypto: result.success ? 'ok' : 'error',
   cache: {
    size: stats.size,
    hitRate: stats.hitRate
   },
   timestamp: Date.now()
  }
 } catch (error) {
  return {
   status: 'unhealthy',
   error: error.message,
   timestamp: Date.now()
  }
 }
}
```

## 回滚策略

### 蓝绿部署

```bash
# 部署新版本到绿环境
docker-compose -f docker-compose.green.yml up -d

# 健康检查
curl https://green.example.com/health

# 切换流量
# 更新负载均衡器配置

# 如果有问题，快速回滚
docker-compose -f docker-compose.blue.yml up -d
```

## 安全加固

### 容器安全

```dockerfile
# 使用非 root 用户
FROM node:18-alpine

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 切换用户
USER nodejs

# 只读文件系统
# 在运行时使用 --read-only 标志
```

### 网络安全

```yaml
# docker-compose 网络隔离
version: '3.8'

services:
 app:
  networks:
   - frontend

 database:
  networks:
   - backend

networks:
 frontend:
  driver: bridge
 backend:
  driver: bridge
  internal: true
```

## 备份和恢复

### 密钥备份

```bash
# 备份密钥（加密存储）
#!/bin/bash

# 导出密钥
kubectl get secret crypto-secrets -o yaml > secrets-backup.yaml

# 加密备份
gpg -c secrets-backup.yaml

# 安全存储
aws s3 cp secrets-backup.yaml.gpg s3://backup-bucket/
```

## 部署检查清单

部署前检查：

- [ ] 环境变量正确配置
- [ ] 密钥安全存储
- [ ] HTTPS 已启用
- [ ] 构建优化已应用
- [ ] 日志和监控已配置
- [ ] 健康检查已实现
- [ ] 缓存策略已配置
- [ ] 错误追踪已启用
- [ ] 备份策略已制定
- [ ] 回滚计划已准备

## 下一步

- [安全性](/guide/security) - 安全最佳实践
- [性能优化](/guide/performance) - 性能调优
- [故障排查](/guide/troubleshooting) - 问题排查
