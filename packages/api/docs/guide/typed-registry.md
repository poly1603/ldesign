# Typed Registry 生成指南

本工具用于从一个简单配置生成 "方法名 -> 返回类型" 的注册表类型，以便配合 withTypedApi 获得更好的类型推断体验。

## 配置文件

默认读取项目根目录的 `typed-registry.config.json`，可通过命令行参数指定其它路径。

示例：
```json
{
  "outFile": "src/types/registry.generated.ts",
  "baseImport": "../types",
  "resolve": "simple",
  "registry": {
    "getUserInfo": "UserInfo",
    "getMenus": "MenuItem[]",
    "login": "LoginResult"
  }
}
```
- outFile：输出文件（默认为 `src/types/registry.generated.ts`）
- baseImport：simple 模式基础导入路径（默认为 `../types`）
- resolve：`simple` 或 `raw`
  - simple：`UserInfo` => `import('../types').UserInfo`；`MenuItem[]` => `Array<import('../types').MenuItem>`
  - raw：直接使用配置中的类型表达式
- registry：方法名到类型表达式映射

## 生成命令

```bash
pnpm run generate:registry [path/to/config.json]
```

## 使用 withTypedApi

```ts
import { createApiEngine, withTypedApi } from '@ldesign/api'
import type { ProjectTypedApi } from './src/types/registry.generated'

const api = createApiEngine()
const typed = withTypedApi(api) as ProjectTypedApi

const user = await typed.call('getUserInfo') // 自动推断为 UserInfo
```

> 注意：注册表仅用于类型层，不影响运行时逻辑。你可按项目需要在 CI 中生成或在本地开发时生成。

