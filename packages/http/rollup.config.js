import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: false,
  external: ['axios', 'alova'],
  globalName: 'LDesignHttp',
  globals: {
    axios: 'axios',
    alova: 'alova',
  },
})
