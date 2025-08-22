# 翻译功能详解

本页面详细介绍 @ldesign/i18n 的翻译功能，包括基础翻译、高级特性和最佳实践。

## 基础翻译

### 简单翻译

最基本的翻译功能是通过键名获取对应的翻译文本：

```typescript
// 语言包内容
const translations = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
  },
}

// 使用翻译
i18n.t('common.ok') // "OK"
i18n.t('common.cancel') // "Cancel"
i18n.t('common.save') // "Save"
```

### 嵌套键访问

支持多层嵌套的键结构：

```typescript
const translations = {
  pages: {
    user: {
      profile: {
        title: 'User Profile',
        fields: {
          name: 'Full Name',
          email: 'Email Address',
          phone: 'Phone Number',
        },
      },
    },
  },
}

// 访问深层嵌套的键
i18n.t('pages.user.profile.title') // "User Profile"
i18n.t('pages.user.profile.fields.name') // "Full Name"
i18n.t('pages.user.profile.fields.email') // "Email Address"
```

### 数组索引访问

支持通过数组索引访问翻译：

```typescript
const translations = {
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

i18n.t('weekdays.0') // "Sunday"
i18n.t('weekdays.1') // "Monday"
```

## 参数插值

### 基础插值

使用双花括号语法进行参数替换：

```typescript
const translations = {
  greeting: 'Hello {{name}}!',
  welcome: 'Welcome back, {{user}}. You have {{count}} new messages.',
}

i18n.t('greeting', { name: 'John' })
// "Hello John!"

i18n.t('welcome', { user: 'Alice', count: 5 })
// "Welcome back, Alice. You have 5 new messages."
```

### 嵌套对象参数

支持嵌套对象作为参数：

```typescript
const translations = {
  userInfo: 'Name: {{user.name}}, Age: {{user.age}}, City: {{user.address.city}}',
}

i18n.t('userInfo', {
  user: {
    name: 'John Doe',
    age: 30,
    address: {
      city: 'New York',
    },
  },
})
// "Name: John Doe, Age: 30, City: New York"
```

### 格式化函数

支持自定义格式化函数：

```typescript
const translations = {
  price: 'Price: {{amount, currency}}',
  date: 'Date: {{timestamp, date}}',
}

// 注册格式化函数
i18n.addFormatter('currency', (value, locale) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
})

i18n.addFormatter('date', (value, locale) => {
  return new Intl.DateTimeFormat(locale).format(new Date(value))
})

i18n.t('price', { amount: 99.99 })
// "Price: $99.99"

i18n.t('date', { timestamp: Date.now() })
// "Date: 12/25/2023"
```

## 复数处理

### ICU 复数语法

支持 ICU MessageFormat 的复数语法：

```typescript
const translations = {
  items: '{count, plural, =0{no items} =1{one item} other{# items}}',
  messages: '{count, plural, =0{No messages} =1{One message} other{# messages}}',
}

i18n.t('items', { count: 0 }) // "no items"
i18n.t('items', { count: 1 }) // "one item"
i18n.t('items', { count: 5 }) // "5 items"
```

### 复杂复数规则

不同语言有不同的复数规则：

```typescript
// 英语复数规则
const enTranslations = {
  books: '{count, plural, =0{no books} =1{one book} other{# books}}',
}

// 俄语复数规则（更复杂）
const ruTranslations = {
  books: '{count, plural, =0{нет книг} =1{одна книга} few{# книги} many{# книг} other{# книги}}',
}

// 中文复数规则（无复数变化）
const zhTranslations = {
  books: '{count} 本书',
}
```

### 复数与插值结合

```typescript
const translations = {
  notification:
    'Hello {{name}}, you have {count, plural, =0{no new messages} =1{one new message} other{# new messages}}',
}

i18n.t('notification', { name: 'John', count: 3 })
// "Hello John, you have 3 new messages"
```

## 条件翻译

### 基于上下文的翻译

```typescript
const translations = {
  button: {
    _context: {
      save: 'Save',
      edit: 'Update',
      create: 'Create',
    },
  },
}

i18n.t('button', {}, { context: 'save' }) // "Save"
i18n.t('button', {}, { context: 'edit' }) // "Update"
i18n.t('button', {}, { context: 'create' }) // "Create"
```

### 性别化翻译

```typescript
const translations = {
  welcome: {
    male: 'Welcome, Mr. {{name}}',
    female: 'Welcome, Ms. {{name}}',
    other: 'Welcome, {{name}}',
  },
}

i18n.t('welcome.male', { name: 'John' }) // "Welcome, Mr. John"
i18n.t('welcome.female', { name: 'Jane' }) // "Welcome, Ms. Jane"
```

## 批量翻译

### 批量获取翻译

```typescript
const keys = ['common.ok', 'common.cancel', 'common.save', 'common.delete']
const translations = i18n.batchTranslate(keys)

console.log(translations)
// {
//   'common.ok': 'OK',
//   'common.cancel': 'Cancel',
//   'common.save': 'Save',
//   'common.delete': 'Delete'
// }
```

### 带参数的批量翻译

