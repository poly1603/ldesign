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
      action: () => this.cropper.zoom(0.1)
    })

    this.addButton({
      id: 'zoom-out',
      title: 'Zoom Out',
      group: 'zoom',
      icon: this.getIcon('zoom-out'),
      action: () => this.cropper.zoom(-0.1)
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
    const icons: Record<string, string> = {
      'rotate-left': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12a9.5 9.5 0 1 0 9.5-9.5v3.5L7 1"/></svg>',
      'rotate-right': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 12a9.5 9.5 0 1 1-9.5-9.5v3.5l5-5"/></svg>',
      'flip-horizontal': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M16 16l4-4-4-4M8 8L4 12l4 4"/></svg>',
      'flip-vertical': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M16 8l-4-4-4 4M8 16l4 4 4-4"/></svg>',
      'zoom-in': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>',
      'zoom-out': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',
      'arrow-left': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>',
      'arrow-right': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M19 12l-7 7M19 12l-7-7"/></svg>',
      'arrow-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M12 5l-7 7M12 5l7 7"/></svg>',
      'arrow-down': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M12 19l7-7M12 19l-7-7"/></svg>',
      'skew-x-left': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L9 21M15 3v6M9 15v6"/></svg>',
      'skew-x-right': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l12 18M9 3v6M15 15v6"/></svg>',
      'skew-y-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l18-12M3 15h6M15 9h6"/></svg>',
      'skew-y-down': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 12M3 9h6M15 15h6"/></svg>',
      'reset': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 9 9 9 9 0 0 1-9-9z"/><path d="M12 6v6l4 2"/><path d="M3 3l3 3M21 21l-3-3"/></svg>',
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