# useTemplateScanner

Vue 3 组合式函数，用于在组件中轻松使用模板扫描功能。

## 基础用法

```vue
<script setup lang="ts">
import { useTemplateScanner } from '@ldesign/template/composables'

const {
  templates,
  isScanning,
  scanError,
  scan,
  getTemplatesByCategory
} = useTemplateScanner({
  templatesDir: 'src/templates',
  autoScan: true
})

// 获取登录模板
const loginTemplates = getTemplatesByCategory('login')
</script>
```

## API 参考

### 参数

```typescript
interface UseScannerOptions {
  templatesDir: string
  autoScan?: boolean
  enableCache?: boolean
  watchMode?: boolean
  onScanComplete?: (result: ScanResult) => void
  onScanError?: (error: Error) => void
}
```

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `templatesDir` | `string` | 必需 | 模板目录路径 |
| `autoScan` | `boolean` | `true` | 是否自动扫描 |
| `enableCache` | `boolean` | `true` | 是否启用缓存 |
| `watchMode` | `boolean` | `false` | 是否启用文件监听 |
| `onScanComplete` | `function` | - | 扫描完成回调 |
| `onScanError` | `function` | - | 扫描错误回调 |

### 返回值

```typescript
interface UseScannerReturn {
  // 响应式状态
  templates: Ref<Map<string, TemplateMetadata>>
  isScanning: Ref<boolean>
  scanError: Ref<Error | null>

  // 方法
  scan: () => Promise<ScanResult>
  getTemplatesByCategory: (category: string) => TemplateMetadata[]
  getTemplatesByDevice: (device: DeviceType) => TemplateMetadata[]
  searchTemplates: (filter: TemplateFilter) => TemplateMetadata[]

  // 扫描器实例
  scanner: TemplateScanner
}
```

## 详细示例

### 基础模板列表

```vue
<script setup lang="ts">
import { useTemplateScanner } from '@ldesign/template/composables'

const {
  templates,
  isScanning,
  scanError
} = useTemplateScanner({
  templatesDir: 'src/templates',
  autoScan: true
})
</script>

<template>
  <div class="template-list">
    <div v-if="isScanning" class="loading">
      扫描模板中...
    </div>

    <div v-else-if="scanError" class="error">
      扫描失败: {{ scanError.message }}
    </div>

    <div v-else>
      <h3>可用模板 ({{ templates.size }})</h3>
      <div
        v-for="[name, template] in templates"
        :key="name"
        class="template-item"
      >
        <h4>{{ template.displayName }}</h4>
        <p>{{ template.description }}</p>
        <div class="template-meta">
          <span class="category">{{ template.category }}</span>
          <span class="device">{{ template.device }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 分类过滤

```vue
<script setup lang="ts">
import { useTemplateScanner } from '@ldesign/template/composables'
import { computed, ref } from 'vue'

const {
  templates,
  getTemplatesByCategory
} = useTemplateScanner({
  templatesDir: 'src/templates'
})

const selectedCategory = ref('login')

// 所有分类
const categories = computed(() => {
  const cats = new Set<string>()
  for (const template of templates.value.values()) {
    cats.add(template.category)
  }
  return Array.from(cats)
})

// 过滤后的模板
const filteredTemplates = computed(() => {
  return getTemplatesByCategory(selectedCategory.value)
})

// 获取分类数量
function getCategoryCount(category: string) {
  return getTemplatesByCategory(category).length
}
</script>

<template>
  <div class="categorized-templates">
    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category"
      >
        {{ category }} ({{ getCategoryCount(category) }})
      </button>
    </div>

    <div class="template-grid">
      <div
        v-for="template in filteredTemplates"
        :key="template.name"
        class="template-card"
      >
        <img :src="template.preview" :alt="template.displayName">
        <h4>{{ template.displayName }}</h4>
        <p>{{ template.description }}</p>
      </div>
    </div>
  </div>
</template>
```

### 搜索功能

```vue
<script setup lang="ts">
import { useTemplateScanner } from '@ldesign/template/composables'
import { computed, ref } from 'vue'

const {
  templates,
  searchTemplates
} = useTemplateScanner({
  templatesDir: 'src/templates'
})

const searchKeyword = ref('')
const selectedDevice = ref('')
const selectedTags = ref<string[]>([])

// 可用标签
const availableTags = computed(() => {
  const tags = new Set<string>()
  for (const template of templates.value.values()) {
    template.tags?.forEach(tag => tags.add(tag))
  }
  return Array.from(tags)
})

// 搜索结果
const searchResults = computed(() => {
  return searchTemplates({
    keyword: searchKeyword.value,
    devices: selectedDevice.value ? [selectedDevice.value as any] : undefined,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined
  })
})
</script>

