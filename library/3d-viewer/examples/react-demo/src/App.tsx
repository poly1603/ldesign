import React, { useRef, useState } from 'react';
import { PanoramaViewer, PanoramaViewerRef } from '@panorama-viewer/react';
import type { Hotspot, ViewLimits } from '@panorama-viewer/core';
import './App.css';

const images = [
  'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
  'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
];

function App() {
  const viewerRef = useRef<PanoramaViewerRef>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewLimits, setViewLimits] = useState<ViewLimits | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [lastHotspotClick, setLastHotspotClick] = useState<Hotspot | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hotspotCounter, setHotspotCounter] = useState(0);

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  const reset = () => {
    viewerRef.current?.reset();
  };

  const enableGyroscope = async () => {
    const success = await viewerRef.current?.enableGyroscope();
    if (success) {
      alert('✅ Gyroscope enabled!');
    } else {
      alert('❌ Gyroscope not available or permission denied');
    }
  };

  const toggleFullscreenMode = async () => {
    if (isFullscreen) {
      viewerRef.current?.exitFullscreen();
      setIsFullscreen(false);
    } else {
      await viewerRef.current?.enterFullscreen();
      setIsFullscreen(true);
    }
  };

  const toggleMiniMapVisibility = () => {
    setShowMiniMap(!showMiniMap);
  };

  const takeScreenshot = () => {
    const dataURL = viewerRef.current?.screenshot(1920, 1080);
    if (dataURL) {
      const link = document.createElement('a');
      link.download = 'panorama-screenshot.png';
      link.href = dataURL;
      link.click();
      alert('📸 Screenshot captured and downloaded!');
    }
  };

  const addDemoHotspot = () => {
    const newHotspot: Hotspot = {
      id: `hotspot-${hotspotCounter + 1}`,
      position: {
        theta: Math.random() * Math.PI * 2,
        phi: Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5,
      },
      label: `📍 #${hotspotCounter + 1}`,
      data: { name: `Point of Interest ${hotspotCounter + 1}` },
    };
    
    viewerRef.current?.addHotspot(newHotspot);
    const allHotspots = viewerRef.current?.getHotspots() || [];
    setHotspots(allHotspots);
    setHotspotCounter(hotspotCounter + 1);
  };

  const removeAllHotspots = () => {
    hotspots.forEach(h => viewerRef.current?.removeHotspot(h.id));
    setHotspots([]);
    setHotspotCounter(0);
  };

  const setHorizontalLimit = () => {
    const limits: ViewLimits = {
      minTheta: -Math.PI / 4,
      maxTheta: Math.PI / 4,
    };
    setViewLimits(limits);
    alert('↔️ Horizontal rotation limited to ±45°');
  };

  const setVerticalLimit = () => {
    const limits: ViewLimits = {
      minPhi: Math.PI / 3,
      maxPhi: (2 * Math.PI) / 3,
    };
    setViewLimits(limits);
    alert('↕️ Vertical rotation limited');
  };

  const clearLimits = () => {
    setViewLimits(null);
    alert('🔓 All rotation limits cleared');
  };

  const changeImage = (index: number) => {
    setLoadingProgress(0);
    setCurrentImageIndex(index);
  };

  const handleReady = () => {
    console.log('✅ Viewer ready!');
  };

  const handleError = (error: Error) => {
    console.error('❌ Viewer error:', error);
    alert(`Error: ${error.message}`);
  };

  const handleProgress = (progress: number) => {
    setLoadingProgress(progress);
    if (progress >= 100) {
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
    }
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    setLastHotspotClick(hotspot);
    alert(`🎯 Clicked: ${hotspot.label}\nData: ${JSON.stringify(hotspot.data)}`);
  };

  return (
    <div className="app">
      <h1>React Panorama Viewer Demo - Enhanced</h1>
      
      <div className="controls-grid">
        <div className="control-section">
          <h3>Basic Controls</h3>
          <button onClick={toggleAutoRotate}>
            {autoRotate ? '⏸️ Stop' : '▶️ Start'} Rotation
          </button>
          <button onClick={reset}>🔄 Reset View</button>
          <button onClick={enableGyroscope}>📱 Enable Gyroscope</button>
        </div>

        <div className="control-section">
          <h3>Advanced Features</h3>
          <button onClick={toggleFullscreenMode}>
            {isFullscreen ? '⬜ Exit' : '⛶ Enter'} Fullscreen
          </button>
          <button onClick={toggleMiniMapVisibility}>
            {showMiniMap ? '🗺️ Hide' : '🗺️ Show'} Mini Map
          </button>
          <button onClick={takeScreenshot}>📷 Screenshot</button>
        </div>

        <div className="control-section">
          <h3>Hotspots</h3>
          <button onClick={addDemoHotspot}>📍 Add Hotspot</button>
          <button onClick={removeAllHotspots}>🗑️ Remove All</button>
          <span className="info-text">{hotspots.length} hotspots</span>
        </div>

        <div className="control-section">
          <h3>View Limits</h3>
          <button onClick={setHorizontalLimit}>↔️ Limit Horizontal</button>
          <button onClick={setVerticalLimit}>↕️ Limit Vertical</button>
          <button onClick={clearLimits}>🔓 Clear Limits</button>
        </div>

        <div className="control-section">
          <h3>Images</h3>
          <button onClick={() => changeImage(0)}>🏔️ Mountain</button>
          <button onClick={() => changeImage(1)}>🌃 Night</button>
        </div>
      </div>

      {loadingProgress > 0 && loadingProgress < 100 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <span className="progress-text">Loading: {Math.round(loadingProgress)}%</span>
        </div>
      )}

      <PanoramaViewer
        ref={viewerRef}
        image={images[currentImageIndex]}
        autoRotate={autoRotate}
        fov={75}
        viewLimits={viewLimits}
        showMiniMap={showMiniMap}
        width="100%"
        height="600px"
        onReady={handleReady}
        onError={handleError}
        onProgress={handleProgress}
        onHotspotClick={handleHotspotClick}
      />

      <div className="info-panel">
        <div className="info-row">
          <strong>Controls:</strong>
          <ul>
            <li><strong>Mouse:</strong> Click + drag to rotate, wheel to zoom</li>
            <li><strong>Keyboard:</strong> Arrow keys to rotate, +/- to zoom</li>
            <li><strong>Touch:</strong> Single finger to rotate, pinch to zoom</li>
            <li><strong>Mobile:</strong> Device orientation (with permission)</li>
          </ul>
        </div>
        
        {lastHotspotClick && (
          <div className="info-row">
            <strong>Last Hotspot Clicked:</strong> {lastHotspotClick.label}
          </div>
        )}

        <div className="info-row">
          <strong>New Features:</strong>
          <ul>
            <li>✅ Keyboard controls with arrow keys</li>
            <li>✅ Mini-map with compass orientation</li>
            <li>✅ Interactive hotspots with custom markers</li>
            <li>✅ Full-screen mode support</li>
            <li>✅ Screenshot capture</li>
            <li>✅ View angle restrictions</li>
            <li>✅ Smooth image transitions</li>
            <li>✅ Loading progress indicator</li>
            <li>✅ Performance optimizations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
