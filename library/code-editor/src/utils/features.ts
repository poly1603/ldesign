/**
 * Advanced Editor Features
 * 提供高级编辑功能：多光标、括号匹配、代码折叠、查找替换、代码比较等
 */

import * as monaco from 'monaco-editor'

/**
 * 编辑器功能配置接口
 */
export interface EditorFeatureConfig {
  // 多光标编辑
  multiCursor?: boolean
  // 括号匹配高亮
  bracketMatching?: boolean
  // 代码折叠
  folding?: boolean
  // 查找替换
  find?: boolean
  // 代码比较
  diffEditor?: boolean
  // 缩略图
  minimap?: boolean
  // 面包屑导航
  breadcrumbs?: boolean
  // 代码镜头
  codeLens?: boolean
  // 智能选择
  smartSelect?: boolean
  // 多选择
  multipleSelection?: boolean
  // 列选择
  columnSelection?: boolean
  // 代码动作
  codeActions?: boolean
  // 快速修复
  quickFix?: boolean
  // 重命名
  rename?: boolean
  // 格式化
  format?: boolean
  // 注释
  comments?: boolean
}

/**
 * 编辑器功能管理器
 */
export class EditorFeatureManager {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null
  private diffEditor: monaco.editor.IStandaloneDiffEditor | null = null
  private features: EditorFeatureConfig = {}
  
  constructor(editor?: monaco.editor.IStandaloneCodeEditor) {
    if (editor) {
      this.setEditor(editor)
    }
  }
  
  /**
   * 设置编辑器实例
   */
  setEditor(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editor = editor
    this.applyFeatures()
  }
  
  /**
   * 配置功能
   */
  configureFeatures(config: EditorFeatureConfig): void {
    this.features = { ...this.features, ...config }
    this.applyFeatures()
  }
  
  /**
   * 应用功能配置
   */
  private applyFeatures(): void {
    if (!this.editor) return
    
    const options: monaco.editor.IEditorOptions = {}
    
    // 括号匹配
    if (this.features.bracketMatching !== undefined) {
      options.matchBrackets = this.features.bracketMatching ? 'always' : 'never'
    }
    
    // 代码折叠
    if (this.features.folding !== undefined) {
      options.folding = this.features.folding
      options.foldingStrategy = 'indentation'
      options.foldingHighlight = true
      options.showFoldingControls = 'always'
    }
    
    // 查找功能
    if (this.features.find !== undefined) {
      options.find = {
        seedSearchStringFromSelection: 'always',
        autoFindInSelection: 'multiline',
        addExtraSpaceOnTop: true
      }
    }
    
    // 缩略图
    if (this.features.minimap !== undefined) {
      options.minimap = {
        enabled: this.features.minimap,
        showSlider: 'mouseover',
        renderCharacters: true,
        maxColumn: 80
      }
    }
    
    // 面包屑
    if (this.features.breadcrumbs !== undefined) {
      options.renderWhitespace = 'selection'
    }
    
    // 多光标
    if (this.features.multiCursor !== undefined) {
      options.multiCursorModifier = 'alt'
      options.multiCursorMergeOverlapping = true
    }
    
    this.editor.updateOptions(options)
  }
  
