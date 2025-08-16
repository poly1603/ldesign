import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export function createRollupConfig(options = {}) {
  const {
    input = 'src/index.ts',
    outputDir = 'dist',
    packageName,
    external = [],
    plugins = [],
    formats = ['es', 'cjs', 'umd'],
  } = options

  // 读取 package.json 获取包信息
  const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
  )
  const name =
    packageName || pkg.name?.replace('@ldesign/', '') || 'LDesignPackage'

  const basePlugins = [
    nodeResolve({
      preferBuiltins: false,
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: outputDir,
      rootDir: 'src',
    }),
    ...plugins,
  ]

  const outputs = []

  if (formats.includes('es')) {
    outputs.push({
      file: `${outputDir}/index.js`,
      format: 'es',
      sourcemap: true,
    })
  }

  if (formats.includes('cjs')) {
    outputs.push({
      file: `lib/index.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    })
  }

  if (formats.includes('umd')) {
    outputs.push({
      file: `${outputDir}/index.min.js`,
      format: 'umd',
      name,
      sourcemap: true,
      plugins: [terser()],
    })
  }

  return defineConfig({
    input,
    output: outputs,
    external: ['vue', '@vue/runtime-core', '@vue/runtime-dom', ...external],
    plugins: basePlugins,
  })
}

export default createRollupConfig
