# 待办事项应用

这是一个完整的待办事项应用示例，展示了 @ldesign/store 的核心功能和最佳实践。

## 🎯 功能特性

- ✅ 添加、编辑、删除待办事项
- ✅ 标记完成状态
- ✅ 按状态筛选（全部、进行中、已完成）
- ✅ 批量操作（全选、清除已完成）
- ✅ 数据持久化
- ✅ 撤销/重做功能
- ✅ 优先级设置
- ✅ 分类管理

## 🏪 Store 实现

### Todo Store

```typescript
import { BaseStore, State, Action, Getter, Persist } from '@ldesign/store'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
  updatedAt: number
  priority: 'low' | 'medium' | 'high'
  category?: string
  dueDate?: number
}

export type FilterType = 'all' | 'active' | 'completed'
export type SortType = 'created' | 'updated' | 'priority' | 'dueDate'

export class TodoStore extends BaseStore {
  @State
  @Persist({ key: 'todos' })
  todos: Todo[] = []

  @State
  filter: FilterType = 'all'

  @State
  sortBy: SortType = 'created'

  @State
  sortOrder: 'asc' | 'desc' = 'desc'

  @State
  editingId: string | null = null

  @State
  selectedCategory: string | null = null

  @State
  @Persist({ key: 'todo-history' })
  history: Todo[][] = []

  @State
  historyIndex = -1

  @Getter
  get filteredTodos() {
    let filtered = this.todos

    // 按状态筛选
    switch (this.filter) {
      case 'active':
        filtered = filtered.filter(todo => !todo.completed)
        break
      case 'completed':
        filtered = filtered.filter(todo => todo.completed)
        break
    }

    // 按分类筛选
    if (this.selectedCategory) {
      filtered = filtered.filter(todo => todo.category === this.selectedCategory)
    }

    // 排序
    return this.sortTodos(filtered)
  }

  @Getter
  get activeTodosCount() {
    return this.todos.filter(todo => !todo.completed).length
  }

  @Getter
  get completedTodosCount() {
    return this.todos.filter(todo => todo.completed).length
  }

  @Getter
  get allCompleted() {
    return this.todos.length > 0 && this.todos.every(todo => todo.completed)
  }

  @Getter
  get categories() {
    const categories = new Set<string>()
    this.todos.forEach(todo => {
      if (todo.category) {
        categories.add(todo.category)
      }
    })
    return Array.from(categories).sort()
  }

  @Getter
  get canUndo() {
    return this.historyIndex > 0
  }

  @Getter
  get canRedo() {
    return this.historyIndex < this.history.length - 1
  }

  @Getter
  get todosByPriority() {
    const groups = {
      high: this.todos.filter(t => t.priority === 'high' && !t.completed),
      medium: this.todos.filter(t => t.priority === 'medium' && !t.completed),
      low: this.todos.filter(t => t.priority === 'low' && !t.completed)
    }
    return groups
  }

  @Action
  addTodo(
    text: string, 
    priority: Todo['priority'] = 'medium', 
    category?: string,
    dueDate?: number
  ) {
    if (!text.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority,
      category,
      dueDate
    }

    this.saveToHistory()
    this.todos.push(todo)
  }

  @Action
  updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) {
    const todo = this.todos.find(t => t.id === id)
    if (!todo) return

    this.saveToHistory()
    Object.assign(todo, {
      ...updates,
      updatedAt: Date.now()
    })
  }

  @Action
  toggleTodo(id: string) {
    const todo = this.todos.find(t => t.id === id)
    if (!todo) return

    this.saveToHistory()
    todo.completed = !todo.completed
    todo.updatedAt = Date.now()
  }

  @Action
  deleteTodo(id: string) {
    const index = this.todos.findIndex(t => t.id === id)
    if (index === -1) return

    this.saveToHistory()
    this.todos.splice(index, 1)
  }

  @Action
  toggleAll() {
    const shouldComplete = !this.allCompleted
    
    this.saveToHistory()
    this.todos.forEach(todo => {
      todo.completed = shouldComplete
      todo.updatedAt = Date.now()
    })
  }

  @Action
  clearCompleted() {
    const completedTodos = this.todos.filter(todo => todo.completed)
    if (completedTodos.length === 0) return

    this.saveToHistory()
    this.todos = this.todos.filter(todo => !todo.completed)
  }

  @Action
  setFilter(filter: FilterType) {
    this.filter = filter
  }

  @Action
  setSorting(sortBy: SortType, order: 'asc' | 'desc' = 'desc') {
    this.sortBy = sortBy
    this.sortOrder = order
  }

  @Action
  setSelectedCategory(category: string | null) {
    this.selectedCategory = category
  }

  @Action
  startEditing(id: string) {
    this.editingId = id
  }

  @Action
  stopEditing() {
    this.editingId = null
  }

  @Action
  reorderTodos(fromIndex: number, toIndex: number) {
    this.saveToHistory()
    
    const [movedTodo] = this.todos.splice(fromIndex, 1)
    this.todos.splice(toIndex, 0, movedTodo)
  }

  @Action
  batchUpdateTodos(ids: string[], updates: Partial<Todo>) {
    this.saveToHistory()
    
    ids.forEach(id => {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        Object.assign(todo, {
          ...updates,
          updatedAt: Date.now()
        })
      }
    })
  }

  @Action
  private saveToHistory() {
    // 移除当前位置之后的历史记录
    this.history = this.history.slice(0, this.historyIndex + 1)
    
    // 添加当前状态到历史记录
    this.history.push(JSON.parse(JSON.stringify(this.todos)))
    this.historyIndex = this.history.length - 1

    // 限制历史记录数量
    if (this.history.length > 50) {
      this.history.shift()
      this.historyIndex--
    }
  }

  @Action
  undo() {
    if (!this.canUndo) return

    this.historyIndex--
    this.todos = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
  }

  @Action
  redo() {
    if (!this.canRedo) return

    this.historyIndex++
    this.todos = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
  }

  @Action
  private sortTodos(todos: Todo[]): Todo[] {
    return [...todos].sort((a, b) => {
      let comparison = 0

      switch (this.sortBy) {
        case 'created':
          comparison = a.createdAt - b.createdAt
          break
        case 'updated':
          comparison = a.updatedAt - b.updatedAt
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'dueDate':
          const aDate = a.dueDate || Infinity
          const bDate = b.dueDate || Infinity
          comparison = aDate - bDate
          break
      }

      return this.sortOrder === 'asc' ? comparison : -comparison
    })
  }
}
```

