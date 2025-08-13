<script setup lang="ts">
import { computed, defineAsyncComponent, h, markRaw, ref } from 'vue'

interface LazyComponent {
  name: string
  description: string
  loader: () => Promise<any>
  component?: any
  loaded: boolean
  loading: boolean
  loadTime?: number
}

const lazyComponents = ref<LazyComponent[]>([
  {
    name: '图表组件',
    description: '一个复杂的数据可视化组件',
    loader: () => createMockComponent('Chart', 1000),
    loaded: false,
    loading: false,
  },
  {
    name: '编辑器组件',
    description: '富文本编辑器组件',
    loader: () => createMockComponent('Editor', 1500),
    loaded: false,
    loading: false,
  },
  {
    name: '地图组件',
    description: '交互式地图组件',
    loader: () => createMockComponent('Map', 2000),
    loaded: false,
    loading: false,
  },
  {
    name: '视频播放器',
    description: '多媒体播放组件',
    loader: () => createMockComponent('VideoPlayer', 800),
    loaded: false,
    loading: false,
  },
])

const loadedCount = computed(
  () => lazyComponents.value.filter(comp => comp.loaded).length
)

const totalLoadTime = computed(() =>
  lazyComponents.value
    .filter(comp => comp.loadTime)
    .reduce((total, comp) => total + (comp.loadTime || 0), 0)
)

const averageLoadTime = computed(() =>
  loadedCount.value > 0
    ? Math.round(totalLoadTime.value / loadedCount.value)
    : 0
)

// 创建模拟组件
function createMockComponent(name: string, delay: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        default: defineAsyncComponent(() =>
          Promise.resolve({
            name: `Mock${name}`,
            setup() {
              return () => {
                const items = [1, 2, 3]
                return h('div', { class: 'mock-component' }, [
                  h('h4', `🎯 ${name} 组件`),
                  h('p', `这是一个模拟的 ${name} 组件，用于演示懒加载功能。`),
                  h(
                    'div',
                    { class: 'mock-content' },
                    items.map(i =>
                      h('div', { class: 'mock-item', key: i }, `模拟内容 ${i}`)
                    )
                  ),
                ])
              }
            },
          })
        ),
      })
    }, delay)
  })
}

async function loadComponent(comp: LazyComponent) {
  if (comp.loading) return

  comp.loading = true
  const startTime = Date.now()

  try {
    const module = await comp.loader()
    comp.component = markRaw(module.default)
    comp.loaded = true
    comp.loadTime = Date.now() - startTime
  } catch (error) {
    console.error(`Failed to load component ${comp.name}:`, error)
  } finally {
    comp.loading = false
  }
}
</script>

<template>
  <div class="lazy-loading">
    <div class="card">
      <h1>懒加载演示</h1>
      <p>这个页面演示了组件懒加载功能，可以优化应用的首屏加载速度。</p>
    </div>

    <div class="card">
      <h2>懒加载组件</h2>
      <div class="lazy-components">
        <div
          v-for="(comp, index) in lazyComponents"
          :key="index"
          class="component-item"
        >
          <h3>{{ comp.name }}</h3>
          <p>{{ comp.description }}</p>
          <button
            :disabled="comp.loading"
            class="btn btn-primary"
            @click="loadComponent(comp)"
          >
            {{
              comp.loading ? '加载中...' : comp.loaded ? '重新加载' : '加载组件'
            }}
          </button>
          <div v-if="comp.loaded" class="component-content">
            <component :is="comp.component" />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>加载统计</h2>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">已加载组件:</span>
          <span class="stat-value"
            >{{ loadedCount }} / {{ lazyComponents.length }}</span
          >
        </div>
        <div class="stat-item">
          <span class="stat-label">总加载时间:</span>
          <span class="stat-value">{{ totalLoadTime }}ms</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均加载时间:</span>
          <span class="stat-value">{{ averageLoadTime }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.lazy-loading {
  max-width: 1000px;
  margin: 0 auto;
}

.lazy-components {
  display: grid;
  gap: @spacing-lg;
}

.component-item {
  padding: @spacing-lg;
  border: 1px solid @gray-200;
  border-radius: @border-radius-md;

  h3 {
    color: @gray-800;
    margin-bottom: @spacing-sm;
  }

  p {
    color: @gray-600;
    margin-bottom: @spacing-md;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.component-content {
  margin-top: @spacing-md;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: @spacing-md;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: @spacing-sm;
  background: @gray-50;
  border-radius: @border-radius-sm;

  .stat-label {
    color: @gray-700;
    font-weight: 500;
  }

  .stat-value {
    color: @primary-color;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: 1fr;
  }
}

// 模拟组件样式
.mock-component {
  padding: 1rem;
  border: 2px dashed #4299e1;
  border-radius: 8px;
  margin-top: 1rem;
  background: #f7fafc;

  h4 {
    color: #4299e1;
    margin-bottom: 0.5rem;
  }
}

.mock-content {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mock-item {
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #4a5568;
}
</style>
