const fs = require('fs');
const path = require('path');

const fixes = [
  // 修复 beforeEach/afterEach 中未使用的参数
  {
    file: 'src/features/i18n/index.ts',
    replacements: [
      {
        from: /beforeEach\(\(to, from, next\) =>/g,
        to: 'beforeEach((to, _from, next) =>'
      }
    ]
  },
  {
    file: 'src/features/RoutePerformanceAnalyzer.ts',
    replacements: [
      {
        from: /beforeEach\(\(to, from, next\) =>/g,
        to: 'beforeEach((to, _from, next) =>'
      }
    ]
  },
  {
    file: 'src/debug/RouteDebugger.ts',
    replacements: [
      {
        from: /afterEach\(\(to, from, failure\) =>/g,
        to: 'afterEach((_to, _from, failure) =>'
      },
      {
        from: /private analyzeSlow\(route: string, metric: PerformanceMetric\)/g,
        to: 'private analyzeSlow(_route: string, metric: PerformanceMetric)'
      }
    ]
  },
  {
    file: 'src/managers/FormRouteManager.ts',
    replacements: [
      {
        from: /beforeEach\(\(to, from, next\) =>/g,
        to: 'beforeEach((_to, _from, next) =>'
      }
    ]
  },
  {
    file: 'src/state/route-state.ts',
    replacements: [
      {
        from: /beforeEach\(\(to, from, next\) =>/g,
        to: 'beforeEach((_to, _from, next) =>'
      }
    ]
  },
  {
    file: 'src/micro-frontend/index.ts',
    replacements: [
      {
        from: /afterEach\(\(to\) =>/g,
        to: 'afterEach((_to) =>'
      }
    ]
  },
  {
    file: 'src/middleware/route-middleware.ts',
    replacements: [
      {
        from: /return async \(context, next\) =>/g,
        to: 'return async (_context, next) =>'
      }
    ]
  },
  {
    file: 'src/device/resolver.ts',
    replacements: [
      {
        from: /private createErrorComponent\(error: Error\): RouteComponent/g,
        to: 'private createErrorComponent(_error: Error): RouteComponent'
      }
    ]
  }
];

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${file}`);
    }
  }
});

console.log('Batch fixes complete!');


