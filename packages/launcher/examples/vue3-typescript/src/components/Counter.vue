<template>
  <div class="counter">
    <h3>独立计数器组件</h3>
    <div class="counter-display">{{ localCount }}</div>
    <div class="counter-buttons">
      <button @click="decrement">-</button>
      <button @click="reset">重置</button>
      <button @click="increment">+</button>
    </div>
    <p class="counter-info">
      这是一个独立的 Vue 3 组件，展示了组合式 API 的使用
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CounterProps {
  initialValue?: number
}

const props = withDefaults(defineProps<CounterProps>(), {
  initialValue: 0
})

const localCount = ref(props.initialValue)

const increment = () => {
  localCount.value++
}

const decrement = () => {
  localCount.value--
}

const reset = () => {
  localCount.value = props.initialValue
}

// 计算属性示例
const isPositive = computed(() => localCount.value > 0)
const isNegative = computed(() => localCount.value < 0)
</script>

<style scoped>
.counter {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.counter h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #fff;
}

.counter-display {
  font-size: 3rem;
  font-weight: bold;
  margin: 1rem 0;
  color: #42b883;
  text-shadow: 0 0 10px rgba(66, 184, 131, 0.5);
}

.counter-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1.5rem 0;
}

.counter-buttons button {
  min-width: 3rem;
  height: 3rem;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
}

.counter-info {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 1rem;
  line-height: 1.4;
}
</style>
