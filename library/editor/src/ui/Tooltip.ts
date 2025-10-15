/**
 * 自定义工具提示组件
 */

let currentTooltip: HTMLElement | null = null

/**
 * 显示工具提示
 */
export function showTooltip(element: HTMLElement, text: string): void {
  // 移除已存在的提示
  hideTooltip()

  const tooltip = document.createElement('div')
  tooltip.className = 'editor-tooltip'
  tooltip.textContent = text
  
  document.body.appendChild(tooltip)
  currentTooltip = tooltip

  // 定位提示框
  const rect = element.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  
  // 计算位置（居中显示在元素下方）
  const left = rect.left + (rect.width - tooltipRect.width) / 2
  const top = rect.bottom + 8
  
  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
  
  // 添加显示动画
  requestAnimationFrame(() => {
    tooltip.classList.add('show')
  })
}

/**
 * 隐藏工具提示
 */
export function hideTooltip(): void {
  if (currentTooltip) {
    currentTooltip.remove()
    currentTooltip = null
  }
}

/**
 * 绑定工具提示到元素
 */
export function bindTooltip(element: HTMLElement, text: string): void {
  let timeoutId: number | null = null

  element.addEventListener('mouseenter', () => {
    // 延迟显示，避免快速划过时闪烁
    timeoutId = window.setTimeout(() => {
      showTooltip(element, text)
    }, 500)
  })

  element.addEventListener('mouseleave', () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    hideTooltip()
  })
}
