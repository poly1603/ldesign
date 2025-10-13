/**
 * Improved liquid flow style renderer
 * Creates smooth, organic flowing shapes with better clarity
 */

interface Point {
  x: number;
  y: number;
}

interface Metaball {
  x: number;
  y: number;
  radius: number;
}

/**
 * Main rendering function for improved liquid flow style
 */
export function renderImprovedLiquidFlow(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  const canvasSize = (moduleCount + margin * 2) * moduleSize;
  
  // Create metaballs for each module
  const metaballs: Metaball[] = [];
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const x = (col + margin) * moduleSize + moduleSize / 2;
        const y = (row + margin) * moduleSize + moduleSize / 2;
        metaballs.push({
          x,
          y,
          radius: moduleSize * 0.65 // Increased radius for better connection
        });
      }
    }
  }
  
  // Create high-resolution temporary canvas
  const scale = 3; // Reduced from 4 to minimize blur
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasSize * scale;
  tempCanvas.height = canvasSize * scale;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  
  // Enable high-quality rendering
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';
  tempCtx.scale(scale, scale);
  
  // Use marching squares to create smooth contours
  renderMetaballsWithMarchingSquares(tempCtx, metaballs, canvasSize, moduleSize);
  
  // Apply minimal smoothing
  applySubtleSmoothing(tempCtx, tempCanvas.width, tempCanvas.height, scale);
  
  // Draw back to main canvas
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tempCanvas, 0, 0, canvasSize, canvasSize);
  ctx.restore();
}

/**
 * Render metaballs using marching squares algorithm
 */
function renderMetaballsWithMarchingSquares(
  ctx: CanvasRenderingContext2D,
  metaballs: Metaball[],
  canvasSize: number,
  moduleSize: number
): void {
  const resolution = moduleSize / 4; // Grid resolution for marching squares
  const gridWidth = Math.ceil(canvasSize / resolution);
  const gridHeight = Math.ceil(canvasSize / resolution);
  
  // Calculate field values
  const field: number[][] = [];
  for (let y = 0; y <= gridHeight; y++) {
    field[y] = [];
    for (let x = 0; x <= gridWidth; x++) {
      const px = x * resolution;
      const py = y * resolution;
      field[y][x] = calculateFieldValue(px, py, metaballs);
    }
  }
  
  // Apply marching squares
  const threshold = 1.0; // Threshold for metaball surface
  ctx.fillStyle = '#000000';
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const px = x * resolution;
      const py = y * resolution;
      
      // Get corner values
      const topLeft = field[y][x];
      const topRight = field[y][x + 1];
      const bottomRight = field[y + 1][x + 1];
      const bottomLeft = field[y + 1][x];
      
      // Determine case
      const caseIndex = 
        (topLeft >= threshold ? 8 : 0) +
        (topRight >= threshold ? 4 : 0) +
        (bottomRight >= threshold ? 2 : 0) +
        (bottomLeft >= threshold ? 1 : 0);
      
      // Draw based on case using smooth interpolation
      drawMarchingSquareCell(
        ctx,
        caseIndex,
        px, py, resolution,
        topLeft, topRight, bottomRight, bottomLeft,
        threshold
      );
    }
  }
}

/**
 * Calculate field value at a point based on metaballs
 */
function calculateFieldValue(x: number, y: number, metaballs: Metaball[]): number {
  let sum = 0;
  
  for (const ball of metaballs) {
    const dx = x - ball.x;
    const dy = y - ball.y;
    const distSq = dx * dx + dy * dy;
    
    if (distSq < ball.radius * ball.radius * 4) {
      // Modified metaball equation for smoother blending
      const influence = ball.radius * ball.radius / Math.max(distSq, 1);
      sum += influence;
    }
  }
  
  return sum;
}

/**
 * Draw a single marching square cell with smooth interpolation
 */
