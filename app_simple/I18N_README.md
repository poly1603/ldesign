# 🌍 LDesign Simple App 多语言功能使用指南

## ✅ 功能特性

应用现已完全支持国际化（i18n），具备以下功能：

- 🌐 **多语言支持**：内置中文（zh-CN）和英文（en-US）
- 💾 **持久化存储**：语言设置自动保存到 localStorage
- 🔄 **实时切换**：通过导航栏的语言切换器即时切换语言
- 🎯 **自动检测**：首次访问时自动检测浏览器语言
- 📦 **轻量实现**：使用简化的 i18n 实现，无需外部依赖

## 🚀 快速开始

### 启动应用
```bash
cd app_simple
pnpm dev
```

访问 http://localhost:3000

### 切换语言
1. 点击导航栏右侧的语言切换器（显示当前语言和国旗）
2. 在下拉菜单中选择想要的语言
3. 页面会自动刷新并应用新语言

## 📝 开发指南

### 在组件中使用多语言

```vue
<template>
  <div>
    <!-- 基本翻译 -->
    <h1>{{ t('home.title') }}</h1>
    
    <!-- 带参数的翻译 -->
    <p>{{ t('home.welcomeMessage', { name: 'John' }) }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t, locale, setLocale } = useI18n()

// 获取当前语言
console.log(locale.value) // 'zh-CN' or 'en-US'

// 切换语言
const changeLanguage = async () => {
  await setLocale('en-US')
}
</script>
```

### 添加新的翻译键

1. 编辑语言文件：
   - 中文：`src/locales/zh-CN.ts`
   - 英文：`src/locales/en-US.ts`

2. 添加翻译内容：
```typescript
// zh-CN.ts
export default {
  myModule: {
    newKey: '新的翻译文本',
    withParams: '你好，{name}！'
  }
}
```

3. 在组件中使用：
```vue
{{ t('myModule.newKey') }}
{{ t('myModule.withParams', { name: '张三' }) }}
```

## 📂 文件结构

```
app_simple/
├── src/
│   ├── i18n/
│   │   └── index.ts          # i18n 核心实现
│   ├── locales/
│   │   ├── index.ts          # 语言包索引
│   │   ├── zh-CN.ts          # 中文翻译
│   │   └── en-US.ts          # 英文翻译
│   ├── components/
│   │   └── LanguageSwitcher.vue  # 语言切换器组件
│   └── views/
│       ├── Home.vue          # ✅ 已国际化
│       ├── About.vue         # ✅ 已国际化
│       ├── Login.vue         # ✅ 已国际化
│       └── Dashboard.vue     # ✅ 已国际化
```

## 🎨 已翻译的内容

### 应用级别
- 应用名称和描述
- 导航菜单
- 页脚版权信息

### 页面内容
- **首页**：标题、副标题、特性列表、按钮文本
- **关于页**：项目介绍、技术栈、版本信息、团队信息
- **登录页**：表单标签、占位符、错误消息、按钮文本
- **仪表盘**：所有卡片标题、标签、操作按钮

### 通用文本
- 加载、错误、成功等状态文本
- 表单验证消息
- 日期时间格式
- 操作按钮文本

## 🔧 配置选项

在 `main.ts` 中配置 i18n 插件：

```typescript
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',              // 默认语言
  fallbackLocale: 'en-US',       // 回退语言
  detectBrowserLanguage: true,   // 自动检测浏览器语言
  persistLanguage: true,         // 持久化语言设置
  showMissingKeys: true          // 开发环境显示缺失的翻译键
})
```

## 🎯 最佳实践

1. **组织翻译键**：使用嵌套结构组织相关的翻译
2. **提供回退值**：使用 `||` 操作符提供默认值
   ```typescript
   t('some.key') || '默认文本'
   ```
3. **参数命名**：使用有意义的参数名
   ```typescript
   t('welcome', { username: 'John' })
   ```
4. **避免硬编码**：所有面向用户的文本都应该通过 i18n

## 🚧 后续优化

当 `@ldesign/i18n` 包构建问题解决后，可以：

1. 切换到完整的 i18n 实现
2. 获得更多高级功能：
   - 懒加载语言包
   - 复数处理
   - 日期/数字格式化
   - 命名空间支持
   - 插件系统

## 🎉 总结

现在你的应用已经完全支持多语言了！用户可以：
- 在中英文之间自由切换
- 语言设置会被记住
- 所有页面内容都会相应更新

享受你的国际化应用吧！ 🌍✨