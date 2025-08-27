<template>
  <div class="user-profile">
    <h1>个人资料</h1>
    <p>查看和编辑您的个人信息。</p>

    <div class="profile-form">
      <div class="avatar-section">
        <div class="avatar">
          <img :src="userStore.user?.avatar || '/default-avatar.png'" :alt="userStore.user?.name">
        </div>
        <button class="btn btn-secondary">
          更换头像
        </button>
      </div>

      <div class="form-section">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="profile.name" type="text">
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <input v-model="profile.email" type="email">
        </div>

        <div class="form-group">
          <label>角色</label>
          <input :value="userStore.user?.roles?.join(', ')" type="text" readonly>
        </div>

        <div class="form-group">
          <label>注册时间</label>
          <input :value="formatDate(userStore.user?.createdAt)" type="text" readonly>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" :disabled="loading" @click="updateProfile">
          {{ loading ? '保存中...' : '保存更改' }}
        </button>
        <button class="btn btn-secondary" @click="resetForm">
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const loading = ref(false)

const profile = reactive({
  name: '',
  email: '',
})

async function updateProfile() {
  loading.value = true
  try {
    await userStore.updateProfile(profile)
  }
  finally {
    loading.value = false
  }
}

function resetForm() {
  if (userStore.user) {
    profile.name = userStore.user.name
    profile.email = userStore.user.email
  }
}

function formatDate(dateString?: string) {
  if (!dateString)
    return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  resetForm()
})
</script>

<style scoped>
.user-profile {
  max-width: 600px;
}

.profile-form {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 0.5rem;
  margin-top: 2rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-section {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
}

.form-group input[readonly] {
  background: #f9fafb;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}
</style>
