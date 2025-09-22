import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  // 入口文件配置
  entry: {
    // 主入口
    index: 'src/index.ts',
    
    // 核心模块
    'core/index': 'src/core/index.ts',
    'core/Player': 'src/core/Player.ts',
    'core/EventManager': 'src/core/EventManager.ts',
    'core/StateManager': 'src/core/StateManager.ts',
    'core/BasePlugin': 'src/core/BasePlugin.ts',
    'core/Plugin': 'src/core/Plugin.ts',
    'core/PluginManager': 'src/core/PluginManager.ts',
    'core/ThemeManager': 'src/core/ThemeManager.ts',
    
    // 插件模块
    'plugins/index': 'src/plugins/index.ts',
    'plugins/PlayButton': 'src/plugins/PlayButton.ts',
    'plugins/ProgressBar': 'src/plugins/ProgressBar.ts',
    'plugins/VolumeControl': 'src/plugins/VolumeControl.ts',
    'plugins/FullscreenButton': 'src/plugins/FullscreenButton.ts',
    'plugins/TimeDisplay': 'src/plugins/TimeDisplay.ts',
    'plugins/PictureInPicture': 'src/plugins/PictureInPicture.ts',
    'plugins/Screenshot': 'src/plugins/Screenshot.ts',
    'plugins/PlaybackRate': 'src/plugins/PlaybackRate.ts',
    
    // 框架适配器
    'adapters/index': 'src/adapters/index.ts',
    'adapters/vue': 'src/adapters/vue.ts',
    'adapters/react': 'src/adapters/react.tsx',
    'adapters/angular': 'src/adapters/angular.ts',
    
    // 主题
    'themes/index': 'src/themes/index.ts',
    'themes/default': 'src/themes/default.ts',
    
    // 类型定义
    'types/index': 'src/types/index.ts',
    'types/events': 'src/types/events.ts',
    'types/plugins': 'src/types/plugins.ts',
    'types/themes': 'src/types/themes.ts',
    
    // 工具函数
    'utils/index': 'src/utils/index.ts',
    'utils/eventUtils': 'src/utils/eventUtils.ts',
    'utils/performance': 'src/utils/performance.ts',
    'utils/accessibility': 'src/utils/accessibility.ts'
  },

  // 输出配置
  output: {
    // ESM 格式输出到 es 目录
    esm: {
      dir: 'es',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    // CJS 格式输出到 lib 目录
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named'
    }
  },

  // 外部依赖
  external: [
    // Vue 相关
    'vue',
    '@vue/composition-api',
    
    // React 相关
    'react',
    'react-dom',
    'react/jsx-runtime',
    
    // Angular 相关
    '@angular/core',
    '@angular/common',
    '@angular/forms',
    
    // Node.js 内置模块
    'path',
    'fs',
    'url'
  ],

  // TypeScript 配置
  typescript: {
    // 生成类型定义文件
    declaration: true,
    declarationMap: true,
    // 使用项目的 tsconfig.json
    tsconfig: './tsconfig.json'
  },

  // 插件配置
  plugins: [
    // CSS 处理
    {
      name: 'css',
      options: {
        extract: true,
        minimize: true
      }
    },
    
    // 资源处理
    {
      name: 'assets',
      options: {
        include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
        limit: 8192 // 8KB 以下的文件转为 base64
      }
    }
  ],

  // 构建优化
  optimization: {
    // 代码分割
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 框架适配器单独打包
        adapters: {
          test: /[\\/]adapters[\\/]/,
          name: 'adapters',
          chunks: 'all'
        },
        // 插件单独打包
        plugins: {
          test: /[\\/]plugins[\\/]/,
          name: 'plugins',
          chunks: 'all'
        },
        // 工具函数单独打包
        utils: {
          test: /[\\/]utils[\\/]/,
          name: 'utils',
          chunks: 'all'
        }
      }
    },
    
    // 压缩配置
    minimize: process.env.NODE_ENV === 'production',
    minimizer: {
      terser: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true
        },
        mangle: {
          safari10: true
        }
      }
    }
  },

  // 开发服务器配置
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    static: {
      directory: 'examples'
    }
  },

  // 环境变量
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
  },

  // 别名配置
  alias: {
    '@': 'src',
    '@core': 'src/core',
    '@plugins': 'src/plugins',
    '@adapters': 'src/adapters',
    '@themes': 'src/themes',
    '@types': 'src/types',
    '@utils': 'src/utils'
  },

  // 浏览器兼容性
  browserslist: [
    '> 1%',
    'last 2 versions',
    'not dead',
    'not ie 11'
  ],

  // 构建钩子
  hooks: {
    // 构建开始前
    buildStart() {
      console.log('🚀 开始构建 LDesign Video Player...');
    },
    
    // 构建完成后
    buildEnd() {
      console.log('✅ LDesign Video Player 构建完成!');
    },
    
    // 构建错误
    buildError(error) {
      console.error('❌ 构建失败:', error);
    }
  }
});
