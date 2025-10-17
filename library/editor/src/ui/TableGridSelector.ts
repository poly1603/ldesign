/**
 * 表格网格选择器
 * 提供类似 Word/Office 的表格插入体验
 */

import { showDropdown } from './Dropdown'

export interface TableGridSelectorOptions {
  onSelect: (rows: number, cols: number) => void
  maxRows?: number
  maxCols?: number
  button?: HTMLElement
}

/**
 * 显示表格网格选择器下拉框
 */
export function showTableGridSelector(options: TableGridSelectorOptions): void {
  const {
    onSelect,
    maxRows = 10,
    maxCols = 10,
    button
  } = options

  // 创建自定义内容容器
  const container = document.createElement('div')
  container.style.cssText = `
    width: ${maxCols * 26 + 16}px;
    padding: 8px;
    user-select: none;
  `

  // 添加标题
  const header = document.createElement('div')
  header.style.cssText = `
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 8px;
    text-align: center;
  `
  header.textContent = '选择表格大小'
  container.appendChild(header)

  // 创建网格容器
  const gridContainer = document.createElement('div')
  gridContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(${maxCols}, 24px);
    grid-template-rows: repeat(${maxRows}, 24px);
    gap: 2px;
    background: #f9fafb;
    padding: 4px;
    border-radius: 6px;
    margin-bottom: 8px;
  `

  // 创建尺寸显示
  const sizeDisplay = document.createElement('div')
  sizeDisplay.style.cssText = `
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    color: #1f2937;
    padding: 6px;
    background: #f3f4f6;
    border-radius: 4px;
    margin-bottom: 4px;
    min-height: 20px;
  `
  sizeDisplay.textContent = '移动鼠标选择'

  // 创建提示文本
  const hint = document.createElement('div')
  hint.style.cssText = `
    text-align: center;
    font-size: 11px;
    color: #9ca3af;
  `
  hint.textContent = '点击确认 · ESC取消'

  // 跟踪当前选择
  let currentRows = 0
  let currentCols = 0
  const cells: HTMLElement[] = []

  // 创建网格单元格
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      const cell = document.createElement('div')
      cell.style.cssText = `
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.1s ease;
      `
      cell.dataset.row = String(row + 1)
      cell.dataset.col = String(col + 1)
      
      cells.push(cell)
      gridContainer.appendChild(cell)
    }
  }

  // 更新高亮状态
  const updateHighlight = (rows: number, cols: number) => {
    currentRows = rows
    currentCols = cols

    cells.forEach((cell) => {
      const cellRow = parseInt(cell.dataset.row || '0')
      const cellCol = parseInt(cell.dataset.col || '0')

      if (cellRow <= rows && cellCol <= cols) {
        cell.style.background = '#3b82f6'
        cell.style.borderColor = '#2563eb'
      } else {
        cell.style.background = 'white'
        cell.style.borderColor = '#e5e7eb'
      }
    })

    if (rows > 0 && cols > 0) {
      sizeDisplay.textContent = `${rows} × ${cols} 表格`
    } else {
      sizeDisplay.textContent = '移动鼠标选择'
    }
  }

  // 鼠标移动事件处理
  const handleMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.dataset.row && target.dataset.col) {
      const row = parseInt(target.dataset.row)
      const col = parseInt(target.dataset.col)
      updateHighlight(row, col)
    }
  }

  // 点击事件处理
  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const target = e.target as HTMLElement
    if (target.dataset.row && target.dataset.col) {
      const row = parseInt(target.dataset.row)
      const col = parseInt(target.dataset.col)
      
      if (row > 0 && col > 0) {
        // 关闭下拉框
        const dropdown = container.closest('.editor-dropdown')
        if (dropdown) {
          dropdown.classList.add('closing')
          setTimeout(() => {
            onSelect(row, col)
            dropdown.remove()
          }, 150)
        }
      }
    }
  }

  // 鼠标离开网格时重置
  const handleMouseLeave = () => {
    updateHighlight(0, 0)
  }

  // 添加事件监听器
  gridContainer.addEventListener('mousemove', handleMouseMove)
  gridContainer.addEventListener('click', handleClick)
  gridContainer.addEventListener('mouseleave', handleMouseLeave)

  // 防止mousedown导致选区丢失
  gridContainer.addEventListener('mousedown', (e) => {
    e.preventDefault()
  })

  // 组装容器
  container.appendChild(gridContainer)
  container.appendChild(sizeDisplay)
  container.appendChild(hint)

  // 显示下拉框
  if (button) {
    showDropdown(button, {
      customContent: container,
      width: 'auto',
      maxHeight: 400
    })
  } else {
    // 如果没有按钮，返回容器供其他组件使用
    return container as any
  }
}

/**
 * 创建增强的表格网格选择器（支持动态扩展）
 */
export function showEnhancedTableGridSelector(options: TableGridSelectorOptions): void {
  const {
    onSelect,
    button
  } = options

  // 初始显示的网格大小
  let displayRows = 5
  let displayCols = 5
  const maxDisplayRows = 15
  const maxDisplayCols = 15

  // 创建容器
  const container = document.createElement('div')
  container.style.cssText = `
    padding: 8px;
    user-select: none;
  `

  // 创建网格容器（动态大小）
  const gridWrapper = document.createElement('div')
  gridWrapper.style.cssText = `
    overflow: hidden;
    transition: all 0.2s ease;
  `

  const gridContainer = document.createElement('div')
  gridContainer.style.cssText = `
    display: grid;
    gap: 2px;
    background: #f9fafb;
    padding: 4px;
    border-radius: 6px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
  `

  // 尺寸显示
  const sizeDisplay = document.createElement('div')
  sizeDisplay.style.cssText = `
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    padding: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 4px;
    margin-bottom: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `
  sizeDisplay.textContent = '移动鼠标选择大小'

  let currentRows = 0
  let currentCols = 0
  const cells: Map<string, HTMLElement> = new Map()

  // 创建或获取单元格
  const getOrCreateCell = (row: number, col: number): HTMLElement => {
    const key = `${row}-${col}`
    
    if (cells.has(key)) {
      return cells.get(key)!
    }

    const cell = document.createElement('div')
    cell.style.cssText = `
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 2px;
      cursor: pointer;
      width: 24px;
      height: 24px;
      transition: all 0.1s ease;
    `
    cell.dataset.row = String(row)
    cell.dataset.col = String(col)
    
    cells.set(key, cell)
    return cell
  }

  // 更新网格大小
  const updateGridSize = (rows: number, cols: number) => {
    // 动态扩展网格
    if (rows > displayRows - 1) {
      displayRows = Math.min(rows + 2, maxDisplayRows)
    }
    if (cols > displayCols - 1) {
      displayCols = Math.min(cols + 2, maxDisplayCols)
    }

    // 清空并重建网格
    gridContainer.innerHTML = ''
    gridContainer.style.gridTemplateColumns = `repeat(${displayCols}, 24px)`
    gridContainer.style.gridTemplateRows = `repeat(${displayRows}, 24px)`

    // 添加单元格
    for (let r = 1; r <= displayRows; r++) {
      for (let c = 1; c <= displayCols; c++) {
        const cell = getOrCreateCell(r, c)
        
        // 更新高亮
        if (r <= rows && c <= cols) {
          cell.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          cell.style.borderColor = '#667eea'
          cell.style.transform = 'scale(0.95)'
        } else {
          cell.style.background = 'white'
          cell.style.borderColor = '#e5e7eb'
          cell.style.transform = 'scale(1)'
        }
        
        gridContainer.appendChild(cell)
      }
    }

    currentRows = rows
    currentCols = cols

    if (rows > 0 && cols > 0) {
      sizeDisplay.innerHTML = `
        <div style="font-size: 20px; font-weight: bold;">${rows} × ${cols}</div>
        <div style="font-size: 11px; opacity: 0.9; margin-top: 2px;">点击插入表格</div>
      `
    } else {
      sizeDisplay.textContent = '移动鼠标选择大小'
    }
  }

  // 初始化网格
  updateGridSize(0, 0)

  // 事件处理
  gridContainer.addEventListener('mousemove', (e) => {
    const target = e.target as HTMLElement
    if (target.dataset.row && target.dataset.col) {
      const row = parseInt(target.dataset.row)
      const col = parseInt(target.dataset.col)
      updateGridSize(row, col)
    }
  })

  gridContainer.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (currentRows > 0 && currentCols > 0) {
      const dropdown = container.closest('.editor-dropdown')
      if (dropdown) {
        dropdown.classList.add('closing')
        setTimeout(() => {
          onSelect(currentRows, currentCols)
          dropdown.remove()
        }, 150)
      }
    }
  })

  gridContainer.addEventListener('mouseleave', () => {
    // 缩小网格
    displayRows = 5
    displayCols = 5
    updateGridSize(0, 0)
  })

  gridContainer.addEventListener('mousedown', (e) => {
    e.preventDefault()
  })

  // 组装容器
  gridWrapper.appendChild(gridContainer)
  container.appendChild(sizeDisplay)
  container.appendChild(gridWrapper)

  // 显示下拉框
  if (button) {
    showDropdown(button, {
      customContent: container,
      width: 'auto',
      maxHeight: 500
    })
  }
}