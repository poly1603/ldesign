<script setup lang="ts">
import {
  Action,
  BaseStore,
  Getter,
  PersistentState,
  State,
} from '@ldesign/store'
import { computed, onUnmounted, ref } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

type FilterType = 'all' | 'active' | 'completed'

// 待办事项 Store 定义
class TodoStore extends BaseStore {
  @PersistentState({ default: [] })
  todos: Todo[] = []

  @State({ default: 'all' })
  filter: FilterType = 'all'

  @Action()
  addTodo(text: string, priority: Todo['priority'] = 'medium') {
    if (text.trim()) {
      this.todos.push({
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
        priority,
      })
    }
  }

  @Action()
  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  @Action()
  removeTodo(id: number) {
    const index = this.todos.findIndex(t => t.id === id)
    if (index > -1) {
      this.todos.splice(index, 1)
    }
  }

  @Action()
  updateTodo(id: number, updates: Partial<Todo>) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      Object.assign(todo, updates)
    }
  }

  @Action()
  setFilter(filter: FilterType) {
    this.filter = filter
  }

  @Action()
  clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed)
  }

  @Action()
  markAllCompleted() {
    const hasIncomplete = this.todos.some(todo => !todo.completed)
    this.todos.forEach((todo) => {
      todo.completed = hasIncomplete
    })
  }

  @Action()
  clearAll() {
    this.todos = []
  }

  @Getter()
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

  @Getter()
  get totalCount() {
    return this.todos.length
  }

  @Getter()
  get activeCount() {
    return this.todos.filter(todo => !todo.completed).length
  }

  @Getter()
  get completedCount() {
    return this.todos.filter(todo => todo.completed).length
  }

  @Getter()
  get completionRate() {
    if (this.totalCount === 0)
      return 0
    return Math.round((this.completedCount / this.totalCount) * 100)
  }
}

// 创建 store 实例
const store = new TodoStore('todo-demo')

// 组件状态
const newTodoText = ref('')
const selectedPriority = ref<Todo['priority']>('medium')
const editingTodo = ref<Todo | null>(null)
const editText = ref('')
const editPriority = ref<Todo['priority']>('medium')
const activeTab = ref('store')

// 过滤器配置
const filters = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '待完成' },
  { value: 'completed', label: '已完成' },
]

// 方法
function addTodo() {
  if (newTodoText.value.trim()) {
    store.addTodo(newTodoText.value, selectedPriority.value)
    newTodoText.value = ''
  }
}

function editTodo(todo: Todo) {
  editingTodo.value = todo
  editText.value = todo.text
  editPriority.value = todo.priority
}

function saveEdit() {
  if (editingTodo.value && editText.value.trim()) {
    store.updateTodo(editingTodo.value.id, {
      text: editText.value.trim(),
      priority: editPriority.value,
    })
    cancelEdit()
  }
}

function cancelEdit() {
  editingTodo.value = null
  editText.value = ''
  editPriority.value = 'medium'
}

function clearAllTodos() {
  if (confirm('确定要清空所有任务吗？')) {
    store.clearAll()
  }
}

function getFilterCount(filter: FilterType) {
  switch (filter) {
    case 'active':
      return store.activeCount
    case 'completed':
      return store.completedCount
    default:
      return store.totalCount
  }
}

function getFilterLabel(filter: FilterType) {
  const filterMap = { all: '全部', active: '待完成', completed: '已完成' }
  return filterMap[filter]
}

