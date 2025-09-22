/**
 * Framework Adapters
 * 提供不同框架的适配器，简化集成过程
 */

import type { QRCodeOptions, QRCodeResult } from '../types'
import { generateQRCode as vanillaGenerate } from '../vanilla'

/**
 * 框架检测结果
 */
export interface FrameworkDetection {
  framework: 'vue' | 'react' | 'angular' | 'vanilla' | 'unknown'
  version?: string
  detected: boolean
}

/**
 * 通用适配器选项
 */
export interface AdapterOptions extends Partial<QRCodeOptions> {
  autoDetect?: boolean
  framework?: 'vue' | 'react' | 'angular' | 'vanilla'
}

/**
 * 检测当前运行的框架环境
 * 
 * @returns FrameworkDetection
 */
export function detectFramework(): FrameworkDetection {
  // 检测Vue
  if (typeof window !== 'undefined') {
    // Vue 3
    if ((window as any).Vue && (window as any).Vue.version) {
      return {
        framework: 'vue',
        version: (window as any).Vue.version,
        detected: true,
      }
    }
    
    // Vue 2
    if ((window as any).Vue && (window as any).Vue.version) {
      return {
        framework: 'vue',
        version: (window as any).Vue.version,
        detected: true,
      }
    }
  }

  // 检测React
  if (typeof window !== 'undefined') {
    if ((window as any).React) {
      return {
        framework: 'react',
        version: (window as any).React.version,
        detected: true,
      }
    }
  }

  // 检测Angular
  if (typeof window !== 'undefined') {
    if ((window as any).ng || (window as any).angular) {
      return {
        framework: 'angular',
        detected: true,
      }
    }
  }

  // 检测Node.js环境
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return {
      framework: 'vanilla',
      detected: true,
    }
  }

  // 默认为vanilla
  return {
    framework: 'vanilla',
    detected: false,
  }
}

/**
 * 通用QR码生成适配器
 * 自动检测框架并使用相应的实现
 * 
 * @param text - 要编码的文本
 * @param options - 配置选项
 * @returns Promise<QRCodeResult>
 * 
 * @example
 * ```javascript
 * // 自动检测框架
 * const result = await generateQRCodeAuto('Hello World', {
 *   size: 200,
 *   format: 'canvas'
 * })
 * 
 * // 指定框架
 * const result = await generateQRCodeAuto('Hello World', {
 *   framework: 'vue',
 *   size: 200
 * })
 * ```
 */
export async function generateQRCodeAuto(
  text: string,
  options: AdapterOptions = {}
): Promise<QRCodeResult> {
  const { autoDetect = true, framework: specifiedFramework, ...qrOptions } = options

  let targetFramework = specifiedFramework

  // 自动检测框架
  if (autoDetect && !targetFramework) {
    const detection = detectFramework()
    targetFramework = detection.framework === 'unknown' ? undefined : detection.framework
  }

  // 根据框架选择实现
  switch (targetFramework) {
    case 'vue':
      return await generateForVue(text, qrOptions)
    
    case 'react':
      return await generateForReact(text, qrOptions)
    
    case 'angular':
      return await generateForAngular(text, qrOptions)
    
    case 'vanilla':
    default:
      return await vanillaGenerate(text, qrOptions)
  }
}

/**
 * Vue框架适配器
 */
async function generateForVue(text: string, options: Partial<QRCodeOptions>): Promise<QRCodeResult> {
  // 在Vue环境中，优先使用Vue组件的方式
  // 这里使用vanilla实现作为后备
  return await vanillaGenerate(text, options)
}

/**
 * React框架适配器
 */
async function generateForReact(text: string, options: Partial<QRCodeOptions>): Promise<QRCodeResult> {
  // 在React环境中，优先使用React Hook的方式
  // 这里使用vanilla实现作为后备
  return await vanillaGenerate(text, options)
}

/**
 * Angular框架适配器
 */
