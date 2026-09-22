import { clampNormalizedPoint } from "./coordinates";
import type { NormalizedPoint } from "./coordinates";
import type { BlurShape, BlurShapeKind } from "./types";

export const blurShapeKinds: BlurShapeKind[] = ["circle", "square", "rectangle", "triangle", "polygon", "lasso"];

function clampSize(size: number): number {
  return Math.max(0.04, Math.min(0.9, size));
}

export function createBlurShape(
  kind: BlurShapeKind,
  center: NormalizedPoint,
  size: number,
  points: NormalizedPoint[] = [],
): BlurShape | null {
  const boundedSize = clampSize(size);

  if ((kind === "polygon" || kind === "lasso") && points.length < 3) return null;

  switch (kind) {
    case "circle":
      return { kind, center, radius: boundedSize };
    case "square":
      return { kind, center, size: boundedSize };
    case "rectangle":
      return { kind, center, width: boundedSize * 1.5, height: boundedSize };
    case "triangle":
      return { kind, center, size: boundedSize };
    case "polygon":
    case "lasso":
      return { kind, points: points.map(clampNormalizedPoint) };
  }
}

export function getShapeSize(shape: BlurShape): number {
  switch (shape.kind) {
    case "circle":
      return shape.radius;
    case "square":
    case "triangle":
      return shape.size;
    case "rectangle":
      return shape.height;
    case "polygon":
    case "lasso":
      return 0.16;
  }
}

export function getShapePoints(shape: Exclude<BlurShape, { kind: "circle" }>): NormalizedPoint[] {
  switch (shape.kind) {
    case "square": {
      const half = shape.size / 2;
      return [
        { x: shape.center.x - half, y: shape.center.y - half },
        { x: shape.center.x + half, y: shape.center.y - half },
        { x: shape.center.x + half, y: shape.center.y + half },
        { x: shape.center.x - half, y: shape.center.y + half },
      ];
    }
    case "rectangle": {
      const halfWidth = shape.width / 2;
      const halfHeight = shape.height / 2;
      return [
        { x: shape.center.x - halfWidth, y: shape.center.y - halfHeight },
        { x: shape.center.x + halfWidth, y: shape.center.y - halfHeight },
        { x: shape.center.x + halfWidth, y: shape.center.y + halfHeight },
        { x: shape.center.x - halfWidth, y: shape.center.y + halfHeight },
      ];
    }
    case "triangle": {
      const radius = shape.size / 2;
      return [0, 1, 2].map((index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / 3;
        return {
          x: shape.center.x + Math.cos(angle) * radius,
          y: shape.center.y + Math.sin(angle) * radius,
        };
      });
    }
    case "polygon":
    case "lasso":
      return shape.points;
  }
}

export function resizeBlurShape(shape: BlurShape, size: number): BlurShape {
  const boundedSize = clampSize(size);

  switch (shape.kind) {
    case "circle":
      return { ...shape, radius: boundedSize };
    case "square":
      return { ...shape, size: boundedSize };
    case "rectangle":
      return { ...shape, width: boundedSize * 1.5, height: boundedSize };
    case "triangle":
      return { ...shape, size: boundedSize };
    case "polygon":
    case "lasso":
      return shape;
  }
}
