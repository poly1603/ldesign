/**
 * PDF搜索管理器
 * 提供文本搜索、高亮显示等功能
 */
import type { PDFPageProxy } from 'pdfjs-dist';
import type { SearchOptions, SearchResult } from '../core/types';
/**
 * PDF搜索管理器
 */
export declare class PdfSearchManager {
    private searchCache;
    private currentResults;
    private currentQuery;
    private currentOptions;
    /**
     * 搜索PDF文档中的文本
     */
    searchInDocument(getPage: (pageNumber: number) => Promise<PDFPageProxy>, totalPages: number, options: SearchOptions): Promise<SearchResult[]>;
    /**
     * 在单个页面中搜索
     */
    private searchInPage;
    /**
     * 提取匹配项的上下文
     */
    private extractContext;
    /**
     * 获取当前搜索结果
     */
    getCurrentResults(): SearchResult[];
    /**
     * 获取当前查询
     */
    getCurrentQuery(): string;
    /**
     * 获取当前搜索选项
     */
    getCurrentOptions(): SearchOptions | null;
    /**
     * 查找下一个匹配项
     */
    findNext(currentPageNumber: number, currentMatchIndex?: number): SearchResult | null;
    /**
     * 查找上一个匹配项
     */
    findPrevious(currentPageNumber: number, currentMatchIndex?: number): SearchResult | null;
    /**
     * 获取指定页面的匹配项
     */
    getPageMatches(pageNumber: number): SearchResult[];
    /**
     * 高亮显示搜索结果
     */
    highlightMatches(container: HTMLElement, pageNumber: number, highlightClass?: string, currentMatchClass?: string): void;
    /**
     * 清除高亮显示
     */
    clearHighlights(container: HTMLElement): void;
    /**
     * 清除搜索缓存
     */
    clearCache(): void;
    /**
     * 清除搜索结果
     */
    clearResults(): void;
    /**
     * 获取搜索统计信息
     */
    getSearchStats(): {
        totalMatches: number;
        pagesWithMatches: number;
        query: string;
        options: SearchOptions | null;
    };
    /**
     * 销毁搜索管理器
     */
    destroy(): void;
}
//# sourceMappingURL=search-manager.d.ts.map