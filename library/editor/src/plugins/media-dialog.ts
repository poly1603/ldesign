/**
 * Enhanced Media Dialog Plugin
 * Provides modern dialogs for inserting images, videos, and audio
 */

import type { Plugin } from '../types'
import { getLucideIcon } from '../utils/icons'

/**
 * Media Dialog Class
 */
class MediaDialog {
  private dialog: HTMLDivElement | null = null
  private overlay: HTMLDivElement | null = null
  private callback: ((url: string, file?: File) => void) | null = null
  
  /**
   * Show the media dialog
   */
  show(type: 'image' | 'video' | 'audio', callback: (url: string, file?: File) => void) {
    this.callback = callback
    this.createDialog(type)
  }
  
  /**
   * Create the dialog elements
   */
  private createDialog(type: 'image' | 'video' | 'audio') {
    // Remove existing dialog if any
    this.close()
    
    // Create overlay
    this.overlay = document.createElement('div')
    this.overlay.className = 'ldesign-media-overlay'
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 99998;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    `
    
    // Create dialog
    this.dialog = document.createElement('div')
    this.dialog.className = 'ldesign-media-dialog'
    this.dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 500px;
      max-width: 90vw;
      animation: slideUp 0.3s ease;
      z-index: 99999;
      overflow: hidden;
    `
    
    // Create dialog content
    const typeLabels = {
      image: '插入图片',
      video: '插入视频',
      audio: '插入音频'
    }
    
    const acceptTypes = {
      image: 'image/*',
      video: 'video/*',
      audio: 'audio/*'
    }
    
    const icons = {
      image: 'image',
      video: 'video',
      audio: 'music'
    }
    
    this.dialog.innerHTML = `
      <div class="dialog-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 10px;">
          <span style="width: 24px; height: 24px; color: #3b82f6;">${getLucideIcon(icons[type])}</span>
          ${typeLabels[type]}
        </h3>
        <button class="close-btn" style="background: none; border: none; cursor: pointer; padding: 4px; color: #6b7280; transition: color 0.2s;">
          <span style="width: 20px; height: 20px; display: block;">${getLucideIcon('x')}</span>
        </button>
      </div>
      
      <div class="dialog-tabs" style="display: flex; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
        <button class="tab-btn active" data-tab="local" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 2px solid #3b82f6; cursor: pointer; font-weight: 500; color: #3b82f6; transition: all 0.2s;">
          <span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="width: 16px; height: 16px;">${getLucideIcon('upload')}</span>
            本地文件
          </span>
        </button>
        <button class="tab-btn" data-tab="url" style="flex: 1; padding: 12px; background: transparent; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-weight: 500; color: #6b7280; transition: all 0.2s;">
          <span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="width: 16px; height: 16px;">${getLucideIcon('link')}</span>
            网络地址
          </span>
        </button>
      </div>
      
      <div class="dialog-body" style="padding: 24px;">
        <!-- Local File Tab -->
        <div class="tab-content" data-tab="local" style="display: block;">
          <div class="upload-area" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 40px; text-align: center; background: #f9fafb; transition: all 0.3s; cursor: pointer;">
            <input type="file" accept="${acceptTypes[type]}" style="display: none;" class="file-input">
            <div style="width: 48px; height: 48px; margin: 0 auto 16px; color: #9ca3af;">
              ${getLucideIcon('upload-cloud')}
            </div>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #374151;">点击或拖拽文件到这里</p>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">支持 ${type === 'image' ? 'JPG, PNG, GIF, SVG' : type === 'video' ? 'MP4, WebM, OGG' : 'MP3, WAV, OGG'} 格式</p>
          </div>
          <div class="file-preview" style="margin-top: 16px; display: none;">
            <div style="padding: 12px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
              <span style="width: 32px; height: 32px; color: #3b82f6;">${getLucideIcon(icons[type])}</span>
              <div style="flex: 1;">
                <div class="file-name" style="font-weight: 500; color: #111827;"></div>
                <div class="file-size" style="font-size: 12px; color: #6b7280; margin-top: 2px;"></div>
              </div>
              <button class="remove-file" style="background: none; border: none; cursor: pointer; padding: 4px; color: #ef4444;">
                <span style="width: 16px; height: 16px; display: block;">${getLucideIcon('x')}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- URL Tab -->
        <div class="tab-content" data-tab="url" style="display: none;">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">
              ${type === 'video' ? '视频地址（支持YouTube、Bilibili等）' : type === 'audio' ? '音频地址' : '图片地址'}
            </label>
            <input type="url" class="url-input" placeholder="https://" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; outline: none;">
          </div>
          ${type === 'image' ? `
          <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #1e40af; font-weight: 500;">支持的图片格式：</p>
            <p style="margin: 0; font-size: 12px; color: #3730a3;">• 直接链接：JPG, PNG, GIF, SVG, WebP</p>
            <p style="margin: 0; font-size: 12px; color: #3730a3;">• 图床服务：Imgur, 图床等</p>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="dialog-footer" style="padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; background: #f9fafb;">
        <button class="cancel-btn" style="padding: 8px 16px; background: white; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151; transition: all 0.2s;">
          取消
        </button>
        <button class="insert-btn" style="padding: 8px 16px; background: #3b82f6; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; color: white; transition: all 0.2s;" disabled>
          插入
        </button>
      </div>
    `
    
    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .ldesign-media-dialog .tab-btn:hover:not(.active) {
        background: #f3f4f6;
        color: #374151;
      }
      .ldesign-media-dialog .upload-area:hover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      .ldesign-media-dialog .upload-area.dragging {
        border-color: #3b82f6;
        background: #dbeafe;
      }
      .ldesign-media-dialog .url-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .ldesign-media-dialog .cancel-btn:hover {
        background: #f3f4f6;
      }
      .ldesign-media-dialog .insert-btn:hover:not(:disabled) {
        background: #2563eb;
      }
      .ldesign-media-dialog .insert-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ldesign-media-dialog .close-btn:hover {
        color: #374151;
      }
    `
    document.head.appendChild(style)
    
    // Add event handlers
    this.setupEventHandlers()
    
    // Append to body
    this.overlay.appendChild(this.dialog)
    document.body.appendChild(this.overlay)
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers() {
    if (!this.dialog || !this.overlay) return
    
    let selectedFile: File | null = null
    let selectedUrl: string = ''
    
    // Tab switching
    const tabBtns = this.dialog.querySelectorAll<HTMLButtonElement>('.tab-btn')
    const tabContents = this.dialog.querySelectorAll<HTMLDivElement>('.tab-content')
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab!
        
        // Update active tab
        tabBtns.forEach(b => {
          b.classList.toggle('active', b === btn)
          if (b === btn) {
            b.style.background = 'white'
            b.style.borderBottomColor = '#3b82f6'
            b.style.color = '#3b82f6'
          } else {
            b.style.background = 'transparent'
            b.style.borderBottomColor = 'transparent'
            b.style.color = '#6b7280'
          }
        })
        
        // Show corresponding content
        tabContents.forEach(content => {
          content.style.display = content.dataset.tab === tabName ? 'block' : 'none'
        })
        
        // Update insert button state
        this.updateInsertButton()
      })
    })
    
    // File upload
    const uploadArea = this.dialog.querySelector<HTMLDivElement>('.upload-area')!
    const fileInput = this.dialog.querySelector<HTMLInputElement>('.file-input')!
    const filePreview = this.dialog.querySelector<HTMLDivElement>('.file-preview')!
    
    uploadArea.addEventListener('click', () => fileInput.click())
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('dragging')
    })
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragging')
    })
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('dragging')
      
      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    })
    
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    })
    
    const handleFileSelect = (file: File) => {
      selectedFile = file
      
      // Show preview
      filePreview.style.display = 'block'
      const fileName = filePreview.querySelector('.file-name')!
      const fileSize = filePreview.querySelector('.file-size')!
      
      fileName.textContent = file.name
      fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`
      
      this.updateInsertButton()
    }
    
    // Remove file
    const removeFileBtn = this.dialog.querySelector<HTMLButtonElement>('.remove-file')
    removeFileBtn?.addEventListener('click', () => {
      selectedFile = null
      fileInput.value = ''
      filePreview.style.display = 'none'
      this.updateInsertButton()
    })
    
    // URL input
    const urlInput = this.dialog.querySelector<HTMLInputElement>('.url-input')!
    urlInput.addEventListener('input', (e) => {
      selectedUrl = (e.target as HTMLInputElement).value
      this.updateInsertButton()
    })
    
    // Update insert button state
    const updateInsertButton = () => {
      const insertBtn = this.dialog!.querySelector<HTMLButtonElement>('.insert-btn')!
      const activeTab = this.dialog!.querySelector<HTMLButtonElement>('.tab-btn.active')!.dataset.tab
      
      if (activeTab === 'local') {
        insertBtn.disabled = !selectedFile
      } else {
        insertBtn.disabled = !selectedUrl || !selectedUrl.trim()
      }
    }
    
    this.updateInsertButton = updateInsertButton
    
    // Close button
    const closeBtn = this.dialog.querySelector<HTMLButtonElement>('.close-btn')!
    closeBtn.addEventListener('click', () => this.close())
    
    // Cancel button
    const cancelBtn = this.dialog.querySelector<HTMLButtonElement>('.cancel-btn')!
    cancelBtn.addEventListener('click', () => this.close())
    
    // Insert button
    const insertBtn = this.dialog.querySelector<HTMLButtonElement>('.insert-btn')!
    insertBtn.addEventListener('click', () => {
      const activeTab = this.dialog!.querySelector<HTMLButtonElement>('.tab-btn.active')!.dataset.tab
      
      if (activeTab === 'local' && selectedFile) {
        // Convert file to data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          this.callback?.(dataUrl, selectedFile)
          this.close()
        }
        reader.readAsDataURL(selectedFile)
      } else if (activeTab === 'url' && selectedUrl) {
        this.callback?.(selectedUrl)
        this.close()
      }
    })
    
    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close()
      }
    })
    
    // Close on ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close()
      }
    }
    document.addEventListener('keydown', handleEsc)
    this.escHandler = handleEsc
  }
  
  private updateInsertButton: (() => void) | null = null
  private escHandler: ((e: KeyboardEvent) => void) | null = null
  
  /**
   * Close the dialog
   */
  close() {
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler)
      this.escHandler = null
    }
    
    if (this.overlay) {
      this.overlay.style.animation = 'fadeIn 0.2s ease reverse'
      setTimeout(() => {
        this.overlay?.remove()
        this.overlay = null
      }, 200)
    }
    
    this.dialog = null
    this.callback = null
  }
}

// Single instance
let mediaDialog: MediaDialog | null = null

/**
 * Media Dialog Plugin
 */
export const MediaDialogPlugin: Plugin = {
  name: 'media-dialog',
  
  install(editor: any) {
    // Initialize media dialog
    if (!mediaDialog) {
      mediaDialog = new MediaDialog()
    }
    
    // Override image insertion command
    const originalImageCommand = editor.commands.get('insertImage')
    editor.commands.register('insertImage', () => {
      mediaDialog!.show('image', (url, file) => {
        const alt = file ? file.name : 'Image'
        const html = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; display: block; margin: 10px auto;">`
        document.execCommand('insertHTML', false, html)
      })
    })
    
    // Override video insertion command
    editor.commands.register('insertVideo', () => {
      mediaDialog!.show('video', (url, file) => {
        // Check if it's a platform video
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = url.split('v=')[1] || url.split('/').pop()
          const embedUrl = `https://www.youtube.com/embed/${videoId}`
          const html = `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen style="display: block; margin: 10px auto;"></iframe>`
          document.execCommand('insertHTML', false, html)
        } else if (url.includes('bilibili.com')) {
          const bvid = url.match(/BV\w+/)?.[0]
          if (bvid) {
            const html = `<iframe src="//player.bilibili.com/player.html?bvid=${bvid}" width="560" height="315" frameborder="0" allowfullscreen style="display: block; margin: 10px auto;"></iframe>`
            document.execCommand('insertHTML', false, html)
          }
        } else {
          // Regular video
          const html = `
            <video controls style="max-width: 100%; height: auto; display: block; margin: 10px auto;">
              <source src="${url}" type="${file ? file.type : 'video/mp4'}">
              您的浏览器不支持视频标签。
            </video>
          `
          document.execCommand('insertHTML', false, html)
        }
      })
    })
    
    // Override audio insertion command  
    editor.commands.register('insertAudio', () => {
      mediaDialog!.show('audio', (url, file) => {
        const html = `
          <audio controls style="width: 100%; max-width: 400px; display: block; margin: 10px auto;">
            <source src="${url}" type="${file ? file.type : 'audio/mpeg'}">
            您的浏览器不支持音频标签。
          </audio>
        `
        document.execCommand('insertHTML', false, html)
      })
    })
    
    console.log('[MediaDialogPlugin] Enhanced media dialog plugin installed')
  }
}

export default MediaDialogPlugin