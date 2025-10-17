/**
 * 表格插入对话框
 * 使用统一对话框组件实现
 */

import { showUnifiedDialog } from './UnifiedDialog'

export interface TableDialogOptions {
  onConfirm: (rows: number, cols: number) => void
  onCancel?: () => void
}

/**
 * 创建表格选择器网格组件
 */
function createTableSelector(onChange: (rows: number, cols: number) => void): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = `
    padding: 16px 0;
    text-align: center;
  `

  const selectorTitle = document.createElement('div')
  selectorTitle.style.cssText = `
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 12px;
  `
  selectorTitle.textContent = '鼠标悬停选择表格大小'
  container.appendChild(selectorTitle)

  const selector = document.createElement('div')
  selector.style.cssText = `
    display: inline-grid;
    grid-template-columns: repeat(10, 20px);
    grid-template-rows: repeat(10, 20px);
    gap: 2px;
    padding: 8px;
    background: #f9fafb;
    border-radius: 6px;
  `

  const maxRows = 10
  const maxCols = 10
  let selectedRows = 0
  let selectedCols = 0

  // 创建网格
  for (let i = 0; i < maxRows; i++) {
    for (let j = 0; j < maxCols; j++) {
      const cell = document.createElement('div')
      cell.style.cssText = `
        background: white;
        border: 1px solid #d1d5db;
        cursor: pointer;
        transition: all 0.15s;
      `
      cell.dataset.row = String(i)
      cell.dataset.col = String(j)

      cell.addEventListener('mouseenter', () => {
        selectedRows = i + 1
        selectedCols = j + 1
        updatePreview()
        updateLabel()
        onChange(selectedRows, selectedCols)
      })

      cell.addEventListener('mouseleave', () => {
        if (!selector.matches(':hover')) {
          selectedRows = 0
          selectedCols = 0
          updatePreview()
          updateLabel()
        }
      })

      selector.appendChild(cell)
    }
  }

  function updatePreview() {
    const cells = selector.querySelectorAll('div')
    cells.forEach((cell) => {
      const el = cell as HTMLElement
      const row = parseInt(el.dataset.row || '0')
      const col = parseInt(el.dataset.col || '0')

      if (row < selectedRows && col < selectedCols) {
        el.style.background = '#3b82f6'
        el.style.borderColor = '#3b82f6'
      } else {
        el.style.background = 'white'
        el.style.borderColor = '#d1d5db'
      }
    })
  }

  const label = document.createElement('div')
  label.style.cssText = `
    margin-top: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  `
  label.textContent = '0 × 0'

  function updateLabel() {
    label.textContent = selectedRows > 0 ? `${selectedRows} × ${selectedCols}` : '请选择表格大小'
  }

  container.appendChild(selector)
  container.appendChild(label)

  return container
}

/**
 * 显示表格插入对话框
 */
export function showTableDialog(options: TableDialogOptions): void {
  const { onConfirm, onCancel } = options
  
  let previewRows = 3
  let previewCols = 3
  
  // 创建表格选择器组件
  const selectorComponent = createTableSelector((rows, cols) => {
    previewRows = rows
    previewCols = cols
  })
  
  // 创建自定义内容容器
  const content = document.createElement('div')
  content.appendChild(selectorComponent)
  
  showUnifiedDialog({
    title: '插入表格',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <line x1="15" y1="3" x2="15" y2="21"/>
    </svg>`,
    content,
    fields: [
      {
        id: 'rows',
        type: 'number',
        label: '行数',
        placeholder: '请输入行数',
        defaultValue: 3,
        min: 1,
        max: 50,
        required: true
      },
      {
        id: 'cols',
        type: 'number',
        label: '列数',
        placeholder: '请输入列数',
        defaultValue: 3,
        min: 1,
        max: 50,
        required: true
      }
    ],
    buttons: [
      {
        id: 'cancel',
        label: '取消',
        type: 'secondary',
        onClick: () => onCancel?.(),
        closeOnClick: true
      },
      {
        id: 'confirm',
        label: '插入',
        type: 'primary',
        onClick: (dialog) => {
          const rows = dialog.getFieldValue('rows') || previewRows
          const cols = dialog.getFieldValue('cols') || previewCols
          
          if (rows >= 1 && cols >= 1 && rows <= 50 && cols <= 50) {
            onConfirm(rows, cols)
            dialog.close()
          } else {
            dialog.showError('请输入有效的行数和列数（1-50）')
          }
        }
      }
    ],
    onSubmit: (data) => {
      const rows = data.rows || previewRows
      const cols = data.cols || previewCols
      
      if (rows >= 1 && cols >= 1 && rows <= 50 && cols <= 50) {
        onConfirm(rows, cols)
      }
    }
  })
}
