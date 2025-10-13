/**
 * Language utilities for Monaco Editor
 */

import * as monaco from 'monaco-editor'

/**
 * Language mapping for file extensions and common aliases
 */
export const LANGUAGE_EXTENSIONS: Record<string, string> = {
  // JavaScript/TypeScript
  'js': 'javascript',
  'mjs': 'javascript',
  'cjs': 'javascript',
  'jsx': 'javascriptreact',
  'ts': 'typescript',
  'tsx': 'typescriptreact',
  'mts': 'typescript',
  'cts': 'typescript',
  
  // Web
  'vue': 'vue',
  'html': 'html',
  'htm': 'html',
  'xml': 'xml',
  'svg': 'xml',
  'css': 'css',
  'scss': 'scss',
  'sass': 'scss',
  'less': 'less',
  'styl': 'stylus',
  'stylus': 'stylus',
  
  // Config
  'json': 'json',
  'jsonc': 'json',
  'json5': 'json',
  'yaml': 'yaml',
  'yml': 'yaml',
  'toml': 'toml',
  'ini': 'ini',
  'conf': 'ini',
  'env': 'ini',
  
  // Backend
  'py': 'python',
  'pyw': 'python',
  'java': 'java',
  'kt': 'kotlin',
  'kts': 'kotlin',
  'go': 'go',
  'rs': 'rust',
  'php': 'php',
  'rb': 'ruby',
  'cs': 'csharp',
  'fs': 'fsharp',
  'fsx': 'fsharp',
  'fsi': 'fsharp',
  'swift': 'swift',
  'dart': 'dart',
  
  // Low-level
  'c': 'c',
  'h': 'c',
  'cpp': 'cpp',
  'cc': 'cpp',
  'cxx': 'cpp',
  'hpp': 'cpp',
  'hxx': 'cpp',
  'm': 'objective-c',
  'mm': 'objective-c',
  
  // Shell
  'sh': 'shell',
  'bash': 'shell',
  'zsh': 'shell',
  'fish': 'shell',
  'ps1': 'powershell',
  'psm1': 'powershell',
  'psd1': 'powershell',
  'bat': 'bat',
  'cmd': 'bat',
  
  // Database
  'sql': 'sql',
  'mysql': 'mysql',
  'pgsql': 'pgsql',
  'plsql': 'sql',
  
  // Markup
  'md': 'markdown',
  'markdown': 'markdown',
  'mdx': 'mdx',
  'tex': 'latex',
  'latex': 'latex',
  'rst': 'restructuredtext',
  
  // Others
  'dockerfile': 'dockerfile',
  'makefile': 'makefile',
  'mk': 'makefile',
  'r': 'r',
  'R': 'r',
  'lua': 'lua',
  'perl': 'perl',
  'pl': 'perl',
  'scala': 'scala',
  'clj': 'clojure',
  'cljs': 'clojure',
  'graphql': 'graphql',
  'gql': 'graphql',
  'proto': 'protobuf',
  'wasm': 'wasm',
  'wat': 'wat'
}

/**
 * Language aliases for common alternative names
 */
export const LANGUAGE_ALIASES: Record<string, string> = {
  'node': 'javascript',
  'nodejs': 'javascript',
  'react': 'javascriptreact',
  'react-native': 'javascriptreact',
  'angular': 'typescript',
  'vue3': 'vue',
  'vue2': 'vue',
  'sass-indented': 'scss'
}

/**
 * Normalize language names to Monaco Editor's internal names
 */
export function normalizeLanguage(language: string): string {
  // First check direct mapping
  const directMap: Record<string, string> = {
    'tsx': 'typescriptreact',
    'jsx': 'javascriptreact',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'yml': 'yaml',
    'sh': 'shell',
    'bash': 'shell',
    'ps1': 'powershell',
    'md': 'markdown'
  }
  
  const normalized = language.toLowerCase()
  return directMap[normalized] || 
         LANGUAGE_ALIASES[normalized] || 
         LANGUAGE_EXTENSIONS[normalized] || 
         normalized
}

/**
 * Get language by file extension
 */
export function getLanguageByExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || ''
  return LANGUAGE_EXTENSIONS[extension] || 'plaintext'
}

/**
 * Check if a language needs special plugin support
 */
export function needsCustomLanguagePlugin(language: string): boolean {
  const normalizedLang = normalizeLanguage(language)
  return ['vue', 'svelte', 'mdx', 'astro'].includes(normalizedLang)
}

/**
 * Get recommended plugins for a language
 */
export function getRecommendedPlugins(language: string): string[] {
  const normalizedLang = normalizeLanguage(language)
  const plugins: string[] = []
  
  // TypeScript/JavaScript family
  if (['typescript', 'javascript', 'typescriptreact', 'javascriptreact'].includes(normalizedLang)) {
    plugins.push('typescript', 'prettier', 'eslint')
  }
  
  // React
  if (['typescriptreact', 'javascriptreact'].includes(normalizedLang)) {
    plugins.push('react', 'emmet')
  }
  
  // Vue
  if (normalizedLang === 'vue') {
    plugins.push('vue', 'volar', 'emmet')
  }
  
  // Python
  if (normalizedLang === 'python') {
    plugins.push('python', 'pylint')
  }
  
  // HTML/CSS
  if (['html', 'css', 'scss', 'less'].includes(normalizedLang)) {
    plugins.push('emmet', 'prettier')
  }
  
  // Go
  if (normalizedLang === 'go') {
    plugins.push('go', 'gofmt')
  }
  
  // Rust
  if (normalizedLang === 'rust') {
    plugins.push('rust', 'rustfmt')
  }
  
  return [...new Set(plugins)] // Remove duplicates
}

/**
 * Check if language supports formatting
 */
export function supportsFormatting(language: string): boolean {
  const normalizedLang = normalizeLanguage(language)
  const formattableLanguages = [
    'javascript', 'typescript', 'javascriptreact', 'typescriptreact',
    'json', 'html', 'css', 'scss', 'less',
    'python', 'java', 'go', 'rust', 'csharp',
    'php', 'ruby', 'swift', 'kotlin', 'dart',
    'xml', 'yaml', 'sql', 'graphql'
  ]
  return formattableLanguages.includes(normalizedLang)
}

/**
 * Get language-specific tabSize recommendation
 */
export function getDefaultTabSize(language: string): number {
  const normalizedLang = normalizeLanguage(language)
  const tabSizeMap: Record<string, number> = {
    'python': 4,
    'go': 8,
    'makefile': 8,
    'yaml': 2,
    'json': 2,
    'javascript': 2,
    'typescript': 2,
    'javascriptreact': 2,
    'typescriptreact': 2,
    'vue': 2,
    'html': 2,
    'css': 2,
    'scss': 2
  }
  return tabSizeMap[normalizedLang] || 4
}

/**
 * Configure language-specific Monaco settings
 */
export function configureLanguageDefaults(language: string) {
  const normalizedLang = normalizeLanguage(language)
  
  // Configure TypeScript/JavaScript defaults
  if (['typescript', 'javascript', 'typescriptreact', 'javascriptreact'].includes(normalizedLang)) {
    const compilerOptions = {
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: true,
      jsx: normalizedLang.includes('react') 
        ? monaco.languages.typescript.JsxEmit.React 
        : monaco.languages.typescript.JsxEmit.Preserve,
      reactNamespace: 'React',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      skipLibCheck: true,
      lib: ['es2020', 'dom', 'dom.iterable']
    }
    
    if (normalizedLang.startsWith('typescript')) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions)
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [1375, 1378] // Top-level await warnings
      })
    } else {
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions)
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [1375, 1378]
      })
    }
  }
}
