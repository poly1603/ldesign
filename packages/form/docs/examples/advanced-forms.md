# 高级表单示例

## 1. 多步骤表单

### 完整的用户注册向导

```vue
<template>
  <div class="registration-wizard">
    <!-- 步骤指示器 -->
    <div class="steps-indicator">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        :class="[
          'step-item',
          {
            'active': currentStep === index,
            'completed': index < currentStep,
            'error': stepErrors[index]
          }
        ]"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-title">{{ step.title }}</div>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <LDesignForm
        :form="form"
        label-position="top"
        @submit="handleFinalSubmit"
      >
        <!-- 步骤1：基本信息 -->
        <div v-show="currentStep === 0" class="step-content">
          <h3>基本信息</h3>
          
          <div class="form-row">
            <LDesignFormItem
              name="basic.firstName"
              label="名"
              :rules="nameRules"
              required
            >
              <LDesignInput v-model="form.data.basic.firstName" />
            </LDesignFormItem>
            
            <LDesignFormItem
              name="basic.lastName"
              label="姓"
              :rules="nameRules"
              required
            >
              <LDesignInput v-model="form.data.basic.lastName" />
            </LDesignFormItem>
          </div>
          
          <LDesignFormItem
            name="basic.email"
            label="邮箱地址"
            :rules="emailRules"
            required
          >
            <LDesignInput v-model="form.data.basic.email" type="email" />
          </LDesignFormItem>
          
          <LDesignFormItem
            name="basic.phone"
            label="手机号码"
            :rules="phoneRules"
            required
          >
            <LDesignInput v-model="form.data.basic.phone" />
          </LDesignFormItem>
        </div>

        <!-- 步骤2：账户信息 -->
        <div v-show="currentStep === 1" class="step-content">
          <h3>账户信息</h3>
          
          <LDesignFormItem
            name="account.username"
            label="用户名"
            :rules="usernameRules"
            required
          >
            <LDesignInput v-model="form.data.account.username" />
          </LDesignFormItem>
          
          <LDesignFormItem
            name="account.password"
            label="密码"
            :rules="passwordRules"
            required
          >
            <LDesignInput
              v-model="form.data.account.password"
              type="password"
              show-password
            />
          </LDesignFormItem>
          
          <LDesignFormItem
            name="account.confirmPassword"
            label="确认密码"
            :rules="confirmPasswordRules"
            required
          >
            <LDesignInput
              v-model="form.data.account.confirmPassword"
              type="password"
              show-password
            />
          </LDesignFormItem>
        </div>

        <!-- 步骤3：个人偏好 -->
        <div v-show="currentStep === 2" class="step-content">
          <h3>个人偏好</h3>
          
          <LDesignFormItem name="preferences.theme" label="主题偏好">
            <LDesignRadioGroup v-model="form.data.preferences.theme">
              <LDesignRadio value="light">浅色主题</LDesignRadio>
              <LDesignRadio value="dark">深色主题</LDesignRadio>
              <LDesignRadio value="auto">跟随系统</LDesignRadio>
            </LDesignRadioGroup>
          </LDesignFormItem>
          
          <LDesignFormItem name="preferences.notifications" label="通知设置">
            <LDesignCheckboxGroup v-model="form.data.preferences.notifications">
              <LDesignCheckbox value="email">邮件通知</LDesignCheckbox>
              <LDesignCheckbox value="sms">短信通知</LDesignCheckbox>
              <LDesignCheckbox value="push">推送通知</LDesignCheckbox>
            </LDesignCheckboxGroup>
          </LDesignFormItem>
          
          <LDesignFormItem name="preferences.language" label="语言偏好">
            <LDesignSelect v-model="form.data.preferences.language">
              <LDesignOption value="zh-CN">简体中文</LDesignOption>
              <LDesignOption value="en-US">English</LDesignOption>
              <LDesignOption value="ja-JP">日本語</LDesignOption>
            </LDesignSelect>
          </LDesignFormItem>
        </div>

        <!-- 步骤4：确认信息 -->
        <div v-show="currentStep === 3" class="step-content">
          <h3>确认信息</h3>
          
          <div class="confirmation-section">
            <h4>基本信息</h4>
            <div class="info-item">
              <span class="label">姓名：</span>
              <span class="value">{{ form.data.basic.firstName }} {{ form.data.basic.lastName }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ form.data.basic.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机：</span>
              <span class="value">{{ form.data.basic.phone }}</span>
            </div>
          </div>
          
          <div class="confirmation-section">
            <h4>账户信息</h4>
            <div class="info-item">
              <span class="label">用户名：</span>
              <span class="value">{{ form.data.account.username }}</span>
            </div>
          </div>
          
          <div class="confirmation-section">
            <h4>个人偏好</h4>
            <div class="info-item">
              <span class="label">主题：</span>
              <span class="value">{{ getThemeLabel(form.data.preferences.theme) }}</span>
            </div>
            <div class="info-item">
              <span class="label">通知：</span>
              <span class="value">{{ getNotificationLabels(form.data.preferences.notifications) }}</span>
            </div>
          </div>
          
          <LDesignFormItem name="agreement" :rules="agreementRules" required>
            <LDesignCheckbox v-model="form.data.agreement">
              我已阅读并同意<a href="#" @click.prevent="showTerms">用户协议</a>和<a href="#" @click.prevent="showPrivacy">隐私政策</a>
            </LDesignCheckbox>
          </LDesignFormItem>
        </div>
      </LDesignForm>
    </div>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <LDesignButton
        v-if="currentStep > 0"
        @click="prevStep"
        :disabled="form.isSubmitting.value"
      >
        上一步
      </LDesignButton>
      
      <LDesignButton
        v-if="currentStep < steps.length - 1"
        @click="nextStep"
        type="primary"
        :loading="validatingStep"
      >
        下一步
      </LDesignButton>
      
      <LDesignButton
        v-else
        @click="submitForm"
        type="primary"
        :loading="form.isSubmitting.value"
      >
        完成注册
      </LDesignButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from '@ldesign/form/vue'
import { required, email, minLength, pattern } from '@ldesign/form/validators'

// 步骤配置
const steps = [
  { key: 'basic', title: '基本信息' },
  { key: 'account', title: '账户信息' },
  { key: 'preferences', title: '个人偏好' },
  { key: 'confirm', title: '确认信息' }
]

const currentStep = ref(0)
const validatingStep = ref(false)
const stepErrors = ref({})

// 表单实例
const form = useForm({
  initialValues: {
    basic: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    account: {
      username: '',
      password: '',
      confirmPassword: ''
    },
    preferences: {
      theme: 'light',
      notifications: [],
      language: 'zh-CN'
    },
    agreement: false
  },
  validateOnChange: true
})

// 验证规则
const nameRules = [
  { validator: required(), message: '此字段为必填项' },
  { validator: minLength(2), message: '至少2个字符' }
]

const emailRules = [
  { validator: required(), message: '请输入邮箱地址' },
  { validator: email(), message: '请输入有效的邮箱地址' }
]

const phoneRules = [
  { validator: required(), message: '请输入手机号码' },
  { validator: pattern(/^1[3-9]\d{9}$/), message: '请输入有效的手机号码' }
]

const usernameRules = [
  { validator: required(), message: '请输入用户名' },
  { validator: minLength(3), message: '用户名至少3个字符' },
  { validator: pattern(/^[a-zA-Z0-9_]+$/), message: '用户名只能包含字母、数字和下划线' }
]

const passwordRules = [
  { validator: required(), message: '请输入密码' },
  { validator: minLength(8), message: '密码至少8个字符' },
  { 
    validator: pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    message: '密码必须包含大小写字母和数字'
  }
]

const confirmPasswordRules = [
  { validator: required(), message: '请确认密码' },
  {
    validator: (value) => value === form.data.value.account.password,
    message: '两次输入的密码不一致'
  }
]

const agreementRules = [
  {
    validator: (value) => value === true,
    message: '请同意用户协议和隐私政策'
  }
]

// 步骤字段映射
const stepFields = {
  0: ['basic.firstName', 'basic.lastName', 'basic.email', 'basic.phone'],
  1: ['account.username', 'account.password', 'account.confirmPassword'],
  2: [], // 偏好设置没有必填项
  3: ['agreement']
}

// 下一步
const nextStep = async () => {
  validatingStep.value = true
  
  try {
    const fields = stepFields[currentStep.value] || []
    let isValid = true
    
    for (const field of fields) {
      const result = await form.validateField(field)
      if (!result.valid) {
        isValid = false
        stepErrors.value[currentStep.value] = true
        break
      }
    }
    
    if (isValid) {
      stepErrors.value[currentStep.value] = false
      currentStep.value++
    }
  } finally {
    validatingStep.value = false
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 提交表单
const submitForm = async () => {
  const result = await form.submit()
  if (result.valid) {
    console.log('注册成功:', result.data)
    // 处理注册成功逻辑
  }
}

// 最终提交处理
const handleFinalSubmit = async (result) => {
  if (result.valid) {
    try {
      await registerUser(result.data)
      // 注册成功，跳转到成功页面
    } catch (error) {
      console.error('注册失败:', error)
    }
  }
}

// 辅助函数
const getThemeLabel = (theme) => {
  const labels = {
    light: '浅色主题',
    dark: '深色主题',
    auto: '跟随系统'
  }
  return labels[theme] || theme
}

const getNotificationLabels = (notifications) => {
  const labels = {
    email: '邮件通知',
    sms: '短信通知',
    push: '推送通知'
  }
  return notifications.map(n => labels[n]).join('、') || '无'
}

const showTerms = () => {
  // 显示用户协议
}

const showPrivacy = () => {
  // 显示隐私政策
}

// 模拟注册API
const registerUser = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('用户注册成功:', data)
      resolve(data)
    }, 2000)
  })
}
</script>

<style scoped>
.registration-wizard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20px;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 100%;
  width: 40px;
  height: 2px;
  background: #ddd;
}

.step-item.completed::after {
  background: var(--ldesign-brand-color);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
}

.step-item.active .step-number {
  background: var(--ldesign-brand-color);
  color: white;
}

.step-item.completed .step-number {
  background: var(--ldesign-brand-color);
  color: white;
}

.step-item.error .step-number {
  background: var(--ldesign-error-color);
  color: white;
}

.step-title {
  font-size: 14px;
  color: #666;
}

.step-item.active .step-title {
  color: var(--ldesign-brand-color);
  font-weight: bold;
}

.form-content {
  min-height: 400px;
  margin-bottom: 30px;
}

.step-content h3 {
  margin-bottom: 20px;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.confirmation-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.confirmation-section h4 {
  margin-bottom: 10px;
  color: #333;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-item .label {
  font-weight: bold;
  min-width: 80px;
  color: #666;
}

.info-item .value {
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .steps-indicator {
    flex-wrap: wrap;
  }
  
  .step-item {
    margin: 10px;
  }
}
</style>
```

