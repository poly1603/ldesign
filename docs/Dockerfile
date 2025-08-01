# 文档构建和部署 Dockerfile
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY docs/package.json ./docs/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder

# 复制文档源码
COPY docs/ ./docs/
COPY packages/ ./packages/

# 构建文档
RUN cd docs && pnpm build

# 生产环境 - 使用 nginx 提供静态文件服务
FROM nginx:alpine AS production

# 复制构建的文档
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY docs/docker/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

# 开发环境
FROM base AS development

# 复制所有源码
COPY . .

# 暴露端口
EXPOSE 5173

# 启动开发服务器
CMD ["pnpm", "docs:dev", "--host", "0.0.0.0"]
