# 多阶段构建 - 基础镜像
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制包管理文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/*/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 生产环境镜像
FROM nginx:alpine AS production

# 安装 Node.js (用于运行一些脚本)
RUN apk add --no-cache nodejs npm

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/packages/*/dist /usr/share/nginx/html/packages/

# 复制 nginx 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动命令
CMD ["nginx", "-g", "daemon off;"]

# 开发环境镜像
FROM base AS development

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000 5173 4173

# 启动开发服务器
CMD ["pnpm", "dev"]
