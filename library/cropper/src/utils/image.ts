/**
 * Image utilities
 */

import type { GetCroppedCanvasOptions } from '../types'

/**
 * Load an image from URL
 */
export function loadImage(src: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))

    if (crossOrigin) {
      image.crossOrigin = crossOrigin
    }

    image.src = src
  })
}

/**
 * Get image EXIF orientation
 */
export function getOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer)

      if (view.getUint16(0, false) !== 0xffd8) {
        resolve(1)
        return
      }

      const length = view.byteLength
      let offset = 2

      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) {
          resolve(1)
          return
        }
        const marker = view.getUint16(offset, false)
        offset += 2

        if (marker === 0xffe1) {
          offset += 2
          if (view.getUint32(offset, false) !== 0x45786966) {
            resolve(1)
            return
          }

          const little = view.getUint16((offset += 6), false) === 0x4949
          offset += view.getUint32(offset + 4, little)
          const tags = view.getUint16(offset, little)
          offset += 2

          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              resolve(view.getUint16(offset + i * 12 + 8, little))
              return
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) {
          break
        } else {
          offset += view.getUint16(offset, false)
        }
      }

      resolve(1)
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Create a canvas from image
 */
export function createCanvas(
  image: HTMLImageElement,
  options: GetCroppedCanvasOptions = {}
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const {
    width = image.naturalWidth,
    height = image.naturalHeight,
    fillColor,
    imageSmoothingEnabled = true,
    imageSmoothingQuality = 'high'
  } = options

  canvas.width = width
  canvas.height = height

  ctx.imageSmoothingEnabled = imageSmoothingEnabled
  ctx.imageSmoothingQuality = imageSmoothingQuality

  if (fillColor) {
    ctx.fillStyle = fillColor
    ctx.fillRect(0, 0, width, height)
  }

  return canvas
}

/**
 * Canvas to Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality = 1
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
      type,
      quality
    )
  })
}

/**
 * Canvas to Data URL
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality = 1
): string {
  return canvas.toDataURL(type, quality)
}

/**
 * Download canvas as image
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  type = 'image/png',
  quality = 1
): void {
  const url = canvasToDataURL(canvas, type, quality)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

/**
 * Check if image has transparency
 */
export function hasTransparency(image: HTMLImageElement): boolean {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return false
  }

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true
    }
  }

  return false
}

/**
 * Get image aspect ratio
 */
export function getImageAspectRatio(image: HTMLImageElement): number {
  return image.naturalWidth / image.naturalHeight
}

/**
 * Check if URL is blob URL
 */
export function isBlobURL(url: string): boolean {
  return url.startsWith('blob:')
}

/**
 * Check if URL is data URL
 */
export function isDataURL(url: string): boolean {
  return url.startsWith('data:')
}

/**
 * Check if browser supports canvas
 */
export function supportsCanvas(): boolean {
  const canvas = document.createElement('canvas')
  return !!(canvas.getContext && canvas.getContext('2d'))
}
