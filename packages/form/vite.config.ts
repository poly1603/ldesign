import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
      skipDiagnostics: false,
      logDiagnostics: true,
    }),
  ],

  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vanilla: resolve(__dirname, 'src/vanilla.ts'),
        components: resolve(__dirname, 'src/components/index.ts'),
        composables: resolve(__dirname, 'src/composables/index.ts'),
        utils: resolve(__dirname, 'src/utils/index.ts'),
        themes: resolve(__dirname, 'src/themes/index.ts'),
      },
      name: 'LDesignForm',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : format === 'cjs' ? 'cjs' : 'js'
        return `${entryName}.${ext}`
      },
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        exports: 'named',
        assetFileNames: assetInfo => {
          if (assetInfo.name === 'style.css') {
            return 'index.css'
          }
          return assetInfo.name || 'asset'
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    cssCodeSplit: false,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
  },
})
