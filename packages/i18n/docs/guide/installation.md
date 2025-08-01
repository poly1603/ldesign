# 安装指南

本页面详细介绍如何在不同环境中安装和配置 @ldesign/i18n。

## 系统要求

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0 (可选，但推荐)
- **Vue**: >= 3.0.0 (仅在使用 Vue 集成时需要)

## 包管理器安装

### 使用 pnpm (推荐)

```bash
pnpm add @ldesign/i18n
```

### 使用 npm

```bash
npm install @ldesign/i18n
```

### 使用 yarn

```bash
yarn add @ldesign/i18n
```

## CDN 安装

### 通过 unpkg

```html
<!-- 开发版本 -->
<script src="https://unpkg.com/@ldesign/i18n/dist/index.js"></script>

<!-- 生产版本（压缩） -->
<script src="https://unpkg.com/@ldesign/i18n/dist/index.min.js"></script>

<!-- Vue 集成 -->
<script src="https://unpkg.com/@ldesign/i18n/dist/vue.min.js"></script>

```

### 通过 jsDelivr

```html
<!-- 最新版本 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/i18n/dist/index.min.js"></script>

<!-- 指定版本 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/i18n@0.1.0/dist/index.min.js"></script>

```

## 不同环境的安装配置

### Node.js 环境

```javascript
// CommonJS
const { createI18nWithBuiltinLocales } = require('@ldesign/i18n')

// ES Modules
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'
```

### 浏览器环境

```html
<!doctype html>
<html>
  <head>
    <script src="https://unpkg.com/@ldesign/i18n/dist/index.min.js"></script>
  </head>
  <body>
    <script>
      // 全局变量 LDesignI18n 可用
      const { createI18nWithBuiltinLocales } = LDesignI18n

      createI18nWithBuiltinLocales({
        defaultLocale: 'en',
      }).then((i18n) => {
        console.log(i18n.t('common.ok'))
      })
    </script>
  </body>
</html>

```

### Webpack 环境

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@ldesign/i18n': '@ldesign/i18n/es'
    }
  }
}
```

### Vite 环境

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/i18n': '@ldesign/i18n/es'
    }
  }
})
```

## TypeScript 配置

### 基础配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

### 类型声明

如果使用 TypeScript，类型定义会自动包含。如果遇到类型问题，可以手动引入：

```typescript
// types/i18n.d.ts
import '@ldesign/i18n'
```

### Vue 项目的类型配置

```typescript
import type { I18nInstance, TranslationFunction } from '@ldesign/i18n'
// types/vue.d.ts
import '@vue/runtime-core'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: TranslationFunction
    $i18n: I18nInstance
  }
}
```

## 按需导入

@ldesign/i18n 支持按需导入以减少打包体积：

```typescript
// 导入核心功能
import { I18n } from '@ldesign/i18n'

// 导入特定组件
import { BrowserDetector } from '@ldesign/i18n/core/detector'
import { StaticLoader } from '@ldesign/i18n/core/loader'
import { LocalStorage } from '@ldesign/i18n/core/storage'

// 导入语言包
import enPackage from '@ldesign/i18n/locales/en'
import zhCNPackage from '@ldesign/i18n/locales/zh-CN'

// 导入工具函数
import { interpolate } from '@ldesign/i18n/utils/interpolation'
import { getNestedValue } from '@ldesign/i18n/utils/path'
```

## 验证安装

创建一个简单的测试文件来验证安装是否成功：

```typescript
// test-installation.js
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'

async function testInstallation() {
  try {
    const i18n = await createI18nWithBuiltinLocales({
      defaultLocale: 'en'
    })

    console.log('✅ 安装成功!')
    console.log('当前语言:', i18n.getCurrentLanguage())
    console.log('测试翻译:', i18n.t('common.ok'))

    // 测试语言切换
    await i18n.changeLanguage('zh-CN')
    console.log('切换后翻译:', i18n.t('common.ok'))
  }
  catch (error) {
    console.error('❌ 安装验证失败:', error)
  }
}

testInstallation()
```

运行测试：

```bash
node test-installation.js
```

预期输出：

```
✅ 安装成功!
当前语言: en
测试翻译: OK
切换后翻译: 确定
```

## 常见问题

### Q: 安装后提示模块找不到

**A:** 检查以下几点：

1. 确认包已正确安装：`npm list @ldesign/i18n`
2. 检查 Node.js 版本是否 >= 16.0.0
3. 清除缓存：`npm cache clean --force`

### Q: TypeScript 类型错误

**A:** 确保：

1. TypeScript 版本 >= 4.5.0
2. 在 tsconfig.json 中启用 `moduleResolution: "bundler"`
3. 重启 TypeScript 服务

### Q: 在 Vue 项目中使用时出现类型错误

**A:** 添加类型声明文件：

```typescript
import type { I18nInstance, TranslationFunction } from '@ldesign/i18n'
// src/types/vue.d.ts
import '@vue/runtime-core'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: TranslationFunction
    $i18n: I18nInstance
  }
}
```

### Q: 打包体积过大

**A:** 使用按需导入：

```typescript
// 不推荐：导入整个库
import * as I18n from '@ldesign/i18n'

// 推荐：按需导入
import { I18n, StaticLoader } from '@ldesign/i18n'
import { BrowserDetector } from '@ldesign/i18n/core/detector'
```

### Q: 在服务端渲染 (SSR) 中使用

**A:** 禁用浏览器相关功能：

```typescript
const i18n = await createI18nWithBuiltinLocales({
  defaultLocale: 'en',
  autoDetect: false, // 禁用浏览器语言检测
  storage: 'none' // 禁用本地存储
})
```

## 下一步

安装完成后，建议阅读：

- [快速开始](/guide/getting-started) - 学习基本用法
- [基础概念](/guide/concepts) - 了解核心概念
- [Vue 3 集成](/guide/vue-integration) - Vue 项目集成指南
