#!/usr/bin/env node
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface SubmoduleInfo {
  path: string;
  name: string;
}

// 获取所有子模块
function getSubmodules(rootDir: string): SubmoduleInfo[] {
  const submodules: SubmoduleInfo[] = [];
  const workspaceDirs = ['packages', 'apps', 'tools'];

  for (const dir of workspaceDirs) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) continue;

    const subdirs = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const subdir of subdirs) {
      if (subdir.isDirectory()) {
        const submodulePath = path.join(fullPath, subdir.name);
        const gitPath = path.join(submodulePath, '.git');
        
        // 检查是否是 git 仓库
        if (fs.existsSync(gitPath)) {
          submodules.push({
            path: submodulePath,
            name: `${dir}/${subdir.name}`,
          });
        }
      }
    }
  }

  return submodules;
}

// 检查是否有未提交的更改
function hasChanges(submodulePath: string): boolean {
  try {
    const status = execSync('git status --porcelain', {
      cwd: submodulePath,
      encoding: 'utf-8',
    });
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

// 提交子模块
function commitSubmodule(
  submodulePath: string,
  submoduleName: string,
  commitMessage: string
): boolean {
  try {
    console.log(`\n📦 处理 ${submoduleName}...`);

    // 添加所有更改
    execSync('git add .', { cwd: submodulePath, stdio: 'inherit' });

    // 提交
    execSync(`git commit -m "${commitMessage}"`, {
      cwd: submodulePath,
      stdio: 'inherit',
    });

    console.log(`✅ ${submoduleName} 提交成功`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${submoduleName} 提交失败`);
    return false;
  }
}

// 主函数
async function main() {
  const rootDir = path.resolve(process.cwd());
  
  const commitMessage = process.argv[2] || 
    'chore: 统一配置 eslint 和 gitignore，清理构建产物';

  console.log('🚀 开始提交所有子模块...');
  console.log(`📝 提交信息: ${commitMessage}\n`);

  const submodules = getSubmodules(rootDir);
  console.log(`📦 找到 ${submodules.length} 个子模块\n`);

  let committed = 0;
  let skipped = 0;
  let failed = 0;

  for (const submodule of submodules) {
    if (!hasChanges(submodule.path)) {
      console.log(`⏭️  ${submodule.name} (无更改)`);
      skipped++;
      continue;
    }

    const success = commitSubmodule(
      submodule.path,
      submodule.name,
      commitMessage
    );

    if (success) {
      committed++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 提交完成:`);
  console.log(`   ✅ 已提交: ${committed}`);
  console.log(`   ⏭️  跳过: ${skipped}`);
  console.log(`   ❌ 失败: ${failed}`);

  if (committed > 0) {
    console.log(`\n💡 下一步:`);
    console.log(`   1. 运行 git add . 更新子模块引用`);
    console.log(`   2. 运行 git commit -m "chore: 更新子模块引用"`);
    console.log(`   3. 运行 git push 推送主仓库`);
    console.log(`   4. 运行 git submodule foreach git push 推送所有子模块`);
  }
}

main().catch((error) => {
  console.error('执行失败:', error);
  process.exit(1);
});
