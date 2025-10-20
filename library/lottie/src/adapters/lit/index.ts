/**
 * Lit (Web Components) 适配器
 * 标准 Web Components 实现
 */

export { LottieElement } from './LottieElement'
export { LottiePlayerElement } from './LottiePlayerElement'

// 自动注册自定义元素
export function registerLottieElements(prefix = 'lottie') {
  if (!customElements.get(`${prefix}-animation`)) {
    import('./LottieElement').then(({ LottieElement }) => {
      customElements.define(`${prefix}-animation`, LottieElement)
    })
  }
  
  if (!customElements.get(`${prefix}-player`)) {
    import('./LottiePlayerElement').then(({ LottiePlayerElement }) => {
      customElements.define(`${prefix}-player`, LottiePlayerElement)
    })
  }
}

// 默认注册
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  registerLottieElements()
}


