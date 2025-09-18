# 自动化模板系统使用指南

## 概述

新的自动化模板系统完全自动扫描和加载模板，无需手动维护模板列表。系统使用 `import.meta.glob` 自动扫描模板配置，并通过 `defineAsyncComponent` 动态加载模板组件。

## 核心特性

1. **完全自动化**：所有模板配置自动检索，无需手动维护
2. **动态加载**：使用 `defineAsyncComponent` 按需加载模板组件
3. **打包兼容**：通过清单机制支持 ldesign-builder 打包后的环境
4. **性能优化**：组件和配置缓存，避免重复加载
5. **智能回退**：多层回退机制，确保各种环境下都能工作

## 架构设计

```
┌─────────────────────────────────────────────┐
│           AutoTemplateScanner               │
├─────────────────────────────────────────────┤
│ • 单例模式，全局唯一实例                      │
│ • 自动初始化                                │
│ • 三层加载策略                              │
└─────────────────────────────────────────────┘
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│  Glob    │   │ Manifest │   │ Fallback │
│  扫描     │   │  清单     │   │  备用     │
└──────────┘   └──────────┘   └──────────┘
    开发环境       打包环境       应急方案
```

## 使用方法

### 基础使用

```typescript
import { autoTemplateScanner } from '@ldesign/template'

// 扫描器会自动初始化，无需手动调用
// 获取异步组件
const component = autoTemplateScanner.getAsyncComponent(
  'login',    // category
  'desktop',  // device
  'default'   // name
)

// 在 Vue 组件中使用
export default {
  components: {
    LoginTemplate: component
  }
}
```

### 在 useTemplate Hook 中使用

```typescript
import { useTemplate } from '@ldesign/template'

const { 
  currentComponent,  // 当前模板组件（自动加载）
  switchTemplate,    // 切换模板
  loading,          // 加载状态
  error             // 错误信息
} = useTemplate({
  category: 'login',
  device: 'desktop'
})
```

### 获取模板配置

```typescript
// 异步获取模板配置
const config = await autoTemplateScanner.getConfig('login', 'desktop', 'default')

// 获取完整的模板元数据
const metadata = await autoTemplateScanner.getMetadata('login', 'desktop', 'default')
```

### 获取模板列表

```typescript
// 获取指定分类和设备的所有模板
const templates = await autoTemplateScanner.getTemplates('login', 'desktop')

// 获取所有模板键
const keys = autoTemplateScanner.getTemplateKeys()
// ['login:desktop:default', 'login:desktop:modern', ...]
```

## 加载策略

### 1. 开发环境（import.meta.glob）

```typescript
// 自动扫描这些路径模式
const configs = import.meta.glob('../templates/**/config.{js,ts}')
const components = import.meta.glob('../templates/**/index.vue')
```

### 2. 打包环境（清单文件）

构建时自动生成 `__manifest__.json`：

```json
{
  "version": "1.0.0",
  "generated": "2025-09-18T02:58:52.733Z",
  "templates": [
    {
      "category": "login",
      "device": "desktop",
      "name": "default",
      "configPath": "./src/templates/login/desktop/default/config.ts",
      "componentPath": "./src/templates/login/desktop/default/index.vue"
    }
  ]
}
```

### 3. 应急备用（硬编码）

当前两种方式都失败时，使用硬编码的已知模板列表。

## 构建配置

### package.json

```json
{
  "scripts": {
    "generate:manifest": "node scripts/generate-manifest.js",
    "build": "npm run generate:manifest && ldesign-builder build"
  }
}
```

### 构建流程

1. 运行 `generate:manifest` 生成模板清单
2. 执行 `ldesign-builder build` 打包
3. 打包后的代码包含清单文件，确保模板可以被正确加载

## 异步组件特性

所有模板组件都是异步加载的：

```typescript
defineAsyncComponent({
  loader: async () => {
    const module = await import('./template.vue')
    return module.default || module
  },
  delay: 200,        // 延迟显示加载状态
  timeout: 30000,    // 加载超时
  suspensible: false,
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      retry()  // 重试3次
    } else {
      fail()
    }
  }
})
```

## 缓存机制

### 配置缓存

```typescript
private configCache = new Map<string, TemplateConfig>()
```

### 组件缓存

```typescript
private componentCache = new Map<string, Component>()
```

### 清空缓存

```typescript
// 清空所有缓存
autoTemplateScanner.clearCache()

// 重置扫描器（重新初始化）
await autoTemplateScanner.reset()
```

## 添加新模板

1. 创建模板目录结构：
```
src/templates/
  └── {category}/
      └── {device}/
          └── {name}/
              ├── index.vue    # 模板组件
              └── config.ts    # 模板配置
```

2. 创建配置文件 `config.ts`：
```typescript
export default {
  name: 'my-template',
  displayName: '我的模板',
  description: '模板描述',
  version: '1.0.0',
  author: 'author',
  tags: ['custom', 'special']
}
```

3. 创建组件文件 `index.vue`：
```vue
<template>
  <div class="my-template">
    <!-- 模板内容 -->
  </div>
</template>

<script setup>
// 模板逻辑
</script>
```

4. 重新生成清单（构建时自动执行）：
```bash
npm run generate:manifest
```

## 性能优化

1. **单例模式**：全局只有一个扫描器实例
2. **懒加载**：组件只在需要时加载
3. **缓存机制**：避免重复加载配置和组件
4. **并发控制**：初始化过程只执行一次
5. **智能重试**：失败时自动重试3次

## 调试

### 开启日志

所有关键操作都有日志输出：

```javascript
console.log('[AutoTemplateScanner] Starting initialization...')
console.log('[AutoTemplateScanner] Initialized with 5 templates')
```

### 检查加载状态

```typescript
// 检查是否已初始化
const keys = autoTemplateScanner.getTemplateKeys()
console.log('Available templates:', keys)
```

## 常见问题

### Q: 为什么开发环境找不到模板？

A: 检查以下路径模式是否正确：
- `/src/templates/**/config.{js,ts}`
- `../templates/**/config.{js,ts}`
- `../../src/templates/**/config.{js,ts}`

### Q: 打包后找不到模板？

A: 确保：
1. 运行了 `generate:manifest` 脚本
2. `__manifest__.json` 文件存在
3. 模板路径正确

### Q: 如何添加自定义模板加载器？

A: 可以扩展 `AutoTemplateScanner` 类或在加载前注入自定义逻辑。

## 总结

新的自动化模板系统通过以下方式解决了原有问题：

1. **自动扫描**：无需手动维护模板列表
2. **动态加载**：使用 `defineAsyncComponent` 实现真正的按需加载
3. **打包兼容**：通过清单机制支持各种构建环境
4. **性能优化**：多层缓存和智能加载策略
5. **开发友好**：简单的 API 和清晰的错误提示

系统设计遵循了"约定优于配置"的原则，只要按照约定的目录结构放置模板，系统就会自动识别和加载。