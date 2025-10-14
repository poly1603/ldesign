/**
 * Core Toolbar Class
 * Provides a framework-agnostic toolbar for the cropper
 */

import type { Cropper } from './Cropper'

export interface ToolbarButton {
  id: string
  title: string
  icon: string
  group: string
  action: () => void
  disabled?: boolean
}

export interface ToolbarOptions {
  visible?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right' | 'floating'
  groups?: string[]
  buttons?: string[]
  customButtons?: ToolbarButton[]
  showAdvanced?: boolean
  compact?: boolean
  theme?: 'light' | 'dark' | 'auto'
}

export class Toolbar {
  private cropper: Cropper
  private container: HTMLElement
  private element: HTMLDivElement | null = null
  private options: ToolbarOptions
  private buttons: Map<string, ToolbarButton> = new Map()
  private disabled = false

  constructor(cropper: Cropper, container: HTMLElement, options: ToolbarOptions = {}) {
    this.cropper = cropper
    this.container = container
    this.options = {
      visible: true,
      position: 'top',
      groups: ['transform', 'flip', 'zoom', 'move', 'control'],
      showAdvanced: false,
      compact: false,
      theme: 'auto',
      ...options
    }

    this.initializeButtons()
    if (this.options.visible) {
      this.render()
    }
  }

