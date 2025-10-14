/**
 * 右键菜单插件
 * 集成右键菜单管理器到编辑器中
 */

import type { Plugin } from '../types'
import { getContextMenuManager, registerContextMenu } from '../core/ContextMenuManager'
// EnhancedImageMenu 不存在，图片菜单将通过其他方式注册
import { getLucideIcon } from '../utils/icons'
import { Toast } from '../components/UIComponents'

export default {
  name: 'context-menu',
  
  install(editor) {
    const manager = getContextMenuManager()
    
    // 设置编辑器容器
    if (editor.contentElement) {
      manager.setContainer(editor.contentElement)
    }
    
    // 图片菜单注册已移至其他插件
    console.log('[ContextMenu] Context menu plugin loaded')
    
    // 注册文本选择右键菜单
    registerContextMenu({
      id: 'text-selection-menu',
      selector: '.ldesign-editor-content',
      priority: 1,
      condition: (element) => {
        const selection = window.getSelection()
        return selection !== null && selection.toString().length > 0
      },
      items: (context) => {
        const selection = window.getSelection()
        const selectedText = selection?.toString() || ''
        
        return [
          {
            label: '剪切',
            icon: getLucideIcon('scissors'),
            shortcut: 'Ctrl+X',
            action: () => {
              document.execCommand('cut')
            }
          },
          {
            label: '复制',
            icon: getLucideIcon('copy'),
            shortcut: 'Ctrl+C',
            action: () => {
              document.execCommand('copy')
              Toast.show('已复制到剪贴板', 'success')
            }
          },
          {
            label: '粘贴',
            icon: getLucideIcon('clipboard'),
            shortcut: 'Ctrl+V',
            action: async () => {
              try {
                const text = await navigator.clipboard.readText()
                document.execCommand('insertText', false, text)
              } catch (err) {
                document.execCommand('paste')
              }
            }
          },
          { divider: true },
          {
            label: '格式',
            icon: getLucideIcon('type'),
            submenu: [
              {
                label: '加粗',
                icon: getLucideIcon('bold'),
                shortcut: 'Ctrl+B',
                action: () => editor.commands.bold()
              },
              {
                label: '斜体',
                icon: getLucideIcon('italic'),
                shortcut: 'Ctrl+I',
                action: () => editor.commands.italic()
              },
              {
                label: '下划线',
                icon: getLucideIcon('underline'),
                shortcut: 'Ctrl+U',
                action: () => editor.commands.underline()
              },
              {
                label: '删除线',
                icon: getLucideIcon('strikethrough'),
                action: () => editor.commands.strikethrough()
              },
              { divider: true },
              {
                label: '代码',
                icon: getLucideIcon('code'),
                action: () => editor.commands.code()
              },
              {
                label: '高亮',
                icon: getLucideIcon('highlighter'),
                action: () => editor.commands.highlight()
              },
              {
                label: '上标',
                icon: getLucideIcon('superscript'),
                action: () => editor.commands.superscript()
              },
              {
                label: '下标',
                icon: getLucideIcon('subscript'),
                action: () => editor.commands.subscript()
              }
            ]
          },
          {
            label: '转换为',
            icon: getLucideIcon('refresh'),
            submenu: [
              {
                label: '大写',
                action: () => {
                  const upper = selectedText.toUpperCase()
                  document.execCommand('insertText', false, upper)
                }
              },
              {
                label: '小写',
                action: () => {
                  const lower = selectedText.toLowerCase()
                  document.execCommand('insertText', false, lower)
                }
              },
              {
                label: '首字母大写',
                action: () => {
                  const capitalized = selectedText.replace(/\b\w/g, c => c.toUpperCase())
                  document.execCommand('insertText', false, capitalized)
                }
              },
              { divider: true },
              {
                label: '链接',
                icon: getLucideIcon('link'),
                action: () => editor.commands.link()
              },
              {
                label: '引用',
                icon: getLucideIcon('quote'),
                action: () => editor.commands.blockquote()
              }
            ]
          },
          { divider: true },
          {
            label: '搜索',
            icon: getLucideIcon('search'),
            submenu: [
              {
                label: '在Google搜索',
                icon: getLucideIcon('globe'),
                action: () => {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedText)}`, '_blank')
                }
              },
              {
                label: '在百度搜索',
                icon: getLucideIcon('globe'),
                action: () => {
                  window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(selectedText)}`, '_blank')
                }
              },
              {
                label: '在维基百科搜索',
                icon: getLucideIcon('bookOpen'),
                action: () => {
                  window.open(`https://zh.wikipedia.org/wiki/${encodeURIComponent(selectedText)}`, '_blank')
                }
              }
            ]
          }
        ]
      }
    })
    
    // 注册段落右键菜单
    registerContextMenu({
      id: 'paragraph-menu',
      selector: '.ldesign-editor-content p, .ldesign-editor-content div',
      priority: 0,
      items: [
        {
          label: '段落格式',
          icon: getLucideIcon('alignLeft'),
          submenu: [
            {
              label: '左对齐',
              icon: getLucideIcon('alignLeft'),
              action: () => editor.commands.align('left')
            },
            {
              label: '居中',
              icon: getLucideIcon('alignCenter'),
              action: () => editor.commands.align('center')
            },
            {
              label: '右对齐',
              icon: getLucideIcon('alignRight'),
              action: () => editor.commands.align('right')
            },
            {
              label: '两端对齐',
              icon: getLucideIcon('alignJustify'),
              action: () => editor.commands.align('justify')
            }
          ]
        },
        {
          label: '插入',
          icon: getLucideIcon('plus'),
          submenu: [
            {
              label: '图片',
              icon: getLucideIcon('image'),
              action: () => editor.commands.insertImage()
            },
            {
              label: '表格',
              icon: getLucideIcon('table'),
              action: () => editor.commands.insertTable()
            },
            {
              label: '链接',
              icon: getLucideIcon('link'),
              action: () => editor.commands.insertLink()
            },
            {
              label: '水平线',
              icon: getLucideIcon('minus'),
              action: () => editor.commands.horizontalRule()
            },
            { divider: true },
            {
              label: '代码块',
              icon: getLucideIcon('code'),
              action: () => editor.commands.codeBlock()
            },
            {
              label: '引用',
              icon: getLucideIcon('quote'),
              action: () => editor.commands.blockquote()
            },
            {
              label: '列表',
              icon: getLucideIcon('list'),
              submenu: [
                {
                  label: '无序列表',
                  icon: getLucideIcon('list'),
                  action: () => editor.commands.bulletList()
                },
                {
                  label: '有序列表',
                  icon: getLucideIcon('listOrdered'),
                  action: () => editor.commands.orderedList()
                },
                {
                  label: '任务列表',
                  icon: getLucideIcon('checkSquare'),
                  action: () => editor.commands.taskList()
                }
              ]
            }
          ]
        },
        { divider: true },
        {
          label: '全选',
          icon: getLucideIcon('checkCircle'),
          shortcut: 'Ctrl+A',
          action: () => {
            document.execCommand('selectAll')
          }
        },
        {
          label: '粘贴',
          icon: getLucideIcon('clipboard'),
          shortcut: 'Ctrl+V',
          action: async () => {
            try {
              const text = await navigator.clipboard.readText()
              document.execCommand('insertText', false, text)
            } catch (err) {
              document.execCommand('paste')
            }
          }
        }
      ]
    })
    
    // 注册表格右键菜单
    registerContextMenu({
      id: 'table-menu',
      selector: '.ldesign-editor-content table td, .ldesign-editor-content table th',
      priority: 5,
      items: (context) => {
        const cell = context.element.closest('td, th')
        const row = cell?.closest('tr')
        const table = row?.closest('table')
        
        return [
          {
            label: '表格操作',
            icon: getLucideIcon('table'),
            submenu: [
              {
                label: '插入行',
                submenu: [
                  {
                    label: '在上方插入',
                    icon: getLucideIcon('arrowUp'),
                    action: () => editor.commands.addRowBefore()
                  },
                  {
                    label: '在下方插入',
                    icon: getLucideIcon('arrowDown'),
                    action: () => editor.commands.addRowAfter()
                  }
                ]
              },
              {
                label: '插入列',
                submenu: [
                  {
                    label: '在左侧插入',
                    icon: getLucideIcon('arrowLeft'),
                    action: () => editor.commands.addColumnBefore()
                  },
                  {
                    label: '在右侧插入',
                    icon: getLucideIcon('arrowRight'),
                    action: () => editor.commands.addColumnAfter()
                  }
                ]
              },
              { divider: true },
              {
                label: '删除行',
                icon: getLucideIcon('trash2'),
                action: () => editor.commands.deleteRow()
              },
              {
                label: '删除列',
                icon: getLucideIcon('trash2'),
                action: () => editor.commands.deleteColumn()
              },
              {
                label: '删除表格',
                icon: getLucideIcon('trash2'),
                action: () => editor.commands.deleteTable()
              }
            ]
          },
          {
            label: '单元格',
            icon: getLucideIcon('square'),
            submenu: [
              {
                label: '合并单元格',
                icon: getLucideIcon('gitMerge'),
                action: () => editor.commands.mergeCells()
              },
              {
                label: '拆分单元格',
                icon: getLucideIcon('gitBranch'),
                action: () => editor.commands.splitCell()
              },
              { divider: true },
              {
                label: '设为表头',
                action: () => editor.commands.toggleHeaderCell()
              }
            ]
          },
          {
            label: '表格样式',
            icon: getLucideIcon('palette'),
            submenu: [
              {
                label: '边框样式',
                submenu: [
                  {
                    label: '无边框',
                    action: () => Toast.show('边框样式功能开发中...', 'info')
                  },
                  {
                    label: '细边框',
                    action: () => Toast.show('边框样式功能开发中...', 'info')
                  },
                  {
                    label: '粗边框',
                    action: () => Toast.show('边框样式功能开发中...', 'info')
                  }
                ]
              },
              {
                label: '条纹样式',
                action: () => Toast.show('条纹样式功能开发中...', 'info')
              },
              {
                label: '圆角样式',
                action: () => Toast.show('圆角样式功能开发中...', 'info')
              }
            ]
          }
        ]
      }
    })
    
    // 注册链接右键菜单
    registerContextMenu({
      id: 'link-menu',
      selector: '.ldesign-editor-content a',
      priority: 5,
      items: (context) => {
        const link = context.element as HTMLAnchorElement
        const href = link.href
        
        return [
          {
            label: '打开链接',
            icon: getLucideIcon('externalLink'),
            action: () => window.open(href, '_blank')
          },
          {
            label: '复制链接',
            icon: getLucideIcon('copy'),
            action: async () => {
              await navigator.clipboard.writeText(href)
              Toast.show('链接已复制', 'success')
            }
          },
          { divider: true },
          {
            label: '编辑链接',
            icon: getLucideIcon('edit'),
            action: () => editor.commands.editLink(link)
          },
          {
            label: '移除链接',
            icon: getLucideIcon('unlink'),
            action: () => editor.commands.unlink()
          }
        ]
      }
    })
    
    // 添加命令
    editor.commands.register('showContextMenu', (menuId: string) => {
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2
      })
      
      manager.trigger(event, menuId)
    })
    
    // 导出管理器供外部使用
    editor.contextMenuManager = manager
    
    console.log('[ContextMenu] Plugin installed')
  }
} as Plugin