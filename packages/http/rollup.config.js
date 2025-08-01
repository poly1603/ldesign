import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue', 'axios', 'alova'],
  globalName: 'LDesignHttp',
  globals: {
    vue: 'Vue',
    axios: 'axios',
    alova: 'alova',
  },
  vue: true,
})
