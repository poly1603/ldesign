# 安全管理器（SecurityManager）

提供 XSS 清理、CSRF 令牌、输入验证、内容安全策略等能力。

## 快速上手

```ts
// 过滤不安全 HTML
const result = engine.security.sanitizeHTML('<div>ok</div><script>alert(1)</script>')
console.log(result.safe, result.sanitized, result.threats)

// 清理普通输入
const clean = engine.security.sanitize('<script>alert(1)</script>Hello')
console.log(clean) // 'Hello'

// 验证输入
const isValid = engine.security.validateInput('https://example.com', 'url')
console.log(isValid) // true

// CSRF 防护
const token = engine.security.generateCSRFToken()
const valid = engine.security.validateCSRFToken(token.token)
console.log(valid) // true

// 获取当前 CSRF 令牌
const currentToken = engine.security.getCSRFToken()

// 生成 CSP 头
const cspHeader = engine.security.generateCSPHeader()

// 获取安全头
const headers = engine.security.getSecurityHeaders()

// 更新安全配置
engine.security.updateConfig({
  xss: { enabled: true },
  csrf: { enabled: true },
  csp: { enabled: true }
})
```

## API

- sanitizeHTML(html): XSSResult
- sanitize(input): string
- validateInput(input, type?): boolean
- generateCSRFToken(): CSRFToken
- validateCSRFToken(token): boolean
- getCSRFToken(): string | null
- generateCSPHeader(): string
- reportCSPViolation(violation): void
- getSecurityHeaders(): Record<string, string>
- onSecurityEvent(callback): void
- reportSecurityEvent(event): void
- updateConfig(config): void
- getConfig(): SecurityConfig

## 最佳实践

- 服务端也要进行校验，前端安全只是一层保护
- 对外部输入一律清洗/验证
- 结合 CSP 提升整体安全
- 监听安全事件并及时响应
