// 原生 JavaScript 演示主文件
import { createFormInstance } from '@ldesign/form/vanilla'
import '@ldesign/form/styles/index.css'

// 全局变量
let formInstances = {}
let currentTheme = 'light'

// 初始化应用
function initApp() {
  const app = document.getElementById('app')

  app.innerHTML = `
    <div class="demo-section">
      <h2 class="demo-title">🚀 基础表单演示</h2>
      <p class="demo-description">
        演示基本的表单创建、数据绑定和验证功能。包含用户注册表单的常见字段。
      </p>
      
      <div class="controls">
        <button class="btn btn-primary" onclick="window.demoApp.createBasicForm()">
          创建表单
        </button>
        <button class="btn btn-success" onclick="window.demoApp.fillSampleData('basic')">
          填充示例数据
        </button>
        <button class="btn btn-warning" onclick="window.demoApp.validateForm('basic')">
          验证表单
        </button>
        <button class="btn btn-secondary" onclick="window.demoApp.resetForm('basic')">
          重置表单
        </button>
      </div>
      
      <div id="basic-form-container" class="form-container"></div>
      
      <div class="status-panel">
        <div class="status-title">表单状态</div>
        <div id="basic-status"></div>
      </div>
      
      <div class="data-display">
        <div class="data-title">表单数据</div>
        <div id="basic-data" class="data-content">{}</div>
      </div>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">🎨 高级表单演示</h2>
      <p class="demo-description">
        演示高级功能：条件渲染、自定义验证、动态字段、主题切换等。
      </p>
      
      <div class="controls">
        <button class="btn btn-primary" onclick="window.demoApp.createAdvancedForm()">
          创建高级表单
        </button>
        <button class="btn btn-success" onclick="window.demoApp.addDynamicField()">
          添加动态字段
        </button>
        <button class="btn btn-warning" onclick="window.demoApp.toggleTheme()">
          切换主题 (${currentTheme})
        </button>
        <button class="btn btn-secondary" onclick="window.demoApp.exportFormData('advanced')">
          导出数据
        </button>
      </div>
      
      <div id="advanced-form-container" class="form-container"></div>
      
      <div class="status-panel">
        <div class="status-title">高级表单状态</div>
        <div id="advanced-status"></div>
      </div>
      
      <div class="data-display">
        <div class="data-title">表单数据</div>
        <div id="advanced-data" class="data-content">{}</div>
      </div>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">📊 表单分组演示</h2>
      <p class="demo-description">
        演示表单分组功能，将相关字段组织成逻辑分组，支持分组展开/折叠。
      </p>
      
      <div class="controls">
        <button class="btn btn-primary" onclick="window.demoApp.createGroupedForm()">
          创建分组表单
        </button>
        <button class="btn btn-success" onclick="window.demoApp.toggleGroup('personal')">
          切换个人信息组
        </button>
        <button class="btn btn-warning" onclick="window.demoApp.toggleGroup('contact')">
          切换联系方式组
        </button>
        <button class="btn btn-secondary" onclick="window.demoApp.validateGroup('personal')">
          验证个人信息组
        </button>
      </div>
      
      <div id="grouped-form-container" class="form-container"></div>
      
      <div class="status-panel">
        <div class="status-title">分组表单状态</div>
        <div id="grouped-status"></div>
      </div>
      
      <div class="data-display">
        <div class="data-title">分组数据</div>
        <div id="grouped-data" class="data-content">{}</div>
      </div>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">🔧 API 演示</h2>
      <p class="demo-description">
        演示 @ldesign/form 的完整 API，包括字段操作、状态管理、事件监听等。
      </p>
      
      <div class="controls">
        <button class="btn btn-primary" onclick="window.demoApp.createApiForm()">
          创建 API 演示表单
        </button>
        <button class="btn btn-success" onclick="window.demoApp.showField('description')">
          显示描述字段
        </button>
        <button class="btn btn-warning" onclick="window.demoApp.hideField('description')">
          隐藏描述字段
        </button>
        <button class="btn btn-secondary" onclick="window.demoApp.disableField('email')">
          禁用邮箱字段
        </button>
        <button class="btn btn-danger" onclick="window.demoApp.clearAllData()">
          清空所有数据
        </button>
      </div>
      
      <div id="api-form-container" class="form-container"></div>
      
      <div class="status-panel">
        <div class="status-title">API 操作日志</div>
        <div id="api-log" class="data-content" style="max-height: 200px;"></div>
      </div>
    </div>
  `

  // 暴露全局方法
  window.demoApp = {
    createBasicForm,
    createAdvancedForm,
    createGroupedForm,
    createApiForm,
    fillSampleData,
    validateForm,
    resetForm,
    addDynamicField,
    toggleTheme,
    exportFormData,
    toggleGroup,
    validateGroup,
    showField,
    hideField,
    disableField,
    clearAllData,
  }

  // 自动创建基础表单
  createBasicForm()
}

