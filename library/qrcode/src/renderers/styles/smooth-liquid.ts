/**
 * Ultra-smooth liquid flow style implementation
 * Creates organic, flowing shapes similar to Anthony Fu's QR Toolkit
 */

interface Point {
  x: number;
  y: number;
}

interface Module {
  row: number;
  col: number;
}

/**
 * Generate smooth liquid-style path for connected QR modules
 */
export function generateSmoothLiquidPath(
  modules: boolean[][],
  moduleSize: number,
  margin: number
): string {
  const moduleCount = modules.length;
  const paths: string[] = [];
  const visited = new Set<string>();
  
  // Find all connected regions
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const key = `${row},${col}`;
      if (modules[row][col] && !visited.has(key)) {
        const region = findConnectedRegion(modules, row, col, visited);
        if (region.length > 0) {
          const path = createSmoothPathForRegion(region, moduleSize, margin);
          paths.push(path);
        }
      }
    }
  }
  
  return paths.join(' ');
}

/**
 * Find all modules in a connected region using flood fill
 */
function findConnectedRegion(
  modules: boolean[][],
  startRow: number,
  startCol: number,
  visited: Set<string>
): Module[] {
  const region: Module[] = [];
  const moduleCount = modules.length;
  const queue: {row: number, col: number}[] = [{row: startRow, col: startCol}];
  
  while (queue.length > 0) {
    const {row, col} = queue.shift()!;
    const key = `${row},${col}`;
    
    if (visited.has(key)) continue;
    if (row < 0 || row >= moduleCount || col < 0 || col >= moduleCount) continue;
    if (!modules[row][col]) continue;
    
    visited.add(key);
  region.push({row, col});
    
    // Check 8-connected neighbors for smoother connections
    const neighbors = [
      {row: row - 1, col: col},     // top
      {row: row - 1, col: col + 1}, // top-right
      {row: row, col: col + 1},     // right
      {row: row + 1, col: col + 1}, // bottom-right
      {row: row + 1, col: col},     // bottom
      {row: row + 1, col: col - 1}, // bottom-left
      {row: row, col: col - 1},     // left
      {row: row - 1, col: col - 1}  // top-left
    ];
    
    for (const n of neighbors) {
      const nKey = `${n.row},${n.col}`;
      if (!visited.has(nKey)) {
        queue.push(n);
      }
    }
  }
  
  return region;
}

/**
 * Create a smooth path for a connected region using metaballs technique
 */
function createSmoothPathForRegion(
  region: Module[],
  moduleSize: number,
  margin: number
): string {
  if (region.length === 0) return '';
  
  // For single modules, just return a circle
  if (region.length === 1) {
    const m = region[0];
    const cx = (m.col + margin) * moduleSize + moduleSize / 2;
    const cy = (m.row + margin) * moduleSize + moduleSize / 2;
    const r = moduleSize * 0.37;
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
  }
  
  // Generate contour using marching squares algorithm
  const contour = generateContour(region, moduleSize, margin);
  
  // Smooth the contour
  const smoothedContour = smoothContour(contour, 3);
  
  // Convert to SVG path
  return contourToPath(smoothedContour);
}

/**
 * Generate contour points for the region using marching squares
 */
