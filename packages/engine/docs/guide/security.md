# 安全管理

Vue3 Engine 提供了完整的安全管理功能，帮助开发者防范常见的安全威胁，包括 XSS 攻击、CSRF 攻击、恶意输
入等。

## 基础用法

### 输入清理

```typescript
// 清理用户输入
const userInput = '<script>alert("XSS")</script>Hello World'
const cleanInput = engine.security.sanitize(userInput)
console.log(cleanInput) // 'Hello World'

// 验证输入安全性
const isValid = engine.security.validateInput(userInput, 'text')
console.log(isValid) // false (包含脚本)
```

### HTML 清理

```typescript
// 清理 HTML 内容
const htmlContent = '<div>Safe content</div><script>alert("XSS")</script>'
const result = engine.security.sanitizeHTML(htmlContent)
console.log(result.sanitized) // '<div>Safe content</div>'
console.log(result.safe) // false
console.log(result.threats) // ['script tag detected']
```

### CSRF 防护

```typescript
// 生成 CSRF 令牌
const csrfToken = engine.security.generateCSRFToken()
console.log(csrfToken.token) // 随机生成的令牌

// 验证 CSRF 令牌
const isValidToken = engine.security.validateCSRFToken(csrfToken.token)
console.log(isValidToken) // true

// 获取当前 CSRF 令牌
const currentToken = engine.security.getCSRFToken()
```

### URL 验证

```typescript
// 验证 URL 安全性
const url1 = 'https://example.com'
const url2 = 'javascript:alert("XSS")'

console.log(engine.security.validateInput(url1, 'url')) // true
console.log(engine.security.validateInput(url2, 'url')) // false
```

## 高级功能

### 内容安全策略 (CSP)

```typescript
// 更新安全配置（包含 CSP）
engine.security.updateConfig({
  csp: {
    enabled: true,
    directives: {
      'default-src': ['\'self\''],
      'script-src': ['\'self\'', '\'unsafe-inline\''],
      'style-src': ['\'self\'', '\'unsafe-inline\''],
      'img-src': ['\'self\'', 'data:', 'https:'],
    },
    reportOnly: false
  }
})

// 生成 CSP 头
const cspHeader = engine.security.generateCSPHeader()
console.log(cspHeader)
```

### 安全头设置

```typescript
// 获取安全响应头
const securityHeaders = engine.security.getSecurityHeaders()
console.log(securityHeaders)
// {
//   'X-Content-Type-Options': 'nosniff',
//   'X-Frame-Options': 'DENY',
//   'X-XSS-Protection': '1; mode=block',
//   'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
// }
```

### 输入验证规则

```typescript
// 定义验证规则
const validationRules = {
  email: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]+$/,
  username: /^\w{3,20}$/,
}

// 验证输入
const email = 'user@example.com'
const isValidEmail = engine.security.validate(email, validationRules.email)
console.log(isValidEmail) // true
```

## 安全事件监听

### 监听安全事件

```typescript
// 监听安全威胁事件
engine.events.on('security:threat-detected', (event) => {
  console.log('安全威胁检测到:', event)
  // 记录日志、发送警报等
})

// 监听输入清理事件
engine.events.on('security:input-sanitized', (event) => {
  console.log('输入已清理:', event)
})
```

### 自定义安全处理

```typescript
// 自定义安全处理器
engine.security.addHandler('custom-threat', (input, context) => {
  // 自定义威胁检测逻辑
  if (input.includes('malicious-pattern')) {
    return {
      threat: true,
      type: 'custom-threat',
      severity: 'high',
      message: '检测到自定义威胁模式',
    }
  }
  return { threat: false }
})
```

## 配置选项

### 安全配置

