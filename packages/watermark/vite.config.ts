import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*'],
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignWatermark',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        const ext = format === 'es' ? 'mjs' : format === 'cjs' ? 'cjs' : 'js'
        return `index.${ext}`
      },
    },

    rollupOptions: {
      external: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
      output: {
        globals: {
          'vue': 'Vue',
          '@vue/runtime-core': 'Vue',
          '@vue/runtime-dom': 'Vue',
        },
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'watermark.css'
          }
          return assetInfo.name || 'asset'
        },
      },
    },

    target: 'es2018',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    sourcemap: true,

    outDir: 'dist',
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname),
    },
  },

  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },

  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  optimizeDeps: {
    include: ['vue'],
  },

  esbuild: {
    target: 'es2018',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
