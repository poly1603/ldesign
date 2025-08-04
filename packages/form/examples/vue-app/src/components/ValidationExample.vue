<script setup>
import { AdaptiveForm } from '@ldesign/form/vue'
import { computed, reactive, ref } from 'vue'

const validationFormRef = ref()
const formData = ref({})
const validationResult = ref({ valid: true, errors: [] })

// 计算已填写字段数量
const filledFieldCount = computed(() => {
  return Object.values(formData.value).filter(value =>
    value !== undefined && value !== null && value !== '',
  ).length
})

// 表单配置
const formConfig = reactive({
  items: [
    {
      key: 'username',
      label: '用户名',
      type: 'input',
      required: true,
      placeholder: '请输入用户名',
      validation: [
        {
          id: 'username-length',
          type: 'length',
          message: '用户名长度必须在3-20个字符之间',
          value: { min: 3, max: 20 },
        },
        {
          id: 'username-pattern',
          type: 'pattern',
          message: '用户名只能包含字母、数字和下划线',
          value: '^[a-zA-Z0-9_]+$',
        },
      ],
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'email',
      required: true,
      placeholder: '请输入邮箱地址',
    },
    {
      key: 'phone',
      label: '手机号',
      type: 'tel',
      required: true,
      placeholder: '请输入手机号码',
      validation: [
        {
          id: 'phone-pattern',
          type: 'pattern',
          message: '请输入正确的手机号码',
          value: '^1[3-9]\\d{9}$',
        },
      ],
    },
    {
      key: 'password',
      label: '密码',
      type: 'password',
      required: true,
      placeholder: '请输入密码',
      validation: [
        {
          id: 'password-length',
          type: 'length',
          message: '密码长度至少8位',
          value: { min: 8 },
        },
        {
          id: 'password-pattern',
          type: 'pattern',
          message: '密码必须包含字母和数字',
          value: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$',
        },
      ],
    },
    {
      key: 'confirmPassword',
      label: '确认密码',
      type: 'password',
      required: true,
      placeholder: '请再次输入密码',
      validation: [
        {
          id: 'confirm-password',
          type: 'custom',
          message: '两次输入的密码不一致',
          validator: (value) => {
            return value === formData.value.password
          },
        },
      ],
    },
    {
      key: 'age',
      label: '年龄',
      type: 'number',
      required: true,
      placeholder: '请输入年龄',
      validation: [
        {
          id: 'age-range',
          type: 'range',
          message: '年龄必须在18-100之间',
          value: { min: 18, max: 100 },
        },
      ],
    },
    {
      key: 'website',
      label: '个人网站',
      type: 'url',
      placeholder: '请输入网站地址',
      validation: [
        {
          id: 'website-pattern',
          type: 'pattern',
          message: '请输入正确的网站地址',
          value: '^https?:\\/\\/.+',
        },
      ],
    },
    {
      key: 'bio',
      label: '个人简介',
      type: 'textarea',
      placeholder: '请输入个人简介',
      validation: [
        {
          id: 'bio-length',
          type: 'length',
          message: '个人简介不能超过200个字符',
          value: { max: 200 },
        },
      ],
    },
  ],
  layout: {
    maxColumns: 2,
    gap: { horizontal: 16, vertical: 16 },
  },
  display: {
    labelPosition: 'left',
    labelWidth: 100,
    showExpandButton: true,
    expandMode: 'inline',
  },
  validation: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorMessage: true,
    errorMessagePosition: 'bottom',
  },
  behavior: {
    expandThreshold: 4,
    debounceTime: 300,
  },
})

// 事件处理
function handleValidation(data) {
  validationResult.value = data
  console.log('验证结果:', data)
}

function handleChange(data) {
  console.log('表单变化:', data)

  // 如果是确认密码字段变化，需要重新验证
  if (data.key === 'password' && formData.value.confirmPassword) {
    // 触发确认密码字段的验证
    setTimeout(() => {
      if (validationFormRef.value) {
        validationFormRef.value.validate('confirmPassword')
      }
    }, 100)
  }
}

// 操作方法
function validateAll() {
  if (validationFormRef.value) {
    validationFormRef.value.validate()
  }
}

function fillValidData() {
  formData.value = {
    username: 'john_doe',
    email: 'john@example.com',
    phone: '13800138000',
    password: 'Password123',
    confirmPassword: 'Password123',
    age: 25,
    website: 'https://johndoe.com',
    bio: '我是一名前端开发工程师，热爱技术和创新。',
  }
}

function fillInvalidData() {
  formData.value = {
    username: 'a', // 太短
    email: 'invalid-email', // 格式错误
    phone: '123', // 格式错误
    password: '123', // 太短且不符合规则
    confirmPassword: '456', // 不匹配
    age: 15, // 超出范围
    website: 'not-a-url', // 格式错误
    bio: 'A'.repeat(250), // 太长
  }
}

