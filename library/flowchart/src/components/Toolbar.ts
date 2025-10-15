import { ApprovalFlowEditor } from '../core/ApprovalFlowEditor'
import * as icons from 'lucide'

export interface ToolbarOptions {
    container?: HTMLElement | string
    position?: 'top' | 'bottom' | 'left' | 'right'
    tools?: ToolbarTool[]
}

export interface ToolbarTool {
    name: string
    icon: string
    title: string
    action: (editor: ApprovalFlowEditor) => void
    separator?: boolean
    visible?: boolean | ((editor: ApprovalFlowEditor) => boolean)
}

export class Toolbar {
    private editor: ApprovalFlowEditor
    private container: HTMLElement
    private options: ToolbarOptions
    private element: HTMLElement | null = null
    private defaultTools: ToolbarTool[] = [
        {
            name: 'undo',
            icon: 'Undo2',
            title: '撤销',
            action: (editor) => editor.undo()
        },
        {
            name: 'redo',
            icon: 'Redo2',
            title: '重做',
            action: (editor) => editor.redo()
        },
        {
            name: 'separator1',
            icon: '',
            title: '',
            separator: true,
            action: () => {}
        },
        {
            name: 'zoomIn',
            icon: 'ZoomIn',
            title: '放大',
            action: (editor) => editor.zoom(0.1)
        },
        {
            name: 'zoomOut',
            icon: 'ZoomOut',
            title: '缩小',
            action: (editor) => editor.zoom(-0.1)
        },
        {
            name: 'zoomToFit',
            icon: 'Maximize2',
            title: '适应画布',
            action: (editor) => editor.zoomToFit()
        },
        {
            name: 'zoomToOrigin',
            icon: 'Home',
            title: '还原',
            action: (editor) => editor.zoomTo(1)
        },
        {
            name: 'separator2',
            icon: '',
            title: '',
            separator: true,
            action: () => {}
        },
        {
            name: 'centerContent',
            icon: 'Focus',
            title: '居中内容',
            action: (editor) => editor.centerContent()
        },
        {
            name: 'fullscreen',
            icon: 'Fullscreen',
            title: '全屏',
            action: (editor) => editor.toggleFullscreen()
        },
        {
            name: 'separator3',
            icon: '',
            title: '',
            separator: true,
            action: () => {}
        },
        {
            name: 'export',
            icon: 'Download',
            title: '导出数据',
            action: (editor) => {
                const data = editor.toJSON()
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'flowchart.json'
                a.click()
                URL.revokeObjectURL(url)
            }
        },
        {
            name: 'exportImage',
            icon: 'Image',
            title: '导出图片',
            action: async (editor) => {
                await editor.exportPNG('flowchart.png')
            }
        },
        {
            name: 'separator4',
            icon: '',
            title: '',
            separator: true,
            action: () => {}
        },
        {
            name: 'validate',
            icon: 'CheckCircle',
            title: '验证流程',
            action: (editor) => {
                const validation = editor.validate()
                if (validation.valid) {
                    alert('流程验证通过！')
                } else {
                    alert(`流程验证失败：\\n${validation.errors.join('\\n')}`)
                }
            }
        },
        {
            name: 'clear',
            icon: 'Trash2',
            title: '清空画布',
            action: (editor) => {
                if (confirm('确定要清空画布吗？此操作不可撤销。')) {
                    editor.clearGraph()
                }
            }
        }
    ]

    constructor(editor: ApprovalFlowEditor, options: ToolbarOptions = {}) {
        this.editor = editor
        this.options = options
        this.container = this.resolveContainer(options.container)
        this.init()
    }

    private resolveContainer(container?: HTMLElement | string): HTMLElement {
        if (!container) {
            // 如果没有指定容器，创建一个默认容器
            const defaultContainer = document.createElement('div')
            defaultContainer.className = 'flowchart-toolbar-container'
            return defaultContainer
        }
        if (typeof container === 'string') {
            const el = document.querySelector(container) as HTMLElement
            if (!el) {
                throw new Error(`Toolbar container not found: ${container}`)
            }
            return el
        }
        return container
    }

