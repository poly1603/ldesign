/**
 * 表单一致性检查报告生成器
 * 用于生成详细的一致性检查报告
 */

import { checkFormConsistency, printConsistencyReport, createStateSnapshot, type ImplementationState } from './formConsistencyChecker'

/**
 * 生成完整的一致性检查报告
 */
export function generateConsistencyReport() {
  console.group('🔍 表单实现一致性检查报告')
  
  // 从全局状态获取三种实现的状态快照
  const vanillaState = (window as any).vanillaFormState as ImplementationState
  const vueState = (window as any).vueFormState as ImplementationState  
  const webComponentsState = (window as any).webComponentsFormState as ImplementationState

  if (!vanillaState || !vueState || !webComponentsState) {
    console.warn('⚠️ 无法获取所有实现的状态快照，请确保已访问所有三个演示页面')
    console.groupEnd()
    return
  }

  // 执行一致性检查
  const result = checkFormConsistency(vanillaState, vueState, webComponentsState)
  
  // 打印详细报告
  printConsistencyReport(result)
  
  // 生成对比表格
  console.group('📊 详细对比数据')
  console.table({
    '原生JavaScript': {
      展开状态: vanillaState.isExpanded ? '展开' : '收起',
      可见行数: vanillaState.visibleRows,
      最大行数: vanillaState.maxRows,
      容器宽度: `${vanillaState.containerWidth}px`,
      动态列数: vanillaState.dynamicColumns,
      默认行数: vanillaState.config.defaultRowCount,
      按钮位置: vanillaState.config.actionPosition,
      按钮对齐: vanillaState.config.actionAlign
    },
    'Vue组件': {
      展开状态: vueState.isExpanded ? '展开' : '收起',
      可见行数: vueState.visibleRows,
      最大行数: vueState.maxRows,
      容器宽度: `${vueState.containerWidth}px`,
      动态列数: vueState.dynamicColumns,
      默认行数: vueState.config.defaultRowCount,
      按钮位置: vueState.config.actionPosition,
      按钮对齐: vueState.config.actionAlign
    },
    'Web Components': {
      展开状态: webComponentsState.isExpanded ? '展开' : '收起',
      可见行数: webComponentsState.visibleRows,
      最大行数: webComponentsState.maxRows,
      容器宽度: `${webComponentsState.containerWidth}px`,
      动态列数: webComponentsState.dynamicColumns,
      默认行数: webComponentsState.config.defaultRowCount,
      按钮位置: webComponentsState.config.actionPosition,
      按钮对齐: webComponentsState.config.actionAlign
    }
  })
  console.groupEnd()
  
  // 生成修复前后对比
  console.group('🔧 修复效果总结')
  console.log('✅ 修复前的问题:')
  console.log('  • 原生JavaScript显示所有行而非收起状态')
  console.log('  • Web Components显示收起状态而非展开状态')
  console.log('  • 三种实现的布局计算结果不一致')
  console.log('  • ResizeObserver触发时机不同')
  
  console.log('\n✅ 修复后的改进:')
  console.log('  • 统一了初始展开状态为false（收起）')
  console.log('  • 统一了布局计算逻辑和参数')
  console.log('  • 统一了ResizeObserver的实现和触发时机')
  console.log('  • 添加了调试信息和状态快照')
  console.log('  • 创建了一致性检查工具')
  
  if (result.isConsistent) {
    console.log('\n🎉 当前状态: 三种实现已达到一致性!')
  } else {
    console.log('\n⚠️ 当前状态: 仍存在不一致问题，需要进一步修复')
  }
  console.groupEnd()
  
  console.groupEnd()
  
  return result
}

/**
 * 在控制台中运行一致性检查
 * 可以在浏览器控制台中调用: window.checkConsistency()
 */
export function setupConsistencyChecker() {
  ;(window as any).checkConsistency = generateConsistencyReport
  console.log('🔧 一致性检查工具已就绪，在控制台中运行 checkConsistency() 来生成报告')
}