function clearForm() {
  formData.value = {}
}
</script>

<template>
  <div class="example">
    <div class="example-header">
      <h2>✅ 表单验证示例</h2>
      <p>演示实时验证、自定义规则等验证功能</p>
    </div>

    <div class="example-content">
      <div class="demo-section">
        <h3>实时验证表单</h3>
        <div class="controls">
          <button class="btn btn-primary" @click="validateAll">
            🔍 验证全部
          </button>
          <button class="btn btn-success" @click="fillValidData">
            ✨ 填入有效数据
          </button>
          <button class="btn btn-warning" @click="fillInvalidData">
            ⚠️ 填入无效数据
          </button>
          <button class="btn btn-secondary" @click="clearForm">
            🗑️ 清空表单
          </button>
        </div>

        <AdaptiveForm
          ref="validationFormRef"
          v-model="formData"
          :config="formConfig"
          @validation-change="handleValidation"
          @change="handleChange"
        />

        <div class="validation-summary">
          <div class="summary-card" :class="[validationResult.valid ? 'success' : 'error']">
            <div class="summary-header">
              <span class="summary-icon">
                {{ validationResult.valid ? '✅' : '❌' }}
              </span>
              <span class="summary-text">
                {{ validationResult.valid ? '验证通过' : '验证失败' }}
              </span>
            </div>

            <div v-if="!validationResult.valid" class="error-list">
              <div v-for="error in validationResult.errors" :key="error" class="error-item">
                • {{ error }}
              </div>
            </div>

            <div class="validation-stats">
              <span>总字段: {{ formConfig.items.length }}</span>
              <span>已填写: {{ filledFieldCount }}</span>
              <span>错误: {{ validationResult.errors.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>验证规则配置</h3>
        <div class="rules-config">
          <div class="rule-group">
            <h4>基础验证</h4>
            <div class="rule-list">
              <div class="rule-item">
                <span class="rule-name">必填验证</span>
                <span class="rule-desc">检查字段是否为空</span>
              </div>
              <div class="rule-item">
                <span class="rule-name">邮箱格式</span>
                <span class="rule-desc">验证邮箱地址格式</span>
              </div>
              <div class="rule-item">
                <span class="rule-name">手机号格式</span>
                <span class="rule-desc">验证中国大陆手机号</span>
              </div>
              <div class="rule-item">
                <span class="rule-name">数值范围</span>
                <span class="rule-desc">检查数值是否在指定范围</span>
              </div>
            </div>
          </div>

          <div class="rule-group">
            <h4>高级验证</h4>
            <div class="rule-list">
              <div class="rule-item">
                <span class="rule-name">密码强度</span>
                <span class="rule-desc">至少8位，包含字母和数字</span>
              </div>
              <div class="rule-item">
                <span class="rule-name">确认密码</span>
                <span class="rule-desc">与密码字段保持一致</span>
              </div>
              <div class="rule-item">
                <span class="rule-name">用户名唯一性</span>
                <span class="rule-desc">模拟异步验证用户名</span>
              </div>
              <div class="rule-item">
                <span class="rule-name">自定义规则</span>
                <span class="rule-desc">业务逻辑相关验证</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>验证配置选项</h3>
        <div class="config-panel">
          <div class="config-group">
            <label>
              <input
                v-model="formConfig.validation.validateOnChange"
                type="checkbox"
              >
              输入时验证
            </label>
          </div>

          <div class="config-group">
            <label>
              <input
                v-model="formConfig.validation.validateOnBlur"
                type="checkbox"
              >
              失焦时验证
            </label>
          </div>

          <div class="config-group">
            <label>
              <input
                v-model="formConfig.validation.showErrorMessage"
                type="checkbox"
              >
              显示错误信息
            </label>
          </div>

          <div class="config-group">
            <label>错误信息位置</label>
            <select v-model="formConfig.validation.errorMessagePosition">
              <option value="bottom">
                底部
              </option>
              <option value="right">
                右侧
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example {
  padding: 2rem;
}

.example-header {
  text-align: center;
  margin-bottom: 2rem;
}

.example-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.example-header p {
  color: #666;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h3 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.validation-summary {
  margin-top: 2rem;
}

.summary-card {
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid;
}

.summary-card.success {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.summary-card.error {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.summary-icon {
  font-size: 1.5rem;
}

.summary-text {
  font-size: 1.1rem;
  font-weight: 600;
}

.error-list {
  margin-bottom: 1rem;
}

.error-item {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.validation-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  opacity: 0.8;
}

.rules-config {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.rule-group h4 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.rule-name {
  font-weight: 500;
  color: #333;
}

.rule-desc {
  font-size: 0.875rem;
  color: #666;
}

.config-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.config-group input[type='checkbox'] {
  margin: 0;
}

.config-group select {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .rules-config {
    grid-template-columns: 1fr;
  }

  .config-panel {
    grid-template-columns: 1fr;
  }

  .validation-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
