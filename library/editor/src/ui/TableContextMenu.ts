/**
 * 表格右键菜单
 */

export interface TableContextMenuOptions {
  onAddRowAbove?: () => void
  onAddRowBelow?: () => void
  onAddColumnLeft?: () => void
  onAddColumnRight?: () => void
  onDeleteRow?: () => void
  onDeleteColumn?: () => void
  onDeleteTable?: () => void
  onMergeCells?: () => void
  onSplitCell?: () => void
  x: number
  y: number
}

/**
 * 创建表格右键菜单
 */
export function createTableContextMenu(options: TableContextMenuOptions): HTMLElement {
  const menu = document.createElement('div')
  menu.className = 'table-context-menu'
  menu.style.cssText = `
    position: fixed;
    left: ${options.x}px;
    top: ${options.y}px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    min-width: 200px;
    z-index: 10001;
    animation: menuFadeIn 0.2s ease-out;
  `

  const menuItems = [
    { label: '在上方插入行', icon: '↑', action: options.onAddRowAbove },
    { label: '在下方插入行', icon: '↓', action: options.onAddRowBelow },
    { divider: true },
    { label: '在左侧插入列', icon: '←', action: options.onAddColumnLeft },
    { label: '在右侧插入列', icon: '→', action: options.onAddColumnRight },
    { divider: true },
    { label: '合并单元格', icon: '⊞', action: options.onMergeCells },
    { label: '拆分单元格', icon: '⊟', action: options.onSplitCell },
    { divider: true },
    { label: '删除行', icon: '✕', action: options.onDeleteRow, danger: true },
    { label: '删除列', icon: '✕', action: options.onDeleteColumn, danger: true },
    { label: '删除表格', icon: '🗑', action: options.onDeleteTable, danger: true }
  ]

  menuItems.forEach(item => {
    if (item.divider) {
      const divider = document.createElement('div')
      divider.style.cssText = 'height: 1px; background: #e5e7eb; margin: 4px 0;'
      menu.appendChild(divider)
    } else if (item.action) {
      const menuItem = document.createElement('div')
      menuItem.style.cssText = `
        padding: 8px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 14px;
        color: ${item.danger ? '#dc2626' : '#374151'};
      `
      
      menuItem.innerHTML = `
        <span style="width: 20px; text-align: center; opacity: 0.6;">${item.icon}</span>
        <span>${item.label}</span>
      `
      
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.background = item.danger ? '#fee2e2' : '#f3f4f6'
      })
      
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.background = 'transparent'
      })
      
      menuItem.addEventListener('click', () => {
        item.action()
        menu.remove()
      })
      
      menu.appendChild(menuItem)
    }
  })

  // 添加动画样式
  const style = document.createElement('style')
  style.textContent = `
    @keyframes menuFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `
  document.head.appendChild(style)

  // 点击其他地方关闭菜单
  setTimeout(() => {
    const closeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove()
        document.removeEventListener('click', closeMenu)
      }
    }
    document.addEventListener('click', closeMenu)
  }, 100)

  return menu
}

/**
 * 显示表格右键菜单
 */
export function showTableContextMenu(options: TableContextMenuOptions): void {
  // 移除已存在的菜单
  const existing = document.querySelector('.table-context-menu')
  if (existing) {
    existing.remove()
  }

  const menu = createTableContextMenu(options)
  document.body.appendChild(menu)

  // 确保菜单不超出视窗
  const rect = menu.getBoundingClientRect()
  if (rect.right > window.innerWidth) {
    menu.style.left = `${window.innerWidth - rect.width - 10}px`
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = `${window.innerHeight - rect.height - 10}px`
  }
}