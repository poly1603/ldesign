import type { FlowchartData, FlowchartNode, Position, Bounds } from '../core/types'

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

/**
 * 屏幕方向
 */
export type ScreenOrientation = 'portrait' | 'landscape'

/**
 * 触控手势类型
 */
export interface TouchGesture {
  type: 'tap' | 'doubleTap' | 'longPress' | 'pinch' | 'pan' | 'swipe'
  startPosition: Position
  endPosition?: Position
  scale?: number // 缩放比例
  duration: number // 持续时间
  fingerCount: number // 手指数量
}

/**
 * 移动端配置
 */
export interface MobileConfig {
  // 响应式断点
  breakpoints: {
    mobile: number // 小于此宽度为移动端
    tablet: number // 小于此宽度为平板
    desktop: number // 大于等于此宽度为桌面
  }
  
  // 触控配置
  touch: {
    tapTimeout: number // 点击超时时间(ms)
    doubleTapTimeout: number // 双击超时时间(ms)
    longPressTimeout: number // 长按超时时间(ms)
    pinchThreshold: number // 缩放手势阈值
    panThreshold: number // 拖拽手势阈值
    swipeThreshold: number // 滑动手势阈值
    swipeVelocity: number // 滑动速度阈值
  }
  
  // 移动端UI配置
  ui: {
    minTouchTarget: number // 最小触控目标大小
    nodeMinSize: { width: number; height: number }
    edgeMinWidth: number
    fontSize: {
      min: number
      max: number
      scale: number // 字体缩放比例
    }
    spacing: {
      node: number // 节点间距
      edge: number // 连线间距
      margin: number // 边距
    }
  }
  
  // 性能优化配置
  performance: {
    maxVisibleNodes: number // 最大可见节点数
    renderDistance: number // 渲染距离
    enableVirtualization: boolean // 启用虚拟化
    debounceTime: number // 防抖时间
    throttleTime: number // 节流时间
  }
  
  // 可访问性配置
  accessibility: {
    enabled: boolean
    announceChanges: boolean // 宣布变更
    keyboardNavigation: boolean // 键盘导航
    screenReaderSupport: boolean // 屏幕阅读器支持
    highContrast: boolean // 高对比度模式
    reducedMotion: boolean // 减少动画
  }
}

/**
 * 视口信息
 */
export interface ViewportInfo {
  width: number
  height: number
  devicePixelRatio: number
  orientation: ScreenOrientation
  deviceType: DeviceType
  isTouch: boolean
  supportedGestures: string[]
}

/**
 * 自适应布局结果
 */
export interface ResponsiveLayoutResult {
  nodes: FlowchartNode[]
  viewBox: Bounds
  scale: number
  transforms: {
    nodeSize: number // 节点大小调整比例
    fontSize: number // 字体大小调整比例  
    spacing: number // 间距调整比例
    strokeWidth: number // 线条宽度调整比例
  }
  recommendations: string[] // 布局建议
}

/**
 * 手势识别结果
 */
export interface GestureRecognitionResult {
  gesture: TouchGesture
  target?: {
    type: 'node' | 'edge' | 'canvas'
    id?: string
    position?: Position
  }
  action: 'select' | 'move' | 'zoom' | 'pan' | 'contextMenu' | 'none'
  preventDefault: boolean
}

/**
 * 移动端适配服务
 */
export class MobileAdapterService {
  private config: MobileConfig
  private viewportInfo: ViewportInfo
  private touchHistory: TouchEvent[] = []
  private activeGestures = new Map<number, TouchGesture>()
  private resizeObserver?: ResizeObserver
  private mediaQueryList?: MediaQueryList
  
  constructor(config?: Partial<MobileConfig>) {
    this.config = {
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
      },
      
      touch: {
        tapTimeout: 300,
        doubleTapTimeout: 300,
        longPressTimeout: 500,
        pinchThreshold: 10,
        panThreshold: 10,
        swipeThreshold: 30,
        swipeVelocity: 0.3
      },
      
      ui: {
        minTouchTarget: 44, // iOS推荐的最小触控目标
        nodeMinSize: { width: 60, height: 40 },
        edgeMinWidth: 2,
        fontSize: {
          min: 10,
          max: 24,
          scale: 1.2
        },
        spacing: {
          node: 80,
          edge: 20,
          margin: 20
        }
      },
      
      performance: {
        maxVisibleNodes: 50,
        renderDistance: 1000,
        enableVirtualization: true,
        debounceTime: 100,
        throttleTime: 16
      },
      
      accessibility: {
        enabled: true,
        announceChanges: true,
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: false,
        reducedMotion: false
      },
      
      ...config
    }
    
