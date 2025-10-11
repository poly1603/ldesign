/**
 * Emmet 代码补全支持
 */

import * as monaco from 'monaco-editor'

/**
 * 注册 Emmet 补全提供器
 */
export function registerEmmetProvider() {
  // 只为 Monaco Editor 原生支持的语言注册 Emmet
  const emmetLanguages = ['html', 'css', 'scss', 'less']

  emmetLanguages.forEach(language => {
    // 注册补全提供器
    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['>'],
      provideCompletionItems: (model, position) => {
        const lineContent = model.getLineContent(position.lineNumber)
        const textBeforeCursor = lineContent.substring(0, position.column - 1)

        // 简单的 Emmet 缩写检测
        const emmetMatch = textBeforeCursor.match(/[\w\.\#\[\]\(\)\*\+\>\^]+$/)

        if (!emmetMatch) {
          return { suggestions: [] }
        }

        const abbreviation = emmetMatch[0]
        const suggestions = expandEmmetAbbreviation(abbreviation, language)

        return {
          suggestions: suggestions.map(item => ({
            label: item.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: item.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: item.documentation,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - abbreviation.length,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            }
          }))
        }
      }
    })
  })
}

/**
 * 展开 Emmet 缩写
 */
function expandEmmetAbbreviation(abbreviation: string, language: string): Array<{
  label: string
  insertText: string
  documentation: string
}> {
  const suggestions: Array<{ label: string; insertText: string; documentation: string }> = []

  // HTML/Vue Emmet 缩写
  if (['html', 'vue'].includes(language)) {
    const htmlExpansions: Record<string, { snippet: string; doc: string }> = {
      'div': {
        snippet: '<div>$0</div>',
        doc: '创建 div 元素'
      },
      'p': {
        snippet: '<p>$0</p>',
        doc: '创建 p 元素'
      },
      'span': {
        snippet: '<span>$0</span>',
        doc: '创建 span 元素'
      },
      'a': {
        snippet: '<a href="$1">$0</a>',
        doc: '创建 a 链接元素'
      },
      'img': {
        snippet: '<img src="$1" alt="$2">',
        doc: '创建 img 图片元素'
      },
      'ul>li': {
        snippet: '<ul>\n\t<li>$0</li>\n</ul>',
        doc: '创建无序列表'
      },
      'ol>li': {
        snippet: '<ol>\n\t<li>$0</li>\n</ol>',
        doc: '创建有序列表'
      },
      'table': {
        snippet: '<table>\n\t<tr>\n\t\t<td>$0</td>\n\t</tr>\n</table>',
        doc: '创建表格'
      },
      'form': {
        snippet: '<form action="$1">\n\t$0\n</form>',
        doc: '创建表单'
      },
      'input': {
        snippet: '<input type="$1" name="$2" value="$3">',
        doc: '创建输入框'
      },
      'button': {
        snippet: '<button type="$1">$0</button>',
        doc: '创建按钮'
      },
      'h1': {
        snippet: '<h1>$0</h1>',
        doc: '创建 h1 标题'
      },
      'h2': {
        snippet: '<h2>$0</h2>',
        doc: '创建 h2 标题'
      },
      'h3': {
        snippet: '<h3>$0</h3>',
        doc: '创建 h3 标题'
      },
    }

    // 类选择器
    if (abbreviation.includes('.')) {
      const parts = abbreviation.split('.')
      const tag = parts[0] || 'div'
      const classes = parts.slice(1).join(' ')
      suggestions.push({
        label: abbreviation,
        insertText: `<${tag} class="${classes}">$0</${tag}>`,
        documentation: `创建带有 class="${classes}" 的 ${tag} 元素`
      })
    }
    // ID 选择器
    else if (abbreviation.includes('#')) {
      const parts = abbreviation.split('#')
      const tag = parts[0] || 'div'
      const id = parts[1]
      suggestions.push({
        label: abbreviation,
        insertText: `<${tag} id="${id}">$0</${tag}>`,
        documentation: `创建带有 id="${id}" 的 ${tag} 元素`
      })
    }
    // 标准缩写
    else if (htmlExpansions[abbreviation]) {
      suggestions.push({
        label: abbreviation,
        insertText: htmlExpansions[abbreviation].snippet,
        documentation: htmlExpansions[abbreviation].doc
      })
    }
  }

  // CSS Emmet 缩写
  if (['css', 'scss', 'less'].includes(language)) {
    const cssExpansions: Record<string, { snippet: string; doc: string }> = {
      'm': {
        snippet: 'margin: $0;',
        doc: '设置外边距'
      },
      'p': {
        snippet: 'padding: $0;',
        doc: '设置内边距'
      },
      'w': {
        snippet: 'width: $0;',
        doc: '设置宽度'
      },
      'h': {
        snippet: 'height: $0;',
        doc: '设置高度'
      },
      'd': {
        snippet: 'display: $0;',
        doc: '设置显示模式'
      },
      'df': {
        snippet: 'display: flex;',
        doc: '设置为弹性布局'
      },
      'dg': {
        snippet: 'display: grid;',
        doc: '设置为网格布局'
      },
      'dn': {
        snippet: 'display: none;',
        doc: '隐藏元素'
      },
      'db': {
        snippet: 'display: block;',
        doc: '设置为块级元素'
      },
      'di': {
        snippet: 'display: inline;',
        doc: '设置为内联元素'
      },
      'dib': {
        snippet: 'display: inline-block;',
        doc: '设置为内联块元素'
      },
      'pos': {
        snippet: 'position: $0;',
        doc: '设置定位'
      },
      'posa': {
        snippet: 'position: absolute;',
        doc: '设置绝对定位'
      },
      'posr': {
        snippet: 'position: relative;',
        doc: '设置相对定位'
      },
      'posf': {
        snippet: 'position: fixed;',
        doc: '设置固定定位'
      },
      'fz': {
        snippet: 'font-size: $0;',
        doc: '设置字体大小'
      },
      'fw': {
        snippet: 'font-weight: $0;',
        doc: '设置字体粗细'
      },
      'c': {
        snippet: 'color: $0;',
        doc: '设置颜色'
      },
      'bg': {
        snippet: 'background: $0;',
        doc: '设置背景'
      },
      'bgc': {
        snippet: 'background-color: $0;',
        doc: '设置背景颜色'
      },
      'bd': {
        snippet: 'border: $0;',
        doc: '设置边框'
      },
      'br': {
        snippet: 'border-radius: $0;',
        doc: '设置圆角'
      },
      'ta': {
        snippet: 'text-align: $0;',
        doc: '设置文本对齐'
      },
      'tac': {
        snippet: 'text-align: center;',
        doc: '文本居中'
      },
    }

    if (cssExpansions[abbreviation]) {
      suggestions.push({
        label: abbreviation,
        insertText: cssExpansions[abbreviation].snippet,
        documentation: cssExpansions[abbreviation].doc
      })
    }
  }

  return suggestions
}

