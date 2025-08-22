/**
 * Vite 构建配置模板
 *
 * 统一的Vite构建配置，替代Rollup，提供更好的开发体验和构建性能
 */

import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, type UserConfig } from 'vite'
import dts from 'vite-plugin-dts'

export interface ViteBuildOptions {
  /** 包名 */
  packageName: string
  /** 是否启用Vue支持 */
  vue?: boolean
  /** 是否启用JSX支持 */
  jsx?: boolean
  /** 外部依赖 */
  external?: string[]
  /** 全局变量映射 */
  globals?: Record<string, string>
  /** 是否生成类型声明文件 */
  dts?: boolean
  /** 是否启用包分析 */
  analyze?: boolean
  /** 自定义别名 */
  alias?: Record<string, string>
}

/**
 * 创建基础Vite配置
 */
export function createViteConfig(options: ViteBuildOptions): UserConfig {
  const {
    packageName,
    vue = true,
    jsx = false,
    external = ['vue'],
    globals = { vue: 'Vue' },
    dts: enableDts = true,
    analyze = false,
    alias = {},
  } = options

  const plugins = []

  // Vue支持
  if (vue) {
    plugins.push(vue())
  }

  // JSX支持
  if (jsx) {
    plugins.push(vueJsx())
  }

  // TypeScript声明文件生成
  if (enableDts) {
    plugins.push(
      dts({
        outDir: 'types',
        insertTypesEntry: true,
        rollupTypes: true,
        copyDtsFiles: true,
      }),
    )
  }

  // 包分析
  if (analyze) {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    )
  }

  return defineConfig({
    plugins,

    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
        [`@ldesign/${packageName}`]: resolve(process.cwd(), 'src'),
        ...alias,
      },
    },

    build: {
      lib: {
        entry: resolve(process.cwd(), 'src/index.ts'),
        name: `LDesign${
          packageName.charAt(0).toUpperCase() + packageName.slice(1)
        }`,
        formats: ['es', 'cjs', 'umd'],
        fileName: (format) => {
          switch (format) {
            case 'es':
              return 'es/index.js'
            case 'cjs':
              return 'lib/index.js'
            case 'umd':
              return 'dist/index.js'
            default:
              return `${format}/index.js`
          }
        },
      },

      rollupOptions: {
        external,
        output: {
          globals,
          // 保持目录结构
          preserveModules: true,
          preserveModulesRoot: 'src',
          // 分别输出到不同目录
          dir: undefined, // 禁用dir，使用fileName
        },
      },

      // 生成sourcemap
      sourcemap: true,

      // 清理输出目录
      emptyOutDir: true,

      // 目标环境
      target: 'es2020',

      // 压缩配置
      minify: 'esbuild',
    },

    // 开发服务器配置
    server: {
      port: 3000,
      open: false,
      cors: true,
    },

    // CSS配置
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          globalVars: {
            'primary-color': '#1890ff',
            'success-color': '#52c41a',
            'warning-color': '#faad14',
            'error-color': '#f5222d',
          },
        },
      },
    },

    // 优化配置
    optimizeDeps: {
      include: vue ? ['vue'] : [],
    },

    // ESBuild配置
    esbuild: {
      target: 'es2020',
      keepNames: true,
    },
  })
}

/**
 * 创建Vue组件包配置
 */
export function createVuePackageConfig(
  packageName: string,
  options: Partial<ViteBuildOptions> = {},
) {
  return createViteConfig({
    packageName,
    vue: true,
    jsx: true,
    ...options,
  })
}

/**
 * 创建工具包配置
 */
export function createUtilsPackageConfig(
  packageName: string,
  options: Partial<ViteBuildOptions> = {},
) {
  return createViteConfig({
    packageName,
    vue: false,
    jsx: false,
    external: [],
    globals: {},
    ...options,
  })
}

/**
 * 创建应用配置
 */
export function createAppConfig(
  appName: string,
  options: Partial<ViteBuildOptions> = {},
) {
  return defineConfig({
    plugins: [vue(), vueJsx()],

    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
        ...options.alias,
      },
    },

    server: {
      port: 3000,
      open: true,
      cors: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'es2020',
      minify: 'esbuild',
    },

    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          globalVars: {
            'primary-color': '#1890ff',
            'success-color': '#52c41a',
            'warning-color': '#faad14',
            'error-color': '#f5222d',
          },
        },
      },
    },
  })
}
