import { resolve } from 'node:path'
import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import vue from 'rollup-plugin-vue'
import { terser } from 'rollup-plugin-terser'
import dts from 'rollup-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'

const production = !process.env.ROLLUP_WATCH
const analyze = process.env.ANALYZE === 'true'

// 外部依赖
const external = [
  'vue',
  '@ldesign/device',
  '@ldesign/engine',
  '@ldesign/template',
  /^vue\//,
  /^@vue\//,
]

// 全局变量映射
const globals = {
  'vue': 'Vue',
  '@ldesign/device': 'LDesignDevice',
  '@ldesign/engine': 'LDesignEngine',
  '@ldesign/template': 'LDesignTemplate',
}

// 通用插件
const commonPlugins = [
  alias({
    entries: [
      { find: '@', replacement: resolve(__dirname, 'src') },
    ],
  }),
  nodeResolve({
    preferBuiltins: true,
    browser: true,
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  }),
  commonjs(),
  vue({
    preprocessStyles: true,
    target: 'browser',
  }),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
    '__DEV__': !production,
    'import.meta.env.DEV': !production,
    'import.meta.env.PROD': production,
  }),
]

// TypeScript 插件配置
const tsPlugin = typescript({
  tsconfig: './tsconfig.json',
  declaration: false,
  declarationMap: false,
  sourceMap: !production,
  inlineSources: !production,
})

// 构建配置
const builds = []

// ESM 构建
builds.push({
  input: 'src/index.ts',
  external,
  output: {
    file: 'es/index.js',
    format: 'es',
    sourcemap: !production,
    exports: 'named',
  },
  plugins: [
    ...commonPlugins,
    tsPlugin,
    production && terser({
      compress: {
        ecma: 2015,
        pure_getters: true,
        passes: 2,
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
      module: true,
    }),
    analyze && visualizer({
      filename: 'stats-es.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
})

// CommonJS 构建
builds.push({
  input: 'src/index.ts',
  external,
  output: {
    file: 'lib/index.cjs',
    format: 'cjs',
    sourcemap: !production,
    exports: 'named',
    interop: 'auto',
  },
  plugins: [
    ...commonPlugins,
    tsPlugin,
    production && terser({
      compress: {
        ecma: 5,
        pure_getters: true,
        passes: 2,
      },
      format: {
        comments: false,
      },
    }),
  ].filter(Boolean),
})

// UMD 构建（用于浏览器）
if (production) {
  // 开发版本
  builds.push({
    input: 'src/index.ts',
    external: ['vue'],
    output: {
      file: 'dist/ldesign-router.js',
      format: 'umd',
      name: 'LDesignRouter',
      globals: { vue: 'Vue' },
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      ...commonPlugins,
      tsPlugin,
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('development'),
        '__DEV__': true,
      }),
    ],
  })

  // 生产版本（压缩）
  builds.push({
    input: 'src/index.ts',
    external: ['vue'],
    output: {
      file: 'dist/ldesign-router.min.js',
      format: 'umd',
      name: 'LDesignRouter',
      globals: { vue: 'Vue' },
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      ...commonPlugins,
      tsPlugin,
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        '__DEV__': false,
      }),
      terser({
        compress: {
          ecma: 5,
          pure_getters: true,
          passes: 3,
          drop_console: true,
          drop_debugger: true,
          collapse_vars: true,
          reduce_vars: true,
          inline: true,
          unused: true,
        },
        format: {
          comments: false,
        },
        mangle: {
          safari10: true,
        },
      }),
      analyze && visualizer({
        filename: 'stats-umd.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
  })
}

// 类型声明文件构建
if (production) {
  builds.push({
    input: 'src/index.ts',
    output: {
      file: 'types/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['src/*'],
          },
        },
      }),
    ],
  })
}

// 独立功能模块构建（支持树摇）
const modules = [
  'components/index',
  'composables/index',
  'core/index',
  'device/index',
  'engine/index',
  'guards/index',
  'plugins/animation/index',
  'plugins/cache/index',
  'plugins/performance/index',
  'plugins/preload/index',
  'utils/index',
  'utils/lazy-load',
]

if (production) {
  modules.forEach(module => {
    const fileName = module.replace(/\//g, '-')
    
    // ESM 模块
    builds.push({
      input: `src/${module}.ts`,
      external,
      output: {
        file: `es/${fileName}.js`,
        format: 'es',
        sourcemap: false,
        exports: 'named',
      },
      plugins: [
        ...commonPlugins,
        tsPlugin,
        terser({
          compress: {
            ecma: 2015,
            pure_getters: true,
            passes: 2,
            drop_console: true,
            drop_debugger: true,
          },
          format: {
            comments: false,
          },
          module: true,
        }),
      ],
    })
  })
}

export default defineConfig(builds)
