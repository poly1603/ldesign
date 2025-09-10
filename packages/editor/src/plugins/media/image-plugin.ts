/**
 * 图片插件
 * 提供图片插入、编辑、调整大小等功能
 */

import type { Command, IEditor, ToolbarItem, MediaFile } from '../../types'
import { BasePlugin } from '../base-plugin'

/**
 * 图片对齐方式
 */
export type ImageAlignment = 'left' | 'center' | 'right' | 'none'

/**
 * 图片配置
 */
export interface ImageConfig {
  /** 图片URL */
  src: string
  /** 替代文本 */
  alt?: string
  /** 标题 */
  title?: string
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 对齐方式 */
  alignment?: ImageAlignment
  /** CSS类名 */
  className?: string
  /** 是否可调整大小 */
  resizable?: boolean
}

/**
 * 图片插件实现
 */
export class ImagePlugin extends BasePlugin {
  name = 'image'
  version = '1.0.0'

  /**
   * 初始化插件
   */
  onInit(): void {
    // 监听拖拽事件
    this.setupDragAndDrop()
    
    // 监听粘贴事件
    this.setupPasteHandler()
  }

  /**
   * 获取命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'insertImage',
        label: '插入图片',
        execute: (editor: IEditor, config?: ImageConfig) => {
          if (config) {
            this.insertImage(editor, config)
          } else {
            this.showImageDialog(editor)
          }
        },
        canExecute: () => true,
        isActive: () => false
      },
      {
        name: 'uploadImage',
        label: '上传图片',
        execute: (editor: IEditor) => {
          this.showUploadDialog(editor)
        },
        canExecute: () => true,
        isActive: () => false
      },
      {
        name: 'editImage',
        label: '编辑图片',
        execute: (editor: IEditor, imageElement?: HTMLImageElement) => {
          this.editImage(editor, imageElement)
        },
        canExecute: (editor: IEditor) => {
          return this.getSelectedImage(editor) !== null
        },
        isActive: () => false
      },
      {
        name: 'alignImage',
        label: '对齐图片',
        execute: (editor: IEditor, alignment: ImageAlignment) => {
          this.alignImage(editor, alignment)
        },
        canExecute: (editor: IEditor) => {
          return this.getSelectedImage(editor) !== null
        },
        isActive: () => false
      },
      {
        name: 'resizeImage',
        label: '调整图片大小',
        execute: (editor: IEditor, width?: number, height?: number) => {
          this.resizeImage(editor, width, height)
        },
        canExecute: (editor: IEditor) => {
          return this.getSelectedImage(editor) !== null
        },
        isActive: () => false
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems(): ToolbarItem[] {
    return [
      {
        type: 'group' as const,
        items: ['insertImage', 'uploadImage'],
        label: '图片'
      }
    ]
  }

  /**
   * 插入图片
   */
  private insertImage(editor: IEditor, config: ImageConfig): void {
    const img = this.createImageElement(config)
    const selection = editor.selection.getSelection()
    
    if (selection) {
      // 在当前位置插入图片
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(img)
      
      // 移动光标到图片后面
      range.setStartAfter(img)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      // 在编辑器末尾插入
      const container = editor.getContainer()
      container.appendChild(img)
    }

    // 触发内容变更事件
    editor.events.emit('content:changed', {
      type: 'insert',
      element: img
    })
  }

  /**
   * 创建图片元素
   */
  private createImageElement(config: ImageConfig): HTMLImageElement {
    const img = document.createElement('img')
    
    img.src = config.src
    img.alt = config.alt || ''
    
    if (config.title) {
      img.title = config.title
    }
    
    if (config.width) {
      img.width = config.width
    }
    
    if (config.height) {
      img.height = config.height
    }
    
    if (config.className) {
      img.className = config.className
    }

    // 设置对齐方式
    if (config.alignment && config.alignment !== 'none') {
      img.style.display = 'block'
      if (config.alignment === 'center') {
        img.style.margin = '0 auto'
      } else {
        img.style.float = config.alignment
      }
    }

    // 添加可调整大小的功能
    if (config.resizable !== false) {
      this.makeResizable(img)
    }

    // 添加点击事件
    img.addEventListener('click', (e) => {
      e.preventDefault()
      this.selectImage(img)
    })

    return img
  }

