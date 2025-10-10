/**
 * 表格插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * 插入表格
 */
const insertTable: Command = (state, dispatch) => {
  if (!dispatch) return true

  const rows = parseInt(prompt('请输入行数:', '3') || '3')
  const cols = parseInt(prompt('请输入列数:', '3') || '3')

  if (!rows || !cols || rows < 1 || cols < 1) return false

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
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
      td.textContent = ' '
      td.style.border = '1px solid #ddd'
      td.style.padding = '8px'
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }
  table.appendChild(tbody)

  range.deleteContents()
  range.insertNode(table)

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
