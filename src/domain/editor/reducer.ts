import { commit, History, redo, undo } from "./history";
import { BlurOperation, BlurShapeKind, EditorSession, emptyEditorSession } from "./types";

export type EditorAction =
  | { type: "addOperation"; operation: BlurOperation }
  | { type: "removeOperation"; operationId: string }
  | { type: "updateOperation"; operationId: string; changes: Partial<Pick<BlurOperation, "shape" | "feather" | "intensity">> }
  | { type: "setActiveShapeKind"; shapeKind: BlurShapeKind }
  | { type: "selectOperation"; operationId: string | null }
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
    case "addOperation":
      return commit(state, {
        ...state.present,
        operations: [...state.present.operations, action.operation],
        selectedOperationId: action.operation.id,
      });
    case "removeOperation": {
      const operations = state.present.operations.filter((operation) => operation.id !== action.operationId);
      return commit(state, {
        ...state.present,
        operations,
        selectedOperationId: state.present.selectedOperationId === action.operationId
          ? operations.length > 0 ? operations[operations.length - 1].id : null
          : state.present.selectedOperationId,
      });
    }
    case "updateOperation":
      return commit(state, {
        ...state.present,
        operations: state.present.operations.map((operation) =>
          operation.id === action.operationId ? { ...operation, ...action.changes } : operation,
        ),
      });
    case "setActiveShapeKind":
      return { ...state, present: { ...state.present, activeShapeKind: action.shapeKind } };
    case "selectOperation":
      return { ...state, present: { ...state.present, selectedOperationId: action.operationId } };
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
