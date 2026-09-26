import type { EditorHistory } from "../../domain/editor/reducer";
import type { BlurMask } from "../../domain/editor/types";

export function getRemovalConfirmation(maskKind: BlurMask["kind"]) {
  return maskKind === "segmentation"
    ? {
      title: "Remover blur automático?",
      message: "O blur automático do fundo será removido da foto.",
      confirmLabel: "Remover",
    }
    : {
      title: "Remover marcação?",
      message: "A marcação selecionada será removida da foto.",
      confirmLabel: "Remover",
    };
}

export function getEditorUiModel(history: EditorHistory) {
  const selectedOperation = history.present.operations.find((operation) => operation.id === history.present.selectedOperationId);

  return {
    hasPhoto: Boolean(history.present.sourceUri),
    hasOperations: history.present.operations.length > 0,
    canRemoveSelectedOperation: selectedOperation?.mask.kind === "shape",
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    beforeAfterLabel: history.present.isBeforeAfter ? "Ver edição" : "Ver original",
    toolbarLabels: ["Intensidade", "Raio do blur", "Suavidade"],
  } as const;
}
