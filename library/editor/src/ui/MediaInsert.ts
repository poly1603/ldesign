/**
 * 媒体插入功能
 * 支持图片、视频、音频的本地上传和网络地址插入
 */

import { showDropdown } from './Dropdown'
import { showUnifiedDialog } from './UnifiedDialog'
import { createIcon } from '../ui/icons'

export type MediaType = 'image' | 'video' | 'audio'

export interface MediaInsertOptions {
  type: MediaType
  onInsert: (urls: string[], alt?: string) => void
  accept?: string // 文件类型限制
  multiple?: boolean // 是否支持多选
}

/**
 * 显示媒体插入下拉框
 */
export function showMediaInsert(
  button: HTMLElement,
  options: MediaInsertOptions
): void {
  const { type, onInsert, accept, multiple = true } = options
  
  // 媒体类型配置
  const mediaConfig = {
    image: {
      title: '插入图片',
      localLabel: '本地上传',
      networkLabel: '网络图片',
      accept: accept || 'image/*',
      icon: 'image',
      localIcon: 'upload',
      networkIcon: 'globe',
      placeholder: '请输入图片地址',
      dialogTitle: '插入网络图片'
    },
    video: {
      title: '插入视频',
      localLabel: '本地上传',
      networkLabel: '网络视频',
      accept: accept || 'video/*',
      icon: 'video',
      localIcon: 'upload',
      networkIcon: 'globe',
      placeholder: '请输入视频地址',
      dialogTitle: '插入网络视频'
    },
    audio: {
      title: '插入音频',
      localLabel: '本地上传',
      networkLabel: '网络音频',
      accept: accept || 'audio/*',
      icon: 'audio',
      localIcon: 'upload',
      networkIcon: 'globe',
      placeholder: '请输入音频地址',
      dialogTitle: '插入网络音频'
    }
  }
  
  const config = mediaConfig[type]
  
  // 创建自定义内容
  const customContent = document.createElement('div')
  customContent.style.cssText = 'padding: 8px 0;'
  
  // 本地上传选项
  const localOption = createMediaOption(
    config.localIcon,
    config.localLabel,
    '从本地选择文件上传',
    () => {
      handleLocalUpload(config.accept, multiple, onInsert)
      closeDropdown()
    }
  )
  
  // 网络地址选项
  const networkOption = createMediaOption(
    config.networkIcon,
    config.networkLabel,
    '输入网络地址',
    () => {
      showNetworkDialog(config, onInsert)
      closeDropdown()
    }
  )
  
  customContent.appendChild(localOption)
  customContent.appendChild(networkOption)
  
  // 显示下拉框
  showDropdown(button, {
    customContent,
    width: 220
  })
  
  // 关闭下拉框函数
  function closeDropdown() {
    const dropdown = document.querySelector('.editor-dropdown')
    if (dropdown) {
      dropdown.classList.add('closing')
      setTimeout(() => dropdown.remove(), 150)
    }
  }
}

/**
 * 创建媒体选项
 */
function createMediaOption(
  iconName: string,
  title: string,
  description: string,
  onClick: () => void
): HTMLElement {
  const option = document.createElement('div')
  option.className = 'editor-media-option'
  option.style.cssText = `
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 12px;
  `
  
  // 图标容器
  const iconContainer = document.createElement('div')
  iconContainer.style.cssText = `
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
  `
  
  // 创建 SVG 图标
  const iconSvg = createIcon(iconName)
  if (iconSvg) {
    iconSvg.style.width = '20px'
    iconSvg.style.height = '20px'
    iconContainer.appendChild(iconSvg)
  }
  
  // 文本容器
  const textContainer = document.createElement('div')
  textContainer.style.cssText = 'flex: 1;'
  
  // 标题
  const titleEl = document.createElement('div')
  titleEl.style.cssText = `
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  `
  titleEl.textContent = title
  
  // 描述
  const descEl = document.createElement('div')
  descEl.style.cssText = `
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  `
  descEl.textContent = description
  
  textContainer.appendChild(titleEl)
  textContainer.appendChild(descEl)
  
  option.appendChild(iconContainer)
  option.appendChild(textContainer)
  
  // 悬停效果
  option.addEventListener('mouseenter', () => {
    option.style.backgroundColor = '#f9fafb'
  })
  
  option.addEventListener('mouseleave', () => {
    option.style.backgroundColor = 'transparent'
  })
  
  // 点击事件
  option.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  })
  
  // 防止获取焦点
  option.addEventListener('mousedown', (e) => {
    e.preventDefault()
  })
  
  return option
}

/**
 * 处理本地文件上传
 */
