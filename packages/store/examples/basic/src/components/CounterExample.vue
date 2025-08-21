<script setup lang="ts">
import { computed } from 'vue'
import { CounterStore } from '../stores/counter'

const store = new CounterStore('counter')

const countClass = computed(() => ({
  positive: store.isPositive,
  negative: store.isNegative,
  zero: store.count === 0,
}))

const statusText = computed(() => {
  if (store.isPositive)
    return '正数'
  if (store.isNegative)
    return '负数'
  return '零'
})

const statusClass = computed(() => ({
  positive: store.isPositive,
  negative: store.isNegative,
  zero: store.count === 0,
}))

function updateStep(event: Event) {
  const target = event.target as HTMLInputElement
  store.setStep(Number.parseInt(target.value) || 1)
}
</script>

<template>
  <div class="example-card">
    <h2>计数器示例</h2>
    <p>展示基本的状态管理和装饰器使用</p>

    <div class="counter-display">
      <h3>{{ store.displayText }}</h3>
      <div class="count-value" :class="countClass">
        {{ store.count }}
      </div>
    </div>

    <div class="controls">
      <div class="step-control">
        <label>步长:</label>
        <input
          type="number"
          :value="store.step"
          min="1"
          max="10"
          @input="updateStep"
        >
      </div>

      <div class="buttons">
        <button class="btn btn-danger" @click="store.decrement">
          -{{ store.step }}
        </button>
        <button class="btn btn-secondary" @click="store.reset">
          重置
        </button>
        <button class="btn btn-success" @click="store.increment">
          +{{ store.step }}
        </button>
      </div>
    </div>

    <div class="info">
      <div class="info-item">
        <span class="label">绝对值:</span>
        <span class="value">{{ store.absoluteValue }}</span>
      </div>
      <div class="info-item">
        <span class="label">状态:</span>
        <span class="value" :class="statusClass">
          {{ statusText }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.example-card h2 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.example-card p {
  margin: 0 0 1.5rem 0;
  color: #718096;
}

.counter-display {
  text-align: center;
  margin: 2rem 0;
}

.counter-display h3 {
  margin: 0 0 1rem 0;
  color: #4a5568;
}

.count-value {
  font-size: 3rem;
  font-weight: bold;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.count-value.positive {
  color: #38a169;
  background: #f0fff4;
}

.count-value.negative {
  color: #e53e3e;
  background: #fff5f5;
}

.count-value.zero {
  color: #718096;
  background: #f7fafc;
}

.controls {
  margin: 2rem 0;
}

.step-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.step-control label {
  font-weight: 500;
  color: #4a5568;
}

.step-control input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  width: 80px;
}

.buttons {
  display: flex;
  gap: 0.5rem;
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

.btn:hover {
  transform: translateY(-1px);
}

.btn-success {
  background: #38a169;
  color: white;
}

.btn-success:hover {
  background: #2f855a;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
}

.info {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

.value {
  font-weight: bold;
  font-size: 1.125rem;
}

.value.positive {
  color: #38a169;
}

.value.negative {
  color: #e53e3e;
}

.value.zero {
  color: #718096;
}
</style>