// 创建基础表单
function createBasicForm() {
  const container = document.getElementById('basic-form-container')

  if (formInstances.basic) {
    formInstances.basic.destroy()
  }

  formInstances.basic = createFormInstance({
    container,
    options: {
      title: '用户注册表单',
      fields: [
        {
          name: 'username',
          title: '用户名',
          component: 'FormInput',
          required: true,
          placeholder: '请输入用户名',
          rules: [
            { type: 'required', message: '用户名不能为空' },
            { type: 'minLength', params: 3, message: '用户名至少3个字符' },
            { type: 'maxLength', params: 20, message: '用户名最多20个字符' },
          ],
        },
        {
          name: 'email',
          title: '邮箱地址',
          component: 'FormInput',
          type: 'email',
          required: true,
          placeholder: '请输入邮箱地址',
          rules: [
            { type: 'required', message: '邮箱不能为空' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ],
        },
        {
          name: 'password',
          title: '密码',
          component: 'FormInput',
          type: 'password',
          required: true,
          placeholder: '请输入密码',
          rules: [
            { type: 'required', message: '密码不能为空' },
            { type: 'minLength', params: 6, message: '密码至少6个字符' },
          ],
        },
        {
          name: 'confirmPassword',
          title: '确认密码',
          component: 'FormInput',
          type: 'password',
          required: true,
          placeholder: '请再次输入密码',
          rules: [
            { type: 'required', message: '请确认密码' },
            {
              type: 'custom',
              validator: (value, formData) => {
                if (value !== formData.password) {
                  return '两次密码输入不一致'
                }
                return true
              },
            },
          ],
        },
        {
          name: 'age',
          title: '年龄',
          component: 'FormInput',
          type: 'number',
          placeholder: '请输入年龄',
          rules: [
            { type: 'min', params: 18, message: '年龄不能小于18岁' },
            { type: 'max', params: 100, message: '年龄不能大于100岁' },
          ],
        },
        {
          name: 'gender',
          title: '性别',
          component: 'FormRadio',
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
            { label: '其他', value: 'other' },
          ],
        },
      ],
      layout: {
        columns: 2,
        horizontalGap: 16,
        verticalGap: 16,
      },
    },
    onChange: data => {
      updateFormStatus('basic')
      updateFormData('basic', data)
    },
    onSubmit: data => {
      alert('基础表单提交成功！\n' + JSON.stringify(data, null, 2))
      logApiAction('基础表单提交', data)
    },
    onValidate: (valid, errors) => {
      logApiAction('基础表单验证', { valid, errors })
    },
  })

  updateFormStatus('basic')
  updateFormData('basic', {})
}

// 更新表单状态显示
function updateFormStatus(formType) {
  const form = formInstances[formType]
  if (!form) return

  const statusContainer = document.getElementById(`${formType}-status`)
  const state = form.getFormState()

  statusContainer.innerHTML = `
    <div class="status-item">
      <span class="status-label">有效:</span>
      <span class="status-value ${
        state.valid ? 'status-true' : 'status-false'
      }">${state.valid}</span>
    </div>
    <div class="status-item">
      <span class="status-label">已修改:</span>
      <span class="status-value ${
        state.dirty ? 'status-true' : 'status-false'
      }">${state.dirty}</span>
    </div>
    <div class="status-item">
      <span class="status-label">已访问:</span>
      <span class="status-value ${
        state.touched ? 'status-true' : 'status-false'
      }">${state.touched}</span>
    </div>
  `
}

