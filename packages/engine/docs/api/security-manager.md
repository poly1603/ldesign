# 安全管理器（SecurityManager）

提供 XSS 清理、CSRF 令牌、输入验证、内容安全策略等能力。

## 快速上手

```ts
// 过滤不安全 HTML
const result = engine.security.sanitizeHTML('<div>ok</div><script>alert(1)</script>')
console.log(result.safe, result.sanitized, result.threats)

// CSRF
const token = engine.security.generateCSRFToken()
const valid = engine.security.validateCSRFToken(token.token)
```

## API

- sanitizeHTML(html)
- validateInput(value, type?)  // text/html/url/email 等
- generateCSRFToken()
- validateCSRFToken(token)
- on(event, cb)

## 最佳实践

- 服务端也要进行校验，前端安全只是一层保护
- 对外部输入一律清洗/验证
- 结合 CSP 提升整体安全
