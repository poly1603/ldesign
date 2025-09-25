/**
 * LDesign CLI 配置文件示例
 */

export default {
  // 环境配置
  environment: 'development',

  // 插件配置
  plugins: [
    // 字符串形式 - 简单插件
    '@ldesign/plugin-vue',
    
    // 对象形式 - 带配置的插件
    {
      name: '@ldesign/plugin-react',
      options: {
        typescript: true,
        router: true
      }
    },
    
    // 本地插件
    './plugins/custom-plugin.js',
    
    // 禁用插件
    {
      name: '@ldesign/plugin-legacy',
      enabled: false
    }
  ],

  // 中间件配置
  middleware: [
    {
      name: 'auth',
      priority: 100,
      options: {
        required: true
      }
    },
    {
      name: 'logger',
      priority: 50
    }
  ],

  // 模板配置
  templates: {
    default: './templates/default',
    vue: './templates/vue',
    react: './templates/react'
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true
  },

  // 开发服务器配置
  dev: {
    port: 3000,
    host: 'localhost',
    open: true,
    hot: true
  },

  // 环境特定配置
  environments: {
    development: {
      build: {
        sourcemap: true,
        minify: false
      },
      dev: {
        port: 3000
      }
    },
    
    production: {
      build: {
        sourcemap: false,
        minify: true
      }
    },
    
    test: {
      plugins: [
        '@ldesign/plugin-test'
      ]
    }
  },

  // 自定义配置
  custom: {
    apiUrl: 'https://api.example.com',
    features: {
      analytics: true,
      monitoring: false
    }
  }
};
