# 高级用法

本页面介绍 @ldesign/i18n 的高级功能和扩展用法。

## 自定义加载器

### 创建自定义加载器

```typescript
import type { LanguagePackage, Loader } from '@ldesign/i18n'

class CustomLoader implements Loader {
  private packages = new Map<string, LanguagePackage>()

  async load(locale: string): Promise<LanguagePackage> {
    // 从自定义源加载语言包
    const response = await fetch(`/api/locales/${locale}`)
    const data = await response.json()

    const languagePackage: LanguagePackage = {
      info: {
        name: data.name,
        code: locale,
        direction: data.direction || 'ltr',
      },
      translations: data.translations,
    }

    this.packages.set(locale, languagePackage)
    return languagePackage
  }

  isLoaded(locale: string): boolean {
    return this.packages.has(locale)
  }

  getAvailableLocales(): string[] {
    return Array.from(this.packages.keys())
  }

  getLoadedPackage(locale: string): LanguagePackage | undefined {
    return this.packages.get(locale)
  }
}

// 使用自定义加载器
const customLoader = new CustomLoader()
const i18n = new I18n({
  defaultLocale: 'en',
  loader: customLoader,
})
```

### 数据库加载器示例

```typescript
class DatabaseLoader implements Loader {
  constructor(private dbConnection: any) {}

  async load(locale: string): Promise<LanguagePackage> {
    const translations = await this.dbConnection.query(
      'SELECT key, value FROM translations WHERE locale = ?',
      [locale]
    )

    // 将平铺的键值对转换为嵌套对象
    const nestedTranslations = {}
    translations.forEach(({ key, value }) => {
      this.setNestedValue(nestedTranslations, key, value)
    })

    return {
      info: {
        name: this.getLanguageName(locale),
        code: locale,
        direction: this.getLanguageDirection(locale),
      },
      translations: nestedTranslations,
    }
  }

  private setNestedValue(obj: any, path: string, value: string) {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = value
  }
}
```

## 自定义存储方案

### 创建自定义存储

```typescript
import type { Storage } from '@ldesign/i18n'

class CustomStorage implements Storage {
  private data = new Map<string, string>()

  get(key: string): string | null {
    return this.data.get(key) || null
  }

  set(key: string, value: string): void {
    this.data.set(key, value)
    // 可以在这里添加持久化逻辑
    this.persistToServer(key, value)
  }

  remove(key: string): void {
    this.data.delete(key)
    this.removeFromServer(key)
  }

  private async persistToServer(key: string, value: string) {
    try {
      await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
    }
    catch (error) {
      console.warn('Failed to persist preference:', error)
    }
  }

  private async removeFromServer(key: string) {
    try {
      await fetch(`/api/user-preferences/${key}`, {
        method: 'DELETE',
      })
    }
    catch (error) {
      console.warn('Failed to remove preference:', error)
    }
  }
}

// 使用自定义存储
const customStorage = new CustomStorage()
const i18n = new I18n({
  defaultLocale: 'en',
  storage: customStorage,
})
```

### IndexedDB 存储示例

```typescript
class IndexedDBStorage implements Storage {
  private dbName = 'i18n-storage'
  private storeName = 'preferences'
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  get(key: string): string | null {
    if (!this.db)
      return null

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  }

  set(key: string, value: string): void {
    if (!this.db)
      return

    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    store.put(value, key)
  }

  remove(key: string): void {
    if (!this.db)
      return

    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    store.delete(key)
  }
}
```

## 自定义语言检测器

### 创建自定义检测器

```typescript
import type { Detector } from '@ldesign/i18n'

class CustomDetector implements Detector {
  detect(): string[] {
    const languages: string[] = []

    // 1. 从 URL 参数检测
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')
    if (urlLang) {
      languages.push(urlLang)
    }

    // 2. 从用户配置检测
    const userLang = this.getUserPreferredLanguage()
    if (userLang) {
      languages.push(userLang)
    }

    // 3. 从浏览器检测
    if (navigator.language) {
      languages.push(navigator.language)
    }

    // 4. 从 Accept-Language 头检测（如果可用）
    const acceptLanguage = this.getAcceptLanguage()
    if (acceptLanguage) {
      languages.push(...acceptLanguage)
    }

    return [...new Set(languages)] // 去重
  }

  private getUserPreferredLanguage(): string | null {
    // 从用户配置或 API 获取
    return localStorage.getItem('user-preferred-language')
  }

  private getAcceptLanguage(): string[] {
    // 在服务端渲染时可以从请求头获取
    const acceptLang = document
      .querySelector('meta[name="accept-language"]')
      ?.getAttribute('content')
    return acceptLang ? acceptLang.split(',').map(lang => lang.trim()) : []
  }
}

// 使用自定义检测器
const customDetector = new CustomDetector()
const i18n = new I18n({
  defaultLocale: 'en',
  detector: customDetector,
})
```

## 插件系统

### 创建翻译插件

