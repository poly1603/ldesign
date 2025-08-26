<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore } from '@/stores/basic/CounterStore'
import { useTodoStore } from '@/stores/basic/TodoStore'
import { useUserStore } from '@/stores/basic/UserStore'

// 使用 Store
const counterStore = useCounterStore()
const todoStore = useTodoStore()
const userStore = useUserStore()

// 待办事项相关状态
const newTodoText = ref('')

function addTodo() {
  if (newTodoText.value.trim()) {
    todoStore.addTodo(newTodoText.value.trim())
    newTodoText.value = ''
  }
}

function getEmptyMessage() {
  switch (todoStore.filter) {
    case 'active':
      return '没有未完成的待办事项'
    case 'completed':
      return '没有已完成的待办事项'
    default:
      return '暂无待办事项，添加一个开始吧！'
  }
}
</script>

<template>
  <div class="basic-examples">
    <div class="page-header">
      <h1>基础示例</h1>
      <p>展示 @ldesign/store 的基本功能，包括状态管理、动作执行和计算属性</p>
    </div>

    <div class="examples-grid">
      <!-- 计数器示例 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">计数器示例</h2>
          <p class="card-description">基础的状态管理和动作执行</p>
        </div>

        <div class="example-content">
          <div class="counter-display">
            <div class="counter-value">{{ counterStore.count }}</div>
            <div class="counter-label">当前计数</div>
          </div>

          <div class="counter-actions">
            <button class="btn btn-primary" @click="counterStore.increment()">
              增加
            </button>
            <button class="btn btn-secondary" @click="counterStore.decrement()">
              减少
            </button>
            <button class="btn btn-danger" @click="counterStore.reset()">
              重置
            </button>
          </div>

          <div class="counter-info">
            <p><strong>是否为偶数：</strong>{{ counterStore.isEven ? '是' : '否' }}</p>
            <p><strong>计数平方：</strong>{{ counterStore.squared }}</p>
          </div>
        </div>
      </div>

      <!-- 待办事项示例 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">待办事项</h2>
          <p class="card-description">列表管理和状态过滤</p>
        </div>

        <div class="example-content">
          <div class="todo-form">
            <div class="form-group">
              <input
                v-model="newTodoText"
                type="text"
                class="form-input"
                placeholder="输入新的待办事项..."
                @keyup.enter="addTodo"
              >
              <button class="btn btn-primary" :disabled="!newTodoText.trim()" @click="addTodo">
                添加
              </button>
            </div>
          </div>

          <div class="todo-filters">
            <button
              class="btn btn-sm"
              :class="{ 'btn-primary': todoStore.filter === 'all', 'btn-secondary': todoStore.filter !== 'all' }"
              @click="todoStore.setFilter('all')"
            >
              全部 ({{ todoStore.todos.length }})
            </button>
            <button
              class="btn btn-sm"
              :class="{ 'btn-primary': todoStore.filter === 'active', 'btn-secondary': todoStore.filter !== 'active' }"
              @click="todoStore.setFilter('active')"
            >
              未完成 ({{ todoStore.activeTodos.length }})
            </button>
            <button
              class="btn btn-sm"
              :class="{ 'btn-primary': todoStore.filter === 'completed', 'btn-secondary': todoStore.filter !== 'completed' }"
              @click="todoStore.setFilter('completed')"
            >
              已完成 ({{ todoStore.completedTodos.length }})
            </button>
          </div>

          <div class="todo-list">
            <div
              v-for="todo in todoStore.filteredTodos"
              :key="todo.id"
              class="todo-item"
              :class="{ completed: todo.completed }"
            >
              <input
                type="checkbox"
                :checked="todo.completed"
                @change="todoStore.toggleTodo(todo.id)"
              >
              <span class="todo-text">{{ todo.text }}</span>
              <button class="btn btn-danger btn-sm" @click="todoStore.removeTodo(todo.id)">
                删除
              </button>
            </div>

            <div v-if="todoStore.filteredTodos.length === 0" class="empty-state">
              <p>{{ getEmptyMessage() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户管理示例 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">用户管理</h2>
          <p class="card-description">异步操作和状态管理</p>
        </div>

        <div class="example-content">
          <div v-if="userStore.currentUser" class="user-info">
            <h3>当前用户</h3>
            <p><strong>姓名：</strong>{{ userStore.currentUser.name }}</p>
            <p><strong>邮箱：</strong>{{ userStore.currentUser.email }}</p>
            <p><strong>角色：</strong>{{ userStore.currentUser.role }}</p>
          </div>

          <div class="user-actions">
            <button
              class="btn btn-primary"
              :disabled="userStore.loading"
              @click="userStore.fetchUser(1)"
            >
              <span v-if="userStore.loading" class="loading">
                <span class="spinner" />
                加载中...
              </span>
              <span v-else>加载用户 1</span>
            </button>

            <button
              class="btn btn-primary"
              :disabled="userStore.loading"
              @click="userStore.fetchUser(2)"
            >
              <span v-if="userStore.loading" class="loading">
                <span class="spinner" />
                加载中...
              </span>
              <span v-else>加载用户 2</span>
            </button>

            <button
              class="btn btn-secondary"
              :disabled="userStore.loading"
              @click="userStore.clearUser()"
            >
              清除用户
            </button>
          </div>

          <div v-if="userStore.error" class="alert alert-error">
            <strong>错误：</strong>{{ userStore.error }}
          </div>

          <div class="user-stats">
            <div class="metric">
              <div class="metric-value">{{ userStore.totalRequests }}</div>
              <div class="metric-label">总请求数</div>
            </div>
            <div class="metric">
              <div class="metric-value">{{ userStore.lastFetchTime ? new Date(userStore.lastFetchTime).toLocaleTimeString() : '-' }}</div>
              <div class="metric-label">最后更新</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-examples {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.page-header p {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.example-content {
  padding: 1rem 0;
}

/* 计数器样式 */
.counter-display {
  text-align: center;
  margin-bottom: 2rem;
}

.counter-value {
  font-size: 4rem;
  font-weight: bold;
  color: #3182ce;
  margin-bottom: 0.5rem;
}

.counter-label {
  color: #718096;
  font-size: 0.875rem;
}

.counter-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.counter-info {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
}

.counter-info p {
  margin: 0.5rem 0;
}

/* 待办事项样式 */
.todo-form .form-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-form .form-input {
  flex: 1;
}

.todo-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.todo-list {
  max-height: 300px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
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

.todo-text {
  flex: 1;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

/* 用户管理样式 */
.user-info {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.user-info h3 {
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.user-info p {
  margin: 0.5rem 0;
}

.user-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .examples-grid {
    grid-template-columns: 1fr;
  }

  .counter-actions,
  .user-actions {
    flex-direction: column;
  }

  .todo-filters {
    justify-content: center;
  }
}
</style>
