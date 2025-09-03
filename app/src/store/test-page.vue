<!--
  Store 插件测试页面
  
  测试 Store 插件的各种功能：
  - 基础状态管理
  - 装饰器模式
  - 函数式模式
  - 组合式模式
  - 性能优化
  - 缓存功能
-->

<template>
  <div class="store-test-page">
    <div class="page-header">
      <h1>🗃️ Store 状态管理测试</h1>
      <p>测试 @ldesign/store 包的各种功能和集成效果</p>
    </div>

    <div class="test-sections">
      <!-- 基础状态管理测试 -->
      <section class="test-section">
        <h2>📦 基础状态管理</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>计数器值:</strong> {{ counter }}</p>
            <p><strong>用户名:</strong> {{ userName || '未设置' }}</p>
            <p><strong>最后更新:</strong> {{ lastUpdate || '从未更新' }}</p>
          </div>
          <div class="controls">
            <button @click="increment" class="btn btn-primary">增加计数</button>
            <button @click="decrement" class="btn btn-secondary">减少计数</button>
            <button @click="reset" class="btn btn-warning">重置计数</button>
            <button @click="updateUser" class="btn btn-success">更新用户</button>
          </div>
        </div>
      </section>

      <!-- 函数式 Store 测试 -->
      <section class="test-section">
        <h2>🔧 函数式 Store</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>函数式计数:</strong> {{ functionalCounter }}</p>
            <p><strong>双倍值:</strong> {{ doubledValue }}</p>
          </div>
          <div class="controls">
            <button @click="incrementFunctional" class="btn btn-primary">函数式增加</button>
            <button @click="decrementFunctional" class="btn btn-secondary">函数式减少</button>
            <button @click="resetFunctional" class="btn btn-warning">函数式重置</button>
          </div>
        </div>
      </section>

      <!-- 组合式 Store 测试 -->
      <section class="test-section">
        <h2>🎯 组合式 Store</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>组合式计数:</strong> {{ compositionCounter }}</p>
            <p><strong>是否为偶数:</strong> {{ isEven ? '是' : '否' }}</p>
          </div>
          <div class="controls">
            <button @click="incrementComposition" class="btn btn-primary">组合式增加</button>
            <button @click="decrementComposition" class="btn btn-secondary">组合式减少</button>
            <button @click="resetComposition" class="btn btn-warning">组合式重置</button>
          </div>
        </div>
      </section>

      <!-- 性能测试 -->
      <section class="test-section">
        <h2>⚡ 性能测试</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>批量操作次数:</strong> {{ batchOperations }}</p>
            <p><strong>平均耗时:</strong> {{ averageTime }}ms</p>
          </div>
          <div class="controls">
            <button @click="performBatchOperations" class="btn btn-primary">批量操作测试</button>
            <button @click="clearPerformanceData" class="btn btn-warning">清除性能数据</button>
          </div>
        </div>
      </section>

      <!-- 插件状态信息 -->
      <section class="test-section">
        <h2>🔍 插件状态信息</h2>
        <div class="test-content">
          <div class="info-grid">
            <div class="info-item">
              <strong>插件状态:</strong>
              <span :class="pluginStatus.class">{{ pluginStatus.text }}</span>
            </div>
            <div class="info-item">
              <strong>Pinia 实例:</strong>
              <span :class="piniaStatus.class">{{ piniaStatus.text }}</span>
            </div>
            <div class="info-item">
              <strong>Store 工厂:</strong>
              <span :class="factoryStatus.class">{{ factoryStatus.text }}</span>
            </div>
            <div class="info-item">
              <strong>性能优化器:</strong>
              <span :class="optimizerStatus.class">{{ optimizerStatus.text }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { createStore, createFunctionalStore, createCompositionStore } from '@ldesign/store'

// 响应式数据
const counter = ref(0)
const userName = ref('')
const lastUpdate = ref('')
const functionalCounter = ref(0)
const compositionCounter = ref(0)
const batchOperations = ref(0)
const averageTime = ref(0)

// 计算属性
const doubledValue = computed(() => functionalCounter.value * 2)
const isEven = computed(() => compositionCounter.value % 2 === 0)

// 获取当前组件实例
const instance = getCurrentInstance()

// 插件状态检查
const pluginStatus = computed(() => {
  const app = instance?.appContext.app
  const globalProperties = app?.config.globalProperties
  const hasStorePlugin = globalProperties?.$store
  
  return hasStorePlugin
    ? { text: '已安装', class: 'status-success' }
    : { text: '未安装', class: 'status-error' }
})

const piniaStatus = computed(() => {
  const app = instance?.appContext.app
  const globalProperties = app?.config.globalProperties
  const hasPinia = globalProperties?.$store?.pinia
  
  return hasPinia
    ? { text: '已初始化', class: 'status-success' }
    : { text: '未初始化', class: 'status-error' }
})

const factoryStatus = computed(() => {
  const app = instance?.appContext.app
  const globalProperties = app?.config.globalProperties
  const hasFactory = globalProperties?.$store?.factory
  
  return hasFactory
    ? { text: '已创建', class: 'status-success' }
    : { text: '未创建', class: 'status-error' }
})

const optimizerStatus = computed(() => {
  const app = instance?.appContext.app
  const globalProperties = app?.config.globalProperties
  const hasOptimizer = globalProperties?.$store?.optimizer
  
  return hasOptimizer
    ? { text: '已启用', class: 'status-success' }
    : { text: '未启用', class: 'status-warning' }
})

// 创建测试用的 stores
let basicStore: any
let functionalStore: any
let compositionStore: any

// 基础操作方法
const increment = () => {
  counter.value++
  updateTimestamp()
}

const decrement = () => {
  counter.value--
  updateTimestamp()
}

const reset = () => {
  counter.value = 0
  updateTimestamp()
}

const updateUser = () => {
  userName.value = `用户${Math.floor(Math.random() * 1000)}`
  updateTimestamp()
}

const updateTimestamp = () => {
  lastUpdate.value = new Date().toLocaleTimeString()
}

// 函数式 Store 操作
const incrementFunctional = () => {
  if (functionalStore) {
    // 通过 Pinia store 调用 action
    const store = functionalStore.getStore()
    store.increment()
    functionalCounter.value = store.count
  }
}

const decrementFunctional = () => {
  if (functionalStore) {
    const store = functionalStore.getStore()
    store.decrement()
    functionalCounter.value = store.count
  }
}

const resetFunctional = () => {
  if (functionalStore) {
    const store = functionalStore.getStore()
    store.reset()
    functionalCounter.value = store.count
  }
}

// 组合式 Store 操作
const incrementComposition = () => {
  if (compositionStore) {
    // 通过 Pinia store 调用方法
    const store = compositionStore.getStore()
    store.increment()
    compositionCounter.value = store.count
  }
}

const decrementComposition = () => {
  if (compositionStore) {
    const store = compositionStore.getStore()
    store.decrement()
    compositionCounter.value = store.count
  }
}

const resetComposition = () => {
  if (compositionStore) {
    const store = compositionStore.getStore()
    store.reset()
    compositionCounter.value = store.count
  }
}

// 性能测试
const performBatchOperations = async () => {
  const startTime = performance.now()
  const operations = 1000
  
  for (let i = 0; i < operations; i++) {
    counter.value++
    if (functionalStore) {
      const store = functionalStore.getStore()
      store.increment()
    }
    if (compositionStore) {
      const store = compositionStore.getStore()
      store.increment()
    }
  }
  
  const endTime = performance.now()
  const totalTime = endTime - startTime
  
  batchOperations.value += operations
  averageTime.value = Number((totalTime / operations).toFixed(3))
  
  // 更新显示值
  if (functionalStore) {
    const store = functionalStore.getStore()
    functionalCounter.value = store.count
  }
  if (compositionStore) {
    const store = compositionStore.getStore()
    compositionCounter.value = store.count
  }
  
  updateTimestamp()
}

const clearPerformanceData = () => {
  batchOperations.value = 0
  averageTime.value = 0
}

// 组件挂载时初始化
onMounted(async () => {
  try {
    // 创建基础 Store（如果可用）
    if (typeof createStore === 'function') {
      console.log('Creating basic store...')
    }
    
    // 创建函数式 Store
    if (typeof createFunctionalStore === 'function') {
      const functionalStoreFactory = createFunctionalStore({
        id: 'functional-counter',
        state: () => ({ count: 0 }),
        actions: {
          increment() {
            this.count++
          },
          decrement() {
            this.count--
          },
          reset() {
            this.count = 0
          }
        }
      })
      functionalStore = functionalStoreFactory()
      // 获取初始值
      const store = functionalStore.getStore()
      functionalCounter.value = store.count
      console.log('Functional store created:', functionalStore)
    }
    
    // 创建组合式 Store
    if (typeof createCompositionStore === 'function') {
      const compositionStoreFactory = createCompositionStore(
        { id: 'composition-counter' },
        () => {
          const count = ref(0)

          const increment = () => count.value++
          const decrement = () => count.value--
          const reset = () => count.value = 0

          return {
            count,
            increment,
            decrement,
            reset
          }
        }
      )
      compositionStore = compositionStoreFactory()
      // 获取初始值
      const store = compositionStore.getStore()
      compositionCounter.value = store.count
      console.log('Composition store created:', compositionStore)
    }
    
    console.log('Store test page initialized successfully')
  } catch (error) {
    console.error('Failed to initialize store test page:', error)
  }
})
</script>

<style scoped lang="less">
.store-test-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: 8px;
  }
  
  p {
    color: var(--ldesign-text-color-secondary);
    font-size: 16px;
  }
}

