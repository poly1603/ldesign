import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

/**
 * 组合式计数器 Store - 使用 Pinia setup 语法
 *
 * 展示 Composition API 风格的使用方式
 */
export const useCounterCompositionStore = defineStore('counter-composition', () => {
  // 定义响应式状态
  const count = ref(0)
  const name = ref('Composition Counter')
  const step = ref(1)
  const autoIncrement = ref(false)

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
})
