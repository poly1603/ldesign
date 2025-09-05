---
title: 多环境配置
description: 基于 mode 的 dev/staging/prod 配置与 .env 管理实践
---

# 多环境配置

根据 `mode` 区分 dev/staging/prod 配置的实践。

## 环境文件组织

```
.env                  # 通用默认值
.env.local            # 本地开发，不进版本库
.env.development      # 开发
.env.staging          # 预发
.env.production       # 生产
```

范例：
```bash
# .env.development
VITE_API_BASE=http://127.0.0.1:8080

# .env.staging
VITE_API_BASE=https://staging.example.com

# .env.production
VITE_API_BASE=https://api.example.com
```

## 配置中按 mode 应用

```ts
import { defineConfig, loadEnv } from '@ldesign/launcher'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    server: {
      port: 3000,
      proxy: { '/api': env.VITE_API_BASE }
    },
    build: {
      sourcemap: !isProd
    },
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    }
  }
})
```

## CLI 与脚本

```json
{
  "scripts": {
    "dev": "launcher dev --mode development",
    "build:staging": "launcher build --mode staging",
    "build:prod": "launcher build --mode production",
    "preview": "launcher preview"
  }
}
```

## 校验必需变量

```ts
export default defineConfig({
  launcher: {
    env: {
      required: ['VITE_API_BASE']
    }
  }
})
```
