/**
 * 颜色插件
 * 提供文字颜色和背景颜色功能
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 设置文字颜色
 */
function setTextColor(color: string): Command {
  return (state, dispatch) => {
    if (!dispatch) return true
    document.execCommand('foreColor', false, color)
    return true
  }
}

/**
 * 设置背景颜色（高亮）
 */
function setBackgroundColor(color: string): Command {
  return (state, dispatch) => {
    if (!dispatch) return true
    document.execCommand('hiliteColor', false, color)
    return true
  }
}

/**
 * 预设颜色
 */
export const PRESET_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
  '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
  '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
  '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
  '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
  '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47',
  '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130'
]

/**
 * 文字颜色插件
 */
export const TextColorPlugin: Plugin = createPlugin({
  name: 'textColor',
  commands: {
    setTextColor: (state, dispatch, color: string) => {
      return setTextColor(color)(state, dispatch)
    }
  },
  toolbar: [{
    name: 'textColor',
    title: '文字颜色',
    icon: 'palette',
    command: (state, dispatch) => {
      // 这个会被颜色选择器覆盖
      return true
    }
  }]
})

/**
 * 背景颜色插件
 */
export const BackgroundColorPlugin: Plugin = createPlugin({
  name: 'backgroundColor',
  commands: {
    setBackgroundColor: (state, dispatch, color: string) => {
      return setBackgroundColor(color)(state, dispatch)
    }
  },
  toolbar: [{
    name: 'backgroundColor',
    title: '背景颜色',
    icon: 'highlighter',
    command: (state, dispatch) => {
      // 这个会被颜色选择器覆盖
      return true
    }
  }]
})
