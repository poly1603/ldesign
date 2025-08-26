import { defineStore } from 'pinia'

/**
 * 函数式计数器 Store - 使用 Pinia 原生语法
 *
 * 展示函数式 API 的使用方式
 */
export const useCounterStore = defineStore('counter-functional', {
  state: () => ({
    count: 0,
    name: 'Functional Counter',
    history: [] as number[]
  }),

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

  getters: {
    isEven: (state) => state.count % 2 === 0,
    squared: (state) => state.count * state.count,
    displayName: (state) => `${state.name}: ${state.count}`,
    canUndo: (state) => state.history.length > 0,
    historyCount: (state) => state.history.length,
    isPositive: (state) => state.count > 0,
    isNegative: (state) => state.count < 0
  }
})
