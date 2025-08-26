# 最佳实践

本文档总结了使用 `@ldesign/template` 的最佳实践和推荐模式。

## 🏗️ 项目架构

### 目录组织

```
src/templates/
├── auth/                    # 认证相关模板
│   ├── login/
│   ├── register/
│   └── reset-password/
├── dashboard/               # 仪表板模板
│   ├── overview/
│   ├── analytics/
│   └── reports/
├── user/                    # 用户管理模板
│   ├── profile/
│   ├── settings/
│   └── permissions/
└── common/                  # 通用组件模板
    ├── header/
    ├── footer/
    └── navigation/
```

### 命名规范

- **模板分类**：使用小写字母和连字符，如 `user-profile`
- **设备类型**：固定使用 `desktop`、`tablet`、`mobile`
- **组件文件**：使用 PascalCase，如 `UserProfile.vue`

## 🚀 性能优化

### 缓存策略

```typescript
const config = {
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000 // 30分钟
  }
}
```

### 预加载配置

```typescript
// 预加载关键模板
await manager.preloadTemplates([
  { category: 'login', deviceType: 'desktop' },
  { category: 'dashboard', deviceType: 'desktop' }
])
```

## 📱 响应式设计

### 断点管理

```css
/* 移动端优先 */
.template {
  /* 基础样式 */
}

@media (min-width: 768px) {
  .template {
    /* 平板端样式 */
  }
}

@media (min-width: 1024px) {
  .template {
    /* 桌面端样式 */
  }
}
```

## 🔧 开发规范

### TypeScript 使用

```typescript
// 定义清晰的接口
interface TemplateProps {
  title: string
  data: any[]
  onSave?: (data: any) => void
}

// 使用泛型提高复用性
interface ListTemplate<T> {
  items: T[]
  onItemClick: (item: T) => void
}
```

### 错误处理

```typescript
// 全局错误处理
manager.on('template:error', (error) => {
  console.error('模板错误:', error)
  // 发送错误报告
  errorReporting.captureException(error)
})
```

## 🧪 测试策略

### 单元测试

```typescript
describe('UserProfile Template', () => {
  it('should render user information', () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser }
    })
    expect(wrapper.find('h2').text()).toBe(mockUser.name)
  })
})
```

### E2E 测试

```typescript
test('template switching works correctly', async ({ page }) => {
  await page.goto('/dashboard')

  // 测试设备切换
  await page.setViewportSize({ width: 375, height: 667 })
  await expect(page.locator('.mobile-layout')).toBeVisible()
})
```

## 📊 监控和维护

### 性能监控

```typescript
const config = {
  performance: {
    enabled: true,
    sampleRate: 0.1,
    reportInterval: 60000
  }
}
```

### 错误监控

```typescript
manager.on('performance:warning', (data) => {
  if (data.type === 'memory_high') {
    // 清理缓存
    manager.clearCache()
  }
})
```

## 🔒 安全考虑

### 模板安全

- 避免在模板中直接使用 `v-html`
- 对用户输入进行适当的验证和清理
- 使用 CSP 策略防止 XSS 攻击

### 数据保护

```typescript
// 敏感数据处理
function sanitizeData(data: any) {
  // 移除敏感字段
  const { password, token, ...safeData } = data
  return safeData
}
```

## 📚 文档维护

### 模板文档

每个模板都应该包含：
- 功能说明
- 属性接口
- 事件定义
- 使用示例

### 版本管理

```json
// meta.json
{
  "version": "1.2.0",
  "changelog": [
    "1.2.0: 添加新的交互功能",
    "1.1.0: 优化响应式布局",
    "1.0.0: 初始版本"
  ]
}
```

## 🔄 持续集成

### 自动化测试

```yaml
# .github/workflows/test.yml
name: Test Templates
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm install
          npm run test
          npm run test:e2e
```

### 部署流程

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Build and deploy
        run: |
          npm run build
          npm run deploy
```
