# LDesign 统一国际化方案

## 概述

本方案实现了应用层与 packages（size、color）的国际化统一联动，当应用语言切换时，所有组件的文本会自动响应更新。

## 架构设计

### 核心思路

1. **应用层提供响应式 locale**：在 `app_simple` 中通过 `provide` 提供全局响应式的 `locale`
2. **Packages 通过 inject 获取**：`size` 和 `color` 通过 `inject` 获取并响应变化
3. **内置翻译 + 应用层覆盖**：每个 package 内置默认翻译，可被应用层覆盖

### 数据流

```
用户切换语言
    ↓
i18n.on('localeChanged') 
    ↓
更新 globalLocale.value
    ↓
自动触发所有 inject 了 'app-locale' 的组件更新
    ↓
size/color 组件文本自动切换
```

## 实现细节

### 1. 应用层配置 (app_simple/src/main.ts)

```typescript
import { ref } from 'vue'

// 全局响应式 locale 状态
const globalLocale = ref('zh-CN')

// 在 setupApp 中 provide
app.provide('app-locale', globalLocale)

// 监听 i18n 语言变化，同步更新 globalLocale
i18n.on('localeChanged', (newLocale: string) => {
  globalLocale.value = newLocale
})
```

### 2. Size 包配置

#### 内置翻译 (packages/size/src/locales/index.ts)

```typescript
export const zhCN: SizeLocale = {
  title: '调整尺寸',
  presets: {
    compact: '紧凑',
    comfortable: '舒适',
    // ...
  },
  descriptions: {
    compact: '高密度，最大化内容显示',
    // ...
  }
}
```

#### 组件使用 (SizeSelector.vue)

```typescript
// 优先使用应用层的响应式 locale
const appLocale = inject<any>('app-locale', null)
const pluginLocale = inject(SIZE_LOCALE_KEY, 'zh-CN')

const currentLocale = computed(() => {
  if (appLocale && appLocale.value) {
    return appLocale.value  // 应用层 locale
  }
  return pluginLocale  // 插件配置 locale
})

const t = computed(() => {
  return getLocale(currentLocale.value)
})
```

### 3. Color 包配置

#### 内置翻译 (packages/color/src/locales/index.ts)

```typescript
export const zhCN: ColorLocale = {
  theme: {
    selectThemeColor: '选择主题色',
    customColor: '自定义颜色',
    presets: {
      blue: '蓝色',
      green: '绿色',
      // ...
    }
  }
}
```

#### 组件使用 (ThemePicker.vue)

```typescript
// 响应式国际化
const appLocale = inject<any>('app-locale', null)

const currentLocale = computed(() => {
  if (appLocale && appLocale.value) {
    return appLocale.value
  }
  return 'zh-CN'
})

const locale = computed(() => getLocale(currentLocale.value))

const t = (key: string, fallback?: string): string => {
  // 支持嵌套 key，如 'theme.presets.blue'
  const keys = key.split('.')
  let value: any = locale.value
  for (const k of keys) {
    value = value?.[k]
  }
  return typeof value === 'string' ? value : (fallback || key)
}
```

## 支持的语言

### 当前支持

- `zh-CN` / `zh` - 简体中文
- `en-US` / `en` - 英语

### 添加新语言

在各 package 的 `locales/index.ts` 中添加：

```typescript
export const jaJP: SizeLocale = {
  title: 'サイズを調整',
  presets: {
    compact: 'コンパクト',
    // ...
  }
}

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,  // 新增
}
```

## 优点

### ✅ 解耦性好
- Size 和 Color 不直接依赖 i18n package
- 可以独立使用，也可以接入应用的 i18n

### ✅ 响应式
- 使用 Vue 的响应式系统
- 语言切换自动触发组件更新
- 无需手动刷新

### ✅ 灵活性强
- 内置默认翻译（独立使用）
- 支持应用层覆盖（集成使用）
- 支持自定义翻译

### ✅ 易维护
- 统一的命名规范
- 清晰的数据流向
- 类型安全（TypeScript）

### ✅ 易扩展
- 添加新语言简单
- 添加新文本简单
- 不影响现有功能

## 使用示例

### 独立使用 (不依赖应用 i18n)

```typescript
app.use(sizePlugin, {
  locale: 'en-US'
})
```

### 集成使用 (跟随应用 i18n)

```typescript
// 应用层自动 provide 'app-locale'
// size 和 color 会自动使用应用的语言设置
```

### 自定义翻译

```typescript
app.use(sizePlugin, {
  customLocale: {
    title: '我的尺寸选择器',
    presets: {
      compact: '我的紧凑模式'
    }
  }
})
```

## 测试方法

1. 启动应用：`npm run dev`
2. 点击导航栏的语言切换器（中文/English）
3. 观察 Size 选择器和 Color 选择器的文本
4. 应该立即看到所有文本切换到对应语言

## 注意事项

- ⚠️ 确保应用层 provide 的 key 为 `'app-locale'`
- ⚠️ globalLocale 必须是响应式的 `ref`
- ⚠️ 添加新翻译时保持 key 结构一致
- ⚠️ 翻译 fallback 机制确保即使缺少翻译也能正常显示
