/**
 * 增强的表格插件 - 使用下拉网格选择器
 */

import { createPlugin, Plugin, Command } from '../core/Plugin'
import { showTableGridSelector, showEnhancedTableGridSelector } from '../ui/TableGridSelector'

/**
 * 创建表格元素
 */
function createTableElement(rows: number, cols: number): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'table-wrapper'
  wrapper.style.position = 'relative'
  wrapper.style.display = 'inline-block'
  wrapper.style.margin = '10px 0'
  
  const table = document.createElement('table')
  table.style.borderCollapse = 'collapse'
  table.style.width = '100%'
  
  // 创建表头
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  for (let j = 0; j < cols; j++) {
    const th = document.createElement('th')
    th.textContent = `列 ${j + 1}`
    th.style.border = '1px solid #ddd'
    th.style.padding = '8px'
    th.style.backgroundColor = '#f5f5f5'
    th.setAttribute('contenteditable', 'true')
    headerRow.appendChild(th)
  }
  thead.appendChild(headerRow)
  table.appendChild(thead)

  // 创建表体
  const tbody = document.createElement('tbody')
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr')
    for (let j = 0; j < cols; j++) {
      const td = document.createElement('td')
      td.innerHTML = '&nbsp;'
      td.style.border = '1px solid #ddd'
      td.style.padding = '8px'
      td.setAttribute('contenteditable', 'true')
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }
  table.appendChild(tbody)
  
  wrapper.appendChild(table)
  return wrapper
}

/**
 * 插入表格命令
 */
const insertTableEnhanced: Command = (state, dispatch) => {
  console.log('📊 [Enhanced Table] Command called')
  
  if (!dispatch) return true

  // 获取编辑器内容区域
  const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
  if (!editorContent) {
    console.error('❌ Editor content not found')
    return false
  }

  // 保存当前选区
  const selection = window.getSelection()
  let savedRange: Range | null = null
  
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    if (editorContent.contains(range.commonAncestorContainer)) {
      savedRange = range.cloneRange()
    }
  }

  // 查找表格按钮
  const tableButton = document.querySelector('[data-name="enhancedTable"]') || 
                      document.querySelector('[data-name="table"]') as HTMLElement

  // 显示增强的网格选择器
  showEnhancedTableGridSelector({
    button: tableButton,
    onSelect: (rows: number, cols: number) => {
      console.log(`📊 Inserting ${rows}x${cols} table`)
      
      // 验证尺寸
      if (rows < 1 || cols < 1 || rows > 50 || cols > 20) {
        console.error('Invalid table size')
        return
      }

      // 创建表格元素
      const tableWrapper = createTableElement(rows, cols)
      
      // 聚焦编辑器
      editorContent.focus()
      
      // 插入表格
      if (savedRange) {
        // 恢复保存的选区
        const currentSelection = window.getSelection()
        if (currentSelection) {
          currentSelection.removeAllRanges()
          currentSelection.addRange(savedRange)
          
          try {
            // 清除选中内容
            savedRange.deleteContents()
            
            // 获取容器元素
            const container = savedRange.commonAncestorContainer
            const parentElement = container.nodeType === Node.TEXT_NODE 
              ? container.parentElement 
              : container as HTMLElement
              
            if (parentElement && parentElement.tagName === 'P') {
              // 在段落后插入
              parentElement.insertAdjacentElement('afterend', tableWrapper)
              
              // 添加新段落供继续输入
              const newP = document.createElement('p')
              newP.innerHTML = '<br>'
              tableWrapper.insertAdjacentElement('afterend', newP)
              
              // 将光标移到新段落
              setTimeout(() => {
                const newRange = document.createRange()
                newRange.selectNodeContents(newP)
                newRange.collapse(false)
                currentSelection.removeAllRanges()
                currentSelection.addRange(newRange)
              }, 50)
            } else {
              // 直接插入
              savedRange.insertNode(tableWrapper)
            }
          } catch (error) {
            console.error('Error inserting table:', error)
            // 失败时追加到末尾
            editorContent.appendChild(tableWrapper)
          }
        }
      } else {
        // 没有选区时追加到末尾
        const lastElement = editorContent.lastElementChild
        if (lastElement && lastElement.tagName === 'P') {
          lastElement.insertAdjacentElement('afterend', tableWrapper)
        } else {
          editorContent.appendChild(tableWrapper)
        }
        
        // 添加新段落
        const newP = document.createElement('p')
        newP.innerHTML = '<br>'
        tableWrapper.insertAdjacentElement('afterend', newP)
      }
      
      // 触发更新事件
      const event = new Event('input', { bubbles: true })
      editorContent.dispatchEvent(event)
      
      // 滚动到表格
      tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      
      console.log('✅ Table inserted successfully')
    }
  })

  return true
}

/**
 * 增强的表格插件
 */
export const EnhancedTablePlugin: Plugin = createPlugin({
  name: 'enhancedTable',
  commands: {
    insertTableEnhanced
  },
  toolbar: [{
    name: 'enhancedTable',
    title: '插入表格（增强版）',
    icon: 'table',
    command: insertTableEnhanced
  }]
})