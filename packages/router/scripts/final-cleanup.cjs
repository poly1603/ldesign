const fs = require('fs');
const path = require('path');

// 修复未使用的变量
const fixes = [
  // 删除未使用的 _defaultStyles
  {
    file: 'src/components/LocaleSwitcher.tsx',
    from: /\/\/ 默认样式 \(保留用于将来可能的样式注入功能\)\nconst _defaultStyles = `[\s\S]*?<\/style>\n`/g,
    to: '// 默认样式功能已移除\n'
  },
  
  // 删除未使用的 ComponentInstanceCache
  {
    file: 'src/components/optimized-components.tsx',
    from: /\/\*\*\n \* 组件实例缓存[\s\S]*?\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nclass ComponentInstanceCache \{[\s\S]*?\n\}/g,
    to: '// ComponentInstanceCache 已移除\n'
  },
  
  // 删除未使用的 __runGuards
  {
    file: 'src/core/optimized-router.ts',
    from: /\/\*\*\n   \* 执行导航守卫[\s\S]*?@deprecated[\s\S]*?\*\/\n  private async __runGuards\([\s\S]*?\n  \}/g,
    to: '// 守卫执行方法已移除\n'
  },
  
  // 删除未使用的 _router 和方法
  {
    file: 'src/debug/dev-tools.ts',
    from: /private _router: Router/g,
    to: '// Router reference removed'
  },
  
  {
    file: 'src/device/template.ts',
    from: /private _router: Router/g,
    to: '// Router reference removed'
  },
  
  {
    file: 'src/device/resolver.ts',
    from: /private _createErrorComponent\(error: Error\): RouteComponent \{[\s\S]*?\n  \}/g,
    to: '// createErrorComponent method removed'
  },
  
  // 修复 data-fetching undefined 问题
  {
    file: 'src/features/data-fetching/index.ts',
    from: /const oldestKey = sorted\[0\]\?\.\[0\]/g,
    to: `const oldest = sorted[0]
      if (!oldest) return
      const oldestKey = oldest[0]`
  },
];

fixes.forEach(({ file, from, to }) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (from.test(content)) {
      content = content.replace(from, to);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${file}`);
    }
  }
});

console.log('\n✅ Cleanup complete!');

