import { defineStore } from 'pinia'

/**
 * 计数器 Store - 使用 Pinia 原生语法
 *
 * 展示基础的状态管理、动作执行和计算属性功能
 */
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter'
  }),

  actions: {
    increment() {
      this.count++
    },

    decrement() {
      this.count--
    },

    reset() {
      this.count = 0
    },

    setName(name: string) {
      this.name = name
    }
  },

  getters: {
    isEven: (state) => state.count % 2 === 0,
    squared: (state) => state.count * state.count,
    displayName: (state) => `${state.name}: ${state.count}`
  }
})
