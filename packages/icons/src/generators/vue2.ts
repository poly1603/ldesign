import path from 'path';
import fs from 'fs-extra';
import type { GeneratorOptions, SVGInfo } from '../types';

function generateVue2Component(svg: SVGInfo): string {
  const svgContent = svg.optimizedContent || svg.content;
  // Remove the outer svg tag and extract its attributes
  const svgInner = svgContent
    .replace(/<\?xml[^>]*>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<svg([^>]*)>([\s\S]*)<\/svg>/i, (_, attrs, content) => {
      return `<svg v-bind="$attrs" ${attrs}>${content}</svg>`;
    });

  return `<template>
  ${svgInner}
</template>

<script>
export default {
  name: '${svg.componentName}Icon',
  inheritAttrs: false
}
</script>
`;
}

function generateVue2TypeScript(svg: SVGInfo): string {
  const svgContent = svg.optimizedContent || svg.content;
  const svgInner = svgContent
    .replace(/<\?xml[^>]*>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<svg([^>]*)>([\s\S]*)<\/svg>/i, (_, attrs, content) => {
      return `<svg v-bind="$attrs" ${attrs}>${content}</svg>`;
    });

  return `<template>
  ${svgInner}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: '${svg.componentName}Icon',
  inheritAttrs: false
})
</script>
`;
}

function generateIndexFile(icons: SVGInfo[], typescript: boolean): string {
  const imports = icons.map(icon => 
    `import ${icon.componentName}Icon from './${icon.componentName}Icon.vue'`
  ).join('\n');
  
  const exports = icons.map(icon => 
    `  ${icon.componentName}Icon`
  ).join(',\n');

  if (typescript) {
    return `${imports}
import type { DefineComponent } from 'vue'

export {
${exports}
}

export type IconComponent = DefineComponent<{}, {}, any>
`;
  }

  return `${imports}

export {
${exports}
}
`;
}

export async function generateVue2Components(options: GeneratorOptions): Promise<void> {
  const { icons, config } = options;
  const outputDir = config.outputDir;

  await fs.ensureDir(outputDir);

  // Generate individual component files
  for (const icon of icons) {
    const fileName = `${icon.componentName}Icon.vue`;
    const filePath = path.join(outputDir, fileName);
    const content = config.typescript 
      ? generateVue2TypeScript(icon) 
      : generateVue2Component(icon);
    
    await fs.writeFile(filePath, content, 'utf-8');
  }

  // Generate index file
  const indexContent = generateIndexFile(icons, config.typescript ?? false);
  const indexPath = path.join(outputDir, config.typescript ? 'index.ts' : 'index.js');
  await fs.writeFile(indexPath, indexContent, 'utf-8');

  // Generate package.json for the icon library
  const packageJson = {
    name: '@ldesign/icons-vue2',
    version: '1.0.0',
    description: 'Vue 2 icon components',
    main: config.typescript ? 'index.ts' : 'index.js',
    peerDependencies: {
      vue: '^2.6.0 || ^2.7.0'
    }
  };

  await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
}