    private init() {
        this.render()
        this.bindEvents()
        this.updateButtonStates()
    }

    private render() {
        const tools = this.options.tools || this.defaultTools
        
        // 创建工具栏元素
        this.element = document.createElement('div')
        this.element.className = `flowchart-toolbar flowchart-toolbar-${this.options.position || 'top'}`
        
        // 添加工具按钮
        tools.forEach(tool => {
            if (tool.separator) {
                const separator = document.createElement('div')
                separator.className = 'flowchart-toolbar-separator'
                this.element!.appendChild(separator)
            } else {
                const button = this.createToolButton(tool)
                if (button) {
                    this.element!.appendChild(button)
                }
            }
        })
        
        // 添加到容器
        this.container.appendChild(this.element)
        
        // 如果容器是编辑器的容器，调整位置
        if (this.container === this.editor.getContainer()) {
            this.container.style.position = 'relative'
            this.element.style.position = 'absolute'
            this.adjustPosition()
        }
    }

    private createToolButton(tool: ToolbarTool): HTMLElement | null {
        // 检查是否可见
        if (tool.visible !== undefined) {
            const visible = typeof tool.visible === 'function' ? tool.visible(this.editor) : tool.visible
            if (!visible) {
                return null
            }
        }

        const button = document.createElement('button')
        button.className = 'flowchart-toolbar-button'
        button.title = tool.title
        button.dataset.tool = tool.name
        
        // 添加图标
        const IconComponent = (icons as any)[tool.icon]
        if (IconComponent) {
            button.innerHTML = IconComponent.replace(/width="[^"]*"/, 'width="18"')
                                           .replace(/height="[^"]*"/, 'height="18"')
        }
        
        // 绑定点击事件
        button.addEventListener('click', () => {
            tool.action(this.editor)
            this.updateButtonStates()
        })
        
        return button
    }

    private adjustPosition() {
        if (!this.element) return
        
        const position = this.options.position || 'top'
        switch (position) {
            case 'top':
                this.element.style.top = '10px'
                this.element.style.left = '50%'
                this.element.style.transform = 'translateX(-50%)'
                break
            case 'bottom':
                this.element.style.bottom = '10px'
                this.element.style.left = '50%'
                this.element.style.transform = 'translateX(-50%)'
                break
            case 'left':
                this.element.style.left = '10px'
                this.element.style.top = '50%'
                this.element.style.transform = 'translateY(-50%)'
                this.element.style.flexDirection = 'column'
                break
            case 'right':
                this.element.style.right = '10px'
                this.element.style.top = '50%'
                this.element.style.transform = 'translateY(-50%)'
                this.element.style.flexDirection = 'column'
                break
        }
    }

    private bindEvents() {
        // 监听编辑器的历史变化事件
        this.editor.on('history:change', () => {
            this.updateButtonStates()
        })

        // 监听缩放变化
        this.editor.on('scale:change', () => {
            this.updateButtonStates()
        })
    }

    private updateButtonStates() {
        if (!this.element) return

        // 更新撤销/重做按钮状态
        const undoButton = this.element.querySelector('[data-tool="undo"]') as HTMLButtonElement
        const redoButton = this.element.querySelector('[data-tool="redo"]') as HTMLButtonElement
        
        if (undoButton) {
            undoButton.disabled = !this.editor.canUndo()
        }
        if (redoButton) {
            redoButton.disabled = !this.editor.canRedo()
        }
    }

    public destroy() {
        if (this.element) {
            this.element.remove()
            this.element = null
        }
    }

    public hide() {
        if (this.element) {
            this.element.style.display = 'none'
        }
    }

    public show() {
        if (this.element) {
            this.element.style.display = 'flex'
        }
    }

    public getElement(): HTMLElement | null {
        return this.element
    }
}