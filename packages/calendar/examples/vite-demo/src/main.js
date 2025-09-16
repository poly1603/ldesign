/**
 * LDesign Calendar - Complete Vite + JavaScript Demo
 * 完整功能展示：事件管理、主题切换、数据持久化、导入导出等
 */

// 从源码直接引入Calendar类
import { Calendar } from '../../src/index.ts'
import '../../src/styles/index.css'
import dayjs from 'dayjs'
    text-align: center;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #e9ecef;
  }
  
  .calendar-day {
    background: white;
    min-height: 80px;
    padding: 8px;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .calendar-day:hover {
    background: #f8f9fa;
    transform: scale(1.02);
    z-index: 1;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .calendar-day.other-month {
    color: #ccc;
    background: #fafafa;
  }
  
  .calendar-day.today {
    background: #e3f2fd;
  }
  
  .calendar-day.today .day-number {
    background: #007bff;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .day-number {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .day-events {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  
  .event-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .theme-dark .calendar-day {
    background: #2c3e50;
    color: white;
  }
  
  .theme-dark .calendar-grid {
    background: #34495e;
  }
  
  .theme-dark .calendar-day:hover {
    background: #34495e;
  }
  
  .theme-dark .calendar-day.today {
    background: #3498db;
  }
`
document.head.appendChild(style)

// Application State
const app = {
  calendar: null,
  storage: {
    events: [],
    settings: {
      theme: 'default',
      locale: 'zh-CN',
      showLunar: true,
      showHolidays: true,
      showWeekNumbers: false,
      enableDragDrop: true
    }
  },
  currentEvent: null
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initCalendar()
  initEventListeners()
  loadFromStorage()
  updateStatistics()
  showToast('日历加载完成！', 'success')
})

// Initialize Calendar
function initCalendar() {
  const config = {
    view: 'month',
    locale: app.storage.settings.locale,
    theme: app.storage.settings.theme,
    showLunar: app.storage.settings.showLunar,
    showHolidays: app.storage.settings.showHolidays,
    showWeekNumbers: app.storage.settings.showWeekNumbers,
    enableDragDrop: app.storage.settings.enableDragDrop
  }

  app.calendar = new Calendar('#calendar-container', config)
  
  // Listen for date clicks
  app.calendar.container.addEventListener('dateClick', (e) => {
    const date = e.detail.date
    openEventModal('create', { start: date })
  })
}

// Initialize Event Listeners
function initEventListeners() {
  // Theme selector
  document.getElementById('themeSelector').addEventListener('change', (e) => {
    app.storage.settings.theme = e.target.value
    app.calendar.setTheme(e.target.value)
    saveToStorage()
    showToast(`主题切换为：${e.target.value}`, 'info')
  })

  // Locale selector
  document.getElementById('localeSelector').addEventListener('change', (e) => {
    app.storage.settings.locale = e.target.value
    // In production: app.calendar.setLocale(e.target.value)
    saveToStorage()
    showToast(`语言切换为：${e.target.value}`, 'info')
  })

  // View buttons
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const view = btn.dataset.view
      app.calendar.setView(view)
      showToast(`视图切换为：${view}`, 'info')
    })
  })

  // Today button
  document.getElementById('todayBtn').addEventListener('click', () => {
    app.calendar.goToToday()
    showToast('已跳转到今天', 'info')
  })

  // Add event button
  document.getElementById('addEventBtn').addEventListener('click', () => {
    openEventModal('create')
  })

  // Export button
  document.getElementById('exportBtn').addEventListener('click', () => {
    exportEvents()
  })

  // Import button
  document.getElementById('importBtn').addEventListener('click', () => {
    importEvents()
  })

  // Settings checkboxes
  document.getElementById('showLunar').addEventListener('change', (e) => {
    app.storage.settings.showLunar = e.target.checked
    saveToStorage()
  })

  document.getElementById('showHolidays').addEventListener('change', (e) => {
    app.storage.settings.showHolidays = e.target.checked
    saveToStorage()
  })

  document.getElementById('showWeekNumbers').addEventListener('change', (e) => {
    app.storage.settings.showWeekNumbers = e.target.checked
    saveToStorage()
  })

  document.getElementById('enableDragDrop').addEventListener('change', (e) => {
    app.storage.settings.enableDragDrop = e.target.checked
    saveToStorage()
  })

  // Data management buttons
  document.getElementById('saveToLocal').addEventListener('click', () => {
    saveToStorage()
    showToast('数据已保存到本地', 'success')
  })

  document.getElementById('loadFromLocal').addEventListener('click', () => {
    loadFromStorage()
    showToast('已从本地加载数据', 'success')
  })

  document.getElementById('clearData').addEventListener('click', () => {
    if (confirm('确定要清空所有数据吗？')) {
      clearStorage()
      app.calendar.events = []
      app.calendar.render()
      updateStatistics()
      showToast('数据已清空', 'warning')
    }
  })

  // Modal events
  document.querySelector('.modal-close').addEventListener('click', closeEventModal)
  
  document.querySelector('[data-action="cancel"]').addEventListener('click', closeEventModal)
  
  document.querySelector('[data-action="save"]').addEventListener('click', saveEvent)

  // All day checkbox
  document.getElementById('eventAllDay').addEventListener('change', (e) => {
    const startInput = document.getElementById('eventStart')
    const endInput = document.getElementById('eventEnd')
    
    if (e.target.checked) {
      startInput.type = 'date'
      endInput.type = 'date'
    } else {
      startInput.type = 'datetime-local'
      endInput.type = 'datetime-local'
    }
  })
}

// Event Modal Functions
function openEventModal(mode = 'create', data = {}) {
  const modal = document.getElementById('eventModal')
  const modalTitle = document.getElementById('modalTitle')
  
  app.currentEvent = mode === 'edit' ? data : null
  
  if (mode === 'create') {
    modalTitle.textContent = '添加事件'
    document.getElementById('eventForm').reset()
    
    if (data.start) {
      document.getElementById('eventStart').value = formatDateTimeLocal(data.start)
    }
  } else if (mode === 'edit') {
    modalTitle.textContent = '编辑事件'
    fillEventForm(data)
  }
  
  modal.classList.add('show')
}

function closeEventModal() {
  document.getElementById('eventModal').classList.remove('show')
  app.currentEvent = null
}

function fillEventForm(event) {
  document.getElementById('eventTitle').value = event.title || ''
  document.getElementById('eventStart').value = formatDateTimeLocal(event.start)
  document.getElementById('eventEnd').value = formatDateTimeLocal(event.end || event.start)
  document.getElementById('eventDescription').value = event.description || ''
  document.getElementById('eventCategory').value = event.category || ''
  document.getElementById('eventColor').value = event.color || '#007bff'
  document.getElementById('eventAllDay').checked = event.allDay || false
  document.getElementById('eventRepeat').value = event.repeat?.type || 'none'
}

function saveEvent() {
  const form = document.getElementById('eventForm')
  
  // Get form data
  const eventData = {
    title: document.getElementById('eventTitle').value,
    start: document.getElementById('eventStart').value,
    end: document.getElementById('eventEnd').value || document.getElementById('eventStart').value,
    description: document.getElementById('eventDescription').value,
    category: document.getElementById('eventCategory').value,
    color: document.getElementById('eventColor').value,
    allDay: document.getElementById('eventAllDay').checked,
    repeat: {
      type: document.getElementById('eventRepeat').value
    }
  }
  
  // Validate
  if (!eventData.title) {
    showToast('请输入事件标题', 'error')
    return
  }
  
  if (!eventData.start) {
    showToast('请选择开始时间', 'error')
    return
  }
  
  // Save event
  if (app.currentEvent) {
    // Update existing event
    app.calendar.updateEvent(app.currentEvent.id, eventData)
    showToast('事件已更新', 'success')
  } else {
    // Create new event
    app.calendar.addEvent(eventData)
    showToast('事件已创建', 'success')
  }
  
  // Update UI
  updateStatistics()
  updateTodayEvents()
  saveToStorage()
  closeEventModal()
}

// Storage Functions
function saveToStorage() {
  localStorage.setItem('calendar-events', JSON.stringify(app.calendar.events))
  localStorage.setItem('calendar-settings', JSON.stringify(app.storage.settings))
  updateStorageUsage()
}

function loadFromStorage() {
  const events = localStorage.getItem('calendar-events')
  const settings = localStorage.getItem('calendar-settings')
  
  if (events) {
    const parsedEvents = JSON.parse(events)
    parsedEvents.forEach(event => app.calendar.addEvent(event))
  }
  
  if (settings) {
    app.storage.settings = JSON.parse(settings)
    applySettings()
  }
  
  updateStatistics()
  updateTodayEvents()
  updateStorageUsage()
}

function clearStorage() {
  localStorage.removeItem('calendar-events')
  localStorage.removeItem('calendar-settings')
  updateStorageUsage()
}

function updateStorageUsage() {
  let totalSize = 0
  for (let key in localStorage) {
    if (key.startsWith('calendar-')) {
      totalSize += localStorage[key].length + key.length
    }
  }
  
  const sizeInKB = (totalSize / 1024).toFixed(2)
  document.getElementById('storageUsage').textContent = `${sizeInKB} KB`
}

// Import/Export Functions
function exportEvents() {
  const data = app.calendar.exportEvents('json')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `calendar-events-${dayjs().format('YYYY-MM-DD')}.json`
  a.click()
  
  URL.revokeObjectURL(url)
  showToast('事件已导出', 'success')
}

function importEvents() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        app.calendar.importEvents(e.target.result, 'json')
        updateStatistics()
        updateTodayEvents()
        saveToStorage()
        showToast('事件导入成功', 'success')
      } catch (error) {
        showToast('导入失败：' + error.message, 'error')
      }
    }
    reader.readAsText(file)
  })
  
  input.click()
}

// UI Update Functions
function updateStatistics() {
  const events = app.calendar.getEvents()
  const today = dayjs()
  const monthStart = today.startOf('month')
  const monthEnd = today.endOf('month')
  
  const totalEvents = events.length
  const monthEvents = events.filter(e => {
    const eventDate = dayjs(e.start)
    return eventDate.isAfter(monthStart) && eventDate.isBefore(monthEnd)
  }).length
  
  const pendingEvents = events.filter(e => {
    return dayjs(e.start).isAfter(today)
  }).length
  
  document.getElementById('totalEvents').textContent = totalEvents
  document.getElementById('monthEvents').textContent = monthEvents
  document.getElementById('pendingEvents').textContent = pendingEvents
}

function updateTodayEvents() {
  const events = app.calendar.getEvents()
  const today = dayjs().format('YYYY-MM-DD')
  const todayEvents = events.filter(e => {
    return dayjs(e.start).format('YYYY-MM-DD') === today
  })
  
  const container = document.getElementById('todayEvents')
  
  if (todayEvents.length === 0) {
    container.innerHTML = '<p style="color: #999;">暂无事件</p>'
    return
  }
  
  container.innerHTML = todayEvents.map(event => `
    <div class="event-item" data-event-id="${event.id}">
      <div class="event-time">${dayjs(event.start).format('HH:mm')}</div>
      <div class="event-title">${event.title}</div>
    </div>
  `).join('')
}

function applySettings() {
  // Apply theme
  document.getElementById('themeSelector').value = app.storage.settings.theme
  app.calendar.setTheme(app.storage.settings.theme)
  
  // Apply locale
  document.getElementById('localeSelector').value = app.storage.settings.locale
  
  // Apply settings
  document.getElementById('showLunar').checked = app.storage.settings.showLunar
  document.getElementById('showHolidays').checked = app.storage.settings.showHolidays
  document.getElementById('showWeekNumbers').checked = app.storage.settings.showWeekNumbers
  document.getElementById('enableDragDrop').checked = app.storage.settings.enableDragDrop
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer')
  
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.innerHTML = `
    <span>${getToastIcon(type)}</span>
    <span>${message}</span>
  `
  
  container.appendChild(toast)
  
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      container.removeChild(toast)
    }, 300)
  }, 3000)
}

function getToastIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || icons.info
}

// Utility Functions
function formatDateTimeLocal(date) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DDTHH:mm')
}

// Add sample events for demonstration
function addSampleEvents() {
  const sampleEvents = [
    {
      title: '团队会议',
      start: dayjs().hour(10).minute(0).toISOString(),
      end: dayjs().hour(11).minute(0).toISOString(),
      category: 'meeting',
      color: '#007bff',
      description: '讨论项目进度'
    },
    {
      title: '午餐约会',
      start: dayjs().hour(12).minute(30).toISOString(),
      end: dayjs().hour(13).minute(30).toISOString(),
      category: 'personal',
      color: '#28a745',
      description: '与朋友聚餐'
    },
    {
      title: '项目截止日',
      start: dayjs().add(3, 'day').hour(17).minute(0).toISOString(),
      category: 'work',
      color: '#dc3545',
      description: '提交项目最终版本'
    },
    {
      title: '生日派对',
      start: dayjs().add(7, 'day').hour(19).minute(0).toISOString(),
      category: 'personal',
      color: '#ffc107',
      allDay: false,
      description: '朋友的生日派对'
    }
  ]
  
  sampleEvents.forEach(event => app.calendar.addEvent(event))
  updateStatistics()
  updateTodayEvents()
}

// Initialize with sample data if empty
setTimeout(() => {
  if (app.calendar.getEvents().length === 0) {
    addSampleEvents()
    showToast('已添加示例事件', 'info')
  }
}, 500)

// Export app for debugging
window.calendarApp = app