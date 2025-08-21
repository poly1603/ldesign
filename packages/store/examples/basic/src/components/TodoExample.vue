<script setup lang="ts">
import { ref } from 'vue'
import { TodoStore } from '../stores/todo'

const store = new TodoStore('todo')
const newTodoText = ref('')

const filters = [
  { value: 'all' as const, label: '全部' },
  { value: 'active' as const, label: '活跃' },
  { value: 'completed' as const, label: '已完成' },
]

function addTodo() {
  if (newTodoText.value.trim()) {
    store.addTodo(newTodoText.value)
    newTodoText.value = ''
  }
}

function getFilterCount(filter: 'all' | 'active' | 'completed') {
  switch (filter) {
    case 'all':
      return store.totalCount
    case 'active':
      return store.activeCount
    case 'completed':
      return store.completedCount
  }
}
</script>

<template>
  <div class="example-card">
    <h2>待办事项示例</h2>
    <p>展示列表管理和过滤功能</p>

    <div class="todo-input">
      <input
        v-model="newTodoText"
        placeholder="添加新的待办事项..."
        class="input"
        @keyup.enter="addTodo"
      >
      <button class="btn btn-primary" @click="addTodo">
        添加
      </button>
    </div>

    <div class="filters">
      <button
        v-for="filterOption in filters"
        :key="filterOption.value"
        class="filter-btn"
        :class="[{ active: store.filter === filterOption.value }]"
        @click="store.setFilter(filterOption.value)"
      >
        {{ filterOption.label }}
        <span class="count">({{ getFilterCount(filterOption.value) }})</span>
      </button>
    </div>

    <div class="todo-list">
      <div
        v-for="todo in store.filteredTodos"
        :key="todo.id"
        class="todo-item"
        :class="[{ completed: todo.completed }]"
      >
        <input
          type="checkbox"
          :checked="todo.completed"
          class="checkbox"
          @change="store.toggleTodo(todo.id)"
        >
        <span class="todo-text">{{ todo.text }}</span>
        <button class="remove-btn" @click="store.removeTodo(todo.id)">
          ×
        </button>
      </div>

      <div v-if="store.filteredTodos.length === 0" class="empty-state">
        <p v-if="store.totalCount === 0">
          还没有待办事项
        </p>
        <p v-else>
          没有符合条件的待办事项
        </p>
      </div>
    </div>

    <div v-if="store.totalCount > 0" class="todo-footer">
      <div class="stats">
        <span>总计: {{ store.totalCount }}</span>
        <span>活跃: {{ store.activeCount }}</span>
        <span>已完成: {{ store.completedCount }}</span>
      </div>
      <button
        v-if="store.hasCompleted"
        class="btn btn-secondary"
        @click="store.clearCompleted"
      >
        清除已完成
      </button>
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

.todo-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5282;
}

.btn-secondary {
  background: #718096;
  color: white;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.btn-secondary:hover {
  background: #4a5568;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn:hover {
  background: #f7fafc;
}

.filter-btn.active {
  background: #3182ce;
  color: white;
  border-color: #3182ce;
}

.count {
  font-size: 0.875rem;
  opacity: 0.8;
}

.todo-list {
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.todo-item:last-child {
  border-bottom: none;
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

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 1rem;
}

.remove-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #fed7d7;
  color: #e53e3e;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #feb2b2;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #718096;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #718096;
}
</style>
