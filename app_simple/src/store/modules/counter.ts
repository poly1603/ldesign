/**
 * 计数器 Store
 * 简单示例模块
 */

import { defineStore } from '@ldesign/store'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const step = ref(1)
  
  // Getters
  const doubled = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)
  
  // Actions
  function increment() {
    count.value += step.value
  }
  
  function decrement() {
    count.value -= step.value
  }
  
  function reset() {
    count.value = 0
  }
  
  function setStep(newStep: number) {
    if (newStep > 0) {
      step.value = newStep
    }
  }
  
  return {
    // State
    count,
    step,
    
    // Getters
    doubled,
    isEven,
    
    // Actions
    increment,
    decrement,
    reset,
    setStep
  }
})