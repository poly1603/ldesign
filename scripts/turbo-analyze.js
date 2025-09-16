#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const REPORTS_DIR = join(process.cwd(), 'reports');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// 创建报告目录
if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log(chalk.blue('🔍 开始 Turborepo 构建分析...\n'));

// 1. 获取任务执行时间
console.log(chalk.yellow('⏱️  分析任务执行时间...'));
try {
  const taskTiming = execSync('npx turbo run build --dry-run=json', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore']
  });
  
  const timingReport = join(REPORTS_DIR, `task-timing-${TIMESTAMP}.json`);
  writeFileSync(timingReport, taskTiming);
  console.log(chalk.green(`✅ 任务时间报告已保存到: ${timingReport}`));
} catch (error) {
  console.log(chalk.red('❌ 无法获取任务执行时间'));
}

// 2. 分析缓存命中率
console.log(chalk.yellow('\n📊 分析缓存命中率...'));
try {
  const cacheAnalysis = execSync('npx turbo run build --summarize', {
    encoding: 'utf8'
  });
  
  // 解析缓存信息
  const cacheHits = (cacheAnalysis.match(/cache hit/gi) || []).length;
  const cacheMisses = (cacheAnalysis.match(/cache miss/gi) || []).length;
  const cacheHitRate = cacheHits / (cacheHits + cacheMisses) * 100;
  
  console.log(chalk.cyan(`缓存命中: ${cacheHits}`));
  console.log(chalk.cyan(`缓存未命中: ${cacheMisses}`));
  console.log(chalk.cyan(`缓存命中率: ${cacheHitRate.toFixed(2)}%`));
  
  const cacheReport = {
    timestamp: new Date().toISOString(),
    cacheHits,
    cacheMisses,
    cacheHitRate: `${cacheHitRate.toFixed(2)}%`,
    details: cacheAnalysis
  };
  
  const cacheReportPath = join(REPORTS_DIR, `cache-analysis-${TIMESTAMP}.json`);
  writeFileSync(cacheReportPath, JSON.stringify(cacheReport, null, 2));
  console.log(chalk.green(`✅ 缓存分析报告已保存到: ${cacheReportPath}`));
} catch (error) {
  console.log(chalk.red('❌ 无法分析缓存信息'));
}

// 3. 获取依赖图统计
console.log(chalk.yellow('\n🕸️  分析依赖关系...'));
try {
  const graph = execSync('npx turbo run build --graph=graph.json', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore']
  });
  
  if (existsSync('graph.json')) {
    const graphData = JSON.parse(readFileSync('graph.json', 'utf8'));
    const packageCount = Object.keys(graphData).length;
    
    console.log(chalk.cyan(`包总数: ${packageCount}`));
    
    // 分析每个包的依赖数量
    const dependencyAnalysis = {};
    for (const [pkg, deps] of Object.entries(graphData)) {
      dependencyAnalysis[pkg] = {
        dependencies: deps.dependencies || [],
        dependencyCount: (deps.dependencies || []).length
      };
    }
    
    // 找出依赖最多的包
    const sortedByDeps = Object.entries(dependencyAnalysis)
      .sort((a, b) => b[1].dependencyCount - a[1].dependencyCount)
      .slice(0, 5);
    
    console.log(chalk.cyan('\n依赖最多的包:'));
    sortedByDeps.forEach(([pkg, info]) => {
      console.log(chalk.gray(`  - ${pkg}: ${info.dependencyCount} 个依赖`));
    });
    
    const graphReport = join(REPORTS_DIR, `dependency-graph-${TIMESTAMP}.json`);
    writeFileSync(graphReport, JSON.stringify({
      timestamp: new Date().toISOString(),
      packageCount,
      dependencyAnalysis,
      topDependencies: sortedByDeps
    }, null, 2));
    
    console.log(chalk.green(`✅ 依赖图分析已保存到: ${graphReport}`));
    
    // 清理临时文件
    execSync('rm -f graph.json', { stdio: 'ignore' });
  }
} catch (error) {
  console.log(chalk.red('❌ 无法分析依赖图'));
}

// 4. 分析包大小
console.log(chalk.yellow('\n📦 分析包大小...'));
try {
  const packages = execSync('pnpm list --json --depth=0', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore']
  });
  
  const pkgData = JSON.parse(packages);
  const sizeAnalysis = [];
  
  // 获取每个包的构建产物大小
  for (const [name, info] of Object.entries(pkgData[0]?.devDependencies || {})) {
    if (name.startsWith('@ldesign/')) {
      const pkgPath = join('packages', name.replace('@ldesign/', ''));
      const distPath = join(pkgPath, 'dist');
      
      if (existsSync(distPath)) {
        try {
          const size = execSync(`du -sb ${distPath}`, { encoding: 'utf8' });
          const bytes = parseInt(size.split('\t')[0]);
          const mb = (bytes / 1024 / 1024).toFixed(2);
          
          sizeAnalysis.push({
            package: name,
            sizeInBytes: bytes,
            sizeInMB: parseFloat(mb)
          });
        } catch (e) {
          // 忽略单个包的错误
        }
      }
    }
  }
  
  // 按大小排序
  sizeAnalysis.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
  
  console.log(chalk.cyan('包大小排行:'));
  sizeAnalysis.slice(0, 10).forEach(pkg => {
    console.log(chalk.gray(`  - ${pkg.package}: ${pkg.sizeInMB} MB`));
  });
  
  const sizeReport = join(REPORTS_DIR, `package-sizes-${TIMESTAMP}.json`);
  writeFileSync(sizeReport, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalPackages: sizeAnalysis.length,
    totalSize: sizeAnalysis.reduce((sum, pkg) => sum + pkg.sizeInBytes, 0),
    packages: sizeAnalysis
  }, null, 2));
  
  console.log(chalk.green(`✅ 包大小分析已保存到: ${sizeReport}`));
} catch (error) {
  console.log(chalk.red('❌ 无法分析包大小'));
}

// 5. 生成综合报告
console.log(chalk.yellow('\n📋 生成综合报告...'));
const summaryReport = join(REPORTS_DIR, `turbo-summary-${TIMESTAMP}.md`);
const summaryContent = `# Turborepo 构建分析报告

生成时间: ${new Date().toLocaleString()}

## 概览

- 报告目录: ${REPORTS_DIR}
- 详细报告:
  - 任务时间: task-timing-${TIMESTAMP}.json
  - 缓存分析: cache-analysis-${TIMESTAMP}.json
  - 依赖图: dependency-graph-${TIMESTAMP}.json
  - 包大小: package-sizes-${TIMESTAMP}.json

## 建议

1. 检查缓存命中率，优化缓存配置
2. 分析依赖关系，减少不必要的依赖
3. 监控包大小变化，防止体积膨胀
4. 定期运行此分析，跟踪性能变化

## 使用方法

\`\`\`bash
# 运行完整分析
pnpm analyze:turbo

# 查看特定环境的构建
pnpm build:dev    # 开发环境
pnpm build:prod   # 生产环境

# 清理缓存后重新分析
pnpm clean:cache && pnpm analyze:turbo
\`\`\`
`;

writeFileSync(summaryReport, summaryContent);
console.log(chalk.green(`\n✅ 综合报告已生成: ${summaryReport}`));
console.log(chalk.blue('\n🎉 Turborepo 分析完成！'));
