/**
 * 水印系统核心类
 */

import type {
  WatermarkConfig,
  WatermarkInstance,
  WatermarkInstanceState,
  CreateInstanceOptions,
  UpdateInstanceOptions,
  SecurityLevel,
  WatermarkEvent,
  EventListener,
  WatermarkEventType
} from '../types'

import { WatermarkError, WatermarkErrorCode, ErrorSeverity } from '../types/error'
import { ConfigManager } from './config-manager'
import { InstanceManager } from './instance-manager'
import { EventManager } from './event-manager'
import { ErrorManager } from './error-manager'
import { RendererFactory } from '../renderers/renderer-factory'
import { SecurityManager } from '../security/security-manager'
import { ResponsiveManager } from '../responsive/responsive-manager'
import { AnimationEngine } from '../animation/animation-engine'
import { generateId } from '../utils/id-generator'

/**
 * 水印系统核心类
 * 提供水印的创建、更新、销毁等核心功能
 */
export class WatermarkCore {
  private configManager: ConfigManager
  private instanceManager: InstanceManager
  private eventManager: EventManager
  private errorManager: ErrorManager
  private rendererFactory: RendererFactory
  private securityManager: SecurityManager
  private responsiveManager: ResponsiveManager
  private animationEngine: AnimationEngine
  private initialized = false

  constructor() {
    this.configManager = new ConfigManager()
    this.instanceManager = new InstanceManager()
    this.eventManager = new EventManager()
    this.errorManager = new ErrorManager()
    this.rendererFactory = new RendererFactory()
    this.securityManager = new SecurityManager()
    this.responsiveManager = new ResponsiveManager()
    this.animationEngine = new AnimationEngine()
    
    this.init()
  }

  /**
   * 初始化核心系统
   */
  private async init(): Promise<void> {
    try {
      // 初始化各个管理器
      await this.eventManager.init()
      await this.errorManager.init()
      await this.securityManager.init()
      await this.responsiveManager.init()
      await this.animationEngine.init()
      
      // 设置错误处理
      this.setupErrorHandling()
      
      // 设置事件监听
      this.setupEventListeners()
      
      this.initialized = true
      
      // 触发初始化完成事件
      await this.eventManager.emit({
        type: WatermarkEventType.CUSTOM,
        timestamp: Date.now(),
        customType: 'core:initialized',
        payload: { core: this }
      })
    } catch (error) {
      const watermarkError = new WatermarkError(
        'Failed to initialize WatermarkCore',
        WatermarkErrorCode.UNKNOWN_ERROR,
        ErrorSeverity.CRITICAL,
        { originalError: error as Error }
      )
      
      await this.errorManager.handleError(watermarkError)
      throw watermarkError
    }
  }

