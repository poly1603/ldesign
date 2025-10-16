/**
 * Word count plugin
 * Provides word and character count functionality
 */

import type { Plugin } from '../../types'

const WordCountPlugin: Plugin = {
  name: 'WordCount',
  install(editor: any) {
    let countElement: HTMLElement | null = null
    
    // Create word count display element
    function createCountElement() {
      const div = document.createElement('div')
      div.className = 'word-count-status'
      div.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
      `
      document.body.appendChild(div)
      return div
    }
    
    // Count words
    function countWords(text: string) {
      const cleanText = text.replace(/<[^>]*>/g, '').trim()
      const words = cleanText.match(/\S+/g) || []
      const chars = cleanText.length
      const charsNoSpaces = cleanText.replace(/\s/g, '').length
      
      return {
        words: words.length,
        chars: chars,
        charsNoSpaces: charsNoSpaces
      }
    }
    
    // Update count
    function updateCount() {
      const content = editor.getHTML()
      const stats = countWords(content)
      
      if (!countElement) {
        countElement = createCountElement()
      }
      
      countElement.innerHTML = `
        Words: ${stats.words} | 
        Chars: ${stats.chars} | 
        Chars (no spaces): ${stats.charsNoSpaces}
      `
    }
    
    // Register show/hide word count command
    editor.commands.register('toggleWordCount', () => {
      if (countElement) {
        countElement.style.display = countElement.style.display === 'none' ? 'block' : 'none'
      } else {
        updateCount()
      }
      return true
    })
    
    // Listen for content changes
    editor.on('input', () => {
      if (countElement && countElement.style.display !== 'none') {
        updateCount()
      }
    })
    
    console.log('[WordCountPlugin] Installed')
  }
}

export default WordCountPlugin