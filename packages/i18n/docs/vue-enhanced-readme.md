# Vue I18n 增强功能

@ldesign/i18n 为 Vue 3 提供了一套完整的国际化解决方案，包含多项增强功能。

## 🚀 新增功能

### 📊 响应式翻译系统
- **深度响应式翻译**: 支持动态翻译键和参数的深度响应式更新
- **批量翻译**: 一次性翻译多个键，提高性能
- **计算属性翻译**: 基于计算属性的自动响应式翻译
- **智能缓存**: 自动缓存管理和失效机制

### 🔧 性能监控
- **实时性能监控**: 监控翻译性能指标
- **慢翻译检测**: 自动识别和报告慢翻译
- **内存使用跟踪**: 监控内存使用情况
- **性能建议**: 基于数据的性能优化建议

### 🐛 调试工具
- **翻译覆盖率**: 分析翻译键的使用情况
- **缺失翻译检测**: 自动检测缺失的翻译键
- **参数验证**: 验证翻译参数的正确性
- **调试日志**: 详细的调试信息记录

### 🎨 高级组件
- **增强语言切换器**: 多种样式和交互模式
- **翻译文本组件**: 支持加载状态和错误处理
- **翻译表单组件**: 智能表单翻译和验证

### 🛠️ 开发工具集成
- **综合开发面板**: 集成所有开发工具
- **健康状态监控**: 实时应用健康状态
- **报告导出**: 导出详细的分析报告

## 📦 安装

```bash
npm install @ldesign/i18n
```

## 🎯 快速开始

### 1. 基础配置

```javascript
import { createI18n } from '@ldesign/i18n/vue'
// main.js
import { createApp } from 'vue'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { /* 中文翻译 */ },
    'en': { /* 英文翻译 */ },
  },
  // 开发模式配置
  development: {
    enabled: process.env.NODE_ENV === 'development',
    performance: { enabled: true, slowThreshold: 10 },
    debug: { enabled: true, trackCoverage: true },
  },
})

createApp(App).use(i18n).mount('#app')
```

### 2. 基础使用

```vue
<script setup>
import { useI18n } from '@ldesign/i18n/vue'

const { t } = useI18n()
</script>

<template>
  <div>
    <h1>{{ t('app.title') }}</h1>
    <p>{{ t('welcome.message', { name: 'Vue开发者' }) }}</p>
  </div>
</template>
```

### 3. 响应式翻译

```vue
<script setup>
import { useDeepReactiveTranslation } from '@ldesign/i18n/vue'
import { computed, ref } from 'vue'

const translationKey = ref('dynamic.message')
const userName = ref('用户')

const translation = useDeepReactiveTranslation(
  translationKey,
  computed(() => ({ name: userName.value }))
)
</script>

<template>
  <div>
    <p>{{ translation.value }}</p>
    <input v-model="userName" placeholder="输入用户名">
  </div>
</template>
```

### 4. 性能监控

```vue
<script setup>
import { useI18nPerformanceMonitor } from '@ldesign/i18n/vue'

const monitor = useI18nPerformanceMonitor({
  enabled: true,
  slowThreshold: 10,
  autoStart: true,
})
</script>

<template>
  <div class="performance-panel">
    <h3>性能监控</h3>
    <div>翻译次数: {{ monitor.metrics.translationCount }}</div>
    <div>平均时间: {{ monitor.metrics.averageTranslationTime.toFixed(2) }}ms</div>
    <button @click="monitor.clear()">
      清除数据
    </button>
  </div>
</template>
```

### 5. 调试工具

```vue
<script setup>
import { useI18nDebugger } from '@ldesign/i18n/vue'

const debugger = useI18nDebugger({
  enabled: true,
  trackCoverage: true,
  validateParams: true,
})
</script>

<template>
  <div class="debug-panel">
    <h3>调试信息</h3>
    <div>错误数: {{ debugger.errorCount }}</div>
    <div>警告数: {{ debugger.warningCount }}</div>
    <div>覆盖率: {{ (debugger.coverage.coverageRate * 100).toFixed(1) }}%</div>
  </div>
</template>
```

### 6. 综合开发工具

```vue
<script setup>
import { useI18nDevTools } from '@ldesign/i18n/vue'

const devTools = useI18nDevTools({
  performance: { enabled: true },
  debug: { enabled: true, trackCoverage: true },
})
</script>

<template>
  <div class="dev-tools">
    <div class="health-status">
      <div>性能: {{ devTools.healthStatus.performance.status }}</div>
      <div>调试: {{ devTools.healthStatus.debug.status }}</div>
    </div>

    <div class="actions">
      <button @click="devTools.enableAll()">
        启用所有工具
      </button>
      <button @click="devTools.exportAllReports()">
        导出报告
      </button>
    </div>
  </div>
</template>
```

## 📚 API 参考

### Composables

- `useI18n()` - 基础国际化功能
- `useDeepReactiveTranslation()` - 深度响应式翻译
- `useBatchReactiveTranslation()` - 批量翻译
- `useComputedTranslation()` - 计算属性翻译
- `useAsyncTranslation()` - 异步翻译
- `useI18nPerformanceMonitor()` - 性能监控
- `useI18nDebugger()` - 调试工具
- `useI18nDevTools()` - 综合开发工具

### 组件

- `LanguageSwitcher` - 基础语言切换器
- `LanguageSwitcherEnhanced` - 增强语言切换器
- `TranslationText` - 翻译文本组件
- `TranslationForm` - 翻译表单组件
- `TranslationProvider` - 翻译提供者组件

### 工具类

- `ReactiveTranslationManager` - 响应式翻译管理器
- `I18nPerformanceMonitor` - 性能监控器
- `I18nDebugger` - 调试器

## 🔗 相关链接

- [完整使用指南](./docs/guide/vue-enhanced-features.md)
- [API 文档](./docs/api/)
- [示例代码](./examples/vue-enhanced/)
- [最佳实践](./docs/best-practices.md)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 这些增强功能主要面向开发环境，在生产环境中建议禁用调试和性能监控功能以获得最佳性能。
