/**
 * 样式代码生成器
 */

import type { LowcodeSchema, CodeGenContext } from '../../types';

/**
 * 样式生成器类
 */
export class StyleGenerator {
  /**
   * 生成样式代码
   */
  generate(schema: LowcodeSchema, context: CodeGenContext): string {
    const lines: string[] = [];

    lines.push('<style scoped>');

    // 容器样式
    lines.push('.page-container {');
    lines.push('  display: grid;');
    lines.push('  grid-template-columns: repeat(12, 1fr);');
    lines.push('  gap: 16px;');
    lines.push('  padding: 20px;');
    lines.push('  min-height: 100vh;');
    lines.push('}');

    lines.push('</style>');

    return lines.join('\n');
  }
}



