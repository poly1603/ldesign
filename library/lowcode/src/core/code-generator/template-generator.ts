/**
 * 模板代码生成器
 */

import type { LowcodeSchema, ComponentNode, CodeGenContext } from '../../types';
import { GridLayoutEngine } from '../layout/grid-layout';

/**
 * 模板生成器类
 */
export class TemplateGenerator {
  private gridLayout: GridLayoutEngine;

  constructor() {
    this.gridLayout = new GridLayoutEngine();
  }

  /**
   * 生成模板代码
   */
  generate(schema: LowcodeSchema, context: CodeGenContext): string {
    const lines: string[] = [];

    lines.push('<template>');
    lines.push('  <div class="page-container" :style="containerStyle">');

    // 生成组件
    for (const component of schema.components) {
      lines.push(...this.generateComponent(component, 4, context));
    }

    lines.push('  </div>');
    lines.push('</template>');

    return lines.join('\n');
  }

  /**
   * 生成组件代码
   */
  private generateComponent(
    component: ComponentNode,
    indent: number,
    context: CodeGenContext
  ): string[] {
    const lines: string[] = [];
    const indentStr = ' '.repeat(indent);

    // 记录使用的组件
    context.importedComponents.add(component.type);

    // 生成包装 div（用于应用布局样式）
    const layoutStyle = this.gridLayout.generateComponentStyle(component.layout);
    const styleStr = this.styleToString(layoutStyle);

    lines.push(`${indentStr}<div :style="${styleStr}">`);

    // 组件标签开始
    let tag = `${indentStr}  <${component.type}`;

    // 添加 ID 属性（用于编辑器识别）
    if (context.options.comments) {
      tag += ` data-component-id="${component.id}"`;
    }

    // 生成属性
    const props = this.generateProps(component, context);
    if (props) {
      tag += ' ' + props;
    }

    // 生成事件
    const events = this.generateEvents(component, context);
    if (events) {
      tag += ' ' + events;
    }

    // 判断是否有子组件或插槽
    if (component.children.length > 0 || Object.keys(component.slots || {}).length > 0) {
      tag += '>';
      lines.push(tag);

      // 子组件
      for (const child of component.children) {
        lines.push(...this.generateComponent(child, indent + 4, context));
      }

      // 插槽
      if (component.slots) {
        for (const [slotName, slotContent] of Object.entries(component.slots)) {
          if (slotName === 'default') {
            for (const child of slotContent) {
              lines.push(...this.generateComponent(child, indent + 4, context));
            }
          } else {
            lines.push(`${indentStr}    <template #${slotName}>`);
            for (const child of slotContent) {
              lines.push(...this.generateComponent(child, indent + 6, context));
            }
            lines.push(`${indentStr}    </template>`);
          }
        }
      }

      lines.push(`${indentStr}  </${component.type}>`);
    } else {
      // 自闭合标签
      tag += ' />';
      lines.push(tag);
    }

    lines.push(`${indentStr}</div>`);

    return lines;
  }

  /**
   * 生成属性
   */
  private generateProps(component: ComponentNode, context: CodeGenContext): string {
    const props: string[] = [];

    for (const [key, value] of Object.entries(component.props)) {
      // 检查是否有数据绑定
      const binding = component.dataBinding?.[key];

      if (binding) {
        // 数据绑定
        if (binding.type === 'variable') {
          props.push(`:${key}="${binding.source}${binding.path ? '.' + binding.path : ''}"`);
          context.usedVariables.add(binding.source || '');
        } else if (binding.type === 'expression') {
          props.push(`:${key}="${binding.expression}"`);
        } else if (binding.type === 'datasource') {
          props.push(`:${key}="${binding.source}Data${binding.path ? '.' + binding.path : ''}"`);
        }
      } else {
        // 静态值
        if (typeof value === 'string') {
          props.push(`${key}="${this.escapeHtml(value)}"`);
        } else if (typeof value === 'boolean') {
          if (value) {
            props.push(key);
          }
        } else {
          props.push(`:${key}="${JSON.stringify(value)}"`);
        }
      }
    }

    return props.join(' ');
  }

  /**
   * 生成事件
   */
  private generateEvents(component: ComponentNode, context: CodeGenContext): string {
    const events: string[] = [];

    for (const [eventName, handler] of Object.entries(component.events)) {
      if (handler.type === 'method') {
        events.push(`@${eventName}="${handler.value}"`);
      } else if (handler.type === 'code') {
        events.push(`@${eventName}="${handler.value}"`);
      }
    }

    return events.join(' ');
  }

  /**
   * 样式对象转字符串
   */
  private styleToString(style: Record<string, any>): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(style)) {
      if (value !== undefined) {
        const kebabKey = this.camelToKebab(key);
        parts.push(`${kebabKey}: ${value}`);
      }
    }
    return `{ ${parts.join(', ')} }`;
  }

  /**
   * 驼峰转短横线
   */
  private camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * 转义 HTML
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}



