import { ApprovalFlowEditor } from '../core/ApprovalFlowEditor'

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
    
    // SVG 图标定义
    private icons: Record<string, string> = {
        undo: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>',
        redo: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3-2.3"/></svg>',
        zoomIn: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>',
        zoomOut: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/></svg>',
        maximize: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3"/><path d="M21 8V5a2 2 0 00-2-2h-3"/><path d="M3 16v3a2 2 0 002 2h3"/><path d="M16 21h3a2 2 0 002-2v-3"/></svg>',
        home: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        focus: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6"/><path d="M12 17v6"/><path d="M4.22 4.22l4.24 4.24"/><path d="M15.54 15.54l4.24 4.24"/><path d="M1 12h6"/><path d="M17 12h6"/><path d="M4.22 19.78l4.24-4.24"/><path d="M15.54 8.46l4.24-4.24"/></svg>',
        fullscreen: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>',
        download: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        image: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        check: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        trash: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>'
    }
    
    private defaultTools: ToolbarTool[] = [
        {
            name: 'undo',
            icon: 'undo',
            title: '撤销',
            action: (editor) => editor.undo()
        },
        {
            name: 'redo',
            icon: 'redo',
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
            icon: 'zoomIn',
            title: '放大',
            action: (editor) => editor.zoom(0.1)
        },
        {
            name: 'zoomOut',
            icon: 'zoomOut',
            title: '缩小',
            action: (editor) => editor.zoom(-0.1)
        },
        {
            name: 'zoomToFit',
            icon: 'maximize',
            title: '适应画布',
            action: (editor) => editor.zoomToFit()
        },
        {
            name: 'zoomToOrigin',
            icon: 'home',
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
            icon: 'focus',
            title: '居中内容',
            action: (editor) => editor.centerContent()
        },
        {
            name: 'fullscreen',
            icon: 'fullscreen',
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
            icon: 'download',
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
            icon: 'image',
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
            icon: 'check',
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
            icon: 'trash',
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
        const iconSvg = this.icons[tool.icon]
        if (iconSvg) {
            button.innerHTML = iconSvg
        } else {
            // 如果没有图标，显示文字
            button.textContent = tool.title
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