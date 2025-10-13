import React, { useEffect, useRef, useState } from 'react';
import UniversalPDFViewer from '../../index';
import type { UniversalPDFViewerOptions, PDFViewerState } from '../../types';

export interface PDFViewerProps extends Partial<Omit<UniversalPDFViewerOptions, 'container'>> {
  className?: string;
  style?: React.CSSProperties;
  onReady?: (viewer: UniversalPDFViewer) => void;
  onPageChange?: (page: number, total: number) => void;
  onScaleChange?: (scale: number) => void;
  onError?: (error: Error) => void;
  onLoad?: (data: { totalPages: number }) => void;
}

const PDFViewerReact: React.FC<PDFViewerProps> = ({
  className,
  style,
  pdfUrl,
  onReady,
  onPageChange,
  onScaleChange,
  onError,
  onLoad,
  ...options
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<UniversalPDFViewer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<Partial<PDFViewerState>>({});

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize viewer
    const viewer = new UniversalPDFViewer({
      container: containerRef.current,
      pdfUrl,
      ...options
    });

    viewerRef.current = viewer;

    // Set up event listeners
    viewer.on('initialized', (viewerState: PDFViewerState) => {
      setState(viewerState);
      if (onReady) {
        onReady(viewer);
      }
    });

    viewer.on('loading', () => {
      setIsLoading(true);
      setError(null);
    });

    viewer.on('loaded', (data: { totalPages: number }) => {
      setIsLoading(false);
      if (onLoad) {
        onLoad(data);
      }
    });

    viewer.on('error', (err: Error) => {
      setIsLoading(false);
      setError(err);
      if (onError) {
        onError(err);
      }
    });

    viewer.on('pageChanged', ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => {
      setState(prev => ({ ...prev, currentPage, totalPages }));
      if (onPageChange) {
        onPageChange(currentPage, totalPages);
      }
    });

    viewer.on('scaleChanged', ({ scale }: { scale: number }) => {
      setState(prev => ({ ...prev, scale }));
      if (onScaleChange) {
        onScaleChange(scale);
      }
    });

    return () => {
      viewer.destroy();
    };
  }, []); // Only run once on mount

  // Update PDF URL if it changes
  useEffect(() => {
    if (pdfUrl && viewerRef.current) {
      viewerRef.current.loadPDF(pdfUrl);
    }
  }, [pdfUrl]);

  return (
    <div 
      ref={containerRef}
      className={`pdf-viewer-react ${className || ''}`}
      style={{
        width: '100%',
        height: '100%',
        ...style
      }}
    >
      {isLoading && (
        <div className="pdf-viewer-loading-overlay">
          <div className="spinner"></div>
          <p>Loading PDF...</p>
        </div>
      )}
      {error && (
        <div className="pdf-viewer-error-overlay">
          <p>Error: {error.message}</p>
        </div>
      )}
    </div>
  );
};

// Hook for programmatic control
export const usePDFViewer = () => {
  const [viewer, setViewer] = useState<UniversalPDFViewer | null>(null);
  const [state, setState] = useState<Partial<PDFViewerState>>({});

  const handleReady = (v: UniversalPDFViewer) => {
    setViewer(v);
    v.on('pageChanged', ({ currentPage, totalPages }: any) => {
      setState(prev => ({ ...prev, currentPage, totalPages }));
    });
    v.on('scaleChanged', ({ scale }: any) => {
      setState(prev => ({ ...prev, scale }));
    });
  };

  return {
    viewer,
    state,
    handleReady,
    actions: viewer ? {
      nextPage: () => viewer.nextPage(),
      previousPage: () => viewer.previousPage(),
      goToPage: (page: number) => viewer.goToPage(page),
      zoomIn: () => viewer.zoomIn(),
      zoomOut: () => viewer.zoomOut(),
      setScale: (scale: number) => viewer.setScale(scale),
      search: (query: string) => viewer.search(query),
      print: () => viewer.print(),
      download: (filename?: string) => viewer.download(filename),
      setTheme: (theme: 'light' | 'dark') => viewer.setTheme(theme)
    } : null
  };
};

export default PDFViewerReact;