# 🌐 i18n 国际化集成指南

本指南详细介绍了如何在 LDesign 主应用中使用 `@ldesign/i18n` 国际化组件库。

## 📋 目录

- [快速开始](#快速开始)
- [基础用法](#基础用法)
- [高级功能](#高级功能)
- [组件使用](#组件使用)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

## 🚀 快速开始

### 1. 依赖安装

i18n 组件库已经集成到主应用中，无需额外安装。

### 2. 自动初始化

应用启动时会自动初始化 i18n 系统：

```typescript
// src/main.ts
import { installI18nPlugin } from './i18n'

// 在 Vue 应用中安装 i18n 插件
await installI18nPlugin(vueApp)
```

### 3. 默认配置

- **默认语言**: 简体中文 (zh-CN)
- **备用语言**: 英语 (en)
- **支持语言**: 简体中文、英语、日语
- **存储方式**: localStorage
- **缓存**: 启用，最大 1000 条

## 📖 基础用法

### 1. 在组件中使用翻译

```tsx
import { useI18n } from '@ldesign/i18n/vue'

export default defineComponent({
  setup() {
    const { t, locale, changeLanguage } = useI18n()

    return () => (
      <div>
        <h1>{t('app.title')}</h1>
        <p>{t('pages.home.welcome')}</p>
        <span>当前语言: {locale.value}</span>
      </div>
    )
  },
})
```

### 2. 带参数的翻译

```tsx
// 简单插值
t('user.welcome', { name: 'John' })

// 复数处理
t('common.items', { count: 5 })
```

### 3. 语言切换

```tsx
import { changeLanguage } from '../i18n'

// 切换到英语
await changeLanguage('en')

// 切换到日语
await changeLanguage('ja')
```

## 🔧 高级功能

### 1. 自定义语言包

在 `src/i18n/locales/index.ts` 中添加自定义翻译：

```typescript
const zhCN: LanguagePackage = {
  info: {
    name: '简体中文',
    nativeName: '简体中文',
    code: 'zh-CN',
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
  },
  translations: {
    // 添加你的翻译内容
    myModule: {
      title: '我的模块',
      description: '这是一个自定义模块',
    },
  },
}
```

### 2. 命名空间使用

```tsx
// 使用命名空间访问翻译
t('myModule.title')
t('user.profile.settings')
```

### 3. 条件翻译

```tsx
import { useConditionalTranslation } from '@ldesign/i18n/vue'

const { conditionalT } = useConditionalTranslation()

// 根据条件选择不同的翻译键
const message = conditionalT(isError ? 'messages.error' : 'messages.success', { data: result })
```

### 4. 批量翻译

```tsx
import { useBatchTranslation } from '@ldesign/i18n/vue'

const { batchT } = useBatchTranslation()

const translations = batchT(['nav.home', 'nav.about', 'nav.contact'])
```

## 🎨 组件使用

### 1. 语言切换器

```tsx
import LanguageSwitcher from '../components/LanguageSwitcher'

// 在模板中使用
;<LanguageSwitcher />
```

### 2. 翻译指令

```tsx
// 使用 v-t 指令
<span v-t="'app.title'"></span>

// 带参数的指令
<span v-t="{ key: 'user.welcome', params: { name: 'John' } }"></span>
```

### 3. 全局属性

```tsx
// 在任何组件中使用全局属性
this.$t('app.title')
this.$i18n.changeLanguage('en')
```

## 💡 最佳实践

### 1. 翻译键命名规范

```typescript
// ✅ 推荐：使用层级结构
'pages.home.title'
'components.button.submit'
'messages.validation.required'

// ❌ 不推荐：扁平结构
'homeTitle'
'submitButton'
'requiredMessage'
```

### 2. 参数化翻译

```typescript
// ✅ 推荐：使用参数
'user.welcome': 'Welcome, {name}!'

// ❌ 不推荐：硬编码
'user.welcomeJohn': 'Welcome, John!'
```

### 3. 复数处理

```typescript
// ✅ 推荐：使用复数表达式
'items.count': '{count, plural, =0{no items} =1{one item} other{# items}}'

// ❌ 不推荐：多个键
'items.zero': 'no items'
'items.one': 'one item'
'items.many': '{count} items'
```

### 4. 性能优化

```tsx
// ✅ 推荐：缓存翻译结果
const { t } = useI18n()
const title = computed(() => t('app.title'))

// ❌ 不推荐：每次渲染都调用
return () => <h1>{t('app.title')}</h1>
```

## 🔍 故障排除

### 1. 翻译不显示

**问题**: 翻译键返回键名而不是翻译文本

**解决方案**:

- 检查翻译键是否正确
- 确认语言包中包含该键
- 检查当前语言是否正确

```tsx
// 调试翻译
console.log('Current locale:', locale.value)
console.log('Available keys:', getI18nInstance()?.getKeys())
console.log('Translation exists:', getI18nInstance()?.exists('your.key'))
```

### 2. 语言切换不生效

**问题**: 调用 `changeLanguage` 后界面没有更新

**解决方案**:

- 确保使用响应式的 `locale`
- 检查语言包是否正确加载
- 验证存储配置是否正确

```tsx
// 检查语言切换
const { locale } = useI18n()
watch(locale, newLocale => {
  console.log('Language changed to:', newLocale)
})
```

### 3. 类型错误

**问题**: TypeScript 类型检查失败

**解决方案**:

- 确保导入正确的类型
- 检查语言包结构是否符合 `LanguagePackage` 接口
- 使用类型断言处理复杂情况

```tsx
// 类型安全的翻译
const t = useI18n().t as (key: string, params?: any) => string
```

### 4. 构建错误

**问题**: 构建时出现模块解析错误

**解决方案**:

- 检查 `package.json` 中的依赖配置
- 确保 TypeScript 配置正确
- 验证导入路径是否正确

## 📚 API 参考

### useI18n()

```typescript
interface UseI18nReturn {
  t: TranslationFunction // 翻译函数
  locale: Ref<string> // 当前语言
  availableLanguages: Ref<LanguageInfo[]> // 可用语言列表
  changeLanguage: (locale: string) => Promise<void> // 切换语言
  exists: (key: string) => boolean // 检查键是否存在
  getKeys: () => string[] // 获取所有键
}
```

### 全局函数

```typescript
// 获取 i18n 实例
getI18nInstance(): I18nInstance | null

// 切换语言
changeLanguage(locale: string): Promise<void>

// 获取可用语言
getAvailableLanguages(): LanguageInfo[]

// 获取当前语言
getCurrentLanguage(): string
```

## 🎯 总结

通过本指南，你应该能够：

1. ✅ 在组件中正确使用翻译功能
2. ✅ 实现语言切换功能
3. ✅ 创建和管理自定义语言包
4. ✅ 使用高级功能如复数处理、批量翻译等
5. ✅ 遵循最佳实践编写可维护的国际化代码
6. ✅ 解决常见的集成问题

如果遇到其他问题，请查看 `@ldesign/i18n` 组件库的详细文档或提交 Issue。
