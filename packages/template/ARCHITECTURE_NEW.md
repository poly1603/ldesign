# 全新模板系统架构说明

## 🎯 设计目标

1. **自动化扫描**：使用 `import.meta.glob` 自动发现模板，无需手动注册
2. **环境兼容**：同时支持开发环境（TypeScript）和生产环境（打包后的 JavaScript）
3. **按需加载**：模板组件懒加载，优化初始加载性能
4. **类型安全**：完整的 TypeScript 类型定义
5. **易于使用**：提供多种使用方式，适配不同场景

## 🏗️ 核心架构

### 1. 扫描系统 (Scanner)

**职责**：自动发现和注册所有模板

**关键特性**：
- 使用 `import.meta.glob` 扫描匹配的文件
- 支持 `.ts` 和 `.js` 配置文件（开发 vs 生产）
- 配置文件使用 eager 模式同步加载
- 组件文件使用懒加载模式

**工作流程**：
```
1. 扫描 /src/templates/**/config.{ts,js} (eager)
2. 扫描 /src/templates/**/index.vue (lazy)
3. 解析路径，提取 category/device/name
4. 合并配置和路径信息，生成完整元数据
5. 注册到全局注册表
```

**关键代码**：
```typescript
// 同步加载所有配置
const configModules = import.meta.glob(
  '/src/templates/**/config.{ts,js}',
  { eager: true }
)

// 懒加载组件
const componentModules = import.meta.glob(
  '/src/templates/**/index.vue'
)
```

### 2. 加载系统 (Loader)

**职责**：按需加载模板组件

**关键特性**：
- 组件缓存：已加载的组件不重复加载
- 加载去重：同一组件同时多次请求只加载一次
- 超时控制：支持配置加载超时时间
- 错误处理：支持自定义错误处理函数

**加载流程**：
```
1. 检查缓存 → 命中则直接返回
2. 检查是否正在加载 → 是则返回现有 Promise
3. 从注册表获取加载器
4. 调用加载器加载组件
5. 缓存组件并返回
```

### 3. 管理系统 (Manager)

**职责**：统一管理扫描和加载，提供高层 API

**关键特性**：
- 初始化管理：自动调用扫描器
- 查询接口：提供多种模板查询方法
- 预加载：支持模板预加载
- 缓存管理：统一管理缓存

**API 层次**：
```
Manager (高层)
  ├── Scanner (扫描)
  └── Loader (加载)
```

## 📦 打包和发布

### import.meta.glob 的处理

`import.meta.glob` 是 Vite 提供的特殊语法，在构建时会被转换：

**开发环境**：
```typescript
import.meta.glob('/src/templates/**/config.ts', { eager: true })
```

**打包后（生产环境）**：
```javascript
{
  '/src/templates/login/desktop/default/config.js': () => import('./templates/login/desktop/default/config.js'),
  // ...
}
```

**关键点**：
1. Vite/Rollup 会在构建时解析 glob 模式
2. 自动处理文件扩展名转换（.ts → .js, .vue → .js）
3. 生成正确的相对路径引用
4. 保留懒加载特性

### 文件扩展名兼容

为了同时支持开发和生产环境，使用：

```typescript
'/src/templates/**/config.{ts,js}'  // 匹配 .ts 和 .js
```

- 开发时：匹配 `.ts` 文件
- 生产时：匹配编译后的 `.js` 文件

### Alias 处理

**开发环境**：
```typescript
// tsconfig.json
{
  "paths": {
    "@/templates/*": ["src/templates/*"]
  }
}
```

**生产环境**：
- Rollup 会解析 alias 并转换为相对路径
- 最终输出使用相对路径，不依赖 alias

## 🔄 工作流程

### 初始化流程

```
App 启动
  ↓
调用 getManager().initialize()
  ↓
Scanner.scan()
  ├── 加载所有配置文件 (eager)
  ├── 注册组件加载器 (lazy)
  └── 生成元数据和统计信息
  ↓
返回扫描结果
```

### 模板加载流程

