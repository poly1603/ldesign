# 最佳实践

本页面提供使用 @ldesign/i18n 的最佳实践建议，帮助您构建高质量的国际化应用。

## 项目组织

### 翻译文件结构

推荐的翻译文件组织方式：

```
src/
├── locales/
│   ├── en/
│   │   ├── common.json          # 通用翻译
│   │   ├── navigation.json      # 导航相关
│   │   ├── forms.json          # 表单相关
│   │   ├── errors.json         # 错误信息
│   │   └── pages/
│   │       ├── home.json       # 首页翻译
│   │       ├── about.json      # 关于页面
│   │       └── contact.json    # 联系页面
│   ├── zh-CN/
│   │   └── ... (相同结构)
│   └── ja/
│       └── ... (相同结构)
└── i18n/
    ├── index.ts                # I18n 配置
    ├── loader.ts               # 自定义加载器
    └── types.ts                # 类型定义
```

### 命名约定

#### 翻译键命名

使用层级化的命名方式：

```typescript
// ✅ 推荐
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete"
    },
    "messages": {
      "success": "Operation completed successfully",
      "error": "An error occurred"
    }
  },
  "pages": {
    "home": {
      "title": "Welcome to Our App",
      "subtitle": "The best solution for your needs"
    }
  }
}

// ❌ 不推荐
{
  "save_button": "Save",
  "cancel_btn": "Cancel",
  "home_page_title": "Welcome to Our App"
}
```

#### 组件翻译键

为组件创建专门的翻译命名空间：

```typescript
// UserProfile.vue
{
  "components": {
    "userProfile": {
      "title": "User Profile",
      "fields": {
        "name": "Name",
        "email": "Email",
        "phone": "Phone Number"
      },
      "actions": {
        "edit": "Edit Profile",
        "save": "Save Changes"
      }
    }
  }
}
```

## 性能优化

### 懒加载策略

只加载当前需要的语言包：

```typescript
// ✅ 推荐：按需加载
class LazyI18nLoader implements Loader {
  private cache = new Map<string, LanguagePackage>()

  async load(locale: string): Promise<LanguagePackage> {
    if (this.cache.has(locale)) {
      return this.cache.get(locale)!
    }

    // 动态导入，只加载需要的语言
    const [common, navigation, forms] = await Promise.all([
      import(`../locales/${locale}/common.json`),
      import(`../locales/${locale}/navigation.json`),
      import(`../locales/${locale}/forms.json`),
    ])

    const languagePackage: LanguagePackage = {
      info: {
        name: this.getLanguageName(locale),
        code: locale,
        direction: this.getLanguageDirection(locale),
      },
      translations: {
        common: common.default,
        navigation: navigation.default,
        forms: forms.default,
      },
    }

    this.cache.set(locale, languagePackage)
    return languagePackage
  }
}

// ❌ 不推荐：一次性加载所有语言
const allLocales = {
  en: require('./locales/en/index.json'),
  'zh-CN': require('./locales/zh-CN/index.json'),
  ja: require('./locales/ja/index.json'),
}
```

### 缓存策略

合理使用缓存提升性能：

```typescript
// ✅ 推荐：智能缓存
const i18n = new I18n({
  cache: {
    enabled: true,
    maxSize: 1000, // 限制缓存大小
    ttl: 5 * 60 * 1000, // 5分钟过期
  },
})

// 预加载常用翻译
await i18n.preload(['common.ok', 'common.cancel', 'common.loading'])
```

### 代码分割

在大型应用中按模块分割翻译：

```typescript
// 路由级别的翻译加载
const router = createRouter({
  routes: [
    {
      path: '/dashboard',
      component: () => import('./views/Dashboard.vue'),
      beforeEnter: async (to, from, next) => {
        // 加载仪表板相关翻译
        await i18n.loadNamespace('dashboard')
        next()
      },
    },
  ],
})
```

## 错误处理

### 优雅降级

确保翻译缺失时的优雅处理：

```typescript
// ✅ 推荐：提供默认值
const message = t(
  'user.welcome',
  { name: userName },
  {
    defaultValue: 'Welcome!',
  }
)

// ✅ 推荐：使用降级语言
const i18n = new I18n({
  defaultLocale: 'en',
  fallbackLocale: 'en', // 确保有降级选项
  fallbackChain: ['en', 'zh-CN'], // 多级降级
})
```

### 错误监控

监控翻译错误并及时处理：

