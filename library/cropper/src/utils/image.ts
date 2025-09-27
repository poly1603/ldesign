/**
 * @file 图片处理工具函数
 * @description 提供图片加载、处理和转换相关的工具函数
 */

import type { ImageSource, ImageInfo, ImageFormat, Size } from '../types'
import { loadImage, readFileAsDataURL, createCanvas, getCanvasContext } from './dom'

/**
 * 加载图片源
 */
export async function loadImageSource(source: ImageSource): Promise<HTMLImageElement> {
  if (source instanceof HTMLImageElement) {
    // 如果图片还没有加载完成，等待加载
    if (!source.complete) {
      await new Promise<void>((resolve, reject) => {
        const onLoad = () => {
          source.removeEventListener('load', onLoad)
          source.removeEventListener('error', onError)
          resolve()
        }
        const onError = () => {
          source.removeEventListener('load', onLoad)
          source.removeEventListener('error', onError)
          reject(new Error('Failed to load image'))
        }
        source.addEventListener('load', onLoad)
        source.addEventListener('error', onError)
      })
    }
    return source
  }
  
  if (source instanceof HTMLCanvasElement) {
    const img = new Image()
    img.src = source.toDataURL()
    return loadImage(img.src)
  }
  
  if (source instanceof File) {
    const dataURL = await readFileAsDataURL(source)
    return loadImage(dataURL)
  }
  
  if (typeof source === 'string') {
    return loadImage(source)
  }
  
  throw new Error('Unsupported image source type')
}

/**
 * 获取图片信息
 */
export function getImageInfo(image: HTMLImageElement, file?: File): ImageInfo {
  return {
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    width: image.width || image.naturalWidth,
    height: image.height || image.naturalHeight,
    aspectRatio: image.naturalWidth / image.naturalHeight,
    src: image.src,
    size: file?.size,
    type: file?.type,
  }
}

/**
 * 创建图片的Canvas副本
 */
export function imageToCanvas(
  image: HTMLImageElement,
  size?: Size
): HTMLCanvasElement {
  const canvas = createCanvas()
  const ctx = getCanvasContext(canvas)
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  const width = size?.width || image.naturalWidth
  const height = size?.height || image.naturalHeight
  
  canvas.width = width
  canvas.height = height
  
  ctx.drawImage(image, 0, 0, width, height)
  
  return canvas
}

/**
 * 调整图片大小
 */
export function resizeImage(
  image: HTMLImageElement,
  targetSize: Size,
  quality: number = 0.9
): HTMLCanvasElement {
  const canvas = createCanvas(targetSize.width, targetSize.height)
  const ctx = getCanvasContext(canvas)
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  // 使用高质量的图片缩放
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  ctx.drawImage(image, 0, 0, targetSize.width, targetSize.height)
  
  return canvas
}

/**
 * 旋转图片
 */
export function rotateImage(
  image: HTMLImageElement,
  angle: number
): HTMLCanvasElement {
  const canvas = createCanvas()
  const ctx = getCanvasContext(canvas)
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  const rad = (angle * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  
  // 计算旋转后的尺寸
  const newWidth = image.naturalWidth * cos + image.naturalHeight * sin
  const newHeight = image.naturalWidth * sin + image.naturalHeight * cos
  
  canvas.width = newWidth
  canvas.height = newHeight
  
  // 移动到中心点
  ctx.translate(newWidth / 2, newHeight / 2)
  
  // 旋转
  ctx.rotate(rad)
  
  // 绘制图片
  ctx.drawImage(
    image,
    -image.naturalWidth / 2,
    -image.naturalHeight / 2,
    image.naturalWidth,
    image.naturalHeight
  )
  
  return canvas
}

/**
 * 翻转图片
 */
export function flipImage(
  image: HTMLImageElement,
  horizontal: boolean = false,
  vertical: boolean = false
): HTMLCanvasElement {
  const canvas = createCanvas(image.naturalWidth, image.naturalHeight)
  const ctx = getCanvasContext(canvas)
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  ctx.save()
  
  // 设置翻转
  const scaleX = horizontal ? -1 : 1
  const scaleY = vertical ? -1 : 1
  
  ctx.scale(scaleX, scaleY)
  
  // 调整绘制位置
  const x = horizontal ? -image.naturalWidth : 0
  const y = vertical ? -image.naturalHeight : 0
  
  ctx.drawImage(image, x, y, image.naturalWidth, image.naturalHeight)
  
  ctx.restore()
  
  return canvas
}

/**
 * 裁剪图片
 */
export function cropImage(
  image: HTMLImageElement,
  cropArea: { x: number; y: number; width: number; height: number },
  outputSize?: Size
): HTMLCanvasElement {
  const canvas = createCanvas()
  const ctx = getCanvasContext(canvas)
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  const outputWidth = outputSize?.width || cropArea.width
  const outputHeight = outputSize?.height || cropArea.height
  
  canvas.width = outputWidth
  canvas.height = outputHeight
  
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    outputWidth,
    outputHeight
  )
  
  return canvas
}

