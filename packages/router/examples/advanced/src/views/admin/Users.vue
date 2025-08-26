<script setup lang="ts">
import { ref } from 'vue'

const users = ref([
  { id: '1', name: '管理员', email: 'admin@example.com', roles: ['admin'], active: true },
  { id: '2', name: '普通用户', email: 'user@example.com', roles: ['user'], active: true },
  { id: '3', name: '测试用户', email: 'test@example.com', roles: ['user'], active: false },
])
</script>

<template>
  <div class="admin-users">
    <h1>用户管理</h1>
    <p>管理系统中的所有用户。</p>

    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.roles?.join(', ') }}</td>
            <td>
              <span class="status" :class="[user.active ? 'active' : 'inactive']">
                {{ user.active ? '活跃' : '禁用' }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm">
                编辑
              </button>
              <button class="btn btn-sm btn-danger">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-users {
  padding: 1rem;
}

.user-table {
  margin-top: 2rem;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.active {
  background: #d1fae5;
  color: #065f46;
}

.status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-sm {
  background: #3b82f6;
  color: white;
}

.btn-danger {
  background: #ef4444;
}
</style>
