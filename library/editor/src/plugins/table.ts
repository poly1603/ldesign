/**
 * 表格插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'
// import { showTableDialog } from '../ui/TableDialog'

/**
 * 创建表格元素
 */
function createTableElement(rows: number, cols: number): HTMLTableElement {
  const table = document.createElement('table')
  // 不需要内联样式，使用 CSS 文件中的样式
  table.setAttribute('contenteditable', 'true')

  // 创建表头
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  for (let j = 0; j < cols; j++) {
    const th = document.createElement('th')
    th.textContent = `列 ${j + 1}`
    th.setAttribute('contenteditable', 'true')
    headerRow.appendChild(th)
  }
  thead.appendChild(headerRow)
  table.appendChild(thead)

  // 创建表体（rows是数据行数，不包括表头）
  const tbody = document.createElement('tbody')
  for (let i = 0; i < rows; i++) {
    const tr = document.createElement('tr')
    for (let j = 0; j < cols; j++) {
      const td = document.createElement('td')
      td.innerHTML = ''
      td.setAttribute('contenteditable', 'true')
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }
  table.appendChild(tbody)

  return table
}

/**
 * 插入表格
 */
const insertTable: Command = (state, dispatch) => {
  console.log('📋 [Table] insertTable command called')
  console.log('📋 [Table] dispatch:', dispatch ? 'exists' : 'null')
  
  if (!dispatch) {
    console.log('📋 [Table] No dispatch, returning true')
    return true
  }

  console.log('📋 [Table] Creating simple table selector')
  
  try {
    // 创建简单直观的表格选择器
    const overlay = document.createElement('div')
    overlay.className = 'editor-dialog-overlay'
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; z-index: 10000;'
    
    const dialog = document.createElement('div')
    dialog.className = 'editor-dialog editor-table-dialog'
    dialog.style.cssText = 'background: white; border-radius: 8px; padding: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);'
    
    // 创建简单的网格选择器
    dialog.innerHTML = `
      <style>
        .grid-table {
          display: grid;
          grid-template-columns: repeat(10, 24px);
          grid-template-rows: repeat(10, 24px);
          gap: 2px;
          background: #f3f4f6;
          padding: 2px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        .grid-cell {
          background: white;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.1s;
        }
        .grid-cell:hover {
          background: #eff6ff;
          border-color: #3b82f6;
        }
        .grid-cell.selected {
          background: #3b82f6;
          border-color: #2563eb;
        }
        .grid-info {
          margin-top: 8px;
          text-align: center;
          font-size: 14px;
          color: #4b5563;
          font-weight: 500;
        }
        .close-hint {
          margin-top: 4px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
      </style>
      
      <div class="grid-table" id="grid-table"></div>
      <div class="grid-info" id="grid-info">0 × 0</div>
      <div class="close-hint">点击外部区域关闭</div>
    `
    
    overlay.appendChild(dialog)
    document.body.appendChild(overlay)
    
    console.log('📋 [Table] Dialog created and appended')
    
    // 创建网格单元格
    const gridTable = dialog.querySelector('#grid-table') as HTMLElement
    const gridInfo = dialog.querySelector('#grid-info') as HTMLElement
    
    // 创建 10x10 的网格（更合理的默认大小）
    for (let i = 0; i < 100; i++) {
      const cell = document.createElement('div')
      cell.className = 'grid-cell'
      cell.dataset.row = String(Math.floor(i / 10) + 1)
      cell.dataset.col = String((i % 10) + 1)
      gridTable.appendChild(cell)
    }
    
    const closeDialog = () => {
      overlay.remove()
    }
    
    // 插入表格的函数 - 先定义，后使用
    const insertTableWithSize = (rows: number, cols: number) => {
      console.log(`📋 [Table] Inserting table: ${rows}x${cols}`)
      closeDialog()
      
      if (rows < 1 || cols < 1 || rows > 100 || cols > 20) {
        console.log('❌ [Table] Invalid table size')
        return
      }

      // 获取编辑器内容区域
      const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
      if (!editorContent) {
        console.log('❌ [Table] Editor content not found')
        return
      }
      
      // 聚焦到编辑器以确保可以插入
      editorContent.focus()
      
      const selection = window.getSelection()
      console.log('📋 [Table] Selection:', selection)
      
      // 获取或创建一个有效的插入点
      let range: Range
      
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0)
        
        // 检查 range 是否在编辑器内
        if (!editorContent.contains(range.commonAncestorContainer)) {
          console.log('⚠️ [Table] Range outside editor, creating new range')
          
          // 创建一个新的 range 在编辑器末尾
          range = document.createRange()
          
          // 找到最后一个段落或创建一个
          let lastP = editorContent.querySelector('p:last-of-type')
          if (!lastP) {
            lastP = document.createElement('p')
            lastP.innerHTML = '<br>'
            editorContent.appendChild(lastP)
          }
          
          // 将 range 设置在最后一个段落的末尾
          range.selectNodeContents(lastP)
          range.collapse(false)
          
          selection.removeAllRanges()
          selection.addRange(range)
        }
      } else {
        console.log('⚠️ [Table] No selection, creating new range')
        
        // 创建新的选区
        range = document.createRange()
        
        // 找到最后一个段落或创建一个
        let lastP = editorContent.querySelector('p:last-of-type')
        if (!lastP) {
          lastP = document.createElement('p')
          lastP.innerHTML = '<br>'
          editorContent.appendChild(lastP)
        }
        
        range.selectNodeContents(lastP)
        range.collapse(false)
        
        if (!selection) {
          // 如果没有 selection 对象，直接在编辑器末尾插入
          const table = createTableElement(rows, cols)
          const p = document.createElement('p')
          p.innerHTML = '<br>'
          
          editorContent.appendChild(table)
          editorContent.appendChild(p)
          
          console.log('📋 [Table] Table appended directly to editor')
          
          // 触发更新
          const event = new Event('input', { bubbles: true })
          editorContent.dispatchEvent(event)
          return
        }
        
        selection.removeAllRanges()
        selection.addRange(range)
      }

      // 创建表格元素
      const table = createTableElement(rows, cols)
      console.log('📋 [Table] Table element created:', table)
      
      // 调试：检查插入前的状态
      console.log('📋 [Table] Before insertion - Editor HTML length:', editorContent.innerHTML.length)
      console.log('📋 [Table] Before insertion - Editor children:', editorContent.children.length)
      
      // 插入表格
      try {
        // 在当前位置插入表格
        range.deleteContents()
        
        // 如果是在段落中，分割段落
        const container = range.commonAncestorContainer
        if (container.nodeType === Node.TEXT_NODE || 
            (container.nodeType === Node.ELEMENT_NODE && 
             (container as HTMLElement).tagName === 'P')) {
          
          // 在段落后插入表格
          const p = container.nodeType === Node.TEXT_NODE ? 
                    container.parentElement : container as HTMLElement
          
          if (p && p.tagName === 'P') {
            // 在段落后插入
            p.insertAdjacentElement('afterend', table)
            
            // 添加一个新段落
            const newP = document.createElement('p')
            newP.innerHTML = '<br>'
            table.insertAdjacentElement('afterend', newP)
            
            console.log('📋 [Table] Inserted after paragraph')
          } else {
            range.insertNode(table)
            console.log('📋 [Table] Inserted at range')
          }
        } else {
          range.insertNode(table)
          console.log('📋 [Table] Inserted at range')
        }
      } catch (error) {
        console.log('⚠️ [Table] Error inserting, appending to end:', error)
        editorContent.appendChild(table)
      }
      
      // 确保表格后有段落
      let nextP = table.nextElementSibling
      if (!nextP || nextP.tagName !== 'P') {
        nextP = document.createElement('p')
        nextP.innerHTML = '<br>'
        table.insertAdjacentElement('afterend', nextP)
      }
      
      // 调试：检查插入后的状态
      console.log('📋 [Table] After insertion - Table parent:', table.parentElement?.className)
      console.log('📋 [Table] After insertion - Editor HTML length:', editorContent.innerHTML.length)
      console.log('📋 [Table] After insertion - Editor children:', editorContent.children.length)
      console.log('📋 [Table] After insertion - Table in DOM:', document.body.contains(table))
      
      // 验证表格确实在编辑器中
      const tables = editorContent.querySelectorAll('table')
      console.log('📋 [Table] Tables in editor:', tables.length)

      // 将光标设置到表格后的段落，方便继续输入
      setTimeout(() => {
        const newRange = document.createRange()
        newRange.selectNodeContents(nextP)
        newRange.collapse(false) // 光标在段落末尾
        
        const newSelection = window.getSelection()
        if (newSelection) {
          newSelection.removeAllRanges()
          newSelection.addRange(newRange)
          
          // 确保编辑器保持焦点
          editorContent.focus()
          
          console.log('📋 [Table] Cursor set to paragraph after table')
        }
        
        // 滚动到表格位置，确保用户能看到
        table.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 50)

      // 触发更新事件
      const inputEvent = new Event('input', { bubbles: true, cancelable: true })
      const changeEvent = new Event('change', { bubbles: true })
      
      editorContent.dispatchEvent(inputEvent)
      editorContent.dispatchEvent(changeEvent)
      
      console.log('✅ [Table] All events dispatched')
      
      // 延迟再次检查
      setTimeout(() => {
        console.log('📋 [Table] Delayed check - Table still in DOM:', document.body.contains(table))
        console.log('📋 [Table] Delayed check - Editor HTML length:', editorContent.innerHTML.length)
        const tablesAfter = editorContent.querySelectorAll('table')
        console.log('📋 [Table] Delayed check - Tables in editor:', tablesAfter.length)
      }, 100)
    }
    
    // 更新网格选择器显示
    const updateGridSelection = (rows: number, cols: number) => {
      const cells = gridTable.querySelectorAll('.grid-cell')
      cells.forEach((cell) => {
        const cellEl = cell as HTMLElement
        const r = parseInt(cellEl.dataset.row || '0')
        const c = parseInt(cellEl.dataset.col || '0')
        
        if (r <= rows && c <= cols) {
          cellEl.classList.add('selected')
        } else {
          cellEl.classList.remove('selected')
        }
      })
      
      gridInfo.textContent = `${rows} × ${cols}`
    }
    
    // 网格鼠标悬停事件
    gridTable.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('grid-cell')) {
        const rows = parseInt(target.dataset.row || '0')
        const cols = parseInt(target.dataset.col || '0')
        updateGridSelection(rows, cols)
      }
    })
    
    // 网格点击事件 - 直接插入
    gridTable.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('grid-cell')) {
        const rows = parseInt(target.dataset.row || '0')
        const cols = parseInt(target.dataset.col || '0')
        insertTableWithSize(rows, cols)
      }
    })
    
    // 网格鼠标离开事件
    gridTable.addEventListener('mouseleave', () => {
      updateGridSelection(0, 0)
    })
    
    // 点击外部关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDialog()
    })
    
    // ESC 键关闭
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog()
        document.removeEventListener('keydown', handleKeydown)
      }
    }
    document.addEventListener('keydown', handleKeydown)

    console.log('✅ [Table] Dialog setup complete')
  } catch (error) {
    console.error('❌ [Table] Error creating dialog:', error)
    console.error('❌ [Table] Error stack:', (error as Error).stack)
  }

  console.log('✅ [Table] Command returning true')
  return true
}

