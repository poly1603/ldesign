/**
 * 粒子效果实现
 * 支持雨滴、雪花、流星等多种粒子效果
 */

import { BaseEffect } from './BaseEffect'
import type { ParticleEffectOptions } from '../types'
import { randomColor } from '../utils'

/**
 * 粒子对象
 */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

/**
 * 粒子效果类
 * 实现各种炫酷的粒子动画效果
 */
export class ParticleEffect extends BaseEffect {
  /** 粒子数组 */
  private particles: Particle[] = []
  
  /** Canvas元素 */
  private canvas: HTMLCanvasElement | null = null
  
  /** Canvas上下文 */
  private ctx: CanvasRenderingContext2D | null = null
  
  /** 效果配置 */
  private particleOptions: ParticleEffectOptions

  constructor(id: string, options: ParticleEffectOptions) {
    super(id, 'particles', options)
    this.particleOptions = {
      type: 'rain',
      count: 100,
      size: 2,
      color: '#ffffff',
      speed: 5,
      intensity: 0.5,
      ...options
    }
  }

  /**
   * 初始化粒子效果
   */
  protected async onInitialize(): Promise<void> {
    // 创建Canvas元素
    this.createCanvas()
    
    // 初始化粒子
    this.initParticles()
    
    // 监听地图变化
    this.bindMapEvents()
  }