function generateContour(
  region: Module[],
  moduleSize: number,
  margin: number
): Point[] {
  const points: Point[] = [];
  const regionSet = new Set(region.map(m => `${m.row},${m.col}`));
  
  // Create a grid with padding for marching squares
  const minRow = Math.min(...region.map(m => m.row));
  const maxRow = Math.max(...region.map(m => m.row));
  const minCol = Math.min(...region.map(m => m.col));
  const maxCol = Math.max(...region.map(m => m.col));
  
  const gridWidth = maxCol - minCol + 3;
  const gridHeight = maxRow - minRow + 3;
  
  // Create field values for metaball effect
  const field: number[][] = [];
  for (let y = 0; y < gridHeight * 10; y++) {
    field[y] = [];
    for (let x = 0; x < gridWidth * 10; x++) {
      field[y][x] = 0;
    }
  }
  
  // Calculate field values based on distance to modules
  const threshold = 0.5;
  const radius = moduleSize * 0.6;
  
  for (const module of region) {
    const centerX = (module.col - minCol + 1) * 10;
    const centerY = (module.row - minRow + 1) * 10;
    
    for (let y = 0; y < gridHeight * 10; y++) {
      for (let x = 0; x < gridWidth * 10; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Metaball formula
        if (dist < radius * 2) {
          field[y][x] += Math.pow(radius / Math.max(dist, 0.1), 2);
        }
      }
    }
  }
  
  // Find contour using marching squares
  const contourPoints: Point[] = [];
  
  for (let y = 0; y < gridHeight * 10 - 1; y++) {
    for (let x = 0; x < gridWidth * 10 - 1; x++) {
      const square = [
        field[y][x] >= threshold ? 1 : 0,
        field[y][x + 1] >= threshold ? 1 : 0,
        field[y + 1][x + 1] >= threshold ? 1 : 0,
        field[y + 1][x] >= threshold ? 1 : 0
      ];
      
      const caseIndex = square[0] * 8 + square[1] * 4 + square[2] * 2 + square[3];
      
      // Add contour points based on marching squares case
      if (caseIndex > 0 && caseIndex < 15) {
        const px = ((x / 10) + minCol - 0.5 + margin) * moduleSize;
        const py = ((y / 10) + minRow - 0.5 + margin) * moduleSize;
        
        // This is simplified - a full implementation would handle all 16 cases
        if (caseIndex === 1 || caseIndex === 14) {
          contourPoints.push({x: px, y: py + moduleSize * 0.5});
          contourPoints.push({x: px + moduleSize * 0.5, y: py});
        } else if (caseIndex === 2 || caseIndex === 13) {
          contourPoints.push({x: px + moduleSize * 0.5, y: py});
          contourPoints.push({x: px + moduleSize, y: py + moduleSize * 0.5});
        }
        // ... more cases would be handled here
      }
    }
  }
  
  // If marching squares didn't work well, fall back to hull points
  if (contourPoints.length < 4) {
    return generateHullPoints(region, moduleSize, margin);
  }
  
  return contourPoints;
}

/**
 * Generate hull points as fallback
 */
function generateHullPoints(
  region: Module[],
  moduleSize: number,
  margin: number
): Point[] {
  const points: Point[] = [];
  const radius = moduleSize * 0.45;
  
  // Sort modules to create a proper outline
  const sorted = region.sort((a, b) => {
    const angleA = Math.atan2(a.row - region[0].row, a.col - region[0].col);
    const angleB = Math.atan2(b.row - region[0].row, b.col - region[0].col);
    return angleA - angleB;
  });
  
  // Generate smooth points around each module
  for (const module of sorted) {
    const cx = (module.col + margin) * moduleSize + moduleSize / 2;
    const cy = (module.row + margin) * moduleSize + moduleSize / 2;
    
    // Add multiple points around each module for smoothness
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    }
  }
  
  return points;
}

/**
 * Smooth contour using Chaikin's algorithm
 */
function smoothContour(points: Point[], iterations: number): Point[] {
  let smoothed = [...points];
  
  for (let iter = 0; iter < iterations; iter++) {
    const newPoints: Point[] = [];
    
    for (let i = 0; i < smoothed.length; i++) {
      const p1 = smoothed[i];
      const p2 = smoothed[(i + 1) % smoothed.length];
      
      // Add two points between each pair (Chaikin's algorithm)
      newPoints.push({
        x: 0.75 * p1.x + 0.25 * p2.x,
        y: 0.75 * p1.y + 0.25 * p2.y
      });
      newPoints.push({
        x: 0.25 * p1.x + 0.75 * p2.x,
        y: 0.25 * p1.y + 0.75 * p2.y
      });
    }
    
    smoothed = newPoints;
  }
  
  return smoothed;
}

/**
 * Convert contour points to SVG path using Catmull-Rom splines
 */
function contourToPath(points: Point[]): string {
  if (points.length < 3) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  // Use Catmull-Rom splines for ultra-smooth curves
  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];
    
    // Calculate control points for cubic bezier from Catmull-Rom
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  
  path += ' Z';
  return path;
}

