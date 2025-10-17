/**
 * 表格插件补丁 - 替换原有的插入表格功能
 * 使用新的网格选择器替代输入框
 */

import { showEnhancedTableGridSelector } from '../ui/TableGridSelector'

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
 * 修补原有的表格插入命令
 * 这个函数会在页面加载后替换原有的实现
 */
export function patchTableInsertCommand() {
  console.log('🔧 Patching table insert command...')
  
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchTableInsertCommand)
    return
  }
  
  // 查找所有表格相关的按钮
  const tableButtons = document.querySelectorAll('[data-name="table"], .toolbar-button[title*="表格"], button[title*="表格"]')
  
  tableButtons.forEach(button => {
    // 移除原有的事件监听器（克隆节点的方式）
    const newButton = button.cloneNode(true) as HTMLElement
    button.parentNode?.replaceChild(newButton, button)
    
    // 添加新的点击事件
    newButton.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      console.log('📊 Table button clicked - showing grid selector')
      
      // 获取编辑器内容区域
      const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
      if (!editorContent) {
        console.error('Editor content not found')
        return
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
      
      // 显示网格选择器
      showEnhancedTableGridSelector({
        button: newButton,
        onSelect: (rows: number, cols: number) => {
          console.log(`Inserting ${rows}×${cols} table`)
          
          // 验证尺寸
          if (rows < 1 || cols < 1 || rows > 50 || cols > 20) {
            console.error('Invalid table size')
            return
          }
          
          // 创建表格
          const tableWrapper = createTableElement(rows, cols)
          
          // 聚焦编辑器
          editorContent.focus()
          
          // 插入表格
          if (savedRange) {
            const currentSelection = window.getSelection()
            if (currentSelection) {
              currentSelection.removeAllRanges()
              currentSelection.addRange(savedRange)
              
              try {
                savedRange.deleteContents()
                
                const container = savedRange.commonAncestorContainer
                const parentElement = container.nodeType === Node.TEXT_NODE 
                  ? container.parentElement 
                  : container as HTMLElement
                
                if (parentElement && parentElement.tagName === 'P') {
                  parentElement.insertAdjacentElement('afterend', tableWrapper)
                  
                  const newP = document.createElement('p')
                  newP.innerHTML = '<br>'
                  tableWrapper.insertAdjacentElement('afterend', newP)
                  
                  setTimeout(() => {
                    const newRange = document.createRange()
                    newRange.selectNodeContents(newP)
                    newRange.collapse(false)
                    currentSelection.removeAllRanges()
                    currentSelection.addRange(newRange)
                  }, 50)
                } else {
                  savedRange.insertNode(tableWrapper)
                }
              } catch (error) {
                console.error('Error inserting table:', error)
                editorContent.appendChild(tableWrapper)
              }
            }
          } else {
            // 追加到末尾
            const lastElement = editorContent.lastElementChild
            if (lastElement && lastElement.tagName === 'P') {
              lastElement.insertAdjacentElement('afterend', tableWrapper)
            } else {
              editorContent.appendChild(tableWrapper)
            }
            
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
    })
    
    console.log('✅ Patched table button:', newButton)
  })
  
  // 同时尝试拦截命令调用
  const originalExecCommand = document.execCommand
  document.execCommand = function(command: string, ...args: any[]) {
    if (command === 'insertTable') {
      console.log('🔧 Intercepted insertTable command')
      // 触发表格按钮点击
      const tableButton = document.querySelector('[data-name="table"]') as HTMLElement
      if (tableButton) {
        tableButton.click()
      }
      return true
    }
    return originalExecCommand.apply(document, [command, ...args] as any)
  }
  
  console.log('✅ Table insertion patched successfully')
}

// 自动应用补丁
if (typeof window !== 'undefined') {
  // 延迟执行，确保其他脚本已加载
  setTimeout(() => {
    patchTableInsertCommand()
  }, 100)
  
  // 监听动态加载的内容
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const addedNodes = Array.from(mutation.addedNodes)
        const hasTableButton = addedNodes.some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            return element.matches('[data-name="table"]') || 
                   element.querySelector('[data-name="table"]')
          }
          return false
        })
        
        if (hasTableButton) {
          setTimeout(() => patchTableInsertCommand(), 100)
        }
      }
    }
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}