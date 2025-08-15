import { createVueConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createVueConfig(import.meta.url, {
  globalName: 'LDesignTemplate',
  formats: ['es', 'cjs', 'umd'], // 包含UMD格式
  globals: {
    vue: 'Vue',
  },
})
