# 模板管理

深入了解 LDesign Template 的模板管理功能，包括模板的创建、组织、加载和维护。

## 模板结构

### 标准目录结构

```
src/templates/
├── auth/                    # 认证模板分类
│   ├── desktop/
│   │   ├── login/
│   │   │   ├── index.vue    # 主组件
│   │   │   ├── config.ts    # 配置文件
│   │   │   ├── styles.less  # 样式文件（可选）
│   │   │   └── types.ts     # 类型定义（可选）
│   │   └── register/
│   └── mobile/
├── dashboard/
└── layout/
```

### 配置文件详解

每个模板都需要一个 `config.ts` 文件：

```typescript
import type { TemplateConfig } from '@ldesign/template'

export const config: TemplateConfig = {
  // 基础信息
  name: 'login',
  title: '用户登录',
  description: '标准的用户登录界面，支持用户名密码登录',
  version: '1.2.0',
  author: 'LDesign Team',

  // 分类信息
  category: 'auth',
  device: 'desktop',
  tags: ['登录', '认证', '表单'],

  // 预览图片
  preview: '/previews/auth/login-desktop.png',

  // 属性定义
  props: {
    title: {
      type: 'string',
      default: '用户登录',
      description: '登录页面标题',
      required: false,
    },
    logo: {
      type: 'string',
      description: '公司Logo URL',
      required: false,
    },
    onLogin: {
      type: 'function',
      description: '登录成功回调函数',
      required: true,
    },
    allowRegister: {
      type: 'boolean',
      default: true,
      description: '是否显示注册链接',
      required: false,
    },
  },

  // 插槽定义
  slots: {
    header: {
      description: '页面头部内容',
    },
    footer: {
      description: '页面底部内容',
    },
    extra: {
      description: '额外内容区域',
    },
  },

  // 事件定义
  events: {
    login: {
      description: '用户登录时触发',
      payload: 'LoginData',
    },
    register: {
      description: '跳转注册时触发',
      payload: 'void',
    },
  },

  // 依赖关系
  dependencies: ['@/components/FormInput', '@/components/Button'],

  // 兼容性信息
  compatibility: {
    vue: '>=3.2.0',
    browsers: ['Chrome >= 88', 'Firefox >= 85', 'Safari >= 14', 'Edge >= 88'],
  },

  // 更新日志
  changelog: [
    {
      version: '1.2.0',
      date: '2024-01-15',
      changes: ['新增记住密码功能', '优化移动端适配', '修复表单验证问题'],
    },
  ],
}
```

## 模板扫描

### 自动扫描

系统启动时会自动扫描模板目录：

```typescript
const manager = new TemplateManager({
  autoScan: true,
  scanPaths: ['src/templates', 'src/custom-templates'],
})

// 手动触发扫描
await manager.scanTemplates()
```

### 扫描结果

```typescript
// 获取扫描结果
const scanResult = await manager.scanTemplates()

console.log('扫描结果:', {
  total: scanResult.total,
  success: scanResult.success,
  failed: scanResult.failed,
  templates: scanResult.templates,
})
```

### 自定义扫描器

```typescript
import { TemplateScanner } from '@ldesign/template'

// 创建自定义扫描器
const scanner = new TemplateScanner('custom/templates')

// 扫描指定目录
const templates = await scanner.scan()
```

## 模板加载

### 基础加载

```typescript
// 加载指定模板
const component = await manager.loadTemplate('auth', 'desktop', 'login')

// 检查模板是否存在
const exists = await manager.hasTemplate('auth', 'desktop', 'login')
```

### 批量加载

```typescript
// 预加载多个模板
await manager.preload([
  { category: 'auth', device: 'desktop', template: 'login' },
  { category: 'auth', device: 'desktop', template: 'register' },
  { category: 'dashboard', device: 'desktop', template: 'admin' },
])
```

### 条件加载

