# Vue I18n 增强功能

本文档介绍了 @ldesign/i18n 为 Vue 3 提供的增强功能，这些功能参考了 vue-i18n 的最佳实践，并提供了更多实用的特性。

## 🚀 新增功能概览

### 1. 智能键名不存在提示
- 开发模式下显示详细的缺失翻译信息
- 自动查找相似键名并提供建议
- 生产模式下优雅降级
- 支持一键复制和报告功能

### 2. 作用域翻译
- 支持命名空间前缀，简化键名管理
- 自动降级到全局键名
- 支持嵌套作用域

### 3. 增强的组合式 API
- `useI18nEnhanced` - 提供安全翻译和批量翻译
- `useI18nScope` - 作用域翻译
- `useI18nPerformance` - 性能优化

### 4. 更多组件
- `I18nP` - 复数化翻译组件
- `I18nR` - 相对时间格式化组件
- `I18nL` - 列表格式化组件
- 增强的 `I18nT` - 支持组件插值和 HTML 渲染

### 5. 新增指令
- `v-t-plural` - 复数化翻译指令

### 6. 开发工具集成
- Vue DevTools 支持
- 翻译键追踪和性能监控
- 缺失翻译自动收集

## 📖 详细使用指南

### 智能键名不存在提示

#### TranslationMissing 组件

```vue
<template>
  <!-- 开发模式下会显示详细的错误信息和建议 -->
  <TranslationMissing 
    keypath="missing.key" 
    :suggestions="['correct.key', 'another.key']"
    show-similar-keys
    @report="handleMissingReport"
  />
</template>

<script setup>
import { TranslationMissing } from '@ldesign/i18n/vue'

const handleMissingReport = (keypath) => {
  console.log('报告缺失翻译:', keypath)
  // 发送到错误收集服务
}
</script>
```

#### 增强的翻译函数

```vue
<template>
  <div>
    <!-- 安全翻译，自动处理缺失键名 -->
    <p>{{ safeTranslation.text }}</p>
    
    <!-- 如果键名不存在，会显示警告组件 -->
    <component :is="safeTranslation.warningComponent" v-if="!safeTranslation.exists" />
  </div>
</template>

<script setup>
import { useI18nEnhanced } from '@ldesign/i18n/vue'

const { tSafe } = useI18nEnhanced()

const safeTranslation = tSafe('maybe.missing.key', {
  fallback: '默认文本',
  showMissingWarning: true,
  onMissing: (key, locale) => {
    console.warn(`缺失翻译: ${key} (${locale})`)
    return `[缺失: ${key}]`
  }
})
</script>
```

### 作用域翻译

```vue
<template>
  <div>
    <!-- 用户模块的翻译 -->
    <h1>{{ userScope.t('profile.title') }}</h1>
    <p>{{ userScope.t('profile.description') }}</p>
    
    <!-- 创建子作用域 -->
    <div>
      <h2>{{ profileScope.t('settings.title') }}</h2>
      <p>{{ profileScope.t('settings.description') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18nScope } from '@ldesign/i18n/vue'

// 创建用户模块作用域
const userScope = useI18nScope({ 
  namespace: 'user',
  fallbackToGlobal: true 
})

// 创建子作用域
const profileScope = userScope.createSubScope('profile')

// 或者使用便捷函数
import { createCommonScopes } from '@ldesign/i18n/vue'
const { ui, form, error } = createCommonScopes()
</script>
```

### 复数化支持

#### I18nP 组件

```vue
<template>
  <div>
    <!-- 基础复数化 -->
    <I18nP keypath="item" :count="itemCount" />
    
    <!-- 带参数的复数化 -->
    <I18nP 
      keypath="user.message" 
      :count="messageCount" 
      :params="{ name: 'John' }"
    />
    
    <!-- 自定义复数规则 -->
    <I18nP 
      keypath="custom" 
      :count="count"
      :plural-rules="{
        zero: 'custom.empty',
        one: 'custom.single',
        other: 'custom.multiple'
      }"
    />
  </div>
</template>

<script setup>
import { I18nP } from '@ldesign/i18n/vue'
import { ref } from 'vue'

const itemCount = ref(5)
const messageCount = ref(1)
const count = ref(0)
</script>
```

#### v-t-plural 指令

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <p v-t-plural="{ key: 'item', count: 5 }"></p>
    
    <!-- 带参数 -->
    <p v-t-plural="{ 
      key: 'user.message', 
      count: messageCount, 
      params: { name: 'John' } 
    }"></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const messageCount = ref(3)
</script>
```

### 格式化组件

#### I18nR - 相对时间

```vue
<template>
  <div>
    <!-- 基础相对时间 -->
    <I18nR :value="pastDate" />
    
    <!-- 自定义格式和更新间隔 -->
    <I18nR 
      :value="futureDate" 
      format="short"
      :update-interval="30000"
    />
    
    <!-- 禁用自动更新 -->
    <I18nR :value="staticDate" :update-interval="0" />
  </div>
</template>

<script setup>
import { I18nR } from '@ldesign/i18n/vue'
import { ref } from 'vue'

