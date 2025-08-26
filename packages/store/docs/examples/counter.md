# 计数器示例

计数器是学习状态管理的经典示例。本示例展示了如何使用 @ldesign/store 的不同方式来实现一个简单的计数器功能。

## 在线演示

你可以在我们的[统一示例项目](https://github.com/ldesign/store/tree/main/packages/store/examples/unified)中查看完整的可运行代码。

## 类式 Store 实现

使用装饰器语法创建类式计数器 Store：

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

export class CounterStore extends BaseStore {
  // 使用 @State 装饰器定义状态
  @State({ default: 0 })
  count!: number

  @State({ default: 'Counter' })
  name!: string

  // 使用 @Action 装饰器定义动作
  @Action()
  increment() {
    this.count++
  }

  @Action()
  decrement() {
    this.count--
  }

  @Action()
  reset() {
    this.count = 0
  }

  @Action()
  setName(name: string) {
    this.name = name
  }

  // 使用 @Getter 装饰器定义计算属性
  @Getter()
  get isEven(): boolean {
    return this.count % 2 === 0
  }

  @Getter()
  get squared(): number {
    return this.count * this.count
  }

  @Getter()
  get displayName(): string {
    return `${this.name}: ${this.count}`
  }
}
```

### 在 Vue 组件中使用

```vue
<template>
  <div class="counter">
    <h2>{{ counterStore.displayName }}</h2>
    
    <div class="counter-display">
      <div class="counter-value">{{ counterStore.$state.count }}</div>
      <div class="counter-info">
        <p>是否为偶数: {{ counterStore.isEven ? '是' : '否' }}</p>
        <p>平方值: {{ counterStore.squared }}</p>
      </div>
    </div>
    
    <div class="counter-actions">
      <button @click="counterStore.increment()" class="btn btn-primary">
        增加
      </button>
      <button @click="counterStore.decrement()" class="btn btn-secondary">
        减少
      </button>
      <button @click="counterStore.reset()" class="btn btn-danger">
        重置
      </button>
    </div>
    
    <div class="counter-settings">
      <label>
        计数器名称:
        <input 
          v-model="counterName" 
          @input="updateName"
          type="text" 
          class="form-input"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CounterStore } from '@/stores/CounterStore'

// 创建 Store 实例
const counterStore = new CounterStore()

// 本地状态用于输入框
const counterName = ref(counterStore.$state.name)

// 监听输入变化并更新 Store
const updateName = () => {
  counterStore.setName(counterName.value)
}

// 监听 Store 中名称的变化
watch(() => counterStore.$state.name, (newName) => {
  counterName.value = newName
})
</script>

<style scoped>
.counter {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.counter-display {
  margin: 2rem 0;
}

.counter-value {
  font-size: 4rem;
  font-weight: bold;
  color: #3182ce;
  margin-bottom: 1rem;
}

.counter-info {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.counter-info p {
  margin: 0.5rem 0;
}

.counter-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.counter-settings {
  text-align: left;
}

.counter-settings label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5aa0;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}
</style>
```

## 函数式 Store 实现

使用函数式 API 创建计数器 Store：

```typescript
import { createFunctionalStore } from '@ldesign/store'

export const useCounterStore = createFunctionalStore({
  id: 'counter-functional',
  
  // 定义初始状态
  state: () => ({
    count: 0,
    name: 'Counter',
    history: [] as number[]
  }),
  
  // 定义动作方法
  actions: {
    increment() {
      this.history.push(this.count)
      this.count++
    },
    
    decrement() {
      this.history.push(this.count)
      this.count--
    },
    
    reset() {
      this.history.push(this.count)
      this.count = 0
    },
    
    setName(name: string) {
      this.name = name
    },
    
    incrementBy(amount: number) {
      this.history.push(this.count)
      this.count += amount
    },
    
    undo() {
      if (this.history.length > 0) {
        this.count = this.history.pop()!
      }
    }
  },
  
  // 定义计算属性
  getters: {
    isEven: (state) => state.count % 2 === 0,
    squared: (state) => state.count * state.count,
    displayName: (state) => `${state.name}: ${state.count}`,
    canUndo: (state) => state.history.length > 0,
    historyCount: (state) => state.history.length
  }
})
```

### 在 Vue 组件中使用函数式 Store

```vue
<template>
  <div class="counter-functional">
    <h2>{{ store.displayName }}</h2>
    
    <div class="counter-display">
      <div class="counter-value">{{ store.$state.count }}</div>
      <div class="counter-stats">
        <div class="stat">
          <span class="stat-label">是否为偶数:</span>
          <span class="stat-value">{{ store.isEven ? '是' : '否' }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">平方值:</span>
          <span class="stat-value">{{ store.squared }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">历史记录:</span>
          <span class="stat-value">{{ store.historyCount }} 条</span>
        </div>
      </div>
    </div>
    
    <div class="counter-actions">
      <button @click="store.increment()" class="btn btn-primary">
        +1
      </button>
      <button @click="store.decrement()" class="btn btn-primary">
        -1
      </button>
      <button @click="store.incrementBy(5)" class="btn btn-success">
        +5
      </button>
      <button @click="store.incrementBy(-5)" class="btn btn-warning">
        -5
      </button>
      <button @click="store.reset()" class="btn btn-danger">
        重置
      </button>
      <button 
        @click="store.undo()" 
        :disabled="!store.canUndo"
        class="btn btn-secondary"
      >
        撤销
      </button>
    </div>
    
    <div class="history" v-if="store.$state.history.length > 0">
      <h3>历史记录</h3>
      <div class="history-list">
        <span 
          v-for="(value, index) in store.$state.history" 
          :key="index"
          class="history-item"
        >
          {{ value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/functional/CounterStore'

// 使用函数式 Store
const store = useCounterStore()
</script>

<style scoped>
.counter-functional {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.counter-display {
  text-align: center;
  margin: 2rem 0;
}

.counter-value {
  font-size: 4rem;
  font-weight: bold;
  color: #38a169;
  margin-bottom: 1rem;
}

.counter-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-weight: 600;
  color: #2d3748;
}

.counter-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.history {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.history h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.history-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.history-item {
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-success {
  background: #38a169;
  color: white;
}

.btn-warning {
  background: #d69e2e;
  color: white;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}
</style>
```

## 组合式 Store 实现

使用 Composition API 风格创建计数器 Store：

```typescript
import { createCompositionStore } from '@ldesign/store'

export const useCounterCompositionStore = createCompositionStore({
  id: 'counter-composition',
  
  setup: ({ state, computed, watch }) => {
    // 定义响应式状态
    const count = state(0)
    const name = state('Composition Counter')
    const step = state(1)
    const autoIncrement = state(false)
    
    // 定义计算属性
    const isEven = computed(() => count.value % 2 === 0)
    const squared = computed(() => count.value * count.value)
    const displayName = computed(() => `${name.value}: ${count.value}`)
    const isPositive = computed(() => count.value > 0)
    const isNegative = computed(() => count.value < 0)
    
    // 定义动作方法
    const increment = () => {
      count.value += step.value
    }
    
    const decrement = () => {
      count.value -= step.value
    }
    
    const reset = () => {
      count.value = 0
    }
    
    const setName = (newName: string) => {
      name.value = newName
    }
    
    const setStep = (newStep: number) => {
      step.value = Math.max(1, newStep)
    }
    
    const toggleAutoIncrement = () => {
      autoIncrement.value = !autoIncrement.value
    }
    
    // 自动递增逻辑
    let intervalId: number | null = null
    
    watch(autoIncrement, (enabled) => {
      if (enabled) {
        intervalId = window.setInterval(() => {
          count.value++
        }, 1000)
      } else if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    })
    
    // 监听计数变化
    watch(count, (newValue, oldValue) => {
      console.log(`计数从 ${oldValue} 变为 ${newValue}`)
    })
    
    // 返回公开的状态和方法
    return {
      // 状态
      count,
      name,
      step,
      autoIncrement,
      // 计算属性
      isEven,
      squared,
      displayName,
      isPositive,
      isNegative,
      // 方法
      increment,
      decrement,
      reset,
      setName,
      setStep,
      toggleAutoIncrement
    }
  }
})
```

### 在 Vue 组件中使用组合式 Store

```vue
<template>
  <div class="counter-composition">
    <h2>{{ store.$state.displayName.value }}</h2>
    
    <div class="counter-display">
      <div class="counter-value" :class="valueClass">
        {{ store.$state.count.value }}
      </div>
      
      <div class="counter-indicators">
        <span v-if="store.$state.isEven.value" class="indicator even">偶数</span>
        <span v-if="store.$state.isPositive.value" class="indicator positive">正数</span>
        <span v-if="store.$state.isNegative.value" class="indicator negative">负数</span>
      </div>
      
      <div class="counter-info">
        <p>平方值: {{ store.$state.squared.value }}</p>
        <p>步长: {{ store.$state.step.value }}</p>
        <p>自动递增: {{ store.$state.autoIncrement.value ? '开启' : '关闭' }}</p>
      </div>
    </div>
    
    <div class="counter-controls">
      <div class="control-group">
        <label>步长设置:</label>
        <input 
          type="number" 
          :value="store.$state.step.value"
          @input="updateStep"
          min="1"
          class="form-input"
        />
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox"
            :checked="store.$state.autoIncrement.value"
            @change="store.$state.toggleAutoIncrement()"
          />
          自动递增 (每秒 +1)
        </label>
      </div>
    </div>
    
    <div class="counter-actions">
      <button @click="store.$state.increment()" class="btn btn-primary">
        +{{ store.$state.step.value }}
      </button>
      <button @click="store.$state.decrement()" class="btn btn-primary">
        -{{ store.$state.step.value }}
      </button>
      <button @click="store.$state.reset()" class="btn btn-danger">
        重置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCounterCompositionStore } from '@/stores/composition/CounterStore'

// 使用组合式 Store
const store = useCounterCompositionStore()

// 根据计数值动态设置样式类
const valueClass = computed(() => ({
  positive: store.$state.isPositive.value,
  negative: store.$state.isNegative.value,
  zero: store.$state.count.value === 0
}))

// 更新步长
const updateStep = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 1
  store.$state.setStep(value)
}
</script>

<style scoped>
.counter-composition {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.counter-display {
  text-align: center;
  margin: 2rem 0;
}

.counter-value {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.counter-value.positive {
  color: #38a169;
}

.counter-value.negative {
  color: #e53e3e;
}

.counter-value.zero {
  color: #718096;
}

.counter-indicators {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.indicator.even {
  background: #bee3f8;
  color: #2b6cb0;
}

.indicator.positive {
  background: #c6f6d5;
  color: #276749;
}

.indicator.negative {
  background: #fed7d7;
  color: #c53030;
}

.counter-info {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.counter-info p {
  margin: 0.5rem 0;
}

.counter-controls {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.counter-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5aa0;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}
</style>
```

## 总结

这个计数器示例展示了 @ldesign/store 三种不同使用方式的特点：

### 类式 Store
- **优点**: 装饰器语法简洁，面向对象风格，适合大型项目
- **适用场景**: 复杂业务逻辑，需要继承和扩展的场景

### 函数式 Store  
- **优点**: 配置简单，学习成本低，类型推导好
- **适用场景**: 中小型项目，快速原型开发

### 组合式 Store
- **优点**: 最接近 Vue 3 原生体验，灵活性高，可复用性强
- **适用场景**: Vue 3 项目，需要复杂响应式逻辑的场景

选择哪种方式主要取决于你的项目需求、团队偏好和开发经验。所有方式都提供了完整的类型安全和优秀的开发体验。