```typescript
// 根据条件加载模板
async function loadTemplate(userRole: string) {
  const templateMap = {
    admin: 'admin-dashboard',
    user: 'user-dashboard',
    guest: 'public-dashboard',
  }

  const template = templateMap[userRole] || 'public-dashboard'
  return await manager.loadTemplate('dashboard', 'desktop', template)
}
```

## 模板缓存

### 缓存配置

```typescript
const manager = new TemplateManager({
  cacheEnabled: true,
  cacheSize: 100, // 最大缓存数量
  cacheTTL: 30 * 60 * 1000, // 30分钟过期
  preloadEnabled: true, // 启用预加载
})
```

### 缓存操作

```typescript
// 清空所有缓存
manager.clearCache()

// 清空指定模板缓存
manager.clearCache('auth', 'desktop', 'login')

// 获取缓存统计
const stats = manager.getCacheStats()
console.log('缓存统计:', {
  hits: stats.hits,
  misses: stats.misses,
  size: stats.size,
})
```

### 缓存策略

```typescript
// 自定义缓存策略
manager.setCacheStrategy({
  // 缓存键生成器
  keyGenerator: (category, device, template) => {
    return `${category}:${device}:${template}:${Date.now()}`
  },

  // 缓存过期检查
  isExpired: item => {
    return Date.now() - item.timestamp > 60 * 60 * 1000 // 1小时
  },

  // 缓存优先级
  priority: (category, device, template) => {
    // 登录页面优先级最高
    if (category === 'auth') return 10
    if (category === 'dashboard') return 8
    return 5
  },
})
```

## 模板注册

### 手动注册

```typescript
// 注册单个模板
manager.registerTemplate({
  category: 'custom',
  device: 'desktop',
  template: 'special',
  component: SpecialComponent,
  config: specialConfig,
})

// 批量注册
manager.registerTemplates([
  {
    category: 'custom',
    device: 'desktop',
    template: 'template1',
    component: Template1,
    config: config1,
  },
  {
    category: 'custom',
    device: 'desktop',
    template: 'template2',
    component: Template2,
    config: config2,
  },
])
```

### 动态注册

```typescript
// 从远程加载并注册模板
async function loadRemoteTemplate(url: string) {
  const response = await fetch(url)
  const templateData = await response.json()

  // 动态创建组件
  const component = defineAsyncComponent(
    () => import(templateData.componentUrl)
  )

  // 注册模板
  manager.registerTemplate({
    category: templateData.category,
    device: templateData.device,
    template: templateData.name,
    component,
    config: templateData.config,
  })
}
```

## 模板查询

### 基础查询

```typescript
// 获取所有模板
const allTemplates = manager.getTemplates()

// 按分类查询
const authTemplates = manager.getTemplates({ category: 'auth' })

// 按设备查询
const mobileTemplates = manager.getTemplates({ device: 'mobile' })

// 复合查询
const loginTemplates = manager.getTemplates({
  category: 'auth',
  device: 'desktop',
  tags: ['登录'],
})
```

### 高级查询

```typescript
// 使用查询构建器
const query = manager
  .createQuery()
  .category('dashboard')
  .device(['desktop', 'tablet'])
  .version('>=1.0.0')
  .author('LDesign Team')
  .tags(['管理', '数据'])

const results = await query.execute()
```

### 模糊搜索

```typescript
// 搜索模板
const searchResults = manager.search('登录', {
  fields: ['title', 'description', 'tags'],
  fuzzy: true,
  limit: 10,
})
```

## 模板验证

### 配置验证

