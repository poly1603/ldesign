/**
 * Event type definitions
 */

/**
 * Event types
 */
export type ViewerEventType =
 | 'load'
 | 'error'
 | 'progress'
 | 'zoom'
 | 'page-change'
 | 'sheet-change'
 | 'slide-change'
 | 'search'
 | 'annotation-add'
 | 'annotation-update'
 | 'annotation-delete'
 | 'destroy';

/**
 * Event handler
 */
export type EventHandler<T = any> = (data?: T) => void;

/**
 * Event emitter interface
 */
export interface IEventEmitter {
 on(event: ViewerEventType, handler: EventHandler): void;
 off(event: ViewerEventType, handler: EventHandler): void;
 once(event: ViewerEventType, handler: EventHandler): void;
 emit(event: ViewerEventType, data?: any): void;
 removeAllListeners(event?: ViewerEventType): void;
}

/**
 * Event data types
 */
export interface LoadEventData {
 metadata: any;
 duration: number;
}

export interface ErrorEventData {
 error: Error;
 context?: string;
}

export interface ProgressEventData {
 loaded: number;
 total: number;
 percentage: number;
}

export interface ZoomEventData {
 level: number;
 previousLevel: number;
}

export interface PageChangeEventData {
 page: number;
 previousPage: number;
 totalPages: number;
}

export interface SearchEventData {
 query: string;
 results: any[];
 currentIndex: number;
}
