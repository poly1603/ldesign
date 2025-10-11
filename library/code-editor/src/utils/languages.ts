/**
 * Vue 语言支持
 */

import * as monaco from 'monaco-editor'

/**
 * 注册 Vue 语言
 */
export function registerVueLanguage() {
  // 注册 Vue 语言
  monaco.languages.register({ id: 'vue' })

  // 设置语言配置
  monaco.languages.setLanguageConfiguration('vue', {
    comments: {
      blockComment: ['<!--', '-->']
    },
    brackets: [
      ['<', '>'],
      ['{', '}'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '<', close: '>' },
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' }
    ],
    surroundingPairs: [
      { open: '<', close: '>' },
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' }
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*<!--\\s*#region\\b.*-->'),
        end: new RegExp('^\\s*<!--\\s*#endregion\\b.*-->')
      }
    }
  })

  // 设置 Token 提供器（语法高亮）
  monaco.languages.setMonarchTokensProvider('vue', {
    defaultToken: '',
    tokenPostfix: '.vue',

    // 关键字
    keywords: [
      'template', 'script', 'style',
      'v-if', 'v-else', 'v-else-if', 'v-for', 'v-show', 'v-bind', 'v-model', 'v-on',
      'v-slot', 'v-pre', 'v-cloak', 'v-once', 'v-html', 'v-text',
      'setup', 'props', 'emit', 'ref', 'reactive', 'computed', 'watch', 'onMounted'
    ],

    tokenizer: {
      root: [
        // Template 标签
        [/<template[^>]*>/, { token: 'tag', next: '@template' }],
        // Script 标签
        [/<script[^>]*>/, { token: 'tag', next: '@script' }],
        // Style 标签
        [/<style[^>]*>/, { token: 'tag', next: '@style' }],
        // HTML 注释
        [/<!--/, 'comment', '@comment'],
        // HTML 标签
        [/<\/?[a-zA-Z][\w-]*/, { token: 'tag' }],
        [/>/, 'tag'],
      ],

      template: [
        [/<\/template>/, { token: 'tag', next: '@pop' }],
        // Vue 指令
        [/v-[a-z-]+/, 'keyword'],
        // 插值语法
        [/\{\{/, { token: 'delimiter.bracket', next: '@interpolation' }],
        // HTML 标签
        [/<\/?[a-zA-Z][\w-]*/, 'tag'],
        [/[^<{]+/, ''],
      ],

      interpolation: [
        [/\}\}/, { token: 'delimiter.bracket', next: '@pop' }],
        [/[^}]+/, 'variable'],
      ],

      script: [
        [/<\/script>/, { token: 'tag', next: '@pop' }],
        // JavaScript/TypeScript 内容
        [/[^<]+/, 'source'],
      ],

      style: [
        [/<\/style>/, { token: 'tag', next: '@pop' }],
        // CSS 内容
        [/[^<]+/, 'source'],
      ],

      comment: [
        [/-->/, 'comment', '@pop'],
        [/[^-]+/, 'comment'],
        [/./, 'comment']
      ]
    }
  })
}

/**
 * 注册 TSX/JSX 语言增强
 */
export function registerReactLanguage() {
  // TSX 和 JSX 已经由 TypeScript 语言服务支持
  // 这里只是增强配置

  // 为 TypeScript 和 JavaScript 添加 JSX/TSX 支持
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'React.createElement',
    reactNamespace: 'React',
    allowSyntheticDefaultImports: true,
    esModuleInterop: true
  })

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'React.createElement',
    allowSyntheticDefaultImports: true
  })
}

/**
 * 添加 React 类型定义
 */
export async function addReactTypes() {
  // 可以添加 React 的基础类型定义
  const reactTypes = `
declare namespace React {
  type ReactNode = any;
  type ReactElement = any;
  interface FunctionComponent<P = {}> {
    (props: P): ReactElement | null;
  }
  interface Component<P = {}, S = {}> {
    props: P;
    state: S;
    render(): ReactNode;
  }
}
  `

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    reactTypes,
    'file:///node_modules/@types/react/index.d.ts'
  )
}

/**
 * 添加 Vue 类型定义
 */
export async function addVueTypes() {
  const vueTypes = `
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
  `

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    vueTypes,
    'file:///vue-shim.d.ts'
  )
}
