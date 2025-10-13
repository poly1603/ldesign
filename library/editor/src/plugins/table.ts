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
  table.className = 'editor-table'
  table.style.borderCollapse = 'collapse'
  table.style.width = '100%'
  table.setAttribute('contenteditable', 'true')

  // 创建表头
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  for (let j = 0; j < cols; j++) {
    const th = document.createElement('th')
    th.textContent = `列 ${j + 1}`
    th.style.border = '1px solid #ddd'
    th.style.padding = '8px'
    th.style.backgroundColor = '#f5f5f5'
    th.style.textAlign = 'left'
    th.style.fontWeight = '600'
    th.setAttribute('contenteditable', 'true')
    headerRow.appendChild(th)
  }
  thead.appendChild(headerRow)
  table.appendChild(thead)

  // 创建表体
  const tbody = document.createElement('tbody')
  for (let i = 0; i < rows - 1; i++) {
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

  console.log('📋 [Table] Creating table dialog inline')
  
  try {
    // 直接内联创建对话框
    const overlay = document.createElement('div')
    overlay.className = 'editor-dialog-overlay'
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;'
    
    const dialog = document.createElement('div')
    dialog.className = 'editor-dialog editor-table-dialog'
    dialog.style.cssText = 'background: white; border-radius: 8px; padding: 20px; min-width: 400px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);'
    
    dialog.innerHTML = `
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
        插入表格
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">表格大小</label>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="number" id="table-rows" min="1" max="50" value="3" style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" placeholder="行数">
          <span style="font-weight: 500; color: #6b7280;">×</span>
          <input type="number" id="table-cols" min="1" max="50" value="3" style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;" placeholder="列数">
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button id="table-cancel" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer;">取消</button>
        <button id="table-insert" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">插入</button>
      </div>
    `
    
    overlay.appendChild(dialog)
    document.body.appendChild(overlay)
    
    console.log('📋 [Table] Dialog created and appended')
    
    // 绑定事件
    const insertBtn = dialog.querySelector('#table-insert')
    const cancelBtn = dialog.querySelector('#table-cancel')
    const rowsInput = dialog.querySelector('#table-rows') as HTMLInputElement
    const colsInput = dialog.querySelector('#table-cols') as HTMLInputElement
    
    const closeDialog = () => {
      overlay.remove()
    }
    
    cancelBtn?.addEventListener('click', closeDialog)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDialog()
    })
    
    insertBtn?.addEventListener('click', () => {
      const rows = parseInt(rowsInput.value) || 3
      const cols = parseInt(colsInput.value) || 3
      console.log(`📋 [Table] Inserting table: ${rows}x${cols}`)
      closeDialog()
      if (rows < 1 || cols < 1) {
        console.log('❌ [Table] Invalid rows or cols')
        return
      }

      const selection = window.getSelection()
      console.log('📋 [Table] Selection:', selection)
      if (!selection || selection.rangeCount === 0) {
        console.log('❌ [Table] No selection')
        return
      }

      const range = selection.getRangeAt(0)
      const table = createTableElement(rows, cols)
      console.log('📋 [Table] Table element created:', table)

      range.deleteContents()
      range.insertNode(table)
      console.log('📋 [Table] Table inserted into DOM')

      // 将光标移动到第一个单元格
      const firstCell = table.querySelector('th, td')
      if (firstCell) {
        const newRange = document.createRange()
        newRange.selectNodeContents(firstCell)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }

      // 触发输入事件以更新编辑器状态
      setTimeout(() => {
        console.log('📋 [Table] setTimeout callback executing')
        // 从document中查找编辑器内容元素
        const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
        console.log('📋 [Table] editorContent found:', editorContent)
        if (editorContent) {
          const event = new Event('input', { bubbles: true, cancelable: true })
          console.log('📋 [Table] Dispatching input event')
          editorContent.dispatchEvent(event)
          console.log('✅ [Table] Event dispatched')
        } else {
          console.log('❌ [Table] No editorContent found in document')
        }
      }, 0)
    })

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
