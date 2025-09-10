/**
 * @file v-theme-animation 指令
 * @description 为元素添加主题动画的指令
 */

import type { Directive } from 'vue'
import type { ThemeAnimationDirectiveBinding } from '../types'

/**
 * 主题动画指令
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <div v-theme-animation="{ animation: 'bounce' }">
 *     内容
 *   </div>
 *   
 *   <!-- 悬停触发 -->
 *   <div v-theme-animation="{
 *     animation: 'pulse',
 *     trigger: 'hover',
 *     config: { duration: 1000, iterations: 3 }
 *   }">
 *     内容
 *   </div>
 * </template>
 * ```
 */
export const vThemeAnimation: Directive<HTMLElement, ThemeAnimationDirectiveBinding> = {
  mounted(el, binding) {
    const { animation, trigger = 'load', autoplay = false, config = {} } = binding.value || {}
    
    if (!animation) return
    
    // 存储配置
    ;(el as any)._themeAnimation = {
      animation,
      trigger,
      autoplay,
      config,
      isPlaying: false
    }
    
    // 播放动画函数
    const playAnimation = () => {
      const animationData = (el as any)._themeAnimation
      if (animationData.isPlaying) return
      
      animationData.isPlaying = true
      el.classList.add(`ldesign-animation-${animation}`)
      
      // 设置动画样式
      const duration = config.duration || 1000
      const iterations = config.iterations || 1
      const timingFunction = config.timingFunction || 'ease'
      
      el.style.animation = `${getAnimationKeyframes(animation)} ${duration}ms ${timingFunction} ${iterations === 'infinite' ? 'infinite' : iterations}`
      
      // 动画结束后清理
      if (iterations !== 'infinite') {
        setTimeout(() => {
          animationData.isPlaying = false
          el.classList.remove(`ldesign-animation-${animation}`)
          el.style.animation = ''
        }, duration * (typeof iterations === 'number' ? iterations : 1))
      }
    }
    
    // 停止动画函数
    const stopAnimation = () => {
      const animationData = (el as any)._themeAnimation
      if (!animationData.isPlaying) return
      
      animationData.isPlaying = false
      el.classList.remove(`ldesign-animation-${animation}`)
      el.style.animation = ''
    }
    
    // 存储动画控制函数
    ;(el as any)._playAnimation = playAnimation
    ;(el as any)._stopAnimation = stopAnimation
    
    // 根据触发条件设置事件监听
    switch (trigger) {
      case 'hover':
        el.addEventListener('mouseenter', playAnimation)
        el.addEventListener('mouseleave', stopAnimation)
        break
      case 'click':
        el.addEventListener('click', () => {
          const animationData = (el as any)._themeAnimation
          if (animationData.isPlaying) {
            stopAnimation()
          } else {
            playAnimation()
          }
        })
        break
      case 'load':
        if (autoplay) {
          // 延迟执行以确保元素已渲染
          setTimeout(playAnimation, 100)
        }
        break
    }
    
    // 添加动画样式
    addAnimationStyles()
  },
  
  updated(el, binding) {
    // 清理旧的事件监听器
    const oldData = (el as any)._themeAnimation
    if (oldData) {
      const { trigger: oldTrigger } = oldData
      const playAnimation = (el as any)._playAnimation
      const stopAnimation = (el as any)._stopAnimation
      
      if (oldTrigger === 'hover') {
        el.removeEventListener('mouseenter', playAnimation)
        el.removeEventListener('mouseleave', stopAnimation)
      } else if (oldTrigger === 'click') {
        el.removeEventListener('click', playAnimation)
      }
    }
    
    // 重新挂载
    vThemeAnimation.mounted!(el, binding, null as any, null as any)
  },
  
  unmounted(el) {
    const animationData = (el as any)._themeAnimation
    if (!animationData) return
    
    const { trigger } = animationData
    const playAnimation = (el as any)._playAnimation
    const stopAnimation = (el as any)._stopAnimation
    
    // 清理事件监听器
    if (trigger === 'hover') {
      el.removeEventListener('mouseenter', playAnimation)
      el.removeEventListener('mouseleave', stopAnimation)
    } else if (trigger === 'click') {
      el.removeEventListener('click', playAnimation)
    }
    
    // 停止动画
    stopAnimation()
    
    // 清理数据
    delete (el as any)._themeAnimation
    delete (el as any)._playAnimation
    delete (el as any)._stopAnimation
  }
}

/**
 * 获取动画关键帧
 */
function getAnimationKeyframes(animation: string): string {
  return `ldesign-${animation}`
}

/**
 * 添加动画样式
 */
function addAnimationStyles() {
  const styleId = 'ldesign-theme-animations'
  if (document.getElementById(styleId)) return
  
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    @keyframes ldesign-bounce {
      0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
      40%, 43% { transform: translate3d(0, -20px, 0); }
      70% { transform: translate3d(0, -10px, 0); }
      90% { transform: translate3d(0, -4px, 0); }
    }
    
    @keyframes ldesign-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    @keyframes ldesign-shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes ldesign-glow {
      0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
      50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
      100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
    }
    
    @keyframes ldesign-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes ldesign-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes ldesign-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes ldesign-slide-in {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
  `
  
  document.head.appendChild(style)
}