/**
 * Render smooth liquid style on canvas
 */
export function renderSmoothLiquidCanvas(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  const canvasSize = (moduleCount + margin * 2) * moduleSize;
  
  // Create temporary canvas for rendering
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasSize;
  tempCanvas.height = canvasSize;
  const tempCtx = tempCanvas.getContext('2d')!;
  
  // Copy fill style
  tempCtx.fillStyle = ctx.fillStyle;
  
  // Draw using simple metaball approach
  const visited = new Set<string>();
  
  // Find and draw connected regions
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const key = `${row},${col}`;
      if (modules[row][col] && !visited.has(key)) {
        const region = findConnectedRegion(modules, row, col, visited);
        if (region.length > 0) {
          drawMetaballRegion(tempCtx, region, moduleSize, margin);
        }
      }
    }
  }
  
  // Apply smoothing via filter
  tempCtx.filter = 'blur(1px)';
  tempCtx.drawImage(tempCanvas, 0, 0);
  
  // Draw to main canvas
  ctx.drawImage(tempCanvas, 0, 0, canvasSize, canvasSize, 
                0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Draw a metaball region on the canvas
 */
function drawMetaballRegion(
  ctx: CanvasRenderingContext2D,
  region: Module[],
  moduleSize: number,
  margin: number
): void {
  if (region.length === 0) return;
  
  // Single module - draw smooth circle
  if (region.length === 1) {
    const m = region[0];
    const cx = (m.col + margin) * moduleSize + moduleSize / 2;
    const cy = (m.row + margin) * moduleSize + moduleSize / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, moduleSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  
  // Multiple modules - create metaball effect
  const resolution = 2; // Lower resolution for performance
  const threshold = 0.5;
  const radius = moduleSize * 0.7;
  
  // Find bounding box
  const minRow = Math.min(...region.map(m => m.row));
  const maxRow = Math.max(...region.map(m => m.row));
  const minCol = Math.min(...region.map(m => m.col));
  const maxCol = Math.max(...region.map(m => m.col));
  
  const startX = (minCol + margin - 1) * moduleSize;
  const startY = (minRow + margin - 1) * moduleSize;
  const endX = (maxCol + margin + 2) * moduleSize;
  const endY = (maxRow + margin + 2) * moduleSize;
  
  // Create path for the region
  ctx.beginPath();
  
  // Sample points and check if inside metaball field
  const imageData = ctx.createImageData(
    Math.ceil((endX - startX) / resolution), 
    Math.ceil((endY - startY) / resolution)
  );
  const data = imageData.data;
  
  for (let y = startY; y < endY; y += resolution) {
    for (let x = startX; x < endX; x += resolution) {
      let fieldValue = 0;
      
      // Calculate metaball field value at this point
      for (const module of region) {
        const cx = (module.col + margin) * moduleSize + moduleSize / 2;
        const cy = (module.row + margin) * moduleSize + moduleSize / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < radius * 2) {
          // Metaball formula
          fieldValue += Math.pow(radius / Math.max(dist, 0.1), 2.2);
        }
      }
      
      // Draw pixel if above threshold
      if (fieldValue >= threshold) {
        const px = Math.floor((x - startX) / resolution);
        const py = Math.floor((y - startY) / resolution);
        if (px >= 0 && px < imageData.width && py >= 0 && py < imageData.height) {
          const idx = (py * imageData.width + px) * 4;
          const fillColor = parseColor(ctx.fillStyle);
          const alpha = Math.min(255, Math.floor(fieldValue * 127 + 128));
          data[idx] = fillColor.r;
          data[idx + 1] = fillColor.g;
          data[idx + 2] = fillColor.b;
          data[idx + 3] = alpha;
        }
      }
    }
  }
  
  // Create temporary canvas for this region
  const regionCanvas = document.createElement('canvas');
  regionCanvas.width = imageData.width;
  regionCanvas.height = imageData.height;
  const regionCtx = regionCanvas.getContext('2d')!;
  
  regionCtx.putImageData(imageData, 0, 0);
  
  // Draw back with smoothing
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(regionCanvas, 0, 0, regionCanvas.width, regionCanvas.height,
                startX, startY, endX - startX, endY - startY);
  ctx.restore();
}

/**
 * Parse color from various formats
 */
function parseColor(color: any): { r: number; g: number; b: number } {
  // Default color
  let r = 0, g = 0, b = 0;
  
  if (typeof color === 'string') {
    if (color.startsWith('#')) {
      // Hex color
      const hex = color.slice(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
    } else if (color.startsWith('rgb')) {
      // RGB color
      const match = color.match(/\d+/g);
      if (match) {
        r = parseInt(match[0]);
        g = parseInt(match[1]);
        b = parseInt(match[2]);
      }
    }
  }
  
  return { r, g, b };
}

/**
 * Apply Gaussian blur to image data
 */
function gaussianBlur(imageData: ImageData, width: number, height: number, radius: number): void {
  const data = imageData.data;
  const output = new Uint8ClampedArray(data);
  
  // Gaussian kernel
  const rs = Math.ceil(radius * 2.57);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let weightSum = 0;
      
      for (let iy = y - rs; iy < y + rs + 1; iy++) {
        for (let ix = x - rs; ix < x + rs + 1; ix++) {
          const px = Math.min(width - 1, Math.max(0, ix));
          const py = Math.min(height - 1, Math.max(0, iy));
          const dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
          const weight = Math.exp(-dsq / (2 * radius * radius)) / (Math.PI * 2 * radius * radius);
          
          const idx = (py * width + px) * 4;
          r += output[idx] * weight;
          g += output[idx + 1] * weight;
          b += output[idx + 2] * weight;
          a += output[idx + 3] * weight;
          weightSum += weight;
        }
      }
      
      const idx = (y * width + x) * 4;
      data[idx] = r / weightSum;
      data[idx + 1] = g / weightSum;
      data[idx + 2] = b / weightSum;
      data[idx + 3] = a / weightSum;
    }
  }
}

