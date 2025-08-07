import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignApp',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [
        'vue',
        '@ldesign/engine',
        '@ldesign/color',
        '@ldesign/crypto',
        '@ldesign/device',
        '@ldesign/http',
        '@ldesign/i18n',
        '@ldesign/router',
        '@ldesign/store',
        '@ldesign/template'
      ],
      output: {
        globals: {
          vue: 'Vue',
          '@ldesign/engine': 'LDesignEngine',
          '@ldesign/color': 'LDesignColor',
          '@ldesign/crypto': 'LDesignCrypto',
          '@ldesign/device': 'LDesignDevice',
          '@ldesign/http': 'LDesignHttp',
          '@ldesign/i18n': 'LDesignI18n',
          '@ldesign/router': 'LDesignRouter',
          '@ldesign/store': 'LDesignStore',
          '@ldesign/template': 'LDesignTemplate'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
