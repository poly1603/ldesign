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
      id: 'crop',
      title: 'Crop',
      group: 'control',
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
      
      // Crop icon (Official Lucide Crop)
      'crop': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>'
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
    const groups = this.options.groups || ['transform', 'flip', 'zoom', 'move', 'control']
    if (this.options.showAdvanced && !groups.includes('skew')) {
      groups.splice(groups.length - 1, 0, 'skew')
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