const pastDate = ref(new Date(Date.now() - 60000)) // 1分钟前
const futureDate = ref(new Date(Date.now() + 3600000)) // 1小时后
const staticDate = ref(new Date())
</script>
```

#### I18nL - 列表格式化

```vue
<template>
  <div>
    <!-- 连接列表 -->
    <I18nL :items="fruits" type="conjunction" />
    
    <!-- 选择列表 -->
    <I18nL :items="colors" type="disjunction" />
    
    <!-- 限制显示数量 -->
    <I18nL 
      :items="longList" 
      :max-items="3"
      more-text-key="common.and_more"
    />
    
    <!-- 使用插槽自定义渲染 -->
    <I18nL :items="users" use-slots>
      <template #default="{ item, index, isLast }">
        <strong>{{ item.name }}</strong>
        <span v-if="!isLast">, </span>
      </template>
    </I18nL>
  </div>
</template>

<script setup>
import { I18nL } from '@ldesign/i18n/vue'
import { ref } from 'vue'

const fruits = ref(['Apple', 'Banana', 'Orange'])
const colors = ref(['Red', 'Green', 'Blue'])
const longList = ref(['A', 'B', 'C', 'D', 'E', 'F'])
const users = ref([
  { name: 'John' },
  { name: 'Jane' },
  { name: 'Bob' }
])
</script>
```

### 增强的 I18nT 组件

```vue
<template>
  <div>
    <!-- HTML 渲染 -->
    <I18nT keypath="rich.content" html />
    
    <!-- 组件插值 -->
    <I18nT 
      keypath="message.with.component"
      :components="{ Button, Link }"
      enable-component-interpolation
    />
  </div>
</template>

<script setup>
import { I18nT } from '@ldesign/i18n/vue'
import Button from './Button.vue'
import Link from './Link.vue'
</script>
```

### 性能优化

```vue
<template>
  <div>
    <p>{{ cachedTranslation }}</p>
    <p>缓存命中率: {{ metrics.hitRate }}%</p>
    <p>缓存大小: {{ metrics.cacheSize }}</p>
  </div>
</template>

<script setup>
import { useI18nPerformance } from '@ldesign/i18n/vue'

const { t, preload, metrics } = useI18nPerformance({
  enableLocalCache: true,
  enableBatchTranslation: true,
  preloadKeys: ['common.hello', 'common.goodbye']
})

const cachedTranslation = t('common.hello')

// 预加载翻译
await preload(['page.title', 'page.description'])
</script>
```

### 开发工具集成

```typescript
// main.ts
import { createApp } from 'vue'
import { createI18nPlugin, installI18nDevTools } from '@ldesign/i18n/vue'
import App from './App.vue'

const app = createApp(App)

const i18n = createI18nPlugin({
  locale: 'zh-CN',
  messages: {
    // ...
  }
})

app.use(i18n)

// 安装开发工具（仅在开发模式）
if (process.env.NODE_ENV === 'development') {
  installI18nDevTools(app, i18n, {
    trackTranslations: true,
    trackPerformance: true,
    trackMissing: true,
    verbose: true
  })
}

app.mount('#app')
```

## 🎯 最佳实践

### 1. 键名组织
```typescript
// 推荐的键名结构
const messages = {
  'zh-CN': {
    // 通用
    common: {
      hello: '你好',
      goodbye: '再见',
      loading: '加载中...'
    },
    
    // 页面相关
    page: {
      home: {
        title: '首页',
        description: '欢迎来到首页'
      },
      about: {
        title: '关于我们',
        description: '了解更多关于我们的信息'
      }
    },
    
    // 组件相关
    ui: {
      button: {
        save: '保存',
        cancel: '取消',
        delete: '删除'
      },
      form: {
        required: '此字段为必填项',
        invalid: '输入格式不正确'
      }
    },
    
    // 复数化
    item: {
      zero: '没有项目',
      one: '一个项目',
      other: '{count} 个项目'
    }
  }
}
```

### 2. 作用域使用
```vue
<script setup>
import { useI18nScope, createCommonScopes } from '@ldesign/i18n/vue'

// 页面级作用域
const pageScope = useI18nScope({ namespace: 'page.home' })

// 组件级作用域
const { ui, form } = createCommonScopes()

// 使用
const title = pageScope.t('title') // page.home.title
const saveButton = ui.t('button.save') // ui.button.save
const requiredError = form.t('required') // form.required
</script>
```

### 3. 错误处理
```vue
<script setup>
import { useI18nEnhanced } from '@ldesign/i18n/vue'

const { tSafe } = useI18nEnhanced()

// 安全翻译，自动处理错误
const translation = tSafe('maybe.missing.key', {
  fallback: '默认文本',
  logWarning: true,
  onMissing: (key, locale) => {
    // 发送到错误收集服务
    console.error(`Missing translation: ${key} (${locale})`)
  }
})
</script>
```

## 🔧 配置选项

详细的配置选项请参考 [API 文档](../api/vue.md)。

## 🐛 故障排除

### 常见问题

1. **组件注入错误**
   - 确保已正确安装 I18n 插件
   - 检查组件是否在 Vue 应用上下文中使用

2. **翻译不更新**
   - 检查是否正确使用响应式翻译函数
   - 确认语言切换是否成功

3. **性能问题**
   - 启用缓存功能
   - 使用批量翻译减少单次调用
   - 预加载常用翻译

更多问题请查看 [FAQ](../guide/faq.md) 或提交 [Issue](https://github.com/ldesign/i18n/issues)。
