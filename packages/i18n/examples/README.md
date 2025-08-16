# @ldesign/i18n 示例项目

本目录包含了 @ldesign/i18n 的完整使用示例，展示了如何在不同环境中集成和使用多语言功能。每个示例都是
一个完整的应用程序，演示了所有核心功能和最佳实践。

## ✨ 功能特性

两个示例都完整展示了以下功能：

- 🌍 **多语言支持**：英语、中文、日语完整翻译
- 🔄 **动态语言切换**：实时切换语言无需刷新页面
- 📝 **字符串插值**：支持 `{{variable}}` 语法的动态参数
- 🔢 **复数处理**：ICU 标准的复数规则支持
- 🏗️ **嵌套键**：层级化的翻译键组织
- ⚡ **批量翻译**：高效的多键翻译
- 🎯 **条件翻译**：基于条件的动态翻译
- 💾 **持久化存储**：语言偏好自动保存
- 🚨 **错误处理**：优雅的错误处理和用户反馈
- 📱 **响应式设计**：适配桌面和移动设备

## 📁 目录结构

```
examples/
├── vanilla/          # 原生 JavaScript 示例
│   ├── index.html   # 示例页面
│   ├── package.json # 项目配置
│   └── vite.config.js # Vite 配置
└── vue/             # Vue 3 示例
    ├── src/
    │   ├── App.vue  # 主组件
    │   └── main.ts  # 入口文件
    ├── index.html   # HTML 模板
    ├── package.json # 项目配置
    ├── vite.config.ts # Vite 配置
    └── tsconfig.json # TypeScript 配置
```

## 🚀 快速开始

### 前置条件

确保您已经构建了主项目：

```bash
# 在项目根目录
cd packages/i18n
pnpm install
pnpm build
```

### 运行 Vanilla JavaScript 示例

```bash
# 进入 vanilla 示例目录
cd examples/vanilla

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

示例将在 http://localhost:5174 启动，展示以下功能：

- ✅ **基础翻译**：`i18n.t('common.ok')` 简单键值翻译
- ✅ **字符串插值**：`i18n.t('common.pageOf', { current: 1, total: 10 })` 动态参数
- ✅ **复数处理**：`i18n.t('date.duration.minutes', { count: 5 })` ICU 复数规则
- ✅ **嵌套键访问**：`i18n.t('menu.file.new')` 层级化键结构
- ✅ **批量翻译**：`i18n.batchTranslate(['key1', 'key2'])` 高效批量处理
- ✅ **语言切换**：`i18n.changeLanguage('zh-CN')` 动态语言切换
- ✅ **语言信息获取**：`i18n.getCurrentLanguageInfo()` 语言元数据
- ✅ **交互式翻译键浏览器**：可展开的分类翻译键展示
- ✅ **实时示例演示**：所有功能的实时代码示例

### 运行 Vue 3 示例

```bash
# 进入 Vue 示例目录
cd examples/vue

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

示例将在 http://localhost:5173 启动，展示以下功能：

- ✅ **Vue 组合式 API**：`useI18n()` 钩子函数的完整使用
- ✅ **v-t 指令**：`<div v-t="'common.save'"></div>` 模板指令翻译
- ✅ **响应式语言切换**：`useLanguageSwitcher()` 响应式语言管理
- ✅ **条件翻译**：`useConditionalTranslation()` 基于条件的动态翻译
- ✅ **批量翻译**：`useBatchTranslation()` 响应式批量翻译
- ✅ **语言切换器组件**：带加载状态的语言切换按钮
- ✅ **全局属性**：模板中的 `$t` 函数使用
- ✅ **TypeScript 支持**：完整的类型安全
- ✅ **现代 Vue 3 特性**：Composition API + `<script setup>` 语法

## 📚 详细功能说明

### 🟡 Vanilla JavaScript 示例

**核心特性：**

- 纯 JavaScript ES6+ 模块化开发
- 手动 DOM 操作和事件处理
- 完整的错误处理和用户反馈
- 现代化的 UI 设计和交互

**代码示例：**

```javascript
// 初始化 i18n
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'

const i18n = await createI18nWithBuiltinLocales({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  storage: 'localStorage',
  autoDetect: true,
})

// 基础翻译
const okText = i18n.t('common.ok')

// 插值翻译
const pageText = i18n.t('common.pageOf', { current: 1, total: 10 })

// 复数处理
const minuteText = i18n.t('date.duration.minutes', { count: 5 })

// 语言切换
await i18n.changeLanguage('zh-CN')
```

### 🟢 Vue 3 示例

**核心特性：**

- Vue 3 Composition API + TypeScript
- 响应式数据和自动更新
- 组件化设计和可复用钩子
- 现代 Vue 开发最佳实践

**代码示例：**

```vue
<script setup lang="ts">
import {
  useI18n,
  useLanguageSwitcher,
  useBatchTranslation,
  useConditionalTranslation,
} from '@ldesign/i18n/vue'

// 基础翻译钩子
const { t, i18n } = useI18n()

// 语言切换钩子
const { locale, switchLanguage, isChanging } = useLanguageSwitcher()

// 批量翻译钩子
const batchTranslations = useBatchTranslation(['common.save', 'common.delete', 'common.edit'])

// 条件翻译钩子
const isOnline = ref(true)
const statusText = useConditionalTranslation(isOnline, 'common.online', 'common.offline')
</script>

<template>
  <!-- 基础翻译 -->
  <h1>{{ t('common.title') }}</h1>

  <!-- 指令翻译 -->
  <div v-t="'common.save'"></div>

  <!-- 插值翻译 -->
  <p>{{ t('common.pageOf', { current: 1, total: 10 }) }}</p>

  <!-- 语言切换 -->
  <button @click="switchLanguage('zh-CN')" :disabled="isChanging">中文</button>
</template>
```

## 🔧 自定义配置

### 修改端口

如果需要修改开发服务器端口，可以编辑对应的 `vite.config.js` 或 `vite.config.ts` 文件：

```javascript
// vanilla/vite.config.js
export default defineConfig({
  server: {
    port: 3000, // 修改为您想要的端口
    open: true,
  },
})
```

```typescript
// vue/vite.config.ts
export default defineConfig({
  server: {
    port: 3001, // 修改为您想要的端口
    open: true,
  },
})
```

### 添加新的语言

要添加新的语言支持，请参考主项目的语言包结构，在 `src/locales/` 目录下添加新的语言文件。

## 📝 构建生产版本

### Vanilla JavaScript 示例

```bash
cd examples/vanilla
pnpm build
```

构建产物将输出到 `dist/` 目录。

### Vue 3 示例

```bash
cd examples/vue
pnpm build
```

构建产物将输出到 `dist/` 目录，包含类型检查。

## 🐛 故障排除

### 常见问题

1. **模块找不到错误**

   - 确保已经构建了主项目：`cd packages/i18n && pnpm build`
   - 检查 vite.config 中的 alias 配置是否正确

2. **类型错误**

   - 确保 TypeScript 配置正确
   - 运行 `pnpm type-check` 检查类型问题

3. **端口冲突**
   - 修改 vite.config 中的端口配置
   - 或者使用 `pnpm dev --port 3002` 指定端口

### 获取帮助

如果遇到问题，请：

1. 检查控制台错误信息
2. 确认依赖安装正确
3. 查看主项目的 README.md 文档
4. 提交 Issue 到项目仓库
