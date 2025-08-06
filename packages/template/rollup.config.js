import { createVueConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createVueConfig(import.meta.url, {
  globalName: 'LDesignTemplate',
  globals: {
    vue: 'Vue',
  },
})
