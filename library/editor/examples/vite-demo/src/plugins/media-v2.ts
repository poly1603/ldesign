import { Editor } from '@ldesign/editor'
import { MediaInsertDialog } from '../ui/MediaInsertDialog'

export class MediaPlugin {
  private editor: Editor | null = null

  initialize(editor: Editor): void {
    this.editor = editor
    
    // 获取命令管理器
    const commandManager = (this.editor as any).commands
    if (!commandManager || !commandManager.register) {
      console.warn('[MediaPlugin] CommandManager not found')
      return
    }
    
    // 注册图片插入命令
    console.log('[MediaPlugin] 注册insertImage命令')
    commandManager.register('insertImage', () => {
      this.showImageDialog()
      return true
    })
    
    // 注册视频插入命令
    console.log('[MediaPlugin] 注册insertVideo命令')
    commandManager.register('insertVideo', () => {
      this.showVideoDialog()
      return true
    })
    
    // 注册音频插入命令  
    console.log('[MediaPlugin] 注册insertAudio命令')
    commandManager.register('insertAudio', () => {
      this.showAudioDialog()
      return true
    })
  }

  private showImageDialog(): void {
    if (!this.editor) return
    
    console.log('[MediaPlugin] 显示图片插入对话框')
    const dialog = new MediaInsertDialog(this.editor, {
      title: '插入图片',
      mediaType: 'image',
      accept: 'image/*',
      multiple: true,  // 支持多选
      onInsert: (urls: string | string[], files?: File | File[]) => {
        // 处理多个文件
        const urlArray = Array.isArray(urls) ? urls : [urls]
        const fileArray = files ? (Array.isArray(files) ? files : [files]) : []
        
        urlArray.forEach((url, index) => {
          this.insertImage(url, fileArray[index])
        })
      }
    })
    dialog.show()
  }

  private showVideoDialog(): void {
    if (!this.editor) return
    
    const dialog = new MediaInsertDialog(this.editor, {
      title: '插入视频',
      mediaType: 'video',
      accept: 'video/*',
      multiple: true,  // 支持多选
      onInsert: (urls: string | string[], files?: File | File[]) => {
        // 处理多个文件
        const urlArray = Array.isArray(urls) ? urls : [urls]
        const fileArray = files ? (Array.isArray(files) ? files : [files]) : []
        
        urlArray.forEach((url, index) => {
          this.insertVideo(url, fileArray[index])
        })
      }
    })
    dialog.show()
  }

  private showAudioDialog(): void {
    if (!this.editor) return
    
    const dialog = new MediaInsertDialog(this.editor, {
      title: '插入音频',
      mediaType: 'audio',
      accept: 'audio/*',
      multiple: true,  // 支持多选
      onInsert: (urls: string | string[], files?: File | File[]) => {
        // 处理多个文件
        const urlArray = Array.isArray(urls) ? urls : [urls]
        const fileArray = files ? (Array.isArray(files) ? files : [files]) : []
        
        urlArray.forEach((url, index) => {
          this.insertAudio(url, fileArray[index])
        })
      }
    })
    dialog.show()
  }

  private insertImage(url: string, file?: File): void {
    if (!this.editor) return
    
    // 获取内容元素
    const contentElement = (this.editor as any).contentElement
    if (!contentElement) return
    
    // 获取原生 DOM 选区
    const domSelection = window.getSelection()
    if (!domSelection || domSelection.rangeCount === 0) {
      // 如果没有选区，创建一个在内容末尾
      contentElement.focus()
      const range = document.createRange()
      range.selectNodeContents(contentElement)
      range.collapse(false)
      domSelection?.removeAllRanges()
      domSelection?.addRange(range)
    }
    
    const range = domSelection.getRangeAt(0)
    
    // 确保选区在编辑器内
    if (!contentElement.contains(range.commonAncestorContainer)) {
      contentElement.focus()
      return
    }
    
    // 创建图片元素
    const img = document.createElement('img')
    img.src = url
    img.alt = file?.name || '图片'
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.classList.add('ldesign-media-image')
    
    // 插入图片元素
    range.deleteContents()
    range.insertNode(img)
    
    // 在图片后插入一个空行
    const br = document.createElement('br')
    img.parentNode?.insertBefore(br, img.nextSibling)
    
    // 移动光标到图片后
    range.setStartAfter(br)
    range.collapse(true)
    domSelection.removeAllRanges()
    domSelection.addRange(range)
    
    // 触发内容变更事件
    this.editor.triggerChange()
    
    // 如果是本地文件，可以在这里处理上传逻辑
    if (file) {
      console.log('[MediaPlugin] 选择的本地图片文件:', file.name, '大小:', file.size)
      // TODO: 实现文件上传逻辑
    }
  }