```typescript
i18n.on('translationMissing', (key, locale) => {
  // 记录缺失的翻译
  console.warn(`Missing translation: ${key} for locale: ${locale}`)

  // 发送到错误监控服务
  errorReporting.captureMessage(`Missing translation: ${key}`, {
    extra: { locale, key },
  })
})

i18n.on('translationError', (error, key, locale) => {
  // 记录翻译错误
  console.error(`Translation error for ${key}:`, error)

  // 发送到错误监控服务
  errorReporting.captureException(error, {
    extra: { locale, key },
  })
})
```

## 类型安全

### TypeScript 集成

使用 TypeScript 确保翻译键的类型安全：

```typescript
// types/i18n.ts
interface TranslationKeys {
  common: {
    buttons: {
      save: string
      cancel: string
      delete: string
    }
    messages: {
      success: string
      error: string
    }
  }
  pages: {
    home: {
      title: string
      subtitle: string
    }
  }
}

// 扩展 I18n 类型
declare module '@ldesign/i18n' {
  interface I18nInstance {
    t<K extends keyof TranslationKeys>(key: K, params?: Record<string, any>): string
  }
}

// 使用时获得类型提示
const title = t('pages.home.title') // ✅ 类型安全
const invalid = t('invalid.key') // ❌ TypeScript 错误
```

### 自动生成类型

从翻译文件自动生成类型定义：

```typescript
// scripts/generate-i18n-types.ts
import fs from 'fs'
import path from 'path'

function generateTypesFromTranslations(localeDir: string) {
  const enTranslations = JSON.parse(fs.readFileSync(path.join(localeDir, 'en/index.json'), 'utf-8'))

  function generateInterface(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent)
    let result = '{\n'

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += `${spaces}  ${key}: ${generateInterface(value, indent + 1)}\n`
      } else {
        result += `${spaces}  ${key}: string\n`
      }
    }

    result += `${spaces}}`
    return result
  }

  const typeDefinition = `
export interface TranslationKeys ${generateInterface(enTranslations)}
  `

  fs.writeFileSync(path.join(localeDir, '../types/i18n.ts'), typeDefinition)
}
```

## 测试策略

### 单元测试

测试翻译功能：

```typescript
// __tests__/i18n.test.ts
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'

describe('I18n', () => {
  let i18n: I18n

  beforeEach(async () => {
    i18n = await createI18nWithBuiltinLocales({
      defaultLocale: 'en',
    })
  })

  test('should translate basic keys', () => {
    expect(i18n.t('common.ok')).toBe('OK')
    expect(i18n.t('common.cancel')).toBe('Cancel')
  })

  test('should handle interpolation', () => {
    const result = i18n.t('common.pageOf', { current: 1, total: 10 })
    expect(result).toBe('Page 1 of 10')
  })

  test('should handle pluralization', () => {
    expect(i18n.t('date.duration.minutes', { count: 0 })).toBe('0 minutes')
    expect(i18n.t('date.duration.minutes', { count: 1 })).toBe('1 minute')
    expect(i18n.t('date.duration.minutes', { count: 5 })).toBe('5 minutes')
  })

  test('should fallback to default locale', async () => {
    await i18n.changeLanguage('invalid-locale')
    expect(i18n.t('common.ok')).toBe('OK') // 应该降级到英语
  })
})
```

### 集成测试

测试组件中的翻译：

```typescript
// __tests__/components/UserProfile.test.ts
import { mount } from '@vue/test-utils'
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'
import { createI18n } from '@ldesign/i18n/vue'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile', () => {
  test('should display translated content', async () => {
    const i18nInstance = await createI18nWithBuiltinLocales()
    const vueI18nPlugin = createI18n(i18nInstance)

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [vueI18nPlugin],
      },
    })

    expect(wrapper.text()).toContain('User Profile')
    expect(wrapper.find('[data-testid="name-label"]').text()).toBe('Name')
  })

  test('should update when language changes', async () => {
    const i18nInstance = await createI18nWithBuiltinLocales()
    const vueI18nPlugin = createI18n(i18nInstance)

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [vueI18nPlugin],
      },
    })

    // 切换到中文
    await i18nInstance.changeLanguage('zh-CN')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="name-label"]').text()).toBe('姓名')
  })
})
```

## 实际应用场景

### 电商应用

电商应用的国际化考虑：

