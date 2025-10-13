/**
 * 图片属性面板
 * 提供图片尺寸、填充模式等设置
 */

export class ImagePropertiesPanel {
  private panel: HTMLDivElement
  private currentImage: HTMLElement | null = null
  private isVisible = false

  constructor() {
    this.panel = this.createPanel()
    document.body.appendChild(this.panel)
  }

  private createPanel(): HTMLDivElement {
    const panel = document.createElement('div')
    panel.className = 'ldesign-image-properties-panel'
    panel.style.cssText = `
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 280px;
      max-height: 600px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      padding: 20px;
      display: none;
      z-index: 1000;
      overflow-y: auto;
    `

    panel.innerHTML = `
      <div class="panel-header" style="margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 16px; color: #111827; font-weight: 600;">图片属性</h3>
        <button class="close-btn" style="position: absolute; top: 15px; right: 15px; width: 24px; height: 24px; border: none; background: transparent; cursor: pointer; color: #6b7280; font-size: 20px;">×</button>
      </div>

      <div class="panel-section" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-size: 13px; color: #4b5563; font-weight: 500;">尺寸设置</label>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div>
            <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #6b7280;">宽度 (px)</label>
            <input type="number" id="img-width" style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #6b7280;">高度 (px)</label>
            <input type="number" id="img-height" style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
          </div>
        </div>
        
        <label style="display: flex; align-items: center; font-size: 12px; color: #6b7280; margin-bottom: 12px; cursor: pointer;">
          <input type="checkbox" id="keep-aspect-ratio" checked style="margin-right: 6px;">
          保持宽高比
        </label>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
          <button class="size-preset" data-size="25%" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; font-size: 12px; cursor: pointer; transition: all 0.2s;">25%</button>
          <button class="size-preset" data-size="50%" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; font-size: 12px; cursor: pointer; transition: all 0.2s;">50%</button>
          <button class="size-preset" data-size="75%" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; font-size: 12px; cursor: pointer; transition: all 0.2s;">75%</button>
          <button class="size-preset" data-size="100%" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; font-size: 12px; cursor: pointer; transition: all 0.2s;">100%</button>
        </div>
      </div>

      <div class="panel-section" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-size: 13px; color: #4b5563; font-weight: 500;">填充模式</label>
        
        <select id="object-fit" style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; margin-bottom: 8px;">
          <option value="fill">填充 (Fill)</option>
          <option value="contain" selected>包含 (Contain)</option>
          <option value="cover">覆盖 (Cover)</option>
          <option value="none">原始 (None)</option>
          <option value="scale-down">缩小 (Scale-down)</option>
        </select>
        
        <div class="fit-preview" style="width: 100%; height: 120px; border: 1px solid #e5e7eb; border-radius: 4px; background: #f9fafb; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
          <div style="width: 80px; height: 80px; border: 2px dashed #d1d5db; position: relative; overflow: hidden;">
            <div class="fit-demo" style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
          </div>
        </div>
        
        <p style="font-size: 11px; color: #9ca3af; margin: 0; line-height: 1.4;">
          选择图片在容器中的填充方式
        </p>
      </div>

      <div class="panel-section" style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-size: 13px; color: #4b5563; font-weight: 500;">对齐方式</label>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          <button class="align-btn" data-align="left" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; font-size: 12px; cursor: pointer;">左</button>
          <button class="align-btn" data-align="center" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; font-size: 12px; cursor: pointer;">中</button>
          <button class="align-btn" data-align="right" style="padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; background: white; font-size: 12px; cursor: pointer;">右</button>
        </div>
      </div>

      <div class="panel-actions" style="display: flex; gap: 8px;">
        <button id="reset-btn" style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; background: white; color: #4b5563; font-size: 13px; cursor: pointer;">重置</button>
        <button id="apply-btn" style="flex: 1; padding: 8px; border: none; border-radius: 4px; background: #3b82f6; color: white; font-size: 13px; cursor: pointer;">应用</button>
      </div>
    `

    // 添加事件监听
    this.attachPanelEvents(panel)

    return panel
  }