```typescript
const keys = ['greeting', 'farewell']
const params = { name: 'John' }
const translations = i18n.batchTranslate(keys, params)

console.log(translations)
// {
//   'greeting': 'Hello John!',
//   'farewell': 'Goodbye John!'
// }
```

## 降级处理

### 自动降级

当翻译键不存在时，自动使用降级语言：

```typescript
const i18n = new I18n({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
})

// 如果中文翻译不存在，自动使用英文
i18n.t('some.missing.key') // 返回英文翻译或键名
```

### 多级降级

支持多级降级策略：

```typescript
const i18n = new I18n({
  defaultLocale: 'zh-TW',
  fallbackLocale: ['zh-CN', 'en'], // 依次降级
})
```

### 自定义降级逻辑

```typescript
i18n.setFallbackResolver((key, locale) => {
  // 自定义降级逻辑
  if (locale.startsWith('zh')) {
    return ['zh-CN', 'en']
  }
  return ['en']
})
```

## 默认值处理

### 设置默认值

```typescript
// 全局默认值
const i18n = new I18n({
  defaultValue: key => `Missing: ${key}`,
})

// 单次翻译默认值
i18n.t('missing.key', {}, { defaultValue: 'Default Text' })
```

### 动态默认值

```typescript
i18n.t(
  'user.greeting',
  { name: 'John' },
  {
    defaultValue: 'Hello {{name}}!', // 支持插值的默认值
  }
)
```

## 翻译选项

### 完整选项列表

```typescript
interface TranslationOptions {
  defaultValue?: string // 默认值
  escapeValue?: boolean // 是否转义HTML
  context?: string // 上下文
  count?: number // 复数计数
  lng?: string // 指定语言
  fallbackLng?: string[] // 降级语言
  interpolation?: {
    // 插值选项
    prefix?: string // 插值前缀，默认 '{{'
    suffix?: string // 插值后缀，默认 '}}'
    escapeValue?: boolean // 是否转义
  }
}
```

### 使用示例

```typescript
i18n.t(
  'message',
  { content: '<script>' },
  {
    defaultValue: 'No message',
    escapeValue: true,
    context: 'safe',
    lng: 'en',
  }
)
```

## 性能优化

### 翻译缓存

```typescript
// 启用缓存
const i18n = new I18n({
  cache: {
    enabled: true,
    maxSize: 1000,
  },
})

// 缓存统计
console.log('Cache size:', i18n.cache.size())
console.log('Cache hit rate:', i18n.cache.getHitRate())
```

### 预编译翻译

```typescript
// 预编译常用翻译
const precompiledTranslations = i18n.precompile(['common.ok', 'common.cancel', 'common.save'])

// 使用预编译翻译
i18n.usePrecompiled(precompiledTranslations)
```

## 调试和开发

### 调试模式

```typescript
const i18n = new I18n({
  debug: true, // 启用调试模式
  missingKeyHandler: (key, locale) => {
    console.warn(`Missing translation key: ${key} for locale: ${locale}`)
  },
})
```

### 翻译键验证

```typescript
// 检查翻译键是否存在
if (i18n.exists('some.key')) {
  console.log('Translation exists')
}

// 获取所有翻译键
const allKeys = i18n.getKeys()
console.log('All translation keys:', allKeys)

// 查找未使用的翻译键
const unusedKeys = i18n.findUnusedKeys(usedKeys)
console.log('Unused keys:', unusedKeys)
```

### 翻译覆盖率

```typescript
// 检查翻译覆盖率
const coverage = i18n.getCoverage('zh-CN', 'en')
console.log(`Translation coverage: ${coverage.percentage}%`)
console.log('Missing keys:', coverage.missingKeys)
```

## 最佳实践

### 1. 键名设计

```typescript
// ✅ 好的键名设计
{
  "pages": {
    "login": {
      "title": "Login",
      "form": {
        "username": "Username",
        "password": "Password",
        "submit": "Sign In"
      }
    }
  }
}

// ❌ 避免的键名设计
{
  "loginPageTitle": "Login",
  "loginFormUsernameLabel": "Username",
  "loginFormPasswordLabel": "Password"
}
```

### 2. 参数命名

```typescript
// ✅ 清晰的参数名
"welcome": "Welcome {{userName}}, you have {{messageCount}} messages"

// ❌ 模糊的参数名
"welcome": "Welcome {{a}}, you have {{b}} messages"
```

### 3. 复数处理

```typescript
// ✅ 完整的复数形式
"items": "{count, plural, =0{no items} =1{one item} other{# items}}"

// ❌ 不完整的复数形式
"items": "{count} item(s)"
```

### 4. 错误处理

```typescript
// ✅ 优雅的错误处理
function safeTranslate(key, params = {}) {
  try {
    return i18n.t(key, params)
  }
  catch (error) {
    console.error('Translation error:', error)
    return key // 返回键名作为降级
  }
}
```

## 下一步

了解翻译功能后，建议继续学习：

- [插值和复数](/guide/interpolation) - 深入了解文本处理
- [语言包管理](/guide/language-packs) - 管理和组织翻译内容
- [性能优化](/guide/performance) - 提升翻译性能