function handleLocalUpload(
  accept: string,
  multiple: boolean,
  onInsert: (urls: string[]) => void
): void {
  // 创建隐藏的文件输入框
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = accept
  fileInput.multiple = multiple
  fileInput.style.display = 'none'
  
  // 文件选择处理
  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files || [])
    if (files.length === 0) return
    
    // 处理文件（这里简化处理，实际应用中需要上传到服务器）
    const urls: string[] = []
    let processed = 0
    
    files.forEach(file => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const url = e.target?.result as string
        urls.push(url)
        processed++
        
        // 所有文件处理完成
        if (processed === files.length) {
          onInsert(urls)
        }
      }
      
      reader.onerror = () => {
        processed++
        console.error('文件读取失败:', file.name)
        
        if (processed === files.length && urls.length > 0) {
          onInsert(urls)
        }
      }
      
      // 读取文件为 Data URL
      reader.readAsDataURL(file)
    })
    
    // 清理
    document.body.removeChild(fileInput)
  })
  
  // 取消选择处理
  fileInput.addEventListener('cancel', () => {
    document.body.removeChild(fileInput)
  })
  
  // 添加到页面并触发点击
  document.body.appendChild(fileInput)
  fileInput.click()
}

/**
 * 显示网络地址对话框
 */
function showNetworkDialog(
  config: any,
  onInsert: (urls: string[]) => void
): void {
  // 保存当前的选区
  const selection = window.getSelection()
  let savedRange: Range | null = null
  
  if (selection && selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0).cloneRange()
  }
  
  const iconMap: Record<string, string> = {
    '插入网络音频': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>`,
    '插入网络视频': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>`,
    '插入网络图片': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>`
  }
  
  showUnifiedDialog({
    title: config.dialogTitle,
    icon: iconMap[config.dialogTitle] || iconMap['插入网络图片'],
    width: 560,  // 设置更宽的宽度
    fields: [
      {
        id: 'urls',
        type: 'textarea',
        label: '地址（每行一个，可插入多个）',
        placeholder: config.placeholder + '\n' + config.placeholder + '\n...',
        required: true,
        rows: 5,
        helpText: '请输入' + config.placeholder.replace('请输入', '') + '，每行一个URL地址，支持批量插入',
        validator: (value) => {
          if (!value || !value.trim()) {
            return '请输入至少一个URL地址'
          }
          const urls = value.split('\n').map(url => url.trim()).filter(url => url)
          if (urls.length === 0) {
            return '请输入至少一个URL地址'
          }
          // 验证每个URL
          for (const url of urls) {
            try {
              new URL(url)
            } catch {
              return `无效的URL地址: ${url}`
            }
          }
          return null
        }
      },
      {
        id: 'alt',
        type: 'text',
        label: '描述文字（全部媒体共用）',
        placeholder: '可选，用于SEO和无障碍访问',
        required: false
      }
    ],
    onSubmit: (data) => {
      // 分割URL并过滤空行
      const urls = data.urls.split('\n')
        .map((url: string) => url.trim())
        .filter((url: string) => url)
      
      // 延迟恢复选区和插入，等待对话框关闭动画完成
      setTimeout(() => {
        // 恢复选区
        const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
        if (editorContent) {
          editorContent.focus()
          
          if (savedRange && selection) {
            selection.removeAllRanges()
            selection.addRange(savedRange)
          }
        }
        
        // 调用插入函数，传递alt文本
        onInsert(urls, data.alt)
      }, 250) // 等待对话框关闭动画（200ms）后再执行
    }
  })
}

/**
 * 插入媒体元素到编辑器
 */
export function insertMedia(
  type: MediaType,
  urls: string[],
  options?: {
    alt?: string
    width?: number
    height?: number
    controls?: boolean
  }
): void {
  const { alt = '', width, height, controls = true } = options || {}
  
  // 确保编辑器有焦点
  const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement
  if (!editorContent) {
    console.error('[MediaInsert] Editor content element not found')
    return
  }
  
  // 检查选区
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    // 如果没有选区，创建一个在编辑器末尾的选区
    const range = document.createRange()
    range.selectNodeContents(editorContent)
    range.collapse(false) // 折叠到末尾
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
  
  urls.forEach((url, index) => {
    let html = ''
    
    switch (type) {
      case 'image':
        html = `<img src="${url}" alt="${alt}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''} style="max-width: 100%; height: auto;">`
        break
      case 'video':
        html = `<video src="${url}"${controls ? ' controls' : ''}${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''} style="max-width: 100%;"></video>`
        break
      case 'audio':
        html = `<audio src="${url}"${controls ? ' controls' : ''}></audio>`
        break
    }
    
    if (html) {
      // 在多个媒体之间添加空格或换行
      if (index > 0) {
        html = '<br>' + html
      }
      
      const success = document.execCommand('insertHTML', false, html)
      if (!success) {
        console.error('[MediaInsert] Failed to insert HTML:', html)
        // 作为备用方案，直接插入到当前位置
        try {
          const range = selection?.getRangeAt(0)
          if (range) {
            const fragment = document.createRange().createContextualFragment(html)
            range.insertNode(fragment)
            range.collapse(false)
          }
        } catch (e) {
          console.error('[MediaInsert] Fallback insertion failed:', e)
        }
      }
    }
  })
  
  // 触发更新事件
  editorContent.dispatchEvent(new Event('input', { bubbles: true }))
}
