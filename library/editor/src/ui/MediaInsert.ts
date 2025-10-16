/**
 * 媒体插入功能
 * 支持图片、视频、音频的本地上传和网络地址插入
 */

import { showDropdown } from './Dropdown'
import { showDialog } from './Dialog'
import { createIcon } from '../ui/icons'

export type MediaType = 'image' | 'video' | 'audio'

export interface MediaInsertOptions {
  type: MediaType
  onInsert: (urls: string[]) => void
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
  showDialog({
    title: config.dialogTitle,
    fields: [
      {
        name: 'url',
        label: '地址',
        type: 'url',
        placeholder: config.placeholder,
        required: true,
        validator: (value) => {
          // 简单的URL验证
          try {
            new URL(value)
            return null
          } catch {
            return '请输入有效的网址'
          }
        }
      },
      {
        name: 'alt',
        label: '描述文字',
        type: 'text',
        placeholder: '可选，用于SEO和无障碍访问',
        required: false
      }
    ],
    onConfirm: (values) => {
      onInsert([values.url])
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
  
  urls.forEach(url => {
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
      document.execCommand('insertHTML', false, html)
    }
  })
}