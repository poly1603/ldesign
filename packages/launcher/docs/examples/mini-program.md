---
title: 小程序开发
description: 使用 uni-app/Taro 的集成思路、包复用与工程化建议
---

# 小程序开发

使用 uni-app 或 Taro 的基本集成思路与注意事项。

## 推荐项目结构

```
repo/
├─ packages/
│  ├─ web/           # 使用 @ldesign/launcher 的 H5 项目
│  ├─ miniapp/       # uni-app/Taro 工程
│  └─ shared/        # 公共逻辑（工具函数、UI、模型）
└─ package.json
```

## 复用共享代码
- 将可复用逻辑抽取到 shared 包，提供纯 TS/JS 输出
- web 与 miniapp 分别引用 shared（避免耦合平台 API）

## H5 与小程序差异
- H5（Launcher）侧遵循 Web 标准（可用现代构建与插件）
- 小程序端遵循目标平台限制（编译、包体大小、API 受限）

## 工程建议
- 通过 workspace 管理依赖与版本
- 共享类型定义（d.ts）避免重复维护
- 在 shared 层尽量不引用 DOM/平台 API

提示：Launcher 专注 Web 构建，本页提供的是多端协同的工程化思路；小程序端具体构建/运行由 uni-app/Taro 工具链负责。
