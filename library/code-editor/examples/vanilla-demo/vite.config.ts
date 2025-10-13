import { defineConfig } from 'vite'
import { resolve } from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// @ts-ignore - Handle default export
const monacoPlugin = (monacoEditorPlugin as any).default || monacoEditorPlugin

export default defineConfig({
  plugins: [
    monacoPlugin({
      languageWorkers: ['editorWorkerService', 'typescript', 'json', 'css', 'html'],
      customWorkers: []
    })
  ],
  resolve: {
    alias: {
      '@ldesign/code-editor': resolve(__dirname, '../../src/index.ts')
    }
  },
  server: {
    port: 3008,
    host: true,
    fs: {
      // Allow serving files from monaco-editor node_modules
      allow: ['..', '../..', '../../../..', '../../../../node_modules']
    }
  }
})
