# 部署指南

本指南介绍如何在不同环境中部署使用 @ldesign/crypto 的应用程序。

## 生产环境准备

### 环境变量配置

```bash
# .env.production
NODE_ENV=production

# 加密相关配置
ENCRYPTION_KEY=your-production-encryption-key
MASTER_KEY=your-master-key-for-key-derivation
API_SECRET_KEY=your-api-secret-key

# 数据库加密密钥
DB_ENCRYPTION_KEY=your-database-encryption-key

# JWT 签名密钥
JWT_SECRET=your-jwt-secret-key

# 安全配置
CRYPTO_STRICT_MODE=true
CRYPTO_KEY_ROTATION_INTERVAL=86400000  # 24小时
CRYPTO_MAX_KEY_AGE=2592000000          # 30天
```

### 安全配置检查清单

```typescript
// config/security-checklist.ts
export const securityChecklist = {
  // ✅ 必须配置的安全项
  required: [
    'ENCRYPTION_KEY',
    'MASTER_KEY',
    'API_SECRET_KEY',
    'JWT_SECRET'
  ],

  // ⚠️ 推荐配置的安全项
  recommended: [
    'CRYPTO_STRICT_MODE',
    'CRYPTO_KEY_ROTATION_INTERVAL',
    'CRYPTO_MAX_KEY_AGE'
  ],

  // 🔍 安全验证函数
  validate(): { valid: boolean, issues: string[] } {
    const issues: string[] = []

    // 检查必需的环境变量
    for (const key of this.required) {
      if (!process.env[key]) {
        issues.push(`缺少必需的环境变量: ${key}`)
      }
    }

    // 检查密钥强度
    const encryptionKey = process.env.ENCRYPTION_KEY
    if (encryptionKey && encryptionKey.length < 32) {
      issues.push('ENCRYPTION_KEY 长度不足（建议至少32字符）')
    }

    // 检查生产环境配置
    if (process.env.NODE_ENV === 'production') {
      if (process.env.CRYPTO_STRICT_MODE !== 'true') {
        issues.push('生产环境应启用严格模式')
      }
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }
}

// 启动时验证安全配置
const validation = securityChecklist.validate()
if (!validation.valid) {
  console.error('❌ 安全配置验证失败:')
  validation.issues.forEach(issue => console.error(`  - ${issue}`))
  process.exit(1)
}
```

## Web 应用部署

### Nginx 配置

```nginx
# /etc/nginx/sites-available/crypto-app
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";

    # 静态资源
    location /static/ {
        alias /var/www/crypto-app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 主应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 设置权限
USER nextjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  crypto-app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - MASTER_KEY=${MASTER_KEY}
      - API_SECRET_KEY=${API_SECRET_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=crypto_app
      - POSTGRES_USER=crypto_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

## 云平台部署

### AWS 部署

```yaml
# aws-deploy.yml (GitHub Actions)
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Elastic Beanstalk
        run: |
          zip -r deploy.zip . -x "*.git*" "node_modules/*" "*.log"
          aws s3 cp deploy.zip s3://${{ secrets.S3_BUCKET }}/deploy.zip
          aws elasticbeanstalk create-application-version \
            --application-name crypto-app \
            --version-label ${{ github.sha }} \
            --source-bundle S3Bucket=${{ secrets.S3_BUCKET }},S3Key=deploy.zip
          aws elasticbeanstalk update-environment \
            --application-name crypto-app \
            --environment-name crypto-app-prod \
            --version-label ${{ github.sha }}
```

### Vercel 部署

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "ENCRYPTION_KEY": "@encryption-key",
    "MASTER_KEY": "@master-key",
    "API_SECRET_KEY": "@api-secret-key"
  },
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### Netlify 部署

```toml
# netlify.toml
[build]
publish = "dist"
command = "npm run build"

[build.environment]
NODE_ENV = "production"

[[redirects]]
from = "/api/*"
to = "/.netlify/functions/:splat"
status = 200

[functions]
directory = "netlify/functions"

[[headers]]
for = "/*"

[headers.values]
Strict-Transport-Security = "max-age=63072000"
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
X-XSS-Protection = "1; mode=block"
```

## 数据库加密

### 敏感字段加密

```typescript
// models/User.ts
import { decrypt, encrypt } from '@ldesign/crypto'

class User {
  private static readonly ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY!

  // 加密敏感字段
  static encryptSensitiveData(data: {
    email: string
    phone?: string
    ssn?: string
  }) {
    return {
      email: encrypt.aes(data.email, this.ENCRYPTION_KEY).data,
      phone: data.phone ? encrypt.aes(data.phone, this.ENCRYPTION_KEY).data : null,
      ssn: data.ssn ? encrypt.aes(data.ssn, this.ENCRYPTION_KEY).data : null
    }
  }