  private insertVideo(url: string, file?: File): void {
    if (!this.editor) return
    
    // 获取内容元素
    const contentElement = (this.editor as any).contentElement
    if (!contentElement) return
    
    // 获取原生 DOM 选区
    const domSelection = window.getSelection()
    if (!domSelection || domSelection.rangeCount === 0) {
      contentElement.focus()
      const range = document.createRange()
      range.selectNodeContents(contentElement)
      range.collapse(false)
      domSelection?.removeAllRanges()
      domSelection?.addRange(range)
    }
    
    const range = domSelection.getRangeAt(0)
    
    // 确保选区在编辑器内
    if (!contentElement.contains(range.commonAncestorContainer)) {
      contentElement.focus()
      return
    }
    
    // 创建视频元素
    const video = document.createElement('video')
    video.src = url
    video.controls = true
    video.style.maxWidth = '100%'
    video.style.height = 'auto'
    video.classList.add('ldesign-media-video')
    
    // 插入视频元素
    range.deleteContents()
    range.insertNode(video)
    
    // 在视频后插入一个空行
    const br = document.createElement('br')
    video.parentNode?.insertBefore(br, video.nextSibling)
    
    // 移动光标到视频后
    range.setStartAfter(br)
    range.collapse(true)
    domSelection.removeAllRanges()
    domSelection.addRange(range)
    
    // 触发内容变更事件
    this.editor.triggerChange()
    
    // 如果是本地文件
    if (file) {
      console.log('[MediaPlugin] 选择的本地视频文件:', file.name, '大小:', file.size)
      // TODO: 实现文件上传逻辑
    }
  }

  private insertAudio(url: string, file?: File): void {
    if (!this.editor) return
    
    // 获取内容元素
    const contentElement = (this.editor as any).contentElement
    if (!contentElement) return
    
    // 获取原生 DOM 选区
    const domSelection = window.getSelection()
    if (!domSelection || domSelection.rangeCount === 0) {
      contentElement.focus()
      const range = document.createRange()
      range.selectNodeContents(contentElement)
      range.collapse(false)
      domSelection?.removeAllRanges()
      domSelection?.addRange(range)
    }
    
    const range = domSelection.getRangeAt(0)
    
    // 确保选区在编辑器内
    if (!contentElement.contains(range.commonAncestorContainer)) {
      contentElement.focus()
      return
    }
    
    // 创建音频元素
    const audio = document.createElement('audio')
    audio.src = url
    audio.controls = true
    audio.style.maxWidth = '100%'
    audio.classList.add('ldesign-media-audio')
    
    // 插入音频元素
    range.deleteContents()
    range.insertNode(audio)
    
    // 在音频后插入一个空行
    const br = document.createElement('br')
    audio.parentNode?.insertBefore(br, audio.nextSibling)
    
    // 移动光标到音频后
    range.setStartAfter(br)
    range.collapse(true)
    domSelection.removeAllRanges()
    domSelection.addRange(range)
    
    // 触发内容变更事件
    this.editor.triggerChange()
    
    // 如果是本地文件
    if (file) {
      console.log('[MediaPlugin] 选择的本地音频文件:', file.name, '大小:', file.size)
      // TODO: 实现文件上传逻辑
    }
  }

  destroy(): void {
    this.editor = null
  }
}