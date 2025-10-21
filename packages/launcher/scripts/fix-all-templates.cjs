const fs = require('fs');
const path = require('path');

console.log('开始修复所有模板字符串问题...\n');

// 定义所有需要修复的文件和修复规则
const fixes = [
  // dev.ts
  {
    file: 'src/cli/commands/dev.ts',
    replacements: [
      {
        from: /if \(!context\.options\.silent\) \{\s+\} - \$\{envLabel\}`\)\s+\} \$\{context\.cwd\}`\)\s+\} \$\{mode\}`\)/s,
        to: `if (!context.options.silent) {
        console.log(\`\\n🚀 \${pc.bold('Launcher Dev Server')} - \${envLabel}\`)
        console.log(\`📁 \${pc.cyan('Working Directory:')} \${context.cwd}\`)
        console.log(\`⚙️  \${pc.cyan('Mode:')} \${mode}\`)`
      }
    ]
  },
  // preview.ts
  {
    file: 'src/cli/commands/preview.ts',
    replacements: [
      {
        from: /if \(!context\.options\.silent\) \{\s+\} - \$\{envLabel\}`\)\s+\} \$\{context\.cwd\}`\)\s+\} preview`\)/s,
        to: `if (!context.options.silent) {
        console.log(\`\\n🚀 \${pc.bold('Launcher Preview Server')} - \${envLabel}\`)
        console.log(\`📁 \${pc.cyan('Working Directory:')} \${context.cwd}\`)
        console.log(\`⚙️  \${pc.cyan('Mode:')} preview\`)`
      }
    ]
  },
  // build.ts  
  {
    file: 'src/cli/commands/build.ts',
    replacements: [
      {
        from: /if \(!context\.options\.silent\) \{\s+\} - \$\{envLabel\}`\)\s+\} \$\{context\.cwd\}`\)\s+\} \$\{mode\}`\)/s,
        to: `if (!context.options.silent) {
        console.log(\`\\n🏗️  \${pc.bold('Launcher Build')} - \${envLabel}\`)
        console.log(\`📁 \${pc.cyan('Working Directory:')} \${context.cwd}\`)
        console.log(\`⚙️  \${pc.cyan('Mode:')} \${mode}\`)`
      }
    ]
  },
  // build.ts
  {
    file: 'src/cli/commands/build.ts',
    replacements: [
      {
        from: /if \(!context\.options\.silent\) \{\s+\} - \$\{envLabel\}`\)\s+\} \$\{context\.cwd\}`\)\s+\} \$\{mode\}`\)/s,
        to: `if (!context.options.silent) {
        console.log(\`\\n🚀 \${pc.bold('Launcher Build')} - \${envLabel}\`)
        console.log(\`📁 \${pc.cyan('Working Directory:')} \${context.cwd}\`)
        console.log(\`⚙️  \${pc.cyan('Mode:')} \${mode}\`)`
      }
    ]
  },
  // performance.ts
  {
    file: 'src/utils/performance.ts',
    replacements: [
      {
        from: /end\(\): number \{\s+const duration = Date\.now\(\) - start\s+return duration\s+\},\s+lap\(label: string\): number \{\s+const duration = Date\.now\(\) - start\s+: \$\{duration\}ms`\)\s+return duration/s,
        to: `end(): number {
      const duration = Date.now() - start
      console.log(\`⏱️  \${name} completed: \${duration}ms\`)
      return duration
    },
    lap(label: string): number {
      const duration = Date.now() - start
      console.log(\`⏱️  \${name} - \${label}: \${duration}ms\`)
      return duration`
      }
    ]
  },
  // AliasManager.ts
  {
    file: 'src/core/AliasManager.ts',
    replacements: [
      {
        from: /, 包含\$\{stage\}=\$\{shouldInclude\}`\)/g,
        to: ' - Include ${stage}=${shouldInclude}`)'
      }
    ]
  },
  // PerformanceMonitor.ts
  {
    file: 'src/core/PerformanceMonitor.ts',
    replacements: [
      {
        from: /printSummary\(report: PerformanceReport\): void \{\s+const \{ metrics, score, recommendations \} = report\s+\s+\)\s+\s+if/s,
        to: `printSummary(report: PerformanceReport): void {
    const { metrics, score, recommendations } = report

    console.log('\\n📊 Performance Report')
    console.log('─'.repeat(50))

    if`
      }
    ]
  },
  // smart-proxy.ts
  {
    file: 'src/utils/smart-proxy.ts',
    replacements: [
      {
        from: /\}\] \$\{serviceName\}:`/g,
        to: `Proxy \${serviceName}\`:`
      }
    ]
  },
  // dev-enhancement.ts
  {
    file: 'src/plugins/dev-enhancement.ts',
    replacements: [
      {
        from: /this\.logger\.info\(\`服务器将在 \$\{this\.options\.restartDelay\}ms 后重启`, \{ reason \}\)/g,
        to: `this.logger.info('Server will restart in ' + this.options.restartDelay + 'ms, reason: ' + reason)`
      }
    ]
  },
  // image-optimizer.ts
  {
    file: 'src/plugins/image-optimizer.ts',
    replacements: [
      {
        from: /\.toFixed\(2\)\}KB`\)\s+\.toFixed\(2\)\}KB`\)\s+\.toFixed\(2\)\}KB`\)\s+\.toFixed\(1\)\}%`\)/s,
        to: `.toFixed(2)}KB\`)
    this.logger.info(\`优化后大小: \${(totalOptimizedSize / 1024).toFixed(2)}KB\`)
    this.logger.info(\`节省空间: \${(totalSavings / 1024).toFixed(2)}KB\`)
    this.logger.info(\`平均压缩率: \${(averageCompressionRatio * 100).toFixed(1)}%\`)`
      }
    ]
  },
  // smart-cache.ts
  {
    file: 'src/plugins/smart-cache.ts',
    replacements: [
      {
        from: /\.toFixed\(1\)\}%`\)\s+\}ms`\)\s+\.toFixed\(2\)\}MB`\)/s,
        to: `.toFixed(1)}%\`)
        console.log(\`⏱️  Average read time: \${stats.averageReadTime}ms\`)
        console.log(\`📦 Cache size: \${(stats.size / 1024 / 1024).toFixed(2)}MB\`)`
      }
    ]
  }
];

let totalFixed = 0;

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  跳过: ${file} (文件不存在)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;

  replacements.forEach((replacement, index) => {
    if (content.match(replacement.from)) {
      content = content.replace(replacement.from, replacement.to);
      fileChanged = true;
      console.log(`✓ 已修复: ${file} (规则 ${index + 1})`);
      totalFixed++;
    }
  });

  if (fileChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log(`\n总共修复了 ${totalFixed} 个问题`);
console.log('✅ 修复完成！');

