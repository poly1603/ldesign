/**
 * Composition API 代码生成器
 */

import type { LowcodeSchema, CodeGenContext } from '../../types';

/**
 * Composition API 生成器类
 */
export class CompositionAPIGenerator {
  /**
   * 生成 Composition API 脚本
   */
  generate(schema: LowcodeSchema, context: CodeGenContext): string {
    const lines: string[] = [];
    const { typescript } = context.options;

    // 脚本开始标签
    lines.push(`<script setup${typescript ? ' lang="ts"' : ''}>`);

    // 导入语句
    lines.push("import { ref, computed, onMounted } from 'vue'");

    // 导入组件
    if (context.importedComponents.size > 0) {
      const components = Array.from(context.importedComponents);
      lines.push(`import { ${components.join(', ')} } from '@ldesign/form'`);
    }

    lines.push('');

    // 生成变量
    if (Object.keys(schema.variables).length > 0) {
      lines.push('// 变量定义');
      for (const [name, value] of Object.entries(schema.variables)) {
        const valueStr = JSON.stringify(value);
        lines.push(`const ${name} = ref(${valueStr})`);
      }
      lines.push('');
    }

    // 生成数据源相关代码
    if (schema.datasources.length > 0) {
      lines.push('// 数据源');
      for (const ds of schema.datasources) {
        lines.push(`const ${ds.id}Data = ref(null)`);
        lines.push(`const ${ds.id}Loading = ref(false)`);
      }
      lines.push('');
    }

    // 生成方法
    if (schema.methods.length > 0) {
      lines.push('// 方法定义');
      for (const method of schema.methods) {
        const asyncKeyword = method.async ? 'async ' : '';
        const params = method.params ? method.params.join(', ') : '';
        lines.push(`const ${method.name} = ${asyncKeyword}(${params}) => ${method.body}`);
      }
      lines.push('');
    }

    // 生成数据源加载函数
    if (schema.datasources.length > 0) {
      for (const ds of schema.datasources) {
        if (ds.type === 'rest') {
          lines.push(`const load${this.capitalize(ds.id)} = async () => {`);
          lines.push(`  ${ds.id}Loading.value = true`);
          lines.push(`  try {`);
          lines.push(`    const response = await fetch('${ds.config.url}')`);
          lines.push(`    ${ds.id}Data.value = await response.json()`);
          lines.push(`  } catch (error) {`);
          lines.push(`    console.error('加载失败:', error)`);
          lines.push(`  } finally {`);
          lines.push(`    ${ds.id}Loading.value = false`);
          lines.push(`  }`);
          lines.push(`}`);
          lines.push('');
        }
      }
    }

    // 生命周期钩子
    if (schema.lifecycle) {
      if (schema.lifecycle.mounted) {
        lines.push('// 组件挂载后');
        lines.push('onMounted(() => {');
        lines.push(`  ${schema.lifecycle.mounted}`);

        // 自动加载数据源
        for (const ds of schema.datasources) {
          if (ds.autoLoad) {
            lines.push(`  load${this.capitalize(ds.id)}()`);
          }
        }

        lines.push('})');
        lines.push('');
      }
    } else if (schema.datasources.some(ds => ds.autoLoad)) {
      lines.push('// 组件挂载后自动加载数据');
      lines.push('onMounted(() => {');
      for (const ds of schema.datasources) {
        if (ds.autoLoad) {
          lines.push(`  load${this.capitalize(ds.id)}()`);
        }
      }
      lines.push('})');
      lines.push('');
    }

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



