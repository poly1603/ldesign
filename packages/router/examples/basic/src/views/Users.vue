<script setup lang="ts">
import { useRouter, useRoute } from '@ldesign/router'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()

// 模拟用户数据
const users = ref([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com' },
  { id: 5, name: 'Edward Norton', email: 'edward@example.com' },
  { id: 6, name: 'Fiona Green', email: 'fiona@example.com' },
])

// 方法
function goToUser(userId: number) {
  router.push({ name: 'User', params: { id: userId.toString() } })
}

function goToRandomUser() {
  const randomUser = users.value[Math.floor(Math.random() * users.value.length)]
  router.push(`/user/${randomUser.id}`)
}

function goToUserWithQuery() {
  router.push({
    name: 'User',
    params: { id: '1' },
    query: { tab: 'profile', edit: 'true' },
  })
}

function addNewUser() {
  const newId = Math.max(...users.value.map(u => u.id)) + 1
  users.value.push({
    id: newId,
    name: `User ${newId}`,
    email: `user${newId}@example.com`,
  })

  // Navigate to the new user
  router.push({ name: 'User', params: { id: newId.toString() } })
}
</script>

<template>
  <div class="users">
    <h2>👥 Users List</h2>
    <p>This page demonstrates route parameters and programmatic navigation.</p>

    <div class="user-list">
      <h3>Available Users:</h3>
      <div class="user-grid">
        <div
          v-for="user in users"
          :key="user.id"
          class="user-card"
          @click="goToUser(user.id)"
        >
          <div class="user-avatar">
            {{ user.name.charAt(0) }}
          </div>
          <div class="user-info">
            <h4>{{ user.name }}</h4>
            <p>{{ user.email }}</p>
            <small>ID: {{ user.id }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <h3>Quick Actions:</h3>
      <div class="button-group">
        <button @click="goToRandomUser">
          Random User
        </button>
        <button @click="goToUserWithQuery">
          User with Query
        </button>
        <button @click="addNewUser">
          Add New User
        </button>
      </div>
    </div>

    <div v-if="Object.keys(route.query).length" class="route-params">
      <h3>Current Query Parameters:</h3>
      <pre>{{ route.query }}</pre>
    </div>
  </div>
</template>

<style scoped>
.users {
  max-width: 1000px;
  margin: 0 auto;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.user-card:hover {
  background: #e9ecef;
  border-color: #007bff;
  transform: translateY(-2px);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 1rem;
}

.user-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.user-info p {
  margin: 0 0 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.user-info small {
  color: #999;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.button-group button {
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.button-group button:hover {
  background: #5a6268;
}

.route-params {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.route-params pre {
  margin: 0;
  white-space: pre-wrap;
}
</style>
