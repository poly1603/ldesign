/**
 * 物料仓库管理器
 * 
 * 负责管理自定义物料的增删改查、导入导出等功能
 */

import type {
  CustomMaterial,
  MaterialCategory,
  MaterialRepository,
  MaterialRepositoryConfig,
  MaterialRepositoryEvents
} from '../types'

/**
 * 物料仓库管理器类
 */
export class MaterialRepositoryManager {
  private repository: MaterialRepository
  private config: MaterialRepositoryConfig
  private eventListeners: Map<keyof MaterialRepositoryEvents, Function[]> = new Map()

  constructor(config: MaterialRepositoryConfig = {}) {
    this.config = config
    this.repository = this.initializeRepository()
  }

  /**
   * 初始化仓库
   */
  private initializeRepository(): MaterialRepository {
    if (this.config.defaultRepository) {
      return this.config.defaultRepository
    }

    // 创建默认仓库
    return {
      id: 'default',
      name: '默认物料仓库',
      description: '系统默认的物料仓库',
      version: '1.0.0',
      categories: this.createDefaultCategories(),
      author: 'LDesign',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * 创建默认分类
   */
  private createDefaultCategories(): MaterialCategory[] {
    return [
      {
        id: 'basic',
        name: '基础节点',
        description: '基础的流程节点',
        icon: '⚪',
        order: 1,
        materials: []
      },
      {
        id: 'custom',
        name: '自定义节点',
        description: '用户自定义的节点',
        icon: '🎨',
        order: 2,
        materials: []
      }
    ]
  }

  /**
   * 获取仓库信息
   */
  getRepository(): MaterialRepository {
    return { ...this.repository }
  }

  /**
   * 获取所有分类
   */
  getCategories(): MaterialCategory[] {
    return [...this.repository.categories]
  }

  /**
   * 获取指定分类
   */
  getCategory(categoryId: string): MaterialCategory | undefined {
    return this.repository.categories.find(cat => cat.id === categoryId)
  }

  /**
   * 添加分类
   */
  addCategory(category: Omit<MaterialCategory, 'materials'>): MaterialCategory {
    const newCategory: MaterialCategory = {
      ...category,
      materials: []
    }

    this.repository.categories.push(newCategory)
    this.repository.updatedAt = new Date().toISOString()
    
    this.emit('category:add', newCategory)
    return newCategory
  }

  /**
   * 更新分类
   */
  updateCategory(categoryId: string, updates: Partial<MaterialCategory>): MaterialCategory | null {
    const categoryIndex = this.repository.categories.findIndex(cat => cat.id === categoryId)
    if (categoryIndex === -1) return null

    const updatedCategory = {
      ...this.repository.categories[categoryIndex],
      ...updates,
      id: categoryId // 确保ID不被修改
    }

    this.repository.categories[categoryIndex] = updatedCategory
    this.repository.updatedAt = new Date().toISOString()
    
    this.emit('category:update', updatedCategory)
    return updatedCategory
  }

  /**
   * 删除分类
   */
  deleteCategory(categoryId: string): boolean {
    const categoryIndex = this.repository.categories.findIndex(cat => cat.id === categoryId)
    if (categoryIndex === -1) return false

    this.repository.categories.splice(categoryIndex, 1)
    this.repository.updatedAt = new Date().toISOString()
    
    this.emit('category:delete', categoryId)
    return true
  }

  /**
   * 获取所有物料
   */
  getAllMaterials(): CustomMaterial[] {
    return this.repository.categories.flatMap(cat => cat.materials)
  }

  /**
   * 获取指定分类的物料
   */
  getMaterialsByCategory(categoryId: string): CustomMaterial[] {
    const category = this.getCategory(categoryId)
    return category ? [...category.materials] : []
  }

  /**
   * 获取指定物料
   */
  getMaterial(materialId: string): CustomMaterial | undefined {
    for (const category of this.repository.categories) {
      const material = category.materials.find(mat => mat.id === materialId)
      if (material) return material
    }
    return undefined
  }

  /**
   * 添加物料
   */
  addMaterial(categoryId: string, material: CustomMaterial): boolean {
    const category = this.getCategory(categoryId)
    if (!category) return false

    // 检查ID是否已存在
    if (this.getMaterial(material.id)) {
      throw new Error(`物料ID "${material.id}" 已存在`)
    }

    // 添加时间戳
    const materialWithTimestamp = {
      ...material,
      createdAt: material.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    category.materials.push(materialWithTimestamp)
    this.repository.updatedAt = new Date().toISOString()
    
    this.emit('material:add', materialWithTimestamp)
    return true
  }

  /**
   * 更新物料
   */
  updateMaterial(materialId: string, updates: Partial<CustomMaterial>): CustomMaterial | null {
    for (const category of this.repository.categories) {
      const materialIndex = category.materials.findIndex(mat => mat.id === materialId)
      if (materialIndex !== -1) {
        const updatedMaterial = {
          ...category.materials[materialIndex],
          ...updates,
          id: materialId, // 确保ID不被修改
          updatedAt: new Date().toISOString()
        }

        category.materials[materialIndex] = updatedMaterial
        this.repository.updatedAt = new Date().toISOString()
        
        this.emit('material:update', updatedMaterial)
        return updatedMaterial
      }
    }
    return null
  }

  /**
   * 删除物料
   */
  deleteMaterial(materialId: string): boolean {
    for (const category of this.repository.categories) {
      const materialIndex = category.materials.findIndex(mat => mat.id === materialId)
      if (materialIndex !== -1) {
        category.materials.splice(materialIndex, 1)
        this.repository.updatedAt = new Date().toISOString()
        
        this.emit('material:delete', materialId)
        return true
      }
    }
    return false
  }

  /**
   * 移动物料到其他分类
   */
  moveMaterial(materialId: string, targetCategoryId: string): boolean {
    const material = this.getMaterial(materialId)
    if (!material) return false

    const targetCategory = this.getCategory(targetCategoryId)
    if (!targetCategory) return false

    // 从原分类删除
    if (!this.deleteMaterial(materialId)) return false

    // 添加到目标分类
    return this.addMaterial(targetCategoryId, material)
  }

  /**
   * 搜索物料
   */
  searchMaterials(query: string): CustomMaterial[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllMaterials().filter(material =>
      material.name.toLowerCase().includes(lowerQuery) ||
      material.description?.toLowerCase().includes(lowerQuery) ||
      material.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * 导出仓库
   */
  exportRepository(): string {
    this.emit('repository:export', this.repository)
    return JSON.stringify(this.repository, null, 2)
  }

  /**
   * 导入仓库
   */
  importRepository(repositoryData: string | MaterialRepository): boolean {
    try {
      const repository = typeof repositoryData === 'string' 
        ? JSON.parse(repositoryData) as MaterialRepository
        : repositoryData

      // 验证仓库数据
      if (!this.validateRepository(repository)) {
        throw new Error('无效的仓库数据')
      }

      this.repository = repository
      this.emit('repository:import', repository)
      return true
    } catch (error) {
      console.error('导入仓库失败:', error)
      return false
    }
  }

  /**
   * 验证仓库数据
   */
  private validateRepository(repository: any): repository is MaterialRepository {
    return (
      repository &&
      typeof repository.id === 'string' &&
      typeof repository.name === 'string' &&
      typeof repository.version === 'string' &&
      Array.isArray(repository.categories)
    )
  }

  /**
   * 保存仓库到本地存储
   */
  saveToLocalStorage(key: string = 'ldesign-material-repository'): void {
    try {
      localStorage.setItem(key, this.exportRepository())
      this.emit('repository:save', this.repository)
    } catch (error) {
      console.error('保存仓库到本地存储失败:', error)
    }
  }

  /**
   * 从本地存储加载仓库
   */
  loadFromLocalStorage(key: string = 'ldesign-material-repository'): boolean {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const success = this.importRepository(data)
        if (success) {
          this.emit('repository:load', this.repository)
        }
        return success
      }
      return false
    } catch (error) {
      console.error('从本地存储加载仓库失败:', error)
      return false
    }
  }

  /**
   * 事件监听
   */
  on<K extends keyof MaterialRepositoryEvents>(
    event: K,
    listener: MaterialRepositoryEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof MaterialRepositoryEvents>(
    event: K,
    listener: MaterialRepositoryEvents[K]
  ): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof MaterialRepositoryEvents>(
    event: K,
    ...args: Parameters<MaterialRepositoryEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as any)(...args)
        } catch (error) {
          console.error(`事件 ${event} 监听器执行失败:`, error)
        }
      })
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.eventListeners.clear()
  }
}
