<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { usePerformanceStore } from '../stores/performanceStore'

const store = usePerformanceStore()

// 响应式数据
const searchQuery = ref('')
const scrollPosition = ref(0)
const searchApiCalls = ref(0)
const scrollHandlerCalls = ref(0)
const cacheHits = ref(0)
const loading = ref(false)

// 计算属性
const performanceReport = computed(() => store.performanceReport)
const suggestions = computed(() => store.optimizationSuggestions)
const expensiveResult = computed(() => store.expensiveComputationResult)
const userData = computed(() => store.userData)
const apiCacheStatus = computed(() => store.apiCacheStatus)
const searchResults = computed(() => store.searchResults)

// 方法
function triggerSlowAction() {
  store.performSlowAction()
}

function triggerFastAction() {
  store.performFastAction()
}

function clearMetrics() {
  store.clearPerformanceMetrics()
}

function triggerExpensiveComputation() {
  const result = store.performExpensiveComputation()
  if (store.isCacheHit) {
    cacheHits.value++
  }
}

async function fetchUserData() {
  loading.value = true
  try {
    await store.fetchUserData()
  }
  finally {
    loading.value = false
  }
}

function clearApiCache() {
  store.clearApiCache()
}

function handleScroll(event: Event) {
  scrollHandlerCalls.value++
  const target = event.target as HTMLElement
  scrollPosition.value = target.scrollTop
  store.updateScrollPosition(target.scrollTop)
}

// 监听搜索查询
watch(searchQuery, (newQuery) => {
  searchApiCalls.value++
  store.performSearch(newQuery)
})

// 组件挂载时初始化
onMounted(() => {
  store.initializePerformanceMonitoring()
})
</script>

<template>
  <div class="performance-demo">
    <div class="page-header">
      <h1>性能优化示例</h1>
      <p>展示如何使用性能监控、缓存、防抖节流等技术优化应用性能</p>
    </div>

    <div class="demo-section">
      <h2>性能监控</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>实时性能指标</h3>
          <div class="metrics">
            <div class="metric">
              <div class="metric-value">
                {{ performanceReport.slowActions.length }}
              </div>
              <div class="metric-label">
                慢速 Actions
              </div>
            </div>
            <div class="metric">
              <div class="metric-value">
                {{ performanceReport.slowGetters.length }}
              </div>
              <div class="metric-label">
                慢速 Getters
              </div>
            </div>
            <div class="metric">
              <div class="metric-value">
                {{ performanceReport.frequentUpdates.length }}
              </div>
              <div class="metric-label">
                频繁更新
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" @click="triggerSlowAction">
              触发慢速操作
            </button>
            <button class="btn btn-secondary" @click="triggerFastAction">
              触发快速操作
            </button>
            <button class="btn btn-danger" @click="clearMetrics">
              清理指标
            </button>
          </div>
        </div>

        <div class="card">
          <h3>优化建议</h3>
          <div v-if="suggestions.length === 0" class="alert alert-success">
            🎉 当前性能表现良好，无需优化！
          </div>
          <div v-else>
            <div
              v-for="suggestion in suggestions"
              :key="suggestion"
              class="alert alert-warning"
            >
              💡 {{ suggestion }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>缓存优化</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>计算缓存示例</h3>
          <p>计算结果：{{ expensiveResult }}</p>
          <p>缓存命中：{{ cacheHits }} 次</p>
          <button class="btn btn-primary" @click="triggerExpensiveComputation">
            触发复杂计算
          </button>
        </div>

        <div class="card">
          <h3>API 缓存示例</h3>
          <p>用户数据：{{ userData?.name || '未加载' }}</p>
          <p>缓存状态：{{ apiCacheStatus }}</p>
          <div class="actions">
            <button
              class="btn btn-primary"
              :disabled="loading"
              @click="fetchUserData"
            >
              {{ loading ? '加载中...' : '获取用户数据' }}
            </button>
            <button class="btn btn-secondary" @click="clearApiCache">
              清理缓存
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>防抖和节流</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>搜索防抖</h3>
          <input
            v-model="searchQuery"
            placeholder="输入搜索关键词..."
            class="search-input"
          >
          <p>搜索结果数量：{{ searchResults.length }}</p>
          <p>API 调用次数：{{ searchApiCalls }}</p>
        </div>

        <div class="card">
          <h3>滚动节流</h3>
          <div class="scroll-container" @scroll="handleScroll">
            <div class="scroll-content">
              <p v-for="i in 50" :key="i">
                滚动内容 {{ i }}
              </p>
            </div>
          </div>
          <p>滚动位置：{{ scrollPosition }}px</p>
          <p>滚动事件处理次数：{{ scrollHandlerCalls }}</p>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>代码示例</h2>
      <div class="card">
        <h3>性能监控装饰器使用</h3>
        <div class="code-block">
          <pre>
import { MonitorAction, MonitorGetter } from '@ldesign/store'

class PerformanceStore extends BaseStore {
  @MonitorAction
  @Action()
  async slowOperation() {
    // 这个方法的执行时间会被自动监控
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  @MonitorGetter
  @Getter({ deps: ['data'] })
  get expensiveComputation() {
    // 这个计算属性的执行时间会被监控
    return this.data.reduce((sum, item) => sum + item.value, 0)
  }
}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.scroll-container {
  height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.scroll-content {
  padding: 1rem;
}

.scroll-content p {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
}
</style>