/**
 * 为自定义语言注册 Emmet 支持（在语言注册之后调用）
 */
export function registerEmmetForCustomLanguages(languages: string[]) {
  languages.forEach(language => {
    try {
      // 注册补全提供器
      monaco.languages.registerCompletionItemProvider(language, {
        triggerCharacters: ['>'],
        provideCompletionItems: (model, position) => {
          const lineContent = model.getLineContent(position.lineNumber)
          const textBeforeCursor = lineContent.substring(0, position.column - 1)

          // 简单的 Emmet 缩写检测
          const emmetMatch = textBeforeCursor.match(/[\w\.\#\[\]\(\)\*\+\>\^]+$/)

          if (!emmetMatch) {
            return { suggestions: [] }
          }

          const abbreviation = emmetMatch[0]
          const suggestions = expandEmmetAbbreviation(abbreviation, language)

          return {
            suggestions: suggestions.map(item => ({
              label: item.label,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: item.insertText,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: item.documentation,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column - abbreviation.length,
                endLineNumber: position.lineNumber,
                endColumn: position.column
              }
            }))
          }
        }
      })

      // 配置自动闭合
      monaco.languages.setLanguageConfiguration(language, {
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
          { open: '<', close: '>' },
          { open: '`', close: '`' }
        ]
      })
    } catch (e) {
      console.debug(`Failed to register Emmet for language ${language}:`, e)
    }
  })
}

/**
 * 配置 Emmet 行为
 */
export function configureEmmet() {
  // 为支持 Emmet 的语言设置自动补全触发字符
  // 只配置 Monaco Editor 原生支持的语言
  const emmetLanguages = ['html', 'css', 'scss', 'less']

  emmetLanguages.forEach(language => {
    try {
      monaco.languages.setLanguageConfiguration(language, {
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
          { open: '<', close: '>' },
          { open: '`', close: '`' }
        ]
      })
    } catch (e) {
      // 语言不存在，忽略
      console.debug(`Language ${language} not registered, skipping Emmet config`)
    }
  })
}
