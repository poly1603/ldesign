<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useStorePoolDemo } from '../stores/storePoolStore'

const store = useStorePoolDemo()

// 响应式数据
const instances = ref<Array<{ id: string, count: number }>>([])
const traditionalTime = ref(0)
const pooledTime = ref(0)
const traditionalMemory = ref(0)
const pooledMemory = ref(0)

// 计算属性
const poolStats = computed(() => store.poolStats)
const activeInstances = computed(() => {
  return poolStats.value.poolDetails.reduce(
    (sum, pool) => sum + pool.activeInstances,
    0,
  )
})

const timeImprovement = computed(() => {
  if (traditionalTime.value === 0 || pooledTime.value === 0)
    return 0
  return (
    ((traditionalTime.value - pooledTime.value) / traditionalTime.value) * 100
  )
})

const memoryImprovement = computed(() => {
  if (traditionalMemory.value === 0 || pooledMemory.value === 0)
    return 0
  return (
    ((traditionalMemory.value - pooledMemory.value) / traditionalMemory.value)
    * 100
  )
})

// 方法
function createInstance() {
  const instance = store.createPooledInstance()
  instances.value.push({
    id: instance.$id,
    count: instance.count,
  })
}

function returnInstance() {
  if (instances.value.length > 0) {
    const instance = instances.value.pop()
    if (instance) {
      store.returnInstanceToPool(instance.id)
    }
  }
}

function incrementInstance(index: number) {
  const instanceData = instances.value[index]
  store.incrementInstance(instanceData.id)
  instanceData.count++
}

function warmUpPool() {
  store.warmUpPool(5)
}

function clearPool() {
  store.clearPool()
  instances.value = []
}

async function testTraditionalCreation() {
  const result = await store.testTraditionalCreation(100)
  traditionalTime.value = result.time
  traditionalMemory.value = result.memory
}

async function testPooledCreation() {
  const result = await store.testPooledCreation(100)
  pooledTime.value = result.time
  pooledMemory.value = result.memory
}

// 组件挂载时初始化
onMounted(() => {
  store.initializePool()
})
</script>

<template>
  <div class="store-pool-demo">
    <div class="page-header">
      <h1>Store 池管理示例</h1>
      <p>展示如何使用Store池减少内存分配，提高应用性能</p>
    </div>

    <div class="demo-section">
      <h2>池统计信息</h2>
      <div class="grid grid-3">
        <div class="metric">
          <div class="metric-value">
            {{ poolStats.totalPools }}
          </div>
          <div class="metric-label">
            总池数
          </div>
        </div>
        <div class="metric">
          <div class="metric-value">
            {{ poolStats.totalInstances }}
          </div>
          <div class="metric-label">
            总实例数
          </div>
        </div>
        <div class="metric">
          <div class="metric-value">
            {{ activeInstances }}
          </div>
          <div class="metric-label">
            活跃实例
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>池化Store操作</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>创建和管理实例</h3>
          <div class="actions">
            <button class="btn btn-primary" @click="createInstance">
              创建实例
            </button>
            <button
              class="btn btn-secondary"
              :disabled="instances.length === 0"
              @click="returnInstance"
            >
              归还实例
            </button>
            <button class="btn btn-secondary" @click="warmUpPool">
              预热池 (5个实例)
            </button>
            <button class="btn btn-danger" @click="clearPool">
              清空池
            </button>
          </div>

          <div class="instance-list">
            <h4>当前实例 ({{ instances.length }})</h4>
            <div
              v-for="(instance, index) in instances"
              :key="instance.id"
              class="instance-item"
            >
              <span>实例 {{ instance.id }} - 计数: {{ instance.count }}</span>
              <button
                class="btn btn-secondary btn-sm"
                @click="incrementInstance(index)"
              >
                +1
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>池详细信息</h3>
          <div
            v-for="pool in poolStats.poolDetails"
            :key="pool.className"
            class="pool-detail"
          >
            <h4>{{ pool.className }}</h4>
            <div class="pool-metrics">
              <div class="pool-metric">
                <span class="label">池大小:</span>
                <span class="value">{{ pool.poolSize }}</span>
              </div>
              <div class="pool-metric">
                <span class="label">活跃实例:</span>
                <span class="value">{{ pool.activeInstances }}</span>
              </div>
              <div class="pool-metric">
                <span class="label">最大大小:</span>
                <span class="value">{{ pool.maxSize }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>性能对比</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>传统方式 (直接创建)</h3>
          <p>创建时间: {{ traditionalTime }}ms</p>
          <p>内存使用: {{ traditionalMemory }}MB</p>
          <button class="btn btn-primary" @click="testTraditionalCreation">
            测试传统创建 (100次)
          </button>
        </div>

        <div class="card">
          <h3>池化方式</h3>
          <p>创建时间: {{ pooledTime }}ms</p>
          <p>内存使用: {{ pooledMemory }}MB</p>
          <button class="btn btn-primary" @click="testPooledCreation">
            测试池化创建 (100次)
          </button>
        </div>
      </div>

      <div class="card">
        <h3>性能提升</h3>
        <div
          v-if="traditionalTime > 0 && pooledTime > 0"
          class="performance-comparison"
        >
          <div class="comparison-metric">
            <span class="label">时间提升:</span>
            <span class="value" :class="{ positive: timeImprovement > 0 }">
              {{ timeImprovement > 0 ? '+' : ''
              }}{{ timeImprovement.toFixed(1) }}%
            </span>
          </div>
          <div class="comparison-metric">
            <span class="label">内存节省:</span>
            <span class="value" :class="{ positive: memoryImprovement > 0 }">
              {{ memoryImprovement > 0 ? '+' : ''
              }}{{ memoryImprovement.toFixed(1) }}%
            </span>
          </div>
        </div>
        <div v-else class="alert alert-info">
          运行上面的测试来查看性能对比结果
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>代码示例</h2>
      <div class="card">
        <h3>使用 @PooledStore 装饰器</h3>
        <div class="code-block">
          <pre>
import { PooledStore, BaseStore } from '@ldesign/store'

@PooledStore({ maxSize: 10, maxIdleTime: 300000 })
class OptimizedStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }
}

// 实例会被自动池化管理
const store = new OptimizedStore('my-store')</pre>
        </div>

        <h3>手动使用Store池</h3>
        <div class="code-block">
          <pre>
import { useStorePool } from '@ldesign/store'

const pool = useStorePool({
  maxSize: 20,
  maxIdleTime: 600000, // 10分钟
  enableGC: true
})

// 获取池化的实例
const store = pool.getStore(MyStore, 'store-id')

// 使用完毕后归还
pool.returnStore(store)

// 预热池
pool.warmUp(MyStore, 5)</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.store-pool-demo {
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

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.instance-list {
  margin-top: 1.5rem;
}

.instance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin: 0.5rem 0;
  background: #f7fafc;
  border-radius: 6px;
}

.pool-detail {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.pool-detail h4 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.pool-metrics {
  display: grid;
  gap: 0.5rem;
}

.pool-metric {
  display: flex;
  justify-content: space-between;
}

.pool-metric .label {
  color: #718096;
}

.pool-metric .value {
  font-weight: 600;
  color: #2d3748;
}

.performance-comparison {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.comparison-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.comparison-metric .value.positive {
  color: #38a169;
  font-weight: 600;
}
</style>
