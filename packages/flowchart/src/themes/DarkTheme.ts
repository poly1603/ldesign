/**
 * 深色主题
 * 
 * 基于 LDESIGN 设计系统的深色主题配置
 */

import type { ThemeConfig } from '../types'

/**
 * 深色主题配置
 */
export const DarkTheme: ThemeConfig = {
  name: 'dark',
  
  // 节点样式
  nodes: {
    // 开始节点
    start: {
      fill: '#1f4e3d',
      stroke: '#52c41a',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#ffffff'
    },
    
    // 审批节点
    approval: {
      fill: '#2a1a3e',
      stroke: '#722ED1',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#ffffff'
    },
    
    // 条件节点
    condition: {
      fill: '#3d3020',
      stroke: '#f5c538',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#ffffff'
    },
    
    // 结束节点
    end: {
      fill: '#3d1f1f',
      stroke: '#e54848',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#ffffff'
    },
    
    // 处理节点
    process: {
      fill: '#2a2a2a',
      stroke: '#808080',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#ffffff'
    },
    
    // 并行网关
    'parallel-gateway': {
      fill: '#2d2440',
      stroke: '#5e2aa7',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#ffffff'
    },
    
    // 排他网关
    'exclusive-gateway': {
      fill: '#3d3020',
      stroke: '#c2960f',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#ffffff'
    }
  },
  
  // 边样式
  edges: {
    stroke: '#555555',
    strokeWidth: 2,
    strokeDasharray: 'none'
  },
  
  // 画布样式
  canvas: {
    backgroundColor: '#1a1a1a'
  }
}
