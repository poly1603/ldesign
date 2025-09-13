/**
 * LDesign Calendar 基础示例
 * 展示日历组件的基本功能和使用方法
 */

import { Calendar } from '@ldesign/calendar'

// 创建日历实例
const calendar = new Calendar({
  // 容器元素
  container: '#calendar',
  
  // 初始视图
  defaultView: 'month',
  
  // 初始日期
  defaultDate: new Date(),
  
  // 语言设置
  locale: 'zh-CN',
  
  // 显示农历
  showLunar: true,
  
  // 显示节假日
  showHolidays: true,
  
  // 启用拖拽
  draggable: true,
  
  // 启用调整大小
  resizable: true,
  
  // 事件回调
  onEventClick: (event) => {
    console.log('点击事件:', event)
    showEventDetailsModal(event)
  },
  
  onEventCreate: (event) => {
    console.log('创建事件:', event)
  },
  
  onEventUpdate: (event) => {
    console.log('更新事件:', event)
  },
  
  onEventDelete: (event) => {
    console.log('删除事件:', event)
  },
  
  onDateSelect: (date) => {
    console.log('点击日期:', date)
    // 自动填充事件表单的开始时间
    const startInput = document.getElementById('event-start')
    const endInput = document.getElementById('event-end')

    const startDate = new Date(date)
    startDate.setHours(9, 0, 0, 0) // 默认上午9点

    const endDate = new Date(date)
    endDate.setHours(10, 0, 0, 0) // 默认上午10点

    startInput.value = formatDateTimeLocal(startDate)
    endInput.value = formatDateTimeLocal(endDate)
  },
  
  onViewChange: (view) => {
    console.log('视图切换:', view)
    // 更新按钮状态
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view)
    })
  }
})

// 初始化日历
calendar.init()

// 添加一些示例事件
const sampleEvents = [
  {
    id: 'event-1',
    title: '团队会议',
    start: new Date(2024, 11, 15, 10, 0),
    end: new Date(2024, 11, 15, 11, 30),
    type: 'meeting',
    color: '#722ED1',
    description: '讨论项目进度和下一步计划'
  },
  {
    id: 'event-2',
    title: '产品发布',
    start: new Date(2024, 11, 20, 14, 0),
    end: new Date(2024, 11, 20, 16, 0),
    type: 'event',
    color: '#52c41a',
    description: '新版本产品发布活动'
  },
  {
    id: 'event-3',
    title: '代码审查',
    start: new Date(2024, 11, 18, 9, 0),
    end: new Date(2024, 11, 18, 10, 0),
    type: 'task',
    color: '#fa8c16',
    description: '审查本周提交的代码'
  }
]

// 添加示例事件
sampleEvents.forEach(event => {
  calendar.addEvent(event)
})

// 绑定控制按钮事件
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded 事件触发')
  // 视图切换按钮
  const viewButtons = document.querySelectorAll('[data-view]')
  console.log('找到视图切换按钮数量:', viewButtons.length)
  viewButtons.forEach(btn => {
    console.log('绑定按钮:', btn.textContent, '视图:', btn.dataset.view)
    btn.addEventListener('click', () => {
      const view = btn.dataset.view
      console.log('按钮被点击，视图:', view)
      console.log('calendar对象:', calendar)
      console.log('calendar.changeView方法:', typeof calendar.changeView)
      if (calendar && typeof calendar.changeView === 'function') {
        calendar.changeView(view)
      } else {
        console.error('calendar对象或changeView方法不存在')
      }
    })
  })
  
  // 主题切换按钮
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme
      calendar.setTheme(theme)
    })
  })
  
  // 导航按钮
  document.getElementById('today-btn').addEventListener('click', () => {
    calendar.goToToday()
  })
  
  document.getElementById('prev-btn').addEventListener('click', () => {
    calendar.prev()
  })
  
  document.getElementById('next-btn').addEventListener('click', () => {
    calendar.next()
  })
  
  // 事件表单提交
  document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const form = e.target
    const editingId = form.dataset.editingId

    const eventData = {
      title: document.getElementById('event-title').value,
      description: document.getElementById('event-description').value,
      start: new Date(document.getElementById('event-start').value),
      end: new Date(document.getElementById('event-end').value),
      type: document.getElementById('event-type').value,
      location: document.getElementById('event-location').value,
      color: document.getElementById('event-color').value
    }

    // 验证数据
    if (!eventData.title.trim()) {
      alert('请输入事件标题')
      return
    }

    if (eventData.start >= eventData.end) {
      alert('结束时间必须晚于开始时间')
      return
    }

    try {
      if (editingId) {
        // 更新事件
        calendar.updateEvent(editingId, eventData)
        alert('事件更新成功！')
        resetEventForm()
      } else {
        // 添加事件
        eventData.id = `event-${Date.now()}`
        calendar.addEvent(eventData)
        alert('事件添加成功！')

        // 重置表单
        form.reset()
        document.getElementById('event-color').value = '#722ED1'
      }
    } catch (error) {
      alert('操作失败: ' + error.message)
    }
  })
})

