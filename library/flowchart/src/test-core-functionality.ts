/**
 * 核心功能测试
 * 
 * 验证重构后的核心功能是否正常工作
 */

import { FlowchartEditor } from './core/FlowchartEditor'
import { UpdateScheduler } from './core/UpdateScheduler'
import { ViewportService } from './core/ViewportService'
import { PluginManager } from './plugins/PluginManager'
import { ThemeManager } from './themes/ThemeManager'
import { TemplateManager } from './templates/TemplateManager'
import { MaterialRepositoryManager } from './materials/MaterialRepositoryManager'
import { PerformanceMonitor } from './performance/PerformanceMonitor'
import { defaultConfig } from './config/defaultConfig'

/**
 * 测试核心功能
 */
export async function testCoreFunctionality(): Promise<boolean> {
  console.log('开始核心功能测试...')
  
  try {
    // 1. 测试 UpdateScheduler
    console.log('1. 测试 UpdateScheduler...')
    const updateScheduler = new UpdateScheduler()
    let updateCount = 0
    
    updateScheduler.scheduleUpdate(() => {
      updateCount++
    })
    
    updateScheduler.scheduleUpdate(() => {
      updateCount++
    })
    
    // 等待批量更新
    await new Promise(resolve => setTimeout(resolve, 20))
    
    if (updateCount !== 2) {
      throw new Error(`UpdateScheduler 测试失败: 期望更新 2 次，实际更新 ${updateCount} 次`)
    }
    console.log('✓ UpdateScheduler 测试通过')
    
    // 2. 测试 ViewportService
    console.log('2. 测试 ViewportService...')
    const viewportService = new ViewportService()
    
    // 设置视口
    viewportService.setViewport({ x: 100, y: 100, width: 800, height: 600 })
    const viewport = viewportService.getViewport()
    
    if (viewport.x !== 100 || viewport.y !== 100 || viewport.width !== 800 || viewport.height !== 600) {
      throw new Error('ViewportService 设置视口失败')
    }
    
    // 测试缩放
    viewportService.setZoom(1.5)
    if (viewportService.getZoom() !== 1.5) {
      throw new Error('ViewportService 设置缩放失败')
    }
    console.log('✓ ViewportService 测试通过')
    
    // 3. 测试 PluginManager
    console.log('3. 测试 PluginManager...')
    const pluginManager = new PluginManager()
    
    // 测试插件注册
    const testPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: () => {},
      uninstall: () => {}
    }
    
    pluginManager.register(testPlugin)
    const plugins = pluginManager.getRegisteredPlugins()
    
    if (!plugins.find(p => p.name === 'test-plugin')) {
      throw new Error('PluginManager 注册插件失败')
    }
    console.log('✓ PluginManager 测试通过')
    
    // 4. 测试 ThemeManager
    console.log('4. 测试 ThemeManager...')
    const themeManager = new ThemeManager()
    
    // 测试主题切换
    themeManager.setTheme('dark')
    if (themeManager.getCurrentTheme() !== 'dark') {
      throw new Error('ThemeManager 切换主题失败')
    }
    console.log('✓ ThemeManager 测试通过')
    
    // 5. 测试 TemplateManager
    console.log('5. 测试 TemplateManager...')
    const templateManager = new TemplateManager()
    
    // 测试模板获取
    const templates = templateManager.getTemplates()
    if (!Array.isArray(templates)) {
      throw new Error('TemplateManager 获取模板失败')
    }
    console.log('✓ TemplateManager 测试通过')
    
    // 6. 测试 MaterialRepositoryManager
    console.log('6. 测试 MaterialRepositoryManager...')
    const materialManager = new MaterialRepositoryManager()
    
    // 测试材料库获取
    const repositories = materialManager.getRepositories()
    if (!Array.isArray(repositories)) {
      throw new Error('MaterialRepositoryManager 获取材料库失败')
    }
    console.log('✓ MaterialRepositoryManager 测试通过')
    
    // 7. 测试 PerformanceMonitor
    console.log('7. 测试 PerformanceMonitor...')
    const performanceMonitor = new PerformanceMonitor()
    
    // 测试性能监控
    performanceMonitor.startMeasure('test-operation')
    await new Promise(resolve => setTimeout(resolve, 10))
    performanceMonitor.endMeasure('test-operation')
    
    const report = performanceMonitor.getReport()
    if (!report.measurements || !report.measurements['test-operation']) {
      throw new Error('PerformanceMonitor 性能监控失败')
    }
    console.log('✓ PerformanceMonitor 测试通过')
    
    // 8. 测试 FlowchartEditor 基本功能
    console.log('8. 测试 FlowchartEditor 基本功能...')
    
    // 创建容器元素
    const container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
    
    try {
      const editor = new FlowchartEditor(container, defaultConfig)
      
      // 测试基本方法
      const data = editor.getGraphData()
      if (!data || typeof data !== 'object') {
        throw new Error('FlowchartEditor 获取图数据失败')
      }
      
      // 测试添加节点
      const nodeId = editor.addNode({
        type: 'start',
        x: 100,
        y: 100,
        text: '开始'
      })
      
      if (!nodeId) {
        throw new Error('FlowchartEditor 添加节点失败')
      }
      
      console.log('✓ FlowchartEditor 基本功能测试通过')
      
      // 清理
      editor.destroy()
    } finally {
      document.body.removeChild(container)
    }
    
    console.log('✅ 所有核心功能测试通过！')
    return true
    
  } catch (error) {
    console.error('❌ 核心功能测试失败:', error)
    return false
  }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  document.addEventListener('DOMContentLoaded', () => {
    testCoreFunctionality().then(success => {
      console.log(success ? '测试成功' : '测试失败')
    })
  })
} else {
  // Node.js 环境
  console.log('请在浏览器环境中运行此测试')
}
