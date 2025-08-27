<script setup lang="ts">
import { reactive } from 'vue'

const profile = reactive({
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  bio: '这是一个示例用户的个人简介。',
})

function saveProfile() {
  // 模拟保存操作
}
</script>

<template>
  <div class="user-profile">
    <h3>📋 个人资料</h3>
    <p>管理您的个人信息和资料设置。</p>

    <div class="profile-form">
      <div class="form-group">
        <label>姓名</label>
        <input v-model="profile.name" type="text">
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="profile.email" type="email">
      </div>
      <div class="form-group">
        <label>电话</label>
        <input v-model="profile.phone" type="tel">
      </div>
      <div class="form-group">
        <label>个人简介</label>
        <textarea v-model="profile.bio" rows="4" />
      </div>
      <button class="save-btn" @click="saveProfile">
        保存更改
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-profile h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.profile-form {
  max-width: 500px;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.save-btn {
  background: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #1d4ed8;
}
</style>