```typescript
interface TranslationPlugin {
  name: string
  transform: (text: string, locale: string, key: string) => string
}

class MarkdownPlugin implements TranslationPlugin {
  name = 'markdown'

  transform(text: string, locale: string, key: string): string {
    // 简单的 Markdown 转换
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
  }
}

class CurrencyPlugin implements TranslationPlugin {
  name = 'currency'

  transform(text: string, locale: string, key: string): string {
    // 货币格式化
    const currencyRegex = /\{\{currency:(\d+(?:\.\d+)?)\}\}/g
    return text.replace(currencyRegex, (match, amount) => {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: this.getCurrencyForLocale(locale),
      })
      return formatter.format(Number.parseFloat(amount))
    })
  }

  private getCurrencyForLocale(locale: string): string {
    const currencyMap: Record<string, string> = {
      'en': 'USD',
      'zh-CN': 'CNY',
      'ja': 'JPY',
      'en-GB': 'GBP',
      'de': 'EUR',
    }
    return currencyMap[locale] || 'USD'
  }
}

// 扩展 I18n 类以支持插件
class ExtendedI18n extends I18n {
  private plugins: TranslationPlugin[] = []

  addPlugin(plugin: TranslationPlugin) {
    this.plugins.push(plugin)
  }

  t(key: string, params?: any, options?: any): string {
    let text = super.t(key, params, options)

    // 应用所有插件
    for (const plugin of this.plugins) {
      text = plugin.transform(text, this.getCurrentLanguage(), key)
    }

    return text
  }
}

// 使用插件
const i18n = new ExtendedI18n()
i18n.addPlugin(new MarkdownPlugin())
i18n.addPlugin(new CurrencyPlugin())
```

## 性能优化

### 懒加载语言包

```typescript
class LazyLoader implements Loader {
  private loadedPackages = new Map<string, LanguagePackage>()
  private loadingPromises = new Map<string, Promise<LanguagePackage>>()

  async load(locale: string): Promise<LanguagePackage> {
    // 如果已经加载，直接返回
    if (this.loadedPackages.has(locale)) {
      return this.loadedPackages.get(locale)!
    }

    // 如果正在加载，返回现有的 Promise
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale)!
    }

    // 开始加载
    const loadingPromise = this.loadLanguagePackage(locale)
    this.loadingPromises.set(locale, loadingPromise)

    try {
      const languagePackage = await loadingPromise
      this.loadedPackages.set(locale, languagePackage)
      return languagePackage
    }
    finally {
      this.loadingPromises.delete(locale)
    }
  }

  private async loadLanguagePackage(locale: string): Promise<LanguagePackage> {
    // 动态导入语言包
    const module = await import(`./locales/${locale}/index.js`)
    return module.default
  }
}
```

### 缓存优化

```typescript
class OptimizedI18n extends I18n {
  private translationCache = new Map<string, string>()
  private maxCacheSize = 1000

  t(key: string, params?: any, options?: any): string {
    const cacheKey = this.generateCacheKey(key, params, options)

    // 检查缓存
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!
    }

    // 执行翻译
    const result = super.t(key, params, options)

    // 缓存结果
    this.cacheTranslation(cacheKey, result)

    return result
  }

  private generateCacheKey(key: string, params?: any, options?: any): string {
    const locale = this.getCurrentLanguage()
    const paramsStr = params ? JSON.stringify(params) : ''
    const optionsStr = options ? JSON.stringify(options) : ''
    return `${locale}:${key}:${paramsStr}:${optionsStr}`
  }

  private cacheTranslation(key: string, value: string) {
    // 如果缓存已满，删除最旧的条目
    if (this.translationCache.size >= this.maxCacheSize) {
      const firstKey = this.translationCache.keys().next().value
      this.translationCache.delete(firstKey)
    }

    this.translationCache.set(key, value)
  }
}
```

## 服务端渲染 (SSR)

### Next.js 集成

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { I18nProvider } from '@ldesign/i18n/react' // 假设有 React 集成

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider locale={pageProps.locale} messages={pageProps.messages}>
      <Component {...pageProps} />
    </I18nProvider>
  )
}

export default MyApp

// pages/index.tsx
import { GetServerSideProps } from 'next'
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const i18n = await createI18nWithBuiltinLocales({
    defaultLocale: locale || 'en',
  })

  return {
    props: {
      locale: locale || 'en',
      messages: i18n.getAllTranslations(),
    },
  }
}
```

### Nuxt.js 集成

```typescript
// plugins/i18n.client.ts
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'
import { createI18n } from '@ldesign/i18n/vue'

export default defineNuxtPlugin(async () => {
  const i18nInstance = await createI18nWithBuiltinLocales({
    defaultLocale: 'en',
    autoDetect: true,
  })

  const vueI18nPlugin = createI18n(i18nInstance)

  return {
    provide: {
      i18n: i18nInstance,
    },
  }
})

// nuxt.config.ts
export default defineNuxtConfig({
  plugins: ['~/plugins/i18n.client.ts'],
})
```

## 多租户支持

### 租户特定的翻译

```typescript
class MultiTenantI18n extends I18n {
  private tenantId: string

  constructor(tenantId: string, options?: I18nOptions) {
    super(options)
    this.tenantId = tenantId
  }

  protected async loadLanguagePackage(locale: string): Promise<LanguagePackage> {
    // 首先加载基础翻译
    const basePackage = await super.loadLanguagePackage(locale)

    // 然后加载租户特定的翻译
    try {
      const tenantPackage = await this.loadTenantTranslations(locale)

      // 合并翻译
      return {
        ...basePackage,
        translations: this.deepMerge(basePackage.translations, tenantPackage.translations),
      }
    }
    catch (error) {
      console.warn(`Failed to load tenant translations for ${this.tenantId}:`, error)
      return basePackage
    }
  }

  private async loadTenantTranslations(locale: string): Promise<LanguagePackage> {
    const response = await fetch(`/api/tenants/${this.tenantId}/locales/${locale}`)
    return response.json()
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      }
      else {
        result[key] = source[key]
      }
    }

    return result
  }
}

// 使用多租户 I18n
const tenantI18n = new MultiTenantI18n('tenant-123', {
  defaultLocale: 'en',
  fallbackLocale: 'en',
})
```
