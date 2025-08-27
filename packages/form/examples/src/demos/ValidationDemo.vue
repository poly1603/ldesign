<!--
表单验证演示 - 展示各种验证规则和场景
-->

<template>
  <div class="validation-demo">
    <div class="demo-header">
      <h2>✅ 表单验证演示</h2>
      <p>LemonForm 提供强大的表单验证功能，支持同步验证、异步验证、自定义验证规则等。</p>
    </div>

    <div class="demo-controls">
      <label>
        <input v-model="realTimeValidation" type="checkbox" />
        实时验证
      </label>
      <label>
        <input v-model="showValidationStatus" type="checkbox" />
        显示验证状态
      </label>
      <button @click="validateAll" class="btn btn-primary">
        验证所有字段
      </button>
      <button @click="clearValidation" class="btn btn-secondary">
        清除验证
      </button>
    </div>

    <div class="demo-content">
      <div class="validation-sections">
        <!-- 基础验证 -->
        <div class="validation-section">
          <h3>🔍 基础验证规则</h3>
          <div class="validation-fields">
            <ValidationField
              :field="{
                type: 'input',
                name: 'username',
                label: '用户名',
                placeholder: '请输入用户名',
                required: true,
                rules: [
                  { type: 'required', message: '用户名不能为空' },
                  { type: 'minLength', value: 3, message: '用户名至少3个字符' },
                  { type: 'maxLength', value: 20, message: '用户名最多20个字符' },
                  { type: 'pattern', value: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' }
                ]
              }"
              :value="formData.username"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.username = $event"
              @validation="handleValidation('username', $event)"
            />

            <ValidationField
              :field="{
                type: 'input',
                name: 'email',
                label: '邮箱地址',
                placeholder: '请输入邮箱',
                required: true,
                props: { type: 'email' },
                rules: [
                  { type: 'required', message: '邮箱不能为空' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]
              }"
              :value="formData.email"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.email = $event"
              @validation="handleValidation('email', $event)"
            />

            <ValidationField
              :field="{
                type: 'input',
                name: 'phone',
                label: '手机号码',
                placeholder: '请输入手机号码',
                required: true,
                rules: [
                  { type: 'required', message: '手机号码不能为空' },
                  { type: 'pattern', value: /^1[3-9]\\d{9}$/, message: '请输入有效的手机号码' }
                ]
              }"
              :value="formData.phone"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.phone = $event"
              @validation="handleValidation('phone', $event)"
            />
          </div>
        </div>

        <!-- 数字验证 -->
        <div class="validation-section">
          <h3>🔢 数字验证</h3>
          <div class="validation-fields">
            <ValidationField
              :field="{
                type: 'number',
                name: 'age',
                label: '年龄',
                placeholder: '请输入年龄',
                required: true,
                rules: [
                  { type: 'required', message: '年龄不能为空' },
                  { type: 'min', value: 18, message: '年龄不能小于18岁' },
                  { type: 'max', value: 65, message: '年龄不能大于65岁' }
                ]
              }"
              :value="formData.age"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.age = $event"
              @validation="handleValidation('age', $event)"
            />

            <ValidationField
              :field="{
                type: 'number',
                name: 'salary',
                label: '期望薪资',
                placeholder: '请输入期望薪资',
                rules: [
                  { type: 'min', value: 3000, message: '薪资不能低于3000' },
                  { type: 'max', value: 50000, message: '薪资不能超过50000' }
                ]
              }"
              :value="formData.salary"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.salary = $event"
              @validation="handleValidation('salary', $event)"
            />
          </div>
        </div>

        <!-- 密码验证 -->
        <div class="validation-section">
          <h3>🔐 密码验证</h3>
          <div class="validation-fields">
            <ValidationField
              :field="{
                type: 'input',
                name: 'password',
                label: '密码',
                placeholder: '请输入密码',
                required: true,
                props: { type: 'password' },
                rules: [
                  { type: 'required', message: '密码不能为空' },
                  { type: 'minLength', value: 8, message: '密码至少8个字符' },
                  { type: 'pattern', value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, message: '密码必须包含大小写字母和数字' }
                ]
              }"
              :value="formData.password"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.password = $event"
              @validation="handleValidation('password', $event)"
            />

            <ValidationField
              :field="{
                type: 'input',
                name: 'confirmPassword',
                label: '确认密码',
                placeholder: '请再次输入密码',
                required: true,
                props: { type: 'password' },
                rules: [
                  { type: 'required', message: '请确认密码' },
                  {
                    type: 'custom',
                    validator: (value) => {
                      return value === formData.password ? true : '两次输入的密码不一致'
                    }
                  }
                ]
              }"
              :value="formData.confirmPassword"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.confirmPassword = $event"
              @validation="handleValidation('confirmPassword', $event)"
            />
          </div>
        </div>

        <!-- 异步验证 -->
        <div class="validation-section">
          <h3>🌐 异步验证</h3>
          <div class="validation-fields">
            <ValidationField
              :field="{
                type: 'input',
                name: 'uniqueUsername',
                label: '唯一用户名',
                placeholder: '请输入唯一用户名',
                required: true,
                rules: [
                  { type: 'required', message: '用户名不能为空' },
                  {
                    type: 'async',
                    validator: checkUsernameUnique,
                    message: '正在检查用户名是否可用...'
                  }
                ]
              }"
              :value="formData.uniqueUsername"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.uniqueUsername = $event"
              @validation="handleValidation('uniqueUsername', $event)"
            />

            <ValidationField
              :field="{
                type: 'input',
                name: 'uniqueEmail',
                label: '唯一邮箱',
                placeholder: '请输入唯一邮箱',
                required: true,
                props: { type: 'email' },
                rules: [
                  { type: 'required', message: '邮箱不能为空' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                  {
                    type: 'async',
                    validator: checkEmailUnique,
                    message: '正在检查邮箱是否可用...'
                  }
                ]
              }"
              :value="formData.uniqueEmail"
              :realTime="realTimeValidation"
              :showStatus="showValidationStatus"
              @update:value="formData.uniqueEmail = $event"
              @validation="handleValidation('uniqueEmail', $event)"
            />
          </div>
        </div>
      </div>

      <!-- 验证状态面板 -->
      <div class="validation-status">
        <h3>📊 验证状态</h3>
        <div class="status-grid">
          <div
            v-for="(status, field) in validationStatus"
            :key="field"
            :class="['status-item', `status-${status.status}`]"
          >
            <span class="field-name">{{ field }}</span>
            <span class="status-icon">
              <span v-if="status.status === 'valid'">✅</span>
              <span v-else-if="status.status === 'invalid'">❌</span>
              <span v-else-if="status.status === 'validating'">🔄</span>
              <span v-else>⏸️</span>
            </span>
            <span class="status-message">{{ status.message || '未验证' }}</span>
          </div>
        </div>

        <div class="overall-status">
          <h4>整体状态</h4>
          <div :class="['overall-indicator', overallStatus.status]">
            <span class="indicator-icon">
              <span v-if="overallStatus.status === 'valid'">✅</span>
              <span v-else-if="overallStatus.status === 'invalid'">❌</span>
              <span v-else-if="overallStatus.status === 'validating'">🔄</span>
              <span v-else>⏸️</span>
            </span>
            <span class="indicator-text">{{ overallStatus.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import ValidationField from '../components/ValidationField.vue'

// 控制选项
const realTimeValidation = ref(true)
const showValidationStatus = ref(true)

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  phone: '',
  age: null,
  salary: null,
  password: '',
  confirmPassword: '',
  uniqueUsername: '',
  uniqueEmail: ''
})

