import path from 'path';
import fs from 'fs-extra';
import type { GeneratorOptions, SVGInfo, SVGElement } from '../types';
import { SVGParser } from '../utils/parser';

/**
 * Vue 3 组件生成器
 * 生成高质量的 Vue 3 图标组件
 */
export class Vue3Generator {
  /**
   * 生成 Vue 3 组件代码
   * @param svg SVG 信息
   * @param options 生成选项
   * @returns 组件代码
   */
  static generateComponent(svg: SVGInfo, options: GeneratorOptions): string {
    const { config } = options;
    const parsed = svg.parsed || SVGParser.parse(svg.optimizedContent || svg.content);

    const componentName = svg.componentName;
    const viewBox = parsed.attributes.viewBox as string || '0 0 24 24';

    if (config.typescript) {
      return this.generateTypeScriptComponent(componentName, parsed, viewBox, config, svg);
    } else {
      return this.generateJavaScriptComponent(componentName, parsed, viewBox, config, svg);
    }
  }

  /**
   * 生成 TypeScript 组件
   */
  private static generateTypeScriptComponent(
    componentName: string,
    parsed: any,
    viewBox: string,
    config: any,
    svg: any
  ): string {
    const propsInterface = this.generatePropsInterface(componentName, config);
    const setupFunction = this.generateSetupFunction(parsed, viewBox, config);

    return `import { defineComponent, h, computed, type PropType } from 'vue';
${config.features?.theming ? "import { useTheme } from './composables/useTheme';" : ''}

${propsInterface}

/**
 * ${componentName} 图标组件
 * @description ${svg.description || `${componentName} 图标`}
 */
export default defineComponent({
  name: '${componentName}',
  props: {
    size: {
      type: [String, Number] as PropType<string | number>,
      default: '${config.componentProps?.defaultSize || '1em'}'
    },
    color: {
      type: String,
      default: '${config.componentProps?.defaultColor || 'currentColor'}'
    },
    ${config.features?.animation ? `spin: {
      type: Boolean,
      default: false
    },
    pulse: {
      type: Boolean,
      default: false
    },` : ''}
    ${config.features?.theming ? `theme: {
      type: String as PropType<'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'>,
      default: undefined
    },` : ''}
    strokeWidth: {
      type: [String, Number] as PropType<string | number>,
      default: 2
    }${config.componentProps?.customClass ? `,
    class: {
      type: [String, Array, Object],
      default: undefined
    }` : ''}${config.componentProps?.customStyle ? `,
    style: {
      type: [String, Object],
      default: undefined
    }` : ''}
  },
  ${setupFunction}
});`;
  }

  /**
   * 生成 JavaScript 组件
   */
  private static generateJavaScriptComponent(
    componentName: string,
    parsed: any,
    viewBox: string,
    config: any,
    svg: any
  ): string {
    const setupFunction = this.generateSetupFunction(parsed, viewBox, config);

    return `import { defineComponent, h, computed } from 'vue';
${config.features?.theming ? "import { useTheme } from './composables/useTheme';" : ''}

/**
 * ${componentName} 图标组件
 */
export default defineComponent({
  name: '${componentName}',
  props: {
    size: {
      type: [String, Number],
      default: '${config.componentProps?.defaultSize || '1em'}'
    },
    color: {
      type: String,
      default: '${config.componentProps?.defaultColor || 'currentColor'}'
    },
    ${config.features?.animation ? `spin: {
      type: Boolean,
      default: false
    },
    pulse: {
      type: Boolean,
      default: false
    },` : ''}
    ${config.features?.theming ? `theme: {
      type: String,
      default: undefined
    },` : ''}
    strokeWidth: {
      type: [String, Number],
      default: 2
    }${config.componentProps?.customClass ? `,
    class: {
      type: [String, Array, Object],
      default: undefined
    }` : ''}${config.componentProps?.customStyle ? `,
    style: {
      type: [String, Object],
      default: undefined
    }` : ''}
  },
  ${setupFunction}
});`;
  }

