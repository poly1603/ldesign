import { Editor } from '@ldesign/editor'
import { MediaInsertDialog } from '../ui/MediaInsertDialog'

export class MediaPlugin {
  private editor: Editor | null = null

  initialize(editor: Editor): void {
    this.editor = editor
    
    // 注册图片插入命令
    this.registerImageCommand()
    
    // 注册视频插入命令
    this.registerVideoCommand()
    
    // 注册音频插入命令
    this.registerAudioCommand()
  }

  private registerImageCommand(): void {
    // 覆盖原有的insertImage命令
    const originalHandler = this.editor?.getCommand?.('insertImage')
    
    if (this.editor) {
      // 创建新的图片插入处理器
      const newImageHandler = () => {
        const dialog = new MediaInsertDialog(this.editor!, {
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
      }

      // 替换工具栏的图片按钮处理器
      const toolbar = (window as any).__ldesignToolbar
      if (toolbar) {
        const imageButton = toolbar.items?.find((item: any) => item.name === 'image')
        if (imageButton) {
          imageButton.handler = newImageHandler
        }
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