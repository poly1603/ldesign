---
title: Storybook 集成
description: 在 Launcher 项目中使用 Storybook（builder-vite）
---

# Storybook 集成

如何将 Storybook 与 @ldesign/launcher 项目集成。

## 安装

```bash
pnpm add -D @storybook/vue3 @storybook/addon-essentials @storybook/builder-vite
```

## 配置

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/vue3'
const config: StorybookConfig = {
  framework: '@storybook/vue3',
  core: { builder: '@storybook/builder-vite' },
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
}
export default config
```

提示：如需与项目别名一致，Storybook 的 viteFinal 可复用 launcher 的别名设置。
