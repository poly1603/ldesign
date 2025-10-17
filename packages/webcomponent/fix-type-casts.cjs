const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 需要修复的文件和模式
const fixes = [
  {
    file: 'src/components/image/image-group.tsx',
    pattern: /as HTMLElement\[\]/g,
    replacement: 'as any[]'
  },
  {
    file: 'src/components/swiper/swiper.tsx',
    pattern: /as HTMLElement\[\]/g,
    replacement: 'as any[]'
  },
  {
    file: 'src/components/avatar/avatar-group.tsx',
    pattern: /as HTMLElement\[\]/g,
    replacement: 'as any[]'
  },
  {
    file: 'src/components/grid-item/grid-item.tsx',
    pattern: /as HTMLElement \| null/g,
    replacement: 'as any as HTMLElement | null'
  },
  {
    file: 'src/components/row/row.tsx',
    pattern: /as HTMLElement \| null/g,
    replacement: 'as any as HTMLElement | null'
  },
  {
    file: 'src/components/col/col.tsx',
    pattern: /as HTMLElement \| null/g,
    replacement: 'as any as HTMLElement | null'
  },
  {
    file: 'src/components/modal/modal-api.ts',
    pattern: /\(okBtn as HTMLElement\)/g,
    replacement: '(okBtn as any as HTMLElement)'
  },
  {
    file: 'src/components/grid/grid.tsx',
    pattern: /this\.toggleEl = document\.createElement\('ldesign-grid-item'\);/g,
    replacement: 'this.toggleEl = document.createElement(\'ldesign-grid-item\') as any;'
  },
  {
    file: 'src/components/progress/progress.tsx',
    pattern: /opacity: ([\d\.\-\+\*\/\s]+),/g,
    replacement: 'opacity: String($1),'
  }
];

fixes.forEach(({file, pattern, replacement}) => {
  const filePath = path.join(process.cwd(), file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(pattern, replacement);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed: ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
  }
});

console.log('\nType casting fixes completed.');