async function generateForAngular(text: string, options: Partial<QRCodeOptions>): Promise<QRCodeResult> {
  // 在Angular环境中，优先使用Angular服务的方式
  // 这里使用vanilla实现作为后备
  return await vanillaGenerate(text, options)
}

/**
 * 创建框架特定的QR码生成器工厂
 * 
 * @param framework - 目标框架
 * @returns 生成器工厂函数
 * 
 * @example
 * ```javascript
 * const vueFactory = createFrameworkFactory('vue')
 * const generator = vueFactory({
 *   size: 200,
 *   format: 'svg'
 * })
 * 
 * const result = await generator.generate('Hello World')
 * ```
 */
export function createFrameworkFactory(framework: 'vue' | 'react' | 'angular' | 'vanilla') {
  return function(options: Partial<QRCodeOptions> = {}) {
    return {
      async generate(text: string): Promise<QRCodeResult> {
        return await generateQRCodeAuto(text, { ...options, framework })
      }
    }
  }
}

/**
 * 获取框架特定的最佳实践配置
 * 
 * @param framework - 框架名称
 * @returns 推荐的配置选项
 */
export function getFrameworkBestPractices(framework: 'vue' | 'react' | 'angular' | 'vanilla'): Partial<QRCodeOptions> {
  const baseConfig: Partial<QRCodeOptions> = {
    size: 200,
    margin: 4,
    errorCorrectionLevel: 'M',
    performance: {
      enableCache: true,
    },
  }

  switch (framework) {
    case 'vue':
      return {
        ...baseConfig,
        format: 'svg', // Vue更适合SVG，便于响应式
      }
    
    case 'react':
      return {
        ...baseConfig,
        format: 'canvas', // React更适合Canvas，性能更好
      }
    
    case 'angular':
      return {
        ...baseConfig,
        format: 'svg', // Angular更适合SVG，便于模板绑定
      }
    
    case 'vanilla':
    default:
      return {
        ...baseConfig,
        format: 'canvas', // 原生JS默认使用Canvas
      }
  }
}

/**
 * 框架兼容性检查
 * 
 * @param framework - 框架名称
 * @param features - 要检查的功能列表
 * @returns 兼容性报告
 */
export function checkFrameworkCompatibility(
  framework: 'vue' | 'react' | 'angular' | 'vanilla',
  features: string[] = []
): { compatible: boolean, issues: string[], recommendations: string[] } {
  const issues: string[] = []
  const recommendations: string[] = []

  // 基础兼容性检查
  const detection = detectFramework()
  
  if (framework !== 'vanilla' && detection.framework !== framework && detection.detected) {
    issues.push(`Expected ${framework} but detected ${detection.framework}`)
    recommendations.push(`Consider using the ${detection.framework} adapter instead`)
  }

  // 功能兼容性检查
  features.forEach(feature => {
    switch (feature) {
      case 'ssr':
        if (framework === 'react' || framework === 'vue' || framework === 'angular') {
          recommendations.push('For SSR, consider generating QR codes on the client side only')
        }
        break
      
      case 'logo':
        if (typeof window === 'undefined') {
          issues.push('Logo feature requires browser environment')
        }
        break
      
      case 'download':
        if (typeof window === 'undefined') {
          issues.push('Download feature requires browser environment')
        }
        break
    }
  })

  return {
    compatible: issues.length === 0,
    issues,
    recommendations,
  }
}

/**
 * 创建跨框架的QR码组件配置
 * 
 * @param framework - 目标框架
 * @param options - 基础选项
 * @returns 框架特定的组件配置
 */
export function createCrossFrameworkConfig(
  framework: 'vue' | 'react' | 'angular' | 'vanilla',
  options: Partial<QRCodeOptions> = {}
) {
  const bestPractices = getFrameworkBestPractices(framework)
  const mergedOptions = { ...bestPractices, ...options }

  return {
    framework,
    options: mergedOptions,
    compatibility: checkFrameworkCompatibility(framework),
    factory: createFrameworkFactory(framework),
  }
}