// 更新表单数据显示
function updateFormData(formType, data) {
  const dataContainer = document.getElementById(`${formType}-data`)
  if (dataContainer) {
    dataContainer.textContent = JSON.stringify(data, null, 2)
  }
}

// 填充示例数据
function fillSampleData(formType) {
  const form = formInstances[formType]
  if (!form) return

  const sampleData = {
    basic: {
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: '123456',
      confirmPassword: '123456',
      age: 25,
      gender: 'male',
    },
    advanced: {
      name: '张三',
      email: 'zhangsan@example.com',
      hasJob: true,
      company: '科技有限公司',
      skills: ['JavaScript', 'Vue.js'],
      bio: '这是一个示例的个人简介。',
    },
  }

  form.setFormData(sampleData[formType] || {})
  updateFormStatus(formType)
  logApiAction(`填充${formType}表单示例数据`, sampleData[formType])
}

// 验证表单
function validateForm(formType) {
  const form = formInstances[formType]
  if (!form) return

  form.validate().then(valid => {
    const message = valid ? '表单验证通过！' : '表单验证失败，请检查错误信息。'
    alert(message)
    updateFormStatus(formType)
    logApiAction(`验证${formType}表单`, { valid })
  })
}

// 重置表单
function resetForm(formType) {
  const form = formInstances[formType]
  if (!form) return

  form.reset()
  updateFormStatus(formType)
  updateFormData(formType, {})
  logApiAction(`重置${formType}表单`)
}

// 记录 API 操作日志
function logApiAction(action, data = null) {
  const logContainer = document.getElementById('api-log')
  if (!logContainer) return

  const timestamp = new Date().toLocaleTimeString()
  const logEntry = `[${timestamp}] ${action}`
  const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : ''

  logContainer.textContent =
    logEntry + dataStr + '\n\n' + logContainer.textContent
}

// 其他演示方法的占位符
function createAdvancedForm() {
  logApiAction('创建高级表单')
  alert('高级表单功能正在开发中...')
}

function createGroupedForm() {
  logApiAction('创建分组表单')
  alert('分组表单功能正在开发中...')
}

function createApiForm() {
  logApiAction('创建API演示表单')
  alert('API演示表单功能正在开发中...')
}

function addDynamicField() {
  logApiAction('添加动态字段')
  alert('动态字段功能正在开发中...')
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light'
  logApiAction('切换主题', { theme: currentTheme })
  alert(`已切换到${currentTheme}主题`)
}

function exportFormData(formType) {
  const form = formInstances[formType]
  if (!form) return

  const data = form.getFormData()
  const dataStr = JSON.stringify(data, null, 2)

  // 创建下载链接
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${formType}-form-data.json`
  a.click()
  URL.revokeObjectURL(url)

  logApiAction(`导出${formType}表单数据`, data)
}

function toggleGroup(groupName) {
  logApiAction('切换分组', { group: groupName })
  alert(`切换分组: ${groupName}`)
}

function validateGroup(groupName) {
  logApiAction('验证分组', { group: groupName })
  alert(`验证分组: ${groupName}`)
}

function showField(fieldName) {
  const form = formInstances.api
  if (form) {
    form.showField(fieldName)
    logApiAction('显示字段', { field: fieldName })
  }
}

function hideField(fieldName) {
  const form = formInstances.api
  if (form) {
    form.hideField(fieldName)
    logApiAction('隐藏字段', { field: fieldName })
  }
}

function disableField(fieldName) {
  const form = formInstances.api
  if (form) {
    form.disableField(fieldName)
    logApiAction('禁用字段', { field: fieldName })
  }
}

function clearAllData() {
  Object.keys(formInstances).forEach(key => {
    if (formInstances[key]) {
      formInstances[key].clear()
    }
  })
  logApiAction('清空所有表单数据')
  alert('已清空所有表单数据')
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp)
