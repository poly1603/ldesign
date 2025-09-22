import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignStore',
  external: [
    'vue',
    'pinia',
    'reflect-metadata',
    'ws',
    'node:events',
    'node:path',
    'node:fs',
    'node:util'
  ],
  globals: {
    'vue': 'Vue',
    'pinia': 'Pinia',
    'reflect-metadata': 'Reflect',
    'ws': 'WebSocket'
  },
  vue: true,
  // 减少构建警告
  onwarn: (warning, warn) => {
    // 忽略Node.js内置模块的警告
    if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.startsWith('node:')) {
      return
    }
    // 忽略空chunk警告
    if (warning.code === 'EMPTY_BUNDLE') {
      return
    }
    // 忽略globals警告
    if (warning.code === 'MISSING_GLOBAL_NAME') {
      return
    }
    warn(warning)
  }
})
