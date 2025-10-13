/**
 * Ultra smooth liquid style - stable implementation
 * Creates consistent, smooth, ink-like flowing effect
 */

/**
 * Render ultra smooth style using stable metaball technique
 */
export function renderUltraSmoothStable(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  
  // Find all connected components first
  const visited = new Set<string>();
  const components: Array<Array<{row: number, col: number}>> = [];
  
  // Find connected regions using flood fill
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const key = `${row},${col}`;
      if (modules[row][col] && !visited.has(key)) {
        const component = findConnectedComponent(
          modules,
          row,
          col,
          visited,
          moduleCount
        );
        if (component.length > 0) {
          components.push(component);
        }
      }
    }
  }
  
  // Draw each component as a smooth blob
  ctx.save();
  
  components.forEach(component => {
    drawSmoothComponent(ctx, component, moduleSize, margin);
  });
  
  ctx.restore();
}

/**
 * Find connected component using BFS
 */
function findConnectedComponent(
  modules: boolean[][],
  startRow: number,
  startCol: number,
  visited: Set<string>,
  moduleCount: number
): Array<{row: number, col: number}> {
  const component: Array<{row: number, col: number}> = [];
  const queue = [{row: startRow, col: startCol}];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.row},${current.col}`;
    
    if (visited.has(key)) continue;
    if (current.row < 0 || current.row >= moduleCount) continue;
    if (current.col < 0 || current.col >= moduleCount) continue;
    if (!modules[current.row][current.col]) continue;
    
    visited.add(key);
    component.push(current);
    
    // Check 8 neighbors for smoother connections
    const neighbors = [
      {row: current.row - 1, col: current.col},     // top
      {row: current.row - 1, col: current.col + 1}, // top-right
      {row: current.row, col: current.col + 1},     // right
      {row: current.row + 1, col: current.col + 1}, // bottom-right
      {row: current.row + 1, col: current.col},     // bottom
      {row: current.row + 1, col: current.col - 1}, // bottom-left
      {row: current.row, col: current.col - 1},     // left
      {row: current.row - 1, col: current.col - 1}  // top-left
    ];
    
    neighbors.forEach(n => {
      const nKey = `${n.row},${n.col}`;
      if (!visited.has(nKey)) {
        queue.push(n);
      }
    });
  }
  
  return component;
}

/**
 * Draw a smooth component using metaball-like technique
 */
function drawSmoothComponent(
  ctx: CanvasRenderingContext2D,
  component: Array<{row: number, col: number}>,
  moduleSize: number,
  margin: number
): void {
  if (component.length === 0) return;
  
  // Single module - draw as smooth circle
  if (component.length === 1) {
    const m = component[0];
    const cx = (m.col + margin) * moduleSize + moduleSize / 2;
    const cy = (m.row + margin) * moduleSize + moduleSize / 2;
    
    ctx.beginPath();
    ctx.arc(cx, cy, moduleSize * 0.37, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  
  // Multiple modules - create smooth merged shape
  ctx.beginPath();
  
  // Build a map of module positions for quick lookup
  const moduleMap = new Set<string>();
  component.forEach(m => {
    moduleMap.add(`${m.row},${m.col}`);
  });
  
  // Draw each module with connections
  component.forEach(module => {
    const cx = (module.col + margin) * moduleSize + moduleSize / 2;
    const cy = (module.row + margin) * moduleSize + moduleSize / 2;
    
    // Check neighbors
    const neighbors = {
      top: moduleMap.has(`${module.row - 1},${module.col}`),
      topRight: moduleMap.has(`${module.row - 1},${module.col + 1}`),
      right: moduleMap.has(`${module.row},${module.col + 1}`),
      bottomRight: moduleMap.has(`${module.row + 1},${module.col + 1}`),
      bottom: moduleMap.has(`${module.row + 1},${module.col}`),
      bottomLeft: moduleMap.has(`${module.row + 1},${module.col - 1}`),
      left: moduleMap.has(`${module.row},${module.col - 1}`),
      topLeft: moduleMap.has(`${module.row - 1},${module.col - 1}`)
    };
    
    // Draw module shape based on neighbors
    drawModuleWithConnections(
      ctx,
      cx,
      cy,
      moduleSize,
      neighbors
    );
  });
  
  ctx.fill();
}

/**
 * Draw a single module with smooth connections to neighbors
 */
function drawModuleWithConnections(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  neighbors: {
    top: boolean;
    topRight: boolean;
    right: boolean;
    bottomRight: boolean;
    bottom: boolean;
    bottomLeft: boolean;
    left: boolean;
    topLeft: boolean;
  }
): void {
  const radius = size * 0.45;
  const offset = size * 0.5;
  
  // Draw main circle
  ctx.moveTo(cx + radius, cy);
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  
  // Draw connections to neighbors
  if (neighbors.top) {
    ctx.rect(cx - radius * 0.8, cy - offset, radius * 1.6, offset);
  }
  if (neighbors.right) {
    ctx.rect(cx, cy - radius * 0.8, offset, radius * 1.6);
  }
  if (neighbors.bottom) {
    ctx.rect(cx - radius * 0.8, cy, radius * 1.6, offset);
  }
  if (neighbors.left) {
    ctx.rect(cx - offset, cy - radius * 0.8, offset, radius * 1.6);
  }
  
  // Draw diagonal connections with curves
  if (neighbors.topRight && !neighbors.top && !neighbors.right) {
    ctx.moveTo(cx + radius * 0.7, cy - radius * 0.7);
    ctx.quadraticCurveTo(
      cx + offset,
      cy - offset,
      cx + offset + radius * 0.5,
      cy - offset + radius * 0.5
    );
  }
  if (neighbors.bottomRight && !neighbors.bottom && !neighbors.right) {
    ctx.moveTo(cx + radius * 0.7, cy + radius * 0.7);
    ctx.quadraticCurveTo(
      cx + offset,
      cy + offset,
      cx + offset + radius * 0.5,
      cy + offset - radius * 0.5
    );
  }
  if (neighbors.bottomLeft && !neighbors.bottom && !neighbors.left) {
    ctx.moveTo(cx - radius * 0.7, cy + radius * 0.7);
    ctx.quadraticCurveTo(
      cx - offset,
      cy + offset,
      cx - offset - radius * 0.5,
      cy + offset - radius * 0.5
    );
  }
  if (neighbors.topLeft && !neighbors.top && !neighbors.left) {
    ctx.moveTo(cx - radius * 0.7, cy - radius * 0.7);
    ctx.quadraticCurveTo(
      cx - offset,
      cy - offset,
      cx - offset - radius * 0.5,
      cy - offset + radius * 0.5
    );
  }
}

/**
 * Alternative implementation using image processing
 */
export function renderUltraSmoothImageProcessing(
  ctx: CanvasRenderingContext2D,
  modules: boolean[][],
  moduleSize: number,
  margin: number
): void {
  const moduleCount = modules.length;
  const canvas = ctx.canvas;
  
  // Create temporary canvas for processing
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  
  // Copy fill style
  tempCtx.fillStyle = ctx.fillStyle;
  
  // Draw all modules as circles with extra radius for overlap
  const baseRadius = moduleSize * 0.55;
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        const cx = (col + margin) * moduleSize + moduleSize / 2;
        const cy = (row + margin) * moduleSize + moduleSize / 2;
        
        // Draw gradient circles for smoother blending
        const gradient = tempCtx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
        gradient.addColorStop(0, tempCtx.fillStyle as string);
        gradient.addColorStop(1, tempCtx.fillStyle as string);
        
        tempCtx.fillStyle = gradient;
        tempCtx.beginPath();
        tempCtx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        tempCtx.fill();
      }
    }
  }
  
  // Apply blur effect
  tempCtx.filter = 'blur(2px)';
  tempCtx.drawImage(tempCanvas, 0, 0);
  tempCtx.filter = 'none';
  
  // Apply threshold to create clean edges
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  const threshold = 200; // Higher threshold for cleaner edges
  
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha > threshold) {
      data[i + 3] = 255;
    } else if (alpha > threshold * 0.5) {
      // Smooth transition
      data[i + 3] = Math.round((alpha - threshold * 0.5) / (threshold * 0.5) * 255);
    } else {
      data[i + 3] = 0;
    }
  }
  
  tempCtx.putImageData(imageData, 0, 0);
  
  // Draw result to main canvas
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}