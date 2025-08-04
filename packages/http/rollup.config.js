import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: false,
  external: ['axios', 'alova'],
  globalName: 'LDesignHttp',
  globals: {
    'axios': 'axios',
    'alova': 'alova'
  }
})
