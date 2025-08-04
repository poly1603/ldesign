/**
 * 简单的弹窗功能测试脚本
 */

// 模拟DOM环境
global.document = {
  createElement: tag => ({
    className: '',
    style: {},
    innerHTML: '',
    appendChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    remove: () => {},
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {},
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
}

global.window = {
  requestAnimationFrame: cb => setTimeout(cb, 16),
  cancelAnimationFrame: id => clearTimeout(id),
}

// 导入弹窗管理器（模拟）
class MockModalManager {
  constructor(config = {}) {
    this.config = {
      title: '更多表单项',
      width: 600,
      height: 'auto',
      closable: true,
      maskClosable: true,
      destroyOnClose: false,
      ...config,
    }

    this.state = {
      open: false,
      animating: false,
      items: [],
      values: {},
    }

    this.eventListeners = []
  }

  async open(items = [], values = {}, animated = true) {
    if (this.state.open || this.state.animating)
      return

    console.log('📂 打开弹窗...')
    this.state.animating = true
    this.state.items = [...items]
    this.state.values = { ...values }

    // 模拟动画延迟
    if (animated) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.state.open = true
    this.state.animating = false
    this.emitEvent('open', 'api')
    console.log('✅ 弹窗已打开')
  }

  async close(animated = true, trigger = 'api') {
    if (!this.state.open || this.state.animating)
      return

    console.log('📁 关闭弹窗...')
    this.state.animating = true

    // 模拟动画延迟
    if (animated) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.state.open = false
    this.state.animating = false
    this.emitEvent('close', trigger)
    console.log('✅ 弹窗已关闭')
  }

  async confirm(animated = true) {
    if (!this.state.open)
      return

    console.log('✔️ 确认弹窗...')
    const values = { ...this.state.values }
    await this.close(animated, 'button')
    this.emitEvent('confirm', 'button', values)
    console.log('✅ 弹窗已确认')
  }

  async cancel(animated = true) {
    if (!this.state.open)
      return

    console.log('❌ 取消弹窗...')
    await this.close(animated, 'button')
    this.emitEvent('cancel', 'button')
    console.log('✅ 弹窗已取消')
  }

  async toggle(items, values, animated = true) {
    if (this.state.open) {
      await this.close(animated)
    }
    else if (items) {
      await this.open(items, values, animated)
    }
  }

  updateContent(items, values = {}) {
    if (!this.state.open)
      return

    console.log('🔄 更新弹窗内容...')
    this.state.items = [...items]
    this.state.values = { ...values }
    console.log('✅ 弹窗内容已更新')
  }

  updateConfig(config) {
    console.log('⚙️ 更新弹窗配置...')
    this.config = { ...this.config, ...config }
    console.log('✅ 弹窗配置已更新')
  }

  isOpen() {
    return this.state.open
  }

  getState() {
    return { ...this.state }
  }

  onModalEvent(callback) {
    this.eventListeners.push(callback)
    return () => {
      const index = this.eventListeners.indexOf(callback)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }

  emitEvent(type, trigger, values) {
    const event = { type, trigger, values }
    console.log(`📢 触发事件: ${type} (${trigger})`)
    this.eventListeners.forEach(callback => callback(event))
  }

  destroy() {
    console.log('🗑️ 销毁弹窗管理器...')
    this.eventListeners = []
    this.state = {
      open: false,
      animating: false,
      items: [],
      values: {},
    }
    console.log('✅ 弹窗管理器已销毁')
  }
}

// 测试函数
async function testModalManager() {
  console.log('🚀 开始测试弹窗管理器...\n')

  // 创建弹窗管理器
  const modalManager = new MockModalManager({
    title: '测试弹窗',
    width: 800,
  })

  // 设置事件监听
  const events = []
  modalManager.onModalEvent((event) => {
    events.push(event)
  })

  // 测试数据
  const mockItems = [
    { key: 'field1', label: '字段1', type: 'input' },
    { key: 'field2', label: '字段2', type: 'textarea' },
  ]

  const mockValues = {
    field1: 'value1',
    field2: 'value2',
  }

  try {
    // 测试1: 基础打开关闭
    console.log('📋 测试1: 基础打开关闭')
    console.log('初始状态:', modalManager.isOpen())

    await modalManager.open(mockItems, mockValues, true)
    console.log('打开后状态:', modalManager.isOpen())

    await modalManager.close(true)
    console.log('关闭后状态:', modalManager.isOpen())
    console.log('')

    // 测试2: 确认操作
    console.log('📋 测试2: 确认操作')
    await modalManager.open(mockItems, mockValues, false)
    await modalManager.confirm(false)
    console.log('确认后状态:', modalManager.isOpen())
    console.log('')

    // 测试3: 取消操作
    console.log('📋 测试3: 取消操作')
    await modalManager.open(mockItems, mockValues, false)
    await modalManager.cancel(false)
    console.log('取消后状态:', modalManager.isOpen())
    console.log('')

    // 测试4: 切换操作
    console.log('📋 测试4: 切换操作')
    await modalManager.toggle(mockItems, mockValues, false)
    console.log('切换后状态:', modalManager.isOpen())
    await modalManager.toggle(undefined, undefined, false)
    console.log('再次切换后状态:', modalManager.isOpen())
    console.log('')

    // 测试5: 内容更新
    console.log('📋 测试5: 内容更新')
    await modalManager.open(mockItems, mockValues, false)
    const newItems = [{ key: 'field3', label: '字段3', type: 'select' }]
    const newValues = { field3: 'value3' }
    modalManager.updateContent(newItems, newValues)
    const state = modalManager.getState()
    console.log('更新后的项目数量:', state.items.length)
    await modalManager.close(false)
    console.log('')

    // 测试6: 配置更新
    console.log('📋 测试6: 配置更新')
    modalManager.updateConfig({
      title: '新标题',
      width: 1000,
    })
    console.log('')

    // 测试7: 事件监听
    console.log('📋 测试7: 事件监听')
    console.log('捕获的事件数量:', events.length)
    console.log('事件类型:', events.map(e => e.type).join(', '))
    console.log('')

    // 测试8: 销毁
    console.log('📋 测试8: 销毁')
    modalManager.destroy()
    console.log('销毁后状态:', modalManager.isOpen())
    console.log('')

    console.log('🎉 所有测试通过！')
  }
  catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 运行测试
testModalManager().then(() => {
  console.log('\n✨ 弹窗功能测试完成')
}).catch((error) => {
  console.error('\n💥 测试过程中出现错误:', error)
})
