/**
 * LDesign Flowchart JavaScript 示例
 * 演示如何在原生 JavaScript 项目中使用流程图编辑器
 *
 * 本示例展示了：
 * 1. 基础的流程图编辑器初始化
 * 2. 完整的UI组件（物料面板、属性面板、工具栏）
 * 3. 节点拖拽和属性编辑功能
 * 4. 主题切换和数据导出
 */

import { FlowchartEditor, FlowchartAPI } from '@ldesign/flowchart'

// 全局变量
let editor = null

/**
 * 初始化流程图编辑器（带完整UI）
 */
function initFlowchart() {
  try {
    // 创建编辑器实例，启用完整UI组件
    editor = new FlowchartEditor({
      container: '#flowchart',
      width: 1160,
      height: 600,
      // 启用所有UI组件
      toolbar: {
        visible: true,
        tools: ['select', 'zoom-fit', 'undo', 'redo', 'delete']
      },
      nodePanel: {
        visible: true,
        position: 'left'
      },
      propertyPanel: {
        visible: true,
        position: 'right'
      },
      // 主题配置
      theme: 'default',
      // 画布配置
      background: {
        color: '#fafafa'
      },
      grid: {
        visible: true,
        size: 20,
        color: '#e5e5e5'
      }
    })

    // 监听节点点击事件
    editor.on('node:click', (data) => {
      console.log('节点被点击:', data)
      updateDataOutput()
    })

    // 监听边点击事件
    editor.on('edge:click', (data) => {
      console.log('边被点击:', data)
      updateDataOutput()
    })

    // 监听数据变化事件
    editor.on('data:change', (data) => {
      console.log('流程图数据已更新')
      updateDataOutput()
    })

    // 监听节点选中事件（用于属性面板）
    editor.on('node:select', (data) => {
      console.log('节点被选中:', data)
    })

    // 监听主题变化事件
    editor.on('theme:change', (theme) => {
      console.log('主题已切换:', theme)
      // 同步更新主题选择器
      const themeSelect = document.getElementById('themeSelect')
      if (themeSelect) {
        themeSelect.value = theme
      }
    })

    // 渲染编辑器
    editor.render()

    console.log('✅ 流程图编辑器初始化成功')
    console.log('💡 提示：')
    console.log('  - 从左侧物料面板拖拽节点到画布')
    console.log('  - 点击节点查看右侧属性面板')
    console.log('  - 使用顶部工具栏进行操作')
  } catch (error) {
    console.error('❌ 流程图编辑器初始化失败:', error)
  }
}

/**
 * 切换只读模式
 */
function toggleReadonly() {
  if (!editor) return

  const currentReadonly = editor.isReadonly()
  editor.setReadonly(!currentReadonly)

  console.log(`✅ 切换到${!currentReadonly ? '只读' : '编辑'}模式`)
}

/**
 * 切换主题
 */
function changeTheme(theme) {
  if (!editor) return
  
  try {
    editor.setTheme(theme)
    console.log(`✅ 主题已切换为: ${theme}`)
  } catch (error) {
    console.error('❌ 主题切换失败:', error)
  }
}

/**
 * 导出数据
 */
function exportData() {
  if (!editor) return
  
  const data = editor.getData()
  updateDataOutput(data)
  
  // 也可以下载为文件
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'flowchart-data.json'
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('✅ 数据已导出')
}

/**
 * 加载审批流程模板
 */
function loadTemplate() {
  if (!editor) return

  try {
    // 使用API创建简单的审批流程模板
    const template = FlowchartAPI.createApprovalTemplate()
    editor.setData(template)
    updateDataOutput()
    console.log('✅ 审批流程模板已加载')
    console.log('📋 模板包含:', template.nodes.length, '个节点，', template.edges.length, '条连线')
  } catch (error) {
    console.error('❌ 模板加载失败:', error)

    // 如果API失败，手动创建简单模板
    try {
      editor.clearData()

      const startId = editor.addNode({
        type: 'start',
        x: 100,
        y: 200,
        text: '开始'
      })

      const approvalId = editor.addNode({
        type: 'approval',
        x: 300,
        y: 200,
        text: '部门审批',
        properties: {
          approver: '部门经理',
          status: 'pending'
        }
      })

      const endId = editor.addNode({
        type: 'end',
        x: 500,
        y: 200,
        text: '结束'
      })

      // 添加连接线
      editor.addEdge({
        sourceNodeId: startId,
        targetNodeId: approvalId,
        text: '提交'
      })

      editor.addEdge({
        sourceNodeId: approvalId,
        targetNodeId: endId,
        text: '通过'
      })

      updateDataOutput()
      console.log('✅ 手动创建的简单模板已加载')
    } catch (manualError) {
      console.error('❌ 手动创建模板也失败:', manualError)
    }
  }
}

/**
 * 更新数据显示
 */
function updateDataOutput(data = null) {
  const outputElement = document.getElementById('dataOutput')
  if (!outputElement) return
  
  const flowchartData = data || (editor ? editor.getData() : null)
  if (flowchartData) {
    outputElement.textContent = JSON.stringify(flowchartData, null, 2)
  }
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
  // 工具栏按钮事件
  document.getElementById('exportData')?.addEventListener('click', exportData)
  document.getElementById('loadTemplate')?.addEventListener('click', loadTemplate)

  // 主题切换事件
  document.getElementById('themeSelect')?.addEventListener('change', (e) => {
    changeTheme(e.target.value)
  })

  console.log('✅ 事件监听器已绑定')
}

/**
 * 应用程序入口
 */
function main() {
  console.log('🚀 LDesign Flowchart JavaScript 示例启动')
  
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindEventListeners()
      initFlowchart()
    })
  } else {
    bindEventListeners()
    initFlowchart()
  }
}

// 启动应用
main()

// 导出到全局作用域（用于调试）
window.flowchartDemo = {
  editor,
  changeTheme,
  exportData,
  loadTemplate,
  toggleReadonly,
  // 调试函数
  getEditor: () => editor,
  getData: () => editor?.getData(),
  setData: (data) => editor?.setData(data),
  addNode: (config) => editor?.addNode(config),
  addEdge: (config) => editor?.addEdge(config)
}
