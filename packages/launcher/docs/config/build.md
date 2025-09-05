# 构建配置 (build)

生产环境构建配置选项，用于控制项目的构建输出和优化。

## 基本配置

### outDir

- **类型**: `string`
- **默认值**: `'dist'`
- **描述**: 指定构建输出目录

```typescript
export default defineConfig({
  build: {
    outDir: 'build'  // 输出到 build 目录
  }
})
```

### assetsDir

- **类型**: `string`
- **默认值**: `'assets'`
- **描述**: 指定生成的静态资源的存放目录

```typescript
export default defineConfig({
  build: {
    assetsDir: 'static'  // 静态资源放在 static 目录
  }
})
```

### assetsInlineLimit

- **类型**: `number`
- **默认值**: `4096` (4kb)
- **描述**: 小于此阈值的导入或引用资源将内联为 base64 编码

```typescript
export default defineConfig({
  build: {
    assetsInlineLimit: 8192  // 8kb 以下的资源内联
  }
})
```

## 输出格式

### target

- **类型**: `string | string[]`
- **默认值**: `'modules'`
- **描述**: 设置最终构建的浏览器兼容目标

```typescript
export default defineConfig({
  build: {
    target: 'es2015',
    // target: ['chrome58', 'firefox57', 'safari11'],
    // target: 'esnext'
  }
})
```

### format

- **类型**: `'es' | 'cjs' | 'umd' | 'iife'`
- **默认值**: `'es'`
- **描述**: 指定模块格式

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es', 'cjs', 'umd']
    }
  }
})
```

### cssTarget

- **类型**: `string | string[]`
- **默认值**: 与 `build.target` 相同
- **描述**: CSS 的浏览器兼容目标

```typescript
export default defineConfig({
  build: {
    cssTarget: 'chrome61'
  }
})
```

## 代码分割

### rollupOptions

- **类型**: `RollupOptions`
- **描述**: 自定义底层的 Rollup 打包配置

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      // 外部化处理不想打包进库的依赖
      external: ['vue', 'lodash'],
      
      output: {
        // 提供全局变量名
        globals: {
          vue: 'Vue',
          lodash: '_'
        },
        
        // 手动分包
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash', 'axios']
        },
        
        // 动态分包
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          if (id.includes('utils/')) {
            return 'utils'
          }
        }
      }
    }
  }
})
```

### chunkSizeWarningLimit

- **类型**: `number`
- **默认值**: `500`
- **描述**: chunk 大小警告的限制（以 kbs 为单位）

```typescript
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000  // 1MB 警告限制
  }
})
```

## 优化选项

### minify

- **类型**: `boolean | 'terser' | 'esbuild'`
- **默认值**: `'esbuild'`
- **描述**: 启用/禁用 minification

```typescript
export default defineConfig({
  build: {
    minify: 'terser',  // 使用 terser 压缩
    
    terserOptions: {
      compress: {
        drop_console: true,    // 移除 console
        drop_debugger: true,   // 移除 debugger
        pure_funcs: ['console.log']  // 移除指定函数调用
      }
    }
  }
})
```

### sourcemap

- **类型**: `boolean | 'inline' | 'hidden'`
- **默认值**: `false`
- **描述**: 构建后是否生成 source map 文件

```typescript
export default defineConfig({
  build: {
    sourcemap: true,        // 生成 .map 文件
    // sourcemap: 'inline', // 内联 sourcemap
    // sourcemap: 'hidden'  // 生成但不引用
  }
})
```

### cssCodeSplit

- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 启用/禁用 CSS 代码分割

```typescript
export default defineConfig({
  build: {
    cssCodeSplit: false  // 将所有 CSS 提取到一个文件中
  }
})
```

### cssMinify

- **类型**: `boolean`
- **默认值**: 与 `build.minify` 相同
- **描述**: 压缩 CSS

```typescript
export default defineConfig({
  build: {
    cssMinify: true
  }
})
```

## 高级选项

### lib

- **类型**: `LibraryOptions`
- **描述**: 构建为库时使用

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'MyLib',
      fileName: 'my-lib',
      formats: ['es', 'cjs', 'umd', 'iife']
    }
  }
})

