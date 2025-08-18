import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageName: 'LDesignApi',
  vue: false,
  external: [], // API 包不依赖 Vue
  globals: {},
})
