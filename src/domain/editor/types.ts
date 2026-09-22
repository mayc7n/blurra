import type { NormalizedPoint } from "./coordinates";

export type EditorTool = "blur" | "pixelate";

export type BrushStroke = {
  id: string;
  points: NormalizedPoint[];
  size: number;
  feather: number;
  intensity: number;
};

export type CircularBlur = {
  center: NormalizedPoint;
  radius: number;
  feather: number;
  intensity: number;
};

export type EffectLayer = {
  id: string;
  tool: EditorTool;
  strokes: BrushStroke[];
  intensity: number;
};

export type EditorSession = {
  sourceUri: string | null;
  sourceWidth: number;
  sourceHeight: number;
  tool: EditorTool;
  intensity: number;
  brushSize: number;
  feather: number;
  strokes: BrushStroke[];
  circularBlur: CircularBlur | null;
  isBeforeAfter: boolean;
};

export const emptyEditorSession: EditorSession = {
  sourceUri: null,
  sourceWidth: 0,
  sourceHeight: 0,
  tool: "blur",
  intensity: 0.7,
  brushSize: 0.16,
  feather: 0.35,
  strokes: [],
  circularBlur: null,
  isBeforeAfter: false,
};
