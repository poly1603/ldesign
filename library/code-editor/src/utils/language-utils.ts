/**
 * Language utilities for Monaco Editor
 */

/**
 * Normalize language names to Monaco Editor's internal names
 * tsx -> typescriptreact
 * jsx -> javascriptreact
 */
export function normalizeLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    'tsx': 'typescriptreact',
    'jsx': 'javascriptreact'
  }
  return languageMap[language] || language
}

/**
 * Check if a language needs special plugin support
 */
export function needsCustomLanguagePlugin(language: string): boolean {
  const normalizedLang = normalizeLanguage(language)
  return normalizedLang === 'vue'
}
