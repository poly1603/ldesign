# 性能优化示例

本示例展示如何使用 LDesign Template 的各种性能优化功能，包括缓存、预加载、懒加载等。

## 基础性能优化

### 1. 启用缓存

```typescript
import TemplatePlugin from '@ldesign/template'
import { createApp } from 'vue'

const app = createApp(App)

app.use(TemplatePlugin, {
  // 启用缓存
  cacheEnabled: true,
  cacheSize: 100, // 最多缓存 100 个模板
  cacheTTL: 10 * 60 * 1000, // 10 分钟过期
})
```

### 2. 智能预加载

```vue
<script setup lang="ts">
import { useTemplate } from '@ldesign/template'
import { onMounted } from 'vue'

const { preload } = useTemplate()

// 应用启动时预加载常用模板
onMounted(async () => {
  console.log('开始预加载常用模板...')

  await preload([
    // 预加载登录相关模板
    { category: 'auth', device: 'desktop', template: 'login' },
    { category: 'auth', device: 'mobile', template: 'login' },

    // 预加载布局模板
    { category: 'layout', device: 'desktop', template: 'header' },
    { category: 'layout', device: 'desktop', template: 'footer' },

    // 预加载仪表板模板
    { category: 'dashboard', device: 'desktop', template: 'admin' },
  ])

  console.log('预加载完成！')
})
</script>
```

### 3. 懒加载组件

```vue
<script setup lang="ts">
import { LazyTemplate } from '@ldesign/template'

function onTemplateLoad(template: any) {
  console.log('模板加载成功:', template)
}

function onTemplateError(error: Error) {
  console.error('模板加载失败:', error)
}
</script>

<template>
  <div class="performance-demo">
    <!-- 使用懒加载渲染器 -->
    <LazyTemplate
      category="dashboard"
      template="charts"
      :placeholder-height="400"
      @load="onTemplateLoad"
      @error="onTemplateError"
    >
      <!-- 自定义加载占位符 -->
      <template #loading>
        <div class="loading-placeholder">
          <div class="spinner" />
          <p>正在加载图表模板...</p>
        </div>
      </template>

      <!-- 自定义错误占位符 -->
      <template #error="{ error, retry }">
        <div class="error-placeholder">
          <p>加载失败: {{ error.message }}</p>
          <button @click="retry">重试</button>
        </div>
      </template>
    </LazyTemplate>
  </div>
</template>
```

## 高级性能优化

### 1. 性能监控

```vue
<script setup lang="ts">
import { PerformanceMonitor, useTemplate } from '@ldesign/template'
import { onMounted, ref } from 'vue'

const performanceData = ref({})
const { clearCache } = useTemplate()

// 监控性能指标
onMounted(() => {
  const monitor = new PerformanceMonitor({
    enableFPSMonitoring: true,
    enableMemoryMonitoring: true,
    enableNetworkMonitoring: true,
    reportInterval: 1000, // 每秒报告一次
  })

  monitor.on('report', data => {
    performanceData.value = data

    // 如果内存使用过高，清理缓存
    if (data.memory?.percentage > 80) {
      console.warn('内存使用过高，清理模板缓存')
      clearCache()
    }
  })

  monitor.start()
})
</script>

<template>
  <div class="performance-monitor">
    <h3>性能监控</h3>

    <div class="metrics-grid">
      <div class="metric-card">
        <h4>FPS</h4>
        <div class="metric-value">
          {{ performanceData.rendering?.fps || 0 }}
        </div>
      </div>

      <div class="metric-card">
        <h4>内存使用</h4>
        <div class="metric-value">
          {{ performanceData.memory?.percentage || 0 }}%
        </div>
      </div>

      <div class="metric-card">
        <h4>网络延迟</h4>
        <div class="metric-value">
          {{ performanceData.network?.rtt || 0 }}ms
        </div>
      </div>
    </div>
  </div>
</template>
```

### 2. 虚拟滚动优化

```vue
<script setup lang="ts">
import { useVirtualScroll } from '@ldesign/template'
import { computed, ref } from 'vue'

// 大量模板数据
const templates = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    category: `category-${i % 10}`,
    device: ['desktop', 'tablet', 'mobile'][i % 3],
    template: `template-${i}`,
    title: `模板 ${i}`,
    description: `这是第 ${i} 个模板的描述`,
  }))
)

// 使用虚拟滚动
const {
  containerRef,
  visibleItems,
  scrollToItem,
  scrollToTop,
  scrollToBottom,
} = useVirtualScroll({
  items: templates,
  itemHeight: 80,
  containerHeight: 400,
  overscan: 5, // 预渲染 5 个额外项目
})

// 搜索功能
const searchQuery = ref('')
const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value

  return templates.value.filter(
    template =>
      template.title.includes(searchQuery.value) ||
      template.description.includes(searchQuery.value)
  )
})
</script>

<template>
  <div class="virtual-scroll-demo">
    <div class="controls">
      <input
        v-model="searchQuery"
        placeholder="搜索模板..."
        class="search-input"
      />

      <div class="scroll-controls">
        <button @click="scrollToTop">回到顶部</button>
        <button @click="scrollToItem(5000)">跳转到中间</button>
        <button @click="scrollToBottom">跳转到底部</button>
      </div>
    </div>

    <!-- 虚拟滚动容器 -->
    <div ref="containerRef" class="virtual-container">
      <div
        v-for="item in visibleItems"
        :key="item.data.id"
        class="template-item"
        :style="{ transform: `translateY(${item.offsetY}px)` }"
      >
        <h4>{{ item.data.title }}</h4>
        <p>{{ item.data.description }}</p>
        <div class="template-meta">
          <span class="category">{{ item.data.category }}</span>
          <span class="device">{{ item.data.device }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 3. 智能缓存策略

```typescript
import { TemplateManager } from '@ldesign/template'

