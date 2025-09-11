/**
 * 效果工厂
 * 用于创建各种地图效果实例
 */

import type { 
  IEffect, 
  EffectType, 
  EffectOptions,
  ParticleEffectOptions,
  HeatmapEffectOptions,
  Building3DEffectOptions
} from '../types'
import { ParticleEffect } from './ParticleEffect'
import { HeatmapEffect } from './HeatmapEffect'
import { Building3DEffect } from './Building3DEffect'
import { generateId } from '../utils'

/**
 * 创建效果实例
 * 
 * @param type 效果类型
 * @param options 效果配置选项
 * @returns 效果实例
 */
export function createEffect(type: EffectType, options: EffectOptions): IEffect {
  const effectId = options.id || generateId(`effect-${type}`)
  
  switch (type) {
    case 'particles':
      return new ParticleEffect(effectId, options as ParticleEffectOptions)
    
    case 'heatmap':
      return new HeatmapEffect(effectId, options as HeatmapEffectOptions)
    
    case 'buildings3d':
      return new Building3DEffect(effectId, options as Building3DEffectOptions)
    
    default:
      throw new Error(`不支持的效果类型: ${type}`)
  }
}

/**
 * 效果类型注册表
 */
export const effectRegistry = new Map<EffectType, new (id: string, options: any) => IEffect>([
  ['particles', ParticleEffect],
  ['heatmap', HeatmapEffect],
  ['buildings3d', Building3DEffect]
])

/**
 * 注册自定义效果类型
 * 
 * @param type 效果类型
 * @param effectClass 效果类
 */
export function registerEffect(
  type: string, 
  effectClass: new (id: string, options: any) => IEffect
): void {
  effectRegistry.set(type as EffectType, effectClass)
}

/**
 * 获取所有已注册的效果类型
 * 
 * @returns 效果类型数组
 */
export function getRegisteredEffectTypes(): EffectType[] {
  return Array.from(effectRegistry.keys())
}

/**
 * 检查效果类型是否已注册
 * 
 * @param type 效果类型
 * @returns 是否已注册
 */
export function isEffectTypeRegistered(type: string): boolean {
  return effectRegistry.has(type as EffectType)
}
