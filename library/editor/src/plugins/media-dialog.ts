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
    console.log('[MediaDialog.show] Called with type:', type)
    // Ensure any previous dialog is closed BEFORE setting the new callback
    // Important: previously createDialog() would call close() which cleared the callback set here
    // That caused this.callback to be null when clicking the Insert button.
    this.close()
    this.callback = callback
    console.log('[MediaDialog.show] Callback set. Creating dialog now.')
    this.createDialog(type)
    console.log('[MediaDialog.show] createDialog completed')
  }
  
  /**
   * Create the dialog elements
   */
  private createDialog(type: 'image' | 'video' | 'audio') {
    console.log('[MediaDialog.createDialog] Starting creation for type:', type)
    
    // Create overlay
    this.overlay = document.createElement('div')
    console.log('[MediaDialog.createDialog] Overlay created:', this.overlay)
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
      video: 'image', // 使用 image 作为备用
      audio: 'image'  // 使用 image 作为备用
    }
    
    this.dialog.innerHTML = `
      <div class="dialog-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 10px;">
          <span style="width: 24px; height: 24px; color: #3b82f6;">${getLucideIcon(icons[type])}</span>
          ${typeLabels[type]}
        </h3>
        <button class="close-btn" style="background: none; border: none; cursor: pointer; padding: 4px; color: #6b7280; transition: color 0.2s;">
          <span style="width: 20px; height: 20px; display: block;">×</span>
        </button>
      </div>
      
      <div class="dialog-tabs" style="display: flex; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
        <button class="tab-btn active" data-tab="local" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 2px solid #3b82f6; cursor: pointer; font-weight: 500; color: #3b82f6; transition: all 0.2s;">
          <span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="width: 16px; height: 16px;">↑</span>
            本地文件
          </span>
        </button>
        <button class="tab-btn" data-tab="url" style="flex: 1; padding: 12px; background: transparent; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-weight: 500; color: #6b7280; transition: all 0.2s;">
          <span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="width: 16px; height: 16px;">${getLucideIcon('link') || '🔗'}</span>
            网络地址
          </span>
        </button>
      </div>
      
      <div class="dialog-body" style="padding: 24px;">
        <!-- Local File Tab -->
        <div class="tab-content" data-tab="local" style="display: block;">
          <div class="upload-area" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 40px; text-align: center; background: #f9fafb; transition: all 0.3s; cursor: pointer;">
            <input type="file" accept="${acceptTypes[type]}" multiple style="display: none;" class="file-input">
            <div style="width: 48px; height: 48px; margin: 0 auto 16px; color: #9ca3af; font-size: 32px;">
              ☁️
            </div>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #374151;">点击或拖拽文件到这里</p>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">支持 ${type === 'image' ? 'JPG, PNG, GIF, SVG' : type === 'video' ? 'MP4, WebM, OGG' : 'MP3, WAV, OGG'} 格式（可多选）</p>
          </div>
          <div class="file-preview" style="margin-top: 16px; display: none;">
            <div style="padding: 12px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
              <span style="width: 32px; height: 32px; color: #3b82f6;">${getLucideIcon(icons[type])}</span>
              <div style="flex: 1;">
                <div class="file-name" style="font-weight: 500; color: #111827;"></div>
                <div class="file-size" style="font-size: 12px; color: #6b7280; margin-top: 2px;"></div>
              </div>
              <button class="remove-file" style="background: none; border: none; cursor: pointer; padding: 4px; color: #ef4444;">
                <span style="width: 16px; height: 16px; display: block;">×</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- URL Tab -->
        <div class="tab-content" data-tab="url" style="display: none;">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">
              ${type === 'video' ? '视频地址（支持YouTube、Bilibili等，每行一个）' : type === 'audio' ? '音频地址（每行一个）' : '图片地址（每行一个）'}
            </label>
            <textarea class="url-input" placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" rows="4" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; outline: none; resize: vertical; font-family: inherit;"></textarea>
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
      
      <div class="dialog-footer" style="padding: 16px 24px; border-top: 1px solid #e5e7eb; display: none; justify-content: flex-end; gap: 12px; background: #f9fafb;">
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
    console.log('[MediaDialog.createDialog] Setting up event handlers')
    this.setupEventHandlers()
    
    // Append to body
    console.log('[MediaDialog.createDialog] Appending dialog to overlay')
    this.overlay.appendChild(this.dialog)
    console.log('[MediaDialog.createDialog] Appending overlay to body')
    console.log('[MediaDialog.createDialog] document.body exists:', !!document.body)
    document.body.appendChild(this.overlay)
    console.log('[MediaDialog.createDialog] Dialog appended to DOM successfully!')
    console.log('[MediaDialog.createDialog] Overlay in DOM:', document.body.contains(this.overlay))
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
        
        // Show/hide footer based on active tab
        const footer = this.dialog!.querySelector<HTMLDivElement>('.dialog-footer')!
        if (tabName === 'local') {
          footer.style.display = 'none'
        } else {
          footer.style.display = 'flex'
        }
        
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
        // 支持多文件拖放，自动插入
        handleMultipleFiles(files)
      }
    })
    
    fileInput.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        // 支持多文件选择，自动插入
        handleMultipleFiles(files)
      }
    })
    
    // 处理多个文件，自动插入
    const handleMultipleFiles = (files: FileList) => {
      const cb = this.callback
      if (!cb) {
        console.warn('[MediaDialog] No callback available')
        return
      }
      
      console.log(`[MediaDialog] Processing ${files.length} file(s) for auto-insertion`)
      
      // 关闭对话框
      this.close()
      
      // 处理每个文件
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          try {
            console.log(`[MediaDialog] Auto-inserting file ${index + 1}/${files.length}: ${file.name}`)
            cb(dataUrl, file)
          } catch (err) {
            console.error(`[MediaDialog] Error inserting file ${file.name}:`, err)
          }
        }
        reader.onerror = () => {
          console.error(`[MediaDialog] Failed to read file: ${file.name}`)
        }
        reader.readAsDataURL(file)
      })
    }
    
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
    const urlInput = this.dialog.querySelector<HTMLTextAreaElement>('.url-input')!
    urlInput.addEventListener('input', (e) => {
      selectedUrl = (e.target as HTMLTextAreaElement).value
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
      console.log('[MediaDialog] Insert button clicked. Active tab:', activeTab)
      
      // Preserve callback before close(), because close() clears it
      const cb = this.callback
      if (!cb) {
        console.warn('[MediaDialog] No callback set at insert time')
        return
      }

      if (activeTab === 'url' && selectedUrl) {
        // 支持多个 URL（每行一个）
        const urls = selectedUrl.split('\n')
          .map(u => u.trim())
          .filter(u => u.length > 0)
        
        console.log(`[MediaDialog] Inserting ${urls.length} URL(s)`)
        
        // Close dialog before insertion
        this.close()
        
        // Insert each URL
        urls.forEach((url, index) => {
          try {
            console.log(`[MediaDialog] Inserting URL ${index + 1}/${urls.length}:`, url)
            cb(url)
          } catch (err) {
            console.error(`[MediaDialog] Error inserting URL ${url}:`, err)
          }
        })
      } else {
        console.warn('[MediaDialog] Insert button clicked but no valid URL input')
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
    console.log('[MediaDialogPlugin] Installing plugin...')
    // Initialize media dialog
    if (!mediaDialog) {
      console.log('[MediaDialogPlugin] Creating MediaDialog instance')
      mediaDialog = new MediaDialog()
    }
    
    // Register image insertion command (only if not already registered)
    if (!editor.commands.get('insertImage')) {
      console.log('[MediaDialogPlugin] Registering command: insertImage')
      editor.commands.register('insertImage', () => {
        console.log('[MediaDialog] insertImage command triggered')
        console.log('[MediaDialog] typeof editor.insertHTML:', typeof editor.insertHTML)
        // 进入弹窗前保存当前选区，以便插入时能回到光标处
        try { editor.saveSelection?.() } catch {}
        mediaDialog!.show('image', (url, file) => {
          try {
            console.log('[MediaDialog] Image callback - url:', url, 'file:', file)
            const alt = file ? file.name : 'Image'
            const html = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;">`
            console.log('[MediaDialog] Inserting image HTML length:', html.length)
            
            // 使用编辑器的 insertHTML 方法
            if (typeof editor.insertHTML === 'function') {
              editor.insertHTML(html)
              console.log('[MediaDialog] Image inserted via editor.insertHTML')
            } else {
              console.warn('[MediaDialog] editor.insertHTML not found, trying execCommand fallback')
              document.execCommand('insertHTML', false, html)
            }
          } catch (err) {
            console.error('[MediaDialog] Error while inserting image:', err)
          }
        })
        return true
      })
    } else {
      console.log('[MediaDialogPlugin] Command already exists: insertImage')
    }
    
    // Register video insertion command (only if not already registered)
    if (!editor.commands.get('insertVideo')) {
      console.log('[MediaDialogPlugin] Registering command: insertVideo')
      editor.commands.register('insertVideo', () => {
        console.log('[MediaDialog] insertVideo command triggered')
        console.log('[MediaDialog] typeof editor.insertHTML:', typeof editor.insertHTML)
        try { editor.saveSelection?.() } catch {}
        mediaDialog!.show('video', (url, file) => {
          try {
            console.log('[MediaDialog] Video callback - url:', url, 'file:', file)
            let html = ''
            
            // Check if it's a platform video
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              const videoId = url.split('v=')[1] || url.split('/').pop()
              const embedUrl = `https://www.youtube.com/embed/${videoId}`
              html = `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen style="display: block; margin: 10px 0;"></iframe>`
            } else if (url.includes('bilibili.com')) {
              const bvid = url.match(/BV\w+/)?.[0]
              if (bvid) {
                html = `<iframe src="//player.bilibili.com/player.html?bvid=${bvid}" width="560" height="315" frameborder="0" allowfullscreen style="display: block; margin: 10px 0;"></iframe>`
              }
            } else {
              // Regular video
              html = `<video controls style=\"max-width: 100%; height: auto; display: block; margin: 10px 0;\">\n              <source src=\"${url}\" type=\"${file ? file.type : 'video/mp4'}\">\n              您的浏览器不支持视频标签。\n            </video>`
            }
            
            if (html) {
              console.log('[MediaDialog] Inserting video HTML length:', html.length)
              if (typeof editor.insertHTML === 'function') {
                editor.insertHTML(html)
                console.log('[MediaDialog] Video inserted via editor.insertHTML')
              } else {
                console.warn('[MediaDialog] editor.insertHTML not found, trying execCommand fallback')
                document.execCommand('insertHTML', false, html)
              }
            } else {
              console.warn('[MediaDialog] Video HTML not generated')
            }
          } catch (err) {
            console.error('[MediaDialog] Error while inserting video:', err)
          }
        })
        return true
      })
    } else {
      console.log('[MediaDialogPlugin] Command already exists: insertVideo')
    }
    
    // Register audio insertion command (only if not already registered)
    if (!editor.commands.get('insertAudio')) {
      console.log('[MediaDialogPlugin] Registering command: insertAudio')
      editor.commands.register('insertAudio', () => {
        console.log('[MediaDialog] insertAudio command triggered')
        console.log('[MediaDialog] typeof editor.insertHTML:', typeof editor.insertHTML)
        try { editor.saveSelection?.() } catch {}
        mediaDialog!.show('audio', (url, file) => {
          try {
            console.log('[MediaDialog] Audio callback - url:', url, 'file:', file)
            const html = `<audio controls style=\"width: 100%; max-width: 400px; display: block; margin: 10px 0;\">\n            <source src=\"${url}\" type=\"${file ? file.type : 'audio/mpeg'}\">\n            您的浏览器不支持音频标签。\n          </audio>`
            
            console.log('[MediaDialog] Inserting audio HTML length:', html.length)
            if (typeof editor.insertHTML === 'function') {
              editor.insertHTML(html)
              console.log('[MediaDialog] Audio inserted via editor.insertHTML')
            } else {
              console.warn('[MediaDialog] editor.insertHTML not found, trying execCommand fallback')
              document.execCommand('insertHTML', false, html)
            }
          } catch (err) {
            console.error('[MediaDialog] Error while inserting audio:', err)
          }
        })
        return true
      })
    } else {
      console.log('[MediaDialogPlugin] Command already exists: insertAudio')
    }
    
    console.log('[MediaDialogPlugin] Installation complete. Commands:', editor.commands.getCommands?.())
  }
}

export default MediaDialogPlugin