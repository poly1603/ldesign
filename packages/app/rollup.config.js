import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import vue from 'rollup-plugin-vue'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const external = [
  'vue',
  'pinia',
  '@ldesign/engine',
  '@ldesign/router',
  '@ldesign/store',
  '@ldesign/i18n',
  '@ldesign/template',
  '@ldesign/color',
  '@ldesign/crypto',
  '@ldesign/device',
  '@ldesign/http',
  '@ldesign/watermark'
]

const globals = {
  'vue': 'Vue',
  'pinia': 'Pinia',
  '@ldesign/engine': 'LDesignEngine',
  '@ldesign/router': 'LDesignRouter',
  '@ldesign/store': 'LDesignStore',
  '@ldesign/i18n': 'LDesignI18n',
  '@ldesign/template': 'LDesignTemplate',
  '@ldesign/color': 'LDesignColor',
  '@ldesign/crypto': 'LDesignCrypto',
  '@ldesign/device': 'LDesignDevice',
  '@ldesign/http': 'LDesignHttp',
  '@ldesign/watermark': 'LDesignWatermark'
}

export default defineConfig([
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    external,
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      vue({
        target: 'browser'
      })
    ]
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    external,
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      vue({
        target: 'browser'
      })
    ]
  },
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LDesignApp',
      globals,
      sourcemap: true
    },
    external,
    plugins: [
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      vue({
        target: 'browser'
      })
    ]
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: pkg.types,
      format: 'es'
    },
    external,
    plugins: [
      dts()
    ]
  }
])