function getPriorityText(priority: Todo['priority']) {
  const map = { low: '低', medium: '中', high: '高' }
  return map[priority]
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// 代码标签页
const codeTabs = [
  { name: 'store', label: 'Store 定义' },
  { name: 'usage', label: '使用方式' },
  { name: 'features', label: '功能特性' },
]

const codeExamples = {
  store: `import { BaseStore, PersistentState, State, Action, Getter } from '@ldesign/store'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

class TodoStore extends BaseStore {
  // 持久化状态 - 自动保存到 localStorage
  @PersistentState({ default: [] })
  todos: Todo[] = []

  @State({ default: 'all' })
  filter: 'all' | 'active' | 'completed' = 'all'

  @Action()
  addTodo(text: string, priority: Todo['priority'] = 'medium') {
    this.todos.push({
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
      priority
    })
  }

  @Action()
  toggleTodo(id: number) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  @Getter()
  get filteredTodos() {
    switch (this.filter) {
      case 'active': return this.todos.filter(t => !t.completed)
      case 'completed': return this.todos.filter(t => t.completed)
      default: return this.todos
    }
  }

  @Getter()
  get completionRate() {
    if (this.todos.length === 0) return 0
    const completed = this.todos.filter(t => t.completed).length
    return Math.round((completed / this.todos.length) * 100)
  }
}`,

  usage: `// 创建 store 实例
const todoStore = new TodoStore('todos')

// 添加任务
todoStore.addTodo('学习 Vue 3', 'high')
todoStore.addTodo('完成项目', 'medium')

// 切换完成状态
todoStore.toggleTodo(1)

// 设置过滤器
todoStore.setFilter('active')

// 获取过滤后的任务
console.log(todoStore.filteredTodos)

// 获取统计信息
console.log(todoStore.completionRate) // 完成率
console.log(todoStore.activeCount)    // 待完成数量`,

  features: `// 主要功能特性

1. 持久化存储
   - 使用 @PersistentState 自动保存到 localStorage
   - 页面刷新后数据不丢失

2. 响应式计算属性
   - 自动计算过滤结果
   - 实时统计完成率

3. 类型安全
   - 完整的 TypeScript 类型定义
   - 编译时类型检查

4. 状态管理
   - 集中管理所有状态
   - 可预测的状态变更

5. 开发工具支持
   - 支持 Vue DevTools
   - 状态变更追踪`,
}

const highlightedCode = computed(() => {
  const code = codeExamples[activeTab.value]
  return code
    .replace(/(@\w+)/g, '<span class="decorator">$1</span>')
    .replace(
      /(class|interface|import|export|from|const|let|var)/g,
      '<span class="keyword">$1</span>',
    )
    .replace(/(string|number|boolean|void)/g, '<span class="type">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
})

onUnmounted(() => {
  store.$dispose()
})
</script>

<template>
  <div class="todo-demo">
    <div class="demo-header">
      <h3>📝 待办事项示例</h3>
      <p>体验持久化状态管理和复杂业务逻辑</p>
    </div>

    <div class="demo-content">
      <!-- 统计信息 -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ store.totalCount }}</span>
          <span class="stat-label">总计</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ store.activeCount }}</span>
          <span class="stat-label">待完成</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ store.completedCount }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ store.completionRate }}%</span>
          <span class="stat-label">完成率</span>
        </div>
      </div>

      <!-- 添加新任务 -->
      <div class="add-todo">
        <div class="input-group">
          <input
            v-model="newTodoText"
            placeholder="添加新的待办事项..."
            class="todo-input"
            @keyup.enter="addTodo"
          >
          <select v-model="selectedPriority" class="priority-select">
            <option value="low">
              低优先级
            </option>
            <option value="medium">
              中优先级
            </option>
            <option value="high">
              高优先级
            </option>
          </select>
          <button class="btn btn-primary" @click="addTodo">
            添加
          </button>
        </div>
      </div>

      <!-- 过滤器 -->
      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="{ active: store.filter === filter.value }"
          class="filter-btn"
          @click="store.setFilter(filter.value)"
        >
          {{ filter.label }}
          <span class="filter-count">({{ getFilterCount(filter.value) }})</span>
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="todo-list">
        <div
          v-for="todo in store.filteredTodos"
          :key="todo.id"
          :class="{
            completed: todo.completed,
            [`priority-${todo.priority}`]: true,
          }"
          class="todo-item"
        >
          <div class="todo-content">
            <input
              type="checkbox"
              :checked="todo.completed"
              class="todo-checkbox"
              @change="store.toggleTodo(todo.id)"
            >
            <span class="todo-text">{{ todo.text }}</span>
            <span class="todo-priority">{{
              getPriorityText(todo.priority)
            }}</span>
            <span class="todo-date">{{ formatDate(todo.createdAt) }}</span>
          </div>
          <div class="todo-actions">
            <button
              class="btn btn-sm btn-outline"
              title="编辑"
              @click="editTodo(todo)"
            >
              ✏️
            </button>
            <button
              class="btn btn-sm btn-danger"
              title="删除"
              @click="store.removeTodo(todo.id)"
            >
              🗑️
            </button>
          </div>
        </div>

        <div v-if="store.filteredTodos.length === 0" class="empty-state">
          <div class="empty-icon">
            📝
          </div>
          <div class="empty-text">
            {{
              store.filter === 'all'
                ? '还没有任务，添加一个吧！'
                : `没有${getFilterLabel(store.filter)}的任务`
            }}
          </div>
        </div>
      </div>

      <!-- 批量操作 -->
      <div v-if="store.totalCount > 0" class="bulk-actions">
        <button class="btn btn-outline" @click="store.markAllCompleted">
          {{ store.activeCount > 0 ? '全部完成' : '全部未完成' }}
        </button>
        <button
          v-if="store.completedCount > 0"
          class="btn btn-outline"
          @click="store.clearCompleted"
        >
          清除已完成 ({{ store.completedCount }})
        </button>
        <button class="btn btn-danger" @click="clearAllTodos">
          清空所有
        </button>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <div v-if="editingTodo" class="modal-overlay" @click="cancelEdit">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h4>编辑任务</h4>
          <button class="close-btn" @click="cancelEdit">
            ×
          </button>
        </div>
        <div class="modal-body">
          <input
            v-model="editText"
            class="edit-input"
            placeholder="任务内容"
            @keyup.enter="saveEdit"
          >
          <select v-model="editPriority" class="edit-select">
            <option value="low">
              低优先级
            </option>
            <option value="medium">
              中优先级
            </option>
            <option value="high">
              高优先级
            </option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="cancelEdit">
            取消
          </button>
          <button class="btn btn-primary" @click="saveEdit">
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 代码展示 -->
    <div class="code-section">
      <details>
        <summary>查看源代码</summary>
        <div class="code-tabs">
          <button
            v-for="tab in codeTabs"
            :key="tab.name"
            :class="{ active: activeTab === tab.name }"
            class="tab-button"
            @click="activeTab = tab.name"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="code-content">
          <pre><code v-html="highlightedCode" /></pre>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.todo-demo {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  background: #fafafa;
}

