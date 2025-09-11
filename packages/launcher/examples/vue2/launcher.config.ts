import { defineConfig } from '@ldesign/launcher';
import { createVuePlugin } from 'vite-plugin-vue2';

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3002,
    open: true,
    host: true,
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', '@vue/composition-api'],
        },
      },
    },
  },
  
  // 插件配置
  plugins: [
    createVuePlugin({
      jsx: true,
      jsxOptions: {
        functional: false,
        injectH: false,
      },
    }),
  ],
  
  // CSS 预处理器配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/styles/variables.scss";',
      },
    },
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': '/src',
      '~': '/src/styles',
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json'],
  },
  
  // 开发工具
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
});
