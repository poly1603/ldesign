# 最佳实践

本指南总结了使用 LDesign Template 的最佳实践，帮助你构建高质量、可维护的模板系统。

## 📁 项目结构

### 推荐的目录结构

```
src/
├── templates/                 # 模板根目录
│   ├── auth/                 # 认证相关模板
│   │   ├── desktop/
│   │   │   ├── login/
│   │   │   │   ├── index.vue
│   │   │   │   ├── config.ts
│   │   │   │   └── styles.less
│   │   │   └── register/
│   │   └── mobile/
│   ├── dashboard/            # 仪表板模板
│   ├── layout/              # 布局模板
│   └── components/          # 共享组件
├── composables/             # 组合式函数
├── utils/                   # 工具函数
└── types/                   # 类型定义
```

### 模板组织原则

1. **按功能分类**：将相关的模板放在同一个分类下
2. **设备优先**：优先考虑设备适配，确保用户体验
3. **版本管理**：为模板添加版本号，便于升级和回退
4. **文档完整**：每个模板都应该有完整的配置和说明

## 🏷️ 命名规范

### 模板命名

```typescript
// ✅ 好的命名
'login-classic' // 经典登录页
'dashboard-admin' // 管理员仪表板
'form-wizard' // 表单向导
'card-product' // 产品卡片

// ❌ 避免的命名
'template1' // 无意义的名称
'loginPage' // 驼峰命名（推荐短横线）
'admin_dashboard' // 下划线命名
```

### 文件命名

```
index.vue          # 主组件文件
config.ts          # 配置文件
styles.less        # 样式文件（可选）
types.ts           # 类型定义（可选）
README.md          # 说明文档（可选）
```

### 配置规范

```typescript
export const config: TemplateConfig = {
  // 基础信息
  name: 'classic-login',
  title: '经典登录页',
  description: '传统的登录页面设计，适用于企业级应用',
  version: '1.2.0',
  author: 'LDesign Team',
  
  // 分类信息
  category: 'auth',
  device: 'desktop',
  tags: ['登录', '认证', '企业级', '经典'],
  
  // 预览图片
  preview: '/previews/auth/classic-login.png',
  
  // 属性定义
  props: {
    title: {
      type: 'string',
      default: '用户登录',
      description: '登录页面标题',
      required: false
    },
    logo: {
      type: 'string',
      description: '公司Logo URL',
      required: false
    },
    onLogin: {
      type: 'function',
      description: '登录成功回调函数',
      required: true
    }
  },
  
  // 兼容性
  compatibility: {
    vue: '>=3.2.0',
    browsers: ['Chrome >= 88', 'Firefox >= 85', 'Safari >= 14']
  }
}
```

## 🎨 组件设计

### 组件结构

```vue
<script setup lang="ts">
import { computed } from 'vue'

// 定义清晰的接口
interface Props {
  title?: string
  showHeader?: boolean
  showFooter?: boolean
  theme?: 'light' | 'dark'
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showHeader: true,
  showFooter: true,
  theme: 'light',
  size: 'medium'
})

// 计算属性用于动态类名
const wrapperClass = computed(() => [
  `template-theme-${props.theme}`,
  `template-size-${props.size}`
])
</script>

<template>
  <div class="template-wrapper" :class="wrapperClass">
    <!-- 使用语义化的HTML结构 -->
    <header v-if="showHeader" class="template-header">
      <slot name="header" :title="title">
        <h1>{{ title }}</h1>
      </slot>
    </header>
    
    <main class="template-main">
      <slot name="default" />
    </main>
    
    <footer v-if="showFooter" class="template-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
/* 使用CSS变量提高可定制性 */
.template-wrapper {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --border-radius: 4px;
  --spacing: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-wrapper {
    --spacing: 0.5rem;
  }
}
</style>
```

### 属性设计原则

1. **类型安全**：使用 TypeScript 定义清晰的接口
2. **默认值**：为所有可选属性提供合理的默认值
3. **验证器**：为复杂属性添加验证器
4. **文档化**：在配置文件中详细描述每个属性

```typescript
// 属性验证示例
const props = defineProps({
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  },
  items: {
    type: Array as PropType<Item[]>,
    required: true,
    validator: (value: Item[]) => value.length > 0
  }
})
```

## 🚀 性能优化

### 懒加载策略

```typescript
// 使用动态导入实现懒加载
const LazyTemplate = defineAsyncComponent({
  loader: () => import('./templates/dashboard/admin/index.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 缓存配置

```typescript
// 合理配置缓存
const manager = new TemplateManager({
  cacheEnabled: true,
  cacheSize: 50, // 缓存50个模板
  cacheTTL: 10 * 60 * 1000, // 10分钟过期
  preloadEnabled: true // 启用预加载
})

// 预加载关键模板
manager.preload([
  { category: 'layout', template: 'header' },
  { category: 'layout', template: 'footer' },
  { category: 'auth', template: 'login' }
])
```

### 代码分割

```typescript
// 按路由分割模板
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      templates: ['dashboard/admin', 'layout/sidebar']
    }
  }
]
```

## 🔧 开发工具

### 调试配置

```typescript
// 开发环境配置
const isDev = process.env.NODE_ENV === 'development'

const manager = new TemplateManager({
  debug: isDev,
  logLevel: isDev ? 'debug' : 'error',
  
  // 开发环境禁用缓存
  cacheEnabled: !isDev
})

