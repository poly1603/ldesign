import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import camelCase from 'camelcase';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function generateComponents() {
  console.log(chalk.blue('🎨 Generating icon components...'));

  // Read manifest
  const manifestPath = path.resolve(ROOT_DIR, 'packages/icons-svg/src/manifest.json');
  if (!await fs.pathExists(manifestPath)) {
    console.error(chalk.red('❌ Manifest not found. Run "npm run build:svg" first.'));
    process.exit(1);
  }

  const manifest = await fs.readJson(manifestPath);

  // Generate components for each framework
  await generateVue3Components(manifest);
  await generateReactComponents(manifest);
  await generateVue2Components(manifest);
  await generateLitComponents(manifest);

  console.log(chalk.green('✅ All components generated successfully!'));
}

async function generateVue3Components(manifest) {
  const outputDir = path.resolve(ROOT_DIR, 'packages/icons-vue/src');
  await fs.ensureDir(outputDir);

  // Generate individual icon components
  for (const icon of manifest) {
    const svgPath = `../../icons-svg/src/svg/${icon.name}.svg`;
    const svgContent = await fs.readFile(path.resolve(ROOT_DIR, 'packages/icons-svg/src/svg', `${icon.name}.svg`), 'utf-8');
    
    const componentContent = `import { defineComponent, h, type PropType } from 'vue';

const svgContent = \`${svgContent.replace(/`/g, '\\`')}\`;

export default defineComponent({
  name: '${icon.componentName}Icon',
  props: {
    size: {
      type: [String, Number] as PropType<string | number>,
      default: '1em'
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: [String, Number] as PropType<string | number>,
      default: 2
    },
    spin: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { attrs }) {
    return () => {
      return h('span', {
        ...attrs,
        innerHTML: svgContent
          .replace(/width="[^"]*"/, \`width="\${props.size}"\`)
          .replace(/height="[^"]*"/, \`height="\${props.size}"\`)
          .replace(/stroke="[^"]*"/g, \`stroke="\${props.color}"\`)
          .replace(/fill="[^"]*"/g, \`fill="\${props.color}"\`)
          .replace(/stroke-width="[^"]*"/g, \`stroke-width="\${props.strokeWidth}"\`),
        class: [attrs.class, { 'ld-icon-spin': props.spin }],
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...attrs.style as any
        }
      });
    };
  }
});
`;
    await fs.writeFile(
      path.resolve(outputDir, `${icon.componentName}Icon.ts`),
      componentContent
    );
  }

  // Generate index file
  const indexContent = generateVueIndex(manifest);
  await fs.writeFile(path.resolve(outputDir, 'index.ts'), indexContent);

  // Generate style file
  const styleContent = `.ld-icon-spin {
  animation: ld-icon-spin 1s linear infinite;
}

@keyframes ld-icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
  await fs.writeFile(path.resolve(outputDir, 'style.css'), styleContent);

  console.log(chalk.gray('  ✓ Vue 3 components generated'));
}

async function generateReactComponents(manifest) {
  const outputDir = path.resolve(ROOT_DIR, 'packages/icons-react/src');
  await fs.ensureDir(outputDir);

  // Generate individual icon components
  for (const icon of manifest) {
    const componentContent = `import React, { forwardRef } from 'react';

export interface ${icon.componentName}IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  spin?: boolean;
}

const ${icon.componentName}Icon = forwardRef<SVGSVGElement, ${icon.componentName}IconProps>(
  ({ size = '1em', color = 'currentColor', strokeWidth = 2, spin = false, className, ...props }, ref) => {
    const classes = [className, spin && 'ld-icon-spin'].filter(Boolean).join(' ');
    
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="${icon.viewBox}"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={classes}
        {...props}
      >
        {/* SVG content will be injected here */}
      </svg>
    );
  }
);

${icon.componentName}Icon.displayName = '${icon.componentName}Icon';

export default ${icon.componentName}Icon;
`;
    await fs.writeFile(
      path.resolve(outputDir, `${icon.componentName}Icon.tsx`),
      componentContent
    );
  }

  // Generate index file
  const indexContent = generateReactIndex(manifest);
  await fs.writeFile(path.resolve(outputDir, 'index.ts'), indexContent);

  // Generate style file
  const styleContent = `.ld-icon-spin {
  animation: ld-icon-spin 1s linear infinite;
}

@keyframes ld-icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
  await fs.writeFile(path.resolve(outputDir, 'style.css'), styleContent);

  console.log(chalk.gray('  ✓ React components generated'));
}

