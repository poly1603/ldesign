/**
 * LDesign Calendar - Simple Vite JS Example
 * 这个示例展示了如何在纯JavaScript环境中使用Calendar类
 */

// 导入Calendar类和样式
import { Calendar } from '../../src/index.ts'
import '../../src/index.css'

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 开始初始化LDesign Calendar...')
  
  // 获取日历容器
  const calendarContainer = document.getElementById('calendar')
  
  if (!calendarContainer) {
    console.error('❌ 找不到日历容器元素')
    return
  }
  
  try {
    // 创建Calendar实例
    const calendar = new Calendar(calendarContainer, {
      // 基础配置
      locale: 'zh-CN',           // 中文界面
      theme: 'default',          // 默认主题
      view: 'month',             // 默认月视图
      
      // 显示选项
      showLunar: true,           // 显示农历
      showHolidays: true,        // 显示节日
      showWeekNumbers: false,    // 不显示周数
      showToday: true,           // 高亮今天
      showNavigation: true,      // 显示导航按钮
      showToolbar: true,         // 显示工具栏
      
      // 交互功能
      enableDragDrop: true,      // 启用拖拽
      enableResize: true,        // 启用调整大小
      enableKeyboard: true,      // 启用键盘操作
      enableTouch: true,         // 启用触摸操作
      
      // 选择模式
      selectionMode: 'single',   // 单选模式
      
      // 动画配置
      animation: {
        enabled: true,           // 启用动画
        duration: 300,           // 动画时长
        easing: 'ease-in-out',   // 缓动函数
        viewTransition: 'slide'  // 视图切换动画
      },
      
      // 样式配置
      style: {
        width: '100%',
        height: '100%',
        borderRadius: '8px'
      }
    })
    
    console.log('✅ Calendar实例创建成功')
    
    // 监听日期选择事件
    calendar.on('dateSelect', (date) => {
      console.log('📅 选择日期:', date.format('YYYY-MM-DD'))
    })
    
    // 监听事件创建
    calendar.on('eventCreate', (event) => {
      console.log('📝 创建事件:', event.title)
    })
    
    // 监听事件更新
    calendar.on('eventUpdate', (event) => {
      console.log('✏️ 更新事件:', event.title)
    })
    
    // 监听事件删除
    calendar.on('eventDelete', (event) => {
      console.log('🗑️ 删除事件:', event.title)
    })
    
    // 监听视图切换
    calendar.on('viewChange', (view) => {
      console.log('👁️ 切换视图:', view)
    })
    
    // 监听日期变化
    calendar.on('dateChange', (date) => {
      console.log('📆 日期变化:', date.format('YYYY-MM-DD'))
    })
    
    // 添加一些示例事件
    const sampleEvents = [
      {
        title: '团队会议',
        start: new Date(),
        end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2小时后
        color: '#1890ff',
        description: '讨论项目进展和下一步计划'
      },
      {
        title: '客户拜访',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
        end: new Date(Date.now() + 25 * 60 * 60 * 1000),   // 明天+1小时
        color: '#52c41a',
        description: '重要客户会议，准备产品演示'
      },
      {
        title: '产品发布',
        start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 后天
        color: '#722ed1',
        description: '新版本产品正式发布'
      }
    ]
    
    // 添加示例事件
    sampleEvents.forEach(event => {
      calendar.addEvent(event)
    })
    
    console.log('📋 添加了', sampleEvents.length, '个示例事件')
    
    // 将calendar实例挂载到window对象，方便调试
    window.calendar = calendar
    
    console.log('🎉 LDesign Calendar 初始化完成！')
    console.log('💡 提示: 可以通过 window.calendar 访问日历实例')
    console.log('🖱️ 试试右键点击日期，或者双击查看详情')
    
  } catch (error) {
    console.error('❌ Calendar初始化失败:', error)
    
    // 显示错误信息
    calendarContainer.innerHTML = `
      <div class="error">
        <div>
          <h3>❌ 日历加载失败</h3>
          <p>错误信息: ${error.message}</p>
          <p>请检查控制台获取详细信息</p>
        </div>
      </div>
    `
  }
})

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('❌ 全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ 未处理的Promise拒绝:', event.reason)
})

// 输出库信息
console.log('📚 LDesign Calendar Library')
console.log('版本: 0.1.0')
console.log('作者: ldesign')
console.log('许可: MIT')