// 验证状态
const validationStatus = reactive<Record<string, any>>({})

// 整体验证状态
const overallStatus = computed(() => {
  const statuses = Object.values(validationStatus)
  
  if (statuses.length === 0) {
    return { status: 'pending', message: '尚未开始验证' }
  }
  
  if (statuses.some(s => s.status === 'validating')) {
    return { status: 'validating', message: '正在验证中...' }
  }
  
  if (statuses.some(s => s.status === 'invalid')) {
    return { status: 'invalid', message: '存在验证错误' }
  }
  
  if (statuses.every(s => s.status === 'valid')) {
    return { status: 'valid', message: '所有字段验证通过' }
  }
  
  return { status: 'pending', message: '部分字段未验证' }
})

// 处理验证结果
const handleValidation = (field: string, result: any) => {
  validationStatus[field] = result
}

// 异步验证函数
const checkUsernameUnique = async (value: string): Promise<string | true> => {
  if (!value) return true
  
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟已存在的用户名
  const existingUsernames = ['admin', 'user', 'test', 'demo']
  if (existingUsernames.includes(value.toLowerCase())) {
    return '用户名已存在，请选择其他用户名'
  }
  
  return true
}

const checkEmailUnique = async (value: string): Promise<string | true> => {
  if (!value) return true
  
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 模拟已存在的邮箱
  const existingEmails = ['admin@example.com', 'user@example.com', 'test@example.com']
  if (existingEmails.includes(value.toLowerCase())) {
    return '邮箱已被注册，请使用其他邮箱'
  }
  
  return true
}

// 验证所有字段
const validateAll = () => {
  // 这里可以触发所有字段的验证
  console.log('验证所有字段')
}

// 清除验证
const clearValidation = () => {
  Object.keys(validationStatus).forEach(key => {
    delete validationStatus[key]
  })
}
</script>

<style scoped>
.validation-demo {
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
}

.demo-header p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.demo-controls {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.demo-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.demo-controls input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
  color: #333;
}

.btn-primary {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.btn-primary:hover {
  background: #e67e22;
  border-color: #e67e22;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
  border-color: #545b62;
}

.demo-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.validation-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.validation-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.validation-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #f39c12;
  padding-bottom: 10px;
}

.validation-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.validation-status {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.validation-status h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 25px;
}

.status-item {
  display: grid;
  grid-template-columns: 1fr auto 2fr;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.status-item.status-valid {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.status-item.status-invalid {
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.status-item.status-validating {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.status-item.status-pending {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.field-name {
  font-weight: 500;
  color: #333;
}

.status-icon {
  font-size: 16px;
}

.status-message {
  font-size: 12px;
  color: #666;
  word-break: break-all;
}

.overall-status h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1rem;
}

.overall-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border-radius: 6px;
  font-weight: 500;
}

.overall-indicator.valid {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.overall-indicator.invalid {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.overall-indicator.validating {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.overall-indicator.pending {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  color: #666;
}

.indicator-icon {
  font-size: 18px;
}

.indicator-text {
  font-size: 14px;
}

@media (max-width: 1200px) {
  .demo-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .validation-status {
    position: static;
  }
}

@media (max-width: 768px) {
  .demo-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .demo-header h2 {
    font-size: 1.5rem;
  }

  .demo-header p {
    font-size: 1rem;
  }

  .validation-section {
    padding: 20px;
  }

  .status-item {
    grid-template-columns: 1fr;
    gap: 5px;
    text-align: center;
  }
}
</style>
