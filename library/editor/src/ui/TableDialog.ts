/**
 * 表格插入对话框
 */

export interface TableDialogOptions {
  onConfirm: (rows: number, cols: number) => void
  onCancel?: () => void
}

/**
 * 创建表格选择器
 */
export function createTableDialog(options: TableDialogOptions): HTMLElement {
  const { onConfirm, onCancel } = options

  const overlay = document.createElement('div')
  overlay.className = 'editor-dialog-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'editor-dialog editor-table-dialog'

  // 标题
  const title = document.createElement('div')
  title.className = 'editor-dialog-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
      <line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
    <span>插入表格</span>
  `
  dialog.appendChild(title)

  // 表格预览选择器
  const selectorSection = document.createElement('div')
  selectorSection.className = 'editor-table-selector-section'

  const selectorTitle = document.createElement('div')
  selectorTitle.className = 'editor-table-selector-title'
  selectorTitle.textContent = '选择表格大小（悬停预览）'
  selectorSection.appendChild(selectorTitle)

  const selector = document.createElement('div')
  selector.className = 'editor-table-selector'

  const maxRows = 10
  const maxCols = 10
  let selectedRows = 0
  let selectedCols = 0

  // 创建网格
  for (let i = 0; i < maxRows; i++) {
    for (let j = 0; j < maxCols; j++) {
      const cell = document.createElement('div')
      cell.className = 'editor-table-cell'
      cell.dataset.row = String(i)
      cell.dataset.col = String(j)

      cell.addEventListener('mouseenter', () => {
        selectedRows = i + 1
        selectedCols = j + 1
        updatePreview()
        updateLabel()
      })

      cell.addEventListener('click', () => {
        if (selectedRows > 0 && selectedCols > 0) {
          onConfirm(selectedRows, selectedCols)
          overlay.remove()
        }
      })

      selector.appendChild(cell)
    }
  }

  function updatePreview() {
    const cells = selector.querySelectorAll('.editor-table-cell')
    cells.forEach((cell) => {
      const row = parseInt((cell as HTMLElement).dataset.row || '0')
      const col = parseInt((cell as HTMLElement).dataset.col || '0')

      if (row < selectedRows && col < selectedCols) {
        cell.classList.add('selected')
      } else {
        cell.classList.remove('selected')
      }
    })
  }

  const label = document.createElement('div')
  label.className = 'editor-table-label'
  label.textContent = '0 × 0'

  function updateLabel() {
    label.textContent = `${selectedRows} × ${selectedCols}`
  }

  selectorSection.appendChild(selector)
  selectorSection.appendChild(label)
  dialog.appendChild(selectorSection)

  // 自定义输入
  const customSection = document.createElement('div')
  customSection.className = 'editor-table-custom-section'

  const customTitle = document.createElement('div')
  customTitle.className = 'editor-table-custom-title'
  customTitle.textContent = '或自定义大小'
  customSection.appendChild(customTitle)

  const inputGroup = document.createElement('div')
  inputGroup.className = 'editor-table-input-group'

  const rowsInput = document.createElement('input')
  rowsInput.type = 'number'
  rowsInput.className = 'editor-table-input'
  rowsInput.placeholder = '行数'
  rowsInput.min = '1'
  rowsInput.max = '50'
  rowsInput.value = '3'

  const separator = document.createElement('span')
  separator.className = 'editor-table-input-separator'
  separator.textContent = '×'

  const colsInput = document.createElement('input')
  colsInput.type = 'number'
  colsInput.className = 'editor-table-input'
  colsInput.placeholder = '列数'
  colsInput.min = '1'
  colsInput.max = '50'
  colsInput.value = '3'

  inputGroup.appendChild(rowsInput)
  inputGroup.appendChild(separator)
  inputGroup.appendChild(colsInput)
  customSection.appendChild(inputGroup)
  dialog.appendChild(customSection)

  // 按钮组
  const actions = document.createElement('div')
  actions.className = 'editor-dialog-actions'

  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.className = 'editor-dialog-button editor-dialog-button-cancel'
  cancelBtn.textContent = '取消'
  cancelBtn.addEventListener('click', () => {
    onCancel?.()
    overlay.remove()
  })

  const confirmBtn = document.createElement('button')
  confirmBtn.type = 'button'
  confirmBtn.className = 'editor-dialog-button editor-dialog-button-confirm'
  confirmBtn.textContent = '插入'
  confirmBtn.addEventListener('click', () => {
    const rows = parseInt(rowsInput.value) || 3
    const cols = parseInt(colsInput.value) || 3
    if (rows >= 1 && cols >= 1 && rows <= 50 && cols <= 50) {
      onConfirm(rows, cols)
      overlay.remove()
    } else {
      alert('请输入有效的行数和列数（1-50）')
    }
  })

  actions.appendChild(cancelBtn)
  actions.appendChild(confirmBtn)
  dialog.appendChild(actions)

  overlay.appendChild(dialog)

  // ESC键关闭
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel?.()
      overlay.remove()
      document.removeEventListener('keydown', handleKeyDown)
    }
  }
  document.addEventListener('keydown', handleKeyDown)

  // 点击遮罩关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      onCancel?.()
      overlay.remove()
    }
  })

  return overlay
}

/**
 * 显示表格插入对话框
 */
export function showTableDialog(options: TableDialogOptions): void {
  console.log('🎯 [TableDialog] showTableDialog called')
  console.log('🎯 [TableDialog] document.body exists:', !!document.body)
  
  // 移除已存在的对话框
  const existing = document.querySelector('.editor-dialog-overlay')
  if (existing) {
    console.log('🎯 [TableDialog] Removing existing dialog')
    existing.remove()
  }

  console.log('🎯 [TableDialog] Creating new dialog')
  const dialog = createTableDialog(options)
  console.log('🎯 [TableDialog] Dialog created:', !!dialog)
  
  console.log('🎯 [TableDialog] Appending to body')
  document.body.appendChild(dialog)
  console.log('🎯 [TableDialog] Dialog appended to body')

  // 聚焦到第一个输入框
  setTimeout(() => {
    const firstInput = dialog.querySelector('.editor-table-input') as HTMLInputElement
    firstInput?.focus()
  }, 100)
}
