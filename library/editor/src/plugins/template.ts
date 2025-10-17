/**
 * 模板插件
 * 提供模板管理和应用功能
 */

import { createPlugin } from '../core/Plugin'
import { TemplateManager } from '../template/TemplateManager'
import { showTemplateDialog } from '../ui/TemplateDialog'
import type { Template, ApplyTemplateOptions, TemplateCategory } from '../template/types'

// 全局模板管理器实例
let globalTemplateManager: TemplateManager | null = null

/**
 * 获取或创建模板管理器
 */
function getTemplateManager(): TemplateManager {
  if (!globalTemplateManager) {
    globalTemplateManager = new TemplateManager({
      storage: 'local',
      maxCustomTemplates: 50,
      enableVariables: true
    })
    // 初始化
    globalTemplateManager.init().catch(error => {
      console.error('Failed to initialize template manager:', error)
    })
  }
  return globalTemplateManager
}

const TemplatePlugin = createPlugin({
  name: 'template',
  config: {
    toolbar: {
      items: [
        {
          name: 'template',
          tooltip: '模板',
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="3" y1="9" x2="9" y2="9"/>
            <line x1="3" y1="15" x2="9" y2="15"/>
            <line x1="12" y1="7" x2="18" y2="7"/>
            <line x1="12" y1="12" x2="18" y2="12"/>
            <line x1="12" y1="17" x2="18" y2="17"/>
          </svg>`,
          action: 'template:show-dialog'
        }
      ]
    }
  },

  init(editor) {
    const templateManager = getTemplateManager()
    
    // 存储模板管理器到编辑器实例
    (editor as any).templateManager = templateManager

    // 注册命令：显示模板对话框
    editor.commands.register('template:show-dialog', {
      execute: () => {
        showTemplateDialog(templateManager, async (template) => {
          // 处理变量填充
          const options: ApplyTemplateOptions = {
            replaceContent: true
          }
          
          if (template.variables && template.variables.length > 0) {
            // 变量已在对话框中处理，这里直接应用
            await templateManager.applyTemplate(editor, template.metadata.id, options)
          } else {
            await templateManager.applyTemplate(editor, template.metadata.id, options)
          }
        })
      }
    })

    // 注册命令：从当前内容创建模板
    editor.commands.register('template:create-from-content', {
      execute: async () => {
        const content = editor.getContent()
        if (!content || content === '<p><br></p>') {
          alert('当前编辑器内容为空，无法创建模板')
          return
        }

        // 显示创建模板对话框
        showCreateTemplateDialog(editor, templateManager)
      }
    })

    // 注册命令：应用模板
    editor.commands.register('template:apply', {
      execute: async (templateId: string, options?: ApplyTemplateOptions) => {
        await templateManager.applyTemplate(editor, templateId, options)
      }
    })

    // 注册命令：导出模板
    editor.commands.register('template:export', {
      execute: async (templateId: string) => {
        try {
          const jsonStr = await templateManager.exportTemplate(templateId)
          downloadJSON(jsonStr, `template-${templateId}.json`)
        } catch (error) {
          console.error('Failed to export template:', error)
          alert('导出模板失败')
        }
      }
    })

    // 注册命令：导入模板
    editor.commands.register('template:import', {
      execute: async () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        
        input.addEventListener('change', async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = async (event) => {
              try {
                const jsonStr = event.target?.result as string
                await templateManager.importTemplate(jsonStr)
                alert('模板导入成功！')
              } catch (error) {
                alert('模板导入失败：' + error)
              }
            }
            reader.readAsText(file)
          }
        })
        
        input.click()
      }
    })

    // 注册快捷键
    editor.keymap.register({
      'Ctrl+Shift+T': 'template:show-dialog',
      'Cmd+Shift+T': 'template:show-dialog'
    })

    // 监听创建模板事件
    editor.on('template:create-from-content', () => {
      editor.commands.execute('template:create-from-content')
    })

    // 添加右键菜单项
    if (editor.contextMenuManager) {
      editor.contextMenuManager.registerItem({
        id: 'template',
        label: '模板',
        submenu: [
          {
            id: 'apply-template',
            label: '应用模板',
            action: () => editor.commands.execute('template:show-dialog')
          },
          {
            id: 'create-template',
            label: '从当前内容创建模板',
            action: () => editor.commands.execute('template:create-from-content')
          }
        ]
      })
    }
  },

  destroy() {
    if (globalTemplateManager) {
      globalTemplateManager.destroy()
      globalTemplateManager = null
    }
  }
})

/**
 * 显示创建模板对话框
 */
function showCreateTemplateDialog(editor: any, templateManager: TemplateManager): void {
  const dialog = document.createElement('div')
  dialog.className = 'template-create-dialog-overlay'
  
  dialog.innerHTML = `
    <div class="template-create-dialog">
      <div class="template-create-header">
        <h3>创建新模板</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="template-create-content">
        <div class="form-group">
          <label for="template-name">模板名称 <span class="required">*</span></label>
          <input type="text" id="template-name" placeholder="输入模板名称" />
        </div>
        <div class="form-group">
          <label for="template-desc">模板描述</label>
          <textarea id="template-desc" placeholder="输入模板描述（可选）" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="template-category">分类 <span class="required">*</span></label>
          <select id="template-category">
            <option value="business">商务</option>
            <option value="personal">个人</option>
            <option value="creative">创意</option>
            <option value="education">教育</option>
            <option value="technical">技术</option>
            <option value="custom" selected>自定义</option>
          </select>
        </div>
        <div class="form-group">
          <label for="template-tags">标签</label>
          <input type="text" id="template-tags" placeholder="用逗号分隔多个标签" />
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="extract-variables" checked />
            自动提取变量（检测 {{variable}} 格式）
          </label>
        </div>
      </div>
      <div class="template-create-footer">
        <button class="btn-secondary cancel-btn">取消</button>
        <button class="btn-primary save-btn">保存模板</button>
      </div>
    </div>
  `

  // 添加样式
  addCreateDialogStyles()

  document.body.appendChild(dialog)

  // 绑定事件
  const closeBtn = dialog.querySelector('.close-btn') as HTMLElement
  const cancelBtn = dialog.querySelector('.cancel-btn') as HTMLElement
  const saveBtn = dialog.querySelector('.save-btn') as HTMLElement

  const close = () => document.body.removeChild(dialog)

  closeBtn.addEventListener('click', close)
  cancelBtn.addEventListener('click', close)
  
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close()
  })

  saveBtn.addEventListener('click', async () => {
    const name = (dialog.querySelector('#template-name') as HTMLInputElement).value.trim()
    const description = (dialog.querySelector('#template-desc') as HTMLTextAreaElement).value.trim()
    const category = (dialog.querySelector('#template-category') as HTMLSelectElement).value as TemplateCategory
    const tagsStr = (dialog.querySelector('#template-tags') as HTMLInputElement).value.trim()
    // const extractVariables = (dialog.querySelector('#extract-variables') as HTMLInputElement).checked

    if (!name) {
      alert('请输入模板名称')
      return
    }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []

    try {
      const template = await templateManager.createTemplateFromContent(editor, {
        id: '',
        name,
        description,
        category,
        tags,
        author: 'User',
        isCustom: true
      })

      alert('模板创建成功！')
      close()
    } catch (error) {
      alert('创建模板失败：' + error)
    }
  })
}

/**
 * 下载 JSON 文件
 */
function downloadJSON(jsonStr: string, filename: string): void {
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 添加创建对话框样式
 */
function addCreateDialogStyles(): void {
  if (document.getElementById('template-create-dialog-styles')) return

  const style = document.createElement('style')
  style.id = 'template-create-dialog-styles'
  style.textContent = `
    .template-create-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .template-create-dialog {
      background: white;
      border-radius: 8px;
      width: 500px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .template-create-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .template-create-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .template-create-content {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .form-group input[type="text"],
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-group textarea {
      resize: vertical;
    }

    .form-group input[type="checkbox"] {
      margin-right: 8px;
    }

    .template-create-footer {
      padding: 15px 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .required {
      color: #e74c3c;
    }
  `
  document.head.appendChild(style)
}

export default TemplatePlugin
export { TemplatePlugin, getTemplateManager }