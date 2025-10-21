/**
 * Options API 代码生成器
 */

import type { LowcodeSchema, CodeGenContext } from '../../types';

/**
 * Options API 生成器类
 */
export class OptionsAPIGenerator {
  /**
   * 生成 Options API 脚本
   */
  generate(schema: LowcodeSchema, context: CodeGenContext): string {
    const lines: string[] = [];
    const { typescript } = context.options;

    // 脚本开始标签
    lines.push(`<script${typescript ? ' lang="ts"' : ''}>`);

    // 导入组件
    if (context.importedComponents.size > 0) {
      const components = Array.from(context.importedComponents);
      lines.push(`import { ${components.join(', ')} } from '@ldesign/form'`);
      lines.push('');
    }

    lines.push('export default {');

    // components
    if (context.importedComponents.size > 0) {
      lines.push('  components: {');
      Array.from(context.importedComponents).forEach(comp => {
        lines.push(`    ${comp},`);
      });
      lines.push('  },');
      lines.push('');
    }

    // data
    lines.push('  data() {');
    lines.push('    return {');

    // 变量
    for (const [name, value] of Object.entries(schema.variables)) {
      const valueStr = JSON.stringify(value);
      lines.push(`      ${name}: ${valueStr},`);
    }

    // 数据源数据
    for (const ds of schema.datasources) {
      lines.push(`      ${ds.id}Data: null,`);
      lines.push(`      ${ds.id}Loading: false,`);
    }

    lines.push('    }');
    lines.push('  },');
    lines.push('');

    // methods
    if (schema.methods.length > 0 || schema.datasources.length > 0) {
      lines.push('  methods: {');

      // 用户定义的方法
      for (const method of schema.methods) {
        const asyncKeyword = method.async ? 'async ' : '';
        const params = method.params ? method.params.join(', ') : '';
        lines.push(`    ${asyncKeyword}${method.name}(${params}) ${method.body},`);
      }

      // 数据源加载方法
      for (const ds of schema.datasources) {
        if (ds.type === 'rest') {
          lines.push(`    async load${this.capitalize(ds.id)}() {`);
          lines.push(`      this.${ds.id}Loading = true`);
          lines.push(`      try {`);
          lines.push(`        const response = await fetch('${ds.config.url}')`);
          lines.push(`        this.${ds.id}Data = await response.json()`);
          lines.push(`      } catch (error) {`);
          lines.push(`        console.error('加载失败:', error)`);
          lines.push(`      } finally {`);
          lines.push(`        this.${ds.id}Loading = false`);
          lines.push(`      }`);
          lines.push(`    },`);
        }
      }

      lines.push('  },');
      lines.push('');
    }

    // mounted
    if (schema.lifecycle?.mounted || schema.datasources.some(ds => ds.autoLoad)) {
      lines.push('  mounted() {');

      if (schema.lifecycle?.mounted) {
        lines.push(`    ${schema.lifecycle.mounted}`);
      }

      for (const ds of schema.datasources) {
        if (ds.autoLoad) {
          lines.push(`    this.load${this.capitalize(ds.id)}()`);
        }
      }

      lines.push('  },');
      lines.push('');
    }

    // 其他生命周期
    const lifecycleHooks = ['created', 'beforeMount', 'updated', 'beforeUnmount', 'unmounted'];
    for (const hook of lifecycleHooks) {
      if (schema.lifecycle?.[hook as keyof typeof schema.lifecycle]) {
        lines.push(`  ${hook}() {`);
        lines.push(`    ${schema.lifecycle[hook as keyof typeof schema.lifecycle]}`);
        lines.push('  },');
        lines.push('');
      }
    }

    lines.push('}');
    lines.push('</script>');

    return lines.join('\n');
  }

  /**
   * 首字母大写
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}