## 2. 动态表单构建器

### 基于配置的表单生成器

```vue
<template>
  <div class="form-builder">
    <div class="builder-header">
      <h2>动态表单构建器</h2>
      <div class="actions">
        <LDesignButton @click="addField" type="primary">添加字段</LDesignButton>
        <LDesignButton @click="previewForm">预览表单</LDesignButton>
        <LDesignButton @click="exportConfig">导出配置</LDesignButton>
      </div>
    </div>

    <div class="builder-content">
      <!-- 字段配置面板 -->
      <div class="config-panel">
        <h3>字段配置</h3>
        
        <div
          v-for="(field, index) in formConfig.fields"
          :key="field.id"
          class="field-config"
        >
          <div class="field-header">
            <span class="field-title">{{ field.label || `字段 ${index + 1}` }}</span>
            <div class="field-actions">
              <LDesignButton @click="moveField(index, -1)" size="small" :disabled="index === 0">↑</LDesignButton>
              <LDesignButton @click="moveField(index, 1)" size="small" :disabled="index === formConfig.fields.length - 1">↓</LDesignButton>
              <LDesignButton @click="removeField(index)" size="small" type="error">删除</LDesignButton>
            </div>
          </div>
          
          <div class="field-settings">
            <LDesignFormItem label="字段名称">
              <LDesignInput v-model="field.name" placeholder="字段名称" />
            </LDesignFormItem>
            
            <LDesignFormItem label="字段标签">
              <LDesignInput v-model="field.label" placeholder="字段标签" />
            </LDesignFormItem>
            
            <LDesignFormItem label="字段类型">
              <LDesignSelect v-model="field.type" @change="onFieldTypeChange(field)">
                <LDesignOption value="input">文本输入</LDesignOption>
                <LDesignOption value="textarea">多行文本</LDesignOption>
                <LDesignOption value="number">数字输入</LDesignOption>
                <LDesignOption value="select">下拉选择</LDesignOption>
                <LDesignOption value="radio">单选按钮</LDesignOption>
                <LDesignOption value="checkbox">复选框</LDesignOption>
                <LDesignOption value="date">日期选择</LDesignOption>
                <LDesignOption value="switch">开关</LDesignOption>
              </LDesignSelect>
            </LDesignFormItem>
            
            <LDesignFormItem label="占位符">
              <LDesignInput v-model="field.placeholder" placeholder="占位符文本" />
            </LDesignFormItem>
            
            <LDesignFormItem label="默认值">
              <component
                :is="getDefaultValueComponent(field.type)"
                v-model="field.defaultValue"
                :placeholder="field.placeholder"
                :options="field.options"
              />
            </LDesignFormItem>
            
            <!-- 选项配置（适用于 select、radio、checkbox） -->
            <div v-if="['select', 'radio', 'checkbox'].includes(field.type)" class="options-config">
              <LDesignFormItem label="选项配置">
                <div
                  v-for="(option, optionIndex) in field.options"
                  :key="optionIndex"
                  class="option-item"
                >
                  <LDesignInput
                    v-model="option.label"
                    placeholder="选项标签"
                    style="margin-right: 10px;"
                  />
                  <LDesignInput
                    v-model="option.value"
                    placeholder="选项值"
                    style="margin-right: 10px;"
                  />
                  <LDesignButton
                    @click="removeOption(field, optionIndex)"
                    size="small"
                    type="error"
                  >
                    删除
                  </LDesignButton>
                </div>
                <LDesignButton @click="addOption(field)" size="small">添加选项</LDesignButton>
              </LDesignFormItem>
            </div>
            
            <!-- 验证规则配置 -->
            <div class="validation-config">
              <LDesignFormItem label="验证规则">
                <LDesignCheckboxGroup v-model="field.validationRules">
                  <LDesignCheckbox value="required">必填</LDesignCheckbox>
                  <LDesignCheckbox value="email" :disabled="field.type !== 'input'">邮箱格式</LDesignCheckbox>
                  <LDesignCheckbox value="minLength">最小长度</LDesignCheckbox>
                  <LDesignCheckbox value="maxLength">最大长度</LDesignCheckbox>
                  <LDesignCheckbox value="pattern">正则表达式</LDesignCheckbox>
                </LDesignCheckboxGroup>
              </LDesignFormItem>
              
              <!-- 具体验证规则配置 -->
              <div v-if="field.validationRules.includes('minLength')" class="rule-config">
                <LDesignFormItem label="最小长度">
                  <LDesignInputNumber v-model="field.minLength" :min="0" />
                </LDesignFormItem>
              </div>
              
              <div v-if="field.validationRules.includes('maxLength')" class="rule-config">
                <LDesignFormItem label="最大长度">
                  <LDesignInputNumber v-model="field.maxLength" :min="1" />
                </LDesignFormItem>
              </div>
              
              <div v-if="field.validationRules.includes('pattern')" class="rule-config">
                <LDesignFormItem label="正则表达式">
                  <LDesignInput v-model="field.pattern" placeholder="正则表达式" />
                </LDesignFormItem>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 表单预览 -->
      <div class="preview-panel">
        <h3>表单预览</h3>
        
        <LDesignForm :form="previewForm" @submit="handlePreviewSubmit">
          <component
            v-for="field in formConfig.fields"
            :key="field.id"
            :is="getFieldComponent(field)"
            :field="field"
            :form="previewForm"
          />
          
          <LDesignFormItem>
            <LDesignButton html-type="submit" type="primary">提交表单</LDesignButton>
            <LDesignButton @click="previewForm.reset()">重置</LDesignButton>
          </LDesignFormItem>
        </LDesignForm>
      </div>
    </div>

    <!-- 配置导出对话框 -->
    <LDesignModal v-model="showExportDialog" title="表单配置">
      <pre class="config-export">{{ JSON.stringify(formConfig, null, 2) }}</pre>
      <template #footer>
        <LDesignButton @click="copyConfig">复制配置</LDesignButton>
        <LDesignButton @click="showExportDialog = false">关闭</LDesignButton>
      </template>
    </LDesignModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm } from '@ldesign/form/vue'
import { required, email, minLength, maxLength, pattern } from '@ldesign/form/validators'

// 表单配置
const formConfig = ref({
  fields: []
})

const showExportDialog = ref(false)
let fieldIdCounter = 0

// 预览表单实例
const previewForm = useForm({
  initialValues: {},
  validateOnChange: true
})

// 添加字段
const addField = () => {
  const newField = {
    id: ++fieldIdCounter,
    name: `field_${fieldIdCounter}`,
    label: `字段 ${fieldIdCounter}`,
    type: 'input',
    placeholder: '',
    defaultValue: '',
    options: [],
    validationRules: [],
    minLength: 1,
    maxLength: 100,
    pattern: ''
  }
  
  formConfig.value.fields.push(newField)
  updatePreviewForm()
}

// 移除字段
const removeField = (index) => {
  formConfig.value.fields.splice(index, 1)
  updatePreviewForm()
}

// 移动字段
const moveField = (index, direction) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < formConfig.value.fields.length) {
    const field = formConfig.value.fields.splice(index, 1)[0]
    formConfig.value.fields.splice(newIndex, 0, field)
  }
}

// 字段类型变化处理
const onFieldTypeChange = (field) => {
  // 重置类型相关的配置
  if (['select', 'radio', 'checkbox'].includes(field.type)) {
    if (!field.options.length) {
      field.options = [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
    }
  }
  
  // 重置默认值
  field.defaultValue = getDefaultValueForType(field.type)
  updatePreviewForm()
}

// 添加选项
const addOption = (field) => {
  field.options.push({
    label: `选项${field.options.length + 1}`,
    value: `option${field.options.length + 1}`
  })
}

// 移除选项
const removeOption = (field, index) => {
  field.options.splice(index, 1)
}

// 获取字段类型的默认值
const getDefaultValueForType = (type) => {
  const defaults = {
    input: '',
    textarea: '',
    number: 0,
    select: '',
    radio: '',
    checkbox: [],
    date: '',
    switch: false
  }
  return defaults[type] || ''
}

// 获取默认值组件
const getDefaultValueComponent = (type) => {
  const components = {
    input: 'LDesignInput',
    textarea: 'LDesignTextarea',
    number: 'LDesignInputNumber',
    select: 'LDesignSelect',
    radio: 'LDesignRadioGroup',
    checkbox: 'LDesignCheckboxGroup',
    date: 'LDesignDatePicker',
    switch: 'LDesignSwitch'
  }
  return components[type] || 'LDesignInput'
}

// 获取字段组件
const getFieldComponent = (field) => {
  return defineComponent({
    props: ['field', 'form'],
    setup(props) {
      const { field, form } = props
      
      // 构建验证规则
      const rules = []
      
      if (field.validationRules.includes('required')) {
        rules.push({ validator: required(), message: `${field.label}为必填项` })
      }
      
      if (field.validationRules.includes('email')) {
        rules.push({ validator: email(), message: '请输入有效的邮箱地址' })
      }
      
      if (field.validationRules.includes('minLength') && field.minLength) {
        rules.push({ validator: minLength(field.minLength), message: `最少${field.minLength}个字符` })
      }
      
      if (field.validationRules.includes('maxLength') && field.maxLength) {
        rules.push({ validator: maxLength(field.maxLength), message: `最多${field.maxLength}个字符` })
      }
      
      if (field.validationRules.includes('pattern') && field.pattern) {
        try {
          const regex = new RegExp(field.pattern)
          rules.push({ validator: pattern(regex), message: '格式不正确' })
        } catch (e) {
          console.warn('无效的正则表达式:', field.pattern)
        }
      }
      
      return () => h(LDesignFormItem, {
        name: field.name,
        label: field.label,
        rules: rules,
        required: field.validationRules.includes('required')
      }, {
        default: () => {
          const componentMap = {
            input: () => h(LDesignInput, {
              modelValue: form.data.value[field.name],
              'onUpdate:modelValue': (value) => form.setFieldValue(field.name, value),
              placeholder: field.placeholder
            }),
            textarea: () => h(LDesignTextarea, {
              modelValue: form.data.value[field.name],
              'onUpdate:modelValue': (value) => form.setFieldValue(field.name, value),
              placeholder: field.placeholder
            }),
            number: () => h(LDesignInputNumber, {
              modelValue: form.data.value[field.name],
              'onUpdate:modelValue': (value) => form.setFieldValue(field.name, value),
              placeholder: field.placeholder
            }),
            select: () => h(LDesignSelect, {
              modelValue: form.data.value[field.name],
              'onUpdate:modelValue': (value) => form.setFieldValue(field.name, value),
              placeholder: field.placeholder
            }, {
              default: () => field.options.map(option => 
                h(LDesignOption, { value: option.value }, () => option.label)
              )
            }),
            // ... 其他组件类型
          }
          
          return componentMap[field.type]?.() || null
        }
      })
    }
  })
}

// 更新预览表单
const updatePreviewForm = () => {
  const initialValues = {}
  
  formConfig.value.fields.forEach(field => {
    initialValues[field.name] = field.defaultValue
  })
  
  previewForm.setValues(initialValues)
}

// 预览表单提交
const handlePreviewSubmit = (result) => {
  console.log('预览表单提交:', result)
  if (result.valid) {
    alert('表单验证通过！\n' + JSON.stringify(result.data, null, 2))
  }
}

// 预览表单
const previewForm = () => {
  updatePreviewForm()
}

// 导出配置
const exportConfig = () => {
  showExportDialog.value = true
}

// 复制配置
const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(formConfig.value, null, 2))
    alert('配置已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 监听配置变化，自动更新预览
watch(formConfig, updatePreviewForm, { deep: true })
</script>

<style scoped>
.form-builder {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.builder-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.config-panel,
.preview-panel {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}

.field-config {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.field-title {
  font-weight: bold;
  color: #333;
}

.field-actions {
  display: flex;
  gap: 5px;
}

.field-settings {
  padding: 15px;
}

.options-config,
.validation-config {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rule-config {
  margin-top: 10px;
}

.config-export {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 1200px) {
  .builder-content {
    grid-template-columns: 1fr;
  }
}
</style>
```
