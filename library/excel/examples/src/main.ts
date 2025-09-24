/**
 * Excel编辑器示例主文件
 */

import { createExcelEditor, createEmptyWorkbook, type ExcelEditor } from '@ldesign/excel-editor'

// 全局变量
let editor: ExcelEditor | null = null

/**
 * 显示状态消息
 * @param message 消息内容
 * @param type 消息类型
 */
function showStatus(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
  const statusElement = document.getElementById('status')
  if (statusElement) {
    statusElement.textContent = message
    statusElement.className = `status ${type}`
    statusElement.style.display = 'block'
    
    // 3秒后自动隐藏
    setTimeout(() => {
      statusElement.style.display = 'none'
    }, 3000)
  }
}

/**
 * 创建新的Excel编辑器
 */
function createNewEditor(): void {
  try {
    // 销毁现有编辑器
    if (editor) {
      editor.destroy()
    }
    
    // 创建空工作簿
    const workbook = createEmptyWorkbook('Sheet1', 100, 26)
    
    // 创建编辑器
    editor = createExcelEditor({
      container: '#excel-container',
      data: workbook,
      theme: 'light',
      showGridlines: true,
      showRowNumbers: true,
      showColumnHeaders: true,
      enableFormulas: false, // 暂时禁用公式功能
      enableUndo: true,
      maxUndoSteps: 50
    })
    
    // 绑定事件监听器
    bindEditorEvents()
    
    showStatus('新建表格成功！', 'success')
  } catch (error) {
    console.error('创建编辑器失败:', error)
    showStatus('创建编辑器失败，请检查控制台错误信息', 'error')
  }
}

/**
 * 绑定编辑器事件
 */
function bindEditorEvents(): void {
  if (!editor) return
  
  // 单元格变化事件
  editor.on('cellChange', (data) => {
    console.log('单元格变化:', data)
  })
  
  // 单元格选择事件
  editor.on('cellSelect', (data) => {
    console.log('单元格选择:', data)
  })
  
  // 编辑事件
  editor.on('beforeEdit', (data) => {
    console.log('开始编辑:', data)
  })
  
  editor.on('afterEdit', (data) => {
    console.log('编辑完成:', data)
  })
  
  // 错误事件
  editor.on('error', (data) => {
    console.error('编辑器错误:', data.error)
    showStatus(`错误: ${data.error?.message}`, 'error')
  })
}

/**
 * 添加示例数据
 */
function addSampleData(): void {
  if (!editor) {
    showStatus('请先创建表格', 'error')
    return
  }
  
  try {
    // 添加表头
    editor.setCellValue({ row: 0, column: 0 }, '姓名')
    editor.setCellValue({ row: 0, column: 1 }, '年龄')
    editor.setCellValue({ row: 0, column: 2 }, '城市')
    editor.setCellValue({ row: 0, column: 3 }, '职业')
    editor.setCellValue({ row: 0, column: 4 }, '薪资')
    
    // 添加示例数据
    const sampleData = [
      ['张三', 28, '北京', '软件工程师', 15000],
      ['李四', 32, '上海', '产品经理', 18000],
      ['王五', 25, '深圳', '设计师', 12000],
      ['赵六', 30, '杭州', '数据分析师', 14000],
      ['钱七', 35, '广州', '项目经理', 20000]
    ]
    
    sampleData.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        editor!.setCellValue({ row: rowIndex + 1, column: colIndex }, value)
      })
    })
    
    showStatus('示例数据添加成功！', 'success')
  } catch (error) {
    console.error('添加示例数据失败:', error)
    showStatus('添加示例数据失败', 'error')
  }
}

/**
 * 清空数据
 */
function clearData(): void {
  if (!editor) {
    showStatus('请先创建表格', 'error')
    return
  }
  
  try {
    // 创建新的空工作簿
    const workbook = createEmptyWorkbook('Sheet1', 100, 26)
    editor.setData(workbook)
    
    showStatus('数据清空成功！', 'success')
  } catch (error) {
    console.error('清空数据失败:', error)
    showStatus('清空数据失败', 'error')
  }
}

/**
 * 导出Excel文件
 */
async function exportExcel(): Promise<void> {
  if (!editor) {
    showStatus('请先创建表格', 'error')
    return
  }
  
  try {
    showStatus('正在导出Excel文件...', 'info')
    
    const filename = `excel-export-${new Date().toISOString().slice(0, 10)}.xlsx`
    await editor.exportToExcel(filename)
    
    showStatus('Excel文件导出成功！', 'success')
  } catch (error) {
    console.error('导出Excel失败:', error)
    showStatus('导出Excel失败，请检查控制台错误信息', 'error')
  }
}

/**
 * 导入Excel文件
 */
async function importExcel(file: File): Promise<void> {
  if (!editor) {
    showStatus('请先创建表格', 'error')
    return
  }
  
  try {
    showStatus('正在导入Excel文件...', 'info')
    
    await editor.importFromExcel(file)
    
    showStatus('Excel文件导入成功！', 'success')
  } catch (error) {
    console.error('导入Excel失败:', error)
    showStatus('导入Excel失败，请检查文件格式', 'error')
  }
}

/**
 * 初始化应用
 */
function initApp(): void {
  // 绑定按钮事件
  const createNewBtn = document.getElementById('createNew')
  const addDataBtn = document.getElementById('addData')
  const clearDataBtn = document.getElementById('clearData')
  const exportBtn = document.getElementById('exportExcel')
  const importInput = document.getElementById('importFile') as HTMLInputElement
  
  if (createNewBtn) {
    createNewBtn.addEventListener('click', createNewEditor)
  }
  
  if (addDataBtn) {
    addDataBtn.addEventListener('click', addSampleData)
  }
  
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', clearData)
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportExcel)
  }
  
  if (importInput) {
    importInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        importExcel(file)
      }
    })
  }
  
  // 自动创建初始编辑器
  createNewEditor()
  
  console.log('Excel编辑器示例应用初始化完成')
}

// 等待DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

// 导出到全局作用域（用于调试）
;(window as any).editor = () => editor
;(window as any).createNewEditor = createNewEditor
;(window as any).addSampleData = addSampleData
