/**
 * 表单一致性检查工具
 * 用于确保三种实现方式在相同配置下表现一致
 */

import type { FormConfig, FieldConfig, LayoutResult } from './formLayoutUtils'

export interface ConsistencyCheckResult {
  isConsistent: boolean
  issues: string[]
  recommendations: string[]
}

export interface ImplementationState {
  name: string
  isExpanded: boolean
  visibleRows: number
  maxRows: number
  containerWidth: number
  dynamicColumns: number
  config: FormConfig
  fields: FieldConfig[]
  layoutResult?: LayoutResult
}

/**
 * 检查三种实现的一致性
 */
export function checkFormConsistency(
  vanillaState: ImplementationState,
  vueState: ImplementationState,
  webComponentsState: ImplementationState
): ConsistencyCheckResult {
  const issues: string[] = []
  const recommendations: string[] = []

  // 检查配置一致性
  checkConfigConsistency([vanillaState, vueState, webComponentsState], issues)

  // 检查状态一致性
  checkStateConsistency([vanillaState, vueState, webComponentsState], issues)

  // 检查布局计算一致性
  checkLayoutConsistency([vanillaState, vueState, webComponentsState], issues)

  // 生成修复建议
  generateRecommendations(issues, recommendations)

  return {
    isConsistent: issues.length === 0,
    issues,
    recommendations
  }
}

/**
 * 检查配置一致性
 */
function checkConfigConsistency(states: ImplementationState[], issues: string[]) {
  const [vanilla, vue, webComponents] = states

  // 检查关键配置项
  const configKeys: (keyof FormConfig)[] = [
    'defaultRowCount',
    'collapsible',
    'actionPosition',
    'actionAlign',
    'layoutMode',
    'minFieldWidth',
    'buttonColumns'
  ]

  configKeys.forEach(key => {
    const vanillaValue = vanilla.config[key]
    const vueValue = vue.config[key]
    const webComponentsValue = webComponents.config[key]

    if (vanillaValue !== vueValue || vueValue !== webComponentsValue) {
      issues.push(`配置项 ${key} 不一致: 原生JS(${vanillaValue}), Vue(${vueValue}), Web Components(${webComponentsValue})`)
    }
  })
}

/**
 * 检查状态一致性
 */
function checkStateConsistency(states: ImplementationState[], issues: string[]) {
  const [vanilla, vue, webComponents] = states

  // 检查展开状态
  if (vanilla.isExpanded !== vue.isExpanded || vue.isExpanded !== webComponents.isExpanded) {
    issues.push(`展开状态不一致: 原生JS(${vanilla.isExpanded}), Vue(${vue.isExpanded}), Web Components(${webComponents.isExpanded})`)
  }

  // 检查可见行数
  if (vanilla.visibleRows !== vue.visibleRows || vue.visibleRows !== webComponents.visibleRows) {
    issues.push(`可见行数不一致: 原生JS(${vanilla.visibleRows}), Vue(${vue.visibleRows}), Web Components(${webComponents.visibleRows})`)
  }

  // 检查最大行数
  if (vanilla.maxRows !== vue.maxRows || vue.maxRows !== webComponents.maxRows) {
    issues.push(`最大行数不一致: 原生JS(${vanilla.maxRows}), Vue(${vue.maxRows}), Web Components(${webComponents.maxRows})`)
  }

  // 检查容器宽度（允许小幅差异）
  const widthTolerance = 10
  if (Math.abs(vanilla.containerWidth - vue.containerWidth) > widthTolerance ||
      Math.abs(vue.containerWidth - webComponents.containerWidth) > widthTolerance) {
    issues.push(`容器宽度差异过大: 原生JS(${vanilla.containerWidth}), Vue(${vue.containerWidth}), Web Components(${webComponents.containerWidth})`)
  }

  // 检查动态列数
  if (vanilla.dynamicColumns !== vue.dynamicColumns || vue.dynamicColumns !== webComponents.dynamicColumns) {
    issues.push(`动态列数不一致: 原生JS(${vanilla.dynamicColumns}), Vue(${vue.dynamicColumns}), Web Components(${webComponents.dynamicColumns})`)
  }
}

/**
 * 检查布局计算一致性
 */
function checkLayoutConsistency(states: ImplementationState[], issues: string[]) {
  const [vanilla, vue, webComponents] = states

  if (!vanilla.layoutResult || !vue.layoutResult || !webComponents.layoutResult) {
    issues.push('某些实现缺少布局计算结果')
    return
  }

  const layoutKeys: (keyof LayoutResult)[] = [
    'visibleRows',
    'dynamicColumns',
    'shouldButtonsInRow',
    'lastVisibleRow'
  ]

  layoutKeys.forEach(key => {
    const vanillaValue = vanilla.layoutResult![key]
    const vueValue = vue.layoutResult![key]
    const webComponentsValue = webComponents.layoutResult![key]

    if (vanillaValue !== vueValue || vueValue !== webComponentsValue) {
      issues.push(`布局计算结果 ${key} 不一致: 原生JS(${vanillaValue}), Vue(${vueValue}), Web Components(${webComponentsValue})`)
    }
  })
}

/**
 * 生成修复建议
 */
function generateRecommendations(issues: string[], recommendations: string[]) {
  if (issues.some(issue => issue.includes('配置项'))) {
    recommendations.push('统一三种实现的配置对象结构和默认值')
  }

  if (issues.some(issue => issue.includes('展开状态'))) {
    recommendations.push('确保三种实现的初始展开状态一致，都设置为 false')
  }

  if (issues.some(issue => issue.includes('容器宽度'))) {
    recommendations.push('统一容器宽度获取方法，确保ResizeObserver在相同时机触发')
  }

  if (issues.some(issue => issue.includes('布局计算'))) {
    recommendations.push('确保三种实现都使用相同的布局计算函数和参数')
  }

  if (issues.some(issue => issue.includes('动态列数'))) {
    recommendations.push('检查动态列数计算逻辑，确保使用相同的算法')
  }
}

/**
 * 打印一致性检查报告
 */
export function printConsistencyReport(result: ConsistencyCheckResult) {
  console.group('🔍 表单一致性检查报告')
  
  if (result.isConsistent) {
    console.log('✅ 三种实现表现一致')
  } else {
    console.warn('❌ 发现不一致问题:')
    result.issues.forEach(issue => console.warn(`  • ${issue}`))
    
    console.log('\n💡 修复建议:')
    result.recommendations.forEach(rec => console.log(`  • ${rec}`))
  }
  
  console.groupEnd()
}

/**
 * 创建实现状态快照
 */
export function createStateSnapshot(
  name: string,
  isExpanded: boolean,
  visibleRows: number,
  maxRows: number,
  containerWidth: number,
  dynamicColumns: number,
  config: FormConfig,
  fields: FieldConfig[],
  layoutResult?: LayoutResult
): ImplementationState {
  return {
    name,
    isExpanded,
    visibleRows,
    maxRows,
    containerWidth,
    dynamicColumns,
    config,
    fields,
    layoutResult
  }
}
