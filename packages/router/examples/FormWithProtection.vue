<template>
  <div class="form-container">
    <h2>User Profile Form</h2>
    
    <!-- 表单状态指示器 -->
    <div class="form-status">
      <span v-if="isDirty" class="status-indicator dirty">Unsaved Changes</span>
      <span v-else class="status-indicator saved">All Saved</span>
      <span v-if="!isValid" class="status-indicator invalid">Form has errors</span>
    </div>
    
    <form @submit.prevent="handleSubmit">
      <!-- 姓名字段 -->
      <div class="form-field">
        <label for="name">Name:</label>
        <input
          id="name"
          v-model="nameField.value.value"
          @blur="nameField.blur"
          :class="{ error: nameField.hasError.value }"
        />
        <span v-if="nameField.hasError.value" class="error-message">
          {{ nameField.error.value[0] }}
        </span>
      </div>
      
      <!-- 邮箱字段 -->
      <div class="form-field">
        <label for="email">Email:</label>
        <input
          id="email"
          type="email"
          v-model="emailField.value.value"
          @blur="emailField.blur"
          :class="{ error: emailField.hasError.value }"
        />
        <span v-if="emailField.hasError.value" class="error-message">
          {{ emailField.error.value[0] }}
        </span>
      </div>
      
      <!-- 年龄字段 -->
      <div class="form-field">
        <label for="age">Age:</label>
        <input
          id="age"
          type="number"
          v-model.number="ageField.value.value"
          @blur="ageField.blur"
          :class="{ error: ageField.hasError.value }"
        />
        <span v-if="ageField.hasError.value" class="error-message">
          {{ ageField.error.value[0] }}
        </span>
      </div>
      
      <!-- 个人简介 -->
      <div class="form-field">
        <label for="bio">Bio:</label>
        <textarea
          id="bio"
          v-model="bioField.value.value"
          @blur="bioField.blur"
          :class="{ error: bioField.hasError.value }"
          rows="4"
        />
        <span v-if="bioField.hasError.value" class="error-message">
          {{ bioField.error.value[0] }}
        </span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="form-actions">
        <button type="button" @click="resetForm" :disabled="!isDirty">
          Reset
        </button>
        <button type="submit" :disabled="!isValid || !isDirty">
          Save
        </button>
      </div>
    </form>
    
    <!-- 自动保存提示 -->
    <div v-if="autoSaveEnabled" class="auto-save-info">
      Auto-save is enabled (every 30 seconds)
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFormRoute, useFormField, validators } from '../src/composables/useFormRoute'

// 初始化表单
const form = useFormRoute({
  formId: 'user-profile',
  autoSave: true,
  autoSaveInterval: 30000,
  persistToStorage: true,
  confirmMessage: 'You have unsaved changes. Do you want to leave?'
})

const {
  isDirty,
  isValid,
  saveForm,
  resetForm,
  validateForm
} = form

// 定义字段验证规则
const nameField = useFormField(form, 'name', [
  validators.required('Name is required'),
  validators.minLength(2, 'Name must be at least 2 characters'),
  validators.maxLength(50, 'Name must not exceed 50 characters')
])

const emailField = useFormField(form, 'email', [
  validators.required('Email is required'),
  validators.email('Please enter a valid email')
])

const ageField = useFormField(form, 'age', [
  validators.required('Age is required'),
  validators.numeric('Age must be a number'),
  validators.min(1, 'Age must be at least 1'),
  validators.max(150, 'Age must not exceed 150')
])

const bioField = useFormField(form, 'bio', [
  validators.maxLength(500, 'Bio must not exceed 500 characters')
])

// 自动保存状态
const autoSaveEnabled = true

// 提交表单
const handleSubmit = async () => {
  // 验证所有字段
  const isFormValid = await validateForm({
    name: validators.compose(
      validators.required('Name is required'),
      validators.minLength(2),
      validators.maxLength(50)
    ),
    email: validators.compose(
      validators.required('Email is required'),
      validators.email()
    ),
    age: validators.compose(
      validators.required('Age is required'),
      validators.numeric(),
      validators.min(1),
      validators.max(150)
    ),
    bio: validators.maxLength(500)
  })
  
  if (isFormValid) {
    const saved = await saveForm()
    if (saved) {
      console.log('Form saved successfully!')
      // 这里可以显示成功消息或跳转
    }
  }
}

// 模拟加载初始数据
onMounted(() => {
  // 如果没有本地存储的数据，设置默认值
  if (!form.form.value?.data.name) {
    form.updateForm({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      bio: 'Software developer with 5 years of experience.'
    })
  }
})
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-status {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-indicator.dirty {
  background-color: #fff3cd;
  color: #856404;
}

.status-indicator.saved {
  background-color: #d4edda;
  color: #155724;
}

.status-indicator.invalid {
  background-color: #f8d7da;
  color: #721c24;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-field input,
.form-field textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-field input.error,
.form-field textarea.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.form-actions button[type="submit"] {
  background-color: #007bff;
  color: white;
}

.form-actions button[type="button"] {
  background-color: #6c757d;
  color: white;
}

.form-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-save-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #e7f3ff;
  border-radius: 4px;
  font-size: 12px;
  color: #004085;
}
</style>