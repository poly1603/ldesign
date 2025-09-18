# 路径解析 (resolve)

## 基本配置

```ts
import { defineConfig, createBasicAliases, createNodePolyfillAliases } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    // 控制内置别名的启用/禁用
    alias: {
      enabled: true // 启用内置的 @ -> src 别名
    }
  },

  resolve: {
    alias: [
      // 使用工具函数创建基本别名
      ...createBasicAliases('./src'),

      // 添加自定义别名
      { find: '@components', replacement: './src/components' },
      { find: '@utils', replacement: './src/utils' },
      { find: '@assets', replacement: './src/assets' },

      // 可选：Node.js polyfills
      ...createNodePolyfillAliases(),
    ],

    // 可选：扩展名解析顺序
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    // 可选：避免重复安装的依赖被多次解析
    dedupe: ['vue']
  }
})
```

## 手动配置别名

```ts
export default defineConfig({
  resolve: {
    alias: [
      // 项目根目录别名
      { find: '@', replacement: './src' },

      // 组件目录别名
      { find: '@components', replacement: './src/components' },

      // 工具函数别名
      { find: '@utils', replacement: './src/utils' },

      // 资源文件别名
      { find: '@assets', replacement: './src/assets' },

      // 样式文件别名
      { find: '@styles', replacement: './src/styles' },

      // 正则表达式别名
      { find: /^~\//, replacement: './src/' },
    ]
  }
})
```

