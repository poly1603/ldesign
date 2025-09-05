import path from 'path';
import fs from 'fs-extra';
import type { GeneratorOptions, SVGInfo } from '../types';

function generateReactComponent(svg: SVGInfo): string {
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
  
  // Convert SVG content to JSX
  const jsxContent = innerContent
    .replace(/class=/g, 'className=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=');

  return `import React from 'react';

const ${svg.componentName}Icon = ({ size = '1em', color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="${viewBox}"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    ${jsxContent}
  </svg>
);

${svg.componentName}Icon.displayName = '${svg.componentName}Icon';

export default ${svg.componentName}Icon;
`;
}

function generateReactTypeScript(svg: SVGInfo): string {
  const svgContent = svg.optimizedContent || svg.content;
  const svgMatch = svgContent.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!svgMatch) return '';
  
  const [, attrs, innerContent] = svgMatch;
  
  const attrsObj: Record<string, string> = {};
  const attrRegex = /(\w+(?:-\w+)?)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(attrs)) !== null) {
    attrsObj[match[1]] = match[2];
  }
  
  const viewBox = attrsObj.viewBox || attrsObj['viewBox'] || '0 0 24 24';
  
  // Convert SVG content to JSX
  const jsxContent = innerContent
    .replace(/class=/g, 'className=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=');

  return `import React from 'react';

export interface ${svg.componentName}IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
}

const ${svg.componentName}Icon: React.FC<${svg.componentName}IconProps> = ({ 
  size = '1em', 
  color = 'currentColor', 
  ...props 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="${viewBox}"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    ${jsxContent}
  </svg>
);

${svg.componentName}Icon.displayName = '${svg.componentName}Icon';

export default ${svg.componentName}Icon;
`;
}

function generateIndexFile(icons: SVGInfo[], typescript: boolean): string {
  const ext = typescript ? '.tsx' : '.jsx';
  
  const imports = icons.map(icon => 
    `export { default as ${icon.componentName}Icon } from './${icon.componentName}Icon${ext}';`
  ).join('\n');
  
  if (typescript) {
    const typeExports = icons.map(icon => 
      `export type { ${icon.componentName}IconProps } from './${icon.componentName}Icon${ext}';`
    ).join('\n');
    
    return `${imports}
${typeExports}

export type IconProps = {
  size?: string | number;
  color?: string;
} & React.SVGProps<SVGSVGElement>;
`;
  }

  return imports;
}

export async function generateReactComponents(options: GeneratorOptions): Promise<void> {
  const { icons, config } = options;
  const outputDir = config.outputDir;

  await fs.ensureDir(outputDir);

  // Generate individual component files
  for (const icon of icons) {
    const ext = config.typescript ? '.tsx' : '.jsx';
    const fileName = `${icon.componentName}Icon${ext}`;
    const filePath = path.join(outputDir, fileName);
    const content = config.typescript 
      ? generateReactTypeScript(icon) 
      : generateReactComponent(icon);
    
    await fs.writeFile(filePath, content, 'utf-8');
  }

  // Generate index file
  const indexContent = generateIndexFile(icons, config.typescript ?? false);
  const indexExt = config.typescript ? '.ts' : '.js';
  const indexPath = path.join(outputDir, `index${indexExt}`);
  await fs.writeFile(indexPath, indexContent, 'utf-8');

  // Generate package.json for the icon library
  const packageJson = {
    name: '@ldesign/icons-react',
    version: '1.0.0',
    description: 'React icon components',
    main: `index${config.typescript ? '.ts' : '.js'}`,
    module: `index${config.typescript ? '.ts' : '.js'}`,
    peerDependencies: {
      react: '>=16.8.0',
      'react-dom': '>=16.8.0'
    }
  };

  await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
}
