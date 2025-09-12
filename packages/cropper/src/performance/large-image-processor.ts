/**
 * @file 大图片处理器
 * @description 处理大尺寸图片的分块加载和处理
 */

import { EventEmitter } from '@/core/event-emitter'

/**
 * 图片块信息
 */
export interface ImageTile {
  /** 块索引 */
  index: number
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** Canvas元素 */
  canvas: HTMLCanvasElement
  /** 是否已加载 */
  loaded: boolean
}

/**
 * 大图片处理配置
 */
export interface LargeImageConfig {
  /** 最大块尺寸 */
  maxTileSize: number
  /** 并发加载数量 */
  concurrency: number
  /** 内存限制（MB） */
  memoryLimit: number
  /** 是否启用渐进式加载 */
  progressiveLoading: boolean
  /** 预加载距离（像素） */
  preloadDistance: number
}

/**
 * 处理进度信息
 */
export interface ProcessingProgress {
  /** 已处理块数 */
  processedTiles: number
  /** 总块数 */
  totalTiles: number
  /** 进度百分比 */
  percentage: number
  /** 当前处理的块 */
  currentTile?: ImageTile
}

/**
 * 大图片处理器类
 */
export class LargeImageProcessor extends EventEmitter {
  /** 处理配置 */
  private config: LargeImageConfig

  /** 原始图片 */
  private sourceImage?: HTMLImageElement

  /** 图片块数组 */
  private tiles: ImageTile[] = []

  /** 已加载的块 */
  private loadedTiles: Set<number> = new Set()

  /** 正在加载的块 */
  private loadingTiles: Set<number> = new Set()

  /** 当前视口区域 */
  private viewport: { x: number; y: number; width: number; height: number } = {
    x: 0, y: 0, width: 0, height: 0
  }

  /** 是否正在处理 */
  private isProcessing: boolean = false

  /** 内存使用量（字节） */
  private memoryUsage: number = 0

  /**
   * 构造函数
   * @param config 处理配置
   */
  constructor(config: Partial<LargeImageConfig> = {}) {
    super()

    this.config = {
      maxTileSize: 1024,
      concurrency: 4,
      memoryLimit: 500, // 500MB
      progressiveLoading: true,
      preloadDistance: 512,
      ...config
    }
  }

