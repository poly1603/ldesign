/**
 * 上传进度组件
 * 显示文件上传进度和状态
 */

export interface UploadProgressOptions {
  fileName?: string
  fileSize?: number
  onCancel?: () => void
}

export class UploadProgress {
  private container: HTMLElement
  private progressBar: HTMLElement
  private percentText: HTMLElement
  private statusText: HTMLElement
  private options: UploadProgressOptions
  private cancelled: boolean = false
  
  constructor(options: UploadProgressOptions = {}) {
    this.options = options
    this.container = this.createContainer()
    this.progressBar = this.container.querySelector('.progress-fill')!
    this.percentText = this.container.querySelector('.percent')!
    this.statusText = this.container.querySelector('.status')!
  }
  
  /**
   * 创建容器
   */
  private createContainer(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'upload-progress'
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 16px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `
    
    // 添加动画
    this.addAnimation()
    
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
            ${this.options.fileName || '上传文件'}
          </div>
          <div class="status" style="font-size: 12px; color: #6b7280;">
            准备上传...
          </div>
        </div>
        <button class="cancel-btn" style="border: none; background: none; font-size: 20px; cursor: pointer; color: #666; padding: 0; width: 24px; height: 24px;">&times;</button>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 4px;">
          <span class="percent">0%</span>
          <span class="size">${this.formatSize(this.options.fileSize || 0)}</span>
        </div>
        <div style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
          <div class="progress-fill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #3b82f6, #10b981); transition: width 0.3s ease;"></div>
        </div>
      </div>
    `
    
    // 取消按钮
    const cancelBtn = container.querySelector('.cancel-btn')
    cancelBtn?.addEventListener('click', () => {
      this.cancel()
    })
    
    return container
  }
  
  /**
   * 添加动画样式
   */
  private addAnimation(): void {
    if (document.getElementById('upload-progress-animation')) return
    
    const style = document.createElement('style')
    style.id = 'upload-progress-animation'
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }
  
  /**
   * 更新进度
   */
  updateProgress(percent: number, status?: string): void {
    const clampedPercent = Math.min(100, Math.max(0, percent))
    
    this.progressBar.style.width = `${clampedPercent}%`
    this.percentText.textContent = `${Math.round(clampedPercent)}%`
    
    if (status) {
      this.statusText.textContent = status
    } else {
      if (clampedPercent === 0) {
        this.statusText.textContent = '准备上传...'
      } else if (clampedPercent < 100) {
        this.statusText.textContent = '上传中...'
      } else {
        this.statusText.textContent = '上传完成！'
      }
    }
  }
  
  /**
   * 设置为成功状态
   */
  success(message: string = '上传成功！'): void {
    this.progressBar.style.background = '#10b981'
    this.statusText.textContent = message
    this.statusText.style.color = '#10b981'
    
    setTimeout(() => {
      this.hide()
    }, 2000)
  }
  
  /**
   * 设置为错误状态
   */
  error(message: string = '上传失败'): void {
    this.progressBar.style.background = '#ef4444'
    this.statusText.textContent = message
    this.statusText.style.color = '#ef4444'
    
    setTimeout(() => {
      this.hide()
    }, 3000)
  }
  
  /**
   * 取消上传
   */
  cancel(): void {
    this.cancelled = true
    this.statusText.textContent = '已取消'
    this.statusText.style.color = '#f59e0b'
    
    if (this.options.onCancel) {
      this.options.onCancel()
    }
    
    setTimeout(() => {
      this.hide()
    }, 1000)
  }
  
  /**
   * 检查是否已取消
   */
  isCancelled(): boolean {
    return this.cancelled
  }
  
  /**
   * 显示
   */
  show(): void {
    if (!this.container.parentElement) {
      document.body.appendChild(this.container)
    }
  }
  
  /**
   * 隐藏
   */
  hide(): void {
    this.container.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => {
      if (this.container.parentElement) {
        this.container.parentElement.removeChild(this.container)
      }
    }, 300)
  }
  
  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
  }
}

/**
 * 创建上传进度实例
 */
export function createUploadProgress(options?: UploadProgressOptions): UploadProgress {
  return new UploadProgress(options)
}

/**
 * 显示上传进度
 */
export function showUploadProgress(options?: UploadProgressOptions): UploadProgress {
  const progress = new UploadProgress(options)
  progress.show()
  return progress
}





