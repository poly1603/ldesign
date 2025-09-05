import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vue()],

  launcher: {
    autoRestart: true,
    hooks: {
      beforeStart: () => {
        console.log('🚀 Vue 3 项目启动前钩子')
      },
      afterStart: () => {
        console.log('✅ Vue 3 项目启动完成')
      },
      beforeBuild: () => {
        console.log('🔨 Vue 3 项目构建前钩子')
      },
      afterBuild: () => {
        console.log('📦 Vue 3 项目构建完成')
      }
    }
  },

  server: {
    port: 3000,
    host: 'localhost',
    open: true
  }
}

