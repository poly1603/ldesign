<script setup lang="ts">
import { ref, computed } from 'vue'

// 响应式状态
const count = ref(0)
const history = ref<string[]>([])

// 计算属性
const status = computed(() => {
  if (count.value === 0) return '初始状态'
  if (count.value > 0) return '正数'
  return '负数'
})

// 方法
function increment() {
  count.value++
  history.value.push(`增加到 ${count.value}`)
}

function decrement() {
  if (count.value > 0) {
    count.value--
    history.value.push(`减少到 ${count.value}`)
  }
}

function reset() {
  count.value = 0
  history.value.push('重置为 0')
}
</script>

<template>
  <div class="counter-demo">
    <div class="demo-container">
      <h3>计数器示例</h3>
      <div class="counter-display">
        <span class="count">{{ count }}</span>
      </div>
      <div class="counter-controls">
        <button :disabled="count <= 0" class="btn btn-secondary" @click="decrement">
          -
        </button>
        <button class="btn btn-outline" @click="reset">
          重置
        </button>
        <button class="btn btn-primary" @click="increment">
          +
        </button>
      </div>
      <div class="counter-info">
        <p>当前状态: {{ status }}</p>
        <p>操作历史: {{ history.length }} 次</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.counter-demo {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 20px;
  margin: 16px 0;
  background: var(--vp-c-bg-soft);
}

.demo-container {
  text-align: center;
}

.demo-container h3 {
  margin: 0 0 16px 0;
  color: var(--vp-c-text-1);
}

.counter-display {
  margin: 20px 0;
}

.count {
  font-size: 3rem;
  font-weight: bold;
  color: var(--vp-c-brand-1);
  display: inline-block;
  min-width: 80px;
}

.counter-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.btn {
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 60px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}

.btn-secondary {
  background: var(--vp-c-gray-soft);
  border-color: var(--vp-c-border);
  color: var(--vp-c-text-1);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--vp-c-gray);
}

.btn-outline {
  background: transparent;
  border-color: var(--vp-c-border);
  color: var(--vp-c-text-1);
}

.btn-outline:hover {
  background: var(--vp-c-bg-soft);
}

.counter-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.counter-info p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .counter-controls {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 120px;
  }
}
</style>