function drawMarchingSquareCell(
  ctx: CanvasRenderingContext2D,
  caseIndex: number,
  x: number,
  y: number,
  size: number,
  v0: number,
  v1: number,
  v2: number,
  v3: number,
  threshold: number
): void {
  // Linear interpolation for smooth edges
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const getT = (v1: number, v2: number) => (threshold - v1) / (v2 - v1);
  
  // Handle all 16 marching squares cases
  switch (caseIndex) {
    case 0: // All corners outside
      break;
    
    case 1: // Bottom-left inside
      {
        const t1 = getT(v3, v0);
        const t2 = getT(v3, v2);
        ctx.beginPath();
        ctx.moveTo(x, y + size * (1 - t1));
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size * t2, y + size);
        ctx.closePath();
        ctx.fill();
      }
      break;
    
    case 2: // Bottom-right inside
      {
        const t1 = getT(v2, v1);
        const t2 = getT(v2, v3);
        ctx.beginPath();
        ctx.moveTo(x + size, y + size * (1 - t1));
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x + size * (1 - t2), y + size);
        ctx.closePath();
        ctx.fill();
      }
      break;
    
    case 3: // Bottom edge inside
      ctx.beginPath();
      ctx.moveTo(x, y + size * (1 - getT(v3, v0)));
      ctx.lineTo(x, y + size);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x + size, y + size * (1 - getT(v2, v1)));
      ctx.closePath();
      ctx.fill();
      break;
    
    case 4: // Top-right inside
      {
        const t1 = getT(v1, v0);
        const t2 = getT(v1, v2);
        ctx.beginPath();
        ctx.moveTo(x + size * (1 - t1), y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size, y + size * t2);
        ctx.closePath();
        ctx.fill();
      }
      break;
    
    case 5: // Diagonal case
      {
        const t0 = getT(v3, v0);
        const t1 = getT(v1, v0);
        const t2 = getT(v1, v2);
        const t3 = getT(v3, v2);
        
        // Draw two triangles
        ctx.beginPath();
        ctx.moveTo(x, y + size * (1 - t0));
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size * t3, y + size);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + size * (1 - t1), y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size, y + size * t2);
        ctx.closePath();
        ctx.fill();
      }
      break;
    
    case 6: // Right edge inside
      ctx.beginPath();
      ctx.moveTo(x + size * (1 - getT(v1, v0)), y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x + size * (1 - getT(v2, v3)), y + size);
      ctx.closePath();
      ctx.fill();
      break;
    
    case 7: // All except top-left
      ctx.beginPath();
      ctx.moveTo(x, y + size * (1 - getT(v3, v0)));
      ctx.lineTo(x + size * (1 - getT(v1, v0)), y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x, y + size);
      ctx.closePath();
      ctx.fill();
      break;
    
    case 8: // Top-left inside
      {
        const t1 = getT(v0, v1);
        const t2 = getT(v0, v3);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size * t1, y);
        ctx.lineTo(x, y + size * t2);
        ctx.closePath();
        ctx.fill();
      }
      break;
    
    case 9: // Left edge inside
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size * getT(v0, v1), y);
      ctx.lineTo(x + size * getT(v3, v2), y + size);
      ctx.lineTo(x, y + size);
      ctx.closePath();
      ctx.fill();
      break;
    
    case 10: // Diagonal case (opposite)
      {
        const t0 = getT(v0, v1);
        const t1 = getT(v2, v1);
        const t2 = getT(v2, v3);
        const t3 = getT(v0, v3);
        
        // Draw two triangles
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size * t0, y);
        ctx.lineTo(x, y + size * t3);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + size, y + size * (1 - t1));
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x + size * (1 - t2), y + size);
        ctx.closePath();
        ctx.fill();
      }
      break;
    
    case 11: // All except top-right
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size * (1 - getT(v1, v0)), y);
      ctx.lineTo(x + size, y + size * (1 - getT(v2, v1)));
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x, y + size);
      ctx.closePath();
      ctx.fill();
      break;
    
    case 12: // Top edge inside
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size * getT(v1, v2));
      ctx.lineTo(x, y + size * getT(v0, v3));
      ctx.closePath();
      ctx.fill();
      break;
    
    case 13: // All except bottom-right
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size * (1 - getT(v2, v1)));
      ctx.lineTo(x + size * (1 - getT(v2, v3)), y + size);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      break;
    
    case 14: // All except bottom-left
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x + size * getT(v3, v2), y + size);
      ctx.lineTo(x, y + size * (1 - getT(v3, v0)));
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      break;
    
    case 15: // All corners inside
      ctx.fillRect(x, y, size, size);
      break;
  }
}

/**
 * Apply subtle smoothing to reduce jaggies without losing detail
 */
function applySubtleSmoothing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number
): void {
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Apply small gaussian blur (radius 1-2 pixels)
  const blurRadius = Math.ceil(1.5 * scale);
  const blurred = new Uint8ClampedArray(data);
  
  // Simple box blur for performance (approximates Gaussian)
  for (let y = blurRadius; y < height - blurRadius; y++) {
    for (let x = blurRadius; x < width - blurRadius; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      
      // Sample surrounding pixels
      for (let dy = -blurRadius; dy <= blurRadius; dy++) {
        for (let dx = -blurRadius; dx <= blurRadius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
          count++;
        }
      }
      
      const idx = (y * width + x) * 4;
      blurred[idx] = r / count;
      blurred[idx + 1] = g / count;
      blurred[idx + 2] = b / count;
      blurred[idx + 3] = a / count;
    }
  }
  
  // Apply contrast adjustment to sharpen edges
  for (let i = 0; i < blurred.length; i += 4) {
    const alpha = blurred[i + 3];
    
    // Increase contrast with sigmoid function
    const normalized = alpha / 255;
    const contrast = 6; // Contrast strength
    const adjusted = 1 / (1 + Math.exp(-contrast * (normalized - 0.5)));
    
    blurred[i + 3] = adjusted * 255;
    
    // Keep RGB channels at full black
    if (adjusted > 0.1) {
      blurred[i] = 0;
      blurred[i + 1] = 0;
      blurred[i + 2] = 0;
    }
  }
  
  ctx.putImageData(new ImageData(blurred, width, height), 0, 0);
}

