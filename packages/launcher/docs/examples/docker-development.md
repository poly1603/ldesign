---
title: Docker 开发环境
description: 使用 Docker 与 Compose 搭建带热重载的本地开发环境
---

# Docker 开发环境

如何使用 Compose 与热重载搭建本地开发环境。

## Dockerfile（开发）

```dockerfile
FROM node:18-alpine
WORKDIR /app

# 使用更快的包管理器（可选）
RUN npm i -g pnpm

COPY package*.json ./
RUN pnpm install

COPY . .
EXPOSE 3000 24678

CMD ["pnpm", "launcher", "dev", "--host", "0.0.0.0"]
```

## docker-compose.yml

```yaml
version: '3.9'
services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "24678:24678" # HMR 端口
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

提示：容器内请使用 `host: '0.0.0.0'`，并显式暴露 HMR 端口。
