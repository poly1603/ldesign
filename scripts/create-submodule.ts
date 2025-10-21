#!/usr/bin/env node
import { stdin, stdout } from 'process';
import { createInterface } from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';

const execAsync = promisify(exec);

// GitHub 配置
const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN || '',
  owner: process.env.GITHUB_OWNER || 'poly1603',
};

interface CreateSubmoduleOptions {
  directory: string;
  packageName: string;
  githubOwner: string;
}

// 创建 readline 接口
const rl = createInterface({
  input: stdin,
  output: stdout,
});

// 封装问题询问
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// 使用 GitHub API 创建仓库
async function createGithubRepo(
  repoName: string,
  owner: string,
  isPrivate: boolean = false
): Promise<string> {
  console.log(`\n📦 正在创建 GitHub 仓库: ${owner}/${repoName}...`);
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: repoName,
      private: isPrivate,
      auto_init: true,
    });

    const options = {
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          const repo = JSON.parse(responseData);
          const repoUrl = repo.clone_url;
          console.log(`✅ GitHub 仓库创建成功: ${repoUrl}`);
          resolve(repoUrl);
        } else {
          const error = JSON.parse(responseData);
          reject(new Error(`创建 GitHub 仓库失败: ${error.message || responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`创建 GitHub 仓库失败: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

// 添加 git submodule
async function addSubmodule(
  repoUrl: string,
  targetPath: string
): Promise<void> {
  console.log(`\n📂 正在添加 submodule 到: ${targetPath}...`);
  
  try {
    await execAsync(`git submodule add ${repoUrl} ${targetPath}`);
    console.log(`✅ Submodule 添加成功`);
    
    // 初始化并更新 submodule
    await execAsync(`git submodule update --init --recursive`);
    console.log(`✅ Submodule 初始化完成`);
  } catch (error: any) {
    throw new Error(`添加 submodule 失败: ${error.message}`);
  }
}

// 初始化基本的 package.json
async function initPackageJson(targetPath: string, packageName: string): Promise<void> {
  const packageJsonPath = path.join(targetPath, 'package.json');
  
  // 检查是否已存在
  if (fs.existsSync(packageJsonPath)) {
    console.log('⚠️  package.json 已存在，跳过初始化');
    return;
  }

  const packageJson = {
    name: packageName,
    version: '0.0.1',
    description: '',
    type: 'module',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch',
    },
    keywords: [],
    author: '',
    license: 'MIT',
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ 已创建基本的 package.json`);
}

// 主函数
async function main() {
  console.log('🚀 欢迎使用 Submodule 创建工具\n');
  console.log(`👤 GitHub 用户: ${GITHUB_CONFIG.owner}\n`);

  // 检查 GitHub Token
  if (!GITHUB_CONFIG.token) {
    console.error('❌ 错误: 未设置 GITHUB_TOKEN 环境变量');
    console.error('\n请设置环境变量:');
    console.error('  Windows (PowerShell): $env:GITHUB_TOKEN="your_token_here"');
    console.error('  Linux/Mac: export GITHUB_TOKEN="your_token_here"');
    console.error('\n或者使用 .env 文件设置');
    process.exit(1);
  }

  try {
    // 询问目录
    const directory = await question('📁 请输入要创建 submodule 的目录 (如: packages): ');
    if (!directory) {
      console.error('❌ 目录不能为空');
      process.exit(1);
    }

    // 检查目录是否存在
    if (!fs.existsSync(directory)) {
      console.error(`❌ 目录 "${directory}" 不存在`);
      process.exit(1);
    }

    // 询问包名
    const packageName = await question('📦 请输入包名 (如: @ldesign/my-package): ');
    if (!packageName) {
      console.error('❌ 包名不能为空');
      process.exit(1);
    }

    // 询问是否为私有仓库
    const isPrivateAnswer = await question('🔒 是否创建私有仓库? (y/N): ');
    const isPrivate = isPrivateAnswer.toLowerCase() === 'y';

    // 生成仓库名 (从包名提取，去除 scope)
    const repoName = packageName.includes('/') 
      ? packageName.split('/')[1] 
      : packageName;

    const targetPath = path.join(directory, repoName);

    // 显示确认信息
    console.log('\n📋 配置信息:');
    console.log(`   目录: ${directory}`);
    console.log(`   包名: ${packageName}`);
    console.log(`   仓库名: ${repoName}`);
    console.log(`   GitHub 所有者: ${GITHUB_CONFIG.owner}`);
    console.log(`   目标路径: ${targetPath}`);
    console.log(`   仓库类型: ${isPrivate ? '私有' : '公开'}`);

    const confirm = await question('\n✅ 确认创建? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 已取消');
      process.exit(0);
    }

    // 执行创建流程
    const repoUrl = await createGithubRepo(repoName, GITHUB_CONFIG.owner, isPrivate);
    await addSubmodule(repoUrl, targetPath);
    await initPackageJson(targetPath, packageName);

    console.log('\n🎉 Submodule 创建成功！');
    console.log(`\n💡 下一步:`);
    console.log(`   1. cd ${targetPath}`);
    console.log(`   2. 开始开发你的包`);
    console.log(`   3. git add . && git commit -m "Initial commit"`);
    console.log(`   4. git push origin main`);

  } catch (error: any) {
    console.error(`\n❌ 错误: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
