<template>
  <div class="validation-demo">
    <div class="demo-intro">
      <p>@ldesign/form 提供了22个内置验证规则，覆盖基础到高级的各种验证场景</p>
    </div>

    <form @submit.prevent="handleSubmit" class="validation-form">
      <div class="form-section">
        <h3>基础验证</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>必填字段 *</label>
            <InputField v-model="formData.required" placeholder="此字段必填" />
            <span v-if="errors.required" class="error-msg">{{ errors.required }}</span>
          </div>

          <div class="form-item">
            <label>邮箱验证</label>
            <InputField v-model="formData.email" type="email" placeholder="user@example.com" />
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>

          <div class="form-item">
            <label>手机号验证</label>
            <InputField v-model="formData.phone" placeholder="13800138000" />
            <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>
          </div>

          <div class="form-item">
            <label>URL验证</label>
            <InputField v-model="formData.url" placeholder="https://example.com" />
            <span v-if="errors.url" class="error-msg">{{ errors.url }}</span>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>长度和范围验证</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>最小长度 (≥5)</label>
            <InputField v-model="formData.minLength" placeholder="至少5个字符" />
            <span v-if="errors.minLength" class="error-msg">{{ errors.minLength }}</span>
          </div>

          <div class="form-item">
            <label>最大长度 (≤10)</label>
            <InputField v-model="formData.maxLength" placeholder="最多10个字符" />
            <span v-if="errors.maxLength" class="error-msg">{{ errors.maxLength }}</span>
          </div>

          <div class="form-item">
            <label>最小值 (≥10)</label>
            <InputField v-model="formData.min" type="number" placeholder="不小于10" />
            <span v-if="errors.min" class="error-msg">{{ errors.min }}</span>
          </div>

          <div class="form-item">
            <label>最大值 (≤100)</label>
            <InputField v-model="formData.max" type="number" placeholder="不大于100" />
            <span v-if="errors.max" class="error-msg">{{ errors.max }}</span>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>高级验证</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>身份证号</label>
            <InputField v-model="formData.idCard" placeholder="110101199001011234" />
            <span v-if="errors.idCard" class="error-msg">{{ errors.idCard }}</span>
          </div>

          <div class="form-item">
            <label>信用卡号</label>
            <InputField v-model="formData.creditCard" placeholder="4532015112830366" />
            <span v-if="errors.creditCard" class="error-msg">{{ errors.creditCard }}</span>
          </div>

          <div class="form-item">
            <label>IP地址</label>
            <InputField v-model="formData.ip" placeholder="192.168.1.1" />
            <span v-if="errors.ip" class="error-msg">{{ errors.ip }}</span>
          </div>

          <div class="form-item">
            <label>邮政编码</label>
            <InputField v-model="formData.postalCode" placeholder="100000" />
            <span v-if="errors.postalCode" class="error-msg">{{ errors.postalCode }}</span>
          </div>

          <div class="form-item">
            <label>密码强度（中等）</label>
            <InputField v-model="formData.password" type="password" placeholder="至少8位，包含字母和数字" />
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </div>

          <div class="form-item">
            <label>确认密码</label>
            <InputField v-model="formData.confirmPassword" type="password" placeholder="再次输入密码" />
            <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">全部验证</button>
        <button type="button" class="btn" @click="resetForm">重置</button>
      </div>

      <div v-if="validationResult" class="validation-result" :class="validationResult.valid ? 'success' : 'error'">
        <h4>{{ validationResult.valid ? '✅ 验证通过!' : '❌ 验证失败' }}</h4>
        <ul v-if="!validationResult.valid">
          <li v-for="(error, field) in validationResult.errors" :key="field">
            {{ field }}: {{ error }}
          </li>
        </ul>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { InputField } from '../../../src/adapters/vue/components/fields'
import * as validators from '../../../src/utils/validation-rules'

const formData = reactive({
  required: '',
  email: '',
  phone: '',
  url: '',
  minLength: '',
  maxLength: '',
  min: '',
  max: '',
  idCard: '',
  creditCard: '',
  ip: '',
  postalCode: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({})
const validationResult = ref(null)

const validate = () => {
  const newErrors = {}
  
  // 必填
  if (!formData.required) {
    newErrors.required = '此字段为必填项'
  }
  
  // 邮箱
  if (formData.email) {
    const result = validators.email(formData.email)
    if (!result.valid) newErrors.email = result.message
  }
  
  // 手机号
  if (formData.phone) {
    const result = validators.phone(formData.phone)
    if (!result.valid) newErrors.phone = result.message
  }
  
  // URL
  if (formData.url) {
    const result = validators.url(formData.url)
    if (!result.valid) newErrors.url = result.message
  }
  
  // 最小长度
  if (formData.minLength) {
    const result = validators.minLength(5)(formData.minLength)
    if (!result.valid) newErrors.minLength = result.message
  }
  
  // 最大长度
  if (formData.maxLength) {
    const result = validators.maxLength(10)(formData.maxLength)
    if (!result.valid) newErrors.maxLength = result.message
  }
  
  // 最小值
  if (formData.min) {
    const result = validators.min(10)(formData.min)
    if (!result.valid) newErrors.min = result.message
  }
  
  // 最大值
  if (formData.max) {
    const result = validators.max(100)(formData.max)
    if (!result.valid) newErrors.max = result.message
  }
  
  // 身份证
  if (formData.idCard) {
    const result = validators.idCard(formData.idCard)
    if (!result.valid) newErrors.idCard = result.message
  }
  
  // 信用卡
  if (formData.creditCard) {
    const result = validators.creditCard(formData.creditCard)
    if (!result.valid) newErrors.creditCard = result.message
  }
  
  // IP地址
  if (formData.ip) {
    const result = validators.ip(formData.ip)
    if (!result.valid) newErrors.ip = result.message
  }
  
  // 邮政编码
  if (formData.postalCode) {
    const result = validators.postalCode(formData.postalCode)
    if (!result.valid) newErrors.postalCode = result.message
  }
  
  // 密码强度
  if (formData.password) {
    const result = validators.passwordStrength('medium')(formData.password)
    if (!result.valid) newErrors.password = result.message
  }
  
  // 确认密码
  if (formData.confirmPassword) {
    const result = validators.confirm('password')(formData.confirmPassword, formData)
    if (!result.valid) newErrors.confirmPassword = result.message
  }
  
  return newErrors
}

const handleSubmit = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  
  const newErrors = validate()
  Object.assign(errors, newErrors)
  
  validationResult.value = {
    valid: Object.keys(newErrors).length === 0,
    errors: newErrors
  }
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  Object.keys(errors).forEach(key => delete errors[key])
  validationResult.value = null
}
</script>

<style scoped>
.validation-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-intro {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.65);
}

.validation-form {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  font-size: 16px;
  margin-bottom: 20px;
  color: rgba(0, 0, 0, 0.85);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.error-msg {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 8px 20px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  border-color: #722ED1;
  color: #722ED1;
}

.btn-primary {
  background: #722ED1;
  border-color: #722ED1;
  color: #fff;
}

.btn-primary:hover {
  background: #5c24a8;
}

.validation-result {
  margin-top: 24px;
  padding: 16px;
  border-radius: 4px;
}

.validation-result.success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.validation-result.error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.validation-result h4 {
  margin-bottom: 12px;
  font-size: 14px;
}

.validation-result ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
}

.validation-result li {
  margin-bottom: 4px;
}
</style>



