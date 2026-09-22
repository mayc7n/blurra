import { create } from "zustand";
import { createHistory } from "../domain/editor/history";
import { editorReducer, EditorAction, EditorHistory } from "../domain/editor/reducer";
import { BrushStroke, EditorTool, emptyEditorSession } from "../domain/editor/types";

type PhotoSource = { uri: string; width: number; height: number };

export type EditorStore = {
  history: EditorHistory;
  startSession: (source: PhotoSource) => void;
  addStroke: (stroke: BrushStroke) => void;
  dispatch: (action: EditorAction) => void;
  setTool: (tool: EditorTool) => void;
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
    addStroke: (stroke) => dispatch({ type: "addStroke", stroke }),
    dispatch,
    setTool: (tool) => dispatch({ type: "setTool", tool }),
    setIntensity: (intensity) => dispatch({ type: "setIntensity", intensity }),
    setBrushSize: (brushSize) => dispatch({ type: "setBrushSize", brushSize }),
    setFeather: (feather) => dispatch({ type: "setFeather", feather }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    clearSession: () => set({ history: initialHistory() }),
  };
});
