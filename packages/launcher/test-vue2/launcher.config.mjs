import vue2 from '@vitejs/plugin-vue2'

export default {
  plugins: [vue2()],

  launcher: {
    autoRestart: true,
    hooks: {
      beforeStart: () => {
        console.log('🚀 Vue 2 项目启动前钩子')
      },
      afterStart: () => {
        console.log('✅ Vue 2 项目启动完成')
      },
      beforeBuild: () => {
        console.log('🔨 Vue 2 项目构建前钩子')
      },
      afterBuild: () => {
        console.log('📦 Vue 2 项目构建完成')
      }
    }
  },

  server: {
    port: 3001,
    host: 'localhost',
    open: true
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true
  }
}

