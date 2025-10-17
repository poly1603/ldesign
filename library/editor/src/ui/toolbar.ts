/**
 * 工具栏组件
 * 使用 Lucide 图标
 */

import type { ToolbarItem, Editor as EditorType } from '../types'
import { createIcon } from './icons'
import { showDropdown } from './Dropdown'
import { showColorDropdown, showEmojiDropdown } from './UnifiedDropdown'
import { showMediaInsert, insertMedia } from './MediaInsert'
import { showUnifiedDialog } from './UnifiedDialog'
import { FONT_SIZES, FONT_FAMILIES } from '../plugins/formatting/font'
import { LINE_HEIGHTS } from '../plugins/formatting/line-height'
import { DEFAULT_TOOLBAR_ITEMS } from './defaultToolbar'
import { bindTooltip } from './Tooltip'

export interface ToolbarOptions {
  items?: ToolbarItem[]
  container?: HTMLElement
  className?: string
}

export class Toolbar {
  private editor: EditorType
  private options: ToolbarOptions
  private element: HTMLElement
  private buttons: Map<string, HTMLButtonElement> = new Map()

  constructor(editor: EditorType, options: ToolbarOptions = {}) {
    this.editor = editor
    this.options = options

    // 创建工具栏容器
    this.element = document.createElement('div')
    this.element.className = `ldesign-editor-toolbar ${options.className || ''}`

    // 渲染工具栏项
    this.render()

    // 监听编辑器更新，更新按钮状态
    this.editor.on('update', () => this.updateButtonStates())
    this.editor.on('selectionUpdate', () => this.updateButtonStates())
  }

  /**
   * 渲染工具栏
   */
  private render(): void {
    console.log('[Toolbar] Starting render...')
    console.log('[Toolbar] Options:', this.options)
    
    const items = this.options.items || this.getDefaultItems()
    console.log('[Toolbar] Items to render:', items.length, items)

    items.forEach((item, index) => {
      console.log(`[Toolbar] Creating button for: ${item.name}`)
      // 创建按钮
      const button = this.createButton(item)
      this.buttons.set(item.name, button)
      this.element.appendChild(button)

      // 添加分隔符
      if (this.shouldAddSeparator(index, items)) {
        const separator = document.createElement('div')
        separator.className = 'ldesign-editor-toolbar-separator'
        this.element.appendChild(separator)
      }
    })

    // 如果提供了容器，插入到容器中
    if (this.options.container) {
      console.log('[Toolbar] Appending to container:', this.options.container)
      this.options.container.appendChild(this.element)
    } else {
      console.log('[Toolbar] No container provided')
    }
    
    console.log('[Toolbar] Render complete. Element:', this.element)
    console.log('[Toolbar] Element children:', this.element.children.length)
  }

  /**
   * 创建按钮
   */
  private createButton(item: ToolbarItem): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'ldesign-editor-toolbar-button'
    button.type = 'button'
    // 使用自定义 Tooltip，避免原生 title 样式受限
    if (item.title) {
      bindTooltip(button, item.title)
    }
    button.setAttribute('data-name', item.name)

    // 判断是否是下拉按钮（需要箭头指示器）
    const isDropdown = ['heading', 'align', 'fontSize', 'fontFamily', 'lineHeight', 'textTransform', 'ai'].includes(item.name)
    
    // 如果是下拉按钮，需要更宽的按钮容纳图标和箭头
    if (isDropdown) {
      button.style.width = 'auto'
      button.style.minWidth = item.name === 'heading' ? '80px' : '48px'  // 标题按钮需要更宽
      button.style.paddingLeft = '8px'
      button.style.paddingRight = '8px'
      button.style.gap = '4px'
      button.style.display = 'flex'
      button.style.alignItems = 'center'
      button.style.justifyContent = 'space-between'
    }

