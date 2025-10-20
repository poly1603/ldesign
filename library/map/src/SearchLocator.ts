/**
 * SearchLocator - 搜索定位器
 * 提供地理位置搜索和快速定位功能
 */

import type { Feature, FeatureCollection } from './types';

export interface SearchResult {
  feature: Feature;
  name: string;
  center: [number, number];
  adcode?: string;
  score: number; // 匹配分数
}

export interface SearchOptions {
  fields?: string[]; // 搜索字段
  fuzzy?: boolean; // 模糊搜索
  caseSensitive?: boolean;
  maxResults?: number;
}

/**
 * 搜索定位器类
 */
export class SearchLocator {
  private data: FeatureCollection | null = null;
  private searchIndex: Map<string, Feature[]> = new Map();

  /**
   * 设置数据并建立索引
   */
  setData(data: FeatureCollection): void {
    this.data = data;
    this.buildIndex();
  }

  /**
   * 建立搜索索引
   */
  private buildIndex(): void {
    if (!this.data) return;

    this.searchIndex.clear();

    this.data.features.forEach(feature => {
      const name = this.getFeatureName(feature);
      if (name) {
        // 分词索引
        const tokens = this.tokenize(name);
        tokens.forEach(token => {
          if (!this.searchIndex.has(token)) {
            this.searchIndex.set(token, []);
          }
          this.searchIndex.get(token)!.push(feature);
        });
      }
    });
  }

  /**
   * 搜索
   */
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    if (!this.data || !query) {
      return [];
    }

    const {
      fields = ['name', 'NAME', 'adm1_name'],
      fuzzy = true,
      caseSensitive = false,
      maxResults = 10
    } = options;

    const searchTerm = caseSensitive ? query : query.toLowerCase();
    const results: SearchResult[] = [];

    this.data.features.forEach(feature => {
      const matchScore = this.calculateMatchScore(feature, searchTerm, fields, fuzzy, caseSensitive);
      
      if (matchScore > 0) {
        const name = this.getFeatureName(feature) || 'Unknown';
        const center = this.getFeatureCenter(feature);

        if (center) {
          results.push({
            feature,
            name,
            center,
            adcode: feature.properties?.adcode,
            score: matchScore
          });
        }
      }
    });

    // 按分数排序
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, maxResults);
  }

  /**
   * 计算匹配分数
   */
  private calculateMatchScore(
    feature: Feature,
    searchTerm: string,
    fields: string[],
    fuzzy: boolean,
    caseSensitive: boolean
  ): number {
    let maxScore = 0;

    for (const field of fields) {
      const value = feature.properties?.[field];
      if (!value) continue;

      const text = caseSensitive ? String(value) : String(value).toLowerCase();

      // 完全匹配：100分
      if (text === searchTerm) {
        return 100;
      }

      // 开头匹配：80分
      if (text.startsWith(searchTerm)) {
        maxScore = Math.max(maxScore, 80);
        continue;
      }

      // 包含匹配：60分
      if (text.includes(searchTerm)) {
        maxScore = Math.max(maxScore, 60);
        continue;
      }

      // 模糊匹配：根据相似度评分
      if (fuzzy) {
        const similarity = this.calculateSimilarity(text, searchTerm);
        if (similarity > 0.5) {
          maxScore = Math.max(maxScore, Math.round(similarity * 50));
        }
      }
    }

    return maxScore;
  }

  /**
   * 计算字符串相似度（Levenshtein距离）
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
  }

  /**
   * 分词
   */
  private tokenize(text: string): string[] {
    const normalized = text.toLowerCase();
    const tokens: string[] = [];

    // 完整文本
    tokens.push(normalized);

    // 按空格分词
    const words = normalized.split(/\s+/);
    tokens.push(...words);

    // 中文按字分词
    if (/[\u4e00-\u9fa5]/.test(text)) {
      for (let i = 0; i < text.length; i++) {
        tokens.push(text[i].toLowerCase());
      }
    }

    return Array.from(new Set(tokens)).filter(t => t.length > 0);
  }

  /**
   * 获取要素名称
   */
  private getFeatureName(feature: Feature): string | null {
    const nameFields = ['name', 'NAME', 'adm1_name', 'label', 'title'];
    
    for (const field of nameFields) {
      if (feature.properties?.[field]) {
        return String(feature.properties[field]);
      }
    }

    return null;
  }

  /**
   * 获取要素中心点
   */
  private getFeatureCenter(feature: Feature): [number, number] | null {
    if (feature.properties?.centroid) {
      return feature.properties.centroid;
    }
    if (feature.properties?.center) {
      return feature.properties.center;
    }

    // 简单计算几何中心
    if (feature.geometry?.type === 'Point') {
      return (feature.geometry as any).coordinates;
    }

    if (feature.geometry?.type === 'Polygon') {
      const coords = (feature.geometry as any).coordinates[0];
      const sumX = coords.reduce((sum: number, c: number[]) => sum + c[0], 0);
      const sumY = coords.reduce((sum: number, c: number[]) => sum + c[1], 0);
      return [sumX / coords.length, sumY / coords.length];
    }

    return null;
  }

  /**
   * 按adcode搜索
   */
  searchByAdcode(adcode: string): SearchResult | null {
    if (!this.data) return null;

    const feature = this.data.features.find(f => f.properties?.adcode === adcode);
    if (!feature) return null;

    const name = this.getFeatureName(feature) || 'Unknown';
    const center = this.getFeatureCenter(feature);

    if (!center) return null;

    return {
      feature,
      name,
      center,
      adcode,
      score: 100
    };
  }

  /**
   * 获取所有要素名称列表（用于自动完成）
   */
  getAllNames(): string[] {
    if (!this.data) return [];

    return this.data.features
      .map(f => this.getFeatureName(f))
      .filter(name => name !== null) as string[];
  }

  /**
   * 获取索引统计
   */
  getIndexStats(): {
    features: number;
    tokens: number;
    avgTokensPerFeature: number;
  } {
    const features = this.data?.features.length || 0;
    const tokens = this.searchIndex.size;

    return {
      features,
      tokens,
      avgTokensPerFeature: features > 0 ? tokens / features : 0
    };
  }
}