  private attachPanelEvents(panel: HTMLDivElement): void {
    // 关闭按钮
    const closeBtn = panel.querySelector('.close-btn') as HTMLButtonElement
    closeBtn?.addEventListener('click', () => this.hide())

    // 尺寸输入
    const widthInput = panel.querySelector('#img-width') as HTMLInputElement
    const heightInput = panel.querySelector('#img-height') as HTMLInputElement
    const keepRatioCheckbox = panel.querySelector('#keep-aspect-ratio') as HTMLInputElement

    let aspectRatio = 1

    widthInput?.addEventListener('input', () => {
      if (keepRatioCheckbox?.checked && aspectRatio) {
        const width = parseInt(widthInput.value) || 0
        heightInput.value = Math.round(width / aspectRatio).toString()
      }
    })

    heightInput?.addEventListener('input', () => {
      if (keepRatioCheckbox?.checked && aspectRatio) {
        const height = parseInt(heightInput.value) || 0
        widthInput.value = Math.round(height * aspectRatio).toString()
      }
    })

    // 预设尺寸按钮
    panel.querySelectorAll('.size-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const size = (e.target as HTMLElement).getAttribute('data-size')
        if (size && this.currentImage) {
          this.applySize(size)
        }
      })
    })

    // 填充模式选择
    const fitSelect = panel.querySelector('#object-fit') as HTMLSelectElement
    fitSelect?.addEventListener('change', () => {
      if (this.currentImage) {
        this.applyObjectFit(fitSelect.value)
        this.updateFitPreview(fitSelect.value)
      }
    })

    // 对齐按钮
    panel.querySelectorAll('.align-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const align = (e.target as HTMLElement).getAttribute('data-align')
        if (align && this.currentImage) {
          this.applyAlignment(align)
        }
      })
    })

    // 重置按钮
    const resetBtn = panel.querySelector('#reset-btn') as HTMLButtonElement
    resetBtn?.addEventListener('click', () => this.reset())

    // 应用按钮
    const applyBtn = panel.querySelector('#apply-btn') as HTMLButtonElement
    applyBtn?.addEventListener('click', () => this.apply())
  }

  public show(imageWrapper: HTMLElement): void {
    this.currentImage = imageWrapper
    const img = imageWrapper.querySelector('img') as HTMLImageElement
    
    if (!img) return

    // 更新面板值
    const widthInput = this.panel.querySelector('#img-width') as HTMLInputElement
    const heightInput = this.panel.querySelector('#img-height') as HTMLInputElement
    const fitSelect = this.panel.querySelector('#object-fit') as HTMLSelectElement

    widthInput.value = img.offsetWidth.toString()
    heightInput.value = img.offsetHeight.toString()
    fitSelect.value = img.style.objectFit || 'contain'

    this.updateFitPreview(fitSelect.value)

    // 显示面板
    this.panel.style.display = 'block'
    this.isVisible = true

    // 添加动画
    requestAnimationFrame(() => {
      this.panel.style.transform = 'translateY(-50%) translateX(0)'
      this.panel.style.opacity = '1'
    })
  }

  public hide(): void {
    this.panel.style.transform = 'translateY(-50%) translateX(20px)'
    this.panel.style.opacity = '0'
    
    setTimeout(() => {
      this.panel.style.display = 'none'
      this.isVisible = false
      this.currentImage = null
    }, 200)
  }

  private applySize(size: string): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return

    const editorContent = this.currentImage.closest('.ldesign-editor-content') as HTMLElement
    if (size.includes('%') && editorContent) {
      const maxWidth = editorContent.offsetWidth - 40
      const percentage = parseInt(size) / 100
      const targetWidth = Math.min(maxWidth * percentage, maxWidth)
      img.style.width = `${targetWidth}px`
      img.style.height = 'auto'
      this.currentImage.style.width = `${targetWidth}px`
    }

    this.triggerContentChange()
  }

  private applyObjectFit(fit: string): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return

    img.style.objectFit = fit as any
    
    // 添加相应的类
    this.currentImage.classList.remove('fit-fill', 'fit-contain', 'fit-cover', 'fit-none', 'fit-scale-down')
    this.currentImage.classList.add(`fit-${fit}`)

    this.triggerContentChange()
  }

  private applyAlignment(align: string): void {
    if (!this.currentImage) return

    this.currentImage.style.display = 'block'
    
    switch (align) {
      case 'left':
        this.currentImage.style.marginLeft = '0'
        this.currentImage.style.marginRight = 'auto'
        break
      case 'center':
        this.currentImage.style.marginLeft = 'auto'
        this.currentImage.style.marginRight = 'auto'
        break
      case 'right':
        this.currentImage.style.marginLeft = 'auto'
        this.currentImage.style.marginRight = '0'
        break
    }

    this.triggerContentChange()
  }

  private updateFitPreview(fit: string): void {
    const demo = this.panel.querySelector('.fit-demo') as HTMLElement
    if (!demo) return

    switch (fit) {
      case 'fill':
        demo.style.width = '100%'
        demo.style.height = '100%'
        break
      case 'contain':
        demo.style.width = '60%'
        demo.style.height = '60%'
        demo.style.margin = 'auto'
        break
      case 'cover':
        demo.style.width = '120%'
        demo.style.height = '120%'
        demo.style.margin = '-10%'
        break
      case 'none':
        demo.style.width = '100px'
        demo.style.height = '100px'
        break
      case 'scale-down':
        demo.style.width = '50%'
        demo.style.height = '50%'
        demo.style.margin = 'auto'
        break
    }
  }

  private reset(): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return

    img.style.width = 'auto'
    img.style.height = 'auto'
    img.style.maxWidth = '100%'
    img.style.objectFit = ''
    this.currentImage.style.width = 'auto'
    this.currentImage.classList.remove('fit-fill', 'fit-contain', 'fit-cover', 'fit-none', 'fit-scale-down', 'fixed-size')

    this.triggerContentChange()
    this.hide()
  }

  private apply(): void {
    const widthInput = this.panel.querySelector('#img-width') as HTMLInputElement
    const heightInput = this.panel.querySelector('#img-height') as HTMLInputElement
    const width = parseInt(widthInput.value) || 0
    const height = parseInt(heightInput.value) || 0

    if (this.currentImage && width > 0 && height > 0) {
      const img = this.currentImage.querySelector('img') as HTMLImageElement
      if (img) {
        img.style.width = `${width}px`
        img.style.height = `${height}px`
        img.style.maxWidth = 'none'
        this.currentImage.style.width = `${width}px`
        this.currentImage.style.height = `${height}px`
        this.currentImage.classList.add('fixed-size')
      }
    }

    this.triggerContentChange()
    this.hide()
  }

  private triggerContentChange(): void {
    const event = new Event('input', { bubbles: true })
    const editorContent = this.currentImage?.closest('.ldesign-editor-content')
    if (editorContent) {
      editorContent.dispatchEvent(event)
    }
  }
}

// 创建单例
let panelInstance: ImagePropertiesPanel | null = null

export function getImagePropertiesPanel(): ImagePropertiesPanel {
  if (!panelInstance) {
    panelInstance = new ImagePropertiesPanel()
  }
  return panelInstance
}