// 工具函数：格式化日期时间为 datetime-local 输入格式
function formatDateTimeLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 事件详情模态框功能
function showEventDetailsModal(event) {
  const modal = document.createElement('div')
  modal.className = 'event-modal-overlay'
  modal.innerHTML = `
    <div class="event-modal">
      <div class="event-modal-header">
        <h3>事件详情</h3>
        <button class="event-modal-close">&times;</button>
      </div>
      <div class="event-modal-body">
        <div class="event-detail">
          <strong>标题:</strong> ${event.title}
        </div>
        <div class="event-detail">
          <strong>时间:</strong> ${event.start.toLocaleString()} - ${event.end.toLocaleString()}
        </div>
        <div class="event-detail">
          <strong>类型:</strong> ${event.type || '事件'}
        </div>
        ${event.description ? `<div class="event-detail"><strong>描述:</strong> ${event.description}</div>` : ''}
        ${event.location ? `<div class="event-detail"><strong>地点:</strong> ${event.location}</div>` : ''}
        <div class="event-detail">
          <strong>颜色:</strong> <span class="color-preview" style="background-color: ${event.color}"></span> ${event.color}
        </div>
      </div>
      <div class="event-modal-footer">
        <button class="btn btn-primary" onclick="editEvent('${event.id}')">编辑</button>
        <button class="btn btn-danger" onclick="deleteEventConfirm('${event.id}')">删除</button>
        <button class="btn btn-secondary" onclick="closeEventModal()">关闭</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // 关闭按钮事件
  modal.querySelector('.event-modal-close').onclick = closeEventModal
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeEventModal()
    }
  }
}

function closeEventModal() {
  const modal = document.querySelector('.event-modal-overlay')
  if (modal) {
    modal.remove()
  }
}

function editEvent(eventId) {
  const event = calendar.getEvent(eventId)
  if (!event) {
    alert('找不到事件')
    return
  }

  closeEventModal()

  // 填充编辑表单
  document.getElementById('event-title').value = event.title
  document.getElementById('event-type').value = event.type || 'event'
  document.getElementById('event-start').value = formatDateTimeLocal(event.start)
  document.getElementById('event-end').value = formatDateTimeLocal(event.end)
  document.getElementById('event-description').value = event.description || ''
  document.getElementById('event-location').value = event.location || ''
  document.getElementById('event-color').value = event.color || '#722ed1'

  // 修改表单提交处理
  const form = document.getElementById('event-form')
  form.dataset.editingId = eventId

  // 修改按钮文本
  const submitBtn = form.querySelector('button[type="submit"]')
  submitBtn.textContent = '更新事件'

  // 添加取消按钮
  if (!document.querySelector('.cancel-edit-btn')) {
    const cancelButton = document.createElement('button')
    cancelButton.textContent = '取消编辑'
    cancelButton.type = 'button'
    cancelButton.className = 'btn btn-secondary cancel-edit-btn'
    cancelButton.onclick = cancelEdit
    submitBtn.parentNode.insertBefore(cancelButton, submitBtn.nextSibling)
  }
}

function deleteEventConfirm(eventId) {
  if (confirm('确定要删除这个事件吗？')) {
    try {
      calendar.removeEvent(eventId)
      closeEventModal()
      alert('事件删除成功！')
    } catch (error) {
      alert('删除事件失败: ' + error.message)
    }
  }
}

function cancelEdit() {
  resetEventForm()
}

function resetEventForm() {
  // 重置表单
  const form = document.getElementById('event-form')
  form.reset()
  form.removeAttribute('data-editing-id')
  document.getElementById('event-color').value = '#722ed1'

  // 恢复添加按钮
  const submitBtn = form.querySelector('button[type="submit"]')
  submitBtn.textContent = '添加事件'

  // 移除取消按钮
  const cancelButton = document.querySelector('.cancel-edit-btn')
  if (cancelButton) {
    cancelButton.remove()
  }
}

// 导出日历实例和函数供调试使用
window.calendar = calendar
window.showEventDetailsModal = showEventDetailsModal
window.closeEventModal = closeEventModal
window.editEvent = editEvent
window.deleteEventConfirm = deleteEventConfirm
window.cancelEdit = cancelEdit
window.resetEventForm = resetEventForm
