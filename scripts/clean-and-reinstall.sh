#!/bin/bash
# 清理并重新安装依赖
# 用于工作空间迁移后的环境重置

set -e

echo ""
echo "🧹 开始清理工作空间..."
echo ""

# 1. 清理根目录 node_modules
echo "1. 清理根目录 node_modules..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "   ✅ 根目录 node_modules 已删除"
else
    echo "   ℹ️  根目录没有 node_modules"
fi

# 2. 清理所有子目录的 node_modules
echo ""
echo "2. 清理所有子目录的 node_modules（这可能需要几分钟）..."
count=0
while IFS= read -r -d '' dir; do
    rm -rf "$dir"
    count=$((count + 1))
    echo "   🗑️  已删除: $dir"
done < <(find . -name "node_modules" -type d -prune -print0 2>/dev/null)
echo "   ✅ 已清理 $count 个 node_modules 目录"

# 3. 删除 lockfile
echo ""
echo "3. 删除 pnpm-lock.yaml..."
if [ -f "pnpm-lock.yaml" ]; then
    rm -f pnpm-lock.yaml
    echo "   ✅ pnpm-lock.yaml 已删除"
else
    echo "   ℹ️  没有 pnpm-lock.yaml 文件"
fi

# 4. 显示清理统计
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 清理完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. 询问是否立即重新安装
read -p "是否立即重新安装依赖？(Y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo ""
    echo "📦 正在安装依赖..."
    echo ""
    
    # 执行 pnpm install
    if pnpm install; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🎉 安装完成！"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "下一步："
        echo "  1. 验证工作空间包：pnpm list -r --depth 0"
        echo "  2. 测试构建：pnpm --filter @ldesign/builder build"
        echo "  3. 查看开发指南：docs/DEVELOPMENT_GUIDE.md"
    else
        echo ""
        echo "❌ 安装失败！请检查错误信息"
        exit 1
    fi
else
    echo ""
    echo "ℹ️  已跳过安装。稍后请运行：pnpm install"
fi

