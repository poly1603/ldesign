/**
 * Enhanced Emoji Picker using Popover and DropdownMenu components
 * Modular, reusable, with consistent styling
 */

import { Popover } from './enhanced/Popover'
import { DropdownMenu } from './enhanced/DropdownMenu'

// Emoji categories data
const EMOJI_CATEGORIES = {
  smileys: {
    name: '笑脸',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '😠', '😡', '🤬']
  },
  gestures: {
    name: '手势',
    icon: '👋',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪']
  },
  hearts: {
    name: '爱心',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
  },
  animals: {
    name: '动物',
    icon: '🐶',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜']
  },
  food: {
    name: '食物',
    icon: '🍏',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪']
  }
}

export interface EmojiPickerOptions {
  onSelect?: (emoji: string) => void
  defaultCategory?: string
  width?: number
  maxHeight?: number
}

/**
 * Enhanced Emoji Picker Component
 */
export class EmojiPicker {
  private popover: Popover | null = null
  private currentCategory: string = 'smileys'
  private options: EmojiPickerOptions
  private categoryDropdown: DropdownMenu | null = null

  constructor(options: EmojiPickerOptions = {}) {
    this.options = options
    this.currentCategory = options.defaultCategory || 'smileys'
  }

  /**
   * Show emoji picker attached to trigger element
   */
  show(triggerElement: HTMLElement): void {
    if (this.popover) {
      this.hide()
      return
    }

    // Create picker content
    const content = this.createPickerContent()

    // Create popover
    this.popover = new Popover({
      content,
      trigger: 'manual',
      placement: 'bottom-start',
      interactive: true,
      arrow: true,
      offset: 8,
      className: 'emoji-picker-popover'
    })

    this.popover.show(triggerElement)

    // Setup close on outside click
    setTimeout(() => {
      const closeHandler = (e: MouseEvent) => {
        const target = e.target as Node
        if (!triggerElement.contains(target) && 
            this.popover && 
            !this.popover.getElement()?.contains(target)) {
          this.hide()
          document.removeEventListener('click', closeHandler)
        }
      }
      document.addEventListener('click', closeHandler)
    }, 100)
  }

  /**
   * Hide emoji picker
   */
  hide(): void {
    if (this.popover) {
      this.popover.destroy()
      this.popover = null
    }
    if (this.categoryDropdown) {
      this.categoryDropdown.destroy()
      this.categoryDropdown = null
    }
  }

  /**
   * Create picker content element
   */
  private createPickerContent(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'emoji-picker-container'
    container.style.cssText = `
      width: ${this.options.width || 380}px;
      max-height: ${this.options.maxHeight || 320}px;
      display: flex;
      flex-direction: column;
    `

    // Create category tabs
    const tabsContainer = document.createElement('div')
    tabsContainer.className = 'emoji-picker-tabs'
    tabsContainer.style.cssText = `
      display: flex;
      gap: 4px;
      padding: 8px 8px 0 8px;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      overflow-x: auto;
      flex-shrink: 0;
    `

    // Create tabs for each category
    Object.entries(EMOJI_CATEGORIES).forEach(([key, category]) => {
      const tab = document.createElement('button')
      tab.className = `emoji-category-tab ${key === this.currentCategory ? 'active' : ''}`
      tab.setAttribute('data-category', key)
      tab.title = category.name
      tab.textContent = category.icon
      tab.style.cssText = `
        padding: 8px 12px;
        border: none;
        background: ${key === this.currentCategory ? 'var(--primary-color, #4f46e5)' : 'transparent'};
        color: ${key === this.currentCategory ? 'white' : 'inherit'};
        border-radius: 6px;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s;
        flex-shrink: 0;
      `

      tab.addEventListener('click', () => {
        this.currentCategory = key
        this.updateEmojiGrid(emojiGrid, key)
        
        // Update tab styles
        tabsContainer.querySelectorAll('.emoji-category-tab').forEach(t => {
          const isActive = t.getAttribute('data-category') === key
          ;(t as HTMLElement).style.background = isActive ? 'var(--primary-color, #4f46e5)' : 'transparent'
          ;(t as HTMLElement).style.color = isActive ? 'white' : 'inherit'
        })
      })

      tab.addEventListener('mouseenter', () => {
        if (key !== this.currentCategory) {
          tab.style.background = 'var(--hover-bg, #f3f4f6)'
        }
      })

      tab.addEventListener('mouseleave', () => {
        if (key !== this.currentCategory) {
          tab.style.background = 'transparent'
        }
      })

      tabsContainer.appendChild(tab)
    })

    container.appendChild(tabsContainer)

    // Create emoji grid
    const emojiGrid = document.createElement('div')
    emojiGrid.className = 'emoji-picker-grid'
    emojiGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 4px;
      padding: 12px 8px;
      overflow-y: auto;
      flex: 1;
    `

    this.updateEmojiGrid(emojiGrid, this.currentCategory)
    container.appendChild(emojiGrid)

    return container
  }

  /**
   * Update emoji grid with category emojis
   */
  private updateEmojiGrid(grid: HTMLElement, categoryKey: string): void {
    grid.innerHTML = ''
    const category = EMOJI_CATEGORIES[categoryKey as keyof typeof EMOJI_CATEGORIES]
    
    if (!category) return

    category.emojis.forEach(emoji => {
      const button = document.createElement('button')
      button.className = 'emoji-button'
      button.textContent = emoji
      button.title = emoji
      button.style.cssText = `
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: background 0.15s;
        padding: 0;
      `

      button.addEventListener('mouseenter', () => {
        button.style.background = 'var(--hover-bg, #f3f4f6)'
      })

      button.addEventListener('mouseleave', () => {
        button.style.background = 'transparent'
      })

      button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (this.options.onSelect) {
          this.options.onSelect(emoji)
        }
        
        this.hide()
      })

      grid.appendChild(button)
    })
  }

  /**
   * Destroy picker and cleanup
   */
  destroy(): void {
    this.hide()
  }
}

/**
 * Utility function to show emoji picker (backward compatibility)
 */
export function showEmojiPicker(button: HTMLElement, onSelect?: (emoji: string) => void): void {
  const picker = new EmojiPicker({ onSelect })
  picker.show(button)
}