class SmartTemplateManager extends TemplateManager {
  private usageStats = new Map<string, number>()
  private lastUsed = new Map<string, number>()

  async loadTemplate(category: string, device: string, template: string) {
    const key = `${category}:${device}:${template}`

    // 记录使用统计
    this.usageStats.set(key, (this.usageStats.get(key) || 0) + 1)
    this.lastUsed.set(key, Date.now())

    // 调用父类方法
    const result = await super.loadTemplate(category, device, template)

    // 智能预加载相关模板
    this.smartPreload(category, device, template)

    return result
  }

  private async smartPreload(
    category: string,
    device: string,
    template: string
  ) {
    // 基于使用模式预加载相关模板
    const relatedTemplates = this.getRelatedTemplates(
      category,
      device,
      template
    )

    // 异步预加载，不阻塞当前操作
    setTimeout(async () => {
      for (const related of relatedTemplates) {
        try {
          await this.preloadTemplate(
            related.category,
            related.device,
            related.template
          )
        } catch (error) {
          console.warn('预加载失败:', error)
        }
      }
    }, 100)
  }

  private getRelatedTemplates(
    category: string,
    device: string,
    template: string
  ) {
    // 根据使用统计和模式识别相关模板
    const related = []

    // 同分类的其他设备版本
    for (const d of ['desktop', 'tablet', 'mobile']) {
      if (d !== device) {
        related.push({ category, device: d, template })
      }
    }

    // 同设备的相关分类
    const relatedCategories = this.getRelatedCategories(category)
    for (const cat of relatedCategories) {
      related.push({ category: cat, device, template })
    }

    return related
  }

  private getRelatedCategories(category: string): string[] {
    // 定义分类关联关系
    const relations: Record<string, string[]> = {
      auth: ['layout', 'dashboard'],
      dashboard: ['auth', 'layout'],
      layout: ['auth', 'dashboard'],
    }

    return relations[category] || []
  }

  // 智能缓存清理
  smartClearCache() {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    // 清理一小时内未使用的模板
    for (const [key, lastUsedTime] of this.lastUsed) {
      if (now - lastUsedTime > oneHour) {
        const [category, device, template] = key.split(':')
        this.clearCache(category, device, template)
        this.lastUsed.delete(key)
      }
    }
  }
}

// 使用智能模板管理器
const smartManager = new SmartTemplateManager({
  cacheEnabled: true,
  cacheSize: 50,
  cacheTTL: 30 * 60 * 1000, // 30 分钟
})

// 定期清理缓存
setInterval(() => {
  smartManager.smartClearCache()
}, 10 * 60 * 1000) // 每 10 分钟清理一次
```

## 性能测试和基准

### 1. 加载时间测试

```typescript
async function benchmarkTemplateLoading() {
  const templates = [
    { category: 'auth', device: 'desktop', template: 'login' },
    { category: 'dashboard', device: 'desktop', template: 'admin' },
    { category: 'layout', device: 'mobile', template: 'header' },
  ]

  console.log('开始性能测试...')

  for (const template of templates) {
    const startTime = performance.now()

    try {
      await manager.loadTemplate(
        template.category,
        template.device,
        template.template
      )
      const loadTime = performance.now() - startTime

      console.log(
        `${template.category}/${template.device}/${
          template.template
        }: ${loadTime.toFixed(2)}ms`
      )
    } catch (error) {
      console.error('加载失败:', template, error)
    }
  }

  console.log('性能测试完成')
}

// 运行基准测试
benchmarkTemplateLoading()
```

### 2. 内存使用监控

```typescript
function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory

    console.log('内存使用情况:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
    })
  }
}

// 定期监控内存使用
setInterval(monitorMemoryUsage, 5000)
```

## 最佳实践总结

1. **启用缓存**: 合理配置缓存大小和过期时间
2. **智能预加载**: 根据用户行为模式预加载相关模板
3. **懒加载**: 对非关键模板使用懒加载
4. **虚拟滚动**: 处理大量模板列表时使用虚拟滚动
5. **性能监控**: 实时监控关键性能指标
6. **内存管理**: 定期清理不需要的缓存
7. **错误处理**: 提供优雅的错误处理和重试机制

通过这些优化策略，可以显著提升模板系统的性能和用户体验。
