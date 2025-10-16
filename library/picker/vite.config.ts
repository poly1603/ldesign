import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
);

// 开发模式配置
export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    // 开发环境 - 用于示例预览
    return {
      plugins: [vue(), react()],
      server: {
        port: 3000,
        open: true
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
          '@ldesign/picker': resolve(__dirname, 'src/index.ts'),
          '@ldesign/picker/vue': resolve(__dirname, 'src/vue/index.ts'),
          '@ldesign/picker/react': resolve(__dirname, 'src/react/index.ts')
        }
      }
    };
  }

  // 生产环境 - 库构建
  return {
    plugins: [vue(), react()],
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          vue: resolve(__dirname, 'src/vue/index.ts'),
          react: resolve(__dirname, 'src/react/index.ts')
        },
        name: 'LDesignPicker',
        formats: ['es', 'cjs', 'umd']
      },
      rollupOptions: {
        external: ['vue', 'react', 'react-dom'],
        output: {
          globals: {
            vue: 'Vue',
            react: 'React',
            'react-dom': 'ReactDOM'
          },
          // 分离CSS
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') {
              return 'style.css';
            }
            return assetInfo.name;
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  };
});