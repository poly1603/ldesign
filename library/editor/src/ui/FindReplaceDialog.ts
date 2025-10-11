/**
 * 查找替换对话框
 */

export interface FindReplaceOptions {
  onFind?: (searchText: string, options: SearchOptions) => void
  onReplace?: (searchText: string, replaceText: string, options: SearchOptions) => void
  onReplaceAll?: (searchText: string, replaceText: string, options: SearchOptions) => void
  onClose?: () => void
}

export interface SearchOptions {
  caseSensitive: boolean
  wholeWord: boolean
  useRegex: boolean
}

/**
 * 创建查找替换对话框
 */
export function createFindReplaceDialog(options: FindReplaceOptions): HTMLElement {
  const { onFind, onReplace, onReplaceAll, onClose } = options

  const overlay = document.createElement('div')
  overlay.className = 'editor-dialog-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'editor-dialog editor-find-dialog'

  // 标题
  const title = document.createElement('div')
  title.className = 'editor-dialog-title'
  title.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
    <span>查找和替换</span>
  `
  dialog.appendChild(title)

  // 内容
  const content = document.createElement('div')
  content.className = 'editor-find-content'

  // 查找输入
  const findGroup = document.createElement('div')
  findGroup.className = 'editor-find-input-group'
  findGroup.innerHTML = `
    <label>查找</label>
    <input type="text" id="find-input" placeholder="输入要查找的文本" />
  `
  content.appendChild(findGroup)

  // 替换输入
  const replaceGroup = document.createElement('div')
  replaceGroup.className = 'editor-find-input-group'
  replaceGroup.innerHTML = `
    <label>替换为</label>
    <input type="text" id="replace-input" placeholder="输入替换文本" />
  `
  content.appendChild(replaceGroup)

  // 选项
  const optionsDiv = document.createElement('div')
  optionsDiv.className = 'editor-find-options'

  const caseSensitiveCheckbox = createCheckbox('case-sensitive', '区分大小写')
  const wholeWordCheckbox = createCheckbox('whole-word', '全字匹配')
  const regexCheckbox = createCheckbox('use-regex', '使用正则表达式')

  optionsDiv.appendChild(caseSensitiveCheckbox)
  optionsDiv.appendChild(wholeWordCheckbox)
  optionsDiv.appendChild(regexCheckbox)
  content.appendChild(optionsDiv)

  // 结果显示
  const resultDiv = document.createElement('div')
  resultDiv.className = 'editor-find-result'
  resultDiv.style.display = 'none'
  content.appendChild(resultDiv)

  dialog.appendChild(content)

  // 按钮组
  const actions = document.createElement('div')
  actions.className = 'editor-dialog-actions'

  const findBtn = document.createElement('button')
  findBtn.type = 'button'
  findBtn.className = 'editor-dialog-button editor-dialog-button-confirm'
  findBtn.textContent = '查找'

  const replaceBtn = document.createElement('button')
  replaceBtn.type = 'button'
  replaceBtn.className = 'editor-dialog-button editor-dialog-button-confirm'
  replaceBtn.textContent = '替换'

  const replaceAllBtn = document.createElement('button')
  replaceAllBtn.type = 'button'
  replaceAllBtn.className = 'editor-dialog-button editor-dialog-button-confirm'
  replaceAllBtn.textContent = '全部替换'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'editor-dialog-button editor-dialog-button-cancel'
  closeBtn.textContent = '关闭'

  // 获取搜索选项
  function getSearchOptions(): SearchOptions {
    return {
      caseSensitive: (document.getElementById('case-sensitive') as HTMLInputElement)?.checked || false,
      wholeWord: (document.getElementById('whole-word') as HTMLInputElement)?.checked || false,
      useRegex: (document.getElementById('use-regex') as HTMLInputElement)?.checked || false
    }
  }

  // 显示结果
  function showResult(message: string) {
    resultDiv.textContent = message
    resultDiv.style.display = 'block'
  }

  // 查找按钮
  findBtn.addEventListener('click', () => {
    const searchText = (document.getElementById('find-input') as HTMLInputElement)?.value
    if (!searchText) {
      showResult('请输入要查找的文本')
      return
    }

    const searchOptions = getSearchOptions()
    onFind?.(searchText, searchOptions)
  })

  // 替换按钮
  replaceBtn.addEventListener('click', () => {
    const searchText = (document.getElementById('find-input') as HTMLInputElement)?.value
    const replaceText = (document.getElementById('replace-input') as HTMLInputElement)?.value || ''

    if (!searchText) {
      showResult('请输入要查找的文本')
      return
    }

    const searchOptions = getSearchOptions()
    onReplace?.(searchText, replaceText, searchOptions)
  })

  // 全部替换按钮
  replaceAllBtn.addEventListener('click', () => {
    const searchText = (document.getElementById('find-input') as HTMLInputElement)?.value
    const replaceText = (document.getElementById('replace-input') as HTMLInputElement)?.value || ''

    if (!searchText) {
      showResult('请输入要查找的文本')
      return
    }

    if (confirm(`确定要替换所有 "${searchText}" 吗？`)) {
      const searchOptions = getSearchOptions()
      onReplaceAll?.(searchText, replaceText, searchOptions)
    }
  })

  // 关闭按钮
  closeBtn.addEventListener('click', () => {
    onClose?.()
    overlay.remove()
  })

  actions.appendChild(findBtn)
  actions.appendChild(replaceBtn)
  actions.appendChild(replaceAllBtn)
  actions.appendChild(closeBtn)
  dialog.appendChild(actions)

  overlay.appendChild(dialog)

  // ESC键关闭
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.()
      overlay.remove()
      document.removeEventListener('keydown', handleKeyDown)
    }
  }
  document.addEventListener('keydown', handleKeyDown)

  // 点击遮罩关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      onClose?.()
      overlay.remove()
    }
  })

  return overlay
}

/**
 * 创建复选框
 */
function createCheckbox(id: string, label: string): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'editor-find-checkbox'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = id

  const labelElement = document.createElement('label')
  labelElement.htmlFor = id
  labelElement.textContent = label

  wrapper.appendChild(checkbox)
  wrapper.appendChild(labelElement)

  return wrapper
}

/**
 * 显示查找替换对话框
 */
export function showFindReplaceDialog(options: FindReplaceOptions): void {
  // 移除已存在的对话框
  const existing = document.querySelector('.editor-find-dialog')
  if (existing) {
    existing.closest('.editor-dialog-overlay')?.remove()
  }

  const dialog = createFindReplaceDialog(options)
  document.body.appendChild(dialog)

  // 聚焦到查找输入框
  setTimeout(() => {
    const findInput = document.getElementById('find-input') as HTMLInputElement
    findInput?.focus()
  }, 100)
}