.test-sections {
  display: grid;
  gap: 24px;
}

.test-section {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  padding: 24px;
  
  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: 16px;
    font-size: 18px;
  }
}

.test-content {
  display: grid;
  gap: 16px;
}

.state-display {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  padding: 16px;
  
  p {
    margin: 8px 0;
    color: var(--ldesign-text-color-primary);
    
    strong {
      color: var(--ldesign-brand-color);
    }
  }
}

.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &.btn-primary {
    background: var(--ldesign-brand-color);
    color: white;
    
    &:hover {
      background: var(--ldesign-brand-color-hover);
    }
  }
  
  &.btn-secondary {
    background: var(--ldesign-gray-color-6);
    color: white;
    
    &:hover {
      background: var(--ldesign-gray-color-7);
    }
  }
  
  &.btn-warning {
    background: var(--ldesign-warning-color);
    color: white;
    
    &:hover {
      background: var(--ldesign-warning-color-hover);
    }
  }
  
  &.btn-success {
    background: var(--ldesign-success-color);
    color: white;
    
    &:hover {
      background: var(--ldesign-success-color-hover);
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  
  strong {
    color: var(--ldesign-text-color-primary);
  }
}

.status-success {
  color: var(--ldesign-success-color);
  font-weight: 500;
}

.status-warning {
  color: var(--ldesign-warning-color);
  font-weight: 500;
}

.status-error {
  color: var(--ldesign-error-color);
  font-weight: 500;
}
</style>
