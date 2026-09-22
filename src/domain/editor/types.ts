import type { NormalizedPoint } from "./coordinates";

export type BlurShapeKind = "circle" | "square" | "rectangle" | "triangle" | "polygon" | "lasso";

export type BlurShape =
  | { kind: "circle"; center: NormalizedPoint; radius: number }
  | { kind: "square"; center: NormalizedPoint; size: number }
  | { kind: "rectangle"; center: NormalizedPoint; width: number; height: number }
  | { kind: "triangle"; center: NormalizedPoint; size: number }
  | { kind: "polygon"; points: NormalizedPoint[] }
  | { kind: "lasso"; points: NormalizedPoint[] };

export type BlurOperation = {
  id: string;
  blurType: "gaussian";
  shape: BlurShape;
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
  isBeforeAfter: false,
};