  // 解密敏感字段
  static decryptSensitiveData(encryptedData: {
    email: string
    phone?: string
    ssn?: string
  }) {
    const result: any = {}

    if (encryptedData.email) {
      const decrypted = decrypt.aes(
        { data: encryptedData.email, algorithm: 'AES-256-CBC' },
        this.ENCRYPTION_KEY
      )
      result.email = decrypted.success ? decrypted.data : null
    }

    if (encryptedData.phone) {
      const decrypted = decrypt.aes(
        { data: encryptedData.phone, algorithm: 'AES-256-CBC' },
        this.ENCRYPTION_KEY
      )
      result.phone = decrypted.success ? decrypted.data : null
    }

    if (encryptedData.ssn) {
      const decrypted = decrypt.aes(
        { data: encryptedData.ssn, algorithm: 'AES-256-CBC' },
        this.ENCRYPTION_KEY
      )
      result.ssn = decrypted.success ? decrypted.data : null
    }

    return result
  }
}
```

### 数据库迁移脚本

```typescript
import { encrypt } from '@ldesign/crypto'
// migrations/encrypt-existing-data.ts
import { User } from '../models/User'

export async function encryptExistingUserData() {
  const BATCH_SIZE = 1000
  const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY!

  let offset = 0
  let hasMore = true

  while (hasMore) {
    // 批量获取用户数据
    const users = await User.findMany({
      skip: offset,
      take: BATCH_SIZE,
      where: {
        emailEncrypted: null // 未加密的数据
      }
    })

    if (users.length === 0) {
      hasMore = false
      break
    }

    // 批量加密
    const updates = users.map((user) => {
      const encryptedEmail = encrypt.aes(user.email, ENCRYPTION_KEY)

      return {
        id: user.id,
        emailEncrypted: encryptedEmail.data,
        emailIv: encryptedEmail.iv
      }
    })

    // 批量更新
    await User.updateMany(updates)

    offset += BATCH_SIZE
    console.log(`已处理 ${offset} 个用户`)
  }

  console.log('数据加密迁移完成')
}
```

## 监控和日志

### 安全事件监控

```typescript
// monitoring/security-monitor.ts
import { EventEmitter } from 'node:events'

class SecurityMonitor extends EventEmitter {
  private static instance: SecurityMonitor
  private events: Array<{
    type: string
    timestamp: number
    details: any
  }> = []

  static getInstance(): SecurityMonitor {
    if (!this.instance) {
      this.instance = new SecurityMonitor()
    }
    return this.instance
  }

  logSecurityEvent(type: string, details: any) {
    const event = {
      type,
      timestamp: Date.now(),
      details
    }

    this.events.push(event)
    this.emit('securityEvent', event)

    // 检测异常模式
    this.detectAnomalies(type)

    // 清理旧事件
    this.cleanupOldEvents()
  }

  private detectAnomalies(eventType: string) {
    const recentEvents = this.events
      .filter(e => Date.now() - e.timestamp < 60000) // 最近1分钟
      .filter(e => e.type === eventType)

    // 检测频繁失败
    if (eventType.includes('failed') && recentEvents.length > 10) {
      this.emit('anomaly', {
        type: 'frequent_failures',
        eventType,
        count: recentEvents.length
      })
    }

    // 检测异常高频操作
    if (recentEvents.length > 100) {
      this.emit('anomaly', {
        type: 'high_frequency',
        eventType,
        count: recentEvents.length
      })
    }
  }

  private cleanupOldEvents() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24小时前
    this.events = this.events.filter(e => e.timestamp > cutoff)
  }

  getSecurityStats() {
    const now = Date.now()
    const last24h = this.events.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000)

    const stats = {}
    for (const event of last24h) {
      stats[event.type] = (stats[event.type] || 0) + 1
    }

    return {
      totalEvents: last24h.length,
      eventTypes: stats,
      timeRange: '24h'
    }
  }
}

// 使用监控器
const monitor = SecurityMonitor.getInstance()

monitor.on('securityEvent', (event) => {
  console.log(`安全事件: ${event.type}`, event.details)
})

monitor.on('anomaly', (anomaly) => {
  console.warn(`检测到异常: ${anomaly.type}`, anomaly)
  // 发送告警通知
})

// 在加密操作中使用
export function monitoredEncrypt(data: string, key: string) {
  try {
    const result = encrypt.aes(data, key)
    monitor.logSecurityEvent('encryption_success', {
      algorithm: 'AES-256',
      dataLength: data.length
    })
    return result
  }
  catch (error) {
    monitor.logSecurityEvent('encryption_failed', {
      algorithm: 'AES-256',
      error: error.message
    })
    throw error
  }
}
```

### 性能监控

```typescript
// monitoring/performance-monitor.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  startTiming(operation: string): () => void {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(operation, duration)
    }
  }

  recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }

    const durations = this.metrics.get(operation)!
    durations.push(duration)

    // 保留最近1000个记录
    if (durations.length > 1000) {
      durations.shift()
    }
  }

  getStats(operation: string) {
    const durations = this.metrics.get(operation) || []
    if (durations.length === 0)
      return null

    const sorted = [...durations].sort((a, b) => a - b)

    return {
      count: durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }
}

