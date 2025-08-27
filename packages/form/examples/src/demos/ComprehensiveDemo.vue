<!--
综合演示 - 展示 LemonForm 的所有核心功能
-->

<template>
  <div class="comprehensive-demo">
    <div class="demo-header">
      <h2>🎯 LemonForm 综合功能演示</h2>
      <p>这个演示展示了 LemonForm 的所有核心功能，包括各种字段类型、验证、布局、条件渲染等。</p>
    </div>

    <div class="demo-controls">
      <div class="control-group">
        <label>
          <input v-model="showDebug" type="checkbox" />
          显示调试面板
        </label>
        <label>
          <input v-model="enableValidation" type="checkbox" />
          启用实时验证
        </label>
        <label>
          <input v-model="responsiveLayout" type="checkbox" />
          响应式布局
        </label>
      </div>
      <div class="control-actions">
        <button @click="fillSampleData" class="btn btn-secondary">
          填充示例数据
        </button>
        <button @click="clearForm" class="btn btn-secondary">
          清空表单
        </button>
        <button @click="validateForm" class="btn btn-primary">
          手动验证
        </button>
      </div>
    </div>

    <div class="demo-content">
      <div class="form-section">
        <h3>🍋 用户注册表单</h3>
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

      <div class="info-section">
        <div class="form-status">
          <h4>📊 表单状态</h4>
          <div class="status-grid">
            <div class="status-item">
              <span class="label">表单有效:</span>
              <span :class="['value', formState.isValid ? 'success' : 'error']">
                {{ formState.isValid ? '✅ 是' : '❌ 否' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">脏数据:</span>
              <span :class="['value', formState.isDirty ? 'warning' : 'normal']">
                {{ formState.isDirty ? '⚠️ 是' : '✨ 否' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">提交中:</span>
              <span :class="['value', formState.isSubmitting ? 'info' : 'normal']">
                {{ formState.isSubmitting ? '🔄 是' : '⏸️ 否' }}
              </span>
            </div>
            <div class="status-item">
              <span class="label">字段数量:</span>
              <span class="value normal">{{ visibleFieldCount }}</span>
            </div>
          </div>
        </div>

        <div class="form-data">
          <h4>📋 表单数据</h4>
          <pre class="data-display">{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>

        <div class="event-log">
          <h4>📝 事件日志</h4>
          <div class="log-container">
            <div
              v-for="(event, index) in eventLog"
              :key="index"
              :class="['log-item', `log-${event.type}`]"
            >
              <span class="log-time">{{ event.time }}</span>
              <span class="log-type">{{ event.type }}</span>
              <span class="log-message">{{ event.message }}</span>
            </div>
          </div>
          <button @click="clearLog" class="btn btn-sm">清空日志</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DynamicForm from '../components/DynamicForm.vue'

// 表单数据
const formData = ref({})

// 控制选项
const showDebug = ref(false)
const enableValidation = ref(true)
const responsiveLayout = ref(true)

// 表单状态
const formState = reactive({
  isValid: true,
  isDirty: false,
  isSubmitting: false,
  fieldCount: 0
})

// 事件日志
const eventLog = ref<Array<{ time: string; type: string; message: string }>>([])

// 计算可见字段数量
const visibleFieldCount = computed(() => {
  return formConfig.value.fields.filter(field => !field.hidden).length
})

// 动态表单配置
const formConfig = computed(() => ({
  fields: [
    // 基本信息组
    {
      type: 'group',
      name: 'basic',
      title: '👤 基本信息',
      description: '请填写您的基本个人信息',
      fields: [
        {
          type: 'input',
          name: 'username',
          label: '用户名',
          component: 'input',
          required: true,
          placeholder: '请输入用户名',
          help: '用户名将用于登录，3-20个字符',
          rules: enableValidation.value ? [
            { type: 'required', message: '用户名不能为空' },
            { type: 'minLength', value: 3, message: '用户名至少3个字符' },
            { type: 'maxLength', value: 20, message: '用户名最多20个字符' },
            { type: 'pattern', value: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' }
          ] : []
        },
        {
          type: 'input',
          name: 'email',
          label: '邮箱地址',
          component: 'input',
          required: true,
          placeholder: '请输入邮箱地址',
          help: '用于接收重要通知',
          rules: enableValidation.value ? [
            { type: 'required', message: '邮箱不能为空' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ] : []
        },
        {
          type: 'input',
          name: 'phone',
          label: '手机号码',
          component: 'input',
          placeholder: '请输入手机号码',
          rules: enableValidation.value ? [
            { type: 'phone', message: '请输入有效的手机号码' }
          ] : []
        }
      ]
    },

    // 账户设置组
    {
      type: 'group',
      name: 'account',
      title: '🔐 账户设置',
      fields: [
        {
          type: 'input',
          name: 'password',
          label: '密码',
          component: 'input',
          required: true,
          placeholder: '请输入密码',
          props: { type: 'password' },
          rules: enableValidation.value ? [
            { type: 'required', message: '密码不能为空' },
            { type: 'minLength', value: 6, message: '密码至少6个字符' }
          ] : []
        },
        {
          type: 'input',
          name: 'confirmPassword',
          label: '确认密码',
          component: 'input',
          required: true,
          placeholder: '请再次输入密码',
          props: { type: 'password' },
          rules: enableValidation.value ? [
            { type: 'required', message: '请确认密码' },
            {
              type: 'custom',
              validator: (value: string, rule: any, formData: any) => {
                return value === formData.password ? true : '两次输入的密码不一致'
              }
            }
          ] : []
        }
      ]
    },

    // 个人资料组
    {
      type: 'group',
      name: 'profile',
      title: '📝 个人资料',
      fields: [
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
          type: 'date-picker',
          name: 'birthDate',
          label: '出生日期',
          component: 'date-picker',
          placeholder: '请选择出生日期'
        },
        {
          type: 'radio',
          name: 'education',
          label: '学历',
          component: 'radio',
          props: {
            options: [
              { label: '高中及以下', value: 'high_school' },
              { label: '大专', value: 'college' },
              { label: '本科', value: 'bachelor' },
              { label: '硕士', value: 'master' },
              { label: '博士', value: 'doctor' }
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
              { label: '阅读', value: 'reading' },
              { label: '旅行', value: 'travel' },
              { label: '摄影', value: 'photography' }
            ]
          }
        }
      ]
    },

    // 偏好设置组
    {
      type: 'group',
      name: 'preferences',
      title: '⚙️ 偏好设置',
      fields: [
        {
          type: 'switch',
          name: 'newsletter',
          label: '订阅邮件',
          component: 'switch',
          help: '接收产品更新和优惠信息',
          defaultValue: true
        },
        {
          type: 'switch',
          name: 'notifications',
          label: '推送通知',
          component: 'switch',
          help: '接收系统通知',
          defaultValue: false
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
        }
      ]
    },

    // 操作按钮
    {
      type: 'actions',
      buttons: [
        { type: 'submit', text: '🚀 立即注册', variant: 'primary' },
        { type: 'reset', text: '🔄 重置表单', variant: 'secondary' }
      ]
    }
  ],
  layout: {
    type: 'grid',
    columns: responsiveLayout.value ? 2 : 1,
    gap: 20,
    responsive: responsiveLayout.value ? {
      enabled: true,
      breakpoints: {
        xs: { value: 0, name: 'xs', columns: 1 },
        sm: { value: 576, name: 'sm', columns: 1 },
        md: { value: 768, name: 'md', columns: 2 },
        lg: { value: 992, name: 'lg', columns: 2 }
      }
    } : undefined
  },
  validation: {
    enabled: enableValidation.value,
    trigger: 'change',
    showStatus: true,
    showMessage: true
  }
}))

// 添加事件日志
const addLog = (type: string, message: string) => {
  eventLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
  
  // 限制日志数量
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

// 事件处理
const handleSubmit = (data: any) => {
  addLog('submit', `表单提交成功，数据: ${JSON.stringify(data)}`)
  formState.isSubmitting = true
  
  // 模拟提交过程
  setTimeout(() => {
    formState.isSubmitting = false
    alert('🎉 注册成功！欢迎加入 LemonForm 社区！')
  }, 2000)
}

const handleReset = () => {
  addLog('reset', '表单已重置')
  formData.value = {}
  formState.isDirty = false
}

const handleFieldChange = (event: any) => {
  addLog('field-change', `字段 ${event.field} 值变更为: ${event.value}`)
  formState.isDirty = true
}

const handleValidation = (result: any) => {
  addLog('validation', `验证结果: ${result.valid ? '通过' : '失败'}`)
  formState.isValid = result.valid
}

// 控制方法
const fillSampleData = () => {
  formData.value = {
    username: 'lemon_user',
    email: 'user@lemonform.com',
    phone: '13800138000',
    password: 'password123',
    confirmPassword: 'password123',
    gender: 'male',
    birthDate: '1990-01-01',
    education: 'bachelor',
    interests: ['programming', 'music', 'reading'],
    newsletter: true,
    notifications: false,
    bio: '我是一名前端开发工程师，热爱编程和开源技术。对 Vue.js 和表单设计有浓厚兴趣。'
  }
  addLog('action', '已填充示例数据')
}

const clearForm = () => {
  formData.value = {}
  addLog('action', '已清空表单')
}

const validateForm = () => {
  addLog('action', '手动触发表单验证')
  // 这里可以调用表单验证方法
}

const clearLog = () => {
  eventLog.value = []
}

// 监听配置变化
watch([enableValidation, responsiveLayout], () => {
  addLog('config', '表单配置已更新')
})
</script>

<style scoped>
.comprehensive-demo {
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
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.control-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.control-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.control-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
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
  background: white;
  color: #666;
  border-color: #ddd;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.demo-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
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
  font-size: 1.5rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-status,
.form-data,
.event-log {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-status h4,
.form-data h4,
.event-log h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1rem;
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

.data-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  overflow: auto;
  max-height: 300px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 10px;
}

.log-item {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  font-family: monospace;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #666;
  margin-right: 10px;
  min-width: 80px;
}

.log-type {
  font-weight: bold;
  margin-right: 10px;
  min-width: 100px;
}

.log-message {
  flex: 1;
  word-break: break-all;
}

.log-submit {
  background: #e7f5e7;
}

.log-reset {
  background: #fff3cd;
}

.log-field-change {
  background: #e7f3ff;
}

.log-validation {
  background: #f8d7da;
}

.log-action {
  background: #e2e3e5;
}

.log-config {
  background: #d4edda;
}

@media (max-width: 1200px) {
  .demo-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .demo-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    justify-content: center;
  }

  .control-actions {
    justify-content: center;
  }

  .demo-header h2 {
    font-size: 1.5rem;
  }

  .demo-header p {
    font-size: 1rem;
  }
}
</style>
