/**
 * Viewer Manager - Manages viewer lifecycle and state
 */

import type { ViewerOptions, RenderState, DocumentType } from '../types';
import { EventEmitter } from './EventEmitter';
import { ZOOM, ERROR_MESSAGES } from '../constants';

export class ViewerManager {
 private container: HTMLElement | null = null;
 private options: ViewerOptions;
 private eventEmitter: EventEmitter;
 private state: RenderState;
 private viewerId: string;

 constructor(options: ViewerOptions, eventEmitter: EventEmitter) {
  this.options = options;
  this.eventEmitter = eventEmitter;
  this.viewerId = this.generateId();

  // Initialize state
  this.state = {
   isLoading: false,
   isRendered: false,
   currentPage: 1,
   currentSheet: 0,
   currentSlide: 0,
   zoomLevel: ZOOM.DEFAULT,
   isFullscreen: false,
   error: null
  };
 }

 /**
  * Initialize container
  */
 initializeContainer(): HTMLElement {
  const container = this.getContainerElement();
  this.container = container;

  // Apply container styles
  this.applyContainerStyles(container);

  // Add viewer class
  container.classList.add('office-viewer');
  container.classList.add(`theme-${this.options.theme || 'light'}`);

  if (this.options.className) {
   container.classList.add(this.options.className);
  }

  container.dataset.viewerId = this.viewerId;

  return container;
 }

 /**
  * Get container element
  */
 private getContainerElement(): HTMLElement {
  const { container } = this.options;

  if (typeof container === 'string') {
   const element = document.querySelector(container);
   if (!element) {
    throw new Error(`${ERROR_MESSAGES.CONTAINER_NOT_FOUND}: ${container}`);
   }
   return element as HTMLElement;
  }

  return container;
 }

 /**
  * Apply container styles
  */
 private applyContainerStyles(container: HTMLElement): void {
  const { width, height } = this.options;

  if (width) {
   container.style.width = typeof width === 'number' ? `${width}px` : width;
  }

  if (height) {
   container.style.height = typeof height === 'number' ? `${height}px` : height;
  }
 }

 /**
  * Get viewer state
  */
 getState(): Readonly<RenderState> {
  return { ...this.state };
 }

 /**
  * Update state
  */
 updateState(updates: Partial<RenderState>): void {
  this.state = { ...this.state, ...updates };
 }

 /**
  * Set loading state
  */
 setLoading(isLoading: boolean): void {
  this.state.isLoading = isLoading;
 }

 /**
  * Set error state
  */
 setError(error: Error | null): void {
  this.state.error = error;
  if (error) {
   this.eventEmitter.emit('error', { error });
  }
 }

 /**
  * Set zoom level
  */
 setZoom(level: number): void {
  const previousLevel = this.state.zoomLevel;
  const clampedLevel = Math.max(ZOOM.MIN, Math.min(ZOOM.MAX, level));

  this.state.zoomLevel = clampedLevel;

  this.eventEmitter.emit('zoom', {
   level: clampedLevel,
   previousLevel
  });
 }

 /**
  * Zoom in
  */
 zoomIn(): void {
  this.setZoom(this.state.zoomLevel + ZOOM.STEP);
 }

 /**
  * Zoom out
  */
 zoomOut(): void {
  this.setZoom(this.state.zoomLevel - ZOOM.STEP);
 }

 /**
  * Reset zoom
  */
 resetZoom(): void {
  this.setZoom(ZOOM.DEFAULT);
 }

 /**
  * Get zoom level
  */
 getZoom(): number {
  return this.state.zoomLevel;
 }

 /**
  * Set current page
  */
 setPage(page: number, totalPages: number): void {
  const previousPage = this.state.currentPage;
  this.state.currentPage = Math.max(1, Math.min(totalPages, page));

  this.eventEmitter.emit('page-change', {
   page: this.state.currentPage,
   previousPage,
   totalPages
  });
 }

 /**
  * Set current sheet
  */
 setSheet(sheet: number): void {
  this.state.currentSheet = sheet;
  this.eventEmitter.emit('sheet-change', { sheet });
 }

 /**
  * Set current slide
  */
 setSlide(slide: number): void {
  this.state.currentSlide = slide;
  this.eventEmitter.emit('slide-change', { slide });
 }

 /**
  * Toggle fullscreen
  */
 async toggleFullscreen(): Promise<void> {
  if (!this.container) return;

  try {
   if (!this.state.isFullscreen) {
    if (this.container.requestFullscreen) {
     await this.container.requestFullscreen();
     this.state.isFullscreen = true;
    }
   } else {
    if (document.exitFullscreen) {
     await document.exitFullscreen();
     this.state.isFullscreen = false;
    }
   }
  } catch (error) {
   console.error('Fullscreen error:', error);
  }
 }

 /**
  * Get container
  */
 getContainer(): HTMLElement | null {
  return this.container;
 }

 /**
  * Get viewer ID
  */
 getViewerId(): string {
  return this.viewerId;
 }

 /**
  * Generate unique ID
  */
 private generateId(): string {
  return `viewer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
 }

 /**
  * Cleanup
  */
 destroy(): void {
  if (this.container) {
   this.container.classList.remove('office-viewer');
   this.container.classList.remove(`theme-${this.options.theme || 'light'}`);
   if (this.options.className) {
    this.container.classList.remove(this.options.className);
   }
   delete this.container.dataset.viewerId;
  }

  this.container = null;
 }
}
