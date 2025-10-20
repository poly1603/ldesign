const fs = require('fs');
const path = require('path');

// 处理 undefined 参数的中间件文件
function fixMiddlewareIndex() {
  const file = path.join(__dirname, '../src/middleware/index.ts');
  let content = fs.readFileSync(file, 'utf8');

  // 修复未使用的 from 参数
  content = content.replace(/handler: async \(to, from, next/g, 'handler: async (to, _from, next');
  content = content.replace(/handler: async \(to, from, next, context\) =>/g, 'handler: async (to, _from, next, context) =>');
  content = content.replace(/handler: async \(to, from, next, _context\) =>/g, 'handler: async (to, _from, next, _context) =>');

  fs.writeFileSync(file, content, 'utf8');
  console.log('✓ Fixed: src/middleware/index.ts');
}

// 处理 data-fetching/index.ts
function fixDataFetching() {
  const file = path.join(__dirname, '../src/features/data-fetching/index.ts');
  let content = fs.readFileSync(file, 'utf8');
  
  // 修复未使用的 from 参数
  content = content.replace(/guard: NavigationGuard = async \(to, from, next\)/g, 'guard: NavigationGuard = async (to, _from, next)');
  
  // 修复可能为 undefined 的情况
  content = content.replace(
    /const oldestKey = Array\.from\(this\.cache\.entries\(\)\)[\s\S]*?\.sort\(\(a, b\) => a\[1\]\.timestamp - b\[1\]\.timestamp\)\[0\]\[0\]/g,
    'const entries = Array.from(this.cache.entries())\n      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)\n      const oldestKey = sorted[0]?.[0]'
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('✓ Fixed: src/features/data-fetching/index.ts');
}

// 处理 core/matcher.ts
function fixCoreMatcher() {
  const file = path.join(__dirname, '../src/core/matcher.ts');
  let content = fs.readFileSync(file, 'utf8');
  
  // 删除 tempMatchData 引用
  content = content.replace(/this\.tempMatchData\.set\([^)]+\);?\s*/g, '');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('✓ Fixed: src/core/matcher.ts');
}

// 处理 dev-tools.ts
function fixDevTools() {
  const file = path.join(__dirname, '../src/debug/dev-tools.ts');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // 查找 private router: Router 在 DevToolsPanel 类中的位置
    // 如果router被使用则不修改，否则改为 _router
    if (content.includes('class DevToolsPanel')) {
      // 检查在 DevToolsPanel 类的构造函数之后是否使用了 this.router
      const devToolsPanelMatch = content.match(/class DevToolsPanel[\s\S]*?constructor[\s\S]*?this\.router = router[\s\S]*?}/);
      if (devToolsPanelMatch) {
        const classContent = content.substring(content.indexOf('class DevToolsPanel'));
        // 如果在类内部使用了 this.router，就不修改
        if (!classContent.match(/this\.router(?![\s]*=)/)) {
          content = content.replace(
            /(class DevToolsPanel[\s\S]*?)private router: Router/,
            '$1private _router: Router'
          );
          content = content.replace(
            /(class DevToolsPanel[\s\S]*?constructor[\s\S]*?)this\.router = router/,
            '$1this._router = router'
          );
        }
      }
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('✓ Fixed: src/debug/dev-tools.ts');
  }
}

// 批量修复文件
try {
  fixMiddlewareIndex();
  fixDataFetching();
  fixCoreMatcher();
  fixDevTools();
  console.log('\n✅ Batch fixes completed successfully!');
} catch (error) {
  console.error('❌ Error during batch fix:', error);
  process.exit(1);
}


