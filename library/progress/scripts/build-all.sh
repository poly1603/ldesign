#!/bin/bash

# 构建所有包并测试
echo "🚀 开始构建所有包..."

# 清理旧的构建产物
echo "🧹 清理旧的构建产物..."
pnpm clean

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建核心包
echo "📦 构建 @ldesign/progress-core..."
pnpm build:core
if [ $? -ne 0 ]; then
  echo "❌ 核心包构建失败！"
  exit 1
fi

# 构建 Vue 包
echo "📦 构建 @ldesign/progress-vue..."
pnpm build:vue
if [ $? -ne 0 ]; then
  echo "❌ Vue 包构建失败！"
  exit 1
fi

# 构建 React 包
echo "📦 构建 @ldesign/progress-react..."
pnpm build:react
if [ $? -ne 0 ]; then
  echo "❌ React 包构建失败！"
  exit 1
fi

# 构建 Lit 包
echo "📦 构建 @ldesign/progress-lit..."
pnpm build:lit
if [ $? -ne 0 ]; then
  echo "❌ Lit 包构建失败！"
  exit 1
fi

# 测试构建
echo "🧪 测试构建产物..."
pnpm test:build
if [ $? -ne 0 ]; then
  echo "❌ 构建测试失败！"
  exit 1
fi

echo "✅ 所有包构建成功！"


