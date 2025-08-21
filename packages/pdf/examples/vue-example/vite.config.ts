import type { UserConfig } from 'vite'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
  const isDev = command === 'serve'
  const isProd = command === 'build'

  return {
    // 插件配置
    plugins: [
      vue({
        // Vue 插件选项
        reactivityTransform: true, // 启用响应式语法糖
        script: {
          // 脚本处理选项
          defineModel: true, // 启用 defineModel 宏
          propsDestructure: true, // 启用 props 解构
        },
        template: {
          // 模板编译选项
          compilerOptions: {
            // 自定义元素处理
            isCustomElement: tag => tag.startsWith('pdf-'),
          },
        },
      }),
    ],

    // 路径别名
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@composables': resolve(__dirname, 'src/composables'),
        '@types': resolve(__dirname, 'src/types'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@ldesign/pdf': resolve(__dirname, '../../src'),
      },
      // 文件扩展名解析
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    // 开发服务器配置
    server: {
      port: 5174, // Vue 示例端口
      host: true, // 允许外部访问
      open: true, // 自动打开浏览器
      cors: true, // 启用 CORS
      strictPort: false, // 端口被占用时自动尝试下一个

      // 代理配置（如果需要）
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },

      // 文件监听配置
      watch: {
        usePolling: false,
        interval: 100,
      },

      // HMR 配置
      hmr: {
        overlay: true, // 显示错误覆盖层
        clientPort: 5174,
      },
    },

    // 预览服务器配置
    preview: {
      port: 4174,
      host: true,
      open: true,
      cors: true,
    },

    // 构建配置
    build: {
      target: 'es2020', // 构建目标
      outDir: 'dist', // 输出目录
      assetsDir: 'assets', // 静态资源目录
      sourcemap: isDev, // 开发环境生成 sourcemap
      minify: isProd ? 'esbuild' : false, // 生产环境压缩

      // CSS 代码分割
      cssCodeSplit: true,

      // 构建时清空输出目录
      emptyOutDir: true,

      // Rollup 选项
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // 手动分块
          manualChunks: {
            // Vue 相关
            'vue': ['vue'],
            'vue-vendor': ['@vueuse/core'],

            // PDF 相关
            'pdf-core': ['@ldesign/pdf'],

            // 工具库
            'utils': ['lodash-es', 'date-fns'],
          },

          // 文件命名
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]

            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
              return `assets/images/[name]-[hash].${ext}`
            }

            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return `assets/fonts/[name]-[hash].${ext}`
            }

            if (/\.css$/i.test(assetInfo.name || '')) {
              return `assets/css/[name]-[hash].${ext}`
            }

            return `assets/[name]-[hash].${ext}`
          },
        },

        // 外部依赖（如果需要 CDN）
        external: isDev ? [] : [
          // 'vue' // 如果使用 CDN
        ],
      },

      // 报告压缩详情
      reportCompressedSize: true,

      // 构建警告阈值
      chunkSizeWarningLimit: 1000,
    },

    // 依赖优化
    optimizeDeps: {
      include: [
        'vue',
        '@vueuse/core',
        '@ldesign/pdf',
      ],
      exclude: [
        // 排除不需要预构建的依赖
      ],

      // 强制预构建
      force: false,
    },

    // CSS 配置
    css: {
      // CSS 预处理器选项
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/styles/variables.scss";
            @import "@/styles/mixins.scss";
          `,
        },
      },

      // CSS 模块
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDev
          ? '[name]__[local]___[hash:base64:5]'
          : '[hash:base64:8]',
      },

      // PostCSS 配置
      postcss: {
        plugins: [
          // 如果需要可以添加 PostCSS 插件
        ],
      },

      // 开发环境 sourcemap
      devSourcemap: isDev,
    },

    // 环境变量
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,

      // 自定义全局变量
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDev,
      __PROD__: isProd,
    },

    // ESBuild 配置
    esbuild: {
      target: 'es2020',
      drop: isProd ? ['console', 'debugger'] : [], // 生产环境移除 console 和 debugger
      legalComments: 'none', // 移除法律注释
    },

    // 日志级别
    logLevel: isDev ? 'info' : 'warn',

    // 清除控制台
    clearScreen: false,

    // 应用类型
    appType: 'spa',

    // 基础路径
    base: './',

    // 公共目录
    publicDir: 'public',

    // 缓存目录
    cacheDir: 'node_modules/.vite',

    // 工作线程配置
    worker: {
      format: 'es',
      plugins: [],
    },

    // 实验性功能
    experimental: {
      renderBuiltUrl: (filename, { hostType }) => {
        if (hostType === 'js') {
          return { js: `window.__assetsPath(${JSON.stringify(filename)})` }
        }
        else {
          return { relative: true }
        }
      },
    },
  }
})
