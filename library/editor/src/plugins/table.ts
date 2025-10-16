/**
 * 表格插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'
import { registerContextMenu } from '../core/ContextMenuManager'
// import { showTableDialog } from '../ui/TableDialog'

// createTableContextMenu 函数已移除，使用 ContextMenuManager 统一管理

// 表格选择功能
interface TableSelection {
  startCell: HTMLTableCellElement | null
  endCell: HTMLTableCellElement | null
  selectedCells: Set<HTMLTableCellElement>
}

const tableSelections = new WeakMap<HTMLTableElement, TableSelection>()

/**
 * 设置表格选择功能 - 简化版
 */
function setupTableSelection(table: HTMLTableElement) {
  let isSelecting = false
  let startCell: HTMLTableCellElement | null = null
  let selectedCells = new Set<HTMLTableCellElement>()
  let cachedGrid: (HTMLTableCellElement | null)[][] | null = null
  
  // 清除选择
  const clearSelection = () => {
    selectedCells.forEach(cell => {
      cell.classList.remove('table-cell-selected')
    })
    selectedCells.clear()
    startCell = null
    isSelecting = false
    cachedGrid = null // 清除缓存的网格
    // 移除selecting类
    table.classList.remove('selecting')
  }
  
  // 选中整列
  const selectColumn = (colIndex: number) => {
    clearSelection()
    Array.from(table.rows).forEach(row => {
      const cell = row.cells[colIndex]
      if (cell) {
        cell.classList.add('table-cell-selected')
        selectedCells.add(cell as HTMLTableCellElement)
      }
    })
    saveSelection()
  }
  
  // 选中整行
  const selectRow = (rowIndex: number) => {
    clearSelection()
    const row = table.rows[rowIndex]
    if (row) {
      Array.from(row.cells).forEach(cell => {
        cell.classList.add('table-cell-selected')
        selectedCells.add(cell as HTMLTableCellElement)
      })
    }
    saveSelection()
  }
  
  // 获取单元格的实际位置（考虑合并单元格）
  const getCellPosition = (cell: HTMLTableCellElement, grid?: (HTMLTableCellElement | null)[][]): {row: number, col: number, rowEnd: number, colEnd: number} => {
    // 使用传入的网格或创建新的
    const logicalGrid = grid || createLogicalGrid()
    
    // 在网格中查找单元格的位置
    let cellRow = -1, cellCol = -1
    let cellRowEnd = -1, cellColEnd = -1
    
    for (let r = 0; r < logicalGrid.length; r++) {
      for (let c = 0; c < logicalGrid[r].length; c++) {
        if (logicalGrid[r][c] === cell) {
          if (cellRow === -1) {
            cellRow = r
            cellCol = c
          }
          cellRowEnd = r
          cellColEnd = c
        }
      }
    }
    
    return {
      row: cellRow,
      col: cellCol,
      rowEnd: cellRowEnd,
      colEnd: cellColEnd
    }
  }
  
  // 创建一个二维数组来跟踪表格的逻辑结构
  const createLogicalGrid = () => {
    const rowCount = table.rows.length
    const colCount = Math.max(...Array.from(table.rows).map(row => {
      let count = 0
      Array.from(row.cells).forEach(cell => {
        count += parseInt(cell.getAttribute('colspan') || '1')
      })
      return count
    }))
    
    // 创建二维数组，记录每个逻辑位置对应的实际单元格
    const grid: (HTMLTableCellElement | null)[][] = Array(rowCount).fill(null).map(() => Array(colCount).fill(null))
    
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r]
      let logicalCol = 0
      
      for (let c = 0; c < row.cells.length; c++) {
        const cell = row.cells[c] as HTMLTableCellElement
        const rowspan = parseInt(cell.getAttribute('rowspan') || '1')
        const colspan = parseInt(cell.getAttribute('colspan') || '1')
        
        // 找到下一个可用的逻辑列
        while (logicalCol < colCount && grid[r][logicalCol] !== null) {
          logicalCol++
        }
        
        // 填充合并的单元格区域
        for (let dr = 0; dr < rowspan && r + dr < rowCount; dr++) {
          for (let dc = 0; dc < colspan && logicalCol + dc < colCount; dc++) {
            grid[r + dr][logicalCol + dc] = cell
          }
        }
        
        logicalCol += colspan
      }
    }
    
    return grid
  }
  
  // 更新选择区域
  const updateSelection = (endCell: HTMLTableCellElement) => {
    if (!startCell) return
    
    // 清除之前的选择
    selectedCells.forEach(cell => {
      cell.classList.remove('table-cell-selected')
    })
    selectedCells.clear()
    
    // 创建或使用缓存的逻辑网格
    if (!cachedGrid) {
      cachedGrid = createLogicalGrid()
    }
    const grid = cachedGrid
    
    // 获取起始和结束单元格的逻辑位置
    const startPos = getCellPosition(startCell, grid)
    const endPos = getCellPosition(endCell, grid)
    
    // 计算选择范围（考虑合并单元格的完整区域）
    let minRow = Math.min(startPos.row, endPos.row)
    let maxRow = Math.max(startPos.rowEnd, endPos.rowEnd)
    let minCol = Math.min(startPos.col, endPos.col)
    let maxCol = Math.max(startPos.colEnd, endPos.colEnd)
    
    // 扩展选择范围以包含所有部分选中的合并单元格
    let expanded = true
    while (expanded) {
      expanded = false
      
      for (let r = minRow; r <= maxRow && r < grid.length; r++) {
        for (let c = minCol; c <= maxCol && c < grid[r].length; c++) {
          const cell = grid[r][c]
          if (cell && !selectedCells.has(cell)) {
            const pos = getCellPosition(cell)
            if (pos.row < minRow) {
              minRow = pos.row
              expanded = true
            }
            if (pos.rowEnd > maxRow) {
              maxRow = pos.rowEnd
              expanded = true
            }
            if (pos.col < minCol) {
              minCol = pos.col
              expanded = true
            }
            if (pos.colEnd > maxCol) {
              maxCol = pos.colEnd
              expanded = true
            }
          }
        }
      }
    }
    
    // 选中范围内的所有单元格
    const addedCells = new Set<HTMLTableCellElement>()
    for (let r = minRow; r <= maxRow && r < grid.length; r++) {
      for (let c = minCol; c <= maxCol && c < grid[r].length; c++) {
        const cell = grid[r][c]
        if (cell && !addedCells.has(cell)) {
          cell.classList.add('table-cell-selected')
          selectedCells.add(cell)
          addedCells.add(cell)
        }
      }
    }
    
    saveSelection()
  }
  
  // 保存选择状态
  const saveSelection = () => {
    tableSelections.set(table, {
      startCell,
      endCell: null,
      selectedCells
    })
  }
  
  // 表头右键选中整列
  table.addEventListener('contextmenu', (e) => {
    const cell = (e.target as HTMLElement).closest('th') as HTMLTableCellElement
    if (cell) {
      const row = cell.parentElement as HTMLTableRowElement
      const colIndex = Array.from(row.cells).indexOf(cell)
      selectColumn(colIndex)
    }
  })
  
  // 鼠标按下开始选择
  table.addEventListener('mousedown', (e) => {
    // 如果是右键，不处理
    if (e.button === 2) return
    
    const target = e.target as HTMLElement
    const cell = target.closest('td, th') as HTMLTableCellElement
    if (!cell) return
    
    // 忽略调整列宽的手柄
    if (target.classList.contains('table-column-resizer')) {
      return
    }
    
    // 如果点击的就是单元格本身（不是拖拽选择），让它正常获取焦点
    if (target === cell || cell.contains(target)) {
      // 如果没有按住Shift、Ctrl或Alt键，就是普通点击，让单元格正常获取焦点
      if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
        // 清除选择但不阻止默认行为，让单元格可以编辑
        clearSelection()
        return
      }
    }
    
    // Ctrl+点击选中整行
    if (e.ctrlKey) {
      const row = cell.parentElement as HTMLTableRowElement
      const rowIndex = Array.from(table.rows).indexOf(row)
      selectRow(rowIndex)
      e.preventDefault()
      return
    }
    
    // Alt+点击选中整列
    if (e.altKey) {
      const row = cell.parentElement as HTMLTableRowElement
      const colIndex = Array.from(row.cells).indexOf(cell)
      selectColumn(colIndex)
      e.preventDefault()
      return
    }
    
    // Shift+点击进行范围选择
    if (e.shiftKey && startCell) {
      e.preventDefault()
      updateSelection(cell)
      return
    }
    
    // 开始拖拽选择（只在按住Shift时）
    if (e.shiftKey) {
      clearSelection()
      isSelecting = true
      startCell = cell
      cachedGrid = null
      cell.classList.add('table-cell-selected')
      selectedCells.add(cell)
      saveSelection()
      // 添加selecting类来禁用文本选择
      table.classList.add('selecting')
      e.preventDefault()
    }
  })
  
  // 鼠标移动更新选择
  table.addEventListener('mousemove', (e) => {
    // 只有在按住Shift键并且正在选择时才更新
    if (!isSelecting || !startCell || !e.shiftKey) {
      if (isSelecting && !e.shiftKey) {
        // 如果松开了Shift键，停止选择
        isSelecting = false
      }
      return
    }
    
    const cell = (e.target as HTMLElement).closest('td, th') as HTMLTableCellElement
    if (cell && table.contains(cell)) {
      updateSelection(cell)
    }
  })
  
  // 鼠标松开结束选择
  const handleMouseUp = () => {
    isSelecting = false
    // 移除selecting类
    table.classList.remove('selecting')
  }
  document.addEventListener('mouseup', handleMouseUp)
  
  // 在表格被移除时清理事件监听器
  const cleanupObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        for (const node of mutation.removedNodes) {
          if (node === table || (node as Element)?.contains?.(table)) {
            document.removeEventListener('mouseup', handleMouseUp)
            cleanupObserver.disconnect()
            return
          }
        }
      }
    }
  })
  
  // 监听父元素的变化
  if (table.parentElement) {
    cleanupObserver.observe(table.parentElement, { childList: true, subtree: true })
  }
  
  // 防止选择时的文本选中
  table.addEventListener('selectstart', (e) => {
    if (isSelecting) {
      e.preventDefault()
    }
  })
  
  // 添加列宽调整功能
  setupColumnResize(table)
  
  // 监听表格结构变化，清除缓存的网格
  const observer = new MutationObserver(() => {
    cachedGrid = null
  })
  
  observer.observe(table, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['colspan', 'rowspan']
  })
}

