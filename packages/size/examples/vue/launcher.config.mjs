import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// 简易调试插件：输出插件顺序与关键文件的 transform 片段
function debugLogger() {
  return {
    name: 'debug:logger',
    enforce: 'pre',
    configResolved(resolved) {
      const names = (resolved.plugins || []).map(p => p && p.name).filter(Boolean)
      console.log('[debug] plugin order:', names.join(', '))
    },
    transform(code, id) {
      if (id.endsWith('App.vue') && !id.includes('?')) {
        const preview = (code || '').slice(0, 200).replace(/\n/g, '\\n')
        console.log('[debug] transform(App.vue) length=', code.length, 'preview=', preview)
      }
      return null
    },
  }
}

// 直接导出普通对象，避免依赖 @ldesign/launcher
export default {
  // 禁用 Vite 自动加载 vite.config.*，仅使用本文件配置
  configFile: false,
  plugins: [debugLogger(), vue(), vueJsx()],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@ldesign/size': resolve(process.cwd(), '../../src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  mode: 'production',
  clearScreen: false,
}
