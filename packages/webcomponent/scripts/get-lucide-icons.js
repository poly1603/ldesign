// 从 unpkg 获取 lucide 图标列表
async function getLucideIcons() {
  try {
    // 从 unpkg 获取 lucide 的图标数据
    const response = await fetch('https://unpkg.com/lucide@latest/dist/esm/icons/index.js');
    const text = await response.text();
    
    // 解析导出的图标名称
    const iconNames = [];
    const exportRegex = /export \{ default as (\w+).*?\} from/g;
    let match;
    
    while ((match = exportRegex.exec(text)) !== null) {
      const pascalName = match[1];
      // 转换为 kebab-case
      const kebabName = pascalName
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
      iconNames.push(kebabName);
    }
    
    return [...new Set(iconNames)].sort();
  } catch (error) {
    console.error('Failed to fetch lucide icons:', error);
    return [];
  }
}

// 生成图标列表文件
async function generateIconList() {
  const icons = await getLucideIcons();
  console.log(`Found ${icons.length} icons`);
  
  const content = `// Auto-generated lucide icon list
export const lucideIcons = ${JSON.stringify(icons, null, 2)};
`;
  
  require('fs').writeFileSync(
    require('path').join(__dirname, '../src/components/icon/lucide-icons.ts'),
    content
  );
  
  console.log('Generated lucide-icons.ts');
}

generateIconList();