/**
 * AI 建议浮层组件
 * 用于显示 AI 生成的建议内容
 */

export interface AISuggestionsOverlayOptions {
  autoHide?: boolean
  position?: 'cursor' | 'center' | 'bottom'
  maxHeight?: number
  width?: number
}

class AISuggestionsOverlay {
  private container: HTMLElement
  private suggestions: string[]
  private selectedIndex: number = 0
  private onSelect: (suggestion: string) => void
  private options: AISuggestionsOverlayOptions
  
  constructor(
    editor: any,
    suggestions: string[],
    onSelect: (suggestion: string) => void,
    options: AISuggestionsOverlayOptions = {}
  ) {
    this.suggestions = suggestions
    this.onSelect = onSelect
    this.options = {
      autoHide: false,
      position: 'cursor',
      maxHeight: 300,
      width: 400,
      ...options
    }
    
    this.container = this.createElement()
    this.render()
    this.attachEventListeners()
    this.show(editor)
  }
  
  private createElement(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'ldesign-ai-suggestions-overlay'
    container.style.cssText = `
      position: absolute;
      z-index: 10000;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-height: ${this.options.maxHeight}px;
      width: ${this.options.width}px;
      overflow-y: auto;
      display: none;
    `
    
    return container
  }
  
  private render(): void {
    this.container.innerHTML = `
      <div class="ldesign-ai-suggestions-header" style="
        padding: 12px 16px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div style="display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 8px;">🤖</span>
          <span style="font-weight: 500;">AI 建议</span>
        </div>
        <button class="ldesign-ai-suggestions-close" style="
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #666;
          padding: 4px;
        ">✕</button>
      </div>
      <div class="ldesign-ai-suggestions-list" style="padding: 8px;">
        ${this.suggestions.map((suggestion, index) => `
          <div class="ldesign-ai-suggestion-item" data-index="${index}" style="
            padding: 12px;
            margin-bottom: 8px;
            background: ${index === this.selectedIndex ? '#f5f5f5' : 'white'};
            border: 1px solid ${index === this.selectedIndex ? '#1890ff' : '#e0e0e0'};
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            max-height: 150px;
            overflow-y: auto;
          ">
            <div style="
              font-size: 14px;
              line-height: 1.6;
              color: #333;
              white-space: pre-wrap;
              word-wrap: break-word;
            ">${this.escapeHtml(suggestion)}</div>
            ${index === 0 ? `
              <div style="
                margin-top: 8px;
                display: flex;
                gap: 8px;
              ">
                <button class="ldesign-ai-accept" style="
                  padding: 4px 12px;
                  background: #1890ff;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                ">接受 (Enter)</button>
                <button class="ldesign-ai-reject" style="
                  padding: 4px 12px;
                  background: white;
                  color: #666;
                  border: 1px solid #d9d9d9;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                ">取消 (Esc)</button>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ${this.suggestions.length === 0 ? `
        <div style="
          padding: 32px;
          text-align: center;
          color: #999;
        ">暂无建议</div>
      ` : ''}
    `
  }
  
  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
  
  private attachEventListeners(): void {
    // 关闭按钮
    const closeBtn = this.container.querySelector('.ldesign-ai-suggestions-close')
    closeBtn?.addEventListener('click', () => this.hide())
    
    // 建议项点击
    this.container.querySelectorAll('.ldesign-ai-suggestion-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectedIndex = index
        this.acceptSuggestion()
      })
    })
    
    // 接受/拒绝按钮
    const acceptBtn = this.container.querySelector('.ldesign-ai-accept')
    const rejectBtn = this.container.querySelector('.ldesign-ai-reject')
    
    acceptBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.acceptSuggestion()
    })
    
    rejectBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.hide()
    })
    
    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown)
    
    // 自动隐藏
    if (this.options.autoHide) {
      setTimeout(() => this.hide(), 5000)
    }
  }
  
  private handleKeyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        this.selectedIndex = Math.max(0, this.selectedIndex - 1)
        this.updateSelection()
        break
      case 'ArrowDown':
        e.preventDefault()
        this.selectedIndex = Math.min(this.suggestions.length - 1, this.selectedIndex + 1)
        this.updateSelection()
        break
      case 'Enter':
        e.preventDefault()
        this.acceptSuggestion()
        break
      case 'Escape':
        e.preventDefault()
        this.hide()
        break
    }
  }
  
  private updateSelection(): void {
    this.container.querySelectorAll('.ldesign-ai-suggestion-item').forEach((item, index) => {
      const element = item as HTMLElement
      if (index === this.selectedIndex) {
        element.style.background = '#f5f5f5'
        element.style.borderColor = '#1890ff'
      } else {
        element.style.background = 'white'
        element.style.borderColor = '#e0e0e0'
      }
    })
  }
  
  private acceptSuggestion(): void {
    if (this.suggestions.length > 0) {
      this.onSelect(this.suggestions[this.selectedIndex])
      this.hide()
    }
  }
  
  private show(editor: any): void {
    // 获取编辑器位置
    const editorRect = editor.element?.getBoundingClientRect()
    if (!editorRect) return
    
    // 根据位置选项设置位置
    if (this.options.position === 'cursor') {
      // 获取光标位置
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        this.container.style.left = `${rect.left}px`
        this.container.style.top = `${rect.bottom + 10}px`
      }
    } else if (this.options.position === 'center') {
      this.container.style.left = `${editorRect.left + (editorRect.width - this.options.width!) / 2}px`
      this.container.style.top = `${editorRect.top + 100}px`
    } else {
      this.container.style.left = `${editorRect.left + 20}px`
      this.container.style.bottom = `${window.innerHeight - editorRect.bottom + 20}px`
      this.container.style.top = 'auto'
    }
    
    document.body.appendChild(this.container)
    this.container.style.display = 'block'
    
    // 添加动画
    this.container.style.opacity = '0'
    this.container.style.transform = 'translateY(-10px)'
    setTimeout(() => {
      this.container.style.transition = 'all 0.3s'
      this.container.style.opacity = '1'
      this.container.style.transform = 'translateY(0)'
    }, 10)
  }
  
  private hide(): void {
    this.container.style.opacity = '0'
    this.container.style.transform = 'translateY(-10px)'
    
    setTimeout(() => {
      this.container.remove()
      document.removeEventListener('keydown', this.handleKeyDown)
    }, 300)
  }
}

/**
 * 显示 AI 建议浮层
 */
export function showAISuggestionsOverlay(
  editor: any,
  suggestions: string[],
  onSelect: (suggestion: string) => void,
  options?: AISuggestionsOverlayOptions
): AISuggestionsOverlay {
  return new AISuggestionsOverlay(editor, suggestions, onSelect, options)
}