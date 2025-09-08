/**
 * Git 钩子模板库
 * 提供常用的 Git hooks 模板
 */

export interface HookTemplate {
  name: string
  description: string
  script: string
  type: 'bash' | 'node' | 'python'
  executable: boolean
}

/**
 * 预设的 Git 钩子模板
 */
export const GIT_HOOK_TEMPLATES: Record<string, HookTemplate[]> = {
  'pre-commit': [
    {
      name: 'lint-staged',
      description: '运行 lint-staged 检查暂存文件',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 运行 lint-staged 检查暂存的文件
npx lint-staged

# 如果 lint-staged 失败，阻止提交
if [ $? -ne 0 ]; then
  echo "❌ Lint-staged 检查失败，请修复后再提交"
  exit 1
fi

echo "✅ Lint-staged 检查通过"
exit 0`
    },
    {
      name: 'eslint-check',
      description: 'ESLint 代码检查',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 获取暂存的 JS/TS 文件
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|jsx|ts|tsx)$')

if [ -z "$FILES" ]; then
  echo "没有 JavaScript/TypeScript 文件需要检查"
  exit 0
fi

# 运行 ESLint
echo "🔍 正在运行 ESLint 检查..."
npx eslint $FILES

if [ $? -ne 0 ]; then
  echo "❌ ESLint 检查失败"
  exit 1
fi

echo "✅ ESLint 检查通过"
exit 0`
    },
    {
      name: 'prettier-format',
      description: 'Prettier 代码格式化',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 获取暂存的文件
FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$FILES" ]; then
  exit 0
fi

# 运行 Prettier
echo "💄 正在格式化代码..."
npx prettier --write $FILES

# 重新添加格式化后的文件
git add $FILES

echo "✅ 代码格式化完成"
exit 0`
    },
    {
      name: 'test-runner',
      description: '运行测试套件',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 运行测试
echo "🧪 正在运行测试..."
npm test

if [ $? -ne 0 ]; then
  echo "❌ 测试失败，请修复后再提交"
  exit 1
fi

echo "✅ 所有测试通过"
exit 0`
    },
    {
      name: 'security-check',
      description: '安全漏洞检查',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 检查敏感信息
echo "🔐 检查敏感信息..."

# 检查是否包含密钥或密码
if git diff --cached --name-only -z | xargs -0 grep -E "(api_key|apikey|secret|password|pwd|token|private_key)" --with-filename; then
  echo "❌ 检测到可能的敏感信息，请检查后再提交"
  exit 1
fi

# 运行安全审计
echo "🔍 运行安全审计..."
npm audit --audit-level=moderate

if [ $? -ne 0 ]; then
  echo "⚠️ 发现安全漏洞，建议修复"
fi

echo "✅ 安全检查完成"
exit 0`
    },
    {
      name: 'file-size-check',
      description: '大文件检查',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 检查大文件
MAX_SIZE=5242880  # 5MB

echo "📦 检查文件大小..."

# 获取暂存文件
FILES=$(git diff --cached --name-only --diff-filter=ACM)

for FILE in $FILES; do
  SIZE=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
  if [ "$SIZE" -gt "$MAX_SIZE" ]; then
    echo "❌ 文件 $FILE 超过 5MB ($(($SIZE / 1048576))MB)"
    echo "请考虑使用 Git LFS 或减小文件大小"
    exit 1
  fi
done

echo "✅ 文件大小检查通过"
exit 0`
    }
  ],

  'commit-msg': [
    {
      name: 'conventional-commit',
      description: '检查提交信息是否符合 Conventional Commits 规范',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 检查提交信息格式
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

echo "📝 检查提交信息格式..."

# 定义有效的提交类型
TYPES="feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert"

# 检查提交信息格式
if ! echo "$COMMIT_MSG" | grep -qE "^($TYPES)(\\(.+\\))?: .{1,}$"; then
  echo "❌ 提交信息不符合规范!"
  echo ""
  echo "正确格式: <type>(<scope>): <subject>"
  echo ""
  echo "示例:"
  echo "  feat(auth): 添加用户登录功能"
  echo "  fix: 修复内存泄漏问题"
  echo ""
  echo "允许的类型:"
  echo "  feat     - 新功能"
  echo "  fix      - 修复bug"
  echo "  docs     - 文档更新"
  echo "  style    - 代码格式"
  echo "  refactor - 重构"
  echo "  perf     - 性能优化"
  echo "  test     - 测试"
  echo "  build    - 构建系统"
  echo "  ci       - CI配置"
  echo "  chore    - 其他杂项"
  echo "  revert   - 回滚提交"
  exit 1
fi

# 检查提交信息长度
SUBJECT=$(echo "$COMMIT_MSG" | sed -n 's/^[^:]*: \\(.*\\)/\\1/p')
if [ ${'${#SUBJECT}'} -gt 72 ]; then
echo "⚠️ 提交信息过长 (${ '${#SUBJECT}' } 字符)，建议不超过 72 字符"
fi

echo "✅ 提交信息格式正确"
exit 0`
    },
    {
      name: 'jira-ticket',
      description: '检查提交信息是否包含 JIRA 票号',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 检查 JIRA 票号
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

echo "🎫 检查 JIRA 票号..."

# 检查是否包含 JIRA 票号 (例如: PROJ-123)
if ! echo "$COMMIT_MSG" | grep -qE "[A-Z]+-[0-9]+"; then
  echo "⚠️ 提交信息中没有找到 JIRA 票号"
  echo "格式: PROJECT-123"
  read -p "是否继续提交? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ JIRA 票号检查通过"
exit 0`
    },
    {
      name: 'emoji-prefix',
      description: '自动添加 emoji 前缀',
      type: 'node',
      executable: true,
      script: `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const commitMsgFile = process.argv[2];
const commitMsg = fs.readFileSync(commitMsgFile, 'utf-8');

// Emoji 映射
const emojiMap = {
  'feat': '✨',
  'fix': '🐛',
  'docs': '📝',
  'style': '💄',
  'refactor': '♻️',
  'perf': '⚡',
  'test': '✅',
  'build': '📦',
  'ci': '👷',
  'chore': '🔧',
  'revert': '⏪'
};

// 检查是否已有 emoji
if (/^[\\u{1F300}-\\u{1F9FF}]/u.test(commitMsg)) {
  console.log('✅ 已包含 emoji');
  process.exit(0);
}

// 提取提交类型
const match = commitMsg.match(/^(\\w+)(\\(.+\\))?: /);
if (match) {
  const type = match[1];
  const emoji = emojiMap[type];
  
  if (emoji) {
    const newMsg = emoji + ' ' + commitMsg;
    fs.writeFileSync(commitMsgFile, newMsg);
    console.log('✅ 已添加 emoji 前缀');
  }
}

process.exit(0);`
    }
  ],

  'pre-push': [
    {
      name: 'branch-protection',
      description: '保护主分支不被直接推送',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 保护主分支
PROTECTED_BRANCHES="main master develop"
CURRENT_BRANCH=$(git symbolic-ref HEAD | sed -e 's,.*/\\(.*\\),\\1,')

echo "🛡️ 检查分支保护..."

for BRANCH in $PROTECTED_BRANCHES; do
  if [ "$CURRENT_BRANCH" = "$BRANCH" ]; then
    echo "❌ 不允许直接推送到 $BRANCH 分支"
    echo "请创建功能分支并通过 Pull Request 合并"
    exit 1
  fi
done

echo "✅ 分支检查通过"
exit 0`
    },
    {
      name: 'test-before-push',
      description: '推送前运行测试',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 推送前运行测试
echo "🧪 推送前运行测试..."

npm test

if [ $? -ne 0 ]; then
  echo "❌ 测试失败，取消推送"
  exit 1
fi

echo "✅ 测试通过，继续推送"
exit 0`
    },
    {
      name: 'force-push-warning',
      description: '强制推送警告',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 检测强制推送
ARGS=$@

if echo "$ARGS" | grep -q "\\-\\-force\\|\\-f"; then
  echo "⚠️ 警告: 检测到强制推送!"
  echo "这可能会覆盖远程仓库的历史记录"
  read -p "确定要继续吗? (yes/no) " -r
  if [ "$REPLY" != "yes" ]; then
    echo "❌ 取消推送"
    exit 1
  fi
fi

echo "✅ 推送检查通过"
exit 0`
    }
  ],

  'post-commit': [
    {
      name: 'notification',
      description: '提交后发送通知',
      type: 'node',
      executable: true,
      script: `#!/usr/bin/env node
const { exec } = require('child_process');

// 获取最新提交信息
exec('git log -1 --pretty=format:"%h - %s"', (error, stdout) => {
  if (error) {
    console.error('获取提交信息失败:', error);
    return;
  }
  
  console.log('✅ 提交成功!');
  console.log('📝 ' + stdout);
  
  // 这里可以添加发送通知的代码
  // 例如: 发送到 Slack、邮件等
});`
    },
    {
      name: 'auto-version',
      description: '自动更新版本号',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 自动更新版本号
COMMIT_MSG=$(git log -1 --pretty=%B)

# 检查是否是版本提交
if echo "$COMMIT_MSG" | grep -q "^release:"; then
  echo "📦 检测到发布提交，更新版本号..."
  npm version patch --no-git-tag-version
  git add package.json package-lock.json
  git commit --amend --no-edit
  echo "✅ 版本号已更新"
fi

exit 0`
    }
  ],

  'post-merge': [
    {
      name: 'dependency-install',
      description: '合并后自动安装依赖',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 检查 package.json 是否有变化
if git diff HEAD@{1} --stat | grep -q "package.json"; then
  echo "📦 检测到 package.json 变化，安装依赖..."
  npm install
  echo "✅ 依赖安装完成"
fi

exit 0`
    },
    {
      name: 'database-migrate',
      description: '合并后运行数据库迁移',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 检查是否有数据库迁移文件
if git diff HEAD@{1} --stat | grep -q "migrations/"; then
  echo "🗄️ 检测到数据库迁移文件，运行迁移..."
  npm run migrate
  echo "✅ 数据库迁移完成"
fi

exit 0`
    }
  ],

  'prepare-commit-msg': [
    {
      name: 'template-message',
      description: '使用提交消息模板',
      type: 'bash',
      executable: true,
      script: `#!/bin/sh
# 添加提交消息模板
COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

# 只在没有消息源时添加模板
if [ -z "$COMMIT_SOURCE" ]; then
  cat > $COMMIT_MSG_FILE <<EOF
# <type>(<scope>): <subject>
# 
# <body>
# 
# <footer>
# 
# Type: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
# Scope: 影响范围
# Subject: 简短描述 (不超过 72 字符)
# Body: 详细描述
# Footer: 关联 issue, BREAKING CHANGE 等
EOF
fi

exit 0`
    },
    {
      name: 'branch-prefix',
      description: '根据分支名自动添加前缀',
      type: 'node',
      executable: true,
      script: `#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

const commitMsgFile = process.argv[2];
const commitSource = process.argv[3];

// 只在没有消息源时处理
if (!commitSource) {
  const branch = execSync('git branch --show-current').toString().trim();
  const commitMsg = fs.readFileSync(commitMsgFile, 'utf-8');
  
  // 根据分支名添加前缀
  let prefix = '';
  if (branch.startsWith('feature/')) {
    prefix = 'feat: ';
  } else if (branch.startsWith('fix/') || branch.startsWith('hotfix/')) {
    prefix = 'fix: ';
  } else if (branch.startsWith('docs/')) {
    prefix = 'docs: ';
  }
  
  if (prefix && !commitMsg.startsWith(prefix)) {
    fs.writeFileSync(commitMsgFile, prefix + commitMsg);
    console.log('✅ 已根据分支名添加前缀');
  }
}

process.exit(0);`
    }
  ]
}

/**
 * 获取钩子模板
 */
export function getHookTemplate(hookName: string, templateName: string): HookTemplate | undefined {
  const templates = GIT_HOOK_TEMPLATES[hookName]
  if (!templates) return undefined
  
  return templates.find(t => t.name === templateName)
}

/**
 * 获取所有钩子类型
 */
export function getAllHookTypes(): string[] {
  return Object.keys(GIT_HOOK_TEMPLATES)
}

/**
 * 获取钩子的所有模板
 */
export function getHookTemplates(hookName: string): HookTemplate[] {
  return GIT_HOOK_TEMPLATES[hookName] || []
}
