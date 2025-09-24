/**
 * 蓝色主题
 * 
 * 基于蓝色色调的专业主题配置
 */

import type { ThemeConfig } from '../types'

/**
 * 蓝色主题配置
 */
export const BlueTheme: ThemeConfig = {
  name: 'blue',

  // 节点样式
  nodes: {
    // 开始节点
    start: {
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#001529'
    },

    // 审批节点
    approval: {
      fill: '#f0f5ff',
      stroke: '#2f54eb',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#001529'
    },

    // 条件节点
    condition: {
      fill: '#e6fffb',
      stroke: '#13c2c2',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#001529'
    },

    // 结束节点
    end: {
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#001529'
    },

    // 处理节点
    process: {
      fill: '#f0f2f5',
      stroke: '#595959',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#001529'
    },

    // 并行网关
    'parallel-gateway': {
      fill: '#f9f0ff',
      stroke: '#722ed1',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#001529'
    },

    // 排他网关
    'exclusive-gateway': {
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#001529'
    },

    // 用户任务
    'user-task': {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    },

    // 服务任务
    'service-task': {
      fill: '#f8f9fa',
      stroke: '#6c757d',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    },

    // 脚本任务
    'script-task': {
      fill: '#fff3cd',
      stroke: '#856404',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    },

    // 手工任务
    'manual-task': {
      fill: '#d4edda',
      stroke: '#155724',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    },

    // 包容网关
    'inclusive-gateway': {
      fill: '#e3f2fd',
      stroke: '#0d47a1',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    },

    // 事件网关
    'event-gateway': {
      fill: '#f8d7da',
      stroke: '#721c24',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    },

    // 定时事件
    'timer-event': {
      fill: '#fff3cd',
      stroke: '#856404',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    },

    // 消息事件
    'message-event': {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    },

    // 信号事件
    'signal-event': {
      fill: '#d4edda',
      stroke: '#155724',
      strokeWidth: 2,
      fontSize: 12,
      fontColor: '#495057'
    }
  },

  // 边样式
  edges: {
    stroke: '#40a9ff',
    strokeWidth: 2,
    strokeDasharray: 'none'
  },

  // 画布样式
  canvas: {
    backgroundColor: '#f0f8ff'
  }
}
