import path from 'path';
import fs from 'fs-extra';
import type { GeneratorOptions, SVGInfo } from '../types';

function generateLitComponent(svg: SVGInfo): string {
  const svgContent = svg.optimizedContent || svg.content;
  // Extract SVG attributes and content
  const svgMatch = svgContent.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!svgMatch) return '';
  
  const [, attrs, innerContent] = svgMatch;
  
  // Parse attributes
  const attrsObj: Record<string, string> = {};
  const attrRegex = /(\w+(?:-\w+)?)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(attrs)) !== null) {
    attrsObj[match[1]] = match[2];
  }
  
  const viewBox = attrsObj.viewBox || attrsObj['viewBox'] || '0 0 24 24';
  const kebabName = svg.componentName.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);

  return `import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('${kebabName}-icon')
export class ${svg.componentName}Icon extends LitElement {
  static styles = css\`
    :host {
      display: inline-block;
      width: var(--icon-size, 1em);
      height: var(--icon-size, 1em);
    }
    svg {
      width: 100%;
      height: 100%;
    }
  \`;

  @property({ type: String }) size = '1em';
  @property({ type: String }) color = 'currentColor';

  render() {
    return html\`
      <svg
        style="width: \${this.size}; height: \${this.size};"
        viewBox="${viewBox}"
        fill="\${this.color}"
        xmlns="http://www.w3.org/2000/svg"
        part="icon"
      >
        ${innerContent}
      </svg>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    '${kebabName}-icon': ${svg.componentName}Icon;
  }
}
`;
}

function generateLitTypeScript(svg: SVGInfo): string {
  // For Lit, TypeScript version is the same as JavaScript version
  // since we're already using TypeScript decorators
  return generateLitComponent(svg);
}

function generateIndexFile(icons: SVGInfo[], typescript: boolean): string {
  const imports = icons.map(icon => {
    const kebabName = icon.componentName.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
    return `export { ${icon.componentName}Icon } from './${icon.componentName}Icon${typescript ? '.ts' : '.js'}';`;
  }).join('\n');
  
  const registrations = icons.map(icon => {
    const kebabName = icon.componentName.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
    return `  '${kebabName}-icon': typeof import('./${icon.componentName}Icon${typescript ? '.ts' : '.js'}').${icon.componentName}Icon;`;
  }).join('\n');

  if (typescript) {
    return `${imports}

// Re-export all icon classes
export * from './types';

// Augment global HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
${registrations}
  }
}
`;
  }

  return `${imports}

// Register all web components
import './register.js';
`;
}

function generateRegisterFile(icons: SVGInfo[]): string {
  const imports = icons.map(icon => 
    `import './${icon.componentName}Icon.js';`
  ).join('\n');
  
  return `// Auto-register all web components
${imports}

console.log('All icon web components have been registered');
`;
}

function generateTypesFile(): string {
  return `import { LitElement } from 'lit';

export interface IconProps {
  size?: string;
  color?: string;
}

export type IconElement = LitElement & IconProps;
`;
}

export async function generateLitComponents(options: GeneratorOptions): Promise<void> {
  const { icons, config } = options;
  const outputDir = config.outputDir;

  await fs.ensureDir(outputDir);

  // Generate individual component files
  for (const icon of icons) {
    const ext = config.typescript ? '.ts' : '.js';
    const fileName = `${icon.componentName}Icon${ext}`;
    const filePath = path.join(outputDir, fileName);
    const content = config.typescript 
      ? generateLitTypeScript(icon) 
      : generateLitComponent(icon);
    
    await fs.writeFile(filePath, content, 'utf-8');
  }

  // Generate index file
  const indexContent = generateIndexFile(icons, config.typescript ?? false);
  const indexPath = path.join(outputDir, config.typescript ? 'index.ts' : 'index.js');
  await fs.writeFile(indexPath, indexContent, 'utf-8');

  // Generate types file if TypeScript
  if (config.typescript) {
    const typesContent = generateTypesFile();
    await fs.writeFile(path.join(outputDir, 'types.ts'), typesContent, 'utf-8');
  } else {
    // Generate register file for JavaScript
    const registerContent = generateRegisterFile(icons);
    await fs.writeFile(path.join(outputDir, 'register.js'), registerContent, 'utf-8');
  }

  // Generate package.json for the icon library
  const packageJson = {
    name: '@ldesign/icons-lit',
    version: '1.0.0',
    description: 'Lit Web Component icons',
    main: config.typescript ? 'index.ts' : 'index.js',
    module: config.typescript ? 'index.ts' : 'index.js',
    type: 'module',
    dependencies: {
      lit: '^3.0.0'
    }
  };

  await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
}
