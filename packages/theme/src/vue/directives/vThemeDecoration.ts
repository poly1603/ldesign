/**
 * @file v-theme-decoration 指令
 * @description 为元素添加主题装饰的指令
 */

import type { Directive } from 'vue'
import type { ThemeDecorationDirectiveBinding } from '../types'
import { generateWidgetId } from '../../utils'

/**
 * 主题装饰指令
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <div v-theme-decoration="{ decoration: 'snowflake' }">
 *     内容
 *   </div>
 *   
 *   <!-- 完整配置 -->
 *   <div v-theme-decoration="{
 *     decoration: 'heart',
 *     visible: true,
 *     position: 'top-right',
 *     config: {
 *       animation: { name: 'pulse', duration: 2000 }
 *     }
 *   }">
 *     内容
 *   </div>
 * </template>
 * ```
 */
export const vThemeDecoration: Directive<HTMLElement, ThemeDecorationDirectiveBinding> = {
  mounted(el, binding) {
    const { decoration, visible = true, position = 'top-right', config = {} } = binding.value || {}
    
    if (!decoration || !visible) return
    
    // 创建装饰元素
    const decorationEl = document.createElement('div')
    decorationEl.className = `ldesign-decoration ldesign-decoration-${decoration} ldesign-decoration-${position}`
    decorationEl.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 1000;
      ${getPositionStyles(position)}
    `
    
    // 设置装饰内容
    decorationEl.innerHTML = getDecorationContent(decoration)
    
    // 设置元素为相对定位
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }
    
    // 添加装饰元素
    el.appendChild(decorationEl)
    
    // 存储装饰元素引用
    ;(el as any)._themeDecoration = decorationEl
    
    // 应用动画
    if (config.animation) {
      decorationEl.style.animation = `${config.animation.name || 'pulse'} ${config.animation.duration || 2000}ms infinite`
    }
  },
  
  updated(el, binding) {
    const oldDecoration = (el as any)._themeDecoration
    if (oldDecoration) {
      oldDecoration.remove()
      delete (el as any)._themeDecoration
    }
    
    // 重新挂载
    vThemeDecoration.mounted!(el, binding, null as any, null as any)
  },
  
  unmounted(el) {
    const decoration = (el as any)._themeDecoration
    if (decoration) {
      decoration.remove()
      delete (el as any)._themeDecoration
    }
  }
}

/**
 * 获取位置样式
 */
function getPositionStyles(position: string): string {
  switch (position) {
    case 'top-left':
      return 'top: -10px; left: -10px;'
    case 'top-right':
      return 'top: -10px; right: -10px;'
    case 'bottom-left':
      return 'bottom: -10px; left: -10px;'
    case 'bottom-right':
      return 'bottom: -10px; right: -10px;'
    case 'center':
      return 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    default:
      return 'top: -10px; right: -10px;'
  }
}

/**
 * 获取装饰内容
 */
function getDecorationContent(decoration: string): string {
  const decorations: Record<string, string> = {
    snowflake: `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10,10)" stroke="#87CEEB" stroke-width="1.5" fill="none">
          <line x1="0" y1="-8" x2="0" y2="8"/>
          <line x1="-8" y1="0" x2="8" y2="0"/>
          <line x1="-6" y1="-6" x2="6" y2="6"/>
          <line x1="-6" y1="6" x2="6" y2="-6"/>
        </g>
      </svg>
    `,
    heart: `
      <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8,12 C8,12 2,8 2,5 C2,3 3,2 5,2 C6,2 8,3 8,5 C8,3 10,2 11,2 C13,2 14,3 14,5 C14,8 8,12 8,12 Z" 
              fill="#FF69B4"/>
      </svg>
    `,
    star: `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" fill="#FFD700"/>
      </svg>
    `,
    sparkle: `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(6,6)">
          <circle cx="0" cy="0" r="2" fill="#FFD700" opacity="0.8"/>
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#FFD700" stroke-width="1"/>
          <line x1="-5" y1="0" x2="5" y2="0" stroke="#FFD700" stroke-width="1"/>
        </g>
      </svg>
    `
  }
  
  return decorations[decoration] || decorations.sparkle
}