```typescript
// 验证模板配置
function validateConfig(config: TemplateConfig): ValidationResult {
  const errors: string[] = []

  // 检查必需字段
  if (!config.name) errors.push('模板名称不能为空')
  if (!config.category) errors.push('模板分类不能为空')
  if (!config.device) errors.push('设备类型不能为空')

  // 检查版本格式
  if (!/^\d+\.\d+\.\d+$/.test(config.version)) {
    errors.push('版本号格式不正确')
  }

  // 检查兼容性
  if (
    config.compatibility?.vue &&
    !semver.satisfies(Vue.version, config.compatibility.vue)
  ) {
    errors.push('Vue版本不兼容')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

### 组件验证

```typescript
// 验证模板组件
function validateComponent(component: Component): boolean {
  // 检查组件是否有效
  if (!component) return false

  // 检查组件类型
  if (typeof component !== 'object' && typeof component !== 'function') {
    return false
  }

  // 检查异步组件
  if (component.__asyncLoader) {
    return typeof component.__asyncLoader === 'function'
  }

  return true
}
```

## 模板热更新

### 开发环境热更新

```typescript
// 启用热更新（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  manager.enableHotReload({
    watchPaths: ['src/templates'],
    debounce: 300,
  })

  // 监听文件变化
  manager.on('template:updated', event => {
    console.log('模板已更新:', event.template)
    // 自动重新加载模板
    manager.reloadTemplate(event.category, event.device, event.template)
  })
}
```

### 生产环境更新

```typescript
// 生产环境模板更新
async function updateTemplate(templateInfo: TemplateInfo) {
  // 下载新版本
  const newTemplate = await downloadTemplate(templateInfo.url)

  // 验证模板
  const validation = validateTemplate(newTemplate)
  if (!validation.valid) {
    throw new Error(`模板验证失败: ${validation.errors.join(', ')}`)
  }

  // 备份当前版本
  await backupTemplate(templateInfo)

  // 更新模板
  await manager.updateTemplate(templateInfo, newTemplate)

  // 清理缓存
  manager.clearCache(
    templateInfo.category,
    templateInfo.device,
    templateInfo.template
  )
}
```

## 错误处理

### 加载错误处理

```typescript
// 设置错误处理器
manager.setErrorHandler({
  onLoadError: async (error, category, device, template) => {
    console.error('模板加载失败:', error)

    // 尝试加载备用模板
    if (device !== 'desktop') {
      try {
        return await manager.loadTemplate(category, 'desktop', template)
      } catch (fallbackError) {
        console.error('备用模板也加载失败:', fallbackError)
      }
    }

    // 返回默认错误组件
    return ErrorComponent
  },

  onValidationError: (error, config) => {
    console.error('模板配置验证失败:', error)
    // 上报错误到监控系统
    errorReporting.captureException(error, { extra: { config } })
  },
})
```

### 重试机制

```typescript
// 配置重试策略
manager.setRetryStrategy({
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,

  shouldRetry: (error, attempt) => {
    // 网络错误才重试
    return error.code === 'NETWORK_ERROR' && attempt < 3
  },
})
```

## 性能监控

### 加载性能

```typescript
// 监控模板加载性能
manager.on('template:load', event => {
  const loadTime = event.endTime - event.startTime

  // 记录性能指标
  performance.mark(`template-load-${event.template}`, {
    detail: {
      category: event.category,
      device: event.device,
      template: event.template,
      loadTime,
      cacheHit: event.fromCache,
    },
  })

  // 慢加载警告
  if (loadTime > 1000) {
    console.warn('模板加载较慢:', event.template, `${loadTime}ms`)
  }
})
```

### 内存监控

```typescript
// 监控内存使用
function monitorMemory() {
  const stats = manager.getMemoryStats()

  console.log('内存使用情况:', {
    templateCount: stats.templateCount,
    cacheSize: stats.cacheSize,
    memoryUsage: stats.memoryUsage,
  })

  // 内存使用过高时清理缓存
  if (stats.memoryUsage > 100 * 1024 * 1024) {
    // 100MB
    manager.clearCache()
    console.log('内存使用过高，已清理缓存')
  }
}

// 定期检查内存使用
setInterval(monitorMemory, 60000) // 每分钟检查一次
```

## 下一步

- 了解 [设备检测](./device-detection.md) 机制
- 学习 [缓存机制](./caching.md) 的详细配置
- 查看 [性能优化](./performance.md) 指南
- 探索 [插件系统](./plugins.md) 的扩展能力
