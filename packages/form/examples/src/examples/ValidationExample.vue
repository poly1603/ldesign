<!--
表单验证示例
-->

<template>
  <div class="example-container">
    <div class="example-header">
      <h2>表单验证示例</h2>
      <p>展示各种验证规则的使用，包括同步验证、异步验证和自定义验证器</p>
    </div>

    <div class="example-content">
      <div class="form-section">
        <h3>验证规则演示</h3>
        <DynamicForm
          v-model="formData"
          :config="formConfig"
          @submit="handleSubmit"
          @validation="handleValidation"
        />
      </div>

      <div class="info-section">
        <div class="validation-info">
          <h3>验证规则说明</h3>
          <div class="rule-list">
            <div class="rule-item">
              <strong>用户名:</strong> 必填，3-20字符，只能包含字母数字下划线
            </div>
            <div class="rule-item">
              <strong>邮箱:</strong> 必填，邮箱格式，异步检查是否已存在
            </div>
            <div class="rule-item">
              <strong>密码:</strong> 必填，至少8位，包含大小写字母和数字
            </div>
            <div class="rule-item">
              <strong>确认密码:</strong> 必填，必须与密码一致
            </div>
            <div class="rule-item">
              <strong>年龄:</strong> 必填，18-100之间的整数
            </div>
            <div class="rule-item">
              <strong>手机号:</strong> 可选，中国大陆手机号格式
            </div>
            <div class="rule-item">
              <strong>网站:</strong> 可选，有效的URL格式
            </div>
          </div>
        </div>

        <div class="validation-status">
          <h3>验证状态</h3>
          <div class="status-grid">
            <div class="status-item">
              <span class="label">表单状态:</span>
              <span :class="['value', validationResult.valid ? 'success' : 'error']">
                {{ validationResult.valid ? '有效' : '无效' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">错误数量:</span>
              <span class="value error">{{ errorCount }}</span>
            </div>
            <div class="status-item">
              <span class="label">异步验证:</span>
              <span :class="['value', asyncValidating ? 'info' : 'normal']">
                {{ asyncValidating ? '验证中...' : '完成' }}
              </span>
            </div>
          </div>

          <div v-if="validationErrors.length > 0" class="error-list">
            <h4>验证错误:</h4>
            <ul>
              <li v-for="error in validationErrors" :key="error.field" class="error-item">
                <strong>{{ error.field }}:</strong> {{ error.message }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { DynamicForm } from '@lemonform/form'
import type { FormConfig, ValidationRule } from '@lemonform/form'

// 表单数据
const formData = ref({})

// 验证状态
const validationResult = reactive({
  valid: true,
  fields: {} as Record<string, any>
})

const asyncValidating = ref(false)

// 计算属性
const errorCount = computed(() => {
  return Object.values(validationResult.fields).filter(field => !field.valid).length
})

const validationErrors = computed(() => {
  return Object.entries(validationResult.fields)
    .filter(([, field]) => !field.valid)
    .map(([fieldName, field]) => ({
      field: fieldName,
      message: field.message
    }))
})

// 自定义异步验证器 - 检查邮箱是否已存在
const checkEmailExists = async (value: string): Promise<boolean | string> => {
  if (!value) return true
  
  asyncValidating.value = true
  
  // 模拟异步验证
  return new Promise((resolve) => {
    setTimeout(() => {
      asyncValidating.value = false
      // 模拟已存在的邮箱
      const existingEmails = ['admin@example.com', 'test@example.com', 'user@example.com']
      if (existingEmails.includes(value)) {
        resolve('该邮箱已被注册')
      } else {
        resolve(true)
      }
    }, 1500)
  })
}

// 自定义验证器 - 强密码验证
const validateStrongPassword = (value: string): boolean | string => {
  if (!value) return true
  
  const hasLowerCase = /[a-z]/.test(value)
  const hasUpperCase = /[A-Z]/.test(value)
  const hasNumbers = /\d/.test(value)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
  
  if (!hasLowerCase) return '密码必须包含小写字母'
  if (!hasUpperCase) return '密码必须包含大写字母'
  if (!hasNumbers) return '密码必须包含数字'
  if (value.length < 8) return '密码至少8个字符'
  
  return true
}

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
      rules: [
        { type: 'required', message: '用户名不能为空' },
        { type: 'minLength', value: 3, message: '用户名至少3个字符' },
        { type: 'maxLength', value: 20, message: '用户名最多20个字符' },
        { type: 'pattern', value: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
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
        { type: 'email', message: '请输入有效的邮箱地址' },
        { type: 'custom', validator: checkEmailExists, message: '邮箱验证失败' }
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
        { type: 'custom', validator: validateStrongPassword, message: '密码强度不够' }
      ]
    },
    {
      type: 'input',
      name: 'confirmPassword',
      label: '确认密码',
      component: 'input',
      required: true,
      placeholder: '请再次输入密码',
      props: {
        type: 'password'
      },
      rules: [
        { type: 'required', message: '请确认密码' },
        {
          type: 'custom',
          validator: (value: string, rule: ValidationRule, formData: any) => {
            return value === formData.password ? true : '两次输入的密码不一致'
          }
        }
      ]
    },
    {
      type: 'input',
      name: 'age',
      label: '年龄',
      component: 'input',
      required: true,
      placeholder: '请输入年龄',
      props: {
        type: 'number'
      },
      rules: [
        { type: 'required', message: '年龄不能为空' },
        { type: 'integer', message: '年龄必须是整数' },
        { type: 'min', value: 18, message: '年龄不能小于18岁' },
        { type: 'max', value: 100, message: '年龄不能大于100岁' }
      ]
    },
    {
      type: 'input',
      name: 'phone',
      label: '手机号',
      component: 'input',
      placeholder: '请输入手机号（可选）',
      rules: [
        { type: 'phone', message: '请输入有效的手机号码' }
      ]
    },
    {
      type: 'input',
      name: 'website',
      label: '个人网站',
      component: 'input',
      placeholder: '请输入网站地址（可选）',
      rules: [
        { type: 'url', message: '请输入有效的网站地址' }
      ]
    },
    {
      type: 'actions',
      buttons: [
        { type: 'submit', text: '提交验证', variant: 'primary' },
        { type: 'reset', text: '重置', variant: 'secondary' }
      ]
    }
  ],
  layout: {
    type: 'grid',
    columns: 1,
    gap: 20
  },
  validation: {
    enabled: true,
    trigger: 'change',
    showStatus: true,
    showMessage: true
  }
}

// 事件处理
const handleSubmit = (data: any) => {
  console.log('验证通过，提交数据:', data)
  alert('所有验证通过！表单提交成功。')
}

const handleValidation = (result: any) => {
  Object.assign(validationResult, result)
  console.log('验证结果:', result)
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
  grid-template-columns: 1fr 1fr;
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

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.validation-info,
.validation-status {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.validation-info h3,
.validation-status h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
}

.rule-item strong {
  color: #f39c12;
}

.status-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
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

.status-item .value.info {
  color: #1890ff;
}

.status-item .value.normal {
  color: #666;
}

.error-list {
  border-top: 1px solid #e9ecef;
  padding-top: 15px;
}

.error-list h4 {
  margin: 0 0 10px 0;
  color: #ff4d4f;
  font-size: 14px;
}

.error-list ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.error-item {
  padding: 5px 0;
  font-size: 14px;
  color: #ff4d4f;
}

.error-item strong {
  color: #333;
}

@media (max-width: 768px) {
  .example-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