  /**
   * 创建水印实例
   */
  async create(
    config: WatermarkConfig,
    options: CreateInstanceOptions = {}
  ): Promise<WatermarkInstance> {
    this.ensureInitialized()
    
    try {
      // 验证配置
      const validatedConfig = await this.configManager.validate(config)
      
      // 生成实例ID
      const instanceId = generateId('watermark')
      
      // 获取容器元素
      const container = this.resolveContainer(validatedConfig.container)
      
      // 创建渲染器
      const renderer = this.rendererFactory.createRenderer(validatedConfig)
      
      // 创建渲染上下文
      const renderContext = {
        containerRect: container.getBoundingClientRect(),
        devicePixelRatio: window.devicePixelRatio || 1,
        supportsCanvas: !!document.createElement('canvas').getContext,
        supportsSVG: !!document.createElementNS,
        userAgent: navigator.userAgent,
        isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
      }
      
      // 创建实例对象
      const instance: WatermarkInstance = {
        id: instanceId,
        state: 'creating',
        config: validatedConfig,
        container,
        elements: [],
        renderer,
        renderContext,
        animations: new Map(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        visible: true,
        eventListeners: new Map(),
        cleanupFunctions: [],
        userData: options.userData
      }
      
      // 注册实例
      this.instanceManager.register(instance)
      
      // 设置安全管理器
      if (options.enableSecurity !== false && validatedConfig.security?.level !== 'none') {
        instance.securityManager = this.securityManager
        await this.securityManager.enableProtection(instance)
      }
      
      // 设置响应式管理器
      if (options.enableResponsive !== false && validatedConfig.responsive?.enabled) {
        instance.responsiveManager = this.responsiveManager
        await this.responsiveManager.observeContainer(instance)
      }
      
      // 渲染水印
      if (options.immediate !== false) {
        await this.renderInstance(instance)
      }
      
      // 设置动画
      if (options.enableAnimation !== false && validatedConfig.animation?.type !== 'none') {
        await this.setupAnimations(instance)
      }
      
      // 更新实例状态
      instance.state = 'active'
      instance.updatedAt = Date.now()
      
      // 触发创建完成事件
      await this.eventManager.emit({
        type: WatermarkEventType.INSTANCE_CREATED,
        timestamp: Date.now(),
        instanceId,
        instance
      })
      
      return instance
    } catch (error) {
      const watermarkError = new WatermarkError(
        'Failed to create watermark instance',
        WatermarkErrorCode.INSTANCE_CREATION_FAILED,
        ErrorSeverity.HIGH,
        { originalError: error as Error }
      )
      
      await this.errorManager.handleError(watermarkError)
      throw watermarkError
    }
  }

  /**
   * 更新水印实例
   */
  async update(
    instanceId: string,
    config: Partial<WatermarkConfig>,
    options: UpdateInstanceOptions = {}
  ): Promise<void> {
    this.ensureInitialized()
    
    const instance = this.instanceManager.get(instanceId)
    if (!instance) {
      throw new WatermarkError(
        `Instance with id ${instanceId} not found`,
        WatermarkErrorCode.INSTANCE_NOT_FOUND,
        ErrorSeverity.MEDIUM
      )
    }
    
    try {
      const oldConfig = { ...instance.config }
      instance.state = 'updating'
      
      // 合并配置
      const newConfig = await this.configManager.merge(instance.config, config)
      instance.config = newConfig
      
      // 重新渲染
      if (options.forceRerender || this.configManager.hasRenderingChanges(oldConfig, newConfig)) {
        await this.renderInstance(instance)
      }
      
      // 更新动画
      if (this.configManager.hasAnimationChanges(oldConfig, newConfig)) {
        if (!options.preserveAnimations) {
          await this.stopAnimations(instance)
        }
        await this.setupAnimations(instance)
      }
      
      // 更新安全设置
      if (this.configManager.hasSecurityChanges(oldConfig, newConfig)) {
        await this.updateSecurity(instance)
      }
      
      // 更新响应式设置
      if (this.configManager.hasResponsiveChanges(oldConfig, newConfig)) {
        await this.updateResponsive(instance)
      }
      
      instance.state = 'active'
      instance.updatedAt = Date.now()
      
      // 触发更新完成事件
      await this.eventManager.emit({
        type: WatermarkEventType.INSTANCE_UPDATED,
        timestamp: Date.now(),
        instanceId,
        instance
      })
    } catch (error) {
      instance.state = 'active' // 恢复状态
      
      const watermarkError = new WatermarkError(
        'Failed to update watermark instance',
        WatermarkErrorCode.INSTANCE_UPDATE_FAILED,
        ErrorSeverity.MEDIUM,
        { instanceId, originalError: error as Error }
      )
      
      await this.errorManager.handleError(watermarkError)
      throw watermarkError
    }
  }

  /**
   * 销毁水印实例
   */
  async destroy(instanceId: string): Promise<void> {
    this.ensureInitialized()
    
    const instance = this.instanceManager.get(instanceId)
    if (!instance) {
      return // 实例不存在，视为已销毁
    }
    
    try {
      instance.state = 'destroying'
      
      // 停止动画
      await this.stopAnimations(instance)
      
      // 清理安全监听
      if (instance.securityManager) {
        await this.securityManager.disableProtection(instance)
      }
      
      // 清理响应式监听
      if (instance.responsiveManager) {
        await this.responsiveManager.unobserveContainer(instance)
      }
      
      // 销毁渲染元素
      await instance.renderer.destroy(instance.elements)
      
      // 执行清理函数
      for (const cleanup of instance.cleanupFunctions) {
        try {
          cleanup()
        } catch (error) {
          console.warn('Cleanup function failed:', error)
        }
      }
      
      // 清理事件监听器
      instance.eventListeners.clear()
      
      instance.state = 'destroyed'
      
      // 注销实例
      this.instanceManager.unregister(instanceId)
      
      // 触发销毁完成事件
      await this.eventManager.emit({
        type: WatermarkEventType.INSTANCE_DESTROYED,
        timestamp: Date.now(),
        instanceId
      })
    } catch (error) {
      const watermarkError = new WatermarkError(
        'Failed to destroy watermark instance',
        WatermarkErrorCode.INSTANCE_DESTROY_FAILED,
        ErrorSeverity.MEDIUM,
        { instanceId, originalError: error as Error }
      )
      
      await this.errorManager.handleError(watermarkError)
      throw watermarkError
    }
  }

  /**
   * 获取实例
   */
  getInstance(instanceId: string): WatermarkInstance | undefined {
    return this.instanceManager.get(instanceId)
  }

  /**
   * 获取所有实例
   */
  getAllInstances(): WatermarkInstance[] {
    return this.instanceManager.getAll()
  }

  /**
   * 暂停实例
   */
  async pause(instanceId: string): Promise<void> {
    const instance = this.instanceManager.get(instanceId)
    if (!instance) return
    
    instance.state = 'paused'
    await this.pauseAnimations(instance)
  }

  /**
   * 恢复实例
   */
  async resume(instanceId: string): Promise<void> {
    const instance = this.instanceManager.get(instanceId)
    if (!instance) return
    
    instance.state = 'active'
    await this.resumeAnimations(instance)
  }

  /**
   * 显示实例
   */
  show(instanceId: string): void {
    const instance = this.instanceManager.get(instanceId)
    if (!instance) return
    
    instance.visible = true
    instance.elements.forEach(element => {
      element.style.display = ''
    })
  }

  /**
   * 隐藏实例
   */
  hide(instanceId: string): void {
    const instance = this.instanceManager.get(instanceId)
    if (!instance) return
    
    instance.visible = false
    instance.elements.forEach(element => {
      element.style.display = 'none'
    })
  }

  /**
   * 启用安全保护
   */
  async enableSecurity(instanceId: string, level: SecurityLevel): Promise<void> {
    const instance = this.instanceManager.get(instanceId)
    if (!instance) return
    
    instance.config.security = { ...instance.config.security, level }
    instance.securityManager = this.securityManager
    await this.securityManager.enableProtection(instance)
  }

  /**
   * 添加事件监听器
   */
  on<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void {
    this.eventManager.on(type, listener)
  }

  /**
   * 移除事件监听器
   */
  off<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void {
    this.eventManager.off(type, listener)
  }

  /**
   * 销毁核心系统
   */
  async dispose(): Promise<void> {
    if (!this.initialized) return
    
    // 销毁所有实例
    const instances = this.instanceManager.getAll()
    for (const instance of instances) {
      await this.destroy(instance.id)
    }
    
    // 清理各个管理器
    await this.animationEngine.dispose()
    await this.responsiveManager.dispose()
    await this.securityManager.dispose()
    await this.errorManager.dispose()
    await this.eventManager.dispose()
    
    this.initialized = false
  }

  // 私有方法

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new WatermarkError(
        'WatermarkCore is not initialized',
        WatermarkErrorCode.UNKNOWN_ERROR,
        ErrorSeverity.HIGH
      )
    }
  }

  private resolveContainer(container?: HTMLElement | string): HTMLElement {
    if (!container) {
      return document.body
    }
    
    if (typeof container === 'string') {
      const element = document.querySelector(container) as HTMLElement
      if (!element) {
        throw new WatermarkError(
          `Container element not found: ${container}`,
          WatermarkErrorCode.INVALID_CONTAINER,
          ErrorSeverity.HIGH
        )
      }
      return element
    }
    
    return container
  }

  private async renderInstance(instance: WatermarkInstance): Promise<void> {
    // 清理旧元素
    if (instance.elements.length > 0) {
      await instance.renderer.destroy(instance.elements)
      instance.elements = []
    }
    
    // 渲染新元素
    const elements = await instance.renderer.render(
      instance.config,
      instance.renderContext
    )
    
    instance.elements = elements
    
    // 添加到容器
    elements.forEach(element => {
      instance.container.appendChild(element)
    })
  }

  private async setupAnimations(instance: WatermarkInstance): Promise<void> {
    if (!instance.config.animation || instance.config.animation.type === 'none') {
      return
    }
    
    for (const element of instance.elements) {
      const animationId = await this.animationEngine.createAnimation(
        element,
        instance.config.animation
      )
      
      // 这里需要获取动画实例，但AnimationEngine接口需要完善
      // instance.animations.set(animationId, animationInstance)
    }
  }

  private async stopAnimations(instance: WatermarkInstance): Promise<void> {
    for (const [animationId] of instance.animations) {
      await this.animationEngine.stopAnimation(animationId)
    }
    instance.animations.clear()
  }

  private async pauseAnimations(instance: WatermarkInstance): Promise<void> {
    for (const [animationId] of instance.animations) {
      await this.animationEngine.pauseAnimation(animationId)
    }
  }

  private async resumeAnimations(instance: WatermarkInstance): Promise<void> {
    for (const [animationId] of instance.animations) {
      await this.animationEngine.resumeAnimation(animationId)
    }
  }

  private async updateSecurity(instance: WatermarkInstance): Promise<void> {
    if (instance.securityManager) {
      await this.securityManager.updateProtection(instance)
    }
  }

  private async updateResponsive(instance: WatermarkInstance): Promise<void> {
    if (instance.responsiveManager) {
      await this.responsiveManager.updateObserver(instance)
    }
  }

  private setupErrorHandling(): void {
    // 设置全局错误处理
    window.addEventListener('error', (event) => {
      const error = new WatermarkError(
        event.message,
        WatermarkErrorCode.UNKNOWN_ERROR,
        ErrorSeverity.MEDIUM,
        { context: { filename: event.filename, lineno: event.lineno } }
      )
      this.errorManager.handleError(error)
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      const error = new WatermarkError(
        'Unhandled promise rejection',
        WatermarkErrorCode.UNKNOWN_ERROR,
        ErrorSeverity.MEDIUM,
        { originalError: event.reason }
      )
      this.errorManager.handleError(error)
    })
  }

  private setupEventListeners(): void {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      const instances = this.instanceManager.getAll()
      instances.forEach(instance => {
        if (document.hidden) {
          this.pauseAnimations(instance)
        } else {
          this.resumeAnimations(instance)
        }
      })
    })
  }
}