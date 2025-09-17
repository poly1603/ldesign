#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🚀 开始构建所有图标包到正确位置...\n');

// 配置 - 生成到我们自己的 src 目录结构
const config = {
  svgSource: 'tdesign-icons-develop/svg/*.svg',
  packages: {
    react: {
      dir: 'src/packages/react/src',
      componentDir: 'src/packages/react/src/components',
      ext: '.tsx',
      template: 'react'
    },
    'vue-next': {
      dir: 'src/packages/vue-next/src',
      componentDir: 'src/packages/vue-next/src/components',
      ext: '.vue',
      template: 'vue'
    },
    angular: {
      dir: 'src/packages/angular/src',
      componentDir: 'src/packages/angular/src/components',
      ext: '.component.ts',
      template: 'angular'
    }
  }
};

// 工具函数
function generateComponentName(filename, type = 'react') {
  const basename = path.basename(filename, '.svg');
  const pascalCase = basename.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  switch (type) {
    case 'angular':
      return pascalCase + 'Component';
    default:
      return pascalCase + 'Icon';
  }
}

function processSvg(svgContent, type = 'react') {
  switch (type) {
    case 'react':
      return svgContent
        .replace(/width="[^"]*"/g, 'width={size}')
        .replace(/height="[^"]*"/g, 'height={size}')
        .replace(/fill="none"/g, 'fill="none"')
        .replace(/fill="[^"]*"/g, 'fill={color}')
        .replace(/stroke="[^"]*"/g, 'stroke={color}')
        .replace(/stroke-width="[^"]*"/g, 'strokeWidth={strokeWidth}');
    
    case 'vue':
      return svgContent
        .replace(/<svg[^>]*>|<\/svg>/g, '')
        .replace(/fill="none"/g, 'fill="none"')
        .replace(/fill="[^"]*"/g, ':fill="color"')
        .replace(/stroke="[^"]*"/g, ':stroke="color"')
        .replace(/stroke-width="[^"]*"/g, ':stroke-width="strokeWidth"');
    
    case 'angular':
      return svgContent
        .replace(/width="[^"]*"/g, '[attr.width]="size"')
        .replace(/height="[^"]*"/g, '[attr.height]="size"')
        .replace(/fill="none"/g, 'fill="none"')
        .replace(/fill="[^"]*"/g, '[attr.fill]="color"')
        .replace(/stroke="[^"]*"/g, '[attr.stroke]="color"')
        .replace(/stroke-width="[^"]*"/g, '[attr.stroke-width]="strokeWidth"');
    
    default:
      return svgContent;
  }
}

function generateComponent(filename, svgContent, type = 'react') {
  const componentName = generateComponentName(filename, type);
  const processedSvg = processSvg(svgContent, type);
  
  switch (type) {
    case 'react':
      return `// This file is generated automatically. DO NOT EDIT IT.
import React from 'react';

interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ${componentName}: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
  style,
  ...props
}) => {
  return (
    ${processedSvg}
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};
`;

    case 'vue':
      return `<!-- This file is generated automatically. DO NOT EDIT IT. -->
<template>
  <svg
    :width="size"
    :height="size"
    :class="className"
    :style="style"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
  >
    ${processedSvg}
  </svg>
</template>

<script setup lang="ts">
interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: Record<string, any>;
}

withDefaults(defineProps<IconProps>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
});
</script>

<script lang="ts">
export default {
  name: '${componentName}',
  inheritAttrs: false,
};
</script>
`;

    case 'angular':
      return `// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-${filename.replace(/\.svg$/, '').replace(/_/g, '-')}',
  template: \`
    ${processedSvg}
  \`,
  standalone: true
})
export class ${componentName} {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
`;

    default:
      return '';
  }
}