## 🎨 Vue 组件

### 主应用组件

```vue
<template>
  <div class="todo-app">
    <header class="header">
      <h1>待办事项</h1>
      <TodoInput @add="addTodo" />
    </header>

    <nav class="filters" v-if="todos.length">
      <TodoFilters
        :filter="filter"
        :categories="categories"
        :selected-category="selectedCategory"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        @filter-change="setFilter"
        @category-change="setSelectedCategory"
        @sort-change="setSorting"
      />
    </nav>

    <main class="main" v-show="todos.length">
      <div class="bulk-actions">
        <input
          id="toggle-all"
          class="toggle-all"
          type="checkbox"
          :checked="allCompleted"
          @change="toggleAll"
        />
        <label for="toggle-all">全选</label>
        
        <button 
          v-if="completedTodosCount > 0"
          @click="clearCompleted"
          class="clear-completed"
        >
          清除已完成 ({{ completedTodosCount }})
        </button>
      </div>

      <TodoList
        :todos="filteredTodos"
        :editing-id="editingId"
        @toggle="toggleTodo"
        @delete="deleteTodo"
        @update="updateTodo"
        @start-edit="startEditing"
        @stop-edit="stopEditing"
        @reorder="reorderTodos"
      />
    </main>

    <footer class="footer" v-show="todos.length">
      <TodoStats
        :active-count="activeTodosCount"
        :completed-count="completedTodosCount"
        :total-count="todos.length"
      />
      
      <div class="history-controls" v-if="canUndo || canRedo">
        <button @click="undo" :disabled="!canUndo">撤销</button>
        <button @click="redo" :disabled="!canRedo">重做</button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTodoStore } from '@/stores/TodoStore'
import TodoInput from './components/TodoInput.vue'
import TodoList from './components/TodoList.vue'
import TodoFilters from './components/TodoFilters.vue'
import TodoStats from './components/TodoStats.vue'

const todoStore = useTodoStore()

// 计算属性
const todos = computed(() => todoStore.todos)
const filteredTodos = computed(() => todoStore.filteredTodos)
const activeTodosCount = computed(() => todoStore.activeTodosCount)
const completedTodosCount = computed(() => todoStore.completedTodosCount)
const allCompleted = computed(() => todoStore.allCompleted)
const filter = computed(() => todoStore.filter)
const categories = computed(() => todoStore.categories)
const selectedCategory = computed(() => todoStore.selectedCategory)
const sortBy = computed(() => todoStore.sortBy)
const sortOrder = computed(() => todoStore.sortOrder)
const editingId = computed(() => todoStore.editingId)
const canUndo = computed(() => todoStore.canUndo)
const canRedo = computed(() => todoStore.canRedo)

// 方法
const addTodo = (data: {
  text: string
  priority: 'low' | 'medium' | 'high'
  category?: string
  dueDate?: number
}) => {
  todoStore.addTodo(data.text, data.priority, data.category, data.dueDate)
}

const toggleTodo = (id: string) => {
  todoStore.toggleTodo(id)
}

const deleteTodo = (id: string) => {
  todoStore.deleteTodo(id)
}

const updateTodo = (id: string, updates: any) => {
  todoStore.updateTodo(id, updates)
  todoStore.stopEditing()
}

const toggleAll = () => {
  todoStore.toggleAll()
}

const clearCompleted = () => {
  todoStore.clearCompleted()
}

const setFilter = (newFilter: FilterType) => {
  todoStore.setFilter(newFilter)
}

const setSelectedCategory = (category: string | null) => {
  todoStore.setSelectedCategory(category)
}

const setSorting = (sortBy: SortType, order: 'asc' | 'desc') => {
  todoStore.setSorting(sortBy, order)
}

const startEditing = (id: string) => {
  todoStore.startEditing(id)
}

const stopEditing = () => {
  todoStore.stopEditing()
}

const reorderTodos = (fromIndex: number, toIndex: number) => {
  todoStore.reorderTodos(fromIndex, toIndex)
}

const undo = () => {
  todoStore.undo()
}

const redo = () => {
  todoStore.redo()
}
</script>

<style scoped>
.todo-app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.filters {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 10px;
}

.toggle-all {
  margin-right: 10px;
}

.clear-completed {
  margin-left: auto;
  padding: 5px 15px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-completed:hover {
  background: #c82333;
}

.footer {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.history-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.history-controls button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.history-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-controls button:not(:disabled):hover {
  background: #e9ecef;
}
</style>
```

