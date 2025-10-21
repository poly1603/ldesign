const fs = require('fs');
const path = require('path');

// 要修复的文件列表
const files = [
  {
    path: 'src/cli/commands/optimize.ts',
    fixes: [
      {
        search: /if \(options\.stats\) \{\s+const stats = cacheManager\.getStats\(\)\s+\)\s+\.toFixed\(1\)\}%`\)\s+\.toFixed\(2\)\}MB`\)\s+\}ms`\)\s+\}/s,
        replace: `if (options.stats) {
      const stats = cacheManager.getStats()
      console.log('\\nCache Stats:')
      console.log('  Hit Rate:', (stats.hitRate * 100).toFixed(1) + '%')
      console.log('  Size:', (stats.size / 1024 / 1024).toFixed(2) + 'MB')
      console.log('  Avg Time:', stats.averageReadTime + 'ms')
    }`
      }
    ]
  },
  {
    path: 'src/cli/commands/plugin.ts',
    fixes: [
      {
        search: /\/\/ 显示搜索结果\s+\)\s+\s+results\.forEach/s,
        replace: `// 显示搜索结果
      console.log('\\nSearch Results (' + results.length + ' found):')
      
      results.forEach`
      }
    ]
  },
  {
    path: 'src/plugins/dev-enhancement.ts',
    fixes: [
      {
        search: /this\.logger\.info\(`服务器将在 \$\{this\.options\.restartDelay\}ms 后重启`, \{ reason \}\)/,
        replace: `console.log('Server will restart in', this.options.restartDelay, 'ms, reason:', reason)`
      }
    ]
  }
];

files.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  let content = fs.readFileSync(filePath, 'utf8');

  file.fixes.forEach(fix => {
    if (content.match(fix.search)) {
      content = content.replace(fix.search, fix.replace);
      console.log(`Fixed: ${file.path}`);
    }
  });

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('All fixes applied!');





