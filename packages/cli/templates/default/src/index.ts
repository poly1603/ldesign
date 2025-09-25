/**
 * {{name}} - {{description}}
 */

export function hello(name: string = 'World'): string {
  return `Hello, ${name}!`;
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(hello('{{pascalCase name}}'));
}