/**
 * 设置列宽调整功能
 */
function setupColumnResize(table: HTMLTableElement) {
  const headerCells = table.querySelectorAll('th')
  
  headerCells.forEach((th, index) => {
    // 不在最后一列添加调整手柄
    if (index === headerCells.length - 1) return
    
    const resizer = document.createElement('div')
    resizer.className = 'table-column-resizer'
    resizer.style.cssText = `
      position: absolute;
      right: -3px;
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 10;
      background: transparent;
    `
    
    // 悬停效果
    resizer.addEventListener('mouseenter', () => {
      resizer.style.background = 'rgba(59, 130, 246, 0.5)'
    })
    
    resizer.addEventListener('mouseleave', () => {
      resizer.style.background = 'transparent'
    })
    
    // 拖拽调整列宽
    let startX = 0
    let startWidth = 0
    let currentColumn = index
    
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      startX = e.clientX
      startWidth = th.offsetWidth
      
      // 添加拖拽时的样式
      table.classList.add('resizing')
      document.body.style.cursor = 'col-resize'
      
      const handleMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX
        const newWidth = Math.max(60, startWidth + diff)
        
        // 只更新左侧列（当前列）的所有单元格宽度
        Array.from(table.rows).forEach(row => {
          const cell = row.cells[currentColumn]
          if (cell) {
            cell.style.width = `${newWidth}px`
            cell.style.minWidth = `${newWidth}px`
            cell.style.maxWidth = `${newWidth}px`
          }
        })
        
        // 设置表格为固定布局，防止其他列自动调整
        table.style.tableLayout = 'fixed'
      }
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        
        // 移除拖拽时的样式
        table.classList.remove('resizing')
        document.body.style.cursor = ''
        
        // 触发更新
        const event = new Event('input', { bubbles: true })
        table.dispatchEvent(event)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    })
    
    th.style.position = 'relative'
    th.appendChild(resizer)
  })
}