<template>
  <div class="template-search">
    <div class="search-controls">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索模板..."
        class="search-input"
      >

      <select v-model="selectedDevice" class="device-filter">
        <option value="">
          所有设备
        </option>
        <option value="desktop">
          桌面端
        </option>
        <option value="tablet">
          平板端
        </option>
        <option value="mobile">
          移动端
        </option>
      </select>

      <div class="tag-filters">
        <label v-for="tag in availableTags" :key="tag">
          <input
            v-model="selectedTags"
            :value="tag"
            type="checkbox"
          >
          {{ tag }}
        </label>
      </div>
    </div>

    <div class="search-results">
      <p>找到 {{ searchResults.length }} 个模板</p>
      <div
        v-for="template in searchResults"
        :key="template.name"
        class="result-item"
      >
        <h4>{{ template.displayName }}</h4>
        <p>{{ template.description }}</p>
        <div class="tags">
          <span
            v-for="tag in template.tags"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 文件监听

```vue
<script setup lang="ts">
import { useTemplateScanner } from '@ldesign/template/composables'
import { onMounted, onUnmounted, ref } from 'vue'

const {
  scanner
} = useTemplateScanner({
  templatesDir: 'src/templates',
  watchMode: true
})

const isWatching = ref(false)
const activities = ref<Array<{
  id: string
  timestamp: string
  action: string
  template: string
}>>([])

async function toggleWatching() {
  if (isWatching.value) {
    await scanner.stopWatching()
    isWatching.value = false
  }
  else {
    await scanner.startWatching()
    isWatching.value = true
  }
}

function addActivity(action: string, template: string) {
  activities.value.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toLocaleTimeString(),
    action,
    template
  })

  // 保持最新的20条记录
  if (activities.value.length > 20) {
    activities.value = activities.value.slice(0, 20)
  }
}

onMounted(() => {
  // 监听模板事件
  scanner.on('template:added', (template) => {
    addActivity('新增', template.displayName)
  })

  scanner.on('template:updated', (template) => {
    addActivity('更新', template.displayName)
  })

  scanner.on('template:removed', (templateName) => {
    addActivity('删除', templateName)
  })
})

onUnmounted(async () => {
  if (isWatching.value) {
    await scanner.stopWatching()
  }
})
</script>

<template>
  <div class="template-watcher">
    <div class="watcher-controls">
      <button @click="toggleWatching">
        {{ isWatching ? '停止监听' : '开始监听' }}
      </button>
      <span class="status">
        {{ isWatching ? '🟢 监听中' : '🔴 已停止' }}
      </span>
    </div>

    <div class="activity-log">
      <h4>活动日志</h4>
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="activity-item"
      >
        <span class="timestamp">{{ activity.timestamp }}</span>
        <span class="action">{{ activity.action }}</span>
        <span class="template">{{ activity.template }}</span>
      </div>
    </div>
  </div>
</template>
```

## 错误处理

```vue
<script setup lang="ts">
import { useTemplateScanner } from '@ldesign/template/composables'

const {
  templates,
  isScanning,
  scanError,
  scan
} = useTemplateScanner({
  templatesDir: 'src/templates',
  autoScan: false, // 手动控制扫描
  onScanError: (error) => {
    console.error('扫描错误:', error)
    // 可以在这里显示用户友好的错误信息
  }
})

// 手动扫描并处理错误
async function handleScan() {
  try {
    const result = await scan()
    console.log(`扫描完成，发现 ${result.templates.size} 个模板`)
  }
  catch (error) {
    console.error('扫描失败:', error)
  }
}
</script>
```

## 性能优化

```vue
<script setup lang="ts">
import { useTemplateScanner } from '@ldesign/template/composables'

const {
  templates,
  scanner
} = useTemplateScanner({
  templatesDir: 'src/templates',
  enableCache: true,
  autoScan: true
})

// 预加载常用模板
onMounted(async () => {
  const commonTemplates = ['login', 'dashboard', 'user']

  for (const category of commonTemplates) {
    const categoryTemplates = getTemplatesByCategory(category)
    // 预加载模板组件
    for (const template of categoryTemplates) {
      if (template.componentLoader) {
        await template.componentLoader()
      }
    }
  }
})

// 清除缓存
function clearCache() {
  scanner.clearCache()
  console.log('缓存已清除')
}
</script>
```

## 类型定义

```typescript
// 完整的类型定义
interface UseScannerOptions {
  templatesDir: string
  autoScan?: boolean
  enableCache?: boolean
  watchMode?: boolean
  maxDepth?: number
  includeExtensions?: string[]
  excludePatterns?: string[]
  debounceDelay?: number
  batchSize?: number
  onScanComplete?: (result: ScanResult) => void
  onScanError?: (error: Error) => void
  onTemplateFound?: (template: TemplateMetadata) => void
}

interface UseScannerReturn {
  templates: Ref<Map<string, TemplateMetadata>>
  isScanning: Ref<boolean>
  scanError: Ref<Error | null>
  scan: () => Promise<ScanResult>
  getTemplatesByCategory: (category: string) => TemplateMetadata[]
  getTemplatesByDevice: (device: DeviceType) => TemplateMetadata[]
  searchTemplates: (filter: TemplateFilter) => TemplateMetadata[]
  scanner: TemplateScanner
}
```

## 相关链接

- [useTemplateSelector](./use-template-selector)
- [useTemplateRenderer](./use-template-renderer)
- [模板扫描器 API](../scanner)
