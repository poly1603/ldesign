/**
 * 表格插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'
// import { showTableDialog } from '../ui/TableDialog'

/**
 * 创建表格右键菜单
 */
function createTableContextMenu(table: HTMLTableElement, x: number, y: number) {
  // 移除已存在的菜单
  const existingMenu = document.querySelector('.table-context-menu')
  if (existingMenu) {
    existingMenu.remove()
  }

  const menu = document.createElement('div')
  menu.className = 'table-context-menu'
  menu.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 4px 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10001;
    min-width: 160px;
  `

  const menuItems = [
    { text: '在上方插入行', icon: '⬆', action: () => insertRowAbove(table) },
    { text: '在下方插入行', icon: '⬇', action: () => insertRowBelow(table) },
    { text: '在左侧插入列', icon: '⬅', action: () => insertColumnLeft(table) },
    { text: '在右侧插入列', icon: '➡', action: () => insertColumnRight(table) },
    { divider: true },
    { text: '删除当前行', icon: '🗑', action: () => deleteCurrentRow(table) },
    { text: '删除当前列', icon: '🗑', action: () => deleteCurrentColumn(table) },
    { divider: true },
    { text: '删除表格', icon: '❌', action: () => deleteEntireTable(table) }
  ]

  menuItems.forEach(item => {
    if (item.divider) {
      const divider = document.createElement('div')
      divider.style.cssText = 'height: 1px; background: #e5e7eb; margin: 4px 8px;'
      menu.appendChild(divider)
    } else {
      const menuItem = document.createElement('div')
      menuItem.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #374151;
        transition: background 0.2s;
      `
      menuItem.innerHTML = `<span style="width: 16px; text-align: center;">${item.icon}</span><span>${item.text}</span>`
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.background = '#f3f4f6'
      })
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.background = 'transparent'
      })
      menuItem.addEventListener('click', () => {
        item.action!()
        menu.remove()
      })
      menu.appendChild(menuItem)
    }
  })

  document.body.appendChild(menu)

  // 点击其他地方关闭菜单
  const closeMenu = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove()
      document.removeEventListener('click', closeMenu)
    }
  }
  setTimeout(() => {
    document.addEventListener('click', closeMenu)
  }, 0)
}

// 获取当前单元格位置
function getCellPosition(cell: HTMLElement): { row: number; col: number } | null {
  if (!cell || (!cell.matches('td') && !cell.matches('th'))) return null
  
  const row = cell.parentElement as HTMLTableRowElement
  const rowIndex = Array.from(row.parentElement!.children).indexOf(row)
  const colIndex = Array.from(row.children).indexOf(cell)
  
  return { row: rowIndex, col: colIndex }
}

