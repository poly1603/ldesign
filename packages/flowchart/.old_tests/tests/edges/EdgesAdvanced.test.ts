/**
 * 边类型高级行为：Bezier 有效控制点与清除；Orthogonal 命中转折点
 */

import { describe, it, expect } from 'vitest';
import { BezierEdge } from '@/edges/BezierEdge.js';
import { OrthogonalEdge } from '@/edges/OrthogonalEdge.js';

function near(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

describe('BezierEdge 控制点有效性', () => {
  it('无自定义时返回最近一次计算的控制点；清除后恢复自动', () => {
    const edge = new BezierEdge({
      id: 'bz1', type: 'bezier' as any, source: 'A', target: 'B', style: {}, properties: {}
    } as any);

    // 首次计算，记录 lastControlPoints
    edge.calculatePath({ x: 0, y: 0 }, { x: 100, y: 0 });
    const eff1 = edge.getEffectiveControlPoints();
    expect(eff1).not.toBeNull();

    // 设置自定义控制点
    edge.setCustomControlPoints([{ x: 0, y: 50 }, { x: 100, y: 50 }]);
    let eff2 = edge.getEffectiveControlPoints();
    expect(eff2!.cp1.y).toBe(50);
    expect(eff2!.cp2.y).toBe(50);

    // 清除自定义控制点 -> 回到 lastControlPoints
    edge.clearCustomControlPoints();
    const eff3 = edge.getEffectiveControlPoints();
    expect(eff3).not.toBeNull();
    // y 不再是 50
    expect(near(eff3!.cp1.y, 50)).toBe(false);
    expect(near(eff3!.cp2.y, 50)).toBe(false);
  });
});

describe('OrthogonalEdge 命中转折点', () => {
  it('设置转折点后应能命中并返回正确的索引', () => {
    const edge = new OrthogonalEdge({
      id: 'og1', type: 'orthogonal' as any, source: 'A', target: 'B', style: {}, properties: {}
    } as any);
    edge.setWaypoints([{ x: 50, y: 0 }, { x: 50, y: 50 }]);
    edge.calculatePath({ x: 0, y: 0 }, { x: 100, y: 50 });

    // 命中第一个转折点（返回 0）
    const idx = edge.hitTestWaypoint({ x: 50, y: 0 }, 8);
    expect(idx).toBe(0);

    // 命中第二个转折点（返回 1）
    const idx2 = edge.hitTestWaypoint({ x: 50, y: 50 }, 8);
    expect(idx2).toBe(1);
  });
});

