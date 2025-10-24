# UMD构建快速修复方案

##问题简述

4个包(`animation`, `shared`, `notification`, `websocket`)无法通过@ldesign/builder生成UMD格式产物(dist/目录)。

根本原因: Builder的自动检测逻辑覆盖了用户配置,导致包含Vue文件的项目被错误处理。

## 快速修复方案

### 方案1: 修改Builder核心逻辑(推荐)

修改`tools/builder/src/core/LibraryBuilder.ts`,让用户配置优先:

```typescript
// 找到第156行和第256行
// 原代码:
let libraryType = mergedConfig.libraryType || await this.detectLibraryType(projectRoot)

// 修改为:
let libraryType = mergedConfig.libraryType
if (!libraryType) {
  libraryType = await this.detectLibraryType(projectRoot)
}
```

修改后重新构建这4个包即可生成UMD产物。

### 方案2: 移除触发错误检测的文件

**对于animation和shared包**:

1. 将Vue组件移到单独目录(如`src/integrations/vue/`)  
2. 修改`exclude`配置排除该目录:

```typescript
// ldesign.config.ts
export default defineConfig({
  libraryType: 'typescript',
  exclude: [
    // ... 现有排除
    '**/integrations/**',  // 排除集成代码
  ],
  // ... 其他配置
})
```

### 方案3: 使用独立的Rollup配置

为这4个包创建`rollup.config.js`,直接生成UMD:

```javascript
// packages/animation/rollup.umd.config.js
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

export default defineConfig([
  // 常规版本
  {
    input: 'src/index-lib.ts',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'LDesignAnimation',
      sourcemap: true,
      globals: {
        vue: 'Vue',
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    },
    external: ['vue', 'react', 'react-dom', /@ldesign\//],
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      esbuild({ target: 'es2020' })
    ]
  },
  // 压缩版本
  {
    input: 'src/index-lib.ts',
    output: {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'LDesignAnimation',
      sourcemap: true,
      globals: {
        vue: 'Vue',
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    },
    external: ['vue', 'react', 'react-dom', /@ldesign\//],
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      esbuild({ target: 'es2020' }),
      terser()
    ]
  }
])
```

然后在package.json添加脚本:

```json
{
  "scripts": {
    "build": "ldesign-builder build && rollup -c rollup.umd.config.js",
    "build:umd": "rollup -c rollup.umd.config.js"
  }
}
```

### 方案4: 手动运行Rollup(最快速)

直接在包目录运行:

```bash
cd packages/animation

# 安装依赖(如果需要)
pnpm add -D rollup rollup-plugin-esbuild @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-terser

# 运行rollup
npx rollup src/index-lib.ts \
  --file dist/index.js \
  --format umd \
  --name LDesignAnimation \
  --plugin @rollup/plugin-node-resolve \
  --plugin @rollup/plugin-commonjs \
  --plugin esbuild \
  --external vue,react,react-dom \
  --globals vue=Vue,react=React,react-dom=ReactDOM \
  --sourcemap
```

## 推荐执行顺序

1. **立即**: 使用方案1修改Builder核心逻辑(5分钟)
2. **短期**: 如果方案1有问题,使用方案3或4生成UMD产物
3. **长期**: 考虑包结构重组,将框架集成分离

## 验证方法

构建完成后检查:

```bash
# 检查4个包的dist目录
ls packages/animation/dist
ls packages/shared/dist
ls packages/notification/dist
ls packages/websocket/dist

# 应该看到:
# index.js
# index.js.map
# index.min.js
# index.min.js.map
```

## 注意事项

- 确保`src/index-lib.ts`存在且内容正确(已创建)
- UMD格式的external和globals配置要与其他包一致
- 生成后记得在package.json的`files`字段中包含dist目录

