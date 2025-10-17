# LDesign 多语言支持

> 最后更新：2025-01-17

LDesign 生态系统的各个包现已支持 **10 种主流语言**，覆盖全球主要市场。

## 🌍 支持的语言

| 语言代码 | 语言 | 包支持情况 | 覆盖地区 |
|---------|------|-----------|---------|
| `zh-CN` | 简体中文 | ✅ 所有包 | 中国大陆 |
| `en-US` | 英语 | ✅ 所有包 | 美国、英国、加拿大、澳大利亚等 |
| `ja-JP` | 日语 | ✅ color, size | 日本 |
| `ko-KR` | 韩语 | ✅ color, size | 韩国 |
| `de-DE` | 德语 | ✅ color, size | 德国、奥地利、瑞士 |
| `fr-FR` | 法语 | ✅ color, size | 法国、比利时、瑞士、加拿大 |
| `es-ES` | 西班牙语 | ✅ color, size | 西班牙、拉丁美洲 |
| `it-IT` | 意大利语 | ✅ color, size | 意大利 |
| `pt-BR` | 葡萄牙语 | ✅ color, size | 巴西、葡萄牙 |
| `ru-RU` | 俄语 | ✅ color, size | 俄罗斯、东欧 |

### 语言代码缩写

所有语言都支持缩写形式（如 `zh`, `en`, `ja` 等），系统会自动映射到完整的语言代码。

```typescript
// 这些都是有效的
getLocale('zh')    // → zhCN
getLocale('zh-CN') // → zhCN
getLocale('en')    // → enUS
getLocale('en-US') // → enUS
```

## 📦 各包的多语言实现

### @ldesign/i18n

核心国际化引擎，提供：
- 框架无关的 i18n 核心
- 完整的翻译管理
- 动态加载和缓存
- 插值、复数、格式化

**使用方式：**
```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': { hello: '你好' },
    'en-US': { hello: 'Hello' }
  }
})
```

### @ldesign/size

尺寸选择器的内置翻译，支持 10 种语言。

**接口定义：**
```typescript
interface SizeLocale {
  title: string              // "调整尺寸"
  close: string              // "关闭"
  ariaLabel: string          // "调整尺寸"
  presets: {
    compact: string          // "紧凑"
    comfortable: string      // "舒适"
    default: string          // "默认"
    spacious: string         // "宽松"
    'extra-compact': string  // "超紧凑"
    'extra-spacious': string // "超宽松"
  }
  descriptions: {
    compact: string          // 描述文本
    comfortable: string
    default: string
    spacious: string
    'extra-compact': string
    'extra-spacious': string
  }
}
```

**使用方式：**
```typescript
import { zhCN, enUS, jaJP, getLocale } from '@ldesign/size'

// 直接使用
const locale = zhCN

// 动态获取
const locale = getLocale('ja-JP')

// 在插件中使用
const sizePlugin = createSizePlugin({
  locale: ref('zh-CN')
})
```

### @ldesign/color

颜色选择器的内置翻译，支持 10 种语言。

**接口定义：**
```typescript
interface ColorLocale {
  theme: {
    title: string                 // "主题色"
    selectThemeColor: string      // "选择主题色"
    customColor: string           // "自定义颜色"
    custom: string                // "当前颜色"
    apply: string                 // "应用"
    addCustomTheme: string        // "添加自定义主题"
    themeName: string             // "主题名称"
    add: string                   // "添加"
    remove: string                // "移除"
    confirmRemove: string         // "确定移除主题 "%s" 吗？"
    searchPlaceholder: string     // "搜索颜色..."
    presets: {
      blue: string                // "蓝色"
      cyan: string                // "青色"
      green: string               // "绿色"
      orange: string              // "橙色"
      red: string                 // "红色"
      purple: string              // "紫色"
      pink: string                // "粉色"
      gray: string                // "灰色"
      yellow: string              // "黄色"
      teal: string                // "青绿色"
      indigo: string              // "靛蓝"
      lime: string                // "青柠"
      sunset: string              // "日落橙"
      forest: string              // "森林绿"
      midnight: string            // "午夜蓝"
      lavender: string            // "薰衣草"
      coral: string               // "珊瑚红"
    }
  }
  themeMode: {
    light: string                 // "浅色"
    dark: string                  // "深色"
    system: string                // "跟随系统"
  }
}
```

**使用方式：**
```typescript
import { zhCN, enUS, deDE, getLocale } from '@ldesign/color'

// 直接使用
const locale = zhCN

// 动态获取
const locale = getLocale('de-DE')

// 在插件中使用
const colorPlugin = createColorPlugin({
  locale: ref('zh-CN')
})
```

## 🔧 使用示例

### 1. 基础使用

```typescript
import { createSizePlugin, getLocale } from '@ldesign/size'

const locale = getLocale('ja-JP')
console.log(locale.title) // "サイズ調整"
console.log(locale.presets.compact) // "コンパクト"
```

### 2. Vue 集成

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { createSizePlugin } from '@ldesign/size'

const currentLocale = ref('zh-CN')
const sizePlugin = createSizePlugin({
  locale: currentLocale
})

