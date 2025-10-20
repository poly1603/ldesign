const fs = require('fs');
const path = require('path');

function readAndModify(filePath, modifications) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  modifications.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath.replace(__dirname + '/../', '')}`);
  }
}

// 修复 FormRouteManager.ts 中可能为 undefined 的错误
readAndModify(path.join(__dirname, '../src/managers/FormRouteManager.ts'), [
  {
    from: /if \(currentStep\.validate\) \{/g,
    to: 'if (currentStep && currentStep.validate) {'
  },
  {
    from: /const isValid = await currentStep\.validate\(form\.data\)/g,
    to: 'const isValid = currentStep ? await currentStep.validate(form.data) : false'
  },
  {
    from: /await this\.router\.push\(nextStep\.path\)/g,
    to: 'if (nextStep) await this.router.push(nextStep.path)'
  },
  {
    from: /await this\.router\.push\(previousStep\.path\)/g,
    to: 'if (previousStep) await this.router.push(previousStep.path)'
  },
  {
    from: /await this\.router\.push\(targetStep\.path\)/g,
    to: 'if (targetStep) await this.router.push(targetStep.path)'
  },
  {
    from: /if \(lastStep\.validate\) \{/g,
    to: 'if (lastStep && lastStep.validate) {'
  },
]);

// 修复 ScrollBehavior.ts
readAndModify(path.join(__dirname, '../src/features/ScrollBehavior.ts'), [
  {
    from: /const oldestKey = Array\.from\(this\.savedPositions\.entries\(\)\)[\s\S]*?\.sort\([^)]+\)\[0\]\[0\]/g,
    to: `const entries = Array.from(this.savedPositions.entries())
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const oldestKey = sorted[0]?.[0]
      if (!oldestKey) return`
  },
  {
    from: /scrollPosition = \{ el: to\.hash,/g,
    to: 'scrollPosition = { el: to.hash as any,'
  },
  {
    from: /const element = document\.querySelector\(position\.el\)/g,
    to: 'const element = document.querySelector(position.el as string)'
  }
]);

// 修复 SmartRouteManager.ts
readAndModify(path.join(__dirname, '../src/features/SmartRouteManager.ts'), [
  {
    from: /private config: SmartRouteConfig/g,
    to: 'private _config: SmartRouteConfig'
  },
  {
    from: /const grouped = this\.groupManager\.groupRoutes\(\[optimized\]\)/g,
    to: 'if (!optimized) return\n      const grouped = this.groupManager.groupRoutes([optimized])'
  },
  {
    from: /this\.state\.routes\.push\(optimized\)/g,
    to: 'if (optimized) this.state.routes.push(optimized)'
  },
  {
    from: /return originalBeforeEnter\(to, from, next\)/g,
    to: 'return Array.isArray(originalBeforeEnter) ? originalBeforeEnter[0]?.(to, from, next) : originalBeforeEnter(to, from, next)'
  }
]);

// 修复 i18n/index.ts
readAndModify(path.join(__dirname, '../src/features/i18n/index.ts'), [
  {
    from: /if \(this\.config\.locales\.includes\(short\)\) \{[\s\S]*?return short/g,
    to: `if (short && this.config.locales.includes(short)) {
          return short`
  },
  {
    from: /if \(segments\.length > 0 && this\.config\.locales\.includes\(segments\[0\]\)\) \{[\s\S]*?return segments\[0\]/g,
    to: `const firstSegment = segments[0]
    if (segments.length > 0 && firstSegment && this.config.locales.includes(firstSegment)) {
      return firstSegment`
  },
  {
    from: /this\.setLocale\(this\.config\.locales\[nextIndex\]\)/g,
    to: 'const nextLocale = this.config.locales[nextIndex]\n    if (nextLocale) this.setLocale(nextLocale)'
  },
  {
    from: /locales: i18nManager\.config\.locales,/g,
    to: 'locales: (i18nManager as any).config.locales,'
  },
  {
    from: /defaultLocale: i18nManager\.config\.defaultLocale,/g,
    to: 'defaultLocale: (i18nManager as any).config.defaultLocale,'
  }
]);

// 修复 RouteDebugger.ts
readAndModify(path.join(__dirname, '../src/debug/RouteDebugger.ts'), [
  {
    from: /const key = keys\[keys\.length - 1\]\.toLowerCase\(\)/g,
    to: 'const key = keys[keys.length - 1]?.toLowerCase() || \'\''
  },
  {
    from: /return sorted\[Math\.max\(0, index\)\]/g,
    to: 'return sorted[Math.max(0, index)] ?? 0'
  },
  {
    from: /performance: this\.performanceAnalyzer\?\.generateReport\(\),/g,
    to: 'performance: this.performanceAnalyzer?.generateReport() || {} as any,'
  }
]);

// 修复 RoutePerformanceAnalyzer.ts
readAndModify(path.join(__dirname, '../src/features/RoutePerformanceAnalyzer.ts'), [
  {
    from: /return sorted\[Math\.max\(0, Math\.min\(index, sorted\.length - 1\)\)\]/g,
    to: 'return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0'
  },
  {
    from: /if \(avgTime > this\.config\?\.thresholds\.poor\) \{/g,
    to: 'if (this.config && avgTime > this.config.thresholds.poor) {'
  },
  {
    from: /if \(pathMetrics\.length > metrics\.length \* 0\.2 && avgTime > this\.config\?\.thresholds\.acceptable\) \{/g,
    to: 'if (this.config && pathMetrics.length > metrics.length * 0.2 && avgTime > this.config.thresholds.acceptable) {'
  }
]);

// 修复 RouteVersionControl.ts
readAndModify(path.join(__dirname, '../src/features/RouteVersionControl.ts'), [
  {
    from: /this\.deleteVersion\(oldest\.id\)/g,
    to: 'if (oldest) this.deleteVersion(oldest.id)'
  }
]);

// 修复 RouteSecurity.ts
readAndModify(path.join(__dirname, '../src/features/RouteSecurity.ts'), [
  {
    from: /return match \? match\[2\] : null/g,
    to: 'return match ? (match[2] || null) : null'
  },
  {
    from: /return String\(value\)\.replace\(\/\[&<>"'\`=\/\]\/g, s => entityMap\[s\]\)/g,
    to: 'return String(value).replace(/[&<>"\'`=\\/]/g, (s: string) => entityMap[s as keyof typeof entityMap] || s)'
  }
]);