// 开发环境监听模板变化
if (isDev) {
  manager.on('template:load', (event) => {
    console.log('模板加载:', event)
  })
  
  manager.on('template:error', (event) => {
    console.error('模板错误:', event)
  })
}
```

### 热重载支持

```typescript
// Vite 热重载配置
if (import.meta.hot) {
  import.meta.hot.accept('./templates/**/*.vue', (newModule) => {
    // 重新加载模板
    manager.clearCache()
    manager.scanTemplates()
  })
}
```

## 🧪 测试策略

### 单元测试

```typescript
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginTemplate from '@/templates/auth/desktop/login/index.vue'

describe('LoginTemplate', () => {
  it('应该正确渲染登录表单', () => {
    const wrapper = mount(LoginTemplate, {
      props: {
        title: '用户登录',
        onLogin: vi.fn()
      }
    })
    
    expect(wrapper.find('h1').text()).toBe('用户登录')
    expect(wrapper.find('form').exists()).toBe(true)
  })
  
  it('应该在提交时调用回调函数', async () => {
    const onLogin = vi.fn()
    const wrapper = mount(LoginTemplate, {
      props: { onLogin }
    })
    
    await wrapper.find('form').trigger('submit')
    expect(onLogin).toHaveBeenCalled()
  })
})
```

### 集成测试

```typescript
import { describe, expect, it } from 'vitest'
import { TemplateManager } from '@ldesign/template'

describe('TemplateManager Integration', () => {
  it('应该能够加载和渲染模板', async () => {
    const manager = new TemplateManager()
    
    const component = await manager.loadTemplate('auth', 'desktop', 'login')
    expect(component).toBeDefined()
    
    const rendered = await manager.render({
      category: 'auth',
      device: 'desktop',
      template: 'login'
    })
    expect(rendered).toBeDefined()
  })
})
```

### E2E 测试

```typescript
import { expect, test } from '@playwright/test'

test('模板切换功能', async ({ page }) => {
  await page.goto('/dashboard')
  
  // 检查默认模板
  await expect(page.locator('.dashboard-admin')).toBeVisible()
  
  // 切换到移动端视图
  await page.setViewportSize({ width: 375, height: 667 })
  
  // 检查移动端模板
  await expect(page.locator('.dashboard-mobile')).toBeVisible()
})
```

## 🔒 安全考虑

### 模板验证

```typescript
// 验证模板配置
function validateConfig(config: TemplateConfig): boolean {
  // 检查必需字段
  if (!config.name || !config.category || !config.device) {
    return false
  }
  
  // 验证版本格式
  if (!/^\d+\.\d+\.\d+$/.test(config.version)) {
    return false
  }
  
  // 检查危险标签
  const dangerousTags = ['script', 'iframe', 'object']
  if (config.tags?.some(tag => dangerousTags.includes(tag.toLowerCase()))) {
    return false
  }
  
  return true
}
```

### 内容安全

```typescript
// 清理用户输入
function sanitizeProps(props: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // 移除潜在的XSS攻击代码
      cleaned[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    }
    else {
      cleaned[key] = value
    }
  }
  
  return cleaned
}
```

## 📊 监控和分析

### 性能监控

```typescript
// 性能指标收集
const performanceMonitor = {
  trackTemplateLoad: (category: string, template: string, loadTime: number) => {
    // 发送到分析服务
    analytics.track('template_load', {
      category,
      template,
      loadTime,
      timestamp: Date.now()
    })
  },
  
  trackError: (error: Error, context: any) => {
    // 错误上报
    errorReporting.captureException(error, { extra: context })
  }
}

// 在模板管理器中使用
manager.on('template:load', (event) => {
  performanceMonitor.trackTemplateLoad(
    event.category,
    event.template,
    event.loadTime
  )
})
```

### 用户行为分析

```typescript
// 跟踪模板使用情况
function trackTemplateUsage(category: string, template: string, device: string) {
  analytics.track('template_view', {
    category,
    template,
    device,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  })
}
```

## 🔄 版本管理

### 语义化版本

```typescript
// 版本比较工具
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 > part2) 
      return 1
    if (part1 < part2) 
      return -1
  }
  
  return 0
}

// 版本兼容性检查
function isCompatible(required: string, current: string): boolean {
  return compareVersions(current, required) >= 0
}
```

### 迁移策略

```typescript
// 模板迁移工具
async function migrateTemplate(from: string, to: string, migrationRules: MigrationRule[]): Promise<void> {
  for (const rule of migrationRules) {
    await rule.apply(from, to)
  }
}
```

## 📚 文档规范

### 模板文档模板

```markdown
# 模板名称

## 概述
简要描述模板的用途和特点。

## 预览
![预览图片](./preview.png)

## 属性

| 属性名 | 类型 | 默认值 | 必需 | 描述 |
|--------|------|--------|------|------|
| title  | string | '' | 否 | 页面标题 |

## 事件

| 事件名 | 参数 | 描述 |
|--------|------|------|
| submit | data | 表单提交时触发 |

## 插槽

| 插槽名 | 描述 |
|--------|------|
| header | 头部内容 |

## 示例

```vue
<LTemplateRenderer
  category="auth"
  template="login"
  :template-props="{ title: '登录' }"
/>
```

## 更新日志

### v1.2.0
- 新增暗黑主题支持
- 优化移动端适配

### v1.1.0
- 添加记住密码功能
- 修复样式问题
```

通过遵循这些最佳实践，你可以构建出高质量、可维护、性能优秀的模板系统。记住，好的实践需要在项目中持续应用和改进。
