# 路径解析 (resolve)

```ts
import { resolve } from 'path'

export default {
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~assets': resolve(__dirname, 'src/assets')
    },
    // 可选：扩展名解析顺序
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    // 可选：避免重复安装的依赖被多次解析
    dedupe: ['vue']
  }
}
```

