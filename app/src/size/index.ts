/**
 * 尺寸管理插件配置
 * 
 * 为应用提供完整的尺寸管理功能，包括：
 * - 多尺寸模式支持（small、medium、large、extra-large）
 * - 动态CSS变量生成
 * - 尺寸切换组件
 * - 响应式尺寸适配
 */

import { createSizeEnginePlugin } from '@ldesign/size'
import type { SizeMode } from '@ldesign/size'

/**
 * 创建尺寸管理插件
 *
 * 配置了完整的尺寸管理功能，包括预设尺寸、自动注入CSS变量、
 * 状态缓存和恢复等特性，支持尺寸状态持久化
 */
export const sizePlugin = createSizeEnginePlugin({
  // 基础配置
  name: 'size',
  version: '1.0.0',
  
  // 尺寸管理器配置
  prefix: '--ls', // CSS变量前缀
  defaultMode: 'medium', // 默认尺寸模式
  styleId: 'ldesign-size-variables', // 样式标签ID
  selector: ':root', // CSS选择器
  autoInject: true, // 自动注入CSS变量
  enableStorage: true, // 启用本地存储
  storageType: 'localStorage', // 存储类型
  enableTransition: true, // 启用过渡动画
  transitionDuration: '0.3s', // 过渡动画时长
  
  // 自定义尺寸配置（可选）
  customSizes: {
    // 可以在这里添加自定义尺寸配置
    // 例如：
    // 'compact': {
    //   fontSize: '12px',
    //   spacing: '6px',
    //   buttonHeight: '24px'
    // }
  },
  
  // 启用深度合并
  enableDeepMerge: true,
  
  // 尺寸变化回调
  onSizeChanged: async (previousMode: SizeMode, currentMode: SizeMode) => {
    // 已禁用调试日志输出
    
    // 添加尺寸切换的动画效果
    document.documentElement.style.setProperty('--size-transition', 'all 0.3s ease')
    
    // 延迟移除过渡效果，避免影响后续操作
    setTimeout(() => {
      document.documentElement.style.removeProperty('--size-transition')
    }, 300)
    
    // 这里可以添加尺寸切换后的自定义逻辑
    // 例如：通知其他系统、更新用户偏好设置等
  }
})

/**
 * 导出尺寸管理插件
 * 
 * 使用示例：
 * ```typescript
 * import { sizePlugin } from './size'
 * 
 * // 在engine中使用
 * const engine = createAndMountApp(App, '#app', {
 *   plugins: [sizePlugin]
 * })
 * ```
 */
export default sizePlugin