```typescript
// 产品信息翻译
{
  "products": {
    "{{productId}}": {
      "name": "Product Name",
      "description": "Product Description",
      "specifications": {
        "weight": "Weight: {{weight}}kg",
        "dimensions": "Dimensions: {{width}}×{{height}}×{{depth}}cm"
      }
    }
  },
  "pricing": {
    "currency": "{{amount, currency}}",
    "discount": "Save {{percentage}}%",
    "shipping": {
      "free": "Free Shipping",
      "cost": "Shipping: {{amount, currency}}"
    }
  }
}

// 使用示例
class ProductService {
  constructor(private i18n: I18n) {}

  formatPrice(amount: number, currency: string): string {
    return this.i18n.t('pricing.currency', { amount, currency })
  }

  getProductName(productId: string): string {
    return this.i18n.t(`products.${productId}.name`, {}, {
      defaultValue: 'Unknown Product'
    })
  }
}
```

### 多租户 SaaS 应用

```typescript
// 租户特定翻译
class TenantI18nService {
  private i18nInstances = new Map<string, I18n>()

  async getI18nForTenant(tenantId: string): Promise<I18n> {
    if (this.i18nInstances.has(tenantId)) {
      return this.i18nInstances.get(tenantId)!
    }

    const i18n = new I18n({
      defaultLocale: 'en',
      loader: new TenantLoader(tenantId),
    })

    await i18n.init()
    this.i18nInstances.set(tenantId, i18n)
    return i18n
  }
}

class TenantLoader implements Loader {
  constructor(private tenantId: string) {}

  async load(locale: string): Promise<LanguagePackage> {
    // 加载基础翻译
    const baseTranslations = await this.loadBaseTranslations(locale)

    // 加载租户自定义翻译
    const tenantTranslations = await this.loadTenantTranslations(locale)

    return {
      info: baseTranslations.info,
      translations: {
        ...baseTranslations.translations,
        ...tenantTranslations,
      },
    }
  }
}
```

### 实时协作应用

```typescript
// WebSocket 实时翻译更新
class RealtimeI18nManager {
  private ws: WebSocket
  private i18n: I18n

  constructor(i18n: I18n) {
    this.i18n = i18n
    this.setupWebSocket()
  }

  private setupWebSocket() {
    this.ws = new WebSocket('ws://localhost:8080/i18n-updates')

    this.ws.onmessage = event => {
      const update = JSON.parse(event.data)
      this.handleTranslationUpdate(update)
    }
  }

  private handleTranslationUpdate(update: any) {
    const { type, locale, key, value } = update

    switch (type) {
      case 'translation_updated':
        this.i18n.updateTranslation(locale, key, value)
        break
      case 'translation_deleted':
        this.i18n.removeTranslation(locale, key)
        break
      case 'locale_added':
        this.i18n.addLocale(locale, update.translations)
        break
    }
  }
}
```

## 部署和维护

### CI/CD 集成

在持续集成中验证翻译：

```yaml
# .github/workflows/i18n-check.yml
name: I18n Validation

on: [push, pull_request]

jobs:
  validate-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Validate translation keys
        run: npm run i18n:validate

      - name: Check translation coverage
        run: npm run i18n:coverage

      - name: Lint translation files
        run: npm run i18n:lint
```

### 翻译文件验证脚本

```typescript
// scripts/validate-translations.ts
import fs from 'fs'
import path from 'path'

interface ValidationResult {
  locale: string
  missing: string[]
  extra: string[]
  invalid: string[]
}

class TranslationValidator {
  private baseLocale = 'en'
  private localesDir: string

  constructor(localesDir: string) {
    this.localesDir = localesDir
  }

  validate(): ValidationResult[] {
    const baseKeys = this.getTranslationKeys(this.baseLocale)
    const locales = this.getAvailableLocales()

    return locales
      .filter(locale => locale !== this.baseLocale)
      .map(locale => this.validateLocale(locale, baseKeys))
  }

  private validateLocale(locale: string, baseKeys: Set<string>): ValidationResult {
    const localeKeys = this.getTranslationKeys(locale)

    const missing = Array.from(baseKeys).filter(key => !localeKeys.has(key))
    const extra = Array.from(localeKeys).filter(key => !baseKeys.has(key))
    const invalid = this.findInvalidTranslations(locale)

    return { locale, missing, extra, invalid }
  }

  private getTranslationKeys(locale: string): Set<string> {
    const translationFile = path.join(this.localesDir, locale, 'index.json')
    const translations = JSON.parse(fs.readFileSync(translationFile, 'utf-8'))

    return new Set(this.flattenKeys(translations))
  }

  private flattenKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null) {
        keys.push(...this.flattenKeys(value, fullKey))
      } else {
        keys.push(fullKey)
      }
    }

    return keys
  }
}
```
