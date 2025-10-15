# @ldesign/template 集成方式对比

## 🚫 优化前 - 繁琐的手动配置

```typescript
// main.ts - 需要写很多代码
import { createTemplateManager } from '@ldesign/template'

// 创建模板管理器
const templateManager = createTemplateManager({
  cache: {
    enabled: true,
    maxSize: 50,
    ttl: 3600000
  },
  device: {
    detectOnMount: true,
    detectOnResize: true
  }
})

// 手动注册内置模板
console.log('🎯 注册内置模板...')
const { registerBuiltinTemplates } = await import('@ldesign/template/src/templates')
registerBuiltinTemplates(templateManager)
console.log('✅ 模板注册完成')

// 调试：查看注册的模板
console.log('📋 已注册的模板：')
const allTemplates = templateManager.query({})
console.log('模板总数：', allTemplates.length)
allTemplates.forEach((t) => {
  console.log(`  - ${t.id}: ${t.metadata.displayName} (device: ${t.metadata.device}, category: ${t.metadata.category})`)
})

// 查看login分类的模板
const loginTemplates = templateManager.query({ category: 'login' })
console.log('Login模板数量：', loginTemplates.length)

// 在 setupApp 中还需要手动注册组件
setupApp: async (app) => {
  // 手动注册 Template 管理器和组件
  const { TEMPLATE_MANAGER_KEY, TemplateRenderer, TemplateSelector, EnhancedTemplateSwitcher } = await import('@ldesign/template')
  
  // 使用两种方式注入，确保兼容性
  app.provide(TEMPLATE_MANAGER_KEY, templateManager)
  app.provide('templateManager', templateManager)
  app.config.globalProperties.$templateManager = templateManager
  
  // 手动注册每个组件
  app.component('TemplateRenderer', TemplateRenderer)
  app.component('TemplateSelector', TemplateSelector)
  app.component('EnhancedTemplateSwitcher', EnhancedTemplateSwitcher)
}
```

**问题：**
- ❌ 代码冗长，需要手动处理很多细节
- ❌ 容易遗漏配置项
- ❌ 调试信息需要手动编写
- ❌ 组件需要逐个注册
- ❌ 不够直观，难以维护

---

## ✅ 优化后 - 优雅的插件方式

```typescript
// main.ts - 极简配置
import { createTemplatePlugin } from '@ldesign/template'

// 创建插件 - 一行代码搞定所有默认配置
const templatePlugin = createTemplatePlugin({
  debug: import.meta.env.DEV  // 开发环境自动开启调试
})

// 在 setupApp 中一行安装
setupApp: async (app) => {
  app.use(templatePlugin)  // 完成！
}
```

**或者使用更简单的方式：**

```typescript
// 直接在创建 app 后使用
const app = createApp(App)
app.use(createTemplatePlugin())  // 使用默认配置
app.mount('#app')
```

**优势：**
- ✅ **极简配置** - 一行代码完成所有设置
- ✅ **智能默认值** - 自动配置最佳实践参数
- ✅ **自动注册** - 内置模板和组件全自动注册
- ✅ **调试友好** - 开发环境自动输出有用信息
- ✅ **扩展便利** - 支持自定义模板注册回调

---

## 📊 代码量对比

| 配置项 | 优化前 | 优化后 |
|--------|--------|--------|
| 代码行数 | 40+ 行 | 3-5 行 |
| 导入项 | 5+ 个 | 1 个 |
| 手动操作 | 10+ 步 | 1 步 |
| 易错点 | 多处 | 几乎没有 |

---

## 🎯 插件自动处理的事项

使用 `createTemplatePlugin()` 后，以下所有工作都会自动完成：

1. **模板管理器创建**
   - ✅ 创建 TemplateManager 实例
   - ✅ 配置缓存策略
   - ✅ 设置设备检测

2. **内置模板注册**
   - ✅ 自动注册所有登录模板（6个）
   - ✅ 自动注册所有仪表板模板（6个）
   - ✅ 支持懒加载优化

3. **Vue 组件注册**
   - ✅ TemplateRenderer
   - ✅ EnhancedTemplateSwitcher
   - ✅ TemplateSelector
   - ✅ 其他辅助组件

4. **全局注入**
   - ✅ provide/inject 支持
   - ✅ 全局属性 $templateManager
   - ✅ 全局属性 $template 快捷方法

5. **调试支持**
   - ✅ 开发环境自动输出注册信息
   - ✅ 模板统计信息
   - ✅ 组件注册日志

---

## 🚀 最佳实践

### 基础使用
```typescript
// 99% 的场景，使用默认配置即可
app.use(createTemplatePlugin())
```

### 开发调试
```typescript
// 开发时开启调试
app.use(createTemplatePlugin({
  debug: true
}))
```

### 高级配置
```typescript
// 需要自定义时
app.use(createTemplatePlugin({
  debug: import.meta.env.DEV,
  cache: {
    maxSize: 100,  // 增加缓存大小
  },
  registerCustomTemplates: (manager) => {
    // 注册项目特定的模板
    manager.register(
      'custom',
      'desktop', 
      'special',
      { ... },
      () => import('./my-template.vue')
    )
  }
}))
```

---

## 总结

通过创建 Vue 插件包装器，我们将原本 40+ 行的配置代码简化到了 **仅需 1 行**，大大提升了开发体验和代码可维护性。这就是良好的 API 设计带来的价值！