    this.viewportInfo = this.detectViewport()
    this.setupEventListeners()
    this.setupMediaQueries()
  }

  /**
   * 检测视口信息
   */
  detectViewport(): ViewportInfo {
    const width = window.innerWidth
    const height = window.innerHeight
    const devicePixelRatio = window.devicePixelRatio || 1
    
    // 检测设备类型
    let deviceType: DeviceType = 'desktop'
    if (width < this.config.breakpoints.mobile) {
      deviceType = 'mobile'
    } else if (width < this.config.breakpoints.tablet) {
      deviceType = 'tablet'
    }
    
    // 检测屏幕方向
    const orientation: ScreenOrientation = width > height ? 'landscape' : 'portrait'
    
    // 检测触控支持
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    // 支持的手势
    const supportedGestures = ['tap', 'doubleTap', 'longPress']
    if (isTouch) {
      supportedGestures.push('pinch', 'pan', 'swipe')
    }
    
    return {
      width,
      height,
      devicePixelRatio,
      orientation,
      deviceType,
      isTouch,
      supportedGestures
    }
  }

  /**
   * 自适应布局调整
   */
  adaptLayoutForDevice(
    flowchartData: FlowchartData,
    containerSize: { width: number; height: number }
  ): ResponsiveLayoutResult {
    const { deviceType, orientation } = this.viewportInfo
    const nodes = [...flowchartData.nodes]
    
    // 计算缩放比例
    const scale = this.calculateOptimalScale(nodes, containerSize)
    
    // 调整节点尺寸和位置
    const transforms = this.calculateTransforms(deviceType, scale)
    const adaptedNodes = this.adaptNodes(nodes, transforms)
    
    // 计算视口
    const viewBox = this.calculateViewBox(adaptedNodes, containerSize, scale)
    
    // 生成建议
    const recommendations = this.generateLayoutRecommendations(
      deviceType,
      orientation,
      adaptedNodes,
      containerSize
    )
    
    return {
      nodes: adaptedNodes,
      viewBox,
      scale,
      transforms,
      recommendations
    }
  }

  /**
   * 手势识别
   */
  recognizeGesture(touchEvent: TouchEvent): GestureRecognitionResult | null {
    this.touchHistory.push(touchEvent)
    
    // 清理过期的触控历史
    const now = Date.now()
    this.touchHistory = this.touchHistory.filter(
      event => now - event.timeStamp < 1000
    )
    
    const touches = Array.from(touchEvent.touches)
    
    // 单指手势
    if (touches.length === 1) {
      return this.recognizeSingleTouchGesture(touchEvent, touches[0])
    }
    
    // 双指手势
    if (touches.length === 2) {
      return this.recognizeTwoFingerGesture(touchEvent, touches)
    }
    
    // 多指手势（暂不支持）
    return null
  }

  /**
   * 优化触控目标大小
   */
  optimizeTouchTargets(nodes: FlowchartNode[]): FlowchartNode[] {
    const minSize = this.config.ui.minTouchTarget
    
    return nodes.map(node => {
      const currentWidth = node.size?.width || 100
      const currentHeight = node.size?.height || 60
      
      // 确保触控目标足够大
      const optimizedWidth = Math.max(currentWidth, minSize)
      const optimizedHeight = Math.max(currentHeight, minSize)
      
      return {
        ...node,
        size: {
          width: optimizedWidth,
          height: optimizedHeight
        }
      }
    })
  }

  /**
   * 启用可访问性功能
   */
  enableAccessibility(container: HTMLElement): void {
    if (!this.config.accessibility.enabled) return
    
    // 设置ARIA属性
    container.setAttribute('role', 'application')
    container.setAttribute('aria-label', '流程图编辑器')
    
    // 键盘导航支持
    if (this.config.accessibility.keyboardNavigation) {
      this.setupKeyboardNavigation(container)
    }
    
    // 屏幕阅读器支持
    if (this.config.accessibility.screenReaderSupport) {
      this.setupScreenReaderSupport(container)
    }
    
    // 高对比度模式
    if (this.config.accessibility.highContrast) {
      container.classList.add('high-contrast')
    }
    
    // 减少动画
    if (this.config.accessibility.reducedMotion) {
      container.classList.add('reduced-motion')
    }
  }

  /**
   * 性能优化：虚拟化渲染
   */
  getVisibleNodes(
    nodes: FlowchartNode[],
    viewBox: Bounds,
    scale: number
  ): FlowchartNode[] {
    if (!this.config.performance.enableVirtualization) {
      return nodes
    }
    
    const renderDistance = this.config.performance.renderDistance
    const maxVisible = this.config.performance.maxVisibleNodes
    
    // 计算可见区域
    const visibleArea = {
      left: viewBox.left - renderDistance,
      top: viewBox.top - renderDistance,
      right: viewBox.left + viewBox.width + renderDistance,
      bottom: viewBox.top + viewBox.height + renderDistance
    }
    
    // 筛选可见节点
    const visibleNodes = nodes.filter(node => {
      const nodeWidth = (node.size?.width || 100) * scale
      const nodeHeight = (node.size?.height || 60) * scale
      
      return !(
        node.position.x + nodeWidth < visibleArea.left ||
        node.position.x > visibleArea.right ||
        node.position.y + nodeHeight < visibleArea.top ||
        node.position.y > visibleArea.bottom
      )
    })
    
    // 限制最大数量
    return visibleNodes.slice(0, maxVisible)
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<MobileConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.viewportInfo = this.detectViewport()
  }

  /**
   * 获取当前设备信息
   */
  getDeviceInfo(): ViewportInfo {
    return { ...this.viewportInfo }
  }

  /**
   * 计算最优缩放比例
   */
  private calculateOptimalScale(
    nodes: FlowchartNode[],
    containerSize: { width: number; height: number }
  ): number {
    if (nodes.length === 0) return 1
    
    // 计算内容边界
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity
    
    nodes.forEach(node => {
      const width = node.size?.width || 100
      const height = node.size?.height || 60
      
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + width)
      maxY = Math.max(maxY, node.position.y + height)
    })
    
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    
    // 计算缩放比例（保留边距）
    const margin = this.config.ui.spacing.margin * 2
    const scaleX = (containerSize.width - margin) / contentWidth
    const scaleY = (containerSize.height - margin) / contentHeight
    
    // 选择较小的缩放比例以确保内容完全可见
    const scale = Math.min(scaleX, scaleY, 1) // 最大不超过1
    
    // 移动端额外缩小
    if (this.viewportInfo.deviceType === 'mobile') {
      return Math.min(scale, 0.8)
    }
    
    return Math.max(scale, 0.3) // 最小不小于0.3
  }

  /**
   * 计算变换比例
   */
  private calculateTransforms(deviceType: DeviceType, scale: number): ResponsiveLayoutResult['transforms'] {
    let nodeSize = 1
    let fontSize = 1
    let spacing = 1
    let strokeWidth = 1
    
    switch (deviceType) {
      case 'mobile':
        nodeSize = 1.2 // 移动端节点稍大
        fontSize = this.config.ui.fontSize.scale
        spacing = 1.3 // 增加间距
        strokeWidth = 1.5 // 线条更粗
        break
      case 'tablet':
        nodeSize = 1.1
        fontSize = 1.1
        spacing = 1.1
        strokeWidth = 1.2
        break
      case 'desktop':
      default:
        // 桌面端保持默认
        break
    }
    
    return {
      nodeSize: nodeSize * scale,
      fontSize: fontSize * scale,
      spacing: spacing * scale,
      strokeWidth: strokeWidth * scale
    }
  }

  /**
   * 调整节点
   */
  private adaptNodes(
    nodes: FlowchartNode[],
    transforms: ResponsiveLayoutResult['transforms']
  ): FlowchartNode[] {
    return nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x * transforms.spacing,
        y: node.position.y * transforms.spacing
      },
      size: {
        width: (node.size?.width || 100) * transforms.nodeSize,
        height: (node.size?.height || 60) * transforms.nodeSize
      }
    }))
  }

  /**
   * 计算视口边界
   */
  private calculateViewBox(
    nodes: FlowchartNode[],
    containerSize: { width: number; height: number },
    scale: number
  ): Bounds {
    if (nodes.length === 0) {
      return {
        left: 0,
        top: 0,
        width: containerSize.width,
        height: containerSize.height
      }
    }
    
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity
    
    nodes.forEach(node => {
      const width = node.size?.width || 100
      const height = node.size?.height || 60
      
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + width)
      maxY = Math.max(maxY, node.position.y + height)
    })
    
    const margin = this.config.ui.spacing.margin
    
    return {
      left: minX - margin,
      top: minY - margin,
      width: maxX - minX + margin * 2,
      height: maxY - minY + margin * 2
    }
  }

  /**
   * 生成布局建议
   */
  private generateLayoutRecommendations(
    deviceType: DeviceType,
    orientation: ScreenOrientation,
    nodes: FlowchartNode[],
    containerSize: { width: number; height: number }
  ): string[] {
    const recommendations: string[] = []
    
    if (deviceType === 'mobile') {
      recommendations.push('建议使用垂直布局以适应移动端屏幕')
      
      if (orientation === 'portrait') {
        recommendations.push('竖屏模式下建议简化节点内容')
      }
      
      if (nodes.length > 10) {
        recommendations.push('节点数量较多，建议使用分页或折叠显示')
      }
    }
    
    if (deviceType === 'tablet') {
      recommendations.push('平板设备建议使用中等密度布局')
    }
    
    // 检查节点密度
    const density = nodes.length / (containerSize.width * containerSize.height / 10000)
    if (density > 0.5) {
      recommendations.push('节点密度较高，建议增加间距或缩放')
    }
    
    return recommendations
  }

  /**
   * 识别单指手势
   */
  private recognizeSingleTouchGesture(
    event: TouchEvent,
    touch: Touch
  ): GestureRecognitionResult | null {
    const now = Date.now()
    const position = { x: touch.clientX, y: touch.clientY }
    
    switch (event.type) {
      case 'touchstart': {
        // 记录手势开始
        const gesture: TouchGesture = {
          type: 'tap',
          startPosition: position,
          duration: 0,
          fingerCount: 1
        }
        
        this.activeGestures.set(touch.identifier, gesture)
        
        // 设置长按检测
        setTimeout(() => {
          const activeGesture = this.activeGestures.get(touch.identifier)
          if (activeGesture && now - event.timeStamp >= this.config.touch.longPressTimeout) {
            activeGesture.type = 'longPress'
          }
        }, this.config.touch.longPressTimeout)
        
        return null
      }
      
      case 'touchmove': {
        const activeGesture = this.activeGestures.get(touch.identifier)
        if (!activeGesture) return null
        
        const deltaX = position.x - activeGesture.startPosition.x
        const deltaY = position.y - activeGesture.startPosition.y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        
        if (distance > this.config.touch.panThreshold) {
          activeGesture.type = 'pan'
          activeGesture.endPosition = position
        }
        
        return {
          gesture: activeGesture,
          action: activeGesture.type === 'pan' ? 'pan' : 'none',
          preventDefault: activeGesture.type === 'pan'
        }
      }
      
      case 'touchend': {
        const activeGesture = this.activeGestures.get(touch.identifier)
        if (!activeGesture) return null
        
        activeGesture.duration = now - event.timeStamp
        activeGesture.endPosition = position
        
        this.activeGestures.delete(touch.identifier)
        
        // 判断手势类型
        let action: GestureRecognitionResult['action'] = 'none'
        
        switch (activeGesture.type) {
          case 'tap':
            action = 'select'
            break
          case 'longPress':
            action = 'contextMenu'
            break
          case 'pan':
            action = 'move'
            break
        }
        
        return {
          gesture: activeGesture,
          action,
          preventDefault: action !== 'none'
        }
      }
      
      default:
        return null
    }
  }

  /**
   * 识别双指手势
   */
  private recognizeTwoFingerGesture(
    event: TouchEvent,
    touches: Touch[]
  ): GestureRecognitionResult | null {
    if (touches.length !== 2) return null
    
    const touch1 = touches[0]
    const touch2 = touches[1]
    
    // 计算双指中心点
    const centerX = (touch1.clientX + touch2.clientX) / 2
    const centerY = (touch1.clientY + touch2.clientY) / 2
    const centerPosition = { x: centerX, y: centerY }
    
    // 计算双指距离
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    
    switch (event.type) {
      case 'touchstart': {
        const gesture: TouchGesture = {
          type: 'pinch',
          startPosition: centerPosition,
          duration: 0,
          fingerCount: 2,
          scale: 1
        }
        
        this.activeGestures.set(touch1.identifier, gesture)
        return null
      }
      
      case 'touchmove': {
        const activeGesture = this.activeGestures.get(touch1.identifier)
        if (!activeGesture) return null
        
        // 更新缩放比例
        const startDistance = 100 // 假设的初始距离
        activeGesture.scale = distance / startDistance
        activeGesture.endPosition = centerPosition
        
        return {
          gesture: activeGesture,
          action: 'zoom',
          preventDefault: true
        }
      }
      
      case 'touchend': {
        const activeGesture = this.activeGestures.get(touch1.identifier)
        if (!activeGesture) return null
        
        this.activeGestures.delete(touch1.identifier)
        
        return {
          gesture: activeGesture,
          action: 'zoom',
          preventDefault: true
        }
      }
      
      default:
        return null
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听窗口大小变化
    this.resizeObserver = new ResizeObserver((entries) => {
      this.viewportInfo = this.detectViewport()
    })
    
    if (document.body) {
      this.resizeObserver.observe(document.body)
    }
    
    // 监听方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.viewportInfo = this.detectViewport()
      }, 100) // 延迟一下等待方向变化完成
    })
  }

  /**
   * 设置媒体查询
   */
  private setupMediaQueries(): void {
    // 高对比度模式检测
    this.mediaQueryList = window.matchMedia('(prefers-contrast: high)')
    this.mediaQueryList.addListener((e) => {
      this.config.accessibility.highContrast = e.matches
    })
    
    // 减少动画检测
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionQuery.addListener((e) => {
      this.config.accessibility.reducedMotion = e.matches
    })
  }

  /**
   * 设置键盘导航
   */
  private setupKeyboardNavigation(container: HTMLElement): void {
    container.setAttribute('tabindex', '0')
    
    container.addEventListener('keydown', (event) => {
      const { key, ctrlKey, metaKey, shiftKey } = event
      
      switch (key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // 方向键导航
          event.preventDefault()
          this.handleArrowKeyNavigation(key, shiftKey)
          break
          
        case 'Enter':
        case ' ':
          // 选择/激活
          event.preventDefault()
          this.handleActivation()
          break
          
        case 'Escape':
          // 取消选择
          event.preventDefault()
          this.handleEscape()
          break
          
        case 'Tab':
          // Tab导航
          this.handleTabNavigation(shiftKey)
          break
          
        default:
          // 其他快捷键
          if (ctrlKey || metaKey) {
            this.handleShortcuts(key, shiftKey)
          }
          break
      }
    })
  }

  /**
   * 设置屏幕阅读器支持
   */
  private setupScreenReaderSupport(container: HTMLElement): void {
    // 创建实时区域用于宣布变更
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'
    
    container.appendChild(liveRegion)
    
    // 存储引用以便后续使用
    ;(container as any)._liveRegion = liveRegion
  }

  /**
   * 宣布变更给屏幕阅读器
   */
  announceChange(message: string, container: HTMLElement): void {
    if (!this.config.accessibility.announceChanges) return
    
    const liveRegion = (container as any)._liveRegion
    if (liveRegion) {
      liveRegion.textContent = message
    }
  }

  // 键盘导航处理方法的简化实现
  private handleArrowKeyNavigation(key: string, shiftKey: boolean): void {
    // 实现方向键导航逻辑
    console.log(`Arrow navigation: ${key}, shift: ${shiftKey}`)
  }

  private handleActivation(): void {
    // 实现激活逻辑
    console.log('Activation')
  }

  private handleEscape(): void {
    // 实现取消逻辑
    console.log('Escape')
  }

  private handleTabNavigation(shiftKey: boolean): void {
    // 实现Tab导航逻辑
    console.log(`Tab navigation, shift: ${shiftKey}`)
  }

  private handleShortcuts(key: string, shiftKey: boolean): void {
    // 实现快捷键逻辑
    console.log(`Shortcut: ${key}, shift: ${shiftKey}`)
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    
    if (this.mediaQueryList) {
      this.mediaQueryList.removeListener(() => {})
    }
    
    this.activeGestures.clear()
    this.touchHistory = []
  }
}

// 导出服务实例
export const mobileAdapterService = new MobileAdapterService()

// 导出类型
export type {
  DeviceType,
  ScreenOrientation,
  TouchGesture,
  MobileConfig,
  ViewportInfo,
  ResponsiveLayoutResult,
  GestureRecognitionResult
}