  /**
   * 生成 Props 接口
   */
  private static generatePropsInterface(componentName: string, config: any): string {
    return `export interface ${componentName}Props {
  /** 图标尺寸 */
  size?: string | number;
  /** 图标颜色 */
  color?: string;
  ${config.features?.animation ? `/** 是否旋转动画 */
  spin?: boolean;
  /** 是否脉冲动画 */
  pulse?: boolean;` : ''}
  ${config.features?.theming ? `/** 主题色彩 */
  theme?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';` : ''}
  /** 描边宽度 */
  strokeWidth?: string | number;
  ${config.componentProps?.customClass ? `/** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;` : ''}
  ${config.componentProps?.customStyle ? `/** 自定义样式 */
  style?: string | Record<string, any>;` : ''}
}`;
  }

  /**
   * 生成 setup 函数
   */
  private static generateSetupFunction(parsed: any, viewBox: string, config: any): string {
    return `setup(props, { attrs }) {
    ${config.features?.theming ? 'const { getThemeColor } = useTheme();' : ''}

    const computedColor = computed(() => {
      ${config.features?.theming ? `
      if (props.theme) {
        return getThemeColor(props.theme);
      }` : ''}
      return props.color;
    });

    const computedClass = computed(() => {
      const classes: string[] = ['ld-icon'];

      ${config.features?.animation ? `
      if (props.spin) classes.push('ld-icon--spin');
      if (props.pulse) classes.push('ld-icon--pulse');` : ''}

      if (props.class) {
        if (typeof props.class === 'string') {
          classes.push(props.class);
        } else if (Array.isArray(props.class)) {
          classes.push(...props.class);
        } else {
          Object.entries(props.class).forEach(([key, value]) => {
            if (value) classes.push(key);
          });
        }
      }

      return classes.join(' ');
    });

    const computedStyle = computed(() => {
      const styles: Record<string, any> = {
        width: typeof props.size === 'number' ? \`\${props.size}px\` : props.size,
        height: typeof props.size === 'number' ? \`\${props.size}px\` : props.size,
        display: 'inline-block',
        verticalAlign: 'middle'
      };

      if (props.style) {
        if (typeof props.style === 'string') {
          return [styles, props.style].join(';');
        } else {
          Object.assign(styles, props.style);
        }
      }

      return styles;
    });

    return () => h(
      'svg',
      {
        class: computedClass.value,
        style: computedStyle.value,
        viewBox: '${viewBox}',
        fill: 'none',
        stroke: computedColor.value,
        strokeWidth: props.strokeWidth,
        xmlns: 'http://www.w3.org/2000/svg',
        'aria-hidden': 'true',
        focusable: 'false',
        ...attrs
      },
      [
        ${this.generateSvgElements(parsed.children)}
      ]
    );
  }`;
  }

  /**
   * 生成 SVG 子元素
   */
  private static generateSvgElements(elements: SVGElement[]): string {
    return elements.map(element => this.generateSvgElement(element)).join(',\n        ');
  }

  /**
   * 生成单个 SVG 元素
   */
  private static generateSvgElement(element: SVGElement): string {
    const attributes = this.formatAttributes(element.attributes);

    if (element.children && element.children.length > 0) {
      const children = this.generateSvgElements(element.children);
      return `h('${element.tag}', { ${attributes} }, [
          ${children}
        ])`;
    } else if (element.textContent) {
      return `h('${element.tag}', { ${attributes} }, '${element.textContent}')`;
    } else {
      return `h('${element.tag}', { ${attributes} })`;
    }
  }

  /**
   * 格式化属性
   */
  private static formatAttributes(attributes: Record<string, any>): string {
    return Object.entries(attributes)
      .filter(([key]) => key !== 'fill' && key !== 'stroke') // 这些由组件控制
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `'${key}': '${value}'`;
        } else {
          return `'${key}': ${value}`;
        }
      })
      .join(', ');
  }
}

/**
 * 生成索引文件
 */
export function generateIndexFile(icons: SVGInfo[], config: any): string {
  const ext = config.typescript ? '.ts' : '.js';

  const imports = icons.map(icon => {
    const componentName = icon.componentName;
    return `export { default as ${componentName} } from './${componentName}${ext}';`;
  }).join('\n');

  const typeExports = config.typescript ? icons.map(icon => {
    const componentName = icon.componentName;
    return `export type { ${componentName}Props } from './${componentName}${ext}';`;
  }).join('\n') : '';

  const content = `// Auto-generated Vue 3 icon components
// Do not edit this file directly

${imports}
${typeExports ? '\n' + typeExports : ''}

${config.typescript ? `
// Common types
export interface IconProps {
  size?: string | number;
  color?: string;
  ${config.features?.animation ? `spin?: boolean;
  pulse?: boolean;` : ''}
  ${config.features?.theming ? `theme?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';` : ''}
  strokeWidth?: string | number;
  ${config.componentProps?.customClass ? `class?: string | string[] | Record<string, boolean>;` : ''}
  ${config.componentProps?.customStyle ? `style?: string | Record<string, any>;` : ''}
}

export type IconComponent = DefineComponent<IconProps>;
` : ''}

${config.typescript ? `
// Icon names type
export type IconName = ${icons.length > 0 ? icons.map(icon => `'${icon.name}'`).join(' | ') : 'never'};

// Component names type
export type ComponentName = ${icons.length > 0 ? icons.map(icon => `'${icon.componentName}'`).join(' | ') : 'never'};
` : ''}
`;

  return content;
}

/**
 * 生成样式文件
 */
