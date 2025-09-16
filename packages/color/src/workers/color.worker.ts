/**
 * Color calculation Web Worker
 * 在独立线程中处理颜色计算，避免阻塞主线程
 */

import type { ColorConfig, ColorMode, ColorValue } from '../core/types'
import * as ColorConverter from '../utils/color-converter'
import { ColorGeneratorImpl } from '../utils/color-generator'
import * as ColorUtils from '../utils/color-utils'

// Worker 消息类型
export interface WorkerMessage {
  id: string
  type: 'generate' | 'convert' | 'scale' | 'blend' | 'gradient' | 'palette'
  payload: any
}

export interface WorkerResponse {
  id: string
  type: string
  result?: any
  error?: string
}

// 初始化生成器
const colorGenerator = new ColorGeneratorImpl()

// 处理消息
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data

  try {
    let result: any

    switch (type) {
      case 'generate':
        // 生成颜色配置
        result = await generateColorConfig(payload)
        break

      case 'convert':
        // 颜色格式转换
        result = convertColor(payload)
        break

      case 'scale':
        // 生成色阶
        result = generateScale(payload)
        break

      case 'blend':
        // 混合颜色
        result = blendColors(payload)
        break

      case 'gradient':
        // 生成渐变
        result = generateGradient(payload)
        break

      case 'palette':
        // 生成调色板
        result = generatePalette(payload)
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }

    // 发送成功响应
    const response: WorkerResponse = {
      id,
      type,
      result,
    }
    self.postMessage(response)
  }
  catch (error) {
    // 发送错误响应
    const response: WorkerResponse = {
      id,
      type,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    self.postMessage(response)
  }
})

/**
 * 生成颜色配置
 */
async function generateColorConfig(payload: {
  primaryColor: ColorValue
  mode: ColorMode
  options?: any
}): Promise<ColorConfig> {
  const { primaryColor } = payload

  // 生成基础颜色配置
  const baseColors = colorGenerator.generateColors(primaryColor)

  return {
    primary: primaryColor,
    ...baseColors,
  }
}

/**
 * 转换颜色格式
 */
function convertColor(payload: {
  color: string
  from: 'hex' | 'rgb' | 'hsl' | 'hsv'
  to: 'hex' | 'rgb' | 'hsl' | 'hsv'
}): string | null {
  const { color, from, to } = payload

  // 根据源格式和目标格式进行转换
  if (from === 'hex' && to === 'rgb') {
    return JSON.stringify(ColorConverter.hexToRgb(color))
  }
  else if (from === 'hex' && to === 'hsl') {
    return JSON.stringify(ColorConverter.hexToHsl(color))
  }
  else if (from === 'rgb' && to === 'hex') {
    const rgb = JSON.parse(color)
    return ColorConverter.rgbToHex(rgb.r, rgb.g, rgb.b)
  }
  else if (from === 'hsl' && to === 'hex') {
    const hsl = JSON.parse(color)
    return ColorConverter.hslToHex(hsl.h, hsl.s, hsl.l)
  }

  return null
}

/**
 * 生成色阶
 */
function generateScale(payload: {
  baseColor: string
  count?: number
  mode?: 'light' | 'dark' | 'both'
}): string[] {
  const { baseColor, count = 10, mode = 'both' } = payload

  const scales: string[] = []

  if (mode === 'light' || mode === 'both') {
    // 生成亮色阶
    for (let i = 1; i <= count / 2; i++) {
      const lightness = 50 + (i * 10)
      scales.push(ColorUtils.adjustBrightness(baseColor, lightness / 100))
    }
  }

  if (mode === 'dark' || mode === 'both') {
    // 生成暗色阶
    for (let i = 1; i <= count / 2; i++) {
      const darkness = 50 - (i * 10)
      scales.push(ColorUtils.adjustBrightness(baseColor, darkness / 100))
    }
  }

  return scales
}

/**
 * 混合颜色
 */
function blendColors(payload: {
  color1: string
  color2: string
  ratio?: number
  mode?: 'normal' | 'multiply' | 'screen' | 'overlay'
}): string {
  const { color1, color2, ratio = 0.5 } = payload
  return ColorUtils.blendColors(color1, color2, ratio as any)
}

/**
 * 生成渐变
 */
function generateGradient(payload: {
  colors: string[]
  steps?: number
  type?: 'linear' | 'radial'
}): string[] {
  const { colors, steps = 10 } = payload

  if (colors.length < 2) {
    throw new Error('At least 2 colors are required for gradient')
  }

  const gradient: string[] = []
  const segmentSteps = Math.floor(steps / (colors.length - 1))

  for (let i = 0; i < colors.length - 1; i++) {
    const color1 = colors[i]
    const color2 = colors[i + 1]

    for (let j = 0; j < segmentSteps; j++) {
      const ratio = j / segmentSteps
      gradient.push(ColorUtils.interpolateColors(color1, color2, ratio))
    }
  }

  // 添加最后一个颜色
  gradient.push(colors[colors.length - 1])

  return gradient
}

/**
 * 生成调色板
 */
function generatePalette(payload: {
  baseColor: string
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'
  count?: number
}): string[] {
  const { baseColor, type, count = 5 } = payload

  switch (type) {
    case 'monochromatic':
      return ColorUtils.generateMonochromaticPalette(baseColor, count)
    case 'analogous':
      return ColorUtils.generateAnalogousPalette(baseColor, count)
    case 'complementary':
      return ColorUtils.generateComplementaryPalette(baseColor)
    case 'triadic':
      return ColorUtils.generateTriadicPalette(baseColor)
    case 'tetradic':
      return ColorUtils.generateTetradicPalette(baseColor)
    default:
      throw new Error(`Unknown palette type: ${type}`)
  }
}

// 导出 Worker 类型
export type ColorWorker = typeof self
