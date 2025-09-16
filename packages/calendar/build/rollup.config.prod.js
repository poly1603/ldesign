/**
 * Rollup 生产构建配置
 * 包含代码分割、Tree Shaking、打包优化等
 */

import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import json from '@rollup/plugin-json'
import { visualizer } from 'rollup-plugin-visualizer'
import gzipPlugin from 'rollup-plugin-gzip'
import { minify } from 'html-minifier-terser'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import purgecss from '@fullhuman/postcss-purgecss'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import path from 'path'
import fs from 'fs'

// 包信息
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const banner = `/**
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * @license ${pkg.license}
 */`

// 外部依赖（不打包进最终产物）
const external = [
  'vue',
  'react',
  'react-dom',
  '@angular/core',
  '@angular/common',
  'svelte'
]

// 全局变量映射
const globals = {
  'vue': 'Vue',
  'react': 'React',
  'react-dom': 'ReactDOM',
  'dayjs': 'dayjs'
}

// Tree-shaking 配置
const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  tryCatchDeoptimization: false,
  unknownGlobalSideEffects: false
}

// Terser 压缩配置
const terserOptions = {
  ecma: 2020,
  module: true,
  toplevel: true,
  compress: {
    passes: 3,
    pure_getters: true,
    pure_funcs: ['console.log', 'console.info', 'console.debug'],
    drop_console: true,
    drop_debugger: true,
    dead_code: true,
    unused: true,
    comparisons: true,
    if_return: true,
    join_vars: true,
    reduce_vars: true,
    collapse_vars: true,
    inline: 3,
    hoist_funs: true,
    hoist_props: true,
    hoist_vars: false,
    loops: true,
    switches: true,
    conditionals: true,
    sequences: true,
    booleans: true,
    properties: true,
    arguments: true,
    side_effects: true,
    keep_fargs: false,
    keep_fnames: false,
    typeofs: true,
    unsafe: true,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_Function: true,
    unsafe_math: true,
    unsafe_methods: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    unsafe_undefined: true
  },
  mangle: {
    eval: true,
    keep_classnames: false,
    keep_fnames: false,
    module: true,
    reserved: [],
    toplevel: true,
    safari10: false,
    properties: {
      regex: /^_/,
      reserved: []
    }
  },
  format: {
    ecma: 2020,
    comments: false,
    ascii_only: true,
    inline_script: false,
    wrap_iife: false,
    wrap_func_args: false,
    beautify: false,
    braces: false,
    indent_level: 0,
    indent_start: 0,
    quote_style: 3,
    keep_numbers: false,
    keep_quoted_props: false,
    preserve_annotations: false,
    semicolons: true,
    shebang: false
  },
  safari10: false
}

// PostCSS 配置
const postcssOptions = {
  extract: true,
  minimize: true,
  modules: false,
  autoModules: false,
  sourceMap: false,
  inject: false,
  plugins: [
    autoprefixer({
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not ie 11'
      ]
    }),
    cssnano({
      preset: ['advanced', {
        discardComments: {
          removeAll: true
        },
        reduceIdents: true,
        mergeIdents: true,
        discardUnused: true,
        discardDuplicates: true,
        discardOverridden: true,
        normalizeWhitespace: true,
        colormin: true,
        convertValues: true,
        calc: true,
        minifyFontValues: true,
        minifyParams: true,
        minifySelectors: true,
        minifyGradients: true,
        normalizeCharset: true,
        normalizeUrl: true,
        orderedValues: true,
        uniqueSelectors: true,
        mergeLonghand: true,
        mergeRules: true,
        cssDeclarationSorter: true,
        zindex: true
      }]
    }),
    purgecss({
      content: [
        './src/**/*.{ts,tsx,js,jsx}',
        './src/**/*.vue',
        './examples/**/*.html'
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [
          /^calendar-/,
          /^theme-/,
          /^view-/,
          /^event-/,
          /^date-/,
          /^time-/,
          'today',
          'selected',
          'active',
          'disabled',
          'dragging',
          'dropping'
        ],
        deep: [/^cal-/],
        greedy: [/calendar/]
      }
    })
  ]
}

// 代码分割配置
const manualChunks = {
  // 核心功能
  'calendar-core': [
    'src/index.ts',
    'src/core/Calendar.ts',
    'src/core/EventManager.ts',
    'src/core/ViewManager.ts'
  ],
  // 视图相关
  'calendar-views': [
    'src/views/MonthView.ts',
    'src/views/WeekView.ts',
    'src/views/DayView.ts',
    'src/views/YearView.ts'
  ],
  // 工具和辅助功能
  'calendar-utils': [
    'src/utils/date.ts',
    'src/utils/dom.ts',
    'src/utils/event.ts',
    'src/utils/validator.ts'
  ],
  // 插件系统
  'calendar-plugins': [
    'src/plugins/index.ts',
    'src/plugins/lunar.ts',
    'src/plugins/holidays.ts',
    'src/plugins/weather.ts'
  ],
  // 主题系统
  'calendar-themes': [
    'src/themes/index.ts',
    'src/themes/default.ts',
    'src/themes/dark.ts',
    'src/themes/light.ts'
  ],
  // 国际化
  'calendar-i18n': [
    'src/i18n/index.ts',
    'src/i18n/locales/zh-CN.ts',
    'src/i18n/locales/en-US.ts',
    'src/i18n/locales/ja-JP.ts'
  ],
  // 高级功能
  'calendar-advanced': [
    'src/features/advanced.ts',
    'src/features/persistence.ts'
  ],
  // 框架适配器
  'calendar-adapters': [
    'src/adapters/vue.ts',
    'src/adapters/react.tsx',
    'src/adapters/angular.ts',
    'src/adapters/svelte.ts'
  ]
}

