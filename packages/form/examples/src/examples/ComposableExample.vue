<!--
组合式函数示例
-->

<template>
  <div class="example-container">
    <div class="example-header">
      <h2>组合式函数示例</h2>
      <p>展示如何使用 LemonForm 提供的组合式函数来构建表单</p>
    </div>

    <div class="example-content">
      <div class="form-section">
        <h3>使用 useForm Hook</h3>
        
        <!-- 手动构建的表单 -->
        <form @submit.prevent="handleSubmit" class="manual-form">
          <div class="form-field">
            <label>用户名 *</label>
            <input
              v-model="formData.username"
              type="text"
              placeholder="请输入用户名"
              :class="{ error: fieldErrors.username }"
              @blur="validateField('username')"
            />
            <div v-if="fieldErrors.username" class="error-message">
              {{ fieldErrors.username }}
            </div>
          </div>

          <div class="form-field">
            <label>邮箱 *</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="请输入邮箱"
              :class="{ error: fieldErrors.email }"
              @blur="validateField('email')"
            />
            <div v-if="fieldErrors.email" class="error-message">
              {{ fieldErrors.email }}
            </div>
          </div>

          <div class="form-field">
            <label>密码 *</label>
            <input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              :class="{ error: fieldErrors.password }"
              @blur="validateField('password')"
            />
            <div v-if="fieldErrors.password" class="error-message">
              {{ fieldErrors.password }}
            </div>
          </div>

          <div class="form-field">
            <label>年龄</label>
            <input
              v-model.number="formData.age"
              type="number"
              placeholder="请输入年龄"
              :class="{ error: fieldErrors.age }"
              @blur="validateField('age')"
            />
            <div v-if="fieldErrors.age" class="error-message">
              {{ fieldErrors.age }}
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="!isFormValid || isSubmitting">
              {{ isSubmitting ? '提交中...' : '提交' }}
            </button>
            <button type="button" @click="resetForm">重置</button>
            <button type="button" @click="validateAll">验证所有字段</button>
          </div>
        </form>
      </div>

      <div class="info-section">
        <div class="hook-info">
          <h3>Hook 状态</h3>
          <div class="status-grid">
            <div class="status-item">
              <span class="label">表单有效:</span>
              <span :class="['value', isFormValid ? 'success' : 'error']">
                {{ isFormValid ? '是' : '否' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">脏数据:</span>
              <span :class="['value', isDirty ? 'warning' : 'normal']">
                {{ isDirty ? '是' : '否' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">提交中:</span>
              <span :class="['value', isSubmitting ? 'info' : 'normal']">
                {{ isSubmitting ? '是' : '否' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">已触摸:</span>
              <span :class="['value', isTouched ? 'info' : 'normal']">
                {{ isTouched ? '是' : '否' }}
              </span>
            </div>
          </div>
        </div>

        <div class="field-states">
          <h3>字段状态</h3>
          <div class="field-list">
            <div 
              v-for="(state, field) in fieldStates" 
              :key="field"
              class="field-state"
            >
              <div class="field-name">{{ field }}</div>
              <div class="field-props">
                <span :class="['prop', state.isDirty ? 'active' : '']">
                  脏数据: {{ state.isDirty ? '是' : '否' }}
                </span>
                <span :class="['prop', state.isTouched ? 'active' : '']">
                  已触摸: {{ state.isTouched ? '是' : '否' }}
                </span>
                <span :class="['prop', state.isValid ? 'success' : 'error']">
                  有效: {{ state.isValid ? '是' : '否' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="api-demo">
          <h3>API 演示</h3>
          <div class="api-buttons">
            <button @click="setFieldValue('username', 'demo_user')">
              设置用户名
            </button>
            <button @click="setFieldValue('email', 'demo@example.com')">
              设置邮箱
            </button>
            <button @click="clearField('password')">
              清空密码
            </button>
            <button @click="fillSampleData">
              填充示例数据
            </button>
          </div>
        </div>

        <div class="form-data">
          <h3>表单数据</h3>
          <pre class="data-display">{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useForm, useFormValidation } from '@lemonform/form'
import type { FormConfig } from '@lemonform/form'

// 表单配置
const formConfig: FormConfig = {
  fields: [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      component: 'input',
      required: true,
      rules: [
        { type: 'required', message: '用户名不能为空' },
        { type: 'minLength', value: 3, message: '用户名至少3个字符' }
      ]
    },
    {
      type: 'input',
      name: 'email',
      label: '邮箱',
      component: 'input',
      required: true,
      rules: [
        { type: 'required', message: '邮箱不能为空' },
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    },
    {
      type: 'input',
      name: 'password',
      label: '密码',
      component: 'input',
      required: true,
      rules: [
        { type: 'required', message: '密码不能为空' },
        { type: 'minLength', value: 6, message: '密码至少6个字符' }
      ]
    },
    {
      type: 'input',
      name: 'age',
      label: '年龄',
      component: 'input',
      rules: [
        { type: 'min', value: 18, message: '年龄不能小于18岁' },
        { type: 'max', value: 100, message: '年龄不能大于100岁' }
      ]
    }
  ]
}

// 使用 useForm Hook
const {
  formData,
  formState,
  fieldStates,
  validate,
  validateField: validateSingleField,
  reset,
  setFieldValue,
  getFieldValue,
  submit
} = useForm(formConfig)

// 使用 useFormValidation Hook
const { validateValue } = useFormValidation()

// 字段错误状态
const fieldErrors = reactive<Record<string, string>>({})

// 计算属性
const isFormValid = computed(() => formState.isValid)
const isDirty = computed(() => formState.isDirty)
const isSubmitting = computed(() => formState.isSubmitting)
const isTouched = computed(() => formState.isTouched)

// 验证单个字段
const validateField = async (fieldName: string) => {
  try {
    const field = formConfig.fields.find(f => f.name === fieldName)
    if (!field || !field.rules) {
      fieldErrors[fieldName] = ''
      return
    }

    const value = formData.value[fieldName]
    const result = await validateValue(value, field.rules, formData.value)
    
    if (result.valid) {
      fieldErrors[fieldName] = ''
    } else {
      fieldErrors[fieldName] = result.message || '验证失败'
    }
  } catch (error) {
    console.error('验证字段出错:', error)
    fieldErrors[fieldName] = '验证出错'
  }
}

// 验证所有字段
const validateAll = async () => {
  try {
    const result = await validate()
    console.log('验证结果:', result)
    
    // 更新字段错误状态
    Object.keys(fieldErrors).forEach(field => {
      fieldErrors[field] = ''
    })
    
    if (result.fields) {
      Object.entries(result.fields).forEach(([field, fieldResult]) => {
        if (!fieldResult.valid) {
          fieldErrors[field] = fieldResult.message || '验证失败'
        }
      })
    }
    
    alert(`表单验证${result.valid ? '通过' : '失败'}`)
  } catch (error) {
    console.error('验证出错:', error)
  }
}

// 重置表单
const resetForm = () => {
  reset()
  Object.keys(fieldErrors).forEach(field => {
    fieldErrors[field] = ''
  })
}

// 清空字段
const clearField = (fieldName: string) => {
  setFieldValue(fieldName, '')
  fieldErrors[fieldName] = ''
}

// 填充示例数据
const fillSampleData = () => {
  setFieldValue('username', 'john_doe')
  setFieldValue('email', 'john.doe@example.com')
  setFieldValue('password', 'password123')
  setFieldValue('age', 25)
}

// 提交表单
const handleSubmit = async () => {
  try {
    const result = await submit()
    if (result) {
      console.log('表单提交成功:', formData.value)
      alert('表单提交成功！')
    }
  } catch (error) {
    console.error('提交失败:', error)
    alert('表单提交失败！')
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
  grid-template-columns: 1fr 1fr;
  gap: 30px;
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

.manual-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-field label {
  font-weight: 500;
  color: #333;
}

.form-field input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-field input:focus {
  outline: none;
  border-color: #f39c12;
}

.form-field input.error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.form-actions button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.form-actions button[type="submit"] {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hook-info,
.field-states,
.api-demo,
.form-data {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.hook-info h3,
.field-states h3,
.api-demo h3,
.form-data h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.status-grid {
  display: grid;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
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

.field-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-state {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.field-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.field-props {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.prop {
  font-size: 12px;
  color: #666;
}

.prop.active {
  color: #f39c12;
  font-weight: 500;
}

.prop.success {
  color: #52c41a;
}

.prop.error {
  color: #ff4d4f;
}

.api-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.api-buttons button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.api-buttons button:hover {
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

@media (max-width: 768px) {
  .example-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
