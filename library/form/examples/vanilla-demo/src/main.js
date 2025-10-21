import { createForm } from '../../../src/core/form-core'
import '../../../src/styles/index.less'
import './style.css'

console.log('🚀 LDesign Form Vanilla Demo 启动...')

// 1. 注册表单
const registerForm = createForm({
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  },
  fields: [
    {
      name: 'username',
      label: '用户名',
      rules: [
        { type: 'required', message: '请输入用户名' },
        { type: 'minLength', params: { value: 3 }, message: '至少3个字符' }
      ]
    },
    {
      name: 'email',
      label: '邮箱',
      rules: [
        { type: 'required', message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' }
      ]
    },
    {
      name: 'password',
      label: '密码',
      rules: [
        { type: 'required', message: '请输入密码' },
        { type: 'minLength', params: { value: 6 }, message: '至少6个字符' }
      ]
    },
    {
      name: 'confirmPassword',
      label: '确认密码',
      rules: [
        { type: 'required', message: '请再次输入密码' },
        {
          type: 'custom',
          validator: (value, values) => value === values.password,
          message: '两次密码输入不一致'
        }
      ]
    }
  ],
  onSubmit: async (values) => {
    console.log('注册提交:', values)
    alert('注册成功！\n' + JSON.stringify(values, null, 2))
  }
})

// 渲染注册表单
renderRegisterForm(registerForm)

// 2. 查询表单
const queryForm = createForm({
  initialValues: {
    keyword: '',
    category: '',
    status: '',
    author: '',
    startDate: '',
    endDate: ''
  },
  layout: {
    spanWidth: 200,
    maxSpan: 3,
    space: 16,
    gap: 8,
    labelAlign: 'right'
  },
  button: {
    buttonPosition: 'inline',
    buttonAlign: 'right'
  },
  expand: {
    previewRows: 1,
    defaultExpanded: false
  },
  onSubmit: (values) => {
    console.log('查询提交:', values)
    displayQueryResult(values)
  },
  onReset: () => {
    console.log('查询重置')
    document.getElementById('query-result').innerHTML = ''
  }
})

// 渲染查询表单
renderQueryForm(queryForm)

// 主题切换
document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  document.getElementById('theme-toggle').textContent = 
    next === 'dark' ? '切换到浅色' : '切换到深色'
})

// 渲染注册表单
function renderRegisterForm(form) {
  const container = document.getElementById('register-form')
  
  const html = `
    <div class="form">
      ${createFormItem('username', '用户名', 'text', '请输入用户名', true)}
      ${createFormItem('email', '邮箱', 'email', '请输入邮箱', true)}
      ${createFormItem('password', '密码', 'password', '请输入密码', true)}
      ${createFormItem('confirmPassword', '确认密码', 'password', '请再次输入密码', true)}
      
      <div class="form-buttons">
        <button id="register-submit" class="btn btn-primary">注册</button>
        <button id="register-reset" class="btn">重置</button>
      </div>
      
      <div class="form-state">
        <h4>表单状态</h4>
        <ul>
          <li>是否有效: <span id="register-valid">-</span></li>
          <li>是否修改: <span id="register-dirty">否</span></li>
          <li>错误数量: <span id="register-errors">0</span></li>
        </ul>
      </div>
    </div>
  `
  
  container.innerHTML = html
  
  // 绑定事件
  bindFormEvents(form, 'register', ['username', 'email', 'password', 'confirmPassword'])
}

