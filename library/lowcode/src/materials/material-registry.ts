/**
 * 物料注册表
 */

import type { Material, MaterialCategory, MaterialRegistry as IMaterialRegistry, MaterialPackage } from '../types';

/**
 * 物料注册表类
 */
export class MaterialRegistry implements IMaterialRegistry {
  private materials: Map<string, Material> = new Map();
  private categories: Map<string, MaterialCategory> = new Map();

  /**
   * 注册物料
   */
  register(material: Material): void {
    this.materials.set(material.name, material);

    // 自动注册分类
    if (!this.categories.has(material.category)) {
      this.categories.set(material.category, {
        id: material.category,
        name: material.category
      });
    }
  }

  /**
   * 批量注册
   */
  registerAll(materials: Material[]): void {
    materials.forEach(material => this.register(material));
  }

  /**
   * 注册物料包
   */
  registerPackage(pkg: MaterialPackage): void {
    // 注册分类
    if (pkg.categories) {
      pkg.categories.forEach(category => {
        this.categories.set(category.id, category);
      });
    }

    // 注册物料
    this.registerAll(pkg.materials);
  }

  /**
   * 获取物料
   */
  get(name: string): Material | undefined {
    return this.materials.get(name);
  }

  /**
   * 获取所有物料
   */
  getAll(): Material[] {
    return Array.from(this.materials.values());
  }

  /**
   * 按分类获取
   */
  getByCategory(category: string): Material[] {
    return this.getAll().filter(m => m.category === category);
  }

  /**
   * 获取所有分类
   */
  getCategories(): MaterialCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });
  }

  /**
   * 搜索物料
   */
  search(keyword: string): Material[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.getAll().filter(material => {
      return (
        material.name.toLowerCase().includes(lowerKeyword) ||
        material.title.toLowerCase().includes(lowerKeyword) ||
        material.description?.toLowerCase().includes(lowerKeyword) ||
        material.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))
      );
    });
  }

  /**
   * 取消注册
   */
  unregister(name: string): void {
    this.materials.delete(name);
  }

  /**
   * 清空
   */
  clear(): void {
    this.materials.clear();
    this.categories.clear();
  }

  /**
   * 获取物料数量
   */
  size(): number {
    return this.materials.size;
  }

  /**
   * 判断物料是否存在
   */
  has(name: string): boolean {
    return this.materials.has(name);
  }
}

/**
 * 创建物料注册表实例
 */
export function createMaterialRegistry(): MaterialRegistry {
  return new MaterialRegistry();
}

/**
 * 全局物料注册表实例
 */
export const globalMaterialRegistry = new MaterialRegistry();



