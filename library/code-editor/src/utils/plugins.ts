/**
 * 编辑器插件系统
 */

import * as monaco from 'monaco-editor'
import type { PluginConfig } from '../types'
import { registerEmmetProvider, configureEmmet, registerEmmetForCustomLanguages } from './emmet'
import { registerVueLanguage, registerReactLanguage, addReactTypes, addVueTypes } from './languages'
import { setupTypeScriptDefaults, setupJavaScriptDefaults } from './workers'

/**
 * 插件管理器
 */
export class PluginManager {
  private static instance: PluginManager
  private loadedPlugins: Set<string> = new Set()

  private constructor() {}

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager()
    }
    return PluginManager.instance
  }

  /**
   * 加载插件
   */
  async loadPlugin(name: string, _config: PluginConfig = {}): Promise<void> {
    if (this.loadedPlugins.has(name)) {
      return
    }

    switch (name) {
      case 'emmet':
        await this.loadEmmetPlugin()
        break
      case 'vue':
        await this.loadVuePlugin()
        break
      case 'react':
        await this.loadReactPlugin()
        break
      case 'typescript':
        await this.loadTypeScriptPlugin()
        break
      default:
        console.warn(`Unknown plugin: ${name}`)
    }

    this.loadedPlugins.add(name)
  }

  /**
   * 批量加载插件
   */
  async loadPlugins(plugins: string[], config: PluginConfig = {}): Promise<void> {
    const promises = plugins.map(plugin => this.loadPlugin(plugin, config))
    await Promise.all(promises)
  }

  /**
   * 根据配置加载插件
   */
  async loadByConfig(config: PluginConfig): Promise<void> {
    const plugins: string[] = []

    if (config.emmet) {
      plugins.push('emmet')
    }

    if (config.snippets !== false) {
      // snippets 默认启用
      // monaco 自带代码片段功能
    }

    await this.loadPlugins(plugins, config)
  }

  /**
   * 检查插件是否已加载
   */
  isPluginLoaded(name: string): boolean {
    return this.loadedPlugins.has(name)
  }

  /**
   * 加载 Emmet 插件
   */
  private async loadEmmetPlugin(): Promise<void> {
    registerEmmetProvider()
    configureEmmet()
  }

  /**
   * 加载 Vue 插件
   */
  private async loadVuePlugin(): Promise<void> {
    registerVueLanguage()
    await addVueTypes()
    // 在语言注册后为 Vue 注册 Emmet
    registerEmmetForCustomLanguages(['vue'])
  }

  /**
   * 加载 React 插件
   */
  private async loadReactPlugin(): Promise<void> {
    registerReactLanguage()
    await addReactTypes()
    // 为 TSX/JSX 注册 Emmet
    registerEmmetForCustomLanguages(['typescriptreact', 'javascriptreact'])
  }

  /**
   * 加载 TypeScript 插件
   */
  private async loadTypeScriptPlugin(): Promise<void> {
    setupTypeScriptDefaults()
    setupJavaScriptDefaults()
  }
}

/**
 * 常用代码片段
 */
export function registerCommonSnippets() {
  // JavaScript/TypeScript 代码片段
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      return {
        suggestions: [
          {
            label: 'log',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'console.log(${1:value});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '输出到控制台',
            range
          },
          {
            label: 'func',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:name}(${2:params}) {\n\t${0}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建函数',
            range
          },
          {
            label: 'arrow',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'const ${1:name} = (${2:params}) => {\n\t${0}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建箭头函数',
            range
          },
          {
            label: 'foreach',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:array}.forEach((${2:item}) => {\n\t${0}\n});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'forEach 循环',
            range
          },
          {
            label: 'map',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:array}.map((${2:item}) => ${0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'map 映射',
            range
          },
          {
            label: 'filter',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:array}.filter((${2:item}) => ${0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'filter 过滤',
            range
          },
          {
            label: 'reduce',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:array}.reduce((${2:acc}, ${3:item}) => {\n\t${0}\n}, ${4:initial})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'reduce 归约',
            range
          },
          {
            label: 'promise',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'new Promise((resolve, reject) => {\n\t${0}\n})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建 Promise',
            range
          },
          {
            label: 'async',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'async function ${1:name}(${2:params}) {\n\t${0}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建异步函数',
            range
          },
          {
            label: 'try',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'try {\n\t${1}\n} catch (error) {\n\t${0}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'try-catch 错误处理',
            range
          },
        ]
      }
    }
  })

  // TypeScript 代码片段
  monaco.languages.registerCompletionItemProvider('typescript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      return {
        suggestions: [
          {
            label: 'interface',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'interface ${1:Name} {\n\t${0}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建接口',
            range
          },
          {
            label: 'type',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'type ${1:Name} = ${0}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建类型别名',
            range
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'class ${1:Name} {\n\tconstructor(${2:params}) {\n\t\t${0}\n\t}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建类',
            range
          },
          {
            label: 'enum',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'enum ${1:Name} {\n\t${0}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '创建枚举',
            range
          },
        ]
      }
    }
  })
}
