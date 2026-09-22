import type { EditorHistory } from "../../domain/editor/reducer";

export function getEditorUiModel(history: EditorHistory) {
  return {
    hasPhoto: Boolean(history.present.sourceUri),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    beforeAfterLabel: history.present.isBeforeAfter ? "Ver edição" : "Ver original",
    toolbarLabels: ["Desfocar", "Pixelar", "Intensidade", "Tamanho do pincel"],
  } as const;
}
