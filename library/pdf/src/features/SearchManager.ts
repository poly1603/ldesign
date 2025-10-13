import type { PDFViewer, SearchResult, SearchOptions, SearchMatch } from '../types';

export class SearchManager {
  private viewer: PDFViewer;
  private currentQuery: string = '';
  private currentResults: SearchResult[] = [];
  private currentResultIndex: number = -1;
  private highlightElements: HTMLElement[] = [];

  constructor(viewer: PDFViewer) {
    this.viewer = viewer;
  }

  /**
   * Search for text in the PDF
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!query || !this.viewer.document) {
      this.clear();
      return [];
    }

    this.currentQuery = query;
    this.currentResults = [];
    this.currentResultIndex = -1;

    const caseSensitive = options?.caseSensitive || false;
    const entireWord = options?.entireWord || false;
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    // Search through all pages
    const totalPages = this.viewer.getTotalPages();
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const pageResults = await this.searchPage(pageNum, searchQuery, {
        caseSensitive,
        entireWord
      });
      
      if (pageResults.matches.length > 0) {
        this.currentResults.push(pageResults);
      }
    }

    // Highlight results if requested
    if (options?.highlightAll) {
      this.highlightAllResults();
    }

    // Go to first result if not finding previous
    if (this.currentResults.length > 0 && !options?.findPrevious) {
      this.goToResult(0);
    }

    return this.currentResults;
  }

  /**
   * Search within a specific page
   */
  private async searchPage(
    pageNumber: number,
    query: string,
    options: { caseSensitive: boolean; entireWord: boolean }
  ): Promise<SearchResult> {
    const matches: SearchMatch[] = [];
    
    // This is a simplified implementation
    // In a real implementation, you would extract text from the PDF page
    // and search for matches with their positions
    
    // For now, we'll return a placeholder
    // You would need to implement actual text extraction and position calculation
    
    return {
      page: pageNumber,
      matches
    };
  }

  /**
   * Navigate to next search result
   */
  nextResult(): void {
    if (this.currentResults.length === 0) {
      return;
    }

    this.currentResultIndex = (this.currentResultIndex + 1) % this.getTotalMatches();
    this.goToCurrentResult();
  }

  /**
   * Navigate to previous search result
   */
  previousResult(): void {
    if (this.currentResults.length === 0) {
      return;
    }

    this.currentResultIndex = this.currentResultIndex - 1;
    if (this.currentResultIndex < 0) {
      this.currentResultIndex = this.getTotalMatches() - 1;
    }
    this.goToCurrentResult();
  }

  /**
   * Go to a specific result index
   */
  goToResult(index: number): void {
    if (index < 0 || index >= this.getTotalMatches()) {
      return;
    }

    this.currentResultIndex = index;
    this.goToCurrentResult();
  }

  /**
   * Go to the current result
   */
  private goToCurrentResult(): void {
    let currentCount = 0;
    
    for (const pageResult of this.currentResults) {
      if (currentCount + pageResult.matches.length > this.currentResultIndex) {
        const matchIndex = this.currentResultIndex - currentCount;
        const match = pageResult.matches[matchIndex];
        
        // Navigate to the page
        this.viewer.goToPage(pageResult.page);
        
        // Highlight and scroll to the match
        this.highlightMatch(match);
        this.scrollToMatch(match);
        
        break;
      }
      currentCount += pageResult.matches.length;
    }
  }

  /**
   * Highlight all search results
   */
  private highlightAllResults(): void {
    this.clearHighlights();

    for (const pageResult of this.currentResults) {
      for (const match of pageResult.matches) {
        this.highlightMatch(match);
      }
    }
  }

  /**
   * Highlight a specific match
   */
  private highlightMatch(match: SearchMatch): void {
    const highlight = document.createElement('div');
    highlight.className = 'pdf-search-highlight';
    highlight.style.position = 'absolute';
    highlight.style.left = `${match.position.x}px`;
    highlight.style.top = `${match.position.y}px`;
    highlight.style.width = `${match.position.width}px`;
    highlight.style.height = `${match.position.height}px`;
    highlight.style.backgroundColor = 'yellow';
    highlight.style.opacity = '0.3';
    highlight.style.pointerEvents = 'none';
    
    // Add to the viewer's canvas container
    // In a real implementation, this would be added to the appropriate layer
    this.highlightElements.push(highlight);
  }

  /**
   * Scroll to a specific match
   */
  private scrollToMatch(match: SearchMatch): void {
    // Scroll the match into view
    // This would need to be implemented based on your viewer's scrolling mechanism
  }

  /**
   * Clear all highlights
   */
  private clearHighlights(): void {
    for (const element of this.highlightElements) {
      element.remove();
    }
    this.highlightElements = [];
  }

  /**
   * Get total number of matches
   */
  private getTotalMatches(): number {
    return this.currentResults.reduce((total, result) => total + result.matches.length, 0);
  }

  /**
   * Clear search results
   */
  clear(): void {
    this.currentQuery = '';
    this.currentResults = [];
    this.currentResultIndex = -1;
    this.clearHighlights();
  }

  /**
   * Get current search query
   */
  getCurrentQuery(): string {
    return this.currentQuery;
  }

  /**
   * Get current search results
   */
  getResults(): SearchResult[] {
    return this.currentResults;
  }

  /**
   * Get current result index
   */
  getCurrentResultIndex(): number {
    return this.currentResultIndex;
  }

  /**
   * Check if search is active
   */
  isSearchActive(): boolean {
    return this.currentQuery !== '' && this.currentResults.length > 0;
  }

  /**
   * Destroy the search manager
   */
  destroy(): void {
    this.clear();
  }
}