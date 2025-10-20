import React, { useRef, useEffect, useImperativeHandle, forwardRef, CSSProperties } from 'react';
import { PanoramaViewer as CoreViewer } from '@panorama-viewer/core';
import type { ViewerOptions, Hotspot, ViewLimits, CubemapImages } from '@panorama-viewer/core';

export interface PanoramaViewerProps {
  image: string | CubemapImages;
  format?: 'equirectangular' | 'cubemap';
  fov?: number;
  minFov?: number;
  maxFov?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  gyroscope?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
  viewLimits?: ViewLimits | null;
  keyboardControls?: boolean;
  renderOnDemand?: boolean;
  showMiniMap?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  onHotspotClick?: (hotspot: Hotspot) => void;
}

export interface PanoramaViewerRef {
  loadImage: (url: string | CubemapImages, transition?: boolean) => Promise<void>;
  reset: () => void;
  enableAutoRotate: () => void;
  disableAutoRotate: () => void;
  enableGyroscope: () => Promise<boolean>;
  disableGyroscope: () => void;
  getRotation: () => { x: number; y: number; z: number };
  setRotation: (x: number, y: number, z: number) => void;
  addHotspot: (hotspot: Hotspot) => void;
  removeHotspot: (id: string) => void;
  getHotspots: () => Hotspot[];
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => void;
  isFullscreen: () => boolean;
  screenshot: (width?: number, height?: number) => string;
  setViewLimits: (limits: ViewLimits | null) => void;
  showMiniMap: () => void;
  hideMiniMap: () => void;
  toggleMiniMap: () => void;
}

export const PanoramaViewer = forwardRef<PanoramaViewerRef, PanoramaViewerProps>(
  (props, ref) => {
    const {
      image,
      format = 'equirectangular',
      fov = 75,
      minFov = 30,
      maxFov = 100,
      autoRotate = false,
      autoRotateSpeed = 0.5,
      gyroscope = true,
      width = '100%',
      height = '500px',
      className,
      style,
      viewLimits = null,
      keyboardControls = true,
      renderOnDemand = true,
      showMiniMap = true,
      onReady,
      onError,
      onProgress,
      onHotspotClick,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<CoreViewer | null>(null);

    // Initialize viewer
    useEffect(() => {
      if (!containerRef.current) return;

      try {
        const options: ViewerOptions = {
          container: containerRef.current,
          image,
          format,
          fov,
          minFov,
          maxFov,
          autoRotate,
          autoRotateSpeed,
          gyroscope,
          viewLimits,
          keyboardControls,
          renderOnDemand,
          onProgress,
        };

        viewerRef.current = new CoreViewer(options);

        // Setup hotspot click listener
        const hotspotClickHandler = ((e: CustomEvent) => {
          if (onHotspotClick) {
            onHotspotClick(e.detail.hotspot);
          }
        }) as EventListener;

        containerRef.current.addEventListener('hotspotclick', hotspotClickHandler);

        // Set initial minimap visibility
        if (!showMiniMap && viewerRef.current) {
          viewerRef.current.hideMiniMap();
        }

        onReady?.();

        return () => {
          if (containerRef.current) {
            containerRef.current.removeEventListener('hotspotclick', hotspotClickHandler);
          }
          if (viewerRef.current) {
            viewerRef.current.dispose();
            viewerRef.current = null;
          }
        };
      } catch (error) {
        onError?.(error as Error);
      }
    }, []); // Only initialize once

    // Handle image changes
    useEffect(() => {
      if (viewerRef.current) {
        viewerRef.current.loadImage(image, true).catch((error) => {
          onError?.(error as Error);
        });
      }
    }, [image, onError]);

    // Handle autoRotate changes
    useEffect(() => {
      if (viewerRef.current) {
        if (autoRotate) {
          viewerRef.current.enableAutoRotate();
        } else {
          viewerRef.current.disableAutoRotate();
        }
      }
    }, [autoRotate]);

    // Handle viewLimits changes
    useEffect(() => {
      if (viewerRef.current) {
        viewerRef.current.setViewLimits(viewLimits);
      }
    }, [viewLimits]);

    // Handle minimap visibility
    useEffect(() => {
      if (viewerRef.current) {
        if (showMiniMap) {
          viewerRef.current.showMiniMap();
        } else {
          viewerRef.current.hideMiniMap();
        }
      }
    }, [showMiniMap]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      loadImage: async (url: string | CubemapImages, transition = false) => {
        if (viewerRef.current) {
          await viewerRef.current.loadImage(url, transition);
        }
      },
      reset: () => {
        if (viewerRef.current) {
          viewerRef.current.reset();
        }
      },
      enableAutoRotate: () => {
        if (viewerRef.current) {
          viewerRef.current.enableAutoRotate();
        }
      },
      disableAutoRotate: () => {
        if (viewerRef.current) {
          viewerRef.current.disableAutoRotate();
        }
      },
      enableGyroscope: async () => {
        if (viewerRef.current) {
          return await viewerRef.current.enableGyroscope();
        }
        return false;
      },
      disableGyroscope: () => {
        if (viewerRef.current) {
          viewerRef.current.disableGyroscope();
        }
      },
      getRotation: () => {
        if (viewerRef.current) {
          return viewerRef.current.getRotation();
        }
        return { x: 0, y: 0, z: 0 };
      },
      setRotation: (x: number, y: number, z: number) => {
        if (viewerRef.current) {
          viewerRef.current.setRotation(x, y, z);
        }
      },
      addHotspot: (hotspot: Hotspot) => {
        if (viewerRef.current) {
          viewerRef.current.addHotspot(hotspot);
        }
      },
      removeHotspot: (id: string) => {
        if (viewerRef.current) {
          viewerRef.current.removeHotspot(id);
        }
      },
      getHotspots: () => {
        if (viewerRef.current) {
          return viewerRef.current.getHotspots();
        }
        return [];
      },
      enterFullscreen: async () => {
        if (viewerRef.current) {
          await viewerRef.current.enterFullscreen();
        }
      },
      exitFullscreen: () => {
        if (viewerRef.current) {
          viewerRef.current.exitFullscreen();
        }
      },
      isFullscreen: () => {
        if (viewerRef.current) {
          return viewerRef.current.isFullscreen();
        }
        return false;
      },
      screenshot: (width?: number, height?: number) => {
        if (viewerRef.current) {
          return viewerRef.current.screenshot(width, height);
        }
        return '';
      },
      setViewLimits: (limits: ViewLimits | null) => {
        if (viewerRef.current) {
          viewerRef.current.setViewLimits(limits);
        }
      },
      showMiniMap: () => {
        if (viewerRef.current) {
          viewerRef.current.showMiniMap();
        }
      },
      hideMiniMap: () => {
        if (viewerRef.current) {
          viewerRef.current.hideMiniMap();
        }
      },
      toggleMiniMap: () => {
        if (viewerRef.current) {
          viewerRef.current.toggleMiniMap();
        }
      },
    }));

    const containerStyle: CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    return <div ref={containerRef} className={className} style={containerStyle} />;
  }
);

PanoramaViewer.displayName = 'PanoramaViewer';

export default PanoramaViewer;
