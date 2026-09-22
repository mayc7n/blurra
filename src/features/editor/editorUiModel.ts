import type { EditorHistory } from "../../domain/editor/reducer";

export function getEditorUiModel(history: EditorHistory) {
  return {
    hasPhoto: Boolean(history.present.sourceUri),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    hasCircularBlur: history.present.circularBlur !== null,
    beforeAfterLabel: history.present.isBeforeAfter ? "Ver edição" : "Ver original",
    toolbarLabels: ["Intensidade", "Raio do blur", "Suavidade"],
  } as const;
}
