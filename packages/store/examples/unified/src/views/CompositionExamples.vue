<script setup lang="ts">
import { computed } from 'vue'
import { useCounterCompositionStore } from '@/stores/composition/CounterStore'

// 使用组合式 Store
const store = useCounterCompositionStore()

// 根据计数值动态设置样式类
const valueClass = computed(() => ({
  positive: store.isPositive,
  negative: store.isNegative,
  zero: store.count === 0
}))

// 更新步长
function updateStep(event: Event) {
  const target = event.target as HTMLInputElement
  const value = Number.parseInt(target.value) || 1
  store.setStep(value)
}
</script>

<template>
  <div class="composition-examples">
    <div class="page-header">
      <h1>组合式示例</h1>
      <p>展示使用 Composition API 创建 Store 的各种功能</p>
    </div>



    <div class="examples-grid">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">createCompositionStore</h2>
          <p class="card-description">使用 Composition API 创建 Store</p>
        </div>

        <div class="example-content">
          <div class="code-block">
            const useCounterStore = createCompositionStore({
            id: 'counter',
            setup: ({ state, computed }) => {
            const count = state(0)
            const doubleCount = computed(() => count.value * 2)

            const increment = () => {
            count.value++
            }

            return {
            count,
            doubleCount,
            increment
            }
            }
            })
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">响应式状态</h2>
          <p class="card-description">使用 Vue 3 的响应式 API</p>
        </div>

        <div class="example-content">
          <div class="code-block">
            setup: ({ state, computed, watch }) => {
            const count = state(0)
            const name = state('Counter')

            // 计算属性
            const displayName = computed(() =>
            `${name.value}: ${count.value}`
            )

            // 监听器
            watch(count, (newVal) => {
            console.log('Count changed:', newVal)
            })

            return { count, name, displayName }
            }
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">生命周期</h2>
          <p class="card-description">组合式 Store 的生命周期管理</p>
        </div>

        <div class="example-content">
          <div class="code-block">
            setup: ({ state, onUnmounted }) => {
            const timer = setInterval(() => {
            // 定时任务
            }, 1000)

            // 清理资源
            onUnmounted(() => {
            clearInterval(timer)
            })

            return { /* ... */ }
            }
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.composition-examples {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.page-header p {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.example-content {
  padding: 1rem 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .examples-grid {
    grid-template-columns: 1fr;
  }
}
</style>