  /**
   * 启用多光标编辑
   */
  enableMultiCursor(): void {
    if (!this.editor) return
    
    this.editor.updateOptions({
      multiCursorModifier: 'alt',
      multiCursorMergeOverlapping: true,
      multiCursorPaste: 'spread'
    })
    
    // 添加多光标快捷键
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      this.editor?.trigger('keyboard', 'editor.action.addSelectionToNextFindMatch', null)
    })
    
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL, () => {
      this.editor?.trigger('keyboard', 'editor.action.selectHighlights', null)
    })
  }
  
  /**
   * 添加自定义快捷键
   */
  addCustomKeybindings(): void {
    if (!this.editor) return
    
    // 复制行
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD, () => {
      this.editor?.trigger('keyboard', 'editor.action.copyLinesDownAction', null)
    })
    
    // 删除行
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK, () => {
      this.editor?.trigger('keyboard', 'editor.action.deleteLines', null)
    })
    
    // 移动行
    this.editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
      this.editor?.trigger('keyboard', 'editor.action.moveLinesUpAction', null)
    })
    
    this.editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
      this.editor?.trigger('keyboard', 'editor.action.moveLinesDownAction', null)
    })
    
    // 格式化文档
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      this.editor?.trigger('keyboard', 'editor.action.formatDocument', null)
    })
    
    // 注释切换
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      this.editor?.trigger('keyboard', 'editor.action.commentLine', null)
    })
    
    // 块注释
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyA, () => {
      this.editor?.trigger('keyboard', 'editor.action.blockComment', null)
    })
  }
  
  /**
   * 启用代码折叠增强
   */
  enhanceFolding(): void {
    if (!this.editor) return
    
    this.editor.updateOptions({
      folding: true,
      foldingStrategy: 'indentation',
      foldingHighlight: true,
      showFoldingControls: 'always',
      foldingImportsByDefault: true
    })
    
    // 添加折叠快捷键
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft, () => {
      this.editor?.trigger('keyboard', 'editor.foldAll', null)
    })
    
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight, () => {
      this.editor?.trigger('keyboard', 'editor.unfoldAll', null)
    })
  }
  
  /**
   * 启用智能括号匹配
   */
  enableSmartBrackets(): void {
    if (!this.editor) return
    
    this.editor.updateOptions({
      autoClosingBrackets: 'languageDefined',
      autoClosingQuotes: 'languageDefined',
      autoSurround: 'languageDefined',
      matchBrackets: 'always',
      bracketPairColorization: {
        enabled: true,
        independentColorPoolPerBracketType: true
      }
    })
    
    // 添加括号跳转
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Backslash, () => {
      this.editor?.trigger('keyboard', 'editor.action.jumpToBracket', null)
    })
  }
  
  /**
   * 启用增强的查找替换
   */
  enableEnhancedFind(): void {
    if (!this.editor) return
    
    this.editor.updateOptions({
      find: {
        seedSearchStringFromSelection: 'always',
        autoFindInSelection: 'multiline',
        addExtraSpaceOnTop: true,
        loop: true
      }
    })
    
    // 自定义查找快捷键
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      this.editor?.trigger('keyboard', 'actions.find', null)
    })
    
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      this.editor?.trigger('keyboard', 'editor.action.startFindReplaceAction', null)
    })
  }
  
  /**
   * 创建 Diff 编辑器
   */
  createDiffEditor(
    container: HTMLElement,
    original: string,
    modified: string,
    language?: string
  ): monaco.editor.IStandaloneDiffEditor {
    this.diffEditor = monaco.editor.createDiffEditor(container, {
      enableSplitViewResizing: true,
      renderSideBySide: true,
      readOnly: false,
      automaticLayout: true
    })
    
    const originalModel = monaco.editor.createModel(original, language)
    const modifiedModel = monaco.editor.createModel(modified, language)
    
    this.diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel
    })
    
    return this.diffEditor
  }
  
  /**
   * 切换到内联 Diff 视图
   */
  toggleInlineDiff(): void {
    if (!this.diffEditor) return
    
    // const currentRenderSideBySide = this.diffEditor.getModel()
    this.diffEditor.updateOptions({
      renderSideBySide: false
    })
  }
  
  /**
   * 添加代码动作
   */
  registerCodeActions(language: string): void {
    monaco.languages.registerCodeActionProvider(language, {
      provideCodeActions: (_model, _range, context, _token) => {
        const actions: monaco.languages.CodeAction[] = []
        
        // 快速修复
        if (context.markers.length > 0) {
          actions.push({
            title: '快速修复',
            kind: 'quickfix',
            diagnostics: context.markers,
            edit: {
              edits: []
            }
          })
        }
        
        // 重构
        actions.push({
          title: '提取到函数',
          kind: 'refactor.extract',
          edit: {
            edits: []
          }
        })
        
        // 自动导入
        actions.push({
          title: '自动导入',
          kind: 'source.organizeImports',
          edit: {
            edits: []
          }
        })
        
        return {
          actions,
          dispose: () => {}
        }
      }
    })
  }
  
  /**
   * 启用智能选择
   */
  enableSmartSelect(): void {
    if (!this.editor) return
    
    // 扩展选择
    this.editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.RightArrow, () => {
      this.editor?.trigger('keyboard', 'editor.action.smartSelect.expand', null)
    })
    
    // 收缩选择
    this.editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow, () => {
      this.editor?.trigger('keyboard', 'editor.action.smartSelect.shrink', null)
    })
  }
  
  /**
   * 启用列选择模式
   */
  enableColumnSelection(): void {
    if (!this.editor) return
    
    this.editor.updateOptions({
      columnSelection: true
    })
    
    // 添加列选择快捷键
    this.editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
      this.editor?.trigger('keyboard', 'cursorColumnSelectDown', null)
    })
    
    this.editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
      this.editor?.trigger('keyboard', 'cursorColumnSelectUp', null)
    })
  }
  
  /**
   * 添加代码镜头（CodeLens）
   */
  registerCodeLens(language: string): void {
    monaco.languages.registerCodeLensProvider(language, {
      provideCodeLenses: (model, _token) => {
        const lenses: monaco.languages.CodeLens[] = []
        
        // 查找函数定义
        const lines = model.getLinesContent()
        lines.forEach((line, index) => {
          if (line.includes('function') || line.includes('const') || line.includes('class')) {
            lenses.push({
              range: new monaco.Range(index + 1, 1, index + 1, 1),
              command: {
                id: 'editor.action.showReferences',
                title: '显示引用'
              }
            })
          }
        })
        
        return { lenses, dispose: () => {} }
      },
      
      resolveCodeLens: (_model, codeLens, _token) => {
        return codeLens
      }
    })
  }
  
  /**
   * 启用迷你地图增强
   */
  enhanceMinimap(): void {
    if (!this.editor) return
    
    this.editor.updateOptions({
      minimap: {
        enabled: true,
        showSlider: 'always',
        renderCharacters: false,
        maxColumn: 120,
        scale: 1,
        side: 'right'
      }
    })
  }
  
  /**
   * 添加自定义上下文菜单项
   */
  addContextMenuItems(): void {
    if (!this.editor) return
    
    // 添加自定义动作
    this.editor.addAction({
      id: 'custom-copy-path',
      label: '复制文件路径',
      keybindings: [],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: (_editor) => {
        // 实现复制路径逻辑
        console.log('Copy file path')
      }
    })
    
    this.editor.addAction({
      id: 'custom-format-selection',
      label: '格式化选中内容',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI],
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 2.5,
      run: (editor) => {
        editor.trigger('keyboard', 'editor.action.formatSelection', null)
      }
    })
  }
  
  /**
   * 启用所有增强功能
   */
  enableAllEnhancements(): void {
    this.enableMultiCursor()
    this.addCustomKeybindings()
    this.enhanceFolding()
    this.enableSmartBrackets()
    this.enableEnhancedFind()
    this.enableSmartSelect()
    this.enableColumnSelection()
    this.enhanceMinimap()
    this.addContextMenuItems()
  }
  
  /**
   * 获取编辑器统计信息
   */
  getEditorStats(): EditorStats {
    if (!this.editor) {
      return {
        lineCount: 0,
        wordCount: 0,
        characterCount: 0,
        selectionCount: 0
      }
    }
    
    const model = this.editor.getModel()
    if (!model) {
      return {
        lineCount: 0,
        wordCount: 0,
        characterCount: 0,
        selectionCount: 0
      }
    }
    
    const content = model.getValue()
    const words = content.match(/\b\w+\b/g) || []
    const selections = this.editor.getSelections() || []
    
    return {
      lineCount: model.getLineCount(),
      wordCount: words.length,
      characterCount: content.length,
      selectionCount: selections.length
    }
  }
  
  /**
   * 销毁功能管理器
   */
  dispose(): void {
    if (this.diffEditor) {
      this.diffEditor.dispose()
      this.diffEditor = null
    }
    this.editor = null
  }
}

