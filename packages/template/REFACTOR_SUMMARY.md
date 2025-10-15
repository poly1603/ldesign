# 模板系统重构总结

## 📋 重构概述

完全重写了 `@ldesign/template` 包，使用 `import.meta.glob` 实现自动化的模板扫描和加载系统。

## 🎯 重构目标

1. ✅ 使用 `import.meta.glob` 自动扫描所有模板
2. ✅ 支持开发环境（.ts）和生产环境（.js）
3. ✅ 模板组件懒加载，优化性能
4. ✅ 简化模板创建流程
5. ✅ 提供完整的 TypeScript 类型支持
6. ✅ 提供多种使用方式（API、Composables、Components）

## 📁 新的目录结构

```
src/
├── types/                      # 类型定义
│   └── index.ts               # 核心类型
├── core/                       # 核心模块
│   ├── scanner.ts             # 模板扫描器
│   ├── loader.ts              # 模板加载器
│   ├── manager.ts             # 模板管理器
│   └── index.ts
├── composables/                # Vue 组合式函数
│   ├── useTemplate.ts         # 模板相关 hooks
│   └── index.ts
├── components/                 # Vue 组件
│   ├── TemplateRenderer.vue   # 模板渲染组件
│   └── index.ts
├── templates/                  # 模板库
│   ├── login/                 # 登录模板
│   │   ├── desktop/
│   │   │   └── default/
│   │   │       ├── config.ts
│   │   │       └── index.vue
│   │   └── mobile/
│   │       └── default/
│   │           ├── config.ts
│   │           └── index.vue
│   └── dashboard/             # 仪表板模板
│       └── desktop/
│           └── default/
│               ├── config.ts
│               └── index.vue
├── index.ts                    # 主入口
└── README.md                   # 说明文档
```

## 🔑 核心组件

### 1. TemplateScanner (扫描器)

**文件**: `src/core/scanner.ts`

**功能**:
- 使用 `import.meta.glob` 自动扫描所有模板
- 支持 `.ts` 和 `.js` 配置文件
- 生成模板注册表
- 提供扫描统计信息

**关键代码**:
```typescript
const configModules = import.meta.glob(
  '/src/templates/**/config.{ts,js}',
  { eager: true }
)

const componentModules = import.meta.glob(
  '/src/templates/**/index.vue'
)
```

### 2. TemplateLoader (加载器)

**文件**: `src/core/loader.ts`

**功能**:
- 按需加载模板组件
- 组件缓存管理
- 加载去重处理
- 预加载支持
- 超时和错误处理

### 3. TemplateManager (管理器)

**文件**: `src/core/manager.ts`

**功能**:
- 统一的模板管理接口
- 初始化和扫描管理
- 模板查询功能
- 缓存管理

### 4. Vue 组合式函数

**文件**: `src/composables/useTemplate.ts`

**提供的 Hooks**:
- `useTemplate()` - 加载单个模板
- `useTemplateList()` - 查询模板列表
- `useDefaultTemplate()` - 获取默认模板
- `useTemplateManager()` - 使用管理器

### 5. TemplateRenderer 组件

**文件**: `src/components/TemplateRenderer.vue`

**功能**:
- 声明式模板渲染
- 内置加载状态
- 内置错误处理
- 自定义插槽支持

## 🎨 模板创建流程

### 旧方式（已废弃）
```
1. 创建模板组件
2. 手动注册到配置文件
3. 更新类型定义
4. 维护索引文件
```

### 新方式（自动化）
```
1. 创建目录: templates/{category}/{device}/{name}/
2. 创建 config.ts（模板元数据）
3. 创建 index.vue（模板组件）
4. 完成！系统自动扫描和注册
```

## 💻 使用示例

### 基础 API 使用

```typescript
import { getManager } from '@ldesign/template'

const manager = getManager()
await manager.initialize()

const component = await manager.loadTemplate('login', 'desktop', 'default')
```

### Vue 组合式函数

```vue
<script setup>
import { useTemplate } from '@ldesign/template'

const { component, loading, error } = useTemplate('login', 'desktop', 'default')
</script>

<template>
  <component :is="component" v-if="component" />
</template>
```

### TemplateRenderer 组件

```vue
<template>
  <TemplateRenderer
    category="login"
    device="desktop"
    name="default"
    @submit="handleSubmit"
  />
</template>
```

## 🔄 关键改进

### 1. 自动化
- ✅ 无需手动注册模板
- ✅ 自动扫描和发现
- ✅ 路径即配置

### 2. 类型安全
- ✅ 完整的 TypeScript 类型定义
- ✅ 类型推导和检查
- ✅ IDE 智能提示

### 3. 性能优化
- ✅ 配置 eager 加载（体积小）
- ✅ 组件懒加载
- ✅ 智能缓存
- ✅ 加载去重

### 4. 开发体验
- ✅ 简化的模板创建流程
- ✅ 清晰的目录结构
- ✅ 丰富的使用方式
- ✅ 完善的文档

### 5. 生产就绪
- ✅ 支持打包发布到 npm
- ✅ 兼容开发和生产环境
- ✅ 正确处理文件扩展名
- ✅ 路径自动转换

## 📦 打包说明

### import.meta.glob 处理

**开发环境**:
```typescript
import.meta.glob('/src/templates/**/config.ts', { eager: true })
```

**打包后**:
- Vite/Rollup 自动转换为实际的 import 语句
- 自动处理 `.ts` → `.js` 转换
- 生成正确的相对路径

### 文件扩展名兼容

使用 `config.{ts,js}` 模式同时匹配：
- 开发环境：`.ts` 文件
- 生产环境：`.js` 文件（编译后）

## 🔧 迁移指南

### 如果你是包的使用者

**无需改动**！新系统向后兼容，使用方式更简单。

### 如果你要创建新模板

**按照新流程**：
1. 创建目录结构
2. 添加 `config.ts` 和 `index.vue`
3. 系统自动识别

### 如果你有现有模板

**确保目录结构正确**：
```
templates/{category}/{device}/{name}/
  ├── config.ts
  └── index.vue
```

## 📚 相关文档

- **架构说明**: `ARCHITECTURE_NEW.md`
- **使用示例**: `USAGE_EXAMPLE.md`
- **README**: `src/README.md`

## 🎯 下一步

1. ✅ 核心系统完成
2. ✅ 示例模板创建
3. ⏳ 添加更多模板
4. ⏳ 编写测试用例
5. ⏳ 更新文档网站

## 🤝 贡献

欢迎提交新模板！遵循目录结构即可，系统会自动识别。

## 📝 总结

这次重构实现了真正的自动化模板管理系统，大幅简化了模板的创建和使用流程。通过 `import.meta.glob` 的强大功能，我们在保持灵活性的同时，提供了出色的开发体验。

**核心价值**：
- 零配置
- 自动化
- 类型安全
- 性能优化
- 易于使用
- 生产就绪

---

**重构完成时间**: 2025-10-15
**版本**: 0.2.0
**状态**: ✅ 完成
