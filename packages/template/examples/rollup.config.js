import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'rollup'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 读取package.json
const pkg = require('./package.json')

// 是否为生产环境
const isProduction = process.env.NODE_ENV === 'production'

// 外部依赖（不打包进bundle）
const external = [
  'vue',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@vue/reactivity',
  '@vue/shared',
]

// 全局变量映射
const globals = {
  'vue': 'Vue',
  '@vue/runtime-core': 'Vue',
  '@vue/runtime-dom': 'Vue',
  '@vue/reactivity': 'Vue',
  '@vue/shared': 'Vue',
}

// 通用插件配置
const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
    extensions: ['.js', '.ts', '.vue', '.json'],
  }),
  commonjs(),
  vue({
    isProduction,
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('custom-'),
      },
    },
  }),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist/types',
    exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules/**'],
  }),
]

// 生产环境添加压缩插件
if (isProduction) {
  plugins.push(
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    }),
  )
}

export default defineConfig([
  // UMD 构建 - 用于浏览器直接引用
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/ldesign-template-examples.umd.js',
      format: 'umd',
      name: 'LDesignTemplateExamples',
      globals,
      sourcemap: !isProduction,
    },
    external,
    plugins,
  },

  // ES 模块构建 - 用于现代打包工具
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/ldesign-template-examples.esm.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    external,
    plugins,
  },

  // CommonJS 构建 - 用于Node.js环境
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/ldesign-template-examples.cjs.js',
      format: 'cjs',
      exports: 'auto',
      sourcemap: !isProduction,
    },
    external,
    plugins,
  },

  // 组件库构建 - 分别导出每个组件
  {
    input: {
      'index': 'src/components/index.ts',
      'LoginForm': 'src/components/LoginForm.ts',
      'CaptchaComponent': 'src/components/CaptchaComponent.ts',
      'TemplateAnimationWrapper': 'src/components/TemplateAnimationWrapper.vue',
      'templates/DesktopClassicTemplate': 'src/components/templates/DesktopClassicTemplate.vue',
      'templates/DesktopModernTemplate': 'src/components/templates/DesktopModernTemplate.vue',
      'templates/TabletAdaptiveTemplate': 'src/components/templates/TabletAdaptiveTemplate.vue',
      'templates/TabletSplitTemplate': 'src/components/templates/TabletSplitTemplate.vue',
      'templates/MobileSimpleTemplate': 'src/components/templates/MobileSimpleTemplate.vue',
      'templates/MobileCardTemplate': 'src/components/templates/MobileCardTemplate.vue',
    },
    output: {
      dir: 'dist/components',
      format: 'es',
      entryFileNames: '[name].js',
      chunkFileNames: 'shared/[name]-[hash].js',
      sourcemap: !isProduction,
    },
    external,
    plugins: [
      ...plugins,
      // 代码分割优化
      {
        name: 'code-splitting',
        generateBundle(options, bundle) {
          // 优化chunk命名
          Object.keys(bundle).forEach((fileName) => {
            const chunk = bundle[fileName]
            if (chunk.type === 'chunk' && chunk.isEntry === false) {
              // 重命名共享chunk
              if (chunk.name && chunk.name.includes('node_modules')) {
                chunk.fileName = `shared/vendor-${chunk.name.replace(/[^a-z0-9]/gi, '-')}.js`
              }
            }
          })
        },
      },
    ],
  },

  // Composables 构建 - 导出工具函数
  {
    input: {
      useTemplateLoader: 'src/composables/useTemplateLoader.ts',
      useTemplateAnimation: 'src/composables/useTemplateAnimation.ts',
    },
    output: {
      dir: 'dist/composables',
      format: 'es',
      entryFileNames: '[name].js',
      sourcemap: !isProduction,
    },
    external,
    plugins: plugins.filter(plugin => plugin.name !== '@vitejs/plugin-vue'), // 移除Vue插件
  },

  // 样式构建 - 单独打包样式文件
  {
    input: 'src/styles/index.js', // 需要创建这个入口文件
    output: {
      file: 'dist/styles/index.js',
      format: 'es',
    },
    plugins: [
      resolve(),
      // 自定义插件处理样式文件
      {
        name: 'style-processor',
        load(id) {
          if (id.endsWith('src/styles/index.js')) {
            return `
              import './templates.less';
              import './template-variants.less';
              import './captcha.less';
              import './animations.less';
              export default {};
            `
          }
        },
      },
    ],
  },
])
