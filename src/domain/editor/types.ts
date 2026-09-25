import type { NormalizedPoint } from "./coordinates";

export type BlurShapeKind = "circle" | "square" | "rectangle" | "triangle" | "polygon" | "lasso";

export type BlurShape =
  | { kind: "circle"; center: NormalizedPoint; radius: number }
  | { kind: "square"; center: NormalizedPoint; size: number }
  | { kind: "rectangle"; center: NormalizedPoint; width: number; height: number }
  | { kind: "triangle"; center: NormalizedPoint; size: number }
  | { kind: "polygon"; points: NormalizedPoint[] }
  | { kind: "lasso"; points: NormalizedPoint[] };

export type BlurMask =
  | { kind: "shape"; shape: BlurShape; mode: "inside" | "outside" }
  | { kind: "segmentation"; uri: string; width: number; height: number; confidence: number; foregroundCoverage: number };

export type BlurOperation = {
  id: string;
  blurType: "gaussian";
  mask: BlurMask;
  feather: number;
  intensity: number;
};

export type EditorSession = {
  sourceUri: string | null;
  sourceWidth: number;
  sourceHeight: number;
  intensity: number;
  brushSize: number;
  feather: number;
  operations: BlurOperation[];
  selectedOperationId: string | null;
  activeShapeKind: BlurShapeKind;
  activeMaskMode: "inside" | "outside";
  isBeforeAfter: boolean;
};

export const emptyEditorSession: EditorSession = {
  sourceUri: null,
  sourceWidth: 0,
  sourceHeight: 0,
  intensity: 0.7,
  brushSize: 0.16,
  feather: 0.35,
  operations: [],
  selectedOperationId: null,
  activeShapeKind: "circle",
  activeMaskMode: "inside",
  isBeforeAfter: false,
};
