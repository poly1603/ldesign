/**
 * React 组件库示例
 * 
 * 展示如何使用 @ldesign/builder 构建 React 组件库
 */

// 导出组件
export { default as Button } from './components/Button'
export { default as Input } from './components/Input'

// 导出类型
export type { ButtonProps } from './components/Button'
export type { InputProps } from './components/Input'

// 导出样式（用户可以选择性导入）
import './components/Button.css'
import './components/Input.css'

// 版本信息
export const version = '1.0.0'

// 工具函数
export const utils = {
  /**
   * 获取组件版本
   */
  getVersion(): string {
    return version
  },

  /**
   * 检查是否为 React 组件
   */
  isReactComponent(component: any): boolean {
    return (
      typeof component === 'function' ||
      (typeof component === 'object' && component !== null && component.$$typeof)
    )
  },

  /**
   * 合并类名
   */
  classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
  }
}
