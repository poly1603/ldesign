import { defineStore } from 'pinia'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

export type TodoFilter = 'all' | 'active' | 'completed'

/**
 * 待办事项 Store - 使用 Pinia 原生语法
 *
 * 展示列表管理、状态过滤和复杂计算属性功能
 */
export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[],
    filter: 'all' as TodoFilter
  }),

  actions: {
    addTodo(text: string) {
      const todo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date()
      }
      this.todos.push(todo)
    },

    removeTodo(id: string) {
      const index = this.todos.findIndex(todo => todo.id === id)
      if (index > -1) {
        this.todos.splice(index, 1)
      }
    },

    toggleTodo(id: string) {
      const todo = this.todos.find(todo => todo.id === id)
      if (todo) {
        todo.completed = !todo.completed
      }
    },

    setFilter(filter: TodoFilter) {
      this.filter = filter
    },

    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed)
    }
  },

  getters: {
    activeTodos: (state) => state.todos.filter(todo => !todo.completed),
    completedTodos: (state) => state.todos.filter(todo => todo.completed),
    filteredTodos: (state) => {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(todo => !todo.completed)
        case 'completed':
          return state.todos.filter(todo => todo.completed)
        default:
          return state.todos
      }
    },
    completionRate: (state) => {
      if (state.todos.length === 0) return 0
      const completed = state.todos.filter(todo => todo.completed).length
      return Math.round((completed / state.todos.length) * 100)
    }
  }
})
