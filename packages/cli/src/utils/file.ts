/**
 * 文件操作工具
 */

import { promises as fs } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { existsSync, statSync } from 'fs';
import { glob } from 'glob';

/**
 * 确保目录存在
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 复制文件
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await ensureDir(dirname(dest));
  await fs.copyFile(src, dest);
}

/**
 * 复制目录
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await ensureDir(dest);
  
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * 删除文件或目录
 */
export async function remove(path: string): Promise<void> {
  try {
    const stat = await fs.stat(path);
    if (stat.isDirectory()) {
      await fs.rmdir(path, { recursive: true });
    } else {
      await fs.unlink(path);
    }
  } catch (error) {
    // 忽略不存在的文件
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * 读取 JSON 文件
 */
export async function readJson(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * 写入 JSON 文件
 */
export async function writeJson(filePath: string, data: any, indent = 2): Promise<void> {
  await ensureDir(dirname(filePath));
  const content = JSON.stringify(data, null, indent);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 检查文件是否存在
 */
export function exists(path: string): boolean {
  return existsSync(path);
}

/**
 * 获取文件信息
 */
export function getFileInfo(path: string) {
  if (!exists(path)) {
    return null;
  }
  
  const stat = statSync(path);
  return {
    path,
    name: basename(path),
    ext: extname(path),
    size: stat.size,
    isFile: stat.isFile(),
    isDirectory: stat.isDirectory(),
    mtime: stat.mtime,
    ctime: stat.ctime
  };
}

/**
 * 搜索文件
 */
export async function findFiles(pattern: string, options: { cwd?: string; ignore?: string[] } = {}): Promise<string[]> {
  return glob(pattern, {
    cwd: options.cwd || process.cwd(),
    ignore: options.ignore || ['node_modules/**', '.git/**']
  });
}

/**
 * 读取文件内容
 */
export async function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  return fs.readFile(filePath, encoding);
}

/**
 * 写入文件内容
 */
export async function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  await ensureDir(dirname(filePath));
  await fs.writeFile(filePath, content, encoding);
}

/**
 * 获取目录大小
 */
export async function getDirSize(dirPath: string): Promise<number> {
  let size = 0;
  
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const entryPath = resolve(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      size += await getDirSize(entryPath);
    } else {
      const stat = await fs.stat(entryPath);
      size += stat.size;
    }
  }
  
  return size;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * 创建临时文件
 */
export async function createTempFile(prefix = 'tmp', suffix = ''): Promise<string> {
  const tmpDir = process.env.TMPDIR || process.env.TMP || '/tmp';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const filename = `${prefix}-${timestamp}-${random}${suffix}`;
  const tempPath = resolve(tmpDir, filename);
  
  await fs.writeFile(tempPath, '', 'utf-8');
  return tempPath;
}

/**
 * 创建临时目录
 */
export async function createTempDir(prefix = 'tmp'): Promise<string> {
  const tmpDir = process.env.TMPDIR || process.env.TMP || '/tmp';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const dirname = `${prefix}-${timestamp}-${random}`;
  const tempPath = resolve(tmpDir, dirname);
  
  await ensureDir(tempPath);
  return tempPath;
}