/**
 * 获取选中的单元格
 */
function getSelectedCells(table: HTMLTableElement): HTMLTableCellElement[] {
  const selection = tableSelections.get(table)
  if (!selection) return []
  return Array.from(selection.selectedCells)
}

// getCellPosition 函数已经不需要，直接使用 DOM API

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
  
  const targetRow = targetCell.parentElement as HTMLTableRowElement
  const colIndex = Array.from(targetRow.cells).indexOf(targetCell)
  
  // 在每一行的对应位置插入单元格
  Array.from(table.rows).forEach(row => {
    const newCell = row.cells[colIndex].cloneNode(false) as HTMLElement
    newCell.innerHTML = '&nbsp;'
    newCell.setAttribute('contenteditable', 'true')
    row.insertBefore(newCell, row.cells[colIndex])
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
  
  const targetRow = targetCell.parentElement as HTMLTableRowElement
  const colIndex = Array.from(targetRow.cells).indexOf(targetCell)
  
  // 在每一行的对应位置插入单元格
  Array.from(table.rows).forEach(row => {
    const newCell = row.cells[colIndex].cloneNode(false) as HTMLElement
    newCell.innerHTML = '&nbsp;'
    newCell.setAttribute('contenteditable', 'true')
    if (colIndex + 1 < row.cells.length) {
      row.insertBefore(newCell, row.cells[colIndex + 1])
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
  
  const targetRow = targetCell.parentElement as HTMLTableRowElement
  const colIndex = Array.from(targetRow.cells).indexOf(targetCell)
  
  // 至少保留一列
  const firstRow = table.rows[0]
  if (firstRow && firstRow.cells.length > 1) {
    // 从每一行删除对应位置的单元格
    Array.from(table.rows).forEach(row => {
      if (row.cells[colIndex]) {
        row.cells[colIndex].remove()
      }
    })
    
    // 触发更新
    const event = new Event('input', { bubbles: true })
    table.dispatchEvent(event)
  }
}

// 删除整个表格
function deleteEntireTable(table: HTMLTableElement) {
  // 确认删除
  if (confirm('确定要删除整个表格吗？')) {
    table.remove()
    
    // 触发更新
    const editorContent = document.querySelector('.ldesign-editor-content')
    if (editorContent) {
      const event = new Event('input', { bubbles: true })
      editorContent.dispatchEvent(event)
    }
  }
}

// 清除表格内容
function clearTable(table: HTMLTableElement) {
  const cells = table.querySelectorAll('td')
  cells.forEach(cell => {
    cell.innerHTML = '&nbsp;'
  })
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 合并单元格
function mergeCells(table: HTMLTableElement) {
  const selectedCells = getSelectedCells(table)
  
  if (selectedCells.length < 2) {
    alert('请选择多个单元格进行合并')
    return
  }
  
  // 创建逻辑网格来准确判断选择区域
  const createLogicalGrid = () => {
    const rowCount = table.rows.length
    const colCount = Math.max(...Array.from(table.rows).map(row => {
      let count = 0
      Array.from(row.cells).forEach(cell => {
        count += parseInt(cell.getAttribute('colspan') || '1')
      })
      return count
    }))
    
    const grid: (HTMLTableCellElement | null)[][] = Array(rowCount).fill(null).map(() => Array(colCount).fill(null))
    
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r]
      let logicalCol = 0
      
      for (let c = 0; c < row.cells.length; c++) {
        const cell = row.cells[c] as HTMLTableCellElement
        const rowspan = parseInt(cell.getAttribute('rowspan') || '1')
        const colspan = parseInt(cell.getAttribute('colspan') || '1')
        
        while (logicalCol < colCount && grid[r][logicalCol] !== null) {
          logicalCol++
        }
        
        for (let dr = 0; dr < rowspan && r + dr < rowCount; dr++) {
          for (let dc = 0; dc < colspan && logicalCol + dc < colCount; dc++) {
            grid[r + dr][logicalCol + dc] = cell
          }
        }
        
        logicalCol += colspan
      }
    }
    
    return grid
  }
  
  const grid = createLogicalGrid()
  
  // 找出选中区域的边界
  let minRow = Infinity, maxRow = -1
  let minCol = Infinity, maxCol = -1
  let topLeftCell: HTMLTableCellElement | null = null
  
  // 遍历逻辑网格找出选中单元格的实际范围
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c]
      if (cell && selectedCells.includes(cell)) {
        if (r < minRow) {
          minRow = r
          minCol = c // Reset column when finding new top row
          topLeftCell = cell
        } else if (r === minRow && c < minCol) {
          minCol = c
          topLeftCell = cell
        }
        maxRow = Math.max(maxRow, r)
        maxCol = Math.max(maxCol, c)
      }
    }
  }
  
  // 检查选择区域是否为矩形
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const cell = grid[r][c]
      if (!cell || !selectedCells.includes(cell)) {
        alert('请选择一个完整的矩形区域进行合并')
        return
      }
    }
  }
  
  // 使用找到的左上角单元格
  if (!topLeftCell) {
    alert('无法找到合并的起始单元格')
    return
  }
  
  // 收集所有内容
  const contents: string[] = []
  const cellsToRemove = new Set<HTMLTableCellElement>()
  
  selectedCells.forEach(cell => {
    const text = cell.textContent?.trim()
    if (text && text !== '\xa0' && text !== '') contents.push(text)
    if (cell !== topLeftCell) {
      cellsToRemove.add(cell)
    }
  })
  
  // 设置合并属性
  const rowSpan = maxRow - minRow + 1
  const colSpan = maxCol - minCol + 1
  topLeftCell.setAttribute('rowspan', String(rowSpan))
  topLeftCell.setAttribute('colspan', String(colSpan))
  topLeftCell.textContent = contents.join(' ') || '\xa0'
  
  // 删除其他单元格
  cellsToRemove.forEach(cell => {
    cell.remove()
  })
  
  // 清除选择
  selectedCells.forEach(cell => {
    cell.classList.remove('table-cell-selected')
  })
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 拆分单元格
function splitCell(table: HTMLTableElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  let node = selection.anchorNode
  let targetCell: HTMLTableCellElement | null = null
  
  while (node && node !== table) {
    if (node.nodeName === 'TD' || node.nodeName === 'TH') {
      targetCell = node as HTMLTableCellElement
      break
    }
    node = node.parentNode
  }
  
  if (!targetCell) return
  
  const colspan = parseInt(targetCell.getAttribute('colspan') || '1')
  const rowspan = parseInt(targetCell.getAttribute('rowspan') || '1')
  
  if (colspan === 1 && rowspan === 1) {
    alert('该单元格未被合并，无需拆分')
    return
  }
  
  // 移除合并属性
  targetCell.removeAttribute('colspan')
  targetCell.removeAttribute('rowspan')
  
  // 在当前单元格后添加新单元格
  const row = targetCell.parentElement as HTMLTableRowElement
  for (let i = 1; i < colspan; i++) {
    const newCell = document.createElement(targetCell.tagName.toLowerCase()) as HTMLTableCellElement
    newCell.innerHTML = '&nbsp;'
    newCell.setAttribute('contenteditable', 'true')
    row.insertBefore(newCell, targetCell.nextSibling)
  }
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 切换表头
function toggleTableHeader(table: HTMLTableElement) {
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
  
  const row = targetCell.parentElement as HTMLTableRowElement
  const cells = Array.from(row.cells)
  
  // 如果当前行都是TH，转换为TD；否则转换为TH
  const isHeader = cells.every(cell => cell.tagName === 'TH')
  
  cells.forEach(cell => {
    const newCell = document.createElement(isHeader ? 'td' : 'th')
    newCell.innerHTML = cell.innerHTML
    newCell.setAttribute('contenteditable', 'true')
    // 复制其他属性
    Array.from(cell.attributes).forEach(attr => {
      if (attr.name !== 'contenteditable') {
        newCell.setAttribute(attr.name, attr.value)
      }
    })
    cell.parentNode?.replaceChild(newCell, cell)
  })
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 调整列宽 - 增加
function increaseColumnWidth(table: HTMLTableElement) {
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
  
  const targetRow = targetCell.parentElement as HTMLTableRowElement
  const colIndex = Array.from(targetRow.cells).indexOf(targetCell)
  
  // 增加当前列的宽度
  Array.from(table.rows).forEach(row => {
    const cell = row.cells[colIndex]
    if (cell) {
      const currentWidth = cell.offsetWidth
      const newWidth = currentWidth + 20
      cell.style.width = `${newWidth}px`
      cell.style.minWidth = `${newWidth}px`
    }
  })
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

// 调整列宽 - 减少
function decreaseColumnWidth(table: HTMLTableElement) {
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
  
  const targetRow = targetCell.parentElement as HTMLTableRowElement
  const colIndex = Array.from(targetRow.cells).indexOf(targetCell)
  
  // 减少当前列的宽度
  Array.from(table.rows).forEach(row => {
    const cell = row.cells[colIndex]
    if (cell) {
      const currentWidth = cell.offsetWidth
      const newWidth = Math.max(60, currentWidth - 20) // 最小60px
      cell.style.width = `${newWidth}px`
      cell.style.minWidth = `${newWidth}px`
    }
  })
  
  // 触发更新
  const event = new Event('input', { bubbles: true })
  table.dispatchEvent(event)
}

/**
 * 创建表格元素
 */
function createTableElement(rows: number, cols: number): HTMLElement {
  // 创建表格包装器
  const wrapper = document.createElement('div')
  wrapper.className = 'table-wrapper'
  wrapper.style.position = 'relative'
  wrapper.style.display = 'inline-block'
  
  const table = document.createElement('table')
  // 表格本身不要设置 contenteditable，只在单元格上设置
  table.style.position = 'relative'
  
  // 不再直接绑定右键事件，使用 ContextMenuManager

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
  
  // 将表格添加到包装器
  wrapper.appendChild(table)
  
  // 设置选择功能（需要在表格添加到包装器后）
  setTimeout(() => setupTableSelection(table), 0)
  
  return wrapper
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
          box-sizing: border-box;
        }
        .grid-cell:hover {
          background: #dbeafe;
          border-color: #93c5fd;
          box-shadow: 0 0 0 1px #93c5fd inset;
        }
        .grid-cell.selected {
          background: #3b82f6;
          border-color: #2563eb;
          box-shadow: 0 0 0 1px #2563eb inset;
        }
        .grid-cell:active {
          background: #2563eb;
          border-color: #1e40af;
          box-shadow: 0 0 0 1px #1e40af inset;
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
        
        const tableWrapper = createTableElement(rows, cols)
        const p = document.createElement('p')
        p.innerHTML = '<br>'
        
        // 找到最后一个段落
        const lastP = editorContent.querySelector('p:last-of-type')
        if (lastP) {
          lastP.insertAdjacentElement('afterend', tableWrapper)
          tableWrapper.insertAdjacentElement('afterend', p)
        } else {
          editorContent.appendChild(tableWrapper)
          editorContent.appendChild(p)
        }
        
        console.log('📋 [Table] Table appended to editor')
        
        // 触发更新
        const event = new Event('input', { bubbles: true })
        editorContent.dispatchEvent(event)
        return
      }

      // 创建表格元素
      const tableWrapper = createTableElement(rows, cols)
      const table = tableWrapper.querySelector('table')
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
            p.insertAdjacentElement('afterend', tableWrapper)
            
            // 添加一个新段落
            const newP = document.createElement('p')
            newP.innerHTML = '<br>'
            tableWrapper.insertAdjacentElement('afterend', newP)
            
            console.log('📋 [Table] Inserted after paragraph')
          } else {
            range.insertNode(tableWrapper)
            console.log('📋 [Table] Inserted at range')
          }
        } else {
          range.insertNode(tableWrapper)
          console.log('📋 [Table] Inserted at range')
        }
      } catch (error) {
        console.log('⚠️ [Table] Error inserting, appending to end:', error)
        editorContent.appendChild(tableWrapper)
      }
      
      // 确保表格后有段落
      let nextP = tableWrapper.nextElementSibling
      if (!nextP || nextP.tagName !== 'P') {
        nextP = document.createElement('p')
        nextP.innerHTML = '<br>'
        tableWrapper.insertAdjacentElement('afterend', nextP)
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
  }],
  // 初始化时注册表格右键菜单
  init: (editor: any) => {
    console.log('[TablePlugin] init 被调用')
    
    // 延迟注册，确保 ContextMenuManager 已经初始化
    setTimeout(() => {
      console.log('[TablePlugin] 开始注册表格右键菜单')
      
      // 注册表格右键菜单到 ContextMenuManager
      registerContextMenu({
        id: 'table-context-menu',
        selector: '.ldesign-editor-content table, .ldesign-editor-content table td, .ldesign-editor-content table th',
        priority: 100, // 设置更高优先级
        condition: (element) => {
          // 确保元素在表格内
          const table = element.closest('table')
          return !!table && table.closest('.ldesign-editor-content') !== null
        },
        items: (context) => {
          console.log('[TablePlugin] 生成表格菜单项, context:', context)
          
          // 找到表格元素
          const table = context.element.closest('table') as HTMLTableElement
          if (!table) {
            console.log('[TablePlugin] 未找到表格元素')
            return []
          }
          
          console.log('[TablePlugin] 找到表格元素:', table)
          
          return [
            { label: '插入上方行', action: () => insertRowAbove(table) },
            { label: '插入下方行', action: () => insertRowBelow(table) },
            { label: '插入左侧列', action: () => insertColumnLeft(table) },
            { label: '插入右侦列', action: () => insertColumnRight(table) },
            { divider: true },
            { label: '合并单元格', action: () => mergeCells(table) },
            { label: '拆分单元格', action: () => splitCell(table) },
            { label: '设为表头', action: () => toggleTableHeader(table) },
            { divider: true },
            { label: '增加列宽', action: () => increaseColumnWidth(table) },
            { label: '减少列宽', action: () => decreaseColumnWidth(table) },
            { divider: true },
            { label: '删除行', action: () => deleteCurrentRow(table), className: 'danger' },
            { label: '删除列', action: () => deleteCurrentColumn(table), className: 'danger' },
            { label: '清空内容', action: () => clearTable(table), className: 'danger' },
            { divider: true },
            { label: '删除表格', action: () => deleteEntireTable(table), className: 'danger' }
          ]
        }
      })
      
      console.log('[TablePlugin] 表格右键菜单已注册')
    }, 100)
  }
})


// Export table plugins as array
export const tablePlugins = []