  /**
   * 加载大图片
   * @param image 图片元素或URL
   */
  async loadImage(image: HTMLImageElement | string): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Already processing an image')
    }

    this.isProcessing = true
    this.emit('processingStarted')

    try {
      // 加载图片
      this.sourceImage = await this.loadImageElement(image)
      
      // 检查是否需要分块处理
      if (!this.needsTileProcessing(this.sourceImage)) {
        this.emit('processingCompleted', { tiles: [], fullImage: this.sourceImage })
        return
      }

      // 创建图片块
      this.createTiles(this.sourceImage)
      
      // 开始加载可见区域的块
      await this.loadVisibleTiles()

      this.emit('processingCompleted', { tiles: this.tiles, fullImage: this.sourceImage })
    } catch (error) {
      this.emit('processingError', error)
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 设置视口区域
   * @param viewport 视口信息
   */
  setViewport(viewport: { x: number; y: number; width: number; height: number }): void {
    this.viewport = viewport
    
    if (this.config.progressiveLoading && this.tiles.length > 0) {
      // 异步加载可见区域的块
      this.loadVisibleTiles().catch(error => {
        this.emit('tileLoadError', error)
      })
    }
  }

  /**
   * 获取指定区域的图片数据
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param height 高度
   */
  getImageData(x: number, y: number, width: number, height: number): ImageData | null {
    if (!this.sourceImage) return null

    // 如果不需要分块处理，直接从原图获取
    if (!this.needsTileProcessing(this.sourceImage)) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      
      ctx.drawImage(this.sourceImage, x, y, width, height, 0, 0, width, height)
      return ctx.getImageData(0, 0, width, height)
    }

    // 从相关的块中合成图片数据
    return this.compositeImageData(x, y, width, height)
  }

  /**
   * 获取处理进度
   */
  getProgress(): ProcessingProgress {
    return {
      processedTiles: this.loadedTiles.size,
      totalTiles: this.tiles.length,
      percentage: this.tiles.length > 0 ? (this.loadedTiles.size / this.tiles.length) * 100 : 0
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): { used: number; limit: number; percentage: number } {
    const usedMB = this.memoryUsage / (1024 * 1024)
    return {
      used: usedMB,
      limit: this.config.memoryLimit,
      percentage: (usedMB / this.config.memoryLimit) * 100
    }
  }

  /**
   * 清理未使用的块
   */
  cleanupUnusedTiles(): void {
    const visibleTileIndices = this.getVisibleTileIndices()
    const preloadTileIndices = this.getPreloadTileIndices()
    const keepTileIndices = new Set([...visibleTileIndices, ...preloadTileIndices])

    this.tiles.forEach((tile, index) => {
      if (!keepTileIndices.has(index) && this.loadedTiles.has(index)) {
        this.unloadTile(tile)
      }
    })

    this.emit('tilesCleanedUp', { 
      cleaned: this.tiles.length - keepTileIndices.size,
      remaining: keepTileIndices.size 
    })
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    this.isProcessing = false
    
    // 清理所有块
    this.tiles.forEach(tile => {
      if (this.loadedTiles.has(tile.index)) {
        this.unloadTile(tile)
      }
    })

    this.tiles = []
    this.loadedTiles.clear()
    this.loadingTiles.clear()
    this.sourceImage = undefined
    this.memoryUsage = 0

    this.removeAllListeners()
  }

  /**
   * 加载图片元素
   */
  private async loadImageElement(image: HTMLImageElement | string): Promise<HTMLImageElement> {
    if (typeof image === 'string') {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = image
      })
    }
    return image
  }

  /**
   * 检查是否需要分块处理
   */
  private needsTileProcessing(image: HTMLImageElement): boolean {
    const imageSize = image.naturalWidth * image.naturalHeight * 4 // RGBA
    const imageSizeMB = imageSize / (1024 * 1024)
    
    return imageSizeMB > 50 || // 大于50MB
           image.naturalWidth > 4096 || // 宽度大于4K
           image.naturalHeight > 4096    // 高度大于4K
  }

  /**
   * 创建图片块
   */
  private createTiles(image: HTMLImageElement): void {
    const { maxTileSize } = this.config
    const { naturalWidth: width, naturalHeight: height } = image

    this.tiles = []
    let index = 0

    for (let y = 0; y < height; y += maxTileSize) {
      for (let x = 0; x < width; x += maxTileSize) {
        const tileWidth = Math.min(maxTileSize, width - x)
        const tileHeight = Math.min(maxTileSize, height - y)

        const canvas = document.createElement('canvas')
        canvas.width = tileWidth
        canvas.height = tileHeight

        this.tiles.push({
          index,
          x,
          y,
          width: tileWidth,
          height: tileHeight,
          canvas,
          loaded: false
        })

        index++
      }
    }

    this.emit('tilesCreated', { count: this.tiles.length })
  }

  /**
   * 加载可见区域的块
   */
  private async loadVisibleTiles(): Promise<void> {
    const visibleIndices = this.getVisibleTileIndices()
    const preloadIndices = this.getPreloadTileIndices()
    const loadIndices = [...new Set([...visibleIndices, ...preloadIndices])]

    // 限制并发加载数量
    const batches = this.chunkArray(loadIndices, this.config.concurrency)
    
    for (const batch of batches) {
      await Promise.all(batch.map(index => this.loadTile(this.tiles[index])))
    }
  }

  /**
   * 获取可见块的索引
   */
  private getVisibleTileIndices(): number[] {
    const { x, y, width, height } = this.viewport
    const indices: number[] = []

    this.tiles.forEach((tile, index) => {
      if (this.isRectIntersecting(
        tile.x, tile.y, tile.width, tile.height,
        x, y, width, height
      )) {
        indices.push(index)
      }
    })

    return indices
  }

  /**
   * 获取预加载块的索引
   */
  private getPreloadTileIndices(): number[] {
    const { x, y, width, height } = this.viewport
    const { preloadDistance } = this.config
    const indices: number[] = []

    const expandedX = x - preloadDistance
    const expandedY = y - preloadDistance
    const expandedWidth = width + preloadDistance * 2
    const expandedHeight = height + preloadDistance * 2

    this.tiles.forEach((tile, index) => {
      if (this.isRectIntersecting(
        tile.x, tile.y, tile.width, tile.height,
        expandedX, expandedY, expandedWidth, expandedHeight
      )) {
        indices.push(index)
      }
    })

    return indices
  }

  /**
   * 检查矩形是否相交
   */
  private isRectIntersecting(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1)
  }

  /**
   * 加载单个块
   */
  private async loadTile(tile: ImageTile): Promise<void> {
    if (tile.loaded || this.loadingTiles.has(tile.index) || !this.sourceImage) {
      return
    }

    // 检查内存限制
    if (this.getMemoryUsage().percentage > 90) {
      this.cleanupUnusedTiles()
    }

    this.loadingTiles.add(tile.index)

    try {
      const ctx = tile.canvas.getContext('2d')!
      ctx.drawImage(
        this.sourceImage,
        tile.x, tile.y, tile.width, tile.height,
        0, 0, tile.width, tile.height
      )

      tile.loaded = true
      this.loadedTiles.add(tile.index)
      this.memoryUsage += tile.width * tile.height * 4 // RGBA

      this.emit('tileLoaded', { tile, progress: this.getProgress() })
    } catch (error) {
      this.emit('tileLoadError', { tile, error })
      throw error
    } finally {
      this.loadingTiles.delete(tile.index)
    }
  }

  /**
   * 卸载块
   */
  private unloadTile(tile: ImageTile): void {
    if (!tile.loaded) return

    const ctx = tile.canvas.getContext('2d')!
    ctx.clearRect(0, 0, tile.width, tile.height)
    
    tile.loaded = false
    this.loadedTiles.delete(tile.index)
    this.memoryUsage -= tile.width * tile.height * 4

    this.emit('tileUnloaded', { tile })
  }

  /**
   * 合成图片数据
   */
  private compositeImageData(x: number, y: number, width: number, height: number): ImageData | null {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // 找到相关的块
    const relevantTiles = this.tiles.filter(tile => 
      tile.loaded && this.isRectIntersecting(
        tile.x, tile.y, tile.width, tile.height,
        x, y, width, height
      )
    )

    // 绘制相关块到合成Canvas
    relevantTiles.forEach(tile => {
      const sourceX = Math.max(0, x - tile.x)
      const sourceY = Math.max(0, y - tile.y)
      const sourceWidth = Math.min(tile.width - sourceX, width - Math.max(0, tile.x - x))
      const sourceHeight = Math.min(tile.height - sourceY, height - Math.max(0, tile.y - y))
      
      const destX = Math.max(0, tile.x - x)
      const destY = Math.max(0, tile.y - y)

      if (sourceWidth > 0 && sourceHeight > 0) {
        ctx.drawImage(
          tile.canvas,
          sourceX, sourceY, sourceWidth, sourceHeight,
          destX, destY, sourceWidth, sourceHeight
        )
      }
    })

    return ctx.getImageData(0, 0, width, height)
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
}
