/**
 * 查找替换对话框 - 增强版
 * 支持模糊查找、实时预览、批量替换等功能
 */

export interface FindReplaceOptions {
  onFind?: (searchText: string, options: SearchOptions) => void
  onReplace?: (searchText: string, replaceText: string, options: SearchOptions) => void
  onReplaceAll?: (searchText: string, replaceText: string, options: SearchOptions) => void
  onClose?: () => void
  initialText?: string // 初始查找文本
}

export interface SearchOptions {
  caseSensitive: boolean
  wholeWord: boolean
  useRegex: boolean
  fuzzySearch: boolean // 模糊查找
}

export interface SearchResult {
  count: number
  current: number
  matches: Array<{
    text: string
    index: number
    length: number
  }>
}

/**
 * 创建增强版查找替换对话框
 */
export function createFindReplaceDialog(options: FindReplaceOptions): HTMLElement {
  const { onFind, onReplace, onReplaceAll, onClose } = options

  // 不创建遮罩层，直接创建对话框
  const dialog = document.createElement('div')
  dialog.className = 'editor-dialog editor-find-dialog enhanced no-overlay'
  dialog.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    z-index: 1000;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    min-width: 400px;
    max-width: 500px;
    animation: slideIn 0.3s ease-out;
  `
  
  // 拖拽功能变量
  let isDragging = false
  let dragStartX = 0
  let dragStartY = 0
  let dialogStartX = 0
  let dialogStartY = 0

  // 拖拽事件处理
  const startDrag = (e: MouseEvent) => {
    isDragging = true
    dragStartX = e.clientX
    dragStartY = e.clientY
    const rect = dialog.getBoundingClientRect()
    dialogStartX = rect.left
    dialogStartY = rect.top
    dialog.style.cursor = 'grabbing'
    e.preventDefault()
  }

  const onDrag = (e: MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartX
    const deltaY = e.clientY - dragStartY
    dialog.style.left = `${dialogStartX + deltaX}px`
    dialog.style.top = `${dialogStartY + deltaY}px`
    dialog.style.right = 'auto'
  }

  const stopDrag = () => {
    if (isDragging) {
      isDragging = false
      dialog.style.cursor = 'move'
    }
  }

  // 绑定拖拽事件
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)

  // 标题栏（可拖拽）
  const header = document.createElement('div')
  header.className = 'editor-dialog-header'
  header.style.cssText = 'cursor: move; user-select: none;'
  header.innerHTML = `
    <div class="editor-dialog-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <span>查找和替换</span>
    </div>
    <button class="editor-dialog-close" type="button" aria-label="关闭">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `
  dialog.appendChild(header)
  
  // 绑定标题栏拖拽
  header.addEventListener('mousedown', startDrag)
  
  // 清理函数
  const cleanup = () => {
    onClose?.()
    dialog.remove()
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
  }
  
  // 关闭按钮事件
  const closeBtn = header.querySelector('.editor-dialog-close') as HTMLButtonElement
  closeBtn.addEventListener('click', cleanup)

  // 内容区域
  const content = document.createElement('div')
  content.className = 'editor-find-content'

  // 查找输入区域
  const findGroup = document.createElement('div')
  findGroup.className = 'editor-find-input-group'
  
  const findLabel = document.createElement('label')
  findLabel.textContent = '查找'
  findGroup.appendChild(findLabel)
  
  const findInputWrapper = document.createElement('div')
  findInputWrapper.className = 'editor-find-input-wrapper'
  
  const findInput = document.createElement('input')
  findInput.type = 'text'
  findInput.id = 'find-input'
  findInput.className = 'editor-find-input'
  findInput.placeholder = '输入要查找的文本（支持模糊搜索）'
  findInput.value = options.initialText || ''
  
  // 查找结果计数
  const findCounter = document.createElement('span')
  findCounter.className = 'editor-find-counter'
  findCounter.textContent = ''
  
  // 查找导航按钮
  const findNav = document.createElement('div')
  findNav.className = 'editor-find-nav'
  findNav.innerHTML = `
    <button type="button" class="find-nav-btn" id="find-prev" title="上一个 (Shift+Enter)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <button type="button" class="find-nav-btn" id="find-next" title="下一个 (Enter)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  `
  
  findInputWrapper.appendChild(findInput)
  findInputWrapper.appendChild(findCounter)
  findInputWrapper.appendChild(findNav)
  findGroup.appendChild(findInputWrapper)
  content.appendChild(findGroup)

  // 替换输入区域
  const replaceGroup = document.createElement('div')
  replaceGroup.className = 'editor-find-input-group'
  
  const replaceLabel = document.createElement('label')
  replaceLabel.textContent = '替换为'
  replaceGroup.appendChild(replaceLabel)
  
  const replaceInputWrapper = document.createElement('div')
  replaceInputWrapper.className = 'editor-find-input-wrapper'
  
  const replaceInput = document.createElement('input')
  replaceInput.type = 'text'
  replaceInput.id = 'replace-input'
  replaceInput.className = 'editor-find-input'
  replaceInput.placeholder = '输入替换文本'
  
  // 替换预览
  const replacePreview = document.createElement('span')
  replacePreview.className = 'editor-replace-preview'
  replacePreview.style.display = 'none'
  
  replaceInputWrapper.appendChild(replaceInput)
  replaceInputWrapper.appendChild(replacePreview)
  replaceGroup.appendChild(replaceInputWrapper)
  content.appendChild(replaceGroup)

  // 选项区域
  const optionsDiv = document.createElement('div')
  optionsDiv.className = 'editor-find-options'

  const caseSensitiveCheckbox = createCheckbox('case-sensitive', '区分大小写', 'A')
  const wholeWordCheckbox = createCheckbox('whole-word', '全字匹配', 'W')
  const regexCheckbox = createCheckbox('use-regex', '正则表达式', '.*')
  const fuzzyCheckbox = createCheckbox('fuzzy-search', '模糊搜索', '≈')

  optionsDiv.appendChild(caseSensitiveCheckbox)
  optionsDiv.appendChild(wholeWordCheckbox)
  optionsDiv.appendChild(regexCheckbox)
  optionsDiv.appendChild(fuzzyCheckbox)
  
  // 正则和模糊搜索互斥
  const regexInput = regexCheckbox.querySelector('input') as HTMLInputElement
  const fuzzyInput = fuzzyCheckbox.querySelector('input') as HTMLInputElement
  
  regexInput.addEventListener('change', () => {
    if (regexInput.checked) fuzzyInput.checked = false
  })
  
  fuzzyInput.addEventListener('change', () => {
    if (fuzzyInput.checked) regexInput.checked = false
  })
  
  content.appendChild(optionsDiv)

  // 结果显示区域
  const resultDiv = document.createElement('div')
  resultDiv.className = 'editor-find-result'
  resultDiv.style.display = 'none'
  content.appendChild(resultDiv)
  
  // 高级选项（折叠面板）
  const advancedSection = document.createElement('details')
  advancedSection.className = 'editor-find-advanced'
  advancedSection.innerHTML = `
    <summary>高级选项</summary>
    <div class="editor-find-advanced-content">
      <div class="editor-find-scope">
        <label>搜索范围：</label>
        <select id="search-scope">
          <option value="all">全文档</option>
          <option value="selection">选中文本</option>
          <option value="current-block">当前段落</option>
        </select>
      </div>
      <div class="editor-find-history">
        <label>搜索历史：</label>
        <select id="search-history">
          <option value="">-- 选择历史记录 --</option>
        </select>
      </div>
    </div>
  `
  content.appendChild(advancedSection)

  dialog.appendChild(content)

  // 按钮组
  const actions = document.createElement('div')
  actions.className = 'editor-dialog-actions'

  const findBtn = document.createElement('button')
  findBtn.type = 'button'
  findBtn.className = 'editor-dialog-button editor-dialog-button-primary'
  findBtn.innerHTML = '<span>查找全部</span><kbd>Ctrl+Enter</kbd>'

  const replaceBtn = document.createElement('button')
  replaceBtn.type = 'button'
  replaceBtn.className = 'editor-dialog-button editor-dialog-button-warning'
  replaceBtn.innerHTML = '<span>替换</span>'

  const replaceAllBtn = document.createElement('button')
  replaceAllBtn.type = 'button'
  replaceAllBtn.className = 'editor-dialog-button editor-dialog-button-danger'
  replaceAllBtn.innerHTML = '<span>全部替换</span><kbd>Ctrl+Shift+Enter</kbd>'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'editor-dialog-button editor-dialog-button-cancel'
  closeBtn.textContent = '取消'

  // 获取搜索选项
  function getSearchOptions(): SearchOptions {
    return {
      caseSensitive: (document.getElementById('case-sensitive') as HTMLInputElement)?.checked || false,
      wholeWord: (document.getElementById('whole-word') as HTMLInputElement)?.checked || false,
      useRegex: (document.getElementById('use-regex') as HTMLInputElement)?.checked || false,
      fuzzySearch: (document.getElementById('fuzzy-search') as HTMLInputElement)?.checked || false
    }
  }
  
  // 当前搜索结果
  let currentSearchResult: SearchResult = { count: 0, current: 0, matches: [] }
  let searchHistory: string[] = loadSearchHistory()

  // 显示结果
  function showResult(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    resultDiv.textContent = message
    resultDiv.className = `editor-find-result editor-find-result-${type}`
    resultDiv.style.display = 'block'
    
    // 3秒后自动隐藏
    setTimeout(() => {
      resultDiv.style.display = 'none'
    }, 3000)
  }
  
  // 更新查找计数
  function updateFindCounter(current: number, total: number) {
    if (total === 0) {
      findCounter.textContent = '无结果'
      findCounter.className = 'editor-find-counter no-results'
    } else {
      findCounter.textContent = `${current}/${total}`
      findCounter.className = 'editor-find-counter'
    }
  }
  
  // 实时搜索
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
  
  findInput.addEventListener('input', () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    
    searchDebounceTimer = setTimeout(() => {
      const searchText = findInput.value
      if (searchText) {
        const searchOptions = getSearchOptions()
        onFind?.(searchText, searchOptions)
        saveToHistory(searchText)
      } else {
        updateFindCounter(0, 0)
      }
    }, 300) // 300ms 防抖
  })

  // 查找按钮
  findBtn.addEventListener('click', () => {
    const searchText = findInput.value
    if (!searchText) {
      showResult('请输入要查找的文本', 'warning')
      return
    }

    const searchOptions = getSearchOptions()
    onFind?.(searchText, searchOptions)
    saveToHistory(searchText)
  })
  
  // 上一个/下一个按钮
  const prevBtn = findNav.querySelector('#find-prev') as HTMLButtonElement
  const nextBtn = findNav.querySelector('#find-next') as HTMLButtonElement
  
  prevBtn.addEventListener('click', () => {
    if (currentSearchResult.count > 0) {
      currentSearchResult.current = currentSearchResult.current > 1 
        ? currentSearchResult.current - 1 
        : currentSearchResult.count
      updateFindCounter(currentSearchResult.current, currentSearchResult.count)
      highlightCurrentMatch()
    }
  })
  
  nextBtn.addEventListener('click', () => {
    if (currentSearchResult.count > 0) {
      currentSearchResult.current = currentSearchResult.current < currentSearchResult.count 
        ? currentSearchResult.current + 1 
        : 1
      updateFindCounter(currentSearchResult.current, currentSearchResult.count)
      highlightCurrentMatch()
    }
  })

  // 替换按钮
  replaceBtn.addEventListener('click', () => {
    const searchText = findInput.value
    const replaceText = replaceInput.value || ''

    if (!searchText) {
      showResult('请输入要查找的文本', 'warning')
      return
    }

    const searchOptions = getSearchOptions()
    onReplace?.(searchText, replaceText, searchOptions)
    showResult('替换成功', 'success')
  })

  // 全部替换按钮
  replaceAllBtn.addEventListener('click', () => {
    const searchText = findInput.value
    const replaceText = replaceInput.value || ''

    if (!searchText) {
      showResult('请输入要查找的文本', 'warning')
      return
    }

    // 显示确认对话框，包含替换数量预览
    const confirmDialog = document.createElement('div')
    confirmDialog.className = 'editor-confirm-dialog'
    confirmDialog.innerHTML = `
      <div class="editor-confirm-content">
        <p>确定要将所有 <strong>"${searchText}"</strong> 替换为 <strong>"${replaceText || '(空)'}"</strong> 吗？</p>
        <p class="editor-confirm-count">将影响 ${currentSearchResult.count} 处</p>
      </div>
      <div class="editor-confirm-actions">
        <button type="button" class="confirm-yes">确定替换</button>
        <button type="button" class="confirm-no">取消</button>
      </div>
    `
    
    overlay.appendChild(confirmDialog)
    
    const yesBtn = confirmDialog.querySelector('.confirm-yes') as HTMLButtonElement
    const noBtn = confirmDialog.querySelector('.confirm-no') as HTMLButtonElement
    
    yesBtn.addEventListener('click', () => {
      const searchOptions = getSearchOptions()
      onReplaceAll?.(searchText, replaceText, searchOptions)
      showResult(`成功替换 ${currentSearchResult.count} 处`, 'success')
      confirmDialog.remove()
    })
    
    noBtn.addEventListener('click', () => {
      confirmDialog.remove()
    })
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

  // 键盘快捷键处理
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.()
      overlay.remove()
      document.removeEventListener('keydown', handleKeyDown)
    } else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      // Enter - 查找下一个
      if (document.activeElement === findInput) {
        e.preventDefault()
        nextBtn.click()
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter - 查找上一个
      e.preventDefault()
      prevBtn.click()
    } else if (e.key === 'Enter' && e.ctrlKey && !e.shiftKey) {
      // Ctrl+Enter - 查找全部
      e.preventDefault()
      findBtn.click()
    } else if (e.key === 'Enter' && e.ctrlKey && e.shiftKey) {
      // Ctrl+Shift+Enter - 全部替换
      e.preventDefault()
      replaceAllBtn.click()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      // Ctrl/Cmd+H - 切换到替换模式
      e.preventDefault()
      replaceInput.focus()
    }
  }
  document.addEventListener('keydown', handleKeyDown)
  
  // 辅助函数：高亮当前匹配
  function highlightCurrentMatch() {
    const highlights = document.querySelectorAll('.editor-highlight')
    highlights.forEach((h, index) => {
      h.classList.toggle('editor-highlight-active', index === currentSearchResult.current - 1)
    })
    
    // 滚动到当前匹配
    if (highlights[currentSearchResult.current - 1]) {
      highlights[currentSearchResult.current - 1].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }
  
  // 保存搜索历史
  function saveToHistory(text: string) {
    if (!searchHistory.includes(text)) {
      searchHistory.unshift(text)
      if (searchHistory.length > 10) searchHistory.pop()
      localStorage.setItem('editor-search-history', JSON.stringify(searchHistory))
      updateHistoryDropdown()
    }
  }
  
  // 加载搜索历史
  function loadSearchHistory(): string[] {
    try {
      return JSON.parse(localStorage.getItem('editor-search-history') || '[]')
    } catch {
      return []
    }
  }
  
  // 更新历史下拉框
  function updateHistoryDropdown() {
    const historySelect = document.getElementById('search-history') as HTMLSelectElement
    if (historySelect) {
      historySelect.innerHTML = '<option value="">-- 选择历史记录 --</option>'
      searchHistory.forEach(item => {
        const option = document.createElement('option')
        option.value = item
        option.textContent = item.length > 30 ? item.substring(0, 30) + '...' : item
        historySelect.appendChild(option)
      })
    }
  }
  
  // 历史选择事件
  const historySelect = document.getElementById('search-history') as HTMLSelectElement
  if (historySelect) {
    updateHistoryDropdown()
    historySelect.addEventListener('change', () => {
      if (historySelect.value) {
        findInput.value = historySelect.value
        findInput.dispatchEvent(new Event('input'))
      }
    })
  }

  // ESC键关闭
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cleanup()
    }
  })

  return dialog
}

/**
 * 创建增强版复选框
 */
function createCheckbox(id: string, label: string, icon?: string): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'editor-find-checkbox'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = id
  checkbox.className = 'editor-checkbox-input'

  const labelElement = document.createElement('label')
  labelElement.htmlFor = id
  labelElement.className = 'editor-checkbox-label'
  
  // 添加图标
  if (icon) {
    const iconSpan = document.createElement('span')
    iconSpan.className = 'checkbox-icon'
    iconSpan.textContent = icon
    labelElement.appendChild(iconSpan)
  }
  
  const labelText = document.createElement('span')
  labelText.textContent = label
  labelElement.appendChild(labelText)

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
    existing.remove()
  }

  const dialog = createFindReplaceDialog(options)
  document.body.appendChild(dialog)

  // 聚焦到查找输入框
  setTimeout(() => {
    const findInput = dialog.querySelector('#find-input') as HTMLInputElement
    findInput?.focus()
  }, 100)
}

// 默认导出
export default showFindReplaceDialog
