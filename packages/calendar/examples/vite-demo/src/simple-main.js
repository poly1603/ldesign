/**
 * LDesign Calendar - Vite Demo
 * 简单直接的示例，展示如何使用Calendar类
 */

// 从源码直接引入
import { Calendar } from '../../../src/index.ts'
import '../../../src/index.css'
import dayjs from 'dayjs'

// 初始化日历
const calendar = new Calendar('#app', {
  view: 'month',
  locale: 'zh-CN',
  theme: 'default',
  showLunar: true,
  showHolidays: true,
  showWeekNumbers: true,
  enableDragDrop: true,
  weekStartDay: 0,
  events: [
    {
      id: '1',
      title: '团队会议',
      start: new Date(),
      end: new Date(Date.now() + 3600000),
      category: 'work',
      color: '#007bff'
    },
    {
      id: '2',
      title: '项目截止日',
      start: new Date(Date.now() + 86400000 * 3),
      allDay: true,
      category: 'work',
      color: '#dc3545'
    },
    {
      id: '3',
      title: '生日派对',
      start: new Date(Date.now() + 86400000 * 7),
      category: 'personal',
      color: '#28a745'
    }
  ]
})

// 监听日历事件
calendar.on('dateClick', (date) => {
  console.log('Date clicked:', date)
  
  // 弹出添加事件的提示
  const title = prompt(`为 ${dayjs(date).format('YYYY-MM-DD')} 添加事件:`)
  if (title) {
    calendar.addEvent({
      title,
      start: date,
      allDay: true,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    })
  }
})

calendar.on('eventClick', (event) => {
  console.log('Event clicked:', event)
  
  if (confirm(`删除事件 "${event.title}"?`)) {
    calendar.deleteEvent(event.id)
  }
})

// 添加控制按钮
const controls = document.createElement('div')
controls.className = 'controls'
controls.innerHTML = `
  <style>
    .controls {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .controls h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }
    .control-group {
      margin-bottom: 10px;
    }
    .control-group button {
      margin-right: 5px;
      padding: 5px 10px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .control-group button:hover {
      background: #0056b3;
    }
    .control-group select {
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .control-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
  </style>
  
  <h3>日历控制</h3>
  
  <div class="control-group">
    <label>视图切换</label>
    <button id="viewMonth">月视图</button>
    <button id="viewWeek">周视图</button>
    <button id="viewDay">日视图</button>
    <button id="viewYear">年视图</button>
  </div>
  
  <div class="control-group">
    <label>导航</label>
    <button id="goToday">今天</button>
    <button id="goPrev">上一页</button>
    <button id="goNext">下一页</button>
  </div>
  
  <div class="control-group">
    <label>主题</label>
    <select id="themeSelect">
      <option value="default">默认</option>
      <option value="dark">暗色</option>
      <option value="light">亮色</option>
    </select>
  </div>
  
  <div class="control-group">
    <label>语言</label>
    <select id="localeSelect">
      <option value="zh-CN">中文</option>
      <option value="en-US">English</option>
      <option value="ja-JP">日本語</option>
    </select>
  </div>
  
  <div class="control-group">
    <label>事件管理</label>
    <button id="addEvent">添加事件</button>
    <button id="clearEvents">清空事件</button>
  </div>
  
  <div class="control-group">
    <label>数据操作</label>
    <button id="exportData">导出数据</button>
    <button id="importData">导入数据</button>
  </div>
`

document.body.appendChild(controls)

// 绑定控制事件
document.getElementById('viewMonth').addEventListener('click', () => {
  calendar.setView('month')
})

document.getElementById('viewWeek').addEventListener('click', () => {
  calendar.setView('week')
})

document.getElementById('viewDay').addEventListener('click', () => {
  calendar.setView('day')
})

document.getElementById('viewYear').addEventListener('click', () => {
  calendar.setView('year')
})

document.getElementById('goToday').addEventListener('click', () => {
  calendar.goToToday()
})

document.getElementById('goPrev').addEventListener('click', () => {
  calendar.navigate('prev')
})

document.getElementById('goNext').addEventListener('click', () => {
  calendar.navigate('next')
})

document.getElementById('themeSelect').addEventListener('change', (e) => {
  calendar.setTheme(e.target.value)
})

document.getElementById('localeSelect').addEventListener('change', (e) => {
  calendar.setLocale(e.target.value)
})

document.getElementById('addEvent').addEventListener('click', () => {
  const title = prompt('事件标题:')
  if (!title) return
  
  const dateStr = prompt('日期 (YYYY-MM-DD):')
  if (!dateStr) return
  
  calendar.addEvent({
    title,
    start: new Date(dateStr),
    allDay: true,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  })
})

document.getElementById('clearEvents').addEventListener('click', () => {
  if (confirm('确定要清空所有事件吗?')) {
    const events = calendar.getEvents()
    events.forEach(event => calendar.deleteEvent(event.id))
  }
})

document.getElementById('exportData').addEventListener('click', () => {
  const data = calendar.export('json')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `calendar-${dayjs().format('YYYYMMDD')}.json`
  a.click()
  
  URL.revokeObjectURL(url)
})

document.getElementById('importData').addEventListener('click', () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        calendar.import(e.target.result, 'json')
        alert('数据导入成功!')
      } catch (error) {
        alert('导入失败: ' + error.message)
      }
    }
    reader.readAsText(file)
  })
  
  input.click()
})

console.log('Calendar initialized successfully!')
console.log('日历已成功初始化!')

// 在浏览器控制台暴露calendar实例便于调试
window.calendar = calendar