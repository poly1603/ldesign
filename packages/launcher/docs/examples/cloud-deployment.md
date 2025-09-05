---
title: 云服务部署
description: Vercel、Netlify、Cloudflare Pages 等平台部署流程
---

# 云服务部署

Vercel、Netlify、Cloudflare Pages 等平台部署流程。

## Vercel

- Framework Preset 选择 Vite
- Build Command: `pnpm launcher build`
- Output Directory: `dist`

vercel.json（可选）
```json
{
  "buildCommand": "pnpm launcher build",
  "outputDirectory": "dist"
}
```

## Netlify

- Build command: `pnpm launcher build`
- Publish directory: `dist`

netlify.toml（可选）
```toml
[build]
  command = "pnpm launcher build"
  publish = "dist"
```

## Cloudflare Pages

- Build command: `pnpm launcher build`
- Build output directory: `dist`
