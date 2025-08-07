import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  if (isLib) {
    // 库构建配置
    return {
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
    }
  }

  // 开发/演示应用配置
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/views': resolve(__dirname, 'src/views'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/types': resolve(__dirname, 'src/types')
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "@/styles/variables.less";`
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      cors: true
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'ldesign-core': ['@ldesign/engine'],
            'ldesign-ui': ['@ldesign/color', '@ldesign/device', '@ldesign/template'],
            'ldesign-data': ['@ldesign/http', '@ldesign/store', '@ldesign/crypto'],
            'ldesign-utils': ['@ldesign/i18n', '@ldesign/router']
          }
        }
      }
    }
  }
})
