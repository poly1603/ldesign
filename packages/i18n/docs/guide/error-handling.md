# 错误处理

@ldesign/i18n 提供了完善的错误处理系统，确保应用在各种异常情况下都能优雅降级。

## 🛡️ 错误类型

### 内置错误类型

系统定义了多种专门的错误类型：

```typescript
import {
  CacheError,
  ConfigurationError,
  I18nError,
  InitializationError,
  InterpolationError,
  LanguageLoadError,
  PluralRuleError,
  TranslationKeyError,
} from '@ldesign/i18n'
```

#### LanguageLoadError

语言包加载失败时抛出：

```typescript
try {
  await i18n.changeLanguage('invalid-locale')
}
catch (error) {
  if (error instanceof LanguageLoadError) {
    console.error('语言包加载失败:', error.context.locale)
    // 回退到默认语言
    await i18n.changeLanguage('en')
  }
}
```

#### TranslationKeyError

翻译键不存在时抛出：

```typescript
try {
  const text = i18n.t('non.existent.key')
}
catch (error) {
  if (error instanceof TranslationKeyError) {
    console.warn('翻译键不存在:', error.context.key)
    // 返回键本身作为回退
    return error.context.key
  }
}
```

#### InterpolationError

插值参数缺失时抛出：

```typescript
try {
  const text = i18n.t('welcome.message', {
    /* 缺少 name 参数 */
  })
}
catch (error) {
  if (error instanceof InterpolationError) {
    console.warn('插值参数缺失:', error.context.missingParams)
    // 使用默认值
    return i18n.t('welcome.message', { name: 'Guest' })
  }
}
```

## 🔧 错误处理器

### 默认错误处理器

系统提供了多种内置错误处理器：

```typescript
import { DefaultErrorHandler, DevelopmentErrorHandler, SilentErrorHandler } from '@ldesign/i18n'

// 开发环境：详细错误信息
const devHandler = new DevelopmentErrorHandler()

// 生产环境：静默处理
const prodHandler = new SilentErrorHandler()

// 自定义处理
const customHandler = new DefaultErrorHandler()
```

### 自定义错误处理器

创建自定义错误处理器：

```typescript
import { ErrorHandler, I18nError } from '@ldesign/i18n'

class CustomErrorHandler implements ErrorHandler {
  canHandle(error: I18nError): boolean {
    // 只处理特定类型的错误
    return error.code === 'TRANSLATION_KEY_ERROR'
  }

  handle(error: I18nError): void {
    // 发送到错误监控服务
    this.sendToErrorService(error)

    // 记录到本地日志
    console.error(`[I18n] ${error.message}`, error.context)
  }

  private sendToErrorService(error: I18nError) {
    // 集成第三方错误监控服务
    // 如 Sentry, Bugsnag 等
  }
}
```

### 注册错误处理器

```typescript
import { globalErrorManager } from '@ldesign/i18n'

// 添加自定义处理器
globalErrorManager.addHandler(new CustomErrorHandler())

// 移除处理器
globalErrorManager.removeHandler(handler)
```

## 📊 错误统计

### 获取错误统计

```typescript
// 获取错误统计信息
const errorStats = i18n.getErrorStats()
console.log(errorStats)

// 输出示例:
// {
//   "TRANSLATION_KEY_ERROR": 5,
//   "INTERPOLATION_ERROR": 2,
//   "LANGUAGE_LOAD_ERROR": 1
// }
```

### 重置错误统计

```typescript
// 重置错误计数
i18n.resetErrorStats()
```

### 错误监控

```typescript
// 定期检查错误情况
setInterval(() => {
  const stats = globalErrorManager.getErrorStats()
  const totalErrors = Object.values(stats).reduce((sum, count) => sum + count, 0)

  if (totalErrors > 10) {
    console.warn('错误数量较多，需要关注:', stats)
    // 发送告警
  }
}, 60000) // 每分钟检查一次
```

## 🎯 优雅降级

### 翻译回退策略

```typescript
const i18n = new I18n({
  defaultLocale: 'en',
  fallbackLocale: 'en',

  // 自定义回退处理
  onMissingKey: (key: string, locale: string) => {
    console.warn(`Missing translation: ${key} for ${locale}`)

    // 返回格式化的键名作为回退
    return key.split('.').pop() || key
  },

  // 错误处理
  onError: (error: I18nError) => {
    // 记录错误但不中断执行
    console.error('I18n Error:', error.getDetails())
  },
})
```