/**
 * 编辑器统计信息接口
 */
export interface EditorStats {
  lineCount: number
  wordCount: number
  characterCount: number
  selectionCount: number
}

/**
 * 创建功能管理器的便捷函数
 */
export function createFeatureManager(
  editor?: monaco.editor.IStandaloneCodeEditor
): EditorFeatureManager {
  return new EditorFeatureManager(editor)
}

/**
 * 注册全局编辑器命令
 */
export function registerGlobalCommands(): void {
  // 注册全局格式化命令
  monaco.editor.addCommand({
    id: 'editor.action.formatAll',
    run: (_accessor, ..._args) => {
      const activeEditor = monaco.editor.getEditors()[0]
      if (activeEditor) {
        activeEditor.trigger('keyboard', 'editor.action.formatDocument', null)
      }
    }
  })
  
  // 注册全局查找命令
  monaco.editor.addCommand({
    id: 'editor.action.findAll',
    run: (_accessor, ..._args) => {
      const activeEditor = monaco.editor.getEditors()[0]
      if (activeEditor) {
        activeEditor.trigger('keyboard', 'actions.find', null)
      }
    }
  })
}

/**
 * 配置编辑器性能选项
 */
export function configurePerformance(editor: monaco.editor.IStandaloneCodeEditor): void {
  editor.updateOptions({
    // 性能相关选项
    fastScrollSensitivity: 5,
    mouseWheelScrollSensitivity: 1,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    // 渲染优化
    renderLineHighlight: 'line',
    renderWhitespace: 'none',
    renderControlCharacters: false,
    fontLigatures: true,
    // 大文件优化
    largeFileOptimizations: true
  })
}