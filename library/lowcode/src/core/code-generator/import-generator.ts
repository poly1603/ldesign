/**
 * 导入语句生成器
 */

import type { CodeGenContext } from '../../types';

/**
 * 导入生成器类
 */
export class ImportGenerator {
  /**
   * 生成导入语句
   */
  generate(context: CodeGenContext): string[] {
    const imports: string[] = [];
    const { importedComponents } = context;

    if (importedComponents.size > 0) {
      const components = Array.from(importedComponents).sort();
      imports.push(`import { ${components.join(', ')} } from '@ldesign/form'`);
    }

    return imports;
  }

  /**
   * 根据组件名推断包名
   */
  private inferPackageName(componentName: string): string {
    // 根据组件名前缀推断包名
    if (componentName.startsWith('LButton') || componentName.startsWith('LInput')) {
      return '@ldesign/form';
    }
    if (componentName.startsWith('LTable')) {
      return '@ldesign/table';
    }
    // 默认
    return '@ldesign/form';
  }
}