/**
 * Alternative implementation using connected regions
 */
export function renderLiquidWithRegions(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  const visited = new Set<string>();
  
  // Find all connected regions
  const regions: Array<Array<{row: number, col: number}>> = [];
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const key = `${row},${col}`;
      if (modules[row][col] && !visited.has(key)) {
        const region = findConnectedRegion(modules, row, col, visited);
        regions.push(region);
      }
    }
  }
  
  // Draw each region as a smooth blob
  ctx.fillStyle = '#000000';
  for (const region of regions) {
    drawSmoothRegion(ctx, region, moduleSize, margin);
  }
}

/**
 * Find connected region using flood fill
 */
function findConnectedRegion(
  modules: boolean[][],
  startRow: number,
  startCol: number,
  visited: Set<string>
): Array<{row: number, col: number}> {
  const region: Array<{row: number, col: number}> = [];
  const moduleCount = modules.length;
  const queue = [{row: startRow, col: startCol}];
  
  while (queue.length > 0) {
    const {row, col} = queue.shift()!;
    const key = `${row},${col}`;
    
    if (visited.has(key)) continue;
    if (row < 0 || row >= moduleCount || col < 0 || col >= moduleCount) continue;
    if (!modules[row][col]) continue;
    
    visited.add(key);
    region.push({row, col});
    
    // Check 8-connected neighbors
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        queue.push({row: row + dr, col: col + dc});
      }
    }
  }
  
  return region;
}

/**
 * Draw a smooth region using bezier curves
 */
function drawSmoothRegion(
  ctx: CanvasRenderingContext2D,
  region: Array<{row: number, col: number}>,
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
    ctx.arc(cx, cy, moduleSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  
  // Multiple modules - create smooth blob using convex hull and bezier curves
  const hull = getConvexHull(region);
  const points = hull.map(m => ({
    x: (m.col + margin) * moduleSize + moduleSize / 2,
    y: (m.row + margin) * moduleSize + moduleSize / 2
  }));
  
  // Expand points outward for smoother shape
  const expandedPoints = expandHullPoints(points, moduleSize * 0.4);
  
  // Draw smooth shape using quadratic bezier curves
  drawSmoothShape(ctx, expandedPoints);
}

/**
 * Get convex hull of points using Graham scan
 */
function getConvexHull(points: Array<{row: number, col: number}>): Array<{row: number, col: number}> {
  if (points.length <= 3) return points;
  
  // Find starting point (lowest y, then leftmost x)
  let start = points[0];
  for (const p of points) {
    if (p.row > start.row || (p.row === start.row && p.col < start.col)) {
      start = p;
    }
  }
  
  // Sort points by angle from start
  const sorted = points.filter(p => p !== start).sort((a, b) => {
    const angleA = Math.atan2(a.row - start.row, a.col - start.col);
    const angleB = Math.atan2(b.row - start.row, b.col - start.col);
    return angleA - angleB;
  });
  
  // Build hull
  const hull = [start];
  for (const p of sorted) {
    while (hull.length > 1) {
      const last = hull[hull.length - 1];
      const prev = hull[hull.length - 2];
      const cross = (last.col - prev.col) * (p.row - prev.row) - 
                   (last.row - prev.row) * (p.col - prev.col);
      if (cross <= 0) {
        hull.pop();
      } else {
        break;
      }
    }
    hull.push(p);
  }
  
  return hull;
}

/**
 * Expand hull points outward
 */
function expandHullPoints(points: Point[], radius: number): Point[] {
  const expanded: Point[] = [];
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    
    // Calculate normal vector
    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    
    // Average normal
    const nx = -(v1y + v2y) / 2;
    const ny = (v1x + v2x) / 2;
    const len = Math.sqrt(nx * nx + ny * ny);
    
    if (len > 0) {
      expanded.push({
        x: curr.x + (nx / len) * radius,
        y: curr.y + (ny / len) * radius
      });
    } else {
      expanded.push(curr);
    }
  }
  
  return expanded;
}

/**
 * Draw smooth shape using quadratic bezier curves
 */
function drawSmoothShape(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (points.length < 3) return;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const next = points[(i + 1) % n];
    const nextnext = points[(i + 2) % n];
    
    // Control point is between current and next point
    const cp = {
      x: (curr.x + next.x) / 2,
      y: (curr.y + next.y) / 2
    };
    
    // End point is between next and nextnext
    const end = {
      x: (next.x + nextnext.x) / 2,
      y: (next.y + nextnext.y) / 2
    };
    
    ctx.quadraticCurveTo(next.x, next.y, end.x, end.y);
  }
  
  ctx.closePath();
  ctx.fill();
}