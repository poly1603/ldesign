/**
 * 媒体命令插件
 * 注册所有媒体相关的命令
 */

import type { Plugin } from '../../types'

const MediaCommandsPlugin: Plugin = {
  name: 'MediaCommands',
  install(editor: any) {
    // 注册插入图片命令
    editor.commandManager.registerCommand('insertImage', {
      execute: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e: any) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e: any) => {
              const img = document.createElement('img')
              img.src = e.target.result
              img.style.maxWidth = '100%'
              editor.insertNode(img)
            }
            reader.readAsDataURL(file)
          }
        }
        input.click()
        return true
      }
    })

    // 注册插入视频命令
    editor.commandManager.registerCommand('insertVideo', {
      execute: () => {
        const url = prompt('请输入视频URL:')
        if (url) {
          const video = document.createElement('video')
          video.src = url
          video.controls = true
          video.style.maxWidth = '100%'
          editor.insertNode(video)
        }
        return true
      }
    })

    // 注册插入音频命令
    editor.commandManager.registerCommand('insertAudio', {
      execute: () => {
        const url = prompt('请输入音频URL:')
        if (url) {
          const audio = document.createElement('audio')
          audio.src = url
          audio.controls = true
          editor.insertNode(audio)
        }
        return true
      }
    })

    // 注册插入表格命令
    editor.commandManager.registerCommand('insertTable', {
      execute: () => {
        const rows = prompt('请输入行数:', '3')
        const cols = prompt('请输入列数:', '3')
        if (rows && cols) {
          const table = document.createElement('table')
          table.style.borderCollapse = 'collapse'
          table.style.width = '100%'
          
          for (let i = 0; i < parseInt(rows); i++) {
            const tr = document.createElement('tr')
            for (let j = 0; j < parseInt(cols); j++) {
              const td = document.createElement('td')
              td.style.border = '1px solid #ddd'
              td.style.padding = '8px'
              td.innerHTML = '&nbsp;'
              tr.appendChild(td)
            }
            table.appendChild(tr)
          }
          
          editor.insertNode(table)
        }
        return true
      }
    })

    // 注册插入代码块命令
    editor.commandManager.registerCommand('insertCodeBlock', {
      execute: () => {
        const pre = document.createElement('pre')
        const code = document.createElement('code')
        code.textContent = '// 在这里输入代码'
        pre.appendChild(code)
        pre.style.background = '#f4f4f4'
        pre.style.padding = '10px'
        pre.style.borderRadius = '4px'
        editor.insertNode(pre)
        return true
      }
    })

    // 注册插入表情命令
    editor.commandManager.registerCommand('insertEmoji', {
      execute: () => {
        const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗']
        const emoji = prompt('选择表情 (1-16):\n' + emojis.map((e, i) => `${i+1}: ${e}`).join(' '))
        if (emoji) {
          const index = parseInt(emoji) - 1
          if (index >= 0 && index < emojis.length) {
            editor.insertText(emojis[index])
          }
        }
        return true
      }
    })

    console.log('[MediaCommandsPlugin] All media commands registered')
  }
}

export default MediaCommandsPlugin