function generateIndex(files, type = 'react') {
  const exports = files.map(file => {
    const basename = path.basename(file, '.svg');
    const componentName = generateComponentName(file, type);
    
    switch (type) {
      case 'react':
        return `export { default as ${componentName} } from './components/${basename}';`;
      case 'vue':
        return `export { default as ${componentName} } from './components/${basename}.vue';`;
      case 'angular':
        return `export { ${componentName} } from './components/${basename}.component';`;
      default:
        return '';
    }
  }).join('\n');

  return `// This file is generated automatically. DO NOT EDIT IT.

${exports}

// Re-export types
export interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: ${type === 'react' ? 'React.CSSProperties' : 'Record<string, any>'};
}
`;
}

// 主构建函数
async function buildPackage(packageName, packageConfig) {
  console.log(`📦 构建 ${packageName} 包到: ${packageConfig.componentDir}`);
  
  // 获取 SVG 文件
  const svgFiles = glob.sync(config.svgSource);
  console.log(`   找到 ${svgFiles.length} 个 SVG 文件`);
  
  // 创建目录
  if (!fs.existsSync(packageConfig.componentDir)) {
    fs.mkdirSync(packageConfig.componentDir, { recursive: true });
    console.log(`   ✅ 创建目录: ${packageConfig.componentDir}`);
  }
  
  // 清空现有组件
  if (fs.existsSync(packageConfig.componentDir)) {
    const existingFiles = glob.sync(path.join(packageConfig.componentDir, '*' + packageConfig.ext));
    existingFiles.forEach(file => fs.unlinkSync(file));
    console.log(`   🧹 清理现有组件: ${existingFiles.length} 个文件`);
  }
  
  // 生成组件
  let successCount = 0;
  const processedFiles = [];
  
  for (const svgFile of svgFiles) { // 处理全部 SVG 文件
    try {
      const svgContent = fs.readFileSync(svgFile, 'utf-8');
      const basename = path.basename(svgFile, '.svg');
      const componentContent = generateComponent(svgFile, svgContent, packageConfig.template);
      
      const outputPath = path.join(packageConfig.componentDir, basename + packageConfig.ext);
      fs.writeFileSync(outputPath, componentContent);
      
      processedFiles.push(svgFile);
      successCount++;
    } catch (error) {
      console.error(`   ❌ 处理失败: ${path.basename(svgFile)} - ${error.message}`);
    }
  }
  
  // 生成 index.ts 文件 (统一导出)
  const indexContent = generateIndex(processedFiles, packageConfig.template);
  const indexPath = path.join(packageConfig.dir, 'index.ts');
  fs.writeFileSync(indexPath, indexContent);

  console.log(`   ✅ 成功生成 ${successCount} 个组件`);
  console.log(`   📄 生成 index.ts: ${indexPath}`);
  
  return { success: successCount, total: svgFiles.length };
}

// 执行构建
async function main() {
  const results = {};
  
  for (const [packageName, packageConfig] of Object.entries(config.packages)) {
    try {
      results[packageName] = await buildPackage(packageName, packageConfig);
    } catch (error) {
      console.error(`❌ ${packageName} 包构建失败:`, error.message);
      results[packageName] = { success: 0, total: 0, error: error.message };
    }
    console.log('');
  }
  
  // 输出总结
  console.log('🎉 构建完成！\n');
  console.log('📊 构建结果总结:');
  
  let totalSuccess = 0;
  let totalFiles = 0;
  
  for (const [packageName, result] of Object.entries(results)) {
    if (result.error) {
      console.log(`   ${packageName}: ❌ 构建失败 - ${result.error}`);
    } else {
      console.log(`   ${packageName}: ✅ ${result.success}/${result.total} 个组件`);
      totalSuccess += result.success;
      totalFiles = Math.max(totalFiles, result.total);
    }
  }
  
  console.log(`\n🎯 总计: ${totalSuccess} 个组件成功生成`);
  console.log(`📁 源文件: ${totalFiles} 个 SVG 图标`);
  console.log(`🏗️  支持框架: ${Object.keys(config.packages).join(', ')}`);
  
  console.log('\n✨ 组件已生成到我们的 src 目录结构中！');
  console.log('📍 生成位置:');
  Object.entries(config.packages).forEach(([name, cfg]) => {
    console.log(`   ${name}: ${cfg.componentDir}`);
  });
}

// 运行构建
main().catch(console.error);
