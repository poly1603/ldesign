import path from 'path';
import fs from 'fs-extra';
import type { GeneratorOptions, SVGInfo } from '../types';

function generateVue3Component(svg: SVGInfo): string {
  const svgContent = svg.optimizedContent || svg.content;
  // Extract SVG attributes and content
  const svgMatch = svgContent.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!svgMatch) return '';
  
  const [, attrs, innerContent] = svgMatch;
  
  // Parse attributes
  const attrsObj: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(attrs)) !== null) {
    attrsObj[match[1]] = match[2];
  }
  
  const width = attrsObj.width || '1em';
  const height = attrsObj.height || '1em';
  const viewBox = attrsObj.viewBox || '0 0 24 24';

  return `import { defineComponent, h } from 'vue'

export default defineComponent({
  name: '${svg.componentName}Icon',
  props: {
    size: {
      type: [String, Number],
      default: '1em'
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  setup(props, { attrs }) {
    return () => h(
      'svg',
      {
        width: props.size,
        height: props.size,
        viewBox: '${viewBox}',
        fill: props.color,
        xmlns: 'http://www.w3.org/2000/svg',
        ...attrs
      },
      [
        ${formatSvgContent(innerContent)}
      ]
    )
  }
})
`;
}

function generateVue3TypeScript(svg: SVGInfo): string {
  const svgContent = svg.optimizedContent || svg.content;
  const svgMatch = svgContent.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!svgMatch) return '';
  
  const [, attrs, innerContent] = svgMatch;
  
  const attrsObj: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(attrs)) !== null) {
    attrsObj[match[1]] = match[2];
  }
  
  const viewBox = attrsObj.viewBox || '0 0 24 24';

  return `import { defineComponent, h, type PropType } from 'vue'

export default defineComponent({
  name: '${svg.componentName}Icon',
  props: {
    size: {
      type: [String, Number] as PropType<string | number>,
      default: '1em'
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  setup(props, { attrs }) {
    return () => h(
      'svg',
      {
        width: props.size,
        height: props.size,
        viewBox: '${viewBox}',
        fill: props.color,
        xmlns: 'http://www.w3.org/2000/svg',
        ...attrs
      },
      [
        ${formatSvgContent(innerContent)}
      ]
    )
  }
})
`;
}

function formatSvgContent(content: string): string {
  // Convert SVG content to Vue 3 h() function calls
  const elements: string[] = [];
  const elementRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/g;
  let match;
  
  while ((match = elementRegex.exec(content)) !== null) {
    const [, tag, attrs, children] = match;
    const attrObj: Record<string, string> = {};
    const attrRegex = /(\w+)="([^"]*)"/g;
    let attrMatch;
    
    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      let key = attrMatch[1];
      // Convert attribute names to camelCase for Vue
      if (key.includes('-')) {
        key = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      }
      attrObj[key] = attrMatch[2];
    }
    
    const attrString = Object.entries(attrObj)
      .map(([k, v]) => `'${k}': '${v}'`)
      .join(', ');
    
    if (children && children.trim()) {
      elements.push(`h('${tag}', { ${attrString} }, [${formatSvgContent(children)}])`);
    } else {
      elements.push(`h('${tag}', { ${attrString} })`);
    }
  }
  
  return elements.join(',\n        ');
}

function generateIndexFile(icons: SVGInfo[], typescript: boolean): string {
  const imports = icons.map(icon => 
    `import ${icon.componentName}Icon from './${icon.componentName}Icon${typescript ? '.ts' : '.js'}'`
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

export type IconComponent = DefineComponent<{
  size?: string | number
  color?: string
}>
`;
  }

  return `${imports}

export {
${exports}
}
`;
}

export async function generateVue3Components(options: GeneratorOptions): Promise<void> {
  const { icons, config } = options;
  const outputDir = config.outputDir;

  await fs.ensureDir(outputDir);

  // Generate individual component files
  for (const icon of icons) {
    const ext = config.typescript ? '.ts' : '.js';
    const fileName = `${icon.componentName}Icon${ext}`;
    const filePath = path.join(outputDir, fileName);
    const content = config.typescript 
      ? generateVue3TypeScript(icon) 
      : generateVue3Component(icon);
    
    await fs.writeFile(filePath, content, 'utf-8');
  }

  // Generate index file
  const indexContent = generateIndexFile(icons, config.typescript ?? false);
  const indexPath = path.join(outputDir, config.typescript ? 'index.ts' : 'index.js');
  await fs.writeFile(indexPath, indexContent, 'utf-8');

  // Generate package.json for the icon library
  const packageJson = {
    name: '@ldesign/icons-vue3',
    version: '1.0.0',
    description: 'Vue 3 icon components',
    main: config.typescript ? 'index.ts' : 'index.js',
    module: config.typescript ? 'index.ts' : 'index.js',
    peerDependencies: {
      vue: '^3.0.0'
    }
  };

  await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
}
