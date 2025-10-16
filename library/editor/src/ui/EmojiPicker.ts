/**
 * 独立的表情选择器组件
 * 不依赖插件系统，直接被工具栏调用
 */

// 表情分类数据
const EMOJI_CATEGORIES = {
  smileys: {
    name: '笑脸',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '😠', '😡', '🤬']
  },
  gestures: {
    name: '手势',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪']
  },
  hearts: {
    name: '爱心',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
  },
  animals: {
    name: '动物',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜']
  },
  food: {
    name: '食物',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪']
  }
}

/**
 * 创建表情选择器
 */
export function showEmojiPicker(button: HTMLElement, onSelect?: (emoji: string) => void): void {
  // 检查是否已有选择器打开
  const existingPicker = document.querySelector('.ldesign-emoji-picker')
  if (existingPicker) {
    existingPicker.remove()
    return
  }

  // 创建选择器容器
  const picker = document.createElement('div')
  picker.className = 'ldesign-emoji-picker'
  picker.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 8px;
    width: 380px;
    max-height: 320px;
    overflow-y: auto;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  `

  // 创建分类标签
  const tabs = document.createElement('div')
  tabs.style.cssText = `
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
    flex-wrap: wrap;
  `

  // 创建表情容器
  const emojiContainer = document.createElement('div')
  emojiContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
  `

  // 创建分类按钮并添加表情
  Object.entries(EMOJI_CATEGORIES).forEach(([key, category], index) => {
    const tab = document.createElement('button')
    tab.textContent = category.name
    tab.style.cssText = `
      padding: 4px 12px;
      border: none;
      background: ${index === 0 ? '#4f46e5' : '#f3f4f6'};
      color: ${index === 0 ? 'white' : '#374151'};
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    `
    
    tab.onmouseover = () => {
      if (tab.style.backgroundColor !== 'rgb(79, 70, 229)') {
        tab.style.backgroundColor = '#e5e7eb'
      }
    }
    
    tab.onmouseout = () => {
      if (tab.style.backgroundColor !== 'rgb(79, 70, 229)') {
        tab.style.backgroundColor = '#f3f4f6'
      }
    }
    
    tab.onclick = () => {
      // 更新选中状态
      tabs.querySelectorAll('button').forEach(btn => {
        btn.style.backgroundColor = '#f3f4f6'
        btn.style.color = '#374151'
      })
      tab.style.backgroundColor = '#4f46e5'
      tab.style.color = 'white'
      
      // 显示对应分类的表情
      emojiContainer.innerHTML = ''
      category.emojis.forEach(emoji => {
        const emojiBtn = document.createElement('button')
        emojiBtn.textContent = emoji
        emojiBtn.style.cssText = `
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
          border-radius: 4px;
          transition: background 0.2s;
        `
        
        emojiBtn.onmouseover = () => {
          emojiBtn.style.backgroundColor = '#f3f4f6'
        }
        
        emojiBtn.onmouseout = () => {
          emojiBtn.style.backgroundColor = 'transparent'
        }
        
        emojiBtn.onclick = () => {
          // 插入表情
          if (onSelect) {
            onSelect(emoji)
          } else {
            document.execCommand('insertText', false, emoji)
          }
          picker.remove()
        }
        
        emojiContainer.appendChild(emojiBtn)
      })
    }
    
    tabs.appendChild(tab)
    
    // 默认显示第一个分类
    if (index === 0) {
      tab.click()
    }
  })

  picker.appendChild(tabs)
  picker.appendChild(emojiContainer)

  // 设置位置
  const rect = button.getBoundingClientRect()
  picker.style.top = `${rect.bottom + 5}px`
  picker.style.left = `${rect.left}px`
  
  // 检查是否超出边界
  setTimeout(() => {
    const pickerRect = picker.getBoundingClientRect()
    if (pickerRect.right > window.innerWidth) {
      picker.style.left = `${window.innerWidth - pickerRect.width - 10}px`
    }
    if (pickerRect.bottom > window.innerHeight) {
      picker.style.top = `${rect.top - pickerRect.height - 5}px`
    }
  }, 0)

  // 添加到页面
  document.body.appendChild(picker)

  // 点击外部关闭
  setTimeout(() => {
    const closeOnClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (button.contains(target)) {
        return // 如果点击的是按钮本身，不关闭
      }
      if (!picker.contains(target)) {
        picker.remove()
        document.removeEventListener('click', closeOnClickOutside)
      }
    }
    document.addEventListener('click', closeOnClickOutside)
  }, 100)
}