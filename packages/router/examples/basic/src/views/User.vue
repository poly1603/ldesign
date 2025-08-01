<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { computed, onMounted, ref, watch } from 'vue'

const router = useRouter()
const route = useRoute()

// Props (route params)
const userId = computed(() => route.value.params.id as string)

// 响应式数据
const activeTab = ref('profile')
const userData = ref({
  name: '',
  email: '',
  joinDate: '',
})

const settings = ref({
  emailNotifications: true,
  theme: 'light',
  language: 'en',
})

const activities = ref([
  { id: 1, icon: '🔐', description: 'Logged in', timestamp: '2 hours ago' },
  { id: 2, icon: '📝', description: 'Updated profile', timestamp: '1 day ago' },
  { id: 3, icon: '📧', description: 'Changed email', timestamp: '3 days ago' },
  { id: 4, icon: '🔑', description: 'Changed password', timestamp: '1 week ago' },
])

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
  { id: 'activity', label: 'Activity' },
]

// 计算属性
const userInitial = computed(() => userData.value.name.charAt(0).toUpperCase())

// 方法
function loadUserData(id: string) {
  // 模拟 API 调用
  const users = {
    1: { name: 'Alice Johnson', email: 'alice@example.com' },
    2: { name: 'Bob Smith', email: 'bob@example.com' },
    3: { name: 'Charlie Brown', email: 'charlie@example.com' },
    123: { name: 'Demo User', email: 'demo@example.com' },
    456: { name: 'Test User', email: 'test@example.com' },
    999: { name: 'Admin User', email: 'admin@example.com' },
  }

  const user = users[id as keyof typeof users] || {
    name: `User ${id}`,
    email: `user${id}@example.com`,
  }

  userData.value = {
    ...user,
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  }
}

function setActiveTab(tabId: string) {
  activeTab.value = tabId

  // 更新 URL 查询参数
  router.replace({
    query: { ...route.value.query, tab: tabId },
  })
}

function goBack() {
  router.push('/users')
}

function saveSettings() {
  alert('Settings saved successfully!')
}

// 生命周期
onMounted(() => {
  loadUserData(userId.value)

  // 从查询参数设置活动标签
  if (route.value.query.tab) {
    activeTab.value = route.value.query.tab as string
  }
})

// 监听路由参数变化
watch(userId, (newId) => {
  loadUserData(newId)
})
</script>

<template>
  <div class="user">
    <div class="user-header">
      <button class="back-button" @click="goBack">
        ← Back to Users
      </button>
      <h2>👤 User Profile</h2>
    </div>

    <div class="user-content">
      <div class="user-card">
        <div class="user-avatar">
          {{ userInitial }}
        </div>
        <div class="user-details">
          <h3>{{ userData.name }}</h3>
          <p class="user-email">
            {{ userData.email }}
          </p>
          <p class="user-id">
            User ID: {{ userId }}
          </p>
        </div>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab" :class="[{ active: activeTab === tab.id }]"
          @click="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'profile'" class="tab-panel">
          <h4>Profile Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Full Name:</label>
              <span>{{ userData.name }}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>{{ userData.email }}</span>
            </div>
            <div class="info-item">
              <label>User ID:</label>
              <span>{{ userId }}</span>
            </div>
            <div class="info-item">
              <label>Join Date:</label>
              <span>{{ userData.joinDate }}</span>
            </div>
            <div class="info-item">
              <label>Status:</label>
              <span class="status active">Active</span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'settings'" class="tab-panel">
          <h4>User Settings</h4>
          <div class="settings-form">
            <div class="form-group">
              <label>Email Notifications:</label>
              <input v-model="settings.emailNotifications" type="checkbox">
            </div>
            <div class="form-group">
              <label>Theme:</label>
              <select v-model="settings.theme">
                <option value="light">
                  Light
                </option>
                <option value="dark">
                  Dark
                </option>
                <option value="auto">
                  Auto
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Language:</label>
              <select v-model="settings.language">
                <option value="en">
                  English
                </option>
                <option value="es">
                  Spanish
                </option>
                <option value="fr">
                  French
                </option>
              </select>
            </div>
            <button class="save-button" @click="saveSettings">
              Save Settings
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'activity'" class="tab-panel">
          <h4>Recent Activity</h4>
          <div class="activity-list">
            <div v-for="activity in activities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                {{ activity.icon }}
              </div>
              <div class="activity-content">
                <p>{{ activity.description }}</p>
                <small>{{ activity.timestamp }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="route-info">
      <h3>Route Information:</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>Route Params:</label>
          <pre>{{ JSON.stringify($route.params, null, 2) }}</pre>
        </div>
        <div v-if="Object.keys($route.query).length" class="info-item">
          <label>Query Params:</label>
          <pre>{{ JSON.stringify($route.query, null, 2) }}</pre>
        </div>
        <div class="info-item">
          <label>Full Path:</label>
          <span>{{ $route.fullPath }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user {
  max-width: 800px;
  margin: 0 auto;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-button {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-button:hover {
  background: #5a6268;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 2rem;
  margin-right: 2rem;
}

.user-details h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.user-email {
  color: #666;
  margin: 0 0 0.25rem 0;
}

.user-id {
  color: #999;
  margin: 0;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 2rem;
}

.tab {
  padding: 1rem 2rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  background: #f8f9fa;
}

.tab.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-panel {
  min-height: 300px;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item label {
  font-weight: bold;
  color: #333;
}

.status.active {
  color: #28a745;
  font-weight: bold;
}

.settings-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.save-button {
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover {
  background: #218838;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.activity-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
}

.activity-content small {
  color: #666;
}

.route-info {
  margin-top: 3rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.route-info pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 0.9rem;
}
</style>
