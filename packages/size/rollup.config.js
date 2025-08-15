import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

export default createRollupConfig({
  globalName: 'LDesignSize',
  vue: true, // 启用 Vue 支持
})