interface LibraryOptions {
  entry: string
  name?: string
  formats?: LibraryFormats[]
  fileName?: string | ((format: string) => string)
}
```

### manifest

- **类型**: `boolean | string`
- **默认值**: `false`
- **描述**: 当设为 `true` 时，构建后将会生成 `manifest.json` 文件

```typescript
export default defineConfig({
  build: {
    manifest: true,  // 生成 manifest.json
    // manifest: 'my-manifest.json'  // 自定义文件名
  }
})
```

### ssrManifest

- **类型**: `boolean | string`
- **默认值**: `false`
- **描述**: 构建 SSR 时生成 manifest

```typescript
export default defineConfig({
  build: {
    ssrManifest: true
  }
})
```

### ssr

- **类型**: `boolean | string`
- **默认值**: `false`
- **描述**: 生产环境构建时的 SSR 相关配置

```typescript
export default defineConfig({
  build: {
    ssr: 'src/entry-server.js'  // SSR 入口文件
  }
})
```

## 监听模式

### watch

- **类型**: `WatcherOptions | null`
- **默认值**: `null`
- **描述**: 设为 `{}` 则会启用 rollup 的监听器

```typescript
export default defineConfig({
  build: {
    watch: {
      // chokidar 监听选项
      ignored: ['node_modules/**', '.git/**']
    }
  }
})
```

## 实验性功能

### reportCompressedSize

- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 启用/禁用 gzip 压缩大小报告

```typescript
export default defineConfig({
  build: {
    reportCompressedSize: false  // 禁用压缩大小报告，加快构建
  }
})
```

### copyPublicDir

- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 默认情况下，Vite 会将 `public` 目录下的所有文件复制到 `outDir`

```typescript
export default defineConfig({
  build: {
    copyPublicDir: false  // 不复制 public 目录
  }
})
```

### emptyOutDir

- **类型**: `boolean`
- **默认值**: 若 `outDir` 在 `root` 目录下，则为 `true`
- **描述**: 构建时清空输出目录

```typescript
export default defineConfig({
  build: {
    emptyOutDir: true
  }
})
```

## 完整配置示例

### 普通应用构建配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  build: {
    // 输出配置
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    
    // 兼容性
    target: 'es2015',
    cssTarget: 'chrome80',
    
    // 优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // 源码映射
    sourcemap: true,
    
    // CSS 配置
    cssCodeSplit: true,
    cssMinify: true,
    
    // 构建选项
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    
    // Rollup 配置
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          utils: ['lodash', 'dayjs', 'axios']
        }
      }
    }
  }
})
```

### 库构建配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyUILib',
      fileName: (format) => `my-ui-lib.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'element-plus'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        }
      }
    },
    
    // 生成类型声明文件
    sourcemap: true,
    minify: false  // 库通常不压缩
  }
})
```

### SSR 构建配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  build: {
    ssr: 'src/entry-server.js',
    ssrManifest: true,
    
    rollupOptions: {
      input: {
        client: 'src/entry-client.js',
        server: 'src/entry-server.js'
      },
      output: {
        dir: 'dist',
        format: 'es'
      }
    }
  }
})
```

## 多环境构建

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  const isAnalyze = process.env.ANALYZE === 'true'
  
  return {
    build: {
      outDir: isProduction ? 'dist' : 'dev-dist',
      sourcemap: !isProduction,
      minify: isProduction,
      
      rollupOptions: {
        plugins: [
          // 生产环境启用分析
          isAnalyze && bundleAnalyzer()
        ].filter(Boolean)
      }
    }
  }
})
```

## 构建钩子

```typescript
export default defineConfig({
  plugins: [
    {
      name: 'build-hooks',
      buildStart() {
        console.log('📦 开始构建...')
      },
      
      buildEnd() {
        console.log('✅ 构建完成')
      },
      
      generateBundle(options, bundle) {
        // 自定义 bundle 处理
        console.log(`生成了 ${Object.keys(bundle).length} 个文件`)
      }
    }
  ]
})
```

## 构建调试

### 查看构建配置

```bash
# 查看构建配置
launcher config get build

# 构建时启用详细输出
launcher build --debug

# 分析构建产物
launcher build --report
```

### 构建性能分析

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        // 构建时间分析
        {
          name: 'build-timer',
          buildStart() {
            this.startTime = Date.now()
          },
          buildEnd() {
            console.log(`构建耗时: ${Date.now() - this.startTime}ms`)
          }
        }
      ]
    }
  }
})
```

## 常见问题

### 1. 构建产物太大

```typescript
export default defineConfig({
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash', 'dayjs']
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    }
  }
})
```

### 2. 兼容性问题

```typescript
export default defineConfig({
  build: {
    target: ['es2015', 'chrome60', 'firefox60', 'safari11'],
    cssTarget: 'chrome61'
  }
})
```

### 3. 路径问题

```typescript
export default defineConfig({
  base: '/my-app/',  // 部署到子目录时设置
  build: {
    assetsDir: 'static',  // 静态资源目录
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
```

---

**相关文档**:
- [服务器配置](./server) - 开发服务器设置
- [预览配置](./preview) - 预览服务器配置
- [Launcher 配置](./launcher) - 特有功能配置