  /**
   * 创建Canvas元素
   */
  private createCanvas(): void {
    if (!this.container) return

    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `
    
    this.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    
    // 设置Canvas尺寸
    this.resizeCanvas()
  }

  /**
   * 调整Canvas尺寸
   */
  private resizeCanvas(): void {
    if (!this.canvas || !this.container) return

    const { width, height } = this.getMapSize()
    
    // 设置Canvas实际尺寸
    this.canvas.width = width * window.devicePixelRatio
    this.canvas.height = height * window.devicePixelRatio
    
    // 设置Canvas显示尺寸
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    
    // 缩放上下文以适应高DPI屏幕
    if (this.ctx) {
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
  }

  /**
   * 初始化粒子
   */
  private initParticles(): void {
    this.particles = []
    const { count } = this.particleOptions
    
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle())
    }
  }

  /**
   * 创建单个粒子
   */
  private createParticle(): Particle {
    const { width, height } = this.getMapSize()
    const { type, size, color, speed } = this.particleOptions
    
    const particle: Particle = {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      size: size + Math.random() * size,
      color: color === 'random' ? randomColor() : color,
      opacity: 0.5 + Math.random() * 0.5,
      life: 0,
      maxLife: 100 + Math.random() * 100
    }
    
    // 根据粒子类型设置速度
    switch (type) {
      case 'rain':
        particle.vx = -1 + Math.random() * 2
        particle.vy = speed + Math.random() * speed
        particle.y = -particle.size
        break
        
      case 'snow':
        particle.vx = -2 + Math.random() * 4
        particle.vy = 1 + Math.random() * 3
        particle.y = -particle.size
        break
        
      case 'meteor':
        particle.vx = speed + Math.random() * speed
        particle.vy = speed * 0.5 + Math.random() * speed * 0.5
        particle.x = -particle.size
        particle.y = Math.random() * height * 0.3
        break
        
      default:
        particle.vx = -speed + Math.random() * speed * 2
        particle.vy = speed + Math.random() * speed
        break
    }
    
    return particle
  }

  /**
   * 更新粒子状态
   */
  private updateParticles(): void {
    const { width, height } = this.getMapSize()
    const { intensity, type } = this.particleOptions
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      
      // 更新位置
      particle.x += particle.vx * intensity
      particle.y += particle.vy * intensity
      
      // 更新生命周期
      particle.life++
      
      // 添加一些随机扰动
      if (type === 'snow') {
        particle.vx += (Math.random() - 0.5) * 0.1
      }
      
      // 检查粒子是否超出边界或生命周期结束
      const outOfBounds = 
        particle.x > width + particle.size ||
        particle.y > height + particle.size ||
        particle.x < -particle.size ||
        particle.y < -particle.size
      
      const lifeCycleEnd = particle.life >= particle.maxLife
      
      if (outOfBounds || lifeCycleEnd) {
        // 重置粒子
        this.resetParticle(particle)
      }
    }
  }

  /**
   * 重置粒子
   */
  private resetParticle(particle: Particle): void {
    const { width, height } = this.getMapSize()
    const { type, size, color, speed } = this.particleOptions
    
    particle.life = 0
    particle.size = size + Math.random() * size
    particle.color = color === 'random' ? randomColor() : color
    particle.opacity = 0.5 + Math.random() * 0.5
    
    switch (type) {
      case 'rain':
        particle.x = Math.random() * width
        particle.y = -particle.size
        particle.vx = -1 + Math.random() * 2
        particle.vy = speed + Math.random() * speed
        break
        
      case 'snow':
        particle.x = Math.random() * width
        particle.y = -particle.size
        particle.vx = -2 + Math.random() * 4
        particle.vy = 1 + Math.random() * 3
        break
        
      case 'meteor':
        particle.x = -particle.size
        particle.y = Math.random() * height * 0.3
        particle.vx = speed + Math.random() * speed
        particle.vy = speed * 0.5 + Math.random() * speed * 0.5
        break
        
      default:
        particle.x = Math.random() * width
        particle.y = -particle.size
        particle.vx = -speed + Math.random() * speed * 2
        particle.vy = speed + Math.random() * speed
        break
    }
  }

  /**
   * 渲染粒子
   */
  private renderParticles(): void {
    if (!this.ctx || !this.canvas) return

    const { width, height } = this.getMapSize()
    const { type } = this.particleOptions
    
    // 清空画布
    this.ctx.clearRect(0, 0, width, height)
    
    // 渲染每个粒子
    for (const particle of this.particles) {
      this.ctx.save()
      
      // 设置透明度
      this.ctx.globalAlpha = particle.opacity * (this.options.opacity || 1)
      
      // 设置颜色
      this.ctx.fillStyle = particle.color
      this.ctx.strokeStyle = particle.color
      
      // 根据类型渲染不同形状
      switch (type) {
        case 'rain':
          this.renderRainDrop(particle)
          break
          
        case 'snow':
          this.renderSnowFlake(particle)
          break
          
        case 'meteor':
          this.renderMeteor(particle)
          break
          
        default:
          this.renderCircle(particle)
          break
      }
      
      this.ctx.restore()
    }
  }

  /**
   * 渲染雨滴
   */
  private renderRainDrop(particle: Particle): void {
    if (!this.ctx) return
    
    this.ctx.beginPath()
    this.ctx.moveTo(particle.x, particle.y)
    this.ctx.lineTo(particle.x + particle.vx * 2, particle.y + particle.vy * 2)
    this.ctx.lineWidth = particle.size
    this.ctx.lineCap = 'round'
    this.ctx.stroke()
  }

  /**
   * 渲染雪花
   */
  private renderSnowFlake(particle: Particle): void {
    if (!this.ctx) return
    
    this.ctx.beginPath()
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    this.ctx.fill()
  }

  /**
   * 渲染流星
   */
  private renderMeteor(particle: Particle): void {
    if (!this.ctx) return
    
    const gradient = this.ctx.createLinearGradient(
      particle.x, particle.y,
      particle.x - particle.vx * 3, particle.y - particle.vy * 3
    )
    gradient.addColorStop(0, particle.color)
    gradient.addColorStop(1, 'transparent')
    
    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    this.ctx.fill()
    
    // 绘制尾迹
    this.ctx.beginPath()
    this.ctx.moveTo(particle.x, particle.y)
    this.ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5)
    this.ctx.lineWidth = particle.size * 0.5
    this.ctx.lineCap = 'round'
    this.ctx.strokeStyle = gradient
    this.ctx.stroke()
  }

  /**
   * 渲染圆形粒子
   */
  private renderCircle(particle: Particle): void {
    if (!this.ctx) return
    
    this.ctx.beginPath()
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    this.ctx.fill()
  }

  /**
   * 动画帧回调
   */
  protected onAnimate(): void {
    this.updateParticles()
    this.renderParticles()
  }

  /**
   * 绑定地图事件
   */
  private bindMapEvents(): void {
    if (!this.mapEngine) return
    
    // 监听地图大小变化
    this.mapEngine.on('resize', () => {
      this.resizeCanvas()
    })
  }

  /**
   * 更新配置
   */
  protected onUpdate(newOptions: Partial<ParticleEffectOptions>): void {
    this.particleOptions = { ...this.particleOptions, ...newOptions }
    
    // 如果粒子数量改变，重新初始化
    if (newOptions.count !== undefined) {
      this.initParticles()
    }
  }

  /**
   * 销毁效果
   */
  protected onDestroy(): void {
    this.particles = []
    this.canvas = null
    this.ctx = null
  }
}
