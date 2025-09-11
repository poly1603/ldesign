import { createPackageViteConfig } from '@ldesign/builder'

export default createPackageViteConfig({
  enableCSS: true,
  lessOptions: {
    javascriptEnabled: true,
  },
  external: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
  globals: {
    'vue': 'Vue',
    '@vue/runtime-core': 'Vue',
    '@vue/runtime-dom': 'Vue',
  }
})
