/**
 * 原生JavaScript示例主文件
 * 演示自适应表单布局系统的各种功能
 */

// 模拟表单管理器类（实际使用时应该从包中导入）
class AdaptiveFormManager {
  constructor(config, container) {
    this.config = config
    this.container = container
    this.values = {}
    this.errors = {}
    this.expanded = false
    this.modalOpen = false
    this.eventListeners = new Map()
    this.renderCount = 0

    this.render()
  }

  render() {
    if (!this.container)
      return

    const startTime = performance.now()
    this.container.innerHTML = ''
    this.container.classList.add('active')

    // 创建表单网格
    const formGrid = document.createElement('div')
    formGrid.className = 'adaptive-form'

    // 计算列数
    const containerWidth = this.container.offsetWidth
    const columns = Math.max(1, Math.min(4, Math.floor(containerWidth / 250)))
    formGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`

    // 渲染可见表单项
    const visibleItems = this.getVisibleItems()
    visibleItems.forEach((item) => {
      const formItem = this.createFormItem(item)
      formGrid.appendChild(formItem)
    })

    this.container.appendChild(formGrid)

    // 渲染展开按钮
    if (this.needsExpandButton()) {
      const expandButton = this.createExpandButton()
      this.container.appendChild(expandButton)
    }

    const endTime = performance.now()
    this.renderCount++

    this.emit('render', {
      itemCount: visibleItems.length,
      columns,
      renderTime: endTime - startTime,
    })
  }

  createFormItem(item) {
    const div = document.createElement('div')
    div.className = `form-item ${this.errors[item.key] ? 'error' : ''}`

    const label = document.createElement('label')
    label.textContent = `${item.label}${item.required ? ' *' : ''}`

    let input
    switch (item.type) {
      case 'textarea':
        input = document.createElement('textarea')
        input.rows = 3
        break
      case 'select':
        input = document.createElement('select')
        if (item.options) {
          item.options.forEach((option) => {
            const optionEl = document.createElement('option')
            optionEl.value = option.value
            optionEl.textContent = option.label
            input.appendChild(optionEl)
          })
        }
        break
      default:
        input = document.createElement('input')
        input.type = item.type || 'text'
    }

    input.name = item.key
    input.value = this.values[item.key] || ''
    input.placeholder = item.placeholder || ''
    if (item.required)
      input.required = true

    // 添加事件监听
    input.addEventListener('input', (e) => {
      this.setValue(item.key, e.target.value)
    })

    input.addEventListener('blur', () => {
      if (this.config.validation?.validateOnBlur) {
        this.validate(item.key)
      }
    })

    div.appendChild(label)
    div.appendChild(input)

    // 添加错误信息
    if (this.errors[item.key]) {
      const errorDiv = document.createElement('div')
      errorDiv.className = 'form-item-error'
      errorDiv.textContent = this.errors[item.key]
      div.appendChild(errorDiv)
    }

    return div
  }

  createExpandButton() {
    const button = document.createElement('div')
    button.className = 'expand-button'

    const hiddenCount = this.config.items.length - this.getVisibleItems().length
    button.innerHTML = `
            <span>${this.expanded ? '收起' : '展开更多'}</span>
            <span>(${hiddenCount})</span>
            <span>${this.expanded ? '▲' : '▼'}</span>
        `

    button.addEventListener('click', () => {
      this.toggle()
    })

    return button
  }

  getVisibleItems() {
    const threshold = this.config.behavior?.expandThreshold || 4
    if (this.expanded) {
      return this.config.items
    }
    return this.config.items.slice(0, threshold)
  }

  needsExpandButton() {
    const threshold = this.config.behavior?.expandThreshold || 4
    return this.config.items.length > threshold && this.config.display?.showExpandButton !== false
  }

  setValue(key, value) {
    this.values[key] = value

    // 实时验证
    if (this.config.validation?.validateOnChange) {
      this.validate(key)
    }

    this.emit('change', { key, value })
  }

  getValue(key) {
    return key ? this.values[key] : { ...this.values }
  }

  validate(key) {
    const errors = []
    const items = key ? [this.config.items.find(item => item.key === key)] : this.config.items

    items.forEach((item) => {
      if (!item)
        return

      const value = this.values[item.key]

      // 必填验证
      if (item.required && (!value || value.trim() === '')) {
        errors.push(`${item.label}是必填项`)
        this.errors[item.key] = `${item.label}是必填项`
      }
      else {
        delete this.errors[item.key]
      }

      // 邮箱验证
      if (item.type === 'email' && value && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value)) {
        errors.push(`${item.label}格式不正确`)
        this.errors[item.key] = `${item.label}格式不正确`
      }

      // 电话验证
      if (item.type === 'tel' && value && !/^1[3-9]\d{9}$/.test(value)) {
        errors.push(`${item.label}格式不正确`)
        this.errors[item.key] = `${item.label}格式不正确`
      }
    })

    this.render()
    this.emit('validation', { errors, valid: errors.length === 0 })

    return { valid: errors.length === 0, errors }
  }

  reset() {
    this.values = {}
    this.errors = {}
    this.render()
    this.emit('reset')
  }

  expand() {
    this.expanded = true
    this.render()
    this.emit('expand', { expanded: true })
  }

  collapse() {
    this.expanded = false
    this.render()
    this.emit('expand', { expanded: false })
  }

  toggle() {
    if (this.expanded) {
      this.collapse()
    }
    else {
      this.expand()
    }
  }

  async openModal() {
    this.modalOpen = true
    this.emit('modal', { open: true })

    // 模拟弹窗
    const hiddenItems = this.config.items.slice(this.config.behavior?.expandThreshold || 4)
    const modalContent = hiddenItems.map(item =>
      `${item.label}: ${this.values[item.key] || '(空)'}`,
    ).join('\n')

    const result = confirm(`弹窗模式演示\n\n隐藏的表单项:\n${modalContent}\n\n点击确定保存，取消忽略`)

    if (result) {
      this.emit('modal', { open: false, action: 'confirm' })
    }
    else {
      this.emit('modal', { open: false, action: 'cancel' })
    }

    this.modalOpen = false
  }

  async closeModal() {
    this.modalOpen = false
    this.emit('modal', { open: false })
  }

  updateConfig(config) {
    this.config = { ...this.config, ...config }
    this.render()
  }

  isValid() {
    return Object.keys(this.errors).length === 0
  }

  isDirty() {
    return Object.keys(this.values).length > 0
  }

  getState() {
    return {
      values: this.values,
      errors: this.errors,
      expanded: this.expanded,
      modalOpen: this.modalOpen,
    }
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event).add(handler)

    return () => {
      const handlers = this.eventListeners.get(event)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

  emit(event, data) {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        }
        catch (error) {
          console.error(`Error in event handler for "${event}":`, error)
        }
      })
    }
  }

  destroy() {
    this.eventListeners.clear()
    if (this.container) {
      this.container.innerHTML = ''
      this.container.classList.remove('active')
    }
  }
}

// 全局状态
const formInstances = new Map()
const performanceMetrics = {
  renderCount: 0,
  totalRenderTime: 0,
  formCount: 0,
  eventCount: 0,
  validationCount: 0,
  startTime: Date.now(),
}

// 预定义的表单配置
const formConfigs = {
  basic: {
    items: [
      { key: 'name', label: '姓名', type: 'text', required: true, placeholder: '请输入您的姓名' },
      { key: 'email', label: '邮箱', type: 'email', required: true, placeholder: '请输入邮箱地址' },
      { key: 'phone', label: '电话', type: 'tel', placeholder: '请输入手机号码' },
      { key: 'company', label: '公司', type: 'text', placeholder: '请输入公司名称' },
      { key: 'position', label: '职位', type: 'text', placeholder: '请输入职位' },
    ],
    behavior: { expandThreshold: 3 },
    validation: { validateOnChange: true, validateOnBlur: true },
  },

  expand: {
    items: [
      { key: 'name', label: '姓名', type: 'text', required: true },
      { key: 'email', label: '邮箱', type: 'email', required: true },
      { key: 'phone', label: '电话', type: 'tel' },
      { key: 'company', label: '公司', type: 'text' },
      { key: 'position', label: '职位', type: 'text' },
      { key: 'department', label: '部门', type: 'text' },
      { key: 'address', label: '地址', type: 'text' },
      { key: 'website', label: '网站', type: 'url' },
      { key: 'notes', label: '备注', type: 'textarea' },
    ],
    behavior: { expandThreshold: 4 },
    display: { expandMode: 'inline', showExpandButton: true },
    validation: { validateOnChange: true },
  },

  validation: {
    items: [
      { key: 'username', label: '用户名', type: 'text', required: true, placeholder: '请输入用户名' },
      { key: 'password', label: '密码', type: 'password', required: true, placeholder: '请输入密码' },
      { key: 'email', label: '邮箱', type: 'email', required: true, placeholder: '请输入邮箱' },
      { key: 'phone', label: '手机号', type: 'tel', required: true, placeholder: '请输入手机号' },
      { key: 'age', label: '年龄', type: 'number', placeholder: '请输入年龄' },
      { key: 'website', label: '个人网站', type: 'url', placeholder: '请输入网站地址' },
    ],
    behavior: { expandThreshold: 6 },
    validation: { validateOnChange: true, validateOnBlur: true },
  },
}

// 工具函数
function updateStatus(id, message, type = 'info') {
  const statusEl = document.getElementById(`${id}-status`)
  if (statusEl) {
    statusEl.textContent = message
    statusEl.className = `status status-${type}`
  }
}

function animateElement(element, className = 'fade-in') {
  element.classList.add(className)
  setTimeout(() => element.classList.remove(className), 500)
}

// 全局函数 - 基础表单
window.initBasicForm = () => {
  const container = document.getElementById('basic-form')
  const config = formConfigs.basic

  if (formInstances.has('basic')) {
    formInstances.get('basic').destroy()
  }

  const form = new AdaptiveFormManager(config, container)
  formInstances.set('basic', form)

  // 事件监听
  form.on('render', (data) => {
    updateStatus('basic', `表单已渲染 - ${data.itemCount}个字段，${data.columns}列布局`, 'success')
    performanceMetrics.renderCount++
    performanceMetrics.totalRenderTime += data.renderTime
    performanceMetrics.formCount = formInstances.size
    animateElement(container)
  })

  form.on('change', (data) => {
    updateStatus('basic', `字段 "${data.key}" 已更新`, 'info')
    performanceMetrics.eventCount++
  })
}

window.resizeContainer = (formId, width) => {
  const container = document.getElementById(`${formId}-form`)
  if (container) {
    container.style.width = `${width}px`
    container.style.transition = 'width 0.3s ease'

    // 触发重新渲染
    const form = formInstances.get(formId)
    if (form) {
      setTimeout(() => form.render(), 100)
    }

    updateStatus(formId, `容器宽度已调整为 ${width}px`, 'info')
  }
}

window.addRandomField = (formId) => {
  const form = formInstances.get(formId)
  if (form) {
    const randomFields = [
      { key: 'birthday', label: '生日', type: 'date' },
      { key: 'gender', label: '性别', type: 'select', options: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
      ] },
      { key: 'hobby', label: '爱好', type: 'text' },
      { key: 'education', label: '学历', type: 'select', options: [
        { value: 'bachelor', label: '本科' },
        { value: 'master', label: '硕士' },
        { value: 'doctor', label: '博士' },
      ] },
      { key: 'experience', label: '工作经验', type: 'textarea' },
    ]

    const randomField = randomFields[Math.floor(Math.random() * randomFields.length)]
    randomField.key = `${randomField.key}_${Date.now()}`

    form.config.items.push(randomField)
    form.render()

    updateStatus(formId, `已添加字段: ${randomField.label}`, 'success')
  }
}

// 全局函数 - 展开收起表单
window.initExpandForm = () => {
  const container = document.getElementById('expand-form')
  const config = formConfigs.expand

  if (formInstances.has('expand')) {
    formInstances.get('expand').destroy()
  }

  const form = new AdaptiveFormManager(config, container)
  formInstances.set('expand', form)

  form.on('render', (data) => {
    updateStatus('expand', `展开收起表单已渲染 - ${data.itemCount}/${form.config.items.length}个字段可见`, 'success')
    animateElement(container)
  })

  form.on('expand', (data) => {
    updateStatus('expand', `表单已${data.expanded ? '展开' : '收起'}`, 'success')
    performanceMetrics.eventCount++
  })

  form.on('modal', (data) => {
    if (data.action) {
      updateStatus('expand', `弹窗已${data.action === 'confirm' ? '确认' : '取消'}`, 'info')
    }
    else {
      updateStatus('expand', `弹窗已${data.open ? '打开' : '关闭'}`, 'info')
    }
    performanceMetrics.eventCount++
  })
}

window.toggleExpand = (formId) => {
  const form = formInstances.get(formId)
  if (form) {
    form.toggle()
  }
}

window.switchToModal = (formId) => {
  const form = formInstances.get(formId)
  if (form) {
    form.updateConfig({
      display: { expandMode: 'modal', showExpandButton: true },
    })
    updateStatus(formId, '已切换到弹窗模式', 'info')
  }
}

window.openModal = (formId) => {
  const form = formInstances.get(formId)
  if (form) {
    form.openModal()
  }
}

// 全局函数 - 验证表单
window.initValidationForm = () => {
  const container = document.getElementById('validation-form')
  const config = formConfigs.validation

  if (formInstances.has('validation')) {
    formInstances.get('validation').destroy()
  }

  const form = new AdaptiveFormManager(config, container)
  formInstances.set('validation', form)

  form.on('render', (data) => {
    updateStatus('validation', `验证表单已渲染 - ${data.itemCount}个字段`, 'success')
    animateElement(container)
  })

  form.on('validation', (data) => {
    const status = data.valid ? 'success' : 'error'
    const message = data.valid
      ? '✅ 表单验证通过'
      : `❌ 发现 ${data.errors.length} 个错误`
    updateStatus('validation', message, status)
    performanceMetrics.validationCount++
  })

  form.on('change', (data) => {
    performanceMetrics.eventCount++
  })
}

window.validateForm = (formId) => {
  const form = formInstances.get(formId)
  if (form) {
    form.validate()
  }
}

window.fillValidData = (formId) => {
  const form = formInstances.get(formId)
  if (form) {
    const validData = {
      username: 'testuser',
      password: '123456',
      email: 'test@example.com',
      phone: '13800138000',
      age: '25',
      website: 'https://example.com',
    }

    Object.entries(validData).forEach(([key, value]) => {
      form.setValue(key, value)
    })

    form.render()
    updateStatus(formId, '✨ 已填入有效数据', 'success')
  }
}

window.clearForm = (formId) => {
  const form = formInstances.get(formId)
  if (form) {
    form.reset()
    updateStatus(formId, '🗑️ 表单已清空', 'info')
  }
}

// 全局函数 - 分组表单
window.initGroupForm = () => {
  const container = document.getElementById('group-form')

  // 创建分组表单HTML
  container.innerHTML = `
        <div class="form-group" data-group="basic">
            <div class="form-group-header" onclick="toggleGroup('group', 'basic')">
                <span class="group-icon">▼</span>
                <span class="group-title">👤 基本信息</span>
                <span class="group-count">3</span>
            </div>
            <div class="form-group-content" id="group-basic">
                <div class="adaptive-form" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                    <div class="form-item">
                        <label>姓名 *</label>
                        <input type="text" placeholder="请输入姓名" required>
                    </div>
                    <div class="form-item">
                        <label>年龄</label>
                        <input type="number" placeholder="请输入年龄">
                    </div>
                    <div class="form-item">
                        <label>性别</label>
                        <select>
                            <option value="">请选择</option>
                            <option value="male">男</option>
                            <option value="female">女</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group" data-group="contact">
            <div class="form-group-header" onclick="toggleGroup('group', 'contact')">
                <span class="group-icon">▼</span>
                <span class="group-title">📞 联系方式</span>
                <span class="group-count">3</span>
            </div>
            <div class="form-group-content" id="group-contact">
                <div class="adaptive-form" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                    <div class="form-item">
                        <label>邮箱 *</label>
                        <input type="email" placeholder="请输入邮箱" required>
                    </div>
                    <div class="form-item">
                        <label>电话</label>
                        <input type="tel" placeholder="请输入电话">
                    </div>
                    <div class="form-item">
                        <label>地址</label>
                        <input type="text" placeholder="请输入地址">
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group" data-group="advanced">
            <div class="form-group-header" onclick="toggleGroup('group', 'advanced')">
                <span class="group-icon">▼</span>
                <span class="group-title">⚙️ 高级设置</span>
                <span class="group-count">3</span>
            </div>
            <div class="form-group-content" id="group-advanced">
                <div class="adaptive-form" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                    <div class="form-item">
                        <label>主题</label>
                        <select>
                            <option value="light">浅色主题</option>
                            <option value="dark">深色主题</option>
                        </select>
                    </div>
                    <div class="form-item">
                        <label>语言</label>
                        <select>
                            <option value="zh">中文</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div class="form-item">
                        <label>时区</label>
                        <select>
                            <option value="Asia/Shanghai">北京时间</option>
                            <option value="America/New_York">纽约时间</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `

  // 添加分组样式
  const style = document.createElement('style')
  style.textContent = `
        .form-group {
            margin-bottom: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .form-group-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
        }
        
        .form-group-header:hover {
            background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        }
        
        .group-icon {
            font-size: 12px;
            color: #667eea;
            transition: transform 0.2s ease;
        }
        
        .group-title {
            flex: 1;
            font-weight: 600;
            color: #495057;
        }
        
        .group-count {
            background: #667eea;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .form-group-content {
            padding: 20px;
            background: white;
            transition: all 0.3s ease;
        }
        
        .form-group-content.collapsed {
            display: none;
        }
    `
  document.head.appendChild(style)

  container.classList.add('active')
  animateElement(container)
  updateStatus('group', '📋 分组表单已初始化', 'success')
}

window.toggleGroup = (formId, groupKey) => {
  const groupContent = document.getElementById(`group-${groupKey}`)
  const groupHeader = groupContent?.previousElementSibling
  const groupIcon = groupHeader?.querySelector('.group-icon')

  if (groupContent && groupIcon) {
    const isCollapsed = groupContent.classList.contains('collapsed')

    if (isCollapsed) {
      groupContent.classList.remove('collapsed')
      groupIcon.textContent = '▼'
      groupIcon.style.transform = 'rotate(0deg)'
    }
    else {
      groupContent.classList.add('collapsed')
      groupIcon.textContent = '▶'
      groupIcon.style.transform = 'rotate(-90deg)'
    }

    updateStatus(formId, `分组 "${groupKey}" 已${isCollapsed ? '展开' : '收起'}`, 'info')
    performanceMetrics.eventCount++
  }
}

// 性能监控函数
window.updateMetrics = () => {
  const now = Date.now()
  const uptime = Math.floor((now - performanceMetrics.startTime) / 1000)
  const avgRenderTime = performanceMetrics.renderCount > 0
    ? (performanceMetrics.totalRenderTime / performanceMetrics.renderCount).toFixed(2)
    : 0

  document.getElementById('render-count').textContent = performanceMetrics.renderCount
  document.getElementById('avg-render-time').textContent = `${avgRenderTime}ms`
  document.getElementById('form-count').textContent = formInstances.size
  document.getElementById('event-count').textContent = performanceMetrics.eventCount
  document.getElementById('validation-count').textContent = performanceMetrics.validationCount

  // 模拟内存使用
  const memoryUsage = (performance.memory?.usedJSHeapSize / 1024 / 1024 || Math.random() * 50).toFixed(1)
  document.getElementById('memory-usage').textContent = `${memoryUsage}MB`
}

window.clearMetrics = () => {
  performanceMetrics.renderCount = 0
  performanceMetrics.totalRenderTime = 0
  performanceMetrics.eventCount = 0
  performanceMetrics.validationCount = 0
  performanceMetrics.startTime = Date.now()
  updateMetrics()
}

window.runPerformanceTest = async () => {
  const testButton = event.target
  const originalText = testButton.innerHTML
  testButton.innerHTML = '<span class="loading"></span>运行中...'
  testButton.disabled = true

  try {
    // 模拟性能测试
    for (let i = 0; i < 20; i++) {
      const startTime = performance.now()

      // 创建临时表单
      const tempContainer = document.createElement('div')
      tempContainer.style.width = '500px'
      document.body.appendChild(tempContainer)

      const tempForm = new AdaptiveFormManager(formConfigs.basic, tempContainer)

      // 模拟操作
      tempForm.setValue('name', `测试用户${i}`)
      tempForm.setValue('email', `test${i}@example.com`)
      tempForm.validate()
      tempForm.toggle()

      const endTime = performance.now()
      performanceMetrics.totalRenderTime += (endTime - startTime)
      performanceMetrics.renderCount++
      performanceMetrics.eventCount += 3
      performanceMetrics.validationCount++

      tempForm.destroy()
      document.body.removeChild(tempContainer)

      // 短暂延迟以显示进度
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    updateMetrics()
    alert('🎉 性能测试完成！\n\n测试了20个表单实例的创建、操作和销毁过程。\n请查看性能指标面板了解详细数据。')
  }
  finally {
    testButton.innerHTML = originalText
    testButton.disabled = false
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  updateMetrics()

  // 定期更新指标
  setInterval(updateMetrics, 3000)

  console.log('🚀 自适应表单布局系统 - 原生JavaScript示例已加载')
  console.log('📋 可用的全局函数:', Object.keys(window).filter(key =>
    typeof window[key] === 'function'
    && ['init', 'toggle', 'resize', 'add', 'validate', 'fill', 'clear', 'switch', 'open', 'update', 'run'].some(prefix => key.startsWith(prefix)),
  ))
})
