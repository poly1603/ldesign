/**
 * Ultra smooth liquid style - simplified implementation
 */

/**
 * Render ultra smooth style on canvas using metaball technique
 */
export function renderUltraSmoothCanvas(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  const canvas = ctx.canvas;
  
  // Create off-screen canvas for smoother rendering
  const offCanvas = document.createElement('canvas');
  offCanvas.width = canvas.width;
  offCanvas.height = canvas.height;
  const offCtx = offCanvas.getContext('2d')!;
  
  // Copy fill style
  offCtx.fillStyle = ctx.fillStyle;
  
  // Draw each module as a circle with overlap for metaball effect
  const radius = moduleSize * 0.7; // Larger radius for more overlap
  
  // First pass: draw all circles
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const x = (col + margin) * moduleSize + moduleSize / 2;
        const y = (row + margin) * moduleSize + moduleSize / 2;
        
        offCtx.beginPath();
        offCtx.arc(x, y, radius, 0, Math.PI * 2);
        offCtx.fill();
      }
    }
  }
  
  // Apply threshold filter to create metaball effect
  const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
  const data = imageData.data;
  
  // Apply threshold
  const threshold = 128;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > threshold) {
      data[i + 3] = 255;
    } else {
      data[i + 3] = 0;
    }
  }
  
  // Apply smoothing
  for (let pass = 0; pass < 2; pass++) {
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < offCanvas.height - 1; y++) {
      for (let x = 1; x < offCanvas.width - 1; x++) {
        const idx = (y * offCanvas.width + x) * 4 + 3; // Alpha channel
        
        // Average with neighbors
        let sum = 0;
        let count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * offCanvas.width + (x + dx)) * 4 + 3;
            sum += tempData[nIdx];
            count++;
          }
        }
        
        data[idx] = Math.round(sum / count);
      }
    }
  }
  
  // Put processed image back
  offCtx.putImageData(imageData, 0, 0);
  
  // Draw to main canvas with smoothing
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(offCanvas, 0, 0);
  ctx.restore();
}

/**
 * Alternative implementation using connected components
 */
export function renderUltraSmoothConnected(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  
  // Find connected components
  const visited = new Set<string>();
  const components: Array<Array<{row: number, col: number}>> = [];
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const key = `${row},${col}`;
      if (modules[row][col] && !visited.has(key)) {
        const component = findComponent(modules, row, col, visited);
        if (component.length > 0) {
          components.push(component);
        }
      }
    }
  }
  
  // Draw each component as a smooth blob
  components.forEach(component => {
    drawSmoothBlob(ctx, component, moduleSize, margin);
  });
}

/**
 * Find connected component using flood fill
 */
function findComponent(
  modules: boolean[][],
  startRow: number,
  startCol: number,
  visited: Set<string>
): Array<{row: number, col: number}> {
  const component: Array<{row: number, col: number}> = [];
  const queue = [{row: startRow, col: startCol}];
  const moduleCount = modules.length;
  
  while (queue.length > 0) {
    const {row, col} = queue.shift()!;
    const key = `${row},${col}`;
    
    if (visited.has(key)) continue;
    if (row < 0 || row >= moduleCount || col < 0 || col >= moduleCount) continue;
    if (!modules[row][col]) continue;
    
    visited.add(key);
    component.push({row, col});
    
    // Check 8-connected neighbors
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        queue.push({row: row + dr, col: col + dc});
      }
    }
  }
  
  return component;
}

/**
 * Draw a smooth blob for a component
 */
function drawSmoothBlob(
  ctx: CanvasRenderingContext2D,
  component: Array<{row: number, col: number}>,
  moduleSize: number,
  margin: number
): void {
  if (component.length === 0) return;
  
  ctx.save();
  
  if (component.length === 1) {
    // Single module - draw as circle
    const m = component[0];
    const x = (m.col + margin) * moduleSize + moduleSize / 2;
    const y = (m.row + margin) * moduleSize + moduleSize / 2;
    
    ctx.beginPath();
    ctx.arc(x, y, moduleSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Multiple modules - create smooth path
    const points: Array<{x: number, y: number}> = [];
    
    // Generate hull points
    component.forEach(m => {
      const cx = (m.col + margin) * moduleSize + moduleSize / 2;
      const cy = (m.row + margin) * moduleSize + moduleSize / 2;
      
      // Add points around each module
      const radius = moduleSize * 0.6;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        points.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius
        });
      }
    });
    
    // Find convex hull
    const hull = convexHull(points);
    
    // Draw smooth path through hull points
    if (hull.length >= 3) {
      ctx.beginPath();
      
      // Use quadratic curves for smoother path
      ctx.moveTo(hull[0].x, hull[0].y);
      
      for (let i = 0; i < hull.length; i++) {
        const p1 = hull[i];
        const p2 = hull[(i + 1) % hull.length];
        const p3 = hull[(i + 2) % hull.length];
        
        const cp1x = (p1.x + p2.x) / 2;
        const cp1y = (p1.y + p2.y) / 2;
        const cp2x = (p2.x + p3.x) / 2;
        const cp2y = (p2.y + p3.y) / 2;
        
        ctx.quadraticCurveTo(p2.x, p2.y, cp2x, cp2y);
      }
      
      ctx.closePath();
      ctx.fill();
    }
  }
  
  ctx.restore();
}

/**
 * Calculate convex hull using Graham scan
 */
function convexHull(points: Array<{x: number, y: number}>): Array<{x: number, y: number}> {
  if (points.length < 3) return points;
  
  // Find the point with lowest y-coordinate
  let lowest = points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < lowest.y || (points[i].y === lowest.y && points[i].x < lowest.x)) {
      lowest = points[i];
    }
  }
  
  // Sort points by polar angle with respect to lowest point
  const sorted = points.filter(p => p !== lowest).sort((a, b) => {
    const angleA = Math.atan2(a.y - lowest.y, a.x - lowest.x);
    const angleB = Math.atan2(b.y - lowest.y, b.x - lowest.x);
    return angleA - angleB;
  });
  
  // Build hull
  const hull = [lowest];
  
  for (const point of sorted) {
    while (hull.length > 1) {
      const p1 = hull[hull.length - 2];
      const p2 = hull[hull.length - 1];
      
      // Check if we make a counter-clockwise turn
      const cross = (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x);
      
      if (cross <= 0) {
        hull.pop();
      } else {
        break;
      }
    }
    
    hull.push(point);
  }
  
  return hull;
}