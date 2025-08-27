<!--
基础表单示例
-->

<template>
  <div class="example-container">
    <div class="example-header">
      <h2>基础表单示例</h2>
      <p>展示 LemonForm 的基本用法，包括各种字段类型和基础验证</p>
    </div>

    <div class="example-content">
      <div class="form-section">
        <h3>用户注册表单</h3>
        <DynamicForm
          v-model="formData"
          :config="formConfig"
          :debug="showDebug"
          @submit="handleSubmit"
          @reset="handleReset"
          @field-change="handleFieldChange"
          @validation="handleValidation"
        />
      </div>

      <div class="controls-section">
        <h3>控制面板</h3>
        <div class="controls">
          <button @click="toggleDebug">
            {{ showDebug ? '隐藏' : '显示' }}调试面板
          </button>
          <button @click="fillSampleData">填充示例数据</button>
          <button @click="clearData">清空数据</button>
          <button @click="validateForm">手动验证</button>
        </div>
      </div>

      <div class="output-section">
        <h3>表单数据</h3>
        <pre class="data-display">{{ JSON.stringify(formData, null, 2) }}</pre>
        
        <h3>表单状态</h3>
        <div class="status-grid">
          <div class="status-item">
            <span class="label">是否有效:</span>
            <span :class="['value', formState.isValid ? 'success' : 'error']">
              {{ formState.isValid ? '是' : '否' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">是否脏数据:</span>
            <span :class="['value', formState.isDirty ? 'warning' : 'normal']">
              {{ formState.isDirty ? '是' : '否' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">提交中:</span>
            <span :class="['value', formState.isSubmitting ? 'info' : 'normal']">
              {{ formState.isSubmitting ? '是' : '否' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DynamicForm, useForm } from '@lemonform/form'
import type { FormConfig } from '@lemonform/form'

// 表单数据
const formData = ref({})

// 调试开关
const showDebug = ref(false)

// 表单状态
const formState = reactive({
  isValid: true,
  isDirty: false,
  isSubmitting: false,
  hasErrors: false
})

// 表单配置
const formConfig: FormConfig = {
  fields: [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      component: 'input',
      required: true,
      placeholder: '请输入用户名',
      help: '用户名将用于登录系统',
      rules: [
        { type: 'required', message: '用户名不能为空' },
        { type: 'minLength', value: 3, message: '用户名至少3个字符' },
        { type: 'maxLength', value: 20, message: '用户名最多20个字符' }
      ]
    },
    {
      type: 'input',
      name: 'email',
      label: '邮箱地址',
      component: 'input',
      required: true,
      placeholder: '请输入邮箱地址',
      rules: [
        { type: 'required', message: '邮箱地址不能为空' },
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    },
    {
      type: 'input',
      name: 'password',
      label: '密码',
      component: 'input',
      required: true,
      placeholder: '请输入密码',
      props: {
        type: 'password'
      },
      rules: [
        { type: 'required', message: '密码不能为空' },
        { type: 'minLength', value: 6, message: '密码至少6个字符' }
      ]
    },
    {
      type: 'select',
      name: 'gender',
      label: '性别',
      component: 'select',
      placeholder: '请选择性别',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
          { label: '其他', value: 'other' }
        ]
      }
    },
    {
      type: 'radio',
      name: 'role',
      label: '用户角色',
      component: 'radio',
      defaultValue: 'user',
      props: {
        options: [
          { label: '普通用户', value: 'user' },
          { label: '管理员', value: 'admin' },
          { label: '访客', value: 'guest' }
        ]
      }
    },
    {
      type: 'checkbox',
      name: 'interests',
      label: '兴趣爱好',
      component: 'checkbox',
      props: {
        options: [
          { label: '编程', value: 'programming' },
          { label: '音乐', value: 'music' },
          { label: '运动', value: 'sports' },
          { label: '阅读', value: 'reading' }
        ]
      }
    },
    {
      type: 'switch',
      name: 'newsletter',
      label: '订阅邮件',
      component: 'switch',
      help: '是否接收产品更新和优惠信息',
      defaultValue: true
    },
    {
      type: 'textarea',
      name: 'bio',
      label: '个人简介',
      component: 'textarea',
      placeholder: '请简单介绍一下自己...',
      props: {
        rows: 4,
        maxlength: 500
      }
    },
    {
      type: 'actions',
      buttons: [
        { type: 'submit', text: '注册', variant: 'primary' },
        { type: 'reset', text: '重置', variant: 'secondary' }
      ]
    }
  ],
  layout: {
    type: 'grid',
    columns: 2,
    gap: 16,
    responsive: {
      enabled: true,
      breakpoints: {
        xs: { value: 0, name: 'xs', columns: 1 },
        sm: { value: 576, name: 'sm', columns: 1 },
        md: { value: 768, name: 'md', columns: 2 },
        lg: { value: 992, name: 'lg', columns: 2 }
      }
    }
  }
}

// 使用组合式函数
const { validate } = useForm(formConfig)

// 事件处理
const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
  formState.isSubmitting = true
  
  // 模拟提交过程
  setTimeout(() => {
    formState.isSubmitting = false
    alert('注册成功！')
  }, 2000)
}

const handleReset = () => {
  formData.value = {}
  formState.isDirty = false
  console.log('表单已重置')
}

const handleFieldChange = (event: any) => {
  formState.isDirty = true
  console.log('字段变化:', event)
}

const handleValidation = (result: any) => {
  formState.isValid = result.valid
  formState.hasErrors = !result.valid
  console.log('验证结果:', result)
}

// 控制方法
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

const fillSampleData = () => {
  formData.value = {
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'password123',
    gender: 'male',
    role: 'user',
    interests: ['programming', 'music'],
    newsletter: true,
    bio: '我是一名前端开发工程师，热爱编程和音乐。'
  }
}

const clearData = () => {
  formData.value = {}
  formState.isDirty = false
}

const validateForm = async () => {
  try {
    const result = await validate()
    console.log('手动验证结果:', result)
    alert(`验证${result.valid ? '通过' : '失败'}`)
  } catch (error) {
    console.error('验证出错:', error)
  }
}
</script>

<style scoped>
.example-container {
  max-width: 1200px;
  margin: 0 auto;
}

.example-header {
  text-align: center;
  margin-bottom: 40px;
}

.example-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.example-header p {
  color: #666;
  font-size: 16px;
}

.example-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.form-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.controls-section,
.output-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.controls-section h3,
.output-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover {
  background: #f5f5f5;
  border-color: #f39c12;
}

.data-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  overflow: auto;
  max-height: 200px;
  margin: 0;
}

.status-grid {
  display: grid;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.status-item .label {
  font-weight: 500;
  color: #666;
}

.status-item .value {
  font-weight: 600;
}

.status-item .value.success {
  color: #52c41a;
}

.status-item .value.error {
  color: #ff4d4f;
}

.status-item .value.warning {
  color: #faad14;
}

.status-item .value.info {
  color: #1890ff;
}

.status-item .value.normal {
  color: #666;
}

@media (max-width: 768px) {
  .example-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