    // 如果是标题按钮，特殊处理
    if (item.name === 'heading') {
      // 不使用默认图标，而是创建实时更新的文本
      const levelText = document.createElement('span')
      levelText.className = 'heading-level-text'
      levelText.style.fontSize = '14px'
      levelText.style.fontWeight = '600'
      levelText.style.marginRight = 'auto'
      levelText.textContent = 'H1'  // 默认显示
      button.appendChild(levelText)
        
      // 更新当前级别显示
      const updateLevelText = () => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) {
          levelText.textContent = '正文'
          return
        }
        
        let element = selection.anchorNode
        if (!element) {
          levelText.textContent = '正文'
          return
        }
        
        element = element.nodeType === Node.TEXT_NODE 
          ? element.parentElement 
          : element as HTMLElement
        
        while (element && element !== document.body) {
          const tagName = element.tagName?.toUpperCase()
          switch(tagName) {
            case 'H1': levelText.textContent = 'H1'; return
            case 'H2': levelText.textContent = 'H2'; return
            case 'H3': levelText.textContent = 'H3'; return
            case 'H4': levelText.textContent = 'H4'; return
            case 'H5': levelText.textContent = 'H5'; return
            case 'H6': levelText.textContent = 'H6'; return
            case 'P':
            case 'DIV':
              if (!element.closest('h1,h2,h3,h4,h5,h6')) {
                levelText.textContent = '正文'
                return
              }
              break
          }
          element = element.parentElement
        }
        levelText.textContent = '正文'
      }
      
      // 监听事件
      button.addEventListener('mouseenter', updateLevelText)
      document.addEventListener('selectionchange', updateLevelText)
      if (this.editor.contentElement) {
        this.editor.contentElement.addEventListener('input', updateLevelText)
      }
      
      // 初始化显示
      updateLevelText()
    } else {
      // 其他按钮使用图标
      const iconElement = createIcon(item.icon)
      if (iconElement) {
        button.appendChild(iconElement)
      } else {
        button.textContent = item.title
      }
    }
    
    // 如果是下拉按钮，添加向下箭头
    if (isDropdown) {
      const chevron = createIcon('chevron-down')
      if (chevron) {
        chevron.style.opacity = '0.6'
        button.appendChild(chevron)
      }
    }

    // 防止按钮获取焦点导致选区丢失
    button.addEventListener('mousedown', (e) => {
      e.preventDefault()
    })

    // 绑定点击事件
    button.addEventListener('click', (e) => {
      e.preventDefault()

      // 特殊处理：颜色选择器（使用统一的下拉框）
      if (item.name === 'textColor') {
        showColorDropdown(button, (color) => {
          this.editor.commands.execute('setTextColor', color)
        }, true, '文字颜色')
        return
      }

      if (item.name === 'backgroundColor') {
        showColorDropdown(button, (color) => {
          this.editor.commands.execute('setBackgroundColor', color)
        }, true, '背景色')
        return
      }

      // 特殊处理：标题级别下拉
      if (item.name === 'heading') {
        // 获取当前标题级别
        const getCurrentLevel = () => {
          const selection = window.getSelection()
          if (!selection || selection.rangeCount === 0) return 'p'
          
          let element = selection.anchorNode
          if (!element) return 'p'
          
          element = element.nodeType === Node.TEXT_NODE 
            ? element.parentElement 
            : element as HTMLElement
          
          while (element && element !== document.body) {
            const tagName = element.tagName?.toUpperCase()
            if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
              return tagName.toLowerCase()
            }
            if (['P', 'DIV'].includes(tagName) && !element.closest('h1,h2,h3,h4,h5,h6')) {
              return 'p'
            }
            element = element.parentElement
          }
          return 'p'
        }
        
        const currentLevel = getCurrentLevel()
        
        showDropdown(button, {
          options: [
            { label: '正文', value: 'p' },
            { label: '标题 1', value: 'h1' },
            { label: '标题 2', value: 'h2' },
            { label: '标题 3', value: 'h3' },
            { label: '标题 4', value: 'h4' },
            { label: '标题 5', value: 'h5' },
            { label: '标题 6', value: 'h6' }
          ],
          selectedValue: currentLevel,  // 传递当前值
          onSelect: (value) => {
            const map: Record<string, string> = {
              p: 'setParagraph',
              h1: 'setHeading1',
              h2: 'setHeading2',
              h3: 'setHeading3',
              h4: 'setHeading4',
              h5: 'setHeading5',
              h6: 'setHeading6',
            }
            const cmd = map[value]
            if (cmd) {
              this.editor.commands.execute(cmd)
            } else {
              // 回退到原生命令
              document.execCommand('formatBlock', false, value)
            }
          }
        })
        return
      }

      // 特殊处理：对齐方式下拉
      if (item.name === 'align') {
        showDropdown(button, {
          options: [
            { label: '左对齐', value: 'left' },
            { label: '居中', value: 'center' },
            { label: '右对齐', value: 'right' },
            { label: '两端对齐', value: 'justify' },
          ],
          onSelect: (value) => {
            const map: Record<string, string> = {
              left: 'alignLeft',
              center: 'alignCenter',
              right: 'alignRight',
              justify: 'alignJustify',
            }
            const cmd = map[value]
            if (cmd) {
              this.editor.commands.execute(cmd)
            }
          }
        })
        return
      }

      // 特殊处理：字体大小选择器
      if (item.name === 'fontSize') {
        showDropdown(button, {
          options: FONT_SIZES,
          onSelect: (size) => {
            this.editor.commands.execute('setFontSize', size)
          }
        })
        return
      }

      // 特殊处理：字体家族选择器
      if (item.name === 'fontFamily') {
        showDropdown(button, {
          options: FONT_FAMILIES,
          onSelect: (family) => {
            this.editor.commands.execute('setFontFamily', family)
          }
        })
        return
      }

      // 特殊处理：行高选择器
      if (item.name === 'lineHeight') {
        showDropdown(button, {
          options: LINE_HEIGHTS,
          onSelect: (height) => {
            this.editor.commands.execute('setLineHeight', height)
          }
        })
        return
      }

      // 特殊处理：文本转换
      if (item.name === 'textTransform') {
        showDropdown(button, {
          options: [
            { label: '大写', value: 'toUpperCase' },
            { label: '小写', value: 'toLowerCase' },
            { label: '首字母大写', value: 'toCapitalize' },
            { label: '句子大小写', value: 'toSentenceCase' },
            { label: '全角转半角', value: 'toHalfWidth' },
            { label: '半角转全角', value: 'toFullWidth' }
          ],
          onSelect: (command) => {
            this.editor.commands.execute(command)
          }
        })
        return
      }
      
      // 特殊处理：AI 功能下拉菜单
      if (item.name === 'ai') {
        showDropdown(button, {
          options: [
            { label: 'AI 纠错', value: 'ai-correct', icon: 'sparkles' },
            { label: 'AI 补全', value: 'ai-complete', icon: 'lightbulb' },
            { label: 'AI 续写', value: 'ai-continue', icon: 'pen-tool' },
            { label: 'AI 重写', value: 'ai-rewrite', icon: 'refresh-cw' },
            { label: '---', value: 'separator' }, // 分隔线
            { label: 'AI 设置', value: 'ai-config', icon: 'settings' }
          ],
          onSelect: (command) => {
            if (command === 'separator') return
            
            console.log('[Toolbar] AI dropdown selected:', command)
            console.log('[Toolbar] Available commands:', this.editor.commands.getCommands())
            console.log('[Toolbar] Has command?', this.editor.commands.has(command))
            
            // 直接执行 AI 命令
            if (this.editor.commands.has(command)) {
              console.log('[Toolbar] Executing AI command:', command)
              this.editor.commands.execute(command)
            } else {
              console.warn(`[Toolbar] AI command '${command}' not found. Make sure AI plugin is loaded.`)
              console.warn('[Toolbar] Available commands:', this.editor.commands.getCommands())
            }
          },
          renderOption: (option) => {
            // 自定义渲染分隔线
            if (option.value === 'separator') {
              const separator = document.createElement('div')
              separator.style.cssText = 'height: 1px; background: #e0e0e0; margin: 4px 0;'
              return separator
            }
            return null // 使用默认渲染
          }
        })
        return
      }
      
      // 特殊处理：媒体插入
      if (item.name === 'image') {
        showMediaInsert(button, {
          type: 'image',
          onInsert: (urls, alt) => {
            // 确保编辑器获得焦点
            if (this.editor.contentElement) {
              this.editor.contentElement.focus()
            }
            insertMedia('image', urls, { alt })
            if (this.editor.emit) {
              this.editor.emit('update')
            }
          },
          multiple: true
        })
        return
      }
      
      if (item.name === 'video') {
        showMediaInsert(button, {
          type: 'video',
          onInsert: (urls, alt) => {
            // 确保编辑器获得焦点
            if (this.editor.contentElement) {
              this.editor.contentElement.focus()
            }
            insertMedia('video', urls)
            if (this.editor.emit) {
              this.editor.emit('update')
            }
          },
          multiple: false
        })
        return
      }
      
      if (item.name === 'audio') {
        showMediaInsert(button, {
          type: 'audio',
          onInsert: (urls, alt) => {
            // 确保编辑器获得焦点
            if (this.editor.contentElement) {
              this.editor.contentElement.focus()
            }
            insertMedia('audio', urls)
            if (this.editor.emit) {
              this.editor.emit('update')
            }
          },
          multiple: false
        })
        return
      }
      
      // 特殊处理：表情选择器（使用统一的下拉框）
      if (item.name === 'emoji') {
        console.log('[Toolbar] Opening emoji picker')
        showEmojiDropdown(button, (emoji) => {
          console.log('[Toolbar] Inserting emoji:', emoji)
          document.execCommand('insertText', false, emoji)
        })
        return
      }
      
      // 特殊处理：查找替换
      if (item.name === 'search') {
        console.log('[Toolbar] Opening find-replace dialog')
        
        // 获取当前选中的文本
        const selection = window.getSelection()
        const selectedText = selection && selection.toString().trim() || ''
        
        // 保存当前高亮状态
        let currentHighlights: NodeListOf<Element> | null = null
        let totalMatches = 0
        
        showUnifiedDialog({
          title: '查找和替换',
          width: 520,
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>`,
          fields: [
            {
              id: 'findText',
              type: 'text',
              label: '查找内容',
              placeholder: '输入要查找的文本',
              required: true,
              defaultValue: selectedText
            },
            {
              id: 'replaceText',
              type: 'text',
              label: '替换为',
              placeholder: '输入替换文本',
              required: false
            },
            {
              id: 'actionType',
              type: 'select',
              label: '操作',
              defaultValue: 'find',
              options: [
                { label: '仅查找', value: 'find' },
                { label: '查找并替换全部', value: 'replaceAll' }
              ]
            },
            {
              id: 'caseSensitive',
              type: 'checkbox',
              label: '区分大小写',
              defaultValue: false
            },
            {
              id: 'wholeWord',
              type: 'checkbox',
              label: '全字匹配',
              defaultValue: false
            }
          ],
          onSubmit: (data) => {
            console.log('[Toolbar] Find/Replace data:', data)
            const content = this.editor.contentElement
            if (!content) return
            
            const findText = data.findText
            const replaceText = data.replaceText || ''
            const actionType = data.actionType || 'find'
            const caseSensitive = data.caseSensitive
            const wholeWord = data.wholeWord
            
            // 创建正则表达式
            const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const wordBoundary = wholeWord ? '\\b' : ''
            const pattern = new RegExp(
              `${wordBoundary}${escaped}${wordBoundary}`,
              caseSensitive ? 'g' : 'gi'
            )
            
            // 默认执行查找操作
            console.log('[Find] Starting search for:', findText)
            console.log('[Find] Options:', { caseSensitive, wholeWord })
            
            // 清除之前的高亮
            content.querySelectorAll('.editor-highlight').forEach(el => {
              const text = el.textContent || ''
              const textNode = document.createTextNode(text)
              const parent = el.parentNode
              if (parent) {
                parent.replaceChild(textNode, el)
              }
            })
            
            // 高亮所有匹配项
            let count = 0
            
            // 递归处理所有文本节点
            const processNode = (node: Node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || ''
                if (!text.trim()) return // 跳过空文本节点
                
                // 重置正则表达式
                pattern.lastIndex = 0
                const matches: RegExpExecArray[] = []
                let match: RegExpExecArray | null
                
                while ((match = pattern.exec(text)) !== null) {
                  matches.push([...match] as RegExpExecArray)
                  count++
                  // 防止无限循环
                  if (!pattern.global) break
                }
                
                if (matches.length > 0) {
                  const parent = node.parentNode
                  if (!parent) return
                  
                  const fragment = document.createDocumentFragment()
                  let lastIndex = 0
                  
                  matches.forEach(m => {
                    const matchIndex = m.index || 0
                    const matchText = m[0]
                    
                    // 添加匹配前的文本
                    if (matchIndex > lastIndex) {
                      fragment.appendChild(
                        document.createTextNode(text.substring(lastIndex, matchIndex))
                      )
                    }
                    
                    // 添加高亮的匹配文本
                    const highlight = document.createElement('span')
                    highlight.className = 'editor-highlight'
                    highlight.style.background = '#fef08a'
                    highlight.style.padding = '1px 2px'
                    highlight.style.borderRadius = '2px'
                    highlight.textContent = matchText
                    fragment.appendChild(highlight)
                    
                    lastIndex = matchIndex + matchText.length
                  })
                  
                  // 添加剩余文本
                  if (lastIndex < text.length) {
                    fragment.appendChild(
                      document.createTextNode(text.substring(lastIndex))
                    )
                  }
                  
                  // 替换原节点
                  parent.replaceChild(fragment, node)
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                // 跳过某些元素
                const tagName = (node as HTMLElement).tagName?.toLowerCase()
                if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                  return
                }
                // 递归处理子节点
                const children = Array.from(node.childNodes)
                children.forEach(child => processNode(child))
              }
            }
            
            // 开始处理
            processNode(content)
            
            console.log('[Find] Found matches:', count)
            
            if (count > 0) {
              // 滚动到第一个匹配项
              const firstMatch = content.querySelector('.editor-highlight')
              if (firstMatch) {
                firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
                // 添加当前高亮
                firstMatch.style.background = '#facc15'
              }
            }
              
              // 保存匹配数量
              totalMatches = count
              currentHighlights = content.querySelectorAll('.editor-highlight')
              
              // 根据操作类型执行不同操作
              if (actionType === 'replaceAll' && count > 0) {
                // 执行全部替换
                if (!replaceText && replaceText !== '') {
                  alert('请输入替换文本')
                  return
                }
                
                if (confirm(`确定要将 ${count} 处 "${findText}" 替换为 "${replaceText || '(空)'}" 吗？`)) {
                  // 收集所有需要替换的节点组（处理连续的高亮节点）
                  const nodeGroups: Array<{elements: HTMLElement[], parent: Node}> = []
                  const processedNodes = new Set<HTMLElement>()
                  
                  currentHighlights.forEach(el => {
                    if (!(el instanceof HTMLElement) || !el.parentNode || processedNodes.has(el)) {
                      return
                    }
                    
                    // 收集连续的高亮节点
                    const group: HTMLElement[] = [el]
                    processedNodes.add(el)
                    
                    // 检查后续兄弟节点是否也是高亮节点
                    let nextSibling = el.nextSibling
                    while (nextSibling) {
                      if (nextSibling instanceof HTMLElement && 
                          nextSibling.classList.contains('editor-highlight') &&
                          !processedNodes.has(nextSibling)) {
                        group.push(nextSibling)
                        processedNodes.add(nextSibling)
                        nextSibling = nextSibling.nextSibling
                      } else if (nextSibling.nodeType === Node.TEXT_NODE && 
                                !nextSibling.textContent?.trim()) {
                        // 跳过空白文本节点
                        nextSibling = nextSibling.nextSibling
                      } else {
                        break
                      }
                    }
                    
                    nodeGroups.push({elements: group, parent: el.parentNode})
                  })
                  
                  // 执行替换
                  let replacedCount = 0
                  nodeGroups.forEach(({elements, parent}) => {
                    try {
                      // 获取组中所有文本
                      const fullText = elements.map(el => el.textContent || '').join('')
                      console.log(`[Replace] Replacing "${fullText}" with "${replaceText}"`)
                      
                      // 创建替换文本节点
                      const newTextNode = document.createTextNode(replaceText)
                      
                      // 替换第一个节点
                      parent.replaceChild(newTextNode, elements[0])
                      
                      // 删除其余节点
                      for (let i = 1; i < elements.length; i++) {
                        if (elements[i].parentNode) {
                          elements[i].remove()
                        }
                      }
                      
                      replacedCount++
                    } catch (e) {
                      console.error('替换失败:', e)
                    }
                  })
                  
                  // 显示成功消息
                  const successMessage = document.createElement('div')
                  successMessage.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10001;
                  `
                  successMessage.textContent = `成功替换 ${replacedCount} 处`
                  document.body.appendChild(successMessage)
                  setTimeout(() => successMessage.remove(), 3000)
                  
                  console.log(`替换完成: 总计${count}处, 实际替换${replacedCount}处`)
                }
              } else if (count > 0) {
                // 仅查找 - 显示结果
                const resultMessage = document.createElement('div')
                resultMessage.style.cssText = `
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  background: #3b82f6;
                  color: white;
                  padding: 12px 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  z-index: 10001;
                `
                resultMessage.textContent = `找到 ${count} 个匹配项`
                document.body.appendChild(resultMessage)
                setTimeout(() => resultMessage.remove(), 3000)
              } else {
                // 没有找到匹配项
                alert(`未找到 "${findText}"`)
              }
          }
        })
        return
      }
      
      // 特殊处理：链接插入
      if (item.name === 'link') {
        console.log('[Toolbar] Opening link dialog')
        
        // 获取当前选中的文本和范围
        const selection = window.getSelection()
        const selectedText = selection && selection.toString().trim() || ''
        let savedRange = null
        
        // 保存当前选区
        if (selection && selection.rangeCount > 0) {
          savedRange = selection.getRangeAt(0).cloneRange()
        }
        
        showUnifiedDialog({
          title: '插入链接',
          width: 500,
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>`,
          fields: [
            {
              id: 'text',
              type: 'text',
              label: '链接文本',
              placeholder: '请输入链接文本',
              required: !selectedText,
              defaultValue: selectedText,
              disabled: !!selectedText
            },
            {
              id: 'url',
              type: 'url',
              label: '链接地址',
              placeholder: 'https://example.com',
              required: true,
              helpText: '请输入完整的URL地址，包括 http:// 或 https://'
            }
          ],
          onSubmit: (data) => {
            const text = selectedText || data.text
            const url = data.url
            console.log('[Toolbar] Inserting link:', text, url)
            
            // 确保编辑器获得焦点
            const editorContent = this.editor.contentElement
            if (editorContent) {
              editorContent.focus()
            }
            
            // 恢复之前保存的选区
            if (savedRange && selection) {
              selection.removeAllRanges()
              selection.addRange(savedRange)
            }
            
            if (selectedText) {
              // 如果有选中文本，为选中的文本创建链接
              const success = document.execCommand('createLink', false, url)
              if (!success) {
                // 如果 execCommand 失败，使用替代方法
                const range = selection.getRangeAt(0)
                const link = document.createElement('a')
                link.href = url
                link.target = '_blank'
                link.textContent = selectedText
                range.deleteContents()
                range.insertNode(link)
                // 将光标移到链接后面
                range.setStartAfter(link)
                range.collapse(true)
                selection.removeAllRanges()
                selection.addRange(range)
              }
            } else {
              // 如果没有选中文本，插入新的链接
              const link = document.createElement('a')
              link.href = url
              link.target = '_blank'
              link.textContent = text
              
              // 在当前光标位置插入链接
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.deleteContents()
                range.insertNode(link)
                // 将光标移到链接后面
                range.setStartAfter(link)
                range.collapse(true)
                selection.removeAllRanges()
                selection.addRange(range)
              } else {
                // 如果没有选区，尝试使用 insertHTML
                const linkHtml = `<a href="${url}" target="_blank">${text}</a>`
                document.execCommand('insertHTML', false, linkHtml)
              }
            }
            
            // 触发更新事件
            if (this.editor.emit) {
              this.editor.emit('update')
            }
          }
        })
        return
      }

      // 如果command是字符串（命令名称），通过命令管理器执行
      if (typeof item.command === 'string') {
        if (this.editor.commands && this.editor.commands.execute) {
          console.log(`[Toolbar] Executing string command: ${item.command}`)
          this.editor.commands.execute(item.command)
          return
        }
      }
      
      // 如果是函数，直接执行
      if (typeof item.command === 'function') {
        console.log(`[Toolbar] Executing function command for: ${item.name}`)
        const state = this.editor.getState()
        // 传递 editor 作为第三个参数
        item.command(state, this.editor.dispatch.bind(this.editor), this.editor)
      }
    })

    return button
  }

  /**
   * 是否添加分隔符
   */
  private shouldAddSeparator(index: number, items: ToolbarItem[]): boolean {
    // 在特定组之间添加分隔符
    const separatorAfter = ['redo', 'code', 'heading', 'codeblock', 'taskList', 'indent', 'align', 'horizontalRule', 'fontFamily', 'backgroundColor', 'removeFormat']
    return separatorAfter.includes(items[index].name) && index < items.length - 1
  }

  /**
   * 更新按钮状态
   */
  private updateButtonStates(): void {
    const items = this.options.items || this.getDefaultItems()
    const state = this.editor.getState()

    items.forEach(item => {
      const button = this.buttons.get(item.name)
      if (!button) return

      // 更新激活状态
      if (item.active) {
        const isActive = item.active(state)
        button.classList.toggle('active', isActive)
      }

      // 更新禁用状态
      if (item.disabled) {
        const isDisabled = item.disabled(state)
        button.disabled = isDisabled
      }
    })
  }

  /**
   * 获取默认工具栏项
   */
  public getDefaultItems(): ToolbarItem[] {
    const items: ToolbarItem[] = []

    console.log('[Toolbar] Getting default items...')
    const plugins = this.editor.plugins.getAll()
    console.log('[Toolbar] Total plugins:', plugins.length)

    // 从所有插件收集工具栏项
    plugins.forEach(plugin => {
      console.log(`[Toolbar] Checking plugin: ${plugin.name}`, plugin)
      if (plugin.config && plugin.config.toolbar) {
        console.log(`[Toolbar] Found toolbar config in ${plugin.name}:`, plugin.config.toolbar)
        items.push(...plugin.config.toolbar)
      } else {
        console.log(`[Toolbar] No toolbar config in ${plugin.name}`)
      }
    })

    console.log('[Toolbar] Total toolbar items collected from plugins:', items.length)
    
    // 如果插件没有提供工具栏配置，使用默认配置
    if (items.length === 0) {
      console.log('[Toolbar] No items from plugins, using default toolbar')
      return DEFAULT_TOOLBAR_ITEMS
    }
    
    return items
  }

  /**
   * 获取工具栏元素
   */
  getElement(): HTMLElement {
    return this.element
  }

  /**
   * 销毁工具栏
   */
  destroy(): void {
    this.buttons.clear()
    this.element.remove()
  }
}