// 在上方插入行
function insertRowAbove(table: HTMLTableElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  let node = selection.anchorNode
  let targetRow: HTMLTableRowElement | null = null
  
  while (node && node !== table) {
    if (node.nodeName === 'TR') {
      targetRow = node as HTMLTableRowElement
      break
    }
    node = node.parentNode
  }
  
  if (!targetRow) return
  
  const newRow = targetRow.cloneNode(true) as HTMLTableRowElement
  Array.from(newRow.cells).forEach(cell => {
    cell.innerHTML = '&nbsp;'
  })
  targetRow.parentNode?.insertBefore(newRow, targetRow)
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 在下方插入行
function insertRowBelow(table: HTMLTableElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  let node = selection.anchorNode
  let targetRow: HTMLTableRowElement | null = null
  
  while (node && node !== table) {
    if (node.nodeName === 'TR') {
      targetRow = node as HTMLTableRowElement
      break
    }
    node = node.parentNode
  }
  
  if (!targetRow) return
  
  const newRow = targetRow.cloneNode(true) as HTMLTableRowElement
  Array.from(newRow.cells).forEach(cell => {
    cell.innerHTML = '&nbsp;'
  })
  targetRow.parentNode?.insertBefore(newRow, targetRow.nextSibling)
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 在左侧插入列
function insertColumnLeft(table: HTMLTableElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  let node = selection.anchorNode
  let targetCell: HTMLElement | null = null
  
  while (node && node !== table) {
    if (node.nodeName === 'TD' || node.nodeName === 'TH') {
      targetCell = node as HTMLElement
      break
    }
    node = node.parentNode
  }
  
  if (!targetCell) return
  
  const position = getCellPosition(targetCell)
  if (!position) return
  
  // 在每一行的对应位置插入单元格
  Array.from(table.rows).forEach(row => {
    const newCell = row.cells[position.col].cloneNode(false) as HTMLElement
    newCell.innerHTML = '&nbsp;'
    newCell.setAttribute('contenteditable', 'true')
    row.insertBefore(newCell, row.cells[position.col])
  })
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 在右侧插入列
function insertColumnRight(table: HTMLTableElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  let node = selection.anchorNode
  let targetCell: HTMLElement | null = null
  
  while (node && node !== table) {
    if (node.nodeName === 'TD' || node.nodeName === 'TH') {
      targetCell = node as HTMLElement
      break
    }
    node = node.parentNode
  }
  
  if (!targetCell) return
  
  const position = getCellPosition(targetCell)
  if (!position) return
  
  // 在每一行的对应位置插入单元格
  Array.from(table.rows).forEach(row => {
    const newCell = row.cells[position.col].cloneNode(false) as HTMLElement
    newCell.innerHTML = '&nbsp;'
    newCell.setAttribute('contenteditable', 'true')
    if (position.col + 1 < row.cells.length) {
      row.insertBefore(newCell, row.cells[position.col + 1])
    } else {
      row.appendChild(newCell)
    }
  })
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 删除当前行
function deleteCurrentRow(table: HTMLTableElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  let node = selection.anchorNode
  let targetRow: HTMLTableRowElement | null = null
  
  while (node && node !== table) {
    if (node.nodeName === 'TR') {
      targetRow = node as HTMLTableRowElement
      break
    }
    node = node.parentNode
  }
  
  if (!targetRow) return
  
  // 至少保留一行
  const tbody = targetRow.parentElement
  if (tbody && tbody.children.length > 1) {
    targetRow.remove()
    
    // 触发更新
    const event = new Event('input', { bubbles: true })
    table.dispatchEvent(event)
  }
}

// 删除当前列
function deleteCurrentColumn(table: HTMLTableElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  let node = selection.anchorNode
  let targetCell: HTMLElement | null = null
  
  while (node && node !== table) {
    if (node.nodeName === 'TD' || node.nodeName === 'TH') {
      targetCell = node as HTMLElement
      break
    }
    node = node.parentNode
  }
  
  if (!targetCell) return
  
  const position = getCellPosition(targetCell)
  if (!position) return
  
  // 至少保留一列
  const firstRow = table.rows[0]
  if (firstRow && firstRow.cells.length > 1) {
    // 从每一行删除对应位置的单元格
    Array.from(table.rows).forEach(row => {
      if (row.cells[position.col]) {
        row.cells[position.col].remove()
      }
    })
    
    // 触发更新
    const event = new Event('input', { bubbles: true })
    table.dispatchEvent(event)
  }
}

// 删除整个表格
function deleteEntireTable(table: HTMLTableElement) {
  table.remove()
  
  // 触发更新
  const editorContent = document.querySelector('.ldesign-editor-content')
  if (editorContent) {
    const event = new Event('input', { bubbles: true })
    editorContent.dispatchEvent(event)
  }
}

/**
 * 创建表格元素
 */
function createTableElement(rows: number, cols: number): HTMLTableElement {
  const table = document.createElement('table')
  // 不需要内联样式，使用 CSS 文件中的样式
  table.setAttribute('contenteditable', 'true')
  
  // 添加右键菜单事件
  table.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    createTableContextMenu(table, e.clientX, e.clientY)
  })

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
      // 添加默认内容以确保单元格有高度
      td.innerHTML = '&nbsp;'
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
  
  // 在显示对话框之前，先保存当前的选区
  const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
  if (!editorContent) {
    console.log('❌ [Table] Editor content not found')
    return false
  }
  
  // 保存当前的选区信息
  const originalSelection = window.getSelection()
  let savedRange: Range | null = null
  
  if (originalSelection && originalSelection.rangeCount > 0) {
    const range = originalSelection.getRangeAt(0)
    if (editorContent.contains(range.commonAncestorContainer)) {
      // 克隆range以保存位置
      savedRange = range.cloneRange()
      console.log('📋 [Table] Saved selection range:', savedRange)
    }
  }
  
  try {
    // 查找表格按钮，用于定位弹窗
    const tableButton = document.querySelector('[data-name="table"]') as HTMLElement
    console.log('📋 [Table] Table button found:', !!tableButton)
    
    // 创建简单直观的表格选择器
    const overlay = document.createElement('div')
    overlay.className = 'editor-dialog-overlay editor-table-overlay'
    // 透明背景，点击外部关闭
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: transparent; z-index: 10000;'
    
    const dialog = document.createElement('div')
    dialog.className = 'editor-dialog editor-table-dialog'
    
    // 根据表格按钮定位弹窗，并确保不超出屏幕
    if (tableButton) {
      const rect = tableButton.getBoundingClientRect()
      
      // 先添加到DOM以获取实际尺寸
      dialog.style.cssText = `
        position: fixed;
        left: -9999px;
        top: -9999px;
        background: white;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
        visibility: hidden;
        max-width: 260px;
      `
      overlay.appendChild(dialog)
      document.body.appendChild(overlay)
      
      // 获取实际尺寸
      const dialogWidth = dialog.offsetWidth
      const dialogHeight = dialog.offsetHeight
      console.log('📋 [Table] Dialog actual size:', dialogWidth, 'x', dialogHeight)
      
      // 计算初始位置
      let left = rect.left
      let top = rect.bottom + 8
      
      // 检查右边界
      const rightOverflow = (left + dialogWidth) - window.innerWidth
      if (rightOverflow > 0) {
        left = left - rightOverflow - 16
      }
      
      // 检查左边界
      if (left < 16) {
        left = 16
      }
      
      // 检查底部边界
      const bottomOverflow = (top + dialogHeight) - window.innerHeight
      if (bottomOverflow > 0) {
        // 如果下方空间不足，显示在按钮上方
        const topPosition = rect.top - dialogHeight - 8
        if (topPosition >= 16) {
          top = topPosition
        } else {
          // 上方也不足，显示在视口中间偏上
          top = Math.max(16, (window.innerHeight - dialogHeight) / 2 - 50)
        }
      }
      
      // 检查顶部边界
      if (top < 16) {
        top = 16
      }
      
      console.log('📋 [Table] Final position:', left, top)
      
      // 应用最终位置
      dialog.style.cssText = `
        position: fixed;
        left: ${left}px;
        top: ${top}px;
        background: white;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
        visibility: visible;
        max-width: 260px;
      `
      
      // 已经添加到DOM，不需要再次添加
    } else {
      // 如果没找到按钮，居中显示
      dialog.style.cssText = 'position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; border-radius: 8px; padding: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); border: 1px solid #e5e7eb; max-width: 260px;'
      overlay.appendChild(dialog)
      document.body.appendChild(overlay)
    }
    
    // 创建简单的网格选择器
    dialog.innerHTML = `
      <style>
        .editor-table-dialog-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .editor-table-dialog-title svg {
          width: 16px;
          height: 16px;
          color: #6b7280;
        }
        .grid-table {
          display: grid;
          gap: 3px;
          background: #f9fafb;
          padding: 6px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .grid-cell {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s ease;
          min-width: 0;
          min-height: 0;
          aspect-ratio: 1;
        }
        .grid-cell:hover {
          background: #dbeafe;
          border-color: #93c5fd;
          transform: scale(1.05);
        }
        .grid-cell.selected {
          background: #3b82f6;
          border-color: #2563eb;
          transform: scale(1);
        }
        .grid-info {
          margin-top: 10px;
          text-align: center;
          font-size: 14px;
          color: #1f2937;
          font-weight: 600;
          padding: 6px 8px;
          background: #f3f4f6;
          border-radius: 4px;
        }
        .close-hint {
          margin-top: 6px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
      </style>
      
      <div class="editor-table-dialog-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
        <span>选择表格大小</span>
      </div>
      <div class="grid-table" id="grid-table"></div>
      <div class="grid-info" id="grid-info">0 × 0 表格</div>
      <div class="close-hint">点击确认 · ESC取消</div>
    `
    
    // 如果还没有添加到DOM（非tableButton情况已经添加了）
    if (!document.body.contains(overlay)) {
      overlay.appendChild(dialog)
      document.body.appendChild(overlay)
    }
    
    console.log('📋 [Table] Dialog created and appended')
    
    // 创建网格单元格
    const gridTable = dialog.querySelector('#grid-table') as HTMLElement
    const gridInfo = dialog.querySelector('#grid-info') as HTMLElement
    
    // 动态计算网格列数和行数
    const cellSize = 24 // 单元格最小尺寸
    const gap = 3 // 单元格间距
    const padding = 6 // 网格容器内边距
    const border = 2 // 边框
    const maxRows = 8 // 最大行数
    
    // 获取对话框的实际宽度
    const dialogWidth = dialog.offsetWidth
    const dialogPadding = 12 * 2 // dialog 的 padding
    
    // 计算网格容器的可用宽度
    const availableWidth = dialogWidth - dialogPadding - padding * 2 - border
    
    // 计算可以容纳多少列（至少6列，最多15列）
    const cols = Math.max(6, Math.min(15, Math.floor((availableWidth + gap) / (cellSize + gap))))
    const rows = maxRows
    
    console.log('📋 [Table] Grid size:', cols, 'x', rows, 'available width:', availableWidth)
    
    // 设置网格布局
    gridTable.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    gridTable.style.gridTemplateRows = `repeat(${rows}, 1fr)`
    
    // 计算网格容器的实际宽度和高度
    const gridWidth = cols * cellSize + (cols - 1) * gap + padding * 2
    const gridHeight = rows * cellSize + (rows - 1) * gap + padding * 2
    gridTable.style.width = `${gridWidth}px`
    gridTable.style.height = `${gridHeight}px`
    
    // 创建网格单元格
    const totalCells = cols * rows
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div')
      cell.className = 'grid-cell'
      cell.dataset.row = String(Math.floor(i / cols) + 1)
      cell.dataset.col = String((i % cols) + 1)
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

      // 获取编辑器内容区域（这里不需要重复获取）
      if (!editorContent) {
        console.log('❌ [Table] Editor content not found')
        return
      }
      
      // 聚焦到编辑器
      editorContent.focus()
      
      const selection = window.getSelection()
      console.log('📋 [Table] Selection after focus:', selection)
      
      // 获取或创建一个有效的插入点
      let range: Range
      
      // 使用之前保存的选区
      if (savedRange && selection) {
        // 恢复之前保存的选区
        range = savedRange
        selection.removeAllRanges()
        selection.addRange(range)
        console.log('📋 [Table] Using saved range at cursor position')
      } else {
        // 如果没有保存的选区，在编辑器末尾插入
        console.log('⚠️ [Table] No saved range, appending at end')
        
        const table = createTableElement(rows, cols)
        const p = document.createElement('p')
        p.innerHTML = '<br>'
        
        // 找到最后一个段落
        const lastP = editorContent.querySelector('p:last-of-type')
        if (lastP) {
          lastP.insertAdjacentElement('afterend', table)
          table.insertAdjacentElement('afterend', p)
        } else {
          editorContent.appendChild(table)
          editorContent.appendChild(p)
        }
        
        console.log('📋 [Table] Table appended to editor')
        
        // 触发更新
        const event = new Event('input', { bubbles: true })
        editorContent.dispatchEvent(event)
        return
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
      
      gridInfo.textContent = `${rows} × ${cols} 表格`
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
const deleteTableCommand: Command = (state, dispatch) => {
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
    deleteTableCommand
  },
  toolbar: [{
    name: 'table',
    title: '表格',
    icon: 'table',
    command: insertTable,
    active: isInTable()
  }]
})
