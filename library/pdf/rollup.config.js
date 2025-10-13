import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';
import copy from 'rollup-plugin-copy';

const production = process.env.NODE_ENV === 'production';

export default [
  // Main library build
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/pdf-viewer.js',
        format: 'umd',
        name: 'UniversalPDFViewer',
        sourcemap: !production,
        globals: {
          'pdfjs-dist': 'pdfjsLib'
        }
      },
      {
        file: 'dist/pdf-viewer.esm.js',
        format: 'esm',
        sourcemap: !production
      },
      {
        file: 'dist/pdf-viewer.min.js',
        format: 'umd',
        name: 'UniversalPDFViewer',
        sourcemap: false,
        plugins: [terser()],
        globals: {
          'pdfjs-dist': 'pdfjsLib'
        }
      }
    ],
    external: ['pdfjs-dist'],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      }),
      css({
        output: 'dist/styles.css'
      }),
      copy({
        targets: [
          { 
            src: 'src/styles/index.css', 
            dest: 'dist',
            rename: 'pdf-viewer.css'
          }
        ]
      })
    ]
  },

  // React wrapper build
  {
    input: 'src/frameworks/react/PDFViewer.tsx',
    output: [
      {
        file: 'dist/react/index.js',
        format: 'cjs',
        sourcemap: !production
      },
      {
        file: 'dist/react/index.esm.js',
        format: 'esm',
        sourcemap: !production
      }
    ],
    external: [
      'react',
      'react-dom',
      'pdfjs-dist',
      '../../index'
    ],
    plugins: [
      resolve({
        browser: true,
        extensions: ['.tsx', '.ts', '.jsx', '.js']
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.react.json',
        declaration: true,
        declarationDir: 'dist/react/types'
      })
    ]
  },

  // Vue wrapper build
  {
    input: 'src/frameworks/vue/index.ts',
    output: [
      {
        file: 'dist/vue/index.js',
        format: 'cjs',
        sourcemap: !production
      },
      {
        file: 'dist/vue/index.esm.js',
        format: 'esm',
        sourcemap: !production
      }
    ],
    external: [
      'vue',
      'pdfjs-dist',
      '../../index'
    ],
    plugins: [
      resolve({
        browser: true,
        extensions: ['.vue', '.ts', '.js']
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.vue.json',
        declaration: true,
        declarationDir: 'dist/vue/types'
      })
    ]
  }
];