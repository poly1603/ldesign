#!/bin/bash
# 清理临时文档
# 保留重要文档：README.md, CHANGELOG.md, LICENSE, docs/, doc/ 等
# 删除临时文档：优化报告、完成总结、项目计划等

set -e

echo ""
echo "🧹 开始清理临时文档..."
echo ""

# 统计
total_found=0
total_deleted=0
total_skipped=0

echo "正在扫描文件..."
echo ""

# 要保留的目录模式
keep_dirs_pattern="docs/|doc/|\.github/|examples?/"

# 要保留的文件名
keep_files="README.md|CHANGELOG.md|LICENSE.md|LICENSE|CONTRIBUTING.md|CODE_OF_CONDUCT.md|SECURITY.md|SUPPORT.md"

# 要删除的文件名模式（正则表达式）
delete_patterns=(
    "OPTIMIZATION"
    "OPTIMIZ"
    "优化"
    "COMPLETE"
    "COMPLETION"
    "FINISHED"
    "完成"
    "成功"
    "SUMMARY"
    "总结"
    "摘要"
    "IMPLEMENTATION"
    "PROGRESS"
    "STATUS"
    "实施"
    "进度"
    "PROJECT_PLAN"
    "PLAN"
    "计划"
    "FINAL"
    "最终"
    "MIGRATION"
    "迁移"
    "VERIFICATION"
    "VALIDATION"
    "CHECK"
    "验证"
    "GUIDE"
    "指南"
    "REPORT"
    "ANALYSIS"
    "REVIEW"
    "AUDIT"
    "报告"
    "分析"
)

# emoji 模式
emoji_patterns="🎉|✅|🚀|📚|🎊|📖|📋|✨|🌟|🎯|🏆|⭐|💡|🔧|📝|🎁"

# 查找所有 MD 文件（排除 node_modules, dist, es, lib, .git）
while IFS= read -r -d '' file; do
    total_found=$((total_found + 1))
    
    # 获取相对路径
    relative_path="${file#./}"
    filename=$(basename "$file")
    
    # 检查是否在保留目录中
    if echo "$relative_path" | grep -qE "$keep_dirs_pattern"; then
        total_skipped=$((total_skipped + 1))
        echo "  ✓ 保留（在保留目录）: $relative_path"
        continue
    fi
    
    # 检查是否是要保留的文件
    if echo "$filename" | grep -qE "^($keep_files)$"; then
        total_skipped=$((total_skipped + 1))
        echo "  ✓ 保留（重要文件）: $relative_path"
        continue
    fi
    
    # 检查是否包含 emoji
    if echo "$filename" | grep -qE "$emoji_patterns"; then
        rm -f "$file"
        total_deleted=$((total_deleted + 1))
        echo "  🗑️  删除: $relative_path"
        continue
    fi
    
    # 检查是否匹配删除模式
    should_delete=false
    for pattern in "${delete_patterns[@]}"; do
        if echo "$filename" | grep -qi "$pattern"; then
            should_delete=true
            break
        fi
    done
    
    if [ "$should_delete" = true ]; then
        rm -f "$file"
        total_deleted=$((total_deleted + 1))
        echo "  🗑️  删除: $relative_path"
    else
        total_skipped=$((total_skipped + 1))
        echo "  ✓ 保留: $relative_path"
    fi
    
done < <(find . -type f -name "*.md" \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/es/*" \
    ! -path "*/lib/*" \
    ! -path "*/.git/*" \
    -print0)

# 清理 .cursor/plans/ 目录
echo ""
echo "清理 .cursor/plans/ 目录..."
if [ -d ".cursor/plans" ]; then
    find .cursor/plans -type f -name "*.md" -print0 | while IFS= read -r -d '' file; do
        rm -f "$file"
        total_deleted=$((total_deleted + 1))
        echo "  🗑️  删除: ${file#./}"
    done
fi

# 删除根目录下的临时文档
echo ""
echo "清理根目录临时文档..."
temp_files=(
    "WORKSPACE_MIGRATION_SUMMARY.md"
    "选择器重构完成总结.md"
    "选择器问题分析和修复计划.md"
)

for temp_file in "${temp_files[@]}"; do
    if [ -f "$temp_file" ]; then
        rm -f "$temp_file"
        total_deleted=$((total_deleted + 1))
        echo "  🗑️  删除: $temp_file"
    fi
done

# 显示统计
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 清理完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "统计信息："
echo "  总共找到: $total_found 个文件"
echo "  已删除: $total_deleted 个文件"
echo "  已保留: $total_skipped 个文件"
echo ""

# 显示保留的重要文件类型
echo "✅ 已保留的文件类型："
echo "  - README.md, CHANGELOG.md, LICENSE"
echo "  - docs/ 和 doc/ 目录下的所有文件"
echo "  - .github/ 目录下的文档"
echo "  - examples/ 目录下的文档"
echo ""
echo "🗑️  已删除的文件类型："
echo "  - 优化报告、完成总结、项目计划"
echo "  - 实施进度、验证检查等临时文档"
echo "  - .cursor/plans/ 下的临时计划文件"
echo "  - 带 emoji 前缀的临时文档"