.demo-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.demo-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.demo-header p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

.demo-content {
  background: white;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #3182ce;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
}

.add-todo {
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.todo-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.priority-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #3182ce;
  color: white;
  border-color: #3182ce;
}

.filter-count {
  font-size: 0.875rem;
  opacity: 0.8;
}

.todo-list {
  min-height: 200px;
  margin-bottom: 1.5rem;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.todo-item:hover {
  background: #f7fafc;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.todo-checkbox {
  width: 16px;
  height: 16px;
}

.todo-text {
  flex: 1;
  font-weight: 500;
}

.todo-priority {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.priority-high .todo-priority {
  background: #fed7d7;
  color: #c53030;
}

.priority-medium .todo-priority {
  background: #feebc8;
  color: #dd6b20;
}

.priority-low .todo-priority {
  background: #c6f6d5;
  color: #38a169;
}

.todo-date {
  font-size: 0.75rem;
  color: #a0aec0;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #a0aec0;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.1rem;
}

.bulk-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h4 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #a0aec0;
}

.modal-body {
  padding: 1.5rem;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.edit-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5aa0;
}

.btn-outline {
  background: transparent;
  color: #3182ce;
  border: 1px solid #3182ce;
}

.btn-outline:hover {
  background: #3182ce;
  color: white;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.code-section {
  margin-top: 1rem;
}

.code-section details {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.code-section summary {
  padding: 0.75rem 1rem;
  background: #f7fafc;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
}

.code-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #718096;
}

.tab-button.active {
  color: #3182ce;
  border-bottom-color: #3182ce;
  background: white;
}

.code-content {
  padding: 1rem;
  background: white;
  overflow-x: auto;
}

.code-content pre {
  margin: 0;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-content :deep(.decorator) {
  color: #d69e2e;
  font-weight: bold;
}

.code-content :deep(.keyword) {
  color: #805ad5;
  font-weight: bold;
}

.code-content :deep(.type) {
  color: #38a169;
}

.code-content :deep(.comment) {
  color: #a0aec0;
  font-style: italic;
}
</style>
