/**
 * @word-viewer/react
 * React Word Viewer 组件
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { WordViewer } from '@word-viewer/core';
import type { ViewerOptions, DocumentSource } from '@word-viewer/core';

export interface WordViewerProps {
  source?: DocumentSource;
  options?: ViewerOptions;
  zoom?: number;
  editable?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  onLoaded?: (data: any) => void;
  onError?: (error: any) => void;
  onChanged?: () => void;
  onZoom?: (level: number) => void;
  onPageChange?: (pageInfo: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface WordViewerRef {
  getViewer: () => WordViewer | null;
  loadDocument: (source: DocumentSource) => Promise<void>;
}

const WordViewerComponent = forwardRef<WordViewerRef, WordViewerProps>(
  (props, ref) => {
    const {
      source,
      options,
      zoom,
      editable,
      theme,
      onLoaded,
      onError,
      onChanged,
      onZoom,
      onPageChange,
      className,
      style,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<WordViewer | null>(null);

    useEffect(() => {
      if (containerRef.current && !viewerRef.current) {
        viewerRef.current = new WordViewer(containerRef.current, {
          ...options,
          editable,
          theme,
          initialZoom: zoom,
        });

        if (onLoaded) viewerRef.current.on('loaded', onLoaded);
        if (onError) viewerRef.current.on('error', onError);
        if (onChanged) viewerRef.current.on('changed', onChanged);
        if (onZoom) viewerRef.current.on('zoom', onZoom);
        if (onPageChange) viewerRef.current.on('page-change', onPageChange);
      }

      return () => {
        if (viewerRef.current) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (source && viewerRef.current) {
        loadDocument(source);
      }
    }, [source]);

    useEffect(() => {
      if (zoom !== undefined && viewerRef.current) {
        viewerRef.current.setZoom(zoom);
      }
    }, [zoom]);

    useEffect(() => {
      if (viewerRef.current) {
        editable ? viewerRef.current.enableEdit() : viewerRef.current.disableEdit();
      }
    }, [editable]);

    useEffect(() => {
      if (theme && viewerRef.current) {
        viewerRef.current.updateOptions({ theme });
      }
    }, [theme]);

    const loadDocument = async (documentSource: DocumentSource) => {
      if (!viewerRef.current) return;

      try {
        if (documentSource instanceof File) {
          await viewerRef.current.loadFile(documentSource);
        } else if (documentSource instanceof Blob) {
          const buffer = await documentSource.arrayBuffer();
          await viewerRef.current.loadBuffer(buffer);
        } else if (documentSource instanceof ArrayBuffer) {
          await viewerRef.current.loadBuffer(documentSource);
        } else if (typeof documentSource === 'string') {
          await viewerRef.current.loadUrl(documentSource);
        }
      } catch (error) {
        console.error('加载文档失败:', error);
      }
    };

    useImperativeHandle(ref, () => ({
      getViewer: () => viewerRef.current,
      loadDocument,
    }));

    return (
      <div
        ref={containerRef}
        className={`react-word-viewer ${className || ''}`}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          ...style,
        }}
      />
    );
  }
);

WordViewerComponent.displayName = 'WordViewer';

export default WordViewerComponent;