export function generateStyleFile(config: any): string {
  return `/* Vue 3 Icon Components Styles */

.ld-icon {
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
}

${config.features?.animation ? `
/* Animation styles */
.ld-icon--spin {
  animation: ld-icon-spin 1s linear infinite;
}

.ld-icon--pulse {
  animation: ld-icon-pulse 2s ease-in-out infinite;
}

@keyframes ld-icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ld-icon-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
` : ''}

${config.features?.theming ? `
/* Theme colors */
.ld-icon--primary {
  color: var(--ld-color-primary, ${config.theme?.primary || '#722ED1'});
}

.ld-icon--secondary {
  color: var(--ld-color-secondary, ${config.theme?.secondary || '#8C5AD3'});
}

.ld-icon--success {
  color: var(--ld-color-success, ${config.theme?.success || '#42BD42'});
}

.ld-icon--warning {
  color: var(--ld-color-warning, ${config.theme?.warning || '#F0B80F'});
}

.ld-icon--error {
  color: var(--ld-color-error, ${config.theme?.error || '#DD2222'});
}

.ld-icon--info {
  color: var(--ld-color-info, ${config.theme?.info || '#1890FF'});
}
` : ''}

/* Size presets */
${Object.entries(config.sizes || {}).map(([size, value]) =>
    `.ld-icon--${size} { width: ${value}; height: ${value}; }`
  ).join('\n')}
`;
}

/**
 * 生成 Composables
 */
export function generateComposables(config: any): string {
  if (!config.features?.theming) return '';

  return `import { computed, inject, type InjectionKey, type Ref } from 'vue';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  custom?: Record<string, string>;
}

export const ThemeConfigKey: InjectionKey<Ref<ThemeConfig>> = Symbol('ThemeConfig');

export function useTheme() {
  const themeConfig = inject(ThemeConfigKey);

  const defaultTheme: ThemeConfig = {
    primary: '${config.theme?.primary || '#722ED1'}',
    secondary: '${config.theme?.secondary || '#8C5AD3'}',
    success: '${config.theme?.success || '#42BD42'}',
    warning: '${config.theme?.warning || '#F0B80F'}',
    error: '${config.theme?.error || '#DD2222'}',
    info: '${config.theme?.info || '#1890FF'}',
    custom: ${JSON.stringify(config.theme?.custom || {})}
  };

  const currentTheme = computed(() => themeConfig?.value || defaultTheme);

  const getThemeColor = (colorName: keyof ThemeConfig | string): string => {
    const theme = currentTheme.value;

    if (colorName in theme) {
      return theme[colorName as keyof ThemeConfig] as string;
    }

    if (theme.custom && colorName in theme.custom) {
      return theme.custom[colorName];
    }

    return colorName; // 返回原始值作为后备
  };

  return {
    currentTheme,
    getThemeColor
  };
}`;
}

/**
 * 主要的 Vue 3 组件生成函数
 */
export async function generateVue3Components(options: GeneratorOptions): Promise<void> {
  const { icons, config } = options;
  const outputDir = config.outputDir;

  await fs.ensureDir(outputDir);

  // Generate individual component files
  for (const icon of icons) {
    const ext = config.typescript ? '.ts' : '.js';
    const componentName = icon.componentName;
    const fileName = `${componentName}${ext}`;
    const filePath = path.join(outputDir, fileName);
    const content = Vue3Generator.generateComponent(icon, options);

    await fs.writeFile(filePath, content, 'utf-8');
  }

  // Generate index file
  const indexContent = generateIndexFile(icons, config);
  const indexPath = path.join(outputDir, config.typescript ? 'index.ts' : 'index.js');
  await fs.writeFile(indexPath, indexContent, 'utf-8');

  // Generate style file
  if (config.features?.animation || config.features?.theming) {
    const styleContent = generateStyleFile(config);
    await fs.writeFile(path.join(outputDir, 'style.css'), styleContent, 'utf-8');
  }

  // Generate composables
  if (config.features?.theming) {
    const composablesDir = path.join(outputDir, 'composables');
    await fs.ensureDir(composablesDir);
    const composablesContent = generateComposables(config);
    const composablesPath = path.join(composablesDir, config.typescript ? 'useTheme.ts' : 'useTheme.js');
    await fs.writeFile(composablesPath, composablesContent, 'utf-8');
  }

  // Generate package.json
  const packageJson = {
    name: config.packageName || '@ldesign/icons-vue3',
    version: config.packageVersion || '1.0.0',
    description: config.packageDescription || 'Vue 3 icon components',
    main: config.typescript ? 'index.ts' : 'index.js',
    module: config.typescript ? 'index.ts' : 'index.js',
    types: config.typescript ? 'index.ts' : undefined,
    files: ['*.js', '*.ts', '*.css', 'composables/'],
    peerDependencies: {
      vue: '^3.0.0'
    },
    keywords: ['vue', 'vue3', 'icons', 'svg', 'components', 'ldesign'],
    sideEffects: false
  };

  await fs.writeJson(path.join(outputDir, 'package.json'), packageJson, { spaces: 2 });
}
