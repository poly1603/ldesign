---
title: Docker 部署
description: 构建生产镜像并以最小体积在容器中运行静态站点
---

# Docker 部署

如何构建镜像与在容器中运行 launcher。

## 构建静态资源

```bash
pnpm launcher build
```

## 使用 Nginx 托管静态资源

```dockerfile
# stage 1: build
FROM node:18-alpine AS build
WORKDIR /app
RUN npm i -g pnpm
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm launcher build

# stage 2: serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 运行

```bash
docker build -t my-launcher-app .
docker run -p 8080:80 my-launcher-app
```
