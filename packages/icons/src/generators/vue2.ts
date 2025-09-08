import path from 'path';
import fs from 'fs-extra';
import type { GeneratorOptions, SVGElement, SVGInfo } from '../types';
import { SVGParser } from '../utils/parser';

/**
 * 生成 Vue 2（TS）组件源码（使用 render 函数，避免 .vue SFC 依赖）
 */
function generateVue2TsComponent(svg: SVGInfo, config: any): string {
  const parsed = svg.parsed || SVGParser.parse(svg.optimizedContent || svg.content);
  const componentName = `${svg.componentName}Icon`;
  const viewBox = (parsed.attributes.viewBox as string) || '0 0 24 24';

  const propsSection = `props: {
    size: { type: [String, Number], default: '${config.componentProps?.defaultSize || '1em'}' },
    color: { type: String, default: '${config.componentProps?.defaultColor || 'currentColor'}' },
    strokeWidth: { type: [String, Number], default: 2 },
    ${config.componentProps?.customClass ? `class: { type: [String, Array, Object], default: undefined },` : ''}
    ${config.componentProps?.customStyle ? `style: { type: [String, Object], default: undefined },` : ''}
    ${config.features?.animation ? `spin: { type: Boolean, default: false },` : ''}
  },`;

  const genAttrs = (attrs: Record<string, any>): string => {
    // 过滤 fill/stroke 由组件控制
    const entries = Object.entries(attrs).filter(([k]) => k !== 'fill' && k !== 'stroke');
    return entries.map(([k, v]) => `'${k}': ${typeof v === 'string' ? `'${v}'` : v}`).join(', ');
  };

  const genElements = (elements: SVGElement[]): string => {
    return elements.map((el) => {
      const children = el.children || [];
      const hasChildren = children.length > 0;
      const text = el.textContent ? `, '${el.textContent.replace(/'/g, "\\'")}'` : '';
      const attrs = genAttrs(el.attributes || {});
      return `h('${el.tag}', { attrs: { ${attrs} } }${hasChildren ? `, [${genElements(children)}]` : text})`;
    }).join(', ');
  };

  return `import Vue, { CreateElement, VNode } from 'vue';

export interface ${componentName}Props {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
  ${config.features?.animation ? 'spin?: boolean;' : ''}
  ${config.componentProps?.customClass ? 'class?: string | string[] | Record<string, boolean>;' : ''}
  ${config.componentProps?.customStyle ? 'style?: string | Record<string, any>;' : ''}
}

export default Vue.extend({
  name: '${componentName}',
  inheritAttrs: false,
  ${propsSection}
  render(this: Vue & ${componentName}Props, h: CreateElement): VNode {
    const classes: any[] = ['ld-icon'];
    ${config.features?.animation ? 'if (this.spin) classes.push("ld-icon--spin");' : ''}

    const style: Record<string, any> = {
      width: typeof this.size === 'number' ? (this.size + 'px') : this.size,
      height: typeof this.size === 'number' ? (this.size + 'px') : this.size,
      display: 'inline-block',
      verticalAlign: 'middle'
    };
    ${config.componentProps?.customStyle ? 'if (this.style && typeof this.style === "object") Object.assign(style, this.style);' : ''}

    return h(
      'svg',
      {
        class: classes,
        style,
        attrs: {
          viewBox: '${viewBox}',
          fill: 'none',
          stroke: this.color,
          'stroke-width': this.strokeWidth,
          xmlns: 'http://www.w3.org/2000/svg',
          'aria-hidden': 'true',
          focusable: 'false',
          ...this.$attrs
        }
      },
      [${genElements(parsed.children)}]
    );
  }
});`;
}

function generateIndexFile(icons: SVGInfo[], typescript: boolean): string {
  const ext = typescript ? '.ts' : '.js';
  const lines: string[] = [];
  for (const icon of icons) {
    lines.push(`export { default as ${icon.componentName}Icon } from './${icon.componentName}Icon${ext}';`);
  }
  if (typescript) {
    lines.push('');
    lines.push('export type {');
    lines.push(...icons.map(i => `  ${i.componentName}IconProps`));
    lines.push('} from "./types"');
  }
  return `// Auto-generated Vue 2 icon components\n${lines.join('\n')}\n`;
}

export async function generateVue2Components(options: GeneratorOptions): Promise<void> {
  const { icons, config } = options;
  const outputDir = config.outputDir;
  await fs.ensureDir(outputDir);

  for (const icon of icons) {
    const fileName = `${icon.componentName}Icon${config.typescript ? '.ts' : '.js'}`;
    const content = generateVue2TsComponent(icon, config);
    await fs.writeFile(path.join(outputDir, fileName), content, 'utf-8');
  }

  const indexContent = generateIndexFile(icons, config.typescript ?? false);
  await fs.writeFile(path.join(outputDir, config.typescript ? 'index.ts' : 'index.js'), indexContent, 'utf-8');

  // 样式（可选，仅当需要动画时写入）
  if (config.features?.animation) {
    const css = `/* Vue 2 Icon Components Styles */\n.ld-icon--spin { animation: ld-icon-spin 1s linear infinite; }\n@keyframes ld-icon-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n`;
    await fs.writeFile(path.join(outputDir, 'style.css'), css, 'utf-8');
  }
}
