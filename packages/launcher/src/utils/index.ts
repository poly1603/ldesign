/**
 * 工具函数模块
 * 提供常用的辅助函数和工具方法
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn, type SpawnOptions } from 'child_process';

/**
 * 文件系统工具
 */
export class FileUtils {
  /**
   * 检查文件或目录是否存在
   * @param filePath 文件路径
   * @returns 是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查是否为目录
   * @param dirPath 目录路径
   * @returns 是否为目录
   */
  static async isDirectory(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * 检查是否为文件
   * @param filePath 文件路径
   * @returns 是否为文件
   */
  static async isFile(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  /**
   * 确保目录存在，不存在则创建
   * @param dirPath 目录路径
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * 读取 JSON 文件
   * @param filePath 文件路径
   * @returns JSON 对象
   */
  static async readJson<T = any>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * 写入 JSON 文件
   * @param filePath 文件路径
   * @param data 数据对象
   * @param indent 缩进空格数
   */
  static async writeJson(filePath: string, data: any, indent: number = 2): Promise<void> {
    const content = JSON.stringify(data, null, indent);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * 复制文件
   * @param src 源文件路径
   * @param dest 目标文件路径
   */
  static async copyFile(src: string, dest: string): Promise<void> {
    await this.ensureDir(path.dirname(dest));
    await fs.copyFile(src, dest);
  }

  /**
   * 递归复制目录
   * @param src 源目录路径
   * @param dest 目标目录路径
   */
  static async copyDir(src: string, dest: string): Promise<void> {
    await this.ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath);
      } else {
        await this.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * 删除文件或目录
   * @param targetPath 目标路径
   */
  static async remove(targetPath: string): Promise<void> {
    try {
      await fs.rm(targetPath, { recursive: true, force: true });
    } catch (error) {
      // 忽略不存在的文件/目录
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 获取文件大小
   * @param filePath 文件路径
   * @returns 文件大小（字节）
   */
  static async getFileSize(filePath: string): Promise<number> {
    const stat = await fs.stat(filePath);
    return stat.size;
  }

  /**
   * 查找文件
   * @param dir 搜索目录
   * @param pattern 文件名模式（支持通配符）
   * @returns 匹配的文件路径数组
   */
  static async findFiles(dir: string, pattern: string | RegExp): Promise<string[]> {
    const results: string[] = [];
    
    async function search(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await search(fullPath);
        } else if (entry.isFile()) {
          const matches = typeof pattern === 'string' 
            ? entry.name.includes(pattern)
            : pattern.test(entry.name);
          
          if (matches) {
            results.push(fullPath);
          }
        }
      }
    }
    
    await search(dir);
    return results;
  }
}

/**
 * 进程工具
 */
export class ProcessUtils {
  /**
   * 执行命令
   * @param command 命令
   * @param args 参数
   * @param options 选项
   * @returns Promise<{ stdout: string; stderr: string; code: number }>
   */
  static async exec(
    command: string,
    args: string[] = [],
    options: SpawnOptions = {}
  ): Promise<{ stdout: string; stderr: string; code: number }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ stdout, stderr, code: code || 0 });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 检查命令是否可用
   * @param command 命令名
   * @returns 是否可用
   */
  static async isCommandAvailable(command: string): Promise<boolean> {
    try {
      const { code } = await this.exec(process.platform === 'win32' ? 'where' : 'which', [command]);
      return code === 0;
    } catch {
      return false;
    }
  }

  /**
   * 获取包管理器
   * @param projectPath 项目路径
   * @returns 包管理器名称
   */
  static async getPackageManager(projectPath: string): Promise<'npm' | 'yarn' | 'pnpm' | null> {
    // 检查锁文件
    if (await FileUtils.exists(path.join(projectPath, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (await FileUtils.exists(path.join(projectPath, 'yarn.lock'))) {
      return 'yarn';
    }
    if (await FileUtils.exists(path.join(projectPath, 'package-lock.json'))) {
      return 'npm';
    }

    // 检查命令可用性
    if (await this.isCommandAvailable('pnpm')) {
      return 'pnpm';
    }
    if (await this.isCommandAvailable('yarn')) {
      return 'yarn';
    }
    if (await this.isCommandAvailable('npm')) {
      return 'npm';
    }

    return null;
  }
}

/**
 * 字符串工具
 */
export class StringUtils {
  /**
   * 转换为驼峰命名
   * @param str 字符串
   * @returns 驼峰命名字符串
   */
  static toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 转换为短横线命名
   * @param str 字符串
   * @returns 短横线命名字符串
   */
  static toKebabCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }

  /**
   * 转换为帕斯卡命名
   * @param str 字符串
   * @returns 帕斯卡命名字符串
   */
  static toPascalCase(str: string): string {
    const camelCase = this.toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  /**
   * 格式化字节数
   * @param bytes 字节数
   * @param decimals 小数位数
   * @returns 格式化后的字符串
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * 格式化时间
   * @param ms 毫秒数
   * @returns 格式化后的时间字符串
   */
  static formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    
    const seconds = ms / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    
    const minutes = seconds / 60;
    return `${minutes.toFixed(1)}m`;
  }

  /**
   * 生成随机字符串
   * @param length 长度
   * @param charset 字符集
   * @returns 随机字符串
   */
  static randomString(
    length: number = 8,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  ): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

/**
 * 对象工具
 */
export class ObjectUtils {
  /**
   * 深度合并对象
   * @param target 目标对象
   * @param sources 源对象
   * @returns 合并后的对象
   */
  static deepMerge<T extends Record<string, any>>(target: T, ...sources: any[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key] as Record<string, any>, source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  }

  /**
   * 深度克隆对象
   * @param obj 对象
   * @returns 克隆的对象
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * 检查是否为对象
   * @param item 项目
   * @returns 是否为对象
   */
  static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * 获取对象属性值（支持点号路径）
   * @param obj 对象
   * @param path 属性路径
   * @param defaultValue 默认值
   * @returns 属性值
   */
  static get(obj: any, path: string, defaultValue?: any): any {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  }

  /**
   * 设置对象属性值（支持点号路径）
   * @param obj 对象
   * @param path 属性路径
   * @param value 值
   */
  static set(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || !this.isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }
}

/**
 * 验证工具
 */
export class ValidationUtils {
  /**
   * 验证项目名称
   * @param name 项目名称
   * @returns 验证结果
   */
  static validateProjectName(name: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!name) {
      errors.push('项目名称不能为空');
    }

    if (name.length < 1) {
      errors.push('项目名称长度不能少于1个字符');
    }

    if (name.length > 214) {
      errors.push('项目名称长度不能超过214个字符');
    }

    if (!/^[a-z0-9-_@/]+$/.test(name)) {
      errors.push('项目名称只能包含小写字母、数字、连字符、下划线、@符号和斜杠');
    }

    if (name.startsWith('.') || name.startsWith('_')) {
      errors.push('项目名称不能以点号或下划线开头');
    }

    const reservedNames = ['node_modules', 'favicon.ico'];
    if (reservedNames.includes(name)) {
      errors.push(`项目名称不能使用保留名称: ${name}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * 验证端口号
   * @param port 端口号
   * @returns 是否有效
   */
  static validatePort(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
  }

  /**
   * 验证URL
   * @param url URL字符串
   * @returns 是否有效
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// 导出所有工具类

// 导出便捷函数
export const {
  exists,
  isDirectory,
  isFile,
  ensureDir,
  readJson,
  writeJson,
  copyFile,
  copyDir,
  remove,
  getFileSize,
  findFiles
} = FileUtils;

export const {
  exec,
  isCommandAvailable,
  getPackageManager
} = ProcessUtils;

export const {
  toCamelCase,
  toKebabCase,
  toPascalCase,
  formatBytes,
  formatTime,
  randomString
} = StringUtils;

export const {
  deepMerge,
  deepClone,
  isObject,
  get,
  set
} = ObjectUtils;

export const {
  validateProjectName,
  validatePort,
  validateUrl
} = ValidationUtils;