/**
 * Draw a smooth region on canvas (OLD - not used)
 */
function drawSmoothRegion(
  ctx: CanvasRenderingContext2D,
  region: Module[],
  moduleSize: number,
  margin: number
): void {
  if (region.length === 0) return;
  
  ctx.beginPath();
  
  // Single module - draw a circle
  if (region.length === 1) {
    const m = region[0];
    const cx = (m.col + margin) * moduleSize + moduleSize / 2;
    const cy = (m.row + margin) * moduleSize + moduleSize / 2;
    ctx.arc(cx, cy, moduleSize * 0.37, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  
  // Multiple modules - create smooth blob
  const radius = moduleSize * 0.5;
  const smoothness = 0.8;
  
  // Create metaball effect
  for (let i = 0; i < region.length; i++) {
    const m = region[i];
    const cx = (m.col + margin) * moduleSize + moduleSize / 2;
    const cy = (m.row + margin) * moduleSize + moduleSize / 2;
    
    // Check connections to neighbors
    let connections = 0;
    for (let j = 0; j < region.length; j++) {
      if (i === j) continue;
      const other = region[j];
      const dx = Math.abs(other.col - m.col);
      const dy = Math.abs(other.row - m.row);
      if (dx <= 1 && dy <= 1) connections++;
    }
    
    // Draw with variable radius based on connections
    const effectiveRadius = radius * (1 - connections * 0.05);
    
    if (i === 0) {
      ctx.moveTo(cx + effectiveRadius, cy);
    }
    
    // Create smooth connections between adjacent modules
    const nextIndex = (i + 1) % region.length;
    const next = region[nextIndex];
    const ncx = (next.col + margin) * moduleSize + moduleSize / 2;
    const ncy = (next.row + margin) * moduleSize + moduleSize / 2;
    
    const dx = ncx - cx;
    const dy = ncy - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < moduleSize * 2) {
      // Close modules - create smooth bridge
      const cp1x = cx + dx * 0.3;
      const cp1y = cy + dy * 0.3;
      const cp2x = cx + dx * 0.7;
      const cp2y = cy + dy * 0.7;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ncx, ncy);
    } else {
      // Far modules - use arc
      ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
    }
  }
  
  ctx.closePath();
  ctx.fill();
}