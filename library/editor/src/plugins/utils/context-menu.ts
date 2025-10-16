/**
 * Context Menu Plugin - Right-click menu functionality
 */

import type { Plugin } from '../../types'
import { getLucideIcon } from '../../ui/icons/lucide'

export const ContextMenuPlugin: Plugin = {
  name: 'contextMenu',
  
  install(editor: any) {
    let contextMenu: HTMLDivElement | null = null
    
    // Hide menu function
    const hideContextMenu = () => {
      if (contextMenu) {
        contextMenu.remove()
        contextMenu = null
      }
    }
    
    // Show menu function
    const showContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      hideContextMenu()
      
      const selection = window.getSelection()
      const hasSelection = selection && selection.toString().length > 0
      
      // Create menu
      contextMenu = document.createElement('div')
      contextMenu.className = 'ldesign-context-menu'
      contextMenu.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        padding: 4px;
        min-width: 200px;
        z-index: 10000;
        font-size: 14px;
        color: #374151;
        user-select: none;
      `
      
      // Menu items
      const menuItems = [
        ...(hasSelection ? [
          {
            label: 'Copy',
            icon: getLucideIcon('copy'),
            shortcut: 'Ctrl+C',
            action: () => {
              document.execCommand('copy')
              if (window.Toast && typeof window.Toast.show === 'function') {
                window.Toast.show('Copied to clipboard', 'success')
              }
            }
          },
          {
            label: 'Paste',
            icon: getLucideIcon('clipboard'),
            shortcut: 'Ctrl+V',
            action: () => {
              document.execCommand('paste')
            }
          },
          {
            label: 'Cut',
            icon: getLucideIcon('scissors'),
            shortcut: 'Ctrl+X',
            action: () => {
              document.execCommand('cut')
              if (window.Toast && typeof window.Toast.show === 'function') {
                window.Toast.show('Cut to clipboard', 'success')
              }
            }
          },
          { divider: true },
          {
            label: 'Bold',
            icon: getLucideIcon('bold'),
            shortcut: 'Ctrl+B',
            action: () => editor.commands.get('bold')?.()
          },
          {
            label: 'Italic',
            icon: getLucideIcon('italic'),
            shortcut: 'Ctrl+I',
            action: () => editor.commands.get('italic')?.()
          },
          {
            label: 'Underline',
            icon: getLucideIcon('underline'),
            shortcut: 'Ctrl+U',
            action: () => editor.commands.get('underline')?.()
          },
          { divider: true }
        ] : []),
        {
          label: 'Select All',
          icon: getLucideIcon('selectAll'),
          shortcut: 'Ctrl+A',
          action: () => {
            const range = document.createRange()
            range.selectNodeContents(editor.contentElement)
            const sel = window.getSelection()
            if (sel) {
              sel.removeAllRanges()
              sel.addRange(range)
            }
          }
        },
        { divider: true },
        {
          label: 'Insert Image',
          icon: getLucideIcon('image'),
          action: () => editor.commands.get('insertImage')?.()
        },
        {
          label: 'Insert Link',
          icon: getLucideIcon('link'),
          action: () => editor.commands.get('createLink')?.()
        },
        {
          label: 'Insert Table',
          icon: getLucideIcon('table'),
          action: () => editor.commands.get('insertTable')?.()
        }
      ]
      
      // Render menu items
      menuItems.forEach(item => {
        if (item.divider) {
          const divider = document.createElement('div')
          divider.style.cssText = 'height: 1px; background: #e5e7eb; margin: 4px 0;'
          contextMenu!.appendChild(divider)
        } else {
          const menuItem = document.createElement('div')
          menuItem.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s;
          `
          
          // Icon
          if (item.icon) {
            const icon = document.createElement('span')
            icon.style.cssText = 'width: 16px; height: 16px; opacity: 0.7;'
            icon.innerHTML = item.icon
            menuItem.appendChild(icon)
          }
          
          // Label
          const label = document.createElement('span')
          label.textContent = item.label || ''
          label.style.flex = '1'
          menuItem.appendChild(label)
          
          // Shortcut
          if (item.shortcut) {
            const shortcut = document.createElement('span')
            shortcut.textContent = item.shortcut
            shortcut.style.cssText = 'font-size: 12px; opacity: 0.5;'
            menuItem.appendChild(shortcut)
          }
          
          // Hover effect
          menuItem.onmouseenter = () => {
            menuItem.style.background = '#f3f4f6'
          }
          
          menuItem.onmouseleave = () => {
            menuItem.style.background = 'transparent'
          }
          
          // Click handler
          menuItem.onclick = (e) => {
            e.stopPropagation()
            item.action?.()
            hideContextMenu()
          }
          
          contextMenu!.appendChild(menuItem)
        }
      })
      
      // Add to page
      document.body.appendChild(contextMenu)
      
      // Adjust position if menu goes off screen
      requestAnimationFrame(() => {
        if (!contextMenu) return
        
        const rect = contextMenu.getBoundingClientRect()
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        
        if (rect.right > windowWidth) {
          contextMenu.style.left = `${windowWidth - rect.width - 10}px`
        }
        
        if (rect.bottom > windowHeight) {
          contextMenu.style.top = `${windowHeight - rect.height - 10}px`
        }
      })
    }
    
    // Event listeners
    if (editor.contentElement) {
      editor.contentElement.addEventListener('contextmenu', showContextMenu)
    }
    
    // Hide on click outside
    document.addEventListener('click', hideContextMenu)
    
    // Hide on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideContextMenu()
    })
    
    // Register command
    editor.commands.register('contextMenu', showContextMenu)
    
    console.log('[ContextMenuPlugin] Loaded')
  }
}

// Declare Toast type for TypeScript
declare global {
  interface Window {
    Toast?: {
      show: (message: string, type: string) => void
    }
  }
}

export default ContextMenuPlugin