const perfMonitor = new PerformanceMonitor()

// 监控加密性能
export function monitoredEncryptPerf(data: string, key: string) {
  const endTiming = perfMonitor.startTiming('aes_encryption')
  try {
    const result = encrypt.aes(data, key)
    return result
  }
  finally {
    endTiming()
  }
}
```

## 备份和恢复

### 密钥备份策略

```typescript
// backup/key-backup.ts
import { decrypt, encrypt } from '@ldesign/crypto'

class KeyBackupManager {
  private static readonly BACKUP_ENCRYPTION_KEY = process.env.BACKUP_MASTER_KEY!

  // 创建密钥备份
  static createKeyBackup(keys: Record<string, string>): string {
    const backup = {
      keys,
      timestamp: Date.now(),
      version: '1.0'
    }

    const backupJson = JSON.stringify(backup)
    const encrypted = encrypt.aes(backupJson, this.BACKUP_ENCRYPTION_KEY)

    return JSON.stringify(encrypted)
  }

  // 恢复密钥备份
  static restoreKeyBackup(encryptedBackup: string): Record<string, string> {
    try {
      const encrypted = JSON.parse(encryptedBackup)
      const decrypted = decrypt.aes(encrypted, this.BACKUP_ENCRYPTION_KEY)

      if (!decrypted.success) {
        throw new Error('备份解密失败')
      }

      const backup = JSON.parse(decrypted.data)
      return backup.keys
    }
    catch (error) {
      throw new Error(`密钥备份恢复失败: ${error.message}`)
    }
  }

  // 验证备份完整性
  static verifyBackup(encryptedBackup: string): boolean {
    try {
      this.restoreKeyBackup(encryptedBackup)
      return true
    }
    catch {
      return false
    }
  }
}
```

## 安全审计

### 定期安全检查

```typescript
// audit/security-audit.ts
class SecurityAudit {
  static async performAudit(): Promise<{
    passed: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // 检查环境变量
    await this.auditEnvironmentVariables(issues, recommendations)

    // 检查密钥强度
    await this.auditKeyStrength(issues, recommendations)

    // 检查加密配置
    await this.auditCryptoConfig(issues, recommendations)

    // 检查依赖安全性
    await this.auditDependencies(issues, recommendations)

    return {
      passed: issues.length === 0,
      issues,
      recommendations
    }
  }

  private static async auditEnvironmentVariables(issues: string[], recommendations: string[]) {
    const requiredVars = ['ENCRYPTION_KEY', 'MASTER_KEY', 'API_SECRET_KEY']

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        issues.push(`缺少环境变量: ${varName}`)
      }
      else if (process.env[varName]!.length < 32) {
        issues.push(`环境变量 ${varName} 长度不足`)
      }
    }
  }

  private static async auditKeyStrength(issues: string[], recommendations: string[]) {
    // 检查密钥轮换
    const lastRotation = process.env.LAST_KEY_ROTATION
    if (lastRotation) {
      const rotationAge = Date.now() - Number.parseInt(lastRotation)
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30天

      if (rotationAge > maxAge) {
        recommendations.push('建议轮换加密密钥')
      }
    }
  }

  private static async auditCryptoConfig(issues: string[], recommendations: string[]) {
    // 检查是否使用了不安全的算法
    const config = getCurrentCryptoConfig()

    if (config.hash?.algorithm === 'MD5' || config.hash?.algorithm === 'SHA1') {
      issues.push('使用了不安全的哈希算法')
    }

    if (config.aes?.keySize < 256) {
      recommendations.push('建议使用 AES-256 加密')
    }
  }

  private static async auditDependencies(issues: string[], recommendations: string[]) {
    // 这里可以集成 npm audit 或其他安全扫描工具
    // 检查依赖包的安全漏洞
  }
}

// 定期执行安全审计
setInterval(async () => {
  const audit = await SecurityAudit.performAudit()

  if (!audit.passed) {
    console.error('❌ 安全审计失败:')
    audit.issues.forEach(issue => console.error(`  - ${issue}`))
  }

  if (audit.recommendations.length > 0) {
    console.warn('⚠️ 安全建议:')
    audit.recommendations.forEach(rec => console.warn(`  - ${rec}`))
  }
}, 24 * 60 * 60 * 1000) // 每24小时执行一次
```

通过遵循这些部署指南，您可以确保 @ldesign/crypto 在生产环境中安全、稳定地运行。
