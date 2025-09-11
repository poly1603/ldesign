/**
 * 边类型行为单元测试：直线、贝塞尔、直角
 */

import { describe, it, expect } from 'vitest';
import { StraightEdge } from '@/edges/StraightEdge.js';
import { BezierEdge } from '@/edges/BezierEdge.js';
import { OrthogonalEdge } from '@/edges/OrthogonalEdge.js';

function approx(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

describe('StraightEdge 直线', () => {
  it('应正确计算路径、长度、边界与命中/最近点', () => {
    const edge = new StraightEdge({
      id: 'e1', type: 'straight' as any, source: 'A', target: 'B', style: {}, properties: {}
    } as any);

    const path = edge.calculatePath({ x: 0, y: 0 }, { x: 100, y: 0 });
    expect(path.points.length).toBe(2);
    expect(approx(path.length, 100)).toBe(true);
    expect(path.bounds).toEqual({ x: 0, y: 0, width: 100, height: 0 });

    const mid = edge.getPointAtPosition(0.5)!;
    expect(approx(mid.x, 50)).toBe(true);
    expect(approx(mid.y, 0)).toBe(true);

    const tan = edge.getTangentAtPosition(0.5);
    // 水平向右
    expect(approx(tan.x, 1)).toBe(true);
    expect(approx(tan.y, 0)).toBe(true);

    // 命中测试：靠近中点上方3px
    expect(edge.hitTest({ x: 50, y: 3 }, 5)).toBe(true);

    // 最近点：到(60,10)的投影应落在(60,0)
    const near = edge.getClosestPoint({ x: 60, y: 10 });
    expect(approx(near.x, 60)).toBe(true);
    expect(approx(near.y, 0)).toBe(true);
  });
});

describe('OrthogonalEdge 直角', () => {
  it('应在无自定义转折点时使用自动路径，并支持最近线段信息', () => {
    const edge = new OrthogonalEdge({
      id: 'e2', type: 'orthogonal' as any, source: 'A', target: 'B', style: {}, properties: {}
    } as any);

    const path = edge.calculatePath({ x: 0, y: 0 }, { x: 100, y: 50 });
    // 预期：[(0,0)->(50,0)->(50,50)->(100,50)]
    expect(path.points.length).toBeGreaterThanOrEqual(3);

    // 中段附近命中
    expect(edge.hitTest({ x: 50, y: 25 }, 6)).toBe(true);

    const info = edge.getClosestSegmentInfo({ x: 52, y: 25 }, 8)!;
    expect(info).not.toBeNull();
    // 近似到第二段（索引1）：(50,0)->(50,50)
    expect(info.segmentIndex).toBeGreaterThanOrEqual(1);
    expect(approx(info.nearest.x, 50)).toBe(true);
    expect(approx(info.nearest.y, 25)).toBe(true);

    // 设置自定义转折点后应按自定义路径
    edge.setWaypoints([{ x: 10, y: 0 }, { x: 10, y: 50 }]);
    const custom = edge.calculatePath({ x: 0, y: 0 }, { x: 100, y: 50 });
    // points: start, waypoints..., end => 至少 4 个
    expect(custom.points.length).toBeGreaterThanOrEqual(4);
  });

  it('提升 minSegmentLength 后应不产生中间拐点（仅首尾两点）', () => {
    const edge = new OrthogonalEdge({
      id: 'e2b', type: 'orthogonal' as any, source: 'A', target: 'B', style: {}, properties: {}
    } as any);
    edge.setMinSegmentLength(200);
    const path = edge.calculatePath({ x: 0, y: 0 }, { x: 100, y: 50 });
    expect(path.points.length).toBe(2);
  });
});

describe('BezierEdge 贝塞尔', () => {
  it('默认控制点应生成近似水平路径；自定义控制点可命中测试', () => {
    const edge = new BezierEdge({
      id: 'e3', type: 'bezier' as any, source: 'A', target: 'B', style: {}, properties: {}
    } as any);

    // 默认：start(0,0) -> end(200,0)
    const path = edge.calculatePath({ x: 0, y: 0 }, { x: 200, y: 0 });
    // 采用 50 段 => 51 个点
    expect(path.points.length).toBeGreaterThanOrEqual(50);

    const mid = edge.getPointAtPosition(0.5);
    expect(approx(mid.x, 100, 1)).toBe(true); // 允许 1px 近似
    expect(approx(mid.y, 0, 1)).toBe(true);

    // 设置自定义控制点，使曲线向上拱
    edge.setCustomControlPoints([{ x: 0, y: 100 }, { x: 200, y: 100 }]);
    const path2 = edge.calculatePath({ x: 0, y: 0 }, { x: 200, y: 0 });
    expect(path2.points.length).toBeGreaterThanOrEqual(50);

    // 命中测试控制点
    const idx1 = edge.hitTestControlPoint({ x: 0, y: 100 }, 8);
    const idx2 = edge.hitTestControlPoint({ x: 200, y: 100 }, 8);
    expect(idx1).toBe(0);
    expect(idx2).toBe(1);
  });

  it('不同的控制点偏移应产生不同的中点位置；切线应为单位向量', () => {
    const edge = new BezierEdge({
      id: 'e3b', type: 'bezier' as any, source: 'A', target: 'B', style: {}, properties: {}
    } as any);

    // 起终点不在同一水平线上，以体现 offset 的影响
    edge.setControlPointOffset(10);
    const p1 = edge.calculatePath({ x: 0, y: 0 }, { x: 200, y: 100 });
    const q1 = edge.getPointAtPosition(0.25); // 取 1/4 处，x 受 offset 影响

    edge.setControlPointOffset(200); // 将被 clamp 到距离一半
    const p2 = edge.calculatePath({ x: 0, y: 0 }, { x: 200, y: 100 });
    const q2 = edge.getPointAtPosition(0.25);

    // x 位置应不同（y 只与控制点 y 有关，这里相同，不作比较）
    expect(approx(q1.x, q2.x)).toBe(false);

    // 切线应为单位向量（或接近）
    const t = edge.getTangentAtPosition(0.5);
    const len = Math.hypot(t.x, t.y);
    expect(approx(len, 1, 1e-3)).toBe(true);
  });
});