// 渲染查询表单
function renderQueryForm(form) {
  const container = document.getElementById('query-form')
  
  const html = `
    <div class="form query-form">
      ${createFormItem('keyword', '关键词', 'text', '请输入关键词')}
      ${createFormItem('category', '分类', 'select', '', false, [
        { label: '全部', value: '' },
        { label: '技术', value: 'tech' },
        { label: '产品', value: 'product' }
      ])}
      ${createFormItem('status', '状态', 'select', '', false, [
        { label: '全部', value: '' },
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' }
      ])}
      ${createFormItem('author', '作者', 'text', '请输入作者')}
      ${createFormItem('startDate', '开始日期', 'date', '')}
      ${createFormItem('endDate', '结束日期', 'date', '')}
      
      <div class="form-buttons">
        <button id="query-submit" class="btn btn-primary">查询</button>
        <button id="query-reset" class="btn">重置</button>
        <button id="query-expand" class="btn">展开</button>
      </div>
      
      <div id="query-result" class="result-display"></div>
    </div>
  `
  
  container.innerHTML = html
  
  // 绑定事件
  bindFormEvents(form, 'query', ['keyword', 'category', 'status', 'author', 'startDate', 'endDate'])
  
  // 展开按钮
  document.getElementById('query-expand').addEventListener('click', () => {
    form.toggleExpand()
    const btn = document.getElementById('query-expand')
    btn.textContent = form.isExpanded() ? '收起' : '展开'
  })
}

// 创建表单项
function createFormItem(name, label, type = 'text', placeholder = '', required = false, options = null) {
  if (type === 'select' && options) {
    return `
      <div class="form-item">
        <label class="form-label">
          ${required ? '<span class="required">*</span>' : ''}
          ${label}
        </label>
        <select id="${name}" class="form-input">
          ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
        </select>
        <span id="${name}-error" class="error-message"></span>
      </div>
    `
  }
  
  return `
    <div class="form-item">
      <label class="form-label">
        ${required ? '<span class="required">*</span>' : ''}
        ${label}
      </label>
      <input
        type="${type}"
        id="${name}"
        class="form-input"
        placeholder="${placeholder}"
      />
      <span id="${name}-error" class="error-message"></span>
    </div>
  `
}

// 绑定表单事件
function bindFormEvents(form, formId, fields) {
  fields.forEach(field => {
    const input = document.getElementById(field)
    const errorEl = document.getElementById(`${field}-error`)
    
    if (!input) return
    
    // 值变更
    input.addEventListener('input', (e) => {
      form.setFieldValue(field, e.target.value)
    })
    
    // 失焦验证
    input.addEventListener('blur', async () => {
      await form.validateField(field)
      const state = form.getFieldState(field)
      
      if (state && state.errors.length > 0) {
        errorEl.textContent = state.errors[0]
        errorEl.style.display = 'block'
      } else {
        errorEl.style.display = 'none'
      }
    })
  })
  
  // 提交按钮
  const submitBtn = document.getElementById(`${formId}-submit`)
  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true
      submitBtn.textContent = '提交中...'
      
      try {
        await form.submit()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = formId === 'query' ? '查询' : '注册'
      }
    })
  }
  
  // 重置按钮
  const resetBtn = document.getElementById(`${formId}-reset`)
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset()
      fields.forEach(field => {
        const input = document.getElementById(field)
        const errorEl = document.getElementById(`${field}-error`)
        if (input) input.value = ''
        if (errorEl) errorEl.style.display = 'none'
      })
    })
  }
  
  // 监听状态变更
  form.on('state:change', () => {
    const state = form.getFormState()
    const validEl = document.getElementById(`${formId}-valid`)
    const dirtyEl = document.getElementById(`${formId}-dirty`)
    const errorsEl = document.getElementById(`${formId}-errors`)
    
    if (validEl) validEl.textContent = state.valid ? '✅' : '❌'
    if (dirtyEl) dirtyEl.textContent = state.dirty ? '是' : '否'
    if (errorsEl) errorsEl.textContent = state.errorCount
  })
}

// 显示查询结果
function displayQueryResult(values) {
  const resultEl = document.getElementById('query-result')
  resultEl.innerHTML = `
    <h3>✅ 查询结果</h3>
    <pre>${JSON.stringify(values, null, 2)}</pre>
  `
  resultEl.style.display = 'block'
}

console.log('✅ LDesign Form 示例加载完成!')