  private initializeButtons(): void {
    // File operations
    this.addButton({
      id: 'upload',
      title: 'Upload Image',
      group: 'file',
      icon: this.getIcon('upload'),
      action: () => {
        const event = new CustomEvent('toolbar:upload', { bubbles: true })
        this.container.dispatchEvent(event)
      }
    })

    // Transform buttons
    this.addButton({
      id: 'rotate-left',
      title: 'Rotate Left',
      group: 'transform',
      icon: this.getIcon('rotate-left'),
      action: () => this.cropper.rotate(-90)
    })

    this.addButton({
      id: 'rotate-right',
      title: 'Rotate Right',
      group: 'transform',
      icon: this.getIcon('rotate-right'),
      action: () => this.cropper.rotate(90)
    })

    this.addButton({
      id: 'rotate-custom',
      title: 'Custom Rotate',
      group: 'transform',
      icon: this.getIcon('rotate-custom'),
      action: () => {
        const angle = prompt('Enter rotation angle (degrees):', '45')
        if (angle) {
          this.cropper.rotate(parseFloat(angle))
        }
      }
    })

    // Flip buttons
    this.addButton({
      id: 'flip-horizontal',
      title: 'Flip Horizontal',
      group: 'flip',
      icon: this.getIcon('flip-horizontal'),
      action: () => this.cropper.scaleX(-this.cropper.getData().scaleX)
    })

    this.addButton({
      id: 'flip-vertical',
      title: 'Flip Vertical',
      group: 'flip',
      icon: this.getIcon('flip-vertical'),
      action: () => this.cropper.scaleY(-this.cropper.getData().scaleY)
    })

    // Zoom buttons
    this.addButton({
      id: 'zoom-in',
      title: 'Zoom In',
      group: 'zoom',
      icon: this.getIcon('zoom-in'),
      action: () => {
        const imageData = this.cropper.getImageData()
        if (imageData) {
          const step = 0.1
          this.cropper.scale(imageData.scaleX + step, imageData.scaleY + step)
        }
      }
    })

    this.addButton({
      id: 'zoom-out',
      title: 'Zoom Out',
      group: 'zoom',
      icon: this.getIcon('zoom-out'),
      action: () => {
        const imageData = this.cropper.getImageData()
        if (imageData) {
          const step = 0.1
          this.cropper.scale(imageData.scaleX - step, imageData.scaleY - step)
        }
      }
    })

    this.addButton({
      id: 'zoom-fit',
      title: 'Fit to Container',
      group: 'zoom',
      icon: this.getIcon('zoom-fit'),
      action: () => {
        // Reset zoom to fit container
        const event = new CustomEvent('toolbar:fit', { bubbles: true })
        this.container.dispatchEvent(event)
      }
    })

    this.addButton({
      id: 'zoom-actual',
      title: 'Actual Size (1:1)',
      group: 'zoom',
      icon: this.getIcon('zoom-actual'),
      action: () => {
        this.cropper.scale(1, 1)
      }
    })

    // Move buttons
    this.addButton({
      id: 'move-left',
      title: 'Move Left',
      group: 'move',
      icon: this.getIcon('arrow-left'),
      action: () => this.cropper.move(-10, 0)
    })

    this.addButton({
      id: 'move-right',
      title: 'Move Right',
      group: 'move',
      icon: this.getIcon('arrow-right'),
      action: () => this.cropper.move(10, 0)
    })

    this.addButton({
      id: 'move-up',
      title: 'Move Up',
      group: 'move',
      icon: this.getIcon('arrow-up'),
      action: () => this.cropper.move(0, -10)
    })

    this.addButton({
      id: 'move-down',
      title: 'Move Down',
      group: 'move',
      icon: this.getIcon('arrow-down'),
      action: () => this.cropper.move(0, 10)
    })

    // Aspect ratio presets
    this.addButton({
      id: 'ratio-free',
      title: 'Free Ratio',
      group: 'ratio',
      icon: this.getIcon('ratio-free'),
      action: () => this.cropper.setAspectRatio(NaN)
    })

    this.addButton({
      id: 'ratio-square',
      title: 'Square (1:1)',
      group: 'ratio',
      icon: this.getIcon('ratio-square'),
      action: () => this.cropper.setAspectRatio(1)
    })

    this.addButton({
      id: 'ratio-16-9',
      title: '16:9',
      group: 'ratio',
      icon: this.getIcon('ratio-16-9'),
      action: () => this.cropper.setAspectRatio(16 / 9)
    })

    this.addButton({
      id: 'ratio-4-3',
      title: '4:3',
      group: 'ratio',
      icon: this.getIcon('ratio-4-3'),
      action: () => this.cropper.setAspectRatio(4 / 3)
    })

    // Advanced skew buttons (if enabled)
    if (this.options.showAdvanced) {
      this.addButton({
        id: 'skew-x-left',
        title: 'Skew X Left',
        group: 'skew',
        icon: this.getIcon('skew-x-left'),
        action: () => this.cropper.skew(-5, 0)
      })

      this.addButton({
        id: 'skew-x-right',
        title: 'Skew X Right',
        group: 'skew',
        icon: this.getIcon('skew-x-right'),
        action: () => this.cropper.skew(5, 0)
      })

      this.addButton({
        id: 'skew-y-up',
        title: 'Skew Y Up',
        group: 'skew',
        icon: this.getIcon('skew-y-up'),
        action: () => this.cropper.skew(0, -5)
      })

      this.addButton({
        id: 'skew-y-down',
        title: 'Skew Y Down',
        group: 'skew',
        icon: this.getIcon('skew-y-down'),
        action: () => this.cropper.skew(0, 5)
      })
    }

    // Control buttons
    this.addButton({
      id: 'reset',
      title: 'Reset',
      group: 'control',
      icon: this.getIcon('reset'),
      action: () => this.cropper.reset()
    })

    this.addButton({
      id: 'clear',
      title: 'Clear Crop Box',
      group: 'control',
      icon: this.getIcon('clear'),
      action: () => this.cropper.clear()
    })

    // Undo/Redo buttons (will be managed by HistoryManager)
    this.addButton({
      id: 'undo',
      title: 'Undo',
      group: 'history',
      icon: this.getIcon('undo'),
      action: () => {
        const event = new CustomEvent('toolbar:undo', { bubbles: true })
        this.container.dispatchEvent(event)
      },
      disabled: true
    })

    this.addButton({
      id: 'redo',
      title: 'Redo',
      group: 'history',
      icon: this.getIcon('redo'),
      action: () => {
        const event = new CustomEvent('toolbar:redo', { bubbles: true })
        this.container.dispatchEvent(event)
      },
      disabled: true
    })

    // Export/Action buttons
    this.addButton({
      id: 'download',
      title: 'Download Image',
      group: 'actions',
      icon: this.getIcon('download'),
      action: () => {
        const canvas = this.cropper.getCroppedCanvas()
        if (canvas) {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `cropped-${Date.now()}.png`
              a.click()
              URL.revokeObjectURL(url)
            }
          })
        }
      }
    })

    this.addButton({
      id: 'copy',
      title: 'Copy to Clipboard',
      group: 'actions',
      icon: this.getIcon('copy'),
      action: async () => {
        const canvas = this.cropper.getCroppedCanvas()
        if (canvas && 'clipboard' in navigator) {
          try {
            canvas.toBlob(async (blob) => {
              if (blob) {
                const item = new ClipboardItem({ 'image/png': blob })
                await navigator.clipboard.write([item])
                const event = new CustomEvent('toolbar:copy', { 
                  detail: { success: true },
                  bubbles: true 
                })
                this.container.dispatchEvent(event)
              }
            })
          } catch (err) {
            const event = new CustomEvent('toolbar:copy', { 
              detail: { success: false, error: err },
              bubbles: true 
            })
            this.container.dispatchEvent(event)
          }
        }
      }
    })

    this.addButton({
      id: 'crop',
      title: 'Crop',
      group: 'actions',
      icon: this.getIcon('crop'),
      action: () => {
        const canvas = this.cropper.getCroppedCanvas()
        if (canvas) {
          // Emit custom event with cropped canvas
          const event = new CustomEvent('toolbar:crop', { 
            detail: { canvas },
            bubbles: true 
          })
          this.container.dispatchEvent(event)
        }
      }
    })

    // Add custom buttons if provided
    if (this.options.customButtons) {
      this.options.customButtons.forEach(button => this.addButton(button))
    }
  }

  private addButton(button: ToolbarButton): void {
    this.buttons.set(button.id, button)
  }

  private getIcon(name: string): string {
    // Using Lucide icons for a consistent, modern look
    // Official Lucide icons with correct SVG paths
    const icons: Record<string, string> = {
      // Rotate icons (Official Lucide RotateCcw and RotateCw)
      'rotate-left': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
      'rotate-right': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
      
      // Flip icons (Lucide FlipHorizontal and FlipVertical2)
      'flip-horizontal': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M12 20v2"/><path d="M12 14v2"/><path d="M12 8v2"/><path d="M12 2v2"/></svg>',
      'flip-vertical': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><path d="M4 12h2"/><path d="M10 12h2"/><path d="M16 12h2"/><path d="M22 12h-2"/></svg>',
      
      // Zoom icons (Official Lucide ZoomIn and ZoomOut)
      'zoom-in': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
      'zoom-out': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
      
      // Move icons (Official Lucide ArrowLeft, ArrowRight, ArrowUp, ArrowDown)
      'arrow-left': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
      'arrow-right': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
      'arrow-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
      'arrow-down': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>',
      
      // Transform icons (Using Lucide Move3d and similar)
      'skew-x-left': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14l-2 18H7z"/><path d="M9 9h6"/><path d="M8 15h8"/></svg>',
      'skew-x-right': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21h14L17 3H5z"/><path d="M9 15h6"/><path d="M8 9h8"/></svg>',
      'skew-y-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5v14l18-2V3z"/><path d="M9 9v6"/><path d="M15 8v8"/></svg>',
      'skew-y-down': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5v14L3 17V3z"/><path d="M15 9v6"/><path d="M9 8v8"/></svg>',
      
      // Reset icon (Official Lucide RefreshCw)
      'reset': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
      
      // Clear icon (Official Lucide X)
      'clear': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      
      // Undo icon (Official Lucide Undo2)
      'undo': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>',
      
      // Redo icon (Official Lucide Redo2)
      'redo': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>',
      
      // Download icon (Official Lucide Download)
      'download': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      
      // Copy icon (Official Lucide Copy)
      'copy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
      
      // Crop icon (Official Lucide Crop)
      'crop': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>',
      
      // Upload icon (Official Lucide Upload)
      'upload': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      
      // Custom rotate icon (Official Lucide RotateCw with number)
      'rotate-custom': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><text x="12" y="14" text-anchor="middle" font-size="8" fill="currentColor">°</text></svg>',
      
      // Zoom fit icon (Official Lucide Maximize2)
      'zoom-fit': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
      
      // Zoom actual icon (1:1)
      'zoom-actual': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><text x="11" y="14" text-anchor="middle" font-size="8" fill="currentColor">1:1</text></svg>',
      
      // Aspect ratio icons
      'ratio-free': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="5 5"/></svg>',
      'ratio-square': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><text x="12" y="15" text-anchor="middle" font-size="8" fill="currentColor">1:1</text></svg>',
      'ratio-16-9': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><text x="12" y="14" text-anchor="middle" font-size="7" fill="currentColor">16:9</text></svg>',
      'ratio-4-3': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><text x="12" y="14" text-anchor="middle" font-size="7" fill="currentColor">4:3</text></svg>'
    }
    return icons[name] || ''
  }

  public render(): void {
    if (this.element) {
      this.destroy()
    }

    this.element = document.createElement('div')
    this.element.className = `cropper-toolbar cropper-toolbar-${this.options.position}`
    
    if (this.options.compact) {
      this.element.classList.add('cropper-toolbar-compact')
    }

    if (this.options.theme === 'dark' || 
        (this.options.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.element.classList.add('cropper-toolbar-dark')
    }

    // Create button groups
    const groups = this.options.groups || ['file', 'transform', 'flip', 'zoom', 'ratio', 'move', 'control', 'history', 'actions']
    if (this.options.showAdvanced && !groups.includes('skew')) {
      const controlIndex = groups.indexOf('control')
      if (controlIndex > -1) {
        groups.splice(controlIndex, 0, 'skew')
      }
    }

    groups.forEach(groupName => {
      const group = document.createElement('div')
      group.className = 'cropper-toolbar-group'
      group.dataset.group = groupName

      // Add buttons to group
      this.buttons.forEach((button, id) => {
        if (button.group === groupName) {
          // Check if button should be included
          if (this.options.buttons && !this.options.buttons.includes(id)) {
            return
          }

          const btn = this.createButton(button)
          group.appendChild(btn)
        }
      })

      if (group.children.length > 0) {
        this.element!.appendChild(group)
      }
    })

    // Append toolbar to container
    this.container.appendChild(this.element)
  }

  private createButton(button: ToolbarButton): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = 'cropper-toolbar-button cropper-toolbar-icon'
    btn.title = button.title
    btn.setAttribute('aria-label', button.title)
    btn.dataset.action = button.id
    btn.innerHTML = button.icon
    btn.disabled = button.disabled || this.disabled

    // Add special styling for primary buttons
    if (button.id === 'crop') {
      btn.classList.add('cropper-toolbar-primary')
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault()
      if (!btn.disabled && !this.disabled) {
        button.action()
      }
    })

    return btn
  }

  public show(): void {
    if (this.element) {
      this.element.style.display = ''
    } else {
      this.options.visible = true
      this.render()
    }
  }

  public hide(): void {
    if (this.element) {
      this.element.style.display = 'none'
    }
  }

  public enable(): void {
    this.disabled = false
    if (this.element) {
      this.element.querySelectorAll('button').forEach(btn => {
        btn.disabled = false
      })
    }
  }

  public disable(): void {
    this.disabled = true
    if (this.element) {
      this.element.querySelectorAll('button').forEach(btn => {
        btn.disabled = true
      })
    }
  }

  public updateButton(id: string, updates: Partial<ToolbarButton>): void {
    const button = this.buttons.get(id)
    if (button) {
      Object.assign(button, updates)
      
      // Re-render button if toolbar is visible
      if (this.element) {
        const btn = this.element.querySelector(`[data-action="${id}"]`) as HTMLButtonElement
        if (btn) {
          if (updates.title) btn.title = updates.title
          if (updates.icon) btn.innerHTML = updates.icon
          if (updates.disabled !== undefined) btn.disabled = updates.disabled
        }
      }
    }
  }

  public setPosition(position: 'top' | 'bottom' | 'left' | 'right' | 'floating'): void {
    this.options.position = position
    if (this.element) {
      this.element.className = `cropper-toolbar cropper-toolbar-${position}`
      if (this.options.compact) {
        this.element.classList.add('cropper-toolbar-compact')
      }
    }
  }

  public destroy(): void {
    if (this.element) {
      this.element.remove()
      this.element = null
    }
  }
}