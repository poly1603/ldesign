import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

/**
 * 创建基础Rollup配置
 * @param {string} packageDir - 包目录路径
 * @param {object} options - 配置选项
 */
export function createRollupConfig(packageDir, options = {}) {
  const pkg = JSON.parse(
    readFileSync(resolve(packageDir, 'package.json'), 'utf-8'),
  )
  const input = resolve(packageDir, 'src/index.ts')

  const external = [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
    /^vue($|\/)/,
    /^@vue\//,
    /^@ldesign\//,
  ]

  const plugins = [
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfig: resolve(packageDir, 'tsconfig.json'),
      declaration: false,
      declarationMap: false,
    }),
  ]

  if (options.minify) {
    plugins.push(terser())
  }

  return [
    // ESM build
    {
      input,
      external,
      plugins,
      output: {
        file: resolve(packageDir, pkg.module),
        format: 'es',
        sourcemap: true,
      },
    },
    // CommonJS build
    {
      input,
      external,
      plugins,
      output: {
        file: resolve(packageDir, pkg.main),
        format: 'cjs',
        sourcemap: true,
        exports: 'auto',
      },
    },
    // TypeScript declarations
    {
      input,
      external,
      plugins: [dts()],
      output: {
        file: resolve(packageDir, pkg.types),
        format: 'es',
      },
    },
  ]
}

/**
 * 为包创建标准rollup配置文件
 */
export function generateRollupConfig(packageName) {
  return `import { createRollupConfig } from '../../tools/configs/rollup.base.config.js'

export default createRollupConfig(process.cwd())
`
}