## 🚀 使用方式

### 1. 安装和设置

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

### 2. 在组件中使用

```vue
<script setup>
import { useTodoStore } from '@/stores/TodoStore'

const todoStore = useTodoStore()

// 添加待办事项
const addNewTodo = () => {
  todoStore.addTodo('学习 @ldesign/store', 'high', '学习')
}

// 切换完成状态
const toggleTodo = (id) => {
  todoStore.toggleTodo(id)
}

// 批量操作
const markAllAsCompleted = () => {
  const activeIds = todoStore.todos
    .filter(t => !t.completed)
    .map(t => t.id)
  
  todoStore.batchUpdateTodos(activeIds, { completed: true })
}
</script>
```

## 🧪 测试示例

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestStore } from '@ldesign/store/testing'
import { TodoStore } from '@/stores/TodoStore'

describe('TodoStore', () => {
  let store: TodoStore

  beforeEach(() => {
    store = createTestStore(TodoStore)
  })

  describe('添加待办事项', () => {
    it('应该添加新的待办事项', () => {
      store.addTodo('测试待办事项', 'medium', '工作')
      
      expect(store.todos).toHaveLength(1)
      expect(store.todos[0].text).toBe('测试待办事项')
      expect(store.todos[0].priority).toBe('medium')
      expect(store.todos[0].category).toBe('工作')
      expect(store.todos[0].completed).toBe(false)
    })

    it('应该忽略空白文本', () => {
      store.addTodo('   ')
      expect(store.todos).toHaveLength(0)
    })
  })

  describe('筛选功能', () => {
    beforeEach(() => {
      store.addTodo('待办事项1', 'high')
      store.addTodo('待办事项2', 'medium')
      store.toggleTodo(store.todos[0].id)
    })

    it('应该正确筛选活跃的待办事项', () => {
      store.setFilter('active')
      expect(store.filteredTodos).toHaveLength(1)
      expect(store.filteredTodos[0].text).toBe('待办事项2')
    })

    it('应该正确筛选已完成的待办事项', () => {
      store.setFilter('completed')
      expect(store.filteredTodos).toHaveLength(1)
      expect(store.filteredTodos[0].text).toBe('待办事项1')
    })
  })

  describe('排序功能', () => {
    beforeEach(() => {
      store.addTodo('低优先级', 'low')
      store.addTodo('高优先级', 'high')
      store.addTodo('中优先级', 'medium')
    })

    it('应该按优先级排序', () => {
      store.setSorting('priority', 'desc')
      const sorted = store.filteredTodos
      
      expect(sorted[0].priority).toBe('high')
      expect(sorted[1].priority).toBe('medium')
      expect(sorted[2].priority).toBe('low')
    })
  })

  describe('撤销重做功能', () => {
    it('应该支持撤销操作', () => {
      store.addTodo('待办事项1')
      expect(store.todos).toHaveLength(1)
      
      store.undo()
      expect(store.todos).toHaveLength(0)
    })

    it('应该支持重做操作', () => {
      store.addTodo('待办事项1')
      store.undo()
      
      store.redo()
      expect(store.todos).toHaveLength(1)
      expect(store.todos[0].text).toBe('待办事项1')
    })
  })
})
```

## 🎯 特性说明

### 数据持久化
- 自动保存待办事项到 localStorage
- 支持历史记录的持久化

### 撤销重做
- 支持最多50步的撤销重做
- 自动保存操作历史

### 高级筛选和排序
- 按状态筛选（全部、进行中、已完成）
- 按分类筛选
- 多种排序方式（创建时间、更新时间、优先级、截止日期）

### 批量操作
- 全选/取消全选
- 批量更新待办事项
- 批量清除已完成项目

这个待办事项应用示例展示了 @ldesign/store 在实际项目中的完整应用，包括状态管理、数据持久化、撤销重做等高级功能。
