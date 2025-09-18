# 简化版模板系统

## 核心理念

**简单就是美！**

- 无需生成清单文件
- 无需复杂的注册流程
- `import.meta.glob` 一次搞定所有扫描
- 打包时自动处理，无需额外配置

## 工作原理

```typescript
// 扫描器在初始化时执行一次
private configModules = import.meta.glob('../templates/**/config.{js,ts}')
private componentModules = import.meta.glob('../templates/**/index.vue')
```

**关键点：**
- `import.meta.glob` 在构建时会被 Vite/Rollup 静态分析
- 匹配的文件会自动打包进最终产物
- 打包后这些导入会变成静态的代码分割点

## 使用方法

### 1. 基础使用

```typescript
import { simpleTemplateScanner } from '@ldesign/template'

// 获取异步组件
const component = simpleTemplateScanner.getAsyncComponent(
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

### 2. 使用 Hook

```typescript
import { useTemplate } from '@ldesign/template'

const { 
  currentComponent,  // 当前模板组件（异步加载）
  switchTemplate,    // 切换模板
  loading,          // 加载状态
  error             // 错误信息
} = useTemplate({
  category: 'login',
  device: 'desktop'
})
```

### 3. 获取模板信息

```typescript
// 获取配置
const config = await simpleTemplateScanner.getConfig('login', 'desktop', 'default')

// 获取元数据
const metadata = await simpleTemplateScanner.getMetadata('login', 'desktop', 'default')

// 获取模板列表
const templates = await simpleTemplateScanner.getTemplates('login', 'desktop')

// 检查模板是否存在
const exists = simpleTemplateScanner.hasTemplate('login', 'desktop', 'default')
```

## 添加新模板

只需按照约定的目录结构添加文件：

```
src/templates/
  └── {category}/           # 分类（如 login, dashboard）
      └── {device}/         # 设备类型（desktop, tablet, mobile）
          └── {name}/       # 模板名称
              ├── index.vue # 模板组件
              └── config.ts # 模板配置
```

**config.ts 示例：**
```typescript
export default {
  name: 'my-template',
  displayName: '我的模板',
  description: '模板描述',
  version: '1.0.0',
  author: 'author',
  tags: ['custom']
}
```

**index.vue 示例：**
```vue
<template>
  <div class="my-template">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
// 模板逻辑
</script>

<style scoped>
/* 模板样式 */
</style>
```

## 异步组件特性

所有模板都通过 `defineAsyncComponent` 创建：

- **延迟加载**：200ms 延迟显示加载状态
- **超时控制**：30秒超时
- **自动重试**：失败时自动重试3次
- **性能优化**：组件缓存，避免重复创建

## 缓存机制

- **配置缓存**：已加载的配置会被缓存
- **组件缓存**：已创建的异步组件会被缓存
- **清空缓存**：`simpleTemplateScanner.clearCache()`

## 为什么能在打包后工作？

### Vite/Rollup 的处理

```typescript
// 源代码
import.meta.glob('../templates/**/index.vue')

// 打包后（简化示例）
{
  '../templates/login/desktop/default/index.vue': () => import('/assets/login-desktop-default-hash.js'),
  '../templates/login/desktop/modern/index.vue': () => import('/assets/login-desktop-modern-hash.js'),
  // ...
}
```

构建工具会：
1. 静态分析 glob 模式
2. 为每个匹配的文件创建独立的 chunk
3. 生成动态导入的映射表
4. 确保运行时能正确加载

## 最佳实践

### 1. 模板命名规范

- **category**: 使用小写，如 `login`, `dashboard`
- **device**: 必须是 `desktop`, `tablet`, `mobile` 之一
- **name**: 使用小写和连字符，如 `default`, `dark-mode`

### 2. 性能优化

```typescript
// 预加载可能用到的模板
const templates = await simpleTemplateScanner.getTemplates('login', 'desktop')
// 模板会在后台加载，但不会阻塞渲染
```

### 3. 错误处理

```typescript
const component = simpleTemplateScanner.getAsyncComponent('login', 'desktop', 'unknown')
if (!component) {
  // 处理模板不存在的情况
  console.error('Template not found')
}
```

## 对比之前的方案

| 特性 | 复杂方案 | 简化方案 |
|-----|---------|---------|
| 清单文件 | 需要生成 | 不需要 |
| 构建脚本 | 需要额外步骤 | 无需额外步骤 |
| 代码量 | 500+ 行 | 250 行 |
| 维护成本 | 高 | 低 |
| 打包兼容 | 需要特殊处理 | 自动兼容 |

## 常见问题

### Q: 为什么不需要生成清单文件？

A: `import.meta.glob` 在构建时会被静态分析，Vite/Rollup 会自动处理文件依赖和代码分割。

### Q: 大量模板会影响性能吗？

A: 不会。每个模板都是独立的 chunk，只有在实际使用时才会加载。

### Q: 如何调试模板加载？

A: 打开控制台，扫描器会输出详细的日志：
```
[SimpleTemplateScanner] Found 5 configs
[SimpleTemplateScanner] Found 5 components
```

### Q: 支持热更新吗？

A: 支持。开发环境下修改模板文件会自动触发热更新。

## 总结

简化版方案的优势：

1. **零配置**：无需任何额外配置
2. **自动化**：模板自动发现和加载
3. **高性能**：按需加载，智能缓存
4. **易维护**：代码简单，易于理解
5. **打包友好**：构建工具原生支持

**记住：约定优于配置，简单优于复杂！**