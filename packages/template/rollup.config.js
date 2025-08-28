import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignTemplate',
  tsconfig: './tsconfig.build.json',
  vue: true // 启用Vue支持
})
