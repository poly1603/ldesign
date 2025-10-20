/**
 * 动画数据解析器
 * 在 Worker 中处理 JSON 解析和数据验证
 */

export interface ParseOptions {
  validate?: boolean
  removeHiddenLayers?: boolean
  roundValues?: boolean
  precision?: number
}

/**
 * 解析动画数据
 */
export async function parseAnimationData(
  data: string | object,
  options?: ParseOptions
): Promise<any> {
  // 如果是字符串，解析 JSON
  let animationData: any
  
  if (typeof data === 'string') {
    try {
      animationData = JSON.parse(data)
    } catch (error) {
      throw new Error(`Failed to parse animation JSON: ${error}`)
    }
  } else {
    animationData = data
  }

  // 验证数据结构
  if (options?.validate !== false) {
    validateAnimationData(animationData)
  }

  // 返回解析后的数据
  return animationData
}

/**
 * 优化动画数据
 */
export async function optimizeAnimationData(
  data: any,
  options?: ParseOptions
): Promise<any> {
  let optimized = JSON.parse(JSON.stringify(data))

  // 移除隐藏图层
  if (options?.removeHiddenLayers) {
    optimized = removeHiddenLayers(optimized)
  }

  // 简化数值
  if (options?.roundValues) {
    const precision = options.precision ?? 2
    optimized = roundNumericValues(optimized, precision)
  }

  return optimized
}

/**
 * 验证动画数据结构
 */
function validateAnimationData(data: any): void {
  // 基本结构验证
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid animation data: not an object')
  }

  // 检查必需字段
  const requiredFields = ['v', 'fr', 'ip', 'op', 'w', 'h', 'layers']
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Invalid animation data: missing field "${field}"`)
    }
  }

  // 验证版本
  if (typeof data.v !== 'string') {
    throw new Error('Invalid animation data: version must be a string')
  }

  // 验证帧率
  if (typeof data.fr !== 'number' || data.fr <= 0) {
    throw new Error('Invalid animation data: invalid frame rate')
  }

  // 验证图层
  if (!Array.isArray(data.layers)) {
    throw new Error('Invalid animation data: layers must be an array')
  }
}

/**
 * 移除隐藏图层
 */
function removeHiddenLayers(data: any): any {
  if (data.layers && Array.isArray(data.layers)) {
    data.layers = data.layers.filter((layer: any) => {
      // 保留可见图层
      if (layer.hd === true || layer.hidden === true) {
        return false
      }
      
      // 递归处理嵌套图层
      if (layer.layers && Array.isArray(layer.layers)) {
        layer.layers = removeHiddenLayers({ layers: layer.layers }).layers
      }
      
      return true
    })
  }

  return data
}

/**
 * 简化数值精度
 */
function roundNumericValues(data: any, precision: number): any {
  if (typeof data === 'number') {
    return Math.round(data * Math.pow(10, precision)) / Math.pow(10, precision)
  }

  if (Array.isArray(data)) {
    return data.map(item => roundNumericValues(item, precision))
  }

  if (data && typeof data === 'object') {
    const result: any = {}
    for (const key in data) {
      result[key] = roundNumericValues(data[key], precision)
    }
    return result
  }

  return data
}

/**
 * 计算动画复杂度
 */
export function calculateComplexity(data: any): {
  layers: number
  shapes: number
  keyframes: number
  complexity: 'low' | 'medium' | 'high' | 'extreme'
} {
  let layerCount = 0
  let shapeCount = 0
  let keyframeCount = 0

  function countElements(obj: any): void {
    if (!obj || typeof obj !== 'object') return

    if (obj.ty !== undefined) {
      // 这是一个图层
      layerCount++
    }

    if (obj.ty === 4 && obj.shapes) {
      // 形状图层
      shapeCount += obj.shapes.length
    }

    if (obj.k && Array.isArray(obj.k)) {
      // 关键帧数组
      keyframeCount += obj.k.length
    }

    // 递归处理
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any) => countElements(item))
      } else if (typeof obj[key] === 'object') {
        countElements(obj[key])
      }
    }
  }

  countElements(data)

  // 计算复杂度
  const score = layerCount + shapeCount * 2 + keyframeCount * 0.5
  let complexity: 'low' | 'medium' | 'high' | 'extreme'

  if (score < 50) {
    complexity = 'low'
  } else if (score < 200) {
    complexity = 'medium'
  } else if (score < 500) {
    complexity = 'high'
  } else {
    complexity = 'extreme'
  }

  return {
    layers: layerCount,
    shapes: shapeCount,
    keyframes: keyframeCount,
    complexity
  }
}


