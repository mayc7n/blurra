export type Dimensions = { width: number; height: number };
export type NormalizedPoint = { x: number; y: number };
export type CanvasPoint = { x: number; y: number };
export type ContainFrame = CanvasPoint & Dimensions & { scale: number };

export function getContainFrame(source: Dimensions, viewport: Dimensions): ContainFrame {
  const scale = Math.min(viewport.width / source.width, viewport.height / source.height);
  const width = source.width * scale;
  const height = source.height * scale;

  return {
    x: (viewport.width - width) / 2,
    y: (viewport.height - height) / 2,
    width,
    height,
    scale,
  };
}

export function sourceToCanvas(point: NormalizedPoint, frame: ContainFrame): CanvasPoint {
  return {
    x: frame.x + point.x * frame.width,
    y: frame.y + point.y * frame.height,
  };
}

export function canvasToSource(point: CanvasPoint, frame: ContainFrame): NormalizedPoint {
  return {
    x: (point.x - frame.x) / frame.width,
    y: (point.y - frame.y) / frame.height,
  };
}

export function clampNormalizedPoint(point: NormalizedPoint): NormalizedPoint {
  return {
    x: Math.max(0, Math.min(1, point.x)),
    y: Math.max(0, Math.min(1, point.y)),
  };
}
