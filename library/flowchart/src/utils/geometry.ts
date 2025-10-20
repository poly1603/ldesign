import { Position, Size } from '../types';

/**
 * 计算从节点中心到边缘的交点
 * @param nodeCenter 节点中心点
 * @param nodeSize 节点尺寸
 * @param targetPoint 目标点（用于确定方向）
 * @param nodeType 节点类型（用于不同形状）
 */
export function getNodeEdgePoint(
  nodeCenter: Position,
  nodeSize: Size,
  targetPoint: Position,
  nodeType?: string
): Position {
  const dx = targetPoint.x - nodeCenter.x;
  const dy = targetPoint.y - nodeCenter.y;
  
  if (dx === 0 && dy === 0) {
    return nodeCenter;
  }

  const angle = Math.atan2(dy, dx);
  const halfWidth = nodeSize.width / 2;
  const halfHeight = nodeSize.height / 2;

  // 判断是椭圆形还是矩形
  if (nodeType === 'start' || nodeType === 'end') {
    // 椭圆形节点
    return getEllipseEdgePoint(nodeCenter, halfWidth, halfHeight, angle);
  } else if (nodeType === 'condition') {
    // 菱形节点
    return getDiamondEdgePoint(nodeCenter, halfWidth, halfHeight, angle);
  } else {
    // 矩形节点
    return getRectEdgePoint(nodeCenter, halfWidth, halfHeight, angle);
  }
}

/**
 * 获取矩形边缘点
 */
function getRectEdgePoint(
  center: Position,
  halfWidth: number,
  halfHeight: number,
  angle: number
): Position {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  // 计算与矩形四条边的交点
  let x: number, y: number;
  
  if (Math.abs(cos) > Math.abs(sin)) {
    // 与左右边相交
    x = center.x + (cos > 0 ? halfWidth : -halfWidth);
    y = center.y + (x - center.x) * Math.tan(angle);
  } else {
    // 与上下边相交
    y = center.y + (sin > 0 ? halfHeight : -halfHeight);
    x = center.x + (y - center.y) / Math.tan(angle);
  }
  
  return { x, y };
}

/**
 * 获取椭圆边缘点
 */
function getEllipseEdgePoint(
  center: Position,
  rx: number,
  ry: number,
  angle: number
): Position {
  const x = center.x + rx * Math.cos(angle);
  const y = center.y + ry * Math.sin(angle);
  return { x, y };
}

/**
 * 获取菱形边缘点
 */
function getDiamondEdgePoint(
  center: Position,
  halfWidth: number,
  halfHeight: number,
  angle: number
): Position {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  // 菱形的四个顶点
  const top = { x: center.x, y: center.y - halfHeight };
  const right = { x: center.x + halfWidth, y: center.y };
  const bottom = { x: center.x, y: center.y + halfHeight };
  const left = { x: center.x - halfWidth, y: center.y };
  
  // 根据角度判断在哪条边上
  if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
    // 右边
    return lineIntersection(center, { x: center.x + 1000, y: center.y + 1000 * sin / cos }, top, right);
  } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
    // 下边
    return lineIntersection(center, { x: center.x + 1000 * cos / sin, y: center.y + 1000 }, right, bottom);
  } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
    // 上边
    return lineIntersection(center, { x: center.x - 1000 * cos / sin, y: center.y - 1000 }, left, top);
  } else {
    // 左边
    return lineIntersection(center, { x: center.x - 1000, y: center.y - 1000 * sin / cos }, bottom, left);
  }
}

/**
 * 计算两条线段的交点
 */
function lineIntersection(p1: Position, p2: Position, p3: Position, p4: Position): Position {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denom) < 0.001) {
    return p1;
  }
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  
  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1)
  };
}










