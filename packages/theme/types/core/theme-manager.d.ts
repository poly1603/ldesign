import {
  ThemeManagerOptions,
  ThemeManagerInstance,
  ThemeConfig,
  DecorationConfig,
  ThemeEventType,
  ThemeEventListener,
  ThemeEventData,
} from './types.js'

/**
 * @ldesign/theme - 主题管理器
 *
 * 核心主题管理器，负责主题的切换、装饰和动画管理
 */

/**
 * 主题管理器实现
 */
declare class ThemeManager implements ThemeManagerInstance {
  private themes
  private currentTheme?
  private container
  private eventEmitter
  private colorThemeManager
  private resourceManager
  private decorationManager
  private animationManager
  private options
  private initialized
  constructor(options?: ThemeManagerOptions)
  /**
   * 初始化主题管理器
   */
  init(): Promise<void>
  /**
   * 设置主题
   */
  setTheme(name: string): Promise<void>
  /**
   * 获取主题配置
   */
  getTheme(name: string): ThemeConfig | undefined
  /**
   * 获取当前主题名称
   */
  getCurrentTheme(): string | undefined
  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): string[]
  /**
   * 添加主题
   */
  addTheme(theme: ThemeConfig): void
  /**
   * 移除主题
   */
  removeTheme(name: string): void
  /**
   * 添加装饰元素
   */
  addDecoration(decoration: DecorationConfig): void
  /**
   * 移除装饰元素
   */
  removeDecoration(id: string): void
  /**
   * 更新装饰元素
   */
  updateDecoration(id: string, updates: Partial<DecorationConfig>): void
  /**
   * 获取装饰元素列表
   */
  getDecorations(): DecorationConfig[]
  /**
   * 开始动画
   */
  startAnimation(name: string): void
  /**
   * 停止动画
   */
  stopAnimation(name: string): void
  /**
   * 暂停动画
   */
  pauseAnimation(name: string): void
  /**
   * 恢复动画
   */
  resumeAnimation(name: string): void
  /**
   * 预加载资源
   */
  preloadResources(theme: string): Promise<void>
  /**
   * 清理资源
   */
  clearResources(theme?: string): void
  /**
   * 添加事件监听器
   */
  on(event: ThemeEventType, listener: ThemeEventListener): void
  /**
   * 移除事件监听器
   */
  off(event: ThemeEventType, listener: ThemeEventListener): void
  /**
   * 发射事件
   */
  emit(
    event: ThemeEventType,
    data: Omit<ThemeEventData, 'type' | 'timestamp'>
  ): void
  /**
   * 销毁主题管理器
   */
  destroy(): void
  /**
   * 清理当前主题
   */
  private cleanupCurrentTheme
  /**
   * 设置自动激活
   */
  private setupAutoActivation
  /**
   * 检查是否在时间范围内
   */
  private isInTimeRange
  /**
   * 保存当前主题
   */
  private saveCurrentTheme
  /**
   * 获取存储对象
   */
  private getStorage
}
/**
 * 创建主题管理器实例
 */
declare function createThemeManager(
  options?: ThemeManagerOptions
): ThemeManagerInstance

export { ThemeManager, createThemeManager }
