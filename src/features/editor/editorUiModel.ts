import type { EditorHistory } from "../../domain/editor/reducer";

export function getEditorUiModel(history: EditorHistory) {
  return {
    hasPhoto: Boolean(history.present.sourceUri),
    hasOperations: history.present.operations.length > 0,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    beforeAfterLabel: history.present.isBeforeAfter ? "Ver edição" : "Ver original",
    toolbarLabels: ["Intensidade", "Raio do blur", "Suavidade"],
  } as const;
}
