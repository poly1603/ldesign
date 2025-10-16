/**
 * 标题插件
 * 提供 H1-H6 标题功能
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 设置标题命令
 */
function setHeadingCommand(level: number): Command {
  return (state, dispatch) => {
    if (!dispatch) return true

    document.execCommand('formatBlock', false, `h${level}`)
    return true
  }
}

/**
 * 检查标题是否激�? */
function isHeadingActive(level: number) {
  return () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    const node = selection.anchorNode?.parentElement
    return node?.tagName === `H${level}`
  }
}

/**
 * 标题插件
 */
export const HeadingPlugin: Plugin = createPlugin({
  name: 'heading',
  commands: {
    setHeading1: setHeadingCommand(1),
    setHeading2: setHeadingCommand(2),
    setHeading3: setHeadingCommand(3),
    setHeading4: setHeadingCommand(4),
    setHeading5: setHeadingCommand(5),
    setHeading6: setHeadingCommand(6),
    setParagraph: (state, dispatch) => {
      if (!dispatch) return true
      document.execCommand('formatBlock', false, 'p')
      return true
    }
  },
  keys: {
    'Mod-Alt-1': setHeadingCommand(1),
    'Mod-Alt-2': setHeadingCommand(2),
    'Mod-Alt-3': setHeadingCommand(3),
    'Mod-Alt-4': setHeadingCommand(4),
    'Mod-Alt-5': setHeadingCommand(5),
    'Mod-Alt-6': setHeadingCommand(6),
    'Mod-Alt-0': (state, dispatch) => {
      if (!dispatch) return true
      document.execCommand('formatBlock', false, 'p')
      return true
    }
  },
  toolbar: [
    {
      name: 'heading1',
      title: '标题 1',
      icon: 'heading-1',
      command: setHeadingCommand(1),
      active: isHeadingActive(1)
    },
    {
      name: 'heading2',
      title: '标题 2',
      icon: 'heading-2',
      command: setHeadingCommand(2),
      active: isHeadingActive(2)
    },
    {
      name: 'heading3',
      title: '标题 3',
      icon: 'heading-3',
      command: setHeadingCommand(3),
      active: isHeadingActive(3)
    }
  ]
})
