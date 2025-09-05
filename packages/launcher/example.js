import ViteWrapper from './ViteWrapper.js';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer } from 'rollup-plugin-visualizer';

// 基础使用示例
async function basicExample() {
  // 创建一个基础的 Vite 配置实例
  const vite = new ViteWrapper({
    root: './src',
    port: 3000,
    open: true,
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  });

  // 启动开发服务器
  await vite.dev();
}

// Vue 项目示例
async function vueProjectExample() {
  const vite = ViteWrapper.create({
    root: process.cwd(),
    port: 8080,
    plugins: [
      vue(),
      vueJsx()
    ],
    resolve: {
      alias: {
        '@': './src',
        'components': './src/components',
        'utils': './src/utils'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'ui': ['element-plus']
          }
        }
      }
    }
  });

  // 链式调用配置
  vite
    .setProxy({
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    })
    .optimizeDependencies({
      include: ['lodash-es', 'dayjs'],
      exclude: ['@vicons/ionicons5']
    })
    .setEnv({
      APP_TITLE: 'My Vue App',
      API_BASE_URL: 'https://api.example.com'
    });

  // 注册生命周期钩子
  vite.registerHook('beforeDev', async (config) => {
    console.log('开发服务器启动前...');
    console.log('当前配置:', config);
  });

  vite.registerHook('afterDev', async (server) => {
    console.log('开发服务器已启动!');
    console.log('访问地址:', server.resolvedUrls.local);
  });

  vite.registerHook('beforeBuild', async () => {
    console.log('开始构建...');
  });

  vite.registerHook('afterBuild', async (result) => {
    console.log('构建完成!');
    if (Array.isArray(result)) {
      result.forEach(bundle => {
        console.log('输出文件:', Object.keys(bundle.output));
      });
    }
  });

  // 根据命令执行不同操作
  const command = process.argv[2];
  
  switch (command) {
    case 'dev':
      await vite.dev();
      break;
    case 'build':
      await vite.build();
      break;
    case 'preview':
      await vite.preview();
      break;
    default:
      console.log('请指定命令: dev, build, 或 preview');
  }
}

// 高级配置示例
async function advancedExample() {
  const vite = new ViteWrapper({
    root: process.cwd(),
    base: '/my-app/',
    mode: process.env.NODE_ENV || 'development',
    
    // 使用配置钩子进行深度自定义
    configHook: (config) => {
      // 在这里可以对最终配置进行任意修改
      if (process.env.ANALYZE === 'true') {
        config.plugins.push(
          visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true
          })
        );
      }
      
      // 动态修改构建配置
      if (config.mode === 'production') {
        config.build.minify = 'terser';
        config.build.terserOptions = {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        };
      }
      
      return config;
    }
  });

  // 动态添加插件
  if (process.env.USE_LEGACY) {
    const legacy = await import('@vitejs/plugin-legacy');
    vite.addPlugin(legacy.default({
      targets: ['defaults', 'not IE 11']
    }));
  }

  // 根据环境设置不同的 CSS 预处理器配置
  if (process.env.NODE_ENV === 'development') {
    vite.setCssPreprocessor('less', {
      javascriptEnabled: true,
      modifyVars: {
        'primary-color': '#1890ff'
      }
    });
  }

  // 多页面应用配置
  vite.updateConfig({
    build: {
      rollupOptions: {
        input: {
          main: './index.html',
          admin: './admin.html',
          mobile: './mobile.html'
        }
      }
    }
  });

  return vite;
}

// React 项目示例
async function reactProjectExample() {
  const react = await import('@vitejs/plugin-react');
  
  const vite = new ViteWrapper({
    plugins: [react.default()],
    resolve: {
      alias: {
        '@': './src'
      }
    },
    server: {
      port: 3000,
      strictPort: true,
      cors: true
    },
    build: {
      outDir: 'build',
      sourcemap: 'inline',
      chunkSizeWarningLimit: 1000
    }
  });

  // 添加自定义插件
  vite.addPlugin({
    name: 'custom-html-plugin',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `<script>window.BUILD_TIME = '${new Date().toISOString()}'</script></head>`
      );
    }
  });

  return vite;
}

// 库模式构建示例
async function libraryBuildExample() {
  const vite = new ViteWrapper({
    build: {
      lib: {
        entry: './src/index.js',
        name: 'MyLibrary',
        fileName: (format) => `my-library.${format}.js`,
        formats: ['es', 'cjs', 'umd']
      },
      rollupOptions: {
        external: ['vue', 'react'],
        output: {
          globals: {
            vue: 'Vue',
            react: 'React'
          }
        }
      }
    }
  });

  // 构建库
  await vite.build();
}

// SSR 配置示例
async function ssrExample() {
  const vite = new ViteWrapper({
    ssr: {
      noExternal: ['element-plus'],
      target: 'node'
    },
    build: {
      ssr: true,
      outDir: 'dist/server'
    }
  });

  // 客户端构建配置
  const clientVite = new ViteWrapper({
    build: {
      outDir: 'dist/client',
      manifest: true,
      rollupOptions: {
        input: './src/entry-client.js'
      }
    }
  });

  // 分别构建服务端和客户端
  console.log('构建 SSR 服务端...');
  await vite.build();
  
  console.log('构建 SSR 客户端...');
  await clientVite.build();
}

// 执行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  // 根据参数运行不同示例
  const exampleType = process.argv[2];
  
  switch (exampleType) {
    case 'basic':
      basicExample();
      break;
    case 'vue':
      vueProjectExample();
      break;
    case 'react':
      reactProjectExample();
      break;
    case 'advanced':
      advancedExample();
      break;
    case 'library':
      libraryBuildExample();
      break;
    case 'ssr':
      ssrExample();
      break;
    default:
      console.log(`
使用方法:
  node example.js <type> [command]
  
示例类型:
  basic     - 基础示例
  vue       - Vue 项目示例
  react     - React 项目示例
  advanced  - 高级配置示例
  library   - 库构建示例
  ssr       - SSR 示例
  
命令 (仅 vue/react/advanced):
  dev       - 启动开发服务器
  build     - 执行构建
  preview   - 预览构建结果
      `);
  }
}

export {
  ViteWrapper,
  basicExample,
  vueProjectExample,
  reactProjectExample,
  advancedExample,
  libraryBuildExample,
  ssrExample
};