// 主配置
const config = defineConfig([
  // ESM 构建（现代浏览器）
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      entryFileNames: '[name].[hash].js',
      chunkFileNames: 'chunks/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash][extname]',
      banner,
      sourcemap: true,
      sourcemapExcludeSources: true,
      compact: true,
      generatedCode: {
        arrowFunctions: true,
        constBindings: true,
        objectShorthand: true,
        reservedNamesAsProps: false,
        symbols: true
      },
      manualChunks(id) {
        for (const [chunk, paths] of Object.entries(manualChunks)) {
          if (paths.some(p => id.includes(p))) {
            return chunk
          }
        }
        
        // Vendor chunks
        if (id.includes('node_modules')) {
          if (id.includes('dayjs')) return 'vendor-dayjs'
          if (id.includes('lunar')) return 'vendor-lunar'
          return 'vendor'
        }
      }
    },
    external,
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: true,
        declarationDir: 'dist/types',
        sourceMap: true,
        inlineSources: false
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
      }),
      commonjs({
        transformMixedEsModules: true
      }),
      json(),
      postcss(postcssOptions),
      terser(terserOptions),
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      })
    ],
    treeshake
  },

  // UMD 构建（兼容老浏览器）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/calendar.min.js',
      format: 'umd',
      name: 'LDesignCalendar',
      globals,
      banner,
      sourcemap: false,
      compact: true,
      generatedCode: {
        arrowFunctions: false,
        constBindings: false,
        objectShorthand: false,
        reservedNamesAsProps: true,
        symbols: false
      }
    },
    external: Object.keys(globals),
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        sourceMap: false
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      postcss({
        ...postcssOptions,
        extract: 'calendar.min.css'
      }),
      getBabelOutputPlugin({
        presets: [
          ['@babel/preset-env', {
            targets: '> 0.25%, not dead',
            modules: false,
            loose: true,
            bugfixes: true,
            useBuiltIns: false
          }]
        ],
        plugins: [
          '@babel/plugin-transform-runtime'
        ],
        allowAllFormats: true
      }),
      terser({
        ...terserOptions,
        format: {
          ...terserOptions.format,
          ecma: 5
        }
      }),
      gzipPlugin({
        fileName: '.gz',
        algorithm: 'gzip',
        additionalFiles: ['dist/calendar.min.css']
      })
    ],
    treeshake
  },

  // 单独的 CSS 构建
  {
    input: 'src/index.css',
    output: {
      file: 'dist/calendar.css',
      format: 'es'
    },
    plugins: [
      postcss({
        extract: true,
        minimize: false,
        modules: false,
        plugins: [autoprefixer()]
      })
    ]
  },

  // CDN 优化构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cdn/calendar.js',
      format: 'iife',
      name: 'LDesignCalendar',
      globals: {
        dayjs: 'dayjs'
      },
      banner,
      sourcemap: false,
      compact: true
    },
    external: ['dayjs'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        sourceMap: false
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      postcss({
        extract: 'calendar.css',
        minimize: true
      }),
      terser({
        ...terserOptions,
        compress: {
          ...terserOptions.compress,
          global_defs: {
            '@__DEV__': false,
            '@__PROD__': true,
            '@__CDN__': true
          }
        }
      }),
      // 为 CDN 生成 SRI hash
      {
        name: 'sri-generator',
        generateBundle(options, bundle) {
          const crypto = require('crypto')
          const sriHashes = {}
          
          for (const fileName in bundle) {
            const chunk = bundle[fileName]
            if (chunk.type === 'chunk' || chunk.type === 'asset') {
              const content = chunk.code || chunk.source
              const hash = crypto
                .createHash('sha384')
                .update(content)
                .digest('base64')
              
              sriHashes[fileName] = `sha384-${hash}`
            }
          }
          
          // 写入 SRI hash 文件
          this.emitFile({
            type: 'asset',
            fileName: 'sri-hashes.json',
            source: JSON.stringify(sriHashes, null, 2)
          })
        }
      }
    ],
    treeshake
  }
])

// 生成 HTML 示例文件
config.forEach(conf => {
  conf.plugins.push({
    name: 'html-generator',
    generateBundle() {
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign Calendar - Production Build</title>
  <link rel="stylesheet" href="./calendar.min.css">
  <link rel="preload" href="./calendar.min.js" as="script">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
</head>
<body>
  <div id="app"></div>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
  <script src="./calendar.min.js"></script>
  <script>
    // Initialize calendar
    const calendar = new LDesignCalendar.Calendar('#app', {
      locale: 'zh-CN',
      theme: 'default'
    })
  </script>
</body>
</html>`

      const minified = minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
      })

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: minified
      })
    }
  })
})

// 生成 package.json for CDN
config.push({
  input: 'build/cdn-package.js',
  plugins: [
    {
      name: 'cdn-package-generator',
      buildStart() {
        this.emitFile({
          type: 'asset',
          fileName: 'cdn/package.json',
          source: JSON.stringify({
            name: `${pkg.name}-cdn`,
            version: pkg.version,
            description: `${pkg.description} (CDN optimized)`,
            main: 'calendar.js',
            style: 'calendar.css',
            unpkg: 'calendar.js',
            jsdelivr: 'calendar.js',
            files: ['calendar.js', 'calendar.css', 'sri-hashes.json'],
            sideEffects: false
          }, null, 2)
        })
      }
    }
  ]
})

export default config