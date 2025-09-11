import { createPackageViteConfig } from '@ldesign/builder'

export default createPackageViteConfig({
  enableCSS: true,
  lessOptions: {
    javascriptEnabled: true,
    // 自动注入全局变量和混入
    additionalData: `
      @import "@/styles/variables.less";
      @import "@/styles/mixins.less";
    `,
    modifyVars: {
      // 可以在这里动态修改 LESS 变量
    }
  },
  external: ['lucide-vue-next'],
  globals: {
    'lucide-vue-next': 'LucideVueNext'
  }
})