async function generateVue2Components(manifest) {
  const outputDir = path.resolve(ROOT_DIR, 'packages/icons-vue2/src');
  await fs.ensureDir(outputDir);

  // Generate individual icon components for Vue 2 (TypeScript)
  for (const icon of manifest) {
    const svgContent = await fs.readFile(
      path.resolve(ROOT_DIR, 'packages/icons-svg/src/svg', `${icon.name}.svg`),
      'utf-8'
    );

    const componentContent = `import Vue, { CreateElement, VNode } from 'vue';

const rawSvg = \`${svgContent.replace(/`/g, '\\`')}\`;

export interface ${icon.componentName}IconProps {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  spin?: boolean;
}

export default Vue.extend({
  name: '${icon.componentName}Icon',
  inheritAttrs: false,
  props: {
    size: { type: [String, Number], default: '1em' },
    color: { type: String, default: 'currentColor' },
    strokeWidth: { type: [String, Number], default: 2 },
    spin: { type: Boolean, default: false }
  },
  render(this: Vue & ${icon.componentName}IconProps, h: CreateElement): VNode {
    const classes = ['ld-icon', this.spin ? 'ld-icon-spin' : ''].filter(Boolean);
    const html = rawSvg
      .replace(/width=\"[^\"]*\"/g, 'width="' + (typeof this.size === "number" ? String(this.size) : this.size) + '"')
      .replace(/height=\"[^\"]*\"/g, 'height="' + (typeof this.size === "number" ? String(this.size) : this.size) + '"')
      .replace(/stroke=\"[^\"]*\"/g, 'stroke="' + this.color + '"')
      .replace(/fill=\"[^\"]*\"/g, 'fill="' + this.color + '"')
      .replace(/stroke-width=\"[^\"]*\"/g, 'stroke-width="' + String(this.strokeWidth) + '"');

    const style: Record<string, any> = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: typeof this.size === 'number' ? (this.size + 'px') : this.size,
      height: typeof this.size === 'number' ? (this.size + 'px') : this.size
    };

    return h('span', {
      class: classes,
      style,
      domProps: { innerHTML: html },
      attrs: this.$attrs
    });
  }
});
`;

    await fs.writeFile(
      path.resolve(outputDir, `${icon.componentName}Icon.ts`),
      componentContent
    );
  }

  // Generate index file
  const indexContent = manifest.map(({ componentName }) => (
    `export { default as ${componentName}Icon } from './${componentName}Icon';`
  )).join('\n');
  await fs.writeFile(path.resolve(outputDir, 'index.ts'), `// Auto-generated file, do not edit directly\n${indexContent}\n`);

  // Generate style file
  const styleContent = `.ld-icon-spin {\n  animation: ld-icon-spin 1s linear infinite;\n}\n@keyframes ld-icon-spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n`;
  await fs.writeFile(path.resolve(outputDir, 'style.css'), styleContent);

  console.log(chalk.gray('  ✓ Vue 2 components generated'));
}

async function generateLitComponents(manifest) {
  const outputDir = path.resolve(ROOT_DIR, 'packages/icons-lit/src');
  await fs.ensureDir(outputDir);

  // Generate Lit Web Components
  for (const icon of manifest) {
    const kebabName = icon.name.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
    const componentContent = `import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ld-${kebabName}-icon')
export class ${icon.componentName}Icon extends LitElement {
  static styles = css\`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    svg {
      width: var(--ld-icon-size, 1em);
      height: var(--ld-icon-size, 1em);
    }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  \`;

  @property({ type: String }) size = '1em';
  @property({ type: String }) color = 'currentColor';
  @property({ type: Number }) strokeWidth = 2;
  @property({ type: Boolean }) spin = false;

  render() {
    return html\`
      <svg
        width="\${this.size}"
        height="\${this.size}"
        viewBox="${icon.viewBox}"
        fill="none"
        stroke="\${this.color}"
        stroke-width="\${this.strokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="\${this.spin ? 'spin' : ''}"
        part="svg"
      >
        <!-- SVG content -->
      </svg>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ld-${kebabName}-icon': ${icon.componentName}Icon;
  }
}
`;
    await fs.writeFile(
      path.resolve(outputDir, `${icon.componentName}Icon.ts`),
      componentContent
    );
  }

  // Generate index file
  const indexContent = generateLitIndex(manifest);
  await fs.writeFile(path.resolve(outputDir, 'index.ts'), indexContent);

  console.log(chalk.gray('  ✓ Lit components generated'));
}

function generateVueIndex(manifest) {
  const imports = manifest.map(({ componentName }) =>
    `export { default as ${componentName}Icon } from './${componentName}Icon';`
  ).join('\n');

  return `// Auto-generated file, do not edit directly
${imports}

export type { IconName, IconComponentName } from '@ldesign/icons-svg';

// Note: Import style separately if needed
// import './style.css';
`;
}

function generateReactIndex(manifest) {
  const exports = manifest.map(({ componentName }) =>
    `export { default as ${componentName}Icon } from './${componentName}Icon';
export type { ${componentName}IconProps } from './${componentName}Icon';`
  ).join('\n');

  return `// Auto-generated file, do not edit directly
${exports}

export type { IconName, IconComponentName } from '@ldesign/icons-svg';

// Export style
import './style.css';
`;
}

function generateLitIndex(manifest) {
  const imports = manifest.map(({ componentName }) =>
    `export { ${componentName}Icon } from './${componentName}Icon';`
  ).join('\n');

  return `// Auto-generated file, do not edit directly
${imports}

export type { IconName, IconComponentName } from '@ldesign/icons-svg';
`;
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateComponents().catch(console.error);
}

export default generateComponents;
