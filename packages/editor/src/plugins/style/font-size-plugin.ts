/**
 * 字体大小插件
 * 提供字体大小设置功能
 */

import type { Command, IEditor } from '../../types'
import { BasePlugin } from '../base-plugin'
import { Dropdown, DropdownOption } from '../../components/dropdown'

/**
 * 字体大小插件实现
 */
export class FontSizePlugin extends BasePlugin {
  public readonly name = 'fontSize'
  public readonly version = '1.0.0'
  public readonly description = '字体大小功能插件'

  /** 下拉菜单实例 */
  private dropdown: Dropdown | null = null

  /** 字体大小选项 */
  private fontSizeOptions: DropdownOption[] = [
    { value: '12px', label: '12px (小号)' },
    { value: '14px', label: '14px (正常)' },
    { value: '16px', label: '16px (中等)' },
    { value: '18px', label: '18px (大号)' },
    { value: '20px', label: '20px (更大)' },
    { value: '24px', label: '24px (超大)' },
    { value: '28px', label: '28px (巨大)' },
    { value: '32px', label: '32px (特大)' },
    { value: '36px', label: '36px (极大)' },
    { value: '48px', label: '48px (标题)' }
  ]

  /**
   * 获取插件命令
   */
  getCommands(): Command[] {
    return [
      {
        name: 'fontSize',
        execute: this.showFontSizeDropdown.bind(this),
        canExecute: this.canSetFontSize.bind(this),
        isActive: () => false
      }
    ]
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems() {
    return ['fontSize']
  }

  /**
   * 显示字体大小下拉菜单
   * @param editor 编辑器实例
   * @returns 是否成功执行
   */
  private showFontSizeDropdown(editor: IEditor): boolean {
    try {
      if (this.dropdown) {
        this.dropdown.destroy()
      }

      this.dropdown = new Dropdown({
        options: this.fontSizeOptions,
        placeholder: '字体大小',
        onSelect: (option) => {
          this.setFontSize(editor, option.value)
          this.dropdown?.destroy()
          this.dropdown = null
        }
      })

      // 获取工具栏按钮位置
      const button = document.querySelector('[data-command="fontSize"]')
      if (button) {
        const dropdownElement = this.dropdown.render()
        dropdownElement.style.position = 'absolute'
        dropdownElement.style.zIndex = '1000'
        
        // 定位下拉菜单
        const rect = button.getBoundingClientRect()
        dropdownElement.style.top = `${rect.bottom + 5}px`
        dropdownElement.style.left = `${rect.left}px`
        
        document.body.appendChild(dropdownElement)
        this.dropdown.open()
      }

      return true
    } catch (error) {
      this.log('error', 'Error showing font size dropdown:', error)
      return false
    }
  }

  /**
   * 设置字体大小
   * @param editor 编辑器实例
   * @param size 字体大小
   * @returns 是否成功执行
   */
  private setFontSize(editor: IEditor, size: string): boolean {
    try {
      const selection = editor.selection.getSelection()
      if (!selection || selection.collapsed) {
        return false
      }

      // 使用自定义实现，因为 execCommand 的 fontSize 命令不太可靠
      const range = editor.selection.getRange()
      if (!range) {
        return false
      }

      // 创建 span 元素包裹选中的文本
      const span = document.createElement('span')
      span.style.fontSize = size
      
      try {
        range.surroundContents(span)
        
        // 触发内容变更事件
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', `Font size set to ${size}`)
        return true
      } catch (error) {
        // 如果 surroundContents 失败，使用替代方法
        const selectedContent = range.extractContents()
        span.appendChild(selectedContent)
        range.insertNode(span)
        
        // 重新选择包装后的内容
        range.selectNodeContents(span)
        editor.selection.setRange(range)
        
        const content = editor.getContent()
        editor.events.emit('contentChange' as any, { content })
        
        this.log('info', `Font size set to ${size} (alternative method)`)
        return true
      }
    } catch (error) {
      this.log('error', 'Error setting font size:', error)
      return false
    }
  }

  /**
   * 检查是否可以设置字体大小
   * @param editor 编辑器实例
   * @returns 是否可以执行
   */
  private canSetFontSize(editor: IEditor): boolean {
    if (editor.state.readonly) {
      return false
    }

    const selection = editor.selection.getSelection()
    return selection !== null && !selection.collapsed
  }

  /**
   * 插件初始化
   */
  protected onInit(): void {
    this.log('info', 'Font size plugin initialized')
  }

  /**
   * 插件销毁
   */
  protected onDestroy(): void {
    if (this.dropdown) {
      this.dropdown.destroy()
      this.dropdown = null
    }
    this.log('info', 'Font size plugin destroyed')
  }
}
