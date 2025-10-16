/**
 * 链接插入对话框
 * 提供友好的界面让用户输入链接文本和URL
 */

export interface LinkDialogOptions {
  selectedText?: string
  onConfirm?: (text: string, url: string) => void
  onCancel?: () => void
}

/**
 * 显示链接插入对话框
 */
export function showLinkDialog(options: LinkDialogOptions = {}): void {
  const { selectedText = '', onConfirm, onCancel } = options

  // 创建遮罩层
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  `

  // 创建对话框
  const dialog = document.createElement('div')
  dialog.style.cssText = `
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 90%;
    max-width: 480px;
    animation: slideUp 0.3s ease-out;
  `

  // 创建内容
  dialog.innerHTML = `
    <div style="padding: 24px;">
      <h3 style="
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        插入链接
      </h3>
      
      <div style="margin-bottom: 16px; ${selectedText ? 'display: none;' : ''}">
        <label style="
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        ">链接文本</label>
        <input type="text" id="link-text-input" value="${selectedText}" placeholder="请输入链接文本" style="
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        " />
      </div>
      
      ${selectedText ? `
        <div style="
          margin-bottom: 16px;
          padding: 12px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
        ">
          <div style="
            font-size: 12px;
            color: #0369a1;
            margin-bottom: 4px;
          ">已选中文本</div>
          <div style="
            font-size: 14px;
            color: #0c4a6e;
            font-weight: 500;
          ">${selectedText}</div>
        </div>
      ` : ''}
      
      <div style="margin-bottom: 20px;">
        <label style="
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        ">链接地址</label>
        <input type="text" id="link-url-input" placeholder="https://example.com" style="
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        " />
        <div style="
          margin-top: 6px;
          font-size: 12px;
          color: #6b7280;
        ">请输入完整的URL地址，包括 http:// 或 https://</div>
      </div>
      
      <div style="
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      ">
        <button id="link-cancel-btn" style="
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">取消</button>
        <button id="link-confirm-btn" style="
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          background: #3b82f6;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">确定</button>
      </div>
    </div>
  `

  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  // 添加动画样式
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    #link-text-input:focus,
    #link-url-input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    #link-cancel-btn:hover {
      background: #f9fafb !important;
      border-color: #9ca3af !important;
    }
    
    #link-confirm-btn:hover {
      background: #2563eb !important;
    }
    
    #link-confirm-btn:disabled {
      background: #9ca3af !important;
      cursor: not-allowed !important;
    }
  `
  document.head.appendChild(style)

  // 获取输入框和按钮
  const textInput = document.getElementById('link-text-input') as HTMLInputElement
  const urlInput = document.getElementById('link-url-input') as HTMLInputElement
  const confirmBtn = document.getElementById('link-confirm-btn') as HTMLButtonElement
  const cancelBtn = document.getElementById('link-cancel-btn') as HTMLButtonElement

  // 自动聚焦到合适的输入框
  if (selectedText) {
    urlInput.focus()
  } else {
    textInput.focus()
  }

  // 验证输入
  const validateInputs = () => {
    const text = selectedText || textInput.value.trim()
    const url = urlInput.value.trim()
    
    if (text && url) {
      confirmBtn.disabled = false
    } else {
      confirmBtn.disabled = true
    }
  }

  // 监听输入变化
  textInput.addEventListener('input', validateInputs)
  urlInput.addEventListener('input', validateInputs)
  
  // 初始验证
  validateInputs()

  // 关闭对话框
  const closeDialog = () => {
    overlay.style.animation = 'fadeIn 0.2s ease-out reverse'
    dialog.style.animation = 'slideUp 0.2s ease-out reverse'
    setTimeout(() => {
      overlay.remove()
      style.remove()
    }, 200)
  }

  // 确认按钮
  confirmBtn.addEventListener('click', () => {
    const text = selectedText || textInput.value.trim()
    const url = urlInput.value.trim()
    
    if (text && url) {
      // 自动补全协议
      let finalUrl = url
      if (!/^https?:\/\//i.test(url)) {
        finalUrl = 'https://' + url
      }
      
      if (onConfirm) {
        onConfirm(text, finalUrl)
      }
      closeDialog()
    }
  })

  // 取消按钮
  cancelBtn.addEventListener('click', () => {
    if (onCancel) {
      onCancel()
    }
    closeDialog()
  })

  // 点击遮罩层关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      if (onCancel) {
        onCancel()
      }
      closeDialog()
    }
  })

  // ESC键关闭
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (onCancel) {
        onCancel()
      }
      closeDialog()
      document.removeEventListener('keydown', handleEsc)
    }
  }
  document.addEventListener('keydown', handleEsc)

  // Enter键确认
  const handleEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !confirmBtn.disabled) {
      confirmBtn.click()
    }
  }
  urlInput.addEventListener('keypress', handleEnter)
  if (!selectedText) {
    textInput.addEventListener('keypress', handleEnter)
  }
}