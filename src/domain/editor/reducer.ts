import { commit, History, redo, undo } from "./history";
import { BrushStroke, CircularBlur, EditorSession, EditorTool, emptyEditorSession } from "./types";

export type EditorAction =
  | { type: "addStroke"; stroke: BrushStroke }
  | { type: "setCircularBlur"; circularBlur: CircularBlur }
  | { type: "clearCircularBlur" }
  | { type: "setTool"; tool: EditorTool }
  | { type: "setIntensity"; intensity: number }
  | { type: "setBrushSize"; brushSize: number }
  | { type: "setFeather"; feather: number }
  | { type: "setSource"; sourceUri: string; sourceWidth: number; sourceHeight: number }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" }
  | { type: "toggleBeforeAfter" };

export type EditorHistory = History<EditorSession>;

function bounded(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function editorReducer(state: EditorHistory, action: EditorAction): EditorHistory {
  switch (action.type) {
    case "addStroke":
      return commit(state, { ...state.present, strokes: [...state.present.strokes, action.stroke] });
    case "setCircularBlur":
      return commit(state, { ...state.present, circularBlur: action.circularBlur });
    case "clearCircularBlur":
      return commit(state, { ...state.present, circularBlur: null });
    case "setTool":
      return commit(state, { ...state.present, tool: action.tool });
    case "setIntensity":
      return commit(state, { ...state.present, intensity: bounded(action.intensity) });
    case "setBrushSize":
      return commit(state, { ...state.present, brushSize: bounded(action.brushSize) });
    case "setFeather":
      return commit(state, { ...state.present, feather: bounded(action.feather) });
    case "setSource":
      return commit(state, {
        ...emptyEditorSession,
        sourceUri: action.sourceUri,
        sourceWidth: action.sourceWidth,
        sourceHeight: action.sourceHeight,
      });
    case "undo":
      return undo(state);
    case "redo":
      return redo(state);
    case "reset":
      return commit(state, emptyEditorSession);
    case "toggleBeforeAfter":
      return { ...state, present: { ...state.present, isBeforeAfter: !state.present.isBeforeAfter } };
    default:
      return state;
  }
}
