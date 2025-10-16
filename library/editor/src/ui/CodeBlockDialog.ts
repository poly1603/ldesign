/**
 * 代码块插入对话框
 * 类似 LinkDialog 的实现方式
 */

export interface CodeBlockDialogOptions {
  selectedText?: string
  onConfirm?: (code: string, language: string, theme: string) => void
  onCancel?: () => void
}

/**
 * 显示代码块插入对话框
 */
export function showCodeBlockDialog(options: CodeBlockDialogOptions = {}): void {
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
    backdrop-filter: blur(4px);
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
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
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
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        插入代码块
      </h3>
      
      <!-- 选项区域 -->
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <div style="flex: 1;">
          <label style="
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          ">编程语言</label>
          <select id="codeblock-language-select" style="
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            background: white;
            color: #374151;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
            box-sizing: border-box;
          ">
            <option value="plaintext">纯文本</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="csharp">C#</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="json">JSON</option>
            <option value="xml">XML</option>
            <option value="markdown">Markdown</option>
            <option value="bash">Bash/Shell</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="yaml">YAML</option>
          </select>
        </div>
        
        <div style="flex: 1;">
          <label style="
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          ">主题样式</label>
          <select id="codeblock-theme-select" style="
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            background: white;
            color: #374151;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
            box-sizing: border-box;
          ">
            <option value="oneDark">One Dark (暗色)</option>
            <option value="vsLight">VS Light (亮色)</option>
            <option value="monokai">Monokai</option>
            <option value="dracula">Dracula</option>
          </select>
        </div>
      </div>
      
      <!-- 代码编辑器区域 -->
      <div style="margin-bottom: 16px;">
        <label style="
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        ">代码内容</label>
        <textarea id="codeblock-textarea" placeholder="在此输入或粘贴代码..." style="
          width: 100%;
          height: 400px;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        ">${selectedText}</textarea>
        <div style="
          margin-top: 6px;
          font-size: 12px;
          color: #6b7280;
        ">提示：使用 Tab 键插入缩进，Ctrl+Enter 快速插入</div>
      </div>
      
      <!-- 按钮区域 -->
      <div style="
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      ">
        <button id="codeblock-cancel-btn" style="
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
        <button id="codeblock-confirm-btn" style="
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          background: #3b82f6;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">插入代码</button>
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
    
    #codeblock-language-select:focus,
    #codeblock-theme-select:focus,
    #codeblock-textarea:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    #codeblock-cancel-btn:hover {
      background: #f9fafb !important;
      border-color: #9ca3af !important;
    }
    
    #codeblock-confirm-btn:hover {
      background: #2563eb !important;
    }
    
    #codeblock-confirm-btn:disabled {
      background: #9ca3af !important;
      cursor: not-allowed !important;
    }
  `
  document.head.appendChild(style)

  // 获取输入框和按钮
  const textarea = document.getElementById('codeblock-textarea') as HTMLTextAreaElement
  const languageSelect = document.getElementById('codeblock-language-select') as HTMLSelectElement
  const themeSelect = document.getElementById('codeblock-theme-select') as HTMLSelectElement
  const confirmBtn = document.getElementById('codeblock-confirm-btn') as HTMLButtonElement
  const cancelBtn = document.getElementById('codeblock-cancel-btn') as HTMLButtonElement

  // 处理Tab键
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      textarea.value = value.substring(0, start) + '  ' + value.substring(end)
      textarea.selectionStart = textarea.selectionEnd = start + 2
    }
  })

  // 自动聚焦到文本框
  setTimeout(() => {
    textarea.focus()
  }, 100)

  // 验证输入
  const validateInputs = () => {
    const code = textarea.value.trim()
    
    if (code) {
      confirmBtn.disabled = false
    } else {
      confirmBtn.disabled = true
    }
  }

  // 监听输入变化
  textarea.addEventListener('input', validateInputs)
  
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
    const code = textarea.value.trim()
    const language = languageSelect.value
    const theme = themeSelect.value
    
    if (code && onConfirm) {
      onConfirm(code, language, theme)
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

  // Ctrl+Enter快速插入
  textarea.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter' && !confirmBtn.disabled) {
      confirmBtn.click()
    }
  })
}
