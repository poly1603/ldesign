import { Editor } from '@ldesign/editor'
import { MediaInsertDialog } from '../ui/MediaInsertDialog'

export class MediaPlugin {
  private editor: Editor | null = null

  initialize(editor: Editor): void {
    this.editor = editor
    
    // 注册我们的命令到命令管理器
    this.registerCommands()
  }
  
  private registerCommands(): void {
    if (!this.editor) return
    
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
          onInsert: (url: string, file?: File) => {
            // 插入图片到编辑器
            const selection = this.editor!.getSelection()
            if (selection) {
              const img = document.createElement('img')
              img.src = url
              img.alt = file?.name || '图片'
              img.style.maxWidth = '100%'
              img.style.height = 'auto'
              
              // 插入图片元素
              const range = selection.getRangeAt(0)
              range.deleteContents()
              range.insertNode(img)
              
              // 在图片后插入一个空行
              const br = document.createElement('br')
              img.parentNode?.insertBefore(br, img.nextSibling)
              
              // 触发内容变更事件
              this.editor!.triggerChange()
            }
            
            // 如果是本地文件，可以在这里处理上传逻辑
            if (file) {
              console.log('[MediaPlugin] 选择的本地图片文件:', file.name, '大小:', file.size)
              // TODO: 实现文件上传逻辑
            }
          }
        })
        dialog.show()
        return false // 阻止默认行为
      }
      
      // 替换编辑器的insertImage命令
      if (this.editor.commands) {
        console.log('[MediaPlugin] 替换insertImage命令')
        this.editor.commands.insertImage = newImageHandler
      }
      
      // 替换编辑器的insertImage方法
      if ((this.editor as any).insertImage) {
        console.log('[MediaPlugin] 替换insertImage方法')
        ;(this.editor as any).insertImage = newImageHandler
      }

      // 方法1：替换工具栏的图片按钮处理器
      const toolbar = (window as any).__ldesignToolbar || (window as any).toolbar
      if (toolbar) {
        // 尝试通过不同的方式访问items
        const items = toolbar.items || toolbar.getItems?.() || []
        const imageButton = items.find((item: any) => item.name === 'image' || item.command === 'insertImage')
        if (imageButton) {
          console.log('[MediaPlugin] 找到图片按钮，替换处理器')
          imageButton.handler = newImageHandler
          imageButton.action = newImageHandler
        } else {
          console.warn('[MediaPlugin] 未找到图片按钮')
        }
        
        // 方法2：替换工具栏元素的点击事件
        setTimeout(() => {
          const imageBtn = toolbar.element?.querySelector('[data-command="insertImage"], [title*="图片"], [data-name="image"]')
          if (imageBtn) {
            console.log('[MediaPlugin] 找到图片按钮元素，替换点击事件')
            imageBtn.onclick = (e: Event) => {
              e.preventDefault()
              e.stopPropagation()
              newImageHandler()
            }
          }
        }, 100)
      }

    }
  }

  private registerVideoCommand(): void {
    if (this.editor) {
      const videoHandler = () => {
        const dialog = new MediaInsertDialog(this.editor!, {
          title: '插入视频',
          mediaType: 'video',
          accept: 'video/*',
          onInsert: (url: string, file?: File) => {
            // 插入视频到编辑器
            const selection = this.editor!.getSelection()
            if (selection) {
              const video = document.createElement('video')
              video.src = url
              video.controls = true
              video.style.maxWidth = '100%'
              video.style.height = 'auto'
              
              // 插入视频元素
              const range = selection.getRangeAt(0)
              range.deleteContents()
              range.insertNode(video)
              
              // 在视频后插入一个空行
              const br = document.createElement('br')
              video.parentNode?.insertBefore(br, video.nextSibling)
              
              // 触发内容变更事件
              this.editor!.triggerChange()
            }
            
            // 如果是本地文件
            if (file) {
              console.log('[MediaPlugin] 选择的本地视频文件:', file.name, '大小:', file.size)
              // TODO: 实现文件上传逻辑
            }
          }
        })
        dialog.show()
      }

      // 替换工具栏的视频按钮处理器
      const toolbar = (window as any).__ldesignToolbar
      if (toolbar) {
        const videoButton = toolbar.items?.find((item: any) => item.name === 'video')
        if (videoButton) {
          videoButton.handler = videoHandler
        }
      }
    }
  }

  private registerAudioCommand(): void {
    if (this.editor) {
      const audioHandler = () => {
        const dialog = new MediaInsertDialog(this.editor!, {
          title: '插入音频',
          mediaType: 'audio',
          accept: 'audio/*',
          onInsert: (url: string, file?: File) => {
            // 插入音频到编辑器
            const selection = this.editor!.getSelection()
            if (selection) {
              const audio = document.createElement('audio')
              audio.src = url
              audio.controls = true
              audio.style.maxWidth = '100%'
              
              // 插入音频元素
              const range = selection.getRangeAt(0)
              range.deleteContents()
              range.insertNode(audio)
              
              // 在音频后插入一个空行
              const br = document.createElement('br')
              audio.parentNode?.insertBefore(br, audio.nextSibling)
              
              // 触发内容变更事件
              this.editor!.triggerChange()
            }
            
            // 如果是本地文件
            if (file) {
              console.log('[MediaPlugin] 选择的本地音频文件:', file.name, '大小:', file.size)
              // TODO: 实现文件上传逻辑
            }
          }
        })
        dialog.show()
      }

      // 替换工具栏的音频按钮处理器
      const toolbar = (window as any).__ldesignToolbar
      if (toolbar) {
        const audioButton = toolbar.items?.find((item: any) => item.name === 'audio')
        if (audioButton) {
          audioButton.handler = audioHandler
        }
      }
    }
  }

  destroy(): void {
    this.editor = null
  }
}