// 切换语言
const changeLanguage = (newLocale: string) => {
  currentLocale.value = newLocale
}
</script>

<template>
  <div>
    <button @click="changeLanguage('en-US')">English</button>
    <button @click="changeLanguage('ja-JP')">日本語</button>
    <button @click="changeLanguage('zh-CN')">中文</button>
  </div>
</template>
```

### 3. Engine 集成

```typescript
import { createEngineApp } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createSizeEnginePlugin } from '@ldesign/size'
import { createColorEnginePlugin } from '@ldesign/color'

// 创建 i18n 插件（单一数据源）
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  messages: { /* 你的翻译 */ }
})

// 其他插件共享语言状态
const engine = await createEngineApp({
  plugins: [
    i18nPlugin,
    createSizeEnginePlugin({
      locale: i18nPlugin.localeRef
    }),
    createColorEnginePlugin({
      locale: i18nPlugin.localeRef
    })
  ]
})

// 切换语言（所有插件自动同步）
await i18nPlugin.api.changeLocale('en-US')
```

## 📊 翻译完整度

### Size 包

| 语言 | 字段数 | 完成度 | 审核状态 |
|------|--------|--------|----------|
| 简体中文 | 14 | 100% | ✅ 已审核 |
| 英语 | 14 | 100% | ✅ 已审核 |
| 日语 | 14 | 100% | ⚠️ 待审核 |
| 韩语 | 14 | 100% | ⚠️ 待审核 |
| 德语 | 14 | 100% | ⚠️ 待审核 |
| 法语 | 14 | 100% | ⚠️ 待审核 |
| 西班牙语 | 14 | 100% | ⚠️ 待审核 |
| 意大利语 | 14 | 100% | ⚠️ 待审核 |
| 葡萄牙语 | 14 | 100% | ⚠️ 待审核 |
| 俄语 | 14 | 100% | ⚠️ 待审核 |

### Color 包

| 语言 | 字段数 | 完成度 | 审核状态 |
|------|--------|--------|----------|
| 简体中文 | 28 | 100% | ✅ 已审核 |
| 英语 | 28 | 100% | ✅ 已审核 |
| 日语 | 28 | 100% | ⚠️ 待审核 |
| 韩语 | 28 | 100% | ⚠️ 待审核 |
| 德语 | 28 | 100% | ⚠️ 待审核 |
| 法语 | 28 | 100% | ⚠️ 待审核 |
| 西班牙语 | 28 | 100% | ⚠️ 待审核 |
| 意大利语 | 28 | 100% | ⚠️ 待审核 |
| 葡萄牙语 | 28 | 100% | ⚠️ 待审核 |
| 俄语 | 28 | 100% | ⚠️ 待审核 |

## 🤝 贡献翻译

我们欢迎母语者帮助审核和改进翻译！

### 如何贡献

1. **审核现有翻译**
   - Fork 仓库
   - 检查你的母语翻译
   - 提交 PR 说明改进建议

2. **添加新语言**
   ```typescript
   // 在 packages/size/src/locales/index.ts 中添加
   export const frCA: SizeLocale = {
     title: 'Ajuster la taille',
     // ... 其他字段
   }
   
   // 添加到 locales 对象
   export const locales = {
     // ...
     'fr-CA': frCA
   }
   ```

3. **报告翻译问题**
   - 在 GitHub Issues 中创建问题
   - 标签：`i18n`, `translation`
   - 说明具体的问题和建议

### 翻译指南

1. **保持简洁**: UI 文本应简短明了
2. **保持一致**: 同一概念使用相同的词汇
3. **考虑语境**: 注意文化差异和习惯用法
4. **测试验证**: 在实际 UI 中查看翻译效果

## 🔮 未来计划

### 短期（1-2 个月）

- [ ] 母语者审核所有翻译
- [ ] 添加翻译自动化测试
- [ ] 创建翻译管理工具

### 中期（3-6 个月）

- [ ] 支持更多语言（阿拉伯语、泰语、越南语等）
- [ ] RTL（从右到左）语言支持
- [ ] 地区变体支持（如 en-GB, es-MX）

### 长期（6+ 个月）

- [ ] 众包翻译平台
- [ ] AI 辅助翻译
- [ ] 翻译质量评分系统

## 📚 相关资源

- [多语言集成架构](../architecture/i18n-integration.md)
- [@ldesign/i18n 文档](../../packages/i18n/README.md)
- [贡献指南](../../CONTRIBUTING.md)

## 🙏 鸣谢

感谢所有为 LDesign 多语言支持做出贡献的开发者和翻译者！

特别感谢：
- 简体中文：LDesign Team
- 英语：LDesign Team
- 日语：AI 翻译 + 待审核
- 韩语：AI 翻译 + 待审核
- 德语：AI 翻译 + 待审核
- 法语：AI 翻译 + 待审核
- 西班牙语：AI 翻译 + 待审核
- 意大利语：AI 翻译 + 待审核
- 葡萄牙语：AI 翻译 + 待审核
- 俄语：AI 翻译 + 待审核

> 注：AI 翻译的内容需要母语者审核和校对，欢迎提交改进建议！

---

**维护者**: LDesign Team  
**最后更新**: 2025-01-17