```typescript
const engine = createEngine({
  security: {
    // 启用输入清理
    sanitizeInput: true,

    // 启用 HTML 清理
    sanitizeHtml: true,

    // 启用 CSS 清理
    sanitizeCss: true,

    // 启用 URL 验证
    validateUrls: true,

    // 自定义清理规则
    customRules: {
      allowedTags: ['div', 'span', 'p', 'a', 'img'],
      allowedAttributes: ['class', 'id', 'href', 'src', 'alt'],
      allowedSchemes: ['http', 'https', 'mailto'],
    },

    // 威胁检测配置
    threatDetection: {
      xss: true,
      sqlInjection: true,
      pathTraversal: true,
      commandInjection: true,
    },
  },
})
```

## 最佳实践

### 1. 输入验证

```typescript
// 总是验证用户输入
function handleUserInput(input: string) {
  // 首先验证格式
  if (!engine.security.validate(input, /^[a-z0-9\s]{1,100}$/i)) {
    throw new Error('输入格式无效')
  }

  // 然后清理内容
  const cleanInput = engine.security.sanitizeInput(input)

  // 最后处理业务逻辑
  return processInput(cleanInput)
}
```

### 2. 内容渲染

```typescript
// 渲染用户生成的内容时进行清理
function renderUserContent(htmlContent: string) {
  const cleanHtml = engine.security.sanitizeHtml(htmlContent)
  return cleanHtml
}
```

### 3. URL 处理

```typescript
// 处理外部链接时验证 URL
function handleExternalLink(url: string) {
  if (!engine.security.validateUrl(url)) {
    console.warn('不安全的 URL:', url)
    return '#'
  }
  return url
}
```

### 4. 文件上传安全

```typescript
// 文件上传安全检查
function validateFileUpload(file: File) {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('不允许的文件类型')
  }

  // 检查文件大小
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('文件大小超出限制')
  }

  // 检查文件名
  const cleanFileName = engine.security.sanitizeInput(file.name)
  if (cleanFileName !== file.name) {
    console.warn('文件名包含不安全字符')
  }

  return true
}
```

## 安全检查清单

### 开发阶段

- [ ] 所有用户输入都经过验证和清理
- [ ] HTML 内容渲染前进行清理
- [ ] 外部 URL 经过验证
- [ ] 文件上传有安全检查
- [ ] 敏感操作有权限验证

### 部署阶段

- [ ] 设置适当的 CSP 策略
- [ ] 配置安全响应头
- [ ] 启用 HTTPS
- [ ] 定期更新依赖包
- [ ] 监控安全事件

## 常见安全威胁防护

### XSS 防护

```typescript
// 防止 XSS 攻击
const userComment = '<img src="x" onerror="alert(\'XSS\')">'
const safeComment = engine.security.sanitizeHtml(userComment)
// 结果: '<img src="x">'
```

### CSRF 防护

```typescript
// CSRF Token 生成和验证
const csrfToken = engine.security.generateCSRFToken()
const isValidToken = engine.security.validateCSRFToken(token, userToken)
```

### SQL 注入防护

```typescript
// 输入清理防止 SQL 注入
const userInput = '\'; DROP TABLE users; --'
const cleanInput = engine.security.sanitizeInput(userInput)
// 清理后的输入不会包含危险字符
```

## 错误处理

```typescript
try {
  const cleanInput = engine.security.sanitizeInput(userInput)
  // 处理清理后的输入
}
catch (error) {
  engine.logger.error('输入清理失败:', error)
  // 处理错误情况
}
```

## 性能考虑

安全检查会带来一定的性能开销，可以通过以下方式优化：

1. **缓存清理结果**：对相同内容的清理结果进行缓存
2. **异步处理**：对大量内容进行异步清理
3. **分级处理**：根据内容来源设置不同的安全级别
4. **批量处理**：对多个输入进行批量清理

```typescript
// 缓存清理结果
const cache = new Map()
function cachedSanitize(input: string) {
  if (cache.has(input)) {
    return cache.get(input)
  }

  const result = engine.security.sanitizeInput(input)
  cache.set(input, result)
  return result
}
```
