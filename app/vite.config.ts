import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
  resolve: {
    alias: {
      // 工作空间包的 alias 配置
      '@ldesign/api': resolve(__dirname, '../packages/api/src'),
      '@ldesign/api/vue': resolve(__dirname, '../packages/api/src/vue'),

      '@ldesign/cache': resolve(__dirname, '../packages/cache/src'),
      '@ldesign/cache/vue': resolve(__dirname, '../packages/cache/src/vue'),

      '@ldesign/color': resolve(__dirname, '../packages/color/src'),
      '@ldesign/color/vue': resolve(__dirname, '../packages/color/src/vue'),

      '@ldesign/component': resolve(__dirname, '../packages/component/src'),

      '@ldesign/crypto': resolve(__dirname, '../packages/crypto/src'),
      '@ldesign/crypto/vue': resolve(__dirname, '../packages/crypto/src/vue'),

      '@ldesign/device': resolve(__dirname, '../packages/device/src'),
      '@ldesign/device/vue': resolve(__dirname, '../packages/device/src/vue'),

      '@ldesign/engine': resolve(__dirname, '../packages/engine/src'),
      '@ldesign/engine/vue': resolve(__dirname, '../packages/engine/src/vue'),

      '@ldesign/form': resolve(__dirname, '../packages/form/src'),
      '@ldesign/form/vue': resolve(__dirname, '../packages/form/src/vue'),

      '@ldesign/git': resolve(__dirname, '../packages/git/src'),

      '@ldesign/http': resolve(__dirname, '../packages/http/src'),
      '@ldesign/http/vue': resolve(__dirname, '../packages/http/src/vue'),

      '@ldesign/i18n': resolve(__dirname, '../packages/i18n/src'),
      '@ldesign/i18n/vue': resolve(__dirname, '../packages/i18n/src/vue'),

      '@ldesign/kit': resolve(__dirname, '../packages/kit/src'),

      '@ldesign/pdf': resolve(__dirname, '../packages/pdf/src'),
      '@ldesign/pdf/vue': resolve(__dirname, '../packages/pdf/src/vue'),

      '@ldesign/qrcode': resolve(__dirname, '../packages/qrcode/src'),
      '@ldesign/qrcode/vue': resolve(__dirname, '../packages/qrcode/src/vue'),

      '@ldesign/router': resolve(__dirname, '../packages/router/src'),
      '@ldesign/router/vue': resolve(__dirname, '../packages/router/src/vue'),

      '@ldesign/shared': resolve(__dirname, '../packages/shared/src'),

      '@ldesign/size': resolve(__dirname, '../packages/size/src'),
      '@ldesign/size/vue': resolve(__dirname, '../packages/size/src/vue'),

      '@ldesign/store': resolve(__dirname, '../packages/store/src'),
      '@ldesign/store/vue': resolve(__dirname, '../packages/store/src/vue'),

      '@ldesign/template': resolve(__dirname, '../packages/template/src'),
      '@ldesign/template/vue': resolve(__dirname, '../packages/template/src/vue'),

      '@ldesign/theme': resolve(__dirname, '../packages/theme/src'),
      '@ldesign/theme/vue': resolve(__dirname, '../packages/theme/src/vue'),

      '@ldesign/watermark': resolve(__dirname, '../packages/watermark/src'),
      '@ldesign/watermark/vue': resolve(__dirname, '../packages/watermark/src/vue'),

      // 通用 alias
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './'),
    }
  },
  server: {
    port: 8888,
    open: true,
    cors: true,
    host: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    reportCompressedSize: false,
    sourcemap: process.env.SOURCEMAP === 'true',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router')) return 'vendor-vue'
            return 'vendor'
          }
          if (id.includes(resolve(__dirname, '../packages/'))) {
            const m = id.match(/[\\\\/]{1}packages[\\\\/]{1}([^\\\\/]+)/)
            const name = (m && m[1]) || 'ldesign'
            return `ldesign-${name}`
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router'
    ],
    exclude: [
      '@ldesign/api',
      '@ldesign/cache',
      '@ldesign/color',
      '@ldesign/component',
      '@ldesign/crypto',
      '@ldesign/device',
      '@ldesign/engine',
      '@ldesign/git',
      '@ldesign/http',
      '@ldesign/i18n',
      '@ldesign/kit',
      '@ldesign/pdf',
      '@ldesign/qrcode',
      '@ldesign/router',
      '@ldesign/shared',
      '@ldesign/size',
      '@ldesign/store',
      '@ldesign/template',
      '@ldesign/theme',
      '@ldesign/watermark',
      '@ldesign/form',
      'fsevents'
    ],
    esbuildOptions: {
      target: 'es2020',
      // 忽略 .node 文件
      loader: {
        '.node': 'empty'
      }
    }
  },
  esbuild: {
    // 蹇界暐 TypeScript 閰嶇疆閿欒
    tsconfigRaw: {
      compilerOptions: {
        target: 'es2020',
        module: 'esnext',
        moduleResolution: 'bundler'
      }
    },
    drop: process.env.DROP_LOGS === 'true' ? ['console', 'debugger'] : undefined
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})
