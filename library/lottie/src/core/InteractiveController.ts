import type { ILottieInstance } from '../types'

/**
 * 交互式控制器配置
 */
export interface InteractiveControllerConfig {
  /** 实例 */
  instance: ILottieInstance
  /** 启用鼠标悬停 */
  enableHover?: boolean
  /** 启用点击播放/暂停 */
  enableClick?: boolean
  /** 启用滚动控制 */
  enableScroll?: boolean
  /** 滚动触发阈值 (0-1) */
  scrollThreshold?: number
  /** 启用拖拽控制进度 */
  enableDrag?: boolean
}

/**
 * 交互式控制器
 * 为动画添加鼠标和滚动交互
 */
export class InteractiveController {
  private instance: ILottieInstance
  private config: Required<InteractiveControllerConfig>
  private isDragging: boolean = false
  private scrollProgress: number = 0
  private cleanupFns: (() => void)[] = []

  constructor(config: InteractiveControllerConfig) {
    this.instance = config.instance
    this.config = {
      instance: config.instance,
      enableHover: config.enableHover ?? false,
      enableClick: config.enableClick ?? false,
      enableScroll: config.enableScroll ?? false,
      scrollThreshold: config.scrollThreshold ?? 0.1,
      enableDrag: config.enableDrag ?? false,
    }

    this.init()
  }

  /**
   * 初始化交互
   */
  private init(): void {
    if (!this.instance.container) {
      console.warn('[InteractiveController] No container element found')
      return
    }

    const container = this.instance.container

    // 鼠标悬停
    if (this.config.enableHover) {
      const onMouseEnter = () => this.instance.play()
      const onMouseLeave = () => this.instance.pause()

      container.addEventListener('mouseenter', onMouseEnter)
      container.addEventListener('mouseleave', onMouseLeave)

      this.cleanupFns.push(() => {
        container.removeEventListener('mouseenter', onMouseEnter)
        container.removeEventListener('mouseleave', onMouseLeave)
      })
    }

    // 点击切换
    if (this.config.enableClick) {
      const onClick = () => {
        if (this.instance.state === 'playing') {
          this.instance.pause()
        } else {
          this.instance.play()
        }
      }

      container.addEventListener('click', onClick)
      container.style.cursor = 'pointer'

      this.cleanupFns.push(() => {
        container.removeEventListener('click', onClick)
        container.style.cursor = ''
      })
    }

    // 滚动控制
    if (this.config.enableScroll) {
      this.setupScrollControl()
    }

    // 拖拽控制
    if (this.config.enableDrag) {
      this.setupDragControl()
    }
  }

  /**
   * 设置滚动控制
   */
  private setupScrollControl(): void {
    if (!this.instance.container) return

    const container = this.instance.container
    const rect = container.getBoundingClientRect()

    const onScroll = () => {
      const containerRect = container.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const threshold = viewportHeight * this.config.scrollThreshold

      // 计算容器在视口中的位置
      const containerTop = containerRect.top
      const containerBottom = containerRect.bottom

      // 计算滚动进度 (0-1)
      if (containerBottom < threshold || containerTop > viewportHeight - threshold) {
        // 容器不在视口中
        this.scrollProgress = 0
      } else if (containerTop <= threshold && containerBottom >= viewportHeight - threshold) {
        // 容器完全在视口中
        this.scrollProgress = 1
      } else {
        // 容器部分在视口中
        const visible = Math.min(containerBottom, viewportHeight) - Math.max(containerTop, 0)
        const total = containerRect.height
        this.scrollProgress = Math.max(0, Math.min(1, visible / total))
      }

      // 根据进度控制动画
      if (this.instance.animation) {
        const frame = Math.floor(this.scrollProgress * this.instance.animation.totalFrames)
        this.instance.goToAndStop(frame, true)
      }
    }

    window.addEventListener('scroll', onScroll)
    onScroll() // 初始化

    this.cleanupFns.push(() => {
      window.removeEventListener('scroll', onScroll)
    })
  }

  /**
   * 设置拖拽控制
   */
  private setupDragControl(): void {
    if (!this.instance.container) return

    const container = this.instance.container
    let startX: number = 0
    let startFrame: number = 0

    const onMouseDown = (e: MouseEvent) => {
      this.isDragging = true
      startX = e.clientX
      startFrame = this.instance.animation?.currentFrame || 0
      container.style.cursor = 'grabbing'
      this.instance.pause()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging || !this.instance.animation) return

      const deltaX = e.clientX - startX
      const rect = container.getBoundingClientRect()
      const progress = deltaX / rect.width
      const totalFrames = this.instance.animation.totalFrames
      const frame = Math.max(0, Math.min(totalFrames - 1, startFrame + progress * totalFrames))

      this.instance.goToAndStop(Math.floor(frame), true)
    }

    const onMouseUp = () => {
      this.isDragging = false
      container.style.cursor = 'grab'
    }

    container.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    container.style.cursor = 'grab'

    this.cleanupFns.push(() => {
      container.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      container.style.cursor = ''
    })
  }

  /**
   * 获取当前滚动进度
   */
  getScrollProgress(): number {
    return this.scrollProgress
  }

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.cleanupFns.forEach(fn => fn())
    this.cleanupFns = []
  }
}
