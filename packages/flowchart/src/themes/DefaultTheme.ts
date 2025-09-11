/**
 * 默认主题
 * 
 * 基于 LDESIGN 设计系统的默认主题配置
 */

import type { ThemeConfig } from '../types'

/**
 * 默认主题配置
 */
export const DefaultTheme: ThemeConfig = {
  name: 'default',
  
  // 节点样式
  nodes: {
    // 开始节点
    start: {
      fill: 'var(--ldesign-success-color-1, #ebfaeb)',
      stroke: 'var(--ldesign-success-color, #52c41a)',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))'
    },
    
    // 审批节点
    approval: {
      fill: 'var(--ldesign-brand-color-1, #f1ecf9)',
      stroke: 'var(--ldesign-brand-color, #722ED1)',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))'
    },
    
    // 条件节点
    condition: {
      fill: 'var(--ldesign-warning-color-1, #fff8e6)',
      stroke: 'var(--ldesign-warning-color, #f5c538)',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))'
    },
    
    // 结束节点
    end: {
      fill: 'var(--ldesign-error-color-1, #fde8e8)',
      stroke: 'var(--ldesign-error-color, #e54848)',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))'
    },
    
    // 处理节点
    process: {
      fill: 'var(--ldesign-gray-color-1, #f2f2f2)',
      stroke: 'var(--ldesign-gray-color-6, #808080)',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))'
    },
    
    // 并行网关
    'parallel-gateway': {
      fill: 'var(--ldesign-brand-color-2, #d8c8ee)',
      stroke: 'var(--ldesign-brand-color-7, #5e2aa7)',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))'
    },
    
    // 排他网关
    'exclusive-gateway': {
      fill: 'var(--ldesign-warning-color-2, #feecb9)',
      stroke: 'var(--ldesign-warning-color-7, #c2960f)',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: 'var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9))'
    }
  },
  
  // 边样式
  edges: {
    stroke: 'var(--ldesign-border-color, #d9d9d9)',
    strokeWidth: 2,
    strokeDasharray: 'none'
  },
  
  // 画布样式
  canvas: {
    backgroundColor: 'var(--ldesign-bg-color-container, #ffffff)'
  }
}
