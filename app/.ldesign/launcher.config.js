import { defineConfig } from '@ldesign/launcher'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  // 显式添加 Vue JSX 插件 - 确保 JSX 支持
  plugins: [
    vueJsx({
      transformOn: true,
      mergeProps: true
    })
  ],

  // Launcher 基础配置
  launcher: {
    preset: 'ldesign',
    mode: 'development',
    logLevel: 'info',
    autoRestart: false,
    debug: false
  },

  // 路径解析配置
  resolve: {
    alias: [
      { find: '@components', replacement: './src/components', stages: ['dev', 'build', 'preview'] },
      { find: '@utils', replacement: './src/utils', stages: ['dev', 'build', 'preview'] },
      { find: '@assets', replacement: './src/assets', stages: ['dev', 'build', 'preview'] },
      { find: '@styles', replacement: './src/styles', stages: ['dev', 'build', 'preview'] },
      { find: '@ldesign/template/es/index.css', replacement: '../packages/template/src/styles/index.css', stages: ['dev', 'build'] },
      { find: '@ldesign/template', replacement: '../packages/template/src', stages: ['dev', 'build'] },
      { find: '@ldesign/i18n/es/index.css', replacement: '../packages/i18n/src/styles/index.css', stages: ['dev', 'build'] },
      { find: '@ldesign/size/es/index.css', replacement: '../packages/size/src/styles/index.css', stages: ['dev', 'build'] },
      { find: '@ldesign/color/es/exports/vue.css', replacement: '../packages/color/es/exports/vue.css', stages: ['dev', 'build'] },
      { find: '@ldesign/color/es/index.css', replacement: '../packages/color/src/styles/index.css', stages: ['dev', 'build'] },
      { find: '@ldesign/color/exports/vue', replacement: '../packages/color/src/exports/vue', stages: ['dev'] },
      { find: '@ldesign/i18n/vue', replacement: '../packages/i18n/src/vue', stages: ['dev'] },
      { find: '@ldesign/api', replacement: '../packages/api/src', stages: ['dev'] },
      { find: '@ldesign/builder', replacement: '../packages/builder/src', stages: ['dev'] },
      { find: '@ldesign/cache', replacement: '../packages/cache/src', stages: ['dev'] },
      { find: '@ldesign/calendar', replacement: '../packages/calendar/src', stages: ['dev'] },
      { find: '@ldesign/captcha', replacement: '../packages/captcha/src', stages: ['dev'] },
      { find: '@ldesign/chart', replacement: '../packages/chart/src', stages: ['dev'] },
      { find: '@ldesign/color', replacement: '../packages/color/src', stages: ['dev'] },
      { find: '@ldesign/component', replacement: '../packages/component/src', stages: ['dev'] },
      { find: '@ldesign/cropper', replacement: '../packages/cropper/src', stages: ['dev'] },
      { find: '@ldesign/crypto', replacement: '../packages/crypto/src', stages: ['dev'] },
      { find: '@ldesign/datepicker', replacement: '../packages/datepicker/src', stages: ['dev'] },
      { find: '@ldesign/device', replacement: '../packages/device/src', stages: ['dev'] },
      { find: '@ldesign/editor', replacement: '../packages/editor/src', stages: ['dev'] },
      { find: '@ldesign/engine', replacement: '../packages/engine/src', stages: ['dev'] },
      { find: '@ldesign/flowchart', replacement: '../packages/flowchart/src', stages: ['dev'] },
      { find: '@ldesign/form', replacement: '../packages/form/src', stages: ['dev'] },
      { find: '@ldesign/git', replacement: '../packages/git/src', stages: ['dev'] },
      { find: '@ldesign/http', replacement: '../packages/http/src', stages: ['dev'] },
      { find: '@ldesign/i18n', replacement: '../packages/i18n/src', stages: ['dev', 'build'] },
      { find: '@ldesign/icons', replacement: '../packages/icons/packages', stages: ['dev'] },
      { find: '@ldesign/kit', replacement: '../packages/kit/src', stages: ['dev'] },
      { find: '@ldesign/launcher', replacement: '../packages/launcher/src', stages: ['dev'] },
      { find: '@ldesign/map', replacement: '../packages/map/src', stages: ['dev'] },
      { find: '@ldesign/pdf', replacement: '../packages/pdf/src', stages: ['dev'] },
      { find: '@ldesign/progress', replacement: '../packages/progress/src', stages: ['dev'] },
      { find: '@ldesign/qrcode', replacement: '../packages/qrcode/src', stages: ['dev'] },
      { find: '@ldesign/router', replacement: '../packages/router/src', stages: ['dev'] },
      { find: '@ldesign/shared', replacement: '../packages/shared/src', stages: ['dev'] },
      { find: '@ldesign/size', replacement: '../packages/size/src', stages: ['dev'] },
      { find: '@ldesign/store', replacement: '../packages/store/src', stages: ['dev'] },
      { find: '@ldesign/table', replacement: '../packages/table/src', stages: ['dev'] },
      { find: '@ldesign/template', replacement: '../packages/template/src', stages: ['dev'] },
      { find: '@ldesign/theme', replacement: '../packages/theme/src', stages: ['dev'] },
      { find: '@ldesign/tree', replacement: '../packages/tree/src', stages: ['dev'] },
      { find: '@ldesign/ui', replacement: '../packages/ui/src', stages: ['dev'] },
      { find: '@ldesign/video', replacement: '../packages/video/src', stages: ['dev'] },
      { find: '@ldesign/watermark', replacement: '../packages/watermark/src', stages: ['dev'] },
      { find: '@ldesign/websocket', replacement: '../packages/websocket/src', stages: ['dev'] }
    ]
  },

  // 开发服务器配置
  server: {
    port: 3330,
    host: '0.0.0.0',
    open: false,
    https: false,
    cors: true
  },

  // 预览服务器配置
  preview: {
    port: 8888,
    host: '0.0.0.0',
    open: false,
    https: false,
    cors: true
  },

  // 构建配置
  build: {
    outDir: 'site',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    emptyOutDir: true,
    watch: false,
    reportCompressedSize: true
  },

  // 依赖优化配置
  optimizeDeps: {
    force: false
  }
})