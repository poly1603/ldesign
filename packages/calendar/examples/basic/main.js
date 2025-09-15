/**
 * LDesign Calendar 基础示例
 * 展示日历组件的最简单使用方法
 */

import { Calendar } from '@ldesign/calendar'

// 创建日历实例 - 最简配置
const calendar = new Calendar({
  container: '#calendar',
  locale: 'zh-CN',
  showLunar: true,
  showHolidays: true
})

// 添加一个简单的示例事件
calendar.addEvent({
  id: 'sample-event',
  title: '示例事件',
  start: new Date(2025, 8, 15, 10, 0), // 2025年9月15日 10:00
  end: new Date(2025, 8, 15, 11, 0),   // 2025年9月15日 11:00
  color: '#722ED1'
})

// 导出日历实例供调试使用
window.calendar = calendar

console.log('日历已初始化，可以通过 window.calendar 访问日历实例')
