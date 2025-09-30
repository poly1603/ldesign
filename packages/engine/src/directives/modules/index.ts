/**
 * 指令模块统一导出
 * 提供所有指令的统一入口
 */

// 导入所有指令模块
// 导入指令实例
import { clickOutsideDirective, vClickOutside } from './click-outside'
import { copyDirective, vCopy } from './copy'
import { debounceDirective, vDebounce } from './debounce'
import { dragDirective, vDrag } from './drag'
import { infiniteScrollDirective, vInfiniteScroll } from './infinite-scroll'
import { lazyDirective, vLazy } from './lazy'
import { loadingDirective, vLoading } from './loading'
import { resizeDirective, vResize } from './resize'
import { throttleDirective, vThrottle } from './throttle'
import { tooltipDirective, vTooltip } from './tooltip'

export * from './click-outside'
export * from './copy'
export * from './debounce'
export * from './drag'
export * from './infinite-scroll'
export * from './lazy'
export * from './loading'
export * from './resize'
export * from './throttle'
export * from './tooltip'

// 指令实例映射
export const directiveInstances = {
  'click-outside': clickOutsideDirective,
  copy: copyDirective,
  debounce: debounceDirective,
  throttle: throttleDirective,
  lazy: lazyDirective,
  loading: loadingDirective,
  tooltip: tooltipDirective,
  'infinite-scroll': infiniteScrollDirective,
  drag: dragDirective,
  resize: resizeDirective,
} as const

// Vue指令映射
export const vueDirectives = {
  'click-outside': vClickOutside,
  copy: vCopy,
  debounce: vDebounce,
  throttle: vThrottle,
  lazy: vLazy,
  loading: vLoading,
  tooltip: vTooltip,
  'infinite-scroll': vInfiniteScroll,
  drag: vDrag,
  resize: vResize,
} as const

// 指令类型定义
export type DirectiveName = keyof typeof directiveInstances
export type VueDirectiveName = keyof typeof vueDirectives

// 指令分类
export const directiveCategories = {
  interaction: ['click-outside', 'drag', 'infinite-scroll'],
  performance: ['debounce', 'throttle', 'lazy'],
  ui: ['loading', 'tooltip'],
  utility: ['copy', 'resize'],
} as const

export type DirectiveCategory = keyof typeof directiveCategories

// 获取指令实例
export function getDirectiveInstance(name: DirectiveName) {
  return directiveInstances[name]
}

// 获取Vue指令
export function getVueDirective(name: VueDirectiveName) {
  return vueDirectives[name]
}

// 获取分类下的指令
export function getDirectivesByCategory(category: DirectiveCategory) {
  return directiveCategories[category].map(
    name => directiveInstances[name as DirectiveName]
  )
}

// 获取所有指令名称
export function getAllDirectiveNames(): DirectiveName[] {
  return Object.keys(directiveInstances) as DirectiveName[]
}

// 获取所有Vue指令名称
export function getAllVueDirectiveNames(): VueDirectiveName[] {
  return Object.keys(vueDirectives) as VueDirectiveName[]
}

// 检查指令是否存在
export function hasDirective(name: string): name is DirectiveName {
  return name in directiveInstances
}

// 检查Vue指令是否存在
export function hasVueDirective(name: string): name is VueDirectiveName {
  return name in vueDirectives
}

// 批量获取指令
export function getDirectives(names: DirectiveName[]) {
  return names.map(name => directiveInstances[name]).filter(Boolean)
}

// 批量获取Vue指令
export function getVueDirectives(names: VueDirectiveName[]) {
  return names.reduce(
    (acc, name) => {
      acc[name] = vueDirectives[name]
      return acc
    },
    {} as Record<VueDirectiveName, import('vue').Directive>
  )
}

// 指令信息接口
export interface DirectiveInfo {
  name: string
  description: string
  version: string
  category: string
  tags: string[]
  instance: import('../base/directive-base').DirectiveBase
  vueDirective: import('vue').Directive
}

// 获取指令信息
export function getDirectiveInfo(name: DirectiveName): DirectiveInfo | null {
  const instance = directiveInstances[name]
  const vueDirective = vueDirectives[name]

  if (!instance || !vueDirective) {
    return null
  }

  return {
    name: instance.name,
    description: instance.description || '',
    version: instance.version,
    category: instance.category || 'utility',
    tags: instance.tags || [],
    instance,
    vueDirective,
  }
}

// 获取所有指令信息
export function getAllDirectiveInfo(): DirectiveInfo[] {
  return getAllDirectiveNames()
    .map(name => getDirectiveInfo(name))
    .filter((info): info is DirectiveInfo => info !== null)
}

// 搜索指令
export function searchDirectives(query: string): DirectiveInfo[] {
  const lowerQuery = query.toLowerCase()

  return getAllDirectiveInfo().filter(
    info =>
      info.name.toLowerCase().includes(lowerQuery) ||
      info.description.toLowerCase().includes(lowerQuery) ||
      info.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

// 默认导出所有指令实例
export default directiveInstances

// 使用示例
/*
// 导入特定指令
import { clickOutsideDirective, vClickOutside } from '@/directives/modules'

// 导入所有指令
import { directiveInstances, vueDirectives } from '@/directives/modules'

// 获取指令信息
import { getDirectiveInfo, getAllDirectiveInfo } from '@/directives/modules'

const clickOutsideInfo = getDirectiveInfo('click-outside')
console.log(clickOutsideInfo)

// 搜索指令
import { searchDirectives } from '@/directives/modules'

const performanceDirectives = searchDirectives('performance')
console.log(performanceDirectives)

// 按分类获取指令
import { getDirectivesByCategory } from '@/directives/modules'

const interactionDirectives = getDirectivesByCategory('interaction')
console.log(interactionDirectives)
*/
