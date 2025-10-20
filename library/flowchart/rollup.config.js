import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
// import { terser } from 'rollup-plugin-terser';
// import { visualizer } from 'rollup-plugin-visualizer';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

const production = !process.env.ROLLUP_WATCH;

const banner = `/**
 * FlowChart Approval Library v${require('./package.json').version}
 * (c) ${new Date().getFullYear()} FlowChart Team
 * Released under the MIT License.
 */`;

export default [
  // ESM构建（支持tree-shaking）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/flowchart.esm.js',
      format: 'es',
      sourcemap: true,
      banner
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
      })
    ],
    external: []
  },
  
  // ESM压缩版本
  production && {
    input: 'src/index.ts',
    output: {
      file: 'dist/flowchart.esm.min.js',
      format: 'es',
      sourcemap: true,
      banner
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production')
      })
      // terser()
    ],
    external: []
  },
  
  // CommonJS构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/flowchart.cjs.js',
      format: 'cjs',
      sourcemap: true,
      banner,
      exports: 'named'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
      }),
      // production && terser({
      //   compress: {
      //     ecma: 2015
      //   }
      // })
    ].filter(Boolean),
    external: []
  },
  
  // UMD构建（用于浏览器直接引入）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/flowchart.umd.js',
      format: 'umd',
      name: 'FlowChart',
      sourcemap: true,
      banner,
      globals: {}
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
      })
    ],
    external: []
  },
  
  // UMD压缩版本
  production && {
    input: 'src/index.ts',
    output: {
      file: 'dist/flowchart.umd.min.js',
      format: 'umd',
      name: 'FlowChart',
      sourcemap: true,
      banner,
      globals: {}
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      // terser({
      //   compress: {
      //     ecma: 2015,
      //     drop_console: true,
      //     drop_debugger: true,
      //     pure_getters: true
      //   },
      //   format: {
      //     comments: /^!/
      //   }
      // })
    ],
    external: []
  },
  
  // 类型声明文件
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/types/index.d.ts',
      format: 'es'
    },
    plugins: [
      dts()
    ]
  },
  
  // 生成构建分析报告（仅生产环境）
  production && {
    input: 'src/index.ts',
    output: {
      file: 'dist/flowchart.analysis.js',
      format: 'es'
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      // visualizer({
      //   filename: 'dist/stats.html',
      //   title: 'FlowChart Bundle Analysis',
      //   open: false,
      //   gzipSize: true,
      //   brotliSize: true
      // })
    ]
  }
].filter(Boolean);









