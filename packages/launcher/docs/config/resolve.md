# 路径解析 (resolve)

## 基本配置

```ts
import {
  defineConfig,
  createBasicAliases,
  createDevAlias,
  createBuildAlias,
  createUniversalAlias
} from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    // 控制内置别名的启用/禁用
    alias: {
      enabled: true, // 启用内置的 @ -> src, ~ -> 项目根目录别名
      stages: ['dev', 'build', 'preview'] // 内置别名的生效阶段
    }
  },

  resolve: {
    alias: [
      // 使用工具函数创建基本别名
      ...createBasicAliases('./src'),

      // 添加自定义别名（默认只在 dev 阶段生效）
      { find: '@components', replacement: './src/components' },
      { find: '@utils', replacement: './src/utils' },
      { find: '@assets', replacement: './src/assets' },

      // 使用阶段配置工具函数
      createDevAlias('@mock', './src/mock'), // 只在开发时生效
      createBuildAlias('@prod', './src/production'), // 只在构建时生效
      createUniversalAlias('@shared', './src/shared'), // 所有阶段生效
    ],

    // 可选：扩展名解析顺序
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    // 可选：避免重复安装的依赖被多次解析
    dedupe: ['vue']
  }
})
```

## 阶段配置别名

支持为每个别名指定生效阶段（dev、build、preview）：

```ts
export default defineConfig({
  resolve: {
    alias: [
      // 开发时使用源码，构建时使用编译版本
      {
        find: '@lib',
        replacement: './src/lib',
        stages: ['dev']
      },
      {
        find: '@lib',
        replacement: './dist/lib',
        stages: ['build', 'preview']
      },

      // 只在开发时启用的调试工具
      {
        find: '@debug',
        replacement: './src/debug',
        stages: ['dev']
      },

      // 在所有阶段生效的共享模块
      {
        find: '@shared',
        replacement: './src/shared',
        stages: ['dev', 'build', 'preview']
      }
    ]
  }
})
```

## 手动配置别名

```ts
export default defineConfig({
  resolve: {
    alias: [
      // 项目根目录别名（默认只在 dev 阶段生效）
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

