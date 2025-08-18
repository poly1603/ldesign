import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignHttp',
  formats: ['es', 'cjs', 'umd'],
  external: ['vue', 'axios', 'alova'],
  globals: {
    vue: 'Vue',
    axios: 'axios',
    alova: 'alova',
  },
  vue: true,
})
