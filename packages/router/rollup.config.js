import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: true,
  external: ['vue', '@ldesign/engine', '@ldesign/device'],
  globalName: 'LDesignRouter',
  globals: {
    vue: 'Vue',
    '@ldesign/engine': 'LDesignEngine',
    '@ldesign/device': 'LDesignDevice',
  },
  // 排除 examples 目录
  excludePatterns: ['examples/**/*', 'test/**/*', '**/*.test.*', '**/*.spec.*'],
  // 包含UMD构建，使用专用入口文件避免动态导入
  formats: ['es', 'cjs', 'umd'],
  // UMD 专用入口文件，避免动态导入
  umdEntry: 'src/index.umd.ts',
})