  /**
   * 显示图片对话框
   */
  private showImageDialog(editor: IEditor): void {
    // 创建简单的图片URL输入对话框
    const url = prompt('请输入图片URL:')
    if (url) {
      const alt = prompt('请输入替代文本 (可选):') || ''
      this.insertImage(editor, { src: url, alt })
    }
  }

  /**
   * 显示上传对话框
   */
  private showUploadDialog(editor: IEditor): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true

    input.addEventListener('change', async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        await this.uploadImages(editor, Array.from(files))
      }
    })

    input.click()
  }

  /**
   * 上传图片
   */
  private async uploadImages(editor: IEditor, files: File[]): Promise<void> {
    try {
      // 获取媒体管理器
      const mediaManager = (editor as any).mediaManager
      if (!mediaManager) {
        throw new Error('媒体管理器未初始化')
      }

      // 上传文件
      const mediaFiles = await mediaManager.upload(files)

      // 插入图片
      for (const mediaFile of mediaFiles) {
        if (mediaFile.type === 'image') {
          this.insertImage(editor, {
            src: mediaFile.url,
            alt: mediaFile.name,
            width: mediaFile.metadata?.width,
            height: mediaFile.metadata?.height
          })
        }
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      alert('图片上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  /**
   * 编辑图片
   */
  private editImage(editor: IEditor, imageElement?: HTMLImageElement): void {
    const img = imageElement || this.getSelectedImage(editor)
    if (!img) return

    // 显示图片编辑对话框
    const newSrc = prompt('图片URL:', img.src)
    if (newSrc !== null) {
      img.src = newSrc
    }

    const newAlt = prompt('替代文本:', img.alt)
    if (newAlt !== null) {
      img.alt = newAlt
    }

    // 触发内容变更事件
    editor.events.emit('content:changed', {
      type: 'update',
      element: img
    })
  }

  /**
   * 对齐图片
   */
  private alignImage(editor: IEditor, alignment: ImageAlignment): void {
    const img = this.getSelectedImage(editor)
    if (!img) return

    // 清除之前的对齐样式
    img.style.display = ''
    img.style.margin = ''
    img.style.float = ''

    // 应用新的对齐方式
    if (alignment !== 'none') {
      img.style.display = 'block'
      if (alignment === 'center') {
        img.style.margin = '0 auto'
      } else {
        img.style.float = alignment
      }
    }

    // 触发内容变更事件
    editor.events.emit('content:changed', {
      type: 'update',
      element: img
    })
  }

  /**
   * 调整图片大小
   */
  private resizeImage(editor: IEditor, width?: number, height?: number): void {
    const img = this.getSelectedImage(editor)
    if (!img) return

    if (width !== undefined) {
      img.width = width
    }

    if (height !== undefined) {
      img.height = height
    }

    // 触发内容变更事件
    editor.events.emit('content:changed', {
      type: 'update',
      element: img
    })
  }

  /**
   * 获取选中的图片
   */
  private getSelectedImage(editor: IEditor): HTMLImageElement | null {
    const selection = editor.selection.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    const element = range.commonAncestorContainer

    if (element.nodeType === Node.ELEMENT_NODE) {
      const img = (element as Element).querySelector('img')
      return img
    }

    if (element.parentElement?.tagName === 'IMG') {
      return element.parentElement as HTMLImageElement
    }

    return null
  }

  /**
   * 选中图片
   */
  private selectImage(img: HTMLImageElement): void {
    const selection = window.getSelection()
    if (selection) {
      const range = document.createRange()
      range.selectNode(img)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  /**
   * 使图片可调整大小
   */
  private makeResizable(img: HTMLImageElement): void {
    img.style.resize = 'both'
    img.style.overflow = 'hidden'
    img.draggable = false
  }

  /**
   * 设置拖拽上传
   */
  private setupDragAndDrop(): void {
    // 实现拖拽上传功能
    // 这里可以添加拖拽事件监听器
  }

  /**
   * 设置粘贴处理
   */
  private setupPasteHandler(): void {
    // 实现粘贴图片功能
    // 这里可以添加粘贴事件监听器
  }
}
