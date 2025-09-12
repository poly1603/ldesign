import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/map': resolve(__dirname, '../../src')
    }
  },
  server: {
    port: 10000,
    open: true,
    host: true
  },
  optimizeDeps: {
    include: [
      'ol',
      'ol/layer',
      'ol/source',
      'ol/control',
      'ol/format',
      'ol/geom',
      'ol/style',
      'ol/proj',
      'ol/coordinate',
      'ol/Map',
      'ol/View',
      'ol/layer/Tile',
      'ol/source/OSM',
      'ol/source/XYZ',
      'ol/Feature',
      'ol/geom/Point',
      'ol/style/Style',
      'ol/style/Icon',
      'ol/style/Text',
      'ol/style/Fill',
      'ol/style/Stroke',
      'ol/Overlay'
    ]
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
