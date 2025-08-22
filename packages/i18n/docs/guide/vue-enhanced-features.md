# Vue I18n 增强功能指南

本指南介绍 @ldesign/i18n 为 Vue 3 提供的增强功能，包括响应式翻译系统、性能监控、调试工具等。

## 目录

- [响应式翻译系统](#响应式翻译系统)
- [性能监控](#性能监控)
- [调试工具](#调试工具)
- [高级组件](#高级组件)
- [开发工具集成](#开发工具集成)

## 响应式翻译系统

### 深度响应式翻译

`useDeepReactiveTranslation` 提供了深度响应式的翻译功能，支持动态翻译键和参数。

```vue
<script setup>
import { useDeepReactiveTranslation } from '@ldesign/i18n/vue'
import { computed, ref } from 'vue'

const translationKey = ref('welcome.message')
const userName = ref('Vue开发者')

const translation = useDeepReactiveTranslation(
  translationKey,
  computed(() => ({ name: userName.value })),
  {
    immediate: true,
    deep: true,
    cache: true,
  }
)
</script>

<template>
  <div>
    <p>{{ translation.value }}</p>
    <p v-if="translation.isLoading">
      加载中...
    </p>
    <p v-if="translation.error" class="error">
      {{ translation.error.message }}
    </p>
  </div>
</template>
```

### 批量响应式翻译

`useBatchReactiveTranslation` 允许一次性翻译多个键，提高性能。

```vue
<script setup>
import { useBatchReactiveTranslation } from '@ldesign/i18n/vue'
import { ref } from 'vue'

const translationKeys = ref([
  'navigation.home',
  'navigation.about',
  'navigation.contact'
])

const batchTranslations = useBatchReactiveTranslation(translationKeys)
</script>

<template>
  <nav>
    <a v-for="(text, key) in batchTranslations.translations" :key="key">
      {{ text }}
    </a>
  </nav>
</template>
```

### 计算属性翻译

`useComputedTranslation` 创建基于计算属性的翻译，自动响应依赖变化。

```vue
<script setup>
import { useComputedTranslation } from '@ldesign/i18n/vue'
import { ref } from 'vue'

const itemCount = ref(0)

const statusMessage = useComputedTranslation(
  () => itemCount.value === 0 ? 'status.empty' : 'status.hasItems',
  () => ({ count: itemCount.value })
)
</script>

<template>
  <div>
    <p>{{ statusMessage }}</p>
    <button @click="itemCount++">
      添加项目
    </button>
  </div>
</template>
```

## 性能监控

### 基础性能监控

`useI18nPerformanceMonitor` 提供翻译性能的实时监控。

```vue
<script setup>
import { useI18nPerformanceMonitor } from '@ldesign/i18n/vue'

const performanceMonitor = useI18nPerformanceMonitor({
  enabled: true,
  slowThreshold: 10, // 毫秒
  maxLogs: 1000,
  autoStart: true,
})

// 监控指标
const metrics = performanceMonitor.metrics
const recommendations = performanceMonitor.getRecommendations()
</script>

<template>
  <div class="performance-panel">
    <h3>性能监控</h3>
    <div class="metrics">
      <div>翻译次数: {{ metrics.translationCount }}</div>
      <div>平均时间: {{ metrics.averageTranslationTime.toFixed(2) }}ms</div>
      <div>缓存命中率: {{ (metrics.cacheHitRate * 100).toFixed(1) }}%</div>
    </div>

    <div v-if="metrics.slowTranslations.length" class="slow-translations">
      <h4>慢翻译</h4>
      <ul>
        <li v-for="slow in metrics.slowTranslations" :key="slow.key">
          {{ slow.key }}: {{ slow.time.toFixed(2) }}ms
        </li>
      </ul>
    </div>

    <div class="recommendations">
      <h4>性能建议</h4>
      <ul>
        <li v-for="rec in recommendations" :key="rec">
          {{ rec }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

### 性能报告导出

```javascript
// 导出性能报告
function exportReport() {
  const report = performanceMonitor.exportReport()

  // 下载报告
  const blob = new Blob([report], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `i18n-performance-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

## 调试工具

### 基础调试功能

`useI18nDebugger` 提供全面的调试功能。

```vue
<script setup>
import { useI18nDebugger, DebugLevel } from '@ldesign/i18n/vue'

const debugger = useI18nDebugger({
  enabled: true,
  level: DebugLevel.INFO,
  maxMessages: 1000,
  trackCoverage: true,
  validateParams: true,
  checkMissingKeys: true,
})

// 手动记录调试信息
const logCustomMessage = () => {
  debugger.logInfo('自定义调试信息', { context: 'user-action' })
}
</script>

<template>
  <div class="debug-panel">
    <h3>调试工具</h3>

    <div class="debug-stats">
      <span class="stat error">错误: {{ debugger.errorCount }}</span>
      <span class="stat warning">警告: {{ debugger.warningCount }}</span>
    </div>

    <div class="debug-messages">
      <div
        v-for="message in debugger.messages.slice(0, 10)"
        :key="message.id"
        :class="`message-${message.level}`"
      >
        <span class="time">{{ formatTime(message.timestamp) }}</span>
        <span class="level">{{ message.level }}</span>
        <span class="text">{{ message.message }}</span>
      </div>
    </div>

    <div class="actions">
      <button @click="debugger.clearMessages()">清除消息</button>
      <button @click="logCustomMessage">记录自定义消息</button>
    </div>
  </div>
</template>
```

### 翻译覆盖率分析

```vue
<script setup>
const coverageReport = debugger.getCoverageReport()
</script>

<template>
  <div class="coverage-panel">
    <h3>翻译覆盖率</h3>
    <div class="coverage-stats">
      <div class="rate">
        覆盖率: {{ (coverageReport.coverageRate * 100).toFixed(1) }}%
      </div>
      <div class="details">
        <div>总键数: {{ coverageReport.totalKeys }}</div>
        <div>已使用: {{ coverageReport.usedKeys.size }}</div>
        <div>未使用: {{ coverageReport.unusedKeys.size }}</div>
        <div>缺失: {{ coverageReport.missingKeys.size }}</div>
      </div>
    </div>

    <div v-if="coverageReport.missingKeys.size" class="missing-keys">
      <h4>缺失的翻译键</h4>
      <ul>
        <li v-for="key in Array.from(coverageReport.missingKeys)" :key="key">
          {{ key }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 高级组件

### 增强的语言切换器

```vue
<script setup>
import { LanguageSwitcherEnhanced } from '@ldesign/i18n/vue'

function handleLanguageChange(locale) {
  console.log('语言已切换到:', locale)
}

function handleError(error) {
  console.error('语言切换失败:', error)
}
</script>

<template>
  <LanguageSwitcherEnhanced
    variant="dropdown"
    size="medium"
    :show-flag="true"
    :show-code="false"
    name-display="native"
    theme="auto"
    :animated="true"
    @change="handleLanguageChange"
    @error="handleError"
  />
</template>
```

### 翻译文本组件

```vue
<script setup>
import { TranslationText } from '@ldesign/i18n/vue'
</script>

<template>
  <div>
    <!-- 基础使用 -->
    <TranslationText key-path="welcome.message" :params="{ name: 'Vue' }" />

    <!-- 带加载状态 -->
    <TranslationText
      key-path="async.content"
      :delay="1000"
      fallback="加载中..."
    >
      <template #loading>
        <span class="spinner">⏳</span>
      </template>

      <template #error="{ error, fallback }">
        <span class="error">{{ error.message || fallback }}</span>
      </template>
    </TranslationText>

    <!-- HTML 渲染 -->
    <TranslationText
      key-path="rich.content"
      :html="true"
      :params="{ link: 'https://example.com' }"
    />
  </div>
</template>
```

## 开发工具集成

### 综合开发工具

`useI18nDevTools` 集成了所有开发工具功能。

```vue
<script setup>
import { useI18nDevTools } from '@ldesign/i18n/vue'

const devTools = useI18nDevTools({
  performance: {
    enabled: true,
    slowThreshold: 5,
    maxLogs: 1000,
  },
  debug: {
    enabled: true,
    level: 'info',
    trackCoverage: true,
  },
})

// 健康状态检查
const healthStatus = devTools.healthStatus

// 导出所有报告
function exportAllReports() {
  const reports = devTools.exportAllReports()
  console.log('完整报告:', reports)
}
</script>

<template>
  <div class="dev-tools">
    <div class="health-status">
      <div :class="`status-${healthStatus.performance.status}`">
        性能: {{ healthStatus.performance.status }}
      </div>
      <div :class="`status-${healthStatus.debug.status}`">
        调试: {{ healthStatus.debug.status }}
      </div>
      <div :class="`status-${healthStatus.coverage.status}`">
        覆盖率: {{ (healthStatus.coverage.rate * 100).toFixed(1) }}%
      </div>
    </div>

    <div class="actions">
      <button @click="devTools.enableAll()">
        启用所有工具
      </button>
      <button @click="devTools.disableAll()">
        禁用所有工具
      </button>
      <button @click="devTools.clearAll()">
        清除所有数据
      </button>
      <button @click="exportAllReports()">
        导出报告
      </button>
    </div>
  </div>
</template>
```

### 生产环境优化

在生产环境中，建议禁用开发工具以提高性能：

```javascript
// main.js
const i18n = createI18n({
  // ... 其他配置
  development: {
    enabled: process.env.NODE_ENV === 'development',
    // 只在开发环境启用
  },
})

// 或者在组件中条件性使用
const devTools = process.env.NODE_ENV === 'development'
  ? useI18nDevTools()
  : null
```

## 最佳实践

1. **性能优化**
   - 在生产环境禁用开发工具
   - 使用批量翻译减少API调用
   - 启用翻译缓存

2. **调试技巧**
   - 使用覆盖率分析找出未使用的翻译
   - 监控慢翻译并优化
   - 定期导出和分析性能报告

3. **开发流程**
   - 在开发阶段启用所有调试功能
   - 使用翻译验证确保参数正确
   - 定期检查翻译覆盖率

4. **错误处理**
   - 为所有翻译提供合适的回退
   - 监控翻译错误并及时修复
   - 使用错误边界处理翻译失败

通过这些增强功能，您可以构建更加健壮、高性能的多语言 Vue 应用程序。

## 快速开始

### 1. 安装和配置

```bash
npm install @ldesign/i18n
```

```javascript
import { createI18n } from '@ldesign/i18n/vue'
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { /* 中文翻译 */ },
    'en': { /* 英文翻译 */ },
  },
  development: {
    enabled: process.env.NODE_ENV === 'development',
    performance: { enabled: true },
    debug: { enabled: true, trackCoverage: true },
  },
})

createApp(App).use(i18n).mount('#app')
```

### 2. 基础使用

```vue
<script setup>
import { useI18n, useI18nDevTools } from '@ldesign/i18n/vue'

const { t } = useI18n()
const devTools = useI18nDevTools()
</script>

<template>
  <div>
    <h1>{{ t('app.title') }}</h1>
    <p>{{ t('app.welcome', { name: 'Vue开发者' }) }}</p>
  </div>
</template>
```

### 3. 启用开发工具

在开发环境中，开发工具会自动启用。您可以通过浏览器控制台查看性能指标和调试信息。

更多详细信息请参考上面的完整指南。
