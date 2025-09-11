import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    vue(),
    react()
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vue: resolve(__dirname, 'src/adapters/vue/index.ts'),
        react: resolve(__dirname, 'src/adapters/react/index.ts'),
        vanilla: resolve(__dirname, 'src/adapters/vanilla/index.ts')
      },
      name: 'LDesignMap',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'mapbox-gl',
        '@turf/turf',
        'vue',
        'react',
        'react-dom',
        '@vue/composition-api'
      ],
      output: {
        globals: {
          'mapbox-gl': 'mapboxgl',
          '@turf/turf': 'turf',
          'vue': 'Vue',
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/adapters': resolve(__dirname, 'src/adapters'),
      '@/features': resolve(__dirname, 'src/features'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles')
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  preview: {
    port: 3001,
    open: true
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "@/styles/variables.less";`
      }
    }
  }
})