### 组件级错误边界

在 Vue 组件中处理翻译错误：

```vue
<script setup>
import { useI18n } from '@ldesign/i18n/vue'

const { t } = useI18n()
const userName = ref('User')

// 安全的翻译函数
function safeTranslate(key: string, params?: any): string {
  try {
    return t(key, params)
  }
  catch (error) {
    console.warn('Translation error:', error)

    // 返回友好的回退文本
    return key.split('.').pop() || key
  }
}
</script>

<template>
  <div>
    <h1>{{ safeTranslate('page.title') }}</h1>
    <p>{{ safeTranslate('page.description', { name: userName }) }}</p>
  </div>
</template>
```

## 🔍 调试支持

### 开发模式

在开发环境中启用详细的错误信息：

```typescript
const i18n = new I18n({
  // 开发模式配置
  debug: process.env.NODE_ENV === 'development',

  // 详细的错误处理
  errorHandler: new DevelopmentErrorHandler(),
})
```

### 错误装饰器

使用装饰器自动处理错误：

```typescript
import { handleErrors } from '@ldesign/i18n'

class TranslationService {
  @handleErrors()
  async loadLanguage(locale: string) {
    // 可能抛出错误的代码
    return await this.loader.load(locale)
  }

  @handleErrors()
  translateBatch(keys: string[]) {
    // 批量翻译逻辑
    return keys.map(key => this.i18n.t(key))
  }
}
```

## 🚨 错误恢复

### 自动重试机制

```typescript
class RetryableI18n extends I18n {
  async changeLanguage(locale: string, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await super.changeLanguage(locale)
        return
      }
      catch (error) {
        if (i === retries - 1)
          throw error

        console.warn(`Language change failed, retrying... (${i + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
}
```

### 健康检查

```typescript
// 定期检查 I18n 系统健康状态
async function healthCheck(i18n: I18n): Promise<boolean> {
  try {
    // 测试基本翻译功能
    const testTranslation = i18n.t('common.ok')

    // 检查当前语言是否正常
    const currentLang = i18n.getCurrentLanguage()

    // 检查缓存状态
    const metrics = i18n.getPerformanceMetrics()

    return (
      testTranslation !== undefined && currentLang !== undefined && metrics.translationCalls >= 0
    )
  }
  catch (error) {
    console.error('I18n health check failed:', error)
    return false
  }
}

// 使用健康检查
setInterval(async () => {
  const isHealthy = await healthCheck(i18n)
  if (!isHealthy) {
    console.error('I18n system is unhealthy, attempting recovery...')
    // 执行恢复逻辑
  }
}, 300000) // 每5分钟检查一次
```

## 📝 最佳实践

### 1. 错误分类处理

```typescript
// 根据错误类型采取不同策略
function handleI18nError(error: I18nError) {
  switch (error.code) {
    case 'TRANSLATION_KEY_ERROR':
      // 翻译键缺失：使用回退文本
      return error.context.key

    case 'LANGUAGE_LOAD_ERROR':
      // 语言加载失败：回退到默认语言
      return i18n.changeLanguage('en')

    case 'INTERPOLATION_ERROR':
      // 插值错误：使用默认参数
      return i18n.t(error.context.key, { name: 'Guest' })

    default:
      // 其他错误：记录并使用通用回退
      console.error('Unexpected I18n error:', error)
      return 'Translation Error'
  }
}
```

### 2. 生产环境配置

```typescript
const i18n = new I18n({
  // 生产环境：静默错误处理
  errorHandler: new SilentErrorHandler(),

  // 降低性能监控开销
  performanceMonitoring: {
    enabled: true,
    sampleRate: 0.01, // 1% 采样
  },

  // 启用回退机制
  fallbackLocale: 'en',

  // 自定义错误处理
  onError: (error) => {
    // 只记录关键错误
    if (error.code === 'INITIALIZATION_ERROR') {
      sendToErrorService(error)
    }
  },
})
```

通过完善的错误处理系统，@ldesign/i18n 确保应用在各种异常情况下都能保持稳定运行。