/**
 * 在表格中添加行
 */
const addTableRow: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  let node = selection.anchorNode
  let tr: HTMLTableRowElement | null = null

  // 查找当前行
  while (node && node !== document.body) {
    if (node.nodeName === 'TR') {
      tr = node as HTMLTableRowElement
      break
    }
    node = node.parentNode
  }

  if (!tr) return false

  // 复制当前行
  const newRow = tr.cloneNode(true) as HTMLTableRowElement
  Array.from(newRow.cells).forEach(cell => {
    cell.textContent = ' '
  })

  tr.parentNode?.insertBefore(newRow, tr.nextSibling)
  return true
}

/**
 * 在表格中添加列
 */
const addTableColumn: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  let node = selection.anchorNode
  let table: HTMLTableElement | null = null

  // 查找表格
  while (node && node !== document.body) {
    if (node.nodeName === 'TABLE') {
      table = node as HTMLTableElement
      break
    }
    node = node.parentNode
  }

  if (!table) return false

  // 在每行末尾添加单元格
  Array.from(table.rows).forEach(row => {
    const cell = row.insertCell(-1)
    cell.textContent = ' '
    cell.style.border = '1px solid #ddd'
    cell.style.padding = '8px'
  })

  return true
}

/**
 * 删除表格
 */
const deleteTable: Command = (state, dispatch) => {
  if (!dispatch) return true

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  let node = selection.anchorNode
  let table: HTMLTableElement | null = null

  while (node && node !== document.body) {
    if (node.nodeName === 'TABLE') {
      table = node as HTMLTableElement
      break
    }
    node = node.parentNode
  }

  if (table) {
    table.remove()
    return true
  }

  return false
}

/**
 * 检查是否在表格中
 */
function isInTable() {
  return () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    let node = selection.anchorNode
    while (node && node !== document.body) {
      if (node.nodeName === 'TABLE') return true
      node = node.parentNode
    }
    return false
  }
}

/**
 * 表格插件
 */
export const TablePlugin: Plugin = createPlugin({
  name: 'table',
  commands: {
    insertTable,
    addTableRow,
    addTableColumn,
    deleteTable
  },
  toolbar: [{
    name: 'table',
    title: '表格',
    icon: 'table',
    command: insertTable,
    active: isInTable()
  }]
})
