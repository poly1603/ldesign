<template>
  <div class="counter-demo">
    <div class="demo-header">
      <h3>🧮 计数器示例</h3>
      <p>体验基础的状态管理功能</p>
    </div>

    <div class="demo-content">
      <!-- 计数器显示 -->
      <div class="counter-display">
        <div class="count-value">{{ store.count }}</div>
        <div class="count-label">当前计数</div>
      </div>

      <!-- 控制按钮 -->
      <div class="counter-controls">
        <button 
          @click="store.decrement" 
          class="btn btn-secondary"
          :disabled="store.count <= 0"
        >
          -1
        </button>
        
        <button 
          @click="store.increment" 
          class="btn btn-primary"
        >
          +1
        </button>
        
        <button 
          @click="store.reset" 
          class="btn btn-outline"
        >
          重置
        </button>
      </div>

      <!-- 步长控制 -->
      <div class="step-control">
        <label for="step">步长:</label>
        <input 
          id="step"
          v-model.number="store.step" 
          type="number" 
          min="1" 
          max="10"
          class="step-input"
        />
        <div class="step-buttons">
          <button 
            @click="store.add(store.step)" 
            class="btn btn-sm btn-primary"
          >
            +{{ store.step }}
          </button>
          <button 
            @click="store.subtract(store.step)" 
            class="btn btn-sm btn-secondary"
            :disabled="store.count < store.step"
          >
            -{{ store.step }}
          </button>
        </div>
      </div>

      <!-- 计算属性展示 -->
      <div class="computed-values">
        <div class="computed-item">
          <span class="label">双倍值:</span>
          <span class="value">{{ store.doubleCount }}</span>
        </div>
        <div class="computed-item">
          <span class="label">是否为正数:</span>
          <span class="value" :class="{ positive: store.isPositive, negative: !store.isPositive }">
            {{ store.isPositive ? '是' : '否' }}
          </span>
        </div>
        <div class="computed-item">
          <span class="label">显示文本:</span>
          <span class="value">{{ store.displayText }}</span>
        </div>
      </div>

      <!-- 操作历史 -->
      <div class="action-history">
        <h4>操作历史</h4>
        <div class="history-list">
          <div 
            v-for="(action, index) in actionHistory" 
            :key="index"
            class="history-item"
          >
            <span class="action-name">{{ action.name }}</span>
            <span class="action-args">{{ formatArgs(action.args) }}</span>
            <span class="action-time">{{ formatTime(action.time) }}</span>
          </div>
        </div>
        <button 
          @click="clearHistory" 
          class="btn btn-sm btn-outline"
          v-if="actionHistory.length > 0"
        >
          清除历史
        </button>
      </div>
    </div>

    <!-- 代码展示 -->
    <div class="code-section">
      <details>
        <summary>查看源代码</summary>
        <div class="code-tabs">
          <button 
            v-for="tab in codeTabs" 
            :key="tab.name"
            @click="activeTab = tab.name"
            :class="{ active: activeTab === tab.name }"
            class="tab-button"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="code-content">
          <pre><code v-html="highlightedCode"></code></pre>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { BaseStore, State, Action, Getter } from '@ldesign/store'

// 计数器 Store 定义
class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 1 })
  step: number = 1

  @Action()
  increment() {
    this.count++
  }

  @Action()
  decrement() {
    this.count--
  }

  @Action()
  add(value: number) {
    this.count += value
  }

  @Action()
  subtract(value: number) {
    this.count -= value
  }

  @Action()
  reset() {
    this.count = 0
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }

  @Getter()
  get isPositive() {
    return this.count > 0
  }

  @Getter()
  get displayText() {
    return `计数器: ${this.count}`
  }
}

// 创建 store 实例
const store = new CounterStore('counter-demo')

// 操作历史
const actionHistory = ref<Array<{ name: string; args: any[]; time: Date }>>([])
const activeTab = ref('store')

// 监听 Action 执行
let unsubscribeAction: (() => void) | null = null

