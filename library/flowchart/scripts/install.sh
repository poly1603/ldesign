#!/bin/bash

# ApprovalFlow 安装脚本
# 用途：自动安装项目依赖

set -e  # 遇到错误立即退出

echo "================================"
echo "  ApprovalFlow 安装脚本"
echo "================================"
echo ""

# 检查 Node.js
echo "检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请访问 https://nodejs.org/ 下载并安装 Node.js"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"
echo ""

# 检查 npm
echo "检查 npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm 版本: $NPM_VERSION"
echo ""

# 清理旧的安装
echo "清理旧的安装..."
rm -rf node_modules package-lock.json
echo "✅ 清理完成"
echo ""

# 设置镜像（可选）
echo "是否使用淘宝镜像？(y/n)"
read -r USE_MIRROR

if [ "$USE_MIRROR" = "y" ]; then
    echo "设置淘宝镜像..."
    npm config set registry https://registry.npmmirror.com
    echo "✅ 镜像设置完成"
fi
echo ""

# 安装依赖
echo "安装依赖..."
echo "这可能需要几分钟时间，请耐心等待..."
echo ""

if npm install --legacy-peer-deps; then
    echo ""
    echo "✅ 依赖安装成功！"
    echo ""
    echo "可用命令："
    echo "  npm run build       - 构建项目"
    echo "  npm run docs:dev    - 启动文档"
    echo "  npm run test        - 运行测试"
    echo ""
else
    echo ""
    echo "❌ 依赖安装失败"
    echo ""
    echo "请尝试以下方法："
    echo "1. 检查网络连接"
    echo "2. 清理 npm 缓存: npm cache clean --force"
    echo "3. 使用淘宝镜像"
    echo "4. 查看 BUILD_GUIDE.md 了解更多信息"
    echo ""
    exit 1
fi
