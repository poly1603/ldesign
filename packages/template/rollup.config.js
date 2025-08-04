import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 创建基础配置
const baseConfigs = createRollupConfig({
  packageDir: __dirname,
  vue: true,
  external: ['vue'],
  globalName: 'LDesignTemplate',
  globals: {
    'vue': 'Vue'
  }
})

// 过滤掉有问题的 UMD 配置，只保留 ES 和 CJS 构建
export default baseConfigs.filter(config => {
  // 跳过 UMD 构建以避免代码分割问题
  if (config.output && Array.isArray(config.output)) {
    return !config.output.some(output => output.format === 'umd')
  }
  if (config.output && config.output.format === 'umd') {
    return false
  }
  return true
})
