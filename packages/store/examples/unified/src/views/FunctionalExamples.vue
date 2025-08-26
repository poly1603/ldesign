<script setup lang="ts">
import { useCounterStore } from '@/stores/functional/CounterStore'

// 使用函数式 Store
const counterStore = useCounterStore()
</script>

<template>
  <div class="functional-examples">
    <div class="page-header">
      <h1>函数式示例</h1>
      <p>展示使用函数式 API 创建 Store 的各种功能</p>
    </div>

    <div class="examples-grid">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">函数式计数器</h2>
          <p class="card-description">使用函数式 API 创建的计数器 Store</p>
        </div>

        <div class="example-content">
          <div class="counter-display">
            <div class="counter-value">{{ counterStore.count }}</div>
            <div class="counter-label">当前计数</div>
          </div>

          <div class="counter-actions">
            <button class="btn btn-primary" @click="counterStore.increment()">
              +1
            </button>
            <button class="btn btn-primary" @click="counterStore.decrement()">
              -1
            </button>
            <button class="btn btn-success" @click="counterStore.incrementBy(5)">
              +5
            </button>
            <button class="btn btn-warning" @click="counterStore.incrementBy(-5)">
              -5
            </button>
            <button class="btn btn-danger" @click="counterStore.reset()">
              重置
            </button>
            <button
              class="btn btn-secondary"
              :disabled="!counterStore.canUndo"
              @click="counterStore.undo()"
            >
              撤销
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">状态管理</h2>
          <p class="card-description">函数式 Store 的状态管理</p>
        </div>

        <div class="example-content">
          <div class="code-block">
            const store = useCounterStore()

            // 访问状态
            console.log(store.$state.count)

            // 调用动作
            store.increment()

            // 访问计算属性
            console.log(store.doubleCount)
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">类型安全</h2>
          <p class="card-description">完整的 TypeScript 类型支持</p>
        </div>

        <div class="example-content">
          <div class="code-block">
            interface CounterState {
            count: number
            name: string
            }

            const useTypedStore = createFunctionalStore&lt;
            CounterState,
            { increment: () => void },
            { displayName: string }
            &gt;({
            // 完整的类型推导和检查
            })
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.functional-examples {
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