```
用户请求模板
  ↓
Manager.loadTemplate()
  ↓
Loader.load()
  ├── 检查缓存
  ├── 检查加载中
  ├── 从注册表获取加载器
  ├── 执行加载
  └── 缓存结果
  ↓
返回 Vue 组件
```

### 组件渲染流程

```
TemplateRenderer
  ↓
useTemplate composable
  ↓
Manager.loadTemplate()
  ↓
<component :is="loadedComponent" />
```

## 🎨 模板结构

### 标准模板结构

```
templates/
  {category}/           # 模板分类
    {device}/           # 设备类型
      {name}/           # 模板名称
        config.ts       # 模板元数据
        index.vue       # 模板组件
```

### 配置文件 (config.ts)

```typescript
import type { TemplateConfig } from '@ldesign/template'

export default {
  name: 'default',           // 模板名称
  displayName: '默认登录',   // 显示名称
  description: '...',        // 描述
  version: '1.0.0',         // 版本
  author: 'LDesign Team',   // 作者
  tags: ['login', 'simple'], // 标签
  isDefault: true,          // 是否默认
  preview: '/previews/...', // 预览图
} as TemplateConfig
```

### 组件文件 (index.vue)

```vue
<template>
  <div class="template-wrapper">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
// 定义 Props
interface Props {
  title?: string
}

// 定义 Emits
const emit = defineEmits<{
  submit: [data: any]
}>()
</script>

<style scoped>
/* 样式 */
</style>
```

## 🔌 扩展点

### 1. 自定义扫描路径

可以修改 Scanner 中的 glob 模式：

```typescript
// 扫描特定分类
import.meta.glob('/src/templates/login/**/config.ts', { eager: true })

// 扫描多个目录
import.meta.glob([
  '/src/templates/**/config.ts',
  '/src/custom-templates/**/config.ts'
], { eager: true })
```

### 2. 自定义加载逻辑

继承 Loader 类并重写加载方法：

```typescript
class CustomLoader extends TemplateLoader {
  async load(category, device, name, options) {
    // 自定义加载前逻辑
    console.log('加载前...')
    
    const component = await super.load(category, device, name, options)
    
    // 自定义加载后逻辑
    console.log('加载后...')
    
    return component
  }
}
```

### 3. 添加中间件

在 Manager 中添加中间件支持：

```typescript
manager.use((context, next) => {
  console.log('加载:', context.category, context.device, context.name)
  return next()
})
```

## 🚀 性能优化

### 1. 配置文件优化

- 配置文件 eager 加载，体积小，影响不大
- 只包含元数据，不包含组件代码

### 2. 组件懒加载

- 组件按需加载，减少初始包体积
- 使用 Vue 的异步组件特性

### 3. 缓存策略

- 已加载组件缓存在内存
- 避免重复加载

### 4. 预加载策略

- 预加载常用模板
- 根据用户行为预测并预加载

## 🔒 类型安全

### 完整的类型定义

```typescript
// 所有核心类型都有定义
export type DeviceType = 'desktop' | 'mobile' | 'tablet'
export type TemplateCategory = 'login' | 'dashboard' | ...

// 接口定义
export interface TemplateMetadata { ... }
export interface TemplateConfig { ... }
export interface TemplateRegistryItem { ... }
```

### 类型推导

```typescript
// 自动推导返回类型
const { component, loading, error } = useTemplate(...)
// component: Ref<Component | null>
// loading: Ref<boolean>
// error: Ref<Error | null>
```

## 📊 系统优势

1. **零配置**：不需要手动注册模板
2. **灵活性**：支持多种使用方式
3. **性能好**：懒加载 + 缓存
4. **易维护**：清晰的目录结构
5. **可扩展**：提供多个扩展点
6. **类型安全**：完整的 TypeScript 支持
7. **环境兼容**：开发和生产环境都支持

## 🎓 总结

这个全新的模板系统通过 `import.meta.glob` 实现了真正的自动化，大幅降低了使用和维护成本。无论是开发还是打包后使用，都能无缝工作。
