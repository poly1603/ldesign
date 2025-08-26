# Todo 应用示例

这是一个完整的 Todo 应用示例，展示了如何使用 @ldesign/store 管理复杂的应用状态。

## 🎯 功能特性

- ✅ 添加、编辑、删除待办事项
- ✅ 标记完成状态
- ✅ 按状态筛选（全部、进行中、已完成）
- ✅ 批量操作（全选、清除已完成）
- ✅ 数据持久化
- ✅ 撤销/重做功能

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
}

export type FilterType = 'all' | 'active' | 'completed'

export class TodoStore extends BaseStore {
  @State
  @Persist({ key: 'todos' })
  todos: Todo[] = []

  @State
  filter: FilterType = 'all'

  @State
  editingId: string | null = null

  @State
  @Persist({ key: 'todo-history' })
  history: Todo[][] = []

  @State
  historyIndex = -1

  @Getter
  get filteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed)
      case 'completed':
        return this.todos.filter(todo => todo.completed)
      default:
        return this.todos
    }
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
  get canUndo() {
    return this.historyIndex > 0
  }

  @Getter
  get canRedo() {
    return this.historyIndex < this.history.length - 1
  }

  @Action
  addTodo(text: string, priority: Todo['priority'] = 'medium', category?: string) {
    if (!text.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority,
      category
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
  startEditing(id: string) {
    this.editingId = id
  }

  @Action
  stopEditing() {
    this.editingId = null
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
  reorderTodos(fromIndex: number, toIndex: number) {
    this.saveToHistory()
    
    const [movedTodo] = this.todos.splice(fromIndex, 1)
    this.todos.splice(toIndex, 0, movedTodo)
  }
}
```

## 🎨 Vue 组件

### 主应用组件

```vue
<template>
  <div class="todo-app">
    <header class="header">
      <h1>Todos</h1>
      <TodoInput @add="addTodo" />
    </header>

    <main class="main" v-show="todos.length">
      <div class="toggle-all-container">
        <input
          id="toggle-all"
          class="toggle-all"
          type="checkbox"
          :checked="allCompleted"
          @change="toggleAll"
        />
        <label for="toggle-all">全选</label>
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
      <TodoFooter
        :active-count="activeTodosCount"
        :completed-count="completedTodosCount"
        :filter="filter"
        @filter-change="setFilter"
        @clear-completed="clearCompleted"
      />
    </footer>

    <div class="history-controls" v-if="canUndo || canRedo">
      <button @click="undo" :disabled="!canUndo">撤销</button>
      <button @click="redo" :disabled="!canRedo">重做</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTodoStore } from '@/stores/TodoStore'
import TodoInput from './components/TodoInput.vue'
import TodoList from './components/TodoList.vue'
import TodoFooter from './components/TodoFooter.vue'

const todoStore = useTodoStore()

// 计算属性
const todos = computed(() => todoStore.todos)
const filteredTodos = computed(() => todoStore.filteredTodos)
const activeTodosCount = computed(() => todoStore.activeTodosCount)
const completedTodosCount = computed(() => todoStore.completedTodosCount)
const allCompleted = computed(() => todoStore.allCompleted)
const filter = computed(() => todoStore.filter)
const editingId = computed(() => todoStore.editingId)
const canUndo = computed(() => todoStore.canUndo)
const canRedo = computed(() => todoStore.canRedo)

// 方法
const addTodo = (text: string) => {
  todoStore.addTodo(text)
}

const toggleTodo = (id: string) => {
  todoStore.toggleTodo(id)
}

const deleteTodo = (id: string) => {
  todoStore.deleteTodo(id)
}

const updateTodo = (id: string, text: string) => {
  todoStore.updateTodo(id, { text })
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

const startEditing = (id: string) => {
  todoStore.startEditing(id)
}

const stopEditing = () => {
  todoStore.stopEditing()
}

const undo = () => {
  todoStore.undo()
}

const redo = () => {
  todoStore.redo()
}

const reorderTodos = (fromIndex: number, toIndex: number) => {
  todoStore.reorderTodos(fromIndex, toIndex)
}
</script>

<style scoped>
.todo-app {
  max-width: 550px;
  margin: 0 auto;
  padding: 20px;
}

.header h1 {
  font-size: 3rem;
  font-weight: 100;
  text-align: center;
  color: #b83f45;
  margin-bottom: 20px;
}

.toggle-all-container {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #ededed;
}

.toggle-all {
  margin-right: 10px;
}

.history-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.history-controls button {
  padding: 5px 15px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 3px;
}

.history-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-controls button:not(:disabled):hover {
  background: #f5f5f5;
}
</style>
```

### Todo 输入组件

```vue
<template>
  <div class="todo-input-container">
    <input
      ref="inputRef"
      v-model="newTodo"
      class="new-todo"
      placeholder="添加新的待办事项..."
      @keyup.enter="handleAdd"
      @keyup.esc="clear"
    />
    
    <div class="input-options" v-if="newTodo.trim()">
      <select v-model="priority" class="priority-select">
        <option value="low">低优先级</option>
        <option value="medium">中优先级</option>
        <option value="high">高优先级</option>
      </select>
      
      <input
        v-model="category"
        class="category-input"
        placeholder="分类（可选）"
      />
      
      <button @click="handleAdd" class="add-btn">添加</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const emit = defineEmits<{
  add: [text: string, priority: 'low' | 'medium' | 'high', category?: string]
}>()

const inputRef = ref<HTMLInputElement>()
const newTodo = ref('')
const priority = ref<'low' | 'medium' | 'high'>('medium')
const category = ref('')

const handleAdd = async () => {
  const text = newTodo.value.trim()
  if (!text) return

  emit('add', text, priority.value, category.value || undefined)
  
  // 清空输入
  clear()
  
  // 重新聚焦
  await nextTick()
  inputRef.value?.focus()
}

const clear = () => {
  newTodo.value = ''
  category.value = ''
  priority.value = 'medium'
}
</script>

<style scoped>
.todo-input-container {
  margin-bottom: 20px;
}

.new-todo {
  width: 100%;
  padding: 16px;
  font-size: 1.2rem;
  border: none;
  outline: none;
  box-shadow: inset 0 -2px 1px rgba(0,0,0,0.03);
}

.input-options {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-top: 1px solid #ededed;
}

.priority-select,
.category-input {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.category-input {
  flex: 1;
}

.add-btn {
  padding: 5px 15px;
  background: #5dc2af;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.add-btn:hover {
  background: #48b2a0;
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
      store.addTodo('测试待办事项')
      
      expect(store.todos).toHaveLength(1)
      expect(store.todos[0].text).toBe('测试待办事项')
      expect(store.todos[0].completed).toBe(false)
    })

    it('应该忽略空白文本', () => {
      store.addTodo('   ')
      
      expect(store.todos).toHaveLength(0)
    })
  })

  describe('切换完成状态', () => {
    it('应该切换待办事项的完成状态', () => {
      store.addTodo('测试待办事项')
      const todoId = store.todos[0].id
      
      store.toggleTodo(todoId)
      expect(store.todos[0].completed).toBe(true)
      
      store.toggleTodo(todoId)
      expect(store.todos[0].completed).toBe(false)
    })
  })

  describe('筛选功能', () => {
    beforeEach(() => {
      store.addTodo('待办事项1')
      store.addTodo('待办事项2')
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

### 优先级和分类
- 支持设置待办事项的优先级
- 支持可选的分类标签

### 批量操作
- 全选/取消全选
- 批量清除已完成项目

这个 Todo 应用示例展示了 @ldesign/store 在实际项目中的完整应用，包括状态管理、数据持久化、撤销重做等高级功能。