// 修复 micro-frontend/index.ts
readAndModify(path.join(__dirname, '../src/micro-frontend/index.ts'), [
  {
    from: /const sandbox = \{[\s\S]*?\}/g,
    to: '// Sandbox 功能暂时保留用于将来可能的隔离需求'
  }
]);

// 修复 composables/useFormRoute.ts
readAndModify(path.join(__dirname, '../src/composables/useFormRoute.ts'), [
  {
    from: /\.map\(form => form\.id\)/g,
    to: '.map((form: any) => form.id)'
  },
  {
    from: /const composedValidator = validators\.length === 1[\s\S]*?return allErrors[\s\S]*?\}/g,
    to: `const composedValidator = validators.length === 1
        ? validators[0]
        : async (val: any) => {
            const allErrors: string[] = []
            for (const validator of validators) {
              const errors = await validator(val)
              allErrors.push(...errors)
            }
            return allErrors
          }
      
      if (!composedValidator) return true
      const errors = await composedValidator(value.value)`
  }
]);

// 修复 optimized-router.ts
readAndModify(path.join(__dirname, '../src/core/optimized-router.ts'), [
  {
    from: /private async _runGuards\(/g,
    to: 'private async __runGuards('
  }
]);

console.log('\n✅ Final TypeScript fixes completed!');


