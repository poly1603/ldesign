/**
 * @ldesign/chart Vite Demo
 * 主入口文件
 */

import './styles/main.css'
import { initOverview } from './charts/overview.js'
import { initLineCharts } from './charts/line-charts.js'
import { initBarCharts } from './charts/bar-charts.js'
import { initPieCharts } from './charts/pie-charts.js'
import { initScatterCharts } from './charts/scatter-charts.js'
import { initAreaCharts } from './charts/area-charts.js'
import { initAdvancedCharts } from './charts/advanced-charts.js'
import { initPerformanceCharts } from './charts/performance-charts.js'

/**
 * 应用状态
 */
const appState = {
  currentTheme: 'light',
  currentSection: 'overview',
  charts: new Map(), // 存储所有图表实例
}

/**
 * 初始化应用
 */
async function initApp() {
  try {
    // 显示加载动画
    showLoading()
    
    // 初始化主题系统
    initThemeSystem()
    
    // 初始化导航系统
    initNavigation()
    
    // 初始化所有图表页面
    await initAllCharts()
    
    // 隐藏加载动画
    hideLoading()
    
    console.log('✅ 应用初始化完成')
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    hideLoading()
    showError('应用初始化失败，请刷新页面重试')
  }
}

/**
 * 显示加载动画
 */
function showLoading() {
  const loading = document.getElementById('loading')
  if (loading) {
    loading.style.display = 'flex'
  }
}

/**
 * 隐藏加载动画
 */
function hideLoading() {
  const loading = document.getElementById('loading')
  if (loading) {
    loading.style.display = 'none'
  }
}

/**
 * 显示错误信息
 */
function showError(message) {
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ff4d4f;
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    font-size: 1rem;
    text-align: center;
  `
  errorDiv.textContent = message
  document.body.appendChild(errorDiv)
  
  // 3秒后自动移除
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv)
    }
  }, 3000)
}

/**
 * 初始化主题系统
 */
function initThemeSystem() {
  const themeSelect = document.getElementById('theme-select')
  const body = document.body
  
  // 设置初始主题
  body.setAttribute('data-theme', appState.currentTheme)
  
  // 监听主题切换
  themeSelect.addEventListener('change', (e) => {
    const newTheme = e.target.value
    appState.currentTheme = newTheme
    body.setAttribute('data-theme', newTheme)
    
    // 更新所有图表的主题
    updateAllChartsTheme(newTheme)
    
    console.log(`🎨 主题已切换到: ${newTheme}`)
  })
}

/**
 * 更新所有图表的主题
 */
function updateAllChartsTheme(theme) {
  appState.charts.forEach((chart, id) => {
    try {
      if (chart && typeof chart.setTheme === 'function') {
        chart.setTheme(theme)
      }
    } catch (error) {
      console.warn(`⚠️ 更新图表 ${id} 主题失败:`, error)
    }
  })
}

/**
 * 初始化导航系统
 */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item')
  const sections = document.querySelectorAll('.section')
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.getAttribute('data-section')
      
      // 更新导航状态
      navItems.forEach(nav => nav.classList.remove('active'))
      item.classList.add('active')
      
      // 更新页面内容
      sections.forEach(section => {
        section.classList.remove('active')
        if (section.id === sectionId) {
          section.classList.add('active')
          section.classList.add('fade-in')
        }
      })
      
      appState.currentSection = sectionId
      console.log(`📄 切换到页面: ${sectionId}`)
    })
  })
}

/**
 * 初始化所有图表页面
 */
async function initAllCharts() {
  const initFunctions = [
    { name: 'overview', fn: initOverview },
    { name: 'line', fn: initLineCharts },
    { name: 'bar', fn: initBarCharts },
    { name: 'pie', fn: initPieCharts },
    { name: 'scatter', fn: initScatterCharts },
    { name: 'area', fn: initAreaCharts },
    { name: 'advanced', fn: initAdvancedCharts },
    { name: 'performance', fn: initPerformanceCharts },
  ]
  
  for (const { name, fn } of initFunctions) {
    try {
      console.log(`🔄 初始化 ${name} 页面...`)
      const charts = await fn(appState)
      
      // 将图表实例添加到全局状态
      if (charts && typeof charts === 'object') {
        Object.entries(charts).forEach(([key, chart]) => {
          appState.charts.set(`${name}-${key}`, chart)
        })
      }
      
      console.log(`✅ ${name} 页面初始化完成`)
    } catch (error) {
      console.error(`❌ ${name} 页面初始化失败:`, error)
    }
  }
}

/**
 * 窗口大小变化处理
 */
function handleResize() {
  // 防抖处理
  clearTimeout(window.resizeTimer)
  window.resizeTimer = setTimeout(() => {
    appState.charts.forEach((chart, id) => {
      try {
        if (chart && typeof chart.resize === 'function') {
          chart.resize()
        }
      } catch (error) {
        console.warn(`⚠️ 调整图表 ${id} 大小失败:`, error)
      }
    })
  }, 300)
}

/**
 * 页面卸载处理
 */
function handleUnload() {
  // 销毁所有图表实例
  appState.charts.forEach((chart, id) => {
    try {
      if (chart && typeof chart.dispose === 'function') {
        chart.dispose()
      }
    } catch (error) {
      console.warn(`⚠️ 销毁图表 ${id} 失败:`, error)
    }
  })
  
  appState.charts.clear()
  console.log('🧹 所有图表已清理')
}

/**
 * 添加事件监听器
 */
function addEventListeners() {
  window.addEventListener('resize', handleResize)
  window.addEventListener('beforeunload', handleUnload)
  
  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R: 刷新当前页面的图表
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault()
      location.reload()
    }
  })
}

/**
 * 导出全局函数供其他模块使用
 */
window.appState = appState
window.updateAllChartsTheme = updateAllChartsTheme

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  addEventListeners()
  initApp()
})

// 导出应用状态供其他模块使用
export { appState }
