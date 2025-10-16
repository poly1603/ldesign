/**
 * 增强的标题功能
 * 修复标题设置和显示当前标题级别
 */

/**
 * 执行标题命令
 */
export function executeHeadingCommand(level: number | 'p'): boolean {
  try {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      console.warn('No selection available')
      return false
    }

    // 获取当前选区的范围
    const range = selection.getRangeAt(0)
    
    // 保存选区
    const savedRange = range.cloneRange()
    
    // 执行格式化命令
    // formatBlock 需要使用大写的标签名（不带尖括号）
    // 例如：'H1', 'H2', 'P' 等
    const formatTag = level === 'p' ? 'P' : `H${level}`
    
    // 尝试多种方式设置标题
    let success = false
    
    // 方法1：使用大写标签名（推荐方式）
    success = document.execCommand('formatBlock', false, formatTag)
    
    if (!success) {
      // 方法2：使用带尖括号的格式（某些浏览器需要）
      const bracketTag = level === 'p' ? '<p>' : `<h${level}>`
      success = document.execCommand('formatBlock', false, bracketTag)
    }
    
    if (!success) {
      // 方法3：手动创建标题元素
      const container = range.commonAncestorContainer
      const parentElement = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container as HTMLElement
        
      if (parentElement) {
        // 找到最近的块级元素
        let blockElement = parentElement
        while (blockElement && blockElement.parentElement && 
               !['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'].includes(blockElement.tagName)) {
          blockElement = blockElement.parentElement
        }
        
        if (blockElement && blockElement.parentElement) {
          // 创建新的标题元素
          const newElement = document.createElement(level === 'p' ? 'p' : `h${level}`)
          
          // 复制内容
          while (blockElement.firstChild) {
            newElement.appendChild(blockElement.firstChild)
          }
          
          // 替换元素
          blockElement.parentElement.replaceChild(newElement, blockElement)
          
          // 恢复选区
          const newRange = document.createRange()
          newRange.selectNodeContents(newElement)
          newRange.collapse(false)
          selection.removeAllRanges()
          selection.addRange(newRange)
          
          success = true
        }
      }
    }
    
    // 触发输入事件
    if (success) {
      const event = new Event('input', { bubbles: true, cancelable: true })
      document.dispatchEvent(event)
    }
    
    return success
  } catch (error) {
    console.error('Failed to execute heading command:', error)
    return false
  }
}

/**
 * 获取当前光标所在的标题级别
 */
export function getCurrentHeadingLevel(): string {
  try {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return '正文'
    }

    // 获取当前节点
    let node = selection.anchorNode
    if (!node) {
      return '正文'
    }

    // 如果是文本节点，获取其父元素
    let element = node.nodeType === Node.TEXT_NODE 
      ? node.parentElement 
      : node as HTMLElement

    // 向上查找标题元素
    while (element && element !== document.body) {
      const tagName = element.tagName?.toUpperCase()
      
      switch (tagName) {
        case 'H1':
          return '标题 1'
        case 'H2':
          return '标题 2'
        case 'H3':
          return '标题 3'
        case 'H4':
          return '标题 4'
        case 'H5':
          return '标题 5'
        case 'H6':
          return '标题 6'
        case 'P':
        case 'DIV':
          // 如果是普通段落或div，继续向上查找以确保不在标题内
          if (!element.closest('h1,h2,h3,h4,h5,h6')) {
            return '正文'
          }
          break
      }
      
      element = element.parentElement
    }

    return '正文'
  } catch (error) {
    console.error('Failed to get current heading level:', error)
    return '正文'
  }
}

/**
 * 更新标题按钮显示
 */
export function updateHeadingButton(button: HTMLElement): void {
  const currentLevel = getCurrentHeadingLevel()
  
  // 查找按钮中的文本元素（如果有）
  let textElement = button.querySelector('.heading-text') as HTMLElement
  
  if (!textElement) {
    // 创建文本元素
    textElement = document.createElement('span')
    textElement.className = 'heading-text'
    textElement.style.cssText = `
      font-size: 12px;
      margin-left: 4px;
      opacity: 0.8;
    `
    button.appendChild(textElement)
  }
  
  // 更新文本
  textElement.textContent = currentLevel
  
  // 更新按钮的提示
  button.setAttribute('data-current-level', currentLevel)
}

/**
 * 初始化标题功能增强
 */
export function initHeadingEnhancement(editor: any): void {
  // 监听选区变化
  document.addEventListener('selectionchange', () => {
    // 查找标题按钮
    const headingButton = document.querySelector('[data-name="heading"]') as HTMLElement
    if (headingButton) {
      updateHeadingButton(headingButton)
    }
  })
  
  // 监听编辑器内容变化
  if (editor.contentElement) {
    editor.contentElement.addEventListener('input', () => {
      const headingButton = document.querySelector('[data-name="heading"]') as HTMLElement
      if (headingButton) {
        updateHeadingButton(headingButton)
      }
    })
    
    editor.contentElement.addEventListener('click', () => {
      const headingButton = document.querySelector('[data-name="heading"]') as HTMLElement
      if (headingButton) {
        updateHeadingButton(headingButton)
      }
    })
  }
}