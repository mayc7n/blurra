import { create } from "zustand";
import { createHistory } from "../domain/editor/history";
import { editorReducer, EditorAction, EditorHistory } from "../domain/editor/reducer";
import { BlurOperation, BlurShapeKind, emptyEditorSession } from "../domain/editor/types";

type PhotoSource = { uri: string; width: number; height: number };

export type EditorStore = {
  history: EditorHistory;
  startSession: (source: PhotoSource) => void;
  addOperation: (operation: BlurOperation) => void;
  removeOperation: (operationId: string) => void;
  updateOperation: (operationId: string, changes: Partial<Pick<BlurOperation, "shape" | "feather" | "intensity">>) => void;
  setActiveShapeKind: (shapeKind: BlurShapeKind) => void;
  selectOperation: (operationId: string | null) => void;
  dispatch: (action: EditorAction) => void;
  setIntensity: (intensity: number) => void;
  setBrushSize: (brushSize: number) => void;
  setFeather: (feather: number) => void;
  undo: () => void;
  redo: () => void;
  clearSession: () => void;
};

const initialHistory = () => createHistory(emptyEditorSession);

export const useEditorStore = create<EditorStore>((set) => {
  const dispatch = (action: EditorAction) => set((state) => ({ history: editorReducer(state.history, action) }));

  return {
    history: initialHistory(),
    startSession: (source) => dispatch({ type: "setSource", sourceUri: source.uri, sourceWidth: source.width, sourceHeight: source.height }),
    addOperation: (operation) => dispatch({ type: "addOperation", operation }),
    removeOperation: (operationId) => dispatch({ type: "removeOperation", operationId }),
    updateOperation: (operationId, changes) => dispatch({ type: "updateOperation", operationId, changes }),
    setActiveShapeKind: (shapeKind) => dispatch({ type: "setActiveShapeKind", shapeKind }),
    selectOperation: (operationId) => dispatch({ type: "selectOperation", operationId }),
    dispatch,
    setIntensity: (intensity) => dispatch({ type: "setIntensity", intensity }),
    setBrushSize: (brushSize) => dispatch({ type: "setBrushSize", brushSize }),
    setFeather: (feather) => dispatch({ type: "setFeather", feather }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    clearSession: () => set({ history: initialHistory() }),
  };
});
