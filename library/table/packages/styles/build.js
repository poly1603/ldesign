import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 创建dist目录
mkdirSync(resolve(__dirname, 'dist'), { recursive: true });

// 读取所有CSS文件并合并
const srcDir = resolve(__dirname, 'src');
const files = readdirSync(srcDir).filter(f => f.endsWith('.css'));

let combined = '';
files.forEach(file => {
  const content = readFileSync(resolve(srcDir, file), 'utf-8');
  combined += content + '\n\n';
});

// 写入合并后的文件
writeFileSync(resolve(__dirname, 'dist/index.css'), combined, 'utf-8');

console.log('✓ Styles built successfully');


