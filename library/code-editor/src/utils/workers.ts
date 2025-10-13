/**
 * Monaco Editor Worker 配置工具
 */

import * as monaco from 'monaco-editor'

/**
 * 配置 Monaco Editor Workers
 * 这样可以显著提升加载性能
 */
export function setupMonacoWorkers(_config?: any): void {
  // vite-plugin-monaco-editor 会自动处理 worker 配置
  // 我们只需要确保 MonacoEnvironment 存在
  // @ts-ignore
  if (!self.MonacoEnvironment) {
    // @ts-ignore
    self.MonacoEnvironment = {}
  }
}

/**
 * 预加载常用语言支持
 */
export async function preloadLanguages(languages: string[] = []): Promise<void> {
  const promises: Promise<any>[] = []

  if (languages.includes('typescript') || languages.includes('javascript')) {
    promises.push(
      import('monaco-editor/esm/vs/language/typescript/monaco.contribution')
    )
  }

  if (languages.includes('json')) {
    promises.push(
      import('monaco-editor/esm/vs/language/json/monaco.contribution')
    )
  }

  if (languages.includes('css') || languages.includes('scss') || languages.includes('less')) {
    promises.push(
      import('monaco-editor/esm/vs/language/css/monaco.contribution')
    )
  }

  if (languages.includes('html')) {
    promises.push(
      import('monaco-editor/esm/vs/language/html/monaco.contribution')
    )
  }

  await Promise.all(promises)
}

/**
 * 配置 TypeScript 编译选项
 */
export function setupTypeScriptDefaults() {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types']
  })

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  })
}

/**
 * 配置 JavaScript 编译选项
 */
export function setupJavaScriptDefaults() {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    allowJs: true,
    jsx: monaco.languages.typescript.JsxEmit.React
  })

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  })
}
