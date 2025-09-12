import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignMap',
      fileName: (format) => `ldesign-map.${format}.js`
    },
    rollupOptions: {
      external: [
        'ol',
        'ol/layer',
        'ol/source',
        'ol/control',
        'ol/format',
        'ol/geom',
        'ol/style',
        'ol/proj',
        'ol/coordinate',
        'vue',
        'react',
        'react-dom'
      ],
      output: {
        globals: {
          'ol': 'ol',
          'vue': 'Vue',
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
