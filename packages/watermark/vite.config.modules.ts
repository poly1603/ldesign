import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*'],
    }),
  ],
  
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vue: resolve(__dirname, 'src/vue/index.ts'),
        core: resolve(__dirname, 'src/core/index.ts'),
        utils: resolve(__dirname, 'src/utils/index.ts'),
        types: resolve(__dirname, 'src/types/index.ts'),
        renderers: resolve(__dirname, 'src/renderers/index.ts'),
        animation: resolve(__dirname, 'src/animation/index.ts'),
        security: resolve(__dirname, 'src/security/index.ts'),
        responsive: resolve(__dirname, 'src/responsive/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'cjs'
        return `${entryName}.${ext}`
      },
    },
    
    rollupOptions: {
      external: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
      output: {
        exports: 'named',
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
    
    outDir: 'dist/modules',
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