onMounted(() => {
  unsubscribeAction = store.$onAction(({ name, args }) => {
    actionHistory.value.push({
      name,
      args,
      time: new Date()
    })
    
    // 只保留最近 10 条记录
    if (actionHistory.value.length > 10) {
      actionHistory.value.shift()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeAction) {
    unsubscribeAction()
  }
  store.$dispose()
})

const clearHistory = () => {
  actionHistory.value = []
}

const formatArgs = (args: any[]) => {
  if (args.length === 0) return ''
  return `(${args.map(arg => JSON.stringify(arg)).join(', ')})`
}

const formatTime = (time: Date) => {
  return time.toLocaleTimeString()
}

// 代码标签页
const codeTabs = [
  { name: 'store', label: 'Store 定义' },
  { name: 'usage', label: '使用方式' },
  { name: 'template', label: '模板代码' }
]

const codeExamples = {
  store: `import { BaseStore, State, Action, Getter } from '@ldesign/store'

class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 1 })
  step: number = 1

  @Action()
  increment() {
    this.count++
  }

  @Action()
  decrement() {
    this.count--
  }

  @Action()
  add(value: number) {
    this.count += value
  }

  @Action()
  reset() {
    this.count = 0
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }

  @Getter()
  get isPositive() {
    return this.count > 0
  }
}`,

  usage: `// 创建 store 实例
const store = new CounterStore('counter')

// 使用状态
console.log(store.count) // 0

// 调用动作
store.increment()
console.log(store.count) // 1

// 使用计算属性
console.log(store.doubleCount) // 2
console.log(store.isPositive) // true

// 监听状态变化
store.$subscribe((mutation, state) => {
  console.log('状态变化:', mutation, state)
})`,

  template: `<template>
  <div>
    <div class="counter">{{ store.count }}</div>
    <button @click="store.increment">+1</button>
    <button @click="store.decrement">-1</button>
    <button @click="store.reset">重置</button>
    
    <p>双倍值: {{ store.doubleCount }}</p>
    <p>是否为正数: {{ store.isPositive }}</p>
  </div>
</template>

<script setup lang="ts">
import { CounterStore } from '@/stores/counter'

const store = new CounterStore('counter')
</script>`
}

const highlightedCode = computed(() => {
  const code = codeExamples[activeTab.value]
  // 简单的语法高亮（实际项目中可以使用 Prism.js 等库）
  return code
    .replace(/(@\w+)/g, '<span class="decorator">$1</span>')
    .replace(/(class|interface|import|export|from|const|let|var)/g, '<span class="keyword">$1</span>')
    .replace(/(string|number|boolean|void)/g, '<span class="type">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
})
</script>

<style scoped>
.counter-demo {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  background: #fafafa;
}

.demo-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.demo-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.demo-header p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

.demo-content {
  background: white;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.counter-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.count-value {
  font-size: 3rem;
  font-weight: bold;
  color: #3182ce;
  line-height: 1;
}

.count-label {
  font-size: 0.9rem;
  color: #718096;
  margin-top: 0.5rem;
}

.counter-controls {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.step-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.step-input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  text-align: center;
}

.step-buttons {
  display: flex;
  gap: 0.5rem;
}

.computed-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.computed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.computed-item .label {
  font-weight: 500;
  color: #4a5568;
}

.computed-item .value {
  font-weight: bold;
  color: #2d3748;
}

.computed-item .value.positive {
  color: #38a169;
}

.computed-item .value.negative {
  color: #e53e3e;
}

.action-history {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.action-history h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #4a5568;
}

.history-list {
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.action-name {
  font-weight: 500;
  color: #3182ce;
}

.action-args {
  color: #718096;
  font-family: monospace;
}

.action-time {
  color: #a0aec0;
  font-size: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2c5aa0;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a5568;
}

.btn-outline {
  background: transparent;
  color: #3182ce;
  border: 1px solid #3182ce;
}

.btn-outline:hover {
  background: #3182ce;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.code-section {
  margin-top: 1rem;
}

.code-section details {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.code-section summary {
  padding: 0.75rem 1rem;
  background: #f7fafc;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
}

.code-section summary:hover {
  background: #edf2f7;
}

.code-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #718096;
}

.tab-button.active {
  color: #3182ce;
  border-bottom-color: #3182ce;
  background: white;
}

.code-content {
  padding: 1rem;
  background: white;
  overflow-x: auto;
}

.code-content pre {
  margin: 0;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-content :deep(.decorator) {
  color: #d69e2e;
  font-weight: bold;
}

.code-content :deep(.keyword) {
  color: #805ad5;
  font-weight: bold;
}

.code-content :deep(.type) {
  color: #38a169;
}

.code-content :deep(.comment) {
  color: #a0aec0;
  font-style: italic;
}
</style>