/**
 * Canvas转换为Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat = ImageFormat.PNG,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      format,
      quality
    )
  })
}

/**
 * Canvas转换为DataURL
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  format: ImageFormat = ImageFormat.PNG,
  quality: number = 0.9
): string {
  return canvas.toDataURL(format, quality)
}

/**
 * 检查图片格式
 */
export function getImageFormat(file: File): ImageFormat | null {
  const type = file.type.toLowerCase()
  
  if (type === 'image/png') return ImageFormat.PNG
  if (type === 'image/jpeg' || type === 'image/jpg') return ImageFormat.JPEG
  if (type === 'image/webp') return ImageFormat.WEBP
  
  return null
}

/**
 * 检查是否为支持的图片格式
 */
export function isSupportedImageFormat(file: File): boolean {
  return getImageFormat(file) !== null
}

/**
 * 获取图片的主要颜色
 */
export function getImageDominantColor(image: HTMLImageElement): string {
  const canvas = createCanvas(1, 1)
  const ctx = getCanvasContext(canvas)
  
  if (!ctx) {
    return '#000000'
  }
  
  ctx.drawImage(image, 0, 0, 1, 1)
  const imageData = ctx.getImageData(0, 0, 1, 1)
  const [r, g, b] = imageData.data
  
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 计算图片的平均亮度
 */
export function getImageBrightness(image: HTMLImageElement): number {
  const canvas = createCanvas(100, 100)
  const ctx = getCanvasContext(canvas)
  
  if (!ctx) {
    return 0.5
  }
  
  ctx.drawImage(image, 0, 0, 100, 100)
  const imageData = ctx.getImageData(0, 0, 100, 100)
  const data = imageData.data
  
  let totalBrightness = 0
  const pixelCount = data.length / 4
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // 使用相对亮度公式
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    totalBrightness += brightness
  }
  
  return totalBrightness / pixelCount
}

/**
 * 应用图片滤镜
 */
export function applyImageFilter(
  image: HTMLImageElement,
  filter: string
): HTMLCanvasElement {
  const canvas = imageToCanvas(image)
  const ctx = getCanvasContext(canvas)
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }
  
  ctx.filter = filter
  ctx.drawImage(canvas, 0, 0)
  
  return canvas
}

/**
 * 创建图片缩略图
 */
export function createThumbnail(
  image: HTMLImageElement,
  maxSize: number = 200,
  quality: number = 0.8
): HTMLCanvasElement {
  const { naturalWidth, naturalHeight } = image
  const aspectRatio = naturalWidth / naturalHeight
  
  let width: number
  let height: number
  
  if (naturalWidth > naturalHeight) {
    width = Math.min(maxSize, naturalWidth)
    height = width / aspectRatio
  } else {
    height = Math.min(maxSize, naturalHeight)
    width = height * aspectRatio
  }
  
  return resizeImage(image, { width, height }, quality)
}
