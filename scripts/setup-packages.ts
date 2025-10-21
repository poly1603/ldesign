#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

// 统一版本配置
const VERSIONS = {
  typescript: '^5.7.3',
  eslint: '^9.18.0',
  antfuEslintConfig: '^6.0.0',
};

// .gitignore 内容
const GITIGNORE_CONTENT = `# Build outputs
dist
es
lib
*.tsbuildinfo
.rollup.cache

# Dependencies
node_modules

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Test coverage
coverage
.nyc_output

# Temporary files
*.tmp
.cache
.temp
`;

// eslint.config.js 内容
const ESLINT_CONFIG_CONTENT = `import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  jsonc: true,
  markdown: true,
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },
  rules: {
    // 自定义规则
    'no-console': 'off',
    'no-debugger': 'warn',
  },
})
`;

// 获取所有子包路径
function getAllPackages(rootDir: string): string[] {
  const packages: string[] = [];
  const workspaceDirs = ['packages', 'apps', 'tools'];

  for (const dir of workspaceDirs) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) continue;

    const subdirs = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const subdir of subdirs) {
      if (subdir.isDirectory()) {
        const packagePath = path.join(fullPath, subdir.name);
        const packageJsonPath = path.join(packagePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          packages.push(packagePath);
        }
      }
    }
  }

  return packages;
}

// 更新 package.json
function updatePackageJson(packagePath: string) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const content = fs.readFileSync(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(content);

  // 确保有 devDependencies
  pkg.devDependencies = pkg.devDependencies || {};

  // 更新版本
  pkg.devDependencies['typescript'] = VERSIONS.typescript;
  pkg.devDependencies['eslint'] = VERSIONS.eslint;
  pkg.devDependencies['@antfu/eslint-config'] = VERSIONS.antfuEslintConfig;

  // 添加 lint 脚本（如果没有）
  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts.lint) {
    pkg.scripts.lint = 'eslint .';
  }
  if (!pkg.scripts['lint:fix']) {
    pkg.scripts['lint:fix'] = 'eslint . --fix';
  }

  // 写回文件
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(pkg, null, 2) + '\n',
    'utf-8'
  );

  return pkg.name || path.basename(packagePath);
}

// 创建/更新 .gitignore
function updateGitignore(packagePath: string) {
  const gitignorePath = path.join(packagePath, '.gitignore');
  fs.writeFileSync(gitignorePath, GITIGNORE_CONTENT, 'utf-8');
}

// 创建/更新 eslint.config.js
function updateEslintConfig(packagePath: string) {
  const eslintConfigPath = path.join(packagePath, 'eslint.config.js');
  fs.writeFileSync(eslintConfigPath, ESLINT_CONFIG_CONTENT, 'utf-8');
}

// 主函数
async function main() {
  const rootDir = path.resolve(process.cwd());
  console.log('🚀 开始配置所有子包...\n');

  const packages = getAllPackages(rootDir);
  console.log(`📦 找到 ${packages.length} 个子包\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const packagePath of packages) {
    try {
      const packageName = updatePackageJson(packagePath);
      updateGitignore(packagePath);
      updateEslintConfig(packagePath);

      console.log(`✅ ${packageName}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ ${path.basename(packagePath)}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 配置完成:`);
  console.log(`   ✅ 成功: ${successCount}`);
  console.log(`   ❌ 失败: ${errorCount}`);

  console.log(`\n📝 统一版本:`);
  console.log(`   TypeScript: ${VERSIONS.typescript}`);
  console.log(`   ESLint: ${VERSIONS.eslint}`);
  console.log(`   @antfu/eslint-config: ${VERSIONS.antfuEslintConfig}`);

  console.log(`\n💡 下一步:`);
  console.log(`   1. 运行 pnpm install 安装依赖`);
  console.log(`   2. 运行 pnpm -r lint 检查所有包`);
  console.log(`   3. 运行 pnpm -r lint:fix 自动修复问题`);
}

main().catch((error) => {
  console.error('执行失败:', error);
  process.